<template>
    <div class="bg-white shadow overflow:hidden sm:rounded-md">
        <ul role="list" class="mt-6 divide-y divide-gray-200">
            <PollCard v-for="(poll, idx) in polls" :key="poll.id" :poll="poll" :poll-index="idx" />
        </ul>
    </div>
</template>

<script>
import PollCard from './PollCard.vue'

export default {
    name: 'PollList',
    components: {
        PollCard,
    },
    props: {
        polls: {
            type: Array,
            required: true
        },
    },
}
</script>

