<template>
  <div v-if="needsSignIn" class="main-view">
    <header class="main-header">
      <a class="brand" href="https://anyshortcut.com" target="_blank">
        <img class="brand-logo" alt="logo" src="../img/logo.svg" />
      </a>
      <router-link :to="{ name: 'preference' }" class="menu">Settings</router-link>
    </header>
    <div class="sign-in-view">
      <p>Cloud mode keeps your shortcuts on your Anyshortcut account.</p>
      <a class="sign-in-button" :href="$background.signInUrl" target="_blank">Sign in</a>
      <p class="sign-in-hint">
        Already signed in? Reopen this popup. You can also switch to
        <router-link :to="{ name: 'preference' }">this browser only</router-link>
        in Settings.
      </p>
    </div>
  </div>
  <div v-else-if="$background.isActiveTabUrlSupported()" class="main-view">
    <header class="main-header">
      <a class="brand" href="https://anyshortcut.com" target="_blank">
        <img class="brand-logo" alt="logo" src="../img/logo.svg" />
      </a>
      <router-link :to="{ name: 'preference' }" class="menu">Settings</router-link>
    </header>
    <shortcut-view v-if="domainShortcut" :domain-shortcut="domainShortcut"></shortcut-view>
    <bind-view v-else></bind-view>
    <div class="loading" v-show="loading"><i class="fa fa-spinner fa-spin fa-2x fa-fw"></i></div>
  </div>
  <div class="unsupported-view" v-else>
    <header class="main-header">
      <a class="brand" href="https://anyshortcut.com" target="_blank">
        <img class="brand-logo" alt="logo" src="../img/logo.svg" />
      </a>
      <router-link :to="{ name: 'preference' }" class="menu">Settings</router-link>
    </header>
    <p>
      For technical reasons, we currently do not support set shortcut or trigger shortcut on this
      page.
    </p>
  </div>
</template>
<style>
body {
  font-family: 'Poppins', sans-serif;
  font-weight: 400;
  font-size: 100%;
  color: var(--content-font-color);
  text-align: center;
  margin: 0 auto;
}

.main-view {
  display: flex;
  flex-direction: column;
  align-content: center;
  background: var(--content-bgcolor);
}

.main-header {
  background: var(--header-bgcolor);
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 5px;
  border-bottom: #eeeeee solid 1.3px;
  z-index: 1;
}

.menu {
  color: var(--menu-color);
  font-size: 12.5px;
  letter-spacing: 0.6px;
  margin: 0 5px;

  & a:visited,
  & a:active {
    color: var(--menu-color);
  }
}

.sign-in-view {
  width: 450px;
  padding: 20px;
  text-align: center;
  background: var(--content-bgcolor);

  & p {
    font-size: 14px;
    color: #515151;
    margin: 10px auto;
  }
}

.sign-in-button {
  display: inline-block;
  cursor: pointer;
  padding: 5px 25px;
  height: 28px;
  border-radius: 3px;
  font-size: 14px;
  box-shadow: var(--box-shadow-base);
  text-align: center;
  color: #ffffff;
  background: linear-gradient(var(--primary-color), #1882ef);

  &:hover {
    background: linear-gradient(var(--secondary-color), var(--primary-color));
  }
}

.sign-in-hint {
  font-size: 12px !important;
  color: #797979 !important;
}

.unsupported-view {
  width: 450px;
  height: 150px;
  display: flex;
  flex-direction: column;
  align-content: center;
  background: var(--content-bgcolor);

  & p {
    font-size: 16px;
    color: #515151;
    margin: auto 20px;
  }
}
</style>
<script lang="ts">
import { defineComponent } from 'vue';
import { cloneDeep, sortBy, forOwn } from 'lodash-es';
import common from '../common';
import ShortcutView from '../view/ShortcutView.vue';
import BindView from '../view/BindView.vue';
import type { BindShortcutEvent, Shortcut, UnbindShortcutEvent } from '../types';

export default defineComponent({
  name: 'MainView',
  data() {
    return {
      loading: false,
      domainShortcut: null as Shortcut | null,
    };
  },
  computed: {
    /** Cloud mode with no session: there is nothing to show until they sign in. */
    needsSignIn(): boolean {
      return this.$background.getMode() === 'cloud' && !this.$background.authenticated;
    },
  },
  methods: {
    queryShortcuts() {
      if (this.needsSignIn) return;
      let activeTab = this.$background.activeTab;
      let primaryShortcuts = sortBy(cloneDeep(this.$background.primaryShortcuts));

      let foundDomainShortcut: Shortcut | null = null;
      let foundActiveDomainShortcut: Shortcut | null = null;
      // Find both active domain shortcut and a regular domain shortcut.
      forOwn(primaryShortcuts, (shortcut) => {
        if (!foundDomainShortcut && common.isUrlEndsWithDomain(activeTab.url, shortcut.domain)) {
          foundDomainShortcut = shortcut;
          // return false to exit the for iterate after find the result.
        }

        if (common.isUrlEquivalent(activeTab.url, shortcut.url)) {
          foundActiveDomainShortcut = shortcut;
        }

        if (foundActiveDomainShortcut && foundDomainShortcut) {
          return false;
        }
      });
      // The active domain shortcut has higher priority than a regular domain shortcut.
      this.domainShortcut = foundActiveDomainShortcut || foundDomainShortcut;

      // Notify children component refresh in next ticket
      this.$nextTick(() => {
        this.$bus.emit('refresh');
      });
    },
    bindShortcut: function ({ primary, keyChar, comment }: BindShortcutEvent) {
      let bindFunction;
      if (primary) {
        bindFunction = this.$background.bindPrimaryShortcut;
      } else {
        bindFunction = this.$background.bindSecondaryShortcut;
      }

      this.loading = true;
      bindFunction(keyChar, comment)
        .then(() => {
          this.queryShortcuts();
          this.loading = false;

          this.$toast.success('Great job! you have bound a shortcut for this url!');
        })
        .catch((error) => {
          this.loading = false;
          this.$toast.error(error.message);
        });
    },
    unbindShortcut: function ({ shortcut, including }: UnbindShortcutEvent) {
      if (shortcut) {
        this.loading = true;

        let unbindPromise: Promise<unknown> | null = null;
        if (shortcut.primary) {
          unbindPromise = this.$background.removePrimaryShortcut(shortcut, including);
        } else {
          unbindPromise = this.$background.removeSecondaryShortcut(shortcut);
        }

        unbindPromise
          .then(() => {
            this.queryShortcuts();
            this.loading = false;
            this.$toast.success('Delete Success!');
          })
          .catch((error) => {
            this.loading = false;
            this.$toast.error(error.message);
          });
      }
    },
  },
  components: {
    ShortcutView,
    BindView,
  },
  created: function () {
    this.queryShortcuts();
  },
  mounted() {
    this.$bus.on('bind-shortcut', this.bindShortcut);
    this.$bus.on('unbind-shortcut', this.unbindShortcut);
  },
  unmounted() {
    this.$bus.off('bind-shortcut', this.bindShortcut);
    this.$bus.off('unbind-shortcut', this.unbindShortcut);
  },
});
</script>
