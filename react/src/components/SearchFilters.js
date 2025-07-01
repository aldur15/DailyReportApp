import React, { useState, useCallback } from 'react';
import { Search,  Filter, Eye, EyeOff } from 'lucide-react';

import "./Components.css"

//import debounce from './utils/debounce';

const debounce = (func, delay) => {

  let timeoutId;

  return (...args) => {

    clearTimeout(timeoutId);

    timeoutId = setTimeout(() => func.apply(null, args), delay);

  };

};


const SearchFilters = ({ onFilter, onClear, onShowAll, onHideAll, isAdmin }) => {

  const [filters, setFilters] = useState({

    username: '',

    title: '',

    date: '',

    month: ''

  });



  const debouncedFilter = useCallback(

    debounce((filterData) => onFilter(filterData), 300),

    [onFilter]

  );



  const handleFilterChange = (key, value) => {

    const newFilters = { ...filters, [key]: value };

    setFilters(newFilters);

    debouncedFilter(newFilters);

  };



  const handleClear = () => {

    setFilters({ username: '', title: '', date: '', month: '' });

    onClear();

  };



  return (

    <div className="bg-white rounded-lg shadow-md p-6 mb-6">

      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">

        <Search className="w-5 h-5" />

        Search Daily Reports

      </h3>

      <div className={`grid grid-cols-1 md:grid-cols-2 ${isAdmin ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-4 mb-4`}>

        {/* Only show username search for admins */}
        {isAdmin && (
          <input
            type="text"
            placeholder="Search by username"
            value={filters.username}
            onChange={(e) => handleFilterChange('username', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        )}

        <input

          type="text"

          placeholder="Search by title"

          value={filters.title}

          onChange={(e) => handleFilterChange('title', e.target.value)}

          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"

        />

        <input

          type="date"

          value={filters.date}

          onChange={(e) => handleFilterChange('date', e.target.value)}

          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"

        />

        <input

          type="month"

          value={filters.month}

          onChange={(e) => handleFilterChange('month', e.target.value)}

          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"

        />

      </div>

      <div className="flex flex-wrap gap-2">

        <button

          onClick={handleClear}

          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"

        >

          <Filter className="w-4 h-4" />

          Clear Filters

        </button>

        <button

          onClick={onShowAll}

          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"

        >

          <Eye className="w-4 h-4" />

          Show All

        </button>

        <button

          onClick={onHideAll}

          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"

        >

          <EyeOff className="w-4 h-4" />

          Hide All

        </button>

      </div>

    </div>

  );

};

export default SearchFilters;