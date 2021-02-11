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
  import Component from 'vue-class-component';
  import Vue from 'vue';

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

<style lang="scss" scoped>
@import "@/styles/variables";

.modal-mask {
  position: fixed;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: map-get($z-index-order, modal);
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, .5);
  transition: opacity .3s ease;
}

.modal-container {
  position: relative;
  height: 90vh;
  display: flex;
  flex-direction: column;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, .33);
  transition: all .3s ease;
}

.modal-header, .modal-body, .modal-footer {
  padding: 1rem 0;
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
