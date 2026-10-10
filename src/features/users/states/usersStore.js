import { ref } from 'vue'
import { defineStore } from 'pinia'
import { isApiSuccess } from '../../../helpers/apiHelper'
import {
  getUsers,
  getProfile,
  putProfile,
  postPhoto,
  putPassword,
} from '../api/userApi'

const resolveMessage = (response, fallback) => response.message || fallback

export const useUsersStore = defineStore('users', () => {
  const users = ref([])
  const user = ref(null)
  const profile = ref(null)
  const isLoading = ref(false)
  const isMutating = ref(false)
  const message = ref('')

  async function fetchUsers() {
    isLoading.value = true
    const response = await getUsers()
    isLoading.value = false

    if (!isApiSuccess(response)) {
      message.value = resolveMessage(response, 'Gagal memuat data pengguna')
      return false
    }

    users.value = response.data.users
    return true
  }

  function selectUser(id) {
    user.value = users.value.find((item) => item.id === id) ?? null
  }

  function clearUser() {
    user.value = null
  }

  function clearState() {
    users.value = []
    user.value = null
    profile.value = null
    message.value = ''
  }

  async function requestProfile() {
    const response = await getProfile()
    if (isApiSuccess(response)) {
      profile.value = response.data.user
    }
    return response
  }

  async function fetchProfile() {
    isLoading.value = true
    const response = await requestProfile()
    isLoading.value = false

    if (!isApiSuccess(response)) {
      message.value = resolveMessage(response, 'Gagal memuat profil')
      return false
    }
    return true
  }

  async function runMutation(request, { success, fail, refresh }) {
    isMutating.value = true
    const response = await request()
    isMutating.value = false

    const isSuccess = isApiSuccess(response)
    message.value = resolveMessage(response, isSuccess ? success : fail)

    if (isSuccess && refresh) {
      await requestProfile()
    }
    return isSuccess
  }

  function updateProfile(payload) {
    return runMutation(() => putProfile(payload), {
      success: 'Berhasil mengubah profil',
      fail: 'Gagal mengubah profil',
      refresh: true,
    })
  }

  function changePhoto(file) {
    return runMutation(() => postPhoto(file), {
      success: 'Berhasil mengubah foto profil',
      fail: 'Gagal mengubah foto profil',
      refresh: true,
    })
  }

  function changePassword(payload) {
    return runMutation(() => putPassword(payload), {
      success: 'Berhasil mengubah kata sandi',
      fail: 'Gagal mengubah kata sandi',
      refresh: false,
    })
  }

  return {
    users,
    user,
    profile,
    isLoading,
    isMutating,
    message,
    fetchUsers,
    selectUser,
    clearUser,
    clearState,
    fetchProfile,
    updateProfile,
    changePhoto,
    changePassword,
  }
})