//----------------------------------------------------------------------------//
// Generic Functions                                                          //
//----------------------------------------------------------------------------//

////////////////////////////////////////////////////////////////////////////////
// Ingests raw JSON graph data and returns in/out degree map on per node basis

const parseGraphData = (edges, config) => {
  let nodeInMap = {};
  let nodeOutMap = {};

  let nodeNumIn = 0;
  let nodeNumOut = 0;

  // iterate through all edges
  for(let i = 0; i < edges.length; i++) {
    const edge = edges[i];
    const {source, target} = edge;

    if(config.binIn) {
      if(nodeInMap[target] === undefined) {
        nodeInMap[target] = 0;
        nodeNumIn++;
      }

      nodeInMap[target] = nodeInMap[target] + 1;
    }

    if(config.binOut) {
      if(nodeOutMap[source] === undefined) {
        nodeOutMap[source] = 0;
        nodeNumOut++;
      }

      nodeOutMap[source] = nodeOutMap[source] + 1;
    }
  }
  
  return {
    nodeInMap,
    nodeOutMap,
    nodeNumIn,
    nodeNumOut,
  };
}


////////////////////////////////////////////////////////////////////////////////
// Calculate the bin max, min, and interval given a specified dataset and bin count

const binBoundaries = (args, config) => {
  const {nodeMap} = args;
  const {binCount} = config;

  let output = {
    binMin: Number.MAX_SAFE_INTEGER,
    binMax: 0,
    binInterval: 0,
  }

  for(const node in nodeMap) {
    const nodeVal = nodeMap[node];
    if(output.binMin > nodeVal) {
      output.binMin = nodeVal;
    }
    if(output.binMax < nodeVal) {
      output.binMax = nodeVal;
    }
  }

  output.binInterval = (output.binMax - output.binMin) / binCount;

  return output;
}

const degreeBinBoundaries = (args, config) => {
  const {nodeInMap, nodeOutMap} = args;
  const {binIn, binOut, binCountIn, binCountOut} = config;

  const binBoundariesIn = binIn ? binBoundaries({nodeMap: nodeInMap}, {binCount: binCountIn}) : {};

  const binBoundariesOut = binOut ? binBoundaries({nodeMap: nodeOutMap}, {binCount: binCountOut}) : {};

  return {
    binIntervalIn: binBoundariesIn.binInterval,
    binIntervalOut: binBoundariesOut.binInterval,

    binMaxIn: binBoundariesIn.binMax,
    binMaxOut: binBoundariesOut.binMax,

    binMinIn: binBoundariesIn.binMin,
    binMinOut: binBoundariesOut.binMin,
  };
}


////////////////////////////////////////////////////////////////////////////////
// Using dataset and binning configuration provided, generate binned data array

const binData = (args, config) => {
  const {nodeMap} = args;
  const {binMin, binMax, binInterval, binCount} = config;

  let binArray = Array(binCount).fill(0);
  let output = {
    binArray,
    binMaxVal: 0
  };

  for(const node in nodeMap) {
    const nodeVal = nodeMap[node];
    if(nodeVal <= binMax && nodeVal >= binMin) {
      let binNumber = parseInt((nodeVal - binMin) / binInterval);

      // last bin includes both the last bin range + the max bin value
      if(nodeVal === binMax) {
        binNumber--;
      }

      binArray[binNumber] = binArray[binNumber] + 1;
      if(binArray[binNumber] > output.binMaxVal) {
        output.binMaxVal = binArray[binNumber];
      }
    }
  }

  return output;
}



//----------------------------------------------------------------------------//
// Histogram Functions                                                        //
//----------------------------------------------------------------------------//

////////////////////////////////////////////////////////////////////////////////

const DEFAULT_CONFIG = {
  binIn: true,
  binOut: true,
  binCountIn: 10,
  binCountOut: 10,

  binType: 'auto',

  binMaxIn: 10,
  binMaxOut: 10,
  binMinIn: 0,
  binMinOut: 0,
}

export const histogramDegree = (graph, configRaw) => {
  const {edges} = graph;
  const config = {...DEFAULT_CONFIG, ...configRaw};
  const {binIn, binOut, binCountIn, binCountOut} = config;


  ////////////////////////////////////////////////////////////////////////////////
  // Parse data from graph

  const {
    nodeInMap,
    nodeOutMap,

    nodeNumIn,
    nodeNumOut,
  } = parseGraphData(edges, config);


  ////////////////////////////////////////////////////////////////////////////////
  // Calculate settings if bin type is set to auto, otherwise use config

  const {
    binIntervalIn,
    binIntervalOut,

    binMaxIn,
    binMaxOut,

    binMinIn,
    binMinOut,
  } = config.binType === 'manual'
    ? {
      ...config,
      binIntervalIn: (binMaxIn - binMinIn) / binCountIn,
      binIntervalOut: (binMaxOut - binMinOut) / binCountOut,
    }
    : degreeBinBoundaries(
      {nodeInMap, nodeOutMap},
      {binIn, binOut, binCountIn, binCountOut},
    );


  ////////////////////////////////////////////////////////////////////////////////
  // Process bin data using bin settings previously calculated

  const binDataIn = binIn
    ? binData(
      {nodeMap: nodeInMap},
      {
        binMin: binMinIn,
        binMax: binMaxIn,
        binInterval: binIntervalIn,
        binCount: binCountIn,
      }
    )
    : {};
  const binDataOut = binOut
    ? binData(
      {nodeMap: nodeOutMap},
      {
        binMin: binMinOut,
        binMax: binMaxOut,
        binInterval: binIntervalOut,
        binCount: binCountOut,
      }
    )
    : {};


  ////////////////////////////////////////////////////////////////////////////////
  // Return bin data as well as calculated/useful config settings and metadata

  return {
    binArrayIn: binDataIn.binArray,
    binArrayOut: binDataOut.binArray,

    binMaxValIn: binDataIn.binMaxVal,
    binMaxValOut: binDataOut.binMaxVal,

    binIntervalIn,
    binIntervalOut,

    binMaxIn,
    binMaxOut,

    binMinIn,
    binMinOut,

    nodeNumIn,
    nodeNumOut,
  };
}