<template>
  <q-splitter
    v-model="splitter.attributes"
    :limits="[70, 100]"
  >
    <template #before>
      <div
        :class="editorClass"
        :id="id"
        style="height: calc(100vh - 50px - 90px;"
      />
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
      <!-- {{ parameters }} -->
      <parameters
        :id="selected.id"
        :type="selected.type"
        :subtype="selected.subtype"
        :parameters="parameters"
        @update:parameters="updateParameters"
      />
    </template>
  </q-splitter>
</template>

<script>
import { markRaw, toRaw } from 'vue'
// import { useQuasar } from 'quasar'
const cloneDeep = require('lodash/cloneDeep')
// vuex store
import { mapGetters } from 'vuex'
// components
import Parameters from './Parameters.vue'
// bpmn-js
import BpmnModeler from 'bpmn-js/lib/Modeler'
import 'bpmn-js/dist/assets/diagram-js.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css'
import { propertiesUpdater } from './propertiesUpdater'
// empty diagram
import diagramXML from './newDiagram.bpmn'
// meta data extensions
import moddleMetaData from './bpmnMetaDataExtension.json'
// mini map
import minimapModule from 'diagram-js-minimap'
import 'diagram-js-minimap/assets/diagram-js-minimap.css'

export default {
  props: {
    id: {
      type: String,
      required: true
    },
    xml: {
      type: String,
      default: '',
      requried: false
    },
    undo: {
      type: Boolean,
      default: false,
      required: false
    },
    redo: {
      type: Boolean,
      default: false,
      required: false
    },
    save: {
      type: String,
      default: '',
      required: false
    },
    svg: {
      type: Boolean,
      default: false,
      required: false
    },
    zoom: {
      type: Number,
      default: 0,
      required: false
    },
    fit: {
      type: Boolean,
      default: false,
      required: false
    },
    minimap: {
      type: Boolean,
      default: false,
      required: false
    },
    palette: {
      type: Boolean,
      default: true,
      required: false
    }
  },
  emits: ['xml', 'svg'],
  components: {
    Parameters
  },
  data () {
    return {
      modeler: null,
      splitter: {
        attributes: 100 // start at 80%
      },
      selected: {
        type: '',
        subtype: {}
      },
      parameters: {}
    }
  },
  computed: {
    ...mapGetters({
      access: 'access'
    }),
    editorClass () {
      return this.$q.dark.isActive ? 'modeler js-canvas dark' : 'modeler js-canvas'
    }
  },
  watch: {
    xml: async function (newVal, oldVal) {
      if (!newVal || newVal === '') {
        this.newDiagram()
      } else {
        await this.modeler.importXML(newVal)
        this.zoomFit()
      }
    },
    undo: function () {
      this.cmdUndo()
    },
    redo: function () {
      this.cmdRedo()
    },
    save: async function (newVal, oldVal) {
      if (newVal === 'xml') {
        const { xml } = await this.modeler.saveXML({ format: true })
        this.$emit('xml', xml)
      }
    },
    zoom: function (newVal, oldVal) {
      newVal < oldVal ? this.zoomIn() : this.zoomOut()
    },
    fit: function (newVal, oldVal) {
      this.zoomFit()
    },
    minimap: function (newVal, oldVal) {
      const minimap = this.modeler.get('minimap')
      newVal ? minimap.open() : minimap.close()
    },
    palette: function (newVal, oldVal) {
      const palette = this.modeler.get('palette')
      newVal ? palette.open() : palette.close()
    },
    svg: function () {
      this.getSVG()
    }/*,
    '$q.dark.isActive' (val) {
      console.log('dark:' + val)
      if (val) {
        this.initModeler({ opts: { defaultFillColor: '#333333', defaultStrokeColor: '#fefefe' } })
      } else {
        this.initModeler({ opts: { } })
      }
    }
    */
  },
  created () {
    // TODO: restore last state
    if (!this.modeler) {
      // const $q = useQuasar()
      // this.initModeler({ opts: { defaultFillColor: '--element-fill', defaultStrokeColor: '--element-stroke' } })
      this.initModeler({ opts: { } })
    }
  },
  mounted () {
    if (this.modeler) {
      this.modeler.attachTo('#' + this.id)
    }
    this.newDiagram()
  },
  methods: {
    initModeler ({ opts }) {
      this.modeler = markRaw(new BpmnModeler({
        // container: '#' + this.id
        bpmnRenderer: opts,
        moddleExtensions: {
          fe: moddleMetaData
        },
        additionalModules: [
          propertiesUpdater,
          minimapModule
        ]
      }))
      this.registerEvents()
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
    },
    async newDiagram () {
      try {
        await this.modeler.importXML(diagramXML)
        this.zoomFit()
      } catch (err) {
        console.log('Failed to open new diagram:', err)
      }
    },
    updateParameters (newVal) {
      const newParameters = toRaw(newVal)
      this.parameters = newParameters
      const selected = toRaw(this.selected)
      if (selected.element) {
        const current = cloneDeep(selected.businessObject.get('extensionElements'))
        const extensionElements = cloneDeep(selected.businessObject.get('extensionElements'))

        let equal = true
        extensionElements.values = extensionElements.values.map((e) => {
          if (e.$instanceOf('fe:ExecutionParameter')) {
            if (JSON.stringify(e) !== JSON.stringify(newParameters)) {
              equal = false
              return cloneDeep(newParameters)
            }
          }
          return e
        })
        if (!equal) {
          const commandStack = this.modeler.get('commandStack')
          commandStack.execute('properties-panel.update-businessobject', {
            element: selected.element,
            // businessObject: this.selected.businessObject,
            businessObject: selected.element.businessObject,
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
    initSelected () {
      this.selected = {
        element: {},
        businessObject: {},
        type: '',
        subtype: {}
      }
      this.parameters = {}
    },
    refreshSelected (element) {
      if (element) {
        this.selected.element = element
        this.selected.id = element.id
        const bo = this.selected.element.businessObject
        this.selected.businessObject = bo
        if (bo) {
          this.selected.type = bo.$type
          this.parameters = toRaw(cloneDeep(this.getExtension(bo, 'fe:ExecutionParameter'))) || {}

          this.selected.subtype = {}
          // determine event sub type
          if (bo.eventDefinitions) {
            bo.eventDefinitions.map((e) => {
              this.selected.subtype[e.$type] = true
              return e
            })
          }
        } else {
          this.parameters = {}
        }
      } else {
        this.initSelected()
      }
    },
    getExtension (bo, type) {
      if (!bo) return {}
      if (!bo.extensionElements) {
        /* Create attributes, if not exists */
        const moddle = this.modeler.get('moddle')
        const newParam = moddle.create('fe:ExecutionParameter', {})
        bo.extensionElements = moddle.create('bpmn:ExtensionElements')
        bo.extensionElements.get('values').push(newParam)
        return newParam
      }
      return bo.extensionElements.values.filter((e) => {
        return e.$instanceOf(type)
      })[0]
    },
    cmdUndo () {
      this.modeler.get('commandStack').undo()
      this.refreshSelected()
    },
    cmdRedo () {
      this.modeler.get('commandStack').redo()
      this.refreshSelected()
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
    async getSVG () {
      const { svg } = await this.modeler.saveSVG({ format: true })
      this.$emit('svg', svg)
    }
  }
}
</script>

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
  background: var(--color-666666);

  --context-pad-entry-background-color: var(--color-333333);
  --context-pad-entry-hover-background-color: var(--color-666666);
}
.dark .djs-direct-editing-content, .dark .djs-direct-editing-parent {
  background: var(--color-ffffff) !important;
  color: var(--color-000000)
}
/*
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
*/
</style>