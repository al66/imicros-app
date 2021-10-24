<template>
  <div>
    <!-- main navigation tabs -->
    <q-tabs
      v-model="tab"
      :class="$q.dark.isActive ? 'text-gray-2' : 'text-grey-10'"
      dense
    >
      <!-- <q-tab name="groups" icon="ion-at" :label="$t('Groups.tab.groups.title')"  transition-show="slide-right"> -->
      <q-tab
        name="groups"
        icon="ion-at"
        transition-show="slide-right"
      >
        <q-tooltip>{{ $t('Groups.tab.groups.title') }}</q-tooltip>
        <q-badge
          v-if="counter.invitedBy > 0"
          color="orange"
          floating
        >
          {{ counter.invitedBy }}
        </q-badge>
      </q-tab>
      <!-- <q-tab :disable="selectedGroups.length != 1" name="members" icon="ion-people" :label="$t('Groups.tab.members.title')"> -->
      <q-tab
        :disable="selectedGroups.length != 1"
        name="members"
        icon="ion-people"
      >
        <q-tooltip>{{ $t('Groups.tab.members.title') }}</q-tooltip>
        <q-badge
          v-if="counter.member > 0"
          color="blue"
          floating
        >
          {{ counter.member }}
        </q-badge>
      </q-tab>
    </q-tabs>

    <!-- panels -->
    <q-tab-panels v-model="tab">
      <!-- groups panel -->
      <q-tab-panel name="groups">
        <q-table
          :columns="columnsGroups"
          :rows="dataGroups"
          flat
          dense
          selection="multiple"
          row-key="id"
          :filter="filter.groups"
          :visible-columns="visibleColumns.groups"
          v-model:pagination="pagination.groups"
          v-model:selected="selectedGroups"
          @row-click="toMembers"
        >
          <template #body-cell-name="props">
            <q-td
              dense
              :props="props"
            >
              <q-chip
                clickable
                @click="editGroup(props.row.id)"
                dense
                :color="props.row.role === 'admin' ? 'primary' : 'secondary' "
                text-color="white"
              >
                <q-tooltip>{{ $t('Action.edit') }}</q-tooltip>
                {{ props.row.alias ? props.row.alias : props.row.name }}
              </q-chip>
              <q-chip
                clickable
                v-if="props.row.request === 'revoke'"
                dense
                color="red"
                text-color="white"
                @click="confirmDialog(props.row)"
              >
                {{ $t('Groups.table.chip.revoke') }}: {{ new Date(props.row.tte).toLocaleDateString() }}
              </q-chip>
              <q-chip
                clickable
                v-if="props.row.request === 'nominate'"
                dense
                color="blue"
                text-color="white"
                @click="confirmDialog(props.row)"
              >
                {{ $t('Groups.table.chip.nominated') }}
              </q-chip>
              <q-chip
                v-if="props.row.ttl"
                dense
                outline
                color="red"
                text-color="white"
              >
                {{ $t('Groups.table.chip.delete') }}: {{ new Date(props.row.ttl).toLocaleDateString() }}
              </q-chip>
              <q-chip
                v-if="props.row.relation === 'INVITED_BY'"
                dense
                color="orange"
                text-color="white"
                clickable
                @click="confirmInvitation(props.row)"
              >
                {{ $t('Members.table.chip.invited') }}
              </q-chip>
              <q-chip
                dense
                removable
                v-model="props.row.hide"
                icon="ion-eye-off"
                v-if="props.row.hide"
                @remove="unhide(props.row.id)"
              />
            </q-td>
          </template>
          <template #top-left>
            <q-toolbar>
              <q-input
                dense
                debounce="300"
                v-model="filter.groups"
                :placeholder="$t('Base.search.placeholder')"
              >
                <template
                  #after
                  v-if="filter.groups !== ''"
                >
                  <q-icon
                    name="close"
                    @click="filter.groups = ''"
                    class="cursor-pointer"
                  />
                </template>
                <template #append>
                  <q-icon name="search" />
                </template>
              </q-input>
            </q-toolbar>
          </template>
          <template #top-right>
            <q-toolbar>
              <toolbar-btn
                icon="ion-refresh"
                @click="refreshGroups()"
              >
                <q-tooltip>{{ $t('Action.refresh') }}</q-tooltip>
              </toolbar-btn>
              <toolbar-btn
                icon="ion-add"
                @click="addGroup()"
              >
                <q-tooltip>{{ $t('Action.add') }}</q-tooltip>
              </toolbar-btn>
              <toolbar-btn
                icon="ion-log-out"
                @click="leaveGroups()"
                :disable="selectedGroups.length < 1"
              >
                <q-tooltip>{{ $t('Action.leave') }}</q-tooltip>
              </toolbar-btn>
              <toolbar-btn
                icon="ion-eye-off"
                v-if="selectedGroups.length > 0"
                @click="hideSelected()"
              >
                <q-tooltip>{{ $t('Action.hide') }}</q-tooltip>
              </toolbar-btn>
              <toolbar-btn
                :icon="showHidden ? 'ion-eye-off' : 'ion-eye'"
                v-if="selectedGroups.length < 1"
                @click="toggleHidden()"
              >
                <q-tooltip>{{ showHidden ? $t('Action.hide') : $t('Action.showHidden') }}</q-tooltip>
              </toolbar-btn>
              <toolbar-btn
                icon="ion-settings"
              >
                <q-tooltip>{{ $t('Action.settings') }}</q-tooltip>
                <q-menu :offset="[0, 20]">
                  <q-list>
                    <q-item
                      dense
                      clickable
                      v-for="(column) in columnsGroups"
                      :key="column.name"
                      @click="setVisibleColumns(column,visibleColumns.groups)"
                    >
                      <q-item-section>
                        <q-item-label
                          :class="visibleColumns.groups.indexOf(column.name) >= 0 ? 'text-primary' : ''"
                        >
                          {{ $t('Groups.table.column.' + column.name) }}
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </toolbar-btn>
            </q-toolbar>
          </template>
        </q-table>
      </q-tab-panel>

      <!-- members panel -->
      <q-tab-panel name="members">
        <member-table
          :group="selectedSingle"
          :is-admin="isAdmin"
          @refreshed="memberRefreshed"
          @back="tab = 'groups'"
        />
      </q-tab-panel>
    </q-tab-panels>

    <!-- request confirm dialog -->
    <confirm-request-dialog
      :show="dialog.confirm.show"
      :group="dialog.confirm.group"
      :request="dialog.confirm.request"
      @accept="refreshGroups"
      @decline="refreshGroups"
      @close="()=>{ this.dialog.confirm.show = false }"
    />

    <!-- invitation confirm dialog -->
    <q-dialog
      v-model="invitation.confirm"
      v-if="invitation.group"
    >
      <q-card>
        <q-card-section
          align="center"
          class="bg-black text-white q-pa-sm q-mb-lg"
        >
          <div class="text-h6">
            {{ $t('Members.table.chip.invited') }}
          </div>
        </q-card-section>
        <q-card-section align="center">
          <q-chip
            icon="ion-at"
            :color="invitation.group.role === 'admin' ? 'primary' : 'secondary' "
            text-color="white"
            :label="invitation.group.alias ? invitation.group.alias : invitation.group.name"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            dense
            flat
            :label="$t('Action.join')"
            icon="ion-thumbs-up"
            text-color="primary"
            @click="joinGroup(invitation.group.id)"
          />
          <q-btn
            dense
            flat
            :label="$t('Action.refuse')"
            icon="ion-thumbs-down"
            text-color="red"
            @click="refuseInvitation(invitation.group.id)"
          />
          <q-btn
            dense
            flat
            icon="ion-close-circle"
            color="grey"
            @click="()=>{ this.invitation.confirm = false }"
          >
            <q-tooltip>{{ $t('Action.cancel') }}</q-tooltip>
          </q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- edit group dialog -->
    <q-dialog v-model="edit">
      <q-card>
        <q-card-section
          align="center"
          class="bg-black text-white q-pa-sm q-mb-sm"
        >
          <div class="text-h6">
            {{ $t('Action.edit') }}
          </div>
        </q-card-section>
        <q-card-section>
          <q-chip :label="editGroupData.id" />
          <div class="q-pa-md">
            <div class="q-gutter-y-md column">
              <q-input
                dense
                stack-label
                :autofocus="editGroupData.role === 'admin'"
                :disable="editGroupData.role !== 'admin'"
                label="Global name"
                v-model="editGroupData.name"
                @keyup.enter="saveChanges()"
              />
              <q-input
                dense
                stack-label
                :autofocus="editGroupData.role !== 'admin'"
                label="Alias"
                v-model="editGroupData.alias"
                @keyup.enter="saveChanges()"
              />
              <q-input
                dense
                stack-label
                disable
                label="Role"
                v-model="editGroupData.roleName"
              />
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
            @click="saveChanges()"
          />
          <q-btn
            dense
            flat
            icon="ion-close-circle"
            color="grey"
            @click="()=>{ this.edit = false }"
          >
            <q-tooltip>{{ $t('Action.cancel') }}</q-tooltip>
          </q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
