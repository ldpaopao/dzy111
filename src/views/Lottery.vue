<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { lottery } from '../api';
import { ElMessage, ElHeader, ElIcon, ElButton } from "element-plus";
import { SwitchButton, Setting, Clock, Tools } from '@element-plus/icons-vue';
import router from "@/router";
import LotteryWheel from '../components/LotteryWheel.vue';

const loginName  = ref('');
const result = ref('');
const wheelRef = ref(null);
const isAdmin = ref(false);
const totalDraws = ref(0);
const winCount = ref(0);




const prizes = ref([
  '自行车',
  '电饭煲',
  '充电宝',
  '手环',
  '10元优惠券',
  '蓝牙耳机'
]);

// 获取奖品图标
const getPrizeIcon = (prizeName) => {
  const iconMap = {
    '自行车': '🚲',
    '电饭煲': '🍚',
    '充电宝': '🔋',
    '手环': '⌚',
    '10元优惠券': '🎫',
    '蓝牙耳机': '🎧'
  };
  return iconMap[prizeName] || '🎁';
};

// 初始化粒子位置
const initParticles = () => {
  const particles = document.querySelectorAll('.particle');
  particles.forEach((particle, index) => {
    particle.style.left = Math.random() * 100 + '%';
    particle.style.top = Math.random() * 100 + '%';
    particle.style.animationDelay = Math.random() * 5 + 's';
  });
};

onMounted(() => {
  try {
    const token = localStorage.getItem('loginUser');
    if (!token) {
      router.push('/');
      return;
    }

    // 检查是否为管理员
    const adminStatus = localStorage.getItem('isAdmin');
    isAdmin.value = adminStatus === 'true';

    // A JWT has three parts: header.payload.signature
    // The payload (middle part) contains the user data.
    // It's Base64URL encoded, so we need a robust way to decode it.
    const payloadBase64 = token.split('.')[1];
    const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
    const decodedPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    const user = JSON.parse(decodedPayload);

    if (user && user.name) {
      loginName.value = user.name;
    } else {
      router.push('/');
    }

    // 初始化粒子动画
    nextTick(() => {
      initParticles();
    });

    // 从localStorage加载统计数据
    loadStats();
  } catch (error) {
    console.error("Failed to parse JWT from localStorage or token is invalid:", error);
    localStorage.removeItem('loginUser');
    router.push('/');
  }
});

const loadStats = () => {
  const savedTotalDraws = localStorage.getItem('totalDraws');
  const savedWinCount = localStorage.getItem('winCount');
  
  if (savedTotalDraws) totalDraws.value = parseInt(savedTotalDraws);
  if (savedWinCount) winCount.value = parseInt(savedWinCount);
};

const saveStats = () => {
  localStorage.setItem('totalDraws', totalDraws.value.toString());
  localStorage.setItem('winCount', winCount.value.toString());
};

const isDrawing = ref(false); // 添加抽奖状态标记

const handleDraw = async () => {
  // 防止重复点击
  if (wheelRef.value?.isSpinning || isDrawing.value) {
    ElMessage.warning("正在抽奖中，请稍候...");
    return;
  }

  isDrawing.value = true; // 设置抽奖状态

  try {
    console.log("=== 前端抽奖调试信息 ===");
    console.log("发送抽奖请求...");
    
    const response = await lottery();
    console.log("完整响应:", response);
    console.log("响应数据类型:", typeof response);
    
    const {data: prizeName} = response;
    console.log("解构后的奖品名称:", prizeName);
    console.log("奖品名称类型:", typeof prizeName);
    console.log("奖品名称长度:", prizeName ? prizeName.length : 'null');
    
    console.log("前端奖品数组:", prizes.value);
    
    const prizeIndex = prizes.value.findIndex(p => p === prizeName);
    console.log("找到的奖品索引:", prizeIndex);

    if (prizeIndex !== -1) {
      console.log("开始旋转到索引:", prizeIndex, "奖品:", prizes.value[prizeIndex]);
      wheelRef.value?.spin(prizeIndex);
    } else {
      console.error("奖品不在列表中:", prizeName);
      console.error("可用奖品:", prizes.value);
      ElMessage.error(`抽奖发生未知错误，奖品"${prizeName}"不存在。`);
    }
    console.log("=== 调试信息结束 ===");
  } catch (error) {
    console.error("抽奖请求失败:", error);
    ElMessage.error("抽奖请求失败，请检查网络。");
  } finally {
    isDrawing.value = false; // 重置抽奖状态
  }
};

const onSpinEnd = (prize) => {
  result.value = prize;
  
  // 更新统计数据
  totalDraws.value++;
  winCount.value++; // 现在所有奖品都是中奖
  saveStats();
  
  // 使用更简洁的消息提示，避免大图片显示
  ElMessage({
    message: `恭喜您，抽中【${prize}】！`,
    type: 'success',
    duration: 3000,
    showClose: true
  });
};

const logout = () => {
  ElMessage.success("退出成功");
  localStorage.removeItem('loginUser');
  router.push('/');
};

