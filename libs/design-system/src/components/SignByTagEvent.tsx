import { useLocale } from '@design-system/hooks';
import AccidentZoneSignKr from '@design-system/icons/imageIcons/img-accident-zone-kr.svg';
import AccidentZoneSignEn from '@design-system/icons/imageIcons/img-accident-zone-en.svg';
import { LocaleEnum, TagClassValueEnum } from '@design-system/root/src';
import ComponentUtils from '@design-system/utils/componentUtils';

interface SignByTagEventProps {
  currentEventTag?: TagClassValueEnum | undefined;
  className?: string;
}

const SignByTagEvent = ({
  currentEventTag,
  className,
}: SignByTagEventProps) => {
  const { locale } = useLocale();
  //TODO wdj left 10이 className으로 적용이 되지 않고 있습니다. 이유파악 및 style 삭제 필요
  switch (currentEventTag) {
    case TagClassValueEnum.ACCIDENT_ZONE:
      return locale === LocaleEnum.KOREAN ? (
        <AccidentZoneSignKr
          className={ComponentUtils.cn('absolute left-10 top-10', className)}
          style={{ left: !className && '10px' }}
        />
      ) : (
        <AccidentZoneSignEn
          className={ComponentUtils.cn('absolute left-10 top-10', className)}
          style={{ left: !className && '10px' }}
        />
      );
    default:
      return null;
  }
};

export default SignByTagEvent;
