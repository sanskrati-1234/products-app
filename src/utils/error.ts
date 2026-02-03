const DEFAULT_MESSAGE = 'Something went wrong'

export function getErrorMessage(error: unknown, fallback = DEFAULT_MESSAGE): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return fallback
}
