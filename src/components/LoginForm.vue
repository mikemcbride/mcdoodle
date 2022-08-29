<template>
  <div class="flex flex-col justify-center py-12 lg:mt-12 px-4 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        Sign in to your account
      </h2>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow rounded-lg sm:px-10">
        <form @submit.prevent="login" class="space-y-6">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">
              Username or email
            </label>
            <div class="mt-1">
              <input
                id="email"
                name="email"
                type="text"
                v-model="email"
                placeholder="you@gmail.com"
                required=""
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue focus:border-blue sm:text-sm"
              />
            </div>
          </div>

          <div class="mt-4">
            <label for="password" class="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div class="mt-1">
              <input
                id="password"
                name="password"
                type="password"
                v-model="password"
                placeholder="Password"
                required=""
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue focus:border-blue sm:text-sm"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              :disabled="!canSubmit"
              class="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600"
              :class="{ 'bg-opacity-50 cursor-not-allowed': !canSubmit }"
            >
              Login
            </button>
          </div>

          <div class="rounded-md bg-red-100 p-4" v-show="errorMessage">
            <h3 class="text-sm font-medium text-red-800">
                {{ errorMessage }}
            </h3>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
<script>
import User from "../services/User.js";

export default {
  name: "LoginForm",
  data() {
    return {
      email: "",
      password: "",
      errorMessage: "",
      submitting: false,
    };
  },
  computed: {
    canSubmit() {
      return this.email && this.password && !this.submitting;
    },
  },
  methods: {
    setError(msg) {
      this.errorMessage = msg;
    },
    async login() {
      if (!this.email || !this.password) {
        this.setError("Please fill in all fields");
        return;
      }
      this.submitting = true;
      try {
        const user = await User.login({ email: this.email, password: this.password });
        this.submitting = false;
        if (user) {
          this.$emit("login", user);
        } else {
          this.setError("Invalid credentials");
          this.$emit("login", null);
        }
      } catch (e) {
        this.submitting = false;
        console.error("Error logging in:", e);
        this.setError("Invalid credentials");
        this.$emit("login", null);
        window.localStorage.removeItem("mcdoodle.userId");
      }
    },
  },
};
</script>
