<template>
  <!-- Modal to configure Run configuration -->
  <modal v-if="data" @close="$emit('close')">
    <h4 slot="header">Select Observed Dataset</h4>
    <div slot="body" class="d-flex">
      <div class="media-body">
        <h5>Observed data</h5>
        <div v-for="(dataset, index) in datasets" :key="index">
          <div class="form-check" @click="selectHistoricalDataset(dataset.source.model)">
            <input
              class="form-check-input"
              type="radio"
              :checked="isHistoricalChecked(dataset.source.model)"
            />
            <label class="form-check-label">
                {{dataset.description}}
            </label>
          </div>
        </div>
      </div>
      <div class="media-body">
        <h5>Variables</h5>
        <div class="mb-2" v-for="(data, index) in modelDataList" :key="index">
          <h6>{{getModelName(data.id)}}</h6>
          <div v-for="(data2, index) in data.variables" :key="index">
            <div class="form-check" @click="selectVariableDataset(data.id, data2.uid)">
              <input
                class="form-check-input"
                type="radio"
                :checked="isVariableChecked(data.id, data2.uid)"
              />
              <label class="form-check-label">
                  {{data2.metadata.name}}
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  </modal>
</template>

<script lang="ts">
  import Vue from 'vue';
  import Component from 'vue-class-component';
  import { Prop } from 'vue-property-decorator';
  import { Getter, Action } from 'vuex-class';

  import { ObservedType } from '@/types/types';
  import { SelectedNode } from '@/types/typesModel';
  import { listDatasetsResult } from '@/services/DonuService';

  import Modal from '@/components/Modal.vue';

  const components = {
    Modal,
  };

  @Component({ components })
  export default class ObservedButton extends Vue {
    @Prop({ default: false }) modelId: any;
    @Prop({ default: false }) data: any;

    @Getter getModelsList;
    @Getter getSelectedModelIds;
    @Getter getSimModel;
    @Action setVariableObservedVariable;
    @Action setVariableObservedHistorical;

    datasets: any = [];
    selectedObservedType: ObservedType
    selectedObservedId: string | SelectedNode = '';

    async mounted (): Promise<void> {
        this.datasets = await listDatasetsResult();
    }

    isHistoricalChecked (modelId: string): boolean {
      return this.selectedObservedType === ObservedType.HISTORICAL &&
        this.selectedObservedId === modelId;
    }

    isVariableChecked (modelId: number, nodeId: string): boolean {
      return this.selectedObservedType === ObservedType.VARIABLE &&
        (this.selectedObservedId as SelectedNode).model === modelId &&
        (this.selectedObservedId as SelectedNode).node === nodeId;
    }

    get variableId (): string {
      return this.data.uid;
    }

    get modelDataList (): any {
      return this.getSelectedModelIds.map(modelId => this.getSimModel(modelId));
    }

    getModelName (modelId: string): string {
      return this.getModelsList.find(model => model.id === modelId)?.name;
    }

    selectVariableDataset (observedModel: string, observedId: string): void {
      this.selectedObservedType = ObservedType.VARIABLE;
      this.selectedObservedId = { model: observedModel as unknown as number, node: observedId };

      this.setVariableObservedVariable({
        modelId: this.modelId,
        uid: this.data.uid,
        observedObj: { model: observedModel, node: observedId },
      });
    }

    selectHistoricalDataset (observedId: string): void {
      this.selectedObservedType = ObservedType.HISTORICAL;
      this.selectedObservedId = observedId !== this.selectedObservedId
        ? observedId
        : '';

      this.setVariableObservedHistorical({
        modelId: this.modelId,
        uid: this.data.uid,
        observedId,
      });
    }
  }
</script>

<style scoped>

</style>
