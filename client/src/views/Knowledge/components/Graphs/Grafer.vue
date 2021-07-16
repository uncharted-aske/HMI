<template>
  <div class="grafer-container">
    <canvas class="grafer-canvas" ref="canvas"></canvas>
    <loader :loading="loading" class="loading"/>
  </div>
</template>

<script lang="ts">
  import {
    GraferController,
    GraferNodesType,
    graph,
    GraferLayerData,
  } from '@uncharted.software/grafer';
  import { Component, Prop } from 'vue-property-decorator';
  import Vue from 'vue';
  import chroma from 'chroma-js';
  import {
    convertDataToGraferV4,
    GroupCentroid,
    GroupHullEdge,
    LayoutInfo,
  } from './convertDataToGraferV4';

  import { getS3Util } from '@/utils/FetchUtil';

  import Loader from '@/components/widgets/Loader.vue';

  const components = {
    Loader,
  };

  enum ColorRegistryType {
    mapped = 'mapped',
    indexed = 'indexed',
  }

  @Component({ components })
  export default class Grafer extends Vue {
    private loading: boolean = true;
    private controller: GraferController;

    @Prop({ default: 'wisconsin-knowledge' })
    private model: string;

    @Prop({ default: null })
    private layer: string;

    // Initialize as undefined to prevent Vue from observing changes within these large datasets
    // Grafer data is stored as they are required for mapping bgraph queries to grafer layers
    graferNodesData: any = undefined;

    public async mounted (): Promise<void> {
      const [
        nodesFile,
        nodeAttsFile,
        nodeLayoutFile,
        groupsFile,
      ] = await Promise.all([
        // getS3Util('research/KB/dist/kaggle/v4.0_citations_small/nodes.jsonl'),
        // getS3Util('research/KB/dist/kaggle/v4.0_citations_small/nodeAtts.jsonl'),
        // getS3Util('research/KB/dist/kaggle/v4.0_citations_small/nodeLayout.jsonl'),
        // getS3Util('research/KB/dist/kaggle/v4.0_citations_small/groups.jsonl'),
        // getS3Util('research/KB/dist/kaggle/v4.0_citation/nodes.jsonl'),
        // getS3Util('research/KB/dist/kaggle/v4.0_citation/nodeAtts.jsonl'),
        // getS3Util('research/KB/dist/kaggle/v4.0_citation/nodeLayout.jsonl'),
        // getS3Util('research/KB/dist/kaggle/v4.0_citation/groups.jsonl'),
        // getS3Util('research/KB/dist/wisconsin/xdd-covid-19-8Dec-doc2vec/v4.0_top2vec/nodes.jsonl'),
        // getS3Util('research/KB/dist/wisconsin/xdd-covid-19-8Dec-doc2vec/v4.0_top2vec/nodeAtts.jsonl'),
        // getS3Util('research/KB/dist/wisconsin/xdd-covid-19-8Dec-doc2vec/v4.0_top2vec/nodeLayout.jsonl'),
        // getS3Util('research/KB/dist/wisconsin/xdd-covid-19-8Dec-doc2vec/v4.0_top2vec/groups.jsonl'),
        getS3Util('research/KB/dist/wisconsin/xdd-covid-19-8Dec-doc2vec/v4.0_nonTop2Vec/nodes.jsonl'),
        getS3Util('research/KB/dist/wisconsin/xdd-covid-19-8Dec-doc2vec/v4.0_nonTop2Vec/nodeAtts.jsonl'),
        getS3Util('research/KB/dist/wisconsin/xdd-covid-19-8Dec-doc2vec/v4.0_nonTop2Vec/nodeLayout.jsonl'),
        getS3Util('research/KB/dist/wisconsin/xdd-covid-19-8Dec-doc2vec/v4.0_nonTop2Vec/groups.jsonl'),
      ]);

      const info: LayoutInfo = {
        nodes: 'No file selected.',
        nodesFile: nodesFile as unknown as File,
        nodeAtts: 'No file selected.',
        nodeAttsFile: nodeAttsFile as unknown as File,
        nodeLayout: 'No file selected.',
        nodeLayoutFile: nodeLayoutFile as unknown as File,
        groups: 'No file selected.',
        groupsFile: groupsFile as unknown as File,
        alpha: 18.00,
        level: 1.00,
        levelCount: 4.00,
        maxLabelLength: 25.00,
        topGroupThreshold: 500.00,
        pointRadius: 20.00,
        positionScale: 50000.00,
      };

      this.loadGraph(info);
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
        if (event.description === 'grafer_click') {
          args[0] = Object.assign(args[0], this.graferNodesData.get(args[0].id));
          args[0].extras.bibjson.identifier[0].id = args[0].extras.bibjson.journal;
          console.log(this.graferNodesData.get(args[0].id));
        }
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
                    // fade: 0.0,
                },
            },
        };
    }

    makeCentroidLayers (layers: GraferLayerData[], data: GroupCentroid[], levels: number = 4): Map<number, any> {
        const centroidLayersTop = [];
        const centroidLayers = [];
        for (let i = 0; i < levels; ++i) {
            centroidLayersTop.push(this.getBasicLayer(`Centroids_top_${i}`, 'Ring', 0.01));
            centroidLayers.push(this.getBasicLayer(`Centroids_${i}`, 'Ring', 0.1));
        }

        const centroidMap = new Map();
        for (const centroid of data) {
            const nodes = centroid.top ? centroidLayersTop[centroid.level].nodes : centroidLayers[centroid.level].nodes;
            // let nodes;
            // if (centroid.top) {
            //   nodes = centroidLayersTop[centroid.level].nodes;
            // } else {
            //   continue;
            // }
            nodes.data.push(centroid);
            centroidMap.set(centroid.id, centroid);
        }

        layers.push(...centroidLayersTop, ...centroidLayers);
        // layers.push(...centroidLayersTop);

        return centroidMap;
    }

    computeColors (colors, colorMap, colorLevels, centroidMap, levelNumber = 0): void {
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
                    // labels: {
                    //   alpha: 1,
                    //   desaturate: 0,
                    //   fade: 0,
                    //   visibilityThreshold: 8,
                    //   labelPlacement: graph.labels.PointLabelPlacement.TOP,
                    // },
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

    async loadGraph (info: LayoutInfo): Promise<void> {
        if (!info.nodesFile || !info.nodeAttsFile || !info.nodeLayoutFile || !info.groupsFile) {
            return;
        }

        const data = await convertDataToGraferV4(info);

        // TODO: This takes up a lot of memory and will likely scale poorly
        this.graferNodesData = new Map();
        data.nodes.forEach(n => this.graferNodesData.set(n.id, n));

        const layers = [];

        const colors = [];
        const colorMap = new Map();
        const colorLevels = new Map();

        for (const color of data.colors) {
            if (colors.length <= color.primary) {
                for (let i = colors.length; i <= color.primary; ++i) {
                    colors.push(null);
                }
            }
            colorMap.set(color.id, color);
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

        // const nodeLayer = {
        //     name: 'Nodes',
        //     nodes: {
        //         type: 'Circle',
        //         data: data.nodes,
        //         options: {
        //             pixelSizing: true,
        //         },
        //     },
        //     edges: {
        //         data: data.shapes,
        //         options: {
        //             alpha: 0.55,
        //             nearDepth: 0.9,
        //         },
        //     },
        // };
        layers.push(...this.loadLevelLayers(data.nodes, data.shapes));

        const centroidMap = this.makeCentroidLayers(layers, data.centroids, info.levelCount);
        if (colorMap.size) {
            this.computeColors(colors, colorMap, colorLevels, centroidMap, info.level);
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
