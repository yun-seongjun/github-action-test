import {
  ChangeEvent,
  forwardRef,
  InputHTMLAttributes,
  Ref,
  useRef,
} from 'react';
import {
  BaseDisplay,
  WrapperProps,
} from '@design-system/components/BaseDisplay';
import { ComponentUtils } from '@design-system/utils/componentUtils';
import {
  DateFormat,
  DatePaddingTypeEnum,
  DateUtils,
  defaultUtcOffsetMinute,
} from '@design-system/utils/dateUtils';

export enum DateTypeEnum {
  DATE = 'DATE',
  TIME = 'TIME',
  DATETIME = 'DATETIME',
  DATETIME_UTC_OFFSET = 'DATETIME_UTC_OFFSET',
}

export const dateTypeDefault = DateTypeEnum.DATE;

const getInputType = (dateType: DateTypeEnum) => {
  switch (dateType) {
    case DateTypeEnum.DATETIME:
      return 'datetime-local';
    case DateTypeEnum.TIME:
      return 'time';
    case DateTypeEnum.DATE:
      return 'date';
  }
};

export type DatePickerValueType = string;

/**
 * dateType에 따라서 value를 다음과 같은 형태로 입력해야 함
 * - DateTypeEnum.DATETIME
 *
 *   YYYY-MM-DD HH:mm:ss
 *
 * - DateTypeEnum.TIME
 *
 *   HH:mm:ss
 *
 * - DateTypeEnum.DATE
 *
 *   YYYY-MM-DD
 *
 *   @example
 *   2024-01-01 10:24:30
 *   10:24:30
 *   2024-01-01
 *
 */
export interface DatePickerProps<
  TValue extends DatePickerValueType = DatePickerValueType,
>
  extends
    Omit<WrapperProps, 'componentRef' | 'className'>,
    Omit<
      InputHTMLAttributes<HTMLInputElement>,
      'value' | 'onChange' | 'width' | 'height'
    > {
  /**
   * DateType. Date, DateTime, Time 중 하나
   */
  dateType?: DateTypeEnum;
  /**
   * input의 className
   */
  inputClassName?: string;
  /**
   * inputWrapper의 className
   */
  inputWrapperClassName?: string;
  /**
   * YYYY-MM-DDTHH:mm:ss의 형태로 변경 시, 남은 부분(예: 초)을 채우기 위한 타입
   */
  datePaddingType?: DatePaddingTypeEnum;
  /**
   * 값
   */
  value?: TValue | null;
  /**
   * 값 변경 이벤트
   */
  onChange?: (value: TValue, e?: ChangeEvent<HTMLInputElement>) => void;
  /**
   * onChange로 전달되는 변경된 날짜의 형식
   */
  dateFormatForValueChanged?: DateFormat;

  /**
   * UTC Offset 분(minute) 값
   */
  utcOffsetMinute?: number;
}

const DatePicker = forwardRef(
  (
    {
      id,
      name,
      value,
      min,
      max,
      dateType = dateTypeDefault,
      inputClassName,
      inputWrapperClassName,
      datePaddingType,
      onChange,
      dateFormatForValueChanged = DateFormat.DATETIME_SECOND,
      utcOffsetMinute = defaultUtcOffsetMinute,
      dataQk,
      onClick,
      ...wrapperProps
    }: DatePickerProps,
    ref: Ref<HTMLInputElement>,
  ) => {
    const { disabled, isError, displayType } = wrapperProps;
    const inputRef = useRef<HTMLInputElement>(null);
    const valueDisplay = DateUtils.toDateStrForDisplay(
      dateType,
      value ?? '',
      utcOffsetMinute,
    );

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      // Convert the input value to a datetime string
      const valueNew = DateUtils.toDatetimeSecondStr(
        e.target.value,
        datePaddingType,
      );

      // Format the datetime string
      const valueNewFormatted = DateUtils.getDateString(
        valueNew,
        dateFormatForValueChanged,
      );

      // Append the UTC offset to the formatted date string
      const valueNewFormattedUtcOffset = DateUtils.appendUtcOffset(
        valueNewFormatted,
        utcOffsetMinute,
      );
      onChange?.(valueNewFormattedUtcOffset ?? '', e);
    };
    return (
      <BaseDisplay.Wrapper
        {...wrapperProps}
        className={inputWrapperClassName}
        componentRef={inputRef}
        dataQk={dataQk}
      >
        <input
          id={id || name}
          name={name}
          ref={(r) => ComponentUtils.setRefs(r, inputRef, ref)}
          value={valueDisplay}
          disabled={disabled}
          className={ComponentUtils.cn(
            BaseDisplay.getComponentClassName(isError, displayType),
            !value && 'text-mono-300 font-light',
            inputClassName,
          )}
          onMouseDown={BaseDisplay.onMouseDown}
          onChange={handleChange}
          onClick={onClick}
          min={min}
          max={max}
          type={getInputType(dateType)}
          data-qk={dataQk}
        />
      </BaseDisplay.Wrapper>
    );
  },
);

DatePicker.displayName = 'DatePicker';

export default DatePicker as <
  TValue extends DatePickerValueType = DatePickerValueType,
>(
  props: DatePickerProps<TValue> & {
    ref?: Ref<HTMLInputElement>;
  },
) => JSX.Element;
