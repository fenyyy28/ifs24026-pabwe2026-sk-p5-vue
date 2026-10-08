const ACCESS_TOKEN_KEY = 'accessToken'

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function putAccessToken(token) {
  localStorage.setItem(ACCESS_TOKEN_KEY, token)
}

export function removeAccessToken() {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
}

/**
 * Menyusun URL lengkap beserta query parameters.
 * Parameter bernilai undefined, null, atau string kosong diabaikan.
 */
export function buildUrl(path, params = {}) {
  const url = new URL(`${DELCOM_BASEURL}${path}`)

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    url.searchParams.append(key, value)
  })

  return url.toString()
}

/**
 * Wrapper fetch untuk REST API Delcom.
 * Selalu mengembalikan objek JSON { status, message, data }.
 * Jika jaringan bermasalah atau respons bukan JSON, dikembalikan
 * objek { status: 'fail', message } agar pemanggil cukup mengecek `status`.
 */
export async function apiRequest(
  path,
  { method = 'GET', params, body, auth = true } = {},
) {
  const headers = { Accept: 'application/json' }
  const token = getAccessToken()

  if (auth && token) {
    headers.Authorization = `Bearer ${token}`
  }

  let payload
  if (body instanceof FormData) {
    // Content-Type diatur otomatis oleh browser (beserta boundary)
    payload = body
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
    payload = JSON.stringify(body)
  }

  try {
    const response = await fetch(buildUrl(path, params), {
      method,
      headers,
      body: payload,
    })
    return await response.json()
  } catch {
    return {
      status: 'fail',
      message: 'Terjadi kesalahan saat menghubungi server',
    }
  }
}