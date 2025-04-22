<script setup lang="ts">
import { useStorage } from '@vueuse/core'

const refreshInterval = useStorage('refresh_interval', 60000)
</script>

<template>
  <el-form-item label="刷新间隔">
    <el-select v-model="refreshInterval">
      <!--      <el-option label="1秒" :value="1000" /> -->
      <el-option label="5秒" :value="5000" />
      <el-option label="10秒" :value="10000" />
      <el-option label="30秒" :value="30000" />
      <el-option label="1分钟" :value="60000" />
    </el-select>
  </el-form-item>
</template>

<style scoped>

</style>
