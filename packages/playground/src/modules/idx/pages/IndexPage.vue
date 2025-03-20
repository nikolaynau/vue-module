<script lang="ts" setup>
import { RouterLink } from 'vue-router';

const links: any = [];
</script>

<template>
  <div>
    <h1>Index Page</h1>
    <nav>
      <ul>
        <li v-for="(link, i) in links" :key="i">
          <RouterLink :to="link.to"> {{ link.name }}</RouterLink>
        </li>
      </ul>
    </nav>
  </div>
</template>
