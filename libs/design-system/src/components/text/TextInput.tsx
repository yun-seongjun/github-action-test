import {
  ChangeEvent,
  forwardRef,
  InputHTMLAttributes,
  ReactElement,
  Ref,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  BaseDisplay,
  WrapperProps,
} from '@design-system/components/BaseDisplay';
import { IconNamesEnum } from '@design-system/constants/iconNames.enum';
import { ComponentUtils } from '@design-system/utils/componentUtils';
import { NumberUtils } from '@design-system/utils/numberUtils';

enum PasswordMaskTypeEnum {
  /**
   * 패스워드를 ***로 출력
   */
  MASKING_TEXT = 'MASKING_TEXT',
  /**
   * 패스워드를 평문으로 출력
   */
  UNMASKING_TEXT = 'UNMASKING_TEXT',
}

interface RightElementsProps {
  /**
   * 값을 지우는 버튼을 노출할지 여부
   */
  showClearButton: boolean;
  /**
   * 값을 지우는 버튼의 click 이벤트
   */
  onClearButtonClick?: () => void;
  /**
   * 패스워드를 *** 또는 평문으로 전환하는 버튼을 노출할지 여부
   */
  showPasswordMaskButton: boolean;
  /**
   * 패스워드를 화면에 출력하는 유형
   */
  passwordMaskType?: PasswordMaskTypeEnum;
  /**
   * 패스워드 전환 버튼의 click 이벤트
   */
  onPasswordMaskButtonClick?: () => void;
  /**
   * 우측에 출력할 element
   */
  rightElement?: ReactElement;
  /**
   * disabled
   */
  disabled?: boolean;
}

const RightElements = ({
  showClearButton,
  onClearButtonClick,
  showPasswordMaskButton,
  passwordMaskType = PasswordMaskTypeEnum.MASKING_TEXT,
  onPasswordMaskButtonClick,
  rightElement,
  disabled,
}: RightElementsProps) => {
  return (
    <div className="flex flex-row items-center">
      {showClearButton && !disabled && (
        <BaseDisplay.IconElement
          name={IconNamesEnum.Delete}
          onClick={onClearButtonClick}
          disabled={disabled}
        />
      )}
      {showPasswordMaskButton && (
        <BaseDisplay.IconElement
          name={
            passwordMaskType === PasswordMaskTypeEnum.MASKING_TEXT
              ? IconNamesEnum.Eye
              : IconNamesEnum.EyeSlash
          }
          onClick={onPasswordMaskButtonClick}
          disabled={disabled}
        />
      )}
      {rightElement}
    </div>
  );
};

const isValueEmpty = (
  value: InputHTMLAttributes<HTMLInputElement>['value'],
): boolean => {
  return Array.isArray(value)
    ? value.length > 0
    : value === undefined || value === null || String(value).length === 0;
};

const getInputTypeCurrent = (
  inputType: TextInputProps['inputType'],
  passwordMaskType: PasswordMaskTypeEnum,
): TextInputProps['inputType'] => {
  if (
    inputType === 'password' &&
    passwordMaskType === PasswordMaskTypeEnum.UNMASKING_TEXT
  ) {
    return 'text';
  }

  return inputType;
};

export enum TextInputNumberType {
  /**
   * 정수
   */
  INTEGER = 'INTEGER',
  /**
   * 실수
   */
  DECIMAL = 'DECIMAL',
}

const DECIMAL_MAX_LENGTH = 17;
const DECIMAL_PART_MAX_LENGTH = 15;

export interface TextInputProps
  extends
    Omit<WrapperProps, 'componentRef' | 'className'>,
    Omit<InputHTMLAttributes<HTMLInputElement>, 'height' | 'width'> {
  /**
   * number는 정수를 입력 받기 위한 용도
   * decimal은 소수점 자리의 숫자를 입력받기 위한 용도
   */
  inputType?: Extract<
    InputHTMLAttributes<HTMLInputElement>['type'],
    'text' | 'number' | 'tel' | 'password'
  >;
  numberType?: TextInputNumberType;
  inputClassName?: string;
  inputWrapperClassName?: string;
  showClearButton?: boolean;
  onClearButtonClick?: () => void;
  onEnterPress?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  leftElement?: ReactElement;
  rightElement?: ReactElement;
  regExPattern?: RegExp;
}

