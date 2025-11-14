import React, { useState, useRef, FormEvent, useEffect } from 'react';
import { Petitioner } from './types';
import SignatureCanvas, { SignatureCanvasRef } from './components/SignatureCanvas';
import ShareModal from './components/ShareModal';
import { supabase } from './lib/supabaseClient';
import PetitionerSkeleton from './components/PetitionerSkeleton';
import Statistics from './components/Statistics';

const JABATAN_OPTIONS = [
  'Kepala Desa',
  'Sekretaris Desa',
  'Kaur Tata Usaha dan Umum',
  'Kaur Keuangan',
  'Kaur Perencanaan',
  'Kasi Pemerintahan',
  'Kasi Kesejahteraan',
  'Kasi Pelayanan',
  'Kepala Dusun',
  'Staf Desa',
  'Lainnya',
];

// --- Helper Components ---

const FormInput: React.FC<{
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  disabled?: boolean;
}> = ({ id, label, value, onChange, placeholder, disabled }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1">
      {label}
    </label>
    <input
      type="text"
      id={id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm disabled:bg-slate-50 disabled:cursor-not-allowed"
    />
  </div>
);

const FormTextarea: React.FC<{
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder: string;
  rows?: number;
  disabled?: boolean;
}> = ({ id, label, value, onChange, placeholder, rows = 3, disabled }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1">
      {label}
    </label>
    <textarea
      id={id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      disabled={disabled}
      className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm disabled:bg-slate-50 disabled:cursor-not-allowed"
    ></textarea>
  </div>
);

const SuccessMessage: React.FC<{ message: string | null; onReset: () => void }> = ({ message, onReset }) => (
  <div className="flex flex-col items-center justify-center h-full text-center bg-green-50 rounded-lg p-8">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-500 mb-4" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
    <h3 className="text-2xl font-bold text-green-800">Dukungan Terkirim!</h3>
    <p className="mt-2 text-slate-600">{message}</p>
     <button 
        type="button" 
        onClick={onReset}
        className="mt-6 bg-green-600 text-white font-bold py-2 px-5 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-transform transform hover:scale-105 shadow-md"
      >
        Tambah Dukungan Lain
      </button>
  </div>
);

// --- Main App Component ---

const App: React.FC = () => {
  const [petitioners, setPetitioners] = useState<Petitioner[]>([]);
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [otherPosition, setOtherPosition] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [filterQuery, setFilterQuery] = useState('');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const signatureRef = useRef<SignatureCanvasRef>(null);

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
            .order('created_at', { ascending: false })
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
        console.error('Error fetching petitioners:', fetchError.message || fetchError);
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

  const handleResetForm = () => {
    setName('');
    setPosition('');
    setOtherPosition('');
    setAddress('');
    signatureRef.current?.clear();
    setSuccessMessage(null);
    setError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const finalPosition = position === 'Lainnya' ? otherPosition.trim() : position;
    const trimmedName = name.trim();
    const trimmedAddress = address.trim();

    if (!trimmedName || !finalPosition || !trimmedAddress) {
      setError('Semua kolom harus diisi.');
      return;
    }

    if (position === 'Lainnya' && !otherPosition.trim()) {
      setError('Mohon sebutkan jabatan Anda pada kolom yang tersedia.');
      return;
    }

    if (signatureRef.current?.isEmpty()) {
      setError('Tanda tangan tidak boleh kosong.');
      return;
    }

    const signatureData = signatureRef.current?.getSignatureData();

    if (signatureData) {
      setSubmitting(true);
      const { data, error: insertError } = await supabase
        .from('petitioners')
        .insert([{ name: trimmedName, position: finalPosition, address: trimmedAddress, signature: signatureData }])
        .select()
        .single();
      
      setSubmitting(false);

      if (insertError) {
        console.error('Error submitting signature:', insertError.message || insertError);
        if (insertError.message.includes('Failed to fetch')) {
          setError('Gagal terhubung ke server untuk mengirim dukungan. Mohon periksa koneksi internet Anda dan coba lagi.');
        } else {
          setError(`Terjadi kesalahan saat mengirim dukungan Anda: ${insertError.message}`);
        }
      } else {
        setPetitioners(prev => [data, ...prev]);
        setSuccessMessage('Terima kasih! Dukungan Anda telah tercatat.');
      }
    }
  };


  const filteredPetitioners = petitioners.filter(p =>
    p.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
    p.position.toLowerCase().includes(filterQuery.toLowerCase())
  );
  
  return (
    <div className="min-h-screen font-sans text-slate-800">
      <main className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <header className="text-center mb-10">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-sky-600 to-emerald-600">
            Deklarasi Nasional
          </h1>
          <p className="text-lg md:text-xl font-medium text-emerald-600 italic mt-1">#SalamBerdesa</p>
          <p className="mt-2 text-xl md:text-2xl font-semibold text-slate-600">
            Aparatur Pemerintah Desa Menjadi ASN 2026
          </p>
          <p className="mt-4 max-w-3xl mx-auto text-slate-500">
            Kami, aparatur pemerintah desa di seluruh Indonesia, dengan ini menyatukan suara untuk menuntut pengakuan dan pengangkatan kami menjadi Aparatur Sipil Negara (ASN) pada tahun 2026 sebagai wujud keadilan dan penghargaan atas dedikasi kami dalam membangun bangsa dari desa.
          </p>
           <div className="mt-6">
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="inline-flex items-center gap-2 bg-slate-700 text-white font-bold py-2 px-5 rounded-lg hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-transform transform hover:scale-105 shadow-md"
              aria-label="Bagikan deklarasi ini"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
              </svg>
              Bagikan Deklarasi Ini
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-xl shadow-lg border border-slate-200">
            {successMessage ? <SuccessMessage message={successMessage} onReset={handleResetForm} /> : (
              <>
                <h2 className="text-2xl font-bold text-sky-700 mb-6">Tandatangani Deklarasi</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <FormInput id="name" label="Nama Lengkap" value={name} onChange={(e) => setName(e.target.value)} placeholder="Contoh: Budi Santoso" disabled={submitting} />
                  
                  <div>
                    <label htmlFor="position" className="block text-sm font-medium text-slate-700 mb-1">
                      Jabatan di Desa
                    </label>
                    <select
                      id="position"
                      value={position}
                      onChange={(e) => {
                        setPosition(e.target.value);
                        if (e.target.value !== 'Lainnya') {
                          setOtherPosition('');
                        }
                      }}
                      disabled={submitting}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm disabled:bg-slate-50 disabled:cursor-not-allowed"
                    >
                      <option value="" disabled>-- Pilih Jabatan --</option>
                      {JABATAN_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                  
                  {position === 'Lainnya' && (
                    <FormInput
                      id="otherPosition"
                      label="Sebutkan Jabatan Lainnya"
                      value={otherPosition}
                      onChange={(e) => setOtherPosition(e.target.value)}
                      placeholder="Contoh: Ketua BPD"
                      disabled={submitting}
                    />
                  )}

                  <FormTextarea
                    id="address"
                    label="Alamat Lengkap"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Contoh: Jl. Merdeka No. 10, Desa Maju Jaya, Kec. Sejahtera, Kab. Makmur"
                    disabled={submitting}
                  />
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Tanda Tangan Digital
                    </label>
                    <SignatureCanvas ref={signatureRef} />
                  </div>

                  {error && <p className="text-sm text-red-600 bg-red-100 p-3 rounded-md">{error}</p>}
                  
                  <button 
                    type="submit" 
                    className="w-full bg-sky-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-transform transform hover:scale-105 shadow-md disabled:bg-sky-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    disabled={submitting}
                  >
                    {submitting ? (
                        <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Mengirim...
                        </>
                    ) : (
                        'Kirim Dukungan Saya'
                    )}
                  </button>
                </form>
              </>
            )}
          </div>

          <div className="lg:col-span-3 bg-white p-6 md:p-8 rounded-xl shadow-lg border border-slate-200">
            <div className="mb-4">
                <h2 className="text-2xl font-bold text-sky-700">
                    Daftar Pendukung
                </h2>
            </div>
             <div className="bg-gradient-to-br from-sky-50 to-sky-100 border-l-4 border-sky-500 text-sky-800 p-4 rounded-r-lg mb-4 flex items-center gap-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-sky-600 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
                <div>
                  <p className="font-semibold">Total Dukungan Terkumpul</p>
                  <p className="font-bold text-3xl text-sky-600">{petitioners.length.toLocaleString('id-ID')}</p>
                </div>
            </div>
            
            <Statistics petitioners={petitioners} />

            <div className="relative mb-4">
               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder="Cari berdasarkan nama atau jabatan..."
                className="w-full py-2 pl-10 pr-4 border border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                aria-label="Filter pendukung"
              />
            </div>
            <div className="overflow-y-auto max-h-[550px]">
             {loading ? (
                <div className="space-y-3 mt-2">
                    {[...Array(5)].map((_, i) => <PetitionerSkeleton key={i} />)}
                </div>
             ) : (
                <>
                {/* Mobile View: Cards */}
                <div className="md:hidden space-y-3">
                 {filteredPetitioners.length > 0 ? filteredPetitioners.map(p => (
                    <div key={p.id} className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                        <p className="font-bold text-slate-800">{p.name}</p>
                        <p className="text-sm text-slate-600 font-medium">{p.position}</p>
                        <p className="text-xs text-slate-500 mt-1">{p.address}</p>
                        <div className="mt-2 border-t border-slate-200 pt-2">
                            <img src={p.signature} alt={`Tanda tangan ${p.name}`} className="h-10 object-contain bg-slate-100 border p-1 rounded-md" />
                        </div>
                    </div>
                 )) : (
                     <p className="px-6 py-12 text-center text-sm text-slate-500">
                        {petitioners.length === 0 ? "Jadilah yang pertama menandatangani deklarasi ini!" : "Tidak ada pendukung yang cocok."}
                     </p>
                 )}
                </div>

                {/* Desktop View: Table */}
                <div className="hidden md:block border border-slate-200 rounded-lg">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50 sticky top-0">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nama</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Jabatan & Alamat</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tanda Tangan</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {filteredPetitioners.length > 0 ? (
                        filteredPetitioners.map((p) => (
                          <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-slate-900">{p.name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-normal">
                              <div className="text-sm font-medium text-slate-800">{p.position}</div>
                              <div className="text-sm text-slate-500">{p.address}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <img src={p.signature} alt={`Tanda tangan ${p.name}`} className="h-12 object-contain bg-slate-100 border p-1 rounded-md" />
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="px-6 py-12 text-center text-sm text-slate-500">
                            {petitioners.length === 0 ? "Jadilah yang pertama menandatangani deklarasi ini!" : "Tidak ada pendukung yang cocok dengan pencarian Anda."}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                </>
             )}
            </div>
          </div>
        </div>
        <footer className="text-center mt-12 text-slate-500 text-sm">
            <p>&copy; {new Date().getFullYear()} Gerakan Aparatur Desa Indonesia. Dibuat dengan semangat perubahan.</p>
        </footer>
      </main>
       <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />
    </div>
  );
};

export default App;
