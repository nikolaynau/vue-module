<script lang="ts" setup>
import { useLoadModules } from '@vuemodule/vue';
import { RouterView } from 'vue-router';

const { isLoading, isReady, error } = useLoadModules({ parallel: true });
</script>

<template>
  <div v-if="isLoading">Loading...</div>
  <div v-if="error">Error: {{ error }}</div>
  <RouterView v-if="isReady" />
</template>
