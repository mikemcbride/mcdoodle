import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from './views/Dashboard.vue'
import PollDetail from './views/PollDetail.vue'
import CreatePoll from './views/CreatePoll.vue'

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
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
