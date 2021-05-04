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
      <grafer class="grafer" layer="epi" />
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

  import Grafer from '../components/Graphs/Grafer.vue';

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
.view-container {
  flex-direction: column;
}
</style>
