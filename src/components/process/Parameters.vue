<template>
  <div>
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
          <q-expansion-item
            dense
            dense-toggle
            expand-separator
            default-opened
            label="General"
          >
            <q-card-section :key="triggerRendering">
              <q-input
                :model-value="id"
                :label="$t('Process.editor.parameters.dialog.label.elementId')"
                stack-label
                disable
              />
              <q-input
                v-model="local.elementName"
                label="Name"
                stack-label
                @change="update"
              />
            </q-card-section>
          </q-expansion-item>
          <!-- Sequence Flow -->
          <div v-if="type === 'SequenceFlow'">
            <q-expansion-item
              dense
              dense-toggle
              expand-separator
              icon="bi-gear-fill"
              label="Execution"
            >
              <q-card-section :key="triggerRendering">
                <q-select
                  v-model="local.contextInMultiple"
                  label="Context keys (input)"
                  hint="available context variables for the expression"
                  hide-hint
                  stack-label
                  use-input
                  use-chips
                  multiple
                  hide-dropdown-icon
                  input-debounce="0"
                  new-value-mode="add-unique"
                  @update:model-value="update"
                />
                <q-input
                  v-model="local.condition"
                  label="Condition (FEEL expression)"
                  stack-label
                  @change="update"
                />
              </q-card-section>
            </q-expansion-item>
          </div>
          <!-- Service Task -->
          <div v-if="type === 'ServiceTask'">
            <q-expansion-item
              dense
              dense-toggle
              expand-separator
              icon="bi-braces"
              label="Preparation"
            >
              <q-card-section :key="triggerRendering">
                <q-select
                  v-model="local.contextInMultiple"
                  :label="$t('Process.editor.parameters.dialog.label.contextKeyPreparation')"
                  stack-label
                  use-input
                  use-chips
                  multiple
                  hide-dropdown-icon
                  input-debounce="5"
                  new-value-mode="add-unique"
                  @update:model-value="update"
                />
                <q-input
                  v-model="local.template"
                  label="Template for mapping of parameters"
                  stack-label
                  readonly
                  @change="update"
                >
                  <template #before>
                    <q-btn
                      class="justify-center"
                      size="sm"
                      color="primary"
                      icon="edit"
                      @click="editTemplate"
                    />
                  </template>
                </q-input>
              </q-card-section>
            </q-expansion-item>
            <q-expansion-item
              dense
              dense-toggle
              expand-separator
              default-opened
              icon="bi-gear-fill"
              label="Execution"
            >
              <q-card-section :key="triggerRendering">
                <q-select
                  v-model="local.contextIn"
                  :label="$t('Process.editor.parameters.dialog.label.contextKeyTask')"
                  stack-label
                  use-input
                  use-chips
                  hide-dropdown-icon
                  input-debounce="0"
                  new-value-mode="add-unique"
                  @update:model-value="update"
                />
                <q-input
                  v-model="local.action"
                  :label="$t('Process.editor.parameters.dialog.label.action')"
                  stack-label
                  clearable
                  @change="update"
                />
                <q-select
                  v-model="local.serviceId"
                  :options="optionsAgents"
                  :label="$t('Process.editor.parameters.dialog.label.agent')"
                  stack-label
                  clearable
                  emit-value
                  map-options
                  @update:model-value="update"
                />
                <q-select
                  v-model="local.contextOut"
                  :label="$t('Process.editor.parameters.dialog.label.contextKeyResult')"
                  stack-label
                  use-input
                  use-chips
                  hide-dropdown-icon
                  input-debounce="0"
                  new-value-mode="add-unique"
                  @update:model-value="update"
                />
              </q-card-section>
            </q-expansion-item>
          </div>
          <!-- Business Rule Task -->
          <div v-if="type === 'BusinessRuleTask'">
            <q-expansion-item
              dense
              dense-toggle
              expand-separator
              default-opened
              icon="bi-gear-fill"
              label="Execution"
            >
              <q-card-section :key="triggerRendering">
                <q-input
                  v-model="local.objectName"
                  :label="$t('Process.editor.parameters.dialog.label.ruleset')"
                  label-color="orange"
                  hint="object name and path in files"
                  hide-hint
                  stack-label
                  @change="update"
                />
                <q-select
                  v-model="local.contextInMultiple"
                  label="Context keys (input)"
                  stack-label
                  use-input
                  use-chips
                  multiple
                  hide-dropdown-icon
                  input-debounce="0"
                  new-value-mode="add-unique"
                  @update:model-value="update"
                />
                <q-select
                  v-model="local.contextOut"
                  :label="$t('Process.editor.parameters.dialog.label.contextKeyResult')"
                  stack-label
                  use-input
                  use-chips
                  hide-dropdown-icon
                  input-debounce="0"
                  new-value-mode="add-unique"
                  @update:model-value="update"
                />
              </q-card-section>
            </q-expansion-item>
          </div>
          <!-- Start Event -->
          <!-- <div v-if="type === 'bpmn:StartEvent' && subtype['bpmn:SignalEventDefinition']"> -->
          <div v-if="type === 'StartEvent'">
            <q-expansion-item
              dense
              dense-toggle
              expand-separator
              default-opened
              icon="bi-gear-fill"
              label="Execution"
            >
              <q-card-section :key="triggerRendering">
                <q-input
                  v-model="local.eventName"
                  label="Event name"
                  hint="technical event name"
                  hide-hint
                  stack-label
                  @change="update"
                />
                <q-input
                  v-model="local.condition"
                  label="Process start condition (FEEL expression)"
                  hint="variables: event data -> data, environment data -> env"
                  hide-hint
                  stack-label
                  @change="update"
                />
                <q-select
                  v-model="local.contextOut"
                  label="Context key"
                  hint="stores payload and meta data under this key"
                  hide-hint
                  stack-label
                  use-input
                  use-chips
                  hide-dropdown-icon
                  input-debounce="0"
                  new-value-mode="add-unique"
                  @update:model-value="update"
                />
              </q-card-section>
            </q-expansion-item>
          </div>
        </q-card-section>
      </q-card>
    </q-scroll-area>
    <q-dialog
      v-model="template.edit"
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
            v-model:content="template.data"
            lang="json"
            width="100%"
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

