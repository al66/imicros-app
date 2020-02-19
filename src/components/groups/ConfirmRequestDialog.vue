<template>
  <!-- request confirm dialog -->
  <q-dialog v-model="dialog" v-if="request.request">
    <q-card>
      <q-card-section align="center" class="bg-black text-white q-pa-sm q-mb-lg">
        <div class="text-h6">{{ $t('Members.dialog.request.title') }}</div>
      </q-card-section>
      <q-card-section class="q-pt-none">
        {{ $t('Members.dialog.request.' + request.request) }}
      </q-card-section>
      <q-card-actions align="right">
        <q-btn dense flat :label="$t('Action.accept')" icon="ion-thumbs-up" text-color="primary" @click="acceptRequest()"/>
        <q-btn dense flat :label="$t('Action.decline')" icon="ion-thumbs-down" text-color="red" @click="declineRequest()"/>
        <q-btn dense flat icon="ion-close-circle" color="grey" @click="$emit('close')">
          <q-tooltip>{{ $t('Action.cancel') }}</q-tooltip>
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
export default {
  props: {
    show: Boolean,
    group: {
      type: Object,
      required: true
    },
    request: {
      type: Object,
      required: true
    }
  },
  data: function () {
    return {
      dialog: false
    }
  },
  watch: {
    show: function (oldVal, newVal) {
      this.dialog = this.show
    },
    dialog: function () {
      if (!this.dialog) this.$emit('close')
    }
  },
  methods: {
    acceptRequest () {
      let instance = this.$instance()
      let param = {
        groupId: this.group.id,
        request: this.request.request
      }
      instance.post('/#groups/accept', param).then((response) => {
        if (response.data && Array.isArray(response.data) && response.data.length > 0 && response.data[0].userId) {
          this.$emit('accept')
          this.$emit('close')
        }
      })
    },
    declineRequest () {
      let instance = this.$instance()
      let param = {
        groupId: this.group.id,
        request: this.request.request
      }
      instance.post('/#groups/decline', param).then((response) => {
        if (response.data && Array.isArray(response.data) && response.data.length > 0 && response.data[0].userId) {
          this.$emit('decline')
          this.$emit('close')
        }
      })
    }
  }
}
</script>
