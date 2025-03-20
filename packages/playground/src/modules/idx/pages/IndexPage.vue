<script lang="ts" setup>
import { RouterLink } from 'vue-router';
import { useIdxModule } from '../composables/useIdxModule';

const { nav } = useIdxModule();
</script>

<template>
  <div>
    <h1>Index Page</h1>
    <nav>
      <ul>
        <li v-for="(item, i) in nav" :key="i">
          <RouterLink :to="item.route"> {{ item.title }}</RouterLink>
        </li>
      </ul>
    </nav>
  </div>
</template>
