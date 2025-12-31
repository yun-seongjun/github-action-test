import React, {
  ChangeEvent,
  CSSProperties,
  FormHTMLAttributes,
  KeyboardEvent,
  PropsWithChildren,
} from 'react';
import { DevTool } from '@hookform/devtools';
import { DevtoolUIProps } from '@hookform/devtools/dist/devToolUI';
import {
  FieldErrors,
  FieldPathValue,
  FieldValues,
  FormProvider,
  Path,
  PathValue,
  SubmitErrorHandler,
  SubmitHandler,
  Validate,
  ValidationRule,
} from 'react-hook-form';
import { FormControl } from '@design-system/hooks/form/useForm';
import useDelayPreventer from '@design-system/hooks/useDelayPreventer';
import { DataQuery } from '@design-system/types/common.type';
import { EnvUtils } from '@design-system/utils';

export type FormComponentChangeEventType<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends Path<TFieldValues> = Path<TFieldValues>,
  TElement extends HTMLElement = HTMLElement,
> = (
  value: PathValue<TFieldValues, TFieldName>,
  e?: ChangeEvent<TElement>,
) => void;

export type FormComponentChangeWithExtraDataEventType<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends Path<TFieldValues> = Path<TFieldValues>,
  TExtraData = unknown,
  TElement extends HTMLElement = HTMLElement,
> = (
  value: PathValue<TFieldValues, TFieldName>,
  extraData: TExtraData | undefined,
  e?: ChangeEvent<TElement>,
) => void;

export interface FormComponentBaseProps<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends Path<TFieldValues> = Path<TFieldValues>,
> {
  name: TFieldName;
  formControl: FormControl<TFieldValues>;
  required?: string | ValidationRule<boolean>;
  validate?:
    | Validate<FieldPathValue<TFieldValues, TFieldName>, TFieldValues>
    | Record<
        string,
        Validate<FieldPathValue<TFieldValues, TFieldName>, TFieldValues>
      >;
}

export interface FormProps<
  TFieldValues extends FieldValues = FieldValues,
> extends DataQuery {
  className?: string;
  style?: CSSProperties;
  autoComplete?: FormHTMLAttributes<HTMLFormElement>['autoComplete'];
  formControl: Omit<FormControl<TFieldValues>, 'requestSubmit'>;
  onSubmit?: SubmitHandler<TFieldValues>;
  onSubmitError?: SubmitErrorHandler<TFieldValues>;
  devToolPlacement?: DevtoolUIProps['placement'];
  onKeyDown?: (e: KeyboardEvent<HTMLFormElement>) => void;
}

const Form = <TFieldValues extends FieldValues = FieldValues>({
  className,
  style,
  formControl: { formRef, ...formControl },
  onSubmit,
  onSubmitError,
  children,
  devToolPlacement = 'top-right',
  onKeyDown,
  dataQk,
}: PropsWithChildren<FormProps<TFieldValues>>) => {
  const { preventDelay } = useDelayPreventer();

  const handleSubmit = async (
    data: TFieldValues,
    event?: React.BaseSyntheticEvent,
  ) => {
    if (EnvUtils.isDevMode()) {
      console.info(
        `%c Form submit data`,
        'font-weight:bold;color:RoyalBlue',
        data,
      );
    }
    if (!onSubmit) {
      return undefined;
    }
    return await preventDelay(onSubmit, data, event);
  };

  const handleSubmitError = (
    errors: FieldErrors<TFieldValues>,
    event?: React.BaseSyntheticEvent,
  ) => {
    if (EnvUtils.isDevMode()) {
      console.info(
        `%c Form submit error`,
        'font-weight:bold;color:Red',
        errors,
      );
    }
    return onSubmitError?.(errors, event);
  };

  return (
    <FormProvider {...formControl}>
      <form
        ref={formRef}
        style={style}
        className={className}
        onSubmit={formControl.handleSubmit(handleSubmit, handleSubmitError)}
        onKeyDown={onKeyDown}
        data-qk={dataQk}
      >
        {children}
      </form>
      {EnvUtils.isDevMode() && (
        <DevTool placement={devToolPlacement} control={formControl.control} />
      )}
    </FormProvider>
  );
};

export default Form;
