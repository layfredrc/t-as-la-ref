import './Manifest.css'
import LiquidTitle from './LiquidTitle'
import ManifestChapters, { type ManifestPoint } from './ManifestChapters'
import ManifestNight from './ManifestNight'
import WordHighlight, { type Segment } from './WordHighlight'

/**
 * Le manifeste, en deux temps (tasteskill, moments distribués par
 * `moments.mjs pick --page software`) :
 *
 * 1. La déclaration, un écran : « Les memes aussi, c’est notre patrimoine. »
 *    en très grand, en titre liquide (`liquid-type`) qui ondule sous le
 *    pointeur, puis une phrase qui s'allume mot par mot au scroll
 *    (`word-highlight`).
 * 2. Comment une ref entre dans l'archive (le flow du brief), deux écrans :
 *    des chapitres épinglés (`pinned-chapters`), chacun montré par une
 *    vraie ref.
 */
const POINTS: ManifestPoint[] = [
  {
    index: '01',
    title: 'Tu lâches le lien',
    text: 'TikTok, YouTube ou X : tu colles l’URL, tu dis d’où ça sort. Trois étapes et ta ref est en ligne.',
    tenorId: 'vgQ373N5Yts',
    refName: 'IShowSpeed',
  },
  {
    index: '02',
    title: 'La commu complète',
    text: 'Les autres ajoutent les dérivés : le remix, la parodie, la version qui a tout cassé. Amorcée par un, complétée par tous.',
    tenorId: '6SxpB0xDCz0',
    refName: 'Oh putain Laurent',
  },
  {
    index: '03',
    title: 'Elle trouve sa place',
    text: 'Chaque ref porte trois tags : ce que c’est, d’où ça vient (FrenchCore, rap, JP anime…) et qui la capte, de l’ultra-niche au grand public.',
    tenorId: '4-odaCiEXeU',
    refName: 'Coffin dance',
  },
  {
    index: '04',
    title: 'Zéro gatekeeping',
    text: 'Boomer, daron ou gen Z : ici, « j’ai pas la ref » n’a rien de honteux. C’est le début de la recherche.',
    tenorId: 'ASGuOCPGrKE',
    refName: 'El Risitas',
  },
]

// La phrase qui s'allume mot par mot (moment `word-highlight`).
const STATEMENT: Segment[] = [
  {
    text: 'Une vanne naît sur TikTok le lundi, tout le monde la cite le mercredi, plus personne ne sait d’où elle sort le dimanche. Ici, chaque ref garde',
  },
  { text: 'son origine.', strong: true },
]

const Manifest = () => {
  return (
    <>
      <ManifestNight />
      <section className='statement' aria-labelledby='statement-title'>
        <div className='statement-wrap'>
          <p className='statement-label'>(Manifeste)</p>
          <LiquidTitle id='statement-title' className='statement-title'>
            Les memes aussi, c’est notre patrimoine.
          </LiquidTitle>
          <WordHighlight segments={STATEMENT} className='statement-lead' />
        </div>
      </section>
      <ManifestChapters points={POINTS} />
    </>
  )
}

export default Manifest
