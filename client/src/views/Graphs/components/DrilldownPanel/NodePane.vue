<template>
  <div class="node-pane-container">
    <header>
      <h5>{{data.label}}</h5>
      Type: {{ data.type }}<br>
      Link: <a v-if="emmaaInfo.url" :href="emmaaInfo.url">
        {{ data.db_ids[0].namespace }}
      </a>
    </header>

    <div class="metadata-list">
      <loading-alert v-if="isLoading" />

      <details v-if="emmaaInfo.definition" class="metadata" open>
        <summary>Definition</summary>
        <div class="metadata-content">
          <p>{{ emmaaInfo.definition }}</p>
        </div>
      </details>

      <details v-if="data.in_degree" class="metadata" open>
        <summary>Incoming ({{ data.in_degree }})</summary>
        <div class="metadata-content">
          <ul>
            <li v-for="(targetId, index) in incoming" :key="index">
              {{ targetId }}
            </li>
          </ul>
          <button type="button" class="btn btn-sm btn-light" @click="viewAllIncoming">
            View {{ displayAllIncoming ? 'less' : `all ${data.in_degree}` }}
          </button>
        </div>
      </details>

      <details v-if="data.out_degree" class="metadata" open>
        <summary>Outgoing ({{ data.out_degree }})</summary>
        <div class="metadata-content">
          <ul>
            <li v-for="(sourceId, index) in outgoing" :key="index">
              {{ sourceId }}
            </li>
          </ul>
          <button type="button" class="btn btn-sm btn-light" @click="viewAllOutgoing">
            View {{ displayAllOutgoing ? 'less' : `all ${data.out_degree}` }}
          </button>
        </div>
      </details>

    </div>
  </div>
</template>

<script lang="ts">
  import Vue from 'vue';
  import Component from 'vue-class-component';
  import { Prop, Watch } from 'vue-property-decorator';

  import LoadingAlert from '@/components/widgets/LoadingAlert.vue';
  import { emmaaEntityInfo } from '@/services/EmmaaFetchService';

  import { EmmaaEntityInfoInterface } from '@/types/typesEmmaa';
  import { GraphNodeDataInterface } from '@/types/typesGraphs';

  const components = {
    LoadingAlert,
  };

  const emptyEmmaaInfo = {
    definition: null,
    name: null,
    url: null,
  } as EmmaaEntityInfoInterface;

  @Component({ components })
  export default class NodePane extends Vue {
    @Prop({ default: null }) data: GraphNodeDataInterface;
    @Prop({ default: null }) model: string;
    isLoading = false;
    displayAllIncoming = false;
    displayAllOutgoing = false;
    emmaaInfo: EmmaaEntityInfoInterface = emptyEmmaaInfo;

    @Watch('data') onDataChange (): void {
      this.fetchExternalData();
    }

    mounted (): void {
      this.fetchExternalData();
    }

    async fetchExternalData (): Promise<void> {
      this.isLoading = true;
      this.emmaaInfo = emptyEmmaaInfo;
      this.emmaaInfo = await emmaaEntityInfo({
        modelName: this.model,
        namespace: this.data.db_ids[0].namespace,
        id: this.data.db_ids[0].id,
      });
      this.isLoading = false;
    }

    get incoming (): number[] {
      return this.displayAllIncoming
        ? this.data.edge_ids_target
        : this.data.edge_ids_target.slice(0, 5);
    }

    get outgoing (): number[] {
      return this.displayAllOutgoing
        ? this.data.edge_ids_source
        : this.data.edge_ids_source.slice(0, 5);
    }

    viewAllIncoming (): void {
      this.displayAllIncoming = !this.displayAllIncoming;
    }

    viewAllOutgoing (): void {
      this.displayAllOutgoing = !this.displayAllOutgoing;
    }
  }
</script>

<style scoped>
  header {
    padding: .5em;
  }

  header a {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .metadata button {
    display: block;
    margin: .5em auto;
  }
</style>
