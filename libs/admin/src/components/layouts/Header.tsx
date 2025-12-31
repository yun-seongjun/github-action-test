import { PropsWithChildren, ReactNode } from 'react';

type HeaderProps = {
  title?: ReactNode;
};
const Header = ({ title, children }: PropsWithChildren<HeaderProps>) => {
  return (
    <header className="navbar h-62 bg-mono-50 flex w-full items-center justify-between px-24 py-20 pb-4">
      <h1
        suppressHydrationWarning
        className="font-size-24 text-mono-800 font-bold"
      >
        {title}
      </h1>
      {children}
    </header>
  );
};

export default Header;
