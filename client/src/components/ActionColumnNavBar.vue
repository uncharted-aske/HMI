<template>
  <ul
    class="action-column-nav-bar"
    role="tablist">
    <li
      v-for="(action, idx) in actions"
      :key="idx"
      :class="{ active: action.name === currentActionName }"
    >
      <button
        class="btn"
        role="tab"
        data-toggle="tab"
        @click.stop.prevent="setActive(action.name)"
      >
         <font-awesome-icon :icon="['fas', action.icon]" />
      </button>
    </li>
  </ul>
</template>

<script>
export default {
  name: 'FacetPanelNav',
  props: {
    actions: {
      type: Array,
      default: () => []
    },
    currentActionName: {
      type: String,
      default: () => ''
    }
  },
  methods: {
    setActive(actionName) {
      // If the tab is currently selected, pass '' to signify it should be
      //  unselected. Otherwise, pass the tab's name to select it
      this.$emit('setActive', actionName === this.currentActionName ? '' : actionName);
    }
  }
};
</script>

<style lang="scss" scoped>
@import '../styles/variables';

.action-column-nav-bar {
  width: $secondary-bar-width;
  margin: 0;
  padding: 0;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  background-color: $secondary-bar-bg;

  li {
    position: relative;
    display: block;

    button {
      width: $secondary-bar-width;
      height:$secondary-bar-width;
      background-color: transparent;
    }

    &.active {
      button {
        color: #ffffff;
        background-color: #545353;
      }
    }
  }
}
</style>
