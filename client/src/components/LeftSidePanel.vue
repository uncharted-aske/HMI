<template>
  <div class="left-side-panel-container">

      <div class="panel-header">
        <h5>{{paneTitle}}</h5>
      </div>
      <close-button />
      <!-- <hr class="pane-separator"> -->
      <div class="panel-body">
         <slot name="content" />
      </div>
  </div>
</template>

<script>

  import CloseButton from '@/components/widgets/CloseButton.vue';

  export default {
    name: 'LeftSidePanel',
    components: {
      CloseButton,
    },
    props: {
      isOpen: {
        type: Boolean,
        default: false,
      },
      paneTitle: {
        type: String,
        default: '',
      },
    },
    methods: {

    },
  };
</script>

<style lang="scss" scoped>
@import "../styles/variables";

.left-side-panel-container {
  height: $content-full-height;
  width: 20vw;
  background-color: $body-bg;
  position: absolute;
  left: 100%;
  top: 0;
  z-index: map-get($z-index-order, side-panel);
  box-shadow: 0 -1px 0 $border, 0 0 2px rgba(0,0,0,.12), 2px 2px 4px rgba(0,0,0,.24);
}

</style>
