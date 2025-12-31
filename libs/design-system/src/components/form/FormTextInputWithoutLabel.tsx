import { ChangeEvent, forwardRef, Ref } from 'react';
import { Controller, FieldValues, Path, PathValue } from 'react-hook-form';
import {
  FormComponentBaseProps,
  FormComponentChangeEventType,
} from '@design-system/components/form/Form';
import TextInput, {
  TextInputProps,
} from '@design-system/components/text/TextInput';
import useFormTextInput from '@design-system/hooks/form/useFormTextInput';
import { ComponentUtils } from '@design-system/utils/componentUtils';

export interface FormTextInputWithoutLabelProps<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends Path<TFieldValues> = Path<TFieldValues>,
>
  extends
    Omit<
      TextInputProps,
      | 'name'
      | 'isError'
      | 'isActiveBorderWhenHover'
      | 'value'
      | 'onClearButtonClick'
      | 'onChange'
      | 'required'
    >,
    FormComponentBaseProps<TFieldValues, TFieldName> {
  onChange?: FormComponentChangeEventType<
    TFieldValues,
    TFieldName,
    HTMLInputElement
  >;
}

const FormTextInputWithoutLabel = forwardRef<
  HTMLInputElement,
  FormTextInputWithoutLabelProps
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
      name,
      onChange,
      formControl,
      required,
      validate,
      dataQk,
      ...textInputProps
    }: FormTextInputWithoutLabelProps<TFieldValues, TFieldName>,
    ref: Ref<HTMLInputElement>,
  ) => {
    const { control, setValue, clearField } = formControl;
    const {
      inputType = 'text',
      inputMode,
      maxLength,
      min,
      max,
    } = textInputProps;
    const { refineTextInputValue } = useFormTextInput({
      inputType,
      max,
      min,
      maxLength,
    });

    return (
      <Controller<TFieldValues, TFieldName>
        name={name}
        control={control}
        rules={{ required, validate }}
        render={({ field, fieldState }) => {
          const { value = '', ref: refCallback } = field;
          const { error } = fieldState;

          const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
            try {
              const valueNew = refineTextInputValue(e.target.value);
              setValue(name, valueNew, { shouldDirty: true });
              onChange?.(valueNew, e);
            } catch (error) {
              return;
            }
          };

          const handleClearButtonClick = () => {
            clearField(name);
            onChange?.(null as PathValue<TFieldValues, TFieldName>);
          };

          return (
            <TextInput
              {...textInputProps}
              id={id || name}
              name={name}
              inputMode={inputMode}
              width={width}
              height={height}
              ref={(r) => ComponentUtils.setRefs(r, ref, refCallback)}
              value={value}
              onChange={handleChange}
              onClearButtonClick={handleClearButtonClick}
              disabled={disabled}
              isError={!!error}
              dataQk={dataQk}
            />
          );
        }}
      />
    );
  },
);

FormTextInputWithoutLabel.displayName = 'FormTextInputWithoutLabel';

export default FormTextInputWithoutLabel as <
  TFieldValues extends FieldValues,
  TFieldName extends Path<TFieldValues>,
>(
  props: FormTextInputWithoutLabelProps<TFieldValues, TFieldName> & {
    ref?: Ref<HTMLInputElement>;
  },
) => JSX.Element;