const goToAdmin = () => {
  router.push('/admin');
};

const toggleDebug = () => {
  if (wheelRef.value?.showDebug) {
    wheelRef.value.disableDebug();
  } else {
    wheelRef.value?.enableDebug();
  }
};
</script>

<template>
  <div class="lottery-page">
    <!-- 背景装饰 -->
    <div class="bg-decoration">
      <div class="floating-shapes">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
        <div class="shape shape-4"></div>
        <div class="shape shape-5"></div>
      </div>
      <div class="particles">
        <div class="particle" v-for="n in 20" :key="n"></div>
      </div>
    </div>

    <el-header class="header">
      <div class="header-content">
        <div class="title-section">
          <h1 class="main-title">🎰 幸运大转盘</h1>
          <p class="subtitle">转动命运之轮，赢取精彩奖品</p>
        </div>
        <div class="user-section">
          <div class="user-info">
            <div class="user-avatar">
              <span>{{ loginName.charAt(0).toUpperCase() }}</span>
            </div>
            <div class="user-details">
              <span class="username">{{ loginName }}</span>
              <span class="user-role">{{ isAdmin ? '管理员' : '用户' }}</span>
            </div>
          </div>
          <div class="header-actions">
            <a v-if="isAdmin" href="javascript:void(0)" @click="goToAdmin" class="admin-link">
              <el-icon><Setting /></el-icon> 管理后台
            </a>
            <a href="javascript:void(0)" @click="logout" class="logout-link">
              <el-icon><SwitchButton/></el-icon> 退出
            </a>
          </div>
        </div>
      </div>
    </el-header>

    <main class="main-content">
      <div class="lottery-container">
        <!-- 转盘区域 -->
        <div class="wheel-section">
          <div class="wheel-wrapper">
            <LotteryWheel
                ref="wheelRef"
                :prizes="prizes"
                @spin-end="onSpinEnd"
                @draw-request="() => handleDraw()"
            />
          </div>
          
          <!-- 转盘说明 -->
          <div class="wheel-info">
            <div class="info-card">
              <h3>🎯 如何抽奖</h3>
              <p>点击转盘中心的"GO"按钮开始抽奖</p>
              <p>转盘停止后，指针指向的奖品就是您的中奖结果</p>
            </div>
          </div>
        </div>

        <!-- 右侧信息面板 -->
        <div class="info-panel">
          <!-- 奖品列表 -->
          <div class="prizes-list">
            <h3>🏆 奖品清单</h3>
            <div class="prize-items">
              <div 
                v-for="(prize, index) in prizes" 
                :key="index"
                class="prize-item"
                :class="{ 'current-prize': result === prize }"
              >
                <div class="prize-icon">
                  {{ getPrizeIcon(prize) }}
                </div>
                <div class="prize-info">
                  <span class="prize-name">{{ prize }}</span>
                  <span class="prize-index">#{{ index + 1 }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 抽奖结果 -->
          <div v-if="result" class="result-section">
            <div class="result-card">
              <div class="result-header">
                <h3>🎉 恭喜中奖！</h3>
                <div class="confetti">
                  <div class="confetti-piece" v-for="n in 8" :key="n"></div>
                </div>
              </div>
              <div class="result-content">
                <div class="prize-display">
                  <div class="prize-icon-large">
                    {{ getPrizeIcon(result) }}
                  </div>
                  <div class="prize-name-large">{{ result }}</div>
                </div>
                <div class="result-time">
                  <el-icon><Clock /></el-icon>
                  {{ new Date().toLocaleString() }}
                </div>
              </div>
            </div>
          </div>

          <!-- 统计信息 -->
          <div class="stats-section">
            <h3>📊 抽奖统计</h3>
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-number">{{ totalDraws }}</div>
                <div class="stat-label">总抽奖次数</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">{{ winCount }}</div>
                <div class="stat-label">中奖次数</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 调试按钮 -->
      <div class="debug-controls">
        <el-button size="small" @click="toggleDebug" type="info" plain>
          <el-icon><Tools /></el-icon>
          {{ wheelRef?.showDebug ? '隐藏' : '显示' }}调试信息
        </el-button>
      </div>
    </main>
  </div>
</template>

<style scoped>
.lottery-page {
  position: relative;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  overflow-x: hidden;
}

.bg-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
}

