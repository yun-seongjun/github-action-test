import {
  MutableRefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  DefaultValues,
  FieldPath,
  FieldPathValue,
  FieldValues,
  KeepStateOptions,
  Path,
  PathValue,
  SetValueConfig,
  useForm as useFormHookForm,
  UseFormProps,
  UseFormReturn as UseHookFormReturn,
} from 'react-hook-form';

export type FormControl<
  TFieldValues extends FieldValues = FieldValues,
  TContext = unknown,
> = UseHookFormReturn<TFieldValues, TContext> & {
  formRef: MutableRefObject<HTMLFormElement | null>;
  requestSubmit: () => boolean;
  clear: (keepStateOptions?: KeepStateOptions) => void;
  clearField: (name: FieldPath<TFieldValues>) => void;
  clearFields: (names: FieldPath<TFieldValues>[]) => void;
  isDirtyField: (name: FieldPath<TFieldValues>) => boolean;
};

/**
 * form에 컴포넌트를 등록하는 함수
 * validation, onChange에서 value 타입 추론을 하기 위해서 필요함
 * @example
 * import useForm from '@design-system/hooks/form/useForm'
 *
 * const { registers: { regi }, ...formControl } = useForm<TestFormProps>();
 * <Form<TestFormProps> formControl={formControl}>
 *     <TextInput
 *         {...regi("text")}
 *     />
 * </>
 */
export type RegiType<
  TFieldValues extends FieldValues = FieldValues,
  TContext = unknown,
> = <TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>(
  /**
   * form interface에서 해당 컴포넌트가 사용하는 이름
   */
  name: TFieldName,
) => {
  name: TFieldName;
  formControl: FormControl<TFieldValues, TContext>;
};

/**
 * form에 DateRange 컴포넌트를 등록하는 함수
 * validation, onChange에서 value 타입 추론을 하기 위해서 필요함
 * @example
 * import useForm from '@design-system/hooks/form/useForm'
 *
 * const { registers: { regiDateRange }, ...formControl } = useForm<TestFormProps>();
 * <Form<TestFormProps> formControl={formControl}>
 *     <FormDatePicker
 *         {...regiDateRange(["openAt", "closeAt"])}
 *     />
 * </>
 */
export type RegiDateRangeType<
  TFieldValues extends FieldValues = FieldValues,
  TContext = unknown,
> = <
  TFieldNameStart extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TFieldNameEnd extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  /**
   * form interface에서 해당 컴포넌트가 사용하는 이름
   * [시작 이름, 종료 이름]
   */
  names: [TFieldNameStart, TFieldNameEnd],
) => {
  names: [TFieldNameStart, TFieldNameEnd];
  formControl: FormControl<TFieldValues, TContext>;
};

/**
 * form에 여러개의 컴포넌트를 등록하는 함수
 * validation, onChange에서 value 타입 추론을 하기 위해서 필요함
 * @example
 * import useForm from '@design-system/hooks/form/useForm'
 *
 * const { registers: { regiMultiple }, ...formControl } = useForm<TestFormProps>();
 * <Form<TestFormProps> formControl={formControl}>
 *   <FormTextInputPair
 *           {...regiMultiple(['pair1', 'pair2'])}
 *   />
 * </>
 */
export type RegiMultipleType<
  TFieldValues extends FieldValues = FieldValues,
  TContext = unknown,
> = <TFieldNames extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>(
  /**
   * form interface에서 해당 컴포넌트가 사용하는 이름
   * [이름, 이름, ...이름]
   */
  names: TFieldNames[],
) => {
  names: TFieldNames[];
  formControl: FormControl<TFieldValues, TContext>;
};

/**
 * setValue 시 shouldUpdateDirty를 true로 하면, 해당 field가 변경될 때 마다 watch가 실행되지 않음
 * 따라서 isDirty를 확인하기 위해 별도로 구현함
 * isDirty의 의미: 해당 field의 값을 사용하자 1번이라도 수정한 경우에 true
 */
