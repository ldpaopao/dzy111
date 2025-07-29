<template>
  <div class="admin-container">
    <el-header class="header">
      <span class="title">管理员控制台</span>
      <span class="right_tool">
        <a href="javascript:void(0)" @click="logout">
          <el-icon><SwitchButton/></el-icon> 退出登录【{{ loginName }}】
        </a>
      </span>
    </el-header>

    <main class="main-content">
      <div class="admin-panel">
        <h2>📊 抽奖记录管理</h2>
        
        <div class="stats-cards">
          <div class="stat-card">
            <div class="stat-number">{{ totalRecords }}</div>
            <div class="stat-label">总抽奖次数</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ realPrizes }}</div>
            <div class="stat-label">中奖次数</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ totalRecords }}</div>
            <div class="stat-label">总抽奖次数</div>
          </div>
        </div>

        <div class="table-container">
          <el-table :data="prizeRecords" style="width: 100%" v-loading="loading">
            <el-table-column prop="userName" label="用户名" width="150" />
            <el-table-column prop="prizeName" label="奖品名称" width="150">
              <template #default="scope">
                <el-tag 
                  type="success"
                  size="small"
                >
                  {{ scope.row.prizeName }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="wonTime" label="抽奖时间" width="200">
              <template #default="scope">
                {{ formatDate(scope.row.wonTime) }}
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div class="refresh-section">
          <el-button type="primary" @click="refreshData" :loading="loading">
            <el-icon><Refresh /></el-icon>
            刷新数据
          </el-button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { getAllPrizes } from '../api';
import { ElMessage, ElHeader, ElIcon, ElTable, ElTableColumn, ElTag, ElButton } from "element-plus";
import { SwitchButton, Refresh } from '@element-plus/icons-vue';
import router from "@/router";

const loginName = ref('');
const prizeRecords = ref([]);
const loading = ref(false);

// 计算统计数据
const totalRecords = computed(() => prizeRecords.value.length);
const realPrizes = computed(() => prizeRecords.value.length); // 现在所有奖品都是真实奖品

onMounted(() => {
  checkAuth();
  loadData();
});

const checkAuth = () => {
  try {
    const token = localStorage.getItem('loginUser');
    const isAdmin = localStorage.getItem('isAdmin');
    
    if (!token || isAdmin !== 'true') {
      ElMessage.error('您没有管理员权限');
      router.push('/login');
      return;
    }

    // 解析JWT获取用户名
    const payloadBase64 = token.split('.')[1];
    const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
    const decodedPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    const user = JSON.parse(decodedPayload);
    if (user && user.name) {
      loginName.value = user.name;
    }
  } catch (error) {
    console.error("Failed to parse JWT:", error);
    ElMessage.error('身份验证失败');
    router.push('/login');
  }
};

const loadData = async () => {
  loading.value = true;
  try {
    const { data } = await getAllPrizes();
    prizeRecords.value = data || [];
    ElMessage.success('数据加载成功');
  } catch (error) {
    console.error('Failed to load prize records:', error);
    ElMessage.error('数据加载失败');
  } finally {
    loading.value = false;
  }
};

const refreshData = () => {
  loadData();
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

const logout = () => {
  ElMessage.success("退出成功");
  localStorage.removeItem('loginUser');
  localStorage.removeItem('isAdmin');
  router.push('/login');
};
</script>

<style scoped>
.admin-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding: 0 20px;
}

.title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.right_tool a {
  text-decoration: none;
  color: #606266;
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.right_tool a:hover {
  color: #409eff;
  background: rgba(64, 158, 255, 0.1);
}

.main-content {
  padding: 40px 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.admin-panel {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.admin-panel h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
  font-size: 28px;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  border-radius: 15px;
  text-align: center;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.stat-number {
  font-size: 36px;
  font-weight: bold;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  opacity: 0.9;
}

.table-container {
  margin-bottom: 30px;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.refresh-section {
  text-align: center;
}

.refresh-section .el-button {
  padding: 12px 24px;
  font-size: 16px;
}
</style> 