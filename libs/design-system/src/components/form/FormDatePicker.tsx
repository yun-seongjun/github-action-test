import { ChangeEvent, forwardRef, Ref } from 'react';
import { Controller, FieldValues, Path, PathValue } from 'react-hook-form';
import { FormComponentBaseProps } from '@design-system/components/form/Form';
import FormUiDatePicker, {
  FormUiDatePickerProps,
} from '@design-system/components/form-ui/FormUiDatePicker';
import { ComponentUtils } from '@design-system/utils/componentUtils';
import { DateFormat } from '@design-system/utils/dateUtils';

interface FormDatePickerProps<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends Path<TFieldValues> = Path<TFieldValues>,
>
  extends
    Omit<
      FormUiDatePickerProps,
      'name' | 'isError' | 'isActiveBorderWhenHover' | 'errorText' | 'required'
    >,
    FormComponentBaseProps<TFieldValues, TFieldName> {
  dateFormatForSetForm?: DateFormat;
}

const FormDatePicker = forwardRef<HTMLInputElement, FormDatePickerProps>(
  <
    TFieldValues extends FieldValues = FieldValues,
    TFieldName extends Path<TFieldValues> = Path<TFieldValues>,
  >(
    {
      name,
      onChange,
      formControl,
      required,
      validate,
      ...datePickerProps
    }: FormDatePickerProps<TFieldValues, TFieldName>,
    ref: Ref<HTMLInputElement>,
  ) => {
    const { control, setValue, isDirtyField } = formControl;

    return (
      <Controller<TFieldValues, TFieldName>
        name={name}
        control={control}
        rules={{ required, validate }}
        render={({ field, fieldState }) => {
          const { value, ref: refCallback } = field;
          const { error } = fieldState;
          const errorText = error?.message;
          const isDirty = isDirtyField(name);

          const handleChange = (
            valueNew: PathValue<TFieldValues, TFieldName>,
            e?: ChangeEvent<HTMLInputElement>,
          ) => {
            setValue(name, valueNew);
            onChange?.(valueNew, e);
          };

          return (
            <FormUiDatePicker
              {...datePickerProps}
              name={name}
              ref={(r) => ComponentUtils.setRefs(r, ref, refCallback)}
              value={value}
              required={!!required}
              isError={!!error}
              errorText={errorText}
              isDirty={isDirty}
              onChange={handleChange}
            />
          );
        }}
      />
    );
  },
);

FormDatePicker.displayName = 'FormDatePicker';

export default FormDatePicker as <
  TFieldValues extends FieldValues,
  TFieldName extends Path<TFieldValues>,
>(
  props: FormDatePickerProps<TFieldValues, TFieldName> & {
    ref?: Ref<HTMLInputElement>;
  },
) => JSX.Element;
