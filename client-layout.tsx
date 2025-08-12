'use client'
import { useEffect, useState } from 'react'
import { ReactLenis } from 'lenis/react'
import gsap from 'gsap'

import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function ClientLayout({ children }) {
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 900)
        }

        checkMobile()

        window.addEventListener('resize', checkMobile)

        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    const scrollSettings = isMobile
        ? {
              duration: 1,
              easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
              direction: 'vertical',
              gestureDirection: 'vertical',
              smooth: true,
              smoothTouch: true,
              touchMultiplier: 1.5,
              infinite: false,
              lerp: 0.05,
              wheelMultiplier: 1,
              orientation: 'vertical',
              smoothWheel: true,
              syncTouch: true,
          }
        : {
              duration: 1.2,
              easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
              direction: 'vertical',
              gestureDirection: 'vertical',
              smooth: true,
              smoothTouch: false,
              touchMultiplier: 2,
              infinite: false,
              lerp: 0.1,
              wheelMultiplier: 1,
              orientation: 'vertical',
              smoothWheel: true,
              syncTouch: true,
          }

    return (
        <ReactLenis
            root
            options={scrollSettings}
        >
            {children}
        </ReactLenis>
    )
}
