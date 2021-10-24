<template>
  <q-page class="flex flex-center">
    <img
      v-if="$q.dark.isActive"
      alt="imicros logo"
      src="~assets/imicros-logo-light-grey.svg"
      style="width: 300px; height: 200px"
    >
    <img
      v-if="!$q.dark.isActive"
      alt="imicros logo"
      src="~assets/imicros-logo-black.svg"
      style="width: 300px; height: 200px"
    >
  </q-page>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'PageIndex'
})
</script>
