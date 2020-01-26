<template>
  <q-page class="flex flex-center">
    <q-card class="loginForm" title="$t('Login.title')" v-if="isAuthenticated()" >
      <q-card-section align="center">
        <div class="text-h6">
          {{ $t('Login.title') }}
        </div>
      </q-card-section>
      <q-card-section>
        <div class="q-pa-md">
          <div class="q-gutter-y-md column" style="max-width: 800px">{{ user.email }}, you are successfully authenticated</div>
        </div>
      </q-card-section>
      <q-separator inset />
      <q-card-section align="center">
        <q-btn color="primary" icon="ion-log-out" :label="$t('Login.button.logout')" @click="logout()" />
      </q-card-section>
    </q-card>
    <q-card class="loginForm" title="$t('Login.title')" v-if="!isAuthenticated()" >
      <q-card-section align="center">
        <div class="text-h6">
          {{ $t('Login.title') }}
        </div>
      </q-card-section>
      <q-card-section>
        <div class="q-pa-md">
          <div class="q-gutter-y-md column" style="max-width: 800px">
            <q-input v-model="email" filled dense placeholder="max.mustermann@test.de" :hint="$t('Login.email.label')" />
            <q-input v-model="password" filled dense type="password" :hint="$t('Login.password.label')" @keyup.enter="login()" />
          </div>
        </div>
      </q-card-section>
      <q-separator inset />
      <q-card-section align="center">
        <q-btn color="primary" icon="ion-log-in" :label="$t('Login.button.submit')" @click="login()" />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'Login',
  data () {
    return {
      email: '',
      password: '',
      response: null
    }
  },
  computed: {
    ...mapGetters({
      user: 'user'
    })
  },
  methods: {
    isAuthenticated () {
      return this.$store.getters.isAuthenticated
    },
    login () {
      var this_ = this
      let user = {
        email: this.email,
        password: this.password
      }
      let instance = this_.$axios.create()
      // reset header
      instance.defaults.headers.common['Authorization'] = null
      instance.defaults.baseURL = 'http://localhost:8080/api/'
      // call login
      instance.post('api/user/login', user).then(function (response) {
        this_.response = response
        if (response.data && response.data.token && response.data.user) {
          this_.$store.commit('login', response.data.user)
          this_.$store.commit('syncAuthenticated', true)
          this_.$store.commit('setToken', response.data.token)
          this_.$axios.defaults.headers.common['Authorization'] = 'Bearer ' + response.data.token
          this_.$router.push('/')
        }
      }).catch((err) => console.log(err))
    },
    logout () {
      this.$router.push('/logout')
    }
  }
}
</script>
