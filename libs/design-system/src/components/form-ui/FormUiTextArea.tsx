import { ChangeEvent, forwardRef, Ref } from 'react';
import TextArea, {
  TextAreaProps,
} from '@design-system/components/text/TextArea';
import {
  FormComponent,
  FormComponentWrapperProps,
} from '@design-system/components/form/FormComponent';

type ValueType = HTMLTextAreaElement['value'];

export interface FormUiTextAreaProps<TValue extends ValueType = ValueType>
  extends
    Omit<TextAreaProps, 'isActiveBorderWhenHover' | 'value' | 'onChange'>,
    Omit<FormComponentWrapperProps, 'htmlFor'> {
  value?: TValue | null;
  onChange?: (
    valueNew: TValue,
    e?: React.ChangeEvent<HTMLTextAreaElement>,
  ) => void;
}

const FormUiTextArea = forwardRef<HTMLTextAreaElement, FormUiTextAreaProps>(
  <TValue extends ValueType = ValueType>(
    {
      disabled,
      width,
      height,
      id,
      name,
      value,
      onChange,
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
      ...textAreaProps
    }: FormUiTextAreaProps<TValue>,
    ref: Ref<HTMLTextAreaElement>,
  ) => {
    const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
      const valueNew = e.target.value as TValue;
      onChange?.(valueNew, e);
    };

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
      >
        <TextArea
          {...textAreaProps}
          id={id || name}
          name={name}
          width="w-full"
          height={height}
          ref={ref}
          value={value ?? ''}
          onChange={handleChange}
          disabled={disabled}
          isError={isError}
          dataQk={dataQk}
        />
      </FormComponent.Wrapper>
    );
  },
);

FormUiTextArea.displayName = 'FormUiTextArea';

export default FormUiTextArea as <TValue extends ValueType = ValueType>(
  props: FormUiTextAreaProps<TValue> & {
    ref?: Ref<HTMLTextAreaElement>;
  },
) => JSX.Element;
