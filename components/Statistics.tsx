import React, { useMemo, useState } from 'react';
import { Petitioner } from '../types';
import { parseRegency, parseVillage } from '../lib/utils';

interface StatisticsProps {
  petitioners: Petitioner[];
}

const Statistics: React.FC<StatisticsProps> = ({ petitioners }) => {
  const [showAllVillages, setShowAllVillages] = useState(false);

  const regencyStats = useMemo(() => {
    const counts: Record<string, number> = {};
    
    petitioners.forEach(p => {
      const regency = parseRegency(p.address);
      counts[regency] = (counts[regency] || 0) + 1;
    });

    const sorted = Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    return { sorted, total: petitioners.length };
  }, [petitioners]);

  const villageStats = useMemo(() => {
    const counts: Record<string, number> = {};
    
    petitioners.forEach(p => {
      const village = parseVillage(p.address);
      counts[village] = (counts[village] || 0) + 1;
    });

    const sorted = Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
      
    return { sorted, total: petitioners.length };
  }, [petitioners]);

  if (petitioners.length === 0) {
    return null;
  }

  const topRegencyStats = regencyStats.sorted.slice(0, 7);
  const displayedVillageStats = showAllVillages ? villageStats.sorted : villageStats.sorted.slice(0, 7);
  const shouldShowVillageStats = villageStats.sorted.length > 0 && villageStats.sorted.some(v => v.name !== 'Lainnya');

  return (
    <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg mb-4 space-y-6">
      {topRegencyStats.length > 0 && (
        <div>
          <h3 className="font-bold text-slate-700 text-lg mb-3">Statistik per Kabupaten/Kota</h3>
          <div className="space-y-3">
            {topRegencyStats.map(({ name, count }) => {
              const percentage = regencyStats.total > 0 ? (count / regencyStats.total) * 100 : 0;
              return (
                <div key={name}>
                  <div className="flex justify-between items-center text-sm mb-1">
                    <span className="font-medium text-slate-600 truncate pr-2">{name}</span>
                    <span className="font-semibold text-slate-800">{count}</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2.5">
                    <div
                      className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-2.5 rounded-full"
                      style={{ width: `${percentage}%` }}
                      role="progressbar"
                      aria-valuenow={count}
                      aria-valuemin={0}
                      aria-valuemax={regencyStats.total}
                      aria-label={`Dukungan dari ${name}: ${count}`}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {shouldShowVillageStats && (
         <div>
          <h3 className="font-bold text-slate-700 text-lg mb-3">Statistik per Desa</h3>
          <div className="space-y-3">
            {displayedVillageStats.map(({ name, count }) => {
              const percentage = villageStats.total > 0 ? (count / villageStats.total) * 100 : 0;
              return (
                <div key={name}>
                  <div className="flex justify-between items-center text-sm mb-1">
                    <span className="font-medium text-slate-600 truncate pr-2">{name}</span>
                    <span className="font-semibold text-slate-800">{count}</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2.5">
                    <div
                      className="bg-gradient-to-r from-sky-400 to-sky-600 h-2.5 rounded-full"
                      style={{ width: `${percentage}%` }}
                      role="progressbar"
                      aria-valuenow={count}
                      aria-valuemin={0}
                      aria-valuemax={villageStats.total}
                      aria-label={`Dukungan dari ${name}: ${count}`}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
          {villageStats.sorted.length > 7 && (
            <button
              onClick={() => setShowAllVillages(!showAllVillages)}
              className="text-sm font-semibold text-sky-600 hover:text-sky-800 mt-4 transition-colors"
            >
              {showAllVillages ? 'Tampilkan lebih sedikit' : `Tampilkan semua (${villageStats.sorted.length} desa)`}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Statistics;