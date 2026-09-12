import { Label } from '@headlessui/react'

function StyledLabel({children}) {
  return (
    <Label className="font-narrow font-semibold text-pre-title uppercase">
        {children}
    </Label>
  );
}

export default StyledLabel;