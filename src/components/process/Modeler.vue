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
        :context-keys="contextKeys"
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
import Parameters from 'src/components/process/Parameters.vue'
// bpmn-js
import BpmnModeler from 'bpmn-js/lib/Modeler'
import 'bpmn-js/dist/assets/diagram-js.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css'
import { propertiesUpdater } from './propertiesUpdater'
// empty diagram
import diagramXML from 'src/components/process/newDiagram.bpmn'
// meta data extensions
import moddleMetaData from 'src/components/process/bpmnMetaDataExtension.json'
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
        subtype: ''
      },
      parameters: markRaw({}),
      contextKeys: []
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
          flow: moddleMetaData
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
    initSelected () {
      this.selected = {
        element: {},
        businessObject: {},
        type: '',
        subtype: ''
      }
      this.parameters = {}
    },
    refreshSelected (element) {
      if (!element) {
        const elementRegistry = this.modeler.get('elementRegistry')
        element = elementRegistry.get(this.selected.id)
      }
      if (element) {
        const deletePrefix = /(\/?)\w+:(\w+\/?) ?(\w+:\w+.*)?/g
        this.selected.element = element
        this.selected.id = element.id
        const bo = this.selected.element.businessObject
        this.selected.businessObject = bo
        if (bo) {
          this.selected.type = bo.$type.replace(deletePrefix, '$1$2')
          this.selected.subtype = ''
          // determine event sub type
          if (bo.eventDefinitions) {
            console.log(toRaw(bo.eventDefinitions))
            bo.eventDefinitions.forEach((e) => {
              this.selected.subtype = e.$type.toString().replace(deletePrefix, '$1$2')
              console.log(this.selected.subtype)
            })
          }
        }
        this.getParameter()
      } else {
        this.initSelected()
      }
    },
    getParameter () {
      const parameters = {}
      if (this.selected?.businessObject) {
        parameters.elementName = this.selected.businessObject.name
      }
      if (this.selected?.businessObject?.extensionElements) {
        const values = this.selected.businessObject.extensionElements.get('values')
        // map extensions to parameters
        values.forEach(element => {
          if (element.$instanceOf('flow:ServiceTask')) {
            parameters.action = element.action
            parameters.serviceId = element.serviceId
            parameters.contextInMultiple = []
            if (Array.isArray(element.context)) {
              element.context.forEach(e => {
                if (e.io === 'in') parameters.contextIn = e.key
                if (e.io === 'out') parameters.contextOut = e.key
              })
            }
            if (element.preparation) {
              parameters.template = element.preparation.template
              if (element.preparation.context) {
                element.preparation.context.forEach(e => {
                  if (e.io === 'in') parameters.contextInMultiple.push(e.key)
                })
              }
            }
          }
          if (element.$instanceOf('flow:BusinessRuleTask')) {
            parameters.objectName = element.source?.objectName || ''
            parameters.embedded = element.source?.embedded || false
            parameters.contextInMultiple = []
            if (Array.isArray(element.context)) {
              element.context.forEach(e => {
                if (e.io === 'in') parameters.contextInMultiple.push(e.key)
                if (e.io === 'out') parameters.contextOut = e.key
              })
            }
          }
          if (element.$instanceOf('flow:StartEvent')) {
            parameters.eventName = element.eventName
            parameters.messageName = element.messageName
            if (element.condition) parameters.condition = element.condition.body
            if (element.context) parameters.contextOut = element.context.key
            if (element.timer) parameters.cycle = element.timer.cycle
          }
          if (element.$instanceOf('flow:IntermediateEvent')) {
            parameters.eventName = element.eventName
            if (element.messageName) {
              parameters.messageName = element.messageName
              parameters.action = element.action
            }
            if (element.preparation) {
              parameters.template = element.preparation.template
              parameters.contextInMultiple = []
              if (element.preparation.context) {
                element.preparation.context.forEach(e => {
                  if (e.io === 'in') parameters.contextInMultiple.push(e.key)
                })
              }
            }
            if (element.context) parameters.contextOut = element.context.key
            if (element.condition) parameters.condition = element.condition.body
            if (element.timer) parameters.duration = element.timer.duration
            if (element.error) {
              parameters.errorCode = element.error.code
              parameters.errorText = element.error.text
            }
          }
          if (element.$instanceOf('flow:EndEvent')) {
            parameters.eventName = element.eventName
            if (element.messageName) {
              parameters.messageName = element.messageName
              parameters.action = element.action
            }
            if (element.preparation) {
              parameters.template = element.preparation.template
              parameters.contextInMultiple = []
              if (element.preparation.context) {
                element.preparation.context.forEach(e => {
                  if (e.io === 'in') parameters.contextInMultiple.push(e.key)
                })
              }
            }
            if (element.context) parameters.contextOut = element.context.key
            if (element.error) {
              parameters.errorCode = element.error.code
              parameters.errorText = element.error.text
            }
          }
          if (element.$instanceOf('flow:SequenceFlow')) {
            if (element.condition) parameters.condition = element.condition.body
            parameters.contextInMultiple = []
            if (Array.isArray(element.context)) {
              element.context.forEach(e => {
                if (e.io === 'in') parameters.contextInMultiple.push(e.key)
              })
            }
          }
        })
      }
      this.parameters = parameters
    },
    updateParameters (newVal) {
      const parameters = toRaw(newVal)
      // this.parameters = parameters
      // update element attributes
      const elementRegistry = this.modeler.get('elementRegistry')
      const modeling = this.modeler.get('modeling')
      const element = elementRegistry.get(this.selected.id)
      if (element.businessObject.name !== parameters.elementName) {
        modeling.updateProperties(element, { name: this.parameters.elementName })
        return
      }
      // udpate business object
      const moddle = this.modeler.get('moddle')
      // create extension element, if not exist
      if (this.selected?.businessObject && !this.selected?.businessObject?.extensionElements) {
        this.selected.businessObject.extensionElements = moddle.create('bpmn:ExtensionElements')
      }
      if (this.selected?.businessObject?.extensionElements) {
        const selected = toRaw(this.selected)
        // map parameters to extension
        const current = cloneDeep(this.selected.businessObject.get('extensionElements'))
        const updated = cloneDeep(current)
        // delete old elements
        updated.values = updated.get('values').filter(element => !element.$type.startsWith('flow:'))
        // add new elements
        switch (this.selected.type) {
          case 'ServiceTask': {
            const task = moddle.create('flow:ServiceTask', {
              action: parameters.action,
              serviceId: parameters.serviceId,
              context: []
            })
            if (parameters.template) {
              task.preparation = moddle.create('flow:Preparation', {
                template: parameters.template,
                context: []
              })
              if (parameters.contextInMultiple) {
                parameters.contextInMultiple.forEach(key => {
                  task.preparation.context.push(moddle.create('flow:Context', {
                    io: 'in',
                    key
                  }))
                })
              }
            }
            if (parameters.contextIn) {
              task.context.push(moddle.create('flow:Context', {
                io: 'in',
                key: parameters.contextIn
              }))
            }
            if (parameters.contextOut) {
              task.context.push(moddle.create('flow:Context', {
                io: 'out',
                key: parameters.contextOut
              }))
            }
            updated.values.push(task)
          }
            break
          case 'BusinessRuleTask': {
            const ruleset = moddle.create('flow:BusinessRuleTask', {
              context: []
            })
            if (parameters.objectName) {
              ruleset.source = moddle.create('flow:Object', {
                objectName: parameters.objectName,
                embedded: parameters.embedded
              })
            }
            if (parameters.contextOut) {
              ruleset.context.push(moddle.create('flow:Context', {
                io: 'out',
                key: parameters.contextOut
              }))
            }
            if (parameters.contextInMultiple) {
              parameters.contextInMultiple.forEach(key => {
                ruleset.context.push(moddle.create('flow:Context', {
                  io: 'in',
                  key
                }))
              })
            }
            updated.values.push(ruleset)
          }
            break
          case 'StartEvent': {
            const event = moddle.create('flow:StartEvent', {
              eventName: parameters.eventName
            })
            if (parameters.messageName) event.messageName = parameters.messageName
            if (parameters.condition) {
              event.condition = moddle.create('flow:Expression', {
                language: 'FEEL',
                body: parameters.condition
              })
            }
            if (parameters.cycle) {
              event.timer = moddle.create('flow:Timer', {
                cycle: parameters.cycle
              })
            }
            if (parameters.contextOut) {
              event.context = moddle.create('flow:Context', {
                io: 'out',
                key: parameters.contextOut
              })
            }
            updated.values.push(event)
          }
            break
          case 'IntermediateThrowEvent': {
            const event = moddle.create('flow:IntermediateEvent', {
              eventName: parameters.eventName
            })
            if (parameters.template) {
              event.preparation = moddle.create('flow:Preparation', {
                template: parameters.template,
                context: []
              })
              if (parameters.contextInMultiple) {
                parameters.contextInMultiple.forEach(key => {
                  event.preparation.context.push(moddle.create('flow:Context', {
                    io: 'in',
                    key
                  }))
                })
              }
            }
            if (parameters.messageName) event.messageName = parameters.messageName
            if (parameters.action) event.action = parameters.action
            if (parameters.contextOut) {
              event.context = moddle.create('flow:Context', {
                io: 'out',
                key: parameters.contextOut
              })
            }
            updated.values.push(event)
          }
            break
          case 'BoundaryEvent':
          case 'IntermediateCatchEvent': {
            const event = moddle.create('flow:IntermediateEvent', {
              eventName: parameters.eventName
            })
            if (parameters.messageName) event.messageName = parameters.messageName
            if (parameters.condition) {
              event.condition = moddle.create('flow:Expression', {
                language: 'FEEL',
                body: parameters.condition
              })
              if (parameters.contextInMultiple) {
                parameters.contextInMultiple.forEach(key => {
                  event.context.push(moddle.create('flow:Context', {
                    io: 'in',
                    key
                  }))
                })
              }
            }
            if (parameters.duration) {
              event.timer = moddle.create('flow:Timer', {
                duration: parameters.duration
              })
            }
            if (parameters.contextOut) {
              event.context = moddle.create('flow:Context', {
                io: 'out',
                key: parameters.contextOut
              })
            }
            if (parameters.errorCode) {
              event.error = moddle.create('flow:Error', {
                code: parameters.errorCode,
                text: parameters.errorText || ''
              })
            }
            updated.values.push(event)
          }
            break
          case 'EndEvent': {
            const event = moddle.create('flow:EndEvent', {
              eventName: parameters.eventName
            })
            if (parameters.template) {
              event.preparation = moddle.create('flow:Preparation', {
                template: parameters.template,
                context: []
              })
              if (parameters.contextInMultiple) {
                parameters.contextInMultiple.forEach(key => {
                  event.preparation.context.push(moddle.create('flow:Context', {
                    io: 'in',
                    key
                  }))
                })
              }
            }
            if (parameters.messageName) event.messageName = parameters.messageName
            if (parameters.action) event.action = parameters.action
            if (parameters.contextOut) {
              event.context = moddle.create('flow:Context', {
                io: 'out',
                key: parameters.contextOut
              })
            }
            if (parameters.errorCode) {
              event.error = moddle.create('flow:Error', {
                code: parameters.errorCode,
                text: parameters.errorText || ''
              })
            }
            updated.values.push(event)
          }
            break
          case 'SequenceFlow': {
            const sequence = moddle.create('flow:SequenceFlow', {})
            sequence.context = []
            if (parameters.contextInMultiple) {
              parameters.contextInMultiple.forEach(key => {
                sequence.context.push(moddle.create('flow:Context', {
                  io: 'in',
                  key
                }))
              })
            }
            if (parameters.condition) {
              sequence.condition = moddle.create('flow:Expression', {
                language: 'FEEL',
                body: parameters.condition
              })
            }
            updated.values.push(sequence)
          }
        }
        // update extension in modeler
        try {
          const commandStack = this.modeler.get('commandStack')
          commandStack.execute('properties-panel.update-businessobject', {
            element: selected.element,
            businessObject: selected.element.businessObject,
            properties: {
              extensionElements: updated
            },
            oldProperties: {
              extensionElements: current
            }
          })
        } catch (error) {
          console.log('failed uodate', error)
        }
      }
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
