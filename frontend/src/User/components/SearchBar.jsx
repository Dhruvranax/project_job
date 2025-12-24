import React from "react";

const SearchBar = ({ searchTerm, setSearchTerm, filterType, setFilterType, setCurrentPage }) => {
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to page 1 when search changes
  };

  const handleFilterChange = (e) => {
    setFilterType(e.target.value);
    setCurrentPage(1); // Reset to page 1 when filter changes
  };

  const handleReset = () => {
    setSearchTerm("");
    setFilterType("");
    setCurrentPage(1); // Reset to page 1
  };

  return (
    <div className="card shadow-sm p-4">
      <h4 className="mb-3">🔍 Search Jobs</h4>
      <div className="row g-3">
        <div className="col-md-6">
          <input
            type="text"
            className="form-control"
            placeholder="Search for jobs..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        <div className="col-md-4">
          <select
            className="form-select"
            value={filterType}
            onChange={handleFilterChange}
          >
            <option value="">All Job Types</option>
            <option value="full-time">Full-Time</option>
            <option value="part-time">Part-Time</option>
            <option value="internship">Internship</option>
            <option value="remote">Remote</option>
          </select>
        </div>

        <div className="col-md-2 d-grid">
          <button className="btn btn-outline-secondary" onClick={handleReset}>
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
