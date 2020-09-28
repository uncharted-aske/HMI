<template>
  <div class="action-column-container">
    COLUMN

  </div>
</template>

<script>

  export default {
    name: 'ActionColumn',
    components: {
    },
    data: () => ({
    }),
    methods: {

    },
  };
</script>

<style lang="scss" scoped>
.action-column-container {
  position: relative;
  width: 50px;
  height: $content-full-height;
  background-color: blue;
  border: 1px solid $blue;
}

// .details-panel {
//   height: $content-full-height;
//   width: 20vw;
//   background-color: $color-background-lvl-2;
//   position: absolute;
//   left: 100%;
//   top: 0;
//   z-index: map-get($z-index-order, side-panel);
//   box-shadow: 0 -1px 0 #e5e5e5, 0 0 2px rgba(0,0,0,.12), 2px 2px 4px rgba(0,0,0,.24);
// }

// .panel-header {
//   height: 56px; // 56px = 32px button + (2 * 12px) padding above and below
//   display: flex;
//   align-items: center;
//   padding: 0 20px;
//   justify-content: space-between;

//   h5 {
//     margin: 0;
//     line-height: 18px;
//   }
// }

// .panel-body {
//   display: flex;
//   flex-direction: column;
//   justify-content: flex-start;
//   overflow-y: auto;
//   p {
//     margin-bottom: 20px;
//   }
//   button {
//     align-self: center;
//   }
// }

</style>
