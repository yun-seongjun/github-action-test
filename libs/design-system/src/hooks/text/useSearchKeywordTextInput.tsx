import { useState } from 'react';

const useSearchKeywordTextInput = () => {
  const [searchKeyword, setSearchKeyword] = useState<string>();

  const changeSearchKeywordValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchKeywordNew = e.target.value;
    setSearchKeyword(searchKeywordNew);
  };
  const clearSearchKeyword = () => {
    setSearchKeyword(undefined);
  };

  const isMatchBySearchKeyword = (
    ...textsShouldMatch: (string | undefined | null)[]
  ) => {
    if (!searchKeyword) return true;
    return textsShouldMatch.some((textShouldMatch) => {
      const textsShouldMatchLowerCase = textShouldMatch?.toLowerCase();
      return textsShouldMatchLowerCase?.includes(searchKeyword.toLowerCase());
    });
  };

  return {
    searchKeyword,
    clearSearchKeyword,
    changeSearchKeywordValue,
    isMatchBySearchKeyword,
  };
};

export default useSearchKeywordTextInput;
