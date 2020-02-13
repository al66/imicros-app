<template>
  <q-list>
    <q-item dense clickable v-for='(group) in groups' v-bind:key='group.id' @click="requestAccess(group)">
      <q-item-section>
        <q-item-label>{{ group.name }}</q-item-label>
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
      let instance = this.$instance()
      instance.get('/#groups/list').then((response) => {
        if (response.data) {
          this.groups = []
          if (Array.isArray(response.data)) {
            for (let i = 0; i < response.data.length; i++) {
              let group = response.data[i]
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
      let this_ = this
      let params = {
        forGroupId: group.id
      }
      let instance = this.$instance()
      instance.post('/#acl/requestAccess', params).then((response) => {
        if (response.data && response.data.token) {
          this_.$store.commit('setAccess', {
            group: group,
            token: response.data.token
          })
        }
      }).catch((err) => {
        console.log(err)
      })
    }
  }
}
</script>
