<template>
  <div>
    <!-- panels -->
    <q-tab-panels v-model="tab">
      <!-- process panel -->
      <q-tab-panel name="processes">
        <q-toolbar>
          <q-space />
          <toolbar-btn
            icon="ion-add"
            @click="()=>{ this.files.proccessId = null; this.files.select = !this.files.select }"
          >
            <q-tooltip>{{ $t('Action.add') }}</q-tooltip>
          </toolbar-btn>
          <toolbar-btn
            icon="ion-refresh"
            @click="refreshProcessList()"
          >
            <q-tooltip>{{ $t('Action.refresh') }}</q-tooltip>
          </toolbar-btn>
        </q-toolbar>
        <q-table
          :columns="columnsProcessTable"
          :visible-columns="processes.visibleColumns"
          :pagination.sync="processes.pagination"
          :data="processes.data"
          flat
          dense
          row-key="processId"
          selection="multiple"
          :selected.sync="processes.selected"
        >
          <template v-slot:body-cell-name="props">
            <q-td
              dense
              :props="props"
              @contextmenu.native="setContext(props.row)"
            >
              <div class="row justify-between">
                <q-chip
                  clickable
                  dense
                  :color="props.row.versionId ? 'primary' : 'grey' "
                  text-color="white"
                  @click="showInstances(props.row.processId)"
                >
                  {{ props.row.name }}
                </q-chip>
                <q-btn
                  flat
                  dense
                  size="xs"
                  icon="ion-more"
                  color="grey"
                  @click="setContext(props.row)"
                >
                  <q-menu>
                    <q-list
                      dense
                      style="min-width: 100px"
                    >
                      <q-item v-close-popup>
                        <q-item-section>{{ props.row.name }}</q-item-section>
                      </q-item>
                      <q-item
                        clickable
                        v-close-popup
                        v-if="props.row.versionId"
                        @click="showInstances(props.row.processId)"
                      >
                        <q-item-section>...instances</q-item-section>
                      </q-item>
                      <q-item
                        clickable
                        v-close-popup
                        @click="showVersions(props.row.processId)"
                      >
                        <q-item-section>...versions</q-item-section>
                      </q-item>
                      <q-item
                        clickable
                        v-close-popup
                        @click="newVersion(props.row.processId)"
                      >
                        <q-item-section>...new version</q-item-section>
                      </q-item>
                    </q-list>
                  </q-menu>
                </q-btn>
              </div>
            </q-td>
          </template>
        </q-table>
      </q-tab-panel>

      <!-- version panel -->
      <q-tab-panel name="versions">
        <q-toolbar>
          <q-chip
            dense
            v-if="versions.processId"
            color="primary"
            text-color="white"
            clickable
            @click="() => { this.tab = 'processes' }"
          >
            {{ versions.process.name }}
          </q-chip>
          <q-space />
          <toolbar-btn
            sub
            icon="ion-arrow-back"
            @click="() => { this.tab = 'processes' }"
          />
          <q-space />
          <toolbar-btn
            icon="ion-add"
            @click="newVersion(versions.processId)"
          >
            <q-tooltip>{{ $t('Action.add') }}</q-tooltip>
          </toolbar-btn>
          <toolbar-btn
            icon="ion-refresh"
            @click="refreshVersionList()"
          >
            <q-tooltip>{{ $t('Action.refresh') }}</q-tooltip>
          </toolbar-btn>
        </q-toolbar>
        <!-- -->
        <q-table
          :columns="columnsVersionTable"
          :visible-columns="versions.visibleColumns"
          :pagination.sync="versions.pagination"
          :data="versions.data"
          flat
          dense
          row-key="versionId"
          selection="multiple"
          :selected.sync="versions.selected"
        >
          <template v-slot:body-cell-versionId="props">
            <q-td
              dense
              :props="props"
              @contextmenu.native="setContext(props.row)"
            >
              <div class="row justify-between">
                <q-chip
                  dense
                  :color="props.row.versionId === versions.process.versionId ? 'orange' : 'grey' "
                  text-color="white"
                >
                  {{ props.row.versionId }}
                </q-chip>
                <q-btn
                  flat
                  dense
                  size="xs"
                  icon="ion-more"
                  color="grey"
                  @click="setContext(props.row)"
                >
                  <q-menu>
                    <q-list
                      dense
                      style="min-width: 100px"
                    >
                      <q-item v-close-popup>
                        <q-item-section>{{ props.row.versionId }}</q-item-section>
                      </q-item>
                      <q-item
                        v-if="versions.process.versionId !== props.row.versionId"
                        clickable
                        v-close-popup
                        @click="activateVersion(versions.process.processId, props.row.versionId)"
                      >
                        <q-item-section>...activate</q-item-section>
                      </q-item>
                      <q-item
                        v-if="versions.process.versionId === props.row.versionId"
                        clickable
                        v-close-popup
                        @click="deactivateVersion(versions.process.processId, props.row.versionId)"
                      >
                        <q-item-section>...deactivate</q-item-section>
                      </q-item>
                    </q-list>
                  </q-menu>
                </q-btn>
              </div>
            </q-td>
          </template>
        </q-table>
      </q-tab-panel>

      <!-- instance panel -->
      <q-tab-panel name="instances">
        <q-toolbar>
          <q-chip
            dense
            v-if="instances.processId"
            color="primary"
            text-color="white"
            clickable
            @click="() => { this.tab = 'processes' }"
          >
            {{ selectedProcess.name }}
          </q-chip>
          <q-space />
          <toolbar-btn
            sub
            icon="ion-arrow-back"
            @click="() => { this.tab = 'processes' }"
          />
          <q-space />
        </q-toolbar>
        <!-- -->
        <q-table
          :columns="columnsInstanceTable"
          :visible-columns="instances.visibleColumns"
          :pagination.sync="instances.pagination"
          :data="instances.data"
          flat
          dense
          row-key="instanceId"
          selection="multiple"
          :selected.sync="instances.selected"
        >
          <template v-slot:body-cell-instanceId="props">
            <q-td
              dense
              :props="props"
              @contextmenu.native="setContext(props.row)"
            >
              <div class="row justify-between">
                <q-chip
                  clickable
                  dense
                  :color="props.row.status === 'INSTANCE.RUNNING' ? 'orange' : 'grey' "
                  text-color="white"
                  @click="showContext(props.row.instanceId)"
                >
                  {{ props.row.instanceId }}
                </q-chip>
                <q-btn
                  flat
                  dense
                  size="xs"
                  icon="ion-more"
                  color="grey"
                  @click="setContext(props.row)"
                >
                  <q-menu>
                    <q-list
                      dense
                      style="min-width: 100px"
                    >
                      <q-item v-close-popup>
                        <q-item-section>{{ props.row.instanceId }}</q-item-section>
                      </q-item>
                      <q-item
                        clickable
                        v-close-popup
                        @click="showContext(props.row.instanceId)"
                      >
                        <q-item-section>...context</q-item-section>
                      </q-item>
                    </q-list>
                  </q-menu>
                </q-btn>
              </div>
            </q-td>
          </template>
        </q-table>
      </q-tab-panel>

      <!-- context panel -->
      <q-tab-panel name="context">
        <q-toolbar>
          <q-chip
            dense
            v-if="instances.processId"
            color="primary"
            text-color="white"
            clickable
            @click="() => { this.tab = 'processes' }"
          >
            {{ selectedProcess.name }}
          </q-chip>
          <q-chip
            dense
            v-if="context.instanceId"
            color="orange"
            text-color="white"
            clickable
            @click="() => { this.tab = 'instances' }"
          >
            {{ context.instanceId }}
          </q-chip>
          <q-space />
          <toolbar-btn
            sub
            icon="ion-arrow-back"
            @click="() => { this.tab = 'instances' }"
          />
          <q-space />
        </q-toolbar>
        <!-- -->
        <q-splitter
          v-model="context.splitter"
          :limits="[20, 60]"
        >
          <template v-slot:before>
            <q-table
              :columns="columnsContextTable"
              :visible-columns="context.visibleColumns"
              :pagination.sync="context.pagination"
              :data="context.data"
              flat
              dense
              row-key="key"
              @row-click="getKey"
            >
              <template v-slot:body-cell-key="props">
                <q-td
                  dense
                  :props="props"
                >
                  <div
                    class="row justify-between bg-primary text-white"
                    v-if="props.row.key === context.key"
                  >
                    {{ props.row.key }}
                  </div>
                  <!--
                  <div class="row justify-between" v-if="props.row.key === context.key">
                    <q-chip
                      dense
                      color="orange"
                      text-color="white"
                    >
                      {{ props.row.key }}
                    </q-chip>
                  </div>
                  -->
                  <div v-if="props.row.key !== context.key">
                    {{ props.row.key }}
                  </div>
                </q-td>
              </template>
            </q-table>
          </template>
          <template v-slot:separator>
            <q-avatar
              color="primary"
              text-color="white"
              size="30px"
              icon="drag_indicator"
            />
          </template>
          <template v-slot:after>
            <div class="row">
              <div class="col">
                <editor
                  v-model="context.value"
                  @init="(editor) => editorInit(editor,true)"
                  lang="json"
                  theme="monokai"
                  width="100%"
                />
              </div>
            </div>
          </template>
        </q-splitter>
      </q-tab-panel>
    </q-tab-panels>

    <!-- file select -->
    <file-select
      :refresh="files.refresh"
      :show="files.select"
      @close="()=>{ this.files.select = false }"
      @file="addProcess"
    />

    <!-- context menu -->
    <q-menu
      touch-position
      context-menu
      v-if="contextMenu.context"
      v-model="contextMenu.visible"
    >
      <q-list
        dense
        style="min-width: 100px"
      >
        <q-item v-close-popup>
          <q-item-section>{{ contextMenu.context.name }}</q-item-section>
        </q-item>
        <q-item
          clickable
          v-close-popup
          v-if="contextMenu.context.versionId"
          @click="showInstances(contextMenu.context.processId)"
        >
          <q-item-section>...instances</q-item-section>
        </q-item>
        <q-item
          clickable
          v-close-popup
        >
          <q-item-section>...versions</q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </div>
