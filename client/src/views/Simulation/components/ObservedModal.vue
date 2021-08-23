<template>
  <!-- Modal to configure Run configuration -->
  <modal v-if="data" @close="$emit('close')">
    <h5 slot="header">Select Observed Dataset</h5>
    <div slot="body" v-for="(dataset, index) in datasets" :key="index">
      <div class="form-check" @click="selectDataset(dataset.source.model)">
        <input
          class="form-check-input"
          type="radio"
          :checked="selectedObservedId === dataset.source.model"
        />
        <label class="form-check-label">
            {{dataset.description}}
        </label>
      </div>
    </div>
  </modal>
</template>

<script lang="ts">
  import Vue from 'vue';
  import Component from 'vue-class-component';
  import { Prop } from 'vue-property-decorator';
  import Modal from '@/components/Modal.vue';
  import { listDatasetsResult } from '@/services/DonuService';

  const components = {
    Modal,
  };

  @Component({ components })
  export default class ObservedButton extends Vue {
    @Prop({ default: false }) data: any;

    datasets: any = [];
    selectedObservedId: string = '';

    async mounted (): Promise<void> {
        this.datasets = await listDatasetsResult();
    }

    get variableId (): string {
      return this.data.uid;
    }

    selectDataset (observedId: string): void {
      this.selectedObservedId = observedId !== this.selectedObservedId
        ? observedId
        : '';
      this.$emit('datasetSelected', this.selectedObservedId);
    }
  }
</script>

<style scoped>

</style>
