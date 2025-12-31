import { OptionInterface, ValueType } from '@design-system/hooks';
import {
  AutocompleteProps,
  FormComponentWrapperProps,
  SelectOptionInterface,
  FormComponent,
} from '@design-system/root/src';
import { forwardRef, Ref } from 'react';
import AutoComplete from '@design-system/components/select/Autocomplete';

export interface FormUiAutocompleteProps<
  TValue extends ValueType = ValueType,
  TData = unknown,
  TSelectOptionInterface extends OptionInterface<TValue, TData> =
    SelectOptionInterface<TValue, TData>,
>
  extends
    AutocompleteProps<TValue, TData, TSelectOptionInterface>,
    Omit<FormComponentWrapperProps, 'htmlFor'> {}

const FormUiAutocomplete = forwardRef<
  HTMLSelectElement,
  FormUiAutocompleteProps
>(
  <
    TValue extends ValueType = ValueType,
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
      onClearButtonClick,
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
      ...autoCompleteProps
    }: FormUiAutocompleteProps<TValue, TData, TSelectOptionInterface>,
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
        height={height}
        required={!!required}
        wrapperClassName={wrapperClassName}
        dataQk={dataQk}
      >
        <AutoComplete<TValue, TData, TSelectOptionInterface>
          {...autoCompleteProps}
          id={id || name}
          name={name}
          width={'w-full'}
          height={height}
          ref={ref}
          value={value}
          onOptionSelect={onOptionSelect}
          onChange={handleOnChange}
          onClearButtonClick={onClearButtonClick}
          disabled={disabled}
          isError={isError}
          dataQk={dataQk}
        />
      </FormComponent.Wrapper>
    );
  },
);

FormUiAutocomplete.displayName = 'FormUiAutocomplete';

export default FormUiAutocomplete as <
  TValue extends ValueType = ValueType,
  TData = unknown,
  TSelectOptionInterface extends OptionInterface<TValue, TData> =
    SelectOptionInterface<TValue, TData>,
>(
  props: FormUiAutocompleteProps<TValue, TData, TSelectOptionInterface> & {
    ref?: Ref<HTMLSelectElement>;
  },
) => JSX.Element;
