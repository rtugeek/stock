<script setup lang="ts">
import { useStorage } from '@vueuse/core'

const stockColor = useStorage('stock_color', 0)
</script>

<template>
  <el-form-item label="涨跌颜色">
    <el-radio-group v-model="stockColor">
      <el-radio :value="0">
        <span class="color-red">红涨</span> <span class="color-green">绿跌</span>
      </el-radio>
      <el-radio :value="1">
        <span class="color-green">红跌</span> <span class="color-red">绿涨</span>
      </el-radio>
    </el-radio-group>
  </el-form-item>
</template>

<style scoped>

</style>
