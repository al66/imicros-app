import Vue from 'vue'
import VueRouter from 'vue-router'

import routes from './routes'

Vue.use(VueRouter)

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default function ({ store }/* { store, ssrContext } */) {
  const Router = new VueRouter({
    scrollBehavior: () => ({ x: 0, y: 0 }),
    routes,

    // Leave these as they are and change in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    mode: process.env.VUE_ROUTER_MODE,
    base: process.env.VUE_ROUTER_BASE
  })
  Router.beforeResolve((to, from, next) => {
    let isAuthenticated = store.getters['isAuthenticated']
    let user = store.getters['user'] || { verified: false }
    // secure all routes if not marked as public
    try {
      if (!to.matched.some(record => record.meta.public)) {
        // no public route
        if (to.name === 'logout' && isAuthenticated) {
          // never redirect logout
          next()
        } else if (!isAuthenticated) {
          // redirect all non public routes, if not authenticated
          next({ name: 'login' })
        } else {
          if (!user.verified && to.fullPath !== '/verify') {
            // redirect not verified users to confirm page
            next({ name: 'verify', replace: true })
          } else {
            next()
          }
        }
      } else {
        next()
      }
    } catch (error) {
      console.log(error)
    }
  })
  Router.onError = (error) => {
    console.log(error)
  }
  // hack due to uncaught exception in vue-router
  Router.onAbort = null

  return Router
}
