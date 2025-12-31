import { ChangeEvent, forwardRef, InputHTMLAttributes, Ref } from 'react';
import CheckBox, {
  CheckBoxProps,
} from '@design-system/components/checkbox/CheckBox';
import {
  FormComponent,
  FormComponentWrapperProps,
} from '@design-system/components/form/FormComponent';
import { OptionInterface } from '@design-system/hooks/useOption';
import { DataQuery } from '@design-system/types/common.type';

type ValueType = InputHTMLAttributes<HTMLInputElement>['value'];

export interface CheckBoxOptionInterface<
  TValue extends ValueType = ValueType,
  TData = unknown,
> extends OptionInterface<TValue, TData> {
  valueUnchecked?: TValue;
}

export interface FormUiCheckBoxProps<
  TData = unknown,
  TValue extends ValueType = ValueType,
>
  extends
    Omit<CheckBoxProps, 'onChange' | 'children'>,
    Omit<FormComponentWrapperProps, 'htmlFor'>,
    DataQuery {
  option: CheckBoxOptionInterface<TValue, TData>;
  onOptionSelect?: (
    option: CheckBoxOptionInterface<TValue, TData>,
    e: React.MouseEvent<HTMLInputElement>,
  ) => void;
  onChange?: (
    value: TValue,
    extraData: TData | undefined,
    e?: ChangeEvent<HTMLInputElement>,
  ) => void;
}

const FormUiCheckBox = forwardRef<HTMLInputElement, FormUiCheckBoxProps>(
  <TData = unknown, TValue extends ValueType = ValueType>(
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
      option,
      onClick,
      dataQk,
      ...checkBoxProps
    }: FormUiCheckBoxProps<TData, TValue>,
    ref: Ref<HTMLInputElement>,
  ) => {
    const handleOptionClick = (
      optionClicked: CheckBoxOptionInterface<TValue, TData>,
      e: React.MouseEvent<HTMLInputElement>,
    ) => {
      onClick?.(e);
      onOptionSelect?.(optionClicked, e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { checked } = e.target;
      const valuesNew = (
        checked ? option.value : (option.valueUnchecked ?? null)
      ) as TValue;

      onChange?.(valuesNew, option.data, e);
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
        <FormComponent.MultiColumnWrapper>
          <CheckBox
            {...checkBoxProps}
            id={id || name}
            name={name}
            ref={ref}
            disabled={disabled}
            value={value ?? ''}
            checked={value === option.value}
            onChange={handleChange}
            onClick={(e) => handleOptionClick(option, e)}
            dataQk={dataQk}
          >
            {option.content}
          </CheckBox>
        </FormComponent.MultiColumnWrapper>
      </FormComponent.Wrapper>
    );
  },
);

FormUiCheckBox.displayName = 'FormUiCheckBox';

export default FormUiCheckBox as <
  TData = unknown,
  TValue extends ValueType = ValueType,
>(
  props: FormUiCheckBoxProps<TData, TValue> & {
    ref?: Ref<HTMLInputElement>;
  },
) => JSX.Element;
