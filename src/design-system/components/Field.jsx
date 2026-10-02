import { Field } from '@headlessui/react'
import StyledLabel from './Label'
import StyledInput from './Input'

export default function StyledField({type, label, name, children, gap = "100"}) {
    const gapClass = gap === "0" ? "gap-0" : "gap-100";
    return (
        <div className="rounded-md p-50 focus-within:bg-shine-gradient focus-within:animate-shine">
            <Field className={`flex flex-col ${gapClass} rounded-md bg-neutral-1000 px-300 py-200`}>
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