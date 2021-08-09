<template>
  <transition name="modal">
    <div class="modal-mask" @click="close">
      <div
        class="container rounded-lg modal-container"
        @click="clickStop"
      >
        <div class="modal-header">
          <slot name="header" />
          <close-button @close="close"/>
        </div>

        <div class="modal-body">
          <slot name="body" />
        </div>

        <div v-if="$slots.footer" class="modal-footer">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </transition>
</template>

<script lang="ts">
  /**
   * Simple modal wrapper
   */
  import Vue from 'vue';
  import Component from 'vue-class-component';

  import CloseButton from '@/components/widgets/CloseButton.vue';

  const components = {
    CloseButton,
  };

  @Component({ components })
  export default class Modal extends Vue {
    close (): void {
      this.$emit('close', null);
    }

    clickStop (e: MouseEvent): void {
      e.stopPropagation();
    }
  }
</script>

<style scoped>
  .modal-mask {
    align-items: center;
    background-color: rgba(0, 0, 0, .5);
    display: flex;
    height: 100%;
    justify-content: center;
    left: 0;
    position: fixed;
    top: 0;
    transition: opacity .3s ease;
    width: 100%;
    z-index: var(--z-index--modal);
  }

  .modal-container {
    background-color: white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, .33);
    display: flex;
    flex-direction: column;
    height: 90vh;
    position: relative;
    transition: all .3s ease;
  }

  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 1rem 0;
  }

  /* Give space for the close button */
  .modal-header {
    padding-right: 2em;
  }

  .modal-body {
    display: flex;
    flex-direction: column;
  }

  /*
   * The following styles are auto-applied to elements with
   * transition="modal" when their visibility is toggled
   * by Vue.js.
   *
   * You can easily play with the modal transition by editing
   * these styles.
   */

  .modal-enter {
    opacity: 0;
  }

  .modal-leave-active {
    opacity: 0;
  }

  .modal-enter .modal-container,
  .modal-leave-active .modal-container {
    -webkit-transform: scale(1.1);
    transform: scale(1.1);
  }
</style>
