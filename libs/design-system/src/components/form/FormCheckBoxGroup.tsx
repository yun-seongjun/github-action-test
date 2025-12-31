import { forwardRef, Ref } from 'react';
import { Controller, FieldValues, Path, PathValue } from 'react-hook-form';
import { FormComponentBaseProps } from '@design-system/components/form/Form';
import FormUiCheckBoxGroup, {
  FormUiCheckBoxGroupProps,
  NotShowAllCheckBoxProps,
  ShowAllCheckBoxProps,
} from '@design-system/components/form-ui/FormUiCheckBoxGroup';
import { OptionInterface } from '@design-system/hooks/useOption';
import { ArrayOrElement } from '@design-system/types/generic.type';
import { ComponentUtils } from '@design-system/utils/componentUtils';

interface FormCheckBoxGroupProps<
  TData = unknown,
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends Path<TFieldValues> = Path<TFieldValues>,
  TOptionInterface extends OptionInterface<
    ArrayOrElement<PathValue<TFieldValues, TFieldName>>,
    TData
  > = OptionInterface<
    ArrayOrElement<PathValue<TFieldValues, TFieldName>>,
    TData
  >,
>
  extends
    Omit<
      FormUiCheckBoxGroupProps<
        TData,
        PathValue<TFieldValues, TFieldName>,
        TOptionInterface
      >,
      'id' | 'name' | 'checked' | 'errorText' | 'required' | 'values'
    >,
    FormComponentBaseProps<TFieldValues, TFieldName> {}

const FormCheckBoxGroup = forwardRef<HTMLInputElement, FormCheckBoxGroupProps>(
  <
    TData = unknown,
    TFieldValues extends FieldValues = FieldValues,
    TFieldName extends Path<TFieldValues> = Path<TFieldValues>,
    TOptionInterface extends OptionInterface<
      ArrayOrElement<PathValue<TFieldValues, TFieldName>>,
      TData
    > = OptionInterface<
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
      options,
      showAllCheckBox,
      allCheckBoxOptionContent,
      onAllCheckBoxClick,
      onAllCheckBoxChange,
      ...checkBoxGroupProps
    }: FormCheckBoxGroupProps<
      TData,
      TFieldValues,
      TFieldName,
      TOptionInterface
    >,
    ref: Ref<HTMLInputElement>,
  ) => {
    const { control, setValue, isDirtyField } = formControl;

    return (
      <Controller<TFieldValues, TFieldName>
        name={name}
        control={control}
        rules={{ required, validate }}
        render={({ field, fieldState }) => {
          const { value: values, ref: refCallback } = field;
          const { error } = fieldState;
          const errorText = error?.message;
          const isDirty = isDirtyField(name);

          const handleChange = (
            valuesNew: ArrayOrElement<PathValue<TFieldValues, TFieldName>>[],
            data: (TData | undefined)[] | undefined,
            e?: React.ChangeEvent<HTMLInputElement>,
          ) => {
            setValue(name, valuesNew as PathValue<TFieldValues, TFieldName>);
            onChange?.(valuesNew, data, e);
          };

          const showAllCheckBoxProps = showAllCheckBox
            ? ({
                showAllCheckBox: true,
                allCheckBoxOptionContent,
                onAllCheckBoxClick,
                onAllCheckBoxChange,
              } as ShowAllCheckBoxProps)
            : ({} as NotShowAllCheckBoxProps);

          return (
            <FormUiCheckBoxGroup
              {...checkBoxGroupProps}
              {...showAllCheckBoxProps}
              name={name}
              options={options}
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

FormCheckBoxGroup.displayName = 'FormCheckBoxGroup';

export default FormCheckBoxGroup as <
  TData = unknown,
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends Path<TFieldValues> = Path<TFieldValues>,
  TOptionInterface extends OptionInterface<
    ArrayOrElement<PathValue<TFieldValues, TFieldName>>,
    TData
  > = OptionInterface<
    ArrayOrElement<PathValue<TFieldValues, TFieldName>>,
    TData
  >,
>(
  props: FormCheckBoxGroupProps<
    TData,
    TFieldValues,
    TFieldName,
    TOptionInterface
  > & {
    ref?: Ref<HTMLInputElement>;
  },
) => JSX.Element;
