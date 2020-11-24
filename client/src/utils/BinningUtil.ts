//----------------------------------------------------------------------------//
// Imports                                                                    //
//----------------------------------------------------------------------------//

////////////////////////////////////////////////////////////////////////////////

import {
  BinningDegreeConfigInterface,
  GraphInterface,
  EdgeInterface,
 } from '@/types/types';



//----------------------------------------------------------------------------//
// Types                                                                      //
//----------------------------------------------------------------------------//

////////////////////////////////////////////////////////////////////////////////

export interface NodeMapInterface {
  [key: string]: number,
}

export interface BinBoundariesInterface {
  binMin: number,
  binMax: number,
  binInterval: number,
}

export interface BinDataInterface {
  binArray: Array<number>,
  binMaxVal: number,
}



//----------------------------------------------------------------------------//
// Generic Functions                                                          //
//----------------------------------------------------------------------------//

////////////////////////////////////////////////////////////////////////////////
// Ingests raw JSON graph data and returns in/out degree map on per node basis

const parseGraphData = (edges: Array<EdgeInterface>, config: BinningDegreeConfigInterface) => {
  let nodeInMap: NodeMapInterface = {};
  let nodeOutMap: NodeMapInterface = {};

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

const DEFAULT_BIN_BOUNDARY: BinBoundariesInterface = {
  binMin: -1,
  binMax: -1,
  binInterval: -1,
};

const binBoundaries = (args: {nodeMap: NodeMapInterface}, config: {binCount: number}): BinBoundariesInterface => {
  const {nodeMap} = args;
  const {binCount} = config;

  let output: BinBoundariesInterface = {
    binMin: Number.MAX_SAFE_INTEGER,
    binMax: 0,
    binInterval: 0,
  }

  for(const node in nodeMap) {
    const nodeVal: number = nodeMap[node];
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

const degreeBinBoundaries = (
  args: {nodeInMap: NodeMapInterface, nodeOutMap: NodeMapInterface},
  config: {binIn: boolean, binOut: boolean, binCountIn: number, binCountOut: number},
) => {
  const {nodeInMap, nodeOutMap} = args;
  const {binIn, binOut, binCountIn, binCountOut} = config;

  const binBoundariesIn = binIn ? binBoundaries({nodeMap: nodeInMap}, {binCount: binCountIn}) : DEFAULT_BIN_BOUNDARY;

  const binBoundariesOut = binOut ? binBoundaries({nodeMap: nodeOutMap}, {binCount: binCountOut}) : DEFAULT_BIN_BOUNDARY;

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

const DEFAULT_BIN_DATA = {
  binArray: [],
  binMaxVal: 0,
};

const binData = (
  args: {nodeMap: NodeMapInterface},
  config: {binMin: number, binMax: number, binInterval:number, binCount:number},
) => {
  const {nodeMap} = args;
  const {binMin, binMax, binInterval, binCount} = config;

  let binArray: Array<number> = Array(binCount).fill(0);
  let output: BinDataInterface = {
    binArray,
    binMaxVal: 0
  };

  for(const node in nodeMap) {
    const nodeVal = nodeMap[node];
    if(nodeVal <= binMax && nodeVal >= binMin) {
      let binNumber = Math.floor((nodeVal - binMin) / binInterval);

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

const DEFAULT_CONFIG: BinningDegreeConfigInterface = {
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

export const histogramDegree = (graph: GraphInterface, configRaw: BinningDegreeConfigInterface) => {
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
      binIntervalIn: (config.binMaxIn - config.binMinIn) / binCountIn,
      binIntervalOut: (config.binMaxOut - config.binMinOut) / binCountOut,
    }
    : degreeBinBoundaries(
      {nodeInMap, nodeOutMap},
      {binIn, binOut, binCountIn, binCountOut},
    );


  ////////////////////////////////////////////////////////////////////////////////
  // Process bin data using bin settings previously calculated

  const binDataIn: BinDataInterface = binIn
    ? binData(
      {nodeMap: nodeInMap},
      {
        binMin: binMinIn,
        binMax: binMaxIn,
        binInterval: binIntervalIn,
        binCount: binCountIn,
      }
    )
    : DEFAULT_BIN_DATA;
  const binDataOut: BinDataInterface = binOut
    ? binData(
      {nodeMap: nodeOutMap},
      {
        binMin: binMinOut,
        binMax: binMaxOut,
        binInterval: binIntervalOut,
        binCount: binCountOut,
      }
    )
    : DEFAULT_BIN_DATA;


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