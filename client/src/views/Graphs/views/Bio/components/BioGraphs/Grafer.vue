<template>
  <div class="grafer-container">
    <canvas class="grafer-canvas" ref="canvas"></canvas>
    <div v-if="loading" class="loading">
      <div class="loader">Loading...</div>
    </div>
  </div>
</template>

<script lang="ts">
  import { GraferController, GraferControllerData, graph } from '@uncharted.software/grafer';
  import { DataFile } from '@dekkai/data-source';
  import Component from 'vue-class-component';
  import Vue from 'vue';

  @Component
  export default class Grafer extends Vue {
    private loading: boolean = true;
    private controller: GraferController;

    public mounted (): void {
      this.loadGraph().then(data => {
        this.controller = new GraferController(this.$refs.canvas, data);
        this.loading = false;
      });
    }

    // temporary demo functions
    async loadGraph (): Promise<GraferControllerData> {
      const points = {
        data: [],
      };

      await this.parseJSONL('/grafer/points_dodgy.jsonl', json => {
        points.data.push(json);
      });

      const clusterLayer = {
        name: 'Clusters',
        labels: {
          type: 'RingLabel',
          data: [],
          mappings: {
            background: (): boolean => false,
            fontSize: (): number => 14,
            padding: (): number => 0,
          },
          options: {
            visibilityThreshold: 160,
            repeatLabel: -1,
            repeatGap: 64,
          },
        },
        edges: {
          type: 'CurvedPath',
          data: [],
          options: {
            alpha: 0.04,
            nearDepth: 0.9,
          },
        },
      };

      await this.parseJSONL('/grafer/clusters.jsonl', json => {
        clusterLayer.labels.data.push(Object.assign({}, json, {
          color: 3,
        }));
      });

      await this.parseJSONL('/grafer/edges_dodgy.jsonl', json => {
        clusterLayer.edges.data.push(Object.assign({}, json, {
          sourceColor: 0,
          targetColor: 0,
        }));
      });

      const nodeLayer = {
        name: 'Nodes',
        nodes: {
          type: 'Circle',
          data: [],
        },
        edges: {
          data: [],
          options: {
            alpha: 0.55,
            nearDepth: 0.9,
          },
        },
        labels: {
          type: 'PointLabel',
          data: [],
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

      await this.parseJSONL('/grafer/nodes.jsonl', json => {
        nodeLayer.nodes.data.push(Object.assign({}, json, {
          color: 1,
        }));
      });
      nodeLayer.labels.data = nodeLayer.nodes.data;

      await this.parseJSONL('/grafer/intra_edges.jsonl', json => {
        nodeLayer.edges.data.push(Object.assign({}, json, {
          sourceColor: 2,
          targetColor: 2,
        }));
      });

      const colors = [
        '#5e81ac',
        '#d08770',
        '#ebcb8b',
        '#81a1c1',
      ];

      const layers = [
        clusterLayer,
        nodeLayer,
      ];

      return { points, colors, layers };
    }

    async parseJSONL (input: string, cb: (o: any) => void): Promise<void> {
      const file = await DataFile.fromRemoteSource(input);

      // load 16MB chunks
      const sizeOf2MB = 2 * 1024 * 1024;
      const byteLength = await file.byteLength;
      const decoder = new TextDecoder();
      const lineBreak = '\n'.charCodeAt(0);

      for (let offset = 0; offset <= byteLength; offset += sizeOf2MB) {
        const chunkEnd = Math.min(offset + sizeOf2MB, byteLength);
        const chunk = await file.loadData(offset, chunkEnd);
        const view = new DataView(chunk);
        let start = 0;
        for (let i = 0, n = chunk.byteLength; i < n; ++i) {
          if (view.getUint8(i) === lineBreak || offset + i === byteLength) {
            const statementBuffer = new Uint8Array(chunk, start, i - start);
            start = i + 1;

            const str = decoder.decode(statementBuffer);
            const json = JSON.parse(str);

            cb(json);
          }
        }

        if (start < chunk.byteLength) {
          offset -= chunk.byteLength - start;
        }

        // console.log(`${chunkEnd} / ${byteLength} - ${((chunkEnd/byteLength) * 100).toFixed(2)}%`);
      }
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
