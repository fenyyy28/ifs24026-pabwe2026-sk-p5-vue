import Swal from 'sweetalert2'

const PRIMARY_COLOR = '#4f46e5'

export function showSuccessDialog(message, title = 'Berhasil') {
  return Swal.fire({
    icon: 'success',
    title,
    text: message,
    confirmButtonColor: PRIMARY_COLOR,
  })
}

export function showErrorDialog(message, title = 'Gagal') {
  return Swal.fire({
    icon: 'error',
    title,
    text: message,
    confirmButtonColor: PRIMARY_COLOR,
  })
}

/** Mengembalikan true jika pengguna menekan tombol konfirmasi. */
export async function showConfirmDialog(
  message,
  { title = 'Apakah Anda yakin?', confirmText = 'Ya', cancelText = 'Batal' } = {},
) {
  const result = await Swal.fire({
    icon: 'question',
    title,
    text: message,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    confirmButtonColor: PRIMARY_COLOR,
  })
  return result.isConfirmed
}

export function formatRupiah(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0)
}

/**
 * Menerima "2024-10-05 22:00:00" (format closed_at) maupun ISO
 * "2024-10-05T08:34:04.000000Z" (format created_at).
 */
export function formatDate(value) {
  if (!value) return '-'

  const date = new Date(String(value).replace(' ', 'T'))
  if (Number.isNaN(date.getTime())) return '-'

  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}