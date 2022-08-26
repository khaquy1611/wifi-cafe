import React from 'react';
import Select from 'react-select';

interface ValueType {
    value: string;
    label: string;
}

interface PropsType {
    options: ValueType[];
    search: string;
    setSearch: (value: string) => void;
    setFilter?: (value: string) => void;
    placeholder?: string;
}

const SearchBox = ({ options, search, setSearch, setFilter, placeholder }: PropsType) => {
    const allOptions = [{ value: '', label: 'Tất cả' }, ...options];
    const index = allOptions.findIndex((item) => item.value === search);
    return (
        <Select
            value={allOptions[index]}
            instanceId="select"
            onChange={(option) => {
                setSearch(option?.value || '');
                if (setFilter) setFilter('all');
            }}
            placeholder={placeholder}
            isClearable
            isSearchable
            options={allOptions}
            noOptionsMessage={(option) => `Không có món ${option.inputValue}`}
            className="bxSearch"
        />
    );
};

export default SearchBox;
