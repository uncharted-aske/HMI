<template>
  <div ref="counterContainer" class="counters-container">
    <span class="title" v-if="title">{{ title }}</span>
    <span v-for="(counter, index) in processedData" :key="index">{{ counter }}</span>
  </div>
</template>

<script lang="ts">
  import Vue from 'vue';
  import Component from 'vue-class-component';
  import { Prop } from 'vue-property-decorator';
  import { shorterNb } from '@/utils/NumberUtil';

  @Component
  export default class Counters extends Vue {
    @Prop({ default: '' })
    title: string;

    @Prop({ default: () => [] })
    data: Array<string>;

    get processedData () : string[] {
      return this.data.reduce((acc: string[], val: string) => {
        if (val) {
          const info = val.split(' ');
          const value = shorterNb(Number(info[0] ?? 0));
          const name = info[1] ?? '';
          acc.push(`${value} ${name}`);
        }
        return acc;
      }, []);
    }
  }
</script>

<style lang="scss" scoped>
@import "@/styles/variables";

.counters-container {
  align-items: center;
  color: $text-color-light;
  display: flex;
  flex-wrap: wrap;
  height: 100%;

  > * {
    margin-right: 5px;
  }

  > *:not(:first-child)::before {
    content: "|";
    margin: 0 5px;
  }
}

.title {
  font-weight: bold;
}
</style>
