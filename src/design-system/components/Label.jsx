import { Label } from '@headlessui/react'

function StyledLabel({className = "", children}) {
  // Same fix as Input: text-pre-title is the real 32px desktop spec, scaled
  // down for mobile rather than fixed at every width.
  return (
    <Label className={`font-narrow text-lg font-semibold uppercase md:text-2xl lg:text-pre-title ${className}`}>
        {children}
    </Label>
  );
}

export default StyledLabel;