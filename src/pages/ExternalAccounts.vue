<template>
  <div>
    <q-toolbar>
      <q-chip v-if="objectName">
        {{ objectName }}
      </q-chip>
      <q-chip
        v-if="!objectName"
        class="text-white"
        color="orange"
      >
        {{ $t('Accounts.new.file') }}
      </q-chip>
      <q-space />
      <q-space />
      <toolbar-btn
        icon="ion-add"
        @click="newAccount()"
      >
        <q-tooltip>{{ $t('Action.add') }}</q-tooltip>
      </toolbar-btn>
      <toolbar-btn
        icon="ion-open"
        @click="()=>{ this.files.select = !this.files.select }"
      >
        <q-tooltip>{{ $t('Action.open') }}</q-tooltip>
      </toolbar-btn>
      <toolbar-btn
        :disable="step < 3"
        icon="ion-save"
        @click="saveAccount()"
      >
        <q-tooltip>{{ $t('Action.save') }}</q-tooltip>
      </toolbar-btn>
      <toolbar-btn
        icon="ion-copy"
        :disable="!objectName"
        @click="copyAccount()"
      >
        <q-tooltip>{{ $t('Action.copy') }}</q-tooltip>
      </toolbar-btn>
    </q-toolbar>
    <!-- <q-tab-panel name="stepper"> -->
    <q-stepper
      v-model="step"
      flat
      header-nav
      ref="stepper"
      color="primary"
      animated
    >
      <q-step
        :name="1"
        :title="$t('Accounts.step.select')"
        icon="settings"
        :done="step > 1"
        :header-nav="step > 1"
      >
        <q-option-group
          :options="types"
          label="Type"
          type="radio"
          v-model="type"
        />
        <q-stepper-navigation>
          <q-btn
            @click="() => { done1 = true; step = 2 }"
            color="primary"
            :label="$t('Action.continue')"
          />
        </q-stepper-navigation>
      </q-step>

      <q-step
        :name="2"
        :title="$t('Accounts.step.enter')"
        caption=""
        icon="edit"
        :done="step > 2"
        :header-nav="step > 2"
      >
        <q-form
          v-if="type === 'smtp'"
          autocomplete="off"
          style="max-width: 400px"
        >
          <q-input
            v-model="smtp.host"
            type="url"
            clearable
            label="Host"
          />
          <div class="q-pa-sm rounded-borders">
            <q-option-group
              name="Port"
              v-model="smtp.port"
              label="Port"
              :options="ports"
              inline
            />
            <q-checkbox
              v-model="smtp.secure"
              label="Secure"
            />
            <q-checkbox
              v-model="smtp.requireTLS"
              label="Require TLS"
            />
          </div>
          <q-input
            v-model="smtp.user"
            autocomplete="off"
            clearable
            label="User"
          />
          <q-input
            v-model="smtp.pass"
            autocomplete="new-password"
            label="Password"
            :type="smtp.isPwd ? 'password' : 'text'"
          >
            <template v-slot:append>
              <q-icon
                :name="smtp.isPwd ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="smtp.isPwd = !smtp.isPwd"
              />
            </template>
          </q-input>
        </q-form>
        <q-stepper-navigation>
          <q-btn
            @click="() => { done2 = true; step = 3 }"
            color="primary"
            :label="$t('Action.continue')"
          />
          <q-btn
            flat
            @click="step = 1"
            color="primary"
            :label="$t('Action.back')"
            class="q-ml-sm"
          />
        </q-stepper-navigation>
      </q-step>

      <q-step
        :name="3"
        :title="$t('Accounts.step.test')"
        icon="ion-save"
        :done="step > 3"
        :header-nav="step > 3"
      >
        <q-btn
          @click="testAccount"
          color="primary"
          :label="$t('Action.test')"
        />
        <q-checkbox
          v-model="test.result"
          disable
          :label="test.result === true ? 'Ok' : test.result === false ? 'Not ok' : 'Unknown'"
        />
        <q-card
          v-if="test.err && typeof test.err === 'object'"
          flat
        >
          <q-card-section><div>{{ $t('Accounts.server.response') }}:</div><div>{{ JSON.stringify(test.err, null, 4) }}</div></q-card-section>
        </q-card>
        <q-stepper-navigation>
          <q-btn
            color="primary"
            @click="saveAccount"
            :label="$t('Action.save')"
          />
          <q-btn
            flat
            @click="step = 2"
            color="primary"
            :label="$t('Action.back')"
            class="q-ml-sm"
          />
        </q-stepper-navigation>
      </q-step>
      <q-step
        :name="4"
        :title="$t('Accounts.step.display')"
        caption=""
        icon="ion-done-all"
        active-icon="ion-done-all"
        :done="step > 4"
        :header-nav="step > 4"
      >
        <q-card
          v-if="type === 'smtp'"
          style="max-width: 400px"
          flat
        >
          <q-card-section
            align="center"
            class="q-pa-lg q-mb-lg"
          >
            <q-input
              v-model="smtp.host"
              type="url"
              readonly
              label="Host"
            />
            <div class="q-pa-sm rounded-borders">
              <q-option-group
                name="Port"
                v-model="smtp.port"
                disable
                label="Port"
                :options="ports"
                inline
              />
              <q-checkbox
                v-model="smtp.secure"
                disable
                label="Secure"
              />
              <q-checkbox
                v-model="smtp.requireTLS"
                disable
                label="Require TLS"
              />
            </div>
            <q-input
              v-model="smtp.user"
              readonly
              label="User"
            />
          </q-card-section>
        </q-card>
        <q-stepper-navigation>
          <q-btn
            flat
            @click="step = 3"
            color="primary"
            :label="$t('Action.back')"
            class="q-ml-sm"
          />
        </q-stepper-navigation>
      </q-step>
    </q-stepper>
    <!-- </q-tab-panel> -->
    <file-select
      :refresh="files.refresh"
      :show="files.select"
      @close="()=>{ this.files.select = false }"
      @file="loadAccount"
    />
    <file-save-as
      :refresh="files.refresh"
      :show="files.saveAs"
      suffix=""
      @close="()=>{ this.files.saveAs = false }"
      @file="saveAccountAs"
    />
  </div>
</template>

<script>
// vuex store
import { mapGetters } from 'vuex'
// toolbar button
import ToolbarBtn from '../components/global/ToolbarBtn.vue'
// components
import FileSelect from '../components/main/FileSelect.vue'
import FileSaveAs from '../components/main/FileSaveAs.vue'

export default {
  name: 'ExtternalAccounts',
  components: {
    FileSelect,
    FileSaveAs,
    ToolbarBtn
  },
  data () {
    return {
      step: 1,
      type: null,
      smtp: {
        host: '',
        port: 465,
        secure: true,
        requireTLS: true,
        user: '',
        pass: '',
        encrypted: null,
        isPwd: true
      },
      test: {
        result: null,
        err: null
      },
      ports: [{ label: '25', value: 25 }, { label: '587', value: 587 }, { label: '465', value: 465 }],
      files: {
        select: false,
        saveAs: false,
        refresh: 0
      },
      objectName: null
    }
  },
  computed: {
      ...mapGetters({
          access: 'access'
      }),
      types: function () {
        return [{ label: this.$t('Accounts.type.smtp'), value: 'smtp' }]
      }
  },
  watch: {
    access: {
      deep: true,
      handler () {
        this.newAccount()
      }
    },
    smtp: {
      deep: true,
      handler (newVal, oldVal) {
        this.test.result = null
      }
    }
  },
  created () {
  },
  mounted () {
    if (!this.objectName) {
      this.newAccount()
    } else {
      this.loadAccount(this.objectName)
    }
  },
  beforeDestroy () {
    // TODO store last state
  },
  methods: {
    async newAccount () {
      this.objectName = null
      this.step = 1
      this.type = null
      this.smtp = {
        host: '',
        port: 465,
        secure: true,
        requireTLS: true,
        user: '',
        pass: '',
        encrypted: null,
        isPwd: true
      }
      this.resetTest()
    },
    loadAccount (objectName) {
      const instance = this.$instance()
      instance.defaults.headers.get['x-imicros-xtoken'] = this.access.token
      instance.defaults.headers.get['Content-Type'] = 'application/octet-stream'
      // this.spinners.push(row.etag)
      instance.get('/#file/' + objectName, {
        responseType: 'json'
      }).then(async (response) => {
        try {
          this.setAccountData(response.data)
          this.objectName = objectName
          this.resetTest()
          this.step = 4
        } catch (err) {
          console.log('Failed to open file ' + objectName + ':', err)
        }
      }).catch((err) => {
        console.error(err)
      })
    },
    setAccountData (account) {
      if (account.smtp && typeof account.smtp === 'object') {
        this.type = 'smtp'
        this.smtp.host = account.smtp.host
        this.smtp.port = account.smtp.port
        account.smtp.secure ? this.smtp.secure = account.smtp.secure : this.smtp.secure = false
        account.smtp.requireTLS ? this.smtp.requireTLS = account.smtp.requireTLS : this.smtp.requireTLS = false
        this.smtp.user = account.smtp.user
        this.smtp.pass = ''
        this.smtp.encrypted = account.smtp.pass
      }
      if (account.auth && typeof account.auth === 'object') {
        this.smtp.user = account.auth.user
        this.smtp.encrypted = account.auth.pass
      }
    },
    getAccountData (test) {
      const account = {}
      if (this.type === 'smtp') {
        account.smtp = {
          host: this.smtp.host,
          port: this.smtp.port,
          secure: this.smtp.secure,
          requireTLS: this.smtp.requireTLS
        }
        account.auth = {
          user: this.smtp.user,
          pass: this.smtp.pass.length > 0 ? this.smtp.pass : this.smtp.encrypted
        }
        if (test) {
          account.auth.pass = this.smtp.pass.length > 0 ? this.smtp.pass : this.smtp.encrypted
        } else {
          account.auth.pass = this.smtp.pass.length > 0 ? { _encrypt: { value: this.smtp.pass } } : this.smtp.encrypted
        }
      }
      return account
    },
    async testAccount () {
      this.resetTest()
      const instance = this.$instance()
      instance.defaults.headers.post['x-imicros-xtoken'] = this.access.token
      instance.defaults.headers.post['Content-Type'] = 'application/octet-stream'
      const params = {
        account: this.getAccountData(true)
      }
      instance.post('/api/mails/verify', params).then((result) => {
        if (result.data && result.data.test && result.data.test === true) {
          this.test.result = true
        } else {
          this.test.result = false
        }
        if (result.data && result.data.err) {
          this.test.err = result.data.err
          if (this.test.err.responseCode) {
            this.$q.notify({
              message: this.$t('smtp.return.code.' + this.test.err.responseCode),
              caption: this.$t('Accounts.server.response'),
              type: 'negative'
            })
          }
        }
      }).catch((err) => {
        console.error('Failed to test account ' + this.objectName, err)
      })
    },
    async saveAccount () {
      if (!this.objectName) {
        this.files.saveAs = true
        return
      }

      const instance = this.$instance()
      instance.defaults.headers.post['x-imicros-xtoken'] = this.access.token
      instance.defaults.headers.post['Content-Type'] = 'application/octet-stream'
      let action, params
      if (this.type === 'smtp') {
        action = 'smtp'
        params = {
          account: this.objectName,
          settings: this.getAccountData(false)
        }
      }
      if (action && params) {
        instance.post('/api/mails/' + action, params).then((response) => {
          console.log('File ' + this.objectName + ' saved')
          // trigger refresh file lists of dialogs
          this.files.refresh += 1
          this.resetTest()
          this.step = 4
        }).catch((err) => {
          console.error('Failed to save file ' + this.objectName, err)
        })
      }
    },
    async saveAccountAs (objectName) {
      this.objectName = objectName
      // hide dialog again
      this.files.saveAs = false
      await this.saveAccount()
    },
    copyAccount () {
      this.objectName = null
    },
    resetTest () {
      this.test = {
        result: null,
        err: null
      }
    }
  }
}
</script>
