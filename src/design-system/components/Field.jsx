import { Field } from '@headlessui/react'
import StyledLabel from './Label'
import StyledInput from './Input'

export default function StyledField({type, label, name, children, gap = "100"}) {
    const gapClass = gap === "0" ? "gap-0" : "gap-100";
    return (
        <div className="rounded-md p-25 focus-within:bg-shine-gradient light:focus-within:bg-shine-gradient-light focus-within:animate-shine reduced-motion:focus-within:animate-none">
            <Field className={`flex flex-col ${gapClass} rounded-md bg-neutral-1000 light:bg-neutral-0 px-200 py-100 md:px-300 md:py-200`}>
                {children ?? (
                    <>
                        <StyledLabel>{label}</StyledLabel>
                        <StyledInput type={type} name={name} />
                    </>
                )}
            </Field>
        </div>
    )
}