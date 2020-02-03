<template>
  <div>
    <q-table
      :columns="columns"
      :data="member"
      flat
      selection="multiple"
      row-key="email"
      :filter="filter"
      :visible-columns="visibleColumns"
      dense
      :pagination.sync="pagination"
      :selected.sync="selected"
    >
      <template v-slot:body-cell-email="props">
        <q-td dense :props="props">
          <q-chip dense v-if="props.row.role === 'admin' && props.row.relation !== 'INVITED_BY'" color="primary" text-color="white">{{ props.row.email }}</q-chip>
          <q-chip dense v-if="props.row.role === 'admin' && props.row.relation === 'INVITED_BY'" color="blue-4" text-color="white">{{ props.row.email }}</q-chip>
          <q-chip dense v-if="props.row.role === 'member' && props.row.relation !== 'INVITED_BY'" color="secondary" text-color="white">{{ props.row.email }}</q-chip>
          <q-chip dense v-if="props.row.role === 'member' && props.row.relation === 'INVITED_BY'" >{{ props.row.email }}</q-chip>
          <q-chip v-if="props.row.relation === 'INVITED_BY'" dense color="orange-3" text-color="white" >{{ $t('Members.table.chip.invited') }}</q-chip>
          <q-chip
            :clickable="props.row.id === user.id"
            v-if="props.row.request === 'revoke'"
            dense
            :color="props.row.id === user.id ? 'red' : 'red-11'"
            text-color="white"
            @click="confirmDialog(props.row)"
          >{{ $t('Members.table.chip.revoke') }}: {{ new Date(props.row.tte).toLocaleDateString() }}</q-chip>
          <q-chip
            :clickable="props.row.id === user.id"
            v-if="props.row.request === 'nominate'"
            dense
            :color="props.row.id === user.id ? 'primary' : 'blue-11'"
            text-color="white"
            @click="confirmDialog(props.row)"
          >{{ $t('Members.table.chip.nominated') }}</q-chip>
          <!--
          <q-chip v-if="props.row.request === 'nominate'" dense color="blue-4" text-color="white" >{{ $t('Members.table.chip.nominated') }}</q-chip>
          <q-chip v-if="props.row.request === 'revoke'" dense color="red" text-color="white" >{{ $t('Members.table.chip.revoke') }}: {{ new Date(props.row.tte).toLocaleDateString() }}</q-chip>
          -->
        </q-td>
      </template>
      <template v-slot:top-left>
        <q-toolbar>
          <q-input dense debounce="300" v-model="filter" :placeholder="$t('Base.search.placeholder')">
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
          <q-separator inset/>
          <q-chip icon="ion-at">{{ group.alias ? group.alias : group.name }}</q-chip>
        </q-toolbar>
      </template>
      <template v-slot:top-right>
        <q-btn round size="sm" color="primary" icon="ion-refresh" @click="getMember()">
          <q-tooltip>{{ $t('Action.refresh') }}</q-tooltip>
        </q-btn>
        <q-btn round size="sm" color="primary" icon="ion-person-add" v-if="isAdmin === true" @click="addInvitation()">
          <q-tooltip>{{ $t('Action.add') }}</q-tooltip>
        </q-btn>
        <q-btn round size="sm" color="primary" icon="ion-build" v-if="isAdmin === true" :disable="selected.length < 1" @click="nominateSelected()">
          <q-tooltip>{{ $t('Action.nominate') }}</q-tooltip>
        </q-btn>
        <q-btn round size="sm" color="primary" icon="ion-trash" v-if="isAdmin === true" :disable="selected.length < 1" @click="removeSelected()">
          <q-tooltip>{{ $t('Action.member.remove') }}</q-tooltip>
        </q-btn>
        <q-btn round size="sm" color="primary" icon="ion-settings">
          <q-tooltip>{{ $t('Action.settings') }}</q-tooltip>
          <q-menu :offset="[0, 20]">
            <q-list>
              <q-item dense clickable v-for='(column) in columns' v-bind:key='column.name' @click="setVisibleColumns(column,visibleColumns)" >
                <q-item-section>
                  <q-item-label
                    :class="visibleColumns.indexOf(column.name) >= 0 ? 'text-primary' : ''"
                  >{{ $t('Members.table.column.' + column.name) }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </template>
    </q-table>

    <!-- invite member dialog -->
    <q-dialog v-model="dialog.invite.show">
      <q-card>
        <q-card-section>
          <q-chip icon="ion-at" :label="group.alias ? group.alias : group.name" />
          <div class="q-pa-md">
            <div class="q-gutter-y-md column">
              <q-input ref="email" dense stack-label autofocus label="Email" v-model="dialog.invite.data.email" @keyup.enter="inviteMember()" :rules="validEmail()" lazy-rules />
              <q-option-group
                v-model="dialog.invite.data.role"
                :options="dialog.invite.roleOptions"
              />
            </div>
            {{ dialog.invite.error }}
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn :label="$t('Action.invite')" color="primary" dense type="submit" :disable="dialog.invite.error" @click="inviteMember()"/>
          <q-btn :label="$t('Action.cancel')" dense @click="()=>{ this.dialog.invite.show = false }" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- request confirm dialog -->
    <q-dialog v-model="confirm" v-if="request.request">
      <q-card>
        <q-card-section>
          <div class="text-h6">{{ $t('Members.dialog.request.title') }}</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          {{ $t('Members.dialog.request.' + request.request) }}
        </q-card-section>
        <q-card-actions align="right">
          <q-btn :label="$t('Action.accept')" text-color="green" dense flat @click="acceptRequest()"/>
          <q-btn :label="$t('Action.decline')" text-color="red" dense flat @click="declineRequest()"/>
          <q-btn :label="$t('Action.cancel')" dense flat @click="()=>{ this.confirm = false }" />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  props: {
    group: {
      type: Object,
      required: true
    },
    isAdmin: Boolean
  },
  data: function () {
    return {
      member: [],
      counter: {
        member: 0
      },
      filter: '',
      visibleColumns: [ 'email' ],
      pagination: {
        rowsPerPage: 10
      },
      selected: [],
      invite: false,
      confirm: false,
      request: {},
      dialog: {
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
    let settings = this.$store.getters.settings('member')
    if (settings) {
      this.visibleColumns = settings.visibleColumns
      this.pagination.rowsPerPage = settings.pagination.rowsPerPage
    }
  },
  beforeDestroy () {
    // store settings - component member
    this.$store.commit('setSettings', {
      member: {
        visibleColumns: this.visibleColumns,
        pagination: {
          rowsPerPage: this.pagination.rowsPerPage
        }
      }
    })
  },
  methods: {
    getMember () {
      let param = {
        id: this.group.id
      }
      let instance = this.$axios.create()
      instance.post('api/groups/members', param).then((response) => {
        if (response.data) {
          let members = []
          if (Array.isArray(response.data)) {
            for (let i = 0; i < response.data.length; i++) {
              let member = response.data[i]
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
    removeSelected () {
      let instance = this.$axios.create()
      for (let i = 0; i < this.selected.length; i++) {
        let param = {
          groupId: this.group.id
        }
        switch (this.selected[0].role) {
          case 'admin':
            param.userId = this.selected[i].id
            instance.post('api/groups/revoke', param).then((response) => {
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
            instance.post('api/groups/remove', param).then((response) => {
              if (response.data && Array.isArray(response.data) && response.data.length > 0 && response.data[0].email) {
                this.getMember()
              }
            })
        }
      }
    },
    nominateSelected () {
      let instance = this.$axios.create()
      for (let i = 0; i < this.selected.length; i++) {
        if (this.selected[0].role === 'member' && this.selected[0].relation === 'MEMBER_OF') {
          let param = {
            groupId: this.group.id,
            userId: this.selected[i].id
          }
          instance.post('api/groups/nominate', param).then((response) => {
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

      let instance = this.$axios.create()
      let param = {
        id: this.dialog.invite.data.id,
        email: this.dialog.invite.data.email,
        role: this.dialog.invite.data.role
      }
      instance.post('api/groups/invite', param).then((response) => {
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
      let rules = []
      /* eslint no-useless-escape: "off" */
      let email = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
      let message = this.$t('Message.validation.email')
      rules.push(v => email.test(v) || message)
      return rules
    },
    confirmDialog (row) {
      this.request = row
      this.confirm = true
    },
    acceptRequest () {
      let instance = this.$axios.create()
      let param = {
        groupId: this.group.id,
        request: this.request.request
      }
      instance.post('api/groups/accept', param).then((response) => {
        if (response.data && Array.isArray(response.data) && response.data.length > 0 && response.data[0].userId) {
          this.getMember()
        }
      })
      this.confirm = false
    },
    declineRequest () {
      let instance = this.$axios.create()
      let param = {
        groupId: this.group.id,
        request: this.request.request
      }
      instance.post('api/groups/decline', param).then((response) => {
        if (response.data && Array.isArray(response.data) && response.data.length > 0 && response.data[0].userId) {
          this.getMember()
        }
      })
      this.confirm = false
    }
  }
}
</script>
