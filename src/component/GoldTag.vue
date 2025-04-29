<script setup lang="ts">
defineProps({
  text: String,
})
</script>

<template>
  <div class="tag">
    {{ text }}
  </div>
</template>

<style scoped>
.tag{
  display: flex;
  padding: 0 4px;
  text-align: center;
  justify-content: center;
  border-radius: 4px;
  align-items: center;
  color: #ffc85b;
  font-size: 0.7rem;
  background: rgba(255, 145, 0, 0.29);
}
</style>
