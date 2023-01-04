<template>
    <div v-if="isLoggedIn">
        <div class="flex items-center justify-between">
            <h2 class="text-4xl font-black text-gray-900">Polls</h2>
            <router-link to="/new-poll" class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Create Poll</router-link>
        </div>
        <div v-if="loading" class="flex justify-center pt-20">
            <LoadingSpinner />
        </div>
        <PollList
            :polls="polls"
            :is-admin="true"
            @remove-poll="handleRemove"
        />
    </div>
    <LoginForm v-else @login="handleLogin" />
</template>

<script>
import LoadingSpinner from '../components/LoadingSpinner.vue'
import PollList from '../components/PollList.vue'
import Polls from '../services/Polls'
import LoginForm from '../components/LoginForm.vue'
export default {
    name: 'Dashboard',
    components: {
        PollList,
        LoadingSpinner,
        LoginForm,
    },
    data() {
        return {
            loading: false,
            polls: [],
            isLoggedIn: false
        }
    },
    async created() {
        this.loading = true
        this.polls = await Polls.list()
        this.loading = false
    },
    mounted() {
        this.isLoggedIn = window.localStorage.getItem('mcdoodle.userId') !== null &&
                          window.localStorage.getItem('mcdoodle.apiKey') !== null
    },
    methods: {
        async handleRemove(pollId) {
            // poll was already removed
            // we just need to re-fetch the polls and this one will be gone.
            this.polls = await Polls.list()
        },
        handleLogin(val) {
            if (val !== null) {
                this.isLoggedIn = true
                window.localStorage.setItem('mcdoodle.userId', val.user_id)
                window.localStorage.setItem('mcdoodle.apiKey', val.apiKey)
            } else {
                window.localStorage.removeItem('mcdoodle.userId')
                window.localStorage.removeItem('mcdoodle.apiKey')
                this.isLoggedIn = false
            }
        }
    },
}
</script>

