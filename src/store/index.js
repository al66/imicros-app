import { store } from 'quasar/wrappers'
import { createStore } from 'vuex'

// import example from './module-example'

/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Store instance.
 */

export default store(function (/* { ssrContext } */) {
  const Store = createStore({
    modules: {
      // example
    },
    state () {
      return {
        isAuthenticated: false,
        user: null,
        token: null,
        access: {
          group: {},
          token: null
        },
        nav: [],
        locale: null,
        settings: {}
      }
    },
    getters: {
      isAuthenticated: state => { return state.isAuthenticated },
      user: state => { return state.user || {} },
      token: state => { return state.token || {} },
      email: state => { return state.user ? state.user.email : 'unkown' },
      access: state => { return state.access },
      nav: state => { return state.nav },
      locale: state => { return state.locale },
      settings: (state) => (component) => { return state.settings[component] }
    },
    mutations: {
      login (state, user) {
        state.isAuthenticated = true
        state.user = user
      },
      logout (state) {
        state.isAuthenticated = false
        state.token = null
        state.user = null
        state.access = {
          group: {},
          token: null
        }
      },
      syncAuthenticated (state, val) {
        state.isAuthenticated = val
      },
      syncUser (state, val) {
        state.user = val
      },
      setToken (state, val) {
        state.token = val
      },
      setAccess (state, val) {
        state.access = JSON.parse(JSON.stringify(val))
      },
      setNav (state, val) {
        state.nav = val || []
      },
      setLocale (state, val) {
        state.locale = val
      },
      setSettings (state, val) {
        state.settings = Object.assign(state.settings, JSON.parse(JSON.stringify(val)))
      }
    },
    actions: {
      login ({ commit }) {
        commit('login')
      },
      logout ({ commit }) {
        commit('logout')
      }
    },

    // enable strict mode (adds overhead!)
    // for dev mode and --debug builds only
    strict: process.env.DEBUGGING
  })

  return Store
})
