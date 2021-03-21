<template>
    <div class="keyboard">
        <div class="keyboard-row">
            <div class="key slide-key invisible"></div>
            <div v-for="key in '1234567890'"
                 :class="keyClass(key)"
                 class="key"
                 :title="keyTitle(key)"
                 @click="onKeyClick($event,key)">
                <span>{{ key }}</span>
                <img :src="keyFavicon(key)" alt="" v-if="isKeyActive(key)">
            </div>
            <div class="key slide-key invisible"></div>
        </div>
        <div class="keyboard-row">
            <div class="key slide-key invisible"></div>
            <div v-for="key in 'QWERTYUIOP'"
                 :class="keyClass(key)"
                 class="key"
                 :title="keyTitle(key)"
                 @click="onKeyClick($event,key)">
                <span>{{ key }}</span>
                <img :src="keyFavicon(key)" alt="" v-if="isKeyActive(key)">
            </div>
            <div class="key slide-key invisible"></div>
        </div>
        <div class="keyboard-row">
            <div class="key slide-key extra-size-two invisible"></div>
            <div v-for="key in 'ASDFGHJKL'"
                 :class="keyClass(key)"
                 class="key"
                 :title="keyTitle(key)"
                 @click="onKeyClick($event,key)">
                <span>{{ key }}</span>
                <img :src="keyFavicon(key)" alt="" v-if="isKeyActive(key)">
            </div>
            <div class="key slide-key extra-size-two invisible">
            </div>
        </div>
        <div class="keyboard-row">
            <div class="key slide-key double-size lowercase invisible">
            </div>
            <div v-for="key in 'ZXCVBNM'"
                 :class="keyClass(key)"
                 class="key"
                 :title="keyTitle(key)"
                 @click="onKeyClick($event,key)">
                <span>{{ key }}</span>
                <img :src="keyFavicon(key)" alt="" v-if="isKeyActive(key)">
            </div>
            <div class="key slide-key invisible"></div>
            <div class="key slide-key double-size lowercase invisible">
            </div>
        </div>
    </div>
</template>
<style lang="scss" scoped>

    * {
        box-sizing: border-box;
    }

    .keyboard {
        display: inline-block;
        margin: 20px auto;
    }

    .keyboard-row {
        display: flex;
    }

    .key {
        font-family: "Poppins", sans-serif;
        position: relative;
        display: flex;
        flex-direction: column;
        text-align: center;
        height: 65px;
        width: 65px;
        margin: 8px;
        letter-spacing: 0.5px;
        color: rgba(24, 130, 239, .2);
        background: #ffffff;
        flex: 1;
        border-style: solid;
        border-width: 1px;
        border-color: rgba(24, 130, 239, .2);
        border-radius: 4px;
        text-transform: uppercase;
        font-size: 18px;
        white-space: nowrap;
        overflow: hidden;
        user-select: none;

        &.extra-size {
            flex: 1.25;
        }
        &.extra-size-two {
            flex: 1.625;
        }
        &.double-size {
            flex: 2.125;
        }

        &.lowercase {
            font-size: 11px;
            text-transform: lowercase;
        }

        &.lower-center {
            vertical-align: bottom;
        }

        &.space-bar {
            flex: 5.0;
        }

        &.slide-key {
            visibility: hidden;
            background-color: #f7f7f7;
            border: none;
            box-shadow: none;
            cursor: text;
        }

        &.highlight {
            background: #E9EDFB;
            color: #4F6EC8;
            font-weight: 500;
            box-shadow: none;
        }

        &.invisible {
            visibility: hidden;
        }

        &.active {
            color: rgb(24, 130, 239);
            border-color: rgb(24, 130, 239);
            cursor: pointer;
            font-weight: 500;

            &:hover {
                position: relative;
                top: 1px;
                left: 1px;
            }
        }

        & > span {
            margin: 0 10px;
            text-align: left;
        }

        & > img {
            width: 22px;
            height: 22px;
            margin-top: 5px;
            align-self: center;
        }

    }
</style>
<script>
    export default {
        name: "ShortcutKeyboard",
        props: {
            keyShortcuts: {
                type: Object,
                default() {
                    return null;
                }
            },
            highlightKey: {
                type: String,
            }
        },
        methods: {
            onKeyClick: function (event, key) {
                //What difference between e.currentTarget and e.target,
                // refer to http://jsfiddle.net/misteroneill/kmn4A/3/
                if (this.isKeyActive(key)) {
                    this.$bus.emit('shortcut-key-click', this.keyShortcuts[key]);
                }
            },
            isKeyActive(key) {
                return this.keyShortcuts && this.keyShortcuts.hasOwnProperty(key);
            },
            keyClass(key) {
                return {
                    'active': this.isKeyActive(key),
                };
            },
            keyFavicon(key) {
                let shortcut = this.keyShortcuts[key];
                return shortcut.favicon || '/static/img/image-unknown.png';
            },
            keyTitle(key) {
                if (this.isKeyActive(key)) {
                    return this.keyShortcuts[key].title;
                } else {
                    return '';
                }
            }
        }
    }
</script>