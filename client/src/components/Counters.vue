<template>
  <div class="counters-container">
    <div class="title" v-if="title">
    {{title}}
    </div>
    <div v-for="(counter, idx) in processedData" :key="counter" :class="[(idx === 2 || idx === 3) ? 'highlights' : (idx !== 2 || idx !== 3), '']">
      {{counter}}
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

    @Prop({ default: () => [] })
    data: Array<string>;

    get processedData () : any {
      return this.data.reduce((acc: string[], val: string) => {
        if (val) {
          acc.push(val);
        }
        return acc;
      }, []);
    }
  }
</script>

<style lang="scss" scoped>
@import "@/styles/variables";

.counters-container {
  height: calc(#{$secondary-bar-width} - 15px);
  display: flex;
  align-items: center;
  color: $text-color-light;

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

.highlights {
  color: $text-color-highlight;
}

</style>
