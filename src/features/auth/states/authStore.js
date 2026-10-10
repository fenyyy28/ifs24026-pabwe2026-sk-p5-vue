import { ref } from 'vue'
import { defineStore } from 'pinia'
import {
  getAccessToken,
  putAccessToken,
  removeAccessToken,
  isApiSuccess,
} from '../../../helpers/apiHelper'
import { postLogin, postRegister } from '../api/authApi'

const resolveMessage = (response, fallback) => response.message || fallback

export const useAuthStore = defineStore('auth', () => {
  const token = ref(getAccessToken())
  const user = ref(null)
  const isLoading = ref(false)
  const message = ref('')
  const isAuthLogin = ref(Boolean(token.value))
  const isAuthRegister = ref(false)
  const isAuthLogout = ref(false)

  async function login(payload) {
    isLoading.value = true
    const response = await postLogin(payload)
    isLoading.value = false

    if (!isApiSuccess(response)) {
      isAuthLogin.value = false
      message.value = resolveMessage(response, 'Login gagal')
      return false
    }

    const { token: newToken, user: newUser } = response.data
    putAccessToken(newToken)
    token.value = newToken
    user.value = newUser
    isAuthLogin.value = true
    isAuthLogout.value = false
    message.value = resolveMessage(response, 'Berhasil login')
    return true
  }

  async function register(payload) {
    isLoading.value = true
    const response = await postRegister(payload)
    isLoading.value = false

    isAuthRegister.value = isApiSuccess(response)
    message.value = resolveMessage(
      response,
      isAuthRegister.value ? 'Berhasil mendaftar' : 'Pendaftaran gagal',
    )
    return isAuthRegister.value
  }

  async function logout() {
    removeAccessToken()
    token.value = null
    user.value = null
    isAuthLogin.value = false
    isAuthLogout.value = true
    message.value = 'Berhasil logout'
    return true
  }

  return {
    token,
    user,
    isLoading,
    message,
    isAuthLogin,
    isAuthRegister,
    isAuthLogout,
    login,
    register,
    logout,
  }
})