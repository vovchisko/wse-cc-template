<template>
    <div id="home">
        <h4>home page</h4>
        <router-link to="/sign/out">signout</router-link>
        <router-link to="/cfg">cfg</router-link>
        <pre>NET.is_in: {{NET.is_in}}; NET.api_key: {{NET.api_key}} <span> // if we logged in and have api-key</span> </pre>
        <pre>NET.is_online: {{NET.is_online}}; <span>// if we connected to master server via `wse`</span></pre>
        <pre>NET.core_id: {{NET.core_id || 'null'}} <span>// if we connected to core via `wse`</span></pre>
        <div>
            <b>demons: {{stats.demons.length}}</b>
            <div v-for="d in stats.demons">
                {{d.id}} /load:{{d.load}} /ip: {{d.ip}}
            </div>
        </div>
        <div>
            <b>cores: {{stats.cores.length}}</b>
            <div v-for="c in stats.cores">
                <button v-on:click="select_core(c.id)">jump</button>
                {{c}}
            </div>
        </div>

        <div class="core-log">
            <b>CORE_LOG</b>
            <button v-on:click="poke_core()" v-if="NET.core_id">poke core {{NET.core_id}}</button>
            <div v-for="item in inst_log">{{item}}</div>
        </div>

    </div>
</template>

<script>
    import NET from '../ctrl/net';


    const inst_log = [];
    const stats = {demons: [], cores: []};

    NET.master.on('m:stats', (s) => {
        stats.demons.splice(0, stats.demons.length, ...s.demons);
        stats.cores.splice(0, stats.cores.length, ...s.cores);
    });

    NET.core.on('message', (c, dat) => _push({c, dat}));
    NET.core.on('open', (dat) => _push(dat));
    NET.core.on('close', (core, reason) => _push('disconnected... ' + core + ' / ' + reason));
    NET.core.on('error', (err) => console.log('error', err));

    function _push(dat) {
        inst_log.push(dat);
        if (inst_log.length > 10)
            inst_log.splice(0,1);
    }


    export default {
        name: "home",
        data: () => {
            return {NET, stats, inst_log}
        },
        methods: {
            select_core: function (core_id) {
                NET.master.send('select_core', core_id);
            },
            poke_core: function () {
                NET.core.send('poke', Math.random());
            },
        }
    }

</script>

<style>
    small { display: block; }
    pre > span { color: #888}
    div { font-size: 12px; }
    button { line-height: 18px; }
</style>
