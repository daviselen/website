import { Field } from '@headlessui/react'
import StyledLabel from './Label'
import StyledInput from './Input'

export default function StyledField({type, label, name, children, gap = "100"}) {
    const gapClass = gap === "0" ? "gap-0" : "gap-100";
    return (
        <Field className={`flex flex-col ${gapClass} bg-neutral-1000 rounded-md px-300 py-200 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-300`}>
            {children ?? (
                <>
                    <StyledLabel>{label}</StyledLabel>
                    <StyledInput type={type} name={name} />
                </>
            )}
        </Field>
    )
}