import { forwardRef, Ref } from 'react';
import DatePicker, {
  DatePickerProps,
  DatePickerValueType,
} from '@design-system/components/DatePicker';
import {
  FormComponent,
  FormComponentWrapperProps,
} from '@design-system/components/form/FormComponent';

export interface FormUiDatePickerProps<
  TValue extends DatePickerValueType = DatePickerValueType,
>
  extends
    Omit<DatePickerProps<TValue>, 'isActiveBorderWhenHover'>,
    Omit<FormComponentWrapperProps, 'htmlFor'> {}

const FormUiDatePicker = forwardRef<HTMLInputElement, FormUiDatePickerProps>(
  <TValue extends DatePickerValueType = DatePickerValueType>(
    {
      disabled,
      width,
      height,
      id,
      name,
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
      dataQk,
      ...datePickerProps
    }: FormUiDatePickerProps<TValue>,
    ref: Ref<HTMLInputElement>,
  ) => {
    return (
      <FormComponent.Wrapper
        htmlFor={id || name}
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
        dataQk={dataQk}
      >
        <DatePicker
          {...datePickerProps}
          id={id || name}
          name={name}
          width="w-full"
          height={height}
          ref={ref}
          disabled={disabled}
          isError={isError}
          dataQk={dataQk}
        />
      </FormComponent.Wrapper>
    );
  },
);

FormUiDatePicker.displayName = 'FormUiDatePicker';

export default FormUiDatePicker as <
  TValue extends DatePickerValueType = DatePickerValueType,
>(
  props: FormUiDatePickerProps<TValue> & {
    ref?: Ref<HTMLInputElement>;
  },
) => JSX.Element;
