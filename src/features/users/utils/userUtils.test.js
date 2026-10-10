import { describe, it, expect } from 'vitest'
import { getInitials, resolvePhotoUrl } from './userUtils'

describe('getInitials', () => {
  it('mengambil huruf awal maksimal dua kata', () => {
    expect(getInitials('Delcom Testing')).toBe('DT')
    expect(getInitials('feny')).toBe('F')
    expect(getInitials('a b c')).toBe('AB')
  })

  it('mengembalikan "?" jika nama kosong', () => {
    expect(getInitials()).toBe('?')
    expect(getInitials('')).toBe('?')
    expect(getInitials('   ')).toBe('?')
  })
})

describe('resolvePhotoUrl', () => {
  const origin = new URL(DELCOM_BASEURL).origin

  it('mengembalikan string kosong jika foto kosong', () => {
    expect(resolvePhotoUrl('')).toBe('')
    expect(resolvePhotoUrl(null)).toBe('')
  })

  it('mempertahankan URL penuh', () => {
    expect(resolvePhotoUrl('https://x.test/a.png')).toBe('https://x.test/a.png')
    expect(resolvePhotoUrl('http://x.test/a.png')).toBe('http://x.test/a.png')
  })

  it('menggabungkan path relatif dengan origin API', () => {
    expect(resolvePhotoUrl('img/profile/1.png')).toBe(`${origin}/img/profile/1.png`)
    expect(resolvePhotoUrl('/img/profile/1.png')).toBe(`${origin}/img/profile/1.png`)
  })
})