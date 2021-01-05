<template>
  <div>
    <!-- main navigation tabs -->
    <!--
    <q-tabs v-model="tab" :class="$q.dark.isActive ? 'text-gray-2' : 'text-grey-10'" dense >
      <q-tab name="editor" icon="ion-code" transition-show="slide-right">
        <q-tooltip>{{ 'Edit'/*$t('Templates.tab.editor.title')*/ }}</q-tooltip>
      </q-tab>
      <q-tab name="test" icon="ion-code-working" transition-show="slide-right">
        <q-tooltip>{{ 'Test'/*$t('Templates.tab.test.title')*/ }}</q-tooltip>
      </q-tab>
    </q-tabs>
    -->

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
          <q-btn
            round
            no-caps
            size="sm"
            color="grey"
            icon="ion-play"
            class="q-mr-sm"
            @click="()=>{tab = 'test'}"
          >
            <q-tooltip>{{ $t('Action.render') }}</q-tooltip>
          </q-btn>
          <q-space />
          <q-btn
            round
            no-caps
            size="sm"
            color="primary"
            icon="assignment"
            class="q-mr-sm"
          />
          <q-btn
            round
            no-caps
            size="sm"
            color="primary"
            icon="ion-add"
            class="q-mr-sm"
            @click="newTemplate()"
          >
            <q-tooltip>{{ $t('Action.add') }}</q-tooltip>
          </q-btn>
          <q-btn
            round
            no-caps
            size="sm"
            color="primary"
            icon="ion-open"
            class="q-mr-sm"
            @click="()=>{ files.select = !files.select }"
          >
            <q-tooltip>{{ $t('Action.open') }}</q-tooltip>
          </q-btn>
          <q-btn
            round
            no-caps
            size="sm"
            color="primary"
            icon="ion-save"
            class="q-mr-sm"
            @click="saveTemplate()"
          >
            <q-tooltip>{{ $t('Action.save') }}</q-tooltip>
          </q-btn>
          <q-btn
            round
            no-caps
            size="sm"
            color="primary"
            icon="ion-copy"
            class="q-mr-sm"
            :disable="!objectName"
            @click="copyTemplate"
          >
            <q-tooltip>{{ $t('Action.copy') }}</q-tooltip>
          </q-btn>
        </q-toolbar>
        <q-splitter
          v-model="splitter.templates"
          :limits="[70, 100]"
        >
          <template v-slot:before>
            <q-scroll-area style="height: calc(100vh - 50px - 120px);">
              <editor
                v-model="edit.template"
                @init="editorInit"
                :lang="edit.lang"
                theme="monokai"
                width="100%"
              />
            </q-scroll-area>
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
            <q-scroll-area style="height: calc(100vh - 50px - 120px;">
              <q-card>
                <q-card-section
                  align="center"
                  class="bg-grey text-white q-ma-xs q-pa-xs"
                >
                  <q-item-label>{{ $t('Template.editor.settings.dialog.title') }}</q-item-label>
                </q-card-section>
                <q-card-section align="left">
                  <q-select
                    v-model="edit.lang"
                    :options="edit.langOptions"
                    dense
                    options-dense
                  />
                </q-card-section>
              </q-card>
            </q-scroll-area>
          </template>
        </q-splitter>
      </q-tab-panel>

      <!-- test panel -->
      <q-tab-panel
        name="test"
        class="q-pt-none"
      >
        <q-toolbar>
          <q-chip v-if="objectNameTest">
            {{ objectNameTest }}
          </q-chip>
          <q-chip
            v-if="!objectNameTest"
            class="text-white"
            color="orange"
          >
            {{ $t('Template.editor.new.file') }}
          </q-chip>
          <q-space />
          <q-btn
            round
            no-caps
            size="sm"
            color="grey"
            icon="edit"
            class="q-mr-sm"
            @click="()=>{tab = 'editor'}"
          >
            <q-tooltip>{{ $t('Action.edit') }}</q-tooltip>
          </q-btn>
          <q-btn
            round
            no-caps
            size="sm"
            color="grey"
            icon="ion-play"
            class="q-mr-sm"
            @click="testTemplate()"
          >
            <q-tooltip>{{ $t('Action.render') }}</q-tooltip>
          </q-btn>
          <q-btn
            round
            no-caps
            size="sm"
            color="grey"
            :icon="preview ? 'ion-eye-off' : 'ion-eye'"
            v-if="edit.lang === 'html'"
            @click="()=>{ preview = !preview }"
          >
            <q-tooltip>{{ preview ? $t('Action.showHtml') : $t('Action.showPreview') }}</q-tooltip>
          </q-btn>
          <q-space />
          <q-btn
            round
            no-caps
            size="sm"
            color="primary"
            icon="ion-add"
            class="q-mr-sm"
            @click="newTest()"
          >
            <q-tooltip>{{ $t('Action.add') }}</q-tooltip>
          </q-btn>
          <q-btn
            round
            no-caps
            size="sm"
            color="primary"
            icon="ion-open"
            class="q-mr-sm"
            @click="()=>{ files.select = !files.select }"
          >
            <q-tooltip>{{ $t('Action.open') }}</q-tooltip>
          </q-btn>
          <q-btn
            round
            no-caps
            size="sm"
            color="primary"
            icon="ion-save"
            class="q-mr-sm"
            @click="saveTest()"
          >
            <q-tooltip>{{ $t('Action.save') }}</q-tooltip>
          </q-btn>
          <q-btn
            round
            no-caps
            size="sm"
            color="primary"
            icon="ion-copy"
            class="q-mr-sm"
            :disable="!objectName"
            @click="copyTest"
          >
            <q-tooltip>{{ $t('Action.copy') }}</q-tooltip>
          </q-btn>
        </q-toolbar>
        <q-splitter
          v-model="splitter.testdata"
          :limits="[10, 80]"
        >
          <template v-slot:before>
            <div>Table</div>
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
            <q-splitter
              v-model="splitter.testresult"
              :limits="[10, 90]"
            >
              <template v-slot:before>
                <div class="row">
                  <div class="col">
                    <editor
                      v-model="test.data"
                      @init="editorInit"
                      lang="json"
                      theme="monokai"
                      width="100%"
                    />
                    <div>{{ template }}</div>
                  </div>
                </div>
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
                <div class="row">
                  <div class="col">
                    <editor
                      v-model="test.result"
                      v-if="edit.lang !== 'html' || !preview"
                      @init="editorInit"
                      :lang="edit.lang"
                      theme="monokai"
                      width="100%"
                    />
                    <div
                      class="q-ml-lg"
                      v-html="htmlResult"
                      v-if="edit.lang === 'html' && preview"
                    />
                  </div>
                </div>
              </template>
            </q-splitter>
          </template>
        </q-splitter>
      </q-tab-panel>
    </q-tab-panels>
    <file-select
      :refresh="files.refresh"
      :show="files.select"
      @close="()=>{ this.files.select = false }"
      @file="(objectName)=>{ tab === 'editor' ? loadTemplate(objectName) : loadTest(objectName) }"
    />
    <file-save-as
      :refresh="files.refresh"
      :show="files.saveAs"
      suffix=""
      @close="()=>{ this.files.saveAs = false }"
      @file="(objectName)=>{ tab === 'editor' ? saveTemplateAs(objectName) : saveTestAs(objectName) }"
    />
  </div>
