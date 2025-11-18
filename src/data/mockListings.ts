import type { Listing } from '../types/listing'

export const mockListings: Listing[] = [
  {
    id: 'dune-loft',
    title: 'Песочный лофт с панорамами на Сити',
    location: 'Москва · Хамовники',
    price: '220 000 ₽/ночь',
    area: '92 м² · 2 спальни',
    availableFrom: 'Готово к заселению',
    tags: ['вид на реку', 'два уровня'],
    features: ['Кухня Bulthaup с техникой Miele', 'Тёплый пол во всех зонах', 'Панорамные окна в гостиной'],
    mood: 'calm',
    thumbnail:
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'atrium-suite',
    title: 'Атриум с двусветной гостиной',
    location: 'Санкт-Петербург · Петроградская сторона',
    price: '185 000 ₽/ночь',
    area: '105 м² · 3 спальни',
    availableFrom: 'С 1 декабря',
    tags: ['два паркинга', 'частный лифт'],
    features: ['Сценарии света и «умный дом»', 'Окна на канал и внутренний сад', 'Гардеробная в мастер-зоне'],
    mood: 'energetic',
    thumbnail:
      'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'heritage-house',
    title: 'Исторический дом с внутренним садом',
    location: 'Казань · Старо-Татарская слобода',
    price: '140 000 ₽/ночь',
    area: '128 м² · 3 спальни',
    availableFrom: 'С 15 ноября',
    tags: ['сад во дворе', 'камин'],
    features: ['Высокие потолки 4,2 м', 'Авторская мебель и печь-камин', 'Гараж с зарядкой для электромобиля'],
    mood: 'heritage',
    thumbnail:
      'https://images.unsplash.com/photo-1430285561322-7808604715df?auto=format&fit=crop&w=1200&q=80',
  },
]

