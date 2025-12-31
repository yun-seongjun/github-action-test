import React, { PropsWithChildren, ReactNode } from 'react';
import { ComponentUtils } from '@design-system/utils';
import AccordionContext from '@design-system/components/accordion/AccordionContext';
import { IconNamesEnum } from '@design-system/root/src';
import Icon from '@design-system/components/common/Icon';

interface AccordionSummaryProps {
  className?: string;
  expandIcon?: ReactNode;
}

const AccordionSummary = ({
  className,
  children,
  expandIcon,
}: PropsWithChildren<AccordionSummaryProps>) => {
  const { toggle, expanded } = React.useContext(AccordionContext);

  const handleWrapperClick = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    toggle?.(e);
  };

  return (
    <div
      onClick={(e) => handleWrapperClick(e)}
      className={ComponentUtils.cn(
        'flex w-full items-center justify-between',
        className,
      )}
    >
      {children}
      <div
        className={ComponentUtils.cn(
          'inline-flex transition-transform duration-300 ease-in-out',
          expanded ? 'rotate-180' : 'rotate-0',
        )}
      >
        {expandIcon ? (
          expandIcon
        ) : (
          <Icon name={IconNamesEnum.ChevronDown} className="size-16" />
        )}
      </div>
    </div>
  );
};

export default AccordionSummary;
