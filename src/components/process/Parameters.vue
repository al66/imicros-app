<template>
  <div>
    <q-scroll-area style="height: calc(100vh - 50px - 90px;">
      <q-card>
        <q-card-section
          align="center"
          class="bg-grey text-white q-ma-xs q-pa-xs"
        >
          <q-item-label>{{ title }}</q-item-label>
        </q-card-section>
        <q-card-section
          align="left"
        >
          <Expansion
            general
            expanded
          >
            <q-card-section :key="triggerRendering">
              <q-input
                :model-value="id"
                :label="$t('Process.editor.parameters.dialog.elementId.label')"
                stack-label
                disable
              >
                <TooltipMultiline keypath="Process.editor.parameters.dialog.elementId.tooltip" />
              </q-input>
              <q-input
                v-model="local.elementName"
                :label="$t('Process.editor.parameters.dialog.elementName.label')"
                :hint="$t('Process.editor.parameters.dialog.elementName.hint')"
                stack-label
                @change="update"
              >
                <TooltipMultiline keypath="Process.editor.parameters.dialog.elementName.tooltip" />
              </q-input>
            </q-card-section>
          </Expansion>
          <!-- Start Event -->
          <div v-if="type === 'StartEvent'">
            <Expansion
              execution
              expanded
            >
              <q-card-section :key="triggerRendering">
                <q-input
                  v-if="subtype !== 'TimerEventDefinition' && subtype !== 'MessageEventDefinition'"
                  v-model="local.eventName"
                  :label="$t('Process.editor.parameters.dialog.startevent.eventName.label')"
                  :hint="$t('Process.editor.parameters.dialog.startevent.eventName.hint')"
                  hide-hint
                  stack-label
                  @change="update"
                >
                  <TooltipMultiline keypath="Process.editor.parameters.dialog.startevent.eventName.tooltip" />
                </q-input>
                <q-select
                  v-if="subtype === 'MessageEventDefinition'"
                  v-model="local.messageNames"
                  :label="$t('Process.editor.parameters.dialog.startevent.messageName.label')"
                  :hint="$t('Process.editor.parameters.dialog.startevent.messageName.hint')"
                  hide-hint
                  stack-label
                  use-input
                  use-chips
                  multiple
                  hide-dropdown-icon
                  input-debounce="0"
                  new-value-mode="add-unique"
                  @update:model-value="update"
                >
                  <TooltipMultiline keypath="Process.editor.parameters.dialog.startevent.messageName.tooltip" />
                </q-select>
                <q-input
                  v-if="subtype === 'TimerEventDefinition'"
                  v-model="local.cycle"
                  :label="$t('Process.editor.parameters.dialog.startevent.cycle.label')"
                  stack-label
                  @change="update"
                >
                  <TooltipMultiline keypath="Process.editor.parameters.dialog.startevent.cycle.tooltip" />
                </q-input>
                <q-input
                  v-if="subtype !== 'TimerEventDefinition'"
                  v-model="local.condition"
                  :label="$t('Process.editor.parameters.dialog.startevent.condition.label')"
                  :hint="$t('Process.editor.parameters.dialog.startevent.condition.hint')"
                  hide-hint
                  stack-label
                  @change="update"
                >
                  <TooltipMultiline keypath="Process.editor.parameters.dialog.startevent.condition.tooltip" />
                </q-input>
                <q-select
                  v-if="subtype !== 'TimerEventDefinition'"
                  v-model="local.contextOut"
                  :label="$t('Process.editor.parameters.dialog.startevent.context.label')"
                  :hint="$t('Process.editor.parameters.dialog.startevent.context.hint')"
                  hide-hint
                  stack-label
                  use-input
                  use-chips
                  hide-dropdown-icon
                  input-debounce="0"
                  new-value-mode="add-unique"
                  @update:model-value="update"
                >
                  <TooltipMultiline keypath="Process.editor.parameters.dialog.startevent.context.tooltip" />
                </q-select>
              </q-card-section>
            </Expansion>
          </div>
          <!-- Intermediate Throw Event -->
          <div v-if="type === 'IntermediateThrowEvent'">
            <Expansion
              preparation
              expanded
            >
              <q-card-section :key="triggerRendering">
                <q-select
                  v-model="local.contextInMultiple"
                  :label="$t('Process.editor.parameters.dialog.intermediateevent.throwing.preparation.context.label')"
                  :hint="$t('Process.editor.parameters.dialog.intermediateevent.throwing.preparation.context.hint')"
                  stack-label
                  use-input
                  use-chips
                  multiple
                  hide-dropdown-icon
                  input-debounce="5"
                  new-value-mode="add-unique"
                  @update:model-value="update"
                >
                  <TooltipMultiline keypath="Process.editor.parameters.dialog.intermediateevent.throwing.preparation.context.tooltip" />
                </q-select>
                <q-input
                  v-model="local.template"
                  :label="$t('Process.editor.parameters.dialog.intermediateevent.throwing.preparation.template.label')"
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
                    >
                      <TooltipMultiline keypath="Process.editor.parameters.dialog.intermediateevent.throwing.preparation.template.tooltip" />
                    </q-btn>
                  </template>
                </q-input>
              </q-card-section>
            </Expansion>
            <Expansion
              execution
              expanded
            >
              <q-card-section :key="triggerRendering">
                <q-input
                  v-if="subtype !== 'MessageEventDefinition'"
                  v-model="local.eventName"
                  :label="$t('Process.editor.parameters.dialog.intermediateevent.throwing.eventName.label')"
                  :hint="$t('Process.editor.parameters.dialog.intermediateevent.throwing.eventName.hint')"
                  hide-hint
                  stack-label
                  @change="update"
                >
                  <TooltipMultiline keypath="Process.editor.parameters.dialog.intermediateevent.throwing.eventName.tooltip" />
                </q-input>
                <q-input
                  v-if="subtype === 'MessageEventDefinition'"
                  v-model="local.messageName"
                  :label="$t('Process.editor.parameters.dialog.intermediateevent.throwing.messageName.label')"
                  :hint="$t('Process.editor.parameters.dialog.intermediateevent.throwing.messageName.hint')"
                  stack-label
                  @change="update"
                >
                  <TooltipMultiline keypath="Process.editor.parameters.dialog.intermediateevent.throwing.messageName.tooltip" />
                </q-input>
                <q-select
                  v-model="local.contextOut"
                  :label="$t('Process.editor.parameters.dialog.intermediateevent.throwing.context.label')"
                  :hint="$t('Process.editor.parameters.dialog.intermediateevent.throwing.context.hint')"
                  stack-label
                  use-input
                  use-chips
                  hide-dropdown-icon
                  input-debounce="0"
                  new-value-mode="add-unique"
                  @update:model-value="update"
                >
                  <TooltipMultiline keypath="Process.editor.parameters.dialog.intermediateevent.throwing.context.tooltip" />
                </q-select>
                <q-input
                  v-if="subtype === 'MessageEventDefinition'"
                  v-model="local.action"
                  :label="$t('Process.editor.parameters.dialog.intermediateevent.throwing.action.label')"
                  :hint="$t('Process.editor.parameters.dialog.intermediateevent.throwing.action.hint')"
                  stack-label
                  clearable
                  @change="update"
                >
                  <TooltipMultiline keypath="Process.editor.parameters.dialog.intermediateevent.throwing.action.tooltip" />
                </q-input>
                <q-input
                  v-if="subtype === 'ErrorEventDefinition'"
                  v-model="local.errorCode"
                  :label="$t('Process.editor.parameters.dialog.intermediateevent.throwing.errorCode.label')"
                  :hint="$t('Process.editor.parameters.dialog.intermediateevent.throwing.errorCode.hint')"
                  hide-hint
                  stack-label
                  @change="update"
                >
                  <TooltipMultiline keypath="Process.editor.parameters.dialog.intermediateevent.throwing.errorCode.tooltip" />
                </q-input>
                <q-input
                  v-if="subtype === 'ErrorEventDefinition'"
                  v-model="local.errorText"
                  :label="$t('Process.editor.parameters.dialog.intermediateevent.throwing.errorText.label')"
                  :hint="$t('Process.editor.parameters.dialog.intermediateevent.throwing.errorText.hint')"
                  hide-hint
                  stack-label
                  @change="update"
                >
                  <TooltipMultiline keypath="Process.editor.parameters.dialog.intermediateevent.throwing.errorText.tooltip" />
                </q-input>
              </q-card-section>
            </Expansion>
          </div>
          <!-- Intermediate Catch Event -->
          <div v-if="type === 'IntermediateCatchEvent'">
            <Expansion
              execution
              expanded
            >
              <q-card-section :key="triggerRendering">
                <q-input
                  v-model="local.eventName"
                  :label="$t('Process.editor.parameters.dialog.intermediateevent.catching.eventName.label')"
                  :hint="$t('Process.editor.parameters.dialog.intermediateevent.catching.eventName.hint')"
                  hide-hint
                  stack-label
                  @change="update"
                >
                  <TooltipMultiline keypath="Process.editor.parameters.dialog.intermediateevent.catching.eventName.tooltip" />
                </q-input>
                <q-input
                  v-if="subtype === 'TimerEventDefinition'"
                  v-model="local.duration"
                  :label="$t('Process.editor.parameters.dialog.intermediateevent.catching.duration.label')"
                  :hint="$t('Process.editor.parameters.dialog.intermediateevent.catching.duration.hint')"
                  stack-label
                  @change="update"
                >
                  <TooltipMultiline keypath="Process.editor.parameters.dialog.intermediateevent.catching.duration.tooltip" />
                </q-input>
                <q-select
                  v-if="subtype === 'MessageEventDefinition'"
                  v-model="local.messageNames"
                  :label="$t('Process.editor.parameters.dialog.intermediateevent.catching.messageName.label')"
                  :hint="$t('Process.editor.parameters.dialog.intermediateevent.catching.messageName.hint')"
                  stack-label
                  hide-hint
                  use-input
                  use-chips
                  multiple
                  hide-dropdown-icon
                  input-debounce="5"
                  new-value-mode="add-unique"
                  @update:model-value="update"
                >
                  <TooltipMultiline keypath="Process.editor.parameters.dialog.intermediateevent.catching.messageName.tooltip" />
                </q-select>
                <q-select
                  v-if="subtype !== 'TimerEventDefinition'"
                  v-model="local.contextInMultiple"
                  :label="$t('Process.editor.parameters.dialog.intermediateevent.catching.contextIn.label')"
                  :hint="$t('Process.editor.parameters.dialog.intermediateevent.catching.contextIn.hint')"
                  stack-label
                  hide-hint
                  use-input
                  use-chips
                  multiple
                  hide-dropdown-icon
                  input-debounce="5"
                  new-value-mode="add-unique"
                  @update:model-value="update"
                >
                  <TooltipMultiline keypath="Process.editor.parameters.dialog.intermediateevent.catching.contextIn.tooltip" />
                </q-select>
                <q-input
                  v-if="subtype !== 'TimerEventDefinition'"
                  v-model="local.condition"
                  :label="$t('Process.editor.parameters.dialog.intermediateevent.catching.condition.label')"
                  :hint="$t('Process.editor.parameters.dialog.intermediateevent.catching.condition.hint')"
                  hide-hint
                  stack-label
                  @change="update"
                >
                  <TooltipMultiline keypath="Process.editor.parameters.dialog.intermediateevent.catching.condition.tooltip" />
                </q-input>
                <q-select
                  v-if="subtype !== 'TimerEventDefinition'"
                  v-model="local.contextOut"
                  :label="$t('Process.editor.parameters.dialog.intermediateevent.catching.contextOut.label')"
                  :hint="$t('Process.editor.parameters.dialog.intermediateevent.catching.contextOut.hint')"
                  hide-hint
                  stack-label
                  use-input
                  use-chips
                  hide-dropdown-icon
                  input-debounce="0"
                  new-value-mode="add-unique"
                  @update:model-value="update"
                >
                  <TooltipMultiline keypath="Process.editor.parameters.dialog.intermediateevent.catching.contextOut.tooltip" />
                </q-select>
                <q-select
                  v-if="subtype === 'ErrorEventDefinition'"
                  v-model="local.errors"
                  :label="$t('Process.editor.parameters.dialog.intermediateevent.catching.errorCode.label')"
                  :hint="$t('Process.editor.parameters.dialog.intermediateevent.catching.errorCode.hint')"
                  hide-hint
                  stack-label
                  use-input
                  use-chips
                  multiple
                  hide-dropdown-icon
                  input-debounce="5"
                  new-value-mode="add-unique"
                  @update:model-value="update"
                >
                  <TooltipMultiline keypath="Process.editor.parameters.dialog.intermediateevent.catching.errorCode.tooltip" />
                </q-select>
              </q-card-section>
            </Expansion>
          </div>
          <!-- Boundary Event -->
          <div v-if="type === 'BoundaryEvent'">
            <Expansion
              execution
              expanded
            >
              <q-card-section :key="triggerRendering">
                <q-input
                  v-model="local.eventName"
                  :label="$t('Process.editor.parameters.dialog.boundaryevent.eventName.label')"
                  :hint="$t('Process.editor.parameters.dialog.boundaryevent.eventName.hint')"
                  hide-hint
                  stack-label
                  @change="update"
                >
                  <TooltipMultiline keypath="Process.editor.parameters.dialog.boundaryevent.eventName.tooltip" />
                </q-input>
                <q-select
                  v-if="subtype === 'MessageEventDefinition'"
                  v-model="local.messageNames"
                  :label="$t('Process.editor.parameters.dialog.boundaryevent.catching.messageName.label')"
                  :hint="$t('Process.editor.parameters.dialog.boundaryevent.catching.messageName.hint')"
                  stack-label
                  hide-hint
                  use-input
                  use-chips
                  multiple
                  hide-dropdown-icon
                  input-debounce="5"
                  new-value-mode="add-unique"
                  @update:model-value="update"
                >
                  <TooltipMultiline keypath="Process.editor.parameters.dialog.boundaryevent.catching.messageName.tooltip" />
                </q-select>
                <q-input
                  v-if="subtype === 'TimerEventDefinition'"
                  v-model="local.duration"
                  :label="$t('Process.editor.parameters.dialog.boundaryevent.duration.label')"
                  :hint="$t('Process.editor.parameters.dialog.boundaryevent.duration.hint')"
                  stack-label
                  @change="update"
                >
                  <TooltipMultiline keypath="Process.editor.parameters.dialog.boundaryevent.duration.tooltip" />
                </q-input>
                <q-select
                  v-if="subtype === 'ErrorEventDefinition'"
                  v-model="local.errors"
                  :label="$t('Process.editor.parameters.dialog.intermediateevent.catching.errorCode.label')"
                  :hint="$t('Process.editor.parameters.dialog.intermediateevent.catching.errorCode.hint')"
                  hide-hint
                  stack-label
                  use-input
                  use-chips
                  multiple
                  hide-dropdown-icon
                  input-debounce="5"
                  new-value-mode="add-unique"
                  @update:model-value="update"
                >
                  <TooltipMultiline keypath="Process.editor.parameters.dialog.intermediateevent.catching.errorCode.tooltip" />
                </q-select>
              </q-card-section>
            </Expansion>
          </div>
          <!-- End Event -->
          <div v-if="type === 'EndEvent'">
            <Expansion
              preparation
            >
              <q-card-section :key="triggerRendering">
                <q-select
                  v-model="local.contextInMultiple"
                  :label="$t('Process.editor.parameters.dialog.endevent.preparation.context.label')"
                  :hint="$t('Process.editor.parameters.dialog.endevent.preparation.context.hint')"
                  stack-label
                  use-input
                  use-chips
                  multiple
                  hide-dropdown-icon
                  input-debounce="5"
                  new-value-mode="add-unique"
                  @update:model-value="update"
                >
                  <TooltipMultiline keypath="Process.editor.parameters.dialog.endevent.preparation.context.tooltip" />
                </q-select>
                <q-input
                  v-model="local.template"
                  :label="$t('Process.editor.parameters.dialog.endevent.preparation.template.label')"
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
                    >
                      <TooltipMultiline keypath="Process.editor.parameters.dialog.endevent.preparation.template.tooltip" />
                    </q-btn>
                  </template>
                </q-input>
              </q-card-section>
            </Expansion>
            <Expansion
              execution
              expanded
            >
              <q-card-section :key="triggerRendering">
                <q-input
                  v-if="subtype !== 'MessageEventDefinition'"
                  v-model="local.eventName"
                  :label="$t('Process.editor.parameters.dialog.endevent.eventName.label')"
                  :hint="$t('Process.editor.parameters.dialog.endevent.eventName.hint')"
                  hide-hint
                  stack-label
                  @change="update"
                >
                  <TooltipMultiline keypath="Process.editor.parameters.dialog.endevent.eventName.tooltip" />
                </q-input>
                <q-input
                  v-if="subtype === 'MessageEventDefinition'"
                  v-model="local.messageName"
                  :label="$t('Process.editor.parameters.dialog.endevent.messageName.label')"
                  :hint="$t('Process.editor.parameters.dialog.endevent.messageName.hint')"
                  stack-label
                  @change="update"
                >
                  <TooltipMultiline keypath="Process.editor.parameters.dialog.endevent.messageName.tooltip" />
                </q-input>
                <q-select
                  v-model="local.contextOut"
                  :label="$t('Process.editor.parameters.dialog.endevent.context.label')"
                  :hint="$t('Process.editor.parameters.dialog.endevent.context.hint')"
                  stack-label
                  use-input
                  use-chips
                  hide-dropdown-icon
                  input-debounce="0"
                  new-value-mode="add-unique"
                  @update:model-value="update"
                >
                  <TooltipMultiline keypath="Process.editor.parameters.dialog.endevent.context.tooltip" />
                </q-select>
                <q-input
                  v-if="subtype === 'MessageEventDefinition'"
                  v-model="local.action"
                  :label="$t('Process.editor.parameters.dialog.endevent.action.label')"
                  :hint="$t('Process.editor.parameters.dialog.endevent.action.hint')"
                  stack-label
                  clearable
                  @change="update"
                >
                  <TooltipMultiline keypath="Process.editor.parameters.dialog.endevent.action.tooltip" />
                </q-input>
                <q-input
                  v-if="subtype === 'ErrorEventDefinition'"
                  v-model="local.errors"
                  :label="$t('Process.editor.parameters.dialog.endevent.errorCode.label')"
                  :hint="$t('Process.editor.parameters.dialog.endevent.errorCode.hint')"
                  hide-hint
                  stack-label
                  @change="update"
                >
                  <TooltipMultiline keypath="Process.editor.parameters.dialog.endevent.errorCode.tooltip" />
                </q-input>
                <q-input
                  v-if="subtype === 'ErrorEventDefinition'"
                  v-model="local.errorText"
                  :label="$t('Process.editor.parameters.dialog.endevent.errorText.label')"
                  :hint="$t('Process.editor.parameters.dialog.endevent.errorText.hint')"
                  hide-hint
                  stack-label
                  @change="update"
                >
                  <TooltipMultiline keypath="Process.editor.parameters.dialog.endevent.errorText.tooltip" />
                </q-input>
              </q-card-section>
            </Expansion>
          </div>
          <!-- Sequence Flow -->
          <div v-if="type === 'SequenceFlow'">
            <Expansion
              execution
              expanded
            >
              <q-card-section :key="triggerRendering">
                <q-select
                  v-model="local.contextInMultiple"
                  :label="$t('Process.editor.parameters.dialog.sequence.contextIn.label')"
                  :hint="$t('Process.editor.parameters.dialog.sequence.contextIn.hint')"
                  hide-hint
                  stack-label
                  use-input
                  use-chips
                  multiple
                  hide-dropdown-icon
                  input-debounce="0"
                  new-value-mode="add-unique"
                  @update:model-value="update"
                >
                  <TooltipMultiline keypath="Process.editor.parameters.dialog.sequence.contextIn.tooltip" />
                </q-select>
                <q-input
                  v-model="local.condition"
                  :label="$t('Process.editor.parameters.dialog.sequence.condition.label')"
                  :hint="$t('Process.editor.parameters.dialog.sequence.condition.hint')"
                  stack-label
                  @change="update"
                >
                  <TooltipMultiline keypath="Process.editor.parameters.dialog.sequence.condition.tooltip" />
                </q-input>
              </q-card-section>
            </Expansion>
          </div>
          <!-- Service Task -->
          <div v-if="type === 'ServiceTask'">
            <Expansion
              preparation
            >
              <q-card-section :key="triggerRendering">
                <q-select
                  v-model="local.contextInMultiple"
                  :label="$t('Process.editor.parameters.dialog.servicetask.preparation.context.label')"
                  :hint="$t('Process.editor.parameters.dialog.servicetask.preparation.context.hint')"
                  stack-label
                  use-input
                  use-chips
                  multiple
                  hide-dropdown-icon
                  input-debounce="5"
                  new-value-mode="add-unique"
                  @update:model-value="update"
                >
                  <TooltipMultiline keypath="Process.editor.parameters.dialog.servicetask.preparation.context.tooltip" />
                </q-select>
                <q-input
                  v-model="local.template"
                  :label="$t('Process.editor.parameters.dialog.servicetask.preparation.template.label')"
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
                    >
                      <TooltipMultiline keypath="Process.editor.parameters.dialog.servicetask.preparation.template.tooltip" />
                    </q-btn>
                  </template>
                </q-input>
              </q-card-section>
            </Expansion>
            <Expansion
              execution
              expanded
            >
              <q-card-section :key="triggerRendering">
                <q-select
                  v-model="local.contextIn"
                  :label="$t('Process.editor.parameters.dialog.servicetask.contextIn.label')"
                  :hint="$t('Process.editor.parameters.dialog.servicetask.contextIn.hint')"
                  stack-label
                  use-input
                  use-chips
                  hide-dropdown-icon
                  input-debounce="0"
                  new-value-mode="add-unique"
                  @update:model-value="update"
                >
                  <TooltipMultiline keypath="Process.editor.parameters.dialog.servicetask.contextIn.tooltip" />
                </q-select>
                <q-input
                  v-model="local.action"
                  :label="$t('Process.editor.parameters.dialog.servicetask.action.label')"
                  :hint="$t('Process.editor.parameters.dialog.servicetask.contextIn.hint')"
                  stack-label
                  clearable
                  @change="update"
                >
                  <TooltipMultiline keypath="Process.editor.parameters.dialog.servicetask.contextIn.tooltip" />
                </q-input>
                <q-select
                  v-model="local.serviceId"
                  :options="optionsAgents"
                  :label="$t('Process.editor.parameters.dialog.servicetask.serviceId.label')"
                  :hint="$t('Process.editor.parameters.dialog.servicetask.serviceId.hint')"
                  stack-label
                  clearable
                  emit-value
                  map-options
                  @update:model-value="update"
                >
                  <TooltipMultiline keypath="Process.editor.parameters.dialog.servicetask.serviceId.tooltip" />
                </q-select>
                <q-select
                  v-model="local.contextOut"
                  :label="$t('Process.editor.parameters.dialog.servicetask.contextOut.label')"
                  :hint="$t('Process.editor.parameters.dialog.servicetask.contextOut.hint')"
                  stack-label
                  use-input
                  use-chips
                  hide-dropdown-icon
                  input-debounce="0"
                  new-value-mode="add-unique"
                  @update:model-value="update"
                >
                  <TooltipMultiline keypath="Process.editor.parameters.dialog.servicetask.contextOut.tooltip" />
                </q-select>
              </q-card-section>
            </Expansion>
          </div>
          <!-- Business Rule Task -->
          <div v-if="type === 'BusinessRuleTask'">
            <Expansion
              execution
              expanded
            >
              <q-card-section :key="triggerRendering">
                <q-input
                  v-model="local.objectName"
                  :label="$t('Process.editor.parameters.dialog.businessruletask.objectName.label')"
                  :hint="$t('Process.editor.parameters.dialog.businessruletask.objectName.hint')"
                  hide-hint
                  stack-label
                  @change="update"
                >
                  <TooltipMultiline keypath="Process.editor.parameters.dialog.businessruletask.objectName.tooltip" />
                </q-input>
                <q-checkbox
                  v-model="local.embedded"
                  :label="$t('Process.editor.parameters.dialog.businessruletask.embedded.label')"
                  hide-hint
                  @update:model-value="update"
                >
                  <TooltipMultiline keypath="Process.editor.parameters.dialog.businessruletask.embedded.tooltip" />
                </q-checkbox>
                <q-select
                  v-model="local.contextInMultiple"
                  :label="$t('Process.editor.parameters.dialog.businessruletask.contextIn.label')"
                  :hint="$t('Process.editor.parameters.dialog.businessruletask.contextIn.hint')"
                  stack-label
                  use-input
                  use-chips
                  multiple
                  hide-dropdown-icon
                  input-debounce="0"
                  new-value-mode="add-unique"
                  @update:model-value="update"
                >
                  <TooltipMultiline keypath="Process.editor.parameters.dialog.businessruletask.contextIn.tooltip" />
                </q-select>
                <q-select
                  v-model="local.contextOut"
                  :label="$t('Process.editor.parameters.dialog.businessruletask.contextOut.label')"
                  :hint="$t('Process.editor.parameters.dialog.businessruletask.contextOut.hint')"
                  stack-label
                  use-input
                  use-chips
                  hide-dropdown-icon
                  input-debounce="0"
                  new-value-mode="add-unique"
                  @update:model-value="update"
                >
                  <TooltipMultiline keypath="Process.editor.parameters.dialog.businessruletask.contextOut.tooltip" />
                </q-select>
              </q-card-section>
            </Expansion>
          </div>
          <!-- Send Task -->
          <div v-if="type === 'SendTask'">
            <Expansion
              preparation
            >
              <q-card-section :key="triggerRendering">
                <q-select
                  v-model="local.contextInMultiple"
                  :label="$t('Process.editor.parameters.dialog.sendtask.preparation.context.label')"
                  :hint="$t('Process.editor.parameters.dialog.sendtask.preparation.context.hint')"
                  stack-label
                  use-input
                  use-chips
                  multiple
                  hide-dropdown-icon
                  input-debounce="5"
                  new-value-mode="add-unique"
                  @update:model-value="update"
                >
                  <TooltipMultiline keypath="Process.editor.parameters.dialog.sendtask.preparation.context.tooltip" />
                </q-select>
                <q-input
                  v-model="local.template"
                  :label="$t('Process.editor.parameters.dialog.sendtask.preparation.template.label')"
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
                    >
                      <TooltipMultiline keypath="Process.editor.parameters.dialog.sendtask.preparation.template.tooltip" />
                    </q-btn>
                  </template>
                </q-input>
              </q-card-section>
            </Expansion>
            <Expansion
              execution
              expanded
            >
              <q-card-section :key="triggerRendering">
                <q-input
                  v-model="local.messageName"
                  :label="$t('Process.editor.parameters.dialog.sendtask.messageName.label')"
                  :hint="$t('Process.editor.parameters.dialog.sendtask.messageName.hint')"
                  stack-label
                  @change="update"
                >
                  <TooltipMultiline keypath="Process.editor.parameters.dialog.sendtask.messageName.tooltip" />
                </q-input>
                <q-select
                  v-model="local.contextIn"
                  :label="$t('Process.editor.parameters.dialog.sendtask.contextIn.label')"
                  :hint="$t('Process.editor.parameters.dialog.sendtask.contextIn.hint')"
                  stack-label
                  use-input
                  use-chips
                  hide-dropdown-icon
                  input-debounce="0"
                  new-value-mode="add-unique"
                  @update:model-value="update"
                >
                  <TooltipMultiline keypath="Process.editor.parameters.dialog.sendtask.contextIn.tooltip" />
                </q-select>
                <q-input
                  v-model="local.action"
                  :label="$t('Process.editor.parameters.dialog.sendtask.action.label')"
                  stack-label
                  clearable
                  @change="update"
                >
                  <TooltipMultiline keypath="Process.editor.parameters.dialog.sendtask.action.tooltip" />
                </q-input>
                <q-select
                  v-model="local.contextOut"
                  :label="$t('Process.editor.parameters.dialog.sendtask.contextOut.label')"
                  :hint="$t('Process.editor.parameters.dialog.sendtask.contextOut.hint')"
                  stack-label
                  use-input
                  use-chips
                  hide-dropdown-icon
                  input-debounce="0"
                  new-value-mode="add-unique"
                  @update:model-value="update"
                >
                  <TooltipMultiline keypath="Process.editor.parameters.dialog.sendtask.contextOut.tooltip" />
                </q-select>
              </q-card-section>
            </Expansion>
          </div>
          <!-- Receive Task -->
          <div v-if="type === 'ReceiveTask'">
            <Expansion
              execution
              expanded
            >
              <q-card-section :key="triggerRendering">
                <q-select
                  v-model="local.messageNames"
                  :label="$t('Process.editor.parameters.dialog.receivetask.messageName.label')"
                  :hint="$t('Process.editor.parameters.dialog.receivetask.messageName.hint')"
                  stack-label
                  hide-hint
                  use-input
                  use-chips
                  multiple
                  hide-dropdown-icon
                  input-debounce="5"
                  new-value-mode="add-unique"
                  @update:model-value="update"
                >
                  <TooltipMultiline keypath="Process.editor.parameters.dialog.receivetask.messageName.tooltip" />
                </q-select>
                <q-select
                  v-model="local.contextOut"
                  :label="$t('Process.editor.parameters.dialog.receivetask.contextOut.label')"
                  :hint="$t('Process.editor.parameters.dialog.receivetask.contextOut.hint')"
                  stack-label
                  use-input
                  use-chips
                  hide-dropdown-icon
                  input-debounce="0"
                  new-value-mode="add-unique"
                  @update:model-value="update"
                >
                  <TooltipMultiline keypath="Process.editor.parameters.dialog.receivetask.contextOut.tooltip" />
                </q-select>
              </q-card-section>
            </Expansion>
          </div>
        </q-card-section>
      </q-card>
    </q-scroll-area>
    <!--
    <q-dialog
      v-model="template.edit"
      full-width
      full-height
    > -->
    <q-dialog
      v-model="template.edit"
      style="min-width: 500px;"
    >
      <q-card style="min-width: 500px;">
        <!--
        <q-card-section
          align="center"
          class="bg-black text-white q-pa-sm q-mb-sm"
        >
          <div class="text-h6">
            {{ $t('Action.edit') }}
          </div>
        </q-card-section>
        -->
        <q-card-section>
          <editor
            v-model:content="template.data"
            lang="text"
            width="100%"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            dense
            flat
            icon="ion-save"
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
import Expansion from 'src/components/process/Expansion.vue'
import TooltipMultiline from 'src/components/process/TooltipMultiline.vue'
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
      type: String,
      default: '',
      required: false
    },
    parameters: {
      type: Object,
      required: true
    },
    contextKeys: {
      type: Array,
      default: () => {
        return []
      },
      required: false
    }
  },
  emits: ['update:parameters'],
  components: {
    Editor,
    Expansion,
    TooltipMultiline
  },
  data () {
    return {
      title: this.$t('Process.editor.parameters.dialog.title'),
      template: {
        data: '',
        edit: false
      },
      agents: {
        data: []
      },
      tooltip: {},
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
      console.log(this.type)
      this.local = Object.assign(newVal)
      // hack - has not updated all q-sections
      this.triggerRendering += 1
      // this.$forceUpdate()
    },
    type: function () {
      this.getTitle()
    },
    subtype: function () {
      this.getTitle()
    },
    '$i18n.locale': function () {
      this.getTitle()
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
    getTitle () {
      this.title = this.$t(`Process.editor.parameters.dialog.title${this.type ? '.' + this.type : ''}${this.subtype ? '.' + this.subtype : ''}`)
    },
    editTemplate () {
      // this.template.data = this.selected.parameterObject.template
      // this.template.data = Buffer.from(this.local.template || '', 'base64').toString('ascii')
      this.template.data = this.local.template || ''
      this.template.edit = true
    },
    saveTemplate () {
      // this.selected.parameterObject.template = this.template.data
      // this.local.template = Buffer.from(this.template.data).toString('base64')
      console.log(this.template.data)
      this.local.template = this.template.data
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
