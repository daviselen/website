import { Field } from '@headlessui/react'
import StyledLabel from './Label'
import StyledInput from './Input'

export default function StyledField({type, label, children}) {
    return (
        <Field className="flex flex-col gap-100">
            {children ?? (
                <>
                    <StyledLabel>{label}</StyledLabel>
                    <StyledInput type={type} name="full_name" />
                </>
            )}
        </Field>
    )
}