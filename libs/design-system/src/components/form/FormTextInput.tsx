import { forwardRef, Ref } from 'react';
import { Controller, FieldValues, Path, PathValue } from 'react-hook-form';
import {
  FormComponentBaseProps,
  FormComponentChangeEventType,
} from '@design-system/components/form/Form';
import FormUiTextInput, {
  FormUiTextInputProps,
} from '@design-system/components/form-ui/FormUiTextInput';
import { ComponentUtils } from '@design-system/utils/componentUtils';

export interface FormTextInputProps<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends Path<TFieldValues> = Path<TFieldValues>,
>
  extends
    Omit<
      FormUiTextInputProps<PathValue<TFieldValues, TFieldName>>,
      | 'name'
      | 'isError'
      | 'value'
      | 'onClearButtonClick'
      | 'onChange'
      | 'required'
      | 'errorText'
      | 'isDirty'
    >,
    FormComponentBaseProps<TFieldValues, TFieldName> {
  onChange?: FormComponentChangeEventType<
    TFieldValues,
    TFieldName,
    HTMLInputElement
  >;
}

const FormTextInput = forwardRef<HTMLInputElement, FormTextInputProps>(
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
      ...textInputProps
    }: FormTextInputProps<TFieldValues, TFieldName>,
    ref: Ref<HTMLInputElement>,
  ) => {
    const { control, setValue, clearField, isDirtyField } = formControl;

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
            e?: React.ChangeEvent<HTMLInputElement>,
          ) => {
            setValue(name, valueNew, { shouldDirty: true });
            onChange?.(valueNew, e);
          };

          const handleClearButtonClick = () => {
            clearField(name);
            onChange?.(null as PathValue<TFieldValues, TFieldName>);
          };

          return (
            <FormUiTextInput
              {...textInputProps}
              name={name}
              ref={(r) => ComponentUtils.setRefs(r, ref, refCallback)}
              errorText={errorText}
              isDirty={isDirty}
              isError={!!error}
              required={!!required}
              value={value}
              onChange={handleChange}
              onClearButtonClick={handleClearButtonClick}
            />
          );
        }}
      />
    );
  },
);

FormTextInput.displayName = 'FormTextInput';

export default FormTextInput as <
  TFieldValues extends FieldValues,
  TFieldName extends Path<TFieldValues>,
>(
  props: FormTextInputProps<TFieldValues, TFieldName> & {
    ref?: Ref<HTMLInputElement>;
  },
) => JSX.Element;
