<!-- This example requires Tailwind CSS v2.0+ -->
<template>
    <div>
        <div>
            <div
                class="grid max-w-3xl grid-cols-1 gap-x-8 gap-y-16 py-6">
                <section class="text-center">
                    <div class="flex items-center justify-between">
                        <h2 class="font-bold text-xl text-gray-900">{{ monthName }} {{ year }}</h2>
                        <div class="flex items-center rounded-md shadow-sm md:items-stretch">
                            <button type="button"
                                @click="subtractMonth"
                                class="flex items-center justify-center rounded-l-md border border-r-0 border-gray-300 bg-white py-2 pl-3 pr-4 text-gray-400 hover:text-gray-500 focus:relative md:w-9 md:px-2 md:hover:bg-gray-50">
                                <span class="sr-only">Previous month</span>
                                <ChevronLeftIcon class="h-5 w-5" aria-hidden="true" />
                            </button>
                            <button type="button"
                                @click="goToToday"
                                class="border-t border-b border-gray-300 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 focus:relative block">Today</button>
                            <button type="button"
                                @click="addMonth"
                                class="flex items-center justify-center rounded-r-md border border-l-0 border-gray-300 bg-white py-2 pl-4 pr-3 text-gray-400 hover:text-gray-500 focus:relative md:w-9 md:px-2 md:hover:bg-gray-50">
                                <span class="sr-only">Next month</span>
                                <ChevronRightIcon class="h-5 w-5" aria-hidden="true" />
                            </button>
                        </div>
                    </div>
                    <div class="mt-4 grid grid-cols-7 text-xs font-semibold leading-6 text-gray-500">
                        <div>S</div>
                        <div>M</div>
                        <div>T</div>
                        <div>W</div>
                        <div>T</div>
                        <div>F</div>
                        <div>S</div>
                    </div>
                    <div
                        class="isolate mt-2 grid grid-cols-7 gap-px rounded-lg bg-gray-200 text-sm md:text-base shadow ring-1 ring-gray-200">
                        <button v-for="(day, dayIdx) in days" :key="day.date" type="button"
                            @click="toggleDate(day.date)"
                            :class="[day.isToday && 'bg-blue-50 text-blue-600', day.isCurrentMonth ? 'bg-white text-gray-900' : 'bg-gray-50 text-gray-400', dayIdx === 0 && 'rounded-tl-lg', dayIdx === 6 && 'rounded-tr-lg', dayIdx === days.length - 7 && 'rounded-bl-lg', dayIdx === days.length - 1 && 'rounded-br-lg', 'py-2 sm:py-4 hover:bg-gray-100 focus:z-10']">
                            <time :datetime="day.date"
                                :class="[selected.includes(day.date) && 'bg-blue-600 !text-white font-semibold', 'mx-auto flex h-8 w-8 sm:h-12 sm:w-12 items-center justify-center rounded-full']">{{
                                        day.date.split('-').pop().replace(/^0/, '')
                                }}</time>
                        </button>
                    </div>
                </section>
            </div>
        </div>
    </div>
</template>

<script>
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, DotsHorizontalIcon } from '@heroicons/vue/solid'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'
import getDay from 'date-fns/getDay'
import addDays from 'date-fns/addDays'
import subDays from 'date-fns/subDays'
import eachDayOfInterval from 'date-fns/eachDayOfInterval'
import isToday from 'date-fns/isToday'
import isSameMonth from 'date-fns/isSameMonth'

export default {
    name: 'CalendarGrid',
    components: {
        ChevronDownIcon,
        ChevronLeftIcon,
        ChevronRightIcon,
        DotsHorizontalIcon,
        Menu,
        MenuButton,
        MenuItem,
        MenuItems,
    },
    props: {
        selected: {
            type: Array,
            required: true
        },
    },
    data() {
        return {
            month: new Date().getMonth(),
            year: new Date().getFullYear(),
        }
    },
    computed: {
        monthName() {
            const names = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
            return names[this.month]
        },
        days() {
            const startOfMonth = new Date(this.year, this.month, 1)
            const firstDayWeekDay = getDay(startOfMonth) // 0 = Sunday, 6 = Saturday
            const daysToSub = firstDayWeekDay
            const intervalStart = subDays(startOfMonth, daysToSub)
            const intervalEnd = addDays(intervalStart, 41) // our grid is 6 rows with 7 days, so we have 42 cells. We need to add 41 days.
            const days = eachDayOfInterval({ start: intervalStart, end: intervalEnd }).map(day => {
                const date = day.toISOString().split('T')[0]
                return {
                    date: date,
                    isCurrentMonth: isSameMonth(day, startOfMonth),
                    isToday: isToday(day)
                }
            })
            return days
        }
    },
    methods: {
        goToToday() {
            this.year = new Date().getFullYear()
            this.month = new Date().getMonth()
        },
        subtractYear() {
            this.year -= 1
        },
        addYear() {
            this.year += 1
        },
        subtractMonth() {
            if (this.month === 0) {
                this.month = 11
                this.subtractYear()
            } else {
                this.month -= 1
            }
        },
        addMonth() {
            if (this.month === 11) {
                this.month = 0
                this.addYear()
            } else {
                this.month += 1
            }
        },
        toggleDate(day) {
            const uniq = new Set(this.selected)
            if (!uniq.has(day)) {
                uniq.add(day)
            } else {
                uniq.delete(day)
            }
            this.$emit('update', [...uniq])
        }
    },
}
</script>
