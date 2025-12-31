import { forwardRef, Ref } from 'react';
import { Controller, FieldValues, Path, PathValue } from 'react-hook-form';
import {
  FormComponentBaseProps,
  FormComponentChangeEventType,
} from '@design-system/components/form/Form';
import TextInputSeparated, {
  TextInputSeparatedProps,
} from '@design-system/components/text/TextInputSeparated';
import { ComponentUtils } from '@design-system/utils/componentUtils';

interface FormTextInputSeparatedProps<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends Path<TFieldValues> = Path<TFieldValues>,
>
  extends
    Omit<
      TextInputSeparatedProps,
      | 'name'
      | 'isError'
      | 'isActiveBorderWhenHover'
      | 'value'
      | 'onClearButtonClick'
      | 'onChange'
      | 'inputType'
      | 'maxLength'
      | 'required'
    >,
    FormComponentBaseProps<TFieldValues, TFieldName> {
  onChange?: FormComponentChangeEventType<
    TFieldValues,
    TFieldName,
    HTMLInputElement
  >;
}

const FormTextInputSeparated = forwardRef<
  HTMLInputElement,
  FormTextInputSeparatedProps
>(
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
      ...textInputSeparatedProps
    }: FormTextInputSeparatedProps<TFieldValues, TFieldName>,
    ref: Ref<HTMLInputElement>,
  ) => {
    const { control, setValue, isDirtyField } = formControl;

    return (
      <Controller<TFieldValues, TFieldName>
        name={name}
        control={control}
        rules={{ required, validate }}
        render={({ field, fieldState }) => {
          const { value = '', ref: refCallback } = field;
          const { error } = fieldState;
          const errorText = error?.message;
          const isDirty = isDirtyField(name);

          const handleChange = (
            value: string | unknown,
            e?: React.ChangeEvent<HTMLInputElement>,
          ) => {
            const valueCasting = (value ?? null) as PathValue<
              TFieldValues,
              TFieldName
            >;
            setValue(name, valueCasting);
            onChange?.(valueCasting, e);
          };

          return (
            <TextInputSeparated
              {...textInputSeparatedProps}
              name={name}
              ref={(r) => ComponentUtils.setRefs(r, ref, refCallback)}
              value={value}
              required={!!required}
              errorText={errorText}
              isError={!!error}
              isDirty={isDirty}
              onChange={handleChange}
            />
          );
        }}
      />
    );
  },
);

FormTextInputSeparated.displayName = 'FormTextInputSeparated';

export default FormTextInputSeparated as <
  TFieldValues extends FieldValues,
  TFieldName extends Path<TFieldValues>,
>(
  props: FormTextInputSeparatedProps<TFieldValues, TFieldName> & {
    ref?: Ref<HTMLInputElement>;
  },
) => JSX.Element;
