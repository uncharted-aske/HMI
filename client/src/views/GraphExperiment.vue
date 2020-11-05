<template>
  <div>
    <div style="margin: 5px 0">
      <button
        class="btn btn-primary btn-xs"
        @click="loadDefault()">Config 1
      </button>
      &nbsp;
      <button
        class="btn btn-primary btn-xs"
        @click="loadConfig2()">Config 2
      </button>
      &nbsp;
      <!-- <button
        class="btn btn-primary btn-xs"
        @click="loadConfig3()">Config 3
      </button> -->
      &nbsp;
      <button
        class="btn btn-primary btn-xs"
        @click="toggleHelp()">Toggle Help
      </button>
    </div>
    <div
      ref="test"
      style="width:100%; height: 450px; border: 1px solid #888; background: #FCFCFC"
    />
  </div>
</template>

<script>
  import * as d3 from 'd3';

  import ELKAdapter from '@/graphs/svg/elk/adapter';
  import { layered } from '@/graphs/svg/elk/layouts';
  import SVGRenderer from '@/graphs/svg/SVGRenderer';
  import svgUtil from '@/utils/SVGUtil.js';
  const CX = {};

  window.d3 = d3;

  const pathFn = svgUtil.pathFn.curve(d3.curveBasis);

  const infoLines = [
    '### Interactions:',
    '- Click a compound-node to collapse/expand it',
    '- Double-click a leaf-node to enlarge/shrink it.',
    '',
    '### API (in console):',
    '- renderer.group(name, [nodeId1, nodeId2 ... ])',
    '- renderer.ungroup(name)',
    '- renderer.moveTo(nodeId)',
    '- renderer.highlight({ nodes: [nodeId ...], edges: [ {source, target} ...] }, { duration, color })',
    '',
    '### Example:',
    '- renderer.highlight(renderer._trace("Sub 2"), { duration: 15000 })',
  ];

  class TestRenderer extends SVGRenderer {
    // Basic
    // renderNode(nodeSelection) {
    //   nodeSelection.each(function() {
    //     const selection = d3.select(this);
    //     if (selection.datum().nodes) {
    //       selection.append('rect')
    //         .attr('x', 0)
    //         .attr('y', 0)
    //         .attr('width', d => d.width)
    //         .attr('height', d => d.height)
    //         .style('fill', d => {
    //           if (d.collapsed === true) return '#f80';
    //           return d.nodes ? '#F8F8F8' : '#FE0';
    //         })
    //         .style('stroke', '#888')
    //         .style('stroke-width', 2);
    //     } else {
    //       selection.append('rect')
    //         .attr('x', 0)
    //         .attr('y', 0)
    //         .attr('width', d => d.width)
    //         .attr('height', d => d.height)
    //         .style('fill', '#DDD')
    //         .style('stroke', '#888')
    //         .style('stroke-width', 1);
    //     }
    //   });
    //   nodeSelection.append('text')
    //     .attr('x', d => d.nodes ? 0 : 0.5 * d.width)
    //     .attr('y', d => d.nodes ? -5 : 25)
    //     .style('fill', '#333')
    //     .style('font-weight', '600')
    //     .style('text-anchor', d => d.nodes ? 'left' : 'middle')
    //     .text(d => d.data.label);
    // }

    renderEdgeControl (selection) {
      selection.append('circle')
        .attr('r', 3.0)
        .style('stroke', '#888')
        .style('fill', '#D50')
        .style('cursor', 'pointer');
    }

    renderNodeRemoved (nodeSelection) {
      nodeSelection.each(function () {
        d3.select(this)
          .transition()
          .on('end', function () {
            d3.select(this.parentNode).remove();
          })
          .duration(1500)
          .style('opacity', 0.2)
          .select('rect').style('fill', '#f00');
      });
    }

    renderNodeUpdated (nodeSelection) {
      nodeSelection.each(function () {
        const selection = d3.select(this);
        selection.select('rect')
          .transition()
          .duration(1000)
          .attr('width', d => d.width)
          .attr('height', d => d.height);

        if (selection.datum().collapsed === true) {
          selection.append('text')
            .classed('collapsed', true)
            .attr('x', 13)
            .attr('y', 30)
            .style('font-size', 30)
            .text('+');
        } else {
          selection.select('.collapsed').remove();
        }
      });
    }

    renderNodeAdded (nodeSelection) {
      nodeSelection.each(function () {
        const selection = d3.select(this);
        selection.selectAll('*').remove();

        selection.append('rect')
          .attr('x', 0)
          .attr('rx', 5)
          .attr('y', 0)
          .attr('width', d => d.width)
          .attr('height', d => d.height)
          .style('fill', d => {
            return d.nodes ? '#F8F8F8' : '#EEE';
          })
          .style('stroke', '#888')
          .style('stroke-width', 2);

        if (selection.datum().type === 'custom') {
          selection.select('rect').style('stroke-dasharray', 4).style('fill', '#CCF');
        }
      });

      nodeSelection.style('cursor', 'pointer');

      nodeSelection.append('text')
        .attr('x', d => d.nodes ? 0 : 0.5 * d.width)
        .attr('y', d => d.nodes ? -5 : 25)
        .style('fill', '#333')
        .style('font-weight', '600')
        .style('text-anchor', d => d.nodes ? 'left' : 'middle')
        .text(d => d.data.label);
    }

    renderEdge (edgeSelection) {
      edgeSelection.append('path')
        .classed('edge-path', true)
        .attr('cursor', 'pointer')
        .attr('d', d => pathFn(d.points))
        .style('fill', 'none')
        .style('stroke', '#000')
        .style('stroke-width', 2)
        .attr('marker-end', d => {
          const source = d.data.source.replace(/\s/g, '');
          const target = d.data.target.replace(/\s/g, '');
          return `url(#arrowhead-${source}-${target})`;
        })
        .attr('marker-start', d => {
          const source = d.data.source.replace(/\s/g, '');
          const target = d.data.target.replace(/\s/g, '');
          return `url(#start-${source}-${target})`;
        });
    }

    renderDebug () {
      const background = d3.select(this.svgEl).select('.background-layer');
      background.selectAll('.info').remove();
      const info = background.append('g').classed('info', true);

      info.selectAll('text')
        .data(infoLines)
        .enter()
        .append('text')
        .style('font-size', '14px')
        .style('stroke', 'none')
        .style('opacity', 0.6)
        .attr('x', 3)
        .attr('y', (d, i) => (i + 1) * 20)
        .text(d => d);
    }
  }

  const lazy = (s) => { return { id: s, concept: s, label: s }; };
  const DATA = {
    nodes: [
      lazy('Node 0'),
      lazy('Node 1'),
      lazy('Node 2'),
      {
        ...lazy('Group'),
        nodes: [
          lazy('Sub 1'),
          lazy('Sub 2'),
        ],
      },
      lazy('Node 3'),
      {
        ...lazy('Node 4'),
        nodes: [
          {
            ...lazy('Sub 3'),
            nodes: [
              lazy('Sub-sub'),
            ],
          },
        ],
      },
    ],
    edges: [
      { id: '0', source: 'Node 0', target: 'Node 1' },
      { id: '1', source: 'Node 1', target: 'Node 2' },
      { id: '2', source: 'Node 2', target: 'Sub 1' },
      { id: '3', source: 'Node 2', target: 'Sub 2' },
      { id: '4', source: 'Sub 2', target: 'Node 3' },
      { id: '5', source: 'Node 0', target: 'Node 3' },
      { id: '6', source: 'Node 3', target: 'Node 4' },
    ],
  };

  const DATA2 = {
    nodes: [
      lazy('Node 0'),
      lazy('Node 1'),
      lazy('Node 2'),
      {
        ...lazy('Group'),
        nodes: [
          lazy('Sub 1'),
          lazy('Sub 2'),
          lazy('Sub 3'),
        ],
      },
    ],
    edges: [
      { id: '0', source: 'Node 0', target: 'Node 1' },
      { id: '1', source: 'Node 1', target: 'Node 2' },
      { id: '2', source: 'Node 2', target: 'Sub 1' },
      { id: '3', source: 'Node 2', target: 'Sub 2' },
    ],
  };

  // const DATA3 = { nodes: [], edges: [] };
  // CX.nodes.forEach(n => {
  //   DATA3.nodes.push({
  //     id: n.id,
  //     concept: n.name,
  //     label: n.name
  //   });
  // });
  // CX.edges.forEach(e => {
  //   DATA3.edges.push({
  //     id: e.id,
  //     source: e.source.id,
  //     target: e.target.id
  //   });
  // });

  // console.log(`nodes ${DATA3.nodes.length} , edges ${DATA3.edges.length}`);

  export default {
    name: 'GraphExperiment',
    created () {
      this.renderer = null;
    },
    mounted () {
      this.renderer = new TestRenderer({
        el: this.$refs.test,
        adapter: new ELKAdapter({ nodeWidth: 100, nodeHeight: 50, layout: layered }),
        renderMode: 'delta',

        useDebugger: true,
        useEdgeControl: true,
        edgeControlOffsetType: 'unit',
        edgeControlOffset: -20,
      });
      this.renderer.setCallback('nodeClick', (node, renderer, event) => {
        console.log(event);
        if (!node.datum().collapsed || node.datum().collapsed === false) {
          this.renderer.collapse(node.datum().id);
        } else {
          this.renderer.expand(node.datum().id);
        }
      });
      this.renderer.setCallback('nodeDblClick', (node) => {
        if (node.datum().focused === true) {
          this.renderer.unfocus(node.datum().id);
        } else {
          this.renderer.focus(node.datum().id);
        }
      });

      window.renderer = this.renderer;
      this.renderer.setData(DATA);
      this.renderer.render();
    },
    methods: {
      loadDefault () {
        this.renderer.setData(DATA);
        this.renderer.render();
      },
      loadConfig2 () {
        this.renderer.setData(DATA2);
        this.renderer.render();
      },
      // loadConfig3() {
      //   this.renderer.setData(DATA3);
      //   this.renderer.render();
      // },
      moveTo (id) {
        this.renderer.moveTo(id, 1500);
      },
      toggleHelp () {
        this.renderer.options.useDebugger = !this.renderer.options.useDebugger;
        if (this.renderer.options.useDebugger === false) {
          d3.select(this.renderer.svgEl).select('.background-layer').selectAll('*').remove();
        }
        this.renderer.render();
      },
    },
  };
</script>

<style lang="scss" scoped>
</style>
