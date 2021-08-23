<template>
  <div ref="container">
    <div class="header" :style="{color: strokeColor}">
      <span v-html="title"/>
      <slot/>
    </div>
  </div>
</template>

<script lang="ts">
  import * as d3 from 'd3';

  import Component from 'vue-class-component';
  import Vue from 'vue';
  import { Prop, Watch } from 'vue-property-decorator';
  import { AxisScale } from 'd3';

  import { createChart, axis, pathFn } from '@/utils/SVGUtil';

  import { Colors } from '@/graphs/svg/encodings';

  const DEFAULT_STYLE = {
    label: {
      text: Colors.LABELS.LIGHT,
    },
    polygon: {
      fill: '#647EA9',
      opacity: '0.4',
    },
  };

  const DEFAULT_CONFIG = {
    margin: {
      top: 15,
      right: 15,
      bottom: 35,
      left: 55,
    },
  };

@Component
  export default class MultiLinePlot extends Vue {
    @Prop({ default: 'Title' }) title: string;
    @Prop({ default: () => [[]] }) data: any;
    @Prop({ default: () => [] }) polygon: any;
    @Prop({ default: () => [] }) styles: any;

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
      this.width = 1000;
      this.height = 150;
      this.margin = DEFAULT_CONFIG.margin;
      this.refresh();
    }

    length (path: unknown): any {
      // @ts-expect-error: Type
      return d3.create('svg:path').attr('d', path).node().getTotalLength();
    }

    get line (): any {
      return pathFn(this.xScale, this.yScale)
        .curve(d3.curveLinear);
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
      return axis(range, this.margin.left, this.width - this.margin.right);
    }

    get yScale (): AxisScale<any> {
      const range = d3.extent(this.data.flat(), (d: any) => d.y);
      return axis(range, this.height - this.margin.bottom, this.margin.top);
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
    drawDataset (svg, data, style): void {
      const l = this.length(this.line(data));

      // Draw data line
      svg.append('path')
          .datum(data)
          .attr('fill', 'none')
          .attr('stroke', style.edge.strokeColor)
          .attr('stroke-width', style.edge.strokeWidth)
          .attr('stroke-linejoin', 'round')
          .attr('stroke-linecap', 'round')
          .attr('stroke-dasharray', `0,${l}`)
          .attr('d', this.line)
        .transition()
          .duration(style.edge.transitionDuration)
          .ease(d3.easeLinear)
          .attr('stroke-dasharray', `${l},${l}`);

      // Draw data dots
      svg.append('g')
          .attr('fill', style.node.fill)
          .attr('stroke', 'black')
          .attr('stroke-width', style.node.strokeWidth)
        .selectAll('circle')
        .data(data)
        .join('circle')
          .attr('cx', d => this.xScale(d.x))
          .attr('cy', d => this.yScale(d.y))
          .attr('r', 3);
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    drawPolygon (svg, data): void {
      svg.selectAll('polygon')
        .data([data])
        .enter().append('polygon')
          .attr('points', d =>
              d.map(d => [this.xScale(d.x), this.yScale(d.y)].join(',')).join(' '))
          .attr('fill', DEFAULT_STYLE.polygon.fill)
          .attr('opacity', DEFAULT_STYLE.polygon.opacity);
    }

    refresh (): void {
      const currentDataHash = JSON.stringify(this.data) + JSON.stringify(this.styles);
      if (currentDataHash === this.dataHash) {
        return;
      }

      this.dataHash = currentDataHash;

      d3.select(this.$refs.container as any).selectChildren('svg').remove();

      const svg = d3.select(this.$refs.container as any).append('svg');
      createChart(svg, this.width, this.height, {}, true);

      svg.append('g')
        .call(this.xAxis);

      svg.append('g')
        .call(this.yAxis);

      if (this.polygon?.length) {
        this.drawPolygon(svg, this.polygon);
      }

      this.data.map((dataset, i) => this.drawDataset(svg, dataset, this.styles[i]));

      svg.node();
    }
  }

</script>

<style scoped>
  .header {
    align-items: center;
    display: flex;
    font-weight: 700;
    justify-content: space-between;
    padding-bottom: 5px;
    padding-left: 15px;
  }
</style>
