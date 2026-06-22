import React from 'react';
import { X, Sparkles, TrendingUp, TrendingDown, Target, Grid } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const InsightModal = ({ isOpen, onClose, insightData, title, type }) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'bestArea': return <TrendingUp className="text-emerald-500" size={24} />;
      case 'focusArea': return <TrendingDown className="text-rose-500" size={24} />;
      case 'hiddenPattern': return <Grid className="text-blue-500" size={24} />;
      case 'opportunityZone': return <Target className="text-amber-500" size={24} />;
      case 'roiReport': return <Sparkles className="text-amber-500" size={24} />;
      default: return <Sparkles className="text-purple-500" size={24} />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'bestArea': return 'var(--color-success-dim)';
      case 'focusArea': return 'var(--color-danger-dim)';
      case 'hiddenPattern': return 'var(--color-info-dim)';
      case 'opportunityZone': return 'var(--color-warning-dim)';
      case 'roiReport': return 'var(--color-warning-dim)';
      default: return 'var(--th-highlight)';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
      <div 
        className={`rounded-3xl w-full ${type === 'roiReport' ? 'max-w-2xl' : 'max-w-lg'} shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]`}
        style={{ background: 'var(--th-card-solid)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b flex justify-between items-center" style={{ borderColor: 'var(--th-border)' }}>
          <h2 className="text-xl font-bold flex items-center gap-3" style={{ color: 'var(--th-text)' }}>
            <div className="p-2 rounded-xl" style={{ background: getBgColor() }}>
              {getIcon()}
            </div>
            {title}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full transition-opacity hover:opacity-80"
            style={{ color: 'var(--th-text-muted)' }}
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-8 overflow-y-auto">
          {type === 'roiReport' ? (
            <div className="prose max-w-none prose-h3:text-amber-500 prose-h3:mb-3 prose-p:text-[color:var(--th-text-secondary)] prose-p:leading-relaxed prose-li:text-[color:var(--th-text-secondary)] prose-hr:border-[color:var(--th-border)] prose-hr:my-6 prose-strong:text-[color:var(--th-text)]">
              {insightData ? (
                 <ReactMarkdown>{insightData}</ReactMarkdown>
              ) : (
                "No detailed insight available."
              )}
            </div>
          ) : (
            <div className="prose max-w-none">
              <p className="text-lg leading-relaxed font-medium" style={{ color: 'var(--th-text-secondary)' }}>
                {insightData?.detail || insightData || "No detailed insight available."}
              </p>
            </div>
          )}
          
          {(type === 'bestArea' || type === 'focusArea') && insightData?.area && (
            <div className="mt-8 pt-6 border-t flex items-center gap-4" style={{ borderColor: 'var(--th-border)' }}>
              <span className="text-sm font-medium" style={{ color: 'var(--th-text-muted)' }}>Affected Area:</span>
              <span className="px-3 py-1 rounded-lg text-sm font-semibold" style={{ background: 'var(--th-highlight)', color: 'var(--th-text)' }}>
                {insightData.area}
              </span>
            </div>
          )}
        </div>
        
        <div className="p-6 flex justify-end" style={{ background: 'var(--th-highlight)' }}>
          <button 
            onClick={onClose}
            className="px-6 py-2.5 border font-semibold rounded-xl hover:opacity-80 transition-opacity shadow-sm text-sm"
            style={{ background: 'var(--th-card)', borderColor: 'var(--th-border)', color: 'var(--th-text)' }}
          >
            Close Insight
          </button>
        </div>
      </div>
    </div>
  );
};

export default InsightModal;
