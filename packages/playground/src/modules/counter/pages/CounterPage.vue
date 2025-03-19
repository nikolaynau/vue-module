<script lang="ts" setup>
import { useSharedCounter } from '../composables/useSharedCounter';

const { counter, increment, decrement } = useSharedCounter();
</script>

<template>
  <div>
    Counter:
    <button @click="decrement">-</button>
    <span> {{ counter }} </span>
    <button @click="increment">+</button>
  </div>
</template>
