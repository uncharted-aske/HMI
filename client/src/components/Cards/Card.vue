<template>
  <div class="card" @click="onCardClick">
    <div
      v-if="hasImage"
      :class="['preview-img', hasImage ? '' : 'no-image']"
      :style="imageStyle"
      :title="'Preview of ' + title"
    />
    <div class="title-wrapper">
      <h5 class="title">{{ title }}</h5>
    </div>
    <h6 class="subtitle">{{ subtitle }}</h6>
    <div class="mt-2 d-flex justify-content-between align-items-center">
      <input :class="classCheckbox" type="checkbox" :checked="checked"/>
      <font-awesome-icon class="icon" :icon="['fas', iconType]"/>
    </div>
  </div>
</template>

<script lang="ts">
  import Component from 'vue-class-component';
  import Vue from 'vue';
  import { Prop } from 'vue-property-decorator';

  @Component({ })
  export default class Card extends Vue {
    @Prop({ default: '' }) previewImageSrc: string;

    @Prop({ default: '' }) title: string;

    @Prop({ default: '' }) subtitle: string;

    @Prop({ default: 'faExclamationTriangle' }) icon: string;

    @Prop({ }) checked: boolean | undefined;

    get classCheckbox (): string {
      return this.checked === undefined ? 'invisible' : 'visible';
    }

    get hasImage (): boolean {
      return this.previewImageSrc !== '';
    }

    get iconType (): string {
      return this.icon === 'computational' ? 'chart-line' : 'book';
    }

    get imageStyle (): any {
      let backgroundImage = 'none';
      if (this.hasImage) {
        let isBase64 = true;
        try {
          window.atob(this.previewImageSrc);
        } catch (e) {
          if (e.code === 5) {
            isBase64 = false;
          }
        }
        backgroundImage = isBase64 ? `url(data:image/gif;base64,${this.previewImageSrc})` : `url(${this.previewImageSrc})`;
      }

      return { backgroundImage };
    }

    onCardClick (): void {
      this.$emit('click');
    }
  }
</script>

<style lang="scss" scoped>
  @import '@/styles/variables';

  * {
    margin: 0;
  }

  .preview-img {
    width: 100%;
    height: 0;
    padding-top: 56%;
    margin-bottom: 10px;
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
    background-color: #EAEBEC;
  }

  .title {
    max-height: 50px;
    overflow-y: hidden;
  }

  .subtitle {
    flex: 1;
    font-size: 12px;
    color: #6c757d;
    background-color: white;
    font-weight: normal;
    min-height: 0;
    overflow-x: hidden;
    overflow-y: scroll;
    margin-top: 10px;

    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
  }

  .subtitle::-webkit-scrollbar {
    display: none;
  }

  .icon {
    color: $icon-color;
  }

  .card {
    min-width: 233px;
    width: 350px;
    padding: 8px;
    max-height: 40vh;
    min-height: 300px;

    background-color: white;
    position: relative;
    border-radius: 3px;
    transition: all 0.15s;
    transform: none;
    display: flex;
    flex-direction: column;

    /*
      Animating the opacity on a pseudo element drop-shadow
      is more performant than animating the colour of a box-shadow
      property directly.
    */
    &::after {
      content: '';
      position: absolute;
      opacity: .66;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2);
      transition: all 0.15s;
      border-radius: 3px;
      pointer-events: none;
    }

    &:hover {
      cursor: pointer;
      transform: translateY(-2px);

      &::after {
        opacity: 1;
      }
    }
  }
</style>
