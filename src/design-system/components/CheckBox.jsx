import React, { useId } from 'react';

const checkboxStyles = {
  base: 'flex gap-2 items-center group font-sans text-sm transition relative [-webkit-tap-highlight-color:transparent]',
  state: {
    default: 'text-neutral-800 dark:text-neutral-200 cursor-pointer',
    disabled: 'text-neutral-300 dark:text-neutral-600 forced-colors:text-[GrayText] cursor-not-allowed',
  },
};

const boxStyles = {
  base: 'w-4 h-4 box-border shrink-0 rounded-none flex items-center justify-center border transition appearance-none cursor-pointer disabled:cursor-not-allowed',
  variants: {
    false: 'bg-white dark:bg-neutral-900 border-[var(--color)]', // [--color:var(--color-neutral-400)] dark:[--color:var(--color-neutral-400)] group-pressed:[--color:var(--color-neutral-500)] dark:group-pressed:[--color:var(--color-neutral-300)]
    true: 'bg-[var(--color)] border-[var(--color)] forced-colors:[var(--color:Highlight)]!', // [--color:var(--color-neutral-700)] group-pressed:[--color:var(--color-neutral-800)] dark:[--color:var(--color-neutral-300)] dark:group-pressed:[--color:var(--color-neutral-200)]
  },
  invalid: '[--color:var(--color-red-700)] dark:[--color:var(--color-red-600)] forced-colors:[--color:Mark]! group-pressed:[--color:var(--color-red-800)] dark:group-pressed:[--color:var(--color-red-700)]',
  disabled: '[--color:var(--color-neutral-200)] dark:[--color:var(--color-neutral-700)] forced-colors:[--color:GrayText]!',
};

const iconStyles = 'w-3 h-3 text-white dark:text-neutral-900 pointer-events-none';

export function Checkbox({ 
    label, 
    checked = false, 
    onChange, 
    description, 
    disabled = false, 
    isInvalid = false,
    className = '', 
    ...props 
  }) {
    const id = useId();
    const descriptionId = `${id}-desc`;
    
    const stateStyle = disabled ? checkboxStyles.state.disabled : checkboxStyles.state.default;
  
    const computedBoxStyle = [
      boxStyles.base,
      disabled 
        ? boxStyles.disabled 
        : isInvalid 
          ? boxStyles.invalid 
          : boxStyles.variants[String(Boolean(checked))]
    ].join(' ');
  
    return (
      <div className={`${checkboxStyles.base} ${stateStyle} ${className}`}>
        <div className="relative flex items-center justify-center">
          <input
            type="checkbox"
            id={id}
            checked={Boolean(checked)}
            onChange={onChange}
            disabled={disabled}
            aria-invalid={isInvalid}
            aria-describedby={description ? descriptionId : undefined}
            className={computedBoxStyle}
            {...props}
          />
          {/* Checkmark icon toggles properly based on the 'checked' boolean */}
          {checked && (
            <svg 
              className={`absolute ${iconStyles}`} 
              viewBox="0 0 12 10" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <polyline points="1.5 5 4.5 8 10.5 2" />
            </svg>
          )}
        </div>
        
        <label htmlFor={id} className="select-none cursor-pointer">
          {label}
        </label>
  
        {description && (
          <span id={descriptionId} className="text-xs text-neutral-500 dark:text-neutral-400">
            {description}
          </span>
        )}
      </div>
    );
}