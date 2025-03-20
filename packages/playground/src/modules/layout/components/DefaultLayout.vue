<script setup lang="ts">
import { ref } from 'vue';
import { RouterView } from 'vue-router';
import { useCounterModule } from '../composables/useCounterModule';

const counterModule = useCounterModule();
const counter = counterModule?.useSharedCounter().counter ?? ref(0);
</script>

<template>
  <div>
    <header>
      Header
      <div v-if="counterModule">({{ counter }})</div>
    </header>
    <main>
      <RouterView />
    </main>
    <footer>Footer</footer>
  </div>
</template>
