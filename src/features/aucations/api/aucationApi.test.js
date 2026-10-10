import { describe, it, expect, vi, beforeEach } from 'vitest'
import { apiRequest } from '../../../helpers/apiHelper'
import {
  getAucations,
  getAucation,
  postAucation,
  putAucation,
  postCover,
  deleteAucation,
  postBid,
  deleteBid,
  deleteAllAucations,
} from './aucationApi'

vi.mock('../../../helpers/apiHelper', () => ({ apiRequest: vi.fn() }))

const payload = {
  title: 'Oculus Quest 2',
  description: 'Second mulus',
  startBid: 5000000,
  closedAt: '2026-12-31 23:59:59',
  ekstra: 'diabaikan',
}
const body = {
  title: 'Oculus Quest 2',
  description: 'Second mulus',
  start_bid: 5000000,
  closed_at: '2026-12-31 23:59:59',
}

beforeEach(() => {
  vi.resetAllMocks()
  apiRequest.mockResolvedValue({ status: 'success' })
})

describe('getAucations', () => {
  it('tanpa filter', async () => {
    const result = await getAucations()

    expect(result).toEqual({ status: 'success' })
    expect(apiRequest).toHaveBeenCalledWith('/aucations', {
      params: { is_me: undefined, is_closed: undefined },
    })
  })

  it('dengan filter is_me dan is_closed', async () => {
    await getAucations({ isMe: true, isClosed: 0 })

    expect(apiRequest).toHaveBeenCalledWith('/aucations', {
      params: { is_me: 1, is_closed: 0 },
    })
  })

  it('tidak mengirim is_me jika false', async () => {
    await getAucations({ isMe: false, isClosed: 1 })

    expect(apiRequest).toHaveBeenCalledWith('/aucations', {
      params: { is_me: undefined, is_closed: 1 },
    })
  })
})

describe('aucationApi', () => {
  it('getAucation memanggil GET /aucations/:id', async () => {
    await getAucation(7)

    expect(apiRequest).toHaveBeenCalledWith('/aucations/7')
  })

  it('postAucation memetakan payload ke snake_case', async () => {
    await postAucation(payload)

    expect(apiRequest).toHaveBeenCalledWith('/aucations', { method: 'POST', body })
  })

  it('putAucation memetakan payload ke snake_case', async () => {
    await putAucation(7, payload)

    expect(apiRequest).toHaveBeenCalledWith('/aucations/7', { method: 'PUT', body })
  })

  it('postCover mengirim FormData berisi field cover', async () => {
    const file = new File(['x'], 'cover.jpg', { type: 'image/jpeg' })

    await postCover(7, file)

    const [path, options] = apiRequest.mock.calls[0]
    expect(path).toBe('/aucations/7/cover')
    expect(options.method).toBe('POST')
    expect(options.body).toBeInstanceOf(FormData)
    expect(options.body.get('cover').name).toBe('cover.jpg')
  })

  it('deleteAucation memanggil DELETE /aucations/:id', async () => {
    await deleteAucation(7)

    expect(apiRequest).toHaveBeenCalledWith('/aucations/7', { method: 'DELETE' })
  })

  it('postBid mengirim nominal bid', async () => {
    await postBid(7, 6000000)

    expect(apiRequest).toHaveBeenCalledWith('/aucations/7/bids', {
      method: 'POST',
      body: { bid: 6000000 },
    })
  })

  it('deleteBid memanggil DELETE /aucations/:id/bids', async () => {
    await deleteBid(7)

    expect(apiRequest).toHaveBeenCalledWith('/aucations/7/bids', { method: 'DELETE' })
  })

  it('deleteAllAucations memanggil DELETE /aucations', async () => {
    await deleteAllAucations()

    expect(apiRequest).toHaveBeenCalledWith('/aucations', { method: 'DELETE' })
  })
})