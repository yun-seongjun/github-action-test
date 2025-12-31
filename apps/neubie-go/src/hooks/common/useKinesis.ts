import { useEffect, useRef, useState } from 'react';
import process from 'process';
import { Role, SignalingClient } from 'amazon-kinesis-video-streams-webrtc';
import AWS from 'aws-sdk';
import { payloadTypesToExcludeH265, removeCodecs } from '@/utils/sdpUtils';
import { Nullable } from '@design-system/types';
import useEventListener from '@design-system/hooks/useEventListener';

export const KinesisConfig = {
  accessKeyId: process.env.ACCESS_KEY_ID,
  region: 'ap-northeast-2',
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  channelName: '',
  clientId: null,
  endpoint: null,
  forceTURN: false,
  fullscreen: false,
  natTraversalDisabled: false,
  openDataChannel: true,
  sessionToken: undefined,
  useTrickleICE: true,
  widescreen: true,
};

export type ViewerType = {
  connected: boolean;
  dataChannel: RTCDataChannel | null;
  signalingClient: SignalingClient | null;
  peerConnection: RTCPeerConnection | null;
  audioTrack: MediaStreamTrack | null;
  gainNode?: GainNode | null;
};

interface KinesisInitialState {
  isOfferVideo: boolean;
  isOfferAudio: boolean;
}

interface UseKinesisProps {
  initialState?: KinesisInitialState;
}

enum DataChannelStatus {
  NONE = 'NONE',
  OPEN = 'OPEN',
  CLOSING = 'CLOSING',
  CLOSE = 'CLOSE',
}

