import { forwardRef, Ref } from 'react';
import {
  FormComponent,
  FormComponentWrapperProps,
} from '@design-system/components/form/FormComponent';
import Select, { SelectProps } from '@design-system/components/select/Select';
import { SelectOptionInterface } from '@design-system/components/select/SelectCommon';
import {
  OptionInterface,
  SelectValueType,
} from '@design-system/hooks/useOption';

export interface FormUiSelectProps<
  TValue extends SelectValueType = SelectValueType,
  TData = unknown,
  TSelectOptionInterface extends OptionInterface<TValue, TData> =
    SelectOptionInterface<TValue, TData>,
>
  extends
    Omit<
      SelectProps<TValue, TData, TSelectOptionInterface>,
      'isActiveBorderWhenHover'
    >,
    Omit<FormComponentWrapperProps, 'htmlFor'> {}

const FormUiSelect = forwardRef<HTMLSelectElement, FormUiSelectProps>(
  <
    TValue extends SelectValueType = SelectValueType,
    TData = unknown,
    TSelectOptionInterface extends OptionInterface<TValue, TData> =
      SelectOptionInterface<TValue, TData>,
  >(
    {
      disabled,
      width,
      height,
      id,
      name,
      value,
      onChange,
      onOptionSelect,
      required,
      labelText,
      labelTextClassName,
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
      ...selectProps
    }: FormUiSelectProps<TValue, TData, TSelectOptionInterface>,
    ref: Ref<HTMLSelectElement>,
  ) => {
    const handleOnChange = (
      value: TValue | undefined,
      option: TSelectOptionInterface | undefined,
    ) => {
      onChange?.(value, option);
    };

    return (
      <FormComponent.Wrapper
        htmlFor={id || name}
        labelText={labelText}
        labelTextClassName={labelTextClassName}
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
        <Select<TValue, TData, TSelectOptionInterface>
          {...selectProps}
          id={id || name}
          name={name}
          width="w-full"
          height={height}
          ref={ref}
          value={value}
          onOptionSelect={onOptionSelect}
          onChange={handleOnChange}
          disabled={disabled}
          isError={isError}
          dataQk={dataQk}
        />
      </FormComponent.Wrapper>
    );
  },
);

FormUiSelect.displayName = 'FormUiSelect';

export default FormUiSelect as <
  TValue extends SelectValueType = SelectValueType,
  TData = unknown,
  TSelectOptionInterface extends OptionInterface<TValue, TData> =
    SelectOptionInterface<TValue, TData>,
>(
  props: FormUiSelectProps<TValue, TData, TSelectOptionInterface> & {
    ref?: Ref<HTMLSelectElement>;
  },
) => JSX.Element;
