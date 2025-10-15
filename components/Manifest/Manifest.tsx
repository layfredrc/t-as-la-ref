'use client'
import './Manifest.css'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import AnimatedCopy from '../AnimatedCopy'
import StickyCards from '../StickyCards/StickyCards'

const Manifest = () => {
  let scrollTriggerInstances: (ScrollTrigger | undefined)[] = []

  const initAnimations = () => {
    if (window.innerWidth <= 1000) {
      scrollTriggerInstances.forEach((instance) => {
        if (instance) instance.kill()
      })
      scrollTriggerInstances = []
      return
    }

    scrollTriggerInstances.forEach((instance) => {
      if (instance) instance.kill()
    })
    scrollTriggerInstances = []

    const services = gsap.utils.toArray('.service-card') as HTMLElement[]
    console.log({ services })
    const mainTrigger = ScrollTrigger.create({
      trigger: services[0],
      start: 'top 50%',
      endTrigger: services[services.length - 1],
      end: 'top 150%',
    })
    scrollTriggerInstances.push(mainTrigger)

    services.forEach((service, index) => {
      const isLastServiceCard = index === services.length - 1
      const serviceCardInner = service.querySelector('.service-card-inner')

      if (!isLastServiceCard) {
        const pinTrigger = ScrollTrigger.create({
          trigger: service,
          start: 'top 45%',
          endTrigger: '.meme-vortex',
          end: 'top 90%',
          pin: true,
          pinSpacing: false,
        })
        scrollTriggerInstances.push(pinTrigger)

        const scrollAnimation = gsap.to(serviceCardInner, {
          y: `-${(services.length - index) * 14}vh`,
          ease: 'none',
          scrollTrigger: {
            trigger: service,
            start: 'top 45%',
            endTrigger: '.meme-vortex',
            end: 'top 90%',
            scrub: true,
          },
        })
        scrollTriggerInstances.push(scrollAnimation.scrollTrigger)
      }
    })
  }

  useGSAP(() => {
    initAnimations()
  })

  return (
    <section className='manifest'>
      <section className='services-header'>
        <div className='services-header-content'>
          <p>Enrichissons ensemble notre patrimoine du chaos numérique.</p>
          <div className='services-header-title'>
            <AnimatedCopy colorInitial='#FFFFFF' colorAccent='#e20010' colorFinal='#000091'>
              <h1>
                La France, <br /> Pays du divertissement.
              </h1>
            </AnimatedCopy>
          </div>
          {/* <section className='about'>
            <div className='header2'>
              <h3>A new chapter in engineered systems</h3>
            </div>
            <div className='copy'>
              <AnimatedCopy>
                <p>
                  In an era defined by precision and speed, innovation reshapes the foundation of
                  modern industry. Every component is built with intent, every system designed to
                  perform at scale. This is more than machinery— it is the architecture of progress,
                  setting new benchmarks for how we build, move, and connect.
                </p>
              </AnimatedCopy>
            </div>
          </section> */}
          <div className='services-header-arrow-icon'>
            <h1>&#8595;</h1>
          </div>
        </div>
      </section>
      <StickyCards />
    </section>
  )
}

export default Manifest
