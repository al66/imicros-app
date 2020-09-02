<template>
  <div>
    <q-toolbar>
      <q-chip v-if="objectName">{{ objectName }}</q-chip>
      <q-chip v-if="!objectName" class="text-white" color="orange">{{ $t('Process.editor.new.file') }}</q-chip>
      <q-space />
      <q-btn round flat no-caps size="sm" color="grey" icon="ion-add" class="q-mr-sm" @click="zoomOut()" />
      <q-btn round flat no-caps size="sm" color="grey" icon="ion-remove" class="q-mr-sm" @click="zoomIn()" />
      <q-btn round flat no-caps size="sm" color="grey" icon="ion-code" class="q-mr-lg" @click="zoomFit()" />
      <q-btn round flat no-caps size="sm" color="grey" :icon="palette.visible ? 'ion-close' : 'ion-hammer'" class="q-mr-lg" @click="togglePalette()" />
      <q-space />
      <q-btn round no-caps size="sm" color="primary" icon="ion-add" class="q-mr-sm q-ml-lg" @click="newDiagram()" />
      <q-btn round no-caps size="sm" color="primary" icon="ion-open" class="q-mr-sm" @click="()=>{ this.files.select = !this.files.select }" />
      <q-btn round no-caps size="sm" color="primary" icon="ion-save" class="q-mr-sm" @click="saveDiagram()"/>
      <q-btn round no-caps size="sm" color="primary" icon="ion-copy" class="q-mr-sm" :disable="!objectName" @click="copyDiagram()"/>
      <q-btn round no-caps size="sm" color="primary" :icon="simulation.active ? 'ion-pause' : 'ion-play'" class="q-mr-sm" @click="toggleSimulation()"/>
    </q-toolbar>
    <q-tab-panel name="editor">
    <q-splitter
      v-model="splitter.attributes"
      :limits="[70, 100]"
                    >
      <template v-slot:before>
        <div class="modeler js-canvas bg-white" id="js-canvas" style="height: calc(100vh - 50px - 90px;"></div>
      </template>
      <template v-slot:separator>
        <q-avatar color="primary" text-color="white" size="30px" icon="drag_indicator" />
      </template>
      <template v-slot:after>
          <q-scroll-area style="height: calc(100vh - 50px - 90px;">
            <q-card>
              <q-card-section align="center" class="bg-grey text-white q-ma-xs q-pa-xs">
                <q-item-label>{{ $t('Process.editor.parameters.dialog.title') }}</q-item-label>
              </q-card-section>
              <q-card-section align="left">
                <q-input v-model="selected.element.id" label="element id" disable></q-input>
                <!-- Service Task -->
                <div v-if="selected.businessObject.$type === 'bpmn:ServiceTask'">
                  <q-input v-model="selected.parameterObject.action" label="action"></q-input>
                  <q-input v-model="selected.parameterObject.paramsKey" label="context key (params)"></q-input>
                  <q-input v-model="selected.parameterObject.resultKey" label="context key (result)"></q-input>
                </div>
                <!-- Business Rule Task -->
                <div v-if="selected.businessObject.$type === 'bpmn:BusinessRuleTask'">
                  <q-input v-model="selected.parameterObject.ruleset" label="ruleset"></q-input>
                  <q-select
                    v-model="selected.parameterObject.contextKeys"
                    label="context keys (input)"
                    use-input
                    use-chips
                    multiple
                    hide-dropdown-icon
                    input-debounce="0"
                    new-value-mode="add-unique"
                  ></q-select>
                  <q-input v-model="selected.parameterObject.contextKey" label="context key (result)"></q-input>
                </div>
                <!-- Start Event: Signal Event -->
                <div v-if="selected.businessObject.$type === 'bpmn:StartEvent' && selected.subtype['bpmn:SignalEventDefinition']">
                  <q-input v-model="selected.parameterObject.event" label="internal event"></q-input>
                  <q-input v-model="selected.parameterObject.contextKey" label="context key (payload/metadata)"></q-input>
                </div>
              </q-card-section>
            </q-card>
          </q-scroll-area>
      </template>
    </q-splitter>
    </q-tab-panel>
    <file-select :refresh="files.refresh" :show="files.select" @close="()=>{ this.files.select = false }" @file="loadDiagram" />
    <file-save-as :refresh="files.refresh" :show="files.saveAs" suffix=".bpmn" @close="()=>{ this.files.saveAs = false }" @file="saveDiagramAs" />
  </div>
