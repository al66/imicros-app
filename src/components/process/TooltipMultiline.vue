<template>
  <q-tooltip v-if="$t(keypath) !== ''">
    <i18n-t
      :keypath="keypath"
      tag="div"
      scope="global"
    >
      <br>
    </i18n-t>
  </q-tooltip>
</template>

<script>
import { QTooltip } from 'quasar'

export default {
  props: {
    keypath: {
      type: String,
      required: true
    }
  },
  components: {
    QTooltip
  },
  data: function () {
    return {
    }
  }
}
</script>
