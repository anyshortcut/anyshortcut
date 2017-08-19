<template>
    <div class="shortcut-profile">
      <span class="shortcut">
          {{combinationKey}}+{{shortcut.key}}
      </span>
        <div class="linker">⟺</div>
        <div class="profile-shortcut-comment"
             :title="shortcut.title">
            <img class="shortcut-favicon"
                 :src="shortcut.favicon"
                 alt="favicon"/>
            {{shortcut.comment}}
        </div>
    </div>
</template>
<style lang="less">
    .shortcut-profile {
        display: flex;
        align-items: center;
        justify-content: center;
        color: #666;

        .linker {
            margin: 0 15px;
            font-size: 18px;
        }

        .profile-shortcut-comment {
            font-weight: 500;
            color: #333333;
            font-size: 16px;
            margin: 5px;
        }

    }

</style>
<script type="es6">
    export default {
        name: "ShortcutProfile",
        data() {
            return {};
        },
        props: {
            shortcut: {
                type: Object,
                default: function() {
                    return null;
                }
            }
        },
        computed: {
            combinationKey: function() {
                return this.shortcut.primary ? "SHIFT+ALT" : "ALT"
            }
        }
    }
</script>