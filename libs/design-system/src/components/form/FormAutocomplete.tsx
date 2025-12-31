import { forwardRef, Ref } from 'react';
import { Controller, FieldValues, Path, PathValue } from 'react-hook-form';

import { ComponentUtils } from '@design-system/utils';
import { OptionInterface } from '@design-system/hooks';
import {
  FormComponentBaseProps,
  SelectOptionInterface,
} from '@design-system/root/src';
import FormUiAutocomplete, {
  FormUiAutocompleteProps,
} from '@design-system/components/form-ui/FormUiAutocomplete';

interface FormAutocompleteProps<
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
      FormUiAutocompleteProps<
        PathValue<TFieldValues, TFieldName>,
        TData,
        TSelectOptionInterface
      >,
      'name' | 'isError' | 'value' | 'required' | 'errorText' | 'isDirty'
    >,
    FormComponentBaseProps<TFieldValues, TFieldName> {}

const FormAutocomplete = forwardRef<HTMLSelectElement, FormAutocompleteProps>(
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
      ...autoCompleteProps
    }: FormAutocompleteProps<
      TData,
      TFieldValues,
      TFieldName,
      TSelectOptionInterface
    >,
    ref: Ref<HTMLSelectElement>,
  ) => {
    type TValueType = PathValue<TFieldValues, TFieldName>;
    const { control, setValue, isDirtyField, clearField, trigger } =
      formControl;

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
            setValue(name, valueNew, { shouldDirty: true });
            onChange?.(valueNew, option);
          };

          const handleClearButtonClick = () => {
            clearField(name);
            trigger(name);
            onChange?.(null as PathValue<TFieldValues, TFieldName>, undefined);
          };
          return (
            <FormUiAutocomplete
              {...autoCompleteProps}
              name={name}
              ref={(r) => ComponentUtils.setRefs(r, ref, refCallback)}
              value={value}
              required={!!required}
              isError={!!error}
              errorText={errorText}
              isDirty={isDirty}
              onChange={handleChange}
              onClearButtonClick={handleClearButtonClick}
            />
          );
        }}
      />
    );
  },
);

FormAutocomplete.displayName = 'FormAutocomplete';

export default FormAutocomplete as <
  TData = unknown,
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends Path<TFieldValues> = Path<TFieldValues>,
  TSelectOptionInterface extends OptionInterface<
    PathValue<TFieldValues, TFieldName>,
    TData
  > = SelectOptionInterface<PathValue<TFieldValues, TFieldName>, TData>,
>(
  props: FormAutocompleteProps<
    TData,
    TFieldValues,
    TFieldName,
    TSelectOptionInterface
  > & {
    ref?: Ref<HTMLSelectElement>;
  },
) => JSX.Element;
