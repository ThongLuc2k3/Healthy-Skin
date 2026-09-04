import Hero from '../components/Hero'
import ExpertsShowcase from '../components/ExpertsShowcase'
import Analysis from '../components/Analysis'
import Technology from '../components/Technology'
import ServicesHighlight from '../components/ServicesHighlight'
import SponsoredStrip from '../components/SponsoredStrip'
import CTA from '../components/CTA'
import { SectionSeam } from '../components/SectionSeam'
import { useGsapScroll } from '../hooks/useGsapScroll'

function HomePage() {
  useGsapScroll()

  return (
    <div className="relative min-h-screen bg-[#eff6ff] text-[#172554] antialiased overflow-x-hidden">
      <main>
        <Hero />
        <SectionSeam />
        <ExpertsShowcase />
        <SectionSeam />
        <Analysis />
        <SectionSeam />
        <Technology />
        <ServicesHighlight />
        <SponsoredStrip />
        <CTA />
      </main>
    </div>
  )
}

export default HomePage
