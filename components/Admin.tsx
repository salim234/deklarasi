import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Petitioner } from '../types';

// Constants
const ITEMS_PER_PAGE = 20;

// Helper component for sorting indicator
const SortIndicator: React.FC<{ direction: 'ascending' | 'descending' | null }> = ({ direction }) => {
  if (!direction) return <span className="text-slate-400 text-xs">↑↓</span>;
  return direction === 'ascending' ? <span className="text-sky-600">↑</span> : <span className="text-sky-600">↓</span>;
};

// Skeleton Row for loading state
const AdminSkeletonRow: React.FC = () => (
    <tr className="animate-pulse">
        <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-8"></div></td>
        <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-32"></div></td>
        <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
        <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-48"></div></td>
        <td className="px-6 py-4"><div className="h-12 w-28 bg-slate-200 rounded-md"></div></td>
    </tr>
);


const Admin: React.FC = () => {
  const [petitioners, setPetitioners] = useState<Petitioner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterQuery, setFilterQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Petitioner; direction: 'ascending' | 'descending' }>({ key: 'id', direction: 'ascending' });
  const [currentPage, setCurrentPage] = useState(1);
  
  // Data Fetching Effect
  useEffect(() => {
    const fetchPetitioners = async () => {
      setLoading(true);
      setError(null);
      const PAGE_SIZE = 1000;
      let allData: Petitioner[] = [];
      let page = 0;
      let hasMore = true;

      try {
        while(hasMore) {
          const { data, error: fetchError } = await supabase
            .from('petitioners')
            .select('*')
            .order('id', { ascending: true })
            .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
          
          if (fetchError) throw fetchError;

          if (data && data.length > 0) {
            allData.push(...data);
            if (data.length < PAGE_SIZE) {
              hasMore = false;
            } else {
              page++;
            }
          } else {
            hasMore = false;
          }
        }
        setPetitioners(allData);
      } catch (fetchError: any) {
        console.error('Error fetching petitioners for admin:', fetchError);
        if (fetchError.message.includes('Failed to fetch')) {
          setError('Gagal terhubung ke server. Mohon periksa koneksi internet Anda. Jika masalah berlanjut, mungkin ada masalah konfigurasi jaringan (CORS) di sisi server.');
        } else {
           setError(`Gagal memuat data pendukung: ${fetchError.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPetitioners();
  }, []);

  // Memoized Processing: Filtering -> Sorting
  const processedPetitioners = useMemo(() => {
    let processableItems = [...petitioners];

    // Filtering
    if (filterQuery) {
        processableItems = processableItems.filter(p =>
            p.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
            p.position.toLowerCase().includes(filterQuery.toLowerCase()) ||
            p.address.toLowerCase().includes(filterQuery.toLowerCase())
        );
    }

    // Sorting
    if (sortConfig.key) {
        processableItems.sort((a, b) => {
            const valA = a[sortConfig.key];
            const valB = b[sortConfig.key];

            if (valA === null || valA === undefined) return 1;
            if (valB === null || valB === undefined) return -1;

            if (typeof valA === 'string' && typeof valB === 'string') {
                return valA.localeCompare(valB);
            }
            if (typeof valA === 'number' && typeof valB === 'number') {
                return valA - valB;
            }
            return 0;
        });

        if (sortConfig.direction === 'descending') {
            processableItems.reverse();
        }
    }

    return processableItems;
  }, [petitioners, filterQuery, sortConfig]);
  
  // Pagination Calculation
  const totalPages = Math.ceil(processedPetitioners.length / ITEMS_PER_PAGE);
  const paginatedPetitioners = processedPetitioners.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Handlers
  const handleSort = (key: keyof Petitioner) => {
      let direction: 'ascending' | 'descending' = 'ascending';
      if (sortConfig.key === key && sortConfig.direction === 'ascending') {
          direction = 'descending';
      }
      setSortConfig({ key, direction });
      setCurrentPage(1); // Reset to first page on sort
  };
  
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterQuery(e.target.value);
    setCurrentPage(1); // Reset to first page on filter
  };
  
  // Type for sortable keys to ensure type safety in renderTableHeader
  type SortableKeys = 'id' | 'name' | 'position' | 'address';

  const renderTableHeader = (key: SortableKeys, label: string) => (
    <th 
      scope="col" 
      className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
      onClick={() => handleSort(key)}
    >
      <div className="flex items-center gap-2">
        {label}
        <SortIndicator direction={sortConfig.key === key ? sortConfig.direction : null} />
      </div>
    </th>
  );
  
  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 p-4 sm:p-6 lg:p-8">
      <main className="container mx-auto">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-sky-800">Admin Panel</h1>
            <p className="text-slate-600 mt-1">Daftar Lengkap Pendukung Deklarasi</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
              <a href="#/report" className="inline-block bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-emerald-700 transition-colors text-center">
                Lihat Laporan
              </a>
              <a href="#" className="inline-block bg-sky-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-sky-700 transition-colors text-center">
                &larr; Kembali ke Halaman Utama
              </a>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
             <div className="font-medium text-sm text-slate-600">
                {filterQuery ? `Menampilkan ${processedPetitioners.length.toLocaleString('id-ID')} dari ${petitioners.length.toLocaleString('id-ID')} total pendukung` : `Total Pendukung: ${petitioners.length.toLocaleString('id-ID')}`}
             </div>
             <div className="relative w-full md:max-w-md">
               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                value={filterQuery}
                onChange={handleFilterChange}
                placeholder="Cari berdasarkan nama, jabatan, alamat..."
                className="w-full py-2 pl-10 pr-4 border border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                aria-label="Filter data pendukung"
              />
            </div>
          </div>

          {error && <p className="text-center text-red-600 bg-red-100 p-4 rounded-md">{error}</p>}
          
          <div className="overflow-x-auto">
             <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    {renderTableHeader('id', 'No')}
                    {renderTableHeader('name', 'Nama')}
                    {renderTableHeader('position', 'Jabatan')}
                    {renderTableHeader('address', 'Alamat')}
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tanda Tangan</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {loading ? (
                    [...Array(ITEMS_PER_PAGE)].map((_, i) => <AdminSkeletonRow key={i} />)
                  ) : paginatedPetitioners.length > 0 ? (
                    paginatedPetitioners.map((p, index) => {
                      const rowNumber = (currentPage - 1) * ITEMS_PER_PAGE + index + 1;
                      return (
                        <tr key={p.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{rowNumber}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{p.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{p.position}</td>
                          <td className="px-6 py-4 whitespace-normal text-sm text-slate-500 max-w-sm">{p.address}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                              <img src={p.signature} alt={`Tanda tangan ${p.name}`} className="h-12 w-28 object-contain bg-slate-50 border p-1 rounded-md" />
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-500">
                        {petitioners.length === 0 ? "Belum ada data pendukung." : "Tidak ada data yang cocok dengan pencarian Anda."}
                      </td>
                    </tr>
                  )}
                </tbody>
             </table>
          </div>
          
          {totalPages > 1 && !loading && (
            <div className="flex items-center justify-between mt-4 px-1 py-2 border-t border-slate-200">
                <span className="text-sm text-slate-600">
                    Halaman <strong>{currentPage}</strong> dari <strong>{totalPages}</strong>
                </span>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 text-sm font-medium bg-white border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        aria-label="Halaman sebelumnya"
                    >
                        Sebelumnya
                    </button>
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 text-sm font-medium bg-white border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        aria-label="Halaman berikutnya"
                    >
                        Berikutnya
                    </button>
                </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Admin;