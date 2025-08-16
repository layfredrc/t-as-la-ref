'use client'
import './Manifest.css'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

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
          endTrigger: '.contact-cta',
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
            endTrigger: '.contact-cta',
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
          <div className='services-profile-icon'>
            <img src='/images/services-header/portrait.jpeg' alt='Otis Valen Portrait' />
          </div>
          <p>Your ideas. My toolbox.</p>
          <div className='services-header-title'>
            <h1>Pixel wizardry</h1>
            <h1>served fresh</h1>
          </div>
          <div className='services-header-arrow-icon'>
            <h1>&#8595;</h1>
          </div>
        </div>
      </section>
      <section className='services'>
        <div className='service-card' id='service-card-1'>
          <div className='service-card-inner'>
            <div className='service-card-content'>
              <h1>Visual DNA</h1>
            </div>
            <div className='service-card-img'>
              <img src='/images/services/service-1.jpg' alt='Experience Design' />
            </div>
          </div>
        </div>
        <div className='service-card' id='service-card-2'>
          <div className='service-card-inner'>
            <div className='service-card-content'>
              <h1>Brand Alchemy</h1>
            </div>
            <div className='service-card-img'>
              <img src='/images/services/service-2.jpg' alt='Experience Design' />
            </div>
          </div>
        </div>
        <div className='service-card' id='service-card-3'>
          <div className='service-card-inner'>
            <div className='service-card-content'>
              <h1>Feel First Design</h1>
            </div>
            <div className='service-card-img'>
              <img src='/images/services/service-3.jpg' alt='Experience Design' />
            </div>
          </div>
        </div>
        <div className='service-card' id='service-card-4'>
          <div className='service-card-inner'>
            <div className='service-card-content'>
              <h1>Human Clicks</h1>
            </div>
            <div className='service-card-img'>
              <img src='/images/services/service-4.jpg' alt='Experience Design' />
            </div>
          </div>
        </div>
      </section>

      <section className='contact-cta'>
        <div className='contact-button'>
          <a href='/contact'></a>
          <div className='contact-text-small'>
            <p>Collabs, or cosmic brainstorms welcome</p>
          </div>
          <div className='contact-text-large'>
            <h1>Hit Me Up</h1>
          </div>
        </div>
      </section>
    </section>
  )
}

export default Manifest
