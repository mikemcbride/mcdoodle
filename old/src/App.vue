<script setup>
import AppHeader from './components/AppHeader.vue'
</script>

<template>
    <div>
        <AppHeader />
        <main class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <router-view></router-view>
        </main>
    </div>
</template>
