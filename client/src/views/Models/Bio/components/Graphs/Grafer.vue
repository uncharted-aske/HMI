<template>
  <div class="grafer-container">
    <canvas class="grafer-canvas" ref="canvas"></canvas>
    <loader :loading="loading" class="loading"/>
  </div>
</template>

<script lang="ts">
  import _ from 'lodash';
  import { GraferController, GraferControllerData, GraferLayerData } from '@uncharted.software/grafer';
  import { Component } from 'vue-property-decorator';
  import Vue from 'vue';
  import { BIO_CLUSTERS_LAYERS_CONFIG, BIO_GRAPH_COLORS, BIO_NODES_LAYERS_CONFIG } from '@/utils/GraferUtil';
  import { BioGraferLayerDataPayloadInterface } from '@/types/typesGrafer';

  import Loader from '@/components/widgets/Loader.vue';
  import eventHub from '@/eventHub';

  const components = {
    Loader,
  };

  @Component({ components })
  export default class Grafer extends Vue {
    private loading: boolean = true;
    private controller: GraferController;

    public mounted (): void {
      // NOTE: An event hub pattern is used here instead of passing these as Vue data properties from the
      //       parent component (ie. <grafer :layer-data="layerData" ...>) to reduce the risk of large
      //       layer data being kept as memory both in the parent and within the Grafer's library
      //       internal memory stack unintentionally.
      eventHub.$on('load-layers', (layerData: BioGraferLayerDataPayloadInterface) => {
        if (this.$refs.canvas) {
          const data = this.loadGraph(layerData);
          this.controller = new GraferController(this.$refs.canvas as HTMLCanvasElement, data);
          this.forwardEvents(this.controller);
          this.loading = false;
          this.$emit('loaded');
        }
      });
      eventHub.$on('update-layers', (layers: GraferLayerData[], layerNames: string[]) => {
          this.updateLayers(layers, layerNames);
      });
      eventHub.$on('remove-layers', (layerNames: string[]) => {
          this.removeLayers(layerNames);
      });
      eventHub.$on('foreground-full-graph', () => {
          this.foregroundFullGraph();
      });
      eventHub.$on('background-full-graph', () => {
          this.backgroundFullGraph();
      });
    }

    loadGraph (layerData: BioGraferLayerDataPayloadInterface): GraferControllerData {
      const points = {
        data: layerData.graferPointsData,
      };

      const colors = BIO_GRAPH_COLORS;
      const layers = this.loadModelLayers(layerData);

      return { points, colors, layers };
    }

    removeLayers (layerNames: string[]): void {
      for (const layerName of layerNames) {
        this.controller.removeLayerByName(layerName);
      }
      this.controller.render();
    }

    updateLayers (layers: GraferLayerData[], layerNames: string[]): void {
      for (const layerName of layerNames) {
        this.controller.removeLayerByName(layerName);
      }
      for (let i = 0; i < layers.length; i++) {
        this.controller.addLayer(layers[i], layerNames[i]);
      }
      this.controller.render();
    }

    foregroundFullGraph (): void {
      // Get internal pointer to graph layers
      // NOTE: This is a temporary interface, Grafer is developing a user interface into layers that
      //       this should be replaced with
      const layers = this.controller.viewport.graph.layers;
      const nodesLayer = _.find(layers, layer => layer.name === 'Nodes');
      const clustersLayer = _.find(layers, layer => layer.name === 'Clusters');

      // Foreground nodes layer
      Object.assign(nodesLayer.nodes, BIO_NODES_LAYERS_CONFIG.options.foreground.nodes);
      Object.assign(nodesLayer.edges, BIO_NODES_LAYERS_CONFIG.options.foreground.edges);
      Object.assign(nodesLayer.labels, BIO_NODES_LAYERS_CONFIG.options.foreground.labels);

      // Foreground clusters layer
      Object.assign(clustersLayer.edges, BIO_CLUSTERS_LAYERS_CONFIG.options.foreground.edges);
      Object.assign(clustersLayer.labels, BIO_CLUSTERS_LAYERS_CONFIG.options.foreground.labels);
    }

    backgroundFullGraph (): void {
      // Get internal pointer to graph layers
      // NOTE: This is a temporary interface, Grafer is developing a user interface into layers that
      //       this should be replaced with
      const layers = this.controller.viewport.graph.layers;
      const nodesLayer = _.find(layers, layer => layer.name === 'Nodes');
      const clustersLayer = _.find(layers, layer => layer.name === 'Clusters');

      // Background nodes layer
      Object.assign(nodesLayer.nodes, BIO_NODES_LAYERS_CONFIG.options.background.nodes);
      Object.assign(nodesLayer.edges, BIO_NODES_LAYERS_CONFIG.options.background.edges);
      Object.assign(nodesLayer.labels, BIO_NODES_LAYERS_CONFIG.options.background.labels);

      // Background clusters layer
      Object.assign(clustersLayer.edges, BIO_CLUSTERS_LAYERS_CONFIG.options.background.edges);
      Object.assign(clustersLayer.labels, BIO_CLUSTERS_LAYERS_CONFIG.options.background.labels);
    }

    forwardEvents (controller: GraferController): void {
      /*
       * This exposes the grafer events in vue using their symbol descriptions since vue doesn't support
       * messages using symbols. Available events are:
       * grafer_hover_on - for mouse over a graph element
       * grafer_hover_off - for mouse off a graph element
       * grafer_click - for a full mouse click (mouse down + mouse up on the same element) on a graph element
       *
       * Events are emmited with a single argument which is an object with the following properties:
       * layer {string} - The name of the layer that emmoted the event
       * type {string} - The type of object that triggered the event, "node" or "edge" (only nodes emit events in grafer's current version)
       * id {string} - The ID of the graph object that triggered the event as defined in the data
       */
      const forwardEvent = (event: symbol, ...args: any[]) => {
        this.$emit(event.description, ...args);
      };
      controller.on(GraferController.omniEvent, forwardEvent);
    }

    loadModelLayers (layerData: BioGraferLayerDataPayloadInterface): GraferLayerData[] {
      const layers = [];

      const nodeData = layerData.graferNodesData;

      const nodeLayer = {
        name: 'Nodes',
        nodes: {
          type: 'Circle',
          data: nodeData,
          options: BIO_NODES_LAYERS_CONFIG.options.foreground.nodes,
        },
        edges: {
          data: layerData.graferIntraEdgesData,
          options: BIO_NODES_LAYERS_CONFIG.options.foreground.edges,
        },
        labels: {
          type: 'PointLabel',
          data: nodeData,
          mappings: {
            background: (): boolean => true,
            fontSize: (): number => 12,
            padding: (): [number, number] => [8, 5],
          },
          options: BIO_NODES_LAYERS_CONFIG.options.foreground.labels,
        },
      };
      layers.push(nodeLayer);

      const clusterLayer = {
        name: 'Clusters',
        labels: {
          type: 'RingLabel',
          data: layerData.graferClustersLabelsData,
          mappings: {
            background: (): boolean => false,
            fontSize: (): number => 14,
            padding: (): number => 0,
          },
          options: BIO_CLUSTERS_LAYERS_CONFIG.options.foreground.labels,
        },
        edges: {
          type: 'ClusterBundle',
          data: layerData.graferInterEdgesData,
          options: BIO_CLUSTERS_LAYERS_CONFIG.options.foreground.edges,
        },
      };
      layers.push(clusterLayer);

      return layers;
    }
  }

</script>

<style lang="scss" scoped>
  @import '@/styles/variables';

  .grafer-container {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .grafer-canvas {
    width: 100%;
    height: 100%;
  }

  .loading {
    position: absolute;
    user-select: none;
    color: #d8dee9;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
</style>
