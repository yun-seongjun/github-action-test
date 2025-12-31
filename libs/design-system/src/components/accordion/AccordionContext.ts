import React from 'react';

const AccordionContext = React.createContext<
  Partial<{
    disabled: boolean;
    expanded: boolean;
    toggle: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  }>
>({});

export default AccordionContext;
