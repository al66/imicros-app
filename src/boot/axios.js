import Vue from 'vue'
import axios from 'axios'
// import { Notify } from 'quasar'

// axios.defaults.baseURL = process.env.baseURL
axios.defaults.baseUrl = process.env.baseUrl
console.log('Using backend:', axios.defaults.baseUrl)

const services = {
  auth: 'api/user',
  groups: 'api/groups',
  acl: 'api/acl',
  minio: 'api/minio',
  file: 'api/file'
}

Vue.prototype.$axios = axios

// Set interceptor function for later use on instances
export default (/* { app } */) => {
  Vue.prototype.$instance = () => {
    const instance = Vue.prototype.$axios.create()

    instance.interceptors.request.use((config) => {
      // Replace service names
      for (const service in services) {
        if (Object.prototype.hasOwnProperty.call(services, service)) {
          config.url = config.url.replace('#' + service, services[service])
        }
      }
      return config
    })
    /*  General response interceptor for error handling not used - error handling should be service specific
    instance.interceptors.response.use((response) => {
      return response
    }, (error) => {
      // Not ok
      if (error.response && error.response.status === 500) {
        // check for message and notify
        if (error.response.data.message) {
          console.log(error.response.data)
          Notify.create({
            // error.response.data.message
            message: app.i18n.t('Error.' + error.response.data.message),
            color: 'red',
            actions: [
              { icon: 'ion-close-circle', color: 'white', handler: () => {} }
            ]
          })
        }
      }
      return Promise.reject(error.message)
    })
    */
    return instance
  }
}
