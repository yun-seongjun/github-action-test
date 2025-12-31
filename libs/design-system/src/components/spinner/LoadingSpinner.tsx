import SpinnerAtom, {
  SpinnerColorEnum,
  SpinnerSizeEnum,
} from '@design-system/components/spinner/SpinnerAtom';
import { DataQuery } from '@design-system/types/common.type';
import { ComponentUtils } from '@design-system/utils/componentUtils';

export enum LoadingSpinnerTypeEnum {
  Only = 'Only',
  Dialog = 'Dialog',
}
interface LoadingSpinnerProps extends DataQuery {
  type: LoadingSpinnerTypeEnum;
}

const LoadingSpinner = ({ type, dataQk }: LoadingSpinnerProps) => {
  return (
    <div
      className={ComponentUtils.cn(
        'flex h-120 w-120 items-center justify-center rounded-full',
        type === LoadingSpinnerTypeEnum.Dialog && 'bg-mono-900/30',
      )}
      data-qk={dataQk}
    >
      <SpinnerAtom
        size={SpinnerSizeEnum.L}
        color={
          type === LoadingSpinnerTypeEnum.Only
            ? SpinnerColorEnum.MONO
            : SpinnerColorEnum.WHITE
        }
      />
    </div>
  );
};

export default LoadingSpinner;
