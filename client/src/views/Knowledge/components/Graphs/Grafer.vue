<template>
  <div class="grafer-container">
    <canvas class="grafer-canvas" ref="canvas"></canvas>
    <loader :loading="loading" class="loading"/>
  </div>
</template>

<script lang="ts">
  import _ from 'lodash';
  import {
    GraferController,
    GraferNodesType,
    graph,
    GraferLayerData,
  } from '@uncharted.software/grafer';
  import { Component } from 'vue-property-decorator';
  import Vue from 'vue';
  import chroma from 'chroma-js';
  import {
    GraferData,
    GroupCentroid,
    GroupColor,
    GroupHullEdge,
    LayoutInfo,
  } from './convertDataToGraferV4';
  import {
    CLUSTER_NODES_LAYERS_CONFIG,
  } from '@/utils/GraferUtil';

  import Loader from '@/components/widgets/Loader.vue';
  import eventHub from '@/eventHub';

  const components = {
    Loader,
  };

  enum ColorRegistryType {
    mapped = 'mapped',
    indexed = 'indexed',
  }

  interface ColorLevel {
    top: GroupColor[],
    low: GroupColor[],
  }

  @Component({ components })
  export default class Grafer extends Vue {
    private loading: boolean = true;
    private controller: GraferController;

    // Initialize as undefined to prevent Vue from observing changes within these large datasets
    // Grafer data is stored as they are required for mapping bgraph queries to grafer layers
    graferNodesData: any = undefined;

    mounted (): void {
      eventHub.$on('load-grafer-data', this.loadGraph);
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

    destroyed (): void {
      eventHub.$off('load-layers');
      eventHub.$off('update-layers');
      eventHub.$off('remove-layers');
      eventHub.$off('foreground-full-graph');
      eventHub.$off('background-full-graph');
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
      layers.forEach(l => {
        if (l.name.includes('highlight')) {
          // Ignore query/highlight layers
          return;
        }
        if (l.nodes) {
          Object.assign(l.nodes, CLUSTER_NODES_LAYERS_CONFIG.options.foreground.nodes);
        }
        if (l.edges) {
          Object.assign(l.edges, CLUSTER_NODES_LAYERS_CONFIG.options.foreground.edges);
        }
      });
    }

    backgroundFullGraph (): void {
      // Get internal pointer to graph layers
      // NOTE: This is a temporary interface, Grafer is developing a user interface into layers that
      //       this should be replaced with
      const layers = this.controller.viewport.graph.layers;
      layers.forEach(l => {
        if (l.name.includes('highlight')) {
          // Ignore query/highlight layers
          return;
        }
        if (l.nodes) {
          Object.assign(l.nodes, CLUSTER_NODES_LAYERS_CONFIG.options.background.nodes);
        }
        if (l.edges) {
          Object.assign(l.edges, CLUSTER_NODES_LAYERS_CONFIG.options.background.edges);
        }
      });
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

    getBasicLayer (name: string, nodeType: GraferNodesType, visibilityThreshold: number, pixelSizing: boolean = true): GraferLayerData {
        const data = [];
        return {
            name,
            nodes: {
                type: nodeType,
                data,
                mappings: {
                    radius: (): number => 50,
                },
                options: {
                    pixelSizing,
                    nearDepth: 0.26,
                    farDepth: 0.5,
                    fade: 0.50,
                },
            },
            labels: {
                type: 'PointLabel',
                data,
                mappings: {
                    background: (): boolean => false,
                    fontSize: (): number => 12,
                    padding: (): [number, number] => [8, 5],
                },
                options: {
                    visibilityThreshold,
                    labelPlacement: graph.labels.PointLabelPlacement.CENTER,
                    renderBackground: false,
                    nearDepth: 0.0,
                    farDepth: 0.25,
                },
            },
        };
    }

    makeCentroidLayers (layers: GraferLayerData[], data: GroupCentroid[], levels: number = 4): Map<string, GroupCentroid> {
        const centroidLayersTop = [];
        const centroidLayers = [];
        for (let i = 0; i < levels; ++i) {
            centroidLayersTop.push(this.getBasicLayer(`Centroids_top_${i}`, 'Ring', 0.01));
            centroidLayers.push(this.getBasicLayer(`Centroids_${i}`, 'Ring', 0.1));
        }

        const centroidMap: Map<string, GroupCentroid> = new Map();
        for (const centroid of data) {
            const nodes = centroid.top ? centroidLayersTop[centroid.level].nodes : centroidLayers[centroid.level].nodes;
            nodes.data.push(centroid);
            centroidMap.set(centroid.id, centroid);
        }
        layers.push(...centroidLayersTop, ...centroidLayers);

        return centroidMap;
    }

    computeColors (
      colors: string[],
      colorLevels: Map<number, ColorLevel>,
      centroidMap: Map<string, GroupCentroid>,
      levelNumber = 0,
    ): void {
        const level = colorLevels.get(levelNumber);
        const topStep = Math.floor(360 / level.top.length);
        const lowStep = Math.floor(topStep / Math.ceil(level.low.length / level.top.length + 1));

        for (let i = 0, n = level.top.length; i < n; ++i) {
            const info = level.top[i];
            const color = chroma.hsl(topStep * i, 1, 0.5).hex();
            const centroid = centroidMap.get(info.id);
            colors[centroid.color] = '#ffffff';
            colors[info.primary] = color;
            for (const childID of info.inherited) {
                colors[childID] = color;
            }
        }

        for (let i = 0, n = level.low.length; i < n; ++i) {
            const info = level.low[i];
            const color = chroma.hsl(lowStep * (i + 1), 1, 0.5).hex();
            const centroid = centroidMap.get(info.id);
            colors[centroid.color] = '#ffffff';
            colors[info.primary] = color;
            for (const childID of info.inherited) {
                colors[childID] = color;
            }
        }

        const gray = '#a0a0a0';
        for (let i = 0, n = colors.length; i < n; ++i) {
            if (colors[i] === null) {
                colors[i] = gray;
            }
        }
    }

    loadLevelLayers (nodes: any[], shapes: GroupHullEdge[]): IterableIterator<any> {
        const levelMap = new Map();

        for (const node of nodes) {
            if (!levelMap.has(node.level)) {
                let fade = 1 - 0.10 - 0.25 * node.level;
                if (node.level === -1) {
                  fade = 0.2;
                }
                levelMap.set(node.level, {
                    name: `Level_${node.level === -1 ? 'noise' : node.level}`,
                    nodes: {
                        type: 'Circle',
                        data: [],
                        options: {
                            pixelSizing: true,
                            fade,
                        },
                    },
                    edges: {
                        data: [],
                        options: {
                            alpha: 0.55,
                            nearDepth: 0.9,
                            fade,
                        },
                    },
                });
            }

            levelMap.get(node.level).nodes.data.push(node);
        }

        for (const shape of shapes) {
            if (!levelMap.has(shape.level)) {
                levelMap.set(shape.level, {
                    name: `Level_${shape.level === -1 ? 'noise' : shape.level}`,
                    nodes: {
                        type: 'Circle',
                        data: [],
                        options: {
                            pixelSizing: true,
                        },
                    },
                    edges: {
                        data: [],
                        options: {
                            alpha: 0.55,
                            nearDepth: 0.9,
                            fade: 0.20,
                        },
                    },
                });
            }

            levelMap.get(shape.level).edges.data.push(shape);
        }

        return levelMap.values();
    }

    async loadGraph (data: GraferData, info: LayoutInfo): Promise<void> {
        const layers = [];

        const colors = [];
        const colorLevels: Map<number, ColorLevel> = new Map();

        for (const color of data.colors) {
            if (colors.length <= color.primary) {
                for (let i = colors.length; i <= color.primary; ++i) {
                    colors.push(null);
                }
            }
            let colorLevel = colorLevels.get(color.level);
            if (!colorLevel) {
                colorLevel = {
                    top: [],
                    low: [],
                };
                colorLevels.set(color.level, colorLevel);
            }
            if (color.top) {
                colorLevel.top.push(color);
            } else {
                colorLevel.low.push(color);
            }
        }

        const points = {
            data: data.points,
        };

        layers.push(...this.loadLevelLayers(data.nodes, data.shapes));

        const centroidMap = this.makeCentroidLayers(layers, data.centroids, info.levelCount);
        if (data.colors.length) {
            this.computeColors(colors, colorLevels, centroidMap, info.level);
        }
        this.controller = new GraferController(this.$refs.canvas as HTMLCanvasElement, { points, colors, layers }, {
            viewport: {
                colorRegistryType: ColorRegistryType.indexed,
                colorRegistryCapacity: colors.length,
            },
        });

        // disable all centroid layers of levels other than the selected one
        const graphLayers = this.controller.viewport.graph.layers;
        for (const layer of graphLayers) {
          const components = layer.name.split('_');
          if (components[0] === 'Centroids') {
            const level = parseInt(components[components.length - 1]);
            if (level !== info.level) {
              layer.enabled = false;
            }
          }
        }

        this.forwardEvents(this.controller);
        this.loading = false;
        this.$emit('loaded-layers', layers);
        this.$emit('loaded');
    }
  }

</script>

<style scoped>
  .grafer-container {
    height: 100%;
    position: relative;
    width: 100%;
  }

  .grafer-canvas {
    height: 100%;
    width: 100%;
  }

  .loading {
    color: var(--nord4);
    left: 50%;
    position: absolute;
    top: 50%;
    transform: translate(-50%, -50%);
    user-select: none;
  }
</style>
