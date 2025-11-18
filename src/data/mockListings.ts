import type { Listing } from '../types/listing'

export const mockListings: Listing[] = [
  {
    id: 'patio-loft',
    title: 'Патио-лофт с панорамами на Сити',
    location: 'Москва · Хамовники',
    price: '220 000 ₽/мес',
    area: '92 м² · 2 спальни',
    availableFrom: 'готово к въезду',
    tags: ['патийная терраса', 'вид на реку'],
    features: ['Окна от пола до потолка', 'Кухня Bulthaup с техникой Miele', 'Встроенный климат-контроль'],
    mood: 'calm',
    thumbnail:
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=960&q=80',
  },
  {
    id: 'atrium-suite',
    title: 'Атриум с двусветной гостиной',
    location: 'Санкт-Петербург · Петроградская сторона',
    price: '185 000 ₽/мес',
    area: '105 м² · 3 спальни',
    availableFrom: 'с 1 декабря',
    tags: ['двухуровневые окна', 'два паркинга'],
    features: ['Собственный лифт в квартиру', 'Умный дом и сценарии света', 'Тёплый пол во всех зонах'],
    mood: 'energetic',
    thumbnail:
      'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=960&q=80',
  },
  {
    id: 'heritage-house',
    title: 'Дом в историческом квартале с садом',
    location: 'Казань · Старо-Татарская слобода',
    price: '140 000 ₽/мес',
    area: '128 м² · 3 спальни',
    availableFrom: 'с 15 ноября',
    tags: ['внутренний сад', 'рабочее место'],
    features: ['Высокие потолки 4,2 м', 'Авторская мебель и печь-камин', 'Гараж с зарядкой для EV'],
    mood: 'heritage',
    thumbnail:
      'https://images.unsplash.com/photo-1430285561322-7808604715df?auto=format&fit=crop&w=960&q=80',
  },
]
