import React, { PropsWithChildren } from 'react';
import { ComponentUtils } from '@design-system/utils';
import AccordionContext from '@design-system/components/accordion/AccordionContext';

interface AccordionDetailsProps {
  className?: string;
}

const AccordionDetails = ({
  className,
  children,
}: PropsWithChildren<AccordionDetailsProps>) => {
  const { expanded } = React.useContext(AccordionContext);

  return (
    <div
      className={ComponentUtils.cn(
        'ease relative grid gap-4 overflow-hidden transition-[grid-templates-rows] duration-500',
        className,
        expanded ? 'py-12' : null,
      )}
      style={{ gridTemplateRows: expanded ? 'auto' : 0 }}
    >
      {children}
    </div>
  );
};

export default AccordionDetails;
