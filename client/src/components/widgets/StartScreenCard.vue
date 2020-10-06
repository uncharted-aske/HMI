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

    get hasImage (): boolean {
      return !_.isNil(this.previewImageSrc);
    }

    onCardClick (): void {
      this.$emit('click');
    }
  }
</script>
<style lang="scss" scoped>

  .card-container {
    height: 233px;
    min-width: 233px;
    width: calc(25vw - (2 * 32px));
    padding: 8px;
  }

  * {
    margin: 0;
  }

  .centered {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    h4 {
      text-align: center;
    }

    .card-icon {
      font-size: 64px;
      color: #255DCC;
      transition: all 0.15s;
    }
  }

  .card-container:hover .card-icon {
    color: lighten(#255DCC, 10%);
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

    .menu {
      position: absolute;
      right: 4px;
      bottom: 4px;
    }

  }
</style>