const useDirtyField = <TFieldValues extends FieldValues = FieldValues>() => {
  const [dirtyFieldNameSet, setDirtyFieldNameSet] = useState<
    Set<FieldPath<TFieldValues>>
  >(new Set<FieldPath<TFieldValues>>());

  /**
   * form의 값을 설정 하면, dirtyFieldNameSet에 해당 field의 name을 추가
   * @param name
   */
  const addDirtyField = useCallback(
    <TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>(
      name: TFieldName,
    ) => {
      setDirtyFieldNameSet((prev) => {
        if (!prev.has(name)) {
          prev.add(name);
        }
        return prev;
      });
    },
    [setDirtyFieldNameSet],
  );

  /**
   * form의 값을 reset 하면, dirtyFieldNameSet에 해당 field의 name을 추가
   * 단 option.keepDirty가 true인 경우, 해당 field의 name을 추가하지 않음
   * @param name
   */
  const removeDirtyField = useCallback(
    <TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>(
      name: TFieldName,
    ) => {
      setDirtyFieldNameSet((prev) => {
        prev.delete(name);
        return prev;
      });
    },
    [setDirtyFieldNameSet],
  );

  /**
   * form의 값을 reset 하면, dirtyFieldNameSet에 해당 field의 name을 추가
   * 단 option.keepDirty가 true인 경우, 해당 field의 name을 추가하지 않음
   * @param name
   */
  const removeDirtyFields = useCallback(
    <TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>(
      names: TFieldName[],
    ) => {
      setDirtyFieldNameSet((prev) => {
        names.forEach((name) => prev.delete(name));
        return prev;
      });
    },
    [setDirtyFieldNameSet],
  );

  /**
   * form의 값을 reset하면, dirtyFieldNameSet을 초기화 하여 모든 name을 제거
   */
  const clearDirtyFields = useCallback(() => {
    setDirtyFieldNameSet((prev) => {
      prev.clear();
      return prev;
    });
  }, [setDirtyFieldNameSet]);

  /**
   * isDirty 여부를 확인하는 함수
   * @param name
   */
  const isDirtyField = useCallback(
    <TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>(
      name: TFieldName,
    ): boolean => {
      return dirtyFieldNameSet.has(name);
    },
    [dirtyFieldNameSet],
  );

  const getDirtyFields = useCallback(() => {
    return Array.from(dirtyFieldNameSet);
  }, [dirtyFieldNameSet]);

  return {
    addDirtyField,
    removeDirtyField,
    removeDirtyFields,
    clearDirtyFields,
    isDirtyField,
    getDirtyFields,
  };
};

/**
 * useForm의 return type
 */
export interface UseFormMethods<
  TFieldValues extends FieldValues = FieldValues,
  TContext = unknown,
> extends FormControl<TFieldValues, TContext> {
  registers: {
    regi: RegiType<TFieldValues, TContext>;
    regiDateRange: RegiDateRangeType<TFieldValues, TContext>;
    regiMultiple: RegiMultipleType<TFieldValues, TContext>;
  };
  formRef: MutableRefObject<HTMLFormElement | null>;
}

/**
 * react-hook-form의 useForm의 wrapping한 hook
 */
const useForm = <
  TFieldValues extends FieldValues = FieldValues,
  TContext = unknown,
