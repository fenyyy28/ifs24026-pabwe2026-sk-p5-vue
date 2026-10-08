import { describe, it, expect, vi, beforeEach } from 'vitest'
import { apiRequest } from '../../../helpers/apiHelper'
import { postLogin, postRegister } from './authApi'

vi.mock('../../../helpers/apiHelper', () => ({ apiRequest: vi.fn() }))

beforeEach(() => {
  vi.resetAllMocks()
})

describe('authApi', () => {
  it('postLogin mengirim email dan password tanpa token', async () => {
    apiRequest.mockResolvedValue({ status: 'success' })

    const result = await postLogin({
      email: 'a@b.co',
      password: 'rahasia',
      ekstra: 'diabaikan',
    })

    expect(result).toEqual({ status: 'success' })
    expect(apiRequest).toHaveBeenCalledWith('/auth/login', {
      method: 'POST',
      body: { email: 'a@b.co', password: 'rahasia' },
      auth: false,
    })
  })

  it('postRegister mengirim name, email, dan password tanpa token', async () => {
    apiRequest.mockResolvedValue({ status: 'success' })

    await postRegister({
      name: 'Feny',
      email: 'a@b.co',
      password: 'rahasia',
      confirmPassword: 'diabaikan',
    })

    expect(apiRequest).toHaveBeenCalledWith('/auth/register', {
      method: 'POST',
      body: { name: 'Feny', email: 'a@b.co', password: 'rahasia' },
      auth: false,
    })
  })
})