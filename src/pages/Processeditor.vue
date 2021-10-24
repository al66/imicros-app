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
        @click="zoomOut()"
      />
      <toolbar-btn
        sub
        icon="ion-remove"
        @click="zoomIn()"
      />
      <toolbar-btn
        sub
        icon="ion-code"
        @click="zoomFit()"
      />
      <toolbar-btn
        sub
        icon="ion-map"
        @click="toggleMinimap()"
      />
      <q-space />
      <toolbar-btn
        sub
        icon="ion-undo"
        @click="undo()"
      />
      <toolbar-btn
        sub
        icon="ion-redo"
        @click="redo()"
      />
      <toolbar-btn
        sub
        :icon="palette.visible ? 'ion-hammer' : 'ion-hammer'"
        @click="togglePalette()"
      />
      <q-space />
      <toolbar-btn
        icon="ion-add"
        @click="newDiagram()"
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
      <toolbar-btn
        :icon="simulation.active ? 'ion-pause' : 'ion-play'"
        :disable="!editMode"
        @click="toggleSimulation()"
      />
    </q-toolbar>
    <q-tab-panel name="editor">
      <q-splitter
        v-model="splitter.attributes"
        :limits="[70, 100]"
      >
        <template #before>
          <div
            v-show="editMode"
            :class="editorClass"
            id="js-canvas"
            style="height: calc(100vh - 50px - 90px;"
          />
          <!--
          <div
            v-show="editMode"
            :class="$q.dark.isActive ? 'modeler js-canvas dark' : 'modeler js-canvas'"
            id="js-canvas"
            style="height: calc(100vh - 50px - 90px;"
          />
          -->
          <!--
          <div
            v-show="!editMode"
            class="modeler js-canvas-viewer bg-white"
            id="js-canvas-viewer"
            style="height: calc(100vh - 50px - 90px;"
          />
          -->
        </template>
        <template #separator>
          <q-avatar
            color="primary"
            text-color="white"
            size="30px"
            icon="drag_indicator"
          />
        </template>
        <template #after>
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
                  :label="$t('Process.editor.parameters.dialog.label.elementId')"
                  stack-label
                  disable
                />
                <!-- Service Task -->
                <div v-if="selected.businessObject && selected.businessObject.$type === 'bpmn:ServiceTask'">
                  <q-option-group
                    v-model="selected.parameterObject.prepFunction"
                    :options="optionsPreparation"
                    inline
                    @input="changePrepFunction"
                  />
                  <q-select
                    v-if="selected.parameterObject.prepFunction && selected.parameterObject.prepFunction !== ''"
                    v-model="selected.parameterObject.contextKeys"
                    :label="$t('Process.editor.parameters.dialog.label.contextKeyPreparation')"
                    stack-label
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
                    v-if="selected.parameterObject.prepFunction === 'template'"
                    v-model="selected.parameterObject.template"
                    label="Template for mapping of parameters"
                    stack-label
                    readonly
                    @change="updateProperties"
                  >
                    <template #before>
                      <q-btn
                        v-if="selected.parameterObject.prepFunction === 'template'"
                        class="justify-center"
                        size="sm"
                        color="primary"
                        icon="edit"
                        @click="editTemplate"
                      />
                    </template>
                  </q-input>
                  <q-input
                    v-if="selected.parameterObject.prepFunction === 'ruleset'"
                    v-model="selected.parameterObject.ruleset"
                    :label="$t('Process.editor.parameters.dialog.label.rulesetPreparation')"
                    stack-label
                    :readonly="!editMode"
                    @change="updateProperties"
                  />
                  <q-select
                    v-model="selected.parameterObject.paramsKey"
                    :label="$t('Process.editor.parameters.dialog.label.contextKeyTask')"
                    stack-label
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
                    :label="$t('Process.editor.parameters.dialog.label.action')"
                    stack-label
                    :readonly="!editMode"
                    clearable
                    @change="updateProperties"
                  />
                  <q-select
                    v-model="selected.parameterObject.serviceId"
                    :options="optionsAgents"
                    :label="$t('Process.editor.parameters.dialog.label.agent')"
                    stack-label
                    clearable
                    emit-value
                    map-options
                    @input="updateProperties"
                  />
                  <!--
                  <q-input
                    v-model="selected.parameterObject.serviceId"
                    label="agent"
                    stack-label
                    :readonly="!editMode"
                    @change="updateProperties"
                  />
                  -->
                  <q-select
                    v-model="selected.parameterObject.resultKey"
                    :label="$t('Process.editor.parameters.dialog.label.contextKeyResult')"
                    stack-label
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
                    :label="$t('Process.editor.parameters.dialog.label.ruleset')"
                    label-color="orange"
                    stack-label
                    :readonly="!editMode"
                    @change="updateProperties"
                  />
                  <q-select
                    v-model="selected.parameterObject.contextKeys"
                    label="context keys (input)"
                    stack-label
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
                    stack-label
                    :readonly="!editMode"
                    @change="updateProperties"
                  />
                </div>
                <!-- Start Event: Signal Event -->
                <div v-if="selected.businessObject && selected.businessObject.$type === 'bpmn:StartEvent' && selected.subtype['bpmn:SignalEventDefinition']">
                  <q-input
                    v-model="selected.parameterObject.event"
                    label="internal event"
                    stack-label
                    :readonly="!editMode"
                    @change="updateProperties"
                  />
                  <q-select
                    v-model="selected.parameterObject.contextKey"
                    label="context key (payload/metadata)"
                    stack-label
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

    <q-dialog
      v-model="template.edit"
      @show="editor.focus()"
      full-width
      full-height
    >
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
          <editor
            v-model="template.data"
            @init="editorInit"
            lang="json"
            :theme="template.theme"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            dense
            flat
            icon="ion-checkmark"
            :label="$t('Action.save')"
            color="primary"
            @click="saveTemplate"
          />
          <q-btn
            dense
            flat
            icon="ion-close-circle"
            color="grey"
            @click="()=>{ this.template.edit = false }"
          >
            <q-tooltip>{{ $t('Action.cancel') }}</q-tooltip>
          </q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>
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
/* hide toggler in minimap */
.djs-minimap .toggle {
  display: none;
}
/* editor settings for light mode */
.djs-container {
  --element-fill: #fefefe;
  --element-stroke: #000000;
}
/* editor settings for dark mode */
.dark .djs-container {

  --blue-base-65: #4d90ff;
  --blue-base-65-opacity-30: rgba(77, 144, 255, 0.3);
  --blue-darken-48: #005df7;
  --blue-darken-55: #1a70ff;
  --blue-lighten-82: #a2c5ff;

  --orange-base-60: #ffa533;
  --orange-base-60-opacity-30: rgba(255, 165, 51, 0.3);
  --orange-base-60-opacity-50: rgba(255, 165, 51, 0.5);
  --orange-lighten-85: #ffddb3;

  --red-base-62: #ff3d3d;
  --red-base-62-opacity-10: rgba(255, 61, 61, 0.1);

  --silver-darken-94: #efefef;

  --color-000000: #000000;
  --color-000000-opacity-05: rgba(0, 0, 0, 0.05);
  --color-000000-opacity-10: rgba(0, 0, 0, 0.1);
  --color-333333: #333333;
  --color-666666: #666666;
  --color-aaaaaa: #aaaaaa;
  --color-cccccc: #cccccc;
  --color-cdcdcd: #cdcdcd;
  --color-dddddd: #dddddd;
  --color-f6f6f6: #f6f6f6;
  --color-fafafa: #fafafa;
  --color-fefefe: #fefefe;
  --color-ffffff: #ffffff;

  --element-fill: #333333;
  --element-stroke: #fefefe;

  --bendpoint-fill-color: var(--blue-base-65-opacity-30);
  --bendpoint-stroke-color: var(--blue-base-65);

  --context-pad-entry-background-color: var(--color-333333);
  --context-pad-entry-hover-background-color: var(--color-666666);

  --element-dragger-color: var(--blue-base-65);
  --element-hover-outline-fill-color: var(--blue-darken-48);
  --element-selected-outline-stroke-color: var(--blue-base-65);

  --lasso-fill-color: var(--color-000000-opacity-05);
  --lasso-stroke-color: var(--color-000000);

  --palette-entry-color: var(--orange-base-60);
  --palette-entry-hover-color: var(--color-ffffff);
  --palette-entry-selected-color: var(--color-ffffff);
  --palette-separator-color: var(--color-ffffff);
  --palette-toggle-hover-background-color: var(--color-666666);
  --palette-background-color: var(--color-333333);
  --palette-border-color: var(--color-cccccc);

  --popup-body-background-color: var(--color-333333);
  --popup-header-entry-selected-color: var(--blue-base-65);
  --popup-header-entry-selected-background-color: var(--color-000000);
  --popup-header-separator-color: var(--color-666666);
  --popup-background-color: var(--color-666666);
  --popup-border-color: var(--color-cccccc);

  --resizer-fill-color: var(--blue-base-65-opacity-30);
  --resizer-stroke-color: var(--blue-base-65);

  --search-container-background-color: var(--color-fafafa);
  --search-container-border-color: var(--blue-darken-55);
  --search-container-box-shadow-color: var(--blue-lighten-82);
  --search-container-box-shadow-inset-color: var(--color-cdcdcd);
  --search-input-border-color: var(--color-cccccc);
  --search-result-border-color: var(--color-aaaaaa);
  --search-result-highlight-color: var(--color-000000);
  --search-result-selected-color: var(--blue-base-65-opacity-30);

  --shape-attach-allowed-stroke-color: var(--blue-base-65);
  --shape-connect-allowed-fill-color: var(--color-000000-opacity-05);
  --shape-drop-allowed-fill-color: var(--color-000000-opacity-05);
  --shape-drop-not-allowed-fill-color: var(--red-base-62-opacity-10);
  --shape-resize-preview-stroke-color: var(--blue-base-65);

  --snap-line-stroke-color: var(--blue-base-65-opacity-30);

  --space-tool-crosshair-stroke-color: var(--color-000000);

  --tooltip-error-background-color: var(--red-base-62-opacity-10);
  --tooltip-error-border-color: var(--red-base-62);
  --tooltip-error-color: var(--red-base-62);
}
.dark .djs-direct-editing-content, .dark .djs-direct-editing-parent {
  background: var(--color-000000) !important;
}
</style>

