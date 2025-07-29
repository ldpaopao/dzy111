import { createRouter, createWebHistory } from 'vue-router';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';
import Lottery from '../views/Lottery.vue';
import MyPrizes from '../views/MyPrizes.vue';
import Admin from '../views/Admin.vue';
import TestAdmin from '../views/TestAdmin.vue';

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            redirect: '/login',
        },
        {
            path: '/login',
            name: 'Login',
            component: Login
        },
        {
            path: '/register',
            name: 'Register',
            component: Register
        },
        {
            path: '/lottery',
            name: 'Lottery',
            component: Lottery,
            meta: { requiresAuth: true }
        },
        {
            path: '/my-prizes',
            name: 'MyPrizes',
            component: MyPrizes,
            meta: { requiresAuth: true }
        },
        {
            path: '/admin',
            name: 'Admin',
            component: Admin,
            meta: { requiresAuth: true, requiresAdmin: true }
        },
        {
            path: '/test',
            name: 'TestAdmin',
            component: TestAdmin
        }
    ]
})

// Navigation Guard
router.beforeEach((to, from, next) => {
    const loggedIn = localStorage.getItem('loginUser');
    const isAdmin = localStorage.getItem('isAdmin');

    if (to.matched.some(record => record.meta.requiresAuth) && !loggedIn) {
        // If the route requires auth and the user is not logged in, redirect to login page.
        next('/login');
    } else if (to.matched.some(record => record.meta.requiresAdmin) && isAdmin !== 'true') {
        // If the route requires admin and the user is not admin, redirect to lottery page.
        next('/lottery');
    } else {
        // Otherwise, proceed as normal.
        next();
    }
});

export default router
