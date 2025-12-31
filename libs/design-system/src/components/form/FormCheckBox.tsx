import { ChangeEvent, forwardRef, Ref } from 'react';
import { Controller, FieldValues, Path, PathValue } from 'react-hook-form';
import {
  FormComponentBaseProps,
  FormComponentChangeWithExtraDataEventType,
} from '@design-system/components/form/Form';
import FormUiCheckBox, {
  CheckBoxOptionInterface,
  FormUiCheckBoxProps,
} from '@design-system/components/form-ui/FormUiCheckBox';
import { ComponentUtils } from '@design-system/utils/componentUtils';

interface FormCheckBoxProps<
  TData = unknown,
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends Path<TFieldValues> = Path<TFieldValues>,
>
  extends
    Omit<
      FormUiCheckBoxProps<TData, PathValue<TFieldValues, TFieldName>>,
      | 'id'
      | 'name'
      | 'checked'
      | 'onChange'
      | 'value'
      | 'children'
      | 'errorText'
      | 'required'
    >,
    FormComponentBaseProps<TFieldValues, TFieldName> {
  option: CheckBoxOptionInterface<PathValue<TFieldValues, TFieldName>, TData>;
  onChange?: FormComponentChangeWithExtraDataEventType<
    TFieldValues,
    TFieldName,
    TData,
    HTMLInputElement
  >;
}

const FormCheckBox = forwardRef<HTMLInputElement, FormCheckBoxProps>(
  <
    TData = unknown,
    TFieldValues extends FieldValues = FieldValues,
    TFieldName extends Path<TFieldValues> = Path<TFieldValues>,
  >(
    {
      name,
      onChange,
      onOptionSelect,
      formControl,
      required,
      validate,
      option,
      ...checkBoxProps
    }: FormCheckBoxProps<TData, TFieldValues, TFieldName>,
    ref: Ref<HTMLInputElement>,
  ) => {
    const { control, setValue, isDirtyField } = formControl;

    return (
      <Controller<TFieldValues, TFieldName>
        name={name}
        control={control}
        rules={{ required, validate }}
        render={({ field, fieldState }) => {
          const { value: value, ref: refCallback } = field;
          const { error } = fieldState;
          const errorText = error?.message;
          const isDirty = isDirtyField(name);

          const handleChange = (
            valueNew: PathValue<TFieldValues, TFieldName>,
            extraData: TData | undefined,
            e?: ChangeEvent<HTMLInputElement>,
          ) => {
            setValue(name, valueNew);
            onChange?.(valueNew, extraData, e);
          };

          return (
            <FormUiCheckBox
              {...checkBoxProps}
              name={name}
              ref={(r) => ComponentUtils.setRefs(r, ref, refCallback)}
              value={value}
              required={!!required}
              isError={!!error}
              errorText={errorText}
              isDirty={isDirty}
              option={option}
              onChange={handleChange}
              onOptionSelect={onOptionSelect}
            />
          );
        }}
      />
    );
  },
);

FormCheckBox.displayName = 'FormCheckBox';

export default FormCheckBox as <
  TData = unknown,
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends Path<TFieldValues> = Path<TFieldValues>,
>(
  props: FormCheckBoxProps<TData, TFieldValues, TFieldName> & {
    ref?: Ref<HTMLInputElement>;
  },
) => JSX.Element;
