<template>
    <div>
        <div class="flex items-center justify-between">
            <h2 class="text-4xl font-black text-gray-900">Polls</h2>
            <router-link to="/new-poll" class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Create Poll</router-link>
        </div>
        <PollList :polls="polls" />
    </div>
</template>

<script>
import PollList from '../components/PollList.vue'
import Polls from '../services/Polls'
export default {
    name: 'Dashboard',
    components: {
        PollList 
    },
    data() {
        return {
            polls: []
        }
    },
    async created() {
        this.polls = await Polls.list()
    },
}
</script>

