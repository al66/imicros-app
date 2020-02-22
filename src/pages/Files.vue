<template>
  <div class="q-pa-md q-gutter-sm">
    <q-breadcrumbs>
      <q-breadcrumbs-el
        v-for="breadcrumb in breadcrumbs"
        v-bind:key="breadcrumb.prefix"
        :icon="breadcrumb.icon"
        :label="breadcrumb.label"
        @click="selectBreadcrumb(breadcrumb)"
      />
    </q-breadcrumbs>
    <q-table
      :columns="columns"
      :data="ls"
      flat
      dense
      @row-dblclick="selectFolder"
    >
      <template v-slot:body="props">
        <!-- <q-tr :props="props" @contextmenu.native="contextMenu(props.row)" @mouseleave.native="if (contextMenuVisible) context = null"> -->
        <q-tr :props="props" @contextmenu.native="contextMenu(props.row)" @mouseleave.native="mouseLeave" @dblclick="selectFolder(props.row)">
          <q-td key="listname" :props="props">
            {{ props.row.listname }}
          </q-td>
          <q-td key="name" :props="props">
            <q-badge color="green">
              {{ props.row.name }}
            </q-badge>
          </q-td>
          <q-td key="prefix" :props="props">
            <q-badge color="purple">
              {{ props.row.prefix }}
            </q-badge>
          </q-td>
          <q-td key="etag" :props="props">
            <q-badge color="orange">
              {{ props.row.etag }}
            </q-badge>
          </q-td>
          <q-td key="size" :props="props">
            <q-badge color="primary">
              {{ props.row.size }}
            </q-badge>
          </q-td>
          <q-td key="lastModified" :props="props">
            <q-badge color="teal">
              {{ props.row.lastModified }}
            </q-badge>
          </q-td>
        </q-tr>
      </template>
      <template v-slot:top-right>
        <div class="q-pa-md q-gutter-sm">
          <q-btn round no-caps size="sm" color="primary" icon="ion-refresh" @click="getFiles()" >
            <q-tooltip>{{ $t('Action.refresh') }}</q-tooltip>
          </q-btn>
          <q-btn round no-caps size="sm" color="primary" icon="ion-add" @click="addFile()">
            <q-tooltip>{{ $t('Action.add') }}</q-tooltip>
          </q-btn>
        </div>
      </template>
    </q-table>

    <!-- add file member dialog -->
    <q-dialog v-model="dialog.add.show">
      <q-uploader
        auto-upload
        multiple
        no-thumbnails
        :url="this.$axios.defaults.baseUrl + '/api/upload'"
        :field-name="(file) => this.path + file.name"
        :headers="headers"
        style="max-width: 300px"
        @uploaded="getFiles"
        @finish="dialog.add.show = !dialog.add.show"
      />
    </q-dialog>

    <!-- <div>{{ ls }}</div> -->
    <q-menu touch-position context-menu v-if="context" v-model="contextMenuVisible">
      <q-list dense style="min-width: 100px">
        <q-item clickable v-close-popup v-if="context.prefix" @click="selectFolder(context)">
          <q-item-section>Open...{{ context.listname }}</q-item-section>
        </q-item>
        <q-item clickable v-close-popup v-if="context.name" @click="downloadFile(context)">
          <q-item-section>Download...{{ context.listname }}</q-item-section>
        </q-item>
        <q-item clickable v-close-popup v-if="context.name" @click="deleteFile(context)">
          <q-item-section>Delete...{{ context.listname }}</q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'Files',
  data () {
    return {
    //
      ls: [],
      path: null,
      breadcrumbs: null,
      context: null,
      contextMenuVisible: false,
      showAddDialog: false,
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
          { name: 'listname', field: 'listname', label: this.$t('Files.table.column.listname'), sortable: true, align: 'left' },
          { name: 'name', field: 'name', label: this.$t('Files.table.column.name'), sortable: true, align: 'left' },
          { name: 'prefix', field: 'prefix', label: this.$t('Files.table.column.prefix'), sortable: true, align: 'left' },
          { name: 'etag', field: 'etag', label: this.$t('Files.table.column.etag'), sortable: true, align: 'left' },
          { name: 'size', field: 'size', label: this.$t('Files.table.column.size'), sortable: true, align: 'left' },
          { name: 'lastModified', field: 'lastModified', label: this.$t('Files.table.column.lastModified'), sortable: true, align: 'left' }
        ]
      },
      headers: function () {
        return [{ name: 'x-imicros-xtoken', value: this.access.token },
                { name: 'Authorization', value: this.$axios.defaults.headers.common['Authorization'] }]
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
  },
  methods: {
    initPath () {
      this.breadcrumbs = [{ prefix: '', icon: 'home', label: '~' }]
      this.path = ''
    },
    makeBucket () {
      if (!this.access.token) return
      //
      let instance = this.$instance()
      instance.defaults.headers.post['x-imicros-xtoken'] = this.access.token
      let params = {
      }
      instance.post('/#minio/makeBucket', params).then(async (response) => {
        if (response.data) {
        }
      }).catch((err) => {
        console.log(err)
      })
    },
    getFiles () {
      if (!this.access.token) return
      //
      let instance = this.$instance()
      instance.defaults.headers.post['x-imicros-xtoken'] = this.access.token
      let params = {
        prefix: this.path,
        recursive: false
      }
      instance.post('/#minio/listObjectsArray', params).then(async (response) => {
        if (response.data) {
          this.ls = response.data.map(entry => (Object.assign(entry, { listname: entry.name || entry.prefix })))
        } else {
          this.ls = []
        }
      }).catch((err) => {
        this.ls = []
        console.log(err)
      })
    },
    receiveFileStream (stream) {
        return new Promise((resolve, reject) => {
            let objects = []
            stream.on('data', obj => objects.push(obj))
            stream.on('end', () => resolve(objects))
            stream.on('error', reject)
        })
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
      //
      let instance = this.$instance()
      instance.defaults.headers.get['x-imicros-xtoken'] = this.access.token
      instance.defaults.headers.get['Content-Type'] = 'application/octet-stream'
      this.$q.loading.show({
        delay: 400 // ms
      })
      instance.get('/#file/' + row.name, {
        responseType: 'blob' // important
      }).then((response) => {
        const blob = new Blob([response.data])
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', row.name)
        document.body.appendChild(link)
        this.$q.loading.hide()
        link.click()
      }).catch((err) => {
        this.$q.loading.hide()
        console.log(err)
      })
    },
    deleteFile (row) {
      //
      let instance = this.$instance()
      instance.defaults.headers.delete['x-imicros-xtoken'] = this.access.token
      instance.delete('/#file/?objectName=' + row.name).then((response) => {
        if (response.data && response.data.objectName) {
          this.getFiles()
        }
      }).catch((err) => {
        console.log(err)
      })
    }
  }
}
</script>