// components
import ToolbarBtn from '../components/global/ToolbarBtn.vue'
import MemberTable from '../components/groups/MemberTable.vue'
import ConfirmRequestDialog from '../components/groups/ConfirmRequestDialog.vue'

export default {
  name: 'Groups',
  components: {
    ToolbarBtn,
    MemberTable,
    ConfirmRequestDialog
  },
  setup () {
    const $store = useStore()

    const settings = computed({
      get: () => $store.getters.settings('groups'),
      set: val => {
        $store.commit('setSettings', val)
      }
    })

    return {
      settings,
      dataGroups: ref([]),
      tab: ref('groups')
    }
  },
  data () {
    return {
      counter: {
        member: 0,
        invitedBy: 0,
        invitations: 0
      },
      dataGroupsAll: [],
      dataGroupsVisible: [],
      dataMember: [],
      filter: {
        groups: '',
        member: ''
      },
      visibleColumns: {
        groups: ['name'],
        member: ['email']
      },
      pagination: {
        groups: {
          rowsPerPage: 10
        }
      },
      selectedGroups: [],
      selectedSingle: {},
      selectedMember: [],
      testTableSelected: false,
      showHidden: false,
      isAdmin: false,
      edit: false,
      editGroupData: {},
      invite: false,
      invitation: {
        confirm: false,
        group: null
      },
      dialog: {
        confirm: {
          show: false,
          group: {},
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
    columnsGroups: function () {
      return [
        { name: 'name', field: 'name', label: this.$t('Groups.table.column.name'), sortable: true, align: 'left' },
        { name: 'role', field: 'roleName', label: this.$t('Groups.table.column.role'), sortable: true, align: 'left' },
        { name: 'relation', field: 'relation', label: this.$t('Groups.table.column.relation'), sortable: true, align: 'left' },
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
      if ((newTab === 'groups') && this.selectedGroups.length > 0) {
        let found = false
        for (let i = 0; i < this.dataGroups.length; i++) {
          if (this.selectedGroups.indexOf(this.dataGroups[i]) >= 0) found = true
        }
        if (!found) this.selectedGroups = []
      }
    }
  },
  async created () {
    // const { visibleColumns, pagination } = this.settings
    // console.log({ visibleColumns, pagination })
    // console.log(this.settings)
    // if (visibleColumns) this.visibleColumns = visibleColumns.value
    // if (pagination) this.visibleColumns = pagination.value
    // get groups
    this.refreshGroups()
  },
  mounted () {
    // restore settings - component member
    // const { visibleColumns, pagination } = this.settings
    // if (visibleColumns) this.visibleColumns = visibleColumns
    // if (pagination) this.visibleColumns = pagination
  },
  beforeUnmount () {
    // store settings - component member
    this.settings = {
      groups: {
        visibleColumns: this.visibleColumns,
        pagination: this.pagination
      }
    }
  },
  methods: {
    refreshGroups () {
      const instance = this.$instance()
      instance.get('/#groups/list').then((response) => {
        if (response.data) {
          const groups = []
          this.counter.invitedBy = 0
          if (Array.isArray(response.data)) {
            for (let i = 0; i < response.data.length; i++) {
              const group = response.data[i]
              groups.push(group)
            }
          }
          this.dataGroupsAll = groups
          this.translateData()
          this.dataGroupsVisible = []
          for (let i = 0; i < this.dataGroupsAll.length; i++) {
            if (!this.dataGroupsAll[i].hide) this.dataGroupsVisible.push(this.dataGroupsAll[i])
          }
          this.showHidden ? this.dataGroups = this.dataGroupsAll : this.dataGroups = this.dataGroupsVisible
          this.countInvitations(this.dataGroups)
        }
      }).catch((err) => {
        console.log(err)
      })
    },
    countInvitations (groups) {
      this.counter.invitedBy = 0
      for (let i = 0; i < groups.length; i++) {
        if (groups[i].relation === 'INVITED_BY') this.counter.invitedBy++
      }
    },
    memberRefreshed ({ count }) {
      this.counter.member = count
    },
    translateData () {
      for (let i = 0; i < this.dataGroupsAll.length; i++) {
        if (this.dataGroupsAll[i].role) this.dataGroupsAll[i].roleName = this.$t('Groups.roles.' + this.dataGroupsAll[i].role)
      }
    },
    addGroup () {
      const param = {
        name: 'new Group'
      }
      const instance = this.$instance()
      instance.post('/#groups/add', param).then((response) => {
        if (response.data && Array.isArray(response.data) && response.data[0].id) {
          const group = response.data[0]
          this.dataGroups.push(group)
          this.translateData()
          this.editGroup(group.id)
        }
      })
    },
    leaveGroups () {
      const instance = this.$instance()
      for (let i = 0; i < this.selectedGroups.length; i++) {
        const param = {
          id: this.selectedGroups[i].id
        }
        instance.post('/#groups/leave', param).then((response) => {
          if (response.data && Array.isArray(response.data) && response.data[0].id) {
            this.refreshGroups()
          }
        })
      }
    },
    confirmInvitation (group) {
      this.invitation.group = group
      this.invitation.confirm = true
    },
    joinGroup (id) {
      const instance = this.$instance()
      const param = {
        id: id
      }
      instance.post('/#groups/join', param).then((response) => {
        if (response.data && Array.isArray(response.data) && response.data[0].id) {
          this.refreshGroups()
        }
      })
      this.invitation.group = null
      this.invitation.confirm = false
    },
    refuseInvitation (id) {
      const instance = this.$instance()
      const param = {
        id: id
      }
      instance.post('/#groups/refuse', param).then((response) => {
        if (response.data && Array.isArray(response.data) && response.data[0].id) {
          this.refreshGroups()
        }
      })
      this.invitation.group = null
      this.invitation.confirm = false
    },
    hideSelected (unhide) {
      const instance = this.$instance()
      for (let i = 0; i < this.selectedGroups.length; i++) {
        const param = {
          id: this.selectedGroups[i].id,
          unhide: unhide
        }
        instance.post('/#groups/hide', param).then((response) => {
          if (response.data && Array.isArray(response.data) && response.data[0].id) {
            this.refreshGroups()
          }
        })
      }
      this.selectedGroups = []
      this.showHidden = false
    },
    unhide (id) {
      const instance = this.$instance()
      const param = {
        id: id,
        unhide: true
      }
      instance.post('/#groups/hide', param).then((response) => {
        if (response.data && Array.isArray(response.data) && response.data[0].id) {
          this.refreshGroups()
        }
      })
    },
    editGroup (id) {
      this.editGroupData = Object.assign({}, this.dataGroups.find((group) => { return group.id === id }))
      this.edit = true
    },
    toMembers (evt, row, index) {
      if (row) {
        this.selectedSingle = row
        this.tab = 'members'
      }
    },
    saveChanges () {
      const instance = this.$instance()
      // determine changes
      const newGroupData = this.editGroupData
      const groupData = this.dataGroups.find((group) => { return group.id === newGroupData.id })
      if (newGroupData.name !== groupData.name) {
        const param = {
          id: groupData.id,
          name: newGroupData.name
        }
        instance.post('/#groups/rename', param).then((response) => {
          if (response.data && Array.isArray(response.data) && response.data[0].id) {
            groupData.name = response.data[0].name
          }
        })
      }
      if (newGroupData.alias !== groupData.alias) {
        const param = {
          id: groupData.id,
          alias: newGroupData.alias
        }
        instance.post('/#groups/alias', param).then((response) => {
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
    toggleHidden () {
      this.showHidden = !this.showHidden
      this.showHidden ? this.dataGroups = this.dataGroupsAll : this.dataGroups = this.dataGroupsVisible
      this.countInvitations(this.dataGroups)
    },
    confirmDialog (row) {
      this.dialog.confirm.group = row
      this.dialog.confirm.request = row
      this.dialog.confirm.show = true
    }
  }
}
</script>
