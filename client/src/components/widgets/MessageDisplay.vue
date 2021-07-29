<template>
  <div 
    class="alert m-3"     
    :class="alertType">
   {{message}}
  </div>
</template>

<script lang="ts">
  import Vue from 'vue';
  import Component from 'vue-class-component';
  import { Prop } from 'vue-property-decorator';
  
  @Component
  export default class Counters extends Vue {
    @Prop({ default: '' })
    message: string;
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

  }
</script>

<style scoped>

</style>
