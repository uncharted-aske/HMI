<template>
  <div :class="['card', { checked: checked }, { highlight: isHighlighted }]">
    <div
      v-if="hasImage"
      :class="['preview-img', hasImage ? '' : 'no-image']"
      :style="imageStyle"
      :title="'Preview of ' + title"
    />
    <div class="title-wrapper">
      <h5 class="title">{{ title }}</h5>
    </div>
    <h6 class="subtitle hide-scrollbar">{{ subtitle }}</h6>
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

    @Prop({ default: undefined }) checked: boolean;

    @Prop({ default: false }) highlighted: boolean;

    get classCheckbox (): string {
      return this.checked === undefined ? 'invisible' : 'visible';
    }

    get hasImage (): boolean {
      return this.previewImageSrc && this.previewImageSrc !== '';
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

    get isHighlighted (): boolean {
      return this.highlighted || Boolean(this.checked);
    }
  }
</script>

<style scoped>
  * {
    margin: 0;
  }

  .preview-img {
    background-color: #EAEBEC;
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
    margin-bottom: 10px;
    height: 0;
    padding-top: 56%;
    width: 100%;
  }

  .title {
    max-height: 50px;
    overflow-y: hidden;
  }

  .subtitle {
    background-color: var(--bg-body);
    color: var(--text-color-light);
    flex: 1;
    font-size: 12px;
    font-weight: normal;
    margin-top: 10px;
    min-height: 0;
    overflow-x: hidden;
    overflow-y: scroll;
  }

  .icon {
    color: var(--icon-color);
  }

  .card {
    max-height: 40vh;
    min-height: 300px;
    min-width: 233px;
    padding: 8px;
    width: 350px;

    background-color: var(--bg-body);
    border: transparent solid 2px;
    border-radius: 3px;
    color: var(--text-color-light);
    display: flex;
    flex-direction: column;
    position: relative;
    transform: none;
    transition: all 0.15s;
  }
  /*
    Animating the opacity on a pseudo element drop-shadow
    is more performant than animating the colour of a box-shadow
    property directly.
  */
  .card::after {
    border-radius: 3px;
    bottom: 0;
    box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2);
    content: '';
    left: 0;
    opacity: .66;
    pointer-events: none;
    position: absolute;
    right: 0;
    transition: all 0.15s;
    top: 0;
  }

  .card:hover {
    cursor: pointer;
    transform: translateY(-2px);
  }
  .card:hover::after {
    opacity: 1;
  }

  .card.highlight {
    border-color: var(--selection);
  }
</style>
