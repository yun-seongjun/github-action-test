import { FieldValues, Path, PathValue } from 'react-hook-form';
import ExceedMaxLengthError from '@design-system/error/ExceedMaxLengthError';
import { TextInputProps } from '@design-system/components/text/TextInput';
import { TextUtils } from '@design-system/utils/textUtils';

interface UseFormTextInputProps<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends Path<TFieldValues> = Path<TFieldValues>,
> extends Pick<TextInputProps, 'inputType' | 'min' | 'max' | 'maxLength'> {}

const useFormTextInput = <
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends Path<TFieldValues> = Path<TFieldValues>,
>({
  inputType,
  min,
  max,
  maxLength,
}: UseFormTextInputProps<TFieldValues, TFieldName>) => {
  const refineTextInputValue = (
    value: string,
  ): PathValue<TFieldValues, TFieldName> => {
    try {
      return TextUtils.refineValue(
        value,
        inputType,
        min,
        max,
        maxLength,
      ) as PathValue<TFieldValues, TFieldName>;
    } catch (err) {
      if (err instanceof ExceedMaxLengthError) {
        return TextUtils.sliceToMaxLength(value, maxLength) as PathValue<
          TFieldValues,
          TFieldName
        >;
      }
      if (process.env.PLATFORM_ENV !== 'production') {
        console.error('FormTextInput, handleChange, error', err);
      }
      throw err;
    }
  };

  return {
    refineTextInputValue,
  };
};

export default useFormTextInput;
