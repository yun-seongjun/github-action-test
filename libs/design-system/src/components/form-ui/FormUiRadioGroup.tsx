import { ChangeEvent, forwardRef, InputHTMLAttributes, Ref } from 'react';
import {
  FormComponent,
  FormComponentWrapperProps,
  MultiColumnWrapperProps,
} from '@design-system/components/form/FormComponent';
import RadioButton, {
  RadioButtonProps,
} from '@design-system/components/radio-button/RadioButton';
import useOption, {
  OptionInterface,
  OptionSelectEventType,
} from '@design-system/hooks/useOption';
import { ComponentUtils } from '@design-system/utils/componentUtils';

type ValueType = InputHTMLAttributes<HTMLInputElement>['value'];

export interface FormUiRadioGroupProps<
  TData = unknown,
  TValue extends ValueType = ValueType,
  TOptionInterface extends OptionInterface<TValue, TData> = OptionInterface<
    TValue,
    TData
  >,
>
  extends
    Omit<RadioButtonProps, 'onChange' | 'value' | 'children'>,
    Omit<FormComponentWrapperProps, 'htmlFor'>,
    Pick<MultiColumnWrapperProps, 'columnDirection' | 'gap'> {
  value?: TValue;
  options: TOptionInterface[];
  onOptionSelect?: OptionSelectEventType<TValue, TData, HTMLInputElement>;
  onChange?: (
    value: TValue,
    data: TData | undefined,
    e?: ChangeEvent<HTMLInputElement>,
  ) => void;
}

const FormUiRadioGroup = forwardRef<HTMLInputElement, FormUiRadioGroupProps>(
  <
    TData = unknown,
    TValue extends ValueType = ValueType,
    TOptionInterface extends OptionInterface<TValue, TData> = OptionInterface<
      TValue,
      TData
    >,
  >(
    {
      disabled,
      width,
      id,
      name,
      value,
      onChange,
      onOptionSelect,
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
      options,
      onClick,
      dataQk,
      columnDirection,
      gap,
      ...radioProps
    }: FormUiRadioGroupProps<TData, TValue, TOptionInterface>,
    ref: Ref<HTMLInputElement>,
  ) => {
    const { getOption } = useOption<TValue, TData, TOptionInterface>({
      options,
    });
    const handleOptionClick = (
      option: TOptionInterface,
      e: React.MouseEvent<HTMLInputElement>,
    ) => {
      onClick?.(e);
      onOptionSelect?.(option, e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const option = getOption(e.target.value as TValue);
      if (!option) {
        console.error(
          'FormRadioGroup, handleChange, option must be not undefined. e',
          e,
        );
        return;
      }

      onChange?.(option.value, option.data, e);
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
        <FormComponent.MultiColumnWrapper
          columnDirection={columnDirection}
          gap={gap}
        >
          {options.map((option, index) => {
            const key = String(option.key || option.value);

            return (
              <RadioButton
                {...radioProps}
                key={key}
                ref={(r) => {
                  index === 0 && ComponentUtils.setRefs(r, ref);
                }}
                name={key}
                disabled={disabled}
                value={option.value}
                checked={option.value === value}
                onChange={handleChange}
                onClick={(e) => {
                  handleOptionClick(option, e);
                }}
                dataQk={`${dataQk}`}
              >
                {typeof option.content === 'string' ? option.content : ''}
              </RadioButton>
            );
          })}
        </FormComponent.MultiColumnWrapper>
      </FormComponent.Wrapper>
    );
  },
);

FormUiRadioGroup.displayName = 'FormUiRadioGroup';

export default FormUiRadioGroup as <
  TData = unknown,
  TValue extends ValueType = ValueType,
  TOptionInterface extends OptionInterface<TValue, TData> = OptionInterface<
    TValue,
    TData
  >,
>(
  props: FormUiRadioGroupProps<TData, TValue, TOptionInterface> & {
    ref?: Ref<HTMLInputElement>;
  },
) => JSX.Element;
