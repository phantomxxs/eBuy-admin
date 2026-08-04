const COOKIE_KEY = "_tlp_sid"

const scramble = (value: string) => btoa(value.split("").reverse().join(""))

const unscramble = (value: string) => {
  try {
    return atob(value).split("").reverse().join("")
  } catch {
    return null
  }
}

export const setAuthCookie = (token: string) => {
  const encoded = scramble(token)
  const maxAge = 60 * 60 * 24 * 7 // 7 days
  document.cookie = `${COOKIE_KEY}=${encoded}; max-age=${maxAge}; path=/; SameSite=Strict; Secure`
}

export const getAuthCookie = (): string | null => {
  const match = document.cookie.split("; ").find((row) => row.startsWith(`${COOKIE_KEY}=`))
  if (!match) return null
  const encoded = match.split("=")[1]
  return unscramble(encoded)
}

export const clearAuthCookie = () => {
  document.cookie = `${COOKIE_KEY}=; max-age=0; path=/; SameSite=Strict; Secure`
}
