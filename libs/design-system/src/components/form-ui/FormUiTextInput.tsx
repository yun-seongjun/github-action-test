import { ChangeEvent, forwardRef, Ref } from 'react';
import {
  FormComponent,
  FormComponentWrapperProps,
} from '@design-system/components/form/FormComponent';
import TextInput, {
  TextInputProps,
} from '@design-system/components/text/TextInput';
import useFormTextInput from '@design-system/hooks/form/useFormTextInput';

type ValueType = HTMLInputElement['value'];
export interface FormUiTextInputProps<TValue extends ValueType = ValueType>
  extends
    Omit<TextInputProps, 'isActiveBorderWhenHover' | 'value' | 'onChange'>,
    Omit<FormComponentWrapperProps, 'htmlFor'> {
  value?: TValue | null;
  onChange?: (
    valueNew: TValue,
    e?: React.ChangeEvent<HTMLInputElement>,
  ) => void;
}

const FormUiTextInput = forwardRef<HTMLInputElement, FormUiTextInputProps>(
  <TValue extends ValueType = ValueType>(
    {
      disabled,
      width,
      height,
      id,
      name,
      value,
      onChange,
      onClearButtonClick,
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
      labelTextClassName,
      dataQk,
      ...textInputProps
    }: FormUiTextInputProps<TValue>,
    ref: Ref<HTMLInputElement>,
  ) => {
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

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      try {
        const valueNew = refineTextInputValue(e.target.value);
        onChange?.(valueNew, e);
      } catch (error) {
        return;
      }
    };

    return (
      <FormComponent.Wrapper
        htmlFor={id || name}
        labelText={labelText}
        labelIconName={labelIconName}
        labelTextClassName={labelTextClassName}
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
        <TextInput
          {...textInputProps}
          id={id || name}
          name={name}
          inputMode={inputMode}
          width="w-full"
          height={height}
          ref={ref}
          value={value ?? ''}
          onChange={handleChange}
          onClearButtonClick={onClearButtonClick}
          disabled={disabled}
          isError={isError}
          dataQk={dataQk}
        />
      </FormComponent.Wrapper>
    );
  },
);

FormUiTextInput.displayName = 'FormUiTextInput';

export default FormUiTextInput as <TValue extends ValueType = ValueType>(
  props: FormUiTextInputProps<TValue> & {
    ref?: Ref<HTMLInputElement>;
  },
) => JSX.Element;
