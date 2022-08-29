<template>
    <li>
        <Dialog :open="isOpen" @close="setIsOpen" class="absolute z-50">
            <div class="fixed inset-0 bg-black/30" aria-hidden="true" />
            <div class="fixed inset-0 flex mt-24 items-start justify-center p-4">
                <DialogPanel class="w-full max-w-md rounded-lg shadow-md bg-white p-6">
                    <DialogTitle class="text-2xl font-bold block">Delete poll?</DialogTitle>
                    <DialogDescription class="text-lg mt-4">
                        This will delete the poll and all submissions.
                    </DialogDescription>

                    <p class="text-sm mt-6">
                        Are you sure you want to delete the poll? The poll and all questions and responses will be permanently deleted.
                        <span class="text-red-600 font-semibold">This action cannot be undone.</span>
                    </p>

                    <footer class="mt-8 flex justify-end space-x-4">
                        <button @click="setIsOpen(false)" type="button" class="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Cancel</button>
                        <button @click="deletePoll" :disabled="isDeleting" type="button" class="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"><spinner v-if="isDeleting" class="h-4 w-4 mr-2 inline-block"/>Delete</button>
                    </footer>
                </DialogPanel>
            </div>
        </Dialog>
        <component :is="canDelete ? 'div' : 'router-link'" :to="`/polls/${poll.id}`" class="block hover:bg-gray-50">
            <div class="px-4 py-4 flex items-center sm:px-6">
                <div class="flex-1">
                    <div class="flex text-base lg:text-lg">
                        <p class="font-medium text-blue-600">{{ poll.title }}</p>
                    </div>
                    <p class="text-sm lg:text-base text-gray-500">{{ poll.description || '' }}</p>
                </div>
                <div v-if="canDelete" class="flex-shrink-0">
                    <button @click="setIsOpen(true)" type="button" class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Delete poll</button>
                </div>
                <div v-if="!canDelete" class="hidden sm:block flex-shrink-0 mt-0 sm:ml-5">
                    <p class="text-sm text-gray-500">{{ submissions }} {{ submissionText }}</p>
                </div>
                <div v-if="!canDelete" class="flex-shrink-0 ml-5">
                    <ChevronRightIcon class="w-5 h-5 text-gray-400" aria-hidden="true" />
                </div>
            </div>
        </component>
    </li>
</template>

<script>
import Polls from '../services/Polls'
import { ChevronRightIcon } from '@heroicons/vue/outline'
import Spinner from '../components/Spinner.vue'
import {
    Dialog,
    DialogPanel,
    DialogTitle,
    DialogDescription,
} from '@headlessui/vue'

export default {
    name: 'PollCard',
    components: {
        ChevronRightIcon,
        Spinner,
        Dialog,
        DialogPanel,
        DialogTitle,
        DialogDescription,
    },
    props: {
        poll: {
            type: Object,
            required: true
        },
        pollIndex: {
            type: Number,
            default: 0
        },
        canDelete: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            isOpen: false,
            isDeleting: false
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
    methods: {
        async deletePoll() {
            this.isDeleting = true
            await Polls.remove(this.poll.id)
            this.isDeleting = false
            this.setIsOpen(false)
            this.$emit('remove-poll', this.poll.id)
        },
        setIsOpen(val) {
            this.isOpen = val
        }
    },
}
</script>
