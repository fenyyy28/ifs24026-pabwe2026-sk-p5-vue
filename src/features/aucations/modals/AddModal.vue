<script setup>
import { reactive, ref } from 'vue'
import { useAucationsStore } from '../states/aucationsStore'
import MarkdownEditor from '../components/MarkdownEditor.vue'
import { showErrorDialog, showSuccessDialog } from '../../../helpers/toolsHelper'

const emit = defineEmits(['close', 'added'])

const aucationsStore = useAucationsStore()

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

const isSubmitting = ref(false)

function resetErrors() {
  errors.title = ''
  errors.description = ''
  errors.startBid = ''
  errors.closedAt = ''
}

function validate() {
  resetErrors()

  let valid = true

  if (!form.title.trim()) {
    errors.title = 'Judul lelang wajib diisi'
    valid = false
  }

  if (!form.description.trim()) {
    errors.description = 'Deskripsi lelang wajib diisi'
    valid = false
  }

  const startBid = Number(form.startBid)

  if (!form.startBid && form.startBid !== 0) {
    errors.startBid = 'Harga awal wajib diisi'
    valid = false
  } else if (!Number.isFinite(startBid) || startBid <= 0) {
    errors.startBid = 'Harga awal harus lebih besar dari 0'
    valid = false
  }

  if (!form.closedAt) {
    errors.closedAt = 'Batas waktu penutupan wajib diisi'
    valid = false
  } else {
    const closedDate = new Date(form.closedAt)

    if (Number.isNaN(closedDate.getTime())) {
      errors.closedAt = 'Format batas waktu tidak valid'
      valid = false
    } else if (closedDate <= new Date()) {
      errors.closedAt = 'Batas waktu harus lebih dari waktu sekarang'
      valid = false
    }
  }

  return valid
}

function closeModal() {
  if (isSubmitting.value) return

  emit('close')
}

async function submitForm() {
  if (isSubmitting.value) return

  if (!validate()) return

  isSubmitting.value = true

  const success = await aucationsStore.addAucation({
    title: form.title.trim(),
    description: form.description.trim(),
    startBid: Number(form.startBid),
    closedAt: form.closedAt,
  })

  isSubmitting.value = false

  if (!success) {
    await showErrorDialog(
      aucationsStore.message || 'Gagal menambahkan lelang',
    )
    return
  }

  await showSuccessDialog(
    aucationsStore.message || 'Berhasil menambahkan lelang',
  )

  emit('added')
  emit('close')
}
</script>

<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    role="dialog"
    aria-modal="true"
    aria-labelledby="add-auction-dialog-title"
  >
    <div
      class="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-xl"
    >
      <div
        class="flex items-center justify-between border-b border-gray-200 px-6 py-4"
      >
        <div>
          <h2
  id="add-auction-dialog-title"
  class="text-xl font-semibold text-gray-900"
>
  Tambah Lelang
</h2>

          <p class="mt-1 text-sm text-gray-500">
            Buat item lelang baru untuk ditawarkan.
          </p>
        </div>

        <button
          type="button"
          class="rounded-lg px-3 py-2 text-xl text-gray-500 hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Tutup modal"
          :disabled="isSubmitting"
          @click="closeModal"
        >
          ×
        </button>
      </div>

      <form class="space-y-5 p-6" @submit.prevent="submitForm">
        <!-- Judul -->
        <div>
          <label
            for="add-auction-title"
            class="mb-1 block text-sm font-medium text-gray-700"
          >
            Judul Lelang
          </label>

          <input
            id="add-auction-title"
            v-model="form.title"
            type="text"
            placeholder="Contoh: Laptop ASUS ROG"
            class="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            :class="{ 'border-red-500': errors.title }"
            :disabled="isSubmitting"
          />

          <p v-if="errors.title" class="mt-1 text-sm text-red-600">
            {{ errors.title }}
          </p>
        </div>

        <!-- Deskripsi -->
        <div>
          <label
            class="mb-1 block text-sm font-medium text-gray-700"
          >
            Deskripsi
          </label>

          <MarkdownEditor
            v-model="form.description"
            height="240px"
            placeholder="Tulis deskripsi barang menggunakan Markdown..."
          />

          <p v-if="errors.description" class="mt-1 text-sm text-red-600">
            {{ errors.description }}
          </p>
        </div>

        <!-- Harga awal -->
        <div>
          <label
            for="add-auction-start-bid"
            class="mb-1 block text-sm font-medium text-gray-700"
          >
            Harga Awal
          </label>

          <div class="relative">
            <span
              class="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500"
            >
              Rp
            </span>

            <input
              id="add-auction-start-bid"
              v-model="form.startBid"
              type="number"
              min="1"
              step="1"
              placeholder="100000"
              class="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              :class="{ 'border-red-500': errors.startBid }"
              :disabled="isSubmitting"
            />
          </div>

          <p v-if="errors.startBid" class="mt-1 text-sm text-red-600">
            {{ errors.startBid }}
          </p>
        </div>

        <!-- Batas waktu -->
        <div>
          <label
            for="add-auction-closed-at"
            class="mb-1 block text-sm font-medium text-gray-700"
          >
            Batas Waktu Penutupan
          </label>

          <input
            id="add-auction-closed-at"
            v-model="form.closedAt"
            type="datetime-local"
            class="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            :class="{ 'border-red-500': errors.closedAt }"
            :disabled="isSubmitting"
          />

          <p v-if="errors.closedAt" class="mt-1 text-sm text-red-600">
            {{ errors.closedAt }}
          </p>
        </div>

        <!-- Tombol -->
        <div
          class="flex justify-end gap-3 border-t border-gray-200 pt-5"
        >
          <button
            type="button"
            class="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="isSubmitting"
            @click="closeModal"
          >
            Batal
          </button>

          <button
            type="submit"
            class="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="isSubmitting"
          >
            {{ isSubmitting ? 'Menyimpan...' : 'Tambah Lelang' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>