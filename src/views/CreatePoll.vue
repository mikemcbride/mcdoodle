<template>
    <div>
        <router-link
            to="/"
            class="mb-8 hover:text-blue-600 inline-block sm:text-lg"
            >Back</router-link
        >
        <NewPollForm v-if="isLoggedIn" />
        <LoginForm v-else @login="handleLogin" />
    </div>
</template>

<script>
import NewPollForm from '../components/NewPollForm.vue'
import LoginForm from '../components/LoginForm.vue'

export default {
    name: 'CreatePoll',
    components: {
        NewPollForm,
        LoginForm,
    },
    data() {
        return {
            isLoggedIn: false
        }
    },
    mounted() {
      this.isLoggedIn = window.localStorage.getItem('mcdoodle.userId') !== null
    },
    methods: {
        handleLogin(val) {
            if (val !== null) {
                this.isLoggedIn = true
                window.localStorage.setItem('mcdoodle.userId', val.user_id)
            } else {
                window.localStorage.removeItem('mcdoodle.userId')
                this.isLoggedIn = false
            }
        }
    },
}
</script>
