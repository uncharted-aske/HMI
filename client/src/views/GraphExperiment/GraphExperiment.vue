<template>
  <div class="view-container">
    <div id="test" style="margin: 10px; width:50%; height: 450px; border: 1px solid #888; background: #FCFCFC" />
  </div>
</template>

<script lang="ts">
  import _ from 'lodash';

  import Component from 'vue-class-component';
  import Vue from 'vue';
  import * as d3 from 'd3';
  import { SVGRenderer } from 'svg-flowgraph';
  import Adapter from '@/graphs/svg/elk/adapter';
  import { layered } from '@/graphs/svg/elk/layouts';

  import { pathFn } from '@/utils/SVGUtil';

  class TestRenderer extends SVGRenderer {
    constructor (options:any) {
      super(options);
    }
    renderNode(nodeSelection: d3.Selection<any, any, any, any>): void {
      nodeSelection.each(function() {
        const selection = d3.select(this);

        if ((selection.datum() as any).nodes) {
          selection.append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', d => (d as any).width)
            .attr('height', d => (d as any).height)
            .style('fill', '#EEF')
            .style('stroke', '#888');
        } else {
          selection.append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', d => (d as any).width)
            .attr('height', d => (d as any).height)
            .style('fill', '#DDD')
            .style('stroke', '#CCC');
        }
      });
      nodeSelection.append('text')
        .attr('x', d => d.nodes ? 0 : 0.5 * d.width)
        .attr('y', d => d.nodes ? -5 : 25)
        .style('fill', '#333')
        .style('font-weight', '600')
        .style('text-anchor', d => d.nodes ? 'left' : 'middle')
        .text(d => d.label);
    }

    renderEdge(edgeSelection) {
      edgeSelection.append('path')
        .attr('d', d => pathFn(d.points))
        .style('fill', 'none')
        .style('stroke', '#000')
        .attr('marker-end', d => {
          const source = d.source.replace(/\s/g, '');
          const target = d.target.replace(/\s/g, '');
          return `url(#arrowhead-${source}-${target})`;
        })
        .attr('marker-start', d => {
          const source = d.source.replace(/\s/g, '');
          const target = d.target.replace(/\s/g, '');
          return `url(#start-${source}-${target})`;
        });
    }
  }



 const DATA = {
  nodes: [
    { id: 'Node A', label: 'Node A' },
    { id: 'Node B', label: 'Node B' },
    { id: 'Node C', label: 'Node C' },
    { id: 'L1', label: 'L1',
      nodes: [
        { id: 'Sub 1', label: 'Sub 1' },
        { id: 'L2', label: 'L2',
          nodes: [
            { id: 'L3', label: 'L3',
              nodes: [
                { id: 'L4', label: 'L4' }
              ]
            }
          ]
        }
      ]
    }
  ],
  edges: [
    { id: 'Edge 1', source: 'Node A', target: 'Node B' },
    { id: 'Edge 2', source: 'Sub 1', target: 'Node B' },
    { id: 'Edge 3', source: 'L4', target: 'Node A' },
    { id: 'Edge 4', source: 'L4', target: 'L4' },
    { id: 'Edge 5', source: 'Sub 1', target: 'Node C' }
  ]
};
  
  @Component({ })
  export default class GraphExperiment extends Vue {
    graph = DATA; // Set type
    renderer = null;

    mounted (): void {
      this.renderer = new TestRenderer({
        el: document.getElementById('test'),
        adapter: new Adapter({ nodeWidth: 130, nodeHeight: 30, layout: layered }),
        renderMode: 'basic',
        useEdgeControl: false,
        useMinimap: false,
        addons: []
      });
      this.refresh();
    }

    refresh (): void {
      this.renderer.setData(this.graph);
      this.renderer.render();
    }

   
  }
</script>

<style lang="scss" scoped>
  @import "@/styles/variables";

  .content {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
  }

  .grafer {
    flex-grow: 1;
  }
</style>
