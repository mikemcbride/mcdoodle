<template>
    <div class="my-12 -mx-4 sm:-mx-6 lg:-mx-8">
        <div class="inline-block min-w-full align-middle md:px-6 lg:px-8">
            <div class="md:rounded-lg shadow ring-1 ring-black ring-opacity-5 bg-white p-4 md:p-6 space-y-6 md:space-y-8">
                <h2 class="font-bold text-2xl">Add your response</h2>
                <div>
                    <label for="submitter-name" class="block text-sm font-medium text-gray-700">Name</label>
                    <div class="mt-1">
                        <input
                            type="text"
                            name="name"
                            v-model="submittedBy"
                            id="submitter-name"
                            class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full max-w-lg sm:text-sm border-gray-300 rounded-md"
                            placeholder="Mickey Mouse" />
                    </div>
                </div>
                <DateResponse
                    v-for="question in props.questions"
                    :key="question.id"
                    :question="question"
                    @vote="setVote" />
                <div v-if="showInvalidMessage">
                    <div class="rounded-md bg-red-50 p-4">
                        <div class="flex">
                            <div class="flex-shrink-0">
                                <XCircleIcon class="h-5 w-5 text-red-400" aria-hidden="true" />
                            </div>
                            <div class="ml-3">
                                <h3 class="text-sm font-medium text-red-800">There were errors with your submission</h3>
                                <div class="mt-2 text-sm text-red-700">
                                    <ul role="list" class="list-disc pl-5 space-y-1">
                                        <li v-for="msg in validationErrors" :key="msg">{{ msg }}</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <footer class="flex justify-end items-center space-x-4 mt-8">
                    <button @click="$emit('cancel')"
                        :disabled="submitting"
                        class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Cancel</button>
                    <button @click="handleSubmit"
                        class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        :class="[submitting ? 'cursor-not-allowed' : 'hover:bg-blue-700']"
                        :disabled="submitting"
                    ><Spinner class="text-white h-4 w-4 mr-2" v-if="submitting" /> {{ submitting ? 'Submitting' : 'Submit' }}</button>
                </footer>
            </div>
        </div>
    </div>
</template>

<script setup>
// imports
import { ref } from 'vue'
import { XCircleIcon } from '@heroicons/vue/solid'
import DateResponse from './DateResponse.vue'
import Spinner from './Spinner.vue'
import Submissions from '../services/Submissions'
import Responses from '../services/Responses'

// setup props and emits
const props = defineProps(['poll', 'questions'])
const emit = defineEmits(['submitted', 'cancel'])

// set up local component data
const votes = ref([])
const submittedBy = ref('')
const submitting = ref(false)
const showInvalidMessage = ref(false)
const validationErrors = ref([])

// methods
function setVote(payload) {
    let existing = votes.value.find(vote => vote.question === payload.question)
    if (!existing) {
        votes.value.push(payload)
    } else {
        votes.value = votes.value.map(vote => {
            if (vote.question === payload.question) {
                return payload
            }
            return vote
        })
    }
}

function doValidation() {
    // reset errors before starting validation
    validationErrors.value = []
    if (submittedBy.value === '') {
        validationErrors.value.push('Name is required')
    }
    if (votes.value.length !== props.questions.length) {
        validationErrors.value.push('Must select an answer for every date')
    }
    return validationErrors.value.length === 0
}

async function handleSubmit() {
    let isValid = doValidation()
    if (!isValid) {
        showInvalidMessage.value = true
        return
    }

    showInvalidMessage.value = false

    submitting.value = true
    let newSubmission = {}
    // create submission and responses, then inflate and emit them.
    const sub = await Submissions.create({
        person: submittedBy.value,
        poll: [props.poll.id]
    })
    let responses = await Promise.all(votes.value.map(vote => {
        return Responses.create({
            question: [vote.question],
            value: vote.response,
            submission: [sub.id]
        })
    }))
    newSubmission = sub
    newSubmission.responses = responses
    emit('submitted', newSubmission)
    submitting.value = false
}
</script>
