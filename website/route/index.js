import Cookies from 'js-cookie';
import config from "../js/config.js";
import Vue from 'vue';
import VueRouter from 'vue-router';
import SignIn from '@/route/SignIn.vue';
import Dashboard from '@/route/Dashboard';
import ShortcutHome from "@/route/shortcut/Home.vue";
import SubscriptionHome from "@/route/subscription/Home.vue";
import Shortcuts from "@/route/shortcut/Shortcuts.vue";
import Subscription from "@/route/subscription/Subscription.vue";
import PaymentMethod from "@/route/subscription/PaymentMethod.vue";
import Redeem from "@/route/subscription/Redeem.vue";
import RouteNotFound from "../component/RouteNotFound.vue";
import ProfileHome from "@/route/profile/Home.vue";
import ApiAccess from "@/route/profile/ApiAccess.vue";

// 1. Use plugin.
// This installs <router-view> and <router-link>,
// and injects $router and $route to all router-enabled child components
Vue.use(VueRouter);

// 3. Create the router
const router = new VueRouter({
    // mode: 'history',
    base: '/account',
    routes: [
        {
            path: '/login',
            name: 'signin',
            component: SignIn,
            meta: {noAuth: true}
        },
        {
            path: '/',
            // Name attribute is redundant for default child route
            // name: 'dashboard',
            component: Dashboard,
            meta: {auth: true},
            children: [
                {
                    path: 'shortcuts',
                    // name: 'shortcuts',
                    meta: {auth: true},
                    component: ShortcutHome,
                    children: [
                        {
                            path: '',
                            name: 'shortcuts',
                            meta: {auth: true},
                            component: Shortcuts,
                        },
                    ]
                },
                {
                    path: 'subscription',
                    // name: 'subscriptions',
                    meta: {auth: true},
                    component: SubscriptionHome,
                    children: [
                        {
                            path: '',
                            name: 'subscription',
                            meta: {auth: true},
                            component: Subscription,
                        },
                        {
                            path: 'payment-method',
                            name: 'payment-method',
                            meta: {auth: true},
                            component: PaymentMethod,
                        },
                        {
                            path: 'redeem',
                            name: 'redeem',
                            meta: {auth: true},
                            component: Redeem,
                        }
                    ]
                },
                {
                    path: 'profile',
                    // name: 'profile',
                    meta: {auth: true},
                    component: ProfileHome,
                    children: [
                        {
                            path: '',
                            name: 'profile',
                            meta: {auth: true},
                            component: ApiAccess,
                        },
                    ]
                },
            ],
        },
        {
            path: '*',
            name: 'route-not-found',
            component: RouteNotFound,
        }
    ]
});

// beforeEach code should be above of the app.$mount, otherwise beforeEach() method
// will not get called if refresh the page.
router.beforeEach((to, from, next) => {
    if (Cookies.get(config.LOGIN_TIME_KEY)) {
        if (to.matched.some(record => record.meta.noAuth)) {
            next({path: '/'});
        } else {
            next();
        }
    } else {
        if (to.matched.some(record => record.meta.auth)) {
            next({
                path: '/login',
                query: {
                    redirect: to.fullPath,
                }
            })
        } else {
            next();
        }
    }
});

export default router;