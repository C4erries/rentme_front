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
}

interface CatalogSearchParams {
  location?: string
  checkIn?: string
  checkOut?: string
  guests?: number
}

function CtaPanel() {
  return (
    <section className="container py-12">
      <div className="glass-panel flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <p className="text-sm uppercase text-dry-sage-600">нужна помощь</p>
          <h3 className="text-2xl font-semibold text-dusty-mauve-900">
            Подключим жильё или расскажем, как бронировать на платформе
          </h3>
          <p className="text-sm text-dusty-mauve-600">
            Опишите формат поездки или объект. Менеджер отправит ссылку на подходящие объявления или активирует личный
            кабинет хоста.
          </p>
        </div>
        <a
          href="mailto:care@rentme.app?subject=Rentme%20-%20Support%20request"
          className="rounded-full bg-dusty-mauve-900 px-6 py-3 text-center text-sm font-semibold text-dusty-mauve-50 transition hover:bg-dusty-mauve-800"
        >
          Оставить заявку
        </a>
      </div>
    </section>
  )
}

export function LandingPage({ onNavigate }: LandingPageProps) {
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
          <HighlightsSection />
          <NeighborhoodStories />
          <TestimonialsSection />
          <CtaPanel />
        </main>
        <Footer />
      </div>
    </div>
  )
}

