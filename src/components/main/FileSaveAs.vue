<template>
  <q-dialog v-model="dialog">
    <q-card style="width: 500px;">
      <q-card-section
        align="center"
        class="bg-black text-white q-pa-xs"
      >
        <div class="text-h6">
          {{ $t('Files.save.as.dialog.title') }}
        </div>
      </q-card-section>
      <q-card-section align="left">
        <q-breadcrumbs>
          <q-breadcrumbs-el
            v-for="breadcrumb in breadcrumbs"
            :key="breadcrumb.prefix"
            :icon="breadcrumb.icon"
            :label="breadcrumb.label"
            @click="selectBreadcrumb(breadcrumb)"
          />
        </q-breadcrumbs>
      </q-card-section>
      <q-card-section align="center">
        <q-scroll-area style="height: 200px; max-width: 500px;">
          <q-list
            class="scroll"
            dense
            align="left"
          >
            <q-item
              dense
              clickable
              v-for="(object) in objects"
              :key="object.objectName"
              @click="select(object)"
            >
              <q-item-section>
                <q-item-label>{{ object.objectName }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-scroll-area>
      </q-card-section>
      <q-card-section>
        <q-input
          v-model="objectName"
          :prefix="path"
          :suffix="suffix"
          :label="$t('Files.save.as.dialog.input.label')"
          clearable
          @keyup.enter="saveAs()"
        />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          dense
          flat
          :label="$t('Action.save.as')"
          icon="ion-save"
          text-color="primary"
          :disable="!objectName || objectName.length === 0"
          @click="saveAs()"
        />
        <q-btn
          dense
          flat
          icon="ion-close-circle"
          color="grey"
          @click="$emit('close')"
        >
          <q-tooltip>{{ $t('Action.cancel') }}</q-tooltip>
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { mapGetters } from 'vuex'

  export default {
  props: {
    refresh: {
      type: Number,
      default: 0
    },
    show: Boolean,
    suffix: {
      type: String,
      default: ''
    },
    filter: {
      type: String,
      default: ''
    }
  },
  data: function () {
    return {
      dialog: false,
      path: '',
      breadcrumbs: [{ prefix: '', icon: 'home', label: '~' }],
      objectName: null,
      objects: []
    }
  },
  computed: {
      ...mapGetters({
          access: 'access'
      })
  },
  watch: {
    show: function (oldVal, newVal) {
      this.dialog = this.show
    },
    dialog: function () {
      if (!this.dialog) this.$emit('close')
    },
    refresh: function (oldVal, newVal) {
      console.log('refresh:' + newVal)
      this.getFiles()
    },
    access: {
      deep: true,
      handler () {
        this.initPath()
        this.getFiles()
      }
    }
  },
  mounted () {
    this.initPath()
    this.getFiles()
  },
  methods: {
    initPath () {
      this.breadcrumbs = [{ prefix: '', icon: 'home', label: '~' }]
      this.path = ''
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
        this.objects = []
        if (response.data) {
          /* eslint no-useless-escape: "off" */
          response.data.map(entry => (this.objects.push(Object.assign(entry, { objectName: entry.name ? entry.name.replace(/^.*[\\\/]/, '') : entry.prefix }))))
        } else {
          this.objects = []
        }
      }).catch((err) => {
        this.objects = []
        console.log(err)
      })
    },
    selectBreadcrumb (breadcrumb) {
      this.path = breadcrumb.prefix
      this.breadcrumbs.splice(this.breadcrumbs.indexOf(breadcrumb) + 1, this.breadcrumbs.length - this.breadcrumbs.indexOf(breadcrumb))
      this.getFiles()
    },
    select (object) {
      // Select file
      if (object.name) {
        this.objectName = object.name
        if (this.suffix.length > 0) {
          const pos = this.objectName.lastIndexOf(this.suffix)
          this.objectName = this.objectName.substr(0, pos < 0 ? this.objectName.length : pos)
        }
        if (this.path) {
          this.objectName = this.objectName.substr(this.path.length, this.objectName.length)
        }
      }
      // Move to folder
      if (object.prefix) {
        /* eslint no-useless-escape: "off" */
        this.breadcrumbs.push({ prefix: object.prefix, label: object.prefix.match(/([^\/]*)\/*$/)[1] })
        this.path = object.prefix
        this.getFiles()
      }
    },
    saveAs () {
      if (!this.objectName) return
      const objectName = this.path + this.objectName + this.suffix
      this.objectName = ''
      this.$emit('file', objectName)
    }
  }
}
</script>
