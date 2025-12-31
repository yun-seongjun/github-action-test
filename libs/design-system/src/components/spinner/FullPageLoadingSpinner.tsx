import Portal from '@design-system/components/Portal';
import LoadingSpinner, {
  LoadingSpinnerTypeEnum,
} from '@design-system/components/spinner/LoadingSpinner';
import SpinnerAtom, {
  SpinnerColorEnum,
  SpinnerSizeEnum,
} from '@design-system/components/spinner/SpinnerAtom';
import { PortalTypeEnum } from '@design-system/constants/portalType.enum';
import { DataQuery } from '@design-system/types/common.type';

interface FullPageLoadingSpinnerProps extends DataQuery {
  text?: string;
}

const FullPageLoadingSpinner = (props?: FullPageLoadingSpinnerProps) => {
  const { text, dataQk = 'full-page-loading-spinner' } = props || {};

  return (
    <Portal id={PortalTypeEnum.FULL_PAGE_LOADING_SPINNER}>
      <div
        className="absolute top-0 z-loading flex h-screen w-screen items-center justify-center"
        data-qk={dataQk}
      >
        {text ? (
          <div className="flex h-screen w-screen flex-col items-center justify-center bg-mono-900/30">
            <SpinnerAtom
              size={SpinnerSizeEnum.L}
              color={SpinnerColorEnum.WHITE}
            />
            <span className="mt-15 whitespace-pre-wrap text-center text-white font-size-16">
              {text}
            </span>
          </div>
        ) : (
          <LoadingSpinner type={LoadingSpinnerTypeEnum.Dialog} />
        )}
      </div>
    </Portal>
  );
};

export default FullPageLoadingSpinner;
