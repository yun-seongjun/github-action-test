/**
 *
 * 툴박스를 띄울 때
 * LayerMode:
 * ActivationManager: 아래 조건들을 가지고 각 도구들이 현재 활성화 되는지 확인
 * - 현재 활성화 된 분절노드
 * - 현재 활성화 된 끝 점노드
 * - 현재 활성화 된 분절 노드 이면서 끝점인 노드
 * - 현재 활성화 된 선들 (활성화된 길 중에서 갖고 오면 됨)
 * - 선, 길, 점등이 비활성화 되어야 합니다.
 *
 * 위치를 지정하는 기능:
 * - 현재 활성화된 선들의 점과 활성화된 점들을 토대로 도구의 위치를 결정
 * - 렌더링 박스의 너비, 높이를 계산해서 일정 영역 밖으로 도구가 나가지 않도록
 *
 * 툴박스의 버튼 별로 이벤트를 붙이는 기능 - 렌더링이 된다음에 100ms 정도 지나서 붙이도록
 *
 * - Layer에서 도구버튼을 눌렀을때 발생할 이벤틀 리스너를 붙힐 addListener를 제공해주고 GeoMap에서 해당 함수로 리스너를 등록 하도록
 * - 편집 mode 변경 (길추가, 편집모드로 변경) - 활성화된 선, 길, 점들이 기존 활성화 유지 이벤트를 붙이기

 * - LayerOfficer 도구버튼을 눌렀을때 발생할 이벤틀 리스너를 붙힐 addListener를 툴박스가 제공해주고 LayerOffiicer에서 붙힌다.
 * - 길 분할:
 * - 삭제: 길 분할, 비활성화, 길 활성화, 점 삭제
 * - 닫기: 활성화된 선, 길, 점들이 비활성화
 *
 * 툴박스가 띄워진 상태 일때
 * 위치를 수정하는 기능:
 * - 위치를 지정하는 기능을 토대로 setPosition을 통해서 위치를 수정해야함
 *
 * 툴박스를 닫는 기능:
 * - 활성화된 선, 길, 점들이 비활성화 되는 경우가 있고 아닌 경우가 있음
 *
 * 테스트 환경은 어디 ?
 * -
 *
 */
import { MAP_INSET_BOUNDS_PADDING } from '@design-system/constants/geo-map';
import GeoFeatureActivationManager from '@design-system/geo-map/activation/GeoFeatureActivationManager';
import EventListenerManager, {
  GeoMapElementEventNameEnum,
} from '@design-system/geo-map/event/EventListenerManager';
import EventPreventer, {
  EventPreventerInfo,
} from '@design-system/geo-map/event/EventPreventer';
import GeoMapEventManager from '@design-system/geo-map/event/GeoMapEventManager';
import GeoFeatureManager, {
  GeoNodeTypeEnum,
} from '@design-system/geo-map/feature/GeoFeatureManager';
import GeoNode from '@design-system/geo-map/feature/GeoNode';
import GeoWay from '@design-system/geo-map/feature/GeoWay';
import GeoLineSegment from '@design-system/geo-map/line-segment/GeoLineSegment';
import { RectType } from '@design-system/types/component.type';
import { GeoLatLngType, MarkerEnum } from '@design-system/types/geoMap.type';
import DataUtils from '@design-system/utils/dataUtils';
import EnvUtils from '@design-system/utils/envUtils';
import StructSetUtils from '@design-system/utils/structSetUtils';
import { GeoMapUtils } from '@design-system/utils/geo-map/GeoMapUtils';
import IdGenerator from '@design-system/utils/geo-map/IdGenerator';
import NodeContentsFuncFactory, {
  EDIT_TOOL_BOX_ID,
  EditToolMenuEnum,
} from '@design-system/components/geo-map/NodeContentsFuncFactory';

const KEY = 'GeoToolManager';

export interface GeoToolBoxPolicy {
  isToolBoxEnabled: boolean;
  isToolBoxShowingOnDragging: boolean;
  isDivideWaysButtonEnabled: boolean;
  isAppendModeButtonEnabled: boolean;
  isEditModeButtonEnabled: boolean;
  isTagEditModeButtonEnabled: boolean;
  isDeleteButtonEnabled: boolean;
  isCopyButtonEnabled: boolean;
  isCloseButtonEnabled: boolean;
  /**
   * 펜슬로만 조작 가능 여부
   */
  isPencilOnlyEnabled: boolean;
}

class GeoToolBoxManager {
  static GEO_TOOL_MANAGER_INIT_POLICY: GeoToolBoxPolicy = {
    isToolBoxEnabled: false,
    isToolBoxShowingOnDragging: false,
    isDivideWaysButtonEnabled: false,
    isAppendModeButtonEnabled: false,
    isEditModeButtonEnabled: false,
    isTagEditModeButtonEnabled: false,
    isDeleteButtonEnabled: false,
    isCopyButtonEnabled: false,
    isCloseButtonEnabled: false,
    isPencilOnlyEnabled: false,
  };

  /**
   * =========================================================================================================
   * 생성자
   * =========================================================================================================
   */
  private _zoomLevel: number;
  private _bounds?: google.maps.LatLngBounds;
  private _projection?: google.maps.Projection;

  private _buttonEventPreventer: EventPreventer<EditToolMenuEnum>;

  private readonly _featureManager: GeoFeatureManager;
  private readonly _featureActivationManager: GeoFeatureActivationManager;
  private readonly _geoMapEventManager: GeoMapEventManager;
  private _idGenerator: IdGenerator;
  private _tool?: GeoNode;
  private readonly _googleMap: google.maps.Map;
  private _nodesActivated: GeoNode[] = [];
  private _waysActivated: GeoWay[] = [];
  private _lineSegmentsActivated: GeoLineSegment[] = [];

  private _isToolBoxEnabled = false;
  private _isToolBoxShowingOnDragging = false;
  private _isDivideWaysButtonEnabled = false;
  private _isAppendModeButtonEnabled = false;
  private _isCombineWaysButtonEnabled = false;
  private _isEditModeButtonEnabled = false;
  private _isTagEditModeButtonEnabled = false;
  private _isDeleteButtonEnabled = false;
  private _isCopyButtonEnabled = false;
  private _isCloseButtonEnabled = false;
  private _isPencilOnlyEnabled = false;

