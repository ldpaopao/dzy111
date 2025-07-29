import axios from 'axios';
// 创建 axios 实例，统一设置基础路径
const API = axios.create({
    baseURL: 'http://localhost:9527/api', // 后端接口基础地址
    timeout: 60000
});

// 请求拦截器：自动携带 token
API.interceptors.request.use(config => {
    const token = localStorage.getItem('loginUser'); // 直接获取 token 字符串

    if (token) {
        config.headers.Token = token; // 改为Token（大写T）以匹配后端
    }

    return config;
}, error => {
    return Promise.reject(error);
});


// 注册
export const register = (data) => {
    return API.post('/register', data);
};

// 登录
export const login = (data) => {
    return API.post('/login', data);
};

// 抽奖
export const lottery = () => {
    return API.post('/lottery');
};

// 获取当前用户的中奖记录
export const getMyPrizes = () => {
    return API.get('/my-prizes');
};

// 获取所有抽奖记录（管理员功能）
export const getAllPrizes = () => {
    return API.get('/getList');
};
