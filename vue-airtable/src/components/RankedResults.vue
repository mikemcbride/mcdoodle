<template>
    <div>
        <h3 class="mt-8 mb-4 text-2xl font-bold">Suggested Dates</h3>
        <div class="-my-2 -mx-4 sm:-mx-6 lg:-mx-8">
            <div class="py-2 md:px-6 lg:px-8">
                <section
                    class="shadow ring-1 ring-black ring-opacity-5 md:rounded-lg divide-y divide-gray-200 bg-white"
                >
                    <div
                        v-for="row in responsesPerQuestion"
                        :key="row.date"
                        class="p-4 md:py-6 lg:py-8 lg:px-6 flex items-center"
                    >
                        <div
                            class="font-bold text-sm md:text-base flex-shrink-0 text-right pr-4 md:pr-6 lg:pr-8"
                        >
                            {{ row.date }}
                        </div>
                        <div class="flex h-3 md:h-6 flex-shrink rounded w-full">
                            <div
                                v-if="row.yes > 0"
                                class="group relative bg-emerald-500"
                                :class="[row.yes > 0 ? 'rounded-l' : '', row.yes === row.total ? 'rounded-r' : '']"
                                :style="`width: ${(row.yes / row.total) * 100}%;`"
                            >
                                <span
                                    class="hidden group-hover:block px-2 py-1 rounded text-xs bg-gray-700 bg-opacity-90 text-white font-medium absolute -top-8 left-1/2 transform -translate-x-1/2"
                                    >{{ row.yes }}</span
                                >
                            </div>
                            <div
                                v-if="row.if_needed > 0"
                                class="group relative bg-yellow-400"
                                :class="[row.yes === 0 ? 'rounded-l' : '', row.no === 0 ? 'rounded-r' : '']"
                                :style="`width: ${(row.if_needed / row.total) * 100}%;`"
                            >
                                <span
                                    class="hidden group-hover:block px-2 py-1 rounded text-xs bg-gray-700 bg-opacity-90 text-white font-medium absolute -top-8 left-1/2 transform -translate-x-1/2"
                                    >{{ row.if_needed }}</span
                                >
                            </div>
                            <div
                                v-if="row.no > 0"
                                class="group relative bg-red-500"
                                :class="[row.no > 0 ? 'rounded-r' : '', row.no === row.total ? 'rounded-l' : '']"
                                :style="`width: ${(row.no / row.total) * 100}%;`"
                            >
                                <span
                                    class="hidden group-hover:block px-2 py-1 rounded text-xs bg-gray-700 bg-opacity-90 text-white font-medium absolute -top-8 left-1/2 transform -translate-x-1/2"
                                    >{{ row.no }}</span
                                >
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    </div>
</template>

<script>
import _orderBy from 'lodash/orderBy'
export default {
    name: 'RankedResults',
    props: {
        submissions: {
            type: Array,
            default: () => [],
        },
        questions: {
            type: Array,
            default: () => [],
        },
    },
    computed: {
        totalSubmissions() {
            return this.submissions.length
        },
        responsesPerQuestion() {
            const questionMap = new Map()
            const questionValues = {}
            for (let q of this.questions) {
                if (!questionMap.has(q.id)) {
                    questionMap.set(q.id, q.value)
                    questionValues[q.id] = {
                        yes: 0,
                        no: 0,
                        if_needed: 0,
                    }
                }
            }

            for (let s of this.submissions) {
                for (let r of s.responses) {
                    const q_id = r.question[0]
                    if (questionValues[q_id]) {
                        questionValues[q_id][r.value] += 1
                    }
                }
            }

            // return value we'll use needs to be an array of objects
            // the objects will have a date key (the question value), then yes, no, if_needed, and total_responses, which are all numbers
            const responses = Object.keys(questionValues).map((key) => {
                return {
                    date: questionMap.get(key),
                    yes: questionValues[key].yes,
                    no: questionValues[key].no,
                    if_needed: questionValues[key].if_needed,
                    not_no: questionValues[key].yes + questionValues[key].if_needed,
                    total: this.totalSubmissions,
                }
            })
            const sortedResponses = _orderBy(
                responses,
                ['yes', 'not_no'],
                ['desc', 'desc']
            )
            return sortedResponses
        },
    },
}
</script>
