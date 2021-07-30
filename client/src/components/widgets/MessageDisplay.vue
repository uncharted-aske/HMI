<template>
  <div
    class="alert"
    :class="alertType">
    <font-awesome-icon class="icon" :icon="['fas', iconType]"/>
    <slot name="message" />
  </div>
</template>

<script lang="ts">
  import Vue from 'vue';
  import Component from 'vue-class-component';
  import { Prop } from 'vue-property-decorator';

  @Component
  export default class MessageDisplay extends Vue {
    @Prop({ default: 'info' })
    messageType: string;

    get alertType (): string {
      if (this.messageType === 'warning') {
        return 'alert-warning';
      } else if (this.messageType === 'primary') {
        return 'alert-primary';
      }
      return 'alert-info';
    }

    get iconType (): string {
      if (this.messageType === 'warning') {
        return 'exclamation-triangle';
      }
      return 'info-circle';
    }
  }
</script>

<style scoped>
  .fa {
    padding-right: 5px;
  }
</style>