</template>

<style lang="scss">
/* hide default toggle button of simulation tool (own button used instead) */
.toggle-mode {
  display: none;
}
/* hide palette toggle button of diagram-js (own button is used instead) */
.djs-palette-toggle {
  display: none;
}
</style>

<script>
// vuex store
import { mapGetters } from 'vuex'
// bpmn-js
import BpmnModeler from 'bpmn-js/lib/Modeler'
import diagramXML from 'assets/newDiagram.bpmn'
import 'bpmn-js/dist/assets/diagram-js.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css'
// bpmn-js-token-simulation
import tokenSimulation from 'bpmn-js-token-simulation'
import 'bpmn-js-token-simulation/assets/css/bpmn-js-token-simulation.css'
// meta data extensions
import moddleMetaData from 'assets/bpmnMetaDataExtension.json'
// components
import FileSelect from '../components/main/FileSelect.vue'
import FileSaveAs from '../components/main/FileSaveAs.vue'

export default {
  name: 'Processeditor',
  components: {
    FileSelect,
    FileSaveAs
  },
  data () {
    return {
      files: {
        select: false,
        saveAs: false,
        refresh: 0
      },
      objectName: null,
      splitter: {
        attributes: 80 // start at 80%
      },
      selected: {
        element: {},
        businessObject: {},
        parameterObject: {
          contextKeys: []
        },
        subtype: {}
      },
      palette: {
        visible: true
      },
      simulation: {
        active: false
      }
    }
  },
  computed: {
      ...mapGetters({
          access: 'access'
      })
  },
  created () {
  },
  mounted () {
    // TODO: restore last state
    if (!this.modeler) {
      this.modeler = new BpmnModeler({
        container: '#js-canvas',
        moddleExtensions: {
          fe: moddleMetaData
        },
        additionalModules: [
          tokenSimulation
        ]
      })
    }
    if (!this.objectName) {
      this.newDiagram()
    } else {
      this.loadDiagram(this.objectName)
    }
    this.registerEvents()
  },
  beforeDestroy () {
    // TODO store last state
  },
  methods: {
    togglePalette () {
      let palette = this.modeler.get('palette')
      this.palette.visible = !this.palette.visible
      this.palette.visible ? palette.open() : palette.close()
    },
    toggleSimulation () {
      let eventBus = this.modeler.get('eventBus')
      this.simulation.active = !this.simulation.active
      eventBus.fire('tokenSimulation.toggleMode', { simulationModeActive: this.simulation.active })
    },
    stopSimulation () {
      if (this.simulation.active) {
        this.toggleSimulation()
      }
    },
    getExtension (bo, type) {
      if (!bo.extensionElements) {
        /* Create attributes, if not exists */
        // Business Rule Task
        if (bo.$type === 'bpmn:BusinessRuleTask') {
          let moddle = this.modeler.get('moddle')
          let newParam = moddle.create('fe:ExecutionParameter', {
            'ruleset': '',
            'contextKeys': [],
            'contextKey': ''
          })
          bo.extensionElements = moddle.create('bpmn:ExtensionElements')
          bo.extensionElements.get('values').push(newParam)
          return newParam
        }
        // Start Event
        if (bo.$type === 'bpmn:StartEvent') {
          let moddle = this.modeler.get('moddle')
          let newParam = moddle.create('fe:ExecutionParameter', {
            'event': '',
            'contextKey': ''
          })
          bo.extensionElements = moddle.create('bpmn:ExtensionElements')
          bo.extensionElements.get('values').push(newParam)
          return newParam
        }
        // Service Task
        if (bo.$type === 'bpmn:ServiceTask') {
          let moddle = this.modeler.get('moddle')
          let newParam = moddle.create('fe:ExecutionParameter', {
            'action': '',
            'paramsKey': '',
            'resultKey': ''
          })
          bo.extensionElements = moddle.create('bpmn:ExtensionElements')
          bo.extensionElements.get('values').push(newParam)
          return newParam
        }
        return null
      }
      return bo.extensionElements.values.filter((e) => {
        return e.$instanceOf(type)
      })[0]
    },
    initSelected () {
      this.selected = {
        element: {},
        businessObject: {},
        parameterObject: {
          contextKeys: []
        },
        subtype: {}
      }
    },
    changeSelected (element) {
      if (this.selected.element === element) return
      this.selected.element = element
      this.selected.businessObject = this.selected.element.businessObject
      console.log(this.selected.businessObject)
      if (this.selected.businessObject) {
        this.selected.parameterObject = this.getExtension(this.selected.businessObject, 'fe:ExecutionParameter') || {}
        // convert to array
        if (!this.selected.parameterObject.contextKeys) this.selected.parameterObject.contextKeys = []
        if (this.selected.parameterObject.contextKeys && !Array.isArray(this.selected.parameterObject.contextKeys)) {
          this.selected.parameterObject.contextKeys = this.selected.parameterObject.contextKeys.split(',')
        }
        this.selected.subtype = {}
        // determine event sub type
        if (this.selected.businessObject.eventDefinitions) {
          this.selected.businessObject.eventDefinitions.map((e) => {
            this.selected.subtype[e.$type] = true
          })
        }
      } else {
        this.selected.parameterObject = {}
      }
    },
    registerEvents () {
      let eventBus = this.modeler.get('eventBus')
      eventBus.on('element.click', (e) => {
        this.changeSelected(e.element)
      })
      eventBus.on('selection.changed', (selection) => {
        // console.log('selection.changed', selection)
        if (selection.newSelection && selection.newSelection.length === 1) {
          this.changeSelected(selection.newSelection[0])
        } else {
          this.initSelected()
        }
      })
      eventBus.on('tokenSimulation.toggleMode', (e) => {
        console.log(e)
      })
    },
    async newDiagram () {
      this.stopSimulation()
      try {
        await this.modeler.importXML(diagramXML)
        this.objectName = null
      } catch (err) {
        console.log('Failed to open new diagram:', err)
      }
    },
    loadDiagram (objectName) {
      this.stopSimulation()
      let instance = this.$instance()
      instance.defaults.headers.get['x-imicros-xtoken'] = this.access.token
      instance.defaults.headers.get['Content-Type'] = 'application/octet-stream'
      // this.spinners.push(row.etag)
      instance.get('/#file/' + objectName, {
        responseType: 'text'
      }).then(async (response) => {
        try {
          await this.modeler.importXML(response.data)
          this.objectName = objectName
          this.zoomFit()
        } catch (err) {
          console.log('Failed to open file ' + objectName + ':', err)
        }
      }).catch((err) => {
        console.error(err)
      })
    },
    async saveDiagram () {
      if (!this.objectName) {
        this.files.saveAs = true
        return
      }

      let instance = this.$instance()
      instance.defaults.headers.put['x-imicros-xtoken'] = this.access.token
      instance.defaults.headers.put['x-imicros-filename'] = this.objectName
      instance.defaults.headers.put['Content-Type'] = 'application/octet-stream'
      try {
        let { xml } = await this.modeler.saveXML({ format: true })
        instance.put('/api/upload', xml).then((response) => {
          console.log('File ' + this.objectName + ' saved')
          // trigger refresh file lists of dialogs
          this.files.refresh += 1
        }).catch((err) => {
          console.error('Failed to save file ' + this.objectName, err)
        })
      } catch (err) {
        console.error('Failed to save file ' + this.objectName, err)
      }
    },
    async saveDiagramAs (objectName) {
      this.objectName = objectName
      // hide dialog again
      this.files.saveAs = false
      await this.saveDiagram()
    },
    copyDiagram () {
      this.objectName = null
    },
    zoomIn () {
      this.modeler.get('zoomScroll').stepZoom(-1)
    },
    zoomOut () {
      this.modeler.get('zoomScroll').stepZoom(1)
    },
    zoomFit () {
      this.modeler.get('canvas').zoom('fit-viewport')
      /*
      let currentViewbox = canvas.viewbox()
      canvas.viewbox({
        x: currentViewbox.x - 150,
        y: currentViewbox.y,
        width: currentViewbox.width - 150,
        height: currentViewbox.height
      })
      */
      // move panel width to right
      // TODO: adjust width doesn't work...
    }
  }
}
</script>
