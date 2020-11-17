<template>
  <div class="start-screen-container">
    <div class="start-screen">
      <h4 class="section-header">{{ openSectionHeader }}</h4>
      <div class="card-list">
        <start-screen-card
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
  </div>
</template>

<script lang="ts">
  import Vue from 'vue';
  import Component from 'vue-class-component';
  import { Prop } from 'vue-property-decorator';

  import { CardInterface } from '../../types/types';

  import StartScreenCard from './components/StartScreenCard/StartScreenCard.vue';

  const components = {
    StartScreenCard,
  };

  @Component({ components })
  export default class StartScreen extends Vue {
    @Prop({ default: 'Open' }) openSectionHeader: string;

    @Prop({ default: [] }) cards: CardInterface[];

    onOpen (card: CardInterface): void {
      this.$emit('open-card', card);
    }
  }
</script>

<style lang="scss">
@import "../../../../styles/variables";

.start-screen-container {
  height: calc(#{$content-full-height} - #{$secondary-bar-width});
  display: flex;
  overflow: hidden;

  .start-screen {
    // Use 22px instead of 32px to account for cards' 10px horizontal margin
    padding: 16px 22px 16px 22px;
    overflow-y: auto;

    .section-header {
      // Match cards' 10px horizontal margin
      margin-left: 10px;
    }

    .card-list {
      display: flex;
      flex-wrap: wrap;
      .card-container {
        margin: 0 10px 20px 10px;
      }
    }
  }

  .section-header {
    font-weight: normal;
    margin: 0 0 8px 0;
  }
}
</style>
