import React, { useState } from 'react';
import { Search, MapPin, Filter, X, Tag, Calendar, CheckCircle2, Palette, Building2, Award, ChevronDown } from 'lucide-react';
import { ItemCategory } from '../types';
import { CAMPUS_LOCATIONS } from '../data/mockData';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  selectedLocation: string;
  onLocationChange: (location: string) => void;
  selectedBuilding?: string;
  onBuildingChange?: (building: string) => void;
  selectedColor?: string;
  onColorChange?: (color: string) => void;
  selectedBrand?: string;
  onBrandChange?: (brand: string) => void;
  selectedType: string;
  onTypeChange: (type: string) => void;
  selectedDate?: string;
  onDateChange?: (date: string) => void;
  selectedStatus?: string;
  onStatusChange?: (status: string) => void;
  onClearFilters?: () => void;
  className?: string;
}

export const CATEGORIES: ItemCategory[] = [
  'Electronics',
  'Books & Notes',
  'Cards & IDs',
  'Keys',
  'Bags & Backpacks',
  'Clothing & Shoes',
  'Accessories',
  'Sports & Gym',
  'Other',
];

export const STATUSES: { label: string; value: string }[] = [
  { label: 'All Statuses', value: 'all' },
  { label: 'Active / Open', value: 'active' },
  { label: 'Pending Claim', value: 'pending' },
  { label: 'Claimed / Resolved', value: 'claimed' },
];

export const CAMPUS_BUILDINGS = [
  'Central Library',
  'Student Union',
  'Engineering Building',
  'Science Complex',
  'Rec Center',
  'North Quad',
  'Arts Building',
  'East Dining',
  'Transit Hub',
  'Security Office',
];

export const POPULAR_COLORS = [
  'Black',
  'White',
  'Blue',
  'Navy',
  'Red',
  'Silver',
  'Grey',
  'Gold',
  'Pink',
  'Purple',
  'Green',
  'Brown',
  'Yellow',
];

export const POPULAR_BRANDS = [
  'Apple',
  'Samsung',
  'Sony',
  'Bose',
  'Nike',
  'Adidas',
  'Hydro Flask',
  'Yeti',
  'Dell',
  'HP',
  'Lenovo',
  'Anker',
  'Beats',
  'Ray-Ban',
];

