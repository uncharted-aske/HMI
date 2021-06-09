<template>
  <div class="mb-2" ref="container">
    <div class="header" :style="{color: strokeColor}">
      {{title}}
      <slot/>
    </div>
  </div>
</template>

<script lang="ts">
  import _ from 'lodash';
  import * as d3 from 'd3';

  import Component from 'vue-class-component';
  import Vue from 'vue';
  import { Prop, Watch } from 'vue-property-decorator';
  import { AxisScale } from 'd3';

  import { Colors } from '@/graphs/svg/encodings';

  const DEFAULT_CONFIG = {
    margin: {
      top: 15,
      right: 15,
      bottom: 35,
      left: 35,
    },
  };

  const DEFAULT_STYLE = {
    node: {
      fill: Colors.NODES.DEFAULT,
      stroke: Colors.STROKE,
      strokeWidth: 1,
      borderRadius: 5,
    },
    edge: {
      fill: 'none',
      strokeWidth: 2.5,
      controlRadius: 6,
      controlStrokeWidth: 2,
      controlStrokeColor: Colors.NODES.DEFAULT,
    },
    label: {
      text: Colors.LABELS.LIGHT,
    },
  };

@Component
  export default class VariablePanel extends Vue {
    @Prop({ default: 'Title' }) title: string;
    @Prop({
      default: () => [
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 8, 8, 8, 6, 2, 1].map((v, i) => ({ x: i, y: v })),
        [1, 2, 3, 3, 5, 9, 2, 1, 5, 6, 8, 3, 6, 8, 2, 4, 5].map((v, i) => ({ x: i, y: v })),
      ],
    }) data: any;

    width: number;
    height: number;
    margin: any;
    private dataHash: string;

    @Watch('data') onDataChange (): void {
      this.refresh();
    }

    get strokeColor (): string {
        return Colors.LABELS.LIGHT;
    }

    mounted (): void {
      this.width = 500;
      this.height = 150;
      this.margin = DEFAULT_CONFIG.margin;
      this.refresh();
    }

    length (path: unknown): any {
      // @ts-expect-error: Type
      return d3.create('svg:path').attr('d', path).node().getTotalLength();
    }

    get line (): any {
      return d3.line()
        .curve(d3.curveCatmullRom)
      // @ts-expect-error: Type
        .x(d => this.xScale(d.x))
      // @ts-expect-error: Type
        .y(d => this.yScale(d.y));
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    halo (text): void {
      text.select(function () { return this.parentNode.insertBefore(this.cloneNode(true), this); })
        .attr('fill', 'none')
        .attr('stroke', 'white')
        .attr('stroke-width', 4)
        .attr('stroke-linejoin', 'round');
    }

    get xScale (): AxisScale<any> {
      const range = d3.extent(this.data.flat(), (d: any) => d.x);
      return d3.scaleLinear()
        .domain(range as number[]).nice()
        .range([this.margin.left, this.width - this.margin.right]);
    }

    get yScale (): AxisScale<any> {
      const range = d3.extent(this.data.flat(), (d: any) => d.y);
      return d3.scaleLinear()
        .domain(range as number[]).nice()
        .range([this.height - this.margin.bottom, this.margin.top]);
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    xAxis (g): void {
      return g
        .attr('transform', `translate(0,${this.height - this.margin.bottom})`)
        .call(d3.axisBottom(this.xScale).ticks(this.width / 80))
        .call(g => g.select('.domain').remove())
        .call(g => g.selectAll('.tick line').clone()
          .attr('y2', -this.height)
          .attr('stroke-opacity', 0.1))
          .style('color', DEFAULT_STYLE.label.text)
          .style('stroke', DEFAULT_STYLE.label.text)
        .call(g => g.append('text')
          .attr('x', this.width - 4)
          .attr('y', -4)
          .attr('font-weight', 'bold')
          .attr('text-anchor', 'end')
          .attr('fill', 'black')
          .text(this.data.x));
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    yAxis (g): void {
      return g
        .attr('transform', `translate(${this.margin.left},0)`)
        .call(d3.axisLeft(this.yScale).ticks(null))
        .call(g => g.select('.domain').remove())
        .call(g => g.selectAll('.tick line').clone()
          .attr('x2', this.width)
          .attr('stroke-opacity', 0.1))
          .style('color', DEFAULT_STYLE.label.text)
          .style('stroke', DEFAULT_STYLE.label.text)
        .call(g => g.select('.tick:last-of-type text').clone()
          .attr('x', 4)
          .attr('text-anchor', 'start')
          .attr('font-weight', '300')
          .attr('fill', 'black')
          .text(this.data.y));
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    drawDataset (svg, data): void {
      const l = this.length(this.line(data));

      // Draw data line
      svg.append('path')
          .datum(data)
          .attr('fill', 'none')
          .attr('stroke', Colors.NODES.DEFAULT)
          .attr('stroke-width', DEFAULT_STYLE.edge.strokeWidth)
          .attr('stroke-linejoin', 'round')
          .attr('stroke-linecap', 'round')
          .attr('stroke-dasharray', `0,${l}`)
          .attr('d', this.line)
        .transition()
          .duration(500)
          .ease(d3.easeLinear)
          .attr('stroke-dasharray', `${l},${l}`);

      // Draw data dots
      svg.append('g')
          .attr('fill', 'white')
          .attr('stroke', 'black')
          .attr('stroke-width', DEFAULT_STYLE.node.strokeWidth)
        .selectAll('circle')
        .data(data)
        .join('circle')
          .attr('cx', d => this.xScale(d.x))
          .attr('cy', d => this.yScale(d.y))
          .attr('r', 3);
    }

    refresh (): void {
      // if (_.isEmpty(this.data)) return;
      const currentDataHash = JSON.stringify(this.data);
      if (currentDataHash === this.dataHash) {
        return;
      }

      this.dataHash = currentDataHash;

      d3.select(this.$refs.container as any).selectChildren('svg').remove();

      const svg = d3.select(this.$refs.container as any).append('svg')
        .attr('preserveAspectRatio', 'xMinYMin meet')
        .attr('viewBox', `0 0 ${this.width} ${this.height}`);

      svg.append('g')
        .call(this.xAxis);

      svg.append('g')
        .call(this.yAxis);

      this.data.map(dataset => this.drawDataset(svg, dataset));

      svg.node();
    }
  }

</script>

<style lang="scss" scoped>
@import "@/styles/variables";

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 700;
  padding-bottom: 5px;
  padding-left: 15px;
}
</style>
