<template>
  <q-page class="flex flex-center">
    <q-card class="signinForm" title="$t('Signin.title')" >
      <q-card-section align="center">
        <div class="text-h6">
          {{ $t('Signin.title') }}
        </div>
      </q-card-section>
      <q-card-section>
        <div class="q-pa-md">
          <div class="q-gutter-y-md column" style="max-width: 800px">
            <q-input v-model="email" filled dense placeholder="max.mustermann@test.de" :hint="$t('Signin.email.label')" />
            <q-input v-model="password" filled dense type="password" :hint="$t('Signin.password.label')"  />
          </div>
        </div>
      </q-card-section>
      <q-separator inset />
      <q-card-section align="center">
        <q-btn color="primary" icon="ion-log-in" :label="$t('Signin.button.submit')" />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
export default {
  name: 'Signin',
  data () {
    return {
      email: '',
      password: '',
      response: null
    }
  }
}
</script>
