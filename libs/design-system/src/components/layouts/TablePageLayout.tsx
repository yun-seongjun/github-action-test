import { PropsWithChildren, ReactNode } from 'react';

interface TablePageHeaderProps {
  title: string;
  rightSideElement?: ReactNode;
}

const TablePageLayout = () => <></>;
const TablePageLayoutHeader = ({
  title,
  rightSideElement,
}: TablePageHeaderProps) => {
  return (
    <header className="h-62 max-h-62 min-h-62 w-full px-24 pb-4 pt-20">
      <div className="flex items-center justify-between">
        <h1 className="text-mono-800 font-size-24 font-bold">{title}</h1>
        {rightSideElement}
      </div>
    </header>
  );
};

const TablePageLayoutBody = ({ children }: PropsWithChildren) => {
  return <div className="overflow-auto px-24 py-20">{children}</div>;
};

TablePageLayout.Header = TablePageLayoutHeader;
TablePageLayout.Body = TablePageLayoutBody;

export default TablePageLayout;
