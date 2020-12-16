<template>
  <div class="card-container">
    <h4 class="section-header">{{ header }}</h4>
    <div class="card-list">
      <card
        v-for="(card, i) in cards"
        :key="i"
        :preview-image-src="card.previewImageSrc"
        :title="card.title"
        :subtitle="card.subtitle"
        :icon="card.type"
        @click="onOpen(card)"
      />
    </div>
  </div>
</template>

<script lang="ts">
  import Vue from 'vue';
  import Component from 'vue-class-component';
  import { Prop } from 'vue-property-decorator';

  import { CardInterface } from '@/views/Home/types/types';

  import Card from '@/components/Cards/Card.vue';

  const components = {
    Card,
  };

  @Component({ components })
  export default class CardContainer extends Vue {
    @Prop({ default: '' }) header: string;

    @Prop({ default: [] }) cards: CardInterface[];

    onOpen (card: CardInterface): void {
      this.$emit('open-card', card);
    }
  }
</script>

<style lang="scss">
@import "@/styles/variables";

.card-container {
  // TO DO: Find better way to calculate height for this component
  height: calc(#{$content-full-height} - #{$secondary-bar-width});
  display: flex;
  flex-direction: column;
  // Use 22px instead of 32px to account for cards' 10px horizontal margin
  padding: 16px 22px 16px 22px;
  overflow-x: hidden;
  overflow-y: auto;

  .section-header {
    // Match cards' 10px horizontal margin
    margin-left: 10px;
    font-weight: normal;
  }

  .card-list {
    display: flex;
    flex-wrap: wrap;
    padding-bottom:36px;
    .card {
      margin: 0 10px 20px 10px;
    }
  }
}
</style>
