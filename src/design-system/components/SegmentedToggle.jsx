// "Label | Option | Option", with a vertical rule between options. The
// selected option is full strength, the others faded.
export default function SegmentedToggle({ label, options, value, onChange }) {
  return (
    <div className="flex items-center gap-3 font-narrow text-link-social font-light uppercase">
      <span>{label}</span>
      <div role="group" aria-label={label} className="flex items-center gap-3">
        {options.map((option, i) => (
          <span key={option.value} className="flex items-center gap-3">
            {i > 0 && <span aria-hidden="true" className="h-200 w-px bg-neutral-0 light:bg-neutral-1000" />}
            <button
              type="button"
              aria-pressed={value === option.value}
              onClick={() => onChange(option.value)}
              className={`cursor-pointer uppercase transition-opacity duration-300 hover:opacity-100 ${
                value === option.value ? "font-medium opacity-100" : "opacity-60"
              }`}
            >
              {option.label}
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}
