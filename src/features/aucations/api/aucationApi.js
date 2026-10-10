import { apiRequest } from '../../../helpers/apiHelper'

function toBody({ title, description, startBid, closedAt }) {
  return {
    title,
    description,
    start_bid: startBid,
    closed_at: closedAt,
  }
}

export function getAucations({ isMe = false, isClosed } = {}) {
  return apiRequest('/aucations', {
    params: { is_me: isMe ? 1 : undefined, is_closed: isClosed },
  })
}

export function getAucation(id) {
  return apiRequest(`/aucations/${id}`)
}

export function postAucation(payload) {
  return apiRequest('/aucations', { method: 'POST', body: toBody(payload) })
}

export function putAucation(id, payload) {
  return apiRequest(`/aucations/${id}`, { method: 'PUT', body: toBody(payload) })
}

export function postCover(id, file) {
  const form = new FormData()
  form.append('cover', file)

  return apiRequest(`/aucations/${id}/cover`, { method: 'POST', body: form })
}

export function deleteAucation(id) {
  return apiRequest(`/aucations/${id}`, { method: 'DELETE' })
}

export function postBid(id, bid) {
  return apiRequest(`/aucations/${id}/bids`, { method: 'POST', body: { bid } })
}

export function deleteBid(id) {
  return apiRequest(`/aucations/${id}/bids`, { method: 'DELETE' })
}

export function deleteAllAucations() {
  return apiRequest('/aucations', { method: 'DELETE' })
}