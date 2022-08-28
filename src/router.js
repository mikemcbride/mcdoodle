import { createRouter, createWebHashHistory } from 'vue-router'
import Dashboard from './views/Dashboard.vue'
import PollDetail from './views/PollDetail.vue'
import CreatePoll from './views/CreatePoll.vue'
import Admin from './views/Admin.vue'

const routes = [
    {
        path: '/',
        name: 'Dashboard',
        component: Dashboard
    },
    {
        path: '/polls/:id',
        name: 'PollDetail',
        component: PollDetail
    },
    {
        path: '/new-poll',
        name: 'CreatePoll',
        component: CreatePoll
    },
    {
        path: '/admin',
        name: 'Admin',
        component: Admin
    }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

export default router
