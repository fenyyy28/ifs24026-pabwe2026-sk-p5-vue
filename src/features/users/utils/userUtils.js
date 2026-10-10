export function getInitials(name = '') {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (!words.length) return '?'

  return words
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('')
}

/**
 * Foto dari API bisa berupa URL penuh atau path relatif ("img/profile/1.png").
 * Path relatif digabung dengan origin dari DELCOM_BASEURL.
 */
export function resolvePhotoUrl(photo) {
  if (!photo) return ''
  if (/^https?:\/\//i.test(photo)) return photo

  return `${new URL(DELCOM_BASEURL).origin}/${photo.replace(/^\//, '')}`
}