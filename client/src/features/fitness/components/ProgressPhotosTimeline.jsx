import { useState, useRef } from 'react';
import { Camera, Plus, Loader2, Info, ChevronDown, X } from 'lucide-react';
import { useUploadPhoto } from '../hooks/useFitness';
import { motion, AnimatePresence } from 'motion/react';

export default function ProgressPhotosTimeline({ photos = [] }) {
  const fileInputRef = useRef(null);
  const uploadMut = useUploadPhoto();
  const [isUploading, setIsUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setIsUploading(true);
      uploadMut.mutate({
        base64String: reader.result,
        caption: 'Progress photo'
      }, {
        onSettled: () => {
          setIsUploading(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      });
    };
    reader.readAsDataURL(file);
  };

  const recentPhotos = photos.slice(0, 4);

  // Group photos by date for the modal
  const groupedPhotos = photos.reduce((acc, photo) => {
    const d = new Date(photo.date);
    const dateStr = d.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(photo);
    return acc;
  }, {});

  return (
    <>
      <div className="rounded-3xl p-6 h-full shadow-sm flex flex-col" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-1.5">
            <h3 className="text-sm font-bold" style={{ color: 'var(--th-text)' }}>Progress Photos</h3>
            <Info className="w-3.5 h-3.5 text-[var(--th-text-dim)]" />
          </div>
          <button 
            onClick={() => setShowModal(true)}
            disabled={photos.length === 0}
            className={`flex items-center gap-1 text-[10px] font-semibold transition ${photos.length === 0 ? 'text-[var(--th-text-dim)] cursor-not-allowed' : 'text-[var(--th-text-secondary)] hover:text-[var(--th-text)]'}`}
          >
            View All <ChevronDown className="w-3 h-3" />
          </button>
        </div>

        <div className="flex-1">
          {photos.length === 0 && !isUploading ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[120px] gap-3">
              <p className="text-xs text-center" style={{ color: 'var(--th-text-secondary)' }}>No progress photos yet. Upload your first photo to start tracking visually.</p>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold text-violet-500 bg-violet-500/10 hover:bg-violet-100 transition-colors dark:bg-violet-500/10 dark:hover:bg-violet-500/20"
              >
                <Plus className="w-3.5 h-3.5" />
                Upload Photo
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-5 gap-3">
              {recentPhotos.map((photo, i) => (
                <div key={i} className="flex flex-col items-center group">
                  <div className="w-full aspect-[3/4] rounded-xl overflow-hidden shadow-sm mb-1.5" style={{ background: 'var(--th-bg-secondary)' }}>
                    <img src={photo.secureUrl} alt="Progress" className="w-full h-full object-contain transition-transform group-hover:scale-110" loading="lazy" />
                  </div>
                  <span className="text-[10px] font-semibold text-[var(--th-text-secondary)]">{new Date(photo.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </div>
              ))}

              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex flex-col items-center group"
              >
                <div className="w-full aspect-[3/4] rounded-xl overflow-hidden border-2 border-dashed border-[var(--th-border)] hover:border-violet-400 hover:bg-violet-500/10 transition-colors flex items-center justify-center mb-1.5 bg-[var(--th-bg-secondary)]">
                  {isUploading ? <Loader2 className="w-5 h-5 animate-spin text-violet-500" /> : <Plus className="w-5 h-5 text-[var(--th-text-dim)] group-hover:text-violet-500" />}
                </div>
                <span className="text-[10px] font-semibold text-[var(--th-text-secondary)] group-hover:text-violet-500">Add New</span>
              </button>
            </div>
          )}
        </div>

        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden" 
        />
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-2xl p-6 shadow-2xl" 
              style={{ background: 'var(--th-card-solid)', border: '1px solid var(--th-border)' }}
            >
              <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'var(--th-bg-secondary)' }}>
                    <Camera className="w-5 h-5" style={{ color: 'var(--th-primary)' }} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold" style={{ color: 'var(--th-text)' }}>All Progress Photos</h2>
                    <p className="text-xs font-semibold" style={{ color: 'var(--th-text-secondary)' }}>Your visual transformation journey</p>
                  </div>
                </div>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-lg transition" style={{ hover: 'var(--th-highlight)' }}>
                  <X className="w-5 h-5" style={{ color: 'var(--th-text-secondary)' }} />
                </button>
              </div>

              <div className="space-y-8">
                {Object.entries(groupedPhotos).map(([dateStr, dayPhotos]) => (
                  <div key={dateStr}>
                    <h3 className="text-sm font-bold mb-4 pb-2 border-b" style={{ color: 'var(--th-text)', borderColor: 'var(--th-border)' }}>
                      {dateStr}
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {dayPhotos.map((photo, idx) => (
                        <div key={idx} className="flex flex-col gap-2">
                          <div className="w-full aspect-[3/4] rounded-xl overflow-hidden shadow-sm" style={{ background: 'var(--th-bg-secondary)' }}>
                            <img src={photo.secureUrl} alt="Progress" className="w-full h-full object-contain hover:scale-105 transition-transform duration-300" loading="lazy" />
                          </div>
                          <span className="text-[11px] font-semibold text-center" style={{ color: 'var(--th-text-secondary)' }}>
                            {new Date(photo.date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
