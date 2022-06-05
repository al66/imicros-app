<template>
  <div
    :class="modelerClass"
    :id="id"
    style="height: calc(100vh - 50px - 90px;"
  />
</template>

<script>
import { markRaw } from 'vue'
// import { useQuasar } from 'quasar'
// vuex store
import { mapGetters } from 'vuex'
// new decison
import decisionXML from 'src/components/dmn/newDecision.dmn'
// dmn-js
import DmnModeler from 'dmn-js/lib/Modeler'
import 'dmn-js/dist/assets/diagram-js.css'
import 'dmn-js/dist/assets/dmn-js-shared.css'
import 'dmn-js/dist/assets/dmn-js-drd.css'
import 'dmn-js/dist/assets/dmn-js-decision-table.css'
import 'dmn-js/dist/assets/dmn-js-decision-table-controls.css'
import 'dmn-js/dist/assets/dmn-js-literal-expression.css'
import 'dmn-js/dist/assets/dmn-font/css/dmn.css'

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
    palette: {
      type: Boolean,
      default: true,
      required: false
    }
  },
  emits: ['xml', 'svg'],
  data () {
    return {
      modeler: null
    }
  },
  computed: {
    ...mapGetters({
      access: 'access'
    }),
    modelerClass () {
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
    palette: function (newVal, oldVal) {
      try {
        const palette = this.modeler.getActiveViewer().get('palette')
        if (palette) newVal ? palette.open() : palette.close()
      } catch (e) {
        // ignore any error
      }
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
      try {
        this.modeler = markRaw(new DmnModeler({
          // container: '#' + this.id,
          DmnRenderer: opts
        }))
      } catch (e) {
        console.log(e)
      }
      // this.registerEvents()
    },
    /*
    registerEvents () {
      // modeler events
      const eventBus = this.modeler.get('eventBus')
      eventBus.on('element.click', (e) => {
        // console.log('element clicked', e)
      })
      eventBus.on('selection.changed', (selection) => {
        // console.log('selection.changed', selection)
      })
    },
    */
    async newDiagram () {
      try {
        await this.modeler.importXML(decisionXML)
        this.zoomFit()
      } catch (err) {
        console.log('Failed to open new diagram:', err)
      }
    },
    cmdUndo () {
      this.modeler.getActiveViewer().get('commandStack').undo()
    },
    cmdRedo () {
      this.modeler.getActiveViewer().get('commandStack').redo()
    },
    zoomIn () {
      // this.editMode ? this.modeler.get('zoomScroll').zoom(-0.5) : this.viewer.get('zoomScroll').zoom(-0.5)
      // this.modeler.get('zoomScroll').stepZoom(-1)
      try {
        this.modeler.getActiveViewer().get('zoomScroll').zoom(-0.5)
      } catch (e) {
        // ignore any error
      }
    },
    zoomOut () {
      // this.editMode ? this.modeler.get('zoomScroll').zoom(0.5) : this.viewer.get('zoomScroll').zoom(0.5)
      // this.modeler.get('zoomScroll').stepZoom(1)
      try {
        this.modeler.getActiveViewer().get('zoomScroll').zoom(0.5)
      } catch (e) {
        // ignore any error
      }
    },
    zoomFit () {
      // this.editMode ? this.modeler.get('canvas').zoom('fit-viewport') : this.viewer.get('canvas').zoom('fit-viewport')
      try {
        this.modeler.getActiveViewer().get('canvas').zoom('fit-viewport')
      } catch (e) {
        // ignore any error
      }
    },
    async getSVG () {
      try {
        const { svg } = await this.modeler.getActiveViewer().saveSVG({ format: true })
        this.$emit('svg', svg)
      } catch (e) {
        // ignore any error
      }
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
/* hide box with name and id (not used at all) */
.dmn-definitions {
  display: none;
};
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
