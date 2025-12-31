import { ChangeEvent, forwardRef, MutableRefObject, Ref } from 'react';
import { Controller, FieldValues, get, Path, PathValue } from 'react-hook-form';
import DatePicker, {
  dateTypeDefault,
} from '@design-system/components/DatePicker';
import { FormComponentBaseProps } from '@design-system/components/form/Form';
import { FormComponent } from '@design-system/components/form/FormComponent';
import {
  FormUiDateRangeInnerPickerProps,
  FormUiDateRangePickerProps,
} from '@design-system/components/form-ui/FormUiDateRangePicker';
import useDateRangePicker from '@design-system/hooks/form/useDateRangePicker';
import { ComponentUtils } from '@design-system/utils/componentUtils';
import {
  DatePaddingTypeEnum,
  defaultUtcOffsetMinute,
} from '@design-system/utils/dateUtils';

interface FormDateRangeInnerPickerProps<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends Path<TFieldValues> = Path<TFieldValues>,
> extends Omit<
  FormUiDateRangeInnerPickerProps<
    TFieldName,
    PathValue<TFieldValues, TFieldName>
  >,
  'name' | 'value'
> {
  validate?: FormComponentBaseProps<TFieldValues, TFieldName>['validate'];
  onClick?: () => void;
}

interface FormDateRangePickerProps<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends Path<TFieldValues> = Path<TFieldValues>,
>
  extends
    Omit<
      FormUiDateRangePickerProps<
        TFieldName,
        PathValue<TFieldValues, TFieldName>
      >,
      | 'isError'
      | 'isActiveBorderWhenHover'
      | 'value'
      | 'onChange'
      | 'startDatePickerProps'
      | 'endDatePickerProps'
      | 'errorText'
      | 'required'
    >,
    Omit<
      FormComponentBaseProps<TFieldValues, TFieldName>,
      'name' | 'validate'
    > {
  names: [TFieldName, TFieldName];
  startDatePickerProps?: FormDateRangeInnerPickerProps<
    TFieldValues,
    TFieldName
  >;
  endDatePickerProps?: FormDateRangeInnerPickerProps<TFieldValues, TFieldName>;
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

const FormDateRangePicker = forwardRef<
  HTMLInputElement,
  FormDateRangePickerProps
>(
  <
    TFieldValues extends FieldValues = FieldValues,
    TFieldName extends Path<TFieldValues> = Path<TFieldValues>,
  >(
    {
      disabled,
      width,
      height,
      id,
      names,
      startDatePickerProps,
      endDatePickerProps,
      formControl,
      required,
      labelText,
      labelIconName,
      helperText,
      helperIconName,
      helperTextType,
      errorIconName,
      successText,
      successIconName,
      wrapperClassName,
      min,
      max,
      separator = '~',
      rangeDay,
      refEnd,
      dataQk,
      onClick,
      ...datePickerProps
    }: FormDateRangePickerProps<TFieldValues, TFieldName>,
    ref: Ref<HTMLInputElement>,
  ) => {
    const [nameStart, nameEnd] = names;
    const {
      validate: validateStart,
      onChange: onStartChange,
      onClick: onStartClick,
    } = startDatePickerProps || {};
    const {
      validate: validateEnd,
      onChange: onEndChange,
      onClick: onEndClick,
    } = endDatePickerProps || {};
    const {
      control,
      setValue,
      watch,
      isDirtyField,
      formState: { errors },
    } = formControl;
    const {
      dateType = dateTypeDefault,
      utcOffsetMinute = defaultUtcOffsetMinute,
    } = datePickerProps;
    const errorStart = get(errors, nameStart);
    const errorEnd = get(errors, nameEnd);
    const errorText = errorStart?.message || errorEnd?.message;
    const isError = !!errorStart || !!errorEnd;
    const isDirty = isDirtyField(nameStart) || isDirtyField(nameEnd);
    const valueStart = watch(nameStart);
    const valueEnd = watch(nameEnd);
    const { minStart, maxStart, minEnd, maxEnd } = useDateRangePicker({
      dateType,
      min,
      max,
      valueStart,
      valueEnd,
      rangeDay,
      utcOffsetMinute,
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
        required={!!required}
        wrapperClassName={wrapperClassName}
      >
        <FormComponent.TwoColumnWrapper
          separator={separator}
          firstElement={
            <Controller<TFieldValues, TFieldName>
              name={nameStart}
              control={control}
              rules={{ required, validate: validateStart }}
              render={({ field, fieldState }) => {
                const { value, ref: refCallback } = field;
                const { error } = fieldState;

                const handleChange = (
                  valueNew: PathValue<TFieldValues, TFieldName>,
                  e?: ChangeEvent<HTMLInputElement>,
                ) => {
                  setValue(nameStart, valueNew);
                  onStartChange?.(valueNew, e);
                };

                const handleClick = () => {
                  onStartClick?.();
                };

                return (
                  <DatePicker
                    {...datePickerProps}
                    inputWrapperClassName="flex-1"
                    id={id || nameStart}
                    name={nameStart}
                    height={height}
                    width="w-auto"
                    ref={(r) => ComponentUtils.setRefs(r, ref, refCallback)}
                    value={value}
                    onChange={handleChange}
                    onClick={handleClick}
                    disabled={disabled}
                    isError={!!error}
                    min={minStart}
                    max={maxStart}
                    datePaddingType={DatePaddingTypeEnum.START}
                    utcOffsetMinute={utcOffsetMinute}
                    dataQk={`${dataQk}-start`}
                  />
                );
              }}
            />
          }
          secondElement={
            <Controller<TFieldValues, TFieldName>
              name={nameEnd}
              control={control}
              rules={{ required, validate: validateEnd }}
              render={({ field, fieldState }) => {
                const { value, ref: refCallback } = field;
                const { error } = fieldState;

                const handleChange = (
                  valueNew: PathValue<TFieldValues, TFieldName>,
                  e?: ChangeEvent<HTMLInputElement>,
                ) => {
                  setValue(nameEnd, valueNew);
                  onEndChange?.(valueNew, e);
                };

                const handleClick = () => {
                  onEndClick?.();
                };

                return (
                  <DatePicker
                    {...datePickerProps}
                    inputWrapperClassName="flex-1"
                    height={height}
                    width="w-auto"
                    ref={(r) => ComponentUtils.setRefs(r, refEnd, refCallback)}
                    value={value}
                    onChange={handleChange}
                    onClick={handleClick}
                    disabled={disabled}
                    isError={!!error}
                    min={minEnd}
                    max={maxEnd}
                    datePaddingType={DatePaddingTypeEnum.END}
                    utcOffsetMinute={utcOffsetMinute}
                    dataQk={`${dataQk}-end`}
                  />
                );
              }}
            />
          }
        />
      </FormComponent.Wrapper>
    );
  },
);

FormDateRangePicker.displayName = 'FormDateRangePicker';

export default FormDateRangePicker as <
  TFieldValues extends FieldValues,
  TFieldName extends Path<TFieldValues>,
>(
  props: FormDateRangePickerProps<TFieldValues, TFieldName> & {
    ref?: Ref<HTMLInputElement>;
  },
) => JSX.Element;
