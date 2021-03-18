<template>
  <div class="view-container">
    <div class="d-flex flex-column h-100">
      <div class="search-row">
        <search-bar :placeholder="`Search for documents including a specific keyword (e.g. IL-6)...`" />
      </div>
      <settings-bar>
        <div slot="right">
          <settings />
        </div>
      </settings-bar>
      <grafer class="grafer" model="wisconsin-knowledge" layer="epi" :back-edges="true"/>
    </div>
  </div>
</template>

<script lang="ts">
  import Component from 'vue-class-component';
  import Vue from 'vue';

  import SearchBar from '@/components/SearchBar.vue';

  import SettingsBar from '@/components/SettingsBar.vue';
  import Settings from '../components/Settings.vue';
  import Counters from '@/components/Counters.vue';

  import Grafer from '@/views/Models/Bio/components/Graphs/Grafer.vue';

  const components = {
    SearchBar,
    Settings,
    SettingsBar,
    Counters,
    Grafer,
  };

  @Component({ components })
  export default class DocsClusters extends Vue {
  }
</script>

<style lang="scss" scoped>
@import '@/styles/variables';

.loader-container {
  position: absolute;
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  pointer-events: none;
}

// https://github.com/lukehaas/css-loaders
.loader,
.loader:before,
.loader:after {
  background: $icon-color;
  -webkit-animation: load1 1s infinite ease-in-out;
  animation: load1 1s infinite ease-in-out;
  width: 1em;
  height: 4em;
}
.loader {
  color: $icon-color;
  text-indent: -9999em;
  margin: 88px auto;
  position: relative;
  font-size: 11px;
  -webkit-transform: translateZ(0);
  -ms-transform: translateZ(0);
  transform: translateZ(0);
  -webkit-animation-delay: -0.16s;
  animation-delay: -0.16s;
}
.loader:before,
.loader:after {
  position: absolute;
  top: 0;
  content: '';
}
.loader:before {
  left: -1.5em;
  -webkit-animation-delay: -0.32s;
  animation-delay: -0.32s;
}
.loader:after {
  left: 1.5em;
}
@-webkit-keyframes load1 {
  0%,
  80%,
  100% {
    box-shadow: 0 0;
    height: 4em;
  }
  40% {
    box-shadow: 0 -2em;
    height: 5em;
  }
}
@keyframes load1 {
  0%,
  80%,
  100% {
    box-shadow: 0 0;
    height: 4em;
  }
  40% {
    box-shadow: 0 -2em;
    height: 5em;
  }
}
</style>
