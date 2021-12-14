<template>
  <div>
    <q-btn
      v-if="icon"
      :flat="sub"
      round
      no-caps
      size="sm"
      :icon="icon"
      :color="color ? color : sub === true ? 'grey' : 'primary'"
      :class="btnClass"
      :disable="disable"
    >
      <q-tooltip v-if="tooltip">
        {{ tooltip }}
      </q-tooltip>
      <slot />
    </q-btn>
    <q-btn
      v-if="!icon"
      :flat="sub"
      round
      no-caps
      size="sm"
      :label="label"
      :color="color ? color : sub === true ? 'grey' : 'primary'"
      :class="btnClass"
      :disable="disable"
    >
      <q-tooltip v-if="tooltip">
        {{ tooltip }}
      </q-tooltip>
      <slot />
    </q-btn>
  </div>
</template>

<script>
import { QBtn } from 'quasar'

export default {
  props: {
    sub: Boolean,
    icon: {
      type: String,
      default: null,
      required: false
    },
    label: {
      type: String,
      default: null,
      required: false
    },
    specialClass: {
      type: String,
      default: null,
      required: false
    },
    tooltip: {
      type: String,
      default: null,
      required: false
    },
    disable: Boolean,
    color: {
      type: String,
      default: null,
      required: false
    }
  },
  components: {
    QBtn
  },
  data: function () {
    return {
      btnClass: this.specialClass ? this.specialClass : 'q-mr-sm'
    }
  }
}
</script>
