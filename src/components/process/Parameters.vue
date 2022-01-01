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
          <q-input
            :model-value="id"
            :label="$t('Process.editor.parameters.dialog.label.elementId')"
            stack-label
            disable
          />
          <!-- Service Task -->
          <div v-if="type === 'bpmn:ServiceTask'">
            <q-option-group
              v-model="local.prepFunction"
              :options="optionsPreparation"
              inline
              @update:model-value="update"
            />
            <q-select
              v-if="local.prepFunction && local.prepFunction !== ''"
              v-model="contextKeys"
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
              v-if="local.prepFunction === 'template'"
              v-model="local.template"
              label="Template for mapping of parameters"
              stack-label
              readonly
              @change="update"
            >
              <template #before>
                <q-btn
                  v-if="local.prepFunction === 'template'"
                  class="justify-center"
                  size="sm"
                  color="primary"
                  icon="edit"
                  @click="editTemplate"
                />
              </template>
            </q-input>
            <q-input
              v-if="local.prepFunction === 'ruleset'"
              v-model="local.ruleset"
              :label="$t('Process.editor.parameters.dialog.label.rulesetPreparation')"
              stack-label
              @change="update"
            />
            <q-select
              v-model="local.paramsKey"
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
              v-model="local.resultKey"
              :label="$t('Process.editor.parameters.dialog.label.contextKeyResult')"
              stack-label
              use-input
              use-chips
              hide-dropdown-icon
              input-debounce="0"
              new-value-mode="add-unique"
              @update:model-value="update"
            />
          </div>
          <!-- Business Rule Task -->
          <div v-if="type === 'bpmn:BusinessRuleTask'">
            <q-input
              v-model="local.ruleset"
              :label="$t('Process.editor.parameters.dialog.label.ruleset')"
              label-color="orange"
              stack-label
              @change="update"
            />
            <q-select
              v-model="contextKeys"
              label="context keys (input)"
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
              v-model="local.contextKey"
              :label="$t('Process.editor.parameters.dialog.label.contextKeyResult')"
              stack-label
              use-input
              use-chips
              hide-dropdown-icon
              input-debounce="0"
              new-value-mode="add-unique"
              @update:model-value="update"
            />
          </div>
          <!-- Start Event: Signal Event -->
          <div v-if="type === 'bpmn:StartEvent' && subtype['bpmn:SignalEventDefinition']">
            <q-input
              v-model="local.event"
              label="internal event"
              stack-label
              @change="update"
            />
            <q-select
              v-model="local.contextKey"
              label="context key (payload/metadata)"
              stack-label
              use-input
              use-chips
              hide-dropdown-icon
              input-debounce="0"
              new-value-mode="add-unique"
              @update:model-value="update"
            />
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
      contextKeys: [],
      template: {
        data: '',
        edit: false
      },
      agents: {
        data: []
      }
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
      this.local.contextKeys && typeof this.local.contextKeys === 'string' ? this.contextKeys = this.local.contextKeys.split(',') : this.contextKeys = []
      if (this.type === 'bpmn:ServiceTask' && !this.local.prepFunction) this.local.prepFunction = ''
    }
  },
  computed: {
    ...mapGetters({
      access: 'access'
    }),
    optionsPreparation () {
      return [
        { label: 'No preparation step', value: '' },
        { label: 'Map', value: 'template' },
        { label: 'Ruleset', value: 'ruleset' }
      ]
    },
    optionsAgents () {
      return this.agents.data.map(agent => { return { label: agent.label, value: agent.serviceId } })
    }
  },
  mounted () {
    this.refreshAgents()
  },
  methods: {
    update () {
      this.contextKeys && Array.isArray(this.contextKeys) ? this.local.contextKeys = this.contextKeys.join(',') : this.local.contextKeys = null
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
