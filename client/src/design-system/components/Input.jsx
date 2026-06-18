import { useState } from 'react';
import clsx from 'clsx';

export function Input({ label, error, icon: Icon, type = 'text', className, id, ...rest }) {
  const [focused, setFocused] = useState(false);
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={clsx('relative', className)}>
      <div className="relative">
        {Icon && (
          <Icon
            className={clsx(
              'absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200',
              focused ? 'text-accent' : 'text-zinc-500'
            )}
          />
        )}
        <input
          id={inputId}
          type={type}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder=" "
          className={clsx(
            'peer w-full bg-zinc-900/60 border rounded-xl px-4 py-3 text-white/90 text-sm',
            'placeholder-transparent outline-none transition-all duration-200',
            Icon && 'pl-10',
            error
              ? 'border-danger/50 focus:border-danger focus:ring-1 focus:ring-danger/30'
              : 'border-white/[0.06] focus:border-accent focus:ring-1 focus:ring-accent/30',
          )}
          {...rest}
        />
        {label && (
          <label
            htmlFor={inputId}
            className={clsx(
              'absolute text-zinc-500 text-sm transition-all duration-200 pointer-events-none',
              'peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm',
              'peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs peer-focus:px-1',
              'peer-not-placeholder-shown:top-0 peer-not-placeholder-shown:-translate-y-1/2 peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:px-1',
              Icon ? 'left-10' : 'left-3.5',
              focused ? 'text-accent' : 'text-zinc-500',
              'bg-zinc-950'
            )}
          >
            {label}
          </label>
        )}
      </div>
      {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
    </div>
  );
}
