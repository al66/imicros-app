<template>
  <VAceEditor
    v-model:value="value"
    @init="editorInit"
    :readonly="readonly"
    theme="monokai"
    :width="width"
  />
</template>

<script>
import { toRef } from 'vue'
// import Editor from 'vue2-ace-editor'
import { VAceEditor } from 'vue3-ace-editor'
import 'ace-builds/src-noconflict/ext-language_tools'
import 'ace-builds/src-noconflict/theme-monokai'
import 'ace-builds/src-noconflict/mode-text'
import { Mode as JavaScriptMode } from 'ace-builds/src-noconflict/mode-json'

export default {
  props: {
    content: {
      type: String,
      required: true
    },
    lang: {
      type: String,
      default: 'text',
      required: false
    },
    width: {
      type: String,
      default: '100%',
      required: false
    },
    readonly: {
      type: Boolean,
      default: false,
      required: false
    }
  },
  emits: ['update:content'],
  components: {
    VAceEditor
  },
  setup (props) {
    const lang = toRef(props, 'lang')

    return {
      //
      editorInit (editor) {
        editor.setOptions({
          autoScrollEditorIntoView: true,
          maxLines: 'Infinity',
          minLines: 20
        })
        switch (lang.value) {
          case 'json':
            editor.session.setMode(new JavaScriptMode())
            break
          default:
            //
        }
        /*
        editor.on('change', () => {
          console.log('change')
        })
        */
      }
    }
  },
  computed: {
    value: {
      get () {
        return this.content
      },
      set (value) {
        this.$emit('update:content', value)
      }
    }
  },
  methods: {
  }
}
</script>
