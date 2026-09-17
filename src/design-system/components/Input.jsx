import { Input } from '@headlessui/react'

function StyledInput({type = "text"}) {
  const allowedTypes = ['text', 'tel', 'email', 'number', 'password', 'hidden', 'search', 'url'];

  // Enforce required option value
  if (!allowedTypes.includes(type)) {
    throw new Error(
      `Invalid prop 'type' supplied to 'Input'. Expected one of ${allowedTypes.join(', ')}.`
    );
  }

  // text-pre-title (32px/40px) is the real desktop spec but was fixed at
  // every size — a form field that big is oversized on a phone. Scale up
  // to it same as everywhere else: small mobile default, real size at lg.
  return <Input name="full_name" type={type} className="data-focus:ring-primary-300 data-focus:border-primary-300 block w-full border-b-2 border-neutral-200 bg-neutral-800 px-200 py-100 text-lg invalid:border-red invalid:text-red focus:border-primary-300 focus:invalid:border-red focus:invalid:text-red md:text-2xl lg:text-pre-title" />
}

export default StyledInput;