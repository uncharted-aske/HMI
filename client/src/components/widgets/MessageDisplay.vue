<template>
  <div
    class="message-display alert"
    :class="`alert-${messageType}`">
    <font-awesome-icon class="icon" :icon="['fas', iconType]"/>
    <slot />
  </div>
</template>

<script lang="ts">
  import Vue from 'vue';
  import Component from 'vue-class-component';
  import { Prop } from 'vue-property-decorator';

  @Component
  export default class MessageDisplay extends Vue {
    @Prop({ default: 'info' }) messageType: string;

    get iconType (): string {
      if (this.messageType === 'warning') {
        return 'exclamation-triangle';
      }
      return 'info-circle';
    }
  }
</script>

<style scoped>
  .icon {
    margin-right: 5px;
  }
</style>
