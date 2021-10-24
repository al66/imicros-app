<template :lang="$i18n.locale">
  <div>
    <!-- panels -->
    <q-tab-panels v-model="panels.tab">
      <!-- process panel -->
      <q-tab-panel name="agents">
        <q-toolbar>
          <q-input
            dense
            debounce="300"
            v-model="agents.filter"
            :placeholder="$t('Base.search.placeholder')"
          >
            <template
              #after
              v-if="agents.filter !== ''"
            >
              <q-icon
                name="close"
                @click="agents.filter = ''"
                class="cursor-pointer"
              />
            </template>
            <template #append>
              <q-icon name="search" />
            </template>
          </q-input>
          <q-space />
          <q-space />
          <toolbar-btn
            icon="ion-add"
            @click="addAgent()"
          >
            <q-tooltip>{{ $t('Action.add') }}</q-tooltip>
          </toolbar-btn>
        </q-toolbar>
        <q-table
          :columns="agentsColumns"
          :visible-columns="agents.visibleColumns"
          v-model="agents.pagination"
          :rows="agents.data"
          :filter="agents.filter"
          flat
          dense
          row-key="serviceId"
          @row-dblclick="editAgent"
        >
          <template #header="props">
            <q-tr :props="props">
              <q-th auto-width />
              <q-th
                v-for="col in props.cols"
                :key="col.name"
                :props="props"
              >
                {{ col.label }}
              </q-th>
            </q-tr>
          </template>

          <template #body="props">
            <q-tr
              :props="props"
              @dblclick="editAgent(null,props.row, null)"
            >
              <q-td auto-width>
                <toolbar-btn
                  sub
                  color="secondary"
                  tooltip="Token"
                  @click="props.expand = !props.expand"
                  :icon="props.expand ? 'remove' : 'add'"
                />
              </q-td>
              <q-td
                v-for="col in props.cols"
                :key="col.name"
                :props="props"
                @click="props.expand = !props.expand"
              >
                <div
                  v-if="col.name !== 'member' && col.name !== 'label'"
                >
                  {{ col.value }}
                </div>
                <div
                  class="row justify-between"
                  v-if="col.name === 'label'"
                >
                  <div>
                    {{ col.value }}
                  </div>
                  <q-btn
                    flat
                    dense
                    size="xs"
                    icon="ion-more"
                    color="grey"
                  >
                    <q-menu>
                      <q-list
                        dense
                        style="min-width: 100px"
                      >
                        <q-item
                          clickable
                          v-close-popup
                          @click="editAgent(null,props.row, null)"
                        >
                          <q-item-section>...{{ $t('Action.edit') }}</q-item-section>
                        </q-item>
                        <q-item
                          clickable
                          v-close-popup
                          @click="deleteAgent(props.row.serviceId)"
                        >
                          <q-item-section>...{{ $t('Action.delete') }}</q-item-section>
                        </q-item>
                      </q-list>
                    </q-menu>
                  </q-btn>
                </div>
                <div
                  v-if="col.name === 'member' && col.value === true"
                  class="column items-left"
                >
                  <q-avatar
                    size="xs"
                    color="secondary"
                    text-color="white"
                    icon="ion-checkmark"
                  />
                </div>
              </q-td>
            </q-tr>
            <q-tr
              v-show="props.expand"
              :props="props"
            >
              <q-td colspan="100%">
                <div class="text-left">
                  <q-field
                    label="Service ID"
                    stack-label
                    borderless
                  >
                    <q-list
                      dense
                      padding
                    >
                      <q-item>
                        <q-item-section>
                          {{ props.row.serviceId }}
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-toolbar>
                          <toolbar-btn
                            sub
                            color="secondary"
                            icon="ion-clipboard"
                            @click="copyToClipboard(props.row.serviceId)"
                          >
                            <q-tooltip>{{ $t('Action.copy.to.clipboard') }}</q-tooltip>
                          </toolbar-btn>
                          <q-space />
                        </q-toolbar>
                      </q-item>
                    </q-list>
                  </q-field>
                  <q-field
                    label="Token"
                    stack-label
                    borderless
                  >
                    <q-list
                      dense
                      padding
                    >
                      <q-item
                        v-for="(token) in props.row.token"
                        :key="token.tokenId"
                      >
                        <!-- new Intl.DateTimeFormat('en-US').format(new Date(token.created)) ### new Date(token.created).toISOString()-->
                        <q-expansion-item
                          v-model="token.expanded"
                          :label="new Intl.DateTimeFormat('de-DE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' }).format(new Date(token.created))"
                          :caption="`(expire: ${ new Intl.DateTimeFormat('de-DE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' }).format(new Date(token.created + token.expire)) })`"
                          @before-show="getToken(props.row.serviceId, token.tokenId)"
                        >
                          <q-item-section>
                            <q-input
                              :key="updateToken"
                              v-model="token.value"
                              type="textarea"
                              readonly
                            />
                          </q-item-section>
                          <q-toolbar>
                            <toolbar-btn
                              sub
                              color="secondary"
                              icon="ion-clipboard"
                              @click="copyToClipboard(token.value)"
                            >
                              <q-tooltip>{{ $t('Action.copy.to.clipboard') }}</q-tooltip>
                            </toolbar-btn>
                            <q-space />
                            <toolbar-btn
                              sub
                              color="red"
                              icon="ion-trash"
                              @click="removeToken(props.row.serviceId, token.tokenId, token)"
                            >
                              <q-tooltip>{{ $t('Action.delete') }}</q-tooltip>
                            </toolbar-btn>
                          </q-toolbar>
                        </q-expansion-item>
                      </q-item>
                      <q-item>
                        <q-item-section avatar>
                          <toolbar-btn
                            sub
                            icon="ion-add"
                            color="secondary"
                            @click="generateToken(props.row.serviceId)"
                          >
                            <q-tooltip>{{ $t('Action.generate') }}</q-tooltip>
                          </toolbar-btn>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-field>
                </div>
              </q-td>
            </q-tr>
          </template>
        </q-table>
      </q-tab-panel>
    </q-tab-panels>

    <!-- edit agent dialog -->
    <q-dialog v-model="agents.edit.dialog">
      <q-card>
        <q-card-section
          align="center"
          class="bg-black text-white q-pa-sm q-mb-sm"
        >
          <div class="text-h6">
            {{ agents.edit.data.serviceId ? $t('Action.edit') : $t('Action.add') }}
          </div>
        </q-card-section>
        <q-card-section>
          <!--
          <q-chip
            v-if="agents.edit.data.serviceId"
            :label="agents.edit.data.serviceId"
          />
          -->
          <div class="q-pa-md">
            <div class="q-gutter-y-md column">
              <q-input
                dense
                stack-label
                :label="$t('Agents.table.column.label')"
                @keyup.enter="agents.edit.data.serviceId ? saveChanges() : saveNew()"
                v-model="agents.edit.data.label"
              />
              <q-btn-toggle
                v-model="agents.edit.data.role"
                :disable="agents.edit.data.serviceId ? true : false"
                dense
                unelevated
                spread
                no-caps
                toggle-color="secondary"
                :options="[
                  {label: '-', value: '.'},
                  {label: $t('Groups.roles.member'), value: 'member'}
                ]"
              />
              <q-field
                v-if="agents.edit.data.serviceId"
                dense
                stack-label
                disable
                :label="$t('Agents.table.column.serviceId')"
              >
                <div>{{ agents.edit.data.serviceId }}</div>
              </q-field>
            </div>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            dense
            flat
            icon="ion-checkmark"
            :label="$t('Action.save')"
            color="primary"
            @click="agents.edit.data.serviceId ? saveChanges() : saveNew()"
          />
          <q-btn
            dense
            flat
            icon="ion-close-circle"
            color="grey"
            @click="()=>{ this.agents.edit.dialog = false }"
          >
            <q-tooltip>{{ $t('Action.cancel') }}</q-tooltip>
          </q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import { copyToClipboard } from 'quasar'
