import { InputHTMLAttributes } from 'react';
import TextInput, {
  TextInputProps,
} from '@design-system/components/text/TextInput';
import { DataQuery } from '@design-system/types';
import {
  ButtonSizeEnum,
  DisplayTypeEnum,
  IconNamesEnum,
} from '@design-system/root/src';
import IconButton from '@design-system/components/button/IconButton';
import ComponentUtils from '@design-system/utils/componentUtils';

interface SearchKeywordTextInputProps
  extends
    Pick<TextInputProps, 'value' | 'onClearButtonClick' | 'placeholder'>,
    DataQuery {
  onChange: InputHTMLAttributes<HTMLInputElement>['onChange'];
  className?: string;
}

const SearchKeywordTextInput = ({
  value,
  onChange,
  onClearButtonClick,
  placeholder,
  dataQk,
  className,
}: SearchKeywordTextInputProps) => {
  return (
    <TextInput
      displayType={DisplayTypeEnum.OUTLINED}
      inputWrapperClassName={ComponentUtils.cn('min-h-46', className)}
      inputType="text"
      inputMode="search"
      width="w-full"
      value={value}
      placeholder={placeholder}
      onClearButtonClick={onClearButtonClick}
      onChange={onChange}
      dataQk={dataQk}
      rightElement={
        <IconButton iconName={IconNamesEnum.Search} size={ButtonSizeEnum.S} />
      }
    />
  );
};

export default SearchKeywordTextInput;