  constructor({
    zoomLevel,
    bounds,
    projection,
    googleMap,
    featureManager,
    featureActivationManager,
    geoMapEventManager,
    policy = GeoToolBoxManager.GEO_TOOL_MANAGER_INIT_POLICY,
  }: {
    zoomLevel?: number;
    bounds?: google.maps.LatLngBounds;
    projection?: google.maps.Projection;
    googleMap: google.maps.Map;
    featureManager: GeoFeatureManager;
    featureActivationManager: GeoFeatureActivationManager;
    geoMapEventManager: GeoMapEventManager;
    policy?: GeoToolBoxPolicy;
  }) {
    this._zoomLevel = zoomLevel || 16;
    this._bounds = bounds;
    this._projection = projection;
    this._featureManager = featureManager;
    this._featureActivationManager = featureActivationManager;
    this._geoMapEventManager = geoMapEventManager;
    this._googleMap = googleMap;

    this._buttonEventPreventer = new EventPreventer<EditToolMenuEnum>(
      Object.values(EditToolMenuEnum).reduce(
        (acc, key) => {
          acc[key as EditToolMenuEnum] = {
            preventNextEvent: false,
            eventPreventTimeMs: 500,
            eventAtMs: 0,
          };
          return acc;
        },
        {} as Record<EditToolMenuEnum, EventPreventerInfo>,
      ),
    );

    this.addCloseButtonClickEventListener(KEY, () => this._closeToolBox());
    this.addCopyButtonClickEventListener(KEY, () => this._closeToolBox());

    this._idGenerator = new IdGenerator();
    this._geoMapEventManager.addBoundsChangedStickyEventListener(
      async (eventBounds) => {
        this._bounds = eventBounds;
        if (!this._tool) {
          return;
        }
        const toolBoxMoveableRect = this.getToolBoxMoveableRect();
        const toolScreenPosition = GeoMapUtils.latLngToPoint(
          this._tool.getPosition(),
          this._googleMap,
        );
        if (!toolBoxMoveableRect || !toolScreenPosition) {
          return;
        }
        if (this._toolPointUserMoved) {
          const toolCenterScreenPositionNew = {
            x: Math.min(
              Math.max(this._toolPointUserMoved.x, toolBoxMoveableRect.left),
              toolBoxMoveableRect.right,
            ),
            y: Math.min(
              Math.max(this._toolPointUserMoved.y, toolBoxMoveableRect.top),
              toolBoxMoveableRect.bottom,
            ),
          };
          const toolLatLngNew = GeoMapUtils.pointToLatLng(
            toolCenterScreenPositionNew,
            this._googleMap,
          );
          if (toolLatLngNew) {
            this._tool.setPosition(GeoMapUtils.toLatLng(toolLatLngNew));
          }
        } else {
          const toolMenus = this._getToolMenus(
            this._nodesActivated,
            this._lineSegmentsActivated,
          );
          const positionNew = await this._calculateToolBoxRenderPosition(
            this._nodesActivated,
            this._lineSegmentsActivated,
            toolMenus,
          );
          if (
            !positionNew ||
            GeoMapUtils.isLatLngEquals(this._tool.getPosition(), positionNew)
          ) {
            return;
          }
          this._updateToolBoxPosition(positionNew);
        }
      },
    );
    this._geoMapEventManager.addProjectionChangedEventListener(
      (eventProjection) => (this._projection = eventProjection),
    );
    this._geoMapEventManager.addZoomChangedStickyEventListener(
      (event, zoomLevel, zoomLevelOld) => (this._zoomLevel = zoomLevel),
    );
    // activated event 설정
    this._featureActivationManager.addActivatedChangeEventListener(
      KEY + 1,
      (nodes, ways, lineSegments) => {
        this._nodesActivated = nodes;
        this._waysActivated = ways;
        this._lineSegmentsActivated = lineSegments;
      },
    );
    this._featureActivationManager.addActivatedChangeEventListener(
      KEY,
      async (nodes, ways, lineSegments) => {
        try {
          const toolMenus = this._getToolMenus(nodes, lineSegments);
          const positionNew = await this._calculateToolBoxRenderPosition(
            nodes,
            lineSegments,
            toolMenus,
          );
          if (!positionNew) {
            throw new Error('_calculateToolBoxRenderPosition 값이 없습니다.');
          }
          this._openToolBox(toolMenus, positionNew);
        } catch (error) {
          console.log(
            'ERR:: GeoToolBoxManager:: addActivatedChangeEventListener::',
            error,
          );
        }
      },
    );
    this._featureActivationManager.addActivatedDragStartEventListener(
      KEY,
      () => {
        if (
          this._isToolBoxEnabled &&
          !this._isToolBoxShowingOnDragging &&
          this.isToolBoxOpen()
        ) {
          this._closeToolBox();
        }
      },
    );
    this._featureActivationManager.addActivatedDragEventListener(
      KEY,
      async (nodes, ways, lineSegments) => {
        try {
          if (!this._isToolBoxShowingOnDragging) {
            if (this.isToolBoxOpen()) {
              this._closeToolBox();
            }
            return;
          }
          const toolMenus = this._getToolMenus(nodes, lineSegments);
          const positionNew = await this._calculateToolBoxRenderPosition(
            nodes,
            lineSegments,
            toolMenus,
          );
          if (!positionNew) {
            return;
          }
          this._updateToolBoxPosition(positionNew);
        } catch (error) {
          console.log(
            'ERR:: GeoToolBoxManager:: addActivatedDragEventListener::',
            error,
          );
        }
      },
    );
    this._featureActivationManager.addActivatedDragEndEventListener(
      KEY,
      async (nodes, ways, lineSegments) => {
        const toolMenus = this._getToolMenus(nodes, lineSegments);
        const positionNew = await this._calculateToolBoxRenderPosition(
          nodes,
          lineSegments,
          toolMenus,
        );
        if (!positionNew) {
          const message = '_calculateToolBoxRenderPosition 값이 없습니다.';
          if (GeoMapUtils.IS_DEBUG) {
            throw new Error(message);
          } else {
            console.error(message);
          }
          return;
        }

        if (this._isToolBoxShowingOnDragging) {
          this._updateToolBoxPosition(positionNew);
        } else {
          this._openToolBox(toolMenus, positionNew);
        }
      },
    );

    this.setPolicy(policy);
  }

  /**
   * =========================================================================================================
   * Policy
   * =========================================================================================================
   */

