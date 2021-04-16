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
  import { loadJSONLFile } from '@/utils/FileLoaderUtil';
  import { BIO_GRAPH_COLORS } from '@/utils/GraferUtil';

  import Loader from '@/components/widgets/Loader.vue';

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

    @Prop({ default: true })
    private backEdges: boolean;

    public mounted (): void {
      this.loadGraph().then(data => {
        this.controller = new GraferController(this.$refs.canvas as HTMLCanvasElement, data);
        this.forwardEvents(this.controller);
        this.loading = false;
      });
    }

    // temporary demo functions
    async loadGraph (): Promise<GraferControllerData> {
      const points = {
        data: await loadJSONLFile(`/grafer/${this.model}/points.jsonl`),
      };

      const colors = BIO_GRAPH_COLORS;
      const layers = await this.loadModelLayers();

      return { points, colors, layers };
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

    async loadModelLayers (): Promise<GraferLayerData[]> {
      const layers = [];

      const nodeOptions = { color: 1 };
      const nodeEdgeOptions = {
        sourceColor: 2,
        targetColor: 2,
      };
      const nodeData = await loadJSONLFile(`/grafer/${this.model}/nodes.jsonl`, nodeOptions);

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
          data: await loadJSONLFile(`/grafer/${this.model}/intra_edges.jsonl`, nodeEdgeOptions),
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

      const clusterLabelOptions = { color: 3 };
      const clusterEdgeOptions = {
        sourceColor: 0,
        targetColor: 0,
      };

      const clusterLayer = {
        name: 'Clusters',
        // nodes: {
        //   type: 'Ring',
        //   data: await loadJSONLFile(`/grafer/${this.model}/clusters.jsonl`, clusterLabelOptions),
        //   options: {},
        // },
        labels: {
          type: 'RingLabel',
          data: await loadJSONLFile(`/grafer/${this.model}/clusters.jsonl`, clusterLabelOptions),
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
          data: await loadJSONLFile(`/grafer/${this.model}/inter_edges.jsonl`, clusterEdgeOptions),
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
        nodeLayer.edges.options = Object.assign(nodeLayer.edges.options, fadedOptions, { fade: 0.9, enabled: this.backEdges });
        nodeLayer.labels.options = Object.assign(nodeLayer.labels.options, fadedOptions);

        // clusterLayer.nodes.options = Object.assign(clusterLayer.nodes.options, fadedOptions);
        clusterLayer.edges.options = Object.assign(clusterLayer.edges.options, fadedOptions, { fade: 0.9, enabled: this.backEdges });
        clusterLayer.labels.options = Object.assign(clusterLayer.labels.options, fadedOptions);

        // load the layers
        // 3710
        const highlightClusterEdges = await loadJSONLFile(`/grafer/${this.model}/${this.layer}/inter_edges.jsonl`, clusterEdgeOptions);
        const highlightClusterLayer = {
          name: 'Highlights - Clusters',
          labels: {
            type: 'RingLabel',
            data: await loadJSONLFile(`/grafer/${this.model}/${this.layer}/clusters.jsonl`, clusterLabelOptions),
            mappings: {
              background: (): boolean => false,
              fontSize: (): number => 14,
              padding: (): number => 0,
            },
            options: {
              visibilityThreshold: 160,
              repeatLabel: -1,
              repeatGap: 64,
              nearDepth: 0.0,
              farDepth: 0.4,
            },
          },
          edges: {
            type: 'ClusterBundle',
            data: highlightClusterEdges,
            options: {
              alpha: Math.min(0.99, Math.max(0.2, 1 - ((1 / 4100) * highlightClusterEdges.length))),
              nearDepth: 0.1,
              farDepth: 0.4,
            },
          },
        };
        layers.unshift(highlightClusterLayer);

        const highlightNodeData = await loadJSONLFile(`/grafer/${this.model}/${this.layer}/nodes.jsonl`, nodeOptions);
        const highlightNodeLayer = {
          name: 'Highlights - Nodes',
          nodes: {
            type: 'Circle',
            data: highlightNodeData,
            options: {
              nearDepth: 0.0,
              farDepth: 0.4,
            },
          },
          edges: {
            data: await loadJSONLFile(`/grafer/${this.model}/${this.layer}/intra_edges.jsonl`, nodeEdgeOptions),
            options: {
              alpha: 0.55,
            },
          },
          labels: {
            type: 'PointLabel',
            data: highlightNodeData,
            mappings: {
              background: (): boolean => true,
              fontSize: (): number => 12,
              padding: (): [number, number] => [8, 5],
            },
            options: {
              visibilityThreshold: 8,
              labelPlacement: graph.labels.PointLabelPlacement.TOP,
              nearDepth: 0.0,
              farDepth: 0.4,
            },
          },
        };
        layers.unshift(highlightNodeLayer);
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