const useKinesis = ({ initialState }: UseKinesisProps = {}) => {
  const { isOfferVideo, isOfferAudio } = initialState || {
    isOfferVideo: true,
    isOfferAudio: true,
  };
  const [dataChannelState, setDataChannelState] = useState<DataChannelStatus>(
    DataChannelStatus.NONE,
  );

  const viewerRef = useRef<ViewerType>({
    connected: false,
    dataChannel: null,
    signalingClient: null,
    peerConnection: null,
    audioTrack: null,
  });
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioLiveRef = useRef<Nullable<HTMLAudioElement>>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [connectionState, setConnectionState] =
    useState<RTCIceConnectionState>();

  const messageCallbackMapRef = useRef<
    Map<string, (data: MessageEvent) => void>
  >(new Map());
  const kinesisConnectEventListener = useEventListener();

  const addKinesisConnectEventListener = (fn: () => void) => {
    kinesisConnectEventListener.addEventListener(fn);
  };

  const addMessageListener = (
    key: string,
    fn: (data: MessageEvent) => void,
  ) => {
    messageCallbackMapRef.current.set(key, fn);
  };
  const deleteMessageListener = (key: string) => {
    messageCallbackMapRef.current.delete(key);
  };

  const connectKinesis = async (channelName: string) => {
    if (!KinesisConfig.accessKeyId || !KinesisConfig.secretAccessKey) {
      console.log('[ERR] AWS credentials are not configured');
      return;
    }
    // client 객체 생성
    const kinesisVideoClient = new AWS.KinesisVideo({
      region: KinesisConfig.region,
      accessKeyId: KinesisConfig.accessKeyId,
      secretAccessKey: KinesisConfig.secretAccessKey,
      correctClockSkew: true,
      retryDelayOptions: {
        base: 100,
        customBackoff: (retryCount, err) => {
          return retryCount * 100;
        },
      },
    });

    // 기존 aws 생성된 신호전송채널 찾기
    const describeSignalingChannelResponse = await kinesisVideoClient
      .describeSignalingChannel({
        ChannelName: channelName,
      })
      .promise();
    const channelARN =
      describeSignalingChannelResponse?.ChannelInfo?.ChannelARN;
    if (!channelARN) {
      console.log('[ERR] Channel ARN: ', channelARN);
      return;
    }
    console.log('[VIEWER] Channel ARN: ', channelARN);

    // 전송 채널의 엔드포인트 확인
    const getSignalingChannelEndpointResponse = await kinesisVideoClient
      .getSignalingChannelEndpoint({
        ChannelARN: channelARN,
        SingleMasterChannelEndpointConfiguration: {
          Protocols: ['WSS', 'HTTPS'],
          Role: Role.VIEWER,
        },
      })
      .promise();
    const endpointsByProtocol =
      getSignalingChannelEndpointResponse?.ResourceEndpointList?.reduce(
        (endpoints: any, endpoint: any) => {
          endpoints[endpoint.Protocol] = endpoint.ResourceEndpoint;
          return endpoints;
        },
        {},
      );
    console.log('[VIEWER] Endpoints: ', endpointsByProtocol);

    // ICE server 설정 가져옴
    const kinesisVideoSignalingChannelsClient =
      new AWS.KinesisVideoSignalingChannels({
        region: KinesisConfig.region,
        accessKeyId: KinesisConfig.accessKeyId,
        secretAccessKey: KinesisConfig.secretAccessKey,
        sessionToken: KinesisConfig.sessionToken,
        endpoint: endpointsByProtocol.HTTPS,
        correctClockSkew: true,
      });
    const getIceServerConfigResponse = await kinesisVideoSignalingChannelsClient
      .getIceServerConfig({
        ChannelARN: channelARN,
      })
      .promise();
    const iceServers = [];
    if (!KinesisConfig.natTraversalDisabled && !KinesisConfig.forceTURN) {
      iceServers.push({
        urls: `stun:stun.kinesisvideo.${KinesisConfig.region}.amazonaws.com:443`,
      });
    }
    if (!KinesisConfig.natTraversalDisabled) {
      getIceServerConfigResponse?.IceServerList?.forEach((iceServer: any) =>
        iceServers.push({
          urls: iceServer.Uris,
          username: iceServer.Username,
          credential: iceServer.Password,
        }),
      );
    }
    console.log('[VIEWER] ICE servers: ', iceServers);

    // signalingClient 생성, 해당 객체로 aws kinesis 서버를 통한 master와의 통신
    viewerRef.current.signalingClient = new SignalingClient({
      channelARN,
      channelEndpoint: endpointsByProtocol.WSS,
      // Todo: 좀 더 유니크 한 clientId 를 부여할 방법을 찾아봐야 합니다.
      clientId: Math.random().toString(36).substring(2, 12),
      role: Role.VIEWER,
      region: KinesisConfig.region,
      credentials: {
        accessKeyId: KinesisConfig.accessKeyId,
        secretAccessKey: KinesisConfig.secretAccessKey,
        sessionToken: KinesisConfig.sessionToken,
      },
      systemClockOffset: kinesisVideoClient.config.systemClockOffset,
    });

    // 커넥션을 위한 설정 세팅
    const configuration = {
      iceServers,
      iceTransportPolicy: KinesisConfig.forceTURN ? 'relay' : 'all',
    };

    // peer 커넥션 생성
    viewerRef.current.peerConnection = new RTCPeerConnection(
      configuration as RTCConfiguration,
    );
    if (KinesisConfig.openDataChannel) {
      viewerRef.current.dataChannel =
        viewerRef.current.peerConnection?.createDataChannel('kvsDataChannel') ??
        null;
      if (viewerRef.current.dataChannel) {
        viewerRef.current.dataChannel.addEventListener('open', () => {
          setDataChannelState(DataChannelStatus.OPEN);
        });
        viewerRef.current.dataChannel.addEventListener('closing', () => {
          setDataChannelState(DataChannelStatus.CLOSING);
        });
        viewerRef.current.dataChannel.addEventListener('close', () => {
          setDataChannelState(DataChannelStatus.CLOSE);
        });
        viewerRef.current.dataChannel.addEventListener('message', (event) => {
          messageCallbackMapRef.current.forEach((fn) => {
            fn(event);
          });
        });
      }
    }

    // Poll for connection stats
    viewerRef.current.signalingClient?.on('open', async () => {
      console.log('[VIEWER] Connected to signaling service');

      // Create an SDP offer to send to the master
      // 오디오와 비디오 데이터 전송 가능 여부 설정
      console.log('[VIEWER] Creating SDP offer');
      await viewerRef.current.peerConnection?.setLocalDescription(
        await viewerRef.current?.peerConnection?.createOffer({
          offerToReceiveAudio: isOfferAudio,
          offerToReceiveVideo: isOfferVideo,
        }),
      );

      // When trickle ICE is enabled, send the offer now and then send ICE candidates as they are generated.
      // Otherwise, wait on the ICE candidates.
      if (KinesisConfig.useTrickleICE) {
        console.log('[VIEWER] Sending SDP offer');
        if (viewerRef.current.peerConnection?.localDescription) {
          const offerToSend = removeCodecs(
            viewerRef.current.peerConnection.localDescription,
            payloadTypesToExcludeH265,
          );
          viewerRef.current.signalingClient?.sendSdpOffer(offerToSend);
        }
      }
      console.log('[VIEWER] Generating ICE candidates');
    });

    viewerRef.current.signalingClient?.on(
      'sdpAnswer',
      async (answer: RTCSessionDescriptionInit) => {
        // Add the SDP answer to the peer connection
        console.log('[VIEWER] Received SDP answer');
        await viewerRef.current.peerConnection?.setRemoteDescription(answer);
      },
    );

    viewerRef.current.signalingClient?.on(
      'iceCandidate',
      (candidate: RTCIceCandidateInit | undefined) => {
        // Add the ICE candidate received from the MASTER to the peer connection
        viewerRef.current.peerConnection?.addIceCandidate(candidate);
      },
    );

    viewerRef.current.signalingClient?.on('close', () => {
      console.log('[VIEWER] Disconnected from signaling channel');
    });

    viewerRef.current.signalingClient?.on('error', (error) => {
      console.log('ERR:: [VIEWER] Signaling client error: ', error);
    });

    // Send any ICE candidates to the other peer
    viewerRef.current.peerConnection?.addEventListener(
      'icecandidate',
      ({ candidate }) => {
        if (candidate) {
          // When trickle ICE is enabled, send the ICE candidates as they are generated.
          if (KinesisConfig.useTrickleICE) {
            viewerRef.current.signalingClient?.sendIceCandidate(candidate);
          }
        } else {
          console.log('[VIEWER] All ICE candidates have been generated');

          // When trickle ICE is disabled, send the offer now that all the ICE candidates have been generated.
          if (!KinesisConfig.useTrickleICE) {
            console.log('[VIEWER] Sending SDP offer');
            if (viewerRef.current.peerConnection?.localDescription) {
              viewerRef.current.signalingClient?.sendSdpOffer(
                viewerRef.current.peerConnection?.localDescription,
              );
            }
          }
        }
      },
    );

    // As remote tracks are received, add them to the remote view
    viewerRef.current.peerConnection?.addEventListener('track', (event) => {
      console.log('[VIEWER] Received remote track');
      streamRef.current = event.streams[0];
      if (videoRef.current) {
        videoRef.current.srcObject = event.streams[0];
      }
      if (audioLiveRef.current) {
        audioLiveRef.current.srcObject = event.streams[0];
      }
    });

    viewerRef.current.peerConnection.addEventListener(
      'iceconnectionstatechange',
      () => {
        if (
          viewerRef.current.peerConnection?.iceConnectionState === 'connected'
        ) {
          viewerRef.current.connected = true;
          kinesisConnectEventListener.invokeEventListeners();
          console.log('[VIEWER] Kinesis Connected!!');
        } else {
          viewerRef.current.connected = false;
        }
        setConnectionState(
          viewerRef.current.peerConnection?.iceConnectionState ?? 'closed',
        );
      },
    );
    console.log('[VIEWER] Starting viewer connection');

    // audio 설정
    if (isOfferAudio) {
      try {
        const defaultVolume = 1;
        const media = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: false,
          },
        });

        const audioContext = new AudioContext();
        const streamSource = audioContext.createMediaStreamSource(media);

        const gainNode = audioContext.createGain();
        gainNode.gain.value = defaultVolume;

        const streamDestination = audioContext.createMediaStreamDestination();
        streamSource.connect(gainNode).connect(streamDestination);

        const track = streamDestination.stream.getAudioTracks()[0];
        track.enabled = false;

        viewerRef.current.audioTrack = track;
        viewerRef.current.gainNode = gainNode;
        viewerRef.current.peerConnection?.addTrack(track);
      } catch (e) {
        console.error(JSON.stringify(e));
      }
    }

    viewerRef.current.signalingClient?.open();
    console.log('signalingClient.open');
    return true;
  };

  const disconnectKinesis = async () => {
    viewerRef.current.connected = false;
    setConnectionState('disconnected');

    await viewerRef.current.dataChannel?.close();
    viewerRef.current.dataChannel = null;

    await viewerRef.current.signalingClient?.close();
    viewerRef.current.signalingClient = null;

    await viewerRef.current.audioTrack?.stop();
    viewerRef.current.audioTrack = null;

    await viewerRef.current.peerConnection?.close();
    viewerRef.current.peerConnection = null;

    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject = null;
    }
    if (audioLiveRef.current?.srcObject) {
      audioLiveRef.current.srcObject = null;
    }
    streamRef.current = null;
  };

  useEffect(() => {
    return () => {
      disconnectKinesis();
    };
  }, []);

  return {
    connectionState,
    isConnected: connectionState === 'connected',
    isDataChannelOpened: dataChannelState == DataChannelStatus.OPEN,
    isKinesisDisconnected:
      connectionState &&
      connectionState !== 'connected' &&
      connectionState !== 'checking',
    connectKinesis,
    disconnectKinesis,
    videoRef,
    viewerRef,
    audioLiveRef,
    addMessageListener,
    deleteMessageListener,
    streamRef,
    addKinesisConnectEventListener,
  };
};

export default useKinesis;
