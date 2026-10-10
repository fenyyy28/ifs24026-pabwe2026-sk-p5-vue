const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD_LENGTH = 6

export function validateRequired(value, label) {
  return value.trim() ? '' : `${label} wajib diisi`
}

export function validateEmail(value) {
  const email = value.trim()
  if (!email) return 'Email wajib diisi'
  if (!EMAIL_PATTERN.test(email)) return 'Format email tidak valid'
  return ''
}

export function validatePassword(value) {
  if (!value) return 'Kata sandi wajib diisi'
  if (value.length < MIN_PASSWORD_LENGTH) {
    return `Kata sandi minimal ${MIN_PASSWORD_LENGTH} karakter`
  }
  return ''
}

export function validateConfirmPassword(password, confirmation) {
  if (!confirmation) return 'Konfirmasi kata sandi wajib diisi'
  if (password !== confirmation) return 'Konfirmasi kata sandi tidak sama'
  return ''
}