<template>
    <div></div>
</template>
<script>
export default {
  name: 'Logout',
  created () {
    this.$axios.defaults.headers.common['Authorization'] = null
    this.$store.commit('logout')
    this.$router.push('/login')
  }
}
</script>
