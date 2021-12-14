<template>
  <div>
    <!-- panels -->
    <q-tab-panels v-model="tab">
      <!-- editor panel -->
      <q-tab-panel
        name="editor"
        class="q-pt-none"
      >
        <q-toolbar>
          <q-chip v-if="objectName">
            {{ objectName }}
          </q-chip>
          <q-chip
            v-if="!objectName"
            class="text-white"
            color="orange"
          >
            {{ $t('Template.editor.new.file') }}
          </q-chip>
          <q-space />
          <div class="q-gutter-sm">
            <q-radio
              dense
              size="xs"
              v-model="edit.lang"
              val="text"
              label="Text"
            />
            <q-radio
              dense
              size="xs"
              v-model="edit.lang"
              val="html"
              label="HTML"
            />
            <q-radio
              dense
              size="xs"
              v-model="edit.lang"
              val="json"
              label="Json"
            />
          </div>
          <q-space />
          <toolbar-btn
            sub
            icon="ion-arrow-back"
            @click="selectData('back')"
          >
            <q-tooltip>{{ $t('Action.render') }}</q-tooltip>
          </toolbar-btn>
          <toolbar-btn
            sub
            icon="cancel"
            @click="selectData('clear')"
          >
            <q-tooltip>{{ $t('Action.render') }}</q-tooltip>
          </toolbar-btn>
          <toolbar-btn
            sub
            icon="ion-arrow-forward"
            @click="selectData('next')"
          >
            <q-tooltip>{{ $t('Action.render') }}</q-tooltip>
          </toolbar-btn>
          <toolbar-btn
            sub
            :icon="preview ? 'ion-eye-off' : 'ion-eye'"
            v-if="edit.lang === 'html'"
            @click="()=>{ preview = !preview }"
          >
            <q-tooltip>{{ preview ? $t('Action.showHtml') : $t('Action.showPreview') }}</q-tooltip>
          </toolbar-btn>
          <q-space />
          <toolbar-btn
            icon="ion-add"
            @click="newTemplate()"
          >
            <q-tooltip>{{ $t('Action.add') }}</q-tooltip>
          </toolbar-btn>
          <toolbar-btn
            icon="ion-open"
            @click="()=>{ files.select = !files.select }"
          >
            <q-tooltip>{{ $t('Action.open') }}</q-tooltip>
          </toolbar-btn>
          <toolbar-btn
            icon="ion-save"
            @click="saveTemplate()"
          >
            <q-tooltip>{{ $t('Action.save') }}</q-tooltip>
          </toolbar-btn>
          <toolbar-btn
            icon="ion-copy"
            :disable="!objectName"
            @click="copyTemplate"
          >
            <q-tooltip>{{ $t('Action.copy') }}</q-tooltip>
          </toolbar-btn>
        </q-toolbar>
        <q-splitter
          v-model="splitter.templates"
          :limits="[30, 100]"
        >
          <template #before>
            <q-chip
              outline
              square
              color="primary"
            >
              Template
            </q-chip>
            <q-scroll-area style="height: calc(100vh - 50px - 120px);">
              <editor
                v-model:content="edit.template"
                :lang="edit.lang"
                width="100%"
              />
            </q-scroll-area>
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
            <q-splitter
              v-model="splitter.testresult"
              :limits="[10, 90]"
            >
              <template #before>
                <q-chip
                  outline
                  square
                  color="primary"
                >
                  Example Data ({{ test.index + 1 }}/{{ data.length }})
                </q-chip>
                <q-scroll-area style="height: calc(100vh - 50px - 120px);">
                  <editor
                    v-model:content="test.data"
                    lang="json"
                    width="100%"
                  />
                </q-scroll-area>
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
                <q-chip
                  square
                  text-color="white"
                  :color="edit.valid ? 'teal' : 'red'"
                >
                  Result
                </q-chip>
                <q-scroll-area style="height: calc(100vh - 50px - 120px);">
                  <editor
                    v-model:content="test.result"
                    v-if="edit.lang !== 'html' || !preview"
                    :lang="edit.lang"
                    width="100%"
                  />
                  <div
                    class="q-ml-lg"
                    v-html="htmlResult"
                    v-if="edit.lang === 'html' && preview"
                  />
                </q-scroll-area>
              </template>
            </q-splitter>
          </template>
        </q-splitter>
      </q-tab-panel>
    </q-tab-panels>
    <file-select
      :refresh="files.refresh"
      :show="files.select"
      suffix=".tpl"
      @close="()=>{ this.files.select = false }"
      @file="(objectName)=>{ tab === 'editor' ? loadTemplate(objectName) : loadTest(objectName) }"
    />
    <file-save-as
      :refresh="files.refresh"
      :show="files.saveAs"
      suffix=".tpl"
      @close="()=>{ this.files.saveAs = false }"
      @file="(objectName)=>{ tab === 'editor' ? saveTemplateAs(objectName) : saveTestAs(objectName) }"
    />
  </div>
