import { PropsWithChildren } from 'react';
import ReactDOM from 'react-dom';
const isServer = typeof window === 'undefined';

type PortalProps = {
  id: string;
};

const Portal = ({ id, children }: PropsWithChildren<PortalProps>) => {
  if (isServer) return null;

  return ReactDOM.createPortal(
    children,
    document.getElementById(id) as HTMLElement,
  );
};

export default Portal;
