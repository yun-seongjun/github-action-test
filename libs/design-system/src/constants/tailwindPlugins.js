const FONT_SIZE_BASE = 10;

const fontSize0_200 = () => {
  const sizeObj = {};
  Array.from(Array(201)).forEach((_, i) => {
    sizeObj[`font-size-${[i]}`] = { fontSize: `${i / FONT_SIZE_BASE}rem` };
  });
  return sizeObj;
};

export const requirePlugins = ['tailwind-scrollbar-hide'];
export const fontSize = {
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
};
