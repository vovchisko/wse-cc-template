<template>
    <div id="app">
        <alert/>
        <router-view/>
    </div>
</template>

<script>
    import Alert from "./components/alert";
    import NET from './ctrl/net';
    import router from './router.js';

    export default {
        name: 'app',
        router: router,
        data: () => {
            return {NET}
        },
        components: {
            Alert
        }
    }
</script>

<style>
    #app {
        font-family: 'Avenir', Helvetica, Arial, sans-serif;
        color: #2c3e50;
    }
</style>
