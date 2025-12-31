import { useRef } from 'react';
import { DataQuery } from '@design-system/types/common.type';
import { ComponentUtils } from '@design-system/utils/componentUtils';
import { TextUtils } from '@design-system/utils/textUtils';
import { PortalTypeEnum } from '@design-system/root/src';
import TooltipTruncated from '@design-system/components/tooltip/TooltipTruncated';

interface HighLightWordsProps extends DataQuery {
  wrapperClassName?: string;
  text: string;
  textClassName: string;
  highLightTextArr?: string[];
  highLightTextClassName: string;
}

const HighLightWords = ({
  wrapperClassName,
  text,
  highLightTextArr,
  highLightTextClassName,
  textClassName,
  dataQk,
}: HighLightWordsProps) => {
  const splitWords = highLightTextArr
    ? TextUtils.splitByHighLightText(text, highLightTextArr)
    : [text];
  const wrapperRef = useRef<HTMLParagraphElement>(null);

  return (
    <>
      <p
        ref={wrapperRef}
        className={ComponentUtils.cn(
          'truncate whitespace-pre-wrap',
          wrapperClassName,
          textClassName,
        )}
        data-qk={dataQk}
      >
        {splitWords.map((word, index) => {
          const isHighLight = highLightTextArr?.some(
            (highlight) => highlight.toLowerCase() === word.toLowerCase(),
          );
          if (isHighLight) {
            return (
              <span
                key={index}
                className={ComponentUtils.cn(highLightTextClassName)}
              >
                {word}
              </span>
            );
          } else {
            return word;
          }
        })}
      </p>
      <TooltipTruncated
        targetElementRef={wrapperRef}
        portalType={PortalTypeEnum.MODAL}
      />
    </>
  );
};

export default HighLightWords;
