<template>
  <q-list>
    <q-item
      dense
      clickable
      v-for="(group) in groups"
      :key="group.id"
      @click="requestAccess(group)"
      :disable="access.group.id === group.id"
    >
      <q-item-section>
        <q-item-label v-if="access.group.id !== group.id">
          {{ group.name }}
        </q-item-label>
        <q-chip
          icon="ion-at"
          v-if="access.group.id === group.id"
        >
          {{ group.name }}
        </q-chip>
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  props: {
    refresh: Boolean
  },
  emits: ['groupSelected'],
  data: function () {
    return {
      groups: []
    }
  },
  computed: {
    ...mapGetters({
      access: 'access'
    })
  },
  watch: {
    refresh: function () {
      this.getGroups()
    }
  },
  mounted () {
    this.getGroups()
  },
  methods: {
    getGroups () {
      // get groups
      const instance = this.$instance()
      instance.get('/#groups/list').then((response) => {
        if (response.data) {
          this.groups = []
          if (Array.isArray(response.data)) {
            for (let i = 0; i < response.data.length; i++) {
              const group = response.data[i]
              if (group.relation === 'MEMBER_OF' && !group.hide) this.groups.push(group)
            }
          }
        }
      }).catch((err) => {
        console.log(err)
      })
    },
    requestAccess (group) {
      //
      const this_ = this
      const params = {
        forGroupId: group.id
      }
      const instance = this.$instance()
      instance.post('/#acl/requestAccess', params).then((response) => {
        if (response.data && response.data.token) {
          this_.$store.commit('setAccess', {
            group: group,
            token: response.data.token
          })
          this.$emit('groupSelected', true)
        }
      }).catch((err) => {
        console.log(err)
      })
    }
  }
}
</script>
