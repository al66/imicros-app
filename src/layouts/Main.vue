<template>
  <q-layout
    view="hHh lpr fFf"
  >
    <q-header>
      <q-toolbar
        class="bg-black text-white"
      >
        <q-btn
          flat
          dense
          round
          @click="leftDrawerOpen = !leftDrawerOpen"
          icon="menu"
          aria-label="Menu"
        />

        <q-toolbar-title>
          <q-btn to="/">
            <img
              class="toolbar-brand"
              alt="imicros-logo"
              src="~assets/imicros-grau.png"
            >
          </q-btn>
        </q-toolbar-title>
        <q-btn
          to="/login"
          icon="ion-log-in"
          v-if="!isAuthenticated()"
        />
        <!--
        <q-btn to='/login' icon="ion-log-in" :label="$t('Navbar.item.login')" v-if="!isAuthenticated()" />
        <q-btn to='/signin' :label="$t('Navbar.item.signin')" v-if="!isAuthenticated()" />
        -->
        <q-btn
          icon="person"
          v-if="isAuthenticated()"
        >
          <q-menu>
            <q-list>
              <q-item>
                <q-btn
                  flat
                  dense
                  style="min-width: 150px"
                  :label="lang"
                >
                  <q-menu auto-close>
                    <q-list>
                      <q-item
                        clickable
                        v-for="(index) in langs"
                        :key="index.value"
                        @click="setLocale(index)"
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
                  v-model="dark"
                  right-label
                  label="dark"
                />
              </q-item>
              <q-separator />
              <q-item
                clickable
                dense
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
          icon="ion-people"
          v-if="isAuthenticated()"
          to="/groups"
        />
        <q-btn-dropdown
          :label="lang"
          v-if="!isAuthenticated()"
        >
          <q-list>
            <q-item
              clickable
              v-for="(index) in langs"
              :key="index.value"
              @click="setLocale(index)"
            >
              <q-item-section>
                <q-item-label>{{ new String(index.label).toUpperCase() }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
        <q-btn
          v-if="isAuthenticated()"
          flat
          dense
          round
          @click="rightDrawerOpen = !rightDrawerOpen"
          icon="ion-at"
          aria-label="Menu"
        />
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      side="left"
      overlay
      bordered
    >
      <q-list>
        <q-item dense>
          <q-chip>{{ user.email }}</q-chip>
          <!-- <q-chip>{{ user.id }}</q-chip> -->
        </q-item>
        <q-item dense>
          <q-chip
            icon="ion-at"
            v-if="access.group.id"
          >
            {{ access.group.name }}
          </q-chip>
        </q-item>
        <q-item-label header>
          Applications
        </q-item-label>
        <q-item
          clickable
          to="/files"
        >
          <q-item-section avatar>
            <q-icon name="ion-filing" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Files</q-item-label>
            <q-item-label caption>
              File Manager
            </q-item-label>
          </q-item-section>
        </q-item>
        <q-item
          clickable
          to="/processeditor"
        >
          <q-item-section avatar>
            <q-icon name="ion-cog" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Processes</q-item-label>
            <q-item-label caption>
              Process Editor
            </q-item-label>
          </q-item-section>
        </q-item>
        <q-item
          clickable
          to="/ruleseteditor"
        >
          <q-item-section avatar>
            <q-icon name="assignment" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Rules</q-item-label>
            <q-item-label caption>
              Rules Editor
            </q-item-label>
          </q-item-section>
        </q-item>
        <q-item
          clickable
          to="/templates"
        >
          <q-item-section avatar>
            <q-icon name="ion-code-working" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Templates</q-item-label>
            <q-item-label caption>
              Template Editor
            </q-item-label>
          </q-item-section>
        </q-item>
        <q-item
          clickable
          to="/processmonitor"
        >
          <q-item-section avatar>
            <q-icon name="ion-pulse" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Processes</q-item-label>
            <q-item-label caption>
              Process Monitor
            </q-item-label>
          </q-item-section>
        </q-item>
        <q-item
          clickable
          to="/externalAccounts"
        >
          <q-item-section avatar>
            <q-icon name="ion-key" />
          </q-item-section>
          <q-item-section>
            <q-item-label>External Accounts</q-item-label>
            <q-item-label caption>
              External access management
            </q-item-label>
          </q-item-section>
        </q-item>
        <div v-if="access.group.core">
          <q-item-label header>
            Administration
          </q-item-label>
        </div>
        <q-item-label header>
          Essential Links
        </q-item-label>
        <q-item
          clickable
          tag="a"
          target="_blank"
          href="https://quasar.dev"
        >
          <q-item-section avatar>
            <q-icon name="school" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Docs</q-item-label>
            <q-item-label caption>
              quasar.dev
            </q-item-label>
          </q-item-section>
        </q-item>
        <q-item
          clickable
          tag="a"
          target="_blank"
          href="https://github.quasar.dev"
        >
          <q-item-section avatar>
            <q-icon name="code" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Github</q-item-label>
            <q-item-label caption>
              github.com/quasarframework
            </q-item-label>
          </q-item-section>
        </q-item>
        <q-item
          clickable
          tag="a"
          target="_blank"
          href="https://chat.quasar.dev"
        >
          <q-item-section avatar>
            <q-icon name="chat" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Discord Chat Channel</q-item-label>
            <q-item-label caption>
              chat.quasar.dev
            </q-item-label>
          </q-item-section>
        </q-item>
        <q-item
          clickable
          tag="a"
          target="_blank"
          href="https://forum.quasar.dev"
        >
          <q-item-section avatar>
            <q-icon name="record_voice_over" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Forum</q-item-label>
            <q-item-label caption>
              forum.quasar.dev
            </q-item-label>
          </q-item-section>
        </q-item>
        <q-item
          clickable
          tag="a"
          target="_blank"
          href="https://twitter.quasar.dev"
        >
          <q-item-section avatar>
            <q-icon name="rss_feed" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Twitter</q-item-label>
            <q-item-label caption>
              @quasarframework
            </q-item-label>
          </q-item-section>
        </q-item>
        <q-item
          clickable
          tag="a"
          target="_blank"
          href="https://facebook.quasar.dev"
        >
          <q-item-section avatar>
            <q-icon name="public" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Facebook</q-item-label>
            <q-item-label caption>
              @QuasarFramework
            </q-item-label>
          </q-item-section>
        </q-item>
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
      />
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { mapGetters } from 'vuex'
import AccessGroup from '../components/main/AccessGroup.vue'

export default {
  name: 'MyLayout',
  components: {
    AccessGroup
  },
  data () {
    return {
      leftDrawerOpen: false,
      rightDrawerOpen: false,
      langs: [
        { label: 'German', value: 'de' },
        { label: 'US English', value: 'en-us' }
      ],
      lang: this.$i18n.locale,
      dark: false,
      groups: []
    }
  },
  computed: {
      ...mapGetters({
          user: 'user',
          access: 'access'
      })
  },
  watch: {
    dark: function (val) {
      this.$q.dark.set(val)
    },
    rightDrawerOpen: function (val) {
      if (val) {
        //
      }
    }
  },
  methods: {
    isAuthenticated () {
      return this.$store.getters.isAuthenticated
    },
    setLocale (lang) {
      this.$i18n.locale = lang.value
      this.lang = this.$i18n.locale
      // set quasar's language too!!
      /* eslint-disable */
      import(/* webpackInclude: /(de|en-us)\.js$/ */ `quasar/lang/${ lang.value }`).then(language => { this.$q.lang.set(language.default) })
    },
    setDark (mode) {
      this.$q.dark.set(mode)
      this.dark = this.$q.dark.mode
    },
    login () {
      this.$router.push({ name: 'login' })
    },
    logout () {
      this.$router.push({ name: 'logout' })
    }
  }
}
</script>

<style>
.toolbar-brand {
    width: 100px;
}
</style>
