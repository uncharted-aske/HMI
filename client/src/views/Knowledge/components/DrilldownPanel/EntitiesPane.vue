<template>
  <div class="entities-pane-container">
    <div class="border-bottom">
      <a :href="data.raw.bibjson.link[0].url" target="_blank">
        <h5>{{data.title}}</h5>
      </a>
      <h6>{{doi}}</h6>
    </div>
    <div class="mt-3 entities-container hide-scrollbar">
      <div class="mb-1 px-2 py-4 d-flex rounded-lg border" v-for="(drug, index) in drugsList" :key="index + drug.drugs">
        <div class="flex-grow-1">
            <div class="font-weight-bold">{{drug.drugs}}</div>
            <div class="text-muted">{{drug.drugID}}</div>
        </div>
        <div class="d-flex align-items-center mr-3">{{`${drug.hits} Hits`}}</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import Vue from 'vue';
  import Component from 'vue-class-component';
  import { Prop, Watch } from 'vue-property-decorator';
  import { CosmosRelatedEntitiesDrugsInterface } from '@/types/typesCosmos';

  import { cosmosRelatedEntities } from '@/services/CosmosFetchService';

  @Component({ })
  export default class EntitiesPane extends Vue {
    @Prop({ required: false }) private data: any;

    drugsList: CosmosRelatedEntitiesDrugsInterface[] = [];

    @Watch('data') onDataChange (): any {
      this.getRelatedEntities();
    }

    created (): void {
      this.getRelatedEntities();
    }

    async getRelatedEntities (): Promise<void> {
      const response = await cosmosRelatedEntities({ doi: this.doi, known_entities: 'drugs' });
      this.drugsList = response.success.data[0].known_entities.drugs.sort((drug1: CosmosRelatedEntitiesDrugsInterface, drug2: CosmosRelatedEntitiesDrugsInterface) =>
        drug2.hits - drug1.hits);
    }

    get doi (): string {
      return this.data.raw.bibjson.identifier[0].id;
    }
  }
</script>

<style lang="scss" scoped>
@import "@/styles/variables";
.entities-pane-container {
  display: flex;
  flex-direction: column;
  position: absolute;
  height: 100%;
  width: 100%;
  overflow: hidden;
}
.entities-container {
  overflow: hidden scroll;
}
</style>
