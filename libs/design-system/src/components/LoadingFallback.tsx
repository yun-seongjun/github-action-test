import { PropsWithChildren, ReactNode } from 'react';

type LoadingFallbackProps = {
  isLoading: boolean;
  fallback: ReactNode;
};

const LoadingFallback = ({
  fallback,
  isLoading,
  children,
}: PropsWithChildren<LoadingFallbackProps>) => {
  return <>{isLoading ? fallback : children}</>;
};

export default LoadingFallback;