<script>
import Editor from 'src/components/global/Editor.vue'
// vuex store
import { mapGetters } from 'vuex'
// import { toRaw } from 'vue'

export default {
  props: {
    id: {
      type: String,
      default: '',
      required: false
    },
    type: {
      type: String,
      required: true
    },
    subtype: {
      type: Object,
      default: function () {
        return {}
      },
      required: false
    },
    parameters: {
      type: Object,
      required: true
    }
  },
  emits: ['update:parameters'],
  components: {
    Editor
  },
  data () {
    return {
      template: {
        data: '',
        edit: false
      },
      agents: {
        data: []
      },
      triggerRendering: 0
    }
  },
  setup (props) {
    return {
      local: Object.assign(props.parameters)
    }
  },
  watch: {
    parameters: function (newVal) {
      this.local = Object.assign(newVal)
      // hack - has not updated all q-sections
      this.triggerRendering += 1
      // this.$forceUpdate()
    }
  },
  computed: {
    ...mapGetters({
      access: 'access'
    }),
    optionsAgents () {
      return this.agents.data.map(agent => { return { label: agent.label, value: agent.serviceId } })
    }
  },
  mounted () {
    this.refreshAgents()
  },
  methods: {
    update () {
      this.$emit('update:parameters', this.local)
    },
    editTemplate () {
      // this.template.data = this.selected.parameterObject.template
      this.template.data = Buffer.from(this.local.template || '', 'base64').toString('ascii')
      this.template.edit = true
    },
    saveTemplate () {
      // this.selected.parameterObject.template = this.template.data
      this.local.template = Buffer.from(this.template.data).toString('base64')
      this.template.edit = false
      this.update()
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
