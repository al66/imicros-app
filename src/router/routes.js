
const routes = [
  {
    path: '/',
    component: () => import('layouts/Main.vue'),
    children: [
      { path: '', component: () => import('pages/Index.vue') },
      { path: 'login', name: 'login', component: () => import('pages/Login.vue'), meta: { public: true } },
      { path: 'verify', name: 'verify', component: () => import('pages/Verify.vue') },
      { path: 'logout', name: 'logout', component: () => import('pages/Logout.vue') },
      { path: 'signin', name: 'signin', component: () => import('pages/Signin.vue'), meta: { public: true } },
      { path: 'groups', name: 'groups', component: () => import('pages/Groups.vue') },
      { path: 'files', name: 'files', component: () => import('pages/Files.vue') },
      { path: 'templates', name: 'templates', component: () => import('pages/Templates.vue') },
      { path: 'ruleseteditor', name: 'ruleseteditor', component: () => import('pages/Ruleseteditor.vue') },
      { path: 'processeditor', name: 'processeditor', component: () => import('pages/Processeditor.vue') },
      { path: 'externalAccounts', name: 'externalAccounts', component: () => import('pages/ExternalAccounts.vue') }
    ]
  }
]

// Always leave this as last one
if (process.env.MODE !== 'ssr') {
  routes.push({
    path: '*',
    component: () => import('pages/Error404.vue')
  })
}

export default routes
