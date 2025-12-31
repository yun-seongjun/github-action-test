import React, { PropsWithChildren, useState } from 'react';
import AccordionContext from '@design-system/components/accordion/AccordionContext';
import { ComponentUtils } from '@design-system/utils';

interface AccordionProps {
  onChange?: (event: React.SyntheticEvent, expanded: boolean) => void;
  defaultExpanded?: boolean;
  className?: string;
  disabled?: boolean;
}

const Accordion = ({
  children,
  defaultExpanded = false,
  className,
  disabled,
  onChange,
}: PropsWithChildren<AccordionProps>) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);

  const handleChange = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    setIsExpanded((prev) => !prev);

    if (onChange) {
      onChange(e, !isExpanded);
    }
  };

  const contextValue = React.useMemo(
    () => ({ disabled, expanded: isExpanded, toggle: handleChange }),
    [isExpanded, disabled, handleChange],
  );

  return (
    <AccordionContext.Provider value={contextValue}>
      <div
        className={ComponentUtils.cn(
          'border-1 border-mono-100 cursor-pointer overflow-hidden bg-white pl-12 pr-8',
          className,
        )}
      >
        {children}
      </div>
    </AccordionContext.Provider>
  );
};

export default Accordion;
