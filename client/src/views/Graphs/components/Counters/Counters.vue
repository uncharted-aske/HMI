<template>
  <div class="counters-container">
    <div class="title" v-if="title">
    {{title}}
    </div>
    <div v-for="(label, index) in labels" :key="label">
      {{values[index]}} {{label}}
    </div>
  </div>
</template>

<script lang="ts">
  import Vue from 'vue';
  import Component from 'vue-class-component';
  import { Prop } from 'vue-property-decorator';

  @Component
  export default class Counters extends Vue {
    @Prop({ default: '' })
    title: string;

    @Prop({ default: () => ([]) })
    labels: Array<string>;

    @Prop({ default: () => ([]) })
    values: Array<number>;
  }
</script>

<style lang="scss" scoped>
@import "@/styles/variables";

.counters-container {
  height: calc(#{$secondary-bar-width} - 15px);
  display: flex;
  align-items: center;

  div:first-child {
    margin-right: 5px;
  }
  div:not(:first-child)::before {
    content: "|";
    margin: 5px;
  }
  .title {
    font-weight: bold;
  }

}

</style>
