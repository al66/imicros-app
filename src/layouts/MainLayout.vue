<template>
  <q-layout view="hHh lpr fFf">
    <q-header>
      <q-toolbar
        :class="$q.dark.isActive ? 'bg-black text-white' : 'bg-grey-2 text-black'"
      >
        <q-btn
          v-if="isAuthenticated()"
          flat
          dense
          icon="bi-list"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title>
          <q-btn
            flat
            to="/"
          >
            <q-img
              v-if="!this.$q.dark.isActive"
              class="toolbar-brand"
              width="100px"
              alt="imicros-logo"
              src="~assets/imicros-logo-black.svg"
            />
            <q-img
              v-if="this.$q.dark.isActive"
              class="toolbar-brand"
              width="100px"
              alt="imicros-logo"
              src="~assets/imicros-logo-light-grey.svg"
            />
          </q-btn>
        </q-toolbar-title>
        <q-space />

        <q-btn
          v-if="isAuthenticated()"
          flat
          no-caps
          color="grey"
          @click="toggleRightDrawer"
          icon="ion-at"
          aria-label="Menu"
        >
          {{ access.group.name }}
        </q-btn>
        <q-btn
          v-if="!isAuthenticated()"
          to="/login"
          icon="ion-log-in"
          flat
        />
        <q-btn-dropdown
          v-if="!isAuthenticated()"
          flat
          :label="locale"
        >
          <q-list>
            <q-item
              clickable
              v-close-popup
              v-for="(index) in langs"
              :key="index.value"
              @click="locale = index.value"
            >
              <q-item-section>
                <q-item-label>{{ new String(index.label).toUpperCase() }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>

        <q-btn
          v-if="isAuthenticated()"
          icon="person"
          flat
        >
          <q-menu>
            <q-list>
              <q-item
                clickable
                to="/user"
              >
                <q-item-section avatar>
                  <q-icon name="ion-settings" />
                </q-item-section>
                <q-item-section>{{ user.email }}</q-item-section>
              </q-item>
              <q-separator />
              <q-item>
                <q-btn
                  flat
                  dense
                  style="min-width: 150px"
                  :label="locale"
                >
                  <q-menu auto-close>
                    <q-list>
                      <q-item
                        clickable
                        v-for="(index) in langs"
                        :key="index.value"
                        @click="locale = index.value"
                      >
                        <q-item-section>
                          <q-item-label>{{ new String(index.label).toUpperCase() }}</q-item-label>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-menu>
                </q-btn>
              </q-item>
              <q-item>
                <q-toggle
                  dense
                  v-model="fullscreen"
                  right-label
                  label="full screen"
                  @click="$q.fullscreen.toggle()"
                />
              </q-item>
              <q-item>
                <q-toggle
                  dense
                  v-model="dark"
                  right-label
                  label="dark"
                  @click="$q.dark.toggle()"
                />
              </q-item>
              <q-separator />
              <q-item
                clickable
                @click="logout()"
              >
                <q-item-section avatar>
                  <q-icon name="ion-log-out" />
                </q-item-section>
                <q-item-section>{{ $t('Login.button.logout') }}</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
        <q-btn
          v-if="isAuthenticated()"
          icon="ion-people"
          to="/groups"
          flat
        />
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      side="left"
      overlay
      bordered
    >
      <q-list v-if="access.group.name">
        <q-item-label
          header
        >
          Applications
        </q-item-label>

        <AppLink
          v-for="link in appLinks"
          :key="link.title"
          v-bind="link"
        />
      </q-list>
      <q-list v-if="essentialLinks.length">
        <q-item-label
          header
        >
          Essential Links
        </q-item-label>

        <EssentialLink
          v-for="link in essentialLinks"
          :key="link.title"
          v-bind="link"
        />
      </q-list>
    </q-drawer>

    <q-drawer
      v-model="rightDrawerOpen"
      side="right"
      overlay
      bordered
    >
      <access-group
        v-if="isAuthenticated()"
        :refresh="rightDrawerOpen"
        @group-selected="toggleRightDrawer"
      />
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import EssentialLink from 'components/EssentialLink.vue'

const linksList = [
  /*
  {
    title: 'Docs',
    caption: 'quasar.dev',
    icon: 'school',
    link: 'https://quasar.dev'
  },
  {
    title: 'Github',
    caption: 'github.com/quasarframework',
    icon: 'code',
    link: 'https://github.com/quasarframework'
  },
  {
    title: 'Discord Chat Channel',
    caption: 'chat.quasar.dev',
    icon: 'chat',
    link: 'https://chat.quasar.dev'
  },
  {
    title: 'Forum',
    caption: 'forum.quasar.dev',
    icon: 'record_voice_over',
    link: 'https://forum.quasar.dev'
  },
  {
    title: 'Twitter',
    caption: '@quasarframework',
    icon: 'rss_feed',
    link: 'https://twitter.quasar.dev'
  },
  {
    title: 'Facebook',
    caption: '@QuasarFramework',
    icon: 'public',
    link: 'https://facebook.quasar.dev'
  },
  {
    title: 'Quasar Awesome',
    caption: 'Community Quasar projects',
    icon: 'favorite',
    link: 'https://awesome.quasar.dev'
  }
  */
]
import AppLink from 'src/components/main/AppLink.vue'
import AccessGroup from 'src/components/main/AccessGroup.vue'
import { defineComponent, ref, watch } from 'vue'
import { mapGetters } from 'vuex'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'

const appList = [
  {
    title: 'Files',
    caption: 'File Manager',
    icon: 'bi-folder',
    route: '/files'
  },
  {
    title: 'Processes',
    caption: 'BPMN Process Editor',
    icon: 'bi-diagram-2',
    route: '/processeditor'
  },
  {
    title: 'Decisions',
    caption: 'DMN Modeler',
    icon: 'bi-file-ruled',
    route: '/decisionmodeler',
    status: 'beta'
  },
  {
    title: 'Templates',
    caption: 'Template Editor',
    icon: 'bi-code-square',
    route: '/templates',
    status: 'alpha'
  },
  {
    title: 'Test Terminal',
    caption: 'Test single services',
    icon: 'bi-terminal',
    route: '/test',
    status: 'alpha'
  },
  {
    title: 'Processes',
    caption: 'Process Monitor',
    icon: 'bi-activity',
    route: '/processmonitor',
    status: 'alpha'
  },
  {
    title: 'Agents',
    caption: 'Manage accounts for external acces',
    icon: 'bi-key',
    route: '/agents',
    status: 'alpha'
  },
  {
    title: 'Mail accounts',
    caption: 'Manage mail account acces',
    icon: 'bi-mailbox',
    route: '/externalAccounts',
    status: 'alpha'
  }
]

export default defineComponent({
  name: 'MainLayout',

  components: {
    AppLink,
    EssentialLink,
    AccessGroup
  },

  setup () {
    const leftDrawerOpen = ref(false)
    const rightDrawerOpen = ref(false)
    const { locale } = useI18n({ useScope: 'global' })
    const $q = useQuasar()
    const dark = ref(false)
    const fullscreen = ref(false)

    watch(() => $q.dark.isActive, val => {
      // console.log(val ? 'On dark mode' : 'On light mode')
      dark.value = val
    })
    watch(() => $q.fullscreen.isActive, val => {
      fullscreen.value = val
    })
    return {
      essentialLinks: linksList,
      appLinks: appList,
      leftDrawerOpen,
      rightDrawerOpen,
      locale,
      langs: [
        { label: 'German', value: 'de' },
        { label: 'US English', value: 'en-US' }
      ],
      dark,
      fullscreen,
      groups: [],
      toggleLeftDrawer () {
        leftDrawerOpen.value = !leftDrawerOpen.value
      },
      toggleRightDrawer () {
        rightDrawerOpen.value = !rightDrawerOpen.value
      }
    }
  },
  computed: {
    ...mapGetters({
      user: 'user',
      access: 'access'
    })
  },

  methods: {
    isAuthenticated () {
      return this.$store.getters.isAuthenticated
    },
    login () {
      this.$router.push({ name: 'login' })
    },
    logout () {
      this.$router.push({ name: 'logout' })
    }
  }
})
</script>