const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  (
    {
      id,
      name,
      inputType = 'text',
      numberType = TextInputNumberType.INTEGER,
      showClearButton = true,
      onClearButtonClick,
      leftElement,
      rightElement,
      onClick,
      onChange,
      inputMode,
      value,
      maxLength,
      min,
      max,
      step = 'any',
      placeholder,
      inputClassName,
      inputWrapperClassName,
      onInput,
      onBlur,
      onKeyDown,
      onKeyUp,
      onEnterPress,
      onFocus,
      pattern,
      autoComplete,
      regExPattern,
      readOnly,
      dataQk,
      ...wrapperProps
    }: TextInputProps,
    ref: Ref<HTMLInputElement>,
  ) => {
    const { isError, disabled, displayType } = wrapperProps;
    const inputRef = useRef<HTMLInputElement | null>(null);
    const showPasswordMaskButton = inputType === 'password';
    const [passwordMaskType, setPasswordMaskType] =
      useState<PasswordMaskTypeEnum>(PasswordMaskTypeEnum.MASKING_TEXT);
    const keyLastPressedRef = useRef<string>();
    const [isFocus, setIsFocus] = useState(false);

    const handlePasswordMaskButtonClick = () => {
      setPasswordMaskType((prev) =>
        prev === PasswordMaskTypeEnum.MASKING_TEXT
          ? PasswordMaskTypeEnum.UNMASKING_TEXT
          : PasswordMaskTypeEnum.MASKING_TEXT,
      );
    };
    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
      onChange?.(e);
    };

    useEffect(() => {
      const handleFocus = () => setIsFocus(true);
      const handleBlur = () => setIsFocus(false);

      inputRef.current?.addEventListener('focus', handleFocus);
      inputRef.current?.addEventListener('blur', handleBlur);
      return () => {
        inputRef.current?.removeEventListener('focus', handleFocus);
        inputRef.current?.removeEventListener('blur', handleBlur);
      };
    }, []);

    return (
      <BaseDisplay.Wrapper
        {...wrapperProps}
        componentRef={inputRef}
        className={inputWrapperClassName}
        dataQk={dataQk}
      >
        <BaseDisplay.LeftElement componentRef={inputRef}>
          {leftElement}
        </BaseDisplay.LeftElement>
        <input
          id={id}
          name={name}
          className={BaseDisplay.getComponentClassName(
            isError,
            displayType,
            inputClassName,
          )}
          ref={(r) => ComponentUtils.setRefs(r, inputRef, ref)}
          type={getInputTypeCurrent(inputType, passwordMaskType)}
          onClick={onClick}
          onChange={handleInputChange}
          disabled={disabled}
          inputMode={inputMode}
          value={value ?? ''}
          step={step}
          maxLength={maxLength}
          min={min}
          max={max}
          pattern={pattern}
          onKeyDown={(e) => {
            if (inputType === 'number') {
              /**
               * -(마이너스) 키를 여러번 누르면, invalid 값이 입력되는 현상을 막기 위해 추가함
               * 일부 알파벳 키를 누르면, input의 값이 클리어 되는 현상을 막기 위해 추가함
               */
              const isControlKeyPressed =
                e.metaKey || e.altKey || e.ctrlKey || e.shiftKey;
              if (
                (e.key === '-' && keyLastPressedRef.current === e.key) ||
                (!isControlKeyPressed && /^([aAeE])$/.test(e.key)) ||
                (numberType === TextInputNumberType.INTEGER && e.key === '.')
              ) {
                e.preventDefault();
              }
            } else if (inputType === 'password' && e.key === ' ') {
              e.preventDefault();
            }
            keyLastPressedRef.current = e.key;
            onKeyDown?.(e);
          }}
          onKeyUp={(e) => {
            if (e.key === 'Enter') {
              onEnterPress?.(e);
            }
            onKeyUp?.(e);
          }}
          onBlur={(e) => {
            if (inputType === 'number' && !e.target.value) {
              e.target.value = '';
            }
            onBlur?.(e);
          }}
          onFocus={(e) => {
            onFocus?.(e);
          }}
          onInput={(e) => {
            const valueBefore = String(value);

            const processNumber = () => {
              const valueCurrent = e.currentTarget.value;
              const indexOfDot = e.currentTarget.value.indexOf('.');
              const hasValueDot = indexOfDot > -1;
              const lastIndexOfMinus = e.currentTarget.value.lastIndexOf('-');

              /**
               * -(마이너스) 키를 여러번 누르면, invalid 값이 입력되는 현상과
               * -(마이너스)가 중간에 입력되는 경우, 입력된 마이너스를 무시하도기 위해 추가함
               */
              const valueBefore = value ? String(value) : null;

              if (
                valueBefore &&
                !valueCurrent &&
                (keyLastPressedRef.current === '-' || lastIndexOfMinus > 0)
              ) {
                e.currentTarget.value = valueBefore;
                return;
              }

              /**
               * "0000" 또는 "-000123" 같은 형식으로 입력을 하지 못하도록 막기 위해 추가함
               */
              const isValueMinus = lastIndexOfMinus === 0;
              const valueCurrentAbsolute = isValueMinus
                ? valueCurrent.slice(1)
                : valueCurrent;
              const zeroPaddingLength =
                NumberUtils.getLeftZeroPaddingLength(valueCurrentAbsolute);
              if (zeroPaddingLength > -1) {
                const valueNew =
                  valueCurrentAbsolute.slice(zeroPaddingLength) || '0';
                e.currentTarget.value = isValueMinus
                  ? `-${valueNew}`
                  : valueNew;
                return;
              }

              /**
               * 정수 입력인 경우, 소수점 입력을 막기 위해 추가함
               */
              if (numberType === TextInputNumberType.INTEGER) {
                if (hasValueDot) {
                  e.currentTarget.value = e.currentTarget.value.replace(
                    '.',
                    '',
                  );
                }
                return;
              }

              // numberType === TextInputNumberType.DECIMAL 인 경우
              /**
               * 정수부, 소수부와 dot을 합쳐서 최대길이가 18을 넘을 수 없음
               * 최대 길이를 18로 하는 경우, 마지막 자리가 비정상적으로 저장 될 수 있기 때문에 17(DECIMAL_MAX_LENGTH)자리로 제한함
               */
              if (valueCurrent.length > DECIMAL_MAX_LENGTH) {
                e.currentTarget.value = valueCurrent.slice(
                  0,
                  DECIMAL_MAX_LENGTH,
                );
                return;
              }

              /**
               * 소수부의 최대 길이는 15. 15(DECIMAL_PART_MAX_LENGTH)를 초과한 경우, JS에서 인식 못함
               */
              const integerPart = valueCurrent.slice(0, indexOfDot);
              const decimalPart = valueCurrent.slice(indexOfDot + 1);
              if (decimalPart.length > DECIMAL_PART_MAX_LENGTH) {
                e.currentTarget.value = `${integerPart}.${decimalPart.slice(0, DECIMAL_PART_MAX_LENGTH)}`;
                return;
              }

              /**
               * 0.1 에서 가장 앞의 0을 지운 경우의 예외 처리
               */
              if (e.currentTarget.value.charAt(0) === '.') {
                e.currentTarget.value = `0${valueCurrent}`;
                return;
              }
            };
            if (inputType === 'number') {
              processNumber();
            }

            if (regExPattern && !regExPattern.test(e.currentTarget.value)) {
              e.currentTarget.value = valueBefore;
            }
            if (maxLength && e.currentTarget.value.length > maxLength) {
              e.currentTarget.value = e.currentTarget.value.slice(0, maxLength);
            }
            onInput?.(e);
          }}
          placeholder={placeholder}
          onMouseDown={BaseDisplay.onMouseDown}
          autoComplete={autoComplete}
          readOnly={readOnly}
          data-qk={dataQk}
        />
        <BaseDisplay.RightElement componentRef={inputRef}>
          <RightElements
            showClearButton={isFocus && showClearButton && !isValueEmpty(value)}
            onClearButtonClick={onClearButtonClick}
            showPasswordMaskButton={showPasswordMaskButton}
            passwordMaskType={passwordMaskType}
            onPasswordMaskButtonClick={handlePasswordMaskButtonClick}
            rightElement={rightElement}
            disabled={disabled}
          />
        </BaseDisplay.RightElement>
      </BaseDisplay.Wrapper>
    );
  },
);

TextInput.displayName = 'TextInput';

export default TextInput;
