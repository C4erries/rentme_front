import type { Listing } from '../types/listing'

export const mockListings: Listing[] = [
  {
    id: 'dune-loft',
    title: 'Песочный лофт у парка',
    location: 'Москва · Сокол',
    price: '125 000 ₽/мес',
    area: '78 м² · 2 спальни',
    availableFrom: 'с 5 декабря',
    tags: ['Балкон на юг', 'Панорамные окна'],
    features: ['Авторский ремонт', 'Мастер-спальня с гардеробом', 'Тихий двор'],
    mood: 'calm',
    thumbnail:
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'atrium',
    title: 'Атриум с видом на город',
    location: 'Санкт-Петербург · Петроградка',
    price: '148 000 ₽/мес',
    area: '93 м² · 3 спальни',
    availableFrom: 'с 12 ноября',
    tags: ['Вид на воду', 'Светлый коридор'],
    features: ['Тёплый пол', 'Смарт-система климата', 'Два парковочных места'],
    mood: 'energetic',
    thumbnail:
      'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'heritage-house',
    title: 'Дом в историческом квартале',
    location: 'Казань · Старо-Татарская слобода',
    price: '98 000 ₽/мес',
    area: '110 м² · 3 спальни',
    availableFrom: 'с 20 ноября',
    tags: ['Сад во дворе', 'Исторические детали'],
    features: ['Отдельный кабинет', 'Хранение для велосипедов', 'Тёплый гараж'],
    mood: 'heritage',
    thumbnail:
      'https://images.unsplash.com/photo-1430285561322-7808604715df?auto=format&fit=crop&w=800&q=80',
  },
]
