<template>
    <div class="dashboard" v-if="user">
        <div class="left-panel">
            <dashboard-bar :user="user"
                           :subscription="subscription">
            </dashboard-bar>
            <div class="section">
                <ul>
                    <li>
                        <router-link :to="{name:'shortcuts'}">
                            <i class="icon-grid" aria-hidden="true"></i>
                            Shortcuts
                        </router-link>
                    </li>
                    <li>
                        <router-link :to="{name:'subscription'}">
                            <i class="icon-credit-card" aria-hidden="true"></i>
                            Subscription
                        </router-link>
                    </li>
                    <li>
                        <router-link :to="{name:'profile'}">
                            <i class="icon-user" aria-hidden="true"></i>
                            Profile
                        </router-link>
                    </li>
                </ul>
            </div>
        </div>
        <div class="right-panel">
            <router-view class="router-view"></router-view>
        </div>
    </div>
</template>
<style lang="scss">
    .router-view {
        padding: 30px 30px 0;
    }

    .divider {
        background-color: #ececec;
        height: 1px;
    }

    .dashboard {
        position: relative;
        display: block;
    }

    .left-panel {
        position: fixed;
        top: 0;
        height: 100%;
        width: 240px;
        min-width: 240px;
        background: #F7F9FA;
        border-right: 1px solid rgba(0, 0, 0, 0.07);
        z-index: 10;
        overflow-y: hidden;

        & ul {
            margin: 0 20px;
        }

        & ul > li {
            height: 42px;
            display: flex;
            align-items: center;
        }

        & ul > li > a {
            font-size: 17px;
            color: #637282;
            font-weight: 500;
            font-family: "Poppins", sans-serif;
            text-decoration: none;

            & > i {
                vertical-align: middle;
                padding: 0 5px;
            }

            &.router-link-active {
                color: #1273DD;
            }

            &:hover {
                opacity: .8;
            }
        }
    }

    .right-panel {
        height: 100%;
        width: 100%;
        overflow: hidden;
        padding-left: 240px;
        padding-bottom: 30px;
    }
</style>
<script type="es6">
    import client from "@/js/client.js";
    import Vue from 'vue';
    import DashboardBar from "@/view/DashboardBar.vue";

    export default {
        name: "Dashboard",
        data() {
            return {
                user: null,
                subscription: null,
            }
        },
        components: {
            DashboardBar,
        },
        beforeRouteEnter(to, from, next) {
            // called before the route that renders this component is confirmed.
            // does NOT have access to `this` component instance,
            // because it has not been created yet when this guard is called!
            console.log('to:', to, '\n from:', from);
            if (to.path === '/') {
                next('/shortcuts');
            } else {
                next();
            }
        },
        created() {
            client.getUserInfo().then(data => {
                this.user = data.user;
                this.subscription = data.subscription;

                Vue.prototype.$info = data;
            }).catch(error => {
                console.log(error);
            });
        }
    }
</script>