  setToolBoxEnabled = (isToolBoxEnabled: boolean, isRefresh = true) => {
    this._isToolBoxEnabled = isToolBoxEnabled;
    if (this._isToolBoxEnabled && isRefresh) {
      this._calcAndOpenToolBox();
    }
  };
  isToolBoxEnabled = () => this._isToolBoxEnabled;
  setDivideWaysButtonEnabled = (
    isDivideWaysButtonEnabled: boolean,
    isRefresh = true,
  ) => {
    this._isDivideWaysButtonEnabled = isDivideWaysButtonEnabled;
    if (this._isToolBoxEnabled && isRefresh) {
      this._calcAndOpenToolBox();
    }
  };
  getDivideWaysButtonEnabled = () => this._isDivideWaysButtonEnabled;
  setToolBoxShowingOnDragging = (isToolBoxShowingOnDragging: boolean) => {
    this._isToolBoxShowingOnDragging = isToolBoxShowingOnDragging;
  };
  getToolBoxShowingOnDragging = () => this._isToolBoxShowingOnDragging;
  setAppendModeButtonEnabled = (
    isAppendModeButtonEnabled: boolean,
    isRefresh = true,
  ) => {
    this._isAppendModeButtonEnabled = isAppendModeButtonEnabled;
    if (this._isToolBoxEnabled && isRefresh) {
      this._calcAndOpenToolBox();
    }
  };
  getAppendButtonEnabled = () => this._isAppendModeButtonEnabled;
  setCombineWaysButtonEnabled = (
    isCombineWaysButtonEnabled: boolean,
    isRefresh = true,
  ) => {
    this._isCombineWaysButtonEnabled = isCombineWaysButtonEnabled;
    if (this._isToolBoxEnabled && isRefresh) {
      this._calcAndOpenToolBox();
    }
  };
  getCombineWaysButtonEnabled = () => this._isCombineWaysButtonEnabled;
  setEditModeButtonEnabled = (
    isEditButtonEnabled: boolean,
    isRefresh = true,
  ) => {
    this._isEditModeButtonEnabled = isEditButtonEnabled;
    if (this._isToolBoxEnabled && isRefresh) {
      this._calcAndOpenToolBox();
    }
  };
  getEditModeButtonEnabled = () => this._isEditModeButtonEnabled;
  setTagEditModeButtonEnabled = (
    isTagEditModeButtonEnabled: boolean,
    isRefresh = true,
  ) => {
    this._isTagEditModeButtonEnabled = isTagEditModeButtonEnabled;
    if (this._isToolBoxEnabled && isRefresh) {
      this._calcAndOpenToolBox();
    }
  };
  getTagEditModeButtonEnabled = () => this._isTagEditModeButtonEnabled;
  setDeleteButtonEnabled = (
    isDeleteButtonEnabled: boolean,
    isRefresh = true,
  ) => {
    this._isDeleteButtonEnabled = isDeleteButtonEnabled;
    if (this._isToolBoxEnabled && isRefresh) {
      this._calcAndOpenToolBox();
    }
  };
  getDeleteButtonEnabled = () => this._isDeleteButtonEnabled;
  setCopyButtonEnabled = (isCopyButtonEnabled: boolean, isRefresh = true) => {
    this._isCopyButtonEnabled = isCopyButtonEnabled;
    if (this._isToolBoxEnabled && isRefresh) {
      this._calcAndOpenToolBox();
    }
  };
  getCopyButtonEnabled = () => this._isCopyButtonEnabled;
  setCloseButtonEnabled = (isCloseButtonEnabled: boolean, isRefresh = true) => {
    this._isCloseButtonEnabled = isCloseButtonEnabled;
    if (this._isToolBoxEnabled && isRefresh) {
      this._calcAndOpenToolBox();
    }
  };
  getCloseButtonEnabled = () => this._isCloseButtonEnabled;
  setPencilOnlyEnabled = (isPencilOnlyEnabled: boolean) => {
    this._isPencilOnlyEnabled = isPencilOnlyEnabled;
  };
  isPencilOnlyEnabled = () => this._isPencilOnlyEnabled;

  setPolicy = (policy: GeoToolBoxPolicy) => {
    const {
      isToolBoxEnabled,
      isToolBoxShowingOnDragging,
      isDivideWaysButtonEnabled,
      isAppendModeButtonEnabled,
      isEditModeButtonEnabled,
      isTagEditModeButtonEnabled,
      isDeleteButtonEnabled,
      isCopyButtonEnabled,
      isCloseButtonEnabled,
      isPencilOnlyEnabled,
    } = policy;
    this.setToolBoxEnabled(isToolBoxEnabled, false);
    this.setToolBoxShowingOnDragging(isToolBoxShowingOnDragging);
    this.setDivideWaysButtonEnabled(isDivideWaysButtonEnabled, false);
    this.setAppendModeButtonEnabled(isAppendModeButtonEnabled, false);
    this.setEditModeButtonEnabled(isEditModeButtonEnabled, false);
    this.setTagEditModeButtonEnabled(isTagEditModeButtonEnabled, false);
    this.setDeleteButtonEnabled(isDeleteButtonEnabled, false);
    this.setCopyButtonEnabled(isCopyButtonEnabled, false);
    this.setCloseButtonEnabled(isCloseButtonEnabled, false);
    this.setPencilOnlyEnabled(isPencilOnlyEnabled);

    // 정책 반영
    if (this._isToolBoxEnabled) {
      this._calcAndOpenToolBox();
    }
  };

  getPolicy = (): GeoToolBoxPolicy => {
    return {
      isToolBoxEnabled: this._isToolBoxEnabled,
      isToolBoxShowingOnDragging: this._isToolBoxShowingOnDragging,
      isDivideWaysButtonEnabled: this._isDivideWaysButtonEnabled,
      isAppendModeButtonEnabled: this._isAppendModeButtonEnabled,
      isEditModeButtonEnabled: this._isEditModeButtonEnabled,
      isTagEditModeButtonEnabled: this._isTagEditModeButtonEnabled,
      isDeleteButtonEnabled: this._isDeleteButtonEnabled,
      isCopyButtonEnabled: this._isCopyButtonEnabled,
      isCloseButtonEnabled: this._isCloseButtonEnabled,
      isPencilOnlyEnabled: this._isPencilOnlyEnabled,
    };
  };

  getToolBoxMoveableRect = () => {
    const toolBoxElement = this._tool
      ?.getContent()
      ?.querySelector('#' + EDIT_TOOL_BOX_ID);
    if (!toolBoxElement) {
      return undefined;
    }
    const toolRect = toolBoxElement.getBoundingClientRect();
    const mapRect = this._googleMap.getDiv().getBoundingClientRect();
    return {
      top: mapRect.top + toolRect.height / 2 + MAP_INSET_BOUNDS_PADDING,
      left: mapRect.left + toolRect.width / 2 + MAP_INSET_BOUNDS_PADDING,
      right: mapRect.right - toolRect.width / 2 - MAP_INSET_BOUNDS_PADDING,
      bottom: mapRect.bottom - toolRect.height / 2 - MAP_INSET_BOUNDS_PADDING,
    };
  };

  /**
   * =========================================================================================================
   * 도구 이벤트 인터페이스
   * =========================================================================================================
   */
  // 길분할 도구 클릭시 이벤트 인터페이스 제공
  private _divideWaysButtonClickEventListenerManager: EventListenerManager<
    string,
    (event?: Event) => void
  > = new EventListenerManager();
  addDivideWaysButtonClickEventListener = (
    key: string,
    listener: (event?: Event) => void,
  ) => {
    return this._divideWaysButtonClickEventListenerManager.addEventListener(
      key,
      listener,
    );
  };
  removeDivideWaysButtonClickEventListener = (key: string) => {
    return this._divideWaysButtonClickEventListenerManager.removeEventListener(
      key,
    );
  };
  isDivideWaysButtonClickEventListening = (key: string) => {
    return this._divideWaysButtonClickEventListenerManager.isEventListening(
      key,
    );
  };

  // 길추가 도구 클릭시 이벤트 인터페이스 제공
  private _appendModeButtonEventListenerManager: EventListenerManager<
    string,
    (event?: Event) => void
  > = new EventListenerManager();
  addAppendModeButtonClickEventListener = (
    key: string,
    listener: (event?: Event) => void,
  ) => {
    return this._appendModeButtonEventListenerManager.addEventListener(
      key,
      listener,
    );
  };
  removeAppendModeButtonClickEventListener = (key: string) => {
    return this._appendModeButtonEventListenerManager.removeEventListener(key);
  };
  isAppendModeButtonClickToolClickEventListening = (key: string) => {
    return this._appendModeButtonEventListenerManager.isEventListening(key);
  };

  // 편집 모드 변경 도구 클릭시 이벤트 인터페이스 제공
  private _editButtonClickEventListenerManager: EventListenerManager<
    string,
    (event?: Event) => void
  > = new EventListenerManager();
  addEditButtonClickEventListener = (
    key: string,
    listener: (event?: Event) => void,
  ) => {
    return this._editButtonClickEventListenerManager.addEventListener(
      key,
      listener,
    );
  };
  removeEditButtonClickEventListener = (key: string) => {
    return this._editButtonClickEventListenerManager.removeEventListener(key);
  };
  isEditButtonClickToolClickEventListening = (key: string) => {
    return this._editButtonClickEventListenerManager.isEventListening(key);
  };

  // 태그 편집 모드 변경 도구 클릭시 이벤트 인터페이스 제공
  private _tagEditButtonClickEventListenerManager: EventListenerManager<
    string,
    (event?: Event) => void
  > = new EventListenerManager();
  addTagEditButtonClickEventListener = (
    key: string,
    listener: (event?: Event) => void,
  ) => {
    return this._tagEditButtonClickEventListenerManager.addEventListener(
      key,
      listener,
    );
  };
  removeTagEditButtonClickEventListener = (key: string) => {
    return this._tagEditButtonClickEventListenerManager.removeEventListener(
      key,
    );
  };
  isTagEditButtonClickToolClickEventListening = (key: string) => {
    return this._tagEditButtonClickEventListenerManager.isEventListening(key);
  };

  // 삭제 도구 클릭시 이벤트 인터페이스 제공
  private _deleteButtonClickEventListenerManager: EventListenerManager<
    string,
    (
      nodes: GeoNode[],
      ways: GeoWay[],
      lineSegments: GeoLineSegment[],
      event?: Event,
    ) => void
  > = new EventListenerManager();
  addDeleteButtonClickEventListener = (
    key: string,
    listener: (
      nodes: GeoNode[],
      ways: GeoWay[],
      lineSegments: GeoLineSegment[],
      event?: Event,
    ) => void,
  ) => {
    return this._deleteButtonClickEventListenerManager.addEventListener(
      key,
      listener,
    );
  };
  removeDeleteButtonClickEventListener = (key: string) => {
    return this._deleteButtonClickEventListenerManager.removeEventListener(key);
  };
  isDeleteButtonClickToolClickEventListening = (key: string) => {
    return this._deleteButtonClickEventListenerManager.isEventListening(key);
  };

  // 메인레이어에 복사 도구 클릭시 이벤트 인터페이스 제공
  private _copyButtonClickEventListenerManager: EventListenerManager<
    string,
    (lineSegmentsActivated: GeoLineSegment[], event?: Event) => void
  > = new EventListenerManager();
  addCopyButtonClickEventListener = (
    key: string,
    listener: (lineSegmentsActivated: GeoLineSegment[], event?: Event) => void,
  ) => {
    return this._copyButtonClickEventListenerManager.addEventListener(
      key,
      listener,
    );
  };
  removeCopyButtonClickEventListener = (key: string) => {
    return this._copyButtonClickEventListenerManager.removeEventListener(key);
  };
  isCopyButtonClickToolClickEventListening = (key: string) => {
    return this._copyButtonClickEventListenerManager.isEventListening(key);
  };

  // 닫기 도구 클릭시 이벤트 인터페이스 제공
  private _closeButtonClickEventListenerManager: EventListenerManager<
    string,
    (event?: Event) => void
  > = new EventListenerManager();
  addCloseButtonClickEventListener = (
    key: string,
    listener: (event?: Event) => void,
  ) => {
    return this._closeButtonClickEventListenerManager.addEventListener(
      key,
      listener,
    );
  };
  removeCloseButtonClickEventListener = (key: string) => {
    return this._closeButtonClickEventListenerManager.removeEventListener(key);
  };
  isCloseButtonClickToolClickEventListening = (key: string) => {
    return this._closeButtonClickEventListenerManager.isEventListening(key);
  };

