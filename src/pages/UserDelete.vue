<template>
  <q-page class="flex flex-center">
    <q-card
      class="userDeleteForm"
    >
      <q-card-section
        align="center"
        class="bg-black text-orange q-pa-sm q-mb-sm"
      >
        <div class="text-h6">
          {{ $t('User.delete.title') }}
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
              :hint="$t('User.delete.email.label')"
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
            :label="$t('User.delete.button.submit')"
            @click="deleteUser()"
          />
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'UserDelete',
  data () {
    return {
      email: ''
    }
  },
  setup () {
    const inputEmail = ref(null)
    return {
      inputEmail,
      validate () {
        inputEmail.value.validate()
        return inputEmail.value.hasError
      },
      resetValidation () {
        inputEmail.value.resetValidation()
      }
    }
  },
  mounted () {
    if (!this.$route.query || !this.$route.query.token) {
      this.$router.push({ path: 'signin' })
    }
  },
  methods: {
    deleteUser () {
      const self = this
      const params = {
        token: this.$route.query.token,
        email: this.email
      }
      const instance = this.$instance(this)
      // reset header
      instance.defaults.headers.common.Authorization = null
      // call create user
      instance.post('/#auth/delete', params).then(function (response) {
        console.log(response.data)
        if (response.data && response.data.deleted) {
          self.$router.push({ path: 'signin' })
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
  }
}
</script>
