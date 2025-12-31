import { DateTypeEnum } from '@design-system/components/DatePicker';
import {
  DateUtils,
  defaultUtcOffsetMinute,
} from '@design-system/utils/dateUtils';
import { TextUtils } from '@design-system/utils/textUtils';

interface UseDateRangePickerProps {
  dateType: DateTypeEnum;
  min?: string | number;
  max?: string | number;
  valueStart?: string | null;
  valueEnd?: string | null;
  rangeDay?: number;
  utcOffsetMinute?: number;
}

const useDateRangePicker = ({
  dateType,
  min,
  max,
  valueStart,
  valueEnd,
  rangeDay,
  utcOffsetMinute = defaultUtcOffsetMinute,
}: UseDateRangePickerProps) => {
  const maxUtcOffset = `${max}T00:00:00${DateUtils.toUtcOffsetString(utcOffsetMinute)}`;
  const minStart = DateUtils.toDateStrForDisplay(
    dateType,
    TextUtils.getMax(
      min,
      DateUtils.getDatetimeSecondBefore(valueEnd, rangeDay),
    ),
    utcOffsetMinute,
  );
  const maxStart = DateUtils.toDateStrForDisplay(
    dateType,
    TextUtils.getMin(maxUtcOffset, valueEnd),
    utcOffsetMinute,
  );
  const minEnd = DateUtils.toDateStrForDisplay(
    dateType,
    TextUtils.getMax(min, valueStart),
    utcOffsetMinute,
  );
  const maxEnd = DateUtils.toDateStrForDisplay(
    dateType,
    TextUtils.getMin(
      maxUtcOffset,
      DateUtils.getDatetimeSecondAfter(valueStart, rangeDay),
    ),
    utcOffsetMinute,
  );
  return {
    minStart,
    maxStart,
    minEnd,
    maxEnd,
  };
};

export default useDateRangePicker;
