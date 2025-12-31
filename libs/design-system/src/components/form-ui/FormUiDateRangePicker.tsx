import { forwardRef, MutableRefObject, Ref } from 'react';
import DatePicker, {
  DatePickerProps,
  dateTypeDefault,
} from '@design-system/components/DatePicker';
import {
  FormComponent,
  FormComponentWrapperProps,
  TwoColumnWrapperProps,
} from '@design-system/components/form/FormComponent';
import useDateRangePicker from '@design-system/hooks/form/useDateRangePicker';
import { DatePaddingTypeEnum } from '@design-system/utils/dateUtils';

export interface FormUiDateRangeInnerPickerProps<
  TName extends string = string,
  TValue extends string = string,
> extends Pick<DatePickerProps<TValue>, 'value' | 'onChange'> {
  name: TName;
}

export interface FormUiDateRangePickerProps<
  TName extends string = string,
  TValue extends string = string,
>
  extends
    Omit<
      DatePickerProps,
      'name' | 'isActiveBorderWhenHover' | 'value' | 'onChange'
    >,
    Omit<FormComponentWrapperProps, 'htmlFor'>,
    Pick<TwoColumnWrapperProps, 'separator'> {
  startDatePickerProps: FormUiDateRangeInnerPickerProps<TName, TValue>;
  endDatePickerProps: FormUiDateRangeInnerPickerProps<TName, TValue>;
  /**
   * 시작일과 종료일의 범위 일(day)
   */
  rangeDay?: number;
  /**
   * 종료일의 ref
   * 시작일은 forwardRef를 이용하여 전달 받음
   */
  refEnd?: MutableRefObject<HTMLInputElement | null>;
}

const FormUiDateRangePicker = forwardRef<
  HTMLInputElement,
  FormUiDateRangePickerProps
>(
  <TName extends string = string, TValue extends string = string>(
    {
      disabled,
      width,
      height,
      id,
      startDatePickerProps,
      endDatePickerProps,
      required,
      labelText,
      labelIconName,
      isDirty,
      helperText,
      helperIconName,
      helperTextType,
      isError,
      errorText,
      errorIconName,
      successText,
      successIconName,
      wrapperClassName,
      min,
      max,
      separator = '~',
      rangeDay,
      refEnd,
      ...datePickerProps
    }: FormUiDateRangePickerProps<TName, TValue>,
    ref: Ref<HTMLInputElement>,
  ) => {
    const {
      name: nameStart,
      value: valueStart,
      onChange: onStartDatePickerChange,
    } = startDatePickerProps;
    const {
      name: nameEnd,
      value: valueEnd,
      onChange: onEndDatePickerChange,
    } = endDatePickerProps;
    const { dateType = dateTypeDefault } = datePickerProps;
    const { minStart, maxStart, minEnd, maxEnd } = useDateRangePicker({
      dateType,
      min,
      max,
      valueStart,
      valueEnd,
      rangeDay,
    });

    return (
      <FormComponent.Wrapper
        htmlFor={id || nameStart}
        labelText={labelText}
        labelIconName={labelIconName}
        helperText={helperText}
        helperIconName={helperIconName}
        helperTextType={helperTextType}
        errorText={errorText}
        errorIconName={errorIconName}
        successText={successText}
        successIconName={successIconName}
        isDirty={isDirty}
        isError={isError}
        width={width}
        required={required}
        wrapperClassName={wrapperClassName}
      >
        <FormComponent.TwoColumnWrapper
          separator={separator}
          firstElement={
            <DatePicker
              {...datePickerProps}
              id={id || nameStart}
              name={nameStart}
              width="w-full"
              height={height}
              ref={ref}
              value={valueStart}
              onChange={onStartDatePickerChange}
              disabled={disabled}
              isError={isError}
              min={minStart}
              max={maxStart}
              datePaddingType={DatePaddingTypeEnum.START}
            />
          }
          secondElement={
            <DatePicker
              {...datePickerProps}
              name={nameEnd}
              width="w-full"
              height={height}
              ref={refEnd}
              value={valueEnd}
              onChange={onEndDatePickerChange}
              disabled={disabled}
              isError={isError}
              min={minEnd}
              max={maxEnd}
              datePaddingType={DatePaddingTypeEnum.END}
            />
          }
        />
      </FormComponent.Wrapper>
    );
  },
);

FormUiDateRangePicker.displayName = 'FormUiDateRangePicker';

export default FormUiDateRangePicker as <
  TName extends string = string,
  TValue extends string = string,
>(
  props: FormUiDateRangePickerProps<TName, TValue> & {
    ref?: Ref<HTMLInputElement>;
  },
) => JSX.Element;