export const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedLocation,
  onLocationChange,
  selectedBuilding = '',
  onBuildingChange,
  selectedColor = '',
  onColorChange,
  selectedBrand = '',
  onBrandChange,
  selectedType,
  onTypeChange,
  selectedDate = '',
  onDateChange,
  selectedStatus = 'all',
  onStatusChange,
  onClearFilters,
  className = '',
}) => {
  const [showAdvanced, setShowAdvanced] = useState(
    Boolean(selectedBuilding || selectedColor || selectedBrand || selectedDate || (selectedStatus && selectedStatus !== 'all'))
  );

  const activeFilterCount = [
    Boolean(searchTerm),
    Boolean(selectedCategory),
    Boolean(selectedLocation),
    selectedType !== 'all',
    Boolean(selectedBuilding),
    Boolean(selectedColor),
    Boolean(selectedBrand),
    Boolean(selectedDate),
    Boolean(selectedStatus && selectedStatus !== 'all'),
  ].filter(Boolean).length;

  return (
    <div className={`bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-4 ${className}`}>
      {/* Primary Row: Search Input & Type Tabs */}
      <div className="flex flex-col md:flex-row items-stretch gap-3">
        {/* Search Input Bar */}
        <div className="relative flex-1 flex items-center">
          <Search className="absolute left-4 w-5 h-5 text-blue-600 dark:text-blue-400 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by item name, keyword, or serial number..."
            className="w-full pl-12 pr-10 py-3 min-h-[44px] rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm sm:text-base transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 p-2 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 active:scale-90 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Type Toggle Pills */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0 self-start md:self-auto w-full md:w-auto">
          <button
            type="button"
            onClick={() => onTypeChange('all')}
            className={`flex-1 md:flex-initial py-2.5 min-h-[44px] px-4 text-xs font-semibold rounded-lg transition-all active:scale-95 ${
              selectedType === 'all'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            All Items
          </button>
          <button
            type="button"
            onClick={() => onTypeChange('lost')}
            className={`flex-1 md:flex-initial py-2.5 min-h-[44px] px-4 text-xs font-semibold rounded-lg transition-all active:scale-95 ${
              selectedType === 'lost'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Lost
          </button>
          <button
            type="button"
            onClick={() => onTypeChange('found')}
            className={`flex-1 md:flex-initial py-2.5 min-h-[44px] px-4 text-xs font-semibold rounded-lg transition-all active:scale-95 ${
              selectedType === 'found'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Found
          </button>
        </div>
      </div>

      {/* Core Filter Grid: Category, Location, Building */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Category Select */}
        <div className="relative flex items-center">
          <Tag className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full pl-9 pr-8 py-2.5 min-h-[44px] rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>

        {/* Location Zone Select */}
        <div className="relative flex items-center">
          <MapPin className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
          <select
            value={selectedLocation}
            onChange={(e) => onLocationChange(e.target.value)}
            className="w-full pl-9 pr-8 py-2.5 min-h-[44px] rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer"
          >
            <option value="">All Campus Locations</option>
            {CAMPUS_LOCATIONS.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>

        {/* Building Select */}
        {onBuildingChange && (
          <div className="relative flex items-center sm:col-span-2 lg:col-span-1">
            <Building2 className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
            <select
              value={selectedBuilding}
              onChange={(e) => onBuildingChange(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 min-h-[44px] rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer"
            >
              <option value="">All Buildings</option>
              {CAMPUS_BUILDINGS.map((b) => (
                <option key={b} value={b}>
                  Building: {b}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        )}
      </div>

      {/* Advanced Filter Expansion Toggle */}
      <div className="pt-1 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="inline-flex items-center gap-1.5 py-2 min-h-[44px] px-2 text-xs font-bold text-blue-600 dark:text-blue-400 active:scale-95 transition-all"
        >
          <Filter className="w-3.5 h-3.5" />
          <span>{showAdvanced ? 'Hide Attribute Filters' : 'More Filters (Color, Brand, Date, Status)'}</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
        </button>

        {activeFilterCount > 0 && onClearFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="inline-flex items-center gap-1 py-2 min-h-[44px] px-2 text-xs text-rose-600 dark:text-rose-400 font-semibold active:scale-95 transition-all"
          >
            <X className="w-3.5 h-3.5" /> Reset {activeFilterCount} Active Filters
          </button>
        )}
      </div>

      {/* Advanced Filter Row: Color, Brand, Date, Status */}
      {showAdvanced && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {/* Color Filter */}
          {onColorChange && (
            <div className="relative flex items-center">
              <Palette className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                list="color-options"
                value={selectedColor}
                onChange={(e) => onColorChange(e.target.value)}
                placeholder="Color (e.g. White, Black, Navy)"
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
              <datalist id="color-options">
                {POPULAR_COLORS.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
          )}

          {/* Brand Filter */}
          {onBrandChange && (
            <div className="relative flex items-center">
              <Award className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                list="brand-options"
                value={selectedBrand}
                onChange={(e) => onBrandChange(e.target.value)}
                placeholder="Brand (e.g. Apple, Hydro Flask)"
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
              <datalist id="brand-options">
                {POPULAR_BRANDS.map((b) => (
                  <option key={b} value={b} />
                ))}
              </datalist>
            </div>
          )}

          {/* Date Filter */}
          {onDateChange && (
            <div className="relative flex items-center">
              <Calendar className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => onDateChange(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
          )}

          {/* Status Filter */}
          {onStatusChange && (
            <div className="relative flex items-center">
              <CheckCircle2 className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
              <select
                value={selectedStatus}
                onChange={(e) => onStatusChange(e.target.value)}
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer"
              >
                {STATUSES.map((st) => (
                  <option key={st.value} value={st.value}>
                    Status: {st.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
