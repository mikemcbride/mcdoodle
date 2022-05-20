<template>
    <li>
        <router-link :to="`/polls/${poll.id}`" class="block hover:bg-gray-50">
            <div class="px-4 py-4 flex items-center sm:px-6">
                <div class="flex-1">
                    <div class="flex text-sm lg:text-base">
                        <p class="font-medium text-blue-600">{{ poll.title }}</p>
                    </div>
                    <p class="text-sm text-gray-500">{{ poll.description || '' }}</p>
                </div>
                <div class="flex-shrink-0 mt-0 sm:ml-5">
                    <p class="text-sm text-gray-500">{{ submissions }} {{ submissionText }}</p>
                </div>
                <div class="flex-shrink-0 ml-5">
                    <ChevronRightIcon class="w-5 h-5 text-gray-400" aria-hidden="true" />
                </div>
            </div>
        </router-link>
    </li>
</template>

<script>
import { ChevronRightIcon } from '@heroicons/vue/outline'
export default {
    name: 'PollCard',
    components: {
        ChevronRightIcon,
    },
    props: {
        poll: {
            type: Object,
            required: true
        },
        pollIndex: {
            type: Number,
            default: 0
        }
    },
    computed: {
        submissions() {
            if (!this.poll.submissions) {
                return 0
            }
            return this.poll.submissions.length
        },
        submissionText() {
            return this.submissions === 1 ? 'submission' : 'submissions'
        },
    },
}
</script>
