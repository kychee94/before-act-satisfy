<script setup>
const appName = import.meta.env.VITE_APP_NAME;

</script>

<template>
  <div class="h-100 d-flex align-center justify-md-space-between justify-center">
    <!-- 👉 Footer: left content -->
    <span class="d-flex align-center text-medium-emphasis">
      &copy;
      {{ new Date().getFullYear() }}
      <a href="/"
        target="_blank"
        rel="noopener noreferrer"
        class="text-primary ms-1"
      >{{appName}}</a>
    </span>
    <!-- 👉 Footer: right content -->
  </div>
</template>
