import Vue from 'vue'
import Vuex from 'vuex'

// import example from './module-example'

Vue.use(Vuex)

/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Store instance.
 */

export default function (/* { ssrContext } */) {
  const Store = new Vuex.Store({
    modules: {
      // example
    },
    state: {
      isAuthenticated: false,
      user: null,
      token: null,
      nav: [],
      locale: null
    },
    getters: {
      isAuthenticated: state => { return state.isAuthenticated },
      user: state => { return state.user || {} },
      token: state => { return state.token || {} },
      email: state => { return state.user ? state.user.email : 'unkown' },
      nav: state => { return state.nav },
      locale: state => { return state.locale }
    },
    mutations: {
      login (state, user) {
        state.isAuthenticated = true
        state.user = user
      },
      logout (state) {
        state.isAuthenticated = false
        state.user = null
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
      setNav (state, val) {
        state.nav = val || []
      },
      setLocale (state, val) {
        state.locale = val
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
    // for dev mode only
    strict: process.env.DEV
  })

  return Store
}
