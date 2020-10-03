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
            {{ $t('Ruleset.editor.new.file') }}
          </q-chip>
          <q-space />
          <!--
          <q-btn round flat no-caps size="sm" color="grey" icon="ion-add" class="q-mr-sm" @click="addRow()" v-if="table.pagination.page >= pages">
            <q-tooltip>{{ $t('Action.addRow') }}</q-tooltip>
          </q-btn>
          -->
          <q-btn
            round
            no-caps
            size="sm"
            color="grey"
            icon="ion-play"
            class="q-mr-sm"
            @click="()=>{tab = 'test'}"
          >
            <q-tooltip>{{ $t('Action.test') }}</q-tooltip>
          </q-btn>
          <q-space />
          <q-btn
            round
            no-caps
            size="sm"
            color="primary"
            icon="ion-add"
            class="q-mr-sm q-ml-lg"
            @click="newRuleset()"
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
            @click="saveRuleset()"
          />
          <q-btn
            round
            no-caps
            size="sm"
            color="primary"
            icon="ion-copy"
            class="q-mr-sm"
            :disable="!objectName"
            @click="copyRuleset()"
          />
        </q-toolbar>
        <q-splitter
          v-model="splitter.raw"
          :limits="[0, 100]"
          @input="$refs.rulesetEditor.editor.setValue(raw)"
        >
          <template v-slot:before>
            <div class="q-pa-md">
              <q-table
                :columns="columns"
                :data="table.data"
                flat
                dense
                separator="cell"
                :pagination.sync="table.pagination"
                hide-pagination
              >
                <template v-slot:header="props">
                  <q-tr :props="props">
                    <!-- hit policy -->
                    <q-th
                      rowspan="6"
                      class="vertical-top text-bold"
                      width="10px"
                      @mouseenter.native="mouseLeave(true)"
                    >
                      <q-btn
                        flat
                        :label="hitpolicy.value"
                      >
                        <q-menu
                          anchor="bottom left"
                          self="top left"
                        >
                          <q-list>
                            <q-item
                              clickable
                              v-close-popup
                              v-for="h in hitpolicy.options"
                              :key="h.id"
                              dense
                              :label="h.label"
                              :disable="!h.supported"
                              :active="h.id === hitpolicy.value"
                              @click="hitpolicy.value = h.id"
                            >
                              <q-item-section>{{ h.label }}</q-item-section>
                            </q-item>
                          </q-list>
                        </q-menu>
                      </q-btn>
                    </q-th>
                    <!-- input / output -->
                    <q-th
                      :colspan="table.inputColumns.length"
                      class="text-h6"
                      @mouseenter.native="mouseLeave(true)"
                    >
                      <q-chip size="md">
                        {{ 'Input' }}
                      </q-chip>
                      <q-btn
                        round
                        no-caps
                        flat
                        size="sm"
                        icon="ion-add"
                        @click="addColumn(true)"
                      >
                        <q-tooltip>{{ $t('Action.addColumn') }}</q-tooltip>
                      </q-btn>
                    </q-th>
                    <q-th
                      :colspan="table.outputColumns.length"
                      class="text-h6"
                      @mouseenter.native="mouseLeave(true)"
                    >
                      <q-chip size="md">
                        {{ 'Output' }}
                      </q-chip>
                      <q-btn
                        round
                        no-caps
                        flat
                        size="sm"
                        icon="ion-add"
                        @click="addColumn(false)"
                      >
                        <q-tooltip>{{ $t('Action.addColumn') }}</q-tooltip>
                      </q-btn>
                    </q-th>
                    <q-th
                      rowspan="6"
                      class="vertical-top text-h6"
                      @mouseenter.native="mouseLeave(true)"
                    >
                      <q-chip size="md">
                        {{ 'Description' }}
                      </q-chip>
                    </q-th>
                  </q-tr>
                  <!-- column label -->
                  <q-tr
                    :props="props"
                    class="row-label"
                  >
                    <q-th
                      v-for="col in labeledColumns"
                      :key="col.name"
                      :props="props"
                      :class="$q.dark.isActive ? '' : ( col.input ? 'bg-blue-1 text-black' : 'bg-purple-1 text-black' )"
                      @contextmenu.native="showContextMenu(col.name,'col')"
                      @mouseleave.native="mouseLeave()"
                    >
                      <div>{{ col.label }}</div>
                      <q-popup-edit
                        v-model="col.label"
                        auto-save
                      >
                        <q-input
                          v-model="col.label"
                          autofocus
                          :rules="[val => !!val || 'Field is required']"
                        />
                      </q-popup-edit>
                    </q-th>
                  </q-tr>
                  <!-- column source -->
                  <q-tr
                    :props="props"
                    class="row-source"
                  >
                    <q-th
                      v-for="col in labeledColumns"
                      :key="col.name"
                      :props="props"
                      class="text-italic text-grey"
                      @contextmenu.native="showContextMenu(col.name,'col')"
                      @mouseleave.native="mouseLeave()"
                    >
                      <div>{{ col.source }}</div>
                      <q-popup-edit
                        v-model="col.source"
                        auto-save
                      >
                        <div align="center">
                          <q-chip>{{ col.label }}</q-chip>
                        </div>
                        <q-input
                          v-model="col.source"
                          :label="col.input ? 'source' : 'destination'"
                          autofocus
                        />
                      </q-popup-edit>
                    </q-th>
                  </q-tr>
                  <!-- column default -->
                  <q-tr
                    v-if="true"
                    :props="props"
                    class="row-default"
                  >
                    <q-th
                      v-for="col in labeledColumns"
                      :key="col.name"
                      :props="props"
                      class="text-italic text-grey"
                      @contextmenu.native="showContextMenu(col.name,'col')"
                      @mouseleave.native="mouseLeave()"
                    >
                      <div>{{ col.default }}</div>
                      <q-popup-edit
                        v-if="col.output"
                        v-model="col.default"
                        auto-save
                      >
                        <div align="center">
                          <q-chip>{{ col.label }}</q-chip>
                        </div>
                        <q-input
                          v-model="col.default"
                          label="default value"
                          autofocus
                        />
                      </q-popup-edit>
                    </q-th>
                  </q-tr>
                  <!-- column type -->
                  <q-tr
                    :props="props"
                    class="row-type"
                  >
                    <q-th
                      v-for="col in labeledColumns"
                      :key="col.name"
                      :props="props"
                      class="text-italic text-grey"
                      @contextmenu.native="showContextMenu(col.name,'col')"
                      @mouseleave.native="mouseLeave()"
                    >
                      <div v-if="col.isArray">
                        [{{ col.type }}]
                      </div>
                      <div v-if="!col.isArray">
                        {{ col.type }}
                      </div>
                      <q-popup-edit
                        v-model="col.type"
                        auto-save
                      >
                        <div align="center">
                          <q-chip>{{ col.label }}</q-chip>
                        </div>
                        <div>
                          <q-radio
                            v-model="col.type"
                            val="string"
                            label="String"
                          />
                          <q-radio
                            v-model="col.type"
                            val="number"
                            label="Number"
                          />
                          <q-radio
                            v-model="col.type"
                            val="date"
                            label="Date"
                          />
                          <q-radio
                            v-model="col.type"
                            val="time"
                            label="Time"
                          />
                          <q-radio
                            v-model="col.type"
                            val="boolean"
                            label="Boolean"
                            @input="(val) => { if (val) col.isArray = false; }"
                          />
                          <q-radio
                            v-model="col.type"
                            val="object"
                            label="Object"
                          />
                        </div>
                        <q-checkbox
                          v-model="col.isArray"
                          :disable="col.type == 'boolean'"
                          label="Is Array"
                        />
                      </q-popup-edit>
                    </q-th>
                  </q-tr>
                  <!-- allowed values -->
                  <!--
                  <q-tr :props="props" class="row-label">
                    <q-th
                      v-for="col in labeledColumns"
                      :key="col.name"
                      :props="props"
                      class="text-grey"
                    >
                      {{ col.allowed }}
                    </q-th>
                  </q-tr>
                  -->
                </template>
                <template v-slot:body="props">
                  <q-tr
                    :props="props"
                    @contextmenu.native="showContextMenu(props.rowIndex,'row')"
                    @mouseleave.native="mouseLeave()"
                  >
                    <q-td
                      key="props.row.row"
                    >
                      {{ props.rowIndex + 1 }}
                    </q-td>
                    <q-td
                      v-for="col in labeledColumns"
                      :key="col.name"
                      :props="props"
                    >
                      {{ props.row[col.name] }}
                      <q-popup-edit
                        v-model="props.row[col.name]"
                        auto-save
                      >
                        <div align="center">
                          <q-chip>{{ col.label }}</q-chip>
                          <q-chip>{{ props.rowIndex + 1 }}</q-chip>
                        </div>
                        <q-input
                          v-model="props.row[col.name]"
                          dense
                          autofocus
                          counter
                        />
                      </q-popup-edit>
                    </q-td>
                    <q-td key="props.row.desc">
                      {{ props.row.desc }}
                      <q-popup-edit
                        v-model="props.row.desc"
                        auto-save
                      >
                        <div align="center">
                          <q-chip>{{ props.rowIndex + 1 }}</q-chip>
                        </div>
                        <q-input
                          v-model="props.row.desc"
                          dense
                          autofocus
                          counter
                          clearable
                        />
                      </q-popup-edit>
                    </q-td>
                  </q-tr>
                </template>
              </q-table>
              <q-toolbar @mouseenter.native="mouseLeave(true)">
                <q-btn
                  round
                  flat
                  no-caps
                  size="sm"
                  color="grey"
                  icon="ion-add"
                  class="q-mr-sm"
                  v-if="table.pagination.page >= pages"
                  @click="addRow()"
                >
                  <q-tooltip>{{ $t('Action.addRow') }}</q-tooltip>
                </q-btn>
                <q-space />
                <q-pagination
                  v-model="table.pagination.page"
                  color="grey-8"
                  :max="pages"
                  size="sm"
                />
                <q-space />
              </q-toolbar>
              <!--
              <div class="row justify-center q-mt-md">
                <q-pagination
                  v-model="table.pagination.page"
                  color="grey-8"
                  :max="table.pagination.pages"
                  size="sm"
                />
              </div>
              -->
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
            <q-scroll-area style="height: calc(100vh - 50px - 120px);">
              <editor
                v-model="raw"
                @init="editorInit"
                ref="rulesetEditor"
                lang="text"
                readonly
                theme="monokai"
                width="100%"
              />
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
            @click="testRuleset()"
          >
            <q-tooltip>{{ $t('Action.test') }}</q-tooltip>
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
            :disable="!objectNameTest"
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
            <q-list>
              <q-slide-item
                v-for="(test, index) in testObject"
                :key="index"
                @left="testItemAdd(index, ...arguments)"
                @right="testItemDelete(index, ...arguments)"
              >
                <template v-slot:left>
                  <q-icon name="add" />
                </template>
                <template v-slot:right>
                  <q-icon name="delete" />
                </template>
                <q-item
                  dense
                  clickable
                  @click="testIndex = index"
                  :active="testIndex === index"
                  active-class="text-orange"
                >
                  <q-item-section>
                    {{ test.key }}
                  </q-item-section>
                </q-item>
              </q-slide-item>
            </q-list>
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
                      v-model="testObject[testIndex].dataJson"
                      @init="editorInit"
                      lang="json"
                      theme="monokai"
                      width="100%"
                    />
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
                      v-model="testObject[testIndex].resultJson"
                      @init="editorInit"
                      :lang="edit.lang"
                      theme="monokai"
                      width="100%"
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
      @file="(objectName)=>{ tab === 'editor' ? loadRuleset(objectName) : loadTest(objectName) }"
    />
    <file-save-as
      :refresh="files.refresh"
      :show="files.saveAs"
      suffix=""
      @close="()=>{ this.files.saveAs = false }"
      @file="(objectName)=>{ tab === 'editor' ? saveRulesetAs(objectName) : saveTestAs(objectName) }"
    />
    <!-- context menu row -->
    <q-menu
      touch-position
      context-menu
      auto-close
      v-if="contextMenu.context !== null"
      v-model="contextMenu.visible"
      @hide="contextMenu.context = null"
    >
      <q-list dense>
        <q-item v-close-popup>
          <q-btn
            round
            flat
            no-caps
            size="sm"
            color="grey"
            icon="ion-add"
            class="q-mr-sm"
            v-if="contextMenu.type === 'row'"
            @click="addRow(contextMenu.context)"
          >
            <q-tooltip>{{ $t('Action.addRow') }}</q-tooltip>
          </q-btn>
          <q-btn
            round
            flat
            no-caps
            size="sm"
            color="red"
            icon="ion-remove"
            class="q-mr-sm"
            v-if="contextMenu.type === 'row'"
            @click="deleteRow(contextMenu.context)"
          >
            <q-tooltip>{{ $t('Action.removeRow') }}</q-tooltip>
          </q-btn>
          <q-btn
            round
            flat
            no-caps
            size="sm"
            color="red"
            icon="ion-remove"
            class="q-mr-sm"
            v-if="contextMenu.type === 'col'"
            @click="deleteColumn(contextMenu.context)"
          >
            <q-tooltip>{{ $t('Action.removeColumn') }}</q-tooltip>
          </q-btn>
        </q-item>
      </q-list>
    </q-menu>
  </div>
