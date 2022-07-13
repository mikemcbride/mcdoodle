<template>
    <div>
        <div class="sm:flex items-center justify-between max-w-xl">
            <h3 class="font-bold text-lg">{{ formattedDate }}</h3>
            <div class="flex items-center">
                <RadioGroup v-model="answer" class="mt-4 sm:mt-0">
                    <RadioGroupLabel class="sr-only">Choose an option</RadioGroupLabel>
                    <div class="grid grid-cols-3 gap-3">
                        <RadioGroupOption as="template" value="yes" v-slot="{ active, checked }">
                            <div :class="[active ? 'ring-2 ring-offset-2 ring-emerald-500' : '', checked ? 'bg-emerald-100 border-transparent text-emerald-700 hover:bg-emerald-200' : 'bg-white border-gray-200 text-gray-900 hover:bg-gray-50', 'border rounded-md py-3 px-3 flex items-center justify-center text-sm font-medium sm:flex-1 focus:outline-none']">
                                <RadioGroupLabel as="span">
                                    Yes
                                </RadioGroupLabel>
                            </div>
                        </RadioGroupOption>
                        <RadioGroupOption as="template" value="if_needed" v-slot="{ active, checked }">
                            <div :class="[active ? 'ring-2 ring-offset-2 ring-yellow-500' : '', checked ? 'bg-yellow-100 border-transparent text-yellow-700 hover:bg-yellow-200' : 'bg-white border-gray-200 text-gray-900 hover:bg-gray-50', 'border rounded-md py-3 px-3 flex items-center justify-center text-sm font-medium sm:flex-1 focus:outline-none']">
                                <RadioGroupLabel as="span">
                                    If Needed
                                </RadioGroupLabel>
                            </div>
                        </RadioGroupOption>
                        <RadioGroupOption as="template" value="no" v-slot="{ active, checked }">
                            <div :class="[active ? 'ring-2 ring-offset-2 ring-red-500' : '', checked ? 'bg-red-100 border-transparent text-red-700 hover:bg-red-200' : 'bg-white border-gray-200 text-gray-900 hover:bg-gray-50', 'border rounded-md py-3 px-3 flex items-center justify-center text-sm font-medium sm:flex-1 focus:outline-none']">
                                <RadioGroupLabel as="span">
                                    No
                                </RadioGroupLabel>
                            </div>
                        </RadioGroupOption>
                    </div>
                </RadioGroup>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { RadioGroup, RadioGroupLabel, RadioGroupOption } from '@headlessui/vue'
import format from 'date-fns/format'
import addDays from 'date-fns/addDays'

const props = defineProps(['question'])
const emit = defineEmits(['vote'])

const formattedDate = format(addDays(new Date(props.question.value)), 'E, MMM do')
const answer = ref(null)

watch(answer, (newValue) => {
    emit('vote', { question: props.question.id, response: newValue })
})
</script>
