<script setup>
import { reactive, watch, ref } from 'vue'
import { useAucationsStore } from '../states/aucationsStore'
import MarkdownEditor from '../components/MarkdownEditor.vue'
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

const isSubmitting = ref(false)

const form = reactive({
  title: '',
  description: '',
  startBid: '',
  closedAt: '',
})

const errors = reactive({
  title: '',
  description: '',
  startBid: '',
  closedAt: '',
})

function resetErrors() {
  errors.title = ''
  errors.description = ''
  errors.startBid = ''
  errors.closedAt = ''
}

function formatDateTime(value) {
  if (!value) return ''

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  const year = date.getFullYear()
  const month = String(
    date.getMonth() + 1,
  ).padStart(2, '0')
  const day = String(
    date.getDate(),
  ).padStart(2, '0')
  const hour = String(
    date.getHours(),
  ).padStart(2, '0')
  const minute = String(
    date.getMinutes(),
  ).padStart(2, '0')

  return `${year}-${month}-${day}T${hour}:${minute}`
}

function fillForm(aucation) {
  if (!aucation) {
    form.title = ''
    form.description = ''
    form.startBid = ''
    form.closedAt = ''

    return
  }

  form.title = aucation.title || ''
  form.description = aucation.description || ''
  form.startBid =
    aucation.start_bid ??
    aucation.startBid ??
    ''
  form.closedAt = formatDateTime(
    aucation.closed_at ??
      aucation.closedAt,
  )
}

watch(
  () => props.aucation,
  (value) => {
    resetErrors()
    fillForm(value)
  },
  {
    immediate: true,
  },
)

function validate() {
  resetErrors()

  let valid = true

  if (!form.title.trim()) {
    errors.title = 'Judul lelang wajib diisi'
    valid = false
  }

  if (!form.description.trim()) {
    errors.description =
      'Deskripsi lelang wajib diisi'
    valid = false
  }

  if (
    form.startBid === '' ||
    form.startBid === null ||
    form.startBid === undefined
  ) {
    errors.startBid =
      'Harga awal wajib diisi'
    valid = false
  } else if (
    Number.isNaN(Number(form.startBid)) ||
    Number(form.startBid) <= 0
  ) {
    errors.startBid =
      'Harga awal harus lebih besar dari 0'
    valid = false
  }

  if (!form.closedAt) {
    errors.closedAt =
      'Batas waktu penutupan wajib diisi'
    valid = false
  } else {
    const closedDate = new Date(form.closedAt)

    if (Number.isNaN(closedDate.getTime())) {
      errors.closedAt =
        'Format batas waktu tidak valid'
      valid = false
    } else if (
      closedDate.getTime() <= Date.now()
    ) {
      errors.closedAt =
        'Batas waktu harus lebih dari waktu sekarang'
      valid = false
    }
  }

  return valid
}

async function submitForm() {
  if (isSubmitting.value) return

  if (!props.aucation?.id) {
    showErrorDialog(
      'Data lelang tidak ditemukan',
    )

    return
  }

  if (!validate()) return

  isSubmitting.value = true

  try {
    const success =
      await aucationsStore.changeAucation(
        props.aucation.id,
        {
          title: form.title.trim(),
          description:
            form.description.trim(),
          startBid: Number(form.startBid),
          closedAt: form.closedAt,
        },
      )

    if (!success) {
      showErrorDialog(
        aucationsStore.message ||
          'Gagal mengubah lelang',
      )

      return
    }

    showSuccessDialog(
      aucationsStore.message ||
        'Berhasil mengubah lelang',
    )

    emit('changed')
    emit('close')
  } finally {
    isSubmitting.value = false
  }
}

function closeModal() {
  if (isSubmitting.value) return

  emit('close')
}
</script>

<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    role="dialog"
    aria-modal="true"
    aria-labelledby="change-auction-dialog-title"
  >
    <div
      class="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl"
    >
      <div
        class="mb-6 flex items-center justify-between"
      >
        <h2
          id="change-auction-dialog-title"
          class="text-xl font-bold text-gray-900"
        >
          Ubah Lelang
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
            for="change-auction-title"
            class="mb-1 block text-sm font-medium text-gray-700"
          >
            Judul Lelang
          </label>

          <input
            id="change-auction-title"
            v-model="form.title"
            type="text"
            class="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-blue-500"
            :disabled="isSubmitting"
            placeholder="Masukkan judul lelang"
          />

          <p
            v-if="errors.title"
            class="mt-1 text-sm text-red-600"
          >
            {{ errors.title }}
          </p>
        </div>

        <div>
          <label
            class="mb-1 block text-sm font-medium text-gray-700"
          >
            Deskripsi
          </label>

          <MarkdownEditor
            v-model="form.description"
            height="280px"
            placeholder="Tulis deskripsi dengan Markdown..."
          />

          <p
            v-if="errors.description"
            class="mt-1 text-sm text-red-600"
          >
            {{ errors.description }}
          </p>
        </div>

        <div>
          <label
            for="change-auction-start-bid"
            class="mb-1 block text-sm font-medium text-gray-700"
          >
            Harga Awal
          </label>

          <input
            id="change-auction-start-bid"
            v-model="form.startBid"
            type="number"
            min="1"
            class="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-blue-500"
            :disabled="isSubmitting"
            placeholder="Masukkan harga awal"
          />

          <p
            v-if="errors.startBid"
            class="mt-1 text-sm text-red-600"
          >
            {{ errors.startBid }}
          </p>
        </div>

        <div>
          <label
            for="change-auction-closed-at"
            class="mb-1 block text-sm font-medium text-gray-700"
          >
            Batas Waktu Penutupan
          </label>

          <input
            id="change-auction-closed-at"
            v-model="form.closedAt"
            type="datetime-local"
            class="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-blue-500"
            :disabled="isSubmitting"
          />

          <p
            v-if="errors.closedAt"
            class="mt-1 text-sm text-red-600"
          >
            {{ errors.closedAt }}
          </p>
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
            {{
              isSubmitting
                ? 'Menyimpan...'
                : 'Simpan Perubahan'
            }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>