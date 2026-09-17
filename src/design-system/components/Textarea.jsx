import { Textarea } from '@headlessui/react'

function StyledTextarea({...props}) {
  return (
    <Textarea
      className="data-focus:ring-primary-300 data-focus:border-primary-300 block w-full border-b-2 border-neutral-200 bg-neutral-800 px-200 py-100 text-lg invalid:border-red invalid:text-red focus:border-primary-300 focus:invalid:border-red focus:invalid:text-red md:text-2xl lg:text-pre-title"
      {...props}
    ></Textarea>
  )
}

export default StyledTextarea;