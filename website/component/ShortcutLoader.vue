<template>
    <content-loader
            :height="75"
            :width="400"
            :speed="2"
            primaryColor="#f3f3f3"
            secondaryColor="#ecebeb">
        <rect x="70" y="15" rx="4" ry="4" width="176.67" height="9.66"/>
        <rect x="69" y="41" rx="3" ry="3" width="247.23" height="7.87"/>
        <circle cx="30" cy="30" r="30"/>
        <rect x="354.5" y="19.4" rx="0" ry="0" width="21.59" height="20.32"/>
        <rect x="304.5" y="90.4" rx="0" ry="0" width="0" height="0"/>
        <rect x="302.5" y="82.4" rx="0" ry="0" width="0" height="0"/>
    </content-loader>
</template>

<script>
    import {ContentLoader} from "vue-content-loader"

    export default {
        name: "ShortcutLoader",
        components: {
            ContentLoader
        }
    }
</script>

<style scoped>
</style>