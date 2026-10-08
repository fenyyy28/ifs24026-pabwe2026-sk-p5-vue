<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import Editor from '@toast-ui/editor'
import '@toast-ui/editor/dist/toastui-editor.css'

const props = defineProps({
  value: { type: String, default: '' },
})

const container = ref(null)
let viewer = null

onMounted(() => {
  viewer = Editor.factory({
    el: container.value,
    viewer: true,
    initialValue: props.value,
    usageStatistics: false,
  })
})

watch(
  () => props.value,
  (value) => {
    viewer.setMarkdown(value)
  },
)

onBeforeUnmount(() => {
  viewer.destroy()
})
</script>

<template>
  <div ref="container" />
</template>