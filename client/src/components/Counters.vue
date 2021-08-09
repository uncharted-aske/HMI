<template>
  <div class="counters-container">
    <span class="title" v-if="title">{{ title }}</span>
    <span v-for="(counter, index) in processedData" :key="index" :class="{ 'highlighted': data[index].highlighted, '': !data[index].highlighted }">{{ counter }}</span>
  </div>
</template>

<script lang="ts">
  import Vue from 'vue';
  import Component from 'vue-class-component';
  import { Prop } from 'vue-property-decorator';
  import { shorterNb } from '@/utils/NumberUtil';
  import { Counter } from '@/types/types';

  @Component
  export default class Counters extends Vue {
    @Prop({ default: '' })
    title: string;

    @Prop({ default: () => [] })
    data: Array<Counter>;

    get processedData () : string[] {
      return this.data.reduce((acc: string[], counter: Counter) => {
        const value = counter.value != null ? shorterNb(Number(counter.value)) : NaN;
        if (Number.isNaN(value)) {
          acc.push(counter.name);
        } else if (counter.inverse) {
          acc.push(counter.name + ' ' + value);
        } else {
          acc.push(value + ' ' + counter.name);
        }

        return acc;
      }, []);
    }
  }
</script>

<style scoped>
.counters-container {
  align-items: center;
  color: var(--text-color-light);
  display: flex;
  flex-wrap: wrap;
  height: 100%;
  padding: 0 5px;
}

.counters-container * {
  margin-right: 5px;
}

.counters-container *:not(:first-child)::before {
  content: "|";
  margin: 0 5px;
}

.title {
  font-weight: bold;
}

.highlighted {
  color: var(--text-color-highlight);
}
</style>
