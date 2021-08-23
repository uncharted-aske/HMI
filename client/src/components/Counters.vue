<template>
  <div class="counters-container">
    <span class="title" v-if="title" v-html="title"></span>
    <span
      v-for="(counter, index) in data" :key="index"
      :class="{ 'highlighted': data.highlighted }">
      <template v-if="counter.inverse">
        {{ counter.name }}<span v-if="counter.value" v-html="numberAsHTML(counter.value)" />
      </template>
      <template v-else>
        <span v-if="counter.value" v-html="numberAsHTML(counter.value)" />{{ counter.name }}
      </template>
    </span>
  </div>
</template>

<script lang="ts">
  import Vue from 'vue';
  import Component from 'vue-class-component';
  import { Prop } from 'vue-property-decorator';
  import { scientificNotation } from '@/utils/NumberUtil';
  import { Counter } from '@/types/types';

  @Component
  export default class Counters extends Vue {
    @Prop({ default: '' })
    title: string;

    @Prop({ default: () => [] })
    data: Counter[];

    numberAsHTML (value: string | number): string {
      if (value != null) {
        return scientificNotation(Number(value), true);
      }
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
