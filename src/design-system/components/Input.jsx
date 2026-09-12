import { Input } from '@headlessui/react'

function StyledInput({type = "text"}) {
  const allowedTypes = ['text', 'tel', 'email', 'number', 'password', 'hidden', 'search', 'url'];

  // Enforce required option value
  if (!allowedTypes.includes(type)) {
    throw new Error(
      `Invalid prop 'type' supplied to 'Input'. Expected one of ${allowedVariants.join(', ')}.`
    );
  }

  return <Input name="full_name" type={type} className="block w-full py-100 px-200 text-pre-title bg-neutral-800 border-b-2 border-neutral-200 invalid:border-red invalid:text-red data-focus:ring-primary-300 data-focus:border-primary-300 focus:border-primary-300 focus:invalid:border-red focus:invalid:text-red" />
}

export default StyledInput;