import { useEffect, useRef } from 'react'
import { Textarea } from '@headlessui/react'

// No library for this — it's one DOM measurement (reset height, read
// scrollHeight, apply it), not worth a dependency. Re-measures on window
// resize too, since the same text can wrap to a different number of lines
// when the field's width changes (not just on keystrokes).
//
// The height is put back the way it was before this function returns, then
// set to the new target a frame later — rather than straight to the target
// here — because reading scrollHeight forces a layout flush. Doing that
// between the two `style.height` writes would make the browser treat the
// 'auto'-resolved value as the pre-change state, leaving nothing for the
// transition in the className below to animate from (it'd just snap).
function resize(node) {
  if (!node) return
  const previousHeight = node.style.height
  node.style.height = 'auto'
  const targetHeight = `${node.scrollHeight}px`
  node.style.height = previousHeight
  requestAnimationFrame(() => {
    node.style.height = targetHeight
  })
}

function StyledTextarea({placeholder = " ", onInput, ...props}) {
  const ref = useRef(null)

  useEffect(() => {
    const node = ref.current
    resize(node)
    const handleResize = () => resize(node)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // `peer` + a non-empty placeholder match StyledInput's trick, so Contact's
  // Message field can float/fade its label the same way Field.jsx does for
  // Name/Phone/Email. `rows={1}` plus the resize-on-input below starts it at
  // the same single-line height as the other fields, then grows it to fit
  // as the person types past that first line.
  return (
    <Textarea
      ref={ref}
      rows={1}
      placeholder={placeholder}
      onInput={(event) => {
        resize(event.currentTarget)
        onInput?.(event)
      }}
      className="peer block w-full resize-none overflow-hidden border-0 border-none bg-transparent px-0 py-100 text-lg transition-all duration-200 focus:outline-none invalid:border-red invalid:text-red focus:invalid:border-red focus:invalid:text-red md:text-2xl lg:text-pre-title"
      {...props}
    ></Textarea>
  )
}

export default StyledTextarea;