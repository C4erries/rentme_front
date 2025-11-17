import type { FormEvent } from 'react'
import { useState } from 'react'

const stats = [
  { label: 'Сдано в 2024', value: '312', detail: 'семей нашли дом' },
  { label: 'Среднее время поиска', value: '9 дней', detail: 'благодаря личному куратору' },
  { label: 'Комиссия', value: '0 ₽', detail: 'входит в абонемент' },
]

const vibes = ['тихий двор', 'видовые окна', 'pet-friendly', 'сад на крыше']

export function HeroSection() {
  const [city, setCity] = useState('Москва')
  const [budget, setBudget] = useState('120 000 ₽')
  const [date, setDate] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const payload = { city, budget, date }
    console.table(payload)
  }

  return (
    <section className="container grid gap-8 py-10 md:grid-cols-2 md:gap-12 md:py-16">
      <div className="space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-dry-sage-200 bg-dry-sage-50/70 px-4 py-2 text-xs font-medium text-dry-sage-700">
          rentme club · mobile-first аренда
        </div>
        <h1 className="text-3xl font-semibold leading-tight tracking-tight text-dusty-mauve-900 sm:text-4xl lg:text-5xl">
          Подбор квартир, которые подстраиваются под ваш ритм жизни
        </h1>
        <p className="text-base text-dusty-mauve-600 sm:text-lg">
          Курируем квартирный опыт: приватные показы, помощь в переговорах и поддержка после
          переезда. Приложение подскажет подходящие дома, а куратор доведёт сделку до ключей.
        </p>

        <div className="flex flex-wrap gap-2">
          {vibes.map((item) => (
            <span
              key={item}
              className="rounded-full bg-white/70 px-4 py-1 text-xs font-semibold text-dusty-mauve-600 shadow-sm"
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      <div className="glass-panel space-y-6 p-5 sm:p-6">
        <div>
          <p className="text-sm font-semibold text-dusty-mauve-700">Мгновенный бриф</p>
          <p className="text-sm text-dusty-mauve-500">
            Укажите базовые параметры — куратор продолжит подбор в приложении.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-dusty-mauve-600">
            Город и район
            <input
              className="mt-1 w-full rounded-2xl border border-dusty-mauve-100 bg-white/90 px-4 py-3 text-dusty-mauve-900 outline-none transition focus:border-dry-sage-400 focus:ring-2 focus:ring-dry-sage-100"
              placeholder="Москва · Хамовники"
              value={city}
              onChange={(event) => setCity(event.target.value)}
            />
          </label>

          <label className="block text-sm font-medium text-dusty-mauve-600">
            Бюджет
            <input
              className="mt-1 w-full rounded-2xl border border-dusty-mauve-100 bg-white/90 px-4 py-3 text-dusty-mauve-900 outline-none transition focus:border-dry-sage-400 focus:ring-2 focus:ring-dry-sage-100"
              placeholder="до 150 000 ₽"
              value={budget}
              onChange={(event) => setBudget(event.target.value)}
            />
          </label>

          <label className="block text-sm font-medium text-dusty-mauve-600">
            Дата въезда
            <input
              type="date"
              className="mt-1 w-full rounded-2xl border border-dusty-mauve-100 bg-white/90 px-4 py-3 text-dusty-mauve-900 outline-none transition focus:border-dry-sage-400 focus:ring-2 focus:ring-dry-sage-100"
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </label>

          <button
            type="submit"
            className="w-full rounded-2xl bg-dusty-mauve-900 py-3 text-sm font-semibold text-dusty-mauve-50 transition hover:bg-dusty-mauve-800"
          >
            Получить куратора
          </button>
        </form>

        <div className="grid gap-4 rounded-2xl bg-dusty-mauve-900/5 p-4 sm:grid-cols-3">
          {stats.map((item) => (
            <div key={item.label} className="space-y-1">
              <p className="text-xs uppercase text-dusty-mauve-500">{item.label}</p>
              <p className="text-lg font-semibold text-dusty-mauve-900">{item.value}</p>
              <p className="text-xs text-dusty-mauve-500">{item.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
