import { forwardRef, MutableRefObject, Ref } from 'react';
import { FieldValues, get, Path } from 'react-hook-form';
import { FormComponentBaseProps } from '@design-system/components/form/Form';
import {
  FormComponent,
  FormComponentWrapperProps,
} from '@design-system/components/form/FormComponent';
import FormTextInputWithoutLabel, {
  FormTextInputWithoutLabelProps,
} from '@design-system/components/form/FormTextInputWithoutLabel';
import { ComponentUtils } from '@design-system/utils/componentUtils';

interface FormTextInputPairProps<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends Path<TFieldValues> = Path<TFieldValues>,
>
  extends
    Pick<
      FormTextInputWithoutLabelProps<TFieldValues, Path<TFieldValues>>,
      'id' | 'disabled' | 'displayType' | 'showClearButton'
    >,
    Omit<FormComponentWrapperProps, 'errorText' | 'required' | 'htmlFor'>,
    Pick<
      FormComponentBaseProps<TFieldValues, Path<TFieldValues>>,
      'formControl' | 'required'
    > {
  names: TFieldName[];
  textInputFirstProps: Omit<
    FormTextInputWithoutLabelProps<TFieldValues, TFieldName>,
    | 'name'
    | 'required'
    | 'disabled'
    | 'displayType'
    | 'formControl'
    | 'showClearButton'
  >;
  textInputSecondProps: Omit<
    FormTextInputWithoutLabelProps<TFieldValues, TFieldName>,
    | 'name'
    | 'required'
    | 'disabled'
    | 'displayType'
    | 'formControl'
    | 'showClearButton'
  >;
  refSecond?: MutableRefObject<HTMLInputElement | null>;
  separator?: string;
}

const FormTextInputPair = forwardRef<HTMLInputElement, FormTextInputPairProps>(
  <
    TFieldValues extends FieldValues = FieldValues,
    TFieldName extends Path<TFieldValues> = Path<TFieldValues>,
  >(
    {
      disabled,
      width,
      id,
      names,
      formControl,
      required,
      labelText,
      labelIconName,
      helperText,
      helperIconName,
      helperTextType,
      errorIconName,
      successText,
      successIconName,
      wrapperClassName,
      displayType,
      showClearButton,
      textInputFirstProps,
      textInputSecondProps,
      refSecond,
      separator,
      dataQk,
    }: FormTextInputPairProps<TFieldValues, TFieldName>,
    ref: Ref<HTMLInputElement>,
  ) => {
    const [nameFirst, nameSecond] = names;
    const {
      formState: { errors, dirtyFields },
    } = formControl;
    const errorStart = get(errors, nameFirst);
    const errorEnd = get(errors, nameSecond);
    const errorText = errorStart?.message || errorEnd?.message;
    const isError = !!errorStart || !!errorEnd;
    const isDirty = dirtyFields[nameFirst] || dirtyFields[nameSecond];

    return (
      <FormComponent.Wrapper
        htmlFor={id || nameFirst}
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
        <FormComponent.MultiColumnWrapper>
          <FormTextInputWithoutLabel<TFieldValues, TFieldName>
            {...textInputFirstProps}
            inputWrapperClassName={ComponentUtils.cn(
              textInputFirstProps.inputWrapperClassName,
              'flex-1',
            )}
            ref={ref}
            id={id || nameFirst}
            name={nameFirst}
            formControl={formControl}
            required={required}
            disabled={disabled}
            displayType={displayType}
            showClearButton={showClearButton}
            dataQk={`${dataQk}-first`}
          />
          {separator && (
            <span className="font-size-16 font-medium">{separator}</span>
          )}
          <FormTextInputWithoutLabel<TFieldValues, TFieldName>
            {...textInputSecondProps}
            inputWrapperClassName={ComponentUtils.cn(
              textInputSecondProps.inputWrapperClassName,
              'flex-1',
            )}
            ref={refSecond}
            name={nameSecond}
            formControl={formControl}
            required={required}
            disabled={disabled}
            displayType={displayType}
            showClearButton={showClearButton}
            dataQk={`${dataQk}-second`}
          />
        </FormComponent.MultiColumnWrapper>
      </FormComponent.Wrapper>
    );
  },
);

FormTextInputPair.displayName = 'FormTextInputPair';

export default FormTextInputPair as <
  TFieldValues extends FieldValues,
  TFieldName extends Path<TFieldValues>,
>(
  props: FormTextInputPairProps<TFieldValues, TFieldName> & {
    ref?: Ref<HTMLInputElement>;
  },
) => JSX.Element;
