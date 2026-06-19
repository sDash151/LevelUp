import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Check } from 'lucide-react';
import clsx from 'clsx';

export function Select({ 
  value, 
  onChange, 
  options = [], 
  placeholder = 'Select...', 
  className,
  disabled = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className={clsx("relative", className)} ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full gap-2 px-3 py-1.5 rounded-lg border transition-colors outline-none disabled:opacity-50"
        style={{
          background: 'var(--th-card)',
          borderColor: isOpen ? 'var(--th-primary)' : 'var(--th-border)',
          color: selectedOption ? 'var(--th-text)' : 'var(--th-text-dim)'
        }}
      >
        <span className="text-[11px] font-semibold truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown 
          className="w-3.5 h-3.5 transition-transform duration-200" 
          style={{ color: 'var(--th-text-dim)', transform: isOpen ? 'rotate(180deg)' : 'none' }} 
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute z-50 w-full mt-1 rounded-xl shadow-lg border overflow-hidden"
            style={{ 
              background: 'var(--th-card-solid)', 
              borderColor: 'var(--th-border)',
              minWidth: 'max-content'
            }}
          >
            <div className="max-h-[200px] overflow-y-auto hide-scrollbar p-1">
              {options.map((option) => {
                const isSelected = option.value === value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-[11px] font-medium transition-colors"
                    style={{
                      color: isSelected ? 'var(--th-primary)' : 'var(--th-text-secondary)',
                      background: isSelected ? 'var(--th-bg)' : 'transparent',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.background = 'var(--th-bg-secondary)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <span className="truncate pr-4">{option.label}</span>
                    {isSelected && <Check className="w-3 h-3 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
