<template>
  <div>
    <q-table
      :columns="columns"
      :rows="member"
      flat
      selection="multiple"
      row-key="email"
      :filter="filter"
      :visible-columns="visibleColumns"
      dense
      v-model:pagination="pagination"
      v-model:selected="selected"
    >
      <template #body-cell-email="props">
        <q-td
          dense
          :props="props"
        >
          <a :href="'mailto:' + props.row.email">
            <q-chip
              dense
              v-if="props.row.role === 'admin' && props.row.relation !== 'INVITED_BY'"
              color="primary"
              text-color="white"
            >{{ props.row.email }}</q-chip>
            <q-chip
              dense
              v-if="props.row.role === 'admin' && props.row.relation === 'INVITED_BY'"
              outline
              color="primary"
              text-color="white"
            >{{ props.row.email }}</q-chip>
            <q-chip
              dense
              v-if="props.row.role === 'member' && props.row.relation !== 'INVITED_BY'"
              color="secondary"
              text-color="white"
            >{{ props.row.email }}</q-chip>
            <q-chip
              dense
              v-if="props.row.role === 'member' && props.row.relation === 'INVITED_BY'"
              outline
              color="secondary"
              text-color="white"
            >{{ props.row.email }}</q-chip>
          </a>
          <q-chip
            :removable="props.row.id !== user.id && isAdmin"
            v-if="props.row.relation === 'INVITED_BY'"
            dense
            :outline="props.row.id !== user.id"
            color="orange"
            text-color="white"
            @remove="removeInvitation(props.row)"
          >
            {{ $t('Members.table.chip.invited') }}
          </q-chip>
          <q-chip
            :clickable="props.row.id === user.id"
            v-if="props.row.request === 'revoke'"
            dense
            flat
            :outline="props.row.id !== user.id"
            :color="props.row.id === user.id ? 'red' : 'red'"
            :text-color="props.row.id === user.id ? 'white' : null"
            @click="confirmDialog(props.row)"
          >
            {{ $t('Members.table.chip.revoke') }}: {{ new Date(props.row.tte).toLocaleDateString() }}
          </q-chip>
          <q-chip
            :clickable="props.row.id === user.id"
            :removable="props.row.id !== user.id && isAdmin"
            v-if="props.row.request === 'nominate'"
            dense
            :outline="props.row.id !== user.id"
            color="primary"
            text-color="white"
            @click="confirmDialog(props.row)"
          >
            {{ $t('Members.table.chip.nominated') }}
          </q-chip>
        </q-td>
      </template>
      <template #top-left>
        <q-toolbar>
          <q-input
            dense
            debounce="300"
            v-model="filter"
            :placeholder="$t('Base.search.placeholder')"
          >
            <template #append>
              <q-icon name="search" />
            </template>
          </q-input>
          <q-separator inset />
          <q-chip
            clickable
            icon="ion-at"
            @click="$emit('back')"
          >
            {{ group.alias ? group.alias : group.name }}
          </q-chip>
        </q-toolbar>
      </template>
      <template #top-right>
        <q-toolbar>
          <toolbar-btn
            icon="ion-at"
            sub
            @click="$emit('back')"
          />
          <toolbar-btn
            icon="ion-refresh"
            :tooltip="$t('Action.refresh')"
            @click="getMember()"
          />
          <toolbar-btn
            v-if="isAdmin === true"
            icon="ion-person-add"
            :tooltip="$t('Action.add')"
            @click="addInvitation()"
          />
          <toolbar-btn
            v-if="isAdmin === true"
            icon="ion-build"
            :tooltip="$t('Action.nominate')"
            :disable="selected.length < 1"
            @click="nominateSelected()"
          />
          <toolbar-btn
            v-if="isAdmin === true"
            icon="ion-trash"
            :tooltip="$t('Action.member.remove')"
            :disable="selected.length < 1"
            @click="removeSelected()"
          />
          <toolbar-btn
            icon="ion-settings"
            :tooltip="$t('Action.settings')"
          >
            <q-menu :offset="[0, 20]">
              <q-list>
                <q-item
                  dense
                  clickable
                  v-for="(column) in columns"
                  :key="column.name"
                  @click="setVisibleColumns(column,visibleColumns)"
                >
                  <q-item-section>
                    <q-item-label
                      :class="visibleColumns.indexOf(column.name) >= 0 ? 'text-primary' : ''"
                    >
                      {{ $t('Members.table.column.' + column.name) }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </toolbar-btn>
        </q-toolbar>
      </template>
    </q-table>

    <!-- invite member dialog -->
    <q-dialog v-model="dialog.invite.show">
      <q-card>
        <q-card-section
          align="center"
          class="bg-black text-white q-pa-sm q-mb-sm"
        >
          <div class="text-h6">
            {{ $t('Members.table.chip.invited') }}
          </div>
        </q-card-section>
        <q-card-section>
          <q-chip
            icon="ion-at"
            :label="group.alias ? group.alias : group.name"
          />
          <div class="q-pa-md">
            <div class="q-gutter-y-md column">
              <q-input
                ref="email"
                dense
                stack-label
                autofocus
                label="Email"
                v-model="dialog.invite.data.email"
                @keyup.enter="inviteMember()"
                :rules="validEmail()"
                lazy-rules
              />
              <div class="q-pa-lg">
                <q-option-group
                  v-model="dialog.invite.data.role"
                  :options="dialog.invite.roleOptions"
                />
              </div>
            </div>
            {{ dialog.invite.error }}
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            dense
            flat
            icon="ion-checkmark"
            :label="$t('Action.invite')"
            color="primary"
            :disable="dialog.invite.error"
            @click="inviteMember()"
          />
          <q-btn
            dense
            flat
            icon="ion-close-circle"
            color="grey"
            @click="()=>{ this.dialog.invite.show = false }"
          >
            <q-tooltip>{{ $t('Action.cancel') }}</q-tooltip>
          </q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- request confirm dialog -->
    <confirm-request-dialog
      :show="dialog.confirm.show"
      :group="group"
      :request="dialog.confirm.request"
      @accept="getMember"
      @decline="getMember"
      @close="()=>{ this.dialog.confirm.show = false }"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
// components
import ConfirmRequestDialog from './ConfirmRequestDialog.vue'
import ToolbarBtn from '../global/ToolbarBtn.vue'

export default {
  props: {
    group: {
      type: Object,
      required: true
    },
    isAdmin: Boolean
  },
  emits: ['back', 'refreshed'],
  components: {
    ConfirmRequestDialog,
    ToolbarBtn
  },
  data: function () {
    return {
      member: [],
      counter: {
        member: 0
      },
      filter: '',
      visibleColumns: ['email'],
      pagination: {
        rowsPerPage: 10
      },
      selected: [],
      invite: false,
      dialog: {
        confirm: {
          show: false,
          request: {}
        },
        invite: {
          show: false,
          data: {
            id: '',
            email: '',
            role: 'member'
          },
          roleOptions: [
            { label: 'Member', value: 'member' },
            { label: 'Admin', value: 'admin' }
          ]
        }
      }
    }
  },
  computed: {
    ...mapGetters({
      user: 'user'
    }),
    columns: function () {
      return [
        { name: 'email', field: 'email', label: this.$t('Members.table.column.email'), sortable: true, align: 'left' },
        { name: 'role', field: 'roleName', label: this.$t('Members.table.column.role'), sortable: true, align: 'left' },
        { name: 'relation', field: 'relation', label: this.$t('Groups.table.column.relation'), align: 'left' },
        { name: 'id', field: 'id', label: this.$t('Members.table.column.id'), sortable: true, align: 'left' }
      ]
    }
  },
  watch: {
    group: {
      deep: true,
      immediate: true,
      handler (group) {
        // get member
        this.getMember()
      }
    }
  },
  mounted () {
    // restore settings - component member
    const settings = this.$store.getters.settings('member')
    if (settings) {
      this.visibleColumns = settings.visibleColumns
      this.pagination = settings.pagination
    }
  },
  beforeUnmount () {
    // store settings - component member
    this.$store.commit('setSettings', {
      member: {
        visibleColumns: this.visibleColumns,
        pagination: this.pagination
      }
    })
  },
  methods: {
    getMember () {
      const param = {
        id: this.group.id
      }
      const instance = this.$instance()
      instance.post('/#groups/members', param).then((response) => {
        if (response.data) {
          const members = []
          if (Array.isArray(response.data)) {
            for (let i = 0; i < response.data.length; i++) {
              const member = response.data[i]
              members.push(member)
            }
            this.member = members
            this.counter.member = members.length
            this.translateData()
            this.$emit('refreshed', { count: this.member.length })
          }
        }
      })
    },
    translateData () {
      for (let i = 0; i < this.member.length; i++) {
        this.member[i].roleName = this.$t('Groups.roles.' + this.member[i].role)
      }
    },
    addInvitation () {
      this.dialog.invite.data.id = this.group.id
      this.dialog.invite.show = true
    },
    removeInvitation (invitation) {
      const instance = this.$instance()
      const param = {
        groupId: this.group.id
      }
      if (invitation.id) {
        param.userId = invitation.id
      } else {
        param.email = invitation.email
      }
      instance.post('/#groups/remove', param).then((response) => {
        if (response.data && Array.isArray(response.data) && response.data.length > 0 && response.data[0].email) {
          this.getMember()
        }
      })
    },
    removeSelected () {
      const instance = this.$instance()
      for (let i = 0; i < this.selected.length; i++) {
        const param = {
          groupId: this.group.id
        }
        switch (this.selected[0].role) {
          case 'admin':
            param.userId = this.selected[i].id
            instance.post('/#groups/revoke', param).then((response) => {
              if (response.data && Array.isArray(response.data) && response.data.length > 0 && response.data[0].tte) {
                this.getMember()
              }
            })
            break
          default:
            if (this.selected[i].id) {
              param.userId = this.selected[i].id
            } else {
              param.email = this.selected[i].email
            }
            instance.post('/#groups/remove', param).then((response) => {
              if (response.data && Array.isArray(response.data) && response.data.length > 0 && response.data[0].email) {
                this.getMember()
              }
            })
        }
      }
    },
    nominateSelected () {
      const instance = this.$instance()
      for (let i = 0; i < this.selected.length; i++) {
        if (this.selected[0].role === 'member' && this.selected[0].relation === 'MEMBER_OF') {
          const param = {
            groupId: this.group.id,
            userId: this.selected[i].id
          }
          instance.post('/#groups/nominate', param).then((response) => {
            if (response.data && Array.isArray(response.data) && response.data.length > 0 && response.data[0].request) {
              this.getMember()
            }
          })
        }
      }
    },
    inviteMember () {
      this.$refs.email.validate()
      if (this.$refs.email.hasError) return

      const instance = this.$instance()
      const param = {
        id: this.dialog.invite.data.id,
        email: this.dialog.invite.data.email,
        role: this.dialog.invite.data.role
      }
      instance.post('/#groups/invite', param).then((response) => {
        if (response.data && Array.isArray(response.data) && response.data.length > 0 && response.data[0].invited) {
          this.getMember(this.group.id)
          this.dialog.invite.show = false
        }
      })
    },
    setVisibleColumns (column, visible) {
      visible.indexOf(column.name) >= 0 ? visible.splice(visible.indexOf(column.name), 1) : visible.push(column.name)
    },
    validEmail () {
      const rules = []
      /* eslint no-useless-escape: "off" */
      const email = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
      const message = this.$t('Message.validation.email')
      rules.push(v => email.test(v) || message)
      return rules
    },
    confirmDialog (row) {
      this.dialog.confirm.request = row
      this.dialog.confirm.show = !this.dialog.confirm.show
    }
  }
}
</script>
