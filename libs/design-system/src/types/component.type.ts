export type WidthType =
  | `w-${number}`
  | 'w-full'
  | 'w-auto'
  | 'w-fit'
  | `w-${number}/${number}`
  | `w-[${string}]`;

export type MinWidthType = `min-w-${number}` | `min-w-${number}/${number}`;

export type MaxWidthType = `max-w-${number}` | `max-w-${number}/${number}`;

export type HeightType =
  | `h-${number}`
  | 'h-full'
  | 'h-auto'
  | 'h-fit'
  | `h-${number}/${number}`
  | `h-[${string}]`
  | 'h-screen'
  | 'h-dvh';

export type MinHeightType =
  | `min-h-${number}`
  | `min-h-[${string}]`
  | 'min-h-full'
  | `min-h-${number}/${number}`;

export type MaxHeightType =
  | `max-h-${number}`
  | `max-h-[${string}]`
  | 'max-h-full'
  | `max-h-${number}/${number}`;

export type SizeType = `size-${number}` | 'size-full';

export type FontSizeType = `font-size-${number}`;

export type FontWeightType = `font-${string}`;

export type BgColorType = `bg-${string}` | `bg-${string}-${number}`;

export type BorderColorType = `border-${string}` | `border-${string}-${number}`;
export type BorderSizeType = `border-${number}` | `border-${string}`;

export type TextColorType = `text-${string}` | `text-${string}-${number}`;

export type TextHoverColorType =
  | `hover:text-${string}`
  | `hover:text-${string}-${number}`;

export type TextActiveColorType =
  | `active:text-${string}`
  | `active:text-${string}-${number}`;

export type TextDisabledColorType =
  | `disabled:text-${string}`
  | `disabled:text-${string}-${number}`;

export type OpacityType = `opacity-${number}`;

export type GapType = `gap-${number}`;

export type GapVerticalType = `gap-y-${number}`;

export type PaddingType = `p-${number}`;

export type PaddingRightType = `pr-${number}`;

export type PaddingYType = `py-${number}`;

export type ImgIconsSrcType = `/imageIcons/${string}.svg`;

export type ZIndexType = `z-${string}`;

export type RoundedType = `rounded-${string}`;

export type BasisType =
  | 'basis-full'
  | `basis-${number}`
  | `basis-${number}/${number}`;
export type RectType = { width: number; height: number };
