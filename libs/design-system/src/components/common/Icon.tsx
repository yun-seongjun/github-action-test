import { lazy, Suspense, useMemo } from 'react';
import { IconMap } from '@design-system/constants/iconMap';
import { IconNamesEnum } from '@design-system/constants/iconNames.enum';
import { DataQuery } from '@design-system/types/common.type';
import { ComponentUtils } from '@design-system/utils/componentUtils';

export interface IconProps extends DataQuery {
  name: IconNamesEnum;
  className?: string;
  onClick?(): void;
}

const Icon = ({ name, className, onClick, dataQk }: IconProps) => {
  const IconComponent = useMemo(() => lazy(IconMap[name]), [name]);
  return (
    <Suspense
      fallback={
        <div
          className={className ? ComponentUtils.cn(className) : 'h-24 w-24'}
        />
      }
    >
      <IconComponent
        className={className ? ComponentUtils.cn(className) : 'h-24 w-24'}
        onClick={() => onClick?.()}
        data-qk={dataQk}
      />
    </Suspense>
  );
};

export default Icon;
