<template>
  <modal
    @close="close()"
  >
    <h4 slot="header"> CHIME</h4>
    <div
      slot="body"
    >
    </div>
  </modal>
</template>

<script lang="ts">
import Component from 'vue-class-component';
import Vue from 'vue';

import Modal from '@/components/Modal.vue';

// import ChimePDF from '@/assets/CHIME.pdf';

const components = {
  Modal,
  // pdf
};

@Component({ components })
export default class ModalKnowledge extends Vue {
  // chimePDF: string = ChimePDF;

  close(): void {
    this.$emit('close', null);
  }
}
</script>

<style lang="scss" scoped>

img {
        // Clip images that are too big, but maintain aspect ratio
        object-fit: cover;
        width: 100%;
        height: 100%
      }


</style>
