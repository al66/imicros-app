<template>
  <div>
    <!-- main navigation tabs -->
    <q-tabs v-model="tab" :class="$q.dark.isActive ? 'text-gray-2' : 'text-grey-10'" dense >
      <q-tab name="library" icon="ion-code" transition-show="slide-right">
        <q-tooltip>{{ 'Edit'/*$t('Templates.tab.library.title')*/ }}</q-tooltip>
      </q-tab>
      <q-tab name="editor" icon="ion-code-working" transition-show="slide-right">
        <q-tooltip>{{ 'Test'/*$t('Templates.tab.editor.title')*/ }}</q-tooltip>
      </q-tab>
    </q-tabs>

    <!-- panels -->
    <q-tab-panels v-model="tab">

      <!-- library panel -->
      <q-tab-panel name="library">
        <div>
          <q-splitter
            v-model="splitter.templates"
            :limits="[0, 100]"
                      >
            <template v-slot:before>
              <div class="col-auto">
                <q-table
                  :columns="columnsTemplateTable"
                  :data="table.templates.data"
                  flat
                  dense
                  row-key="name"
                  @row-click="(ev,row) => { edit = row }"
                >
                  <template v-slot:top-right>
                    <div class="q-pa-md q-gutter-sm">
                      <q-btn round no-caps size="sm" color="primary" icon="ion-refresh" @click="refreshGroups()" >
                        <q-tooltip>{{ $t('Action.refresh') }}</q-tooltip>
                      </q-btn>
                      <q-btn round no-caps size="sm" color="primary" icon="ion-add" @click="addGroup()">
                        <q-tooltip>{{ $t('Action.add') }}</q-tooltip>
                      </q-btn>
                      <q-btn round size="sm" color="primary" icon="ion-settings">
                        <q-tooltip>{{ $t('Action.settings') }}</q-tooltip>
                      </q-btn>
                    </div>
                  </template>
                </q-table>
              </div>
            </template>

            <template v-slot:separator>
              <q-avatar color="primary" text-color="white" size="30px" icon="drag_indicator" />
            </template>

            <template v-slot:after>
                <q-scroll-area style="height: calc(100vh - 150px);">
                  <editor v-model="edit.template" @init="editorInit" lang="text" theme="monokai" width="100%"></editor>
                </q-scroll-area>
            </template>
          </q-splitter>
        </div>
      </q-tab-panel>

      <!-- editor panel -->
      <q-tab-panel name="editor"><div>Editor</div>
          <q-splitter
            v-model="splitter.testdata"
            :limits="[30, 100]"
                      >
            <template v-slot:before>
              <div>Table</div>
            </template>

            <template v-slot:separator>
              <q-avatar color="primary" text-color="white" size="30px" icon="drag_indicator" />
            </template>

            <template v-slot:after>
              <q-splitter
                v-model="splitter.testresult"
                :limits="[10, 90]"
                          >
                <template v-slot:before>
                  <div class="row">
                    <div class="col">
                      <editor v-model="test.data" @init="editorInit" lang="json" theme="monokai" width="95%" height="500"></editor>
                      <div>{{ template }}</div>
                    </div>
                  </div>
                </template>

                <template v-slot:separator>
                  <q-avatar color="primary" text-color="white" size="30px" icon="drag_indicator" />
                </template>

                <template v-slot:after>
                  <div class="row">
                    <div class="col">
                      <editor v-model="test.result" @init="editorInit" lang="json" theme="monokai" width="95%" height="500"></editor>
                      <div>{{ data }}</div>
                    </div>
                  </div>
                </template>
              </q-splitter>
            </template>
          </q-splitter>
      </q-tab-panel>

    </q-tab-panels>

  </div>
</template>

<script>
import Editor from 'vue2-ace-editor'

export default {
  name: 'Templates',
  components: {
    editor: Editor
  },
  data () {
    return {
      tab: 'library',
      edit: {
        template: ''
      },
      test: {
        data: '',
        result: ''
      },
      template: '',
      data: '',
      splitter: {
        templates: 50, // start at 50%
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
     columnsTemplateTable: function () {
      return [
        { name: 'name', field: 'name', label: this.$t('Groups.table.column.name'), sortable: true, align: 'left' }
      ]
    }
  },
  created () {
    this.table.templates.data = [
      { name: 'mein erstes Template',
        template: 'Hello, {name}!',
        tests: {
          'first test first template': {
            data: JSON.stringify({ firstname: 'Robin', lastname: 'Mueller', name: 'Mueller' }),
            result: 'Hello, Mueller'
          }
        }
      },
      { name: 'mein zweites Template', template: 'Bonjour, {name}!' },
      { name: 'mein drittes Template', template: 'Hi, {name}!' },
      { name: 'mein viertes Template', template: 'Welcome, {name}!' },
      { name: 'mein fünftes Template', template: 'Hello, {name}!' }
    ]
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
        minLines: 10
      })
    }
  }
}
</script>
