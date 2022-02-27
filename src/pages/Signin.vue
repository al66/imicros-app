<template>
  <q-page class="flex flex-center">
    <q-card class="signinForm">
      <q-card-section
        align="center"
        class="bg-black text-orange q-pa-sm q-mb-sm"
      >
        <div class="text-h6">
          {{ $t('Signin.title') }}
        </div>
      </q-card-section>
      <q-card-section>
        <div class="q-pa-md">
          <div
            class="q-gutter-y-md column"
            style="max-width: 800px"
          >
            <q-input
              v-model="email"
              filled
              dense
              clearable
              placeholder="max.mustermann@test.de"
              :hint="$t('Signin.email.label')"
            />
            <q-input
              v-model="password"
              filled
              dense
              clearable
              type="password"
              :hint="$t('Signin.password.label')"
            />
          </div>
        </div>
        <div
          class="q-pa-none"
          full-width
        >
          <q-btn
            flat
            no-caps
            class="full-width"
            color="primary"
            icon="ion-log-in"
            :label="$t('Signin.button.submit')"
            @click="signin()"
          />
        </div>
      </q-card-section>
      <q-separator inset />
      <q-card-section>
        <div class="q-pa-sm">
          <div
            class="col"
            align="center"
          >
            <q-btn
              flat
              no-caps
              class="full-width"
              color="secondary"
              label="Already an account ?"
              :to="toLogin"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
export default {
  name: 'Signin',
  data () {
    return {
      email: '',
      password: '',
      response: null
    }
  },
  computed: {
    toLogin () {
      return '/login' + (this.email ? '?email=' + this.email : '')
    }
  },
  created () {
    if (this.$route.query && this.$route.query.token) {
      this.confirm(this.$route.query.token)
    }
  },
  mounted () {
    if (this.$route.query && this.$route.query.email) {
      this.email = this.$route.query.email
    }
  },
  methods: {
    isAuthenticated () {
      return this.$store.getters.isAuthenticated
    },
    signin () {
      const this_ = this
      const user = {
        email: this.email,
        password: this.password
      }
      const instance = this.$instance(this)
      // reset header
      instance.defaults.headers.common.Authorization = null
      // call create user
      instance.post('/#auth/create', user).then(function (response) {
        if (response.data && response.data.id) {
          // login new user
          instance.post('/#auth/login', user).then(function (response) {
            if (response.data && response.data.token && response.data.user) {
              this_.$store.commit('login', response.data.user)
              this_.$store.commit('syncAuthenticated', true)
              this_.$store.commit('setToken', response.data.token)
              this_.$axios.defaults.headers.common.Authorization = 'Bearer ' + response.data.token
              instance.defaults.headers.common.Authorization = 'Bearer ' + response.data.token
              // call confirmation mail request
              instance.post('/#auth/requestConfirmationMail', {}).then(function (response) {
                if (response.data && response.data.sent) {
                  this_.$router.push({ name: 'verify' })
                }
              }).catch((err) => console.log(err))
            }
          }).catch((error) => {
            // Not ok - check for message and notify
            if (error.response && error.response.status !== 200 && error.response.data.message) {
              this.$q.notify({
                message: this.$t('Error.' + error.response.data.message),
                color: 'red',
                actions: [
                  { icon: 'ion-close-circle', color: 'white', handler: () => {} }
                ]
              })
            }
          })
        }
      }).catch((error) => {
        // Not ok - check for message and notify
        if (error.response && error.response.status !== 200 && error.response.data.message) {
          this.$q.notify({
            message: this.$t('Error.' + error.response.data.message),
            color: 'red',
            actions: [
              { icon: 'ion-close-circle', color: 'white', handler: () => {} }
            ]
          })
        }
      })
    },
    confirm (token) {
      const self = this
      const params = {
        token
      }
      const instance = this.$instance(this)
      // reset header
      instance.defaults.headers.common.Authorization = null
      // call create user
      instance.post('/#auth/confirm', params).then(function (response) {
        if (response.data && response.data.verified) {
          self.$router.push({ path: 'login', query: { confirmed: true, email: response.data.verified } })
        }
      }).catch((error) => {
        // Not ok - check for message and notify
        if (error.response && error.response.status !== 200 && error.response.data.message) {
          this.$q.notify({
            message: this.$t('Error.' + error.response.data.message),
            color: 'red',
            actions: [
              { icon: 'ion-close-circle', color: 'white', handler: () => {} }
            ]
          })
        }
      })
    },
    logout () {
      this.$router.push('/logout')
    }
  }
}
</script>
