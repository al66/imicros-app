<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated>
      <q-toolbar class="bg-black text-white">
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
            <img class='toolbar-brand' alt='imicros-logo' src='~assets/imicros-grau.png'>
          </q-btn>
        </q-toolbar-title>

        <q-btn to='/login' icon="ion-log-in" :label="$t('Navbar.item.login')" v-if="!isAuthenticated()" />
        <q-btn to='/signin' :label="$t('Navbar.item.signin')" v-if="!isAuthenticated()" />
        <q-btn icon="person" v-if="isAuthenticated()" >
          <q-menu>
            <q-list>
              <q-item>
                <q-btn flat dense style="min-width: 150px" :label="lang">
                  <q-menu auto-close>
                    <q-list>
                      <q-item clickable v-for='(lang) in langs' v-bind:key='lang.value' @click="setLocale(lang)">
                        <q-item-section>
                          <q-item-label>{{ new String(lang.label).toUpperCase() }}</q-item-label>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-menu>
                </q-btn>
              </q-item>
              <q-item>
                <q-toggle dense  v-model="dark" right-label label="dark" />
              </q-item>
              <q-separator />
              <q-item clickable dense @click="logout()">
                <q-item-section avatar>
                  <q-icon name="ion-log-out" />
                </q-item-section>
                <q-item-section>{{ $t('Login.button.logout') }}</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
        <q-btn icon="ion-people" v-if="isAuthenticated()" to="/groups"/>
        <q-btn-dropdown :label="lang" v-if="!isAuthenticated()" >
          <q-list>
            <q-item clickable v-for='(lang) in langs' v-bind:key='lang.value' @click="setLocale(lang)">
              <q-item-section>
                <q-item-label>{{ new String(lang.label).toUpperCase() }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
    >
      <q-chip>{{ user.email }}</q-chip>
      <q-list>
        <q-item-label header>Essential Links</q-item-label>
        <q-item clickable tag="a" target="_blank" href="https://quasar.dev">
          <q-item-section avatar>
            <q-icon name="school" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Docs</q-item-label>
            <q-item-label caption>quasar.dev</q-item-label>
          </q-item-section>
        </q-item>
        <q-item clickable tag="a" target="_blank" href="https://github.quasar.dev">
          <q-item-section avatar>
            <q-icon name="code" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Github</q-item-label>
            <q-item-label caption>github.com/quasarframework</q-item-label>
          </q-item-section>
        </q-item>
        <q-item clickable tag="a" target="_blank" href="https://chat.quasar.dev">
          <q-item-section avatar>
            <q-icon name="chat" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Discord Chat Channel</q-item-label>
            <q-item-label caption>chat.quasar.dev</q-item-label>
          </q-item-section>
        </q-item>
        <q-item clickable tag="a" target="_blank" href="https://forum.quasar.dev">
          <q-item-section avatar>
            <q-icon name="record_voice_over" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Forum</q-item-label>
            <q-item-label caption>forum.quasar.dev</q-item-label>
          </q-item-section>
        </q-item>
        <q-item clickable tag="a" target="_blank" href="https://twitter.quasar.dev">
          <q-item-section avatar>
            <q-icon name="rss_feed" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Twitter</q-item-label>
            <q-item-label caption>@quasarframework</q-item-label>
          </q-item-section>
        </q-item>
        <q-item clickable tag="a" target="_blank" href="https://facebook.quasar.dev">
          <q-item-section avatar>
            <q-icon name="public" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Facebook</q-item-label>
            <q-item-label caption>@QuasarFramework</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'MyLayout',

  data () {
    return {
      leftDrawerOpen: false,
      langs: [
        { label: 'German', value: 'de' },
        { label: 'US English', value: 'en-us' }
      ],
      lang: this.$i18n.locale,
      dark: false
    }
  },
  computed: {
      ...mapGetters({
          user: 'user'
      })
  },
  watch: {
    dark: function (val) {
      this.$q.dark.set(val)
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
