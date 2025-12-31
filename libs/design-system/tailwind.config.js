const plugin = require('tailwindcss/plugin');

const FONT_SIZE_BASE = 10;
const fitContentProperty = { fit: 'fit-content' };

// base font-size: 10px
const rem0_1000 = {
  ...Array.from(Array(2001)).map((_, i) => `${i / FONT_SIZE_BASE}rem`),
};
const fontSize0_200 = () => {
  const sizeObj = {};
  Array.from(Array(201)).forEach((_, i) => {
    sizeObj[`.font-size-${[i]}`] = { fontSize: `${i / FONT_SIZE_BASE}rem` };
  });
  return sizeObj;
};

const config = {
  future: {
    hoverOnlyWhenSupported: true,
  },
  fontSizeBase: FONT_SIZE_BASE,
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    // Or if using `src` directory:
    './src/**/*.{js,ts,jsx,tsx}',
    '../../libs/design-system/**/*.{js,ts,jsx,tsx}', // 예시
    './node_modules/@neubie/design-system/**/*.{js,ts,jsx,tsx}',
  ],
  prefix: '',
  theme: {
    fontWeight: {
      light: 300,
      medium: 500,
      bold: 700,
    },
    colors: {
      white: '#FFFFFF',
      black: '#000000',
      order: {
        DEFAULT: '#00B2E3',
        50: '#E0F4FA',
        100: '#AFE3F3',
        200: '#7BD1EC',
        300: '#44BFE6',
        400: '#00B2E3',
        500: '#00A5E0',
        600: '#0097D2',
        700: '#0085C0',
        800: '#0074AD',
        900: '#00548D',
      },
      primary: {
        900: '#004E34',
        800: '#006644',
        700: '#008458',
        600: '#00A971',
        500: '#00BA7C',
        DEFAULT: '#00BA7C',
        400: '#33C896',
        300: '#54D1A7',
        200: '#8ADFC3',
        100: '#B0EAD6',
        50: '#E6F8F2',
      },
      secondary: {
        900: '#1C2D6B',
        800: '#243B8C',
        700: '#2F4DB5',
        600: '#3C62E8',
        500: '#426CFF',
        DEFAULT: '#426CFF',
        400: '#6889FF',
        300: '#809DFF',
        200: '#A8BBFF',
        100: '#C4D1FF',
        50: '#ECF0FF',
      },
      tertiary: {
        900: '#311300',
        800: '#512300',
        700: '#733500',
        600: '#984800',
        500: '#B85F1A',
        400: '#D87832',
        300: '#F8914A',
        DEFAULT: '#F8914A',
        200: '#FFB689',
        100: '#FFDBC8',
        50: '#FFEDE4',
      },
      red: {
        900: '#410003',
        800: '#680008',
        700: '#910611',
        600: '#B42626',
        500: '#D7403B',
        400: '#FA5952',
        DEFAULT: '#FA5952',
        300: '#FF8980',
        200: '#FFB3AC',
        100: '#FFDAD6',
        50: '#FFEDEB',
      },
      mono: {
        900: '#000000',
        800: '#262626',
        DEFAULT: '#262626',
        700: '#434343',
        600: '#555555',
        500: '#7B7B7B',
        400: '#9D9D9D',
        300: '#C4C4C4',
        200: '#D9D9D9',
        100: '#E9E9E9',
        50: '#F5F5F5',
      },
      error: '#C83532',
      warning: '#EF8A43',
      link: '#2C60F5',
      success: '#4F9F52',
      /**
       * select는 프론트에서만 정의된 색상입니다.(pd와 논의된게 아닙니다)
       * bg-[#D2E5DF] 로 했을때 적용이 안되어서 아래와 같이 정의
       */
      select: '#D2E5DF',
      transparent: 'transparent',
    },
    blur: rem0_1000,
    borderWidth: rem0_1000,
    fontSize: rem0_1000,
    lineHeight: rem0_1000,
    minWidth: { ...rem0_1000, ...fitContentProperty },
    minHeight: { ...rem0_1000, ...fitContentProperty },
    maxWidth: { ...rem0_1000, ...fitContentProperty },
    maxHeight: { ...rem0_1000, ...fitContentProperty },
    spacing: {
      ...rem0_1000,
    },
    zIndex: {
      one: 1,
      map: {
        rectangle: {
          selectWay: 1030,
          dragBox: 2100,
        },
        polyline: {
          normal: 1000,
          custom: 1010,
          currentPath: 1020,
          centerWay: 1030,
          partialWay: 1040,
        },
        point: 1100,
        marker: {
          'accident-zone': 1050,
          'simplify-normal': 1120,
          'simplify-base': 1130,
          'simplify-station': 1140,
          'simplify-robot': 1150,
          'simplify-custom': 1160,
          normal: 1200,
          base: 1300,
          station: 1400,
          robot: 1500,
          custom: 1600,
          'click-node': 1700,
          'robot-location': 1800,
          activated: 1950,
          hover: 2000,
          'tool-box': 2100,
        },
      },
      'table-content': 3100,
      'table-header': 3200,
      ol: 3300, // option list
      tipPopup: 3500,
      nonModal: 4000,
      modal: 5000,
      toast: 6000,
      loading: 9000,
      emergency: 9010,
      // 삭제될 예정
      cardTag: '5',
      cardDim: '10',
      subHeader: '15',
      header: '20',
      cta: '25',
      dim: '30',
      bottomSheet: '35',
      'order-modal': '40',
      'order-toast': '50',
      'order-loading': '100',
    },
    gap: rem0_1000,
    borderRadius: {
      ...rem0_1000,
      none: '0',
      'extra-small': '0.4rem',
      small: '0.8rem',
      medium: '1.6rem',
      large: '3.2rem',
      'extra-large': '4.8rem',
      full: '9999px',
    },
    extend: {
      boxShadow: {
        'light-bottom-1': '0 2px 2px 0 rgba(0, 0, 0, 0.1)',
        'light-bottom-2': '0 4px 4px 0 rgba(0, 0, 0, 0.1)',
        'light-bottom-3': '0 8px 8px 0 rgba(0, 0, 0, 0.1)',
        'light-bottom-4': '0 12px 12px 0 rgba(0, 0, 0, 0.1)',

        'light-left-1': '-2px 0 2px 0 rgba(0, 0, 0, 0.1)',
        'light-left-2': '-4px 0 4px 0 rgba(0, 0, 0, 0.1)',
        'light-left-3': '-8px 0 8px 0 rgba(0, 0, 0, 0.1)',
        'light-left-4': '-12px 0 12px 0 rgba(0, 0, 0, 0.1)',

        'light-right-1': '2px 0 2px 0 rgba(0, 0, 0, 0.1)',
        'light-right-2': '4px 0 4px 0 rgba(0, 0, 0, 0.1)',
        'light-right-3': '8px 0 8px 0 rgba(0, 0, 0, 0.1)',
        'light-right-4': '12px 0 12px 0 rgba(0, 0, 0, 0.1)',

        'light-top-1': '0 -2px 2px 0 rgba(0, 0, 0, 0.1)',
        'light-top-2': '0 -4px 4px 0 rgba(0, 0, 0, 0.1)',
        'light-top-3': '0 -8px 8px 0 rgba(0, 0, 0, 0.1)',
        'light-top-4': '0 -12px 12px 0 rgba(0, 0, 0, 0.1)',

        'dark-bottom-1': '0 2px 2px 0 rgba(0, 0, 0, 0.25)',
        'dark-bottom-2': '0 4px 4px 0 rgba(0, 0, 0, 0.25)',
        'dark-bottom-3': '0 8px 8px 0 rgba(0, 0, 0, 0.25)',
        'dark-bottom-4': '0 12px 12px 0 rgba(0, 0, 0, 0.25)',

        'dark-left-1': '-2px 0 2px 0 rgba(0, 0, 0, 0.25)',
        'dark-left-2': '-4px 0 4px 0 rgba(0, 0, 0, 0.25)',
        'dark-left-3': '-8px 0 8px 0 rgba(0, 0, 0, 0.25)',
        'dark-left-4': '-12px 0 12px 0 rgba(0, 0, 0, 0.25)',

        'dark-right-1': '2px 0 2px 0 rgba(0, 0, 0, 0.25)',
        'dark-right-2': '4px 0 4px 0 rgba(0, 0, 0, 0.25)',
        'dark-right-3': '8px 0 8px 0 rgba(0, 0, 0, 0.25)',
        'dark-right-4': '12px 0 12px 0 rgba(0, 0, 0, 0.25)',

        'dark-top-1': '0 -2px 2px 0 rgba(0, 0, 0, 0.25)',
        'dark-top-2': '0 -4px 4px 0 rgba(0, 0, 0, 0.25)',
        'dark-top-3': '0 -8px 8px 0 rgba(0, 0, 0, 0.25)',
        'dark-top-4': '0 -12px 12px 0 rgba(0, 0, 0, 0.25)',
      },
    },
    backgroundImage: {
      'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      'gradient-to-br': 'linear-gradient(to right, var(--tw-gradient-stops));',
    },
    listStyleType: {
      square: 'square',
    },
  },
  plugins: [
    import('tailwind-scrollbar-hide'),
    plugin(function ({ addUtilities }) {
      addUtilities({
        ...fontSize0_200(),
        '.font-size-12': { fontSize: '1.2rem', lineHeight: '1.7rem' },
        '.font-size-14': { fontSize: '1.4rem', lineHeight: '2rem' },
        '.font-size-16': { fontSize: '1.6rem', lineHeight: '2.2rem' },
        '.font-size-18': { fontSize: '1.8rem', lineHeight: '2.5rem' },
        '.font-size-20': { fontSize: '2rem', lineHeight: '2.8rem' },
        '.font-size-24': { fontSize: '2.4rem', lineHeight: '3.4rem' },
        '.font-size-28': { fontSize: '2.8rem', lineHeight: '3.9rem' },
        '.font-size-32': { fontSize: '3.2rem', lineHeight: '4.5rem' },
        '.font-size-36': { fontSize: '3.6rem', lineHeight: '5rem' },
        '.font-size-42': { fontSize: '4.2rem', lineHeight: '6rem' },
        '.font-size-48': { fontSize: '4.8rem', lineHeight: '6.2rem' },
        '.font-size-54': { fontSize: '5.4rem', lineHeight: '7rem' },
        '.font-size-60': { fontSize: '6.0rem', lineHeight: '7.8rem' },
        '.font-size-68': { fontSize: '6.8rem', lineHeight: '8.8rem' },
        '.font-size-76': { fontSize: '7.6rem', lineHeight: '9.9rem' },
        '.font-size-84': { fontSize: '8.4rem', lineHeight: '10.9rem' },
        '.font-size-92': { fontSize: '9.2rem', lineHeight: '12rem' },
      });
    }),
    plugin(function ({ addVariant }) {
      addVariant('hover', '@media(hover :hover) and (pointer: fine){&:hover}');
    }),
  ],
};

module.exports = config;
