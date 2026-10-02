import { useState } from "react";
import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions } from "@headlessui/react";

function StyledCombobox({options, placeholder}) {
    const [selectedOption, setSelectedOption] = useState(options[0])
    const [query, setQuery] = useState('')
  
    const filteredOptions =
      query === '' ? options : options.filter((option) => {
        return option.name.toLowerCase().includes(query.toLowerCase())
      })

  return (
    <Combobox value={selectedOption} onChange={setSelectedOption} onClose={() => setQuery('')}>
        <div className="relative">
            <ComboboxInput
                displayValue={(option) => option?.name}
                onChange={(event) => setQuery(event.target.value)}
                style={{ outline: '0' }}
                className="block w-full border-0 border-none bg-transparent px-0 py-100 text-lg text-neutral-100 outline-none transition-colors invalid:border-red invalid:text-red focus:invalid:border-red md:text-2xl lg:text-pre-title"
                placeholder={placeholder}
            />
            
            <ComboboxButton className="absolute right-0 top-1/2 flex aspect-square h-full w-auto -translate-y-1/2 items-center justify-center text-neutral-400 transition-colors hover:text-white">
                <svg className="size-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
                </svg>
            </ComboboxButton>

            <ComboboxOptions 
                anchor="bottom" 
                className="data-closed:scale-95 data-closed:opacity-0 z-50 mt-2 max-h-60 w-[var(--input-width)] origin-top overflow-y-auto border border-neutral-800 bg-neutral-800 py-1 text-white shadow-2xl transition duration-200 ease-out empty:invisible focus:outline-none"
            >
            {query.length > 0 && (
                <ComboboxOption
                    value={{ id: null, name: query }}
                    className="data-focus:bg-neutral-800 data-focus:text-white flex w-full cursor-pointer items-center justify-between px-4 py-2.5 text-body-hiai transition-colors focus:bg-neutral-800 focus:text-white"
                >
                    <span>Use <span className="font-bold">&ldquo;{query}&rdquo;</span></span>
                </ComboboxOption>
            )}
            {filteredOptions.map((option) => (
                <ComboboxOption 
                    key={option.id} 
                    value={option.name} 
                    className="data-hover:bg-neutral-700 data-focus:bg-neutral-800 data-focus:text-white flex w-full cursor-pointer items-center justify-between px-4 py-2.5 text-body-hiai transition-colors hover:bg-neutral-700 focus:bg-neutral-800 focus:text-white"
                >
                    {option.name}
                </ComboboxOption>
            ))}
            </ComboboxOptions>
        </div>
    </Combobox>
  )
}

export default StyledCombobox;