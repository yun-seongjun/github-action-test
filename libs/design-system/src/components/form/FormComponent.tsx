import { PropsWithChildren, ReactElement, ReactNode } from 'react';
import { cva, VariantProps } from 'class-variance-authority';
import Icon from '@design-system/components/common/Icon';
import { IconNamesEnum } from '@design-system/constants/iconNames.enum';
import { DataQuery } from '@design-system/types/common.type';
import {
  GapType,
  HeightType,
  WidthType,
} from '@design-system/types/component.type';
import { ComponentUtils } from '@design-system/utils/componentUtils';

interface LabelProps extends DataQuery {
  /**
   * htmlFor
   */
  htmlFor?: string;
  /**
   * 라벨 문구
   */
  labelText?: string;
  /**
   * 라벨 문구 좌측에 출력할 아이콘의 이름
   */
  labelIconName?: IconNamesEnum;
  /**
   * 필수값 여부
   * true인 경우, 라벨 문구 우측에 * 을 출력함
   */
  required?: boolean;
  /**
   * text className
   */
  labelTextClassName?: string;
  className?: string;
  rightComponent?: ReactNode;
}

const Label = ({
  htmlFor,
  labelText,
  labelIconName,
  labelTextClassName,
  required,
  className,
  rightComponent,
  dataQk,
}: LabelProps) => {
  if (!labelText) {
    return null;
  }

  const textClassName = 'font-medium font-size-14';

  return (
    <label
      className={ComponentUtils.cn('flex gap-4', className)}
      htmlFor={htmlFor}
      data-qk={dataQk ? `${dataQk}-label` : 'form-label'}
    >
      {labelIconName && <Icon name={labelIconName} />}
      {labelText && (
        <span
          className={ComponentUtils.cn(
            'text-mono-600',
            textClassName,
            labelTextClassName,
          )}
        >
          {labelText}
        </span>
      )}
      {required && (
        <span className={ComponentUtils.cn(textClassName, 'text-red-400')}>
          *
        </span>
      )}
      {rightComponent}
    </label>
  );
};

interface TextWithIconProps {
  /**
   * 도움말 문구
   */
  text?: string;
  /**
   * 도움말 문구 좌측에 출력할 아이콘의 이름
   */
  iconName?: IconNamesEnum;
  /**
   * text와 icon에 적용할 className
   * text-color 설정을 위해 사용
   */
  className?: string;
}

const TextWithIcon = ({ text, iconName, className }: TextWithIconProps) => {
  return (
    <div className="flex gap-4">
      {iconName && (
        <Icon
          name={iconName}
          className={ComponentUtils.cn('h-16 w-16', className)}
        />
      )}
      {text && (
        <span
          className={ComponentUtils.cn('font-size-14 font-light', className)}
        >
          {text}
        </span>
      )}
    </div>
  );
};

export enum HelperTextType {
  INFORMATION = 'INFORMATION',
  WARNING = 'WARNING',
  HIGHLIGHT = 'HIGHLIGHT',
}

const helperTextVariants = cva('', {
  variants: {
    helperTextType: {
      [HelperTextType.INFORMATION]: 'text-mono-400',
      [HelperTextType.WARNING]: 'text-warning',
      [HelperTextType.HIGHLIGHT]: 'text-primary-300',
    },
  },
});

interface HelperTextProps extends VariantProps<typeof helperTextVariants> {
  helperText?: string;
  helperIconName?: IconNamesEnum;
}

const HelperText = ({
  helperText,
  helperIconName,
  helperTextType,
}: HelperTextProps) => {
  if (!helperText) {
    return null;
  }

  return (
    <TextWithIcon
      className={helperTextVariants({ helperTextType })}
      text={helperText}
      iconName={helperIconName}
    />
  );
};

interface StatusTextProps {
  isDirty?: boolean;
  isError?: boolean;
  errorText?: string;
  errorIconName?: IconNamesEnum;
  successText?: string;
  successIconName?: IconNamesEnum;
}

