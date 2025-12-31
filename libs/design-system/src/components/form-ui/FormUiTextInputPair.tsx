import { ChangeEvent, forwardRef, MutableRefObject, Ref } from 'react';
import { ComponentUtils } from '@design-system/utils';
import TextInput, {
  TextInputProps,
} from '@design-system/components/text/TextInput';
import {
  FormComponentWrapperProps,
  FormComponent,
  DisplayTypeEnum,
} from '@design-system/root/src';
import useFormTextInput from '../../hooks/form/useFormTextInput';

type ValueType = HTMLInputElement['value'];

interface FormTextInputPairProps<
  TValue extends ValueType = ValueType,
> extends Omit<FormComponentWrapperProps, 'htmlFor'> {
  textInputFirstProps: Omit<TextInputProps, 'onChange'> & {
    onChange?: (
      valueNew: TValue,
      e?: React.ChangeEvent<HTMLInputElement>,
    ) => void;
  };
  textInputSecondProps: Omit<TextInputProps, 'onChange'> & {
    onChange?: (
      valueNew: TValue,
      e?: React.ChangeEvent<HTMLInputElement>,
    ) => void;
  };
  refSecond?: MutableRefObject<HTMLInputElement | null>;
  separator?: string;
  id?: string;
  displayType: DisplayTypeEnum;
  disabled?: boolean;
  showClearButton?: boolean;
}

const FormTextInputPair = forwardRef<HTMLInputElement, FormTextInputPairProps>(
  <TValue extends ValueType = ValueType>(
    {
      disabled,
      width,
      height,
      id,
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
      displayType,
      showClearButton,
      textInputFirstProps,
      textInputSecondProps,
      refSecond,
      separator,
      errorText,
      isDirty,
      isError,
      dataQk,
    }: FormTextInputPairProps<TValue>,
    ref: Ref<HTMLInputElement>,
  ) => {
    const {
      onChange,
      inputType = 'text',
      inputMode,
      maxLength,
      min,
      max,
    } = textInputFirstProps;
    const { refineTextInputValue } = useFormTextInput({
      inputType,
      max,
      min,
      maxLength,
    });

    const {
      onChange: onSecondInputChange,
      inputType: secondInputType = 'text',
      maxLength: secondInputMaxLength,
      min: secondInputMin,
      max: secondInputMax,
    } = textInputSecondProps;
    const { refineTextInputValue: refineSecondTextInputValue } =
      useFormTextInput({
        inputType: secondInputType,
        max: secondInputMax,
        min: secondInputMin,
        maxLength: secondInputMaxLength,
      });

    const handleFirstTextInputChange = (e: ChangeEvent<HTMLInputElement>) => {
      try {
        const valueNew = refineTextInputValue(e.target.value);
        onChange?.(valueNew, e);
      } catch (error) {
        return;
      }
    };
    const handleSecondTextInputChange = (e: ChangeEvent<HTMLInputElement>) => {
      try {
        const valueNew = refineSecondTextInputValue(e.target.value);
        onSecondInputChange?.(valueNew, e);
      } catch (error) {
        return;
      }
    };

    return (
      <FormComponent.Wrapper
        htmlFor={id}
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
        height={height}
        required={!!required}
        wrapperClassName={wrapperClassName}
      >
        <FormComponent.MultiColumnWrapper>
          <TextInput
            {...textInputFirstProps}
            inputWrapperClassName={ComponentUtils.cn(
              textInputFirstProps?.inputWrapperClassName,
              'flex-1',
            )}
            ref={ref}
            id={id}
            required={!!required}
            disabled={disabled}
            displayType={displayType}
            showClearButton={showClearButton}
            onChange={handleFirstTextInputChange}
            isError={isError}
            dataQk={`${dataQk}-first`}
          />
          {separator && (
            <span className="font-size-16 font-medium">{separator}</span>
          )}
          <TextInput
            {...textInputSecondProps}
            inputWrapperClassName={ComponentUtils.cn(
              textInputSecondProps?.inputWrapperClassName,
              'flex-1',
            )}
            ref={refSecond}
            required={!!required}
            disabled={disabled}
            displayType={displayType}
            showClearButton={showClearButton}
            onChange={handleSecondTextInputChange}
            isError={isError}
            dataQk={`${dataQk}-second`}
          />
        </FormComponent.MultiColumnWrapper>
      </FormComponent.Wrapper>
    );
  },
);

FormTextInputPair.displayName = 'FormTextInputPair';

export default FormTextInputPair as <TValue extends ValueType = ValueType>(
  props: FormTextInputPairProps<TValue> & {
    ref?: Ref<HTMLInputElement>;
  },
) => JSX.Element;
