import { ChangeEvent, forwardRef, Ref } from 'react';
import { Controller, FieldValues, Path, PathValue } from 'react-hook-form';
import {
  FormComponentBaseProps,
  FormComponentChangeEventType,
} from '@design-system/components/form/Form';
import FormUiTextArea, {
  FormUiTextAreaProps,
} from '@design-system/components/form-ui/FormUiTextArea';
import { ComponentUtils } from '@design-system/utils/componentUtils';

interface FormTextAreaProps<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends Path<TFieldValues> = Path<TFieldValues>,
>
  extends
    Omit<
      FormUiTextAreaProps<PathValue<TFieldValues, TFieldName>>,
      | 'name'
      | 'isError'
      | 'value'
      | 'onChange'
      | 'required'
      | 'errorText'
      | 'isDirty'
    >,
    FormComponentBaseProps<TFieldValues, TFieldName> {
  onChange?: FormComponentChangeEventType<
    TFieldValues,
    TFieldName,
    HTMLTextAreaElement
  >;
}

const FormTextArea = forwardRef<HTMLTextAreaElement, FormTextAreaProps>(
  <
    TFieldValues extends FieldValues = FieldValues,
    TFieldName extends Path<TFieldValues> = Path<TFieldValues>,
  >(
    {
      disabled,
      name,
      onChange,
      formControl,
      required,
      validate,
      onKeyUp,
      ...textAreaProps
    }: FormTextAreaProps<TFieldValues, TFieldName>,
    ref: Ref<HTMLTextAreaElement>,
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
            e?: ChangeEvent<HTMLTextAreaElement>,
          ) => {
            setValue(name, valueNew);
            onChange?.(valueNew, e);
          };

          return (
            <FormUiTextArea
              {...textAreaProps}
              name={name}
              ref={(r) => ComponentUtils.setRefs(r, ref, refCallback)}
              value={value}
              onChange={handleChange}
              onKeyUp={onKeyUp}
              disabled={disabled}
              isError={!!error}
              errorText={errorText}
              isDirty={isDirty}
            />
          );
        }}
      />
    );
  },
);

FormTextArea.displayName = 'FormTextArea';

export default FormTextArea as <
  TFieldValues extends FieldValues,
  TFieldName extends Path<TFieldValues>,
>(
  props: FormTextAreaProps<TFieldValues, TFieldName> & {
    ref?: Ref<HTMLTextAreaElement>;
  },
) => JSX.Element;
