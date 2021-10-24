<template>
  <q-page class="flex flex-center">
    <q-card>
      <q-card-section
        align="center"
        class="bg-black text-orange q-pa-sm q-mb-sm"
      >
        <div class="text-h6">
          {{ $t('Confirm.title') }}
        </div>
      </q-card-section>
      <q-card-section>
        <div class="q-pa-md">
          <div
            class="q-gutter-y-md column"
            style="max-width: 200px"
          >
            {{ user.email }}
            <p>Your must confirm your email adress before you can use your account. <br>We have send you an email with a confirmation link.</p>
          </div>
          <div class="col">
            <q-btn
              flat
              no-caps
              class="full-width"
              color="primary"
              label="Didn't got the email? Send again.."
              @click="requestConfirmationMail"
            />
          </div>
        </div>
      </q-card-section>
      <q-separator inset />
      <q-card-section align="center">
        <q-btn
          color="primary"
          icon="ion-log-out"
          :label="$t('Login.button.logout')"
          @click="logout()"
        />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'Verify',
  computed: {
    ...mapGetters({
      user: 'user'
    })
  },
  methods: {
    logout () {
      this.$router.push('/logout')
    },
    requestConfirmationMail () {
      const this_ = this
      const instance = this_.$instance()
      instance.defaults.headers.common.Authorization = 'Bearer ' + this.$store.getters.token
      // call login
      instance.post('/#auth/requestConfirmationMail', {}).then(function (response) {
        if (response.data && response.data.sent) {
          this_.$q.notify({ message: 'Request successfully received' })
        }
      }).catch((err) => console.log(err))
    }
  }
}
</script>
