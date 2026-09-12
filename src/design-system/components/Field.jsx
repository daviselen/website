import { Field } from '@headlessui/react'
import StyledLabel from './Label'
import StyledInput from './Input'

export default function StyledField({type, label}) {
    return (
        <Field className="flex flex-col gap-100">
            <StyledLabel>{label}</StyledLabel>
            <StyledInput type={type} name="full_name" />
        </Field>
    )
}