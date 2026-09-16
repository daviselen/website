import { Input } from '@headlessui/react'

function StyledInput({type = "text"}) {
  const allowedTypes = ['text', 'tel', 'email', 'number', 'password', 'hidden', 'search', 'url'];

  // Enforce required option value
  if (!allowedTypes.includes(type)) {
    throw new Error(
      `Invalid prop 'type' supplied to 'Input'. Expected one of ${allowedVariants.join(', ')}.`
    );
  }

  // text-pre-title (32px/40px) is the real desktop spec but was fixed at
  // every size — a form field that big is oversized on a phone. Scale up
  // to it same as everywhere else: small mobile default, real size at lg.
  return <Input name="full_name" type={type} className="block w-full py-100 px-200 text-lg md:text-2xl lg:text-pre-title bg-neutral-800 border-b-2 border-neutral-200 invalid:border-red invalid:text-red data-focus:ring-primary-300 data-focus:border-primary-300 focus:border-primary-300 focus:invalid:border-red focus:invalid:text-red" />
}

export default StyledInput;