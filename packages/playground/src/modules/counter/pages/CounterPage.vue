<script lang="ts" setup>
import { useSharedCounter } from '../composables/useSharedCounter';

const { counter, increment, decrement } = useSharedCounter();
</script>

<template>
  <div>
    Counter:
    <button @click="decrement">-</button>
    <span>&nbsp;{{ counter }}&nbsp;</span>
    <button @click="increment">+</button>
  </div>
</template>
