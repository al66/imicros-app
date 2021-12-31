<template>
  <div>
    <q-toolbar>
      <q-chip v-if="objectName">
        {{ objectName }}
      </q-chip>
      <q-chip
        v-if="!objectName"
        class="text-white"
        color="orange"
      >
        {{ $t('Process.editor.new.file') }}
      </q-chip>
      <q-space />
      <toolbar-btn
        sub
        icon="ion-add"
        @click="++zoom"
      />
      <toolbar-btn
        sub
        icon="ion-remove"
        @click="--zoom"
      />
      <toolbar-btn
        sub
        icon="ion-code"
        @click="triggerFit = !triggerFit"
      />
      <toolbar-btn
        sub
        icon="ion-map"
        @click="minimap = !minimap"
      />
      <q-space />
      <toolbar-btn
        sub
        icon="ion-undo"
        @click="triggerUndo = !triggerUndo"
      />
      <toolbar-btn
        sub
        icon="ion-redo"
        @click="triggerRedo = !triggerRedo"
      />
      <toolbar-btn
        sub
        :icon="palette ? 'ion-hammer' : 'ion-hammer'"
        @click="palette = !palette"
      />
      <q-space />
      <toolbar-btn
        sub
        label="SVG"
        @click="triggerSVG = !triggerSVG"
      />
      <a
        class="q-badge q-pl-none q-pr-none hidden"
        v-if="download.url"
        :href="download.url"
        :download="download.filename"
        :ref="'link'"
      />
      <q-space />
      <toolbar-btn
        icon="ion-add"
        @click="newDiagram"
      />
      <toolbar-btn
        icon="ion-open"
        @click="openDiagram"
      />
      <toolbar-btn
        icon="ion-save"
        @click="saveDiagram()"
      />
      <toolbar-btn
        icon="ion-copy"
        :disable="!objectName"
        @click="copyDiagram()"
      />
    </q-toolbar>
    <q-tab-panel name="editor">
      <modeler
        id="modeler"
        style="height: calc(100vh - 50px - 90px;"
        :xml="xml"
        :undo="triggerUndo"
        :redo="triggerRedo"
        :save="triggerSave"
        :zoom="zoom"
        :fit="triggerFit"
        :minimap="minimap"
        :palette="palette"
        :svg="triggerSVG"
        @xml="saveXML"
        @svg="downloadSVG"
      />
      <div
        v-show="false"
        id="js-canvas"
        style="height: calc(100vh - 50px - 90px;"
      />
    </q-tab-panel>
    <file-select
      :refresh="files.refresh"
      :show="files.select"
      suffix=".bpmn"
      @close="()=>{ this.files.select = false }"
      @file="loadDiagram"
    />
    <file-save-as
      :refresh="files.refresh"
      :show="files.saveAs"
      suffix=".bpmn"
      @close="()=>{ this.files.saveAs = false }"
      @file="saveDiagramAs"
    />
  </div>
</template>

<script>
// vuex store
import { mapGetters } from 'vuex'
// components
import ToolbarBtn from '../components/global/ToolbarBtn.vue'
import FileSelect from '../components/main/FileSelect.vue'
import FileSaveAs from '../components/main/FileSaveAs.vue'
import Modeler from '../components/process/Modeler.vue'

