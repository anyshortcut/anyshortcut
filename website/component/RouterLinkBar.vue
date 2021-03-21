<template>
    <ul>
        <li v-for="route in routes">
            <router-link :to="{name:route.name}">
                {{ route.text }}
            </router-link>
        </li>
    </ul>
</template>
<style lang="scss" scoped>
    ul {
        list-style: none;
        display: flex;
        padding: 0;
        border-bottom: solid 1px #ececec;

        & > li {
            display: flex;
            align-items: center;
            margin-right: 35px;
            padding: 0;
        }

        & > li > a {
            font-size: 15px;
            color: #637282;
            text-decoration: none;
            padding-bottom: 8px;
            height: 100%;

            &.router-link-exact-active {
                color: #1C2833;
                font-weight: 500;
                border-bottom: 1px solid #1b2733;
            }

            &:hover {
                opacity: .8;
            }
        }
    }
</style>
<script>
    export default {
        name: "RouterLinkBar",
        props: {
            routes: {
                type: Array,
                required: true,
                default() {
                    return [];
                }
            }
        }
    }
</script>