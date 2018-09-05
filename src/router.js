import Vue from 'vue'
import Router from 'vue-router'

import NET from './ctrl/net';

import Auth from './mods/auth'
import Home from './mods/home'
import Cfg from './mods/cfg'

Vue.use(Router);

const router = new Router({
    routes: [
        {path: '/sign/:action?/:secret?', name: 'auth', component: Auth},
        {path: '/', name: 'home', component: Home, meta: {requiresAuth: true}},
        {path: '/cfg', name: 'cfg', component: Cfg, meta: {requiresAuth: true}}
    ]
});

router.beforeEach((to, from, next) => {
    if (to.matched.some(record => record.meta.requiresAuth) && NET.is_in === false) {
        next({path: '/sign'});
    } else {
        next();
    }
});

NET.on('signout', () => router.push('/sign'));
NET.on('ready', () => router.push('/'));

export default router;
