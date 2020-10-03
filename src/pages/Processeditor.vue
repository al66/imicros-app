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
      <q-btn
        round
        flat
        no-caps
        size="sm"
        color="grey"
        icon="ion-add"
        class="q-mr-sm"
        @click="zoomOut()"
      />
      <q-btn
        round
        flat
        no-caps
        size="sm"
        color="grey"
        icon="ion-remove"
        class="q-mr-sm"
        @click="zoomIn()"
      />
      <q-btn
        round
        flat
        no-caps
        size="sm"
        color="grey"
        icon="ion-code"
        class="q-mr-lg"
        @click="zoomFit()"
      />
      <q-btn
        round
        flat
        no-caps
        size="sm"
        color="grey"
        :icon="editMode ? 'ion-eye' : 'ion-create'"
        class="q-mr-lg"
        @click="toggleEdit()"
      />
      <q-btn
        :disable="!editMode"
        round
        flat
        no-caps
        size="sm"
        color="grey"
        icon="ion-undo"
        class="q-mr-sm"
        @click="undo()"
      />
      <q-btn
        :disable="!editMode"
        round
        flat
        no-caps
        size="sm"
        color="grey"
        icon="ion-redo"
        class="q-mr-sm"
        @click="redo()"
      />
      <q-btn
        :disable="!editMode"
        round
        flat
        no-caps
        size="sm"
        color="grey"
        :icon="palette.visible ? 'ion-hammer' : 'ion-hammer'"
        class="q-mr-lg"
        @click="togglePalette()"
      />
      <q-space />
      <q-btn
        round
        no-caps
        size="sm"
        color="primary"
        icon="ion-add"
        class="q-mr-sm q-ml-lg"
        @click="newDiagram()"
      />
      <q-btn
        round
        no-caps
        size="sm"
        color="primary"
        icon="ion-open"
        class="q-mr-sm"
        @click="()=>{ this.files.select = !this.files.select }"
      />
      <q-btn
        round
        no-caps
        size="sm"
        color="primary"
        icon="ion-save"
        class="q-mr-sm"
        @click="saveDiagram()"
      />
      <q-btn
        round
        no-caps
        size="sm"
        color="primary"
        icon="ion-copy"
        class="q-mr-sm"
        :disable="!objectName"
        @click="copyDiagram()"
      />
      <q-btn
        round
        no-caps
        size="sm"
        color="primary"
        :icon="simulation.active ? 'ion-pause' : 'ion-play'"
        class="q-mr-sm"
        @click="toggleSimulation()"
      />
    </q-toolbar>
    <q-tab-panel name="editor">
      <q-splitter
        v-model="splitter.attributes"
        :limits="[70, 100]"
      >
        <template v-slot:before>
          <div
            v-show="editMode"
            class="modeler js-canvas bg-white"
            id="js-canvas"
            style="height: calc(100vh - 50px - 90px;"
          />
          <div
            v-show="!editMode"
            class="modeler js-canvas-viewer bg-white"
            id="js-canvas-viewer"
            style="height: calc(100vh - 50px - 90px;"
          />
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
          <q-scroll-area style="height: calc(100vh - 50px - 90px;">
            <q-card>
              <q-card-section
                align="center"
                class="bg-grey text-white q-ma-xs q-pa-xs"
              >
                <q-item-label>{{ $t('Process.editor.parameters.dialog.title') }}</q-item-label>
              </q-card-section>
              <q-card-section
                align="left"
              >
                <q-input
                  v-if="selected.element.id"
                  v-model="selected.element.id"
                  label="element id"
                  disable
                />
                <!-- Service Task -->
                <div v-if="selected.businessObject && selected.businessObject.$type === 'bpmn:ServiceTask'">
                  <q-select
                    v-model="selected.parameterObject.contextKeys"
                    label="context keys (input preparation step)"
                    :readonly="!editMode"
                    use-input
                    use-chips
                    multiple
                    hide-dropdown-icon
                    input-debounce="0"
                    new-value-mode="add-unique"
                    @input="updateProperties"
                  />
                  <q-input
                    v-model="selected.parameterObject.ruleset"
                    label="ruleset for preparation of parameters"
                    :readonly="!editMode"
                    @change="updateProperties"
                  />
                  <q-select
                    v-model="selected.parameterObject.paramsKey"
                    label="context key (action parameters)"
                    :readonly="!editMode"
                    use-input
                    use-chips
                    hide-dropdown-icon
                    input-debounce="0"
                    new-value-mode="add-unique"
                    @input="updateProperties"
                  />
                  <q-input
                    v-model="selected.parameterObject.action"
                    label="action"
                    label-color="orange"
                    :readonly="!editMode"
                    @change="updateProperties"
                  />
                  <q-select
                    v-model="selected.parameterObject.resultKey"
                    label="context key (result)"
                    :readonly="!editMode"
                    use-input
                    use-chips
                    hide-dropdown-icon
                    input-debounce="0"
                    new-value-mode="add-unique"
                    @input="updateProperties"
                  />
                </div>
                <!-- Business Rule Task -->
                <div v-if="selected.businessObject && selected.businessObject.$type === 'bpmn:BusinessRuleTask'">
                  <q-input
                    v-model="selected.parameterObject.ruleset"
                    label="ruleset"
                    :readonly="!editMode"
                    @change="updateProperties"
                  />
                  <q-select
                    v-model="selected.parameterObject.contextKeys"
                    label="context keys (input)"
                    :readonly="!editMode"
                    use-input
                    use-chips
                    multiple
                    hide-dropdown-icon
                    input-debounce="0"
                    new-value-mode="add-unique"
                    @input="updateProperties"
                  />
                  <q-input
                    v-model="selected.parameterObject.contextKey"
                    label="context key (result)"
                    :readonly="!editMode"
                    @change="updateProperties"
                  />
                </div>
                <!-- Start Event: Signal Event -->
                <div v-if="selected.businessObject && selected.businessObject.$type === 'bpmn:StartEvent' && selected.subtype['bpmn:SignalEventDefinition']">
                  <q-input
                    v-model="selected.parameterObject.event"
                    label="internal event"
                    :readonly="!editMode"
                    @change="updateProperties"
                  />
                  <q-select
                    v-model="selected.parameterObject.contextKey"
                    label="context key (payload/metadata)"
                    :readonly="!editMode"
                    use-input
                    use-chips
                    hide-dropdown-icon
                    input-debounce="0"
                    new-value-mode="add-unique"
                    @input="updateProperties"
                  />
                </div>
              </q-card-section>
            </q-card>
          </q-scroll-area>
        </template>
      </q-splitter>
    </q-tab-panel>
    <file-select
      :refresh="files.refresh"
      :show="files.select"
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
import NavigatedViewer from 'bpmn-js/lib/NavigatedViewer'
// bpmn-js-token-simulation
import tokenSimulation from 'bpmn-js-token-simulation'
import 'bpmn-js-token-simulation/assets/css/bpmn-js-token-simulation.css'
// meta data extensions
import moddleMetaData from 'assets/bpmnMetaDataExtension.json'
// components
import FileSelect from '../components/main/FileSelect.vue'
import FileSaveAs from '../components/main/FileSaveAs.vue'
import { propertiesUpdater } from '../components/process/propertiesUpdater'

