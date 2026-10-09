<script setup>
import {
  computed,
  onMounted,
  ref,
} from 'vue'
import { useRouter } from 'vue-router'
import { useAucationsStore } from '../states/aucationsStore'

const router = useRouter()
const aucationsStore = useAucationsStore()

const activeFilter = ref('all')

const aucations = computed(
  () => aucationsStore.aucations || [],
)

const isLoading = computed(
  () => aucationsStore.isAucation,
)

const message = computed(
  () => aucationsStore.message || '',
)

const filteredAucations = computed(() => {
  if (activeFilter.value === 'mine') {
    return aucations.value.filter(
      (item) =>
        item.is_me === true ||
        item.is_me === 1 ||
        item.is_me === '1',
    )
  }

  if (activeFilter.value === 'open') {
    return aucations.value.filter(
      (item) =>
        item.is_closed === false ||
        item.is_closed === 0 ||
        item.is_closed === '0',
    )
  }

  if (activeFilter.value === 'closed') {
    return aucations.value.filter(
      (item) =>
        item.is_closed === true ||
        item.is_closed === 1 ||
        item.is_closed === '1',
    )
  }

  return aucations.value
})

function getTitle(aucation) {
  return (
    aucation?.title ||
    'Tanpa Judul'
  )
}

function getDescription(aucation) {
  return (
    aucation?.description ||
    'Tidak ada deskripsi.'
  )
}

function getStartBid(aucation) {
  return Number(
    aucation?.start_bid ??
      aucation?.startBid ??
      0,
  )
}

function getHighestBid(aucation) {
  const bids = aucation?.bids || []

  if (!bids.length) {
    return getStartBid(aucation)
  }

  return Math.max(
    ...bids.map((bid) =>
      Number(
        bid?.bid ??
          bid?.amount ??
          bid?.price ??
          0,
      ),
    ),
  )
}

function formatCurrency(value) {
  return new Intl.NumberFormat(
    'id-ID',
  ).format(Number(value) || 0)
}

function getCover(aucation) {
  return (
    aucation?.cover_url ||
    aucation?.cover ||
    ''
  )
}

function isClosed(aucation) {
  return (
    aucation?.is_closed === true ||
    aucation?.is_closed === 1 ||
    aucation?.is_closed === '1'
  )
}

function goToDetail(id) {
  if (!id) {
    return
  }

  router.push(
    `/aucations/${id}`,
  )
}

async function loadAucations() {
  await aucationsStore.fetchAucations()
}

async function changeFilter(filter) {
  activeFilter.value = filter

  if (filter === 'mine') {
    await aucationsStore.fetchAucations({
      isMe: true,
    })
    return
  }

  if (filter === 'open') {
    await aucationsStore.fetchAucations({
      isClosed: 0,
    })
    return
  }

  if (filter === 'closed') {
    await aucationsStore.fetchAucations({
      isClosed: 1,
    })
    return
  }

  await aucationsStore.fetchAucations()
}

onMounted(() => {
  loadAucations()
})
</script>

<template>
  <section
    class="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8"
  >
    <div
      class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <h1
          class="text-2xl font-bold text-slate-900 sm:text-3xl"
        >
          Daftar Lelang
        </h1>

        <p
          class="mt-1 text-sm text-slate-600"
        >
          Temukan dan ikuti lelang yang tersedia.
        </p>
      </div>

      <button
        type="button"
        class="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white transition hover:bg-blue-700"
        @click="loadAucations"
      >
        Muat Ulang
      </button>
    </div>

    <div
      class="mb-6 flex flex-wrap gap-2"
    >
      <button
        type="button"
        class="rounded-lg px-4 py-2 text-sm font-medium transition"
        :class="
          activeFilter === 'all'
            ? 'bg-blue-600 text-white'
            : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50'
        "
        @click="changeFilter('all')"
      >
        Semua
      </button>

      <button
        type="button"
        class="rounded-lg px-4 py-2 text-sm font-medium transition"
        :class="
          activeFilter === 'open'
            ? 'bg-blue-600 text-white'
            : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50'
        "
        @click="changeFilter('open')"
      >
        Lelang Aktif
      </button>

      <button
        type="button"
        class="rounded-lg px-4 py-2 text-sm font-medium transition"
        :class="
          activeFilter === 'closed'
            ? 'bg-blue-600 text-white'
            : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50'
        "
        @click="changeFilter('closed')"
      >
        Selesai
      </button>

      <button
        type="button"
        class="rounded-lg px-4 py-2 text-sm font-medium transition"
        :class="
          activeFilter === 'mine'
            ? 'bg-blue-600 text-white'
            : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50'
        "
        @click="changeFilter('mine')"
      >
        Lelang Saya
      </button>
    </div>

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
          Memuat data lelang...
        </p>
      </div>
    </div>

    <div
      v-else-if="message && !aucations.length"
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
        @click="loadAucations"
      >
        Coba Lagi
      </button>
    </div>

    <div
      v-else-if="!filteredAucations.length"
      class="rounded-xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-200"
    >
      <div
        class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-2xl"
      >
        📦
      </div>

      <h2
        class="text-lg font-semibold text-slate-900"
      >
        Belum ada lelang
      </h2>

      <p
        class="mt-1 text-sm text-slate-500"
      >
        Belum ada data lelang untuk ditampilkan.
      </p>
    </div>

    <div
      v-else
      class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
    >
      <article
        v-for="item in filteredAucations"
        :key="item.id"
        class="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-md"
      >
        <div
          class="relative h-48 bg-slate-100"
        >
          <img
            v-if="getCover(item)"
            :src="getCover(item)"
            :alt="`Cover ${getTitle(item)}`"
            class="h-full w-full object-cover"
          />

          <div
            v-else
            class="flex h-full items-center justify-center text-sm text-slate-400"
          >
            Tidak ada cover
          </div>

          <span
            class="absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-semibold"
            :class="
              isClosed(item)
                ? 'bg-slate-800 text-white'
                : 'bg-emerald-500 text-white'
            "
          >
            {{
              isClosed(item)
                ? 'Selesai'
                : 'Aktif'
            }}
          </span>
        </div>

        <div
          class="p-5"
        >
          <h2
            class="line-clamp-1 text-lg font-bold text-slate-900"
          >
            {{ getTitle(item) }}
          </h2>

          <p
            class="mt-2 line-clamp-2 min-h-10 text-sm text-slate-500"
          >
            {{ getDescription(item) }}
          </p>

          <div
            class="mt-4 space-y-2"
          >
            <div
              class="flex items-center justify-between text-sm"
            >
              <span
                class="text-slate-500"
              >
                Harga awal
              </span>

              <span
                class="font-medium text-slate-900"
              >
                Rp
                {{
                  formatCurrency(
                    getStartBid(item),
                  )
                }}
              </span>
            </div>

            <div
              class="flex items-center justify-between text-sm"
            >
              <span
                class="text-slate-500"
              >
                Bid tertinggi
              </span>

              <span
                class="font-semibold text-blue-600"
              >
                Rp
                {{
                  formatCurrency(
                    getHighestBid(item),
                  )
                }}
              </span>
            </div>
          </div>

          <button
            type="button"
            class="mt-5 w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
            @click="goToDetail(item.id)"
          >
            Lihat Detail
          </button>
        </div>
      </article>
    </div>
  </section>
</template>