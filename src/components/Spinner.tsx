export default function Spinner({ show = true, className }: { show: boolean, className: string }) {
  if (!show) return null
  // Explicit width/height attributes matter: without them an SVG's intrinsic
  // size is the replaced-element default (300×150), and WebKit (all iOS
  // browsers) uses that for the flex item's min-width instead of the CSS w-4 —
  // which rendered the spinner enormous inside flex buttons on mobile. CSS
  // classes still win over these attributes when a caller sets a size.
  return (
      <svg className={`animate-spin shrink-0 ${className}`} width="16" height="16" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  )
}
