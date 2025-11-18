export function supportsViewTransitions(): boolean {
  if (typeof document === 'undefined') {
    return false
  }
  return 'startViewTransition' in document
}

export function withViewTransition(update: () => void): void {
  if (!supportsViewTransitions()) {
    update()
    return
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anyDocument = document as any
    anyDocument.startViewTransition(() => {
      update()
    })
  } catch {
    update()
  }
}