<script>
// vuex store
import { mapGetters } from 'vuex'
// toolbar button
import ToolbarBtn from '../components/global/ToolbarBtn.vue'
// bpmn-js
import BpmnModeler from 'bpmn-js/lib/Modeler'
// import BpmnRenderer from 'bpmn-js/lib/draw/BpmnRenderer'
import diagramXML from 'assets/newDiagram.bpmn'
import 'bpmn-js/dist/assets/diagram-js.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css'
// import NavigatedViewer from 'bpmn-js/lib/NavigatedViewer'
// bpmn-js-token-simulation
import tokenSimulation from 'bpmn-js-token-simulation'
import 'bpmn-js-token-simulation/assets/css/bpmn-js-token-simulation.css'
// meta data extensions
import moddleMetaData from 'assets/bpmnMetaDataExtension.json'
// mini map
import minimapModule from 'diagram-js-minimap'
import 'diagram-js-minimap/assets/diagram-js-minimap.css'
// components
import FileSelect from '../components/main/FileSelect.vue'
import FileSaveAs from '../components/main/FileSaveAs.vue'
import { propertiesUpdater } from '../components/process/propertiesUpdater'
// editor
import Editor from 'vue2-ace-editor'

const cloneDeep = require('lodash/cloneDeep')

export default {
  name: 'Processeditor',
  components: {
    FileSelect,
    FileSaveAs,
    ToolbarBtn,
    Editor
  },
  /*
  events: {
      'vue-ace-editor:init': function () {
          require('brace/ext/language_tools')
          require('brace/mode/json')
          require('brace/theme/chrome')
          require('brace/theme/monokai')
      }
  },
  */
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
      minimap: {
        visible: false
      },
      palette: {
        visible: true
      },
      simulation: {
        active: false
      },
      modelerSettings: {

      },
      template: {
        edit: false,
        data: '',
        theme: 'chrome'
      },
      agents: {
        data: []
      }
    }
  },
  computed: {
    ...mapGetters({
      access: 'access'
    }),
    editorClass () {
      return this.$q.dark.isActive ? 'modeler js-canvas dark' : 'modeler js-canvas'
    },
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
    },
    '$q.dark.isActive' (val) {
      console.log(val ? 'On dark mode' : 'On light mode')
      val ? this.template.theme = 'monokai' : this.template.theme = 'chrome'
    }
  },
  created () {
  },
  mounted () {
    // short keys
    document.addEventListener('keydown', this.doSave)

    // TODO: restore last state
    if (!this.modeler) {
      this.initModeler({ opts: { defaultFillColor: 'var(--element-fill)', defaultStrokeColor: 'var(--element-stroke)' } })
    }
    if (!this.objectName) {
      this.newDiagram()
    } else {
      this.loadDiagram(this.objectName)
    }
    this.registerEvents()
    this.refreshAgents()
  },
  beforeUnmount () {
    // short keys
    document.removeEventListener('keydown', this.doSave)
    // TODO store last state
  },
  methods: {
    initModeler ({ opts }) {
      this.modeler = new BpmnModeler({
        container: '#js-canvas',
        moddleExtensions: {
          fe: moddleMetaData
        },
        bpmnRenderer: opts,
        additionalModules: [
          tokenSimulation,
          propertiesUpdater,
          minimapModule
        ]
      })
    },
    editorInit: function (editor) {
      require('brace/ext/language_tools') // language extension prerequsite...
      require('brace/mode/json')
      require('brace/theme/monokai')
      require('brace/theme/chrome')
      editor.setOptions({
        autoScrollEditorIntoView: true,
        maxLines: 'Infinity',
        minLines: 20
      })
      this.editor = editor
    },
    toggleEdit () {
      /*
      // stop simulation, if active
      if (this.editMode) this.stopSimulation()
      // close minimap to avoid calculation errors of the selected range
      if (this.minimap.visible) {
        // const minimap = this.editMode ? this.modeler.get('minimap') : this.viewer.get('minimap')
        const minimap = this.modeler.get('minimap')
        minimap.close()
        this.minimap.visible = false
      }
      // synchronize selected element
      if (this.selected.element) {
        const elementRegistry = this.editMode ? this.viewer.get('elementRegistry') : this.modeler.get('elementRegistry')
        const selection = this.editMode ? this.viewer.get('selection') : this.modeler.get('selection')
        const current = elementRegistry.get(this.selected.element.id)
        selection.select(current)
      }
      this.editMode = !this.editMode
      */
    },
    toggleMinimap () {
      // const minimap = this.editMode ? this.modeler.get('minimap') : this.viewer.get('minimap')
      const minimap = this.modeler.get('minimap')
      this.minimap.visible = !this.minimap.visible
      this.minimap.visible ? minimap.open() : minimap.close()
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
            prepFunction: '',
            ruleset: '',
            template: '',
            paramsKey: null,
            action: '',
            serviceId: null,
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
            return e
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
        // console.log(e)
      })
      // viewer events
      /*
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
      */
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
          // await this.viewer.importXML(response.data)
          this.objectName = objectName
          this.zoomFit()
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
          // this.viewer.importXML(xml)
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
      // this.editMode ? this.modeler.get('zoomScroll').zoom(-0.5) : this.viewer.get('zoomScroll').zoom(-0.5)
      this.modeler.get('zoomScroll').zoom(-0.5)
      // this.modeler.get('zoomScroll').stepZoom(-1)
    },
    zoomOut () {
      // this.editMode ? this.modeler.get('zoomScroll').zoom(0.5) : this.viewer.get('zoomScroll').zoom(0.5)
      this.modeler.get('zoomScroll').zoom(0.5)
      // this.modeler.get('zoomScroll').stepZoom(1)
    },
    zoomFit () {
      // this.editMode ? this.modeler.get('canvas').zoom('fit-viewport') : this.viewer.get('canvas').zoom('fit-viewport')
      this.modeler.get('canvas').zoom('fit-viewport')
    },
    changePrepFunction () {
      switch (this.selected.parameterObject.prepFunction) {
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
    editTemplate () {
      // this.template.data = this.selected.parameterObject.template
      this.template.data = Buffer.from(this.selected.parameterObject.template, 'base64').toString('ascii')
      this.template.edit = true
    },
    saveTemplate () {
      // this.selected.parameterObject.template = this.template.data
      this.selected.parameterObject.template = Buffer.from(this.template.data).toString('base64')
      this.updateProperties()
      this.template.edit = false
    },
    refreshAgents () {
      if (!this.access.token) return
      //
      const instance = this.$instance()
      instance.defaults.headers.get['x-imicros-xtoken'] = this.access.token
      return new Promise((resolve, reject) => {
        instance.get('/api/agents/getAll').then((response) => {
          if (response.data && Array.isArray(response.data)) {
            this.agents.data = response.data
            resolve()
          }
        }).catch((err) => {
          console.log(err)
          reject()
        })
      })
    }
  }
}
</script>

<i18n src="./Processeditor.de.json"></i18n>
<i18n src="./Processeditor.en-us.json"></i18n>
