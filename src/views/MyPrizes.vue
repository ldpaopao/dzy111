<template>
  <div>
    <h2>我的奖品</h2>
    <ul>
      <li v-for="item in prizes" :key="item.wonTime">
        {{ item.prizeName }} - {{ item.wonTime }}
      </li>
    </ul>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue';
import { getMyPrizes } from '../api';

const prizes = ref([]);

onMounted(async () => {
  const { data } = await getMyPrizes();
  prizes.value = data;
});
</script>
<style scoped>
div {
  max-width: 500px;
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

ul {
  list-style-type: none;
  padding: 0;
}

li {
  padding: 10px 15px;
  margin-bottom: 8px;
  background-color: #f9f9f9;
  border-radius: 4px;
  font-size: 16px;
  color: #555555;
  border: 1px solid #eeeeee;
  transition: background-color 0.3s ease;
}

li:hover {
  background-color: #42b983;
}
</style>