.floating-shapes {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.shape {
  position: absolute;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 6s ease-in-out infinite;
}

.shape-1 {
  top: 10%;
  left: 10%;
  animation-delay: 0s;
  background: rgba(255, 255, 255, 0.2);
}

.shape-2 {
  top: 70%;
  left: 80%;
  animation-delay: 1s;
  background: rgba(255, 255, 255, 0.15);
}

.shape-3 {
  top: 50%;
  left: 50%;
  animation-delay: 2s;
  background: rgba(255, 255, 255, 0.1);
}

.shape-4 {
  top: 20%;
  left: 30%;
  animation-delay: 3s;
  background: rgba(255, 255, 255, 0.25);
}

.shape-5 {
  top: 90%;
  left: 70%;
  animation-delay: 4s;
  background: rgba(255, 255, 255, 0.18);
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

.particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.particle {
  position: absolute;
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  animation: particleFloat 8s linear infinite;
}

@keyframes particleFloat {
  0% {
    transform: translateY(100vh) scale(0);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(-100px) scale(1);
    opacity: 0;
  }
}

.header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 10;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 30px;
  max-width: 1400px;
  margin: 0 auto;
}

.title-section {
  flex: 1;
}

.main-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  font-size: 16px;
  color: #666;
  margin: 5px 0 0 0;
  font-weight: 400;
}

.user-section {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-info {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.8);
  padding: 8px 15px;
  border-radius: 25px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.user-avatar {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 10px;
  color: white;
  font-weight: 600;
  font-size: 16px;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.username {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.user-role {
  font-size: 12px;
  color: #666;
  margin: 2px 0 0 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.admin-link, .logout-link {
  text-decoration: none;
  color: #666;
  display: inline-flex;
  align-items: center;
  padding: 8px 15px;
  border-radius: 20px;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.admin-link:hover, .logout-link:hover {
  color: #409eff;
  background: rgba(255, 255, 255, 1);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
}

.admin-link .el-icon, .logout-link .el-icon {
  margin-right: 6px;
}

.main-content {
  padding: 40px 20px;
  max-width: 1400px;
  margin: 0 auto;
  position: relative;
  z-index: 5;
}

.lottery-container {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 30px;
  align-items: start;
}

.wheel-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
}

.wheel-wrapper {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.wheel-info {
  width: 100%;
  max-width: 400px;
}

.info-card {
  background: rgba(255, 255, 255, 0.95);
  padding: 25px;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.info-card h3 {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 15px;
  color: #333;
}

.info-card p {
  margin: 8px 0;
  color: #666;
  line-height: 1.6;
}

.info-panel {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  height: fit-content;
}

.prizes-list h3 {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #333;
}

.prize-items {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.prize-item {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.prize-item:hover {
  transform: translateX(5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.prize-item.current-prize {
  border-color: #409eff;
  background: rgba(64, 158, 255, 0.1);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(64, 158, 255, 0.4);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(64, 158, 255, 0);
  }
}

.prize-icon {
  font-size: 24px;
  margin-right: 15px;
  width: 40px;
  text-align: center;
}

.prize-info {
  flex: 1;
}

.prize-name {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  display: block;
}

.prize-index {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
  display: block;
}

.result-section {
  margin-top: 30px;
}

.result-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 25px;
  border-radius: 15px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
  position: relative;
  overflow: hidden;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.result-header h3 {
  font-size: 22px;
  font-weight: 600;
  margin: 0;
}

.confetti {
  position: relative;
  width: 50px;
  height: 50px;
}

.confetti-piece {
  position: absolute;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #ffd700;
  animation: confettiFall 3s ease-in-out infinite;
}

.confetti-piece:nth-child(1) { left: 10%; animation-delay: 0s; }
.confetti-piece:nth-child(2) { left: 20%; animation-delay: 0.2s; }
.confetti-piece:nth-child(3) { left: 30%; animation-delay: 0.4s; }
.confetti-piece:nth-child(4) { left: 40%; animation-delay: 0.6s; }
.confetti-piece:nth-child(5) { left: 50%; animation-delay: 0.8s; }
.confetti-piece:nth-child(6) { left: 60%; animation-delay: 1s; }
.confetti-piece:nth-child(7) { left: 70%; animation-delay: 1.2s; }
.confetti-piece:nth-child(8) { left: 80%; animation-delay: 1.4s; }

@keyframes confettiFall {
  0% {
    transform: translateY(-20px) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(60px) rotate(360deg);
    opacity: 0;
  }
}

.result-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.prize-display {
  display: flex;
  align-items: center;
}

.prize-icon-large {
  font-size: 48px;
  margin-right: 15px;
}

.prize-name-large {
  font-size: 20px;
  font-weight: 600;
}

.result-time {
  font-size: 14px;
  opacity: 0.9;
  display: flex;
  align-items: center;
  gap: 5px;
}

.stats-section {
  margin-top: 30px;
}

.stats-section h3 {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #333;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.stat-item {
  background: rgba(255, 255, 255, 0.8);
  padding: 20px;
  border-radius: 12px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.stat-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.stat-number {
  font-size: 28px;
  font-weight: 700;
  color: #409eff;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.debug-controls {
  margin-top: 30px;
  text-align: center;
}

.debug-controls .el-button {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .lottery-container {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .info-panel {
    order: -1;
  }
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
  
  .user-section {
    flex-direction: column;
    gap: 10px;
  }
  
  .main-content {
    padding: 20px 10px;
  }
  
  .wheel-wrapper {
    padding: 20px;
  }
  
  .info-panel {
    padding: 20px;
  }
  
  .prize-items {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>