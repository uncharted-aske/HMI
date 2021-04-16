<template>
  <div class="grafer-container">
    <canvas class="grafer-canvas" ref="canvas"></canvas>
    <loader :loading="loading" class="loading"/>
  </div>
</template>

<script lang="ts">
  import { GraferController, GraferControllerData, graph, GraferLayerData } from '@uncharted.software/grafer';
  import { Component, Prop } from 'vue-property-decorator';
  import Vue from 'vue';
  import { BIO_GRAPH_COLORS } from '@/utils/GraferUtil';
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

    @Prop({ default: 'covid-19' })
    private model: string;

    @Prop({ default: null })
    private layer: string;

    public mounted (): void {
      // NOTE: An event hub pattern is used here instead of passing these as Vue data properties from the
      //       parent component (ie. <grafer :layer-data="layerData" ...>) to reduce the risk of large
      //       layer data being kept as memory both in the parent and within the Grafer's library
      //       internal memory stack unintentionally.
      eventHub.$on('load-layers', (layerData: BioGraferLayerDataPayloadInterface) => {
        const data = this.loadGraph(layerData);
        this.controller = new GraferController(this.$refs.canvas as HTMLCanvasElement, data);
        this.forwardEvents(this.controller);
        this.loading = false;
        this.$emit('loaded');
      });
      eventHub.$on('update-layers', (layers: GraferLayerData[], layerNames: string[]) => {
          this.updateLayers(layers, layerNames);
      });
      eventHub.$on('remove-layers', (layerNames: string[]) => {
          this.removeLayers(layerNames);
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
          options: {
            nearDepth: 0.5,
            farDepth: 1.0,
          },
        },
        edges: {
          data: layerData.graferIntraEdgesData,
          options: {
            alpha: 0.55,
            nearDepth: 0.6,
            farDepth: 1.0,
          },
        },
        labels: {
          type: 'PointLabel',
          data: nodeData,
          mappings: {
            background: (): boolean => true,
            fontSize: (): number => 12,
            padding: (): [number, number] => [8, 5],
          },
          options: {
            visibilityThreshold: 8,
            labelPlacement: graph.labels.PointLabelPlacement.TOP,
          },
        },
      };
      layers.push(nodeLayer);

      const clusterLayer = {
        name: 'Clusters',
        // nodes: {
        //   type: 'Ring',
        //   data: layerData.graferClustersLabelsData,
        //   options: {},
        // },
        labels: {
          type: 'RingLabel',
          data: layerData.graferClustersLabelsData,
          mappings: {
            background: (): boolean => false,
            fontSize: (): number => 14,
            padding: (): number => 0,
          },
          options: {
            visibilityThreshold: 160,
            repeatLabel: -1,
            repeatGap: 64,
            nearDepth: 0.5,
            farDepth: 1.0,
          },
        },
        edges: {
          type: 'ClusterBundle',
          data: layerData.graferInterEdgesData,
          options: {
            alpha: 0.04,
            nearDepth: 0.7,
            farDepth: 1.0,
          },
        },
      };
      layers.push(clusterLayer);

      if (this.layer) {
        // change the layers properties
        const fadedOptions = {
          alpha: 1.0,
          fade: 0.7,
          desaturate: 0.5,
        };

        nodeLayer.nodes.options = Object.assign(nodeLayer.nodes.options, fadedOptions);
        nodeLayer.edges.options = Object.assign(nodeLayer.edges.options, fadedOptions, { fade: 0.9, enabled: false });
        nodeLayer.labels.options = Object.assign(nodeLayer.labels.options, fadedOptions);

        // clusterLayer.nodes.options = Object.assign(clusterLayer.nodes.options, fadedOptions);
        clusterLayer.edges.options = Object.assign(clusterLayer.edges.options, fadedOptions, { fade: 0.9, enabled: false });
        clusterLayer.labels.options = Object.assign(clusterLayer.labels.options, fadedOptions);
      }

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
