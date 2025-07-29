<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  prizes: {
    type: Array,
    required: true,
    default: () => []
  }
});

const emit = defineEmits(['spin-end', 'draw-request']);

const wheelRef = ref(null);
const spinning = ref(false);
const resultIndex = ref(null);
const showDebug = ref(false);

// 启用调试模式
const enableDebug = () => {
  showDebug.value = true;
};

// 禁用调试模式
const disableDebug = () => {
  showDebug.value = false;
};

const spin = (prizeIndex) => {
  if (spinning.value) return;
  if (prizeIndex < 0 || prizeIndex >= props.prizes.length) {
    console.error("Invalid prize index.");
    return;
  }

  spinning.value = true;
  resultIndex.value = prizeIndex;

  const prizeCount = props.prizes.length;
  const baseCircles = 5; // 基础圈数
  
  // 计算每个奖品的角度范围
  const anglePerPrize = 360 / prizeCount;
  
  // 计算目标奖品的中心角度
  // 由于指针在顶部（12点钟方向），我们需要让奖品中心对准指针
  // 奖品0的中心在0度，奖品1的中心在anglePerPrize度，以此类推
  const targetAngle = prizeIndex * anglePerPrize + anglePerPrize / 2;
  
  // 添加一些随机偏移，让结果看起来更自然
  const randomOffset = (Math.random() - 0.5) * (anglePerPrize * 0.3);
  
  // 计算总旋转角度
  // 由于转盘是顺时针旋转，所以用负号
  const totalRotation = -(baseCircles * 360 + targetAngle + randomOffset);

  // 调试信息
  console.log('=== 转盘调试信息 ===');
  console.log(`奖品数量: ${prizeCount}`);
  console.log(`每个奖品角度: ${anglePerPrize}°`);
  console.log(`目标奖品索引: ${prizeIndex}`);
  console.log(`目标奖品名称: ${props.prizes[prizeIndex]}`);
  console.log(`目标角度: ${targetAngle}°`);
  console.log(`随机偏移: ${randomOffset}°`);
  console.log(`总旋转角度: ${totalRotation}°`);
  
  // 显示所有奖品的角度范围
  for (let i = 0; i < prizeCount; i++) {
    const startAngle = i * anglePerPrize;
    const endAngle = (i + 1) * anglePerPrize;
    const centerAngle = i * anglePerPrize + anglePerPrize / 2;
    console.log(`奖品${i} (${props.prizes[i]}): ${startAngle}° - ${endAngle}°, 中心: ${centerAngle}°`);
  }
  console.log('==================');

  const wheelElement = wheelRef.value;
  if (wheelElement) {
    wheelElement.style.transition = 'transform 4s cubic-bezier(0.25, 0.1, 0.25, 1)';
    wheelElement.style.transform = `rotate(${totalRotation}deg)`;
  }

  setTimeout(() => {
    spinning.value = false;
    emit('spin-end', props.prizes[prizeIndex]);
  }, 4200);
};

defineExpose({ 
  spin, 
  isSpinning: computed(() => spinning.value),
  enableDebug,
  disableDebug,
  showDebug: computed(() => showDebug.value)
});

const prizeCount = computed(() => props.prizes.length);

function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
}

function describeArc(x, y, radius, startAngle, endAngle) {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  const d = ["M", x, y, "L", start.x, start.y, "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y, "Z"].join(" ");
  return d;
}

function getTextCoordinates(idx) {
  // 计算每个奖品的中心角度
  const anglePerPrize = 360 / prizeCount.value;
  const angle = idx * anglePerPrize + anglePerPrize / 2;
  const radius = 105;
  return polarToCartesian(160, 160, radius, angle);
}

function getTextRotation(idx) {
  // 计算每个奖品的中心角度
  const anglePerPrize = 360 / prizeCount.value;
  const angle = idx * anglePerPrize + anglePerPrize / 2;
  return `rotate(${angle + 90}, ${getTextCoordinates(idx).x}, ${getTextCoordinates(idx).y})`;
}

</script>

<template>
  <div class="wheel-wrapper">
    <div class="wheel-container">
      <svg class="wheel-svg" width="320" height="320" viewBox="0 0 320 320">
        <g ref="wheelRef">
          <g v-for="(prize, idx) in prizes" :key="idx">
            <path
                :d="describeArc(160, 160, 140, idx * (360/prizeCount), (idx+1) * (360/prizeCount))"
                :fill="idx % 2 === 0 ? '#fffbe6' : '#fff3cd'"
            />
            <path
                v-if="resultIndex === idx && !spinning"
                :d="describeArc(160, 160, 140, idx * (360/prizeCount), (idx+1) * (360/prizeCount))"
                fill="#f39c12"
                style="filter: url(#glow);"
            />
            <text
                :x="getTextCoordinates(idx).x"
                :y="getTextCoordinates(idx).y"
                :transform="getTextRotation(idx)"
                fill="#c0392b"
                font-size="16"
                font-weight="bold"
                text-anchor="middle"
                alignment-baseline="middle"
                style="pointer-events:none;"
            >{{ prize }}</text>
            
            <!-- 调试信息：显示奖品索引和角度 -->
            <text
                v-if="showDebug"
                :x="getTextCoordinates(idx).x"
                :y="getTextCoordinates(idx).y + 25"
                :transform="getTextRotation(idx)"
                fill="#666"
                font-size="12"
                text-anchor="middle"
                alignment-baseline="middle"
                style="pointer-events:none;"
            >{{ idx }}:{{ Math.round((idx * (360/prizeCount) + (360/prizeCount)/2)) }}°</text>
          </g>
        </g>
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
      </svg>
      <div class="pointer" @click="!spinning && $emit('draw-request')" :class="{ 'disabled': spinning }">GO</div>
    </div>
    
    <!-- 调试控制面板 -->
    <div v-if="showDebug" class="debug-panel">
      <h4>调试信息</h4>
      <p>奖品数量: {{ prizeCount }}</p>
      <p>每个奖品角度: {{ Math.round(360 / prizeCount) }}°</p>
      <p>当前选中: {{ resultIndex !== null ? `${resultIndex}: ${prizes[resultIndex]}` : '无' }}</p>
      <button @click="showDebug = false" class="debug-btn">隐藏调试</button>
    </div>
  </div>
</template>

<style scoped>
.wheel-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}
.wheel-container {
  position: relative;
  width: 320px;
  height: 320px;
}
.wheel-svg {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1), 0 6px 6px rgba(0, 0, 0, 0.15);
  transform-origin: center;
}
.wheel-svg g {
  transform-origin: center;
}
.pointer {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80px;
  height: 80px;
  background-color: #e74c3c;
  border-radius: 50%;
  border: 6px solid white;
  box-shadow: 0 0 15px rgba(231, 76, 60, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 32px;
  font-weight: bold;
  font-family: 'Arial Black', sans-serif;
  cursor: pointer;
  z-index: 10;
  user-select: none;
  transition: transform 0.1s ease;
}
.pointer:active {
  transform: translate(-50%, -50%) scale(0.95);
}

.pointer.disabled {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none;
}
.pointer::before {
  content: '';
  position: absolute;
  top: -26px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 15px solid transparent;
  border-right: 15px solid transparent;
  border-bottom: 30px solid #e74c3c;
}

.debug-panel {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 15px;
  border-radius: 8px;
  font-size: 12px;
  max-width: 200px;
}

.debug-panel h4 {
  margin: 0 0 10px 0;
  font-size: 14px;
}

.debug-panel p {
  margin: 5px 0;
}

.debug-btn {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  margin-top: 10px;
}

.debug-btn:hover {
  background: #c0392b;
}
</style>