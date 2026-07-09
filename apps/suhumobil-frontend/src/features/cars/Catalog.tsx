/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, 
  SlidersHorizontal, 
  RefreshCw, 
  MessageSquare, 
  X, 
  ArrowUpDown, 
  Tag, 
  MapPin, 
  Calendar, 
  Compass, 
  ArrowLeftRight, 
  Check, 
  CheckCircle,
  AlertTriangle,
  FileText,
  BadgeAlert,
  ShieldAlert,
  Info
} from 'lucide-react';
import { carsService } from '../../services/cars.service';
import { Car, LeadSource, CarTransmission, CarFuelType } from '../../types';
import { formatRupiah, formatMileage } from '../../utils/format';
import Watermark from '../../components/Watermark';
import WhatsappLeadPopup from '../../components/WhatsappLeadPopup';

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [allCars, setAllCars] = useState<Car[]>([]);
  const [filteredCars, setFilteredCars] = useState<Car[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Comparison states
  const [comparedCarIds, setComparedCarIds] = useState<string[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  // Selected car state for WhatsApp popup lead form
  const [selectedCar, setSelectedCar] = useState<{ id: string; title: string } | null>(null);

  // Filter input states
  const [search, setSearch] = useState('');
  const [brand, setBrand] = useState('');
  const [location, setLocation] = useState('');
  const [transmission, setTransmission] = useState('');
  const [fuelType, setFuelType] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minYear, setMinYear] = useState('');
  const [maxYear, setMaxYear] = useState('');
  const [sortBy, setSortBy] = useState('latest');

  // Fetch all published cars on component load
  useEffect(() => {
    setIsLoading(true);
    carsService.getCars()
      .then(res => {
        if (res.success) {
          setAllCars(res.data);
        }
      })
      .catch(err => console.error('Error fetching catalog cars:', err))
      .finally(() => setIsLoading(false));
  }, []);

  // Filter and sort the cars list in response to URL searchParams or allCars update
  useEffect(() => {
    const searchVal = searchParams.get('search') || '';
    const brandVal = searchParams.get('brand') || '';
    const locationVal = searchParams.get('location') || '';
    const transmissionVal = searchParams.get('transmission') || '';
    const fuelTypeVal = searchParams.get('fuelType') || '';
    const minPriceVal = searchParams.get('minPrice') || '';
    const maxPriceVal = searchParams.get('maxPrice') || '';
    const minYearVal = searchParams.get('minYear') || '';
    const maxYearVal = searchParams.get('maxYear') || '';
    const sortByVal = searchParams.get('sortBy') || 'latest';

    // Synchronize form values with URL
    setSearch(searchVal);
    setBrand(brandVal);
    setLocation(locationVal);
    setTransmission(transmissionVal);
    setFuelType(fuelTypeVal);
    setMinPrice(minPriceVal);
    setMaxPrice(maxPriceVal);
    setMinYear(minYearVal);
    setMaxYear(maxYearVal);
    setSortBy(sortByVal);

    let list = [...allCars];

    // Filter: Search Keyword
    if (searchVal) {
      const q = searchVal.toLowerCase();
      list = list.filter(car => 
        car.title.toLowerCase().includes(q) ||
        car.brand.toLowerCase().includes(q) ||
        car.model.toLowerCase().includes(q) ||
        (car.color && car.color.toLowerCase().includes(q))
      );
    }

    // Filter: Brand
    if (brandVal) {
      list = list.filter(car => car.brand.toLowerCase() === brandVal.toLowerCase());
    }

    // Filter: Location
    if (locationVal) {
      list = list.filter(car => car.location.toLowerCase() === locationVal.toLowerCase());
    }

    // Filter: Transmission
    if (transmissionVal) {
      list = list.filter(car => car.transmission === transmissionVal);
    }

    // Filter: Fuel Type
    if (fuelTypeVal) {
      list = list.filter(car => car.fuelType === fuelTypeVal);
    }

    // Filter: Price Range
    if (minPriceVal) {
      list = list.filter(car => car.price >= Number(minPriceVal));
    }
    if (maxPriceVal) {
      list = list.filter(car => car.price <= Number(maxPriceVal));
    }

    // Filter: Year Range
    if (minYearVal) {
      list = list.filter(car => car.year >= Number(minYearVal));
    }
    if (maxYearVal) {
      list = list.filter(car => car.year <= Number(maxYearVal));
    }

    // Sort processing
    if (sortByVal === 'price-asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortByVal === 'price-desc') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortByVal === 'year-desc') {
      list.sort((a, b) => b.year - a.year);
    } else if (sortByVal === 'mileage-asc') {
      list.sort((a, b) => a.mileage - b.mileage);
    } else {
      // Default: latest (added descending)
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    setFilteredCars(list);
  }, [allCars, searchParams]);

  // Dynamically extract unique values for beautiful dynamic filters
  const uniqueBrands = Array.from(new Set(allCars.map(car => car.brand))).filter(Boolean).sort();
  const uniqueLocations = Array.from(new Set(allCars.map(car => car.location))).filter(Boolean).sort();

  // Handle setting parameters to the URL
  const handleApplyFilters = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const params: Record<string, string> = {};
    
    if (search) params.search = search;
    if (brand) params.brand = brand;
    if (location) params.location = location;
    if (transmission) params.transmission = transmission;
    if (fuelType) params.fuelType = fuelType;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
    if (minYear) params.minYear = minYear;
    if (maxYear) params.maxYear = maxYear;
    if (sortBy && sortBy !== 'latest') params.sortBy = sortBy;
    
    setSearchParams(params);
    setIsFilterOpen(false);
  };

  const handleResetFilters = () => {
    setSearch('');
    setBrand('');
    setLocation('');
    setTransmission('');
    setFuelType('');
    setMinPrice('');
    setMaxPrice('');
    setMinYear('');
    setMaxYear('');
    setSortBy('latest');
    setSearchParams({});
    setIsFilterOpen(false);
  };

  const handleRemoveSingleFilter = (key: string) => {
    const params = new URLSearchParams(searchParams);
    params.delete(key);
    setSearchParams(params);
  };

  const handleSortChange = (newSort: string) => {
    const params = new URLSearchParams(searchParams);
    if (newSort === 'latest') {
      params.delete('sortBy');
    } else {
      params.set('sortBy', newSort);
    }
    setSearchParams(params);
  };

  // Compare toggler logic
  const handleToggleCompare = (carId: string) => {
    setComparedCarIds(prev => {
      if (prev.includes(carId)) {
        return prev.filter(id => id !== carId);
      }
      if (prev.length >= 3) {
        alert('Anda hanya dapat membandingkan maksimal 3 mobil sekaligus.');
        return prev;
      }
      return [...prev, carId];
    });
  };

  // Build the list of active filters for chip rendering
  const activeChips: { key: string; label: string }[] = [];
  if (searchParams.get('search')) {
    activeChips.push({ key: 'search', label: `Kata kunci: "${searchParams.get('search')}"` });
  }
  if (searchParams.get('brand')) {
    activeChips.push({ key: 'brand', label: `Merek: ${searchParams.get('brand')}` });
  }
  if (searchParams.get('location')) {
    activeChips.push({ key: 'location', label: `Kota: ${searchParams.get('location')}` });
  }
  if (searchParams.get('transmission')) {
    activeChips.push({ key: 'transmission', label: `Transmisi: ${searchParams.get('transmission')}` });
  }
  if (searchParams.get('fuelType')) {
    const displayBbm = searchParams.get('fuelType') === CarFuelType.GASOLINE ? 'Bensin' :
                       searchParams.get('fuelType') === CarFuelType.DIESEL ? 'Solar' :
                       searchParams.get('fuelType') === CarFuelType.HYBRID ? 'Hybrid' : 'Listrik';
    activeChips.push({ key: 'fuelType', label: `BBM: ${displayBbm}` });
  }
  if (searchParams.get('minPrice')) {
    activeChips.push({ key: 'minPrice', label: `Min: ${formatRupiah(Number(searchParams.get('minPrice')))}` });
  }
  if (searchParams.get('maxPrice')) {
    activeChips.push({ key: 'maxPrice', label: `Max: ${formatRupiah(Number(searchParams.get('maxPrice')))}` });
  }
  if (searchParams.get('minYear')) {
    activeChips.push({ key: 'minYear', label: `Min Tahun: ${searchParams.get('minYear')}` });
  }
  if (searchParams.get('maxYear')) {
    activeChips.push({ key: 'maxYear', label: `Max Tahun: ${searchParams.get('maxYear')}` });
  }

  // Find compared cars details
  const comparedCars = allCars.filter(car => comparedCarIds.includes(car.id));

  // Helper to render inspection status column
  const renderInspectionBadge = (sectionData: { status: 'good' | 'minor' | 'bad'; note?: string }) => {
    if (!sectionData) return <span className="text-slate-400 font-medium text-xs">-</span>;
    const { status, note } = sectionData;
    let colorClass = '';
    let label = '';
    
    if (status === 'good') {
      colorClass = 'text-green-600 bg-green-50 border-green-100';
      label = 'Sangat Baik (Lolos)';
    } else if (status === 'minor') {
      colorClass = 'text-amber-600 bg-amber-50 border-amber-100';
      label = 'Minor (Catatan)';
    } else {
      colorClass = 'text-red-600 bg-red-50 border-red-100';
      label = 'Perlu Perbaikan';
    }

    return (
      <div className="space-y-1">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${colorClass}`}>
          {status === 'good' && <Check size={10} />}
          {label}
        </span>
        {note && <p className="text-[10px] text-slate-500 font-light italic leading-tight">{note}</p>}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 font-sans text-slate-800">
      
      {/* Dynamic Header Section */}
      <div className="mb-8 space-y-3 bg-gradient-to-r from-slate-900 to-amber-950 p-6 sm:p-8 rounded-3xl text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 space-y-1.5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full text-[10px] font-mono uppercase tracking-widest font-bold">
            <Compass size={12} className="animate-spin" style={{ animationDuration: '6s' }} /> Kurasi Suhu Terpercaya
          </span>
          <h1 className="text-2xl sm:text-4xl font-display font-bold text-white tracking-tight">Katalog Mobil Bekas Pilihan</h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-xl font-light leading-relaxed">
            Temukan kendaraan idaman Anda yang telah lulus uji ketat 150+ titik inspeksi, bergaransi resmi, dan bebas rekayasa odometer.
          </p>
        </div>
        
        {/* Decorative ambient light */}
        <div className="absolute right-0 top-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* FILTER CONTROL PANEL SIDEBAR */}
        <aside className={`lg:col-span-3 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5 ${isFilterOpen ? 'fixed inset-0 z-50 overflow-y-auto block p-6' : 'hidden lg:block'}`}>
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <h3 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
              <SlidersHorizontal size={16} className="text-amber-500" /> Saring Pencarian
            </h3>
            {isFilterOpen ? (
              <button
                onClick={() => setIsFilterOpen(false)}
                className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-lg transition"
              >
                <X size={18} />
              </button>
            ) : (
              allCars.length > 0 && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-[10px] text-amber-600 font-bold hover:text-amber-700 font-mono tracking-wider uppercase"
                >
                  Reset
                </button>
              )
            )}
          </div>

          <form onSubmit={handleApplyFilters} className="space-y-4">
            
            {/* Search Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Search size={13} className="text-slate-400" /> Cari Nama / Model
              </label>
              <input
                type="text"
                placeholder="Avanza, HRV, Pajero..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-amber-500 transition text-sm font-sans"
              />
            </div>

            {/* Brand Dropdown */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Tag size={13} className="text-slate-400" /> Merek Mobil
              </label>
              <select
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-amber-500 transition text-sm font-sans bg-white"
              >
                <option value="">Semua Merek</option>
                {uniqueBrands.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* Location Dropdown */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <MapPin size={13} className="text-slate-400" /> Alamat / Kota
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-amber-500 transition text-sm font-sans bg-white"
              >
                <option value="">Semua Lokasi</option>
                {uniqueLocations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            {/* Transmission Selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700">Jenis Transmisi</label>
              <select
                value={transmission}
                onChange={(e) => setTransmission(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-amber-500 transition text-sm font-sans bg-white"
              >
                <option value="">Semua Transmisi</option>
                <option value={CarTransmission.MANUAL}>MANUAL (M/T)</option>
                <option value={CarTransmission.AUTOMATIC}>AUTOMATIC (A/T)</option>
                <option value={CarTransmission.CVT}>CVT (Stepless)</option>
              </select>
            </div>

            {/* Fuel Type Selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 font-sans">Bahan Bakar (BBM)</label>
              <select
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-amber-500 transition text-sm font-sans bg-white"
              >
                <option value="">Semua Bahan Bakar</option>
                <option value={CarFuelType.GASOLINE}>Bensin (Gasoline)</option>
                <option value={CarFuelType.DIESEL}>Solar (Diesel)</option>
                <option value={CarFuelType.HYBRID}>Hybrid</option>
                <option value={CarFuelType.ELECTRIC}>Listrik (EV)</option>
              </select>
            </div>

            {/* Budget Range with live Rupiah preview */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">Rentang Anggaran (Rp)</label>
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-slate-400">Rp</span>
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full pl-7 pr-2 py-1.5 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-amber-500 transition text-xs font-sans"
                  />
                </div>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-slate-400">Rp</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full pl-7 pr-2 py-1.5 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-amber-500 transition text-xs font-sans"
                  />
                </div>
              </div>
              {(minPrice || maxPrice) && (
                <div className="text-[10px] font-medium text-slate-500 flex flex-col gap-0.5 pt-1 bg-slate-50 p-2 rounded-lg border border-slate-100">
                  {minPrice && <div>Min: <span className="font-semibold text-amber-600">{formatRupiah(Number(minPrice))}</span></div>}
                  {maxPrice && <div>Max: <span className="font-semibold text-amber-600">{formatRupiah(Number(maxPrice))}</span></div>}
                </div>
              )}
            </div>

            {/* Year Range */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">Tahun Registrasi</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min Tahun"
                  value={minYear}
                  onChange={(e) => setMinYear(e.target.value)}
                  className="w-full px-2 py-1.5 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-amber-500 transition text-xs font-sans"
                />
                <input
                  type="number"
                  placeholder="Max Tahun"
                  value={maxYear}
                  onChange={(e) => setMaxYear(e.target.value)}
                  className="w-full px-2 py-1.5 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-amber-500 transition text-xs font-sans"
                />
              </div>
            </div>

            {/* Submit & Reset actions */}
            <div className="flex flex-col gap-2 pt-3 border-t border-slate-100">
              <button
                type="submit"
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-sans font-bold text-xs rounded-xl shadow-sm transition duration-150 flex items-center justify-center gap-1.5"
              >
                Terapkan Pencarian
              </button>
              <button
                type="button"
                onClick={handleResetFilters}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-sans font-semibold text-xs rounded-xl transition duration-150 flex items-center justify-center gap-1.5"
              >
                <RefreshCw size={11} /> Reset Pilihan
              </button>
            </div>
          </form>
        </aside>

        {/* SEARCH RESULTS PANEL */}
        <main className="lg:col-span-9 space-y-5">
          
          {/* SORTING BAR & METRICS */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-0.5">
              <p className="text-xs text-slate-500 font-sans">
                Ditemukan <span className="font-extrabold text-slate-900 text-sm">{filteredCars.length}</span> unit bursa yang sesuai
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* Mobile Filter Toggle */}
              <button
                onClick={() => setIsFilterOpen(true)}
                className="lg:hidden flex-1 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition"
              >
                <SlidersHorizontal size={13} /> Saring Unit
              </button>

              {/* Sorting options drop down */}
              <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold hover:border-slate-300 transition w-full sm:w-56">
                <ArrowUpDown size={12} className="text-slate-400 mr-2 shrink-0" />
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="bg-transparent outline-none w-full cursor-pointer text-slate-700 font-semibold"
                >
                  <option value="latest">Terbaru Ditambahkan</option>
                  <option value="price-asc">Harga Terendah</option>
                  <option value="price-desc">Harga Tertinggi</option>
                  <option value="year-desc">Tahun Paling Baru</option>
                  <option value="mileage-asc">Kilometer Terendah</option>
                </select>
              </div>
            </div>
          </div>

          {/* ACTIVE CHIP PILLS FOR APPLIED FILTERS */}
          {activeChips.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100 rounded-xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono pl-2">Filter Aktif:</span>
              <div className="flex flex-wrap gap-1.5 items-center flex-1">
                {activeChips.map((chip) => (
                  <span
                    key={chip.key}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 text-slate-700 font-sans text-[11px] font-bold rounded-lg shadow-sm"
                  >
                    {chip.label}
                    <button
                      onClick={() => handleRemoveSingleFilter(chip.key)}
                      className="p-0.5 hover:bg-slate-100 text-slate-400 hover:text-red-500 rounded-md transition"
                      title="Hapus filter ini"
                    >
                      <X size={10} />
                    </button>
                  </span>
                ))}
                
                <button
                  onClick={handleResetFilters}
                  className="text-[10px] text-red-600 hover:text-red-700 hover:underline font-extrabold tracking-wider uppercase font-mono px-2"
                >
                  Hapus Semua
                </button>
              </div>
            </div>
          )}

          {/* MAIN RESULTS DISPENSATION */}
          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="bg-white rounded-3xl h-[400px] border border-slate-200 animate-pulse shadow-sm" />
              ))}
            </div>
          ) : filteredCars.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center space-y-4">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                <Search size={28} />
              </div>
              <div className="space-y-1">
                <h3 className="font-display font-bold text-slate-900 text-lg">Unit Tidak Ditemukan</h3>
                <p className="text-slate-500 text-xs font-sans max-w-md mx-auto leading-relaxed">
                  Tidak ada mobil terkurasi yang sesuai dengan kriteria saringan Anda saat ini. Cobalah menyetel ulang saringan atau mencari kata kunci lain.
                </p>
              </div>
              <button
                onClick={handleResetFilters}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition shadow-sm active:scale-95"
              >
                Reset Semua Saringan
              </button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCars.map((car) => {
                const cover = car.images.find(img => img.isCover) || car.images[0];
                const isCompared = comparedCarIds.includes(car.id);
                return (
                  <div
                    key={car.id}
                    onClick={() => window.location.href = `#/cars/${car.slug}`}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col group relative cursor-pointer"
                  >
                    {/* Cover image container */}
                    <div className="relative h-48 bg-slate-100 overflow-hidden shrink-0">
                      {cover ? (
                        <img
                          src={cover.url}
                          alt={car.title}
                          className="w-full h-full object-cover group-hover:scale-103 transition duration-200"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-mono bg-slate-100">
                          Tidak Ada Foto
                        </div>
                      )}
                      
                      {/* Floating compare checkbox button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleCompare(car.id);
                        }}
                        className={`absolute top-3 right-3 z-10 px-2.5 py-1.5 rounded-xl text-[10px] font-bold shadow-md border transition-all flex items-center gap-1.5 ${
                          isCompared
                            ? 'bg-amber-500 text-slate-950 border-amber-600 scale-105'
                            : 'bg-slate-950/85 text-slate-200 border-slate-800 hover:bg-slate-950 hover:scale-105'
                        }`}
                      >
                        <ArrowLeftRight size={10} />
                        {isCompared ? '✓ Terpilih Banding' : '+ Bandingkan'}
                      </button>
                      
                      {/* Floating badget status */}
                      <div className="absolute top-3 left-3 z-10">
                        <span className="inline-flex items-center gap-1 font-mono text-[9px] font-bold text-slate-950 bg-amber-500 px-2 py-0.5 rounded-md uppercase tracking-wider shadow">
                          Lulus Inspeksi
                        </span>
                      </div>
                      
                      {/* Watermark overlay */}
                      <Watermark variant="overlay" />
                    </div>

                    {/* Card details body */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3.5">
                      <div>
                        {/* Title row */}
                        <div className="flex justify-between items-start gap-1">
                          <h3 className="font-display font-bold text-sm sm:text-base text-slate-900 group-hover:text-amber-600 transition-colors truncate">
                            {car.title}
                          </h3>
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold font-mono shrink-0">
                            {car.year}
                          </span>
                        </div>
                        
                        {/* Price rendering */}
                        <div className="text-amber-600 font-display font-extrabold text-base sm:text-lg mt-0.5">
                          {formatRupiah(car.price)}
                        </div>
                      </div>

                      {/* Technical specifications grid */}
                      <div className="grid grid-cols-2 gap-y-1.5 text-[11px] text-slate-500 border-t border-slate-100 pt-3">
                        <div className="truncate">Transmisi: <span className="font-semibold text-slate-700">{car.transmission}</span></div>
                        <div className="truncate">Jarak: <span className="font-semibold text-slate-700">{formatMileage(car.mileage)}</span></div>
                        <div className="truncate flex items-center gap-0.5">Kota: <span className="font-semibold text-slate-700 truncate">{car.location}</span></div>
                        <div className="truncate">BBM: <span className="font-semibold text-slate-700 capitalize">{car.fuelType.toLowerCase()}</span></div>
                      </div>

                      {/* Button CTA for WhatsApp Inquiry */}
                      <div className="pt-1 flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Avoid triggering full-page navigation
                            setSelectedCar({ id: car.id, title: car.title });
                          }}
                          className="flex-1 py-2 bg-slate-950 hover:bg-slate-800 text-white font-sans text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition active:scale-95 shadow-sm"
                        >
                          <MessageSquare size={13} className="text-green-400" /> Konsultasi WA
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* FLOATING COMPARISON BAR */}
      {comparedCarIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-950/95 backdrop-blur-md text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-800/80 flex items-center justify-between gap-5 animate-fade-in max-w-lg w-[calc(100%-2rem)]">
          <div className="flex-1 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <ArrowLeftRight size={14} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-100 font-display">Perbandingan Mobil</h4>
              <p className="text-[10px] text-slate-400">
                <span className="font-extrabold text-amber-500">{comparedCarIds.length}</span> / 3 unit terpilih
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setComparedCarIds([])}
              className="px-3 py-1.5 hover:bg-slate-900 text-slate-400 hover:text-slate-100 text-[10px] font-bold rounded-xl transition"
            >
              Batal
            </button>
            <button
              onClick={() => setIsCompareModalOpen(true)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-[11px] rounded-xl transition shadow-md active:scale-95"
            >
              Bandingkan ({comparedCarIds.length})
            </button>
          </div>
        </div>
      )}

      {/* COMPARISON side-by-side MODAL OVERLAY */}
      {isCompareModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-500/10 text-amber-600 rounded-xl">
                  <ArrowLeftRight size={18} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-slate-900 text-base">Komparasi Spesifikasi Unit</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Analisis banding detail properti & sertifikasi kurator SuhuMobil</p>
                </div>
              </div>
              <button
                onClick={() => setIsCompareModalOpen(false)}
                className="p-2 hover:bg-slate-200 text-slate-500 hover:text-slate-800 rounded-xl transition"
                title="Tutup komparasi"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable comparison grid */}
            <div className="flex-1 overflow-x-auto overflow-y-auto p-6">
              <div className="min-w-[650px] divide-y divide-slate-100">
                {/* 1. Header row containing images and titles */}
                <div className="grid grid-cols-4 gap-4 pb-6 items-start">
                  <div className="col-span-1 pt-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Spesifikasi Unit</span>
                  </div>
                  {comparedCars.map(car => {
                    const cover = car.images.find(img => img.isCover) || car.images[0];
                    return (
                      <div key={car.id} className="col-span-1 relative bg-slate-50 border border-slate-100 p-3 rounded-2xl space-y-2">
                        <button
                          onClick={() => handleToggleCompare(car.id)}
                          className="absolute -top-1.5 -right-1.5 p-1 bg-red-100 hover:bg-red-200 border border-red-200 text-red-600 rounded-full transition"
                          title="Hapus dari banding"
                        >
                          <X size={12} />
                        </button>
                        <div className="h-24 bg-slate-200 rounded-xl overflow-hidden relative">
                          {cover ? (
                            <img
                              src={cover.url}
                              alt={car.title}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400 bg-slate-100">No image</div>
                          )}
                          <Watermark variant="overlay" />
                        </div>
                        <div className="space-y-0.5">
                          <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{car.title}</h4>
                          <p className="text-xs font-black text-amber-600">{formatRupiah(car.price)}</p>
                        </div>
                      </div>
                    );
                  })}
                  {/* Fill empty comparison slots */}
                  {Array.from({ length: 3 - comparedCars.length }).map((_, i) => (
                    <div key={i} className="col-span-1 border border-dashed border-slate-200 bg-slate-50/50 rounded-2xl h-[174px] flex flex-col justify-center items-center text-center p-4">
                      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-2">
                        <Tag size={16} />
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium">Slot Banding Kosong</p>
                      <button
                        onClick={() => setIsCompareModalOpen(false)}
                        className="mt-2 text-[10px] text-amber-600 hover:text-amber-700 font-extrabold uppercase font-mono tracking-wider"
                      >
                        + Cari Unit
                      </button>
                    </div>
                  ))}
                </div>

                {/* 2. Specs rows */}
                <div className="grid grid-cols-4 gap-4 py-3 text-xs items-center">
                  <div className="col-span-1 font-bold text-slate-500">Merek Mobil</div>
                  {comparedCars.map(car => (
                    <div key={car.id} className="col-span-1 font-semibold text-slate-800">{car.brand}</div>
                  ))}
                  {Array.from({ length: 3 - comparedCars.length }).map((_, i) => <div key={i} className="col-span-1" />)}
                </div>

                <div className="grid grid-cols-4 gap-4 py-3 text-xs items-center">
                  <div className="col-span-1 font-bold text-slate-500">Model / Varian</div>
                  {comparedCars.map(car => (
                    <div key={car.id} className="col-span-1 font-semibold text-slate-800">{car.model}</div>
                  ))}
                  {Array.from({ length: 3 - comparedCars.length }).map((_, i) => <div key={i} className="col-span-1" />)}
                </div>

                <div className="grid grid-cols-4 gap-4 py-3 text-xs items-center">
                  <div className="col-span-1 font-bold text-slate-500">Tahun Pembuatan</div>
                  {comparedCars.map(car => (
                    <div key={car.id} className="col-span-1 font-semibold text-slate-800">{car.year}</div>
                  ))}
                  {Array.from({ length: 3 - comparedCars.length }).map((_, i) => <div key={i} className="col-span-1" />)}
                </div>

                <div className="grid grid-cols-4 gap-4 py-3 text-xs items-center">
                  <div className="col-span-1 font-bold text-slate-500">Jarak Tempuh (Kilometer)</div>
                  {comparedCars.map(car => (
                    <div key={car.id} className="col-span-1 font-semibold text-slate-800">{formatMileage(car.mileage)}</div>
                  ))}
                  {Array.from({ length: 3 - comparedCars.length }).map((_, i) => <div key={i} className="col-span-1" />)}
                </div>

                <div className="grid grid-cols-4 gap-4 py-3 text-xs items-center">
                  <div className="col-span-1 font-bold text-slate-500">Jenis Transmisi</div>
                  {comparedCars.map(car => (
                    <div key={car.id} className="col-span-1 font-semibold text-slate-800 uppercase">{car.transmission}</div>
                  ))}
                  {Array.from({ length: 3 - comparedCars.length }).map((_, i) => <div key={i} className="col-span-1" />)}
                </div>

                <div className="grid grid-cols-4 gap-4 py-3 text-xs items-center">
                  <div className="col-span-1 font-bold text-slate-500">Bahan Bakar</div>
                  {comparedCars.map(car => (
                    <div key={car.id} className="col-span-1 font-semibold text-slate-800 uppercase">{car.fuelType}</div>
                  ))}
                  {Array.from({ length: 3 - comparedCars.length }).map((_, i) => <div key={i} className="col-span-1" />)}
                </div>

                <div className="grid grid-cols-4 gap-4 py-3 text-xs items-center">
                  <div className="col-span-1 font-bold text-slate-500">Warna Bodi</div>
                  {comparedCars.map(car => (
                    <div key={car.id} className="col-span-1 font-semibold text-slate-800">{car.color || 'Tidak terinci'}</div>
                  ))}
                  {Array.from({ length: 3 - comparedCars.length }).map((_, i) => <div key={i} className="col-span-1" />)}
                </div>

                <div className="grid grid-cols-4 gap-4 py-3 text-xs items-center">
                  <div className="col-span-1 font-bold text-slate-500">Lokasi Penahanan</div>
                  {comparedCars.map(car => (
                    <div key={car.id} className="col-span-1 font-semibold text-slate-800">{car.location}</div>
                  ))}
                  {Array.from({ length: 3 - comparedCars.length }).map((_, i) => <div key={i} className="col-span-1" />)}
                </div>

                {/* 3. Curator Inspections Checklist Header */}
                <div className="grid grid-cols-4 gap-4 py-3 bg-amber-50/50 -mx-6 px-6 border-y border-slate-100 text-xs font-bold text-slate-900 items-center">
                  <div className="col-span-1 flex items-center gap-1 text-amber-700">
                    <Compass size={13} /> Sertifikasi Kelayakan
                  </div>
                  <div className="col-span-3 text-[10px] text-slate-400 font-medium">Hasil Inspeksi Kurator 150+ Titik</div>
                </div>

                <div className="grid grid-cols-4 gap-4 py-3 text-xs items-start">
                  <div className="col-span-1 font-bold text-slate-500">Inspeksi Mesin</div>
                  {comparedCars.map(car => (
                    <div key={car.id} className="col-span-1">
                      {renderInspectionBadge(car.inspectionReport?.mesin as any)}
                    </div>
                  ))}
                  {Array.from({ length: 3 - comparedCars.length }).map((_, i) => <div key={i} className="col-span-1" />)}
                </div>

                <div className="grid grid-cols-4 gap-4 py-3 text-xs items-start">
                  <div className="col-span-1 font-bold text-slate-500">Inspeksi Transmisi</div>
                  {comparedCars.map(car => (
                    <div key={car.id} className="col-span-1">
                      {renderInspectionBadge(car.inspectionReport?.transmisi as any)}
                    </div>
                  ))}
                  {Array.from({ length: 3 - comparedCars.length }).map((_, i) => <div key={i} className="col-span-1" />)}
                </div>

                <div className="grid grid-cols-4 gap-4 py-3 text-xs items-start">
                  <div className="col-span-1 font-bold text-slate-500">Kaki-Kaki & Suspensi</div>
                  {comparedCars.map(car => (
                    <div key={car.id} className="col-span-1">
                      {renderInspectionBadge(car.inspectionReport?.kakiKaki as any)}
                    </div>
                  ))}
                  {Array.from({ length: 3 - comparedCars.length }).map((_, i) => <div key={i} className="col-span-1" />)}
                </div>

                <div className="grid grid-cols-4 gap-4 py-3 text-xs items-start">
                  <div className="col-span-1 font-bold text-slate-500">Interior & AC</div>
                  {comparedCars.map(car => (
                    <div key={car.id} className="col-span-1">
                      {renderInspectionBadge(car.inspectionReport?.interior as any)}
                    </div>
                  ))}
                  {Array.from({ length: 3 - comparedCars.length }).map((_, i) => <div key={i} className="col-span-1" />)}
                </div>

                <div className="grid grid-cols-4 gap-4 py-3 text-xs items-start">
                  <div className="col-span-1 font-bold text-slate-500">Kelistrikan & Fitur</div>
                  {comparedCars.map(car => (
                    <div key={car.id} className="col-span-1">
                      {renderInspectionBadge(car.inspectionReport?.kelistrikan as any)}
                    </div>
                  ))}
                  {Array.from({ length: 3 - comparedCars.length }).map((_, i) => <div key={i} className="col-span-1" />)}
                </div>

                <div className="grid grid-cols-4 gap-4 py-3 text-xs items-start">
                  <div className="col-span-1 font-bold text-slate-500">Bodi, Sasis, & Cat</div>
                  {comparedCars.map(car => (
                    <div key={car.id} className="col-span-1">
                      {renderInspectionBadge(car.inspectionReport?.bodi as any)}
                    </div>
                  ))}
                  {Array.from({ length: 3 - comparedCars.length }).map((_, i) => <div key={i} className="col-span-1" />)}
                </div>

                {/* 4. Action Row */}
                <div className="grid grid-cols-4 gap-4 pt-6 pb-2 items-center">
                  <div className="col-span-1" />
                  {comparedCars.map(car => (
                    <div key={car.id} className="col-span-1">
                      <button
                        onClick={() => {
                          setIsCompareModalOpen(false);
                          setSelectedCar({ id: car.id, title: car.title });
                        }}
                        className="w-full py-2 bg-slate-950 hover:bg-slate-800 text-white font-sans text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition shadow-sm active:scale-95"
                      >
                        <MessageSquare size={12} className="text-green-400" /> Tanya Unit Ini
                      </button>
                    </div>
                  ))}
                  {Array.from({ length: 3 - comparedCars.length }).map((_, i) => <div key={i} className="col-span-1" />)}
                </div>

              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/80 flex justify-end gap-3 shrink-0">
              <button
                onClick={() => setComparedCarIds([])}
                className="px-4 py-2 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl transition"
              >
                Reset Semua Pembanding
              </button>
              <button
                onClick={() => setIsCompareModalOpen(false)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition"
              >
                Tutup Komparasi
              </button>
            </div>

          </div>
        </div>
      )}

      {/* DYNAMIC POPUP FORM WHATSAPP */}
      <WhatsappLeadPopup
        isOpen={selectedCar !== null}
        onClose={() => setSelectedCar(null)}
        carId={selectedCar?.id}
        carTitle={selectedCar?.title}
        source={LeadSource.WHATSAPP_CTA}
      />
    </div>
  );
}
