<template>
  <q-page class="flex flex-center">
    <div>
      <q-img class="logo" alt="imicros logo" src="~assets/imicros-grau.png" v-if="this.$q.dark.isActive"/>
      <q-img class="logo" alt="imicros logo" src="~assets/imicros.png" v-if="!this.$q.dark.isActive"/>
    </div>
  </q-page>
</template>

<script>
export default {
  name: 'PageIndex'
}
</script>

<style>
.logo {
  width: 300px;
}
</style>
