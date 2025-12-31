import { cva, type VariantProps } from 'class-variance-authority';
import { DataQuery } from '@design-system/types/common.type';

export enum SpinnerSizeEnum {
  XS = 'xs',
  S = 's',
  M = 'm',
  L = 'l',
}
export enum SpinnerColorEnum {
  PRIMARY = 'primary',
  MONO = 'mono',
  WHITE = 'white',
  ORDER_PRIMARY = 'order-primary',
}
export const spinnerIconVariants = cva('animate-spin', {
  variants: {
    size: {
      [SpinnerSizeEnum.L]: 'h-56 w-56',
      [SpinnerSizeEnum.M]: 'h-24 w-24',
      [SpinnerSizeEnum.S]: 'h-20 w-20',
      [SpinnerSizeEnum.XS]: 'h-16 w-16',
    },
    color: {
      [SpinnerColorEnum.PRIMARY]: 'text-primary-500',
      [SpinnerColorEnum.MONO]: 'text-mono-200',
      [SpinnerColorEnum.WHITE]: 'text-white',
      [SpinnerColorEnum.ORDER_PRIMARY]: 'text-order',
    },
  },
  defaultVariants: {
    size: SpinnerSizeEnum.M,
    color: SpinnerColorEnum.PRIMARY,
  },
});

interface SpinnerIconProps
  extends VariantProps<typeof spinnerIconVariants>, DataQuery {}

const SpinnerAtom = (props: SpinnerIconProps) => {
  const { dataQk = 'spinner', ...styles } = props;
  return (
    <svg
      className={spinnerIconVariants(styles)}
      viewBox="0 0 56 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-qk={dataQk}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M25.6666 7.00002C25.6666 5.71136 26.7113 4.66669 28 4.66669C40.8866 4.66669 51.3333 15.1134 51.3333 28C51.3333 29.2887 50.2886 30.3334 49 30.3334C47.7113 30.3334 46.6666 29.2887 46.6666 28C46.6666 17.6907 38.3093 9.33335 28 9.33335C26.7113 9.33335 25.6666 8.28868 25.6666 7.00002Z"
        fill="currentColor"
      />
    </svg>
  );
};

export default SpinnerAtom;
