<script setup>
import {
  computed,
  onMounted,
  ref,
} from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useAucationsStore } from '../states/aucationsStore'
import BidModal from '../modals/BidModal.vue'
import ChangeModal from '../modals/ChangeModal.vue'
import ChangeCoverModal from '../modals/ChangeCoverModal.vue'

import {
  showErrorDialog,
  showSuccessDialog,
} from '../../../helpers/toolsHelper'

const route = useRoute()
const router = useRouter()
const aucationsStore = useAucationsStore()

const showBidModal = ref(false)
const showChangeModal = ref(false)
const showChangeCoverModal = ref(false)
const isDeleting = ref(false)

const aucation = computed(
  () => aucationsStore.aucation,
)

const isLoading = computed(
  () => aucationsStore.isAucation,
)

const message = computed(
  () => aucationsStore.message || '',
)

const bids = computed(
  () => aucation.value?.bids || [],
)

const isOwner = computed(() => {
  const value = aucation.value

  return (
    value?.is_me === true ||
    value?.is_me === 1 ||
    value?.is_me === '1'
  )
})

const isClosed = computed(() => {
  const value = aucation.value

  return (
    value?.is_closed === true ||
    value?.is_closed === 1 ||
    value?.is_closed === '1'
  )
})

function getTitle() {
  return (
    aucation.value?.title ||
    'Tanpa Judul'
  )
}

function getDescription() {
  return (
    aucation.value?.description ||
    'Tidak ada deskripsi.'
  )
}

function getCover() {
  return (
    aucation.value?.cover_url ||
    aucation.value?.cover ||
    ''
  )
}

function getStartBid() {
  return Number(
    aucation.value?.start_bid ??
      aucation.value?.startBid ??
      0,
  )
}

function getBidValue(bid) {
  return Number(
    bid?.bid ??
      bid?.amount ??
      bid?.price ??
      0,
  )
}

const highestBid = computed(() => {
  if (!bids.value.length) {
    return getStartBid()
  }

  return Math.max(
    ...bids.value.map(
      (bid) => getBidValue(bid),
    ),
  )
})

function formatCurrency(value) {
  return new Intl.NumberFormat(
    'id-ID',
  ).format(Number(value) || 0)
}

function getBidderName(bid) {
  return (
    bid?.user?.name ||
    bid?.user?.username ||
    bid?.username ||
    bid?.name ||
    'Pengguna'
  )
}

function getBidDate(bid) {
  return (
    bid?.created_at ||
    bid?.createdAt ||
    ''
  )
}

