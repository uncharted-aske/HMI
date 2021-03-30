<template>
  <div class="grafer-container">
    <canvas class="grafer-canvas" ref="canvas"></canvas>
    <div v-if="loading" class="loading">
      <div class="loader">Loading...</div>
    </div>
  </div>
</template>

<script lang="ts">
  import { GraferController, GraferControllerData, GraferPointsData, graph, GraferLayerData } from '@uncharted.software/grafer';
  import { Component, Prop } from 'vue-property-decorator';
  import Vue from 'vue';
  import { loadJSONLFile } from '@/utils/FileLoaderUtil';

  @Component
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
        this.loading = false;
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

    async loadBioLayers (): Promise<GraferLayerData[]> {
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

  .loader,
  .loader:before,
  .loader:after {
    background: $icon-color;
    -webkit-animation: load1 1s infinite ease-in-out;
    animation: load1 1s infinite ease-in-out;
    width: 1em;
    height: 4em;
  }
  .loader {
    color: $icon-color;
    text-indent: -9999em;
    margin: 88px auto;
    position: relative;
    font-size: 11px;
    -webkit-transform: translateZ(0);
    -ms-transform: translateZ(0);
    transform: translateZ(0);
    -webkit-animation-delay: -0.16s;
    animation-delay: -0.16s;
  }
  .loader:before,
  .loader:after {
    position: absolute;
    top: 0;
    content: '';
  }
  .loader:before {
    left: -1.5em;
    -webkit-animation-delay: -0.32s;
    animation-delay: -0.32s;
  }
  .loader:after {
    left: 1.5em;
  }
  @-webkit-keyframes load1 {
    0%,
    80%,
    100% {
      box-shadow: 0 0;
      height: 4em;
    }
    40% {
      box-shadow: 0 -2em;
      height: 5em;
    }
  }
  @keyframes load1 {
    0%,
    80%,
    100% {
      box-shadow: 0 0;
      height: 4em;
    }
    40% {
      box-shadow: 0 -2em;
      height: 5em;
    }
  }
</style>
