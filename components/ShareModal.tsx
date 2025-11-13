
import React, { useState, useEffect } from 'react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose }) => {
  const [copyButtonText, setCopyButtonText] = useState('Salin');
  
  const petitionUrl = typeof window !== 'undefined' ? window.location.href : '';
  const petitionTitle = "Dukung deklarasi nasional 'Aparatur Pemerintah Desa ASN 2026'! Tandatangani sekarang:";

  useEffect(() => {
    if (!isOpen) {
      // Reset button text with a delay to not be visible during closing animation
      setTimeout(() => setCopyButtonText('Salin'), 300);
    }
  }, [isOpen]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(petitionUrl).then(() => {
      setCopyButtonText('Tersalin!');
      setTimeout(() => setCopyButtonText('Salin'), 2000);
    }).catch(err => {
      console.error('Gagal menyalin tautan: ', err);
      alert('Gagal menyalin tautan.');
    });
  };

  if (!isOpen) return null;

  const encodedUrl = encodeURIComponent(petitionUrl);
  const encodedTitle = encodeURIComponent(petitionTitle);

  const socialLinks = {
    whatsapp: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="fixed inset-0 bg-black/50" onClick={onClose}></div>
      <div className="relative bg-white w-full max-w-md rounded-xl shadow-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 id="share-modal-title" className="text-xl font-bold text-slate-800">
            Sebarkan Dukungan
          </h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-800"
            aria-label="Tutup modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <p className="text-slate-600 mb-5">
          Ajak lebih banyak orang untuk menandatangani deklarasi ini dengan membagikannya.
        </p>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              readOnly
              value={petitionUrl}
              className="w-full px-3 py-2 border border-slate-300 rounded-md bg-slate-50 text-sm"
              aria-label="Tautan Deklarasi"
            />
            <button
              onClick={handleCopyLink}
              className="px-4 py-2 bg-sky-600 text-white font-semibold rounded-md hover:bg-sky-700 transition-colors text-sm w-24 text-center"
            >
              {copyButtonText}
            </button>
          </div>
          
          <div className="flex justify-around items-center pt-4">
            <a href={socialLinks.whatsapp} data-action="share/whatsapp/share" target="_blank" rel="noopener noreferrer" className="text-center text-slate-600 hover:text-emerald-500 transition-colors">
               <svg className="h-10 w-10 mx-auto" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.31 20.62C8.75 21.41 10.36 21.82 12.04 21.82C17.5 21.82 21.95 17.37 21.95 11.91C21.95 6.45 17.5 2 12.04 2ZM12.04 20.13C10.56 20.13 9.12 19.75 7.85 19.03L7.49 18.83L4.44 19.65L5.28 16.7L5.07 16.34C4.31 15 3.82 13.47 3.82 11.91C3.82 7.39 7.52 3.69 12.04 3.69C16.56 3.69 20.26 7.39 20.26 11.91C20.26 16.43 16.56 20.13 12.04 20.13ZM17.48 14.44C17.24 14.32 16.03 13.75 15.82 13.67C15.61 13.59 15.46 13.55 15.3 13.8C15.15 14.04 14.66 14.6 14.51 14.76C14.37 14.91 14.22 14.93 13.97 14.81C13.73 14.69 12.94 14.43 11.98 13.58C11.23 12.91 10.72 12.11 10.58 11.87C10.43 11.62 10.55 11.5 10.67 11.38C10.78 11.28 10.92 11.08 11.05 10.93C11.18 10.78 11.23 10.68 11.33 10.5C11.43 10.32 11.38 10.16 11.31 10.04C11.23 9.92 10.74 8.71 10.53 8.22C10.33 7.73 10.12 7.8 9.99 7.79H9.55C9.41 7.79 9.14 7.85 8.92 8.08C8.7 8.31 8.1 8.85 8.1 9.96C8.1 11.07 8.96 12.13 9.08 12.27C9.2 12.42 10.76 14.83 13.25 15.82C13.86 16.09 14.32 16.24 14.68 16.34C15.28 16.48 15.82 16.43 16.27 16.15C16.77 15.84 17.43 15.14 17.65 14.84C17.86 14.54 17.72 14.56 17.48 14.44Z"/></svg>
              <span className="text-sm font-medium mt-1">WhatsApp</span>
            </a>
            <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-center text-slate-600 hover:text-blue-600 transition-colors">
              <svg className="h-10 w-10 mx-auto" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M22 12C22 6.48 17.52 2 12 2S2 6.48 2 12C2 16.84 5.44 20.87 10 21.8V14H7V11H10V8.5C10 5.79 11.66 4.31 14.13 4.31C15.32 4.31 16.34 4.49 16.34 4.49V7.1H14.81C13.43 7.1 13 7.9 13 8.75V11H16L15.5 14H13V21.8C18.56 20.87 22 16.84 22 12Z"/></svg>
              <span className="text-sm font-medium mt-1">Facebook</span>
            </a>
            <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-center text-slate-600 hover:text-sky-500 transition-colors">
              <svg className="h-10 w-10 mx-auto" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M22.46 6C21.75 6.31 20.98 6.52 20.16 6.63C21 6.13 21.66 5.34 21.96 4.36C21.19 4.81 20.36 5.16 19.46 5.36C18.73 4.59 17.74 4.13 16.63 4.13C14.5 4.13 12.75 5.88 12.75 8.01C12.75 8.31 12.78 8.59 12.84 8.87C9.24 8.68 6.02 6.97 3.78 4.36C3.41 5.01 3.2 5.78 3.2 6.6C3.2 7.97 3.88 9.2 4.98 9.95C4.33 9.93 3.73 9.75 3.2 9.47V9.52C3.2 11.57 4.63 13.28 6.57 13.68C6.23 13.77 5.86 13.82 5.48 13.82C5.22 13.82 4.96 13.79 4.72 13.74C5.26 15.44 6.88 16.67 8.81 16.7C7.4 17.75 5.61 18.39 3.68 18.39C3.36 18.39 3.05 18.37 2.74 18.34C4.69 19.6 6.98 20.38 9.48 20.38C16.63 20.38 20.55 14.53 20.55 9.32C20.55 9.11 20.54 8.9 20.53 8.69C21.28 8.16 21.94 7.51 22.46 6Z"/></svg>
              <span className="text-sm font-medium mt-1">Twitter</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;