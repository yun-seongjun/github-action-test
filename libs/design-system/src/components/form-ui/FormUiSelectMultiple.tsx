import { forwardRef, Ref } from 'react';
import {
  FormComponent,
  FormComponentWrapperProps,
} from '@design-system/components/form/FormComponent';
import { SelectMultipleOptionInterface } from '@design-system/components/select/SelectCommon';
import SelectMultiple, {
  SelectMultipleProps,
} from '@design-system/components/select/SelectMultiple';
import { SelectValueType } from '@design-system/hooks/useOption';
import { ArrayOrElement } from '@design-system/types/generic.type';

export interface FormUiSelectMultipleProps<
  TValues extends SelectValueType[] = [],
  TData = unknown,
  TSelectMultipleOptionInterface extends SelectMultipleOptionInterface<
    ArrayOrElement<TValues>,
    TData
  > = SelectMultipleOptionInterface<ArrayOrElement<TValues>, TData>,
>
  extends
    Omit<
      SelectMultipleProps<TValues, TData, TSelectMultipleOptionInterface>,
      'isActiveBorderWhenHover'
    >,
    Omit<FormComponentWrapperProps, 'htmlFor'> {}

const FormUiSelectMultiple = forwardRef<
  HTMLSelectElement,
  FormUiSelectMultipleProps
>(
  <
    TValues extends SelectValueType[] = [],
    TData = unknown,
    TSelectMultipleOptionInterface extends SelectMultipleOptionInterface<
      ArrayOrElement<TValues>,
      TData
    > = SelectMultipleOptionInterface<ArrayOrElement<TValues>, TData>,
  >(
    {
      disabled,
      width,
      height,
      id,
      name,
      values,
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
      dataQk,
      ...selectMultipleProps
    }: FormUiSelectMultipleProps<
      TValues,
      TData,
      TSelectMultipleOptionInterface
    >,
    ref: Ref<HTMLSelectElement>,
  ) => {
    const handleChange = (
      values: ArrayOrElement<TValues>[],
      options: TSelectMultipleOptionInterface[],
    ) => {
      const valueNew = values as ArrayOrElement<TValues>[];
      onChange?.(valueNew, options);
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
        <SelectMultiple
          {...selectMultipleProps}
          id={id || name}
          name={name}
          width="w-full"
          height={height}
          ref={ref}
          values={values ?? []}
          onOptionSelect={onOptionSelect}
          onChange={handleChange}
          disabled={disabled}
          isError={isError}
          dataQk={dataQk}
        />
      </FormComponent.Wrapper>
    );
  },
);

FormUiSelectMultiple.displayName = 'FormUiSelectMultiple';

export default FormUiSelectMultiple as <
  TValues extends SelectValueType[] = [],
  TData = unknown,
  TSelectMultipleOptionInterface extends SelectMultipleOptionInterface<
    ArrayOrElement<TValues>,
    TData
  > = SelectMultipleOptionInterface<ArrayOrElement<TValues>, TData>,
>(
  props: FormUiSelectMultipleProps<
    TValues,
    TData,
    TSelectMultipleOptionInterface
  > & {
    ref?: Ref<HTMLSelectElement>;
  },
) => JSX.Element;
