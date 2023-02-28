import * as React from 'react'
import { SVGProps } from 'react'
const SvgTool = (props: SVGProps<SVGSVGElement>) => (
  <svg width={24} height={24} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      d="M14.7 6.30001C14.5168 6.48694 14.4141 6.73826 14.4141 7.00001C14.4141 7.26176 14.5168 7.51308 14.7 7.70001L16.3 9.30001C16.4869 9.48324 16.7382 9.58587 17 9.58587C17.2617 9.58587 17.513 9.48324 17.7 9.30001L21.47 5.53001C21.9728 6.6412 22.1251 7.87924 21.9064 9.07916C21.6878 10.2791 21.1087 11.3839 20.2463 12.2463C19.3838 13.1087 18.279 13.6878 17.0791 13.9065C15.8792 14.1251 14.6412 13.9728 13.53 13.47L6.61998 20.38C6.22215 20.7778 5.68259 21.0013 5.11998 21.0013C4.55737 21.0013 4.0178 20.7778 3.61998 20.38C3.22215 19.9822 2.99866 19.4426 2.99866 18.88C2.99866 18.3174 3.22215 17.7778 3.61998 17.38L10.53 10.47C10.0271 9.35882 9.87489 8.12078 10.0935 6.92087C10.3121 5.72095 10.8913 4.61617 11.7537 3.75373C12.6161 2.8913 13.7209 2.31218 14.9208 2.09355C16.1207 1.87493 17.3588 2.02718 18.47 2.53001L14.71 6.29001L14.7 6.30001Z"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)
export default SvgTool
