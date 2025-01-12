import { createRouter, createWebHashHistory } from 'vue-router'
import WidgetRouter from '../widgets/widget-router'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    ...WidgetRouter,
    {
      path: '/',
      name: `WidgetLandingPage`,
      component: () => import(/* webpackChunkName: "com.wisdom.widgets.LandingPage" */ '../widgets/LandingPage.vue'),
    },
  ],
})

export default router
