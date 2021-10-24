import { boot } from 'quasar/wrappers'
import axios from 'axios'

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)
const api = axios.create({ baseURL: 'https://api.example.com' })

// added: service names
const services = {
  auth: 'api/user',
  groups: 'api/groups',
  acl: 'api/acl',
  minio: 'api/minio',
  file: 'api/file'
}

// added: replace of placeholders by service names
api.interceptors.request.use((config) => {
  // Replace service names
  for (const service in services) {
    if (Object.prototype.hasOwnProperty.call(services, service)) {
      config.url = config.url.replace('#' + service, services[service])
    }
  }
  return config
})

export default boot(({ app }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api

  app.config.globalProperties.$axios = axios
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  app.config.globalProperties.$api = api
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API

  // added: helper function $instance
  app.config.globalProperties.$instance = () => {
    const instance = axios.create()
    instance.interceptors.request.use((config) => {
      // Replace service names
      for (const service in services) {
        if (Object.prototype.hasOwnProperty.call(services, service)) {
          config.url = config.url.replace('#' + service, services[service])
        }
      }
      return config
    })
    return instance
  }
})

export { api }
