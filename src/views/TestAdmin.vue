<template>
  <div class="test-container">
    <h2>管理员功能测试</h2>
    
    <div class="test-section">
      <h3>当前用户信息</h3>
      <p><strong>用户名:</strong> {{ userName }}</p>
      <p><strong>用户ID:</strong> {{ userId }}</p>
      <p><strong>是否管理员:</strong> {{ isAdmin ? '是' : '否' }}</p>
    </div>

    <div class="test-section">
      <h3>测试操作</h3>
      <button @click="testAdminAccess" class="test-btn">测试管理员访问</button>
      <button @click="testNormalAccess" class="test-btn">测试普通用户访问</button>
      <button @click="clearStorage" class="test-btn">清除存储</button>
    </div>

    <div class="test-section">
      <h3>模拟登录</h3>
      <div class="login-sim">
        <label>用户ID: <input v-model="testUserId" type="number" /></label>
        <button @click="simulateLogin" class="test-btn">模拟登录</button>
      </div>
    </div>

    <div class="navigation">
      <router-link to="/lottery" class="nav-link">去抽奖页面</router-link>
      <router-link to="/admin" class="nav-link">去管理页面</router-link>
      <router-link to="/login" class="nav-link">去登录页面</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const userName = ref('');
const userId = ref(null);
const isAdmin = ref(false);
const testUserId = ref(3);

onMounted(() => {
  loadUserInfo();
});

const loadUserInfo = () => {
  try {
    const token = localStorage.getItem('loginUser');
    const adminStatus = localStorage.getItem('isAdmin');
    
    if (token) {
      const payloadBase64 = token.split('.')[1];
      const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
      const decodedPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      const user = JSON.parse(decodedPayload);
      userName.value = user.name || '未知';
      userId.value = user.id || '未知';
      isAdmin.value = adminStatus === 'true';
    }
  } catch (error) {
    console.error('Failed to load user info:', error);
  }
};

const testAdminAccess = () => {
  if (isAdmin.value) {
    alert('✅ 管理员访问测试成功！');
    router.push('/admin');
  } else {
    alert('❌ 您不是管理员，无法访问管理页面');
  }
};

const testNormalAccess = () => {
  alert('✅ 普通用户访问测试成功！');
  router.push('/lottery');
};

const clearStorage = () => {
  localStorage.clear();
  alert('存储已清除，请重新登录');
  router.push('/login');
};

const simulateLogin = () => {
  // 模拟JWT token
  const mockUser = {
    id: parseInt(testUserId.value),
    name: `用户${testUserId.value}`
  };
  
  const mockToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify(mockUser))}.mock`;
  
  localStorage.setItem('loginUser', mockToken);
  localStorage.setItem('isAdmin', mockUser.id === 3 ? 'true' : 'false');
  
  loadUserInfo();
  alert(`模拟登录成功！用户ID: ${mockUser.id}, 管理员: ${mockUser.id === 3 ? '是' : '否'}`);
};
</script>

<style scoped>
.test-container {
  max-width: 800px;
  margin: 50px auto;
  padding: 30px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.test-section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 8px;
}

.test-section h3 {
  margin-top: 0;
  color: #333;
}

.test-btn {
  margin: 5px;
  padding: 10px 20px;
  background: #409eff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.test-btn:hover {
  background: #66b1ff;
}

.login-sim {
  display: flex;
  align-items: center;
  gap: 10px;
}

.login-sim input {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 100px;
}

.navigation {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 30px;
}

.nav-link {
  padding: 10px 20px;
  background: #67c23a;
  color: white;
  text-decoration: none;
  border-radius: 5px;
}

.nav-link:hover {
  background: #85ce61;
}
</style> 