<template>
    <div>
        <router-link
            to="/"
            class="mb-8 hover:text-blue-600 inline-block sm:text-lg"
            >Back</router-link
        >
        <h2 class="text-4xl font-black text-gray-900">New Poll</h2>
        <section class="mt-8 space-y-6 max-w-lg">
            <div>
                <label
                    for="title"
                    class="block text-sm font-medium text-gray-700"
                    >Title</label
                >
                <div class="mt-1">
                    <input
                        type="text"
                        v-model="title"
                        name="title"
                        id="title"
                        class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="Your awesome poll"
                    />
                </div>
            </div>
            <div>
                <label
                    for="description"
                    class="block text-sm font-medium text-gray-700"
                    >Description (optional)</label
                >
                <div class="mt-1">
                    <textarea
                        rows="4"
                        name="description"
                        v-model="description"
                        id="description"
                        class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                </div>
            </div>
        </section>
        <section class="mt-4 sm:mt-8">
            <h3 class="hidden sm:block text-2xl font-bold">Choose Dates</h3>
            <CalendarGrid :selected="selected" @update="updateSelected" />
        </section>

        <div class="my-6 rounded-md bg-emerald-50 p-4" v-if="showSuccess">
            <div class="flex">
                <div class="flex-shrink-0">
                    <CheckCircleIcon
                        class="h-5 w-5 text-emerald-400"
                        aria-hidden="true"
                    />
                </div>
                <div class="ml-3">
                    <p class="text-sm font-medium text-emerald-800">
                        Successfully uploaded
                    </p>
                </div>
            </div>
        </div>
        <footer class="mt-4 flex justify-end w-full max-w-3xl space-x-4">
            <router-link
                to="/"
                class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >Cancel</router-link
            >
            <button
                type="button"
                @click="submit"
                class="w-full sm:w-auto flex sm:inline-flex justify-center items-center px-4 py-3 sm:py-2 border border-transparent text-lg sm:text-sm text-center font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
                Submit
            </button>
        </footer>
    </div>
</template>

<script setup>
import Polls from '../services/Polls'
import Questions from '../services/Questions'
import CalendarGrid from '../components/CalendarGrid.vue'
import { CheckCircleIcon } from '@heroicons/vue/solid'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const selected = ref([])
const title = ref('')
const description = ref('')
const showSuccess = ref(false)

function updateSelected(val) {
    selected.value = val
}

async function submit() {
    const newPoll = await Polls.create({
        title: title.value,
        description: description.value,
        status: 'open', // new polls will default to being open
    })
    let promises = selected.value.map((val) => {
        return Questions.create({
            value: val,
            poll: [newPoll.id],
        })
    })

    await Promise.allSettled(promises)

    // this will bust the cache and update the new poll to have the questions embedded in it.
    await Polls.findById(newPoll.id, true)

    flashSuccess()
}
function flashSuccess() {
    showSuccess.value = true
    setTimeout(() => {
        showSuccess.value = false
        router.push({ path: '/' })
    }, 5000)
}
</script>
