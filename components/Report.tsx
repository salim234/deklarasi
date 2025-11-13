import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Petitioner } from '../types';
import { parseRegency } from '../lib/utils';

const Report: React.FC = () => {
  const [petitioners, setPetitioners] = useState<Petitioner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        console.error('Error fetching petitioners for report:', fetchError);
        setError(`Gagal memuat data laporan: ${fetchError.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchPetitioners();
  }, []);

  const reportData = useMemo(() => {
    if (petitioners.length === 0) {
      return null;
    }
    
    const positionCounts: Record<string, number> = {};
    const regencyCounts: Record<string, number> = {};

    petitioners.forEach(p => {
      const position = p.position.trim() || 'Tidak Diketahui';
      positionCounts[position] = (positionCounts[position] || 0) + 1;

      const regency = parseRegency(p.address);
      regencyCounts[regency] = (regencyCounts[regency] || 0) + 1;
    });

    const sortedPositions = Object.entries(positionCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    const sortedRegencies = Object.entries(regencyCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    return {
      total: petitioners.length,
      positions: sortedPositions,
      regencies: sortedRegencies,
    };
  }, [petitioners]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 p-4 sm:p-6 lg:p-8">
      <style>{`
        @media print {
          body {
            background-color: #fff;
          }
          .no-print {
            display: none;
          }
          .print-container {
            box-shadow: none;
            border: none;
            padding: 0;
            margin: 0;
          }
           .print-container header {
            margin-bottom: 2rem;
          }
        }
      `}</style>
      <main className="container mx-auto">
        <div className="no-print flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-sky-800">Laporan Dukungan</h1>
            <p className="text-slate-600 mt-1">Ringkasan data pendukung deklarasi.</p>
          </div>
          <div className="flex gap-2">
            <a href="#/admin" className="inline-block bg-slate-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-slate-700 transition-colors text-center">
              &larr; Kembali ke Admin
            </a>
            <button onClick={handlePrint} className="inline-block bg-sky-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-sky-700 transition-colors text-center">
              Cetak Laporan
            </button>
          </div>
        </div>
        
        {loading && <p className="text-center p-8">Memuat data laporan...</p>}
        {error && <p className="text-center text-red-600 bg-red-100 p-4 rounded-md">{error}</p>}
        
        {reportData && (
          <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-slate-200 print-container">
            <header className="text-center mb-10 border-b pb-6">
              <h2 className="text-2xl font-extrabold text-sky-800">Laporan Dukungan Deklarasi Nasional</h2>
              <p className="text-lg font-semibold text-slate-600">Aparatur Pemerintah Desa Menjadi ASN 2026</p>
              <p className="text-sm text-slate-500 mt-2">Laporan ini dibuat pada: {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="bg-sky-50 p-6 rounded-lg text-center border border-sky-200">
                  <h3 className="text-lg font-semibold text-sky-700">Total Pendukung</h3>
                  <p className="text-5xl font-extrabold text-sky-600 mt-2">{reportData.total.toLocaleString('id-ID')}</p>
              </div>
              <div className="bg-emerald-50 p-6 rounded-lg text-center border border-emerald-200">
                  <h3 className="text-lg font-semibold text-emerald-700">Total Jabatan Berbeda</h3>
                  <p className="text-5xl font-extrabold text-emerald-600 mt-2">{reportData.positions.length.toLocaleString('id-ID')}</p>
              </div>
              <div className="bg-amber-50 p-6 rounded-lg text-center border border-amber-200">
                  <h3 className="text-lg font-semibold text-amber-700">Total Kabupaten/Kota</h3>
                  <p className="text-5xl font-extrabold text-amber-600 mt-2">{reportData.regencies.length.toLocaleString('id-ID')}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div>
                    <h3 className="text-xl font-bold text-slate-700 mb-4">Statistik Jabatan</h3>
                    <div className="space-y-4">
                        {reportData.positions.map(({ name, count }) => {
                            const percentage = reportData.total > 0 ? (count / reportData.total) * 100 : 0;
                            return (
                                <div key={name}>
                                    <div className="flex justify-between items-center text-sm mb-1">
                                        <span className="font-medium text-slate-600 truncate pr-2">{name}</span>
                                        <span className="font-semibold text-slate-800">{count}</span>
                                    </div>
                                    <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden">
                                        <div
                                            className="bg-emerald-500 h-4 rounded-full text-white text-xs flex items-center justify-center transition-all duration-500"
                                            style={{ width: `${percentage}%` }}
                                            title={`${Math.round(percentage)}%`}
                                        >
                                           {percentage > 15 && `${Math.round(percentage)}%`}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div>
                    <h3 className="text-xl font-bold text-slate-700 mb-4">Statistik Kabupaten/Kota</h3>
                    <div className="space-y-1 border rounded-lg p-2 max-h-[28rem] overflow-y-auto">
                        {reportData.regencies.map(({ name, count }, index) => (
                            <div key={name} className="flex justify-between items-center text-sm p-2 hover:bg-slate-50 rounded">
                                <div>
                                    <span className="font-mono text-xs text-slate-400 w-6 inline-block">{index + 1}.</span>
                                    <span className="font-medium text-slate-600">{name}</span>
                                </div>
                                <span className="font-semibold text-slate-800 bg-slate-200 text-xs px-2 py-0.5 rounded-full">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Report;