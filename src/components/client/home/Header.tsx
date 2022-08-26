import React from 'react';
import SearchBox from './components/Search';
import CategoryProduct from './components/Category';

interface PropsType {
    category?: {
        _id: string;
        logo: string;
        name: string;
    }[];
    options: {
        value: string;
        label: string;
    }[];
    search: string;
    setSearch: (value: string) => void;
    filter: string;
    setFilter: (value: string) => void;
}

const Header = ({ category, options, search, setSearch, filter, setFilter }: PropsType) => {
    return (
        <header className="pageHeader">
            <SearchBox
                options={options}
                search={search}
                setSearch={setSearch}
                setFilter={setFilter}
                placeholder="Tìm món bạn cần đặt"
            />
            <CategoryProduct category={category} filter={filter} setFilter={setFilter} setSearch={setSearch} />
        </header>
    );
};

export default Header;
