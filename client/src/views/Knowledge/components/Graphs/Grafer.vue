<template>
  <div class="grafer-container">
    <canvas class="grafer-canvas" ref="canvas"></canvas>
    <loader :loading="loading" class="loading"/>
  </div>
</template>

<script lang="ts">
  import { GraferController, GraferControllerData, GraferPointsData, graph, GraferLayerData } from '@uncharted.software/grafer';
  import { Component, Prop } from 'vue-property-decorator';
  import Vue from 'vue';
  import { loadJSONLFile } from '@/utils/FileLoaderUtil';
  import { CLUSTER_GRAPH_COLORS } from '@/utils/GraferUtil';

  import Loader from '@/components/widgets/Loader.vue';

  const components = {
    Loader,
  };

  @Component({ components })
  export default class Grafer extends Vue {
    private loading: boolean = true;
    private controller: GraferController;

    @Prop({ default: 'wisconsin-knowledge' })
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

      const colors = CLUSTER_GRAPH_COLORS;
      const layers = await this.loadModelLayers(points);

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

    async loadModelLayers (points: GraferPointsData): Promise<GraferLayerData[]> {
      const layers = [];
      const nodeLayer = {
        name: 'Nodes',
        nodes: {
          type: 'Circle',
          data: await loadJSONLFile(`/grafer/${this.model}/nodes.jsonl`),
          options: {
            pixelSizing: true,
            nearDepth: 0.75,
            farDepth: 1.0,
          },
        },
        edges: null,
        labels: {
          type: 'PointLabel',
          data: await loadJSONLFile(`/grafer/${this.model}/clusters.jsonl`),
          mappings: {
            background: (): boolean => true,
            fontSize: (): number => 12,
            padding: (): [number, number] => [8, 5],
          },
          options: {
            visibilityThreshold: 5,
            labelPlacement: graph.labels.PointLabelPlacement.CENTER,
            nearDepth: 0.5,
            farDepth: 0.74,
          },
        },
      };
      layers.push(nodeLayer);

      if (this.layer) {
        // change the layers properties
        const fadedOptions = {
          alpha: 1.0,
          fade: 0.9,
          desaturate: 0.5,
        };

        nodeLayer.nodes.options = Object.assign(nodeLayer.nodes.options, fadedOptions);
        nodeLayer.labels.options = Object.assign(nodeLayer.labels.options, fadedOptions);

        // load the extra points
        points.data.push(...await loadJSONLFile(`/grafer/${this.model}/${this.layer}/points.jsonl`));

        // load the layer
        const highlightNodeLayer = {
          name: 'Nodes',
          nodes: {
            type: 'Circle',
            data: await loadJSONLFile(`/grafer/${this.model}/${this.layer}/nodes.jsonl`),
            options: {
              pixelSizing: true,
              nearDepth: 0.25,
              farDepth: 0.5,
            },
          },
          edges: null,
          labels: {
            type: 'PointLabel',
            data: await loadJSONLFile(`/grafer/${this.model}/${this.layer}/clusters.jsonl`),
            mappings: {
              background: (): boolean => true,
              fontSize: (): number => 12,
              padding: (): [number, number] => [8, 5],
            },
            options: {
              visibilityThreshold: 0,
              labelPlacement: graph.labels.PointLabelPlacement.TOP,
              nearDepth: 0.0,
              farDepth: 0.24,
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
