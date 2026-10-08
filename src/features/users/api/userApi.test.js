import { describe, it, expect, vi, beforeEach } from 'vitest'
import { apiRequest } from '../../../helpers/apiHelper'
import { getUsers, getProfile, putProfile, postPhoto, putPassword } from './userApi'

vi.mock('../../../helpers/apiHelper', () => ({ apiRequest: vi.fn() }))

beforeEach(() => {
  vi.resetAllMocks()
  apiRequest.mockResolvedValue({ status: 'success' })
})

describe('userApi', () => {
  it('getUsers memanggil GET /users', async () => {
    const result = await getUsers()

    expect(result).toEqual({ status: 'success' })
    expect(apiRequest).toHaveBeenCalledWith('/users')
  })

  it('getProfile memanggil GET /users/me', async () => {
    await getProfile()

    expect(apiRequest).toHaveBeenCalledWith('/users/me')
  })

  it('putProfile hanya mengirim name dan email', async () => {
    await putProfile({ name: 'Feny', email: 'a@b.co', ekstra: 'diabaikan' })

    expect(apiRequest).toHaveBeenCalledWith('/users/me', {
      method: 'PUT',
      body: { name: 'Feny', email: 'a@b.co' },
    })
  })

  it('postPhoto mengirim FormData berisi field photo', async () => {
    const file = new File(['x'], 'a.png', { type: 'image/png' })

    await postPhoto(file)

    const [path, options] = apiRequest.mock.calls[0]
    expect(path).toBe('/users/me/photo')
    expect(options.method).toBe('POST')
    expect(options.body).toBeInstanceOf(FormData)
    expect(options.body.get('photo').name).toBe('a.png')
  })

    it('putPassword mengirim kata sandi lama, baru, dan konfirmasi', async () => {
    await putPassword({
      password: 'lama123',
      newPassword: 'rahasia1',
      newPasswordConfirmation: 'rahasia1',
      ekstra: 'diabaikan',
    })

    expect(apiRequest).toHaveBeenCalledWith('/users/password', {
      method: 'PUT',
      body: {
        password: 'lama123',
        new_password: 'rahasia1',
        new_password_confirmation: 'rahasia1',
      },
    })
  })
})