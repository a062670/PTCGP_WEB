import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        name: 'index',
        path: '',
        component: () => import('pages/IndexPage.vue'),
      },
      {
        path: ':carId',
        children: [
          {
            name: 'dashboard',
            path: 'dashboard',
            component: () => import('pages/DashboardPage.vue'),
          },
          {
            name: 'threads',
            path: 'threads',
            component: () => import('pages/ThreadsPage.vue'),
          },
        ],
      },
      {
        name: 'hl',
        path: 'hl',
        component: () => import('pages/HlPage.vue'),
      },
      {
        name: 'hl/selected',
        path: 'hl/selected/:teamId',
        component: () => import('pages/HlSelectedPage.vue'),
      },
      {
        name: 'hl/valid',
        path: 'hl/valid',
        component: () => import('pages/HlValidPage.vue'),
      },
      {
        name: 'hl/setting',
        path: 'hl/setting',
        component: () => import('pages/HlSettingPage.vue'),
      },
      {
        name: 'hl/account-for-change',
        path: 'hl/account-for-change',
        component: () => import('pages/HlAccountForChangePage.vue'),
      },
    ],
  },
  {
    name: 'callback',
    path: '/callback',
    component: () => import('pages/CallbackPage.vue'),
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
