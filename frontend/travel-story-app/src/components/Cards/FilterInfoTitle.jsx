import React from "react";
import { format } from "date-fns";
import { MdOutlineClose } from "react-icons/md";
import "./FilterInfoTitle.css";

const DateRangeChip = ({ date, onClear }) => {
  const startDate = date?.from
    ? format(new Date(date.from), "do MMM yyyy")
    : "N/A";

  const endDate = date?.to
    ? format(new Date(date.to), "do MMM yyyy")
    : "N/A";

  return (
    <div className="date-range-chip">
      <p className="date-range-text">
        {startDate} - {endDate}
      </p>

      <button 
        className="date-range-close-button" 
        onClick={onClear}
        aria-label="Clear date filter"
        title="Clear date filter"
      >
        <MdOutlineClose />
      </button>
    </div>
  );
};

const FilterInfoTitle = ({ filterType, filterDates, onClear }) => {
  if (!filterType) return null;

  return (
    <div className="filter-info-container">
      {filterType === "search" ? (
        <h3 className="search-results-title">Search Results</h3>
      ) : (
        <div className="filter-info-wrapper">
          <h3 className="filter-info-title">Travel Stories from</h3>
          <DateRangeChip date={filterDates} onClear={onClear} />
        </div>
      )}
    </div>
  );
};

export default FilterInfoTitle;
