import { describe, it, expect } from 'vitest'
import {
  validateRequired,
  validateEmail,
  validatePassword,
  validateConfirmPassword,
} from './validators'

describe('validateRequired', () => {
  it('menolak nilai kosong atau spasi saja', () => {
    expect(validateRequired('', 'Nama')).toBe('Nama wajib diisi')
    expect(validateRequired('   ', 'Nama')).toBe('Nama wajib diisi')
  })

  it('menerima nilai terisi', () => {
    expect(validateRequired('Feny', 'Nama')).toBe('')
  })
})

describe('validateEmail', () => {
  it('menolak email kosong', () => {
    expect(validateEmail('')).toBe('Email wajib diisi')
  })

  it('menolak format tidak valid', () => {
    expect(validateEmail('abc')).toBe('Format email tidak valid')
  })

  it('menerima email valid (spasi diabaikan)', () => {
    expect(validateEmail(' a@b.co ')).toBe('')
  })
})

describe('validatePassword', () => {
  it('menolak kosong', () => {
    expect(validatePassword('')).toBe('Kata sandi wajib diisi')
  })

  it('menolak yang terlalu pendek', () => {
    expect(validatePassword('123')).toBe('Kata sandi minimal 6 karakter')
  })

  it('menerima yang cukup panjang', () => {
    expect(validatePassword('123456')).toBe('')
  })
})

describe('validateConfirmPassword', () => {
  it('menolak konfirmasi kosong', () => {
    expect(validateConfirmPassword('abcdef', '')).toBe(
      'Konfirmasi kata sandi wajib diisi',
    )
  })

  it('menolak yang tidak sama', () => {
    expect(validateConfirmPassword('abcdef', 'abcdeg')).toBe(
      'Konfirmasi kata sandi tidak sama',
    )
  })

  it('menerima yang sama', () => {
    expect(validateConfirmPassword('abcdef', 'abcdef')).toBe('')
  })
})