const assurances = [
  { title: 'Проверка собственника', detail: 'ЕГРН, обременения, история платежей' },
  { title: 'Договор онлайн', detail: 'цифровая подпись и чек-листы приёма' },
  { title: 'Сервисы после въезда', detail: 'клининг, мелкий ремонт, страхование' },
]

export function AssuranceBar() {
  return (
    <section className="container py-6">
      <div className="grid gap-3 rounded-3xl border border-dusty-mauve-100 bg-white/70 p-5 text-sm text-dusty-mauve-600 sm:grid-cols-3">
        {assurances.map((item) => (
          <div key={item.title} className="space-y-1 border-dusty-mauve-100 sm:border-l sm:pl-4 first:pl-0 sm:first:border-l-0">
            <p className="text-xs uppercase text-dry-sage-600">{item.title}</p>
            <p className="text-base font-semibold text-dusty-mauve-900">{item.detail}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
