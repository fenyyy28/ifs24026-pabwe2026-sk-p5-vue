<script setup>
import { ref, watch } from 'vue'
import { useAucationsStore } from '../states/aucationsStore'
import {
  showErrorDialog,
  showSuccessDialog,
} from '../../../helpers/toolsHelper'

const props = defineProps({
  aucation: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits([
  'close',
  'changed',
])

const aucationsStore = useAucationsStore()

const file = ref(null)
const previewUrl = ref('')
const isSubmitting = ref(false)
const error = ref('')

function setInitialPreview(aucation) {
  if (!aucation) {
    previewUrl.value = ''
    return
  }

  previewUrl.value =
    aucation.cover_url ||
    aucation.cover ||
    ''
}

watch(
  () => props.aucation,
  (value) => {
    file.value = null
    error.value = ''
    setInitialPreview(value)
  },
  {
    immediate: true,
  },
)

function handleFileChange(event) {
  error.value = ''

  const selectedFile =
    event.target.files?.[0]

  if (!selectedFile) {
    file.value = null
    return
  }

  if (!selectedFile.type.startsWith('image/')) {
    file.value = null
    previewUrl.value = ''
    error.value =
      'File cover harus berupa gambar'
    return
  }

  file.value = selectedFile
  previewUrl.value =
    URL.createObjectURL(selectedFile)
}

async function submitForm() {
  if (isSubmitting.value) {
    return
  }

  if (!props.aucation?.id) {
    showErrorDialog(
      'Data lelang tidak ditemukan',
    )
    return
  }

  if (!file.value) {
    error.value =
      'Silakan pilih gambar cover terlebih dahulu'
    return
  }

  isSubmitting.value = true

  try {
    const success =
      await aucationsStore.changeCover(
        props.aucation.id,
        file.value,
      )

    if (!success) {
      showErrorDialog(
        aucationsStore.message ||
          'Gagal mengubah cover lelang',
      )
      return
    }

    showSuccessDialog(
      aucationsStore.message ||
        'Berhasil mengubah cover lelang',
    )

    emit('changed')
    emit('close')
  } finally {
    isSubmitting.value = false
  }
}

function closeModal() {
  if (isSubmitting.value) {
    return
  }

  emit('close')
}
</script>

<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    role="dialog"
    aria-modal="true"
    aria-labelledby="change-cover-dialog-title"
  >
    <div
      class="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl"
    >
      <div
        class="mb-6 flex items-center justify-between"
      >
        <h2
          id="change-cover-dialog-title"
          class="text-xl font-bold text-gray-900"
        >
          Ubah Cover Lelang
        </h2>

        <button
          type="button"
          class="text-2xl text-gray-500 hover:text-gray-700"
          aria-label="Tutup"
          :disabled="isSubmitting"
          @click="closeModal"
        >
          &times;
        </button>
      </div>

      <form
        class="space-y-5"
        @submit.prevent="submitForm"
      >
        <div>
          <label
            for="change-cover-file"
            class="mb-2 block text-sm font-medium text-gray-700"
          >
            Pilih Cover
          </label>

          <input
            id="change-cover-file"
            type="file"
            accept="image/*"
            class="block w-full rounded-lg border border-gray-300 p-2 text-sm"
            :disabled="isSubmitting"
            @change="handleFileChange"
          />

          <p
            v-if="error"
            class="mt-2 text-sm text-red-600"
          >
            {{ error }}
          </p>
        </div>

        <div
          v-if="previewUrl"
          class="overflow-hidden rounded-xl border border-gray-200"
        >
          <p
            class="border-b bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700"
          >
            Preview Cover
          </p>

          <div
            class="flex justify-center p-4"
          >
            <img
              :src="previewUrl"
              alt="Preview cover lelang"
              class="max-h-64 rounded-lg object-contain"
            />
          </div>
        </div>

        <div
          class="flex justify-end gap-3 border-t pt-5"
        >
          <button
            type="button"
            class="rounded-lg border border-gray-300 px-5 py-2 text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="isSubmitting"
            @click="closeModal"
          >
            Batal
          </button>

          <button
            type="submit"
            class="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="isSubmitting"
          >
            {{ isSubmitting ? 'Menyimpan...' : 'Simpan Cover' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>