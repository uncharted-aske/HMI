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
          <div role="button" class="mb-1 p-2 rounded-lg border" v-for="(rowLabel, index) in incoming" :key="index">
            {{rowLabel}}
          </div>
          <button type="button" class="btn btn-sm btn-light" @click="viewAllIncoming">
            View {{ displayAllIncoming ? 'less' : `all ${data.in_degree}` }}
          </button>
        </div>
      </details>

      <details v-if="data.out_degree" class="metadata" open>
        <summary>Outgoing ({{ data.out_degree }})</summary>
        <div class="metadata-content">
          <div role="button" class="mb-1 p-2 rounded-lg border" v-for="(rowLabel, index) in outgoing" :key="index">
            {{rowLabel}}
          </div>
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
  import { Getter } from 'vuex-class';
  import { Prop, Watch } from 'vue-property-decorator';

  import LoadingAlert from '@/components/widgets/LoadingAlert.vue';
  import { emmaaEntityInfo } from '@/services/EmmaaFetchService';
  import eventHub from '@/eventHub';

  import { EmmaaEntityInfoInterface } from '@/types/typesEmmaa';
  import { GraphNodeDataInterface } from '@/types/typesGraphs';
  import { filterToBgraph } from '@/utils/BGraphUtil';

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
    incomingNodes: string[] = [];
    outgoingNodes: string[] = [];
    emmaaInfo: EmmaaEntityInfoInterface = emptyEmmaaInfo;

    @Getter getFilters;

    @Watch('data') onDataChange (): void {
      this.fetchExternalData();
      this.getNeighbours();
    }

    mounted (): void {
      this.fetchExternalData();
      this.getNeighbours();
    }

    getNeighbours (): void {
      eventHub.$emit('get-bgraph', bgraph => {
        if (bgraph) {
          const subgraph = new Set(filterToBgraph(bgraph, this.getFilters).map(node => node.id));
          this.outgoingNodes = bgraph
            .v({ id: this.data.id })
            .out()
            .out()
            .unique()
            .run()
            .filter(node => !subgraph.has(node.vertex.id))
            .map(node => `${node.vertex.name} → ${this.data.label}`);
          this.incomingNodes = bgraph
            .v({ id: this.data.id })
            .in()
            .in()
            .unique()
            .run()
            .filter(node => !subgraph.has(node.vertex.id))
            .map(node => `${this.data.label} → ${node.vertex.name}`);
        }
      });
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

    get incoming (): string[] {
      return this.displayAllIncoming
        ? this.incomingNodes
        : this.incomingNodes.slice(0, 5);
    }

    get outgoing (): string[] {
      return this.displayAllOutgoing
        ? this.outgoingNodes
        : this.outgoingNodes.slice(0, 5);
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
