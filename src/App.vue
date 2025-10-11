<script setup lang="ts">
import { i18n } from '@/i18n'
import { useAppLanguage } from '@widget-js/vue3'
import consola from 'consola'
import { RouterView } from 'vue-router'

function updateLang(lang: string) {
  i18n.global.locale = lang
}
useAppLanguage({
  onLoad: (lang) => {
    consola.info(`Language: ${lang}`)
    updateLang(lang)
  },
  onChange: (lang) => {
    updateLang(lang)
    consola.info(`Language changed to: ${lang}`)
  },
})
</script>

<template>
  <RouterView />
</template>

<style scoped></style>
