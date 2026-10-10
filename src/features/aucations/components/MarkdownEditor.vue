<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import Editor from '@toast-ui/editor'
import '@toast-ui/editor/dist/toastui-editor.css'

const props = defineProps({
  modelValue: { type: String, default: '' },
  height: { type: String, default: '320px' },
  placeholder: { type: String, default: 'Tulis deskripsi dengan Markdown...' },
})

const emit = defineEmits(['update:modelValue'])

const container = ref(null)
let editor = null

onMounted(() => {
  editor = new Editor({
    el: container.value,
    height: props.height,
    initialValue: props.modelValue,
    placeholder: props.placeholder,
    initialEditType: 'markdown',
    previewStyle: 'tab',
    usageStatistics: false,
    events: {
      change: () => emit('update:modelValue', editor.getMarkdown()),
    },
  })
})

// Sinkronkan jika nilai berubah dari luar (misalnya form direset),
// tapi jangan menimpa isi editor yang sama agar kursor tidak lompat.
watch(
  () => props.modelValue,
  (value) => {
    if (value !== editor.getMarkdown()) {
      editor.setMarkdown(value)
    }
  },
)

onBeforeUnmount(() => {
  editor.destroy()
})
</script>

<template>
  <div ref="container" />
</template>