<template>
  <div class="sigma-container">
    <div id="graph" />
  </div>  
</template>

<script lang="ts">

  import Vue from 'vue';
  import Component from 'vue-class-component';

  import sigma from 'sigma';
  import 'sigma/build/plugins/sigma.parsers.json.min.js';
  import 'sigma/build/plugins/sigma.plugins.filter.min.js';

  @Component
  export default class SigmaGrapher extends Vue {
    mounted () {
      sigma.parsers.json('/covid_w09_forceatlas2_tested_annot.json', {
                           container: 'graph',
                           settings: {
                             minEdgeSize: 0.07,
                             maxEdgeSize: 0.07,
                             minNodeSize: 0.1,
                             maxNodeSize: 4,
                           },
                         },
                         function (s) {
                           var nodeHoverRenderers = sigma.canvas.hovers;
                           var edgeHoverRenderers = sigma.canvas.edgehovers;
                           var hoverContext = s.renderers[0].contexts.hover;

                           var options = s.renderers[0].options;
                           var embedSettings = s.settings.embedObjects(
                             options,
                             { prefix: s.renderers[0] instanceof sigma.renderers.webgl ? 'cam0:' : options.prefix },
                           );

                          s.graph.nodes().forEach(function(n) {
                          var numTested = 0;
                          var adjacentEdges = s.graph.adjacentEdges(n.id);
                          for (var i = 0; i < adjacentEdges.length; i++) {
                            var edge = adjacentEdges[i];
                            if (edge.attributes.tested == "true") {
                              numTested++;
                            }
                          }
                          if (numTested == 0) {
                            n.color = "#C0C0C0";
                          } else {
                            n.color = '#ff6500';
                          }

                        });
                        s.graph.edges().forEach(function(e) {
                          if (e.attributes.tested == "false") {
                            e.color = "#C0C0C0";
                          } else {
                            e.color = '#ff6500';
                          }
                        });
                        s.refresh();

                           s.bind('overNode', function (event) {
                             var node = event.data.node;
                             var adjacentEdges = s.graph.adjacentEdges(node.id);

                             // loop through the edges and highlight each of them; also highlight
                             //   all corresponding nodes, otherwise edges would be drawn in front of them
                             var nodesToHighlight = {};
                             adjacentEdges.forEach(function (e, i) {
                               var source = s.graph.nodes(e.source);
                               var target = s.graph.nodes(e.target);
                               nodesToHighlight[source.id] = source;
                               nodesToHighlight[target.id] = target;

                               if (!e.hidden) {
                                 // highlight the edge
                                 var edgeHoverRenderer = edgeHoverRenderers[e.type] || edgeHoverRenderers[embedSettings('defaultEdgeType')] || edgeHoverRenderers.def;
                                 edgeHoverRenderer(e, source, target, hoverContext, embedSettings);
                               }
                             });

                             // remove the focal node from the highlight object to not highlight it twice
                             delete nodesToHighlight[node.id];

                             // draw neighbors in front of highlighted edges
                             for (var n in nodesToHighlight) {
                               if (!nodesToHighlight[n].hidden) {
                                 var nodeRenderer = sigma.canvas.nodes[nodesToHighlight[n].type] || sigma.canvas.nodes.def;
                                 nodeRenderer(nodesToHighlight[n], hoverContext, embedSettings);
                               }

                               // draw the neighbor nodes' labels
                               var prefix = embedSettings('prefix') || '';
                               var size = nodesToHighlight[n][prefix + 'size'];
                               var fontSize = (embedSettings('labelSize') === 'fixed') ? embedSettings('defaultLabelSize') : embedSettings('labelSizeRatio') * size;
                               if (nodesToHighlight[n].label && typeof nodesToHighlight[n].label === 'string') {
                                 hoverContext.fillStyle = '#000';

                                 var origFont = hoverContext.font;
                                 hoverContext.font = '11px arial';

                                 hoverContext.fillText(
                                   nodesToHighlight[n].label,
                                   Math.round(nodesToHighlight[n][prefix + 'x'] + size + 3),
                                   Math.round(nodesToHighlight[n][prefix + 'y'] + fontSize / 3),
                                 );

                                 hoverContext.font = origFont;
                               }
                             }

                             // draw the focal node hover on top of the rendered edges
                             var nodeHoverRenderer = nodeHoverRenderers[node.type] || nodeHoverRenderers.def;
                             nodeHoverRenderer(node, hoverContext, embedSettings);
                           });
                         },
      );
    }
  }
</script>

<style lang="scss" scoped>
@import "../styles/variables";
.sigma-container {
  height: calc(#{$content-full-height} - #{$secondary-bar-width} - 25px);
  width: 100%;
  position: relative;
  #graph {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    
  }
}

::v-deep .sigma-scene {
  left: 0;
}

::v-deep .sigma-labels {
  left: 0;
}

::v-deep .sigma-mouse {
  left: 0;
}

</style>
