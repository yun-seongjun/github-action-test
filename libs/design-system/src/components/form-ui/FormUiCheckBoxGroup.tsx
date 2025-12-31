import { ChangeEvent, forwardRef, InputHTMLAttributes, Ref } from 'react';
import CheckBox, {
  CheckBoxProps,
} from '@design-system/components/checkbox/CheckBox';
import {
  FormComponent,
  FormComponentWrapperProps,
  MultiColumnWrapperProps,
} from '@design-system/components/form/FormComponent';
import useOption, { OptionInterface } from '@design-system/hooks/useOption';
import { ArrayOrElement } from '@design-system/types/generic.type';
import { ComponentUtils } from '@design-system/utils/componentUtils';

type ValueType = InputHTMLAttributes<HTMLInputElement>['value'];

export type ShowAllCheckBoxProps = {
  /**
   * 전체 선택 체크 박스를 화면에 노출할지 여부
   */
  showAllCheckBox: true;
  /**
   * 전체 선택 체크 박스의 Content
   */
  allCheckBoxOptionContent: string;
  /**
   * 전체 선택 체크 박스 선택 event
   * @param e React.MouseEvent<HTMLInputElement>
   */
  onAllCheckBoxClick?: (e: React.MouseEvent<HTMLInputElement>) => void;
  /**
   * 전체 선택 체크 박스의 체크 변경 event
   * @param isAllChecked 전체 선택 체크 박스의 체크 여부
   * @param e React.ChangeEvent<HTMLInputElement>
   */
  onAllCheckBoxChange?: (
    isAllChecked: boolean,
    e?: React.ChangeEvent<HTMLInputElement>,
  ) => void;
};

export type NotShowAllCheckBoxProps = {
  /**
   * 전체 선택 체크 박스를 화면에 노출할지 여부
   */
  showAllCheckBox?: false;
  allCheckBoxOptionContent?: never;
  onAllCheckBoxClick?: never;
  onAllCheckBoxChange?: never;
};

export type FormUiCheckBoxGroupProps<
  TData = unknown,
  TValues extends ValueType[] = [],
  TOptionInterface extends OptionInterface<ArrayOrElement<TValues>, TData> =
    OptionInterface<ArrayOrElement<TValues>, TData>,
> = Omit<CheckBoxProps, 'onChange' | 'value' | 'children'> &
  Omit<FormComponentWrapperProps, 'htmlFor'> & {
    values?: ArrayOrElement<TValues>[];
    options: TOptionInterface[];
    onOptionSelect?: (
      option: TOptionInterface,
      e: React.MouseEvent<HTMLInputElement>,
    ) => void;
    onChange?: (
      values: ArrayOrElement<TValues>[],
      extraData: (TData | undefined)[] | undefined,
      e?: ChangeEvent<HTMLInputElement>,
    ) => void;
    checkBoxesGap?: MultiColumnWrapperProps['gap'];
    checkBoxesDirection?: MultiColumnWrapperProps['columnDirection'];
  } & (ShowAllCheckBoxProps | NotShowAllCheckBoxProps);

const FormUiCheckBoxGroup = forwardRef<
  HTMLInputElement,
  FormUiCheckBoxGroupProps
>(
  <
    TData = unknown,
    TValues extends ValueType[] = [],
    TOptionInterface extends OptionInterface<ArrayOrElement<TValues>, TData> =
      OptionInterface<ArrayOrElement<TValues>, TData>,
  >(
    {
      disabled,
      width,
      id,
      name,
      values,
      onChange,
      onOptionSelect,
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
      options,
      onClick,
      showAllCheckBox,
      allCheckBoxOptionContent,
      onAllCheckBoxClick,
      onAllCheckBoxChange,
      checkBoxesGap,
      checkBoxesDirection,
      dataQk,
      ...checkBoxProps
    }: FormUiCheckBoxGroupProps<TData, TValues, TOptionInterface>,
    ref: Ref<HTMLInputElement>,
  ) => {
    const { getOption, getOptionsData } = useOption<
      ArrayOrElement<TValues>,
      TData,
      TOptionInterface
    >({ options });

    const handleOptionClick = (
      option: TOptionInterface,
      e: React.MouseEvent<HTMLInputElement>,
    ) => {
      onClick?.(e);
      onOptionSelect?.(option, e);
    };

    const handleAllCheckboxChange = (
      e: React.ChangeEvent<HTMLInputElement>,
    ) => {
      const valuesNew = (
        e.target.checked ? options.map((o) => o.value) : []
      ) as ArrayOrElement<TValues>[];
      onChange?.(valuesNew, getOptionsData(valuesNew));
      onAllCheckBoxChange?.(e.target.checked, e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { checked, value } = e.target;
      const option = getOption(value as ArrayOrElement<TValues>);
      if (!option) {
        console.error(
          'FormCheckBoxGroup, handleChange, option must be not undefined. e',
          e,
        );
        return;
      }

      const valuesNew = (
        checked
          ? [...(values ?? []), option.value]
          : values?.filter((v) => v !== option.value)
      ) as ArrayOrElement<TValues>[];

      onChange?.(valuesNew, getOptionsData(valuesNew), e);
      if (onAllCheckBoxChange) {
        const isAllCheckedOld = values?.length === options.length;
        const isAllCheckedNew = valuesNew.length === options.length;
        if (isAllCheckedOld !== isAllCheckedNew) {
          onAllCheckBoxChange(isAllCheckedNew);
        }
      }
    };

    return (
      <FormComponent.Wrapper
        htmlFor={id || name}
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
        <FormComponent.MultiColumnWrapper
          gap={checkBoxesGap}
          columnDirection={checkBoxesDirection}
        >
          {showAllCheckBox && (
            <CheckBox
              {...checkBoxProps}
              disabled={disabled}
              checked={values?.length === options.length}
              onChange={handleAllCheckboxChange}
              onClick={onAllCheckBoxClick}
            >
              {allCheckBoxOptionContent}
            </CheckBox>
          )}
          {options.map((option, index) => {
            const key = String(option.key || option.value);
            const checked = !!values?.find((v) => v === option.value);

            return (
              <CheckBox
                {...checkBoxProps}
                key={key}
                ref={(r) => {
                  index === 0 && ComponentUtils.setRefs(r, ref);
                }}
                disabled={disabled}
                value={option.value}
                checked={checked}
                onChange={handleChange}
                onClick={(e) => handleOptionClick(option, e)}
                dataQk={`${dataQk}`}
              >
                {option.content}
              </CheckBox>
            );
          })}
        </FormComponent.MultiColumnWrapper>
      </FormComponent.Wrapper>
    );
  },
);

FormUiCheckBoxGroup.displayName = 'FormUiCheckBoxGroup';

export default FormUiCheckBoxGroup as <
  TData = unknown,
  TValues extends ValueType[] = [],
  TOptionInterface extends OptionInterface<ArrayOrElement<TValues>, TData> =
    OptionInterface<ArrayOrElement<TValues>, TData>,
>(
  props: FormUiCheckBoxGroupProps<TData, TValues, TOptionInterface> & {
    ref?: Ref<HTMLSelectElement>;
  },
) => JSX.Element;
