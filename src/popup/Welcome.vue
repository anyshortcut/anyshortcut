<template>
  <main>
    <div class="anyshortcut">
      <img class="brand-logo" alt="logo" src="../img/logo.svg" />
      <h2>AnyShortcut</h2>
    </div>
    <img class="balloon-image" src="../img/computer-and-balloons.svg" alt="" />
    <div class="subtitle introduction">
      Welcome to AnyShortcut! Start creating keyboard shortcuts to boost your productivity.
    </div>
    <div class="btn-get-started" @click="getStarted">Get Started</div>
    <div class="features">
      <h3>Features:</h3>
      <ul>
        <li>Create custom keyboard shortcuts for any website</li>
        <li>Works completely offline - no account required</li>
        <li>Data stored locally in your browser</li>
        <li>Support for primary and secondary shortcuts</li>
      </ul>
    </div>
  </main>
</template>
<style lang="scss">
@import '../scss/common';

main {
  line-height: 2em;
  width: 400px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.anyshortcut {
  @extend .brand;
  font-size: 18px;
  position: relative;
  top: 0;
  left: 0;
  padding: 8px;
  align-self: flex-start;
}

.balloon-image {
  margin: 20px;
}

.introduction {
  margin: 30px 30px 20px;
}

a:focus {
  text-decoration: none;
  outline: none;
}

.btn-get-started {
  padding: 12px 25px;
  letter-spacing: 0.1em;
  background: #1882ef;
  color: white;
  border: none;
  width: 70%;
  border-radius: 4px;
  margin: auto;
  text-transform: none;
  font-size: 15px;
  text-shadow: none;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  font-weight: 500;

  &:hover {
    background: #1670d1;
  }
}

.features {
  margin-top: 30px;
  text-align: left;
  width: 80%;

  h3 {
    margin-bottom: 10px;
    color: #1882ef;
  }

  ul {
    list-style: none;
    padding: 0;

    li {
      padding: 5px 0;
      font-size: 14px;
      color: #666;

      &:before {
        content: '✓ ';
        color: #1882ef;
        font-weight: bold;
      }
    }
  }
}
</style>
<script type="es6">
export default {
    name: 'welcome-view',
    methods: {
        getStarted() {
            // Navigate to main view
            this.$router.push({ name: 'main' });
        },
    }
}
</script>