export default {
  name: 'Processeditor',
  components: {
    Modeler,
    FileSelect,
    FileSaveAs,
    ToolbarBtn
  },
  data () {
    return {
      callNew: false,
      files: {
        select: false,
        saveAs: false,
        refresh: 0
      },
      objectName: '',
      xml: '',
      triggerUndo: false,
      triggerRedo: false,
      triggerSave: '',
      triggerFit: false,
      triggerSVG: false,
      zoom: 0,
      minimap: false,
      palette: true,
      editMode: true,
      agents: {
        data: []
      },
      download: {
        svg: '',
        filename: '',
        url: null
      }
    }
  },
  computed: {
    ...mapGetters({
      access: 'access'
    }),
    optionsPreparation () {
      return [
        { label: 'No preparation step', value: '' },
        { label: 'Map', value: 'template' },
        { label: 'Ruleset', value: 'ruleset' }
      ]
    },
    optionsAgents () {
      return this.agents.data.map(agent => { return { label: agent.label, value: agent.serviceId } })
    }
  },
  watch: {
    access: {
      deep: true,
      handler () {
        this.newDiagram()
      }
    }
  },
  created () {
  },
  mounted () {
    // short keys
    document.addEventListener('keydown', this.doSave)

    // open file parameter
    const file = this.$route?.query?.open ?? null
    if (file) this.loadDiagram(file)
    this.$router.replace({ query: null })
  },
  beforeUnmount () {
    // short keys
    document.removeEventListener('keydown', this.doSave)
    // TODO store last state
  },
  methods: {
    newDiagram () {
      this.objectName = ''
      this.xml = ''
    },
    loadDiagram (objectName) {
      // this.stopSimulation()
      const instance = this.$instance()
      instance.defaults.headers.get['x-imicros-xtoken'] = this.access.token
      instance.defaults.headers.get['Content-Type'] = 'application/octet-stream'
      // this.spinners.push(row.etag)
      instance.get('/#file/' + objectName, {
        responseType: 'text'
      }).then(async (response) => {
        try {
          this.xml = response.data
          this.objectName = objectName
        } catch (err) {
          console.log('Failed to open file ' + objectName + ':', err)
        }
      }).catch((err) => {
        console.error(err)
      })
    },
    openDiagram () {
      this.files.select = true
    },
    doSave (e) {
      if (!(e.keyCode === 83 && e.ctrlKey)) {
        return
      }

      e.preventDefault()
      this.saveDiagram()
    },
    async saveDiagram () {
      if (!this.objectName) {
        this.files.saveAs = true
        return
      }
      console.log('triggerSave')
      this.triggerSave = 'xml'
    },
    async saveXML (xml) {
      const instance = this.$instance()
      instance.defaults.headers.put['x-imicros-xtoken'] = this.access.token
      instance.defaults.headers.put['x-imicros-filename'] = this.objectName
      instance.defaults.headers.put['Content-Type'] = 'application/octet-stream'
      try {
        instance.put('/api/upload', xml).then((response) => {
          console.log('File ' + this.objectName + ' saved')
          // trigger refresh file lists of dialogs
          this.files.refresh += 1
          // trigger refresh of viewer
          // this.viewer.importXML(xml)
        }).catch((err) => {
          console.error('Failed to save file ' + this.objectName, err)
        })
      } catch (err) {
        console.error('Failed to save file ' + this.objectName, err)
      } finally {
        this.triggerSave = ''
      }
    },
    async saveDiagramAs (objectName) {
      this.objectName = objectName
      // hide dialog again
      this.files.saveAs = false
      await this.saveDiagram()
    },
    copyDiagram () {
      this.objectName = ''
    },
    changePrepFunction () {
      console.log('changePrepFunction', this.selected.parameterObject.prepFunction.value)
      switch (this.selected.parameterObject.prepFunction.value) {
        case 'template':
          this.selected.parameterObject.ruleset = ''
          break
        case 'ruleset':
          this.selected.parameterObject.template = ''
          break
        default:
          this.selected.parameterObject.ruleset = ''
          this.selected.parameterObject.template = ''
      }
      this.updateProperties()
    },
    async downloadSVG (svg) {
      // console.log(svg)
      this.download.svg = svg
      this.download.filename = this.objectName.replace(/\.bpmn$/, '.svg')

      // const blob = new Blob([svg])
      // const url = window.URL.createObjectURL(blob)
      const data = encodeURIComponent(svg)
      this.download.url = 'data:application/bpmn20-xml;charset=UTF-8,' + data
      const self = this
      setTimeout(function () { if (self.$refs.link) self.$refs.link.click() }, 50)
    }
  }
}
</script>
