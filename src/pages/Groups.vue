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
              >{{ props.row.alias ? props.row.alias : props.row.name }}</q-chip>
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
            <q-toolbar>
              <q-btn-group>
                <q-btn no-caps color="primary" :label="$t('Action.refresh')"  icon="ion-refresh" @click="refreshGroups()" />
                <q-btn no-caps color="primary" :label="$t('Action.add')" icon="ion-add" @click="addGroup()" />
                <q-btn no-caps color="primary" :label="$t('Action.leave')" icon="ion-log-out" @click="leaveGroups()" :disable="selectedGroups.length < 1" />
                <q-btn color="primary" icon="ion-settings">
                  <q-menu>
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
              </q-btn-group>
            </q-toolbar>
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
            <q-toolbar>
              <q-btn-group>
                <q-btn no-caps color="primary" :label="$t('Action.refresh')" icon="ion-refresh" />
                <q-btn no-caps color="primary" :label="$t('Action.join')" icon="ion-log-in" @click="joinGroups()" :disable="selectedGroups.length < 1" />
                <q-btn no-caps color="primary" label="Refuse" icon="ion-thumbs-down" :disable="selectedGroups.length < 1" />
                <q-btn no-caps color="primary" label="Hide" icon="ion-eye-off" :disable="selectedGroups.length < 1" />
                <q-btn color="primary" icon="ion-settings">
                  <q-menu>
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
              </q-btn-group>
            </q-toolbar>
          </template>
        </q-table>
      </q-tab-panel>

      <!-- members panel -->
      <q-tab-panel name="members" v-if="tab === 'members'" >
        <q-table
          :columns="columnsMember"
          :data="dataMember"
          flat
          selection="multiple"
          row-key="email"
          :filter="filter.member"
          :visible-columns="visibleColumns.member"
          dense
          :selected.sync="selectedMember"
        >
          <template v-slot:body-cell-email="props">
            <q-td dense :props="props">
              <q-chip dense v-if="props.row.role === 'admin' && props.row.relation !== 'INVITED_BY'" color="primary" text-color="white">{{ props.row.email }}</q-chip>
              <q-chip dense v-if="props.row.role === 'admin' && props.row.relation === 'INVITED_BY'" color="blue-4" text-color="white">{{ props.row.email }}</q-chip>
              <q-chip dense v-if="props.row.role === 'member' && props.row.relation !== 'INVITED_BY'" color="secondary" text-color="white">{{ props.row.email }}</q-chip>
              <q-chip dense v-if="props.row.role === 'member' && props.row.relation === 'INVITED_BY'" >{{ props.row.email }}</q-chip>
              <q-chip v-if="props.row.relation === 'INVITED_BY'" dense color="orange-3" text-color="white" >{{ $t('Members.table.chip.invited') }}</q-chip>
            </q-td>
          </template>
          <template v-slot:top-left>
            <q-toolbar>
              <q-input dense debounce="300" v-model="filter.member" :placeholder="$t('Base.search.placeholder')">
                <template v-slot:append>
                  <q-icon name="search" />
                </template>
              </q-input>
              <q-separator inset/>
              <q-chip icon="ion-at">{{ selectedGroups[0].alias ? selectedGroups[0].alias : selectedGroups[0].name }}</q-chip>
            </q-toolbar>
          </template>
          <template v-slot:top-right>
            <q-toolbar>
              <q-btn-group>
                <q-btn no-caps color="primary" :label="$t('Action.refresh')" icon="ion-refresh" @click="getMember(selectedGroups[0].id)" />
                <q-btn no-caps color="primary" :label="$t('Action.add')" icon="ion-person-add" v-if="isAdmin === true" @click="addInvitation()" />
                <q-btn no-caps color="primary" :label="$t('Action.member.remove')" icon="ion-trash" v-if="isAdmin === true" :disable="selectedMember.length < 1" />
                <q-btn color="primary" icon="ion-settings">
                  <q-menu>
                    <q-list>
                      <q-item dense clickable v-for='(column) in columnsMember' v-bind:key='column.name' @click="setVisibleColumns(column,visibleColumns.member)" >
                        <q-item-section>
                          <q-item-label
                            :class="visibleColumns.member.indexOf(column.name) >= 0 ? 'text-primary' : ''"
                          >{{ $t('Members.table.column.' + column.name) }}</q-item-label>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-menu>
                </q-btn>
              </q-btn-group>
            </q-toolbar>
          </template>
        </q-table>
      </q-tab-panel>

    </q-tab-panels>

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

    <!-- invite member dialog -->
    <q-dialog v-model="dialog.invite.show" v-if="selectedGroups.length === 1" >
      <q-card>
        <q-card-section>
          <q-chip icon="ion-at" :label="selectedGroups[0].alias ? selectedGroups[0].alias : selectedGroups[0].name" />
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
  </div>
</template>

<script>
export default {
  name: 'Groups',
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
      selectedMember: [],
      isAdmin: false,
      edit: false,
      editGroupData: {},
      invite: false,
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
        { name: 'id', field: 'id', label: this.$t('Groups.table.column.id'), sortable: true, align: 'left' }
      ]
    },
    columnsMember: function () {
      return [
        { name: 'email', field: 'email', label: this.$t('Members.table.column.email'), sortable: true, align: 'left' },
        { name: 'role', field: 'roleName', label: this.$t('Members.table.column.role'), sortable: true, align: 'left' },
        { name: 'relation', field: 'relation', label: this.$t('Groups.table.column.relation'), align: 'left' },
        { name: 'id', field: 'id', label: this.$t('Members.table.column.id'), sortable: true, align: 'left' }
      ]
    }
  },
  watch: {
    selectedGroups: function (newSelection) {
      if (newSelection.length !== 1) {
        this.dataMember = []
        this.counter.member = this.dataMember.length
        this.isAdmin = false
        return
      }
      // get member
      this.getMember(newSelection[0].id)
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
    getMember (id) {
      let param = {
        id: id
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
            this.dataMember = members
            this.counter.member = members.length
            this.translateData()
          }
        }
      })
    },
    translateData () {
      for (let i = 0; i < this.dataGroups.length; i++) {
        this.dataGroups[i].roleName = this.$t('Groups.roles.' + this.dataGroups[i].role)
      }
      for (let i = 0; i < this.dataInvitedBy.length; i++) {
        this.dataInvitedBy[i].roleName = this.$t('Groups.roles.' + this.dataInvitedBy[i].role)
      }
      for (let i = 0; i < this.dataMember.length; i++) {
        this.dataMember[i].roleName = this.$t('Groups.roles.' + this.dataMember[i].role)
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
    addInvitation () {
      this.dialog.invite.data.id = this.selectedGroups[0].id
      this.dialog.invite.show = true
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
        if (response.data && Array.isArray(response.data) && response.data[0].invited) {
          this.getMember(this.selectedGroups[0].id)
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
    }
  }
}
</script>
