import { describe, it, expect, vi, beforeEach } from 'vitest'
import Swal from 'sweetalert2'
import {
  showSuccessDialog,
  showErrorDialog,
  showConfirmDialog,
  formatRupiah,
  formatDate,
} from './toolsHelper'

vi.mock('sweetalert2', () => ({ default: { fire: vi.fn() } }))

beforeEach(() => {
  Swal.fire.mockReset()
})

describe('dialog', () => {
  it('showSuccessDialog dengan judul default dan kustom', async () => {
    await showSuccessDialog('Tersimpan')
    expect(Swal.fire.mock.calls[0][0]).toMatchObject({
      icon: 'success',
      title: 'Berhasil',
      text: 'Tersimpan',
    })

    await showSuccessDialog('Tersimpan', 'Sukses')
    expect(Swal.fire.mock.calls[1][0].title).toBe('Sukses')
  })

  it('showSuccessDialog tampil sebagai toast yang menutup otomatis', async () => {
    await showSuccessDialog('Tersimpan')

    expect(Swal.fire.mock.calls[0][0]).toMatchObject({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2500,
    })
  })

  it('showErrorDialog dengan judul default dan kustom', async () => {
    await showErrorDialog('Ada masalah')
    expect(Swal.fire.mock.calls[0][0]).toMatchObject({
      icon: 'error',
      title: 'Gagal',
      text: 'Ada masalah',
    })

    await showErrorDialog('Ada masalah', 'Oops')
    expect(Swal.fire.mock.calls[1][0].title).toBe('Oops')
  })

  it('showConfirmDialog mengembalikan true saat dikonfirmasi', async () => {
    Swal.fire.mockResolvedValue({ isConfirmed: true })

    expect(await showConfirmDialog('Hapus?')).toBe(true)
    expect(Swal.fire.mock.calls[0][0]).toMatchObject({
      title: 'Apakah Anda yakin?',
      confirmButtonText: 'Ya',
      cancelButtonText: 'Batal',
      showCancelButton: true,
    })
  })

  it('showConfirmDialog mengembalikan false dan menerima opsi kustom', async () => {
    Swal.fire.mockResolvedValue({ isConfirmed: false })

    const result = await showConfirmDialog('Hapus?', {
      title: 'Hapus data',
      confirmText: 'Hapus',
      cancelText: 'Tidak',
    })

    expect(result).toBe(false)
    expect(Swal.fire.mock.calls[0][0]).toMatchObject({
      title: 'Hapus data',
      confirmButtonText: 'Hapus',
      cancelButtonText: 'Tidak',
    })
  })
})

describe('formatRupiah', () => {
  const normalize = (text) => text.replace(/\s/g, ' ')

  it('memformat angka dan string angka', () => {
    expect(normalize(formatRupiah(10000))).toBe('Rp 10.000')
    expect(normalize(formatRupiah('5000000'))).toBe('Rp 5.000.000')
  })

  it('menganggap nilai tidak valid sebagai 0', () => {
    expect(normalize(formatRupiah('abc'))).toBe('Rp 0')
    expect(normalize(formatRupiah(undefined))).toBe('Rp 0')
  })
})

describe('formatDate', () => {
  it('mengembalikan "-" untuk nilai kosong atau tidak valid', () => {
    expect(formatDate(undefined)).toBe('-')
    expect(formatDate('')).toBe('-')
    expect(formatDate('bukan tanggal')).toBe('-')
  })

  it('memformat tanggal berformat "YYYY-MM-DD HH:mm:ss"', () => {
    const result = formatDate('2024-10-05 22:00:00')
    expect(result).toContain('Oktober 2024')
    expect(result).toMatch(/22[.:]00/)
  })

  it('memformat tanggal berformat ISO', () => {
    expect(formatDate('2024-10-05T08:34:04.000000Z')).toContain('Oktober 2024')
  })
})