  // 도구 박스가 열린 후에 발생하는 이벤트
  private _toolBoxOpenedEventListenerManager: EventListenerManager<
    string,
    (event?: Event) => void
  > = new EventListenerManager();
  addToolBoxOpenedEventListener = (
    key: string,
    listener: (event?: Event) => void,
  ) => {
    return this._toolBoxOpenedEventListenerManager.addEventListener(
      key,
      listener,
    );
  };
  removeToolBoxOpenedEventListener = (key: string) => {
    return this._toolBoxOpenedEventListenerManager.removeEventListener(key);
  };
  isToolBoxOpenedEventListening = (key: string) => {
    return this._toolBoxOpenedEventListenerManager.isEventListening(key);
  };

  // 도구 박스가 닫힌 후에 발생하는 이벤트
  private _toolBoxClosedEventListenerManager: EventListenerManager<
    string,
    (event?: Event) => void
  > = new EventListenerManager();
  addToolBoxClosedEventListener = (
    key: string,
    listener: (event?: Event) => void,
  ) => {
    return this._toolBoxClosedEventListenerManager.addEventListener(
      key,
      listener,
    );
  };
  removeToolBoxClosedEventListener = (key: string) => {
    return this._toolBoxClosedEventListenerManager.removeEventListener(key);
  };
  isToolBoxClosedEventListening = (key: string) => {
    return this._toolBoxClosedEventListenerManager.isEventListening(key);
  };

  /**
   * =========================================================================================================
   * 도구 박스 렌더링
   * =========================================================================================================
   */
  private _getToolBoxInsetBounds = (toolRect: RectType) => {
    if (!this._bounds || !this._projection || !this._zoomLevel) {
      return undefined;
    }

    const bounds = GeoMapUtils.makeBoundsWithPaddingPx(
      this._bounds,
      this._googleMap,
      toolRect.width / 2 + MAP_INSET_BOUNDS_PADDING,
      toolRect.height / 2 + MAP_INSET_BOUNDS_PADDING,
    );

    if (!bounds) {
      return undefined;
    }

    return GeoMapUtils.toGeoBoundsFromGoogleBounds(bounds);
  };

  private _getRenderPositionByNodes = (
    nodes: GeoNode[],
    toolRect: RectType,
  ): GeoLatLngType | undefined => {
    try {
      if (!this._projection) {
        throw Error('map projection이 없습니다. ');
      }
      const left = Math.max(...nodes.map((node) => node.getPosition().lng));
      const right = Math.min(...nodes.map((node) => node.getPosition().lng));
      const bottom = Math.min(...nodes.map((node) => node.getPosition().lat));
      const positionByNodes = {
        lat: bottom,
        lng: GeoMapUtils.getCenterLng(left, right),
      };
      const pointByNodes = this._projection.fromLatLngToPoint(positionByNodes);

      if (!this._zoomLevel) {
        throw Error('zoomLevel이 없습니다. ');
      }
      const scale = Math.pow(2, this._zoomLevel);

      if (!pointByNodes) {
        throw Error('map projection이 없습니다. ');
      }
      const toolPosition = this._projection.fromPointToLatLng(
        new google.maps.Point(
          pointByNodes.x,
          pointByNodes.y +
            (MAP_INSET_BOUNDS_PADDING + toolRect.height / 2) / scale,
        ),
      );
      if (!toolPosition) {
        throw Error('toolPosition이 없습니다. ');
      }
      return GeoMapUtils.toLatLng(toolPosition);
    } catch (error) {
      console.log('ERR:: GeoToolBoxManager:: _getToolBoxInsetBounds::', error);
      return undefined;
    }
  };

  private _calculateToolBoxRenderPosition = async (
    nodes: GeoNode[],
    lineSegments: GeoLineSegment[],
    ableTools: EditToolMenuEnum[],
  ) => {
    try {
      const nodesAll = Array.from(
        StructSetUtils.union(
          new Set(nodes),
          new Set(
            lineSegments.map((lineSegment) => lineSegment.getNodes()).flat(),
          ),
        ),
      );

      const _getToolRect = () => {
        return new Promise<RectType>((resolve) => {
          const toolClone =
            NodeContentsFuncFactory[MarkerEnum.EDIT_TOOL_BOX](
              ableTools,
            ).contentRenderFn();
          toolClone.style.opacity = '0';
          document.body.appendChild(toolClone);
          setTimeout(() => {
            const toolboxWrapper = toolClone?.querySelector(
              '#' + EDIT_TOOL_BOX_ID,
            );
            const clientRect = toolboxWrapper?.getBoundingClientRect();
            toolClone.remove();
            resolve({
              width: clientRect?.width ?? 0,
              height: clientRect?.height ?? 0,
            });
          }, 5);
        });
      };

      const toolRect = await _getToolRect();
      const toolBoxInsetBounds = this._getToolBoxInsetBounds(toolRect);

      if (!toolBoxInsetBounds) {
        throw Error('toolBoxInsetBounds가 없습니다.');
      }

      if (this._toolPointUserMoved) {
        const toolPositionUserMoved = GeoMapUtils.pointToLatLng(
          this._toolPointUserMoved,
          this._googleMap,
        );
        if (toolPositionUserMoved) {
          return {
            lat: Math.max(
              toolBoxInsetBounds.south,
              Math.min(toolPositionUserMoved.lat, toolBoxInsetBounds.north),
            ),
            lng: Math.max(
              toolBoxInsetBounds.west,
              Math.min(toolPositionUserMoved.lng, toolBoxInsetBounds.east),
            ),
          };
        }
      }

      const positionByNodes = this._getRenderPositionByNodes(
        nodesAll,
        toolRect,
      );
      if (!positionByNodes) {
        throw Error('positionByNodes가 없습니다.');
      }

      return {
        lat: Math.max(
          toolBoxInsetBounds.south,
          Math.min(positionByNodes.lat, toolBoxInsetBounds.north),
        ),
        lng: Math.max(
          toolBoxInsetBounds.west,
          Math.min(positionByNodes.lng, toolBoxInsetBounds.east),
        ),
      };
    } catch (error) {
      console.log(
        'ERR:: GeoToolBoxManager:: _calculateToolBoxRenderPosition::',
        error,
      );
      return false;
    }
  };

