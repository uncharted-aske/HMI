<template>
  <card @click="onCardClick">
    <div
      class="recent-card"
    >
        <div
          v-if="hasImage"
          :class="['preview-img', hasImage ? '' : 'no-image']"
          :style="imageStyle"
          :title="'Preview of ' + title"
        />
        <h5 class="title">{{ title }}</h5>
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
    @Prop({ default: '' }) previewImageSrc: string;

    @Prop({ default: 'Card title' }) title: string;

    @Prop({ default: 'Card subtitle' }) subtitle: string;

    @Prop({ default: 'faExclamationTriangle' }) icon: string;

    get hasImage (): boolean {
      return this.previewImageSrc !== '';
    }

    get iconType (): string {
      return this.icon === 'computational' ? 'chart-line' : 'book';
    }

    get imageStyle (): any {
      return {backgroundImage: this.hasImage ? `url(${this.previewImageSrc})` : 'none'};
    }

    onCardClick (): void {
      this.$emit('click');
    }
  }
</script>
<style lang="scss" scoped>
@import '@/styles/variables';

  .card-container {
    min-width: 233px;
    width: 350px;
    padding: 8px;
    max-height: 30vh;
    min-height: 300px;
  }

  * {
    margin: 0;
  }

  .recent-card {
    display: flex;
    flex-direction: column;
    height: 100%;

    .preview-img {
      width: 100%;
      height: 0;
      padding-top: 56%;
      background-size: cover;
      background-repeat: no-repeat;
      background-position: center;
      background-color: #EAEBEC;
    }

    .title {
      max-height: 26%;
      overflow-y: hidden;
      margin-bottom: 10px;
    }

    .subtitle {
      flex: 1;
      font-size: 12px;
      color: #6c757d;
      font-weight: normal;
      min-height: 0;
      overflow-x: hidden;
      overflow-y: scroll;

      -ms-overflow-style: none;  /* IE and Edge */
      scrollbar-width: none;  /* Firefox */
    }

    .subtitle::-webkit-scrollbar {
      display: none;
    }

    .icon {
      position: absolute;
      right: 8px;
      bottom: 8px;
      color: $icon-color;
    }

  }
</style>
