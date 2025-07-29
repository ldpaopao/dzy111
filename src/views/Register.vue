<script setup>
import { ref } from 'vue';
import { register } from '../api';
import { useRouter } from 'vue-router';

const form = ref({ username: '', password: '' });
const router = useRouter();

const handleRegister = async () => {
  await register(form.value);
  router.push('/login');
};
</script>
<template>
  <div>
    <h2>注册</h2>
    <input v-model="form.username" placeholder="用户名" />
    <input v-model="form.password" type="password" placeholder="密码" />
    <button @click="handleRegister">注册</button>
  </div>
</template>
