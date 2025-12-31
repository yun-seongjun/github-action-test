import { forwardRef, Ref } from 'react';
import { Controller, FieldValues, Path, PathValue } from 'react-hook-form';
import { FormComponentBaseProps } from '@design-system/components/form/Form';
import FormUiRadioGroup, {
  FormUiRadioGroupProps,
} from '@design-system/components/form-ui/FormUiRadioGroup';
import { OptionInterface } from '@design-system/hooks/useOption';
import { ComponentUtils } from '@design-system/utils/componentUtils';

interface FormRadioGroupProps<
  TData = unknown,
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends Path<TFieldValues> = Path<TFieldValues>,
  TOptionInterface extends OptionInterface<
    PathValue<TFieldValues, TFieldName>,
    TData
  > = OptionInterface<PathValue<TFieldValues, TFieldName>, TData>,
>
  extends
    Omit<
      FormUiRadioGroupProps<
        TData,
        PathValue<TFieldValues, TFieldName>,
        TOptionInterface
      >,
      'name' | 'checked' | 'children' | 'errorText' | 'required'
    >,
    FormComponentBaseProps<TFieldValues, TFieldName> {}

const FormRadioGroup = forwardRef<HTMLInputElement, FormRadioGroupProps>(
  <
    TData = unknown,
    TFieldValues extends FieldValues = FieldValues,
    TFieldName extends Path<TFieldValues> = Path<TFieldValues>,
  >(
    {
      name,
      onChange,
      formControl,
      required,
      validate,
      ...radioProps
    }: FormRadioGroupProps<TData, TFieldValues, TFieldName>,
    ref: Ref<HTMLInputElement>,
  ) => {
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
            valueNew: PathValue<TFieldValues, TFieldName>,
            data: TData | undefined,
            e?: React.ChangeEvent<HTMLInputElement>,
          ) => {
            setValue(name, valueNew);
            onChange?.(valueNew, data, e);
          };

          return (
            <FormUiRadioGroup
              {...radioProps}
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

FormRadioGroup.displayName = 'FormRadioGroup';

export default FormRadioGroup as <
  TData = unknown,
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends Path<TFieldValues> = Path<TFieldValues>,
  TOptionInterface extends OptionInterface<
    PathValue<TFieldValues, TFieldName>,
    TData
  > = OptionInterface<PathValue<TFieldValues, TFieldName>, TData>,
>(
  props: FormRadioGroupProps<
    TData,
    TFieldValues,
    TFieldName,
    TOptionInterface
  > & {
    ref?: Ref<HTMLInputElement>;
  },
) => JSX.Element;
