<template>
  <q-page class="flex flex-center">
    <q-card>
      <q-card-section
        align="center"
        class="bg-black text-orange q-pa-sm q-mb-sm"
      >
        <div class="text-h6">
          {{ $t('User.title') }}
        </div>
      </q-card-section>
      <q-card-section align="center">
        <q-chip>{{ user.email }}</q-chip>
        <q-checkbox
          :model-value="user.verified"
          readonly
          color="orange"
        >
          <q-tooltip>
            {{ $t('User.info.verified') }}
          </q-tooltip>
        </q-checkbox>
        <q-chip>
          {{ user.id }}
        </q-chip>
      </q-card-section>
      <q-separator
        inset
      />
      <q-card-section align="center">
        <q-btn
          flat
          outline
          dense
          style="min-width: 150px"
          :label="locale"
        >
          <q-menu auto-close>
            <q-list>
              <q-item
                clickable
                v-for="(index) in langs"
                :key="index.value"
                @click="locale = index.value"
              >
                <q-item-section>
                  <q-item-label>{{ new String(index.label).toUpperCase() }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-card-section>
      <q-separator
        inset
      />
      <q-card-section align="center">
        <q-btn
          flat
          no-caps
          color="primary"
          icon="ion-mail"
          :label="$t('User.button.request.password.reset')"
          @click="requestResetMail()"
        />
      </q-card-section>
      <q-separator
        inset
      />
      <q-card-section align="center">
        <q-btn
          flat
          no-caps
          color="primary"
          icon="ion-mail"
          :label="$t('User.button.request.delete')"
          @click="requestDeletionMail()"
        />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
// vuex store
import { mapGetters } from 'vuex'
import { useI18n } from 'vue-i18n'

export default {
  setup () {
    const { locale } = useI18n({ useScope: 'global' })
    return {
      locale,
      langs: [
        { label: 'German', value: 'de' },
        { label: 'US English', value: 'en-US' }
      ]
    }
  },
  computed: {
    ...mapGetters({
      user: 'user'
    })
  },
  methods: {
    requestResetMail () {
      const self = this
      const params = {
        email: this.user.email
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
    },
    requestDeletionMail () {
      const self = this
      const params = {
        email: this.user.email
      }
      const instance = this.$instance(this)
      // call login
      instance.post('/#auth/requestDeletion', params).then(function (response) {
        if (response.data && response.data.sent) {
          self.$q.notify({ message: 'Request successfully received' })
        }
      }).catch((err) => console.log(err))
    }
  }
}
</script>
