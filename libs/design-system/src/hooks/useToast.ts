import { useRef, useState } from 'react';
import { ToastDataType } from '@design-system/components/ToastMessage';

export interface ToastControlsType extends ReturnType<typeof useToast> {}

const useToast = () => {
  const idsRef = useRef<number>(0);
  const [toastDataList, _setToastDataList] = useState<ToastDataType[]>([]);
  const toastDataListRef = useRef<ToastDataType[]>([]);
  const setToastDataList = (toastDataList: ToastDataType[]) => {
    _setToastDataList(toastDataList);
    toastDataListRef.current = toastDataList;
  };

  /**
   * ToastMessage 추가
   * @param toastData 추가할 토스트 데이터 배열
   * @param disappearTime 처음 팝업되고 사라지기 까지의 시간(ms)
   */
  const addToast = (
    toastData: Omit<ToastDataType, 'id'>,
    disappearTime = 3000,
  ): ToastDataType => {
    const toast: ToastDataType = { ...toastData, id: idsRef.current };
    idsRef.current += 1;

    if (!toast.isPermanent) {
      const timerId = setTimeout(() => {
        removeToastById(toast.id);
      }, disappearTime);
      toast.timerId = timerId;
    }
    setToastDataList([...toastDataListRef.current, toast]);
    return toast;
  };

  /**
   * 특정 ToastMessage 제거
   * @param targetId 제거할 ToastMessage의 id
   */
  const removeToastById = (targetId: number) => {
    const willRemoveToastData = toastDataListRef.current.find(
      (toastData) => toastData.id === targetId,
    );
    if (willRemoveToastData) {
      clearTimeout(willRemoveToastData.timerId);
      setToastDataList(
        toastDataListRef.current.filter(
          (toastData) => toastData.id !== targetId,
        ),
      );
    }
  };

  /**
   * 모든 ToastMessage 제거
   */
  const clearAllToast = () => {
    toastDataList.forEach((toastData) => clearTimeout(toastData.timerId));
    setToastDataList([]);
  };

  return {
    toastDataList,
    addToast,
    removeToastById,
    clearAllToast,
  };
};

export default useToast;
