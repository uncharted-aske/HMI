<template>
  <div id="app">
<!--    <img alt="Vue logo" src="./assets/logo.png">-->
    <HelloWorld msg="Welcome to Your Vue.js App"/>
    <JSComponent/>
    <TSComponent/>
    <TSClassComponent/>
  </div>
</template>

<script>
  import HelloWorld from './components/HelloWorld.vue';
  import JSComponent from './components/JSComponent.vue';
  import TSComponent from './components/TSComponent.vue';
  import TSClassComponent from './components/TSClassComponent.vue';

  export default {
    name: 'App',
    components: {
      HelloWorld,
      JSComponent,
      TSComponent,
      TSClassComponent,
    },
  };
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