</template>

<script>
// vuex store
import { mapGetters } from 'vuex'
// components
import FileSelect from '../components/main/FileSelect.vue'
import ToolbarBtn from '../components/global/ToolbarBtn.vue'
// ace
import Editor from 'vue2-ace-editor'

export default {
  name: 'Processmonitor',
  components: {
    ToolbarBtn,
    FileSelect,
    Editor
  },
  data () {
    return {
      tab: 'processes',
      processes: {
        data: [],
        visibleColumns: ['name', 'status', 'processId', 'versionId'],
        selected: [],
        pagination: {
          rowsPerPage: 10
        }
      },
      contextMenu: {
        context: null,
        visible: false
      },
      files: {
        select: false,
        refresh: 0,
        processId: null
      },
      instances: {
        processId: null,
        data: [],
        visibleColumns: ['instanceId', 'status', 'created', 'versionId'],
        selected: [],
        pagination: {
          rowsPerPage: 10
        }
      },
      versions: {
        processId: null,
        data: [],
        visibleColumns: ['versionId', 'status', 'created'],
        selected: [],
        pagination: {
          rowsPerPage: 10
        }
      },
      context: {
        instanceId: null,
        splitter: 30,
        data: [],
        visibleColumns: ['key'],
        selected: [],
        pagination: {
          rowsPerPage: 10
        },
        editor: null,
        key: null,
        value: ''
      }
    }
  },
  computed: {
      ...mapGetters({
          access: 'access'
      }),
      columnsProcessTable: function () {
        return [
          { name: 'name', field: 'name', label: this.$t('Process.monitor.table.column.name'), sortable: true, align: 'left' },
          { name: 'status', field: 'status', label: this.$t('Process.monitor.table.column.status'), sortable: true, align: 'left' },
          { name: 'processId', field: 'processId', label: this.$t('Process.monitor.table.column.processId'), sortable: true, align: 'left' },
          { name: 'versionId', field: 'versionId', label: this.$t('Process.monitor.table.column.versionId'), sortable: true, align: 'left' },
          { name: 'versionName', field: 'versionName', label: this.$t('Process.monitor.table.column.versionName'), sortable: true, align: 'left' }
        ]
      },
      columnsVersionTable: function () {
        return [
          { name: 'versionId', field: 'versionId', label: this.$t('Process.monitor.table.column.versionId'), sortable: true, align: 'left' },
          { name: 'created', field: 'created', label: this.$t('Process.monitor.table.column.created'), sortable: true, align: 'left' },
          { name: 'status', field: 'status', label: this.$t('Process.monitor.table.column.status'), sortable: true, align: 'left' }
        ]
      },
      columnsInstanceTable: function () {
        return [
          { name: 'instanceId', field: 'instanceId', label: this.$t('Process.monitor.table.column.processId'), sortable: true, align: 'left' },
          { name: 'created', field: 'created', label: this.$t('Process.monitor.table.column.created'), sortable: true, align: 'left' },
          { name: 'status', field: 'status', label: this.$t('Process.monitor.table.column.status'), sortable: true, align: 'left' },
          { name: 'versionId', field: 'versionId', label: this.$t('Process.monitor.table.column.versionId'), sortable: true, align: 'left' }
        ]
      },
      columnsContextTable: function () {
        return [
          { name: 'key', field: 'key', label: this.$t('Process.monitor.table.column.key'), sortable: true, align: 'left' }]
      },
      selectedProcess: function () {
        if (!this.instances.processId) return {}
        const processId = this.instances.processId
        return this.processes.data.find(e => { return e.processId === processId })
      }
  },
  watch: {
  },
  created () {
  },
  mounted () {
    this.refreshProcessList()
  },
  beforeDestroy () {
    // TODO store last state
  },
  methods: {
    addProcess (objectName) {
      if (!this.access.token) return
      //
      const instance = this.$instance()
      instance.defaults.headers.post['x-imicros-xtoken'] = this.access.token
      const params = {
        name: objectName
      }
      // new version
      if (this.files && this.files.processId) params.processId = this.files.processId
      instance.post('/api/flow/control/deployProcess', params).then(async (response) => {
        if (response.data) {
          this.refreshProcessList()
          if (this.tab === 'versions') this.refreshVersionList()
        }
      }).catch((err) => {
        console.log(err)
      })

      this.files.select = false
    },
    newVersion (processId) {
        this.files.processId = processId
        this.files.select = !this.files.select
    },
    refreshProcessList () {
      if (!this.access.token) return
      //
      const instance = this.$instance()
      instance.defaults.headers.post['x-imicros-xtoken'] = this.access.token
      const params = {
      }
      instance.post('/api/flow/control/getProcesses', params).then(async (response) => {
        if (response.data) {
          this.processes.data = response.data.map(e => {
            e.status = e.versionId ? this.$t('Process.monitor.table.column.status.active') : this.$t('Process.monitor.table.column.status.inactive')
            return e
          })
        } else {
          this.processes.data = []
        }
      }).catch((err) => {
        this.processes.data = []
        console.log(err)
      })
    },
    showVersions (processId) {
      if (!processId) return
      this.versions.processId = processId
      this.versions.process = this.processes.data.find(e => { return e.processId === this.versions.processId })
      this.refreshVersionList()
      this.tab = 'versions'
    },
    refreshVersionList () {
      if (!this.access.token) return
      //
      this.versions.versionId = null
      const instance = this.$instance()
      instance.defaults.headers.post['x-imicros-xtoken'] = this.access.token
      const params = {
        processId: this.versions.processId
      }
      instance.post('/api/flow/control/getVersions', params).then(async (response) => {
        if (response.data) {
          // initial sort by created descending
          response.data.sort((a, b) => a.created > b.created ? -1 : (b.created > a.created ? 1 : 0))
          // convert received data
          this.versions.data = response.data.map(e => {
            e.status = this.versions.process.versionId === e.versionId ? 'active' : 'inactive'
            e.created = new Date(e.created).toISOString()
            return e
          })
        } else {
          this.versions.data = []
        }
      }).catch((err) => {
        this.versions.data = []
        console.log(err)
      })
    },
    activateVersion (processId, versionId) {
      if (!this.access.token) return
      if (!processId || !versionId) return
      //
      const instance = this.$instance()
      instance.defaults.headers.post['x-imicros-xtoken'] = this.access.token
      const params = {
        processId: processId,
        versionId: versionId
      }
      instance.post('/api/flow/control/activateVersion', params).then(async (response) => {
        // successful -> refreh list
        if (response.data && response.data.versionId === versionId) {
          this.refreshProcessList()
          this.versions.process.versionId = response.data.versionId
          this.refreshVersionList()
        }
      }).catch((err) => {
        console.log(err)
      })
    },
    deactivateVersion (processId, versionId) {
      if (!this.access.token) return
      if (!processId || !versionId) return
      //
      const instance = this.$instance()
      instance.defaults.headers.post['x-imicros-xtoken'] = this.access.token
      const params = {
        processId: processId,
        versionId: versionId
      }
      instance.post('/api/flow/control/deactivateVersion', params).then(async (response) => {
        // successful -> refresh list
        if (response.data && response.data.processId === processId) {
          this.refreshProcessList()
          this.versions.process.versionId = null
          this.refreshVersionList()
        }
      }).catch((err) => {
        console.log(err)
      })
    },
    showInstances (processId) {
      if (!processId) return
      this.instances.processId = processId
      this.refreshInstanceList()
      this.tab = 'instances'
    },
    refreshInstanceList () {
      if (!this.access.token) return
      //
      const instance = this.$instance()
      instance.defaults.headers.post['x-imicros-xtoken'] = this.access.token
      const params = {
        processId: this.instances.processId,
        running: true,
        failed: true,
        completed: true
      }
      instance.post('/api/flow/instance/getRunning', params).then(async (response) => {
        if (response.data) {
          // initial sort by createdAt descending
          response.data.sort((a, b) => a.createdAt > b.createdAt ? -1 : (b.createdAt > a.createdAt ? 1 : 0))
          // convert received data
          this.instances.data = response.data.map(e => {
            e.created = new Date(e.createdAt).toISOString()
            return e
          })
        } else {
          this.instances.data = []
        }
      }).catch((err) => {
        this.instances.data = []
        console.log(err)
      })
    },
    showContext (instanceId) {
      if (!instanceId) return
      this.context.instanceId = instanceId
      this.refreshContext()
      this.tab = 'context'
    },
    refreshContext () {
      if (!this.access.token) return
      //
      this.resetKey()
      const instance = this.$instance()
      instance.defaults.headers.post['x-imicros-xtoken'] = this.access.token
      const params = {
        instanceId: this.context.instanceId,
        keys: []
      }
      instance.post('/api/flow/context/getKeys', params).then(async (response) => {
        if (response.data) {
          this.context.data = response.data.map(e => {
            return e
          })
        } else {
          this.context.data = []
        }
      }).catch((err) => {
        this.context.data = []
        console.log(err)
      })
    },
    editorInit: function (editor, readOnly) {
      require('brace/ext/language_tools') // language extension prerequsite...
      require('brace/mode/json')
      require('brace/theme/monokai')
      editor.setOptions({
        autoScrollEditorIntoView: true,
        maxLines: 'Infinity',
        minLines: 20,
        readOnly: readOnly || false
      })
      this.context.editor = editor
    },
    resetKey () {
      this.context.key = null
      this.context.value = ''
      if (this.context.editor) this.context.editor.session.setMode('ace/mode/text')
    },
    getKey (evt, row, index) {
      if (!this.access.token) return
      //
      const instance = this.$instance()
      instance.defaults.headers.post['x-imicros-xtoken'] = this.access.token
      const params = {
        instanceId: row.instanceId,
        key: row.key
      }
      instance.post('/api/flow/context/get', params).then(async (response) => {
        if (response.data) {
          if (typeof response.data === 'string') {
            this.context.value = response.data
            this.context.editor.session.setMode('ace/mode/text')
          } else {
            this.context.value = JSON.stringify(response.data, null, '\t')
            this.context.editor.session.setMode('ace/mode/json')
          }
          this.context.key = row.key
        } else {
          this.resetKey()
        }
      }).catch((err) => {
        this.resetKey()
        console.log(err)
      })
    },
    setContext (row) {
      this.contextMenu.context = row
    }
  }
}
</script>
