import React from 'react';
import { Search, X, Pin } from 'lucide-react';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  showPinnedOnly: boolean;
  onTogglePinnedFilter: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  searchTerm, 
  onSearchChange, 
  showPinnedOnly, 
  onTogglePinnedFilter 
}) => {
  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search notes..."
          className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
        />
        {searchTerm && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>
      
      <div className="flex items-center justify-between">
        <button
          onClick={onTogglePinnedFilter}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            showPinnedOnly
              ? 'bg-orange-100 text-orange-700 border border-orange-200'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
          }`}
        >
          <Pin className={`h-4 w-4 ${showPinnedOnly ? 'fill-current' : ''}`} />
          {showPinnedOnly ? 'Show All Notes' : 'Show Pinned Only'}
        </button>
        
        {showPinnedOnly && (
          <span className="text-xs text-orange-600 font-medium">
            Showing pinned notes only
          </span>
        )}
      </div>
    </div>
  );
};

export default SearchBar;