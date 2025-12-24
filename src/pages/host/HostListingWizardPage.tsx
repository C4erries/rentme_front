import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Header } from '../../components/Header'
import { withViewTransition } from '../../lib/viewTransitions'
import {
  createHostListing,
  publishHostListing,
  updateHostListing,
  uploadListingPhoto,
} from '../../lib/hostListingApi'
import { useHostListingDetail } from '../../hooks/useHostListingDetail'
import { useHostPriceSuggestion } from '../../hooks/useHostPriceSuggestion'
import type { HostListingPayload } from '../../types/listing'

const propertyTypes = [
  '',
  'apartment',
  'loft',
  'townhouse',
  'cabin',
  'villa',
]

const rentalTermOptions = [
  { value: 'long_term', label: 'Долгосрочная (месяцы)' },
  { value: 'short_term', label: 'Краткосрочная (дни/недели)' },
]

const travelModes = [
  { value: 'car', label: 'На машине' },
  { value: 'transit', label: 'Общественный транспорт' },
  { value: 'walk', label: 'Пешком/вело' },
]

interface HostListingWizardPageProps {
  route: { pathname: string }
  onNavigate: (path: string) => void
}

const emptyForm: HostListingPayload = {
  title: '',
  description: '',
  property_type: '',
  rental_term: 'long_term',
  address: {
    line1: '',
    line2: '',
    city: '',
    region: '',
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
  rate_rub: 0,
  bedrooms: 1,
  bathrooms: 1,
  floor: 0,
  floors_total: 0,
  renovation_score: 5,
  building_age_years: 0,
  area_sq_m: 0,
  available_from: '',
  photos: [],
  travel_minutes: 20,
  travel_mode: 'car',
}

export function HostListingWizardPage({ route, onNavigate }: HostListingWizardPageProps) {
  const editMatch = route.pathname.match(/^\/host\/listings\/([^/]+)\/edit$/)
  const listingId = editMatch ? editMatch[1] : null
  const isEditMode = Boolean(editMatch)

  const { data: listingDetail, loading: detailLoading, error: detailError, refresh: refreshDetail } =
    useHostListingDetail(listingId)
  const {
    data: priceSuggestionData,
    loading: priceSuggestionLoading,
    error: priceSuggestionError,
    fetchSuggestion: fetchPriceSuggestion,
  } = useHostPriceSuggestion(listingId)

  const [form, setForm] = useState<HostListingPayload>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [savingError, setSavingError] = useState<string | null>(null)
  const [publishSuccess, setPublishSuccess] = useState<string | null>(null)
  const [statusNote, setStatusNote] = useState<string | null>(null)
  const [noMaxNights, setNoMaxNights] = useState(false)
  const [photoUploading, setPhotoUploading] = useState(false)
  const [photoUploadError, setPhotoUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [shouldRefreshPriceSuggestion, setShouldRefreshPriceSuggestion] = useState(false)

  const updateForm = (patch: Partial<HostListingPayload>) => setForm((prev) => ({ ...prev, ...patch }))
  const updateAddress = (patch: Partial<HostListingPayload['address']>) =>
    setForm((prev) => ({ ...prev, address: { ...prev.address, ...patch } }))

  useEffect(() => {
    setPhotoUploadError(null)
  }, [listingId])

  useEffect(() => {
    if (listingDetail) {
      const address = listingDetail.address || emptyForm.address
      const resolvedRegion = address.region || address.country || ''
      const photos = listingDetail.photos ?? []
      const thumbnailURL = listingDetail.thumbnail_url || photos[0] || ''
      setForm({
        title: listingDetail.title,
        description: listingDetail.description,
        property_type: listingDetail.property_type,
        rental_term: listingDetail.rental_term || 'long_term',
        address: {
          ...address,
          region: resolvedRegion,
          country: address.country ?? '',
        },
        amenities: listingDetail.amenities ?? [],
        house_rules: listingDetail.house_rules ?? [],
        tags: listingDetail.tags ?? [],
        highlights: listingDetail.highlights ?? [],
        thumbnail_url: thumbnailURL,
        cancellation_policy_id: listingDetail.cancellation_policy_id,
        guests_limit: listingDetail.guests_limit,
        min_nights: listingDetail.min_nights,
        max_nights: listingDetail.max_nights,
        rate_rub: listingDetail.rate_rub,
        bedrooms: listingDetail.bedrooms,
        bathrooms: listingDetail.bathrooms,
        floor: listingDetail.floor,
        floors_total: listingDetail.floors_total,
        renovation_score: listingDetail.renovation_score,
        building_age_years: listingDetail.building_age_years,
        area_sq_m: listingDetail.area_sq_m,
        available_from: listingDetail.available_from?.slice(0, 10) ?? '',
        travel_minutes: listingDetail.travel_minutes ?? emptyForm.travel_minutes,
        travel_mode: normalizeTravelMode(listingDetail.travel_mode) || emptyForm.travel_mode,
        photos,
      })
      setNoMaxNights(listingDetail.max_nights === 0)
      setStatusNote(`Статус: ${listingDetail.status}`)
    }
  }, [listingDetail, listingId])

  useEffect(() => {
    if (!listingId || !shouldRefreshPriceSuggestion) {
      return
    }
    setShouldRefreshPriceSuggestion(false)
    fetchPriceSuggestion()
  }, [listingId, shouldRefreshPriceSuggestion, fetchPriceSuggestion])

  const handleSave = async () => {
    setSaving(true)
    setSavingError(null)
    const payload = preparePayload(form)
    try {
      const response = isEditMode
        ? await updateHostListing(listingId!, payload)
        : await createHostListing(payload)
      setStatusNote(`Сохранено. ID: ${response.data.id}`)
      setShouldRefreshPriceSuggestion(Boolean(response.data.id))
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
      setSavingError('Сохраните черновик, чтобы опубликовать')
      return
    }
    setSaving(true)
    setPublishSuccess(null)
    try {
      const response = await publishHostListing(listingId)
      setPublishSuccess(`Опубликовано (${response.data.status})`)
      refreshDetail()
    } catch (err) {
      setSavingError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const handlePhotoUpload = async (file: File | null) => {
    if (!file) {
      return
    }
    if (!listingId) {
      setPhotoUploadError('Сохраните черновик, чтобы загрузить фото')
      return
    }
    setPhotoUploadError(null)
    setPhotoUploading(true)
    try {
      const response = await uploadListingPhoto(listingId, file)
      const photos = response.data.photos ?? []
      const thumbnail = response.data.thumbnail_url || photos[0] || ''
      setForm((prev) => ({
        ...prev,
        photos,
        thumbnail_url: thumbnail || prev.thumbnail_url,
      }))
    } catch (err) {
      setPhotoUploadError((err as Error).message)
    } finally {
      setPhotoUploading(false)
    }
  }

  const nightRangeLabel = useMemo(() => {
    if (noMaxNights) return 'Без ограничений по максимуму ночей'
    return `${form.min_nights}–${form.max_nights || form.min_nights} ночей`
  }, [form.max_nights, form.min_nights, noMaxNights])

  const handleBack = () => {
    withViewTransition(() => onNavigate('/host/listings'))
  }

  return (
    <div className="min-h-screen bg-dusty-mauve-50">
      <Header onNavigate={onNavigate} />
      <div className="container py-10">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-dry-sage-400">Мастер объявления</p>
            <h1 className="text-3xl font-semibold text-dusty-mauve-900">
              {isEditMode ? 'Редактирование объявления' : 'Новое объявление'}
            </h1>
            {detailLoading && <p className="text-sm text-dry-sage-600">Загружаем данные...</p>}
            {statusNote && <p className="text-sm text-dry-sage-600">{statusNote}</p>}
            {publishSuccess && <p className="text-sm text-dry-sage-700">{publishSuccess}</p>}
            {detailError && <p className="text-sm text-red-600">{detailError}</p>}
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleBack}
              className="rounded-full border border-dusty-mauve-200 px-5 py-2 text-sm font-semibold text-dusty-mauve-900 hover:border-dry-sage-400"
            >
              Назад к списку
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={handleSave}
              className="rounded-full bg-dusty-mauve-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-dusty-mauve-800 disabled:opacity-60"
            >
              {saving ? 'Сохраняем...' : 'Сохранить'}
            </button>
            <button
              type="button"
              disabled={saving || !listingId}
              onClick={handlePublish}
              className="rounded-full border border-dry-sage-500 px-5 py-2 text-sm font-semibold text-dry-sage-700 transition hover:bg-dry-sage-50 disabled:opacity-60"
            >
              Опубликовать
            </button>
          </div>
        </div>

        {savingError && <p className="mt-2 text-sm text-red-600">{savingError}</p>}

        <div className="mt-6 grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            <Section title="Основное">
              <div className="grid gap-4 md:grid-cols-2">
                <Input label="Название" value={form.title} onChange={(value) => updateForm({ title: value })} />
                <Select
                  label="Тип жилья"
                  value={form.property_type}
                  options={propertyTypes}
                  onChange={(value) => updateForm({ property_type: value })}
                />
                <Select
                  label="Тип аренды"
                  value={form.rental_term}
                  options={rentalTermOptions.map((opt) => opt.value)}
                  optionLabels={Object.fromEntries(rentalTermOptions.map((opt) => [opt.value, opt.label]))}
                  onChange={(value) => updateForm({ rental_term: value || 'long_term' })}
                />
                <Input
                  label="Гостей"
                  type="number"
                  value={form.guests_limit}
                  onChange={(value) => updateForm({ guests_limit: Number(value) || 1 })}
                />
                <Input
                  label="Спален"
                  type="number"
                  value={form.bedrooms}
                  onChange={(value) => updateForm({ bedrooms: Number(value) || 0 })}
                />
                <Input
                  label="Санузлов"
                  type="number"
                  value={form.bathrooms}
                  onChange={(value) => updateForm({ bathrooms: Number(value) || 0 })}
                />
              </div>
            </Section>

            <Section title="Локация">
              <div className="grid gap-4 md:grid-cols-2">
                <Input label="Адрес, строка 1" value={form.address.line1} onChange={(value) => updateAddress({ line1: value })} />
                <Input label="Адрес, строка 2" value={form.address.line2} onChange={(value) => updateAddress({ line2: value })} />
                <Input label="Город" value={form.address.city} onChange={(value) => updateAddress({ city: value })} />
                <Input
                  label="Регион / страна"
                  value={form.address.region}
                  onChange={(value) => updateAddress({ region: value, country: form.address.country || value })}
                />
                <Input label="Широта" type="number" value={form.address.lat} onChange={(value) => updateAddress({ lat: Number(value) || 0 })} />
                <Input label="Долгота" type="number" value={form.address.lon} onChange={(value) => updateAddress({ lon: Number(value) || 0 })} />
                <Input
                  label="Минут до центра/транспорта"
                  type="number"
                  value={form.travel_minutes}
                  onChange={(value) => updateForm({ travel_minutes: Math.max(0, Number(value) || 0) })}
                  hint="Используется в ML-рекомендации"
                />
                <Select
                  label="Как добираются"
                  value={form.travel_mode || 'car'}
                  options={travelModes.map((item) => item.value)}
                  optionLabels={Object.fromEntries(travelModes.map((item) => [item.value, item.label]))}
                  onChange={(value) => updateForm({ travel_mode: value || 'car' })}
                />
              </div>
            </Section>

            <Section title="Параметры жилья">
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label="Площадь (м²)"
                  type="number"
                  value={form.area_sq_m}
                  onChange={(value) => updateForm({ area_sq_m: Number(value) || 0 })}
                />
                <Input
                  label="Этаж"
                  type="number"
                  value={form.floor}
                  onChange={(value) => updateForm({ floor: Number(value) || 0 })}
                />
                <Input
                  label="Этажность дома"
                  type="number"
                  value={form.floors_total}
                  onChange={(value) => updateForm({ floors_total: Number(value) || 0 })}
                />
                <Input
                  label="Оценка ремонта (0-10)"
                  type="number"
                  value={form.renovation_score}
                  onChange={(value) => updateForm({ renovation_score: Number(value) || 0 })}
                />
                <Input
                  label="Возраст дома (лет)"
                  type="number"
                  value={form.building_age_years}
                  onChange={(value) => updateForm({ building_age_years: Number(value) || 0 })}
                />
                <Input
                  label="Доступно с"
                  type="date"
                  value={form.available_from}
                  onChange={(value) => updateForm({ available_from: value })}
                />
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <Input
                  label="Мин. ночей"
                  type="number"
                  value={form.min_nights}
                  onChange={(value) => updateForm({ min_nights: Math.max(1, Number(value) || 1) })}
                  disabled={noMaxNights}
                />
                <Input
                  label="Макс. ночей"
                  type="number"
                  value={noMaxNights ? 0 : form.max_nights}
                  onChange={(value) => setForm((prev) => ({ ...prev, max_nights: Math.max(prev.min_nights, Number(value) || 0) }))}
                  disabled={noMaxNights}
                  hint="0 = без ограничения"
                />
                <label className="flex items-center gap-2 text-sm text-dusty-mauve-700">
                  <input type="checkbox" checked={noMaxNights} onChange={(e) => setNoMaxNights(e.target.checked)} />
                  Без ограничения максимума ночей
                </label>
                <p className="text-xs text-dry-sage-500">{nightRangeLabel}</p>
              </div>
            </Section>

            <Section title="Описание и удобства">
              <Textarea label="Описание" value={form.description} onChange={(value) => updateForm({ description: value })} rows={4} />
              <Textarea
                label="Удобства (по одному на строку)"
                value={form.amenities.join('\n')}
                onChange={(value) => updateForm({ amenities: splitLines(value) })}
                rows={3}
              />
              <Textarea
                label="Правила (по одному на строку)"
                value={form.house_rules.join('\n')}
                onChange={(value) => updateForm({ house_rules: splitLines(value) })}
                rows={3}
              />
              <Textarea
                label="Теги (по одному на строку)"
                value={form.tags.join('\n')}
                onChange={(value) => updateForm({ tags: splitLines(value) })}
                rows={3}
              />
              <Textarea
                label="Хайлайты (по одному на строку)"
                value={form.highlights.join('\n')}
                onChange={(value) => updateForm({ highlights: splitLines(value) })}
                rows={3}
              />
            </Section>

            <Section title="Фото">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={!listingId || photoUploading}
                  className="rounded-full bg-dusty-mauve-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-dusty-mauve-800 disabled:opacity-60"
                >
                  {photoUploading ? 'Загружаем...' : 'Загрузить с компьютера'}
                </button>
                {!listingId && <p className="text-sm text-dry-sage-600">Сохраните черновик, чтобы загрузить фото.</p>}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null
                    void handlePhotoUpload(file)
                    event.target.value = ''
                  }}
                />
              </div>
              {photoUploadError && <p className="text-sm text-red-600">{photoUploadError}</p>}
              <PhotoList
                photos={form.photos}
                thumbnailUrl={form.thumbnail_url}
                onChange={(photos) => updateForm({ photos })}
                onSelectCover={(url) => updateForm({ thumbnail_url: url })}
              />
            </Section>
          </div>

          <div className="space-y-6">
            <Section title="Ценообразование">
              <Input
                label={form.rental_term === 'long_term' ? 'Цена за месяц (руб.)' : 'Цена за ночь (руб.)'}
                type="number"
                value={Math.round(form.rate_rub)}
                onChange={(value) => updateForm({ rate_rub: Math.round(Number(value)) || 0 })}
              />
              <div className="rounded-2xl border border-dusty-mauve-200 bg-white/70 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-dusty-mauve-900">Рекомендация цены (ML)</p>
                  <button
                    type="button"
                    disabled={!listingId || priceSuggestionLoading}
                    onClick={() => fetchPriceSuggestion()}
                    className="rounded-full border border-dry-sage-400 px-3 py-1 text-xs font-semibold text-dry-sage-700 disabled:opacity-60"
                  >
                    {priceSuggestionLoading ? 'Считаем...' : 'Обновить'}
                  </button>
                </div>
                {priceSuggestionError && <p className="mt-2 text-sm text-red-600">{priceSuggestionError}</p>}
                {priceSuggestionData && (
                  <div className="mt-2 space-y-1 text-sm text-dusty-mauve-800">
                    <p>
                      Рекомендованная: <strong>{formatMoney(priceSuggestionData.recommended_price_rub)}</strong>
                    </p>
                    <p>Текущая: {formatMoney(priceSuggestionData.current_price_rub)}</p>
                    <p className="text-xs text-dry-sage-600">{priceSuggestionData.message}</p>
                  </div>
                )}
                {!priceSuggestionData && !priceSuggestionError && (
                  <p className="mt-2 text-sm text-dry-sage-600">Сохраните и обновите, чтобы получить рекомендацию.</p>
                )}
              </div>
            </Section>
          </div>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-3xl border border-white/60 bg-white/90 p-5 shadow-soft">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-dusty-mauve-900">{title}</h2>
      </div>
      <div className="space-y-3 text-sm text-dusty-mauve-800">{children}</div>
    </div>
  )
}

function Input({
  label,
  value,
  onChange,
  type = 'text',
  disabled,
  hint,
}: {
  label: string
  value: any
  onChange: (value: any) => void
  type?: string
  disabled?: boolean
  hint?: string
}) {
  return (
    <label className="flex flex-col gap-1 text-sm text-dusty-mauve-700">
      <span>{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(type === 'number' ? Number(event.target.value) : event.target.value)}
        disabled={disabled}
        className="rounded-2xl border border-white/60 bg-white/80 px-4 py-2 text-sm text-dusty-mauve-900"
      />
      {hint && <span className="text-xs text-dry-sage-500">{hint}</span>}
    </label>
  )
}

function Select({
  label,
  value,
  options,
  onChange,
  disabled,
  optionLabels,
}: {
  label: string
  value: string
  options: string[]
  onChange: (value: string) => void
  disabled?: boolean
  optionLabels?: Record<string, string>
}) {
  return (
    <label className="flex flex-col gap-1 text-sm text-dusty-mauve-700">
      <span>{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className="rounded-2xl border border-white/60 bg-white/80 px-4 py-2 text-sm text-dusty-mauve-900"
      >
        {options.map((option) => (
          <option key={option || 'empty'} value={option}>
            {optionLabels?.[option] || option || '—'}
          </option>
        ))}
      </select>
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
    <label className="flex flex-col gap-1 text-sm text-dusty-mauve-700">
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
  thumbnailUrl?: string
  onChange: (photos: string[]) => void
  onSelectCover?: (url: string) => void
}

function PhotoList({ photos, thumbnailUrl, onChange, onSelectCover }: PhotoListProps) {
  const [manualUrl, setManualUrl] = useState('')

  const removePhoto = (index: number) => {
    const copy = [...photos]
    copy.splice(index, 1)
    onChange(copy)
  }

  const addManualPhoto = () => {
    const trimmed = manualUrl.trim()
    if (!trimmed) {
      return
    }
    onChange([...photos, trimmed])
    if (!thumbnailUrl) {
      onSelectCover?.(trimmed)
    }
    setManualUrl('')
  }

  return (
    <div className="space-y-3">
      {photos.length === 0 && (
        <p className="text-xs text-dusty-mauve-500">Добавьте хотя бы одно фото, чтобы гости увидели пространство.</p>
      )}
      {photos.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map((photo, index) => (
            <div key={`${photo}-${index}`} className="relative overflow-hidden rounded-2xl border border-white/60 bg-white/80 shadow-sm">
              <img src={photo} alt="Listing photo" className="h-40 w-full object-cover" loading="lazy" />
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/50 px-3 py-2 text-xs text-white">
                {thumbnailUrl === photo ? (
                  <span className="rounded-full bg-green-600/80 px-2 py-0.5 text-[11px]">Обложка</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => onSelectCover?.(photo)}
                    className="rounded-full bg-white/80 px-2 py-0.5 text-[11px] font-semibold text-dusty-mauve-900"
                  >
                    Сделать обложкой
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="rounded-full bg-red-600/80 px-2 py-0.5 text-[11px] font-semibold text-white"
                >
                  Удалить
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="rounded-2xl border border-dusty-mauve-200 bg-white/70 p-3">
        <label className="text-xs font-semibold text-dusty-mauve-800">Добавить фото по ссылке</label>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            value={manualUrl}
            onChange={(event) => setManualUrl(event.target.value)}
            placeholder="https://example.com/photo.jpg"
            className="flex-1 rounded-2xl border border-white/60 bg-white/80 px-4 py-2 text-sm text-dusty-mauve-900"
          />
          <button
            type="button"
            onClick={addManualPhoto}
            className="rounded-2xl border border-dusty-mauve-300 px-4 py-2 text-xs font-semibold text-dusty-mauve-900"
          >
            Добавить
          </button>
        </div>
      </div>
    </div>
  )
}

function splitLines(value: string) {
  return value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean)
}

function normalizeTravelMode(value?: string) {
  const normalized = (value || '').trim().toLowerCase()
  if (normalized === 'public') {
    return 'transit'
  }
  return normalized || 'car'
}

function preparePayload(form: HostListingPayload) {
  const goodPhotos = (form.photos ?? []).filter(Boolean)
  const cover =
    form.thumbnail_url && goodPhotos.includes(form.thumbnail_url)
      ? form.thumbnail_url
      : goodPhotos[0] ?? ''
  return {
    ...form,
    rental_term: form.rental_term || 'long_term',
    travel_mode: normalizeTravelMode(form.travel_mode),
    travel_minutes: Math.max(0, Number(form.travel_minutes) || 0),
    photos: goodPhotos,
    thumbnail_url: cover || undefined,
    available_from: form.available_from ? new Date(form.available_from).toISOString() : undefined,
  }
}

function formatMoney(rub: number) {
  if (!rub) {
    return '-'
  }
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(Math.round(rub))
}
