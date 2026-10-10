<script setup>
import { ref, computed, watch } from 'vue'
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

const bid = ref('')
const error = ref('')
const isSubmitting = ref(false)

const highestBid = computed(() => {
  const bids = props.aucation?.bids || []

  if (!bids.length) {
    return Number(
      props.aucation?.start_bid ||
        props.aucation?.startBid ||
        0,
    )
  }

  return Math.max(
    ...bids.map((item) =>
      Number(
        item.bid ??
          item.amount ??
          item.price ??
          0,
      ),
    ),
  )
})

const minimumBid = computed(() => {
  return highestBid.value + 1
})

const formattedHighestBid = computed(() => {
  return highestBid.value.toLocaleString(
    'id-ID',
  )
})

watch(
  () => props.aucation,
  () => {
    bid.value = ''
    error.value = ''
  },
  {
    immediate: true,
  },
)

function validateBid() {
  error.value = ''

  if (!props.aucation?.id) {
    error.value =
      'Data lelang tidak ditemukan'
    return false
  }

  if (
    bid.value === '' ||
    bid.value === null ||
    bid.value === undefined
  ) {
    error.value =
      'Nominal penawaran wajib diisi'
    return false
  }

  const bidValue = Number(bid.value)

  if (!Number.isFinite(bidValue)) {
    error.value =
      'Nominal penawaran harus berupa angka'
    return false
  }

  if (bidValue <= highestBid.value) {
    error.value =
      `Penawaran harus lebih tinggi dari Rp ${formattedHighestBid.value}`
    return false
  }

  if (bidValue <= 0) {
    error.value =
      'Nominal penawaran harus lebih dari 0'
    return false
  }

  return true
}

async function submitForm() {
  if (isSubmitting.value) {
    return
  }

  if (!validateBid()) {
    return
  }

  isSubmitting.value = true

  try {
    const success =
      await aucationsStore.addBid(
        props.aucation.id,
        Number(bid.value),
      )

    if (!success) {
      showErrorDialog(
        aucationsStore.message ||
          'Gagal mengajukan penawaran',
      )
      return
    }

    showSuccessDialog(
      aucationsStore.message ||
        'Berhasil mengajukan penawaran',
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
    aria-labelledby="bid-dialog-title"
  >
    <div
      class="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
    >
      <div
        class="mb-6 flex items-center justify-between"
      >
        <h2
          id="bid-dialog-title"
          class="text-xl font-bold text-gray-900"
        >
          Ajukan Penawaran
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

      <div
        class="mb-5 rounded-lg bg-gray-50 p-4"
      >
        <p
          class="text-sm text-gray-600"
        >
          Penawaran tertinggi saat ini
        </p>

        <p
          class="mt-1 text-lg font-bold text-gray-900"
        >
          Rp {{ formattedHighestBid }}
        </p>

        <p
          class="mt-1 text-xs text-gray-500"
        >
          Minimal penawaran:
          Rp {{ minimumBid.toLocaleString('id-ID') }}
        </p>
      </div>

      <form
        class="space-y-5"
        @submit.prevent="submitForm"
      >
        <div>
          <label
            for="bid-amount"
            class="mb-2 block text-sm font-medium text-gray-700"
          >
            Nominal Penawaran
          </label>

          <div class="relative">
            <span
              class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            >
              Rp
            </span>

            <input
              id="bid-amount"
              v-model="bid"
              type="number"
              min="1"
              :disabled="isSubmitting"
              placeholder="Masukkan nominal penawaran"
              class="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100"
            />
          </div>

          <p
            v-if="error"
            class="mt-2 text-sm text-red-600"
          >
            {{ error }}
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
                ? 'Mengajukan...'
                : 'Ajukan Bid'
            }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>