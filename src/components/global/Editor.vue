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
import { ref, toRef } from 'vue'
// import Editor from 'vue2-ace-editor'
import { VAceEditor } from 'vue3-ace-editor'
import 'ace-builds/src-noconflict/ext-language_tools'
import 'ace-builds/src-noconflict/theme-monokai'
import { Mode as TextMode } from 'ace-builds/src-noconflict/mode-text'
import { Mode as JsonMode } from 'ace-builds/src-noconflict/mode-json'

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
    },
    refresh: {
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
    const editorRef = ref(null)

    return {
      editorRef,
      //
      editorInit (editor) {
        editorRef.value = editor
        editor.setOptions({
          autoScrollEditorIntoView: true,
          maxLines: 'Infinity',
          minLines: 20
        })
        switch (lang.value) {
          case 'json':
            editor.session.setMode(new JsonMode())
            break
          case 'text':
            editor.session.setMode(new TextMode())
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
  watch: {
    refresh: function () {
      console.log(this.content)
      this.editorRef.resize()
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
