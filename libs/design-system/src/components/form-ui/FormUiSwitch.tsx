import { forwardRef, Ref } from 'react';
import {
  FormComponent,
  FormComponentWrapperProps,
} from '@design-system/components/form/FormComponent';
import Switch, { SwitchProps } from '@design-system/components/switch/Switch';

export interface FormUiSwitchProps
  extends
    Omit<SwitchProps, 'height'>,
    Omit<FormComponentWrapperProps, 'htmlFor'> {}

const FormUiSwitch = forwardRef<HTMLInputElement, FormUiSwitchProps>(
  (
    {
      disabled,
      width,
      id,
      name,
      onChange,
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
      labelTextClassName,
      value,
      dataQk,
      ...switchProps
    }: FormUiSwitchProps,
    ref: Ref<HTMLInputElement>,
  ) => {
    return (
      <FormComponent.Wrapper
        htmlFor={id || name}
        labelIconName={labelIconName}
        labelText={labelText}
        labelTextClassName={labelTextClassName}
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
        <Switch
          {...switchProps}
          checked={!!value}
          id={id || name}
          width={width}
          name={name}
          ref={ref}
          onChange={onChange}
          disabled={disabled}
          dataQk={dataQk}
        />
      </FormComponent.Wrapper>
    );
  },
);

FormUiSwitch.displayName = 'FormUiSwitch';

export default FormUiSwitch;
