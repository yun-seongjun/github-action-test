export const payloadTypesToExcludeH265 = ['49', '51'];

/**
 * removeCodecs
 *
 * 주어진 RTCSessionDescription의 SDP 문자열에서 특정 페이로드 타입(코덱 번호)에
 * 해당하는 미디어 라인(m=audio|video)·rtpmap·fmtp·rtcp-fb 라인을 제거하고,
 * 필터링된 SDP로 새 RTCSessionDescription 객체를 반환합니다.
 *
 * @param session  원본 RTCSessionDescription 객체 (type, sdp 프로퍼티 필요)
 * @param payloadTypesToExclude  제거할 페이로드 타입 번호들의 배열 (예: ['96','97'])
 * @returns 필터링된 SDP를 포함하는 새로운 RTCSessionDescription 객체
 *
 * @example
 * const originalDesc = new RTCSessionDescription({ type: 'offer', sdp: 'v=0\r\n…' });
 * const filteredDesc = removeCodecs(originalDesc, ['96', '98']);
 * // filteredDesc.sdp 내에 payload 96, 98 관련 라인들이 모두 제거됨
 */
export const removeCodecs = (
  { type, sdp }: RTCSessionDescription,
  payloadTypesToExclude: string[],
): RTCSessionDescription => {
  const excludeSet = new Set(payloadTypesToExclude);

  type Acc = {
    inAudio: boolean;
    inVideo: boolean;
    lines: string[];
  };

  const { lines } = sdp.split('\r\n').reduce<Acc>(
    (acc, line) => {
      const isAudio = line.startsWith('m=audio');
      const isVideo = line.startsWith('m=video');

      if (isAudio || isVideo) {
        const [m, port, proto, ...payloads] = line.split(' ');
        const kept = payloads.filter((pt) => !excludeSet.has(pt));
        return {
          inAudio: isAudio,
          inVideo: isVideo,
          lines: [...acc.lines, [m, port, proto, ...kept].join(' ')],
        };
      }

      if (line.startsWith('m=')) {
        return { inAudio: false, inVideo: false, lines: [...acc.lines, line] };
      }

      if ((acc.inAudio || acc.inVideo) && line.startsWith('a=')) {
        const match = line.match(/^a=(rtpmap|fmtp|rtcp-fb):(\d+)/);
        if (match && excludeSet.has(match[2])) {
          return acc;
        }
      }

      return { ...acc, lines: [...acc.lines, line] };
    },
    { inAudio: false, inVideo: false, lines: [] },
  );

  return new RTCSessionDescription({
    type,
    sdp: lines.join('\r\n'),
  });
};
