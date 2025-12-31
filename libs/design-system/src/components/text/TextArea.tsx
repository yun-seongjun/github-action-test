import {
  ChangeEvent,
  forwardRef,
  Ref,
  TextareaHTMLAttributes,
  useRef,
  useState,
} from 'react';
import {
  BaseDisplay,
  DisplayTypeEnum,
  WrapperProps,
} from '@design-system/components/BaseDisplay';
import { ComponentUtils } from '@design-system/utils/componentUtils';

interface TextLengthProps {
  currentLength: number;
  maxLength: number;
  disabled?: boolean;
}

const TextLength = ({
  currentLength = 0,
  maxLength,
  disabled,
}: TextLengthProps) => {
  return (
    <p
      className={ComponentUtils.cn(
        'pointer-events-none w-full cursor-pointer pt-14 text-end font-light text-mono-500',
        disabled && 'text-mono-200',
      )}
    >{`${currentLength}/${maxLength}`}</p>
  );
};

export interface TextAreaProps
  extends
    Omit<WrapperProps, 'componentRef' | 'displayType' | 'className'>,
    Pick<
      TextareaHTMLAttributes<HTMLTextAreaElement>,
      | 'id'
      | 'name'
      | 'value'
      | 'onClick'
      | 'onChange'
      | 'onKeyUp'
      | 'placeholder'
      | 'maxLength'
    > {
  textAreaClassName?: string;
  textAreaWrapperClassName?: string;
  displayType?: Exclude<DisplayTypeEnum, DisplayTypeEnum.UNDERLINED>;
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      id,
      name,
      value,
      placeholder,
      maxLength,
      textAreaClassName,
      textAreaWrapperClassName,
      displayType = DisplayTypeEnum.OUTLINED,
      onChange,
      onKeyUp,
      dataQk,
      ...wrapperProps
    }: TextAreaProps,
    ref: Ref<HTMLTextAreaElement>,
  ) => {
    const { disabled, isError } = wrapperProps;
    const textAreaRef = useRef<HTMLTextAreaElement>(null);
    const [currentLength, setCurrentLength] = useState<number>(
      String(value || '').length,
    );

    const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
      setCurrentLength(e.target.value.length);
      onChange?.(e);
    };

    return (
      <BaseDisplay.Wrapper
        {...wrapperProps}
        displayType={displayType}
        componentRef={textAreaRef}
        className={ComponentUtils.cn(
          'flex h-80 flex-col py-12',
          textAreaWrapperClassName,
        )}
      >
        <textarea
          id={id}
          name={name}
          ref={(r) => ComponentUtils.setRefs(r, textAreaRef, ref)}
          className={BaseDisplay.getComponentClassName(
            isError,
            displayType,
            ComponentUtils.cn('h-full resize-none', textAreaClassName),
          )}
          onKeyUp={(e) => {
            // Prevent form submission on Enter key
            if (e.key === 'Enter') {
              e.stopPropagation();
              e.preventDefault();
            }
            onKeyUp?.(e);
          }}
          onMouseDown={BaseDisplay.onMouseDown}
          value={value ?? ''}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          onChange={handleChange}
          data-qk={dataQk}
        />
        {maxLength && (
          <TextLength
            currentLength={Math.min(currentLength, maxLength)}
            maxLength={maxLength}
            disabled={disabled}
          />
        )}
      </BaseDisplay.Wrapper>
    );
  },
);

TextArea.displayName = 'TextArea';

export default TextArea;
