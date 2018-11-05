<template>
    <div class="tour-page">
        <div class="tour-illustration">
            <img v-if="currentStep===1"
                 class="step-cover half-width"
                 src="./img/computer-and-balloons.svg" alt="">
            <img v-else-if="currentStep===2"
                 class="step-cover full-width"
                 src="./assets/primary.gif" alt="">
            <img v-else-if="currentStep===3"
                 class="step-cover full-width"
                 src="./assets/secondary.gif" alt="">
            <img v-else-if="currentStep===4"
                 class="step-cover full-width"
                 src="./assets/compound.gif" alt="">
            <img v-else-if="currentStep===5"
                 class="step-cover full-width"
                 src="./assets/shortcut-circle.gif" alt="">
            <img v-else-if="currentStep===6"
                 class="step-cover half-width"
                 src="./img/4.svg" alt="">
        </div>

        <section v-if="currentStep===1">
            <div class="title">
                Welcome to Anyshortcut!
            </div>

            <p>
                Sign in with google to create an account so we can safely store your shortcuts and sync everywhere.
            </p>

            <div class="btn-google-sign-in"
                 @click="openAuthPopupWindow">
                Sign in with Google
            </div>

            <small>By signing up, I agree to <a target="_blank" href="https://anyshortcut.com/terms">Terms of
                Service</a>
                and <a target="_blank" href="https://anyshortcut.com/privacy">Privacy Policy</a>.
            </small>
        </section>
        <template v-else>
            <section v-if="currentStep===2">
                <div class="title">Set a primary shortcut</div>
                <p>
                    Open the page you'd like to set a shortcut to and activate the extension popup. Hover your mouse
                    over any key on the on-screen keyboard, add a comment if you wish and click the <b>Bind</b> button.
                    No limitation for how many primary shortcuts are linking per domain ever.
                </p>
                <p>
                    In this example, we bound <span class="tour-shortcut">G</span> to Google
                    <small>(https://www.google.com)</small>
                    .
                </p>
                <p class="subtitle">
                    Try use <span class="tour-shortcut">ALT + G</span>
                    <span data-balloon="ALT is the default combination key for all shortcut. You can customize in Settings!"
                          data-balloon-pos="up">
                    <img src="./img/info-grey.svg" alt="info">
                </span>
                    to open Google instantly.
                </p>

                <div>
                    <div class="line-divider">or</div>
                    <div class="tour-button" @click="currentStep=3">Skip to next step ></div>
                </div>
            </section>

            <section v-else-if="currentStep===3">
                <div class="title">Let's active a secondary shortcut</div>
                <p>
                    You can set up a secondary shortcut to jump to a sub-section of a website.
                </p>
                <p>
                    For example, <span class="tour-shortcut">I</span> for Google Inbox,
                    <span class="tour-shortcut">D</span> for Google Driver,
                    <span class="tour-shortcut">T</span> for Google Translate, etc.
                </p>
                <p class="subtitle">
                    Try use <span class="tour-shortcut">ALT + G + I</span>
                    <span data-balloon="Here, 'G' represents the primary shortcut linked to Google"
                          data-balloon-pos="up">
                    <img src="./img/info-grey.svg" alt="info">
                </span> to open Google Inbox instantly.
                </p>

                <div>
                    <div class="line-divider">or</div>
                    <div class="tour-button" @click="currentStep=4">Skip to next step ></div>
                </div>

            </section>

            <section v-else-if="currentStep===4">
                <div class="title">Try out a compound shortcut</div>
                <p>
                    Primary shortcuts are useful, but limited to a handful of keys. Compound shortcuts offer greater
                    combinations of keys at your disposal to improve efficiency. Use them to access websites which you
                    visit less frequently, by pressing two keys at once.
                </p>

                <p>
                    For example, <span class="tour-shortcut">DB</span> for Dropbox
                    <small>(https://dropbox.com)</small>
                    , <span class="tour-shortcut">LD</span> for lodash documentation page
                    <small>(https://lodash.com)</small>
                    , or <span class="tour-shortcut">AW</span> for AWS Consosle
                    <small>(https://console.amazonaws.com)</small>
                    , etc.
                </p>

                <p>If you don't need it, feel free to disable it in <i>Popup -> Settings</i>.</p>

                <div>
                    <div class="line-divider"> or</div>
                    <div class="tour-button" @click="currentStep=5">Skip to next step ></div>
                </div>
            </section>

            <section v-else-if="currentStep===5">
                <div class="title">Shortcut circle</div>
                <p>
                    The shortcut circle is a list of your secondary shortcuts active for the domain you are on. You can
                    see this list by clicking on the small circle on the bottom-left corner of your screen.
                </p>

                <p><b>What can the shortcut circle do for you?</b></p>
                <ul>
                    <li>List all the secondary shortcuts linked to the domain for your reference</li>
                    <li>Allows you to press a specific key to jump/redirect to that page anywhere in that domain</li>
                </ul>

                <p>
                    You can customize shortcut circle showing behavior in <i>Popup -> Settings</i>.
                    Don't like it? Turn if off.
                </p>

                <div>
                    <div class="line-divider"> or</div>
                    <div class="tour-button" @click="currentStep=6">Skip to next step ></div>
                </div>

            </section>

            <section v-else-if="currentStep===6">
                <div class="title">Congratulations!</div>
                <p>
                    Here are some frequently visited websites that you can use Anyshortcut on!
                </p>
                <div style="position: relative;">
                    <ul :class="{disable:done}" class="default-shortcut-list">
                        <li v-for="shortcut in defaultShortcuts">
                            <div class="default-shortcut-list-item" @click="shortcut.active=!shortcut.active">
                                <div style="max-width: 40%;min-width: 40%;">
                                    <div style="display: flex;align-items: center;">
                                        <img class="default-shortcut-favicon" :src="shortcut.favicon" alt="">
                                        <span class="default-shortcut-name">{{ shortcut.comment }}</span>
                                    </div>

                                    <div class="default-shortcut-url">
                                        {{ shortcut.url }}
                                    </div>
                                </div>
                                link to
                                <div class="default-shortcut-key">
                                    ALT + {{ shortcut.key }}
                                </div>
                                <input type="checkbox" v-model="shortcut.active">
                            </div>
                        </li>
                    </ul>
                    <div v-if="done" class="default-shortcut-linked-success">
                        <img src="./img/success-blue.svg" alt="">
                        You have linked those websites!
                    </div>
                </div>

                <p v-if="done" style="margin: 30px 0;">
                    We believe Anyshortcut can boost your productivity, you will enjoy it!
                </p>
                <div class="tour-button" style="margin: 30px 0;"
                     @click="bindDefaultShortcuts" v-else>
                    Link these shortcuts!
                </div>
            </section>
        </template>
        <ul class="step-indicator">
            <li v-for="step in 6">
                <div class="step-indicator-item"
                     :class="{'step-indicator-current':currentStep===step}"
                     @click="onStepItemClick(step)">
                </div>
            </li>
        </ul>
    </div>
</template>

<script>
    import common from "./js/common.js";
    import client from "./js/client.js";
    import config from "./js/config.js";
    import monitor from './js/script/key-event-monitor.js';


    let $background = chrome.extension.getBackgroundPage();
    window.delay = true;

    export default {
        name: "Tour",
        data() {
            return {
                currentStep: 1,
                defaultShortcuts: [],
                done: false,
            }
        },
        methods: {
            openAuthPopupWindow() {
                common.openPopupWindow(config.googleAuthURL);
            },
            onStepItemClick(step) {
                if ($background.authenticated && step > 1) {
                    this.currentStep = step;
                }
            },
            bindDefaultShortcuts() {
                let keys = "";
                this.defaultShortcuts.forEach(shortcut => {
                    if (shortcut.active) {
                        keys += shortcut.key;
                    }
                });

                client.bindDefaultShortcuts(keys).then(data => {
                    $background.syncAllShortcuts();
                    // Disable default shortcut list
                    this.done = true;
                });
            },
            /**
             * Initialize to determine which step current tour should be.
             */
            initialize() {
                this.currentStep = 2;

                client.getDefaultShortcuts().then(data => {
                    this.defaultShortcuts = data;
                });

                if (this.currentStep === 2) {
                    document.addEventListener('keyup', monitor.onKeyUp, false);
                    document.addEventListener('keydown', monitor.onKeyDown, false);
                }
            }
        },
        mounted() {
            if ($background.authenticated) {
                this.initialize();
            }

            window.addEventListener('storage', event => {
                // A storage event fired because of localStorage value changed.
                // Here we can detect user info has synced success.
                if (this.currentStep === 1 && event.storageArea['user']) {
                    this.initialize();
                }
            });

            chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
                if (message.authenticated) {
                    this.initialize();
                }
            });
        },
    }
</script>