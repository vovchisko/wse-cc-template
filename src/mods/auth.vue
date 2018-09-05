<template>
    <div id="auth">
        <form v-if="sign_==='in'">

            <h2>login</h2>

            <div class="ui">
                <input type="email" v-model="auth.email"/>
                <label>Email</label>
            </div>

            <div class="ui">
                <input type="password" v-model="auth.pass"/>
                <label>Password</label>
            </div>

            <div class="ui">
                <button type="submit" v-on:click="signin($event)">Sign in</button>
            </div>

            <div class="ui links">
                <router-link to="/sign/up">new pilot</router-link>
                <router-link to="/sign/reset">reset password</router-link>
            </div>
        </form>


        <form v-if="sign_==='up'">
            <h2>create new cmdr</h2>

            <div class="ui">
                <input type="email" v-model="auth.email"/>
                <label>Email</label>
            </div>
            <div class="ui">
                <input type="password" v-model="auth.pass"/>
                <label>Password</label>
            </div>
            <div class="ui">
                <input type="password" v-model="pass_c"/>
                <label>Confirm password</label>
            </div>
            <div class="ui">
                <button type="submit" v-on:click="signup($event)">Register</button>
            </div>

            <div class="ui links">
                <router-link to="/sign/in">back to login</router-link>
            </div>
        </form>


        <form v-if="sign_ === 'reset'">

            <h2>reset password</h2>

            <div v-if="secret">

                <div class="ui">
                    <input type="password" v-model="reset.new_pass"/>
                    <label>new password</label>
                </div>

                <div class="ui">
                    <input type="password" v-model="reset.new_pass_c"/>
                    <label>confirm new password</label>
                </div>

                <div class="ui">
                    <button type="submit" v-on:click="reset_pass($event)">use new password</button>
                </div>

            </div>

            <div v-if="!secret">
                <div class="ui" v-if="!reset.result">
                    <input type="email" v-model="auth.email"/>
                    <label>account email</label>
                </div>

                <div class="ui" v-if="!reset.result">
                    <button type="submit" v-on:click="request_reset($event)">send me a link</button>
                </div>

                <div class="ui links">
                    <router-link to="/sign">back to login</router-link>
                </div>

            </div>
        </form>
        {{secret}}
    </div>
</template>

<script>
    import NET from '../ctrl/net';
    import {A} from '../components/alert';


    //TODO: add "logout" on home page with logout route;
    //TODO: make all routers redirect to home page if user logged in. (except /logout)


    export default {
        name: "auth",
        data: () => {
            return {
                NET: NET,
                auth: {email: '', pass: ''},
                sign_: 'in',
                secret: '',
                reset: {new_pass: '', new_pass_c: ''},
                pass_c: '',
            }
        },
        created: function () {
            this.init()
        },
        watch: {
            '$route': function (to, from) {
                this.init()
            }
        },
        methods: {

            init: function () {

                this.sign_ = this.$route.params.action || 'in';

                if (this.sign_ === 'out') {
                    this.signout();
                }

                if (this.$route.params.secret) {
                    this.secret = this.$route.params.secret;
                    this.$router.replace(`/sign/${this.$route.params.action}`);
                    return;
                }

                if (this.sign_ === 'verify') {
                    if (!this.secret) return this.$router.replace('/sign');
                    return NET.everify(this.secret)
                        .catch(e => e.response)
                        .then((response) => {
                            this.secret = '';
                            A.add(response);
                            this.$router.replace('/');
                            console.log('just interesting...', response)
                        });
                }

                if (NET.is_in === true) this.$router.replace('/');

            },

            request_reset: function (event) {
                if (event) event.preventDefault();
                NET.passrst_request(this.auth.email)
                    .catch((e) => e.response)
                    .then((response) => {
                        A.add(response, true);
                        this.$router.replace('/sign');
                    })

            },

            reset_pass: function (event) {
                if (event) event.preventDefault();
                if (this.reset.new_pass !== this.reset.new_pass_c)
                    return A.error({text: 'password and confirmation are not equal'}, true);

                NET.passrst(this.secret, this.reset.new_pass)
                    .then((response) => {
                        A.add(response, true);
                        this.secret = '';
                        this.$router.push('/');
                    })
                    .catch((e) => {
                        if (e.response.type === 'error') {
                            this.secret = '';
                            A.error({text: e.response.text});
                            return this.$router.push('/sign/reset');
                        }
                        A.add(e.response, true);
                    })
            },

            signup: function (event) {
                if (event) event.preventDefault();
                if (this.auth.pass !== this.pass_c)
                    return A.error({text: 'password/confirm are not equal'}, true);

                NET.signup(this.auth.email, this.auth.pass)
                    .then(response => {
                        this.auth.pass = '';
                        this.$router.replace('/');
                    })
                    .catch(e => A.add(e.response, true));
            },

            signin: function (event) {
                if (event) event.preventDefault();
                NET.signin({email: this.auth.email, pass: this.auth.pass})
                    .then((response => {
                        this.auth.pass = '';
                        this.$router.replace('/');
                    }))
                    .catch(e => A.add(e.response, true));
            },

            signout(event) {
                if (event) event.preventDefault();
                NET.signout();
                this.$router.replace('/')
            }
        }
    }

</script>

<style lang="scss">

</style>