  private _addEventListenerAtToolButton = (
    toolType: EditToolMenuEnum,
    eventListener: (event?: Event) => void,
  ) => {
    const buttonElement = this._tool
      ?.getContent()
      ?.querySelector('#' + toolType);
    const listener = (event?: Event) => {
      const touchEvent = event as TouchEvent;
      const touches = touchEvent?.touches;
      if (
        touches &&
        GeoMapUtils.isFingerTouchEvent(touches) &&
        this._isPencilOnlyEnabled
      ) {
        return;
      }
      event?.stopPropagation();
      event?.preventDefault();
      eventListener(event);
    };
    buttonElement?.addEventListener('click', listener);
    buttonElement?.addEventListener('mousedown', listener);
    buttonElement?.addEventListener('touchstart', listener);
  };

  private _getToolMenus = (
    nodes: GeoNode[],
    lineSegments: GeoLineSegment[],
  ) => {
    const toolMenus: EditToolMenuEnum[] = [];

    if (nodes.length === 0 && lineSegments.length === 0) {
      return toolMenus;
    }

    const nodesSegmental = new Set<GeoNode>();
    const nodesEndpoint = new Set<GeoNode>();
    const nodesSegmentalAndEndpoint = new Set<GeoNode>();
    nodes.forEach((node) => {
      const nodeTypes = this._featureManager.getNodeTypes(node);
      const isEndpoint =
        nodeTypes.has(GeoNodeTypeEnum.START) ||
        nodeTypes.has(GeoNodeTypeEnum.END);
      const isSegmental = nodeTypes.has(GeoNodeTypeEnum.SEGMENTAL);

      if (isEndpoint && isSegmental) {
        nodesEndpoint.add(node);
        nodesSegmental.add(node);
        nodesSegmentalAndEndpoint.add(node);
      } else if (isSegmental) {
        nodesSegmental.add(node);
      } else {
        nodesEndpoint.add(node);
      }
    });

    const isAbleDivideWay =
      this._isDivideWaysButtonEnabled &&
      (nodesSegmental.size > 0 || nodesSegmentalAndEndpoint.size > 0);
    const isAbleAppend = this._isAppendModeButtonEnabled; // && (this._activeNodeSet.size > 0 || activePartialLineNodes.length > 0)
    const isAbleChangeEditMode =
      this._isEditModeButtonEnabled &&
      (nodes.length > 0 || lineSegments.length > 0);
    const isAbleChangeTagEditMode =
      this._isTagEditModeButtonEnabled &&
      (nodes.length > 0 || lineSegments.length > 0);

    const isAbleDelete =
      this._isDeleteButtonEnabled &&
      (nodes.length > 0 || lineSegments.length > 0);
    const isAbleCopy =
      this._isCopyButtonEnabled &&
      (nodes.length > 0 || lineSegments.length > 0);

    isAbleDivideWay && toolMenus.push(EditToolMenuEnum.DIVIDE_WAYS);
    isAbleChangeEditMode && toolMenus.push(EditToolMenuEnum.EDIT_MODE);
    isAbleAppend && toolMenus.push(EditToolMenuEnum.APPEND_MODE);
    isAbleChangeTagEditMode && toolMenus.push(EditToolMenuEnum.TAG_EDIT_MODE);
    isAbleDelete && toolMenus.push(EditToolMenuEnum.DELETE);
    isAbleCopy && toolMenus.push(EditToolMenuEnum.COPY);
    if (toolMenus.length > 0) {
      toolMenus.splice(0, 0, EditToolMenuEnum.MOVE);
      toolMenus.push(EditToolMenuEnum.CLOSE);
    }

    return toolMenus;
  };

