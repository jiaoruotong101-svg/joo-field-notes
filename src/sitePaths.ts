/** One source tree serves both an origin root and a GitHub project subdirectory. */
export const siteBase = import.meta.env?.BASE_URL || '/'
const prefix = siteBase.replace(/\/$/, '')

export function sitePath(path: string) {
  if (!path.startsWith('/')) return path
  // Physical directory entries on Pages use their canonical trailing slash.
  const suffix = prefix && /^\/projects\/[\w-]+$/.test(path) ? path + '/' : path
  return prefix + suffix
}
export function appPathname(pathname = location.pathname): string | null {
  if (prefix && pathname !== prefix && !pathname.startsWith(siteBase)) return null
  return pathname.slice(prefix.length).replace(/\/$/, '')
}
export function appHref(href: string | null): string | null {
  if (!href) return null
  const url = new URL(href, location.href)
  const path = appPathname(url.pathname)
  if (url.origin !== location.origin || path === null) return null
  return (path || '/') + url.hash
}