</template>

<script>
// vuex store
import { mapGetters } from 'vuex'
// handelbars
import Handlebars from 'handlebars/dist/cjs/handlebars'
// sanitize html
import sanitizeHtml from 'sanitize-html'
// components
import ToolbarBtn from '../components/global/ToolbarBtn.vue'
import FileSelect from '../components/main/FileSelect.vue'
import FileSaveAs from '../components/main/FileSaveAs.vue'
import Editor from '../components/global/Editor.vue'

export default {
  name: 'Templates',
  components: {
    ToolbarBtn,
    Editor,
    FileSelect,
    FileSaveAs
  },
  data () {
    return {
      tab: 'editor',
      edit: {
        template: '',
        lang: 'text',
        langOptions: ['text', 'html', 'json'],
        valid: true
      },
      test: {
        index: 0,
        data: '{}',
        result: ''
      },
      // testObject: {},
      files: {
        select: false,
        saveAs: false,
        refresh: 0
      },
      objectName: null,
      objectNameTest: null,
      preview: false,
      // template: '',
      data: ['{}'],
      splitter: {
        templates: 50, // start at 80%
        testdata: 30,
        testresult: 50
      },
      table: {
        templates: {
          // columns: [],
          data: []
        }
      }
    }
  },
  computed: {
    ...mapGetters({
      access: 'access'
    }),
    htmlResult: function () {
      // TODO: check, which makes sense and is still seure....
      const options = {
        allowedTags: [
          'a', 'address', 'article', 'aside', 'div', 'footer', 'header', 'h1', 'h2', 'h3', 'h4',
          'h5', 'h6', 'hgroup', 'img', 'main', 'nav', 'section', 'blockquote', 'dd', 'div',
          'dl', 'dt', 'figcaption', 'figure', 'hr', 'li', 'main', 'ol', 'p', 'pre',
          'ul', 'a', 'abbr', 'b', 'bdi', 'bdo', 'br', 'cite', 'code', 'data', 'dfn',
          'em', 'i', 'kbd', 'mark', 'q', 'rb', 'rp', 'rt', 'rtc', 'ruby', 's', 'samp',
          'small', 'span', 'strong', 'sub', 'sup', 'time', 'u', 'var', 'wbr', 'caption',
          'col', 'colgroup', 'table', 'tbody', 'td', 'tfoot', 'th', 'thead', 'tr'
        ],
        allowedAttributes: {
          '*': ['class', 'bgcolor', 'style', 'width'],
          a: ['href', 'name', 'target'],
          img: ['src'],
          table: ['align', 'border', 'cellspacing', 'cellpadding', 'role']
        }
      }
      const html = sanitizeHtml(this.test.result, options)
      return html
    }
  },
  watch: {
    access: {
      deep: true,
      handler () {
        this.newTemplate()
        // this.newTest()
      }
    },
    'edit.template': {
      async handler () {
        this.edit.valid = await this.testTemplate()
      }
    },
    'test.data': {
      async handler () {
        this.edit.valid = await this.testTemplate()
      }
    }
  },
  mounted () {
    // open file parameter
    const file = this.$route?.query?.open ?? null
    if (file) this.loadTemplate(file)
    this.$router.replace({ query: null })

    document.addEventListener('keydown', this.doSave)
    Handlebars.registerHelper({
      eq: (v1, v2) => v1 === v2,
      ne: (v1, v2) => v1 !== v2,
      lt: (v1, v2) => v1 < v2,
      gt: (v1, v2) => v1 > v2,
      lte: (v1, v2) => v1 <= v2,
      gte: (v1, v2) => v1 >= v2,
      and () {
        return Array.prototype.every.call(arguments, Boolean)
      },
      or () {
        return Array.prototype.slice.call(arguments, 0, -1).some(Boolean)
      }
    })
  },
  beforeUnmount () {
    document.removeEventListener('keydown', this.doSave)
  },
  created () {
  },
  methods: {
    newTemplate () {
      this.edit.template = ''
      this.objectName = null
    },
    loadTemplate (objectName) {
      const instance = this.$instance()
      instance.defaults.headers.get['x-imicros-xtoken'] = this.access.token
      instance.defaults.headers.get['Content-Type'] = 'application/octet-stream'
      instance.get('/#file/' + objectName, {
        // responseType: 'text'
      }).then((response) => {
        try {
          this.edit.template = response.data.template
          this.edit.lang = response.data.lang
          this.data = response.data.data || ['{}']
          if (Array.isArray(this.data) && this.data.length > 0) {
            this.test.index = 0
            this.test.data = this.data[0]
          }
          this.objectName = objectName
          // this.edit.lang = 'text'
          /* eslint no-useless-escape: "off" */
          // if (this.edit.template(/<?\w+((\s+\w+(\s*=\s*(?:".*?"|'.*?'|[\^'">\s]+))?)+\s*|\s*)?>/)) this.edit.lang = 'html'
        } catch (err) {
          console.log('Failed to open file ' + objectName + ':', err)
        }
      }).catch((err) => {
        console.error(err)
      })
    },
    doSave (e) {
      if (!(e.keyCode === 83 && e.ctrlKey)) {
        return
      }

      e.preventDefault()
      this.saveTemplate()
    },
    async saveTemplate () {
      if (!this.objectName) {
        console.log('call save as')
        this.files.saveAs = true
        return
      }

      const instance = this.$instance()
      instance.defaults.headers.put['x-imicros-xtoken'] = this.access.token
      instance.defaults.headers.put['x-imicros-filename'] = this.objectName
      instance.defaults.headers.put['Content-Type'] = 'application/octet-stream'
      try {
        // save last changes of test data
        this.data[this.test.index] = this.test.data
        // build template object
        const template = {
          template: this.edit.template,
          lang: this.edit.lang,
          data: this.data
        }
        instance.put('/api/upload', template).then((response) => {
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
    async saveTemplateAs (objectName) {
      this.objectName = objectName
      // hide dialog again
      this.files.saveAs = false
      await this.saveTemplate()
    },
    copyTemplate () {
      console.log('copy')
      this.objectName = null
    },
    async testTemplate () {
      // compile template
      let template
      try {
        template = Handlebars.compile(this.edit.template)
      } catch (err) {
        // console.log('Failed to compile template', err)
        return false
      }

      // parse data
      let data
      try {
        data = JSON.parse(this.test.data)
      } catch (err) {
        // console.log('Failed to read JSON data', err)
        return false
      }

      // render template
      try {
        this.test.result = await template(data)
      } catch (err) {
        // console.log('Failed to render template', err)
        return false
      }

      // convert to JSON
      try {
        if (this.edit.lang === 'json') {
          JSON.parse(this.test.result)
        }
      } catch (err) {
        return false
      }

      return true
    },
    selectData (cmd) {
      switch (cmd) {
        case 'back':
          this.data[this.test.index] = this.test.data
          if (this.test.index > 0) {
            this.test.index -= 1
            this.test.data = this.data[this.test.index]
          }
          break
        case 'next':
          this.data[this.test.index] = this.test.data
          this.test.index++
          if (this.test.index > this.data.length - 1) this.data.push('{}')
          this.test.data = this.data[this.test.index]
          break
        case 'clear':
          if (this.data.length > 1) {
            if (this.test.index < this.data.length - 1) {
              this.data.splice(this.test.index, 1)
              this.test.data = this.data[this.test.index]
            } else {
              this.data.splice(this.test.index, 1)
              this.test.index--
              this.test.data = this.data[this.test.index]
            }
          } else {
            this.test.data = '{}'
          }
          break
      }
    }
  }
}
</script>
