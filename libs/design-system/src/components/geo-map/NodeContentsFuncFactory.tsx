import { CSSProperties } from 'react';
import CursorAddedIcon from '@design-system/icons/cursoradded.svg';
import CursorAltNodeAddIcon from '@design-system/icons/cursoraltnodeadd.svg';
import CursorPenNodeIcon from '@design-system/icons/cursorpennode.svg';
import MoveIcon from '@design-system/icons/move.svg';
import ScissorsIcon from '@design-system/icons/scissors.svg';
import TrashIcon from '@design-system/icons/trash.svg';
import GeoNode from '@design-system/geo-map/feature/GeoNode';
import { theme } from '@design-system/root/tailwind.config';
import { MarkerEnum } from '@design-system/types/geoMap.type';
import { i18n } from 'next-i18next';

export const EDIT_NODE_BOX_ID = 'edit-node-box';
const EditNodeBox = ({ nodeId }: { nodeId?: number }) => {
  return (
    <div
      id={EDIT_NODE_BOX_ID}
      style={correctionPositionStyle}
      className="size-14"
      data-qk={nodeId ? `nodeId-${nodeId}` : undefined}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="pointer-events-none"
      >
        <path
          d="M13 11V4H11V11H4V13H11V20H13V13H20V11H13Z"
          fill="currentColor"
        />
      </svg>
    </div>
  );
};

export const EDIT_TOOL_BOX_ID = 'edit-tool-box';

export enum EditToolMenuEnum {
  MOVE = 'geomap-edit-move',
  APPEND_MODE = 'geomap-edit-append-mode',
  EDIT_MODE = 'geomap-edit-mode',
  TAG_EDIT_MODE = 'geomap-edit-tag-mode',
  DIVIDE_WAYS = 'geomap-edit-divide-ways',
  DELETE = 'geomap-edit-delete-feature',
  COPY = 'geomap-edit-copy-feature',
  CLOSE = 'geomap-edit-close-tool-box',
}

export const EditToolBox = ({
  activeTools,
}: {
  activeTools: EditToolMenuEnum[];
}) => {
  const isActiveTool = (editToolName: EditToolMenuEnum) =>
    activeTools.includes(editToolName);
  return (
    <div
      id={EDIT_TOOL_BOX_ID}
      style={correctionPositionStyle}
      className="bg-mono-200 flex h-36 items-center gap-10 rounded-full px-8"
      data-qk="edit-map-tool-box"
    >
      <MoveIcon
        id={EditToolMenuEnum.MOVE}
        className="text-mono-500 h-36 w-36 cursor-pointer p-6"
        data-qk={EditToolMenuEnum.MOVE}
      />
      {isActiveTool(EditToolMenuEnum.DIVIDE_WAYS) && (
        <ScissorsIcon
          id={EditToolMenuEnum.DIVIDE_WAYS}
          className="text-mono-500 h-36 w-36 cursor-pointer p-6"
          data-qk="edit-tool-divide-ways-button"
        />
      )}
      {isActiveTool(EditToolMenuEnum.EDIT_MODE) && (
        <CursorAltNodeAddIcon
          id={EditToolMenuEnum.EDIT_MODE}
          className="text-mono-500 h-36 w-36 cursor-pointer p-6"
          data-qk="edit-tool-edit-mode-button"
        />
      )}
      {isActiveTool(EditToolMenuEnum.APPEND_MODE) && (
        <CursorPenNodeIcon
          id={EditToolMenuEnum.APPEND_MODE}
          className="text-mono-500 h-36 w-36 cursor-pointer p-6"
          data-qk={'edit-tool-append-mode-button'}
        />
      )}
      {isActiveTool(EditToolMenuEnum.TAG_EDIT_MODE) && (
        <CursorAddedIcon
          id={EditToolMenuEnum.TAG_EDIT_MODE}
          className="text-mono-500 h-36 w-36 cursor-pointer p-6"
          data-qk="edit-tool-tag-edit-modoe-button"
        />
      )}
      {isActiveTool(EditToolMenuEnum.DELETE) && (
        <TrashIcon
          id={EditToolMenuEnum.DELETE}
          className="text-mono-500 h-36 w-36 cursor-pointer p-6"
          data-qk="edit-tool-delete-button"
        />
      )}
      {isActiveTool(EditToolMenuEnum.COPY) && (
        <span
          id={EditToolMenuEnum.COPY}
          className="text-mono-500 font-size-12 cursor-pointer whitespace-nowrap p-10 font-bold"
        >
          {i18n?.t('node:edit.tool-box.button.copy-to-main-layer')}
        </span>
      )}
      <div className="bg-mono-500 h-24 w-1" />
      {isActiveTool(EditToolMenuEnum.CLOSE) && (
        <span
          id={EditToolMenuEnum.CLOSE}
          className="text-mono-500 font-size-12 cursor-pointer whitespace-nowrap p-10 font-bold"
          data-qk={'edit-tool-close-button'}
        >
          {i18n?.t('node:edit.tool-box.button.close')}
        </span>
      )}
    </div>
  );
};

const None = () => {
  return <></>;
};

export const correctionPositionStyle: CSSProperties = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: `translate(-50%, -50%)`,
};

// Todo:: rdh ::  renderFn들을 좀더 독립적으로 표현될 수 있도록 고민이 필요합니다.
const NodeContentsFuncFactory = {
  [MarkerEnum.EDIT_NODE]: (nodeId?: number) => ({
    contentRenderFn: GeoNode.makeMarkerContentFunc(
      <EditNodeBox nodeId={nodeId} />,
    ),
    zIndex: theme.zIndex.map.marker.normal,
  }),
  [MarkerEnum.EDIT_TOOL_BOX]: (activeTools: EditToolMenuEnum[]) => ({
    contentRenderFn: GeoNode.makeMarkerContentFunc(
      <EditToolBox activeTools={activeTools} />,
    ),
    draggable: false,
    clickable: false,
    zIndex: theme.zIndex.map.marker['tool-box'],
  }),
  [MarkerEnum.NONE]: () => ({
    contentRenderFn: GeoNode.makeMarkerContentFunc(<None />),
    zIndex: theme.zIndex.map.marker.normal,
  }),
};

export default NodeContentsFuncFactory;
