import * as React from "react"
import { useEffect } from "react"

export const MOBILE_BREAKPOINT = 1024

export function useIsMobile(breakpoint: number = MOBILE_BREAKPOINT) {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  useEffect(() => {
    const maxWidth = breakpoint - 1
    const mql = window.matchMedia(`(max-width: ${maxWidth}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < breakpoint)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < breakpoint)
    return () => mql.removeEventListener("change", onChange)
  }, [breakpoint])

  return !!isMobile
}
