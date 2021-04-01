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
  import { buildHighlightClusterLayer, buildHighlightNodeLayer, clusterEdgeOptions, clusterLabelOptions, nodeEdgeOptions, nodeOptions } from '@/utils/GraferUtil';

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

    // TODO: Fix type. This is an event emitter like a Vue instance.
    // TODO: Instead of taking in a vue instance use a library like `mitt` or `tiny-emitter` as Vue.$emit, Vue.$on
    //       has been deprecated in Vue 3
    @Prop({ default: null })
    private bus: any;

    public mounted (): void {
      this.loadGraph().then(data => {
        this.controller = new GraferController(this.$refs.canvas as HTMLCanvasElement, data);
        this.loading = false;
      });
    }

    created (): void {
      this.bus.$on('new-query-results', (args) => {
          this.addLayer(args);
      });
    }

    // temporary demo functions
    async loadGraph (): Promise<GraferControllerData> {
      const points = {
        data: await loadJSONLFile(`/grafer/${this.model}/points.jsonl`),
      };

      const colors = this.getModelColors();

      const layers = await this.loadModelLayers(points);

      return { points, colors, layers };
    }

    getModelColors (): string[] {
      if (this.model === 'covid-19') {
        return [
          '#5e81ac',
          '#d08770',
          '#ebcb8b',
          '#81a1c1',
        ];
      }
      return [
        '#bf616a',
        '#d08770',
        '#ebcb8b',
        '#a3be8c',
        '#b48ead',
        '#d8dee9',
      ];
    }

    async loadModelLayers (points: GraferPointsData): Promise<GraferLayerData[]> {
      if (this.model === 'covid-19') {
        return await this.loadBioLayers();
      }
      return await this.loadKnowledgeLayers(points);
    }

    // TODO: Fix argument type once bgraph sends query result typing
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async addLayer (arg: any): Promise<void> {
      // TODO: Use the query results to build the layers
      // eslint-disable-next-line no-console
      console.log(arg);

      const highlightClusterEdges = await loadJSONLFile(`/grafer/${this.model}/${this.layer}/inter_edges.jsonl`, clusterEdgeOptions);
      const highlightClusters = await loadJSONLFile(`/grafer/${this.model}/${this.layer}/clusters.jsonl`, clusterLabelOptions);
      const highlightClusterLayer = buildHighlightClusterLayer('Highlights - Clusters', highlightClusterEdges, highlightClusters);

      const highlightNodeData = await loadJSONLFile(`/grafer/${this.model}/${this.layer}/nodes.jsonl`, nodeOptions);
      const highlightNodeEdges = await loadJSONLFile(`/grafer/${this.model}/${this.layer}/intra_edges.jsonl`, nodeEdgeOptions);
      const highlightNodeLayer = buildHighlightNodeLayer('Highlights - Nodes', highlightNodeData, highlightNodeEdges);

      this.controller.removeLayerByName('highlightClusterLayer');
      this.controller.removeLayerByName('highlightNodeLayer');
      this.controller.addLayer(highlightClusterLayer, 'highlightClusterLayer');
      this.controller.addLayer(highlightNodeLayer, 'highlightNodeLayer');
      this.controller.render();
    }

    async loadBioLayers (): Promise<GraferLayerData[]> {
      const layers = [];

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
      }

      return layers;
    }

    async loadKnowledgeLayers (points: GraferPointsData): Promise<GraferLayerData[]> {
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
