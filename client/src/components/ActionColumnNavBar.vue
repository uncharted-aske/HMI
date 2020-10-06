<template>
  <ul
    class="action-column-nav-bar"
    role="tablist">
    <li
      v-for="(action, idx) in actions"
      :key="idx"
      :class="{ active: action.name === currentAction }"
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

<script lang="ts">
  import Vue from 'vue';
  import Component from 'vue-class-component';
  import { Prop } from 'vue-property-decorator';

  @Component
  export default class ActionColumnNavBar extends Vue {
    @Prop({ default: [] })
    actions: Array<string>;

    @Prop({ default: '' })
    currentAction: string;

    setActive (actionName:string): void {
      // If the action is currently selected, pass '' to signify it should be
      //  unselected. Otherwise, pass the action's name to select it
      this.$emit('set-active', actionName === this.currentAction ? '' : actionName);
    }
  }
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
        background-color: $btn-secondary-color;
      }
    }
  }
}
</style>