  private _toolPointUserMoved: { x: number; y: number } | undefined;
  private _openToolBox = (
    toolMenus: EditToolMenuEnum[],
    position: GeoLatLngType,
  ) => {
    try {
      this._closeToolBox();
      if (!this._isToolBoxEnabled || toolMenus.length === 0) {
        return;
      }
      this._tool = new GeoNode({
        position,
        id: this._idGenerator.getNextId(),
        options: NodeContentsFuncFactory[MarkerEnum.EDIT_TOOL_BOX](toolMenus),
        googleMap: this._googleMap,
      });
      // ToolBox의 click 이벤트를 발생시키기 위해서 marker에 click 이벤트를 설정함
      this._tool.getMarker()?.addListener('click', () => {});

      return new Promise<boolean>((resolve) => {
        // document에 element가 생성된 것을 접근하려고 할때 노드가 생성된 후 동기적으로 접근이 되지 않습니다.
        setTimeout(() => {
          const _addEventListenerAtMove = () => {
            const moveButtonElement = this._tool
              ?.getContent()
              ?.querySelector('#' + EditToolMenuEnum.MOVE);

            let isMoveButtonElementClicked = false;
            let touchesLatest: TouchList | undefined = undefined;
            let eventLatLngLatest: GeoLatLngType | undefined = undefined;
            const centerScreenPositionDiff = { x: 0, y: 0 };

            const handleTouchUp = (event?: Event) => {
              const touchEvent = event as TouchEvent;
              const touches = touchEvent?.touches || touchesLatest;
              if (
                GeoMapUtils.isFingerTouchEvent(touches) &&
                this._isPencilOnlyEnabled
              ) {
                return;
              }
              if (!isMoveButtonElementClicked) {
                return;
              }
              if (this._tool) {
                const toolBoxPosition = this._tool.getPosition();
                this._toolPointUserMoved = GeoMapUtils.latLngToPoint(
                  toolBoxPosition,
                  this._googleMap,
                );
              }
              isMoveButtonElementClicked = false;
              this._geoMapEventManager.setMapDragClickTouchMoveEventEnabled(
                true,
              );
            };

            const mouseListener = () => {
              const mapEventKey: google.maps.MapsEventListener[] = [];
              this._geoMapEventManager.setMapDragClickTouchMoveEventEnabled(
                false,
              );

              const mapMouseDownKey = this._googleMap.addListener(
                GeoMapElementEventNameEnum.MOUSE_DOWN,
                (event: google.maps.MapMouseEvent) => {
                  const mouseEvent = event.domEvent as MouseEvent;
                  const toolCenterLatLng = this._tool?.getPosition();
                  const toolCenterScreenPosition = toolCenterLatLng
                    ? GeoMapUtils.latLngToPoint(
                        toolCenterLatLng,
                        this._googleMap,
                      )
                    : undefined;

                  const eventLatLng = event.latLng
                    ? GeoMapUtils.toLatLng(event.latLng)
                    : undefined;
                  if (
                    !toolCenterScreenPosition ||
                    !eventLatLng ||
                    mouseEvent.clientX === undefined ||
                    mouseEvent.clientY === undefined
                  ) {
                    return;
                  }

                  eventLatLngLatest = eventLatLng;
                  centerScreenPositionDiff.x =
                    mouseEvent.clientX - toolCenterScreenPosition.x;
                  centerScreenPositionDiff.y =
                    mouseEvent.clientY - toolCenterScreenPosition.y;
                },
              );
              mapEventKey.push(mapMouseDownKey);
              const mapMouseMoveKey = this._googleMap.addListener(
                GeoMapElementEventNameEnum.MOUSE_MOVE,
                (event: google.maps.MapMouseEvent) => {
                  const toolBoxMoveableRect = this.getToolBoxMoveableRect();
                  const mouseEvent = event.domEvent as MouseEvent;
                  if (
                    !this._tool ||
                    !toolBoxMoveableRect ||
                    mouseEvent.clientX === undefined ||
                    mouseEvent.clientY === undefined
                  ) {
                    return;
                  }

                  const toolCenterScreenPositionNew = {
                    x: Math.min(
                      Math.max(
                        mouseEvent.clientX - centerScreenPositionDiff.x,
                        toolBoxMoveableRect.left,
                      ),
                      toolBoxMoveableRect.right,
                    ),
                    y: Math.min(
                      Math.max(
                        mouseEvent.clientY - centerScreenPositionDiff.y,
                        toolBoxMoveableRect.top,
                      ),
                      toolBoxMoveableRect.bottom,
                    ),
                  };
                  const _toolCenterLatLngNew = GeoMapUtils.pointToLatLng(
                    toolCenterScreenPositionNew,
                    this._googleMap,
                  );
                  const toolCenterLatLngNew = _toolCenterLatLngNew
                    ? GeoMapUtils.toLatLng(_toolCenterLatLngNew)
                    : undefined;
                  if (!toolCenterLatLngNew) {
                    return;
                  }
                  this._tool.setPosition(toolCenterLatLngNew);
                },
              );
              mapEventKey.push(mapMouseMoveKey);
              const mapMouseUpKey = this._googleMap.addListener(
                GeoMapElementEventNameEnum.MOUSE_UP,
                async () => {
                  if (this._tool && this._projection) {
                    const toolBoxPosition = this._tool.getPosition();
                    this._toolPointUserMoved = GeoMapUtils.latLngToPoint(
                      toolBoxPosition,
                      this._googleMap,
                    );
                  }
                  mapEventKey.forEach((key) => key.remove());
                  mapEventKey.splice(0, mapEventKey.length);
                  this._geoMapEventManager.setMapDragClickTouchMoveEventEnabled(
                    true,
                  );
                },
              );
              mapEventKey.push(mapMouseUpKey);
            };
            const touchListener = () => {
              isMoveButtonElementClicked = true;
              this._geoMapEventManager.setMapDragClickTouchMoveEventEnabled(
                false,
              );

              const handleTouchStart = (event: TouchEvent) => {
                if (
                  GeoMapUtils.isFingerTouchEvent(event.touches) &&
                  this._isPencilOnlyEnabled
                ) {
                  return;
                }
                if (
                  !isMoveButtonElementClicked ||
                  event.touches.length < 1 ||
                  eventLatLngLatest
                ) {
                  return;
                }
                touchesLatest = DataUtils.deepCopy(event.touches);
                const toolCenterLatLng = this._tool?.getPosition();
                const toolCenterScreenPosition = toolCenterLatLng
                  ? GeoMapUtils.latLngToPoint(toolCenterLatLng, this._googleMap)
                  : undefined;
                const touch = event.touches[0];
                const _eventLatLng = GeoMapUtils.pointToLatLng(
                  { x: touch.clientX, y: touch.clientY },
                  this._googleMap,
                );
                const eventLatLng = _eventLatLng
                  ? GeoMapUtils.toLatLng(_eventLatLng)
                  : undefined;
                if (!toolCenterScreenPosition || !touch || !eventLatLng) {
                  return;
                }

                eventLatLngLatest = eventLatLng;
                centerScreenPositionDiff.x =
                  touch.clientX - toolCenterScreenPosition.x;
                centerScreenPositionDiff.y =
                  touch.clientY - toolCenterScreenPosition.y;
              };

              const handleTouchMove = (event: TouchEvent) => {
                if (
                  GeoMapUtils.isFingerTouchEvent(event.touches) &&
                  this._isPencilOnlyEnabled
                ) {
                  return;
                }
                if (
                  !isMoveButtonElementClicked ||
                  event.touches.length < 1 ||
                  !eventLatLngLatest
                ) {
                  return;
                }
                touchesLatest = DataUtils.deepCopy(event.touches);
                const touch = event.touches[0];
                const toolBoxMoveableRect = this.getToolBoxMoveableRect();
                if (!this._tool || !toolBoxMoveableRect || !touch) {
                  return;
                }

                const toolCenterScreenPositionNew = {
                  x: Math.min(
                    Math.max(
                      touch.clientX - centerScreenPositionDiff.x,
                      toolBoxMoveableRect.left,
                    ),
                    toolBoxMoveableRect.right,
                  ),
                  y: Math.min(
                    Math.max(
                      touch.clientY - centerScreenPositionDiff.y,
                      toolBoxMoveableRect.top,
                    ),
                    toolBoxMoveableRect.bottom,
                  ),
                };
                const _toolCenterLatLngNew = GeoMapUtils.pointToLatLng(
                  toolCenterScreenPositionNew,
                  this._googleMap,
                );
                const toolCenterLatLngNew = _toolCenterLatLngNew
                  ? GeoMapUtils.toLatLng(_toolCenterLatLngNew)
                  : undefined;
                if (!toolCenterLatLngNew) {
                  return;
                }
                this._tool.setPosition(toolCenterLatLngNew);
              };

              this._googleMap
                .getDiv()
                .addEventListener(
                  GeoMapElementEventNameEnum.TOUCH_START,
                  handleTouchStart,
                );
              this._googleMap
                .getDiv()
                .addEventListener(
                  GeoMapElementEventNameEnum.TOUCH_MOVE,
                  handleTouchMove,
                );
              this._googleMap
                .getDiv()
                .addEventListener(
                  GeoMapElementEventNameEnum.TOUCH_END,
                  handleTouchUp,
                );
            };
            if (EnvUtils.isTablet()) {
              moveButtonElement?.addEventListener('touchstart', touchListener);
              moveButtonElement?.addEventListener('touchend', handleTouchUp);
            } else {
              moveButtonElement?.addEventListener('mousedown', mouseListener);
            }
          };

          toolMenus.forEach((toolMenu) => {
            switch (toolMenu) {
              case EditToolMenuEnum.MOVE:
                _addEventListenerAtMove();
                break;
              case EditToolMenuEnum.DIVIDE_WAYS:
                this._addEventListenerAtToolButton(toolMenu, (event) => {
                  if (this._buttonEventPreventer.isPrevent(toolMenu)) {
                    return;
                  }
                  this._buttonEventPreventer.updateEventAtToNow(toolMenu);
                  this._divideWaysButtonClickEventListenerManager.invokeEventListeners(
                    event,
                  );
                });
                break;
              case EditToolMenuEnum.APPEND_MODE:
                this._addEventListenerAtToolButton(toolMenu, (event) => {
                  if (this._buttonEventPreventer.isPrevent(toolMenu)) {
                    return;
                  }
                  this._buttonEventPreventer.updateEventAtToNow(toolMenu);
                  this._appendModeButtonEventListenerManager.invokeEventListeners(
                    event,
                  );
                });
                break;
              case EditToolMenuEnum.EDIT_MODE:
                this._addEventListenerAtToolButton(toolMenu, (event) => {
                  {
                    if (this._buttonEventPreventer.isPrevent(toolMenu)) {
                      return;
                    }
                    this._buttonEventPreventer.updateEventAtToNow(toolMenu);
                    this._editButtonClickEventListenerManager.invokeEventListeners(
                      event,
                    );
                  }
                });
                break;
              case EditToolMenuEnum.TAG_EDIT_MODE:
                this._addEventListenerAtToolButton(toolMenu, (event) => {
                  if (this._buttonEventPreventer.isPrevent(toolMenu)) {
                    return;
                  }
                  this._buttonEventPreventer.updateEventAtToNow(toolMenu);
                  this._tagEditButtonClickEventListenerManager.invokeEventListeners(
                    event,
                  );
                });
                break;
              case EditToolMenuEnum.DELETE:
                this._addEventListenerAtToolButton(toolMenu, (event) => {
                  if (this._buttonEventPreventer.isPrevent(toolMenu)) {
                    return;
                  }
                  this._buttonEventPreventer.updateEventAtToNow(toolMenu);
                  this._deleteButtonClickEventListenerManager.invokeEventListeners(
                    this._featureActivationManager.getNodesActivated(),
                    this._featureActivationManager.getWaysActivated(),
                    this._featureActivationManager.getLineSegmentsActivated(),
                    event,
                  );
                });
                break;
              case EditToolMenuEnum.COPY:
                this._addEventListenerAtToolButton(toolMenu, (event) => {
                  if (this._buttonEventPreventer.isPrevent(toolMenu)) {
                    return;
                  }
                  this._buttonEventPreventer.updateEventAtToNow(toolMenu);
                  this._copyButtonClickEventListenerManager.invokeEventListeners(
                    this._featureActivationManager.getLineSegmentsActivated(),
                    event,
                  );
                });
                break;
              case EditToolMenuEnum.CLOSE:
                this._addEventListenerAtToolButton(toolMenu, (event) => {
                  if (this._buttonEventPreventer.isPrevent(toolMenu)) {
                    return;
                  }
                  this._buttonEventPreventer.updateEventAtToNow(toolMenu);
                  this._closeButtonClickEventListenerManager.invokeEventListeners(
                    event,
                  );
                });
                break;
            }
          });
          resolve(true);
        }, 100);
      });
    } catch (error) {
      console.log('ERR:: GeoToolBoxManager:: _openToolBox::', error);
      return false;
    }
  };

