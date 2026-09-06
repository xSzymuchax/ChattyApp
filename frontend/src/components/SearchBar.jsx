import { useState } from 'react';
import './SearchBar.css'

function SearchBar({onSearch}) {
    const [searchValue, setSearchValue] = useState('');

    const handleSearch = (event) => {
        onSearch(searchValue);
    }

    const handleKeyDown = (event) => {
        if (event.key === 'Enter')
            handleSearch();
    }

    return (
        <div className="search-bar">
            <input 
            type='textbox'
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            onKeyDown={handleKeyDown} />
            <button type="button" onClick={handleSearch} aria-label="Search">
                <i className="icon-search"></i>
            </button>
        </div>
    );
}

export default SearchBar