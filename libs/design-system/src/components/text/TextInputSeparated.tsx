import { ChangeEvent, forwardRef, Ref } from 'react';
import {
  FormComponent,
  FormComponentWrapperProps,
} from '@design-system/components/form/FormComponent';
import TextInput, {
  TextInputProps,
} from '@design-system/components/text/TextInput';
import { ComponentUtils } from '@design-system/utils/componentUtils';

const splitFirstSeparator = (
  value: string | undefined | null,
  separator: string,
): [string, string] => {
  if (!value) {
    return ['', ''];
  }
  const index = value.indexOf(separator);
  if (index < 0) {
    return [value, ''];
  }
  return [value.slice(0, index), value.slice(index + 1)];
};

export interface TextInputSeparatedProps
  extends
    Omit<
      TextInputProps,
      | 'isActiveBorderWhenHover'
      | 'onClearButtonClick'
      | 'onChange'
      | 'inputType'
      | 'maxLength'
      | 'value'
    >,
    Omit<FormComponentWrapperProps, 'htmlFor'> {
  value?: string;
  separator?: string;
  maxLengthFirstInput?: TextInputProps['maxLength'];
  maxLengthSecondInput?: TextInputProps['maxLength'];
  inputType?: Extract<TextInputProps['inputType'], 'text' | 'tel'>;
  onChange?: (
    value: string | undefined,
    e?: React.ChangeEvent<HTMLInputElement>,
  ) => void;
}

const TextInputSeparated = forwardRef<
  HTMLInputElement,
  TextInputSeparatedProps
>(
  (
    {
      maxLengthFirstInput,
      maxLengthSecondInput,
      disabled,
      width,
      height,
      id,
      name,
      value = '',
      onChange,
      isDirty,
      required,
      labelText,
      labelIconName,
      helperText,
      helperIconName,
      helperTextType,
      isError,
      errorText,
      errorIconName,
      successText,
      successIconName,
      wrapperClassName,
      separator = '-',
      dataQk,
      ...textInputProps
    }: TextInputSeparatedProps,
    ref: Ref<HTMLInputElement>,
  ) => {
    const [valueFirst, valueSecond] = splitFirstSeparator(value, separator);

    const getNewValue = (first: string, second: string) => {
      return first || second ? `${first}${separator}${second}` : undefined;
    };

    const handleFirstChange = (e: ChangeEvent<HTMLInputElement>) => {
      const valueNew = getNewValue(e.target.value, valueSecond);
      onChange?.(valueNew, e);
    };
    const handleSecondChange = (e: ChangeEvent<HTMLInputElement>) => {
      const valueNew = getNewValue(valueFirst, e.target.value);
      onChange?.(valueNew, e);
    };

    const handleFirstClearButtonClick = () => {
      const valueNew = getNewValue('', valueSecond);
      onChange?.(valueNew);
    };

    const handleSecondClearButtonClick = () => {
      const valueNew = getNewValue(valueFirst, '');
      onChange?.(valueNew);
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
        dataQk={dataQk}
      >
        <FormComponent.TwoColumnWrapper
          separator={separator}
          firstElement={
            <TextInput
              {...textInputProps}
              id={id || name}
              name={name}
              width="w-full"
              height={height}
              ref={(r) => ComponentUtils.setRefs(r, ref)}
              value={valueFirst}
              maxLength={maxLengthFirstInput}
              onChange={handleFirstChange}
              onClearButtonClick={handleFirstClearButtonClick}
              disabled={disabled}
              isError={isError}
            />
          }
          secondElement={
            <TextInput
              {...textInputProps}
              id={id || name}
              name={name}
              width="w-full"
              height={height}
              value={valueSecond}
              maxLength={maxLengthSecondInput}
              onChange={handleSecondChange}
              onClearButtonClick={handleSecondClearButtonClick}
              disabled={disabled}
              isError={isError}
            />
          }
        />
      </FormComponent.Wrapper>
    );
  },
);

TextInputSeparated.displayName = 'TextInputSeparated';

export default TextInputSeparated;
