<template>
  <q-page class="flex flex-center">
    <q-card class="loginForm" v-if="isAuthenticated()" >
      <q-card-section align="center" class="bg-black text-orange">
        <div class="text-h6">{{ $t('Login.title') }}</div>
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
    <q-card class="loginForm" v-if="!isAuthenticated()" >
      <q-card-section align="center" class="bg-black text-orange">
        <div class="text-h6">{{ $t('Login.title') }}</div>
      </q-card-section>
      <q-card-section>
        <div class="q-pa-md">
          <div class="q-gutter-y-md column" style="max-width: 800px">
            <q-input v-model="email" filled dense placeholder="max.mustermann@test.de" :hint="$t('Login.email.label')" />
            <q-input v-model="password" filled dense type="password" :hint="$t('Login.password.label')" @keyup.enter="login()" />
          </div>
        </div>
        <div class="q-pa-md" >
          <q-btn flat  class="full-width" color="primary" icon="ion-log-in" :label="$t('Login.button.submit')" @click="login()" />
        </div>
      </q-card-section>
      <q-separator inset />
      <q-card-section>
        <div class="q-pa-md">
          <div class="col">
            <q-btn flat no-caps class="full-width" color="primary" label="Forgot password?"></q-btn>
          </div>
          <div class="col"  align="center">
            <q-btn flat no-caps class="full-width" color="secondary" label="New to imicros ?" to='/signin' />
          </div>
        </div>
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
      // logout
      this.$axios.defaults.headers.common['Authorization'] = null
      this.$store.commit('syncAuthenticated', false)
      this.$store.commit('logout')
      // login parameter
      var this_ = this
      let user = {
        email: this.email,
        password: this.password
      }
      let instance = this_.$instance()
      // call login
      instance.post('/#auth/login', user).then(function (response) {
        this_.response = response
        if (response.data && response.data.token && response.data.user) {
          this_.$store.commit('login', response.data.user)
          this_.$store.commit('syncAuthenticated', true)
          this_.$store.commit('setToken', response.data.token)
          this_.$axios.defaults.headers.common['Authorization'] = 'Bearer ' + response.data.token
          response.data.user.verified ? this_.$router.push('/') : this_.$router.push('/verify')
        }
      }).catch((err) => console.log(err))
    },
    logout () {
      this.$router.push('/logout')
    }
  }
}
</script>
