<template>
  <div>
    <!-- main navigation tabs -->
    <q-tabs v-model="tab" :class="$q.dark.isActive ? 'text-gray-2' : 'text-grey-10'" dense >
      <q-tab name="groups" icon="ion-at" :label="$t('Groups.tab.groups.title')"  transition-show="slide-right"/>
      <q-tab :disable="counter.invitedBy === 0" name="join" icon="ion-log-in" :label="$t('Groups.tab.join.title')">
        <q-badge v-if="counter.invitedBy > 0" color="red" floating>{{ counter.invitedBy }}</q-badge>
      </q-tab>
      <q-tab :disable="selectedGroups.length != 1" name="members" icon="ion-people" :label="$t('Groups.tab.members.title')">
        <q-badge v-if="counter.member > 0" color="blue" floating>{{ counter.member }}</q-badge>
      </q-tab>
    </q-tabs>

    <!-- panels -->
    <q-tab-panels v-model="tab">

      <!-- groups panel -->
      <q-tab-panel name="groups" v-if="tab === 'groups'" >
        <q-table
          :columns="columnsGroups"
          :data="dataGroups"
          flat
          dense
          selection="multiple"
          row-key="id"
          :filter="filter.groups"
          :visible-columns="visibleColumns.groups"
          :pagination.sync="pagination.groups"
          :selected.sync="selectedGroups"
        >
          <template v-slot:body-cell-name="props">
            <q-td dense :props="props">
              <q-chip
                clickable
                dense
                @click="editGroup(props.row.id)"
                :color="props.row.role === 'admin' ? 'primary' : 'secondary' "
                text-color="white"
              ><q-tooltip>{{ $t('Action.edit') }}</q-tooltip>
                {{ props.row.alias ? props.row.alias : props.row.name }}</q-chip>
              <q-chip
                clickable
                v-if="props.row.request === 'revoke'"
                dense
                color="red"
                text-color="white"
                @click="confirmDialog(props.row)"
              >{{ $t('Groups.table.chip.revoke') }}: {{ new Date(props.row.tte).toLocaleDateString() }}</q-chip>
              <q-chip
                clickable
                v-if="props.row.request === 'nominate'"
                dense
                color="blue"
                text-color="white"
                @click="confirmDialog(props.row)"
              >{{ $t('Groups.table.chip.nominated') }}</q-chip>
            </q-td>
          </template>
          <template v-slot:top-left>
            <q-toolbar>
              <q-input dense debounce="300" v-model="filter.groups" :placeholder="$t('Base.search.placeholder')">
                <template v-slot:after v-if="filter.groups !== ''" >
                  <q-icon name="close" @click="filter.groups = ''" class="cursor-pointer" />
                </template>
                <template v-slot:append>
                  <q-icon name="search" />
                </template>
              </q-input>
            </q-toolbar>
          </template>
          <template v-slot:top-right>
            <q-btn round no-caps size="sm" color="primary" icon="ion-refresh" @click="refreshGroups()" >
              <q-tooltip>{{ $t('Action.refresh') }}</q-tooltip>
            </q-btn>
            <q-btn round no-caps size="sm" color="primary" icon="ion-add" @click="addGroup()">
              <q-tooltip>{{ $t('Action.add') }}</q-tooltip>
            </q-btn>
            <q-btn round no-caps size="sm" color="primary" icon="ion-log-out" @click="leaveGroups()" :disable="selectedGroups.length < 1" >
              <q-tooltip>{{ $t('Action.leave') }}</q-tooltip>
            </q-btn>
            <q-btn round size="sm" color="primary" icon="ion-settings">
              <q-tooltip>{{ $t('Action.settings') }}</q-tooltip>
              <q-menu :offset="[0, 20]">
                <q-list>
                  <q-item dense clickable v-for='(column) in columnsGroups' v-bind:key='column.name' @click="setVisibleColumns(column,visibleColumns.groups)" >
                    <q-item-section>
                      <q-item-label
                        :class="visibleColumns.groups.indexOf(column.name) >= 0 ? 'text-primary' : ''"
                      >{{ $t('Groups.table.column.' + column.name) }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </template>
        </q-table>
      </q-tab-panel>

      <!-- join panel -->
      <q-tab-panel name="join" v-if="tab === 'join'" >
        <q-table
          :columns="columnsGroups"
          :data="dataInvitedBy"
          flat
          selection="multiple"
          row-key="id"
          :filter="filter.join"
          :visible-columns="visibleColumns.join"
          dense
          :selected.sync="selectedGroups"
        >
          <template v-slot:body-cell-name="props">
            <q-td :props="props">
              <q-chip
                dense
                :color="props.row.role === 'admin' ? 'primary' : 'secondary' "
                text-color="white"
              >{{ props.row.name }}</q-chip>
              <q-chip
                v-if="props.row.ttl"
                dense
                color="red-11"
                text-color="white"
              >{{ $t('Groups.table.chip.delete') }}: {{ new Date(props.row.ttl).toLocaleDateString() }}</q-chip>
              <q-chip dense removable v-model="props.row.hide" icon="ion-eye-off" v-if="props.row.hide" @remove="unhide(props.row.id)">
              </q-chip>
            </q-td>
          </template>
          <template v-slot:top-left>
            <q-toolbar>
              <q-input dense debounce="300" v-model="filter.join" :placeholder="$t('Base.search.placeholder')">
                <template v-slot:after v-if="filter.join !== ''" >
                  <q-icon name="close" @click="filter.join = ''" class="cursor-pointer" />
                </template>
                <template v-slot:append >
                  <q-icon name="search" />
                </template>
              </q-input>
            </q-toolbar>
          </template>
          <template v-slot:top-right>
            <q-btn round size="sm" color="primary" icon="ion-refresh" @click="refreshGroups()">
              <q-tooltip>{{ $t('Action.refresh') }}</q-tooltip>
            </q-btn>
            <q-btn round size="sm" color="primary" icon="ion-log-in" @click="joinGroups()" :disable="selectedGroups.length < 1" >
              <q-tooltip>{{ $t('Action.join') }}</q-tooltip>
            </q-btn>
            <q-btn round size="sm" color="primary" icon="ion-thumbs-down" :disable="selectedGroups.length < 1" @click="refuseInvitations()">
              <q-tooltip>{{ $t('Action.refuse') }}</q-tooltip>
            </q-btn>
            <q-btn round size="sm" color="primary" icon="ion-eye-off" :disable="selectedGroups.length < 1" @click="hideInvitations()">
              <q-tooltip>{{ $t('Action.hide') }}</q-tooltip>
            </q-btn>
            <q-btn round size="sm" color="primary" icon="ion-settings">
              <q-tooltip>{{ $t('Action.settings') }}</q-tooltip>
              <q-menu :offset="[0, 20]">
                <q-list>
                  <q-item dense clickable v-for='(column) in columnsGroups' v-bind:key='column.name' @click="setVisibleColumns(column,visibleColumns.join)" >
                    <q-item-section>
                      <q-item-label
                        :class="visibleColumns.join.indexOf(column.name) >= 0 ? 'text-primary' : ''"
                      >{{ $t('Groups.table.column.' + column.name) }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </template>
        </q-table>
      </q-tab-panel>

      <!-- members panel -->
      <q-tab-panel name="members" v-show="tab === 'members'" >
        <member-table :group="selectedSingle" :isAdmin="isAdmin" @refreshed="memberRefreshed"></member-table>
      </q-tab-panel>

    </q-tab-panels>

    <!-- request confirm dialog -->
    <q-dialog v-model="confirm" v-if="request.request">
      <q-card>
        <q-card-section>
          <div class="text-h6">{{ $t('Groups.dialog.request.title') }}</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          {{ $t('Groups.dialog.request.' + request.request) }}
        </q-card-section>
        <q-card-actions align="right">
          <q-btn :label="$t('Action.accept')" text-color="green" dense flat @click="acceptRequest()"/>
          <q-btn :label="$t('Action.decline')" text-color="red" dense flat @click="declineRequest()"/>
          <q-btn :label="$t('Action.cancel')" dense flat @click="()=>{ this.confirm = false }" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- edit group dialog -->
    <q-dialog v-model="edit" >
      <q-card>
        <q-card-section>
          <q-chip :label="editGroupData.id"/>
          <div class="q-pa-md">
            <div class="q-gutter-y-md column">
              <q-input dense stack-label :autofocus="editGroupData.role === 'admin'" :disable="editGroupData.role !== 'admin'" label="Global name" v-model="editGroupData.name" @keyup.enter="saveChanges()" />
              <q-input dense stack-label :autofocus="editGroupData.role !== 'admin'" label="Alias" v-model="editGroupData.alias" @keyup.enter="saveChanges()" />
              <q-input dense stack-label disable label="Role" v-model="editGroupData.roleName" />
            </div>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn :label="$t('Action.save')" color="primary" dense type="submit" @click="saveChanges()" />
          <q-btn :label="$t('Action.cancel')" dense @click="()=>{ this.edit = false }" />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </div>
</template>

<script>
import MemberTable from '../components/groups/MemberTable.vue'

export default {
  name: 'Groups',
  components: {
    MemberTable
  },
  data () {
    return {
      tab: 'groups',
      counter: {
        member: 0,
        invitedBy: 0,
        invitations: 0
      },
      dataGroups: [],
      dataInvitedBy: [],
      dataMember: [],
      filter: {
        groups: '',
        member: '',
        join: ''
      },
      visibleColumns: {
        groups: [ 'name' ],
        join: [ 'name' ],
        member: [ 'email' ]
      },
      pagination: {
        groups: {
          rowsPerPage: 10
        }
      },
      selectedGroups: [],
      selectedSingle: {},
      selectedMember: [],
      isAdmin: false,
      edit: false,
      editGroupData: {},
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
    columnsGroups: function () {
      return [
        { name: 'name', field: 'name', label: this.$t('Groups.table.column.name'), sortable: true, align: 'left' },
        { name: 'role', field: 'roleName', label: this.$t('Groups.table.column.role'), sortable: true, align: 'left' },
        { name: 'relation', field: 'relation', label: this.$t('Groups.table.column.relation'), align: 'left' },
        { name: 'id', field: 'id', label: this.$t('Groups.table.column.id'), sortable: true, align: 'left' },
        { name: 'request', field: 'request', label: this.$t('Groups.table.column.request'), sortable: true, align: 'left' }
      ]
    }
  },
  watch: {
    selectedGroups: function (newSelection) {
      if (newSelection.length !== 1) {
        this.selectedSingle = {}
        this.counter.member = 0
        this.isAdmin = false
        return
      }
      this.selectedSingle = newSelection[0]
      // set flag admin
      newSelection[0].role === 'admin' && newSelection[0].relation === 'MEMBER_OF' ? this.isAdmin = true : this.isAdmin = false
    },
    tab: function (newTab, oldTab) {
      // check, if at least one of the selected groups is in the tab data, otherwise unselect all
      if ((newTab === 'join' || newTab === 'groups') && this.selectedGroups.length > 0) {
        let found = false
        let groups = newTab === 'join' ? this.dataInvitedBy : this.dataGroups
        for (let i = 0; i < groups.length; i++) {
          if (this.selectedGroups.indexOf(groups[i]) >= 0) found = true
        }
        if (!found) this.selectedGroups = []
      }
    }
  },
  created () {
    // get groups
    this.refreshGroups()
  },
  methods: {
    refreshGroups () {
      let instance = this.$axios.create()
      instance.get('api/groups/list').then((response) => {
        if (response.data) {
          let groups = []
          let invitedBy = []
          if (Array.isArray(response.data)) {
            for (let i = 0; i < response.data.length; i++) {
              let group = response.data[i]
              group.relation === 'INVITED_BY' ? invitedBy.push(group) : groups.push(group)
            }
          }
          this.dataGroups = groups
          this.dataInvitedBy = invitedBy
          this.counter.invitedBy = invitedBy.length
          this.translateData()
        }
      }).catch((err) => {
        console.log(err)
      })
    },
    memberRefreshed ({ count }) {
      this.counter.member = count
    },
    translateData () {
      for (let i = 0; i < this.dataGroups.length; i++) {
        this.dataGroups[i].roleName = this.$t('Groups.roles.' + this.dataGroups[i].role)
      }
      for (let i = 0; i < this.dataInvitedBy.length; i++) {
        this.dataInvitedBy[i].roleName = this.$t('Groups.roles.' + this.dataInvitedBy[i].role)
      }
    },
    addGroup () {
      let param = {
        name: 'new Group'
      }
      let instance = this.$axios.create()
      instance.post('api/groups/add', param).then((response) => {
        if (response.data && Array.isArray(response.data) && response.data[0].id) {
          let group = response.data[0]
          this.dataGroups.push(group)
          this.translateData()
          this.editGroup(group.id)
        }
      })
    },
    leaveGroups () {
      let instance = this.$axios.create()
      for (let i = 0; i < this.selectedGroups.length; i++) {
        let param = {
          id: this.selectedGroups[i].id
        }
        instance.post('api/groups/leave', param).then((response) => {
          if (response.data && Array.isArray(response.data) && response.data[0].id) {
            this.refreshGroups()
          }
        })
      }
    },
    joinGroups () {
      let instance = this.$axios.create()
      for (let i = 0; i < this.selectedGroups.length; i++) {
        let param = {
          id: this.selectedGroups[i].id
        }
        instance.post('api/groups/join', param).then((response) => {
          if (response.data && Array.isArray(response.data) && response.data[0].id) {
            this.refreshGroups()
          }
        })
      }
    },
    refuseInvitations () {
      let instance = this.$axios.create()
      for (let i = 0; i < this.selectedGroups.length; i++) {
        let param = {
          id: this.selectedGroups[i].id
        }
        instance.post('api/groups/refuse', param).then((response) => {
          if (response.data && Array.isArray(response.data) && response.data[0].id) {
            this.refreshGroups()
          }
        })
      }
    },
    hideInvitations (unhide) {
      let instance = this.$axios.create()
      for (let i = 0; i < this.selectedGroups.length; i++) {
        let param = {
          id: this.selectedGroups[i].id,
          unhide: unhide
        }
        instance.post('api/groups/hide', param).then((response) => {
          if (response.data && Array.isArray(response.data) && response.data[0].id) {
            this.refreshGroups()
          }
        })
      }
    },
    unhide (id) {
      let instance = this.$axios.create()
      let param = {
        id: id,
        unhide: true
      }
      instance.post('api/groups/hide', param).then((response) => {
        if (response.data && Array.isArray(response.data) && response.data[0].id) {
          this.refreshGroups()
        }
      })
    },
    editGroup (id) {
      this.editGroupData = Object.assign({}, this.dataGroups.find((group) => { return group.id === id }))
      this.edit = true
    },
    saveChanges () {
      let instance = this.$axios.create()
      // determine changes
      let newGroupData = this.editGroupData
      let groupData = this.dataGroups.find((group) => { return group.id === newGroupData.id })
      if (newGroupData.name !== groupData.name) {
        let param = {
          id: groupData.id,
          name: newGroupData.name
        }
        instance.post('api/groups/rename', param).then((response) => {
          if (response.data && Array.isArray(response.data) && response.data[0].id) {
            groupData.name = response.data[0].name
          }
        })
      }
      if (newGroupData.alias !== groupData.alias) {
        let param = {
          id: groupData.id,
          alias: newGroupData.alias
        }
        instance.post('api/groups/alias', param).then((response) => {
          if (response.data && Array.isArray(response.data) && response.data[0].id) {
            groupData.alias = response.data[0].alias
          }
        })
      }
      this.edit = false
      this.editGroupData = {}
    },
    setVisibleColumns (column, visible) {
      visible.indexOf(column.name) >= 0 ? visible.splice(visible.indexOf(column.name), 1) : visible.push(column.name)
    },
    confirmDialog (row) {
      this.request = row
      this.confirm = true
    },
    acceptRequest () {
      let instance = this.$axios.create()
      let param = {
        groupId: this.request.id,
        request: this.request.request
      }
      instance.post('api/groups/accept', param).then((response) => {
        if (response.data && Array.isArray(response.data) && response.data.length > 0 && response.data[0].userId) {
          this.refreshGroups()
        }
      })
      this.confirm = false
    },
    declineRequest () {
      let instance = this.$axios.create()
      let param = {
        groupId: this.request.id,
        request: this.request.request
      }
      instance.post('api/groups/decline', param).then((response) => {
        if (response.data && Array.isArray(response.data) && response.data.length > 0 && response.data[0].userId) {
          this.refreshGroups()
        }
      })
      this.confirm = false
    }
  }
}
</script>
