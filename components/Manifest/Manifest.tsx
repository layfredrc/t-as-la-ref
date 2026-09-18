import './Manifest.css'
import AnimatedCopy from '../AnimatedCopy'
import StickyCards from '../StickyCards/StickyCards'

/**
 * Server Component : le bloc GSAP qu'il portait ciblait des `.service-card`
 * qui n'existent nulle part dans le DOM (reliquat d'un gabarit), et ne
 * faisait donc que loguer un tableau vide à chaque montage.
 */
const Manifest = () => {
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
