<template>
  <div class="container">
    <h2>{{ isLogin ? '登录' : '注册' }}</h2>

    <!-- 登录表单 -->
    <form v-if="isLogin" @submit.prevent="handleLogin">
      <input v-model="loginForm.username" placeholder="用户名" autocomplete="username" />
      <input v-model="loginForm.password" type="password" placeholder="密码" autocomplete="current-password" />
      <button type="submit">登录</button>
      <p>还没有账号？ <a href="#" @click.prevent="toggleForm">去注册</a></p>
    </form>

    <!-- 注册表单 -->
    <form v-else @submit.prevent="handleRegister">
      <input v-model="registerForm.username" placeholder="用户名" autocomplete="username" />
      <input v-model="registerForm.password" type="password" placeholder="密码" autocomplete="new-password" />
      <button type="submit">注册</button>
      <p>已有账号？ <a href="#" @click.prevent="toggleForm">去登录</a></p>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { login, register } from '@/api';

const router = useRouter();

const isLogin = ref(true);

const loginForm = ref({
  username: '',
  password: ''
});

const registerForm = ref({
  username: '',
  password: ''
});

const handleLogin = async () => {
  try {
    const response = await login(loginForm.value);
    console.log("Login response from server:", response); // Log the entire response

    // The token is expected to be in the `data` property of the response
    if (response && response.data) {
      console.log("Token found:", response.data); // Log the extracted token
      localStorage.setItem('loginUser', response.data);
      
      // 解析JWT获取用户信息
      try {
        const payloadBase64 = response.data.split('.')[1];
        const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
        const decodedPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        const user = JSON.parse(decodedPayload);
        
        // 检查是否为管理员（ID为3）
        if (user && user.id === 3) {
          localStorage.setItem('isAdmin', 'true');
          router.push('/admin');
        } else {
          localStorage.setItem('isAdmin', 'false');
          router.push('/lottery');
        }
      } catch (error) {
        console.error("Failed to parse JWT:", error);
        router.push('/lottery');
      }
    } else {
      console.error("Login successful, but no token found in response.");
      alert('登录失败：服务器响应格式不正确');
    }
  } catch (error) {
    alert('登录失败：用户名或密码错误');
  }
};

const handleRegister = async () => {
  try {
    await register(registerForm.value);
    alert('注册成功，请登录');
    toggleForm();
  } catch (error) {
    alert('注册失败');
  }
};

const toggleForm = () => {
  isLogin.value = !isLogin.value;
};
</script>

<style scoped>
.container {
  max-width: 400px;
  margin: 100px auto;
  padding: 30px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

h2 {
  text-align: center;
  margin-bottom: 20px;
  color: #333333;
}

input {
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #cccccc;
  border-radius: 4px;
  font-size: 14px;
}

button {
  width: 100%;
  padding: 10px;
  margin-top: 15px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #369c6b;
}

p {
  margin-top: 20px;
  text-align: center;
  font-size: 14px;
}

a {
  color: #42b983;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
</style>