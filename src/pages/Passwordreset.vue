<template>
  <q-page class="flex flex-center">
    <q-card
      class="passwordResetForm"
    >
      <q-card-section
        align="center"
        class="bg-black text-orange q-pa-sm q-mb-sm"
      >
        <div class="text-h6">
          {{ $t('Passwortreset.title') }}
        </div>
      </q-card-section>
      <q-card-section
        v-if="$route.query.token"
      >
        <div class="q-pa-md">
          <div
            class="q-gutter-y-md column"
            style="max-width: 800px"
          >
            <q-input
              v-model="email"
              filled
              dense
              placeholder="max.mustermann@test.de"
              :hint="$t('Passwortreset.email.label')"
            />
            <q-input
              v-model="password"
              filled
              dense
              type="password"
              :hint="$t('Passwortreset.password.label')"
            />
            <q-input
              v-model="password_repeat"
              filled
              dense
              type="password"
              :hint="$t('Passwortreset.password_repeat.label')"
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
            :disable="unvalid"
            :label="$t('Passwortreset.button.submit')"
            @click="reset()"
          />
        </div>
      </q-card-section>
      <q-card-section
        v-if="!$route.query.token && !received"
      >
        <div class="q-pa-md">
          <div
            class="q-gutter-y-md column"
            style="max-width: 800px"
          >
            <q-input
              v-model="email"
              ref="inputEmail"
              filled
              dense
              placeholder="max.mustermann@test.de"
              lazy-rules
              :rules="[val => !!val || 'Field is required',
                       val => val.includes('@') || 'Must be a valid email address']"
              :hint="$t('Passwortreset.email.label')"
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
            icon="ion-mail"
            :label="$t('Passwortreset.button.request')"
            type="submit"
            @click="requestMail()"
          />
        </div>
      </q-card-section>
      <q-card-section
        v-if="!$route.query.token && received"
      >
        <div class="q-pa-md">
          <div
            class="q-gutter-y-md column"
            style="max-width: 200px"
          >
            {{ this.email }}
            <p>You will receive an email with a link. <br>You can close this session now.</p>
          </div>
          <div class="col">
            <q-btn
              flat
              no-caps
              class="full-width"
              color="primary"
              label="Didn't got the email? Send again.."
              @click="received = !received"
            />
          </div>
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
              :label="$t('Passwortreset.button.login')"
              to="/login"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'Passwordreset',
  data () {
    return {
      email: '',
      password: '',
      password_repeat: '',
      response: null,
      received: false
    }
  },
  setup () {
    const inputEmail = ref(null)
    return {
      inputEmail,
      validate () {
        inputEmail.value.validate()
        console.log('validate:', inputEmail.value.hasError)
        return inputEmail.value.hasError
      },
      resetValidation () {
        inputEmail.value.resetValidation()
      }
    }
  },
  computed: {
    unvalid: function () {
      return (this.password === null || this.password.length < 8 || this.password !== this.password_repeat)
    }
  },
  created () {
    if (this.$route.query && this.$route.query.token) {
      //
    }
  },
  methods: {
    reset () {
      const self = this
      const params = {
        token: this.$route.query.token,
        password: this.password
      }
      const instance = this.$instance(this)
      // reset header
      instance.defaults.headers.common.Authorization = null
      // call create user
      instance.post('/#auth/resetPassword', params).then(function (response) {
        console.log(response.data)
        if (response.data && response.data.reset) {
          self.$router.push({ path: 'login', query: { confirmed: true, email: self.email } })
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
    requestMail () {
      if (this.validate()) return
      const self = this
      const params = {
        email: this.email
      }
      const instance = this.$instance(this)
      // reset header
      instance.defaults.headers.common.Authorization = null
      // call login
      instance.post('/#auth/requestPasswordResetMail', params).then(function (response) {
        if (response.data && response.data.sent) {
          self.$q.notify({ message: 'Request successfully received' })
          self.received = true
        }
      }).catch((err) => console.log(err))
    }
  }
}
</script>