const cloneDeep = require('lodash/cloneDeep')

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
      mode: 'display',
      editMode: true,
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
          tokenSimulation,
          propertiesUpdater
        ]
      })
    }
    if (!this.viewer) {
      // this.viewer = new BpmnModeler.Viewer({
      this.viewer = new NavigatedViewer({
        container: '#js-canvas-viewer',
        moddleExtensions: {
          fe: moddleMetaData
        }
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
    toggleEdit () {
      // synchronize selected element
      if (this.selected.element) {
        const elementRegistry = this.editMode ? this.viewer.get('elementRegistry') : this.modeler.get('elementRegistry')
        const selection = this.editMode ? this.viewer.get('selection') : this.modeler.get('selection')
        const current = elementRegistry.get(this.selected.element.id)
        selection.select(current)
      }
      this.editMode = !this.editMode
    },
    undo () {
      this.modeler.get('commandStack').undo()
      this.refreshSelected()
    },
    redo () {
      this.modeler.get('commandStack').redo()
      this.refreshSelected()
    },
    updateProperties () {
      if (this.selected.element) {
        const current = cloneDeep(this.selected.businessObject.get('extensionElements'))
        const extensionElements = cloneDeep(this.selected.businessObject.get('extensionElements'))

        let equal = true
        extensionElements.values = extensionElements.values.map((e) => {
                if (e.$instanceOf('fe:ExecutionParameter')) {
                  if (JSON.stringify(e) !== JSON.stringify(this.selected.parameterObject)) {
                    equal = false
                    return cloneDeep(this.selected.parameterObject)
                  }
                }
                return e
              })

        if (!equal) {
          const commandStack = this.modeler.get('commandStack')
          commandStack.execute('properties-panel.update-businessobject', {
            element: this.selected.element,
            businessObject: this.selected.businessObject,
            properties: {
              extensionElements: extensionElements
            },
            oldProperties: {
              extensionElements: current
            }
          })
        }
      }
    },
    togglePalette () {
      const palette = this.modeler.get('palette')
      this.palette.visible = !this.palette.visible
      this.palette.visible ? palette.open() : palette.close()
    },
    toggleSimulation () {
      const eventBus = this.modeler.get('eventBus')
      this.simulation.active = !this.simulation.active
      eventBus.fire('tokenSimulation.toggleMode', { simulationModeActive: this.simulation.active })
      const palette = this.modeler.get('palette')
      this.palette.visible = !this.simulation.active
      this.palette.visible ? palette.open() : palette.close()
    },
    stopSimulation () {
      if (this.simulation.active) {
        this.toggleSimulation()
      }
    },
    getExtension (bo, type) {
      if (!bo) return {}
      if (!bo.extensionElements) {
        /* Create attributes, if not exists */
        // Business Rule Task
        if (bo.$type === 'bpmn:BusinessRuleTask') {
          const moddle = this.modeler.get('moddle')
          const newParam = moddle.create('fe:ExecutionParameter', {
            ruleset: '',
            contextKeys: [],
            contextKey: ''
          })
          bo.extensionElements = moddle.create('bpmn:ExtensionElements')
          bo.extensionElements.get('values').push(newParam)
          return newParam
        }
        // Start Event
        if (bo.$type === 'bpmn:StartEvent') {
          const moddle = this.modeler.get('moddle')
          const newParam = moddle.create('fe:ExecutionParameter', {
            event: '',
            contextKey: ''
          })
          bo.extensionElements = moddle.create('bpmn:ExtensionElements')
          bo.extensionElements.get('values').push(newParam)
          return newParam
        }
        // Service Task
        if (bo.$type === 'bpmn:ServiceTask') {
          const moddle = this.modeler.get('moddle')
          const newParam = moddle.create('fe:ExecutionParameter', {
            contextKeys: [],
            ruleset: '',
            paramsKey: null,
            action: '',
            resultKey: null
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
    refreshSelected (element) {
      function toArray (contextKeys) {
        if (!contextKeys) contextKeys = []
        if (contextKeys && !Array.isArray(contextKeys)) contextKeys = contextKeys.split(',')
        return contextKeys
      }

      if (element) this.selected.element = element
      if (!this.selected.element) return
      this.selected.businessObject = this.selected.element.businessObject
      if (this.selected.businessObject) {
        this.selected.parameterObject = cloneDeep(this.getExtension(this.selected.businessObject, 'fe:ExecutionParameter')) || {}
        // convert to array
        this.selected.parameterObject.contextKeys = toArray(this.selected.parameterObject.contextKeys)

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
      // modeler events
      const eventBus = this.modeler.get('eventBus')
      eventBus.on('element.click', (e) => {
        this.refreshSelected(e.element)
      })
      eventBus.on('selection.changed', (selection) => {
        // console.log('selection.changed', selection)
        if (selection.newSelection && selection.newSelection.length === 1) {
          this.refreshSelected(selection.newSelection[0])
        } else {
          this.initSelected()
        }
      })
      eventBus.on('tokenSimulation.toggleMode', (e) => {
        console.log(e)
      })
      // viewer events
      const eventBusViewer = this.viewer.get('eventBus')
      eventBusViewer.on('element.click', (e) => {
        this.refreshSelected(e.element)
      })
      eventBusViewer.on('selection.changed', (selection) => {
        // console.log('selection.changed', selection)
        if (selection.newSelection && selection.newSelection.length === 1) {
          this.refreshSelected(selection.newSelection[0])
        } else {
          this.initSelected()
        }
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
      const instance = this.$instance()
      instance.defaults.headers.get['x-imicros-xtoken'] = this.access.token
      instance.defaults.headers.get['Content-Type'] = 'application/octet-stream'
      // this.spinners.push(row.etag)
      instance.get('/#file/' + objectName, {
        responseType: 'text'
      }).then(async (response) => {
        try {
          await this.modeler.importXML(response.data)
          await this.viewer.importXML(response.data)
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

      const instance = this.$instance()
      instance.defaults.headers.put['x-imicros-xtoken'] = this.access.token
      instance.defaults.headers.put['x-imicros-filename'] = this.objectName
      instance.defaults.headers.put['Content-Type'] = 'application/octet-stream'
      try {
        const { xml } = await this.modeler.saveXML({ format: true })
        instance.put('/api/upload', xml).then((response) => {
          console.log('File ' + this.objectName + ' saved')
          // trigger refresh file lists of dialogs
          this.files.refresh += 1
          // trigger refresh of viewer
          this.viewer.importXML(xml)
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
      this.editMode ? this.modeler.get('zoomScroll').zoom(-0.5) : this.viewer.get('zoomScroll').zoom(-0.5)
      // this.modeler.get('zoomScroll').stepZoom(-1)
    },
    zoomOut () {
      this.editMode ? this.modeler.get('zoomScroll').zoom(0.5) : this.viewer.get('zoomScroll').zoom(0.5)
      // this.modeler.get('zoomScroll').stepZoom(1)
    },
    zoomFit () {
      this.editMode ? this.modeler.get('canvas').zoom('fit-viewport') : this.viewer.get('canvas').zoom('fit-viewport')
    }
  }
}
</script>
