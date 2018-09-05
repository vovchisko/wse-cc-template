<template>
    <div id="cfg">
        <h4> profile settings </h4>
        <router-link to="/sign/out">sign out</router-link>

        <h5>
            {{NET.email}}
        </h5>
        <p v-if="NET.valid === true">Email Verified</p>
        <p v-if="NET.valid === null">We send you email with a link. Check your mail box.</p>
        <p v-if="NET.valid === false">You email was not verified. Check your inbox. Our email with link dhould be there.<br>
            <button v-on:click="re_everify()">request new link</button>
        </p>
        <h5>API-KEY</h5>
        <a type="button" v-on:click="apikey_reset()"><i class="i-cross"></i> reset api-key</a>
        <p>{{NET.api_key}}</p>


        <h4>password</h4>
        <p v-if="!pass_ch.toggle">************* </p>
        <button v-if="!pass_ch.toggle" v-on:click="pass_ch.toggle = true">change it</button>
        <a v-if="pass_ch.toggle" v-on:click="pass_ch.toggle = false">cancel</a>

        <div v-if="pass_ch.toggle">
            <div class="ui">
                <input type="password" v-model="pass_ch.c">
                <label>current password</label>
            </div>

            <div class="ui">
                <input type="password" v-model="pass_ch.n">
                <label>new password</label>
            </div>
            <div class="ui">
                <input type="password" v-model="pass_ch.nc">
                <label>confirm new password</label>
            </div>

            <button type="button" v-on:click="change_pass()">change password</button>
        </div>

    </div>

</template>

<script>
    import NET from '../ctrl/net';
    import {A} from '../components/alert';

    export default {
        name: 'cfg',
        data: () => {
            return {
                NET: NET,
                variant_font_size: new Array(17).fill(0).map((x, i) => {
                    return i * 10 + 40 + '%'
                }),
                variant_fx_level: ['full', 'medium', 'low', 'disabled'],
                re_everify_result: {result: 0, type: '', text: ''},
                pass_ch: {toggle: false, c: '', n: '', nc: ''}
            }
        },
        methods: {
            change_pass() {
                if (this.pass_ch.n !== this.pass_ch.nc) return A.warn({text: 'password/confirm are not equal'});

                NET.passch(this.pass_ch.c, this.pass_ch.n)
                    .catch(e => e.response)
                    .then(response => A.add(response))
            },
            apikey_reset: function () {
                A.warn({
                    text: 'Are you sure that you want to reset API-KEY?',
                    desc: 'This operation will disconnect all your devices and ask to re-login.',
                    acts: {
                        'yes, reset api-key': () => {
                            NET.apirst()
                                .catch(e => {
                                    console.log(e);
                                    return e.response;
                                })
                                .then(response => { console.log(response); A.add(response, true)})
                        }, cancel: null
                    }
                });
            },
            re_everify: function () {
                NET.everify()
                    .catch(e => e.response)
                    .then(response => A.add(response))
            },

        }
    }

</script>

<style lang="scss">

</style>
