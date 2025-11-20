import { useEffect, useState } from 'react'
import { withViewTransition } from '../../lib/viewTransitions'
import {
  createHostListing,
  publishHostListing,
  updateHostListing,
} from '../../lib/hostListingApi'
import { useHostListingDetail } from '../../hooks/useHostListingDetail'
import { useHostPriceSuggestion } from '../../hooks/useHostPriceSuggestion'
import type { HostListingPayload } from '../../types/listing'

const steps = [
  'Базовая информация',
  'Расположение',
  'Описание и удобства',
  'Фото',
  'Цена и доступность',
  'Подтверждение',
]

const propertyTypes = [
  '',
  'apartment',
  'loft',
  'townhouse',
  'cabin',
  'villa',
]

interface HostListingWizardPageProps {
  route: { pathname: string }
  onNavigate: (path: string) => void
}

const emptyForm: HostListingPayload = {
  title: '',
  description: '',
  property_type: '',
  address: {
    line1: '',
    line2: '',
    city: '',
    country: '',
    lat: 0,
    lon: 0,
  },
  amenities: [],
  house_rules: [],
  tags: [],
  highlights: [],
  thumbnail_url: '',
  cancellation_policy_id: '',
  guests_limit: 1,
  min_nights: 1,
  max_nights: 1,
  nightly_rate_cents: 0,
  bedrooms: 1,
  bathrooms: 1,
  area_sq_m: 0,
  available_from: '',
  photos: [],
}