</template>

<style lang="scss">
/* due to row span */
.row-label th:first-child,
.row-source th:first-child,
.row-default th:first-child,
.row-type th:first-child {
  border-left-style: solid;
  border-left-color: inherit;
  border-left-width: 1px;
}
/* label size and bold */
.row-label th {
  /* font-size: 13px; */
  /* font-weight: 600; */
}
</style>

<script>
// vuex store
import { mapGetters } from 'vuex'
// components
import FileSelect from '../components/main/FileSelect.vue'
import FileSaveAs from '../components/main/FileSaveAs.vue'
// ace
import Editor from 'vue2-ace-editor'
// uuid
import { v4 as uuid } from 'uuid'

export default {
  name: 'Ruleseteditor',
  components: {
    editor: Editor,
    FileSelect,
    FileSaveAs
  },
  data () {
    return {
      tab: 'editor',
      files: {
        select: false,
        saveAs: false,
        suffix: '',
        refresh: 0
      },
      objectName: null,
      objectNameTest: null,
      table: {
        inputColumns: [{ name: 'first', field: 'first', label: 'first', type: 'number', isArray: false, allowed: [1, 3, 5, 7] }],
        outputColumns: [{ name: 'second', field: 'second', label: 'second', type: 'string', isArray: false, allowed: ['test1', 'test2', 'test3', 'test4'], default: 'test1' }],
        data: [{
          row: 1,
          first: 'long expression list w/o breaks'
        }, {
          row: 2,
          second: 'b'
        }],
        pagination: {
          sortBy: 'desc',
          descending: false,
          page: 1,
          rowsPerPage: 10
          // rowsNumber: xx if getting data from a server
        }
      },
      hitpolicy: {
        value: 'F',
        options: [
          { id: 'F', label: 'First', supported: true },
          { id: 'C', label: 'Collect', supported: true },
          { id: 'C+', label: 'Collect sum', supported: false },
          { id: 'C>', label: 'Collect maximum value', supported: false },
          { id: 'C<', label: 'Collect minimum value', supported: false },
          { id: 'C#', label: 'Collect count matching rules', supported: false },
          { id: 'U', label: 'Unique', supported: false },
          { id: 'A', label: 'Any', supported: false },
          { id: 'P', label: 'Priority', supported: false }
        ]
      },
      types: ['string', 'number', 'date', 'time', 'boolean', 'object'],
      splitter: {
        raw: 70,
        testdata: 30,
        testresult: 50
      },
      editor: {},
      raw: '',
      edit: {
        lang: 'text'
      },
      testIndex: 0,
      testObject: [
        {
          key: '1',
          dataJson: '{ }',
          data: {},
          resultJson: '',
          expected: {}
        },
        {
          key: '2',
          dataJson: '{ }',
          data: {},
          resultJson: '',
          expected: {}
        }
      ],
      contextMenu: {
        type: null, // 'row' | 'input' | 'output'
        context: {},
        visible: false
      },
      contextRow: null,
      contextMenuRowVisible: false,
      contextCol: null,
      contextMenuColVisible: false
    }
  },
  computed: {
    ...mapGetters({
      access: 'access'
    }),

    labeledColumns: function () {
      return this.columns.filter((c) => {
        return !c.hitpolicy && !c.desc
      })
    },
    columns: function () {
      const row = [{ name: 'row', hitpolicy: true }]
      const input = Array.isArray(this.table.inputColumns) ? this.table.inputColumns.map((e) => { e.input = true; e.align = 'center'; return e }) : []
      const output = Array.isArray(this.table.outputColumns) ? this.table.outputColumns.map((e) => { e.output = true; e.align = 'center'; return e }) : []
      const desc = [{ name: 'desc', desc: true }]
      return row.concat(input.concat(output.concat(desc)))
    },
    pages: function () {
      return Math.ceil(this.table.data.length / this.table.pagination.rowsPerPage)
    },
    ruleset: function () {
      // ruleset start
      let raw = '@@'
      // hit policy
      if (this.hitpolicy.value) raw += ` ~${this.hitpolicy.value} `
      // input values
      this.table.inputColumns.map((e, index) => {
        index > 0 ? raw += ' ; ' : raw += ' '
        if (e.source) raw += e.source
        if (e.type) raw += `[${e.type}]`
        if (e.label) raw += ` #${e.label}#`
      })
      // output values
      this.table.outputColumns.map((e) => {
        if (e.type) {
            this.table.inputColumns.length > 0 ? raw += '; > ' : raw += ' > '
            if (e.source) raw += e.source
            if (e.type) raw += `[${e.type}]`
            if (e.default) raw += ` := ${e.default}`
            if (e.label) raw += ` #${e.label}#`
        }
      })
      // defintion end
      raw += '\r\n'
      this.table.data.map((r) => {
        raw += '@ '
        // when
        let first = true
        this.table.inputColumns.map((e, index) => {
          if (typeof r[e.name] === 'undefined' || r[e.name] == null || r[e.name].length === 0) return
          if (!first) raw += ' && '
          if (e.source) raw += ` ${e.source}`
          raw += ' :: '
          raw += ` ${r[e.name]} `
          first = false
        })
        raw += ' => '
        // then
        this.table.outputColumns.map((e, index) => {
          if (typeof r[e.name] === 'undefined' || r[e.name] == null || r[e.name].length === 0) return
          if (index > 0) raw += ';'
          if (e.source) raw += ` ${e.source} `
          raw += ' := '
          raw += `${r[e.name]} `
        })
        // desc
        if (r.desc) raw += ` #${r.desc}#`
        // new line
        raw += '\r\n'
      })
      // ruleset end
      raw += '@@'
      return raw
    }
  },
  watch: {
    ruleset: function () {
      this.raw = this.ruleset
    }/*,
    testObject: {
      deep: true,
      handler (newVal, oldVal) {
        console.log(newVal[this.testKey].dataJson)
        console.log(oldVal[this.testKey].dataJson)
        if (newVal[this.testKey].dataJson !== oldVal[this.testKey].dataJson) {
          try {
            this.testObject[this.testKey].data = JSON.parse(this.testObject[this.testKey].dataJson)
            console.log(this.testObject[this.testKey].data)
          } catch (err) {
            this.testObject[this.testKey].data = {}
          }
        }
      }
    }
    */
  },
  mounted () {
    this.newRuleset()
  },
  methods: {
    editorInit: function (editor) {
      require('brace/ext/language_tools') // language extension prerequsite...
      require('brace/mode/json')
      require('brace/theme/monokai')
      editor.setOptions({
        autoScrollEditorIntoView: true,
        maxLines: 'Infinity',
        minLines: 20,
        readOnly: false
      })
    },
    addColumn (input) {
      const name = (input ? 'input ' + (this.table.inputColumns.length + 1) : 'output ' + (this.table.outputColumns.length + 1))
      const newCol = { name: uuid(), label: name, type: 'string', isArray: false, input: !!input, output: !input }
      if (input) {
        this.table.inputColumns.push(newCol)
      } else {
        this.table.outputColumns.push(newCol)
      }
    },
    deleteColumn (name) {
      if (typeof name !== 'string') return
      if (this.table.inputColumns.length > 1) this.table.inputColumns.splice(this.table.inputColumns.findIndex(item => item.name === name), 1)
      if (this.table.outputColumns.length > 1) this.table.outputColumns.splice(this.table.outputColumns.findIndex(item => item.name === name), 1)
    },
    addRow (row) {
      const newRow = { row: uuid() }
      typeof row === 'number' ? this.table.data.splice(row, 0, newRow) : this.table.data.push(newRow)
      const pages = Math.ceil(this.table.data.length / this.table.pagination.rowsPerPage)
      if (!(typeof row === 'number') && this.table.pagination.page < pages) this.table.pagination.page = pages
    },
    deleteRow (row) {
      if (typeof row !== 'number' || this.table.data.length <= 1) return
      this.table.data.splice(row, 1)
      const pages = Math.ceil(this.table.data.length / this.table.pagination.rowsPerPage)
      if (this.table.pagination.page > pages) this.table.pagination.page = pages
    },
    setJson (json) {
        const input = []
        const output = []
        const data = []
        json.input.forEach((e) => {
            const col = {
                label: e.label,
                name: uuid(),
                source: e.source,
                default: e.default,
                type: e.type
            }
            input.push(col)
        })
        json.output.forEach((e) => {
            const col = {
                label: e.label,
                name: uuid(),
                source: e.destination,
                default: e.default,
                type: e.type
            }
            output.push(col)
        })
        json.rules.forEach((r) => {
            const rule = {
                row: uuid(),
                desc: r.desc
            }
            r.conditions.forEach(cond => {
                const col = input.find(e => e.source === cond.input)
                if (col) {
                    rule[col.name] = cond.expression
                }
            })
            r.output.forEach(out => {
                const col = output.find(e => e.source === out.destination)
                if (col) {
                    rule[col.name] = out.expression
                }
            })
            data.push(rule)
        })
        if (input.length > 0 && output.length > 0 && data.length > 0) {
            this.table.inputColumns = []
            json.hitpolicy ? this.hitpolicy.value = json.hitpolicy : this.hitpolicy.value = 'F'
            this.table.inputColumns = input
            this.table.outputColumns = output
            this.table.data = data
        }
    },
    loadRuleset (objectName) {
      const instance = this.$instance()
      instance.defaults.headers.get['x-imicros-xtoken'] = this.access.token
      instance.defaults.headers.get['Content-Type'] = 'application/octet-stream'
      instance.get('/#file/' + objectName, {
        responseType: 'text'
      }).then(async (response) => {
        try {
            const param = {
                ruleset: response.data
            }
            instance.post('/api/rules/json', param).then((ruleset) => {
                this.setJson(ruleset.data)
                this.objectName = objectName
            }).catch((err) => {
              console.error('Failed to parse file ' + this.objectName, err)
            })
        } catch (err) {
          console.log('Failed to open file ' + objectName + ':', err)
        }
      }).catch((err) => {
        console.error(err)
      })
    },
    newRuleset () {
      //
      this.objectName = null
      this.table.inputColumns = [{ name: uuid(), label: 'some input..', type: 'string', isArray: false, allowed: null, input: true }]
      this.table.outputColumns = [{ name: uuid(), label: 'some output..', type: 'string', isArray: false, default: null, allowed: null, output: true }]
      // start with two empty rows
      this.table.data = []
      this.table.data.push({ row: (this.table.data.length + 1) })
      this.table.data.push({ row: (this.table.data.length + 1) })
    },
    async saveRuleset () {
      if (!this.objectName) {
        this.files.suffix = '.ruleset'
        this.files.saveAs = true
        return
      }

      const instance = this.$instance()
      instance.defaults.headers.put['x-imicros-xtoken'] = this.access.token
      instance.defaults.headers.put['x-imicros-filename'] = this.objectName
      instance.defaults.headers.put['Content-Type'] = 'application/octet-stream'
      try {
        const param = {
            ruleset: this.ruleset
        }
        instance.post('/api/rules/json', param).then((ruleset) => {
            if (!ruleset || !ruleset.data || !ruleset.data.input) {
                console.error('Failed to parse ruleset', param)
                return
            }
            instance.put('/api/upload', this.ruleset).then((response) => {
              console.log('File ' + this.objectName + ' saved')
              // trigger refresh file lists of dialogs
              this.files.refresh += 1
            }).catch((err) => {
              console.error('Failed to save file ' + this.objectName, err)
            })
        }).catch((err) => {
          console.error('Failed to save file ' + this.objectName, err)
        })
      } catch (err) {
        console.error('Failed to save file ' + this.objectName, err)
      }
    },
    async saveRulesetAs (objectName) {
      this.objectName = objectName
      // hide dialog again
      this.files.saveAs = false
      await this.saveRuleset()
    },
    copyRuleset () {
      this.objectName = null
    },
    showContextMenu (context, type) {
      console.log(context)
      this.contextMenu.context = context
      this.contextMenu.type = type
      this.contextMenu.visible = true
    },
    mouseLeave (table) {
      if (!this.contextMenu.visible) this.contextMenu.context = null
      if (table) {
        this.contextMenu.visible = false
      }
    },
    testRuleset () {
      if (this.testObject && this.testObject.length) {
        const instance = this.$instance()
        instance.defaults.headers.post['x-imicros-xtoken'] = this.access.token
        instance.defaults.headers.post['Content-Type'] = 'application/octet-stream'
        for (let i = 0; i < this.testObject.length; i++) {
          const params = {
              name: this.objectName,
              data: {}
          }
          try {
            params.data = JSON.parse(this.testObject[i].dataJson)
          } catch (err) {
            continue
          }
          // console.log(params)
          instance.post('/api/rules/eval', params).then((result) => {
              // console.log(result.data)
              if (result.data) {
                try {
                  const resultJson = JSON.stringify(result.data, null, '\t')
                  this.testObject[i].resultJson = resultJson
                } catch (err) {
                  console.log('Invalid response on ruleset execution', err)
                }
              }
              this.testObject[i].result = result
          }).catch((err) => {
            console.error('Failed to execute ruleset ' + this.objectName + ' test index ' + i, err)
          })
        }
      }
    },
    newTest () {
      this.testIndex = 0
      this.testObject = [
        {
          key: '1',
          dataJson: '{ }',
          data: {},
          resultJson: '',
          expected: {}
        }
      ]
      this.objectNameTest = null
    },
    loadTest (objectName) {
      const instance = this.$instance()
      instance.defaults.headers.get['x-imicros-xtoken'] = this.access.token
      instance.defaults.headers.get['Content-Type'] = 'application/octet-stream'
      instance.get('/#file/' + objectName, {
        responseType: 'text'
      }).then((response) => {
        if (response.data && response.data.length) {
          this.newTest()
          try {
            for (let i = 0; i < response.data.length; i++) {
              const test = response.data[i]
              try {
                const dataJson = JSON.stringify(test.data, null, '\t')
                if (this.testObject[i]) {
                  this.testObject[i].dataJson = dataJson
                } else {
                  this.testObject.push({
                    key: test.key || i,
                    dataJson: dataJson,
                    data: {},
                    resultJson: '',
                    expected: {}
                  })
                }
              } catch (err) {
                console.log('Failed to parse test data', err)
              }
            }
            this.objectNameTest = objectName
          } catch (err) {
            console.log('Failed to open file ' + objectName + ':', err)
          }
        }
      }).catch((err) => {
        console.error(err)
      })
    },
    saveTest () {
      if (!this.objectNameTest) {
        this.files.suffix = '.test'
        this.files.saveAs = true
        return
      }

      const test = []
      try {
        for (let i = 0; i < this.testObject.length; i++) {
          const single = {
            key: this.testObject[i].key,
            data: JSON.parse(this.testObject[i].dataJson),
            expected: {}
          }
          test.push(single)
        }
      } catch (err) {
        console.error('Failed to parse test data ' + this.objectNameTest, err)
        return
      }

      const instance = this.$instance()
      instance.defaults.headers.put['x-imicros-xtoken'] = this.access.token
      instance.defaults.headers.put['x-imicros-filename'] = this.objectNameTest
      instance.defaults.headers.put['Content-Type'] = 'application/octet-stream'
      try {
        console.log('SAVE FILE')
        console.log(test)
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
    testItemAdd (index, { reset }) {
      this.testObject.splice(index, 0, {
        key: 'new ' + index,
        dataJson: '{ }',
        data: {},
        resultJson: '',
        expected: {}
      })
      if (this.testIndex >= index) this.testIndex++
      reset()
    },
    testItemDelete (index, { reset }) {
      if (this.testObject.length < 2) {
        reset()
        return
      }
      if (this.testIndex > 0) this.testIndex--
      this.testObject.splice(index, 1)
      reset()
    }
  }
}
</script>
