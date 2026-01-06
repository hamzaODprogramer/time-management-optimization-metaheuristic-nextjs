"use client"

interface SuccessMessageProps {
  message: string
  onDismiss?: () => void
}

export function SuccessMessage({ message, onDismiss }: SuccessMessageProps) {
  return (
    <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-between">
      <p className="text-sm text-primary font-medium">{message}</p>
      {onDismiss && (
        <button onClick={onDismiss} className="text-primary hover:opacity-70 transition-opacity" aria-label="Dismiss">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}