export function HostListingWizardPage({ route, onNavigate }: HostListingWizardPageProps) {
  const editMatch = route.pathname.match(/^\/host\/listings\/([^/]+)\/edit$/)
  const listingId = editMatch ? editMatch[1] : null
  const isEditMode = Boolean(editMatch)

  const { data: listingDetail, loading: detailLoading, error: detailError, refresh: refreshDetail } =
    useHostListingDetail(listingId)
  const priceSuggestion = useHostPriceSuggestion(listingId)

  const [form, setForm] = useState<HostListingPayload>(emptyForm)
  const [currentStep, setCurrentStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [savingError, setSavingError] = useState<string | null>(null)
  const [publishSuccess, setPublishSuccess] = useState<string | null>(null)
  const [statusNote, setStatusNote] = useState<string | null>(null)
  const updateForm = (patch: Partial<HostListingPayload>) =>
    setForm((prev) => ({ ...prev, ...patch }))
  const updateAddress = (patch: Partial<HostListingPayload['address']>) =>
    setForm((prev) => ({ ...prev, address: { ...prev.address, ...patch } }))
  const updatePhotos = (photos: string[]) => updateForm({ photos })

  useEffect(() => {
    if (listingDetail) {
      setForm({
        title: listingDetail.title,
        description: listingDetail.description,
        property_type: listingDetail.property_type,
        address: listingDetail.address,
        amenities: listingDetail.amenities ?? [],
        house_rules: listingDetail.house_rules ?? [],
        tags: listingDetail.tags ?? [],
        highlights: listingDetail.highlights ?? [],
        thumbnail_url: listingDetail.thumbnail_url,
        cancellation_policy_id: listingDetail.cancellation_policy_id,
        guests_limit: listingDetail.guests_limit,
        min_nights: listingDetail.min_nights,
        max_nights: listingDetail.max_nights,
        nightly_rate_cents: listingDetail.nightly_rate_cents,
        bedrooms: listingDetail.bedrooms,
        bathrooms: listingDetail.bathrooms,
        area_sq_m: listingDetail.area_sq_m,
        available_from: listingDetail.available_from?.slice(0, 10) ?? '',
        photos: listingDetail.photos ?? [],
      })
      setStatusNote(`Текущий статус: ${listingDetail.status}`)
      priceSuggestion.fetchSuggestion()
    }
  }, [listingDetail])

  const handleBack = () => {
    if (currentStep === 0) {
      withViewTransition(() => onNavigate('/host/listings'))
      return
    }
    setCurrentStep((step) => Math.max(0, step - 1))
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((step) => Math.min(steps.length - 1, step + 1))
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setSavingError(null)
    const payload = preparePayload(form)
    try {
      const response = isEditMode
        ? await updateHostListing(listingId!, payload)
        : await createHostListing(payload)
      setStatusNote(`Сохранено. ID: ${response.data.id}`)
      if (!isEditMode && response.data.id) {
        withViewTransition(() => onNavigate(`/host/listings/${response.data.id}/edit`))
      } else {
        refreshDetail()
      }
    } catch (err) {
      setSavingError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const handlePublish = async () => {
    if (!listingId) {
      return
    }
    setSaving(true)
    setPublishSuccess(null)
    try {
      const response = await publishHostListing(listingId)
      setPublishSuccess(`Объявление опубликовано (${response.data.status})`)
      refreshDetail()
    } catch (err) {
      setSavingError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const renderedListString = (values: string[]) => values.join(', ')

  const stepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Название"
              value={form.title}
              onChange={(value) => updateForm({ title: String(value) })}
            />
            <Input
              label="Тип жилья"
              component="select"
              value={form.property_type}
              options={propertyTypes}
              onChange={(value) => updateForm({ property_type: String(value) })}
            />
            <Input
              label="Кол-во гостей"
              type="number"
              value={form.guests_limit}
              onChange={(value) => updateForm({ guests_limit: Number(value) || 1 })}
            />
            <Input
              label="Спальни"
              type="number"
              value={form.bedrooms}
              onChange={(value) => updateForm({ bedrooms: Number(value) })}
            />
            <Input
              label="Ванные"
              type="number"
              value={form.bathrooms}
              onChange={(value) => updateForm({ bathrooms: Number(value) })}
            />
          </div>
        )
      case 1:
        return (
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Адрес (строка 1)"
              value={form.address.line1}
              onChange={(value) =>
                updateAddress({ line1: String(value) })
              }
            />
            <Input
              label="Адрес (строка 2)"
              value={form.address.line2}
              onChange={(value) =>
                updateAddress({ line2: String(value) })
              }
            />
            <Input
              label="Город"
              value={form.address.city}
              onChange={(value) =>
                updateAddress({ city: String(value) })
              }
            />
            <Input
              label="Страна"
              value={form.address.country}
              onChange={(value) =>
                updateAddress({ country: String(value) })
              }
            />
            <Input label="Широта" type="number" value={form.address.lat} onChange={(value) => updateAddress({ lat: Number(value) })} />
            <Input label="Долгота" type="number" value={form.address.lon} onChange={(value) => updateAddress({ lon: Number(value) })} />
          </div>
        )
      case 2:
        return (
          <div className="grid gap-4">
            <Textarea label="Описание" value={form.description} onChange={(value) => updateForm({ description: String(value) })} rows={4} />
            <Textarea label="Удобства (каждое с новой строки)" value={renderedListString(form.amenities)} onChange={(value) => updateForm({ amenities: splitLines(value) })} rows={3} />
            <Textarea label="Правила" value={renderedListString(form.house_rules)} onChange={(value) => updateForm({ house_rules: splitLines(value) })} rows={3} />
            <Textarea label="Теги" value={renderedListString(form.tags)} onChange={(value) => updateForm({ tags: splitLines(value) })} rows={3} />
            <Textarea label="Хайлайты" value={renderedListString(form.highlights)} onChange={(value) => updateForm({ highlights: splitLines(value) })} rows={3} />
          </div>
        )
      case 3:
        return (
          <div className="space-y-4">
            <Input
              label="Миниатюра"
              value={form.thumbnail_url ?? ''}
              onChange={(value) => updateForm({ thumbnail_url: String(value) })}
            />
            <PhotoList photos={form.photos} onChange={(photos) => updatePhotos(photos)} />
          </div>
        )
      case 4:
        return (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Input label="Цена за ночь (RUB)" type="number" value={form.nightly_rate_cents / 100 || ''} onChange={(value) => updateForm({ nightly_rate_cents: Math.round(Number(value) * 100) })} />
              <Input label="Мин. ночей" type="number" value={form.min_nights} onChange={(value) => updateForm({ min_nights: Number(value) })} />
              <Input label="Макс. ночей" type="number" value={form.max_nights} onChange={(value) => updateForm({ max_nights: Number(value) })} />
            </div>
            <Input label="Доступно с" type="date" value={form.available_from ?? ''} onChange={(value) => updateForm({ available_from: String(value) })} />
            <div className="rounded-3xl border border-dusty-mauve-200 bg-white/80 p-5 shadow-soft">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-dusty-mauve-500">Rentme помогает подобрать цену</p>
                  <h3 className="text-lg font-semibold text-dusty-mauve-900">Рекомендованная цена</h3>
                </div>
                <button
                  type="button"
                  onClick={() => priceSuggestion.fetchSuggestion({ guests: form.guests_limit })}
                  className="rounded-full bg-dusty-mauve-900 px-4 py-2 text-xs font-semibold text-dusty-mauve-50"
                >
                  {priceSuggestion.loading ? 'Идёт расчёт...' : 'Получить рекомендацию'}
                </button>
              </div>
              {priceSuggestion.error && (
                <p className="mt-3 text-sm text-red-600">{priceSuggestion.error}</p>
              )}
              {priceSuggestion.data && (
                <div className="mt-4 space-y-2 text-sm text-dusty-mauve-700">
                  <p className="text-base font-semibold text-dusty-mauve-900">
                    {formatMoney(priceSuggestion.data.recommended_price_cents)}{' '}
                    <span className="text-xs text-dry-sage-500">({priceSuggestion.data.price_level})</span>
                  </p>
                  <p>{priceSuggestion.data.message}</p>
                  <p className="text-xs text-dusty-mauve-500">
                    Период: {priceSuggestion.data.range.check_in} — {priceSuggestion.data.range.check_out}
                  </p>
                </div>
              )}
            </div>
          </div>
        )
      case 5:
        return (
          <div className="space-y-4">
            <div className="rounded-3xl border border-dusty-mauve-200 bg-white/80 p-5 shadow-soft">
              <h3 className="text-base font-semibold text-dusty-mauve-900">Краткое резюме</h3>
              <p className="text-sm text-dusty-mauve-600">
                {form.title || 'Название не указано'} — {form.property_type || 'тип не задан'}.
              </p>
              <p className="text-sm text-dusty-mauve-600">
                {form.address.city}, {form.address.country}
              </p>
              <p className="text-sm text-dusty-mauve-600">
                {form.guests_limit} гостей · {form.bedrooms} спальни · {form.bathrooms} ванны
              </p>
              <p className="text-sm text-dusty-mauve-600">
                Цена: {formatMoney(form.nightly_rate_cents)} · Минимум {form.min_nights} ночей
              </p>
              {statusNote && <p className="text-xs text-dry-sage-500">{statusNote}</p>}
            </div>
            {savingError && (
              <p className="text-sm text-red-600">{savingError}</p>
            )}
            {publishSuccess && (
              <p className="text-sm text-dry-sage-700">{publishSuccess}</p>
            )}
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="rounded-full bg-dusty-mauve-900 px-6 py-3 text-sm font-semibold text-dusty-mauve-50 disabled:opacity-60"
              >
                {saving ? 'Сохраняем...' : isEditMode ? 'Сохранить изменения' : 'Сохранить черновик'}
              </button>
              {isEditMode && (
                <button
                  type="button"
                  onClick={handlePublish}
                  disabled={saving}
                  className="rounded-full border border-dusty-mauve-900 px-6 py-3 text-sm font-semibold text-dusty-mauve-900"
                >
                  {saving ? 'Публикуем...' : 'Опубликовать'}
                </button>
              )}
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="bg-dusty-mauve-50 min-h-screen pb-16">
      <div className="container py-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-dry-sage-400">Хост-панель</p>
            <h1 className="text-3xl font-semibold text-dusty-mauve-900">
              {isEditMode ? 'Редактирование объявления' : 'Создать новое объявление'}
            </h1>
          </div>
          <button
            type="button"
            onClick={() => withViewTransition(() => onNavigate('/host/listings'))}
            className="rounded-full border border-dusty-mauve-200 px-5 py-2 text-sm font-semibold text-dusty-mauve-900"
          >
            Назад к списку
          </button>
        </div>

        {detailLoading && <p className="mt-6 text-sm text-dusty-mauve-500">Загрузка данных...</p>}
        {detailError && (
          <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            Ошибка загрузки: {detailError}
          </div>
        )}

        <div className="mt-8 space-y-4">
          <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-dusty-mauve-600">
            {steps.map((step, index) => (
              <span
                key={step}
                className={`rounded-2xl px-4 py-2 ${
                  index === currentStep
                    ? 'bg-dusty-mauve-900 text-dusty-mauve-50'
                    : 'bg-white/70 text-dusty-mauve-500'
                }`}
              >
                {step}
              </span>
            ))}
          </div>
          <div className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-soft">
            {stepContent()}
          </div>
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleBack}
              className="rounded-2xl border border-dusty-mauve-200 px-5 py-2 text-sm font-semibold text-dusty-mauve-900"
            >
              Назад
            </button>
            {currentStep < steps.length - 1 && (
              <button
                type="button"
                onClick={handleNext}
                className="rounded-2xl bg-dusty-mauve-900 px-5 py-2 text-sm font-semibold text-dusty-mauve-50"
              >
                Далее
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}


function Input({
  label,
  value,
  type = 'text',
  component = 'input',
  onChange,
  options,
}: {
  label: string
  value: string | number
  type?: string
  component?: 'input' | 'select'
  onChange: (value: string | number) => void
  options?: string[]
}) {
  if (component === 'select') {
    return (
      <label className="flex flex-col gap-1 text-sm text-dusty-mauve-600">
        <span>{label}</span>
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="rounded-2xl border border-white/60 bg-white/80 px-4 py-2 text-sm text-dusty-mauve-900"
        >
          {options?.map((option) => (
            <option key={option} value={option}>
              {option || 'Выберите'}
            </option>
          ))}
        </select>
      </label>
    )
  }
  return (
    <label className="flex flex-col gap-1 text-sm text-dusty-mauve-600">
      <span>{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(type === 'number' ? Number(event.target.value) : event.target.value)}
        className="rounded-2xl border border-white/60 bg-white/80 px-4 py-2 text-sm text-dusty-mauve-900"
      />
    </label>
  )
}
function Textarea({
  label,
  value,
  onChange,
  rows = 3,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  rows?: number
}) {
  return (
    <label className="flex flex-col gap-1 text-sm text-dusty-mauve-600">
      <span>{label}</span>
      <textarea
        rows={rows}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-2xl border border-white/60 bg-white/80 px-4 py-2 text-sm text-dusty-mauve-900"
      />
    </label>
  )
}

type PhotoListProps = {
  photos: string[]
  onChange: (photos: string[]) => void
}

function PhotoList({ photos, onChange }: PhotoListProps) {
  const updatePhoto = (index: number, value: string) => {
    const copy = [...photos]
    copy[index] = value
    onChange(copy)
  }

  const addPhoto = () => {
    onChange([...photos, ''])
  }

  const removePhoto = (index: number) => {
    const copy = [...photos]
    copy.splice(index, 1)
    onChange(copy)
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-dusty-mauve-900">Фотографии</p>
      {photos.map((photo, index) => (
        <div key={index} className="flex items-center gap-3">
          <input
            type="text"
            value={photo}
            onChange={(event) => updatePhoto(index, event.target.value)}
            placeholder="https://example.com/photo.jpg"
            className="flex-1 rounded-2xl border border-white/60 bg-white/80 px-4 py-2 text-sm text-dusty-mauve-900"
          />
          <button
            type="button"
            onClick={() => removePhoto(index)}
            className="text-xs font-semibold text-red-600"
          >
            Удалить
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addPhoto}
        className="rounded-2xl border border-dusty-mauve-200 px-4 py-2 text-xs font-semibold text-dusty-mauve-900"
      >
        Добавить фото
      </button>
    </div>
  )
}

function splitLines(value: string) {
  return value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean)
}

function preparePayload(form: HostListingPayload) {
  const goodPhotos = (form.photos ?? []).filter(Boolean)
  return {
    ...form,
    photos: goodPhotos,
    available_from: form.available_from ? new Date(form.available_from).toISOString() : undefined,
  }
}

function formatMoney(cents: number) {
  if (!cents) {
    return '—'
  }
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(Math.round(cents / 100))
}