>(
  props?: UseFormProps<TFieldValues>,
): UseFormMethods<TFieldValues, TContext> => {
  const {
    addDirtyField,
    removeDirtyField,
    clearDirtyFields,
    isDirtyField,
    getDirtyFields,
  } = useDirtyField<TFieldValues>();
  const formRef = useRef<HTMLFormElement | null>(null);
  const {
    mode = 'onChange',
    reValidateMode = 'onChange',
    criteriaMode = 'firstError',
    defaultValues,
    ...formProps
  } = props || {};
  const {
    setValue: setValueOri,
    reset: resetOri,
    resetField: resetFieldOri,
    ...formControlOri
  } = useFormHookForm<TFieldValues, TContext>({
    mode,
    reValidateMode,
    criteriaMode,
    ...formProps,
  });

  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues as TFieldValues);
    }
  }, []);

  /**
   * setValue, shouldValidate의 기본값을 true로 설정하기 위해 override 함
   * @param name name
   * @param value value
   * @param options SetValueConfig
   */
  const setValue = useCallback(
    <TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>(
      name: TFieldName,
      value: FieldPathValue<TFieldValues, TFieldName>,
      options?: SetValueConfig,
    ) => {
      addDirtyField(name);
      setValueOri(name, value, { shouldValidate: true, ...options });
    },
    [addDirtyField, setValueOri],
  );

  type ResetAction<TFieldValues> = (formValues: TFieldValues) => TFieldValues;
  const reset = useCallback(
    (
      values?:
        | DefaultValues<TFieldValues>
        | TFieldValues
        | ResetAction<TFieldValues>,
      keepStateOptions?: KeepStateOptions,
    ) => {
      clearDirtyFields();
      resetOri(values, keepStateOptions);
    },
    [clearDirtyFields, resetOri],
  );

  const resetField = useCallback(
    <TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>(
      name: TFieldName,
      options?: Partial<{
        keepDirty: boolean;
        keepTouched: boolean;
        keepError: boolean;
        defaultValue: FieldPathValue<TFieldValues, TFieldName>;
      }>,
    ) => {
      if (!options?.keepDirty) {
        removeDirtyField(name);
      }
      resetFieldOri(name, options);
    },
    [removeDirtyField, resetFieldOri],
  );

  /**
   * 모든 values를 undefined로 초기화함
   * TODO null로 reset 했을때 FormUICheckBoxGroup 같은 경우 에러가 발생(values의 기본값이 []였어기 때문에, 일단은 FormUICheckBoxGroup 수정하여 해결)
   * TODO 추후에 클리어 함수 수정 필요
   *
   */
  const clear = useCallback(
    (keepStateOptions?: KeepStateOptions) => {
      const currentValues = formControlOri.getValues();
      const dataRest = getDirtyFields().reduce((acc, name) => {
        const currentValue = currentValues[name as keyof typeof currentValues];
        if (Array.isArray(currentValue)) {
          // 배열인 경우 빈 배열로 초기화
          acc[name] = [] as unknown as PathValue<
            TFieldValues,
            Path<TFieldValues>
          >;
        } else {
          // 기본 타입(문자열, 숫자 등)인 경우 null로 초기화
          acc[name] = null as PathValue<TFieldValues, Path<TFieldValues>>;
        }
        return acc;
      }, {} as TFieldValues);
      clearDirtyFields();
      resetOri(dataRest, {
        ...keepStateOptions,
        keepDefaultValues: false,
        keepValues: false,
      });
    },
    [clearDirtyFields, resetOri],
  );

  const clearField = useCallback(
    (name: FieldPath<TFieldValues>) => {
      resetField(name, {
        keepDirty: false,
        defaultValue: null as PathValue<TFieldValues, Path<TFieldValues>>,
      });
    },
    [resetField],
  );

  /**
   * 입력 받은 name들의 value를 undefined로 초기화함
   */
  const clearFields = useCallback(
    (names: FieldPath<TFieldValues>[]) => {
      names.forEach((name) => clearField(name));
    },
    [clearField],
  );

  const requestSubmit = useCallback(() => {
    if (!formRef.current) {
      return false;
    }
    formRef.current.requestSubmit();
    return true;
  }, []);

  const formControl = {
    ...formControlOri,
    formRef,
    requestSubmit,
    setValue,
    reset,
    resetField,
    clear,
    clearField,
    clearFields,
    isDirtyField,
  };

  const regi: RegiType<TFieldValues, TContext> = (name) => {
    return { name, formControl };
  };

  const regiDateRange: RegiDateRangeType<TFieldValues, TContext> = (names) => {
    return { names, formControl };
  };

  const regiMultiple: RegiMultipleType<TFieldValues, TContext> = (names) => {
    return { names, formControl };
  };

  return {
    registers: {
      regi,
      regiDateRange,
      regiMultiple,
    },
    ...formControl,
  };
};

export default useForm;
