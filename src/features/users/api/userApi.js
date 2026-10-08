import { apiRequest } from '../../../helpers/apiHelper'

export function getUsers() {
  return apiRequest('/users')
}

export function getProfile() {
  return apiRequest('/users/me')
}

export function putProfile({ name, email }) {
  return apiRequest('/users/me', {
    method: 'PUT',
    body: { name, email },
  })
}

export function postPhoto(file) {
  const form = new FormData()
  form.append('photo', file)

  return apiRequest('/users/me/photo', { method: 'POST', body: form })
}

export function putPassword({ password, newPassword, newPasswordConfirmation }) {
  return apiRequest('/users/password', {
    method: 'PUT',
    body: {
      password,
      new_password: newPassword,
      new_password_confirmation: newPasswordConfirmation,
    },
  })
}