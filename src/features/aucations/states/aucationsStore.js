import { ref } from 'vue'
import { defineStore } from 'pinia'
import { isApiSuccess } from '../../../helpers/apiHelper'
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
} from '../api/aucationApi'

const resolveMessage = (response, fallback) => response.message || fallback

export const useAucationsStore = defineStore('aucations', () => {
  const aucations = ref([])
  const aucation = ref(null)
  const message = ref('')

  const isAucation = ref(false)

  const isAucationAdd = ref(false)
  const isAucationAdded = ref(false)
  const isAucationChange = ref(false)
  const isAucationChanged = ref(false)
  const isAucationChangeCover = ref(false)
  const isAucationChangedCover = ref(false)
  const isAucationDelete = ref(false)
  const isAucationDeleted = ref(false)
  const isBidAdd = ref(false)
  const isBidAdded = ref(false)
  const isBidDelete = ref(false)
  const isBidDeleted = ref(false)
  const isAucationDeleteAll = ref(false)
  const isAucationDeletedAll = ref(false)

  async function fetchAucations(filters = {}) {
    isAucation.value = true
    const response = await getAucations(filters)
    isAucation.value = false

    if (!isApiSuccess(response)) {
      message.value = resolveMessage(response, 'Gagal memuat data lelang')
      return false
    }

    aucations.value = response.data.aucations
    return true
  }

  async function fetchAucation(id) {
    aucation.value = null
    isAucation.value = true
    const response = await getAucation(id)
    isAucation.value = false

    if (!isApiSuccess(response)) {
      message.value = resolveMessage(response, 'Gagal memuat detail lelang')
      return false
    }

    aucation.value = response.data.aucation
    return true
  }

  /**
   * `pending` menandakan proses sedang berjalan, `done` menandakan
   * aksi terakhir berhasil. `done` direset setiap aksi dijalankan ulang.
   */
  async function runAction(request, pending, done, { success, fail }) {
    pending.value = true
    done.value = false
    const response = await request()
    pending.value = false

    done.value = isApiSuccess(response)
    message.value = resolveMessage(response, done.value ? success : fail)
    return done.value
  }

  function addAucation(payload) {
    return runAction(() => postAucation(payload), isAucationAdd, isAucationAdded, {
      success: 'Berhasil menambahkan lelang',
      fail: 'Gagal menambahkan lelang',
    })
  }

  function changeAucation(id, payload) {
    return runAction(() => putAucation(id, payload), isAucationChange, isAucationChanged, {
      success: 'Berhasil mengubah lelang',
      fail: 'Gagal mengubah lelang',
    })
  }

  function changeCover(id, file) {
    return runAction(() => postCover(id, file), isAucationChangeCover, isAucationChangedCover, {
      success: 'Berhasil mengubah cover lelang',
      fail: 'Gagal mengubah cover lelang',
    })
  }

  function removeAucation(id) {
    return runAction(() => deleteAucation(id), isAucationDelete, isAucationDeleted, {
      success: 'Berhasil menghapus lelang',
      fail: 'Gagal menghapus lelang',
    })
  }

  function addBid(id, bid) {
    return runAction(() => postBid(id, bid), isBidAdd, isBidAdded, {
      success: 'Berhasil mengajukan penawaran',
      fail: 'Gagal mengajukan penawaran',
    })
  }

  function removeBid(id) {
    return runAction(() => deleteBid(id), isBidDelete, isBidDeleted, {
      success: 'Berhasil menghapus penawaran',
      fail: 'Gagal menghapus penawaran',
    })
  }

  function removeAllAucations() {
    return runAction(() => deleteAllAucations(), isAucationDeleteAll, isAucationDeletedAll, {
      success: 'Berhasil menghapus semua lelang',
      fail: 'Gagal menghapus semua lelang',
    })
  }

  /** Mereset semua penanda "berhasil" (dipakai halaman setelah menangani hasilnya). */
  function resetStatus() {
    isAucationAdded.value = false
    isAucationChanged.value = false
    isAucationChangedCover.value = false
    isAucationDeleted.value = false
    isBidAdded.value = false
    isBidDeleted.value = false
    isAucationDeletedAll.value = false
  }

  return {
    aucations,
    aucation,
    message,
    isAucation,
    isAucationAdd,
    isAucationAdded,
    isAucationChange,
    isAucationChanged,
    isAucationChangeCover,
    isAucationChangedCover,
    isAucationDelete,
    isAucationDeleted,
    isBidAdd,
    isBidAdded,
    isBidDelete,
    isBidDeleted,
    isAucationDeleteAll,
    isAucationDeletedAll,
    fetchAucations,
    fetchAucation,
    addAucation,
    changeAucation,
    changeCover,
    removeAucation,
    addBid,
    removeBid,
    removeAllAucations,
    resetStatus,
  }
})