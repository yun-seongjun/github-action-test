import { forwardRef, Ref } from 'react';
import { Controller, FieldValues, Path, PathValue } from 'react-hook-form';
import { FormComponentBaseProps } from '@design-system/components/form/Form';
import FormUiSelect, {
  FormUiSelectProps,
} from '@design-system/components/form-ui/FormUiSelect';
import { SelectOptionInterface } from '@design-system/components/select/SelectCommon';
import { OptionInterface } from '@design-system/hooks/useOption';
import { ComponentUtils } from '@design-system/utils/componentUtils';

interface FormSelectProps<
  TData = unknown,
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends Path<TFieldValues> = Path<TFieldValues>,
  TSelectOptionInterface extends OptionInterface<
    PathValue<TFieldValues, TFieldName>,
    TData
  > = SelectOptionInterface<PathValue<TFieldValues, TFieldName>, TData>,
>
  extends
    Omit<
      FormUiSelectProps<
        PathValue<TFieldValues, TFieldName>,
        TData,
        TSelectOptionInterface
      >,
      'name' | 'isError' | 'value' | 'required' | 'errorText' | 'isDirty'
    >,
    FormComponentBaseProps<TFieldValues, TFieldName> {}

const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
  <
    TData = unknown,
    TFieldValues extends FieldValues = FieldValues,
    TFieldName extends Path<TFieldValues> = Path<TFieldValues>,
    TSelectOptionInterface extends OptionInterface<
      PathValue<TFieldValues, TFieldName>,
      TData
    > = SelectOptionInterface<PathValue<TFieldValues, TFieldName>, TData>,
  >(
    {
      name,
      onChange,
      formControl,
      required,
      validate,
      ...selectProps
    }: FormSelectProps<TData, TFieldValues, TFieldName, TSelectOptionInterface>,
    ref: Ref<HTMLSelectElement>,
  ) => {
    type TValueType = PathValue<TFieldValues, TFieldName>;
    const { control, setValue, isDirtyField } = formControl;

    return (
      <Controller<TFieldValues, TFieldName>
        name={name}
        control={control}
        rules={{ required, validate }}
        render={({ field, fieldState }) => {
          const { value, ref: refCallback } = field;
          const { error } = fieldState;
          const errorText = error?.message;
          const isDirty = isDirtyField(name);

          const handleChange = (
            value: TValueType | undefined,
            option: TSelectOptionInterface | undefined,
          ) => {
            const valueNew = value as TValueType;
            setValue(name, valueNew);
            onChange?.(valueNew, option);
          };

          return (
            <FormUiSelect
              {...selectProps}
              name={name}
              ref={(r) => ComponentUtils.setRefs(r, ref, refCallback)}
              value={value}
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

FormSelect.displayName = 'FormSelect';

export default FormSelect as <
  TData = unknown,
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends Path<TFieldValues> = Path<TFieldValues>,
  TSelectOptionInterface extends OptionInterface<
    PathValue<TFieldValues, TFieldName>,
    TData
  > = SelectOptionInterface<PathValue<TFieldValues, TFieldName>, TData>,
>(
  props: FormSelectProps<
    TData,
    TFieldValues,
    TFieldName,
    TSelectOptionInterface
  > & {
    ref?: Ref<HTMLSelectElement>;
  },
) => JSX.Element;
