
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Index.vue') },
      { path: 'login', name: 'login', component: () => import('pages/Login.vue'), meta: { public: true } },
      { path: 'logout', name: 'logout', component: () => import('pages/Logout.vue') },
      { path: 'signin', name: 'signin', component: () => import('pages/Signin.vue'), meta: { public: true } },
      { path: 'verify', name: 'verify', component: () => import('pages/Verify.vue') },
      { path: 'groups', name: 'groups', component: () => import('pages/Groups.vue') },
      { path: 'files', name: 'files', component: () => import('pages/Files.vue') },
      { path: 'templates', name: 'templates', component: () => import('pages/Templates.vue') },
      { path: 'ruleseteditor', name: 'ruleseteditor', component: () => import('pages/Ruleseteditor.vue') },
      { path: 'processeditor', name: 'processeditor', component: () => import('pages/Processeditor.vue') },
      { path: 'processmonitor', name: 'processmonitor', component: () => import('pages/Processmonitor.vue') },
      { path: 'externalAccounts', name: 'externalAccounts', component: () => import('pages/ExternalAccounts.vue') },
      { path: 'agents', name: 'agents', component: () => import('pages/Agents.vue') }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/Error404.vue')
  }
]

export default routes
