import { Input } from '@headlessui/react'

function StyledInput({type = "text", name, placeholder = ""}) {
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
  return <Input name={name} type={type} placeholder={placeholder} style={{ outline: '0' }} className="block w-full border-0 border-none bg-transparent px-0 py-100 text-lg outline-none invalid:border-red invalid:text-red focus:invalid:border-red focus:invalid:text-red md:text-2xl lg:text-pre-title" />
}

export default StyledInput;