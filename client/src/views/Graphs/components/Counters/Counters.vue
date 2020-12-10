<template>
  <div class="counters-container">
    <div class="name">
    {{modelName}}
    </div>
    <div>
    {{nodeCount}} Nodes
    </div>
    <div>
    {{edgeCount}} Links
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
    modelName: string;

    @Prop({ default: 0 })
    nodeCount: number;

    @Prop({ default: 0 })
    edgeCount: number;
  }
</script>

<style lang="scss" scoped>
@import "@/styles/variables";

.counters-container {
  height: 100%;
  display: flex;
  align-items: center;

  div:first-child {
    margin-right: 5px;
  }
  div:not(:first-child)::before {
    content: "|";
    margin: 5px;
  }
  .name {
    font-weight: bold;
  }

}

</style>
