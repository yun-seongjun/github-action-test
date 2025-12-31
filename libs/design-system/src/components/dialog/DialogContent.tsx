import { ReactElement } from 'react';

export interface DialogContentProps {
  content?: string | ReactElement;
}

const DialogContent = ({ content }: DialogContentProps) => {
  if (!content) return null;
  if (typeof content === 'string') {
    return (
      <div className="flex w-full flex-col gap-8">
        <span className="whitespace-pre-wrap font-medium text-mono-600 font-size-14">
          {content}
        </span>
      </div>
    );
  }
  return content;
};

export default DialogContent;
