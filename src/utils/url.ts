export function parseSearchParams<T>(params: URLSearchParams) {
  const result: Record<string, string> = {}
  params.forEach((value, key) => {
    result[key] = value
  })
  return result as T
}
