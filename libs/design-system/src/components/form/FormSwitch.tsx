import { forwardRef, Ref, ChangeEvent } from 'react';
import { Controller, FieldValues, Path, PathValue } from 'react-hook-form';
import { FormComponentBaseProps } from '@design-system/components/form/Form';
import { ComponentUtils } from '@design-system/utils/componentUtils';
import FormUiSwitch, {
  FormUiSwitchProps,
} from '@design-system/components/form-ui/FormUiSwitch';

export interface FormSwitchProps<
  TFieldName extends Path<TFieldValues>,
  TFieldValues extends FieldValues = FieldValues,
>
  extends
    Omit<
      FormUiSwitchProps,
      'isError' | 'required' | 'errorText' | 'name' | 'isDirty'
    >,
    FormComponentBaseProps<TFieldValues, TFieldName> {}

const FormSwitch = forwardRef<
  HTMLDivElement,
  FormSwitchProps<Path<FieldValues>, FieldValues>
>(
  <TFieldValues extends FieldValues, TFieldName extends Path<TFieldValues>>(
    {
      name,
      onChange,
      formControl,
      required,
      validate,
      ...switchProps
    }: FormSwitchProps<TFieldName, TFieldValues>,
    ref: Ref<HTMLDivElement>,
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
          const isDirty = isDirtyField(name);

          const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
            const valueNew = event.target.checked;
            setValue(name, valueNew as PathValue<TFieldValues, TFieldName>);
            onChange?.(event);
          };

          return (
            <FormUiSwitch
              {...switchProps}
              ref={(r) => ComponentUtils.setRefs(r, ref, refCallback)}
              isError={!!error}
              required={!!required}
              value={value}
              onChange={handleChange}
              isDirty={isDirty}
            />
          );
        }}
      />
    );
  },
);

FormSwitch.displayName = 'FormSwitch';

export default FormSwitch as <
  TFieldValues extends FieldValues,
  TFieldName extends Path<TFieldValues>,
>(
  props: FormSwitchProps<TFieldName, TFieldValues> & {
    ref?: Ref<HTMLDivElement>;
  },
) => JSX.Element;
