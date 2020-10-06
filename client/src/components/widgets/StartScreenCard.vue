<template>
  <card @click="onCardClick">
    <div
      class="recent-card"
    >
      <div
        class="preview"
        :class="{ 'no-image': !hasImage }"
      >
        <img
          v-if="hasImage"
          :src="previewImageSrc"
          :alt="'Preview of ' + title"
        >
      </div>
      <h5>{{ title }}</h5>
      <h6 class="subtitle">{{ subtitle }}</h6>
      <div class="icon">
        <font-awesome-icon :icon="['fas', iconType]" />
      </div>  
    </div>
  </card>
</template>

<script lang="ts">
  import _ from 'lodash';
  import Component from 'vue-class-component';
  import Vue from 'vue';
  import { Prop } from 'vue-property-decorator';

  import Card from '@/components/widgets/Card.vue';

  const components = {
    Card,
  };

  @Component({ components })
  export default class StartScreenCard extends Vue {
    @Prop({ default: '' })
    previewImageSrc: string;

     @Prop({ default: 'Card title' })
    title: string;

    @Prop({ default: 'Card subtitle' })
    subtitle: string;

    @Prop({ default: 'faExclamationTriangle' })
    icon: string;

    get hasImage (): boolean {
      return !_.isNil(this.previewImageSrc);
    }

    get iconType (): string {
      return this.icon === 'computational' ? 'chart-line' : 'book';
    }

    onCardClick (): void {
      this.$emit('click');
    }
  }
</script>
<style lang="scss" scoped>
@import '../../styles/variables';

  .card-container {
    height: 233px;
    min-width: 233px;
    width: calc(25vw - (2 * 32px));
    padding: 8px;
  }

  * {
    margin: 0;
  }

  .recent-card {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;

    .preview {
      flex: 1 1 0;
      width: 100%;
      margin-bottom: 8px;
      // Allow flex item to be smaller than it's children
      //  (in case child image is too big)
      min-height: 0;

      img {
        // Clip images that are too big, but maintain aspect ratio
        object-fit: cover;
        width: 100%;
        height: 100%
      }

      &.no-image {
        // Fallback value; previews should always be provided an image
        background: #EAEBEC;
      }
    }

    .subtitle {
      font-size: 12px;
      color: #6c757d;
      font-weight: normal;
    }

    .icon {
      position: absolute;
      right: 8px;
      bottom: 8px;
      color: $icon-color;
    }

  }
</style>
