<template>
  <div class="card-container">
    <h4 v-if="header" class="section-header">{{ header }}</h4>
    <div class="card-list">
      <card
        v-for="(card, index) in cards"
        :id="index"
        :key="index"
        :preview-image-src="card.previewImageSrc"
        :title="card.title"
        :subtitle="card.subtitle"
        :icon="card.type"
        :checked="card.checked"
        :highlighted="card.highlighted"
        @click.native="onClick(card)"
      />
    </div>
  </div>
</template>

<script lang="ts">
  import Vue from 'vue';
  import Component from 'vue-class-component';
  import { Prop } from 'vue-property-decorator';

  import Card from '@/components/Cards/Card.vue';
  import { CardInterface } from '@/types/types';

  const components = {
    Card,
  };

  @Component({ components })
  export default class CardContainer extends Vue {
    @Prop({ default: null }) header: string;
    @Prop({ default: () => [] }) cards: CardInterface[];

    onClick (card: CardInterface): void {
      this.$emit('click-card', card);
    }
  }
</script>

<style scoped>
.card-container {
  background-color: var(--bg-primary);
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow-x: hidden;
  overflow-y: auto;

  /* Use 22px instead of 32px to account for cards' 10px horizontal margin */
  padding: 16px 22px 16px 22px;
}

.section-header {
  color: var(--text-color-light);
  font-weight: normal;

  /* Match cards' 10px horizontal margin */
  margin-left: 10px;
}

.card-list {
  display: flex;
  flex-wrap: wrap;
}

.card-list .card {
  margin: 0 10px 20px 10px;
}
</style>
