import * as React from 'react'
import { SVGProps } from 'react'
const SvgTv = (props: SVGProps<SVGSVGElement>) => (
  <svg width={24} height={24} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      d="M20 7H4C2.89543 7 2 7.89543 2 9V20C2 21.1046 2.89543 22 4 22H20C21.1046 22 22 21.1046 22 20V9C22 7.89543 21.1046 7 20 7Z"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M17 2L12 7L7 2" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
export default SvgTv
