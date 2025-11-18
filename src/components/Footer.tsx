export function Footer() {
  return (
    <footer className="border-t border-dusty-mauve-100 bg-dusty-mauve-50 py-8">
      <div className="container flex flex-col gap-4 text-sm text-dusty-mauve-500 md:flex-row md:items-center md:justify-between">
        <p>© {new Date().getFullYear()} Rentme · curated rentals & city guides</p>
        <div className="flex flex-wrap gap-4">
          <a href="mailto:care@rentme.app" className="hover:text-dusty-mauve-900">
            care@rentme.app
          </a>
          <a href="https://t.me/rentme" target="_blank" rel="noreferrer" className="hover:text-dusty-mauve-900">
            Telegram
          </a>
          <a href="https://rentme.app/privacy" target="_blank" rel="noreferrer" className="hover:text-dusty-mauve-900">
            Политика конфиденциальности
          </a>
        </div>
      </div>
    </footer>
  )
}
