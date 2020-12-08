<template>
  <div class="dropdown-container">
    <slot name="content" />
    <slot name="footer" />
  </div>
</template>

<script lang="ts">

/**
 * A menu dropdown wrapper that allows the injection of external
 * fragments into the template slot.
 *
 * - content: elements to be displayed
 *
*/

import Component from 'vue-class-component';
import Vue from 'vue';

@Component
  export default class Dropdown extends Vue {
  }

</script>

<style lang="scss">
@import "@/styles/variables";

.dropdown-container {
  position: relative;
  display: block;
  background: #ffffff;
  box-sizing: border-box;
  opacity: 1;
  z-index: map-get($z-index-order, dropdown);
  border-radius: 4px;
  box-shadow: 0 -1px 0 #e5e5e5, 0 0 2px rgba(0,0,0,.12), 0 2px 4px rgba(0,0,0,.24);
  overflow: hidden;
}

</style>
