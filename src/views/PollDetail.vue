<template>
    <div>
        <div v-show="isLoading" class="flex justify-center pt-20">
            <LoadingSpinner />
        </div>
        <section v-show="!isLoading">
            <router-link to="/" class="mb-8 hover:text-blue-600 inline-block sm:text-lg">Back</router-link>
            <div class="sm:flex sm:items-center">
                <div class="sm:flex-auto">
                    <h2 class="text-4xl font-black text-gray-900">{{ poll.title }}</h2>
                    <p class="mt-2 text-lg text-gray-700">{{ poll.description }}</p>
                </div>
                <div v-show="!isAddingSubmission" class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none flex-shrink-0">
                    <button
                        type="button"
                        class="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
                        @click="isAddingSubmission = true"
                    >Vote</button>
                </div>
            </div>
            <SubmissionForm
                v-if="isAddingSubmission"
                :poll="poll"
                :questions="questions"
                @submitted="addSubmission"
                @cancel="isAddingSubmission = false"
            />
            <h3 class="mt-8 mb-4 text-2xl font-bold">Responses</h3>
            <div class="flex flex-col">
                <div class="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div class="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                        <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                            <table class="min-w-full divide-y divide-gray-300">
                                <thead class="bg-gray-50">
                                    <tr>
                                        <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Date</th>
                                        <th v-for="submission in submissions" :key="`col_${submission.id}`" scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">{{ submission.person }}</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-gray-200 bg-white">
                                    <tr v-for="(question, idx) in questions" :key="question.id">
                                        <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{{ question.value }}</td>
                                        <td v-for="submission in submissions" :key="`row_${submission.id}`" class="whitespace-nowrap px-3 py-4 text-sm text-gray-500"><ResponsePill :text="getResponseToQuestion(question.id, submission.responses)" /></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>

<script setup>
import { ref, onBeforeMount } from 'vue'
import { useRoute } from 'vue-router'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import ResponsePill from '../components/ResponsePill.vue'
import SubmissionForm from '../components/SubmissionForm.vue'
import Polls from '../services/Polls'
import Questions from '../services/Questions'
import Submissions from '../services/Submissions'
import Responses from '../services/Responses'

const route = useRoute()

const poll = ref({})
const questions = ref([])
const submissions = ref([])
const isLoading = ref(true)
const isAddingSubmission = ref(false)

onBeforeMount(() => {
    Polls.findById(route.params.id).then(res => {
        poll.value = res
        Promise.all([
            inflateQuestions(res.questions),
            inflateSubmissions(res.submissions)]
        ).then(() => {
            isLoading.value = false
        })
    })
})

async function inflateQuestions(q) {
    if (q) {
        let pollQuestions = await Questions.getMultiple(q)
        questions.value = pollQuestions.sort((a, b) => a.value - b.value)
    }
}

async function inflateSubmissions(s) {
    if (s) {
        let subs = await Submissions.getMultiple(s)
        let allResponseIds = subs.flatMap(sub => sub.responses)
        let allResponses = await inflateResponses(allResponseIds)
        subs.forEach(sub => {
            sub.responses = sub.responses.map(resId => {
                return allResponses.find(it => it.id === resId)
            }).filter(res => !!res) // the filter should remove anything that wasn't found/undefined/null
        })
        submissions.value = subs
    }
}

async function inflateResponses(r) {
    if (r) {
        return await Responses.getMultiple(r)
    } else {
        return []
    }
}

function getResponseToQuestion(questionId, responses) {
    let found = responses.find(response => response.question[0] === questionId)
    if (found) {
        return found.value
    }
    return ''
}

function addSubmission(val) {
    submissions.value.push(val)
    isAddingSubmission.value = false
}
</script>
