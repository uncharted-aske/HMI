<template>
  <div class="start-screen-container">
    <div class="recent">
      <h4 class="section-header">{{ openSectionHeader }}</h4>
      <div class="recent-card-list">
        <start-screen-card
          v-for="(recentCard, i) in recentCards"
          :key="i"
          :preview-image-src="recentCard.previewImageSrc"
          :title="recentCard.title"
          :subtitle="recentCard.subtitle"
          :icon="recentCard.type"
          @click="onOpenRecent(recentCard)"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import Vue from 'vue';
  import Component from 'vue-class-component';
  import { Prop } from 'vue-property-decorator';

  import StartScreenCard from '@/components/widgets/StartScreenCard.vue';

  const components = {
    StartScreenCard,
  };

  @Component({ components })
  export default class StartScreen extends Vue {
    @Prop({ default: 'Open' })
    openSectionHeader: string;

    @Prop({ default: [] })
    recentCards: Record<string, unknown>;

    onOpenRecent (recentCard: Record<string, unknown>): void {
      this.$emit('open-recent', recentCard);
    }
  }
</script>

<style lang="scss">
@import "../styles/variables";

.start-screen-container {
  width: 100%;
  height: calc(#{$content-full-height} - #{$secondary-bar-width});
  display: flex;
  overflow: hidden;

  .recent {
    flex: 1;
    // Use 22px instead of 32px to account for cards' 10px horizontal margin
    padding: 16px 22px 16px 22px;
    overflow-y: auto;

    .section-header {
      // Match cards' 10px horizontal margin
      margin-left: 10px;
    }

    .recent-card-list {
      width: 100%;
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
