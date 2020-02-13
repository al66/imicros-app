
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
      { path: 'groups', name: 'groups', component: () => import('pages/Groups.vue') }
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
