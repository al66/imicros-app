<template>
  <div>
    <!-- panels -->
    <!-- panels -->
    <q-tab-panels v-model="tab">
      <!-- editor panel -->
      <q-tab-panel
        name="editor"
        class="q-pt-none"
      >
        <q-toolbar>
          <q-space />
          <q-select
            dense
            borderless
            use-input
            clearable
            v-model="serviceSelected"
            :options="serviceOptions"
            @filter="filterServices"
            new-value-mode="add-unique"
            label="Service"
            style="min-width: 250px"
          >
            <template #prepend>
              <q-icon name="bi-gear" />
            </template>
          </q-select>
          <q-space />
        </q-toolbar>
        <div :class="{ 'truncate-chip-labels': true }">
          <q-chip dense>
            {{ service ? ( service.method || 'POST' ) + ' ' + baseUrl + (typeof service === 'string' ? service : service.value ) : baseUrl }}
          </q-chip>
          <q-chip
            v-if="service.git"
            icon="bi-github"
            :label="service.git"
            clickable
            dense
            @click="help(service.git)"
          />
          <q-chip
            v-if="service.help"
            icon="bi-info"
            :label="service.help"
            clickable
            dense
            @click="help(service.help)"
          />
        </div>
        <q-splitter
          v-model="splitter.templates"
          :limits="[30, 100]"
          style="height:100%"
        >
          <template #before>
            <q-toolbar>
              <q-chip
                outline
                square
                color="primary"
              >
                Parameter
              </q-chip>
              <q-space />
              <toolbar-btn
                icon="ion-play"
                @click="call"
              />
              <q-space />
            </q-toolbar>
            <q-scroll-area style="height: calc(100vh - 50px - 120px);">
              <editor
                v-model:content="test.data"
                lang="json"
                width="100%"
              />
            </q-scroll-area>
          </template>
          <template #separator>
            <q-avatar
              color="primary"
              text-color="white"
              size="30px"
              icon="drag_indicator"
            />
          </template>
          <template #after>
            <q-toolbar>
              <q-chip
                outline
                square
                color="primary"
              >
                Result
              </q-chip>
              <q-space />
              <q-space />
            </q-toolbar>
            <q-scroll-area style="height: calc(100vh - 50px - 120px);">
              <editor
                v-model:content="test.result"
                readonly
                lang="json"
                width="100%"
              />
            </q-scroll-area>
          </template>
        </q-splitter>
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>

<script>
import { ref } from 'vue'
// vuex store
import { mapGetters } from 'vuex'
// components
import Editor from 'src/components/global/Editor.vue'
import ToolbarBtn from 'src/components/global/ToolbarBtn.vue'
// services with exapmples
import services from 'src/pages/serviceTest.services.js'

export default {
  name: 'ServiceTest',
  components: {
    Editor,
    ToolbarBtn
  },
  setup () {
    const serviceSelected = ref({ label: '', value: '' })
    const serviceOptions = ref(services)
    const test = ref({ data: '', result: '' })
    const baseUrl = ref(location.origin + '/api/')
    return {
      tab: 'editor',
      serviceSelected,
      serviceOptions,
      test,
      baseUrl,
      splitter: {
        templates: 50, // start at 80%
        testdata: 30,
        testresult: 50
      },
      filterServices (val, update) {
        update(() => {
          if (val === '') {
            serviceOptions.value = services
          } else {
            const needle = val.toLowerCase()
            serviceOptions.value = services.filter(
              v => v.value.toLowerCase().indexOf(needle) > -1
            )
          }
        })
      }
    }
  },
  watch: {
    service: function (newVal) {
      this.test.result = ''
      if (!newVal || !newVal.example) {
        this.test.data = '{}'
      } else {
        this.test.data = JSON.stringify(newVal.example, null, '\t')
      }
    }
  },
  computed: {
    ...mapGetters({
      access: 'access'
    }),
    service: function () {
      if (!this.serviceSelected) return { label: '', value: '' }
      return this.serviceSelected
    }
  },
  methods: {
    call () {
      this.test.result = ''
      // const index = services.findIndex(service => { return service.value === this.service.value })
      // if (index >= 0) {
      const instance = this.$instance()
      instance.defaults.headers.common['x-imicros-xtoken'] = this.access.token
      instance.defaults.headers.common['Content-Type'] = 'application/json'
      let params
      try {
        params = JSON.parse(this.test.data)
      } catch (err) {
        console.log('Wrong parameters - failed to parse', err)
      }
      const method = this.service.method ? this.service.method.toLowerCase() : 'post'
      const request = {
        method,
        url: '/api/' + (typeof this.service === 'string' ? this.service : this.service.value),
        data: method !== 'get' ? params : null,
        params: method === 'get' ? params : null
      }
      instance.request(request).then((result) => {
        // console.log(result)
        if (result) {
          if ('data' in result) {
            try {
              this.test.result = JSON.stringify(result.data, null, '\t')
            } catch (err) {
              this.test.result = result.data
            }
          } else {
            this.test.result = result
          }
        }
      }).catch((err) => {
        // console.error('Failed to call service ' + this.service.value, err)
        this.test.result = err.toString()
      })
      // }
    },
    help (url) {
      window.open(url)
    }
  }
}
</script>
