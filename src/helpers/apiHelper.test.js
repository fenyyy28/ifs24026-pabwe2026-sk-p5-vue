import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getAccessToken,
  putAccessToken,
  removeAccessToken,
  buildUrl,
  apiRequest,
} from './apiHelper'

const fetchMock = vi.fn()

beforeEach(() => {
  localStorage.clear()
  fetchMock.mockReset()
  vi.stubGlobal('fetch', fetchMock)
})

describe('token', () => {
  it('menyimpan, membaca, dan menghapus token', () => {
    expect(getAccessToken()).toBeNull()
    putAccessToken('abc')
    expect(getAccessToken()).toBe('abc')
    removeAccessToken()
    expect(getAccessToken()).toBeNull()
  })
})

describe('buildUrl', () => {
  it('tanpa params', () => {
    expect(buildUrl('/aucations')).toBe(`${DELCOM_BASEURL}/aucations`)
  })

  it('mengabaikan params kosong dan mempertahankan nilai 0', () => {
    const url = buildUrl('/aucations', {
      is_me: 1,
      is_closed: 0,
      a: undefined,
      b: null,
      c: '',
    })
    expect(url).toBe(`${DELCOM_BASEURL}/aucations?is_me=1&is_closed=0`)
  })
})

describe('apiRequest', () => {
  it('GET tanpa token dan tanpa opsi', async () => {
    const data = { status: 'success' }
    fetchMock.mockResolvedValue({ json: async () => data })

    const result = await apiRequest('/aucations')

    expect(result).toEqual(data)
    const [url, options] = fetchMock.mock.calls[0]
    expect(url).toBe(`${DELCOM_BASEURL}/aucations`)
    expect(options.method).toBe('GET')
    expect(options.headers.Authorization).toBeUndefined()
    expect(options.headers['Content-Type']).toBeUndefined()
    expect(options.body).toBeUndefined()
  })

  it('menyertakan Authorization jika token ada', async () => {
    putAccessToken('token-123')
    fetchMock.mockResolvedValue({ json: async () => ({}) })

    await apiRequest('/aucations')

    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe(
      'Bearer token-123',
    )
  })

  it('tidak menyertakan Authorization jika auth false', async () => {
    putAccessToken('token-123')
    fetchMock.mockResolvedValue({ json: async () => ({}) })

    await apiRequest('/auth/login', { method: 'POST', auth: false })

    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBeUndefined()
  })

  it('mengirim body JSON dengan Content-Type', async () => {
    fetchMock.mockResolvedValue({ json: async () => ({}) })

    await apiRequest('/aucations', { method: 'POST', body: { title: 'A' } })

    const options = fetchMock.mock.calls[0][1]
    expect(options.headers['Content-Type']).toBe('application/json')
    expect(options.body).toBe(JSON.stringify({ title: 'A' }))
  })

  it('mengirim FormData apa adanya tanpa Content-Type', async () => {
    fetchMock.mockResolvedValue({ json: async () => ({}) })
    const form = new FormData()
    form.append('cover', 'x')

    await apiRequest('/aucations/1/cover', { method: 'POST', body: form })

    const options = fetchMock.mock.calls[0][1]
    expect(options.body).toBe(form)
    expect(options.headers['Content-Type']).toBeUndefined()
  })

  it('mengembalikan status fail jika fetch gagal', async () => {
    fetchMock.mockRejectedValue(new Error('network'))

    const result = await apiRequest('/aucations')

    expect(result.status).toBe('fail')
    expect(result.message).toBe('Terjadi kesalahan saat menghubungi server')
  })
})