// components
import ToolbarBtn from '../components/global/ToolbarBtn.vue'

export default {
  name: 'Agents',
  components: {
    ToolbarBtn
  },
  data () {
    return {
      agents: {
        data: [],
        visibleColumns: ['label', 'member', 'serviceId'],
        filter: '',
        pagination: {
          rowsPerPage: 10
        },
        edit: {
          dialog: false,
          data: {}
        },
        token: {}
      },
      panels: {
        tab: 'agents'
      },
      updateToken: 0
    }
  },
  computed: {
    ...mapGetters({
      access: 'access'
    }),
    agentsColumns () {
      return [
        { name: 'label', field: 'label', label: this.$t('Agents.table.column.label'), sortable: true, align: 'left' },
        { name: 'role', field: 'role', label: this.$t('Agents.table.column.role'), sortable: true, align: 'left', format: this.formatRole },
        { name: 'member', field: 'member', label: this.$t('Groups.roles.member'), sortable: true, align: 'left', format: this.formatMember },
        { name: 'serviceId', field: 'serviceId', label: this.$t('Agents.table.column.serviceId'), sortable: true, align: 'left' }
      ]
    },
    headers: function () {
      return [{ name: 'x-imicros-xtoken', value: this.access.token },
        { name: 'Authorization', value: this.$axios.defaults.headers.common.Authorization }]
    },
    tokens: function () {
      return this.agents.token
    }
  },
  watch: {
    access: {
      deep: true,
      handler () {
        this.refreshAgents()
      }
    }
  },
  mounted () {
    //
    this.refreshAgents()
  },
  methods: {
    refreshAgents () {
      if (!this.access.token) return
      //
      const instance = this.$instance()
      instance.defaults.headers.get['x-imicros-xtoken'] = this.access.token
      return new Promise((resolve, reject) => {
        instance.get('/api/agents/getAll').then((response) => {
          if (response.data && Array.isArray(response.data)) {
            this.agents.data = response.data
            resolve()
          }
        }).catch((err) => {
          console.log(err)
          reject()
        })
      })
    },
    formatRole (val, row) {
      return val === '.' ? '-' : this.$t('Groups.roles.' + val)
    },
    formatMember (val, row) {
      return row.role === 'member' ? true : null
    },
    copyToClipboard (val) {
      copyToClipboard(val).then(() => {}).catch(() => {})
    },
    editAgent (evt, row, index) {
      if (!row.serviceId) return
      /* eslint no-useless-escape: "off" */
      this.agents.edit.data = Object.assign({}, row)
      this.agents.edit.dialog = true
    },
    addAgent () {
      /* eslint no-useless-escape: "off" */
      this.agents.edit.data = { label: null, role: '.' }
      this.agents.edit.dialog = true
    },
    saveChanges () {
      if (!this.access.token || !this.agents.edit.data.serviceId || !this.agents.edit.data.label) return
      const params = {
        serviceId: this.agents.edit.data.serviceId,
        label: this.agents.edit.data.label
      }
      //
      const instance = this.$instance()
      instance.defaults.headers.post['x-imicros-xtoken'] = this.access.token
      instance.post('/api/agents/rename', params).then(async (response) => {
        if (response.data && response.data.serviceId) {
          await this.refreshAgents()
          this.agents.edit.data = {}
          this.agents.edit.dialog = false
        }
      }).catch((err) => {
        console.log(err)
      })
    },
    saveNew () {
      if (!this.access.token || !this.agents.edit.data.label) return
      const params = {
        label: this.agents.edit.data.label,
        role: this.agents.edit.data.role || '.'
      }
      //
      const instance = this.$instance()
      instance.defaults.headers.post['x-imicros-xtoken'] = this.access.token
      instance.post('/api/agents/create', params).then(async (response) => {
        if (response.data && response.data.serviceId) {
          await this.refreshAgents()
          this.agents.edit.data = {}
          this.agents.edit.dialog = false
        }
      }).catch((err) => {
        console.log(err)
      })
    },
    deleteAgent (serviceId) {
      console.log('delete agent:', serviceId)
      if (!this.access.token || !serviceId) return
      //
      const instance = this.$instance()
      instance.defaults.headers.post['x-imicros-xtoken'] = this.access.token
      instance.post('/api/agents/delete', { serviceId }).then(async (response) => {
        if (response.data) {
          await this.refreshAgents()
        }
      }).catch((err) => {
        console.log(err)
      })
    },
    generateToken (serviceId) {
      if (!this.access.token || !serviceId) return
      //
      const instance = this.$instance()
      instance.defaults.headers.post['x-imicros-xtoken'] = this.access.token
      instance.post('/api/agents/generateAuthToken', { serviceId }).then(async (response) => {
        if (response.data && response.data.tokenId) {
          await this.refreshAgents()
          // this.agents.edit.data = this.agents.data.find(service => service.serviceId === serviceId)
        }
      }).catch((err) => {
        console.log(err)
      })
    },
    removeToken (serviceId, tokenId, element) {
      if (!this.access.token || !serviceId || !tokenId) return
      //
      const instance = this.$instance()
      instance.defaults.headers.post['x-imicros-xtoken'] = this.access.token
      instance.post('/api/agents/removeAuthToken', { serviceId, tokenId }).then(async (response) => {
        if (response.data) {
          element.expanded = false
          await this.refreshAgents()
          // this.agents.edit.data = this.agents.data.find(service => service.serviceId === serviceId)
          this.updateToken += 1
        }
      }).catch((err) => {
        console.log(err)
      })
    },
    getToken (serviceId, tokenId) {
      const service = this.agents.data.find((service) => service.serviceId === serviceId)
      if (service && Array.isArray(service.token)) {
        const token = service.token.find((token) => token.tokenId === tokenId)
        if (!token.value) {
          const instance = this.$instance()
          instance.defaults.headers.post['x-imicros-xtoken'] = this.access.token
          instance.post('/api/agents/getAuthToken', { serviceId, tokenId }).then(async (response) => {
            if (response.data && response.data.authToken) {
              token.value = response.data.authToken
              this.updateToken += 1
            }
          }).catch((err) => {
            console.log(err)
          })
        }
      }
    }
  }
}
</script>
<style :lang="$i18n.locale">

</style>