const StatusText = ({
  isDirty,
  isError,
  errorText,
  errorIconName,
  successText,
  successIconName,
}: StatusTextProps) => {
  if (isError) {
    if (!errorText) {
      return null;
    }
    return (
      <TextWithIcon
        className="text-error"
        text={errorText}
        iconName={errorIconName}
      />
    );
  }

  if (isDirty && successText) {
    return (
      <TextWithIcon
        className="text-success"
        text={successText}
        iconName={successIconName}
      />
    );
  }

  return null;
};

export interface FormComponentWrapperProps
  extends
    Omit<LabelProps, 'rightComponent'>,
    HelperTextProps,
    StatusTextProps,
    DataQuery {
  width?: WidthType;
  height?: HeightType;
  wrapperClassName?: string;
  labelRightComponent?: LabelProps['rightComponent'];
}

const FormComponentWrapper = ({
  htmlFor,
  labelText,
  labelTextClassName,
  labelIconName,
  labelRightComponent,
  helperText,
  helperIconName,
  helperTextType = HelperTextType.INFORMATION,
  errorText,
  errorIconName,
  successText,
  successIconName,
  required,
  isDirty,
  isError,
  wrapperClassName,
  width = 'w-full',
  height,
  children,
  dataQk,
}: PropsWithChildren<FormComponentWrapperProps>) => {
  const showHelperText = !errorText && !successText;
  return (
    <div
      className={ComponentUtils.cn(
        'flex flex-col gap-4',
        wrapperClassName,
        width,
        height,
      )}
      data-qk={dataQk ? `${dataQk}-wrapper` : 'form-component-wrapper'}
    >
      <Label
        htmlFor={htmlFor}
        labelText={labelText}
        labelIconName={labelIconName}
        labelTextClassName={labelTextClassName}
        required={required}
        rightComponent={labelRightComponent}
        dataQk={dataQk}
      />
      {children}
      {showHelperText && (
        <HelperText
          helperText={helperText}
          helperIconName={helperIconName}
          helperTextType={helperTextType}
        />
      )}
      <StatusText
        isDirty={isDirty}
        isError={isError}
        errorText={errorText}
        errorIconName={errorIconName}
        successText={successText}
        successIconName={successIconName}
      />
    </div>
  );
};

export enum ColumnDirectionType {
  HORIZONTAL = 'HORIZONTAL',
  VERTICAL = 'VERTICAL',
}
export interface MultiColumnWrapperProps {
  width?: WidthType;
  gap?: GapType;
  columnDirection?: ColumnDirectionType;
}

const MultiColumnWrapper = ({
  width = 'w-full',
  gap = 'gap-4',
  columnDirection = ColumnDirectionType.HORIZONTAL,
  children,
}: PropsWithChildren<MultiColumnWrapperProps>) => {
  return (
    <div
      className={ComponentUtils.cn(
        'flex',
        gap,
        columnDirection === ColumnDirectionType.HORIZONTAL
          ? 'flex-row items-center'
          : 'flex-col',
        width,
      )}
    >
      {children}
    </div>
  );
};

export interface TwoColumnWrapperProps extends MultiColumnWrapperProps {
  firstElement: ReactElement;
  secondElement: ReactElement;
  width?: WidthType;
  separator?: string;
}

const TwoColumnWrapper = ({
  firstElement,
  secondElement,
  separator,
  ...multiColumnWrapperProps
}: TwoColumnWrapperProps) => {
  return (
    <MultiColumnWrapper {...multiColumnWrapperProps}>
      {firstElement}
      <div className="flex h-full w-16 flex-none items-center justify-center">
        {separator && (
          <span className="font-size-16 font-medium">{separator}</span>
        )}
      </div>
      {secondElement}
    </MultiColumnWrapper>
  );
};

export const FormComponent = {
  Wrapper: FormComponentWrapper,
  TwoColumnWrapper,
  MultiColumnWrapper,
};
