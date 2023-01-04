<template>
    <span class="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium" :class="colors" v-show="formatted">
        {{ formatted }}
    </span>
</template>

<script>
export default {
    name: 'ResponsePill',
    props: {
        text: {
            type: String,
            default: ''
        }
    },
    computed: {
        formatted() {
            if (!this.text) return null
            return this.text.split('_').map(word => `${word.charAt(0).toUpperCase()}${word.slice(1)}`).join(' ')
        },
        colors() {
            if (this.text === 'yes') {
                return 'bg-emerald-100 text-emerald-800'
            } else if (this.text === 'no') {
                return 'bg-red-100 text-red-800'
            } else if (this.text === 'if_needed') {
                return 'bg-yellow-100 text-yellow-800'
            } else {
                return 'bg-gray-100 text-gray-800'
            }
        }
    },
}
</script>
