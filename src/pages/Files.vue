<template>
  <div class="q-pa-md q-gutter-sm">
    <q-breadcrumbs>
      <q-breadcrumbs-el
        v-for="breadcrumb in breadcrumbs"
        :key="breadcrumb.prefix"
        :icon="breadcrumb.icon"
        :label="breadcrumb.label"
        @click="selectBreadcrumb(breadcrumb)"
      />
    </q-breadcrumbs>
    <q-toolbar>
      <q-input
        dense
        debounce="300"
        v-model="files.filter"
        :placeholder="$t('Base.search.placeholder')"
      >
        <template
          #after
          v-if="files.filter !== ''"
        >
          <q-icon
            name="close"
            @click="files.filter = ''"
            class="cursor-pointer"
          />
        </template>
        <template #append>
          <q-icon name="search" />
        </template>
      </q-input>
      <q-space />
      <toolbar-btn
        icon="ion-add"
        @click="addFile()"
      >
        <q-tooltip>{{ $t('Action.add') }}</q-tooltip>
      </toolbar-btn>
      <toolbar-btn
        icon="ion-refresh"
        @click="getFiles()"
      >
        <q-tooltip>{{ $t('Action.refresh') }}</q-tooltip>
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
              v-for="(column) in columns"
              :key="column.name"
              @click="setVisibleColumns(column,visibleColumns)"
            >
              <q-item-section>
                <q-item-label
                  :class="visibleColumns.indexOf(column.name) >= 0 ? 'text-primary' : ''"
                >
                  {{ $t('Files.table.column.' + column.name) }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </toolbar-btn>
    </q-toolbar>
    <q-table
      :columns="columns"
      :visible-columns="visibleColumns"
      v-model:pagination="pagination.groups"
      :rows="ls"
      :filter="files.filter"
      flat
      dense
      @row-dblclick="selectFolder"
    >
      <template #body="props">
        <q-tr
          :props="props"
          @contextmenu="contextMenu(props.row)"
          @mouseleave="mouseLeave()"
          @dblclick="dblClick(props.row)"
        >
          <q-td
            key="name"
            :props="props"
          >
            <div class="row justify-between">
              <q-badge
                v-show="props.row.name && !props.row.save"
                :color="props.row.save ? 'primary' : 'grey'"
              >
                <div>{{ props.row.listname }}</div>
              </q-badge>
              <a
                class="q-badge q-pl-none q-pr-none"
                v-if="props.row.save"
                :href="props.row.url"
                :download="props.row.name"
                :ref="'link' + props.row.etag"
              >
                <q-badge
                  v-if="props.row.name"
                  color="primary"
                >
                  {{ props.row.listname }}
                </q-badge>
              </a>
              <div v-if="props.row.prefix">
                {{ props.row.prefix }}
              </div>
              <q-inner-loading :showing="spinners.indexOf(props.row.etag) >= 0">
                <q-spinner-ios
                  size="xs"
                  color="primary"
                />
              </q-inner-loading>
              <q-btn
                flat
                dense
                size="xs"
                icon="ion-more"
                color="grey"
                @click="contextMenu(props.row)"
              >
                <q-menu>
                  <q-list
                    dense
                    style="min-width: 100px"
                  >
                    <q-item v-close-popup>
                      <q-item-section>{{ props.row.listname || props.row.prefix }}</q-item-section>
                    </q-item>
                    <q-item
                      clickable
                      v-close-popup
                      v-if="props.row.prefix"
                      @click="selectFolder(props.row)"
                    >
                      <q-item-section>...open</q-item-section>
                    </q-item>
                    <q-item
                      clickable
                      v-close-popup
                      v-if="props.row.name"
                      @click="downloadFile(props.row)"
                    >
                      <q-item-section>...download</q-item-section>
                    </q-item>
                    <q-item
                      clickable
                      v-close-popup
                      v-if="props.row.name"
                      @click="deleteFile(props.row)"
                    >
                      <q-item-section>...delete</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </div>
          </q-td>
          <q-td
            key="prefix"
            :props="props"
          >
            <q-badge color="purple">
              {{ props.row.prefix }}
            </q-badge>
          </q-td>
          <q-td
            key="etag"
            :props="props"
          >
            <q-badge color="orange">
              {{ props.row.etag }}
            </q-badge>
          </q-td>
          <q-td
            key="size"
            :props="props"
          >
            {{ formatSize(props.row.size, props.row) }}
          </q-td>
          <q-td
            key="lastModified"
            :props="props"
          >
            <q-badge color="teal">
              {{ props.row.lastModified }}
            </q-badge>
          </q-td>
        </q-tr>
      </template>
    </q-table>

    <!-- add file member dialog -->
    <q-dialog v-model="dialog.add.show">
      <q-card>
        <q-card-section class="q-pa-none">
          <q-uploader
            auto-upload
            square
            flat
            multiple
            no-thumbnails
            :url="uploaderUrl"
            method="POST"
            :field-name="(file) => getUploadFilename(file)"
            :headers="headers"
            style="max-width: 300px"
            @uploaded="getFiles"
            @finish="dialog.add.show = !dialog.add.show"
          />
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="newFolder"
            label="new folder"
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- <div>{{ ls }}</div> -->
    <q-menu
      touch-position
      context-menu
      v-if="context"
      v-model="contextMenuVisible"
    >
      <q-list
        dense
        style="min-width: 100px"
      >
        <q-item v-close-popup>
          <q-item-section>{{ context.listname || context.prefix }}</q-item-section>
        </q-item>
        <q-item
          clickable
          v-close-popup
          v-if="context.prefix"
          @click="selectFolder(context)"
        >
          <q-item-section>...open</q-item-section>
        </q-item>
        <q-item
          clickable
          v-close-popup
          v-if="context.name"
          @click="downloadFile(context)"
        >
          <q-item-section>...download</q-item-section>
        </q-item>
        <q-item
          clickable
          v-close-popup
          v-if="context.name"
          @click="deleteFile(context)"
        >
          <q-item-section>...delete</q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
const cloneDeep = require('lodash/cloneDeep')
// components
import ToolbarBtn from '../components/global/ToolbarBtn.vue'

export default {
  name: 'Files',
  components: {
    ToolbarBtn
  },
  data () {
    return {
    //
      files: {
        filter: ''
      },
      ls: [],
      visibleColumns: ['name'],
      pagination: {
        groups: {
          rowsPerPage: 10
        }
      },
      path: null,
      breadcrumbs: null,
      context: null,
      contextMenuVisible: false,
      showAddDialog: false,
      spinners: [],
      newFolder: '',
      dialog: {
        add: {
          show: false
        },
        folder: {
          show: false
        }
      }
    }
  },
  computed: {
    ...mapGetters({
      access: 'access'
    }),
    columns: function () {
      return [
        { name: 'name', field: 'name', label: this.$t('Files.table.column.name'), sortable: true, align: 'left' },
        { name: 'prefix', field: 'prefix', label: this.$t('Files.table.column.prefix'), sortable: true, align: 'left' },
        { name: 'etag', field: 'etag', label: this.$t('Files.table.column.etag'), sortable: true, align: 'left' },
        {
          name: 'size',
          field: 'size',
          label: this.$t('Files.table.column.size'),
          sortable: true,
          align: 'left',
          format: this.formatSize
        },
        { name: 'lastModified', field: 'lastModified', label: this.$t('Files.table.column.lastModified'), sortable: true, align: 'left' }
      ]
    },
    headers: function () {
      return [{ name: 'x-imicros-xtoken', value: this.access.token },
        { name: 'Authorization', value: this.$axios.defaults.headers.common.Authorization }]
    },
    uploaderUrl: function () {
      // const url = this.$axios.defaults.baseUrl + '/api/upload'
      const url = '/api/upload'
      console.log('uploaderUrl', url)
      return url
    }
  },
  watch: {
    access: {
      deep: true,
      handler () {
        this.makeBucket()
        this.initPath()
        this.getFiles()
      }
    }
  },
  mounted () {
    this.makeBucket()
    this.initPath()
    this.getFiles()
    // restore settings - component files
    const settings = this.$store.getters.settings('files')
    if (settings) {
      this.visibleColumns = cloneDeep(settings.visibleColumns)
      this.pagination = cloneDeep(settings.pagination)
    }
  },
  beforeUnmount () {
    // store settings - component files
    this.$store.commit('setSettings', {
      files: {
        visibleColumns: cloneDeep(this.visibleColumns),
        pagination: cloneDeep(this.pagination)
      }
    })
  },
  methods: {
    formatSize (val, row) {
      const mb = Math.round((val / 1001048576 + Number.EPSILON) * 100 / 100)
      const kb = Math.round((val / 1024 + Number.EPSILON) * 100 / 100)
      return (mb > 1 ? `${mb} MB` : (kb > 1 ? `${kb} KB` : `${val} Byte`))
    },
    initPath () {
      this.breadcrumbs = [{ prefix: '', icon: 'home', label: '~' }]
      this.path = ''
    },
    makeBucket () {
      if (!this.access.token) return
      //
      const instance = this.$instance()
      instance.defaults.headers.post['x-imicros-xtoken'] = this.access.token
      const params = {
      }
      instance.post('/#minio/makeBucket', params).then(async (response) => {
        if (response.data) {
          // To be done or to be ognored
        }
      }).catch((err) => {
        console.log(err)
      })
    },
    getFiles () {
      if (!this.access.token) return
      //
      const instance = this.$instance()
      instance.defaults.headers.post['x-imicros-xtoken'] = this.access.token
      const params = {
        prefix: this.path,
        recursive: false
      }
      instance.post('/#minio/listObjectsArray', params).then(async (response) => {
        if (response.data) {
          this.ls = response.data.map(entry => (Object.assign(entry, { listname: entry.name ? entry.name.replace(/^.*[\\\/]/, '') : entry.prefix })))
        } else {
          this.ls = []
        }
      }).catch((err) => {
        this.ls = []
        console.log(err)
      })
    },
    getUploadFilename (file) {
      return this.newFolder ? this.path + this.newFolder + '/' + file.name : this.path + file.name
    },
    getFilename (fullPath) {
      if (fullPath) fullPath.replace(/^.*[\\\/]/, '')
    },
    receiveFileStream (stream) {
      return new Promise((resolve, reject) => {
        const objects = []
        stream.on('data', obj => objects.push(obj))
        stream.on('end', () => resolve(objects))
        stream.on('error', reject)
      })
    },
    dblClick (row) {
      if (row.prefix) return this.selectFolder(row)
      if (row.size > 0) return this.downloadFile(row)
    },
    selectFolder (row) {
      if (!row.prefix) return
      /* eslint no-useless-escape: "off" */
      this.breadcrumbs.push({ prefix: row.prefix, label: row.prefix.match(/([^\/]*)\/*$/)[1] })
      this.path = row.prefix
      this.getFiles()
    },
    selectBreadcrumb (breadcrumb) {
      this.path = breadcrumb.prefix
      this.breadcrumbs.splice(this.breadcrumbs.indexOf(breadcrumb) + 1, this.breadcrumbs.length - this.breadcrumbs.indexOf(breadcrumb))
      this.getFiles()
    },
    contextMenu (row) {
      if (row) this.context = row
    },
    mouseLeave () {
      if (!this.contextMenuVisible) this.context = null
    },
    addFile () {
      this.dialog.add.show = true
    },
    downloadFile (row) {
      if (row.url && this.$refs['link' + row.etag]) return this.$refs['link' + row.etag].click()
      //
      const instance = this.$instance()
      instance.defaults.headers.get['x-imicros-xtoken'] = this.access.token
      instance.defaults.headers.get['Content-Type'] = 'application/octet-stream'
      this.spinners.push(row.etag)
      /*
      this.$q.loading.show({
        delay: 400 // ms
      })
      */
      instance.get('/#file/' + row.name, {
        responseType: 'blob' // important
      }).then((response) => {
        const blob = new Blob([response.data])
        const url = window.URL.createObjectURL(blob)
        // this.$q.loading.hide()
        this.spinners.splice(this.spinners.indexOf(row.etag), 1)
        // row.listname += ' '
        row.save = true
        row.url = url
        const self = this
        setTimeout(function () { if (self.$refs['link' + row.etag]) self.$refs['link' + row.etag].click() }, 50)
        // this.$refs['link' + row.etag].click()
      }).catch((err) => {
        // this.$q.loading.hide()
        this.spinners.splice(this.spinners.indexOf(row.etag), 1)
        console.log(err)
      })
    },
    deleteFile (row) {
      //
      const instance = this.$instance()
      instance.defaults.headers.delete['x-imicros-xtoken'] = this.access.token
      instance.delete('/#file/?objectName=' + row.name).then((response) => {
        if (response.data && response.data.objectName) {
          this.getFiles()
        }
      }).catch((err) => {
        console.log(err)
      })
    },
    setVisibleColumns (column, visible) {
      visible.indexOf(column.name) >= 0 ? visible.splice(visible.indexOf(column.name), 1) : visible.push(column.name)
    }
  }
}
</script>
