<template>
  <div class="test-container">
    <simulation-parameters :parameters="parameters" />
  </div>
</template>

<script lang="ts">
  import Vue from 'vue';
  import Component from 'vue-class-component';
  import { Watch } from 'vue-property-decorator';

  import SimulationParameters from '@/views/Models/components/Simulation/SimulationParameters.vue';

  import * as Donu from '@/types/typesDonu';
  import { ModelInterface, ModelInterfaceType } from '@/types/types';

  import { getModelParameters } from '@/services/DonuService';

  const FAKE_MODEL: ModelInterface = {
    metadata: {
      name: 'Fake HMI Model',
      source: 'modelRepo/easel/sir.easel',
      type: Donu.Type.EASEL,
    },
    type: ModelInterfaceType.computational,
  };

  @Component({ components: { SimulationParameters } })
  export default class SimulationTest extends Vue {
    private parameters: Donu.ModelParameter[] = [];
    private currentModel: ModelInterface = FAKE_MODEL;

    @Watch('currentModel') onCurrentModelChanged (): void {
      this.fetchParameters();
    }

    mounted (): void {
      this.fetchParameters();
    }

    async fetchParameters (): Promise<void> {
      this.parameters = await getModelParameters(this.currentModel);
    }
  }
</script>

<style lang="scss" scoped>
  .test-container {
    display: flex;
    justify-content: center;
    padding: 2em;
  }

  .test-container > * {
    border: 1px solid chartreuse;
  }
</style>