function formatDate(value) {
  if (!value) {
    return '-'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat(
    'id-ID',
    {
      dateStyle: 'medium',
      timeStyle: 'short',
    },
  ).format(date)
}

async function loadDetail() {
  const id = route.params.id

  if (!id) {
    showErrorDialog(
      'ID lelang tidak ditemukan',
    )
    return
  }

  await aucationsStore.fetchAucation(
    id,
  )
}

function goBack() {
  router.push('/aucations')
}

function handleBidChanged() {
  showBidModal.value = false
  loadDetail()
}

function handleChangeChanged() {
  showChangeModal.value = false
  loadDetail()
}

function handleCoverChanged() {
  showChangeCoverModal.value = false
  loadDetail()
}

async function deleteAucation() {
  if (!aucation.value?.id) {
    showErrorDialog(
      'Data lelang tidak ditemukan',
    )
    return
  }

  if (isDeleting.value) {
    return
  }

  isDeleting.value = true

  try {
    const success =
      await aucationsStore.removeAucation(
        aucation.value.id,
      )

    if (!success) {
      showErrorDialog(
        aucationsStore.message ||
          'Gagal menghapus lelang',
      )
      return
    }

    showSuccessDialog(
      aucationsStore.message ||
        'Berhasil menghapus lelang',
    )

    router.push('/aucations')
  } finally {
    isDeleting.value = false
  }
}

onMounted(() => {
  loadDetail()
})
</script>

<template>
  <section
    class="mx-auto w-full max-w-6xl p-4 sm:p-6 lg:p-8"
  >
    <button
      type="button"
      class="mb-6 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
      @click="goBack"
    >
      ← Kembali
    </button>

    <div
      v-if="isLoading"
      class="flex min-h-64 items-center justify-center rounded-xl bg-white p-8 shadow-sm ring-1 ring-slate-200"
    >
      <div class="text-center">
        <div
          class="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"
        ></div>

        <p
          class="text-sm text-slate-600"
        >
          Memuat detail lelang...
        </p>
      </div>
    </div>

    <div
      v-else-if="message && !aucation"
      class="rounded-xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200"
    >
      <p
        class="text-sm text-red-600"
      >
        {{ message }}
      </p>

      <button
        type="button"
        class="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        @click="loadDetail"
      >
        Coba Lagi
      </button>
    </div>

    <div
      v-else-if="!aucation"
      class="rounded-xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-200"
    >
      <h1
        class="text-xl font-bold text-slate-900"
      >
        Data lelang tidak ditemukan
      </h1>

      <p
        class="mt-2 text-sm text-slate-500"
      >
        Lelang yang kamu cari tidak tersedia.
      </p>
    </div>

    <div
      v-else
      class="space-y-6"
    >
      <div
        class="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200"
      >
        <div
          class="relative h-64 bg-slate-100 sm:h-80 lg:h-96"
        >
          <img
            v-if="getCover()"
            :src="getCover()"
            :alt="`Cover ${getTitle()}`"
            class="h-full w-full object-cover"
          />

          <div
            v-else
            class="flex h-full items-center justify-center text-slate-400"
          >
            Tidak ada cover
          </div>

          <span
            class="absolute right-4 top-4 rounded-full px-4 py-2 text-sm font-semibold"
            :class="
              isClosed
                ? 'bg-slate-800 text-white'
                : 'bg-emerald-500 text-white'
            "
          >
            {{
              isClosed
                ? 'Selesai'
                : 'Aktif'
            }}
          </span>
        </div>

        <div
          class="p-5 sm:p-7"
        >
          <div
            class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"
          >
            <div>
              <h1
                class="text-2xl font-bold text-slate-900 sm:text-3xl"
              >
                {{ getTitle() }}
              </h1>

              <p
                class="mt-3 whitespace-pre-line text-sm leading-6 text-slate-600"
              >
                {{ getDescription() }}
              </p>
            </div>

            <span
              v-if="isOwner"
              class="w-fit rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700"
            >
              Lelang Saya
            </span>
          </div>

          <div
            class="mt-6 grid gap-4 sm:grid-cols-2"
          >
            <div
              class="rounded-xl bg-slate-50 p-4"
            >
              <p
                class="text-sm text-slate-500"
              >
                Harga awal
              </p>

              <p
                class="mt-1 text-xl font-bold text-slate-900"
              >
                Rp
                {{ formatCurrency(getStartBid()) }}
              </p>
            </div>

            <div
              class="rounded-xl bg-blue-50 p-4"
            >
              <p
                class="text-sm text-slate-500"
              >
                Bid tertinggi
              </p>

              <p
                class="mt-1 text-xl font-bold text-blue-600"
              >
                Rp
                {{ formatCurrency(highestBid) }}
              </p>
            </div>
          </div>

          <div
            class="mt-6 flex flex-wrap gap-3"
          >
            <button
              v-if="!isOwner && !isClosed"
              type="button"
              class="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700"
              @click="showBidModal = true"
            >
              Ajukan Bid
            </button>

            <template v-if="isOwner">
              <button
                type="button"
                class="rounded-lg border border-blue-300 bg-white px-5 py-2.5 font-medium text-blue-700 hover:bg-blue-50"
                @click="showChangeModal = true"
              >
                Ubah Lelang
              </button>

              <button
                type="button"
                class="rounded-lg border border-slate-300 bg-white px-5 py-2.5 font-medium text-slate-700 hover:bg-slate-50"
                @click="showChangeCoverModal = true"
              >
                Ubah Cover
              </button>

              <button
                type="button"
                class="rounded-lg bg-red-600 px-5 py-2.5 font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                :disabled="isDeleting"
                @click="deleteAucation"
              >
                {{
                  isDeleting
                    ? 'Menghapus...'
                    : 'Hapus Lelang'
                }}
              </button>
            </template>
          </div>
        </div>
      </div>

      <div
        class="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-7"
      >
        <div
          class="mb-5 flex items-center justify-between"
        >
          <div>
            <h2
              class="text-xl font-bold text-slate-900"
            >
              Riwayat Penawaran
            </h2>

            <p
              class="mt-1 text-sm text-slate-500"
            >
              {{ bids.length }} penawaran
            </p>
          </div>
        </div>

        <div
          v-if="!bids.length"
          class="rounded-xl bg-slate-50 p-8 text-center"
        >
          <p
            class="text-sm text-slate-500"
          >
            Belum ada penawaran.
          </p>
        </div>

        <div
          v-else
          class="space-y-3"
        >
          <div
            v-for="(bid, index) in bids"
            :key="bid.id || index"
            class="flex flex-col gap-2 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p
                class="font-medium text-slate-900"
              >
                {{ getBidderName(bid) }}
              </p>

              <p
                class="text-xs text-slate-500"
              >
                {{ formatDate(getBidDate(bid)) }}
              </p>
            </div>

            <p
              class="font-bold text-blue-600"
            >
              Rp
              {{ formatCurrency(getBidValue(bid)) }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <BidModal
      v-if="showBidModal"
      :aucation="aucation"
      @close="showBidModal = false"
      @changed="handleBidChanged"
    />

    <ChangeModal
      v-if="showChangeModal"
      :aucation="aucation"
      @close="showChangeModal = false"
      @changed="handleChangeChanged"
    />

    <ChangeCoverModal
      v-if="showChangeCoverModal"
      :aucation="aucation"
      @close="showChangeCoverModal = false"
      @changed="handleCoverChanged"
    />
  </section>
</template>