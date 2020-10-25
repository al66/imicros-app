<template>
  <q-btn
    :flat="sub"
    round
    no-caps
    size="sm"
    :color="color ? color : sub === true ? 'grey' : 'primary'"
    :icon="icon"
    :class="btnClass"
    :disable="disable"
    @click="$emit('click')"
  >
    <slot />
  </q-btn>
</template>

<script>
  import { QBtn } from 'quasar'

  export default {
    props: {
      sub: Boolean,
      icon: {
        type: String,
        required: true
      },
      specialClass: {
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