</template>

<script>
// vuex store
import { mapGetters } from 'vuex'
import Editor from 'vue2-ace-editor'
// handelbars
import Handlebars from 'handlebars'
// sanitize html
import sanitizeHtml from 'sanitize-html'
// components
import FileSelect from '../components/main/FileSelect.vue'
import FileSaveAs from '../components/main/FileSaveAs.vue'

export default {
  name: 'Templates',
  components: {
    editor: Editor,
    FileSelect,
    FileSaveAs
  },
  data () {
    return {
      tab: 'editor',
      edit: {
        template: '',
        lang: 'text',
        langOptions: ['text', 'html']
      },
      test: {
        key: '1',
        data: '',
        result: ''
      },
      testObject: {},
      files: {
        select: false,
        saveAs: false,
        refresh: 0
      },
      objectName: null,
      objectNameTest: null,
      preview: false,
      template: '',
      data: '',
      splitter: {
        templates: 80, // start at 80%
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
      return sanitizeHtml(this.test.result)
    }
  },
  watch: {
    access: {
      deep: true,
      handler () {
        this.newTemplate()
        this.newTest()
      }
    },
    test: {
      deep: true,
      handler () {
        try {
          this.testObject[this.test.key] = JSON.parse(this.test.data)
        } catch (err) {
          this.testObject[this.test.key] = null
        }
      }
    }
  },
  created () {
  },
  methods: {
    editorInit: function (editor) {
      require('brace/ext/language_tools') // language extension prerequsite...
      require('brace/mode/html')
      require('brace/mode/json')
      require('brace/mode/javascript') // language
      require('brace/mode/less')
      require('brace/theme/monokai')
      require('brace/snippets/javascript') // snippet
      editor.setOptions({
        autoScrollEditorIntoView: true,
        maxLines: 'Infinity',
        minLines: 20
      })
    },
    newTemplate () {
      this.edit.template = ''
      this.objectName = null
    },
    loadTemplate (objectName) {
      const instance = this.$instance()
      instance.defaults.headers.get['x-imicros-xtoken'] = this.access.token
      instance.defaults.headers.get['Content-Type'] = 'application/octet-stream'
      instance.get('/#file/' + objectName, {
        responseType: 'text'
      }).then((response) => {
        try {
          this.edit.template = response.data
          this.objectName = objectName
          this.edit.lang = 'text'
          /* eslint no-useless-escape: "off" */
          if (response.data.match(/<?\w+((\s+\w+(\s*=\s*(?:".*?"|'.*?'|[\^'">\s]+))?)+\s*|\s*)?>/)) this.edit.lang = 'html'
        } catch (err) {
          console.log('Failed to open file ' + objectName + ':', err)
        }
      }).catch((err) => {
        console.error(err)
      })
    },
    async saveTemplate () {
      if (!this.objectName) {
        this.files.saveAs = true
        return
      }

      const instance = this.$instance()
      instance.defaults.headers.put['x-imicros-xtoken'] = this.access.token
      instance.defaults.headers.put['x-imicros-filename'] = this.objectName
      instance.defaults.headers.put['Content-Type'] = 'application/octet-stream'
      try {
        const template = this.edit.template
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
    newTest () {
      this.testObject = {}
      this.test.data = ''
      this.test.result = ''
      this.objectNameTest = null
    },
    loadTest (objectName) {
      const instance = this.$instance()
      instance.defaults.headers.get['x-imicros-xtoken'] = this.access.token
      instance.defaults.headers.get['Content-Type'] = 'application/octet-stream'
      instance.get('/#file/' + objectName, {
        responseType: 'text'
      }).then((response) => {
        try {
          this.testObject = response.data
          if (this.testObject && Object.keys(this.testObject)) {
            this.test.key = Object.keys(this.testObject)[0]
            try {
              this.test.data = JSON.stringify(this.testObject[this.test.key], null, '\t')
            } catch (err) {
              console.log('Failed to parse test data', err)
            }
          }
          this.objectNameTest = objectName
        } catch (err) {
          console.log('Failed to open file ' + objectName + ':', err)
        }
      }).catch((err) => {
        console.error(err)
      })
    },
    saveTest () {
      if (!this.objectNameTest) {
        this.files.saveAs = true
        return
      }

      const instance = this.$instance()
      instance.defaults.headers.put['x-imicros-xtoken'] = this.access.token
      instance.defaults.headers.put['x-imicros-filename'] = this.objectNameTest
      instance.defaults.headers.put['Content-Type'] = 'application/octet-stream'
      try {
        const test = this.testObject
        instance.put('/api/upload', test).then((response) => {
          console.log('File ' + this.objectNameTest + ' saved')
          // trigger refresh file lists of dialogs
          this.files.refresh += 1
        }).catch((err) => {
          console.error('Failed to save file ' + this.objectNameTest, err)
        })
      } catch (err) {
        console.error('Failed to save file ' + this.objectNameTest, err)
      }
    },
    async saveTestAs (objectName) {
      this.objectNameTest = objectName
      // hide dialog again
      this.files.saveAs = false
      await this.saveTest()
    },
    copyTest () {
      this.objectNameTest = null
    },
    async testTemplate () {
      // compile template
      let template
      try {
          template = Handlebars.compile(this.edit.template)
      } catch (err) {
          console.log('Failed to compile template', err)
          return false
      }

      // parse data
      let data
      try {
          data = JSON.parse(this.test.data)
      } catch (err) {
          console.log('Failed to read JSON data', err)
          return false
      }

      // render template
      try {
          this.test.result = await template(data)
          return true
      } catch (err) {
          console.log('Failed to render template', err)
          return false
      }
    }
  }
}
</script>