  private _updateToolBoxPosition = (position: GeoLatLngType) => {
    try {
      if (!this._isToolBoxEnabled) {
        throw new Error('_isToolBoxEnabled 정책이 false 입니다.');
      }
      if (!this._tool) {
        throw new Error('toolBox가 열려있지 않습니다.');
      }
      this._tool.setPosition(position);
      return true;
    } catch (error) {
      console.log('ERR:: GeoToolBoxManager:: _updateToolBoxPosition::', error);
      return false;
    }
  };

  private _closeToolBox = () => {
    if (!this._tool) {
      return;
    }
    this._tool.destroy();
    this._tool = undefined;
    this._toolBoxClosedEventListenerManager.invokeEventListeners();
  };

  isToolBoxOpen = () => !!this._tool;

  private _calcAndOpenToolBox = async () => {
    try {
      const toolMenu = this._getToolMenus(
        this._nodesActivated,
        this._lineSegmentsActivated,
      );
      const position = await this._calculateToolBoxRenderPosition(
        this._nodesActivated,
        this._lineSegmentsActivated,
        toolMenu,
      );
      if (!position) {
        throw Error('_calculateToolBoxRenderPosition 값이 없습니다.');
      }
      this._openToolBox(toolMenu, position);
      return true;
    } catch (error) {
      console.log('ERR:: GeoToolBoxManager:: _calcAndOpenToolBox::', error);
      return false;
    }
  };

  destroy = () => {
    this._closeToolBox();
    this._divideWaysButtonClickEventListenerManager.destroy();
    this._appendModeButtonEventListenerManager.destroy();
    this._editButtonClickEventListenerManager.destroy();
    this._tagEditButtonClickEventListenerManager.destroy();
    this._deleteButtonClickEventListenerManager.destroy();
    this._copyButtonClickEventListenerManager.destroy();
    this._closeButtonClickEventListenerManager.destroy();
    this._toolBoxOpenedEventListenerManager.destroy();
    this._toolBoxClosedEventListenerManager.destroy();
    this._buttonEventPreventer.destroy();

    this._nodesActivated = [];
    this._waysActivated = [];
    this._lineSegmentsActivated = [];
    this._tool = undefined;
  };
}

export default GeoToolBoxManager;
