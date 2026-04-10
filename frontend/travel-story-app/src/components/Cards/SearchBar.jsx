import React from 'react'
import {FaMagnifyingGlass} from "react-icons/fa6"
import {IoMdClose} from "react-icons/io"
import './SearchBar.css'

const SearchBar = ({value,onChange,handleSearch,onClearSearch}) => {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="search-bar">
        <FaMagnifyingGlass className="search-icon" onClick={handleSearch} />

        <input
          className="search-input"
          type="text"
          placeholder="Search Notes"
          value={value}
          onChange={onChange}
          onKeyPress={handleKeyPress}
        />

        {value && (
            <IoMdClose className="clear-icon" onClick={onClearSearch} />
        )}
    </div>
  )
}

export default SearchBar