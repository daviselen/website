import { Label } from '@headlessui/react'

function StyledLabel({className = "", children}) {
  // Phones step down to the 16px fluid body size (the input value below is
  // 18px, so the label no longer outweighs it); body-hiai 24px from md.
  return (
    <Label className={`font-narrow text-fluid-sm font-normal uppercase md:text-body-hiai ${className}`}>
        {children}
    </Label>
  );
}

export default StyledLabel;