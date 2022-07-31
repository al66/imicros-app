<template>
  <q-expansion-item
    v-if="general"
    dense
    dense-toggle
    expand-separator
    :default-opened="expanded"
    :label="$t('Process.editor.parameters.dialog.section.general.label')"
  >
    <slot />
  </q-expansion-item>
  <q-expansion-item
    v-if="preparation"
    dense
    dense-toggle
    expand-separator
    :default-opened="expanded"
    icon="bi-braces"
    :label="$t('Process.editor.parameters.dialog.section.preparation.label')"
  >
    <slot />
  </q-expansion-item>
  <q-expansion-item
    v-if="execution"
    dense
    dense-toggle
    expand-separator
    :default-opened="expanded"
    icon="bi-gear-fill"
    :label="$t('Process.editor.parameters.dialog.section.execution.label')"
  >
    <slot />
  </q-expansion-item>
</template>

<script>
import { QExpansionItem } from 'quasar'

export default {
  props: {
    general: {
      type: Boolean,
      default: false,
      required: false
    },
    execution: {
      type: Boolean,
      default: false,
      required: false
    },
    preparation: {
      type: Boolean,
      default: false,
      required: false
    },
    expanded: {
      type: Boolean,
      default: false,
      required: false
    }
  },
  components: {
    QExpansionItem
  },
  data: function () {
    return {
    }
  }
}
</script>
