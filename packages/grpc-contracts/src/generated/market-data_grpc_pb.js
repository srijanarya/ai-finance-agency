// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('@grpc/grpc-js');
var market$data_pb = require('./market-data_pb.js');
var common_pb = require('./common_pb.js');
var google_protobuf_empty_pb = require('google-protobuf/google/protobuf/empty_pb.js');

function serialize_google_protobuf_Empty(arg) {
  if (!(arg instanceof google_protobuf_empty_pb.Empty)) {
    throw new Error('Expected argument of type google.protobuf.Empty');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_google_protobuf_Empty(buffer_arg) {
  return google_protobuf_empty_pb.Empty.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_marketdata_AddToWatchlistRequest(arg) {
  if (!(arg instanceof market$data_pb.AddToWatchlistRequest)) {
    throw new Error('Expected argument of type marketdata.AddToWatchlistRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_marketdata_AddToWatchlistRequest(buffer_arg) {
  return market$data_pb.AddToWatchlistRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_marketdata_AlertResponse(arg) {
  if (!(arg instanceof market$data_pb.AlertResponse)) {
    throw new Error('Expected argument of type marketdata.AlertResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_marketdata_AlertResponse(buffer_arg) {
  return market$data_pb.AlertResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_marketdata_AlertStatisticsResponse(arg) {
  if (!(arg instanceof market$data_pb.AlertStatisticsResponse)) {
    throw new Error('Expected argument of type marketdata.AlertStatisticsResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_marketdata_AlertStatisticsResponse(buffer_arg) {
  return market$data_pb.AlertStatisticsResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_marketdata_BatchMarketDataResponse(arg) {
  if (!(arg instanceof market$data_pb.BatchMarketDataResponse)) {
    throw new Error('Expected argument of type marketdata.BatchMarketDataResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_marketdata_BatchMarketDataResponse(buffer_arg) {
  return market$data_pb.BatchMarketDataResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_marketdata_BollingerBandsResponse(arg) {
  if (!(arg instanceof market$data_pb.BollingerBandsResponse)) {
    throw new Error('Expected argument of type marketdata.BollingerBandsResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_marketdata_BollingerBandsResponse(buffer_arg) {
  return market$data_pb.BollingerBandsResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_marketdata_ComprehensiveAnalysisResponse(arg) {
  if (!(arg instanceof market$data_pb.ComprehensiveAnalysisResponse)) {
    throw new Error('Expected argument of type marketdata.ComprehensiveAnalysisResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_marketdata_ComprehensiveAnalysisResponse(buffer_arg) {
  return market$data_pb.ComprehensiveAnalysisResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_marketdata_CreateAlertRequest(arg) {
  if (!(arg instanceof market$data_pb.CreateAlertRequest)) {
    throw new Error('Expected argument of type marketdata.CreateAlertRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_marketdata_CreateAlertRequest(buffer_arg) {
  return market$data_pb.CreateAlertRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_marketdata_DeleteAlertRequest(arg) {
  if (!(arg instanceof market$data_pb.DeleteAlertRequest)) {
    throw new Error('Expected argument of type marketdata.DeleteAlertRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_marketdata_DeleteAlertRequest(buffer_arg) {
  return market$data_pb.DeleteAlertRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_marketdata_GetAlertStatisticsRequest(arg) {
  if (!(arg instanceof market$data_pb.GetAlertStatisticsRequest)) {
    throw new Error('Expected argument of type marketdata.GetAlertStatisticsRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_marketdata_GetAlertStatisticsRequest(buffer_arg) {
  return market$data_pb.GetAlertStatisticsRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_marketdata_GetBatchRealtimeDataRequest(arg) {
  if (!(arg instanceof market$data_pb.GetBatchRealtimeDataRequest)) {
    throw new Error('Expected argument of type marketdata.GetBatchRealtimeDataRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_marketdata_GetBatchRealtimeDataRequest(buffer_arg) {
  return market$data_pb.GetBatchRealtimeDataRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_marketdata_GetBollingerBandsRequest(arg) {
  if (!(arg instanceof market$data_pb.GetBollingerBandsRequest)) {
    throw new Error('Expected argument of type marketdata.GetBollingerBandsRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_marketdata_GetBollingerBandsRequest(buffer_arg) {
  return market$data_pb.GetBollingerBandsRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_marketdata_GetComprehensiveAnalysisRequest(arg) {
  if (!(arg instanceof market$data_pb.GetComprehensiveAnalysisRequest)) {
    throw new Error('Expected argument of type marketdata.GetComprehensiveAnalysisRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_marketdata_GetComprehensiveAnalysisRequest(buffer_arg) {
  return market$data_pb.GetComprehensiveAnalysisRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_marketdata_GetHistoricalDataRequest(arg) {
  if (!(arg instanceof market$data_pb.GetHistoricalDataRequest)) {
    throw new Error('Expected argument of type marketdata.GetHistoricalDataRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_marketdata_GetHistoricalDataRequest(buffer_arg) {
  return market$data_pb.GetHistoricalDataRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_marketdata_GetMACDRequest(arg) {
  if (!(arg instanceof market$data_pb.GetMACDRequest)) {
    throw new Error('Expected argument of type marketdata.GetMACDRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_marketdata_GetMACDRequest(buffer_arg) {
  return market$data_pb.GetMACDRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_marketdata_GetMovingAverageRequest(arg) {
  if (!(arg instanceof market$data_pb.GetMovingAverageRequest)) {
    throw new Error('Expected argument of type marketdata.GetMovingAverageRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_marketdata_GetMovingAverageRequest(buffer_arg) {
  return market$data_pb.GetMovingAverageRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_marketdata_GetOHLCDataRequest(arg) {
  if (!(arg instanceof market$data_pb.GetOHLCDataRequest)) {
    throw new Error('Expected argument of type marketdata.GetOHLCDataRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_marketdata_GetOHLCDataRequest(buffer_arg) {
  return market$data_pb.GetOHLCDataRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_marketdata_GetRSIRequest(arg) {
  if (!(arg instanceof market$data_pb.GetRSIRequest)) {
    throw new Error('Expected argument of type marketdata.GetRSIRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_marketdata_GetRSIRequest(buffer_arg) {
  return market$data_pb.GetRSIRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_marketdata_GetRealtimeDataRequest(arg) {
  if (!(arg instanceof market$data_pb.GetRealtimeDataRequest)) {
    throw new Error('Expected argument of type marketdata.GetRealtimeDataRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_marketdata_GetRealtimeDataRequest(buffer_arg) {
  return market$data_pb.GetRealtimeDataRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_marketdata_GetStochasticRequest(arg) {
  if (!(arg instanceof market$data_pb.GetStochasticRequest)) {
    throw new Error('Expected argument of type marketdata.GetStochasticRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_marketdata_GetStochasticRequest(buffer_arg) {
  return market$data_pb.GetStochasticRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_marketdata_GetUserAlertsRequest(arg) {
  if (!(arg instanceof market$data_pb.GetUserAlertsRequest)) {
    throw new Error('Expected argument of type marketdata.GetUserAlertsRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_marketdata_GetUserAlertsRequest(buffer_arg) {
  return market$data_pb.GetUserAlertsRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_marketdata_GetUserWatchlistRequest(arg) {
  if (!(arg instanceof market$data_pb.GetUserWatchlistRequest)) {
    throw new Error('Expected argument of type marketdata.GetUserWatchlistRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_marketdata_GetUserWatchlistRequest(buffer_arg) {
  return market$data_pb.GetUserWatchlistRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_marketdata_GetVolumeIndicatorsRequest(arg) {
  if (!(arg instanceof market$data_pb.GetVolumeIndicatorsRequest)) {
    throw new Error('Expected argument of type marketdata.GetVolumeIndicatorsRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_marketdata_GetVolumeIndicatorsRequest(buffer_arg) {
  return market$data_pb.GetVolumeIndicatorsRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_marketdata_GetVolumeProfileRequest(arg) {
  if (!(arg instanceof market$data_pb.GetVolumeProfileRequest)) {
    throw new Error('Expected argument of type marketdata.GetVolumeProfileRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_marketdata_GetVolumeProfileRequest(buffer_arg) {
  return market$data_pb.GetVolumeProfileRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_marketdata_GetWatchlistStatisticsRequest(arg) {
  if (!(arg instanceof market$data_pb.GetWatchlistStatisticsRequest)) {
    throw new Error('Expected argument of type marketdata.GetWatchlistStatisticsRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_marketdata_GetWatchlistStatisticsRequest(buffer_arg) {
  return market$data_pb.GetWatchlistStatisticsRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_marketdata_HistoricalDataResponse(arg) {
  if (!(arg instanceof market$data_pb.HistoricalDataResponse)) {
    throw new Error('Expected argument of type marketdata.HistoricalDataResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_marketdata_HistoricalDataResponse(buffer_arg) {
  return market$data_pb.HistoricalDataResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_marketdata_MACDResponse(arg) {
  if (!(arg instanceof market$data_pb.MACDResponse)) {
    throw new Error('Expected argument of type marketdata.MACDResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_marketdata_MACDResponse(buffer_arg) {
  return market$data_pb.MACDResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_marketdata_MarketDataResponse(arg) {
  if (!(arg instanceof market$data_pb.MarketDataResponse)) {
    throw new Error('Expected argument of type marketdata.MarketDataResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_marketdata_MarketDataResponse(buffer_arg) {
  return market$data_pb.MarketDataResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_marketdata_MovingAverageResponse(arg) {
  if (!(arg instanceof market$data_pb.MovingAverageResponse)) {
    throw new Error('Expected argument of type marketdata.MovingAverageResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_marketdata_MovingAverageResponse(buffer_arg) {
  return market$data_pb.MovingAverageResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_marketdata_OHLCDataResponse(arg) {
  if (!(arg instanceof market$data_pb.OHLCDataResponse)) {
    throw new Error('Expected argument of type marketdata.OHLCDataResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_marketdata_OHLCDataResponse(buffer_arg) {
  return market$data_pb.OHLCDataResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_marketdata_RSIResponse(arg) {
  if (!(arg instanceof market$data_pb.RSIResponse)) {
    throw new Error('Expected argument of type marketdata.RSIResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_marketdata_RSIResponse(buffer_arg) {
  return market$data_pb.RSIResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_marketdata_RemoveFromWatchlistRequest(arg) {
  if (!(arg instanceof market$data_pb.RemoveFromWatchlistRequest)) {
    throw new Error('Expected argument of type marketdata.RemoveFromWatchlistRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_marketdata_RemoveFromWatchlistRequest(buffer_arg) {
  return market$data_pb.RemoveFromWatchlistRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_marketdata_SearchSymbolsRequest(arg) {
  if (!(arg instanceof market$data_pb.SearchSymbolsRequest)) {
    throw new Error('Expected argument of type marketdata.SearchSymbolsRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_marketdata_SearchSymbolsRequest(buffer_arg) {
  return market$data_pb.SearchSymbolsRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_marketdata_SearchSymbolsResponse(arg) {
  if (!(arg instanceof market$data_pb.SearchSymbolsResponse)) {
    throw new Error('Expected argument of type marketdata.SearchSymbolsResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_marketdata_SearchSymbolsResponse(buffer_arg) {
  return market$data_pb.SearchSymbolsResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_marketdata_StochasticResponse(arg) {
  if (!(arg instanceof market$data_pb.StochasticResponse)) {
    throw new Error('Expected argument of type marketdata.StochasticResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_marketdata_StochasticResponse(buffer_arg) {
  return market$data_pb.StochasticResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_marketdata_StreamMarketDataRequest(arg) {
  if (!(arg instanceof market$data_pb.StreamMarketDataRequest)) {
    throw new Error('Expected argument of type marketdata.StreamMarketDataRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_marketdata_StreamMarketDataRequest(buffer_arg) {
  return market$data_pb.StreamMarketDataRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_marketdata_UpdateAlertRequest(arg) {
  if (!(arg instanceof market$data_pb.UpdateAlertRequest)) {
    throw new Error('Expected argument of type marketdata.UpdateAlertRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_marketdata_UpdateAlertRequest(buffer_arg) {
  return market$data_pb.UpdateAlertRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_marketdata_UpdateWatchlistItemRequest(arg) {
  if (!(arg instanceof market$data_pb.UpdateWatchlistItemRequest)) {
    throw new Error('Expected argument of type marketdata.UpdateWatchlistItemRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_marketdata_UpdateWatchlistItemRequest(buffer_arg) {
  return market$data_pb.UpdateWatchlistItemRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_marketdata_UserAlertsResponse(arg) {
  if (!(arg instanceof market$data_pb.UserAlertsResponse)) {
    throw new Error('Expected argument of type marketdata.UserAlertsResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_marketdata_UserAlertsResponse(buffer_arg) {
  return market$data_pb.UserAlertsResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_marketdata_UserWatchlistResponse(arg) {
  if (!(arg instanceof market$data_pb.UserWatchlistResponse)) {
    throw new Error('Expected argument of type marketdata.UserWatchlistResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_marketdata_UserWatchlistResponse(buffer_arg) {
  return market$data_pb.UserWatchlistResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_marketdata_VolumeIndicatorsResponse(arg) {
  if (!(arg instanceof market$data_pb.VolumeIndicatorsResponse)) {
    throw new Error('Expected argument of type marketdata.VolumeIndicatorsResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_marketdata_VolumeIndicatorsResponse(buffer_arg) {
  return market$data_pb.VolumeIndicatorsResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_marketdata_VolumeProfileResponse(arg) {
  if (!(arg instanceof market$data_pb.VolumeProfileResponse)) {
    throw new Error('Expected argument of type marketdata.VolumeProfileResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_marketdata_VolumeProfileResponse(buffer_arg) {
  return market$data_pb.VolumeProfileResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_marketdata_WatchlistItemResponse(arg) {
  if (!(arg instanceof market$data_pb.WatchlistItemResponse)) {
    throw new Error('Expected argument of type marketdata.WatchlistItemResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_marketdata_WatchlistItemResponse(buffer_arg) {
  return market$data_pb.WatchlistItemResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_marketdata_WatchlistStatisticsResponse(arg) {
  if (!(arg instanceof market$data_pb.WatchlistStatisticsResponse)) {
    throw new Error('Expected argument of type marketdata.WatchlistStatisticsResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_marketdata_WatchlistStatisticsResponse(buffer_arg) {
  return market$data_pb.WatchlistStatisticsResponse.deserializeBinary(new Uint8Array(buffer_arg));
}


// Market Data Service
var MarketDataServiceService = exports.MarketDataServiceService = {
  // Real-time market data
getRealtimeData: {
    path: '/marketdata.MarketDataService/GetRealtimeData',
    requestStream: false,
    responseStream: false,
    requestType: market$data_pb.GetRealtimeDataRequest,
    responseType: market$data_pb.MarketDataResponse,
    requestSerialize: serialize_marketdata_GetRealtimeDataRequest,
    requestDeserialize: deserialize_marketdata_GetRealtimeDataRequest,
    responseSerialize: serialize_marketdata_MarketDataResponse,
    responseDeserialize: deserialize_marketdata_MarketDataResponse,
  },
  getBatchRealtimeData: {
    path: '/marketdata.MarketDataService/GetBatchRealtimeData',
    requestStream: false,
    responseStream: false,
    requestType: market$data_pb.GetBatchRealtimeDataRequest,
    responseType: market$data_pb.BatchMarketDataResponse,
    requestSerialize: serialize_marketdata_GetBatchRealtimeDataRequest,
    requestDeserialize: deserialize_marketdata_GetBatchRealtimeDataRequest,
    responseSerialize: serialize_marketdata_BatchMarketDataResponse,
    responseDeserialize: deserialize_marketdata_BatchMarketDataResponse,
  },
  streamMarketData: {
    path: '/marketdata.MarketDataService/StreamMarketData',
    requestStream: false,
    responseStream: true,
    requestType: market$data_pb.StreamMarketDataRequest,
    responseType: market$data_pb.MarketDataResponse,
    requestSerialize: serialize_marketdata_StreamMarketDataRequest,
    requestDeserialize: deserialize_marketdata_StreamMarketDataRequest,
    responseSerialize: serialize_marketdata_MarketDataResponse,
    responseDeserialize: deserialize_marketdata_MarketDataResponse,
  },
  // Historical data
getHistoricalData: {
    path: '/marketdata.MarketDataService/GetHistoricalData',
    requestStream: false,
    responseStream: false,
    requestType: market$data_pb.GetHistoricalDataRequest,
    responseType: market$data_pb.HistoricalDataResponse,
    requestSerialize: serialize_marketdata_GetHistoricalDataRequest,
    requestDeserialize: deserialize_marketdata_GetHistoricalDataRequest,
    responseSerialize: serialize_marketdata_HistoricalDataResponse,
    responseDeserialize: deserialize_marketdata_HistoricalDataResponse,
  },
  getOHLCData: {
    path: '/marketdata.MarketDataService/GetOHLCData',
    requestStream: false,
    responseStream: false,
    requestType: market$data_pb.GetOHLCDataRequest,
    responseType: market$data_pb.OHLCDataResponse,
    requestSerialize: serialize_marketdata_GetOHLCDataRequest,
    requestDeserialize: deserialize_marketdata_GetOHLCDataRequest,
    responseSerialize: serialize_marketdata_OHLCDataResponse,
    responseDeserialize: deserialize_marketdata_OHLCDataResponse,
  },
  getVolumeProfile: {
    path: '/marketdata.MarketDataService/GetVolumeProfile',
    requestStream: false,
    responseStream: false,
    requestType: market$data_pb.GetVolumeProfileRequest,
    responseType: market$data_pb.VolumeProfileResponse,
    requestSerialize: serialize_marketdata_GetVolumeProfileRequest,
    requestDeserialize: deserialize_marketdata_GetVolumeProfileRequest,
    responseSerialize: serialize_marketdata_VolumeProfileResponse,
    responseDeserialize: deserialize_marketdata_VolumeProfileResponse,
  },
  // Technical indicators
getRSI: {
    path: '/marketdata.MarketDataService/GetRSI',
    requestStream: false,
    responseStream: false,
    requestType: market$data_pb.GetRSIRequest,
    responseType: market$data_pb.RSIResponse,
    requestSerialize: serialize_marketdata_GetRSIRequest,
    requestDeserialize: deserialize_marketdata_GetRSIRequest,
    responseSerialize: serialize_marketdata_RSIResponse,
    responseDeserialize: deserialize_marketdata_RSIResponse,
  },
  getMACD: {
    path: '/marketdata.MarketDataService/GetMACD',
    requestStream: false,
    responseStream: false,
    requestType: market$data_pb.GetMACDRequest,
    responseType: market$data_pb.MACDResponse,
    requestSerialize: serialize_marketdata_GetMACDRequest,
    requestDeserialize: deserialize_marketdata_GetMACDRequest,
    responseSerialize: serialize_marketdata_MACDResponse,
    responseDeserialize: deserialize_marketdata_MACDResponse,
  },
  getBollingerBands: {
    path: '/marketdata.MarketDataService/GetBollingerBands',
    requestStream: false,
    responseStream: false,
    requestType: market$data_pb.GetBollingerBandsRequest,
    responseType: market$data_pb.BollingerBandsResponse,
    requestSerialize: serialize_marketdata_GetBollingerBandsRequest,
    requestDeserialize: deserialize_marketdata_GetBollingerBandsRequest,
    responseSerialize: serialize_marketdata_BollingerBandsResponse,
    responseDeserialize: deserialize_marketdata_BollingerBandsResponse,
  },
  getMovingAverage: {
    path: '/marketdata.MarketDataService/GetMovingAverage',
    requestStream: false,
    responseStream: false,
    requestType: market$data_pb.GetMovingAverageRequest,
    responseType: market$data_pb.MovingAverageResponse,
    requestSerialize: serialize_marketdata_GetMovingAverageRequest,
    requestDeserialize: deserialize_marketdata_GetMovingAverageRequest,
    responseSerialize: serialize_marketdata_MovingAverageResponse,
    responseDeserialize: deserialize_marketdata_MovingAverageResponse,
  },
  getStochastic: {
    path: '/marketdata.MarketDataService/GetStochastic',
    requestStream: false,
    responseStream: false,
    requestType: market$data_pb.GetStochasticRequest,
    responseType: market$data_pb.StochasticResponse,
    requestSerialize: serialize_marketdata_GetStochasticRequest,
    requestDeserialize: deserialize_marketdata_GetStochasticRequest,
    responseSerialize: serialize_marketdata_StochasticResponse,
    responseDeserialize: deserialize_marketdata_StochasticResponse,
  },
  getVolumeIndicators: {
    path: '/marketdata.MarketDataService/GetVolumeIndicators',
    requestStream: false,
    responseStream: false,
    requestType: market$data_pb.GetVolumeIndicatorsRequest,
    responseType: market$data_pb.VolumeIndicatorsResponse,
    requestSerialize: serialize_marketdata_GetVolumeIndicatorsRequest,
    requestDeserialize: deserialize_marketdata_GetVolumeIndicatorsRequest,
    responseSerialize: serialize_marketdata_VolumeIndicatorsResponse,
    responseDeserialize: deserialize_marketdata_VolumeIndicatorsResponse,
  },
  getComprehensiveAnalysis: {
    path: '/marketdata.MarketDataService/GetComprehensiveAnalysis',
    requestStream: false,
    responseStream: false,
    requestType: market$data_pb.GetComprehensiveAnalysisRequest,
    responseType: market$data_pb.ComprehensiveAnalysisResponse,
    requestSerialize: serialize_marketdata_GetComprehensiveAnalysisRequest,
    requestDeserialize: deserialize_marketdata_GetComprehensiveAnalysisRequest,
    responseSerialize: serialize_marketdata_ComprehensiveAnalysisResponse,
    responseDeserialize: deserialize_marketdata_ComprehensiveAnalysisResponse,
  },
  // Alerts
createAlert: {
    path: '/marketdata.MarketDataService/CreateAlert',
    requestStream: false,
    responseStream: false,
    requestType: market$data_pb.CreateAlertRequest,
    responseType: market$data_pb.AlertResponse,
    requestSerialize: serialize_marketdata_CreateAlertRequest,
    requestDeserialize: deserialize_marketdata_CreateAlertRequest,
    responseSerialize: serialize_marketdata_AlertResponse,
    responseDeserialize: deserialize_marketdata_AlertResponse,
  },
  updateAlert: {
    path: '/marketdata.MarketDataService/UpdateAlert',
    requestStream: false,
    responseStream: false,
    requestType: market$data_pb.UpdateAlertRequest,
    responseType: market$data_pb.AlertResponse,
    requestSerialize: serialize_marketdata_UpdateAlertRequest,
    requestDeserialize: deserialize_marketdata_UpdateAlertRequest,
    responseSerialize: serialize_marketdata_AlertResponse,
    responseDeserialize: deserialize_marketdata_AlertResponse,
  },
  deleteAlert: {
    path: '/marketdata.MarketDataService/DeleteAlert',
    requestStream: false,
    responseStream: false,
    requestType: market$data_pb.DeleteAlertRequest,
    responseType: google_protobuf_empty_pb.Empty,
    requestSerialize: serialize_marketdata_DeleteAlertRequest,
    requestDeserialize: deserialize_marketdata_DeleteAlertRequest,
    responseSerialize: serialize_google_protobuf_Empty,
    responseDeserialize: deserialize_google_protobuf_Empty,
  },
  getUserAlerts: {
    path: '/marketdata.MarketDataService/GetUserAlerts',
    requestStream: false,
    responseStream: false,
    requestType: market$data_pb.GetUserAlertsRequest,
    responseType: market$data_pb.UserAlertsResponse,
    requestSerialize: serialize_marketdata_GetUserAlertsRequest,
    requestDeserialize: deserialize_marketdata_GetUserAlertsRequest,
    responseSerialize: serialize_marketdata_UserAlertsResponse,
    responseDeserialize: deserialize_marketdata_UserAlertsResponse,
  },
  getAlertStatistics: {
    path: '/marketdata.MarketDataService/GetAlertStatistics',
    requestStream: false,
    responseStream: false,
    requestType: market$data_pb.GetAlertStatisticsRequest,
    responseType: market$data_pb.AlertStatisticsResponse,
    requestSerialize: serialize_marketdata_GetAlertStatisticsRequest,
    requestDeserialize: deserialize_marketdata_GetAlertStatisticsRequest,
    responseSerialize: serialize_marketdata_AlertStatisticsResponse,
    responseDeserialize: deserialize_marketdata_AlertStatisticsResponse,
  },
  // Watchlist
addToWatchlist: {
    path: '/marketdata.MarketDataService/AddToWatchlist',
    requestStream: false,
    responseStream: false,
    requestType: market$data_pb.AddToWatchlistRequest,
    responseType: market$data_pb.WatchlistItemResponse,
    requestSerialize: serialize_marketdata_AddToWatchlistRequest,
    requestDeserialize: deserialize_marketdata_AddToWatchlistRequest,
    responseSerialize: serialize_marketdata_WatchlistItemResponse,
    responseDeserialize: deserialize_marketdata_WatchlistItemResponse,
  },
  removeFromWatchlist: {
    path: '/marketdata.MarketDataService/RemoveFromWatchlist',
    requestStream: false,
    responseStream: false,
    requestType: market$data_pb.RemoveFromWatchlistRequest,
    responseType: google_protobuf_empty_pb.Empty,
    requestSerialize: serialize_marketdata_RemoveFromWatchlistRequest,
    requestDeserialize: deserialize_marketdata_RemoveFromWatchlistRequest,
    responseSerialize: serialize_google_protobuf_Empty,
    responseDeserialize: deserialize_google_protobuf_Empty,
  },
  getUserWatchlist: {
    path: '/marketdata.MarketDataService/GetUserWatchlist',
    requestStream: false,
    responseStream: false,
    requestType: market$data_pb.GetUserWatchlistRequest,
    responseType: market$data_pb.UserWatchlistResponse,
    requestSerialize: serialize_marketdata_GetUserWatchlistRequest,
    requestDeserialize: deserialize_marketdata_GetUserWatchlistRequest,
    responseSerialize: serialize_marketdata_UserWatchlistResponse,
    responseDeserialize: deserialize_marketdata_UserWatchlistResponse,
  },
  updateWatchlistItem: {
    path: '/marketdata.MarketDataService/UpdateWatchlistItem',
    requestStream: false,
    responseStream: false,
    requestType: market$data_pb.UpdateWatchlistItemRequest,
    responseType: market$data_pb.WatchlistItemResponse,
    requestSerialize: serialize_marketdata_UpdateWatchlistItemRequest,
    requestDeserialize: deserialize_marketdata_UpdateWatchlistItemRequest,
    responseSerialize: serialize_marketdata_WatchlistItemResponse,
    responseDeserialize: deserialize_marketdata_WatchlistItemResponse,
  },
  getWatchlistStatistics: {
    path: '/marketdata.MarketDataService/GetWatchlistStatistics',
    requestStream: false,
    responseStream: false,
    requestType: market$data_pb.GetWatchlistStatisticsRequest,
    responseType: market$data_pb.WatchlistStatisticsResponse,
    requestSerialize: serialize_marketdata_GetWatchlistStatisticsRequest,
    requestDeserialize: deserialize_marketdata_GetWatchlistStatisticsRequest,
    responseSerialize: serialize_marketdata_WatchlistStatisticsResponse,
    responseDeserialize: deserialize_marketdata_WatchlistStatisticsResponse,
  },
  // Symbol search
searchSymbols: {
    path: '/marketdata.MarketDataService/SearchSymbols',
    requestStream: false,
    responseStream: false,
    requestType: market$data_pb.SearchSymbolsRequest,
    responseType: market$data_pb.SearchSymbolsResponse,
    requestSerialize: serialize_marketdata_SearchSymbolsRequest,
    requestDeserialize: deserialize_marketdata_SearchSymbolsRequest,
    responseSerialize: serialize_marketdata_SearchSymbolsResponse,
    responseDeserialize: deserialize_marketdata_SearchSymbolsResponse,
  },
};

exports.MarketDataServiceClient = grpc.makeGenericClientConstructor(MarketDataServiceService, 'MarketDataService');
