const PRIMARY_COLOR = '#4f46e5'

// SweetAlert2 dimuat saat pertama dipakai agar tidak membebani muatan awal halaman.
const loadSwal = () => import('sweetalert2').then((module) => module.default)

export async function showSuccessDialog(message, title = 'Berhasil') {
  const Swal = await loadSwal()
  return Swal.fire({
    icon: 'success',
    title,
    text: message,
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 2500,
    timerProgressBar: true,
  })
}

export async function showErrorDialog(message, title = 'Gagal') {
  const Swal = await loadSwal()
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
  const Swal = await loadSwal()
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