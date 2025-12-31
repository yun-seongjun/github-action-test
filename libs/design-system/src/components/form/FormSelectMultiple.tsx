import { forwardRef, Ref } from 'react';
import { Controller, FieldValues, Path, PathValue } from 'react-hook-form';
import { FormComponentBaseProps } from '@design-system/components/form/Form';
import FormUiSelectMultiple, {
  FormUiSelectMultipleProps,
} from '@design-system/components/form-ui/FormUiSelectMultiple';
import { SelectMultipleOptionInterface } from '@design-system/components/select/SelectCommon';
import { ArrayOrElement } from '@design-system/types/generic.type';
import { ComponentUtils } from '@design-system/utils/componentUtils';

interface FormSelectMultipleProps<
  TData = unknown,
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends Path<TFieldValues> = Path<TFieldValues>,
  TSelectMultipleOptionInterface extends SelectMultipleOptionInterface<
    ArrayOrElement<PathValue<TFieldValues, TFieldName>>,
    TData
  > = SelectMultipleOptionInterface<
    ArrayOrElement<PathValue<TFieldValues, TFieldName>>,
    TData
  >,
>
  extends
    Omit<
      FormUiSelectMultipleProps<
        PathValue<TFieldValues, TFieldName>,
        TData,
        TSelectMultipleOptionInterface
      >,
      | 'name'
      | 'isError'
      | 'isActiveBorderWhenHover'
      | 'required'
      | 'errorText'
      | 'isDirty'
    >,
    FormComponentBaseProps<TFieldValues, TFieldName> {}

const FormSelectMultiple = forwardRef<
  HTMLSelectElement,
  FormSelectMultipleProps
>(
  <
    TData = unknown,
    TFieldValues extends FieldValues = FieldValues,
    TFieldName extends Path<TFieldValues> = Path<TFieldValues>,
    TSelectMultipleOptionInterface extends SelectMultipleOptionInterface<
      ArrayOrElement<PathValue<TFieldValues, TFieldName>>,
      TData
    > = SelectMultipleOptionInterface<
      ArrayOrElement<PathValue<TFieldValues, TFieldName>>,
      TData
    >,
  >(
    {
      name,
      onChange,
      formControl,
      required,
      validate,
      ...selectMultipleProps
    }: FormSelectMultipleProps<
      TData,
      TFieldValues,
      TFieldName,
      TSelectMultipleOptionInterface
    >,
    ref: Ref<HTMLSelectElement>,
  ) => {
    type ValueElementType = ArrayOrElement<PathValue<TFieldValues, TFieldName>>;
    const { control, setValue, isDirtyField } = formControl;

    return (
      <Controller<TFieldValues, TFieldName>
        name={name}
        control={control}
        rules={{ required, validate }}
        render={({ field, fieldState }) => {
          const { value: values = [], ref: refCallback } = field;
          const { error } = fieldState;
          const errorText = error?.message;
          const isDirty = isDirtyField(name);

          const handleChange = (
            values: ValueElementType[],
            options: TSelectMultipleOptionInterface[],
          ) => {
            const valueNew = values as PathValue<TFieldValues, TFieldName>;
            setValue(name, valueNew);
            onChange?.(valueNew, options);
          };

          return (
            <FormUiSelectMultiple
              {...selectMultipleProps}
              name={name}
              ref={(r) => ComponentUtils.setRefs(r, ref, refCallback)}
              values={values}
              required={!!required}
              isError={!!error}
              errorText={errorText}
              isDirty={isDirty}
              onChange={handleChange}
            />
          );
        }}
      />
    );
  },
);

FormSelectMultiple.displayName = 'FormSelectMultiple';

export default FormSelectMultiple as <
  TData = unknown,
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends Path<TFieldValues> = Path<TFieldValues>,
>(
  props: FormSelectMultipleProps<TData, TFieldValues, TFieldName> & {
    ref?: Ref<HTMLSelectElement>;
  },
) => JSX.Element;
