import { useEffect } from 'react'
import { Header } from '../components/Header'
import { HeroSection, type HeroSearchPayload } from '../components/HeroSection'
import { AssuranceBar } from '../components/AssuranceBar'
import { FeaturedListings } from '../components/FeaturedListings'
import { HighlightsSection } from '../components/HighlightsSection'
import { NeighborhoodStories } from '../components/NeighborhoodStories'
import { TestimonialsSection } from '../components/TestimonialsSection'
import { Footer } from '../components/Footer'

interface LandingPageProps {
  onNavigate: (path: string) => void
  focusSection?: 'how-it-works' | 'stories'
}

interface CatalogSearchParams {
  location?: string
  checkIn?: string
  checkOut?: string
  guests?: number
}

export function LandingPage({ onNavigate, focusSection }: LandingPageProps) {
  const redirectToCatalog = (payload: CatalogSearchParams) => {
    const params = new URLSearchParams()
    if (payload.location) {
      params.set('location', payload.location)
    }
    if (payload.checkIn) {
      params.set('check_in', payload.checkIn)
    }
    if (payload.checkOut) {
      params.set('check_out', payload.checkOut)
    }
    if (payload.guests && payload.guests > 0) {
      params.set('guests', String(payload.guests))
    }
    const query = params.toString()
    const next = query ? `/catalog?${query}` : '/catalog'
    onNavigate(next)
  }

  const handleHeroSearch = (payload: HeroSearchPayload) => {
    redirectToCatalog(payload)
  }

  useEffect(() => {
    if (!focusSection) return
    const sectionId = focusSection === 'stories' ? 'stories' : 'how-it-works'
    const timer = window.setTimeout(() => {
      const target = document.getElementById(sectionId)
      target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
    return () => window.clearTimeout(timer)
  }, [focusSection])

  return (
    <div className="min-h-screen bg-dusty-mauve-50 text-dusty-mauve-900">
      <div className="relative isolate overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-dusty-mauve-200/60 to-transparent" />
        <div className="pointer-events-none absolute -left-10 top-24 h-72 w-72 rounded-full bg-cream-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 top-44 h-72 w-72 rounded-full bg-khaki-beige-200/40 blur-3xl" />

        <Header onNavigate={onNavigate} />
        <main className="relative z-10 space-y-4 pb-16">
          <HeroSection onSearch={handleHeroSearch} />
          <AssuranceBar />
          <FeaturedListings />
          <HighlightsSection onNavigate={onNavigate} />
          <NeighborhoodStories onNavigate={onNavigate} />
          <TestimonialsSection />
        </main>
        <Footer />
      </div>
    </div>
  )
}
