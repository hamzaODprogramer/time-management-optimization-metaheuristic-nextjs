"use client"

interface ErrorMessageProps {
  message: string
  onDismiss?: () => void
}

export function ErrorMessage({ message, onDismiss }: ErrorMessageProps) {
  return (
    <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center justify-between">
      <p className="text-sm text-destructive">{message}</p>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-destructive hover:opacity-70 transition-opacity"
          aria-label="Dismiss"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}
