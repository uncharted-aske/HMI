<template>
  <section class="simulation-parameters-container">
    <ul>
      <li v-for="(parameter, index) of parameters" :key="index">
        {{ parameter.name }}
      </li>
    </ul>
  </section>
</template>

<script lang="ts">
  import Vue from 'vue';
  import Component from 'vue-class-component';
  import { Prop } from 'vue-property-decorator';
  import { DonuModelParameter } from '@/types/typesDonu';

  @Component
  export default class SimulationParameters extends Vue {
    @Prop({ default: [] }) parameters: DonuModelParameter[];
  }
</script>

<style lang="scss" scoped>
  .simulation-parameters-container {
    min-width: 10em;
  }

  li {
    color: white;
    font-weight: bold;
  }
</style>
