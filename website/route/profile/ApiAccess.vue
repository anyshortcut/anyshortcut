<template>
    <div class="api-access-router">
        <div class="pipe-title subtitle">
            Access token
        </div>
        <p>
            If you want to use anyshortcut in other scenario, please use the following token
            for authentication.
        </p>
        <div class="access-token">
            <div style="font-weight: 600;">
                {{ $info.user.access_token.trim() }}
            </div>
            <div class="access-token-generate">
                Generated at: {{ $info.user.access_token_generated_at | datetime }}
            </div>
        </div>
        <div class="button is-primary"
             @click="revokeAccessToken">
            Revoke access token
        </div>

        <div class="pipe-title subtitle" style="margin-top: 50px">
            Those scenarios need the access token
        </div>
        <div class="content">
            <ul>
                <li>

                    <a href="https://github.com/anyshortcut/anyshortcut-cli"
                       target="_blank"
                       title="anyshortcut-cli">
                        Anyshortcut command line interface
                    </a>
                </li>
                <li>

                    <a href="https://github.com/anyshortcut/anyshortcut.workflow"
                       target="_blank"
                       title="anyshortcut-workflow">
                        Anyshortcut for Alfred Workflow
                    </a>
                </li>
            </ul>
        </div>
    </div>

</template>

<script>
    import client from "@/js/client.js";

    export default {
        name: "ApiAccess",
        methods: {
            revokeAccessToken() {
                client.revokeAccessToken().then(data => {
                    this.$info.user.access_token = data.access_token;
                    this.$info.user.access_token_generated_at = data.access_token_generated_at;
                }).catch(error => {
                    console.log(error);
                });
            }
        }
    }
</script>

<style scoped>
    .api-access-router {
        padding-top: 30px;
    }

    .access-token {
        background-color: whitesmoke;
        color: #4a4a4a;
        font-size: 0.875em;
        overflow-x: auto;
        white-space: pre;
        word-wrap: normal;

        margin: 20px 0;
        position: relative;
        align-items: center;
        display: flex;
        justify-content: space-between;
    }

    .access-token-generate {
        padding: 0 15px;
    }

</style>