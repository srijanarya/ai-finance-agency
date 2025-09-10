// package: marketdata
// file: market-data.proto

/* tslint:disable */
/* eslint-disable */

import * as grpc from "@grpc/grpc-js";
import * as market_data_pb from "./market-data_pb";
import * as common_pb from "./common_pb";
import * as google_protobuf_empty_pb from "google-protobuf/google/protobuf/empty_pb";

interface IMarketDataServiceService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
    getRealtimeData: IMarketDataServiceService_IGetRealtimeData;
    getBatchRealtimeData: IMarketDataServiceService_IGetBatchRealtimeData;
    streamMarketData: IMarketDataServiceService_IStreamMarketData;
    getHistoricalData: IMarketDataServiceService_IGetHistoricalData;
    getOHLCData: IMarketDataServiceService_IGetOHLCData;
    getVolumeProfile: IMarketDataServiceService_IGetVolumeProfile;
    getRSI: IMarketDataServiceService_IGetRSI;
    getMACD: IMarketDataServiceService_IGetMACD;
    getBollingerBands: IMarketDataServiceService_IGetBollingerBands;
    getMovingAverage: IMarketDataServiceService_IGetMovingAverage;
    getStochastic: IMarketDataServiceService_IGetStochastic;
    getVolumeIndicators: IMarketDataServiceService_IGetVolumeIndicators;
    getComprehensiveAnalysis: IMarketDataServiceService_IGetComprehensiveAnalysis;
    createAlert: IMarketDataServiceService_ICreateAlert;
    updateAlert: IMarketDataServiceService_IUpdateAlert;
    deleteAlert: IMarketDataServiceService_IDeleteAlert;
    getUserAlerts: IMarketDataServiceService_IGetUserAlerts;
    getAlertStatistics: IMarketDataServiceService_IGetAlertStatistics;
    addToWatchlist: IMarketDataServiceService_IAddToWatchlist;
    removeFromWatchlist: IMarketDataServiceService_IRemoveFromWatchlist;
    getUserWatchlist: IMarketDataServiceService_IGetUserWatchlist;
    updateWatchlistItem: IMarketDataServiceService_IUpdateWatchlistItem;
    getWatchlistStatistics: IMarketDataServiceService_IGetWatchlistStatistics;
    searchSymbols: IMarketDataServiceService_ISearchSymbols;
}

interface IMarketDataServiceService_IGetRealtimeData extends grpc.MethodDefinition<market_data_pb.GetRealtimeDataRequest, market_data_pb.MarketDataResponse> {
    path: "/marketdata.MarketDataService/GetRealtimeData";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<market_data_pb.GetRealtimeDataRequest>;
    requestDeserialize: grpc.deserialize<market_data_pb.GetRealtimeDataRequest>;
    responseSerialize: grpc.serialize<market_data_pb.MarketDataResponse>;
    responseDeserialize: grpc.deserialize<market_data_pb.MarketDataResponse>;
}
interface IMarketDataServiceService_IGetBatchRealtimeData extends grpc.MethodDefinition<market_data_pb.GetBatchRealtimeDataRequest, market_data_pb.BatchMarketDataResponse> {
    path: "/marketdata.MarketDataService/GetBatchRealtimeData";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<market_data_pb.GetBatchRealtimeDataRequest>;
    requestDeserialize: grpc.deserialize<market_data_pb.GetBatchRealtimeDataRequest>;
    responseSerialize: grpc.serialize<market_data_pb.BatchMarketDataResponse>;
    responseDeserialize: grpc.deserialize<market_data_pb.BatchMarketDataResponse>;
}
interface IMarketDataServiceService_IStreamMarketData extends grpc.MethodDefinition<market_data_pb.StreamMarketDataRequest, market_data_pb.MarketDataResponse> {
    path: "/marketdata.MarketDataService/StreamMarketData";
    requestStream: false;
    responseStream: true;
    requestSerialize: grpc.serialize<market_data_pb.StreamMarketDataRequest>;
    requestDeserialize: grpc.deserialize<market_data_pb.StreamMarketDataRequest>;
    responseSerialize: grpc.serialize<market_data_pb.MarketDataResponse>;
    responseDeserialize: grpc.deserialize<market_data_pb.MarketDataResponse>;
}
interface IMarketDataServiceService_IGetHistoricalData extends grpc.MethodDefinition<market_data_pb.GetHistoricalDataRequest, market_data_pb.HistoricalDataResponse> {
    path: "/marketdata.MarketDataService/GetHistoricalData";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<market_data_pb.GetHistoricalDataRequest>;
    requestDeserialize: grpc.deserialize<market_data_pb.GetHistoricalDataRequest>;
    responseSerialize: grpc.serialize<market_data_pb.HistoricalDataResponse>;
    responseDeserialize: grpc.deserialize<market_data_pb.HistoricalDataResponse>;
}
interface IMarketDataServiceService_IGetOHLCData extends grpc.MethodDefinition<market_data_pb.GetOHLCDataRequest, market_data_pb.OHLCDataResponse> {
    path: "/marketdata.MarketDataService/GetOHLCData";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<market_data_pb.GetOHLCDataRequest>;
    requestDeserialize: grpc.deserialize<market_data_pb.GetOHLCDataRequest>;
    responseSerialize: grpc.serialize<market_data_pb.OHLCDataResponse>;
    responseDeserialize: grpc.deserialize<market_data_pb.OHLCDataResponse>;
}
interface IMarketDataServiceService_IGetVolumeProfile extends grpc.MethodDefinition<market_data_pb.GetVolumeProfileRequest, market_data_pb.VolumeProfileResponse> {
    path: "/marketdata.MarketDataService/GetVolumeProfile";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<market_data_pb.GetVolumeProfileRequest>;
    requestDeserialize: grpc.deserialize<market_data_pb.GetVolumeProfileRequest>;
    responseSerialize: grpc.serialize<market_data_pb.VolumeProfileResponse>;
    responseDeserialize: grpc.deserialize<market_data_pb.VolumeProfileResponse>;
}
interface IMarketDataServiceService_IGetRSI extends grpc.MethodDefinition<market_data_pb.GetRSIRequest, market_data_pb.RSIResponse> {
    path: "/marketdata.MarketDataService/GetRSI";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<market_data_pb.GetRSIRequest>;
    requestDeserialize: grpc.deserialize<market_data_pb.GetRSIRequest>;
    responseSerialize: grpc.serialize<market_data_pb.RSIResponse>;
    responseDeserialize: grpc.deserialize<market_data_pb.RSIResponse>;
}
interface IMarketDataServiceService_IGetMACD extends grpc.MethodDefinition<market_data_pb.GetMACDRequest, market_data_pb.MACDResponse> {
    path: "/marketdata.MarketDataService/GetMACD";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<market_data_pb.GetMACDRequest>;
    requestDeserialize: grpc.deserialize<market_data_pb.GetMACDRequest>;
    responseSerialize: grpc.serialize<market_data_pb.MACDResponse>;
    responseDeserialize: grpc.deserialize<market_data_pb.MACDResponse>;
}
interface IMarketDataServiceService_IGetBollingerBands extends grpc.MethodDefinition<market_data_pb.GetBollingerBandsRequest, market_data_pb.BollingerBandsResponse> {
    path: "/marketdata.MarketDataService/GetBollingerBands";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<market_data_pb.GetBollingerBandsRequest>;
    requestDeserialize: grpc.deserialize<market_data_pb.GetBollingerBandsRequest>;
    responseSerialize: grpc.serialize<market_data_pb.BollingerBandsResponse>;
    responseDeserialize: grpc.deserialize<market_data_pb.BollingerBandsResponse>;
}
interface IMarketDataServiceService_IGetMovingAverage extends grpc.MethodDefinition<market_data_pb.GetMovingAverageRequest, market_data_pb.MovingAverageResponse> {
    path: "/marketdata.MarketDataService/GetMovingAverage";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<market_data_pb.GetMovingAverageRequest>;
    requestDeserialize: grpc.deserialize<market_data_pb.GetMovingAverageRequest>;
    responseSerialize: grpc.serialize<market_data_pb.MovingAverageResponse>;
    responseDeserialize: grpc.deserialize<market_data_pb.MovingAverageResponse>;
}
interface IMarketDataServiceService_IGetStochastic extends grpc.MethodDefinition<market_data_pb.GetStochasticRequest, market_data_pb.StochasticResponse> {
    path: "/marketdata.MarketDataService/GetStochastic";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<market_data_pb.GetStochasticRequest>;
    requestDeserialize: grpc.deserialize<market_data_pb.GetStochasticRequest>;
    responseSerialize: grpc.serialize<market_data_pb.StochasticResponse>;
    responseDeserialize: grpc.deserialize<market_data_pb.StochasticResponse>;
}
interface IMarketDataServiceService_IGetVolumeIndicators extends grpc.MethodDefinition<market_data_pb.GetVolumeIndicatorsRequest, market_data_pb.VolumeIndicatorsResponse> {
    path: "/marketdata.MarketDataService/GetVolumeIndicators";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<market_data_pb.GetVolumeIndicatorsRequest>;
    requestDeserialize: grpc.deserialize<market_data_pb.GetVolumeIndicatorsRequest>;
    responseSerialize: grpc.serialize<market_data_pb.VolumeIndicatorsResponse>;
    responseDeserialize: grpc.deserialize<market_data_pb.VolumeIndicatorsResponse>;
}
interface IMarketDataServiceService_IGetComprehensiveAnalysis extends grpc.MethodDefinition<market_data_pb.GetComprehensiveAnalysisRequest, market_data_pb.ComprehensiveAnalysisResponse> {
    path: "/marketdata.MarketDataService/GetComprehensiveAnalysis";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<market_data_pb.GetComprehensiveAnalysisRequest>;
    requestDeserialize: grpc.deserialize<market_data_pb.GetComprehensiveAnalysisRequest>;
    responseSerialize: grpc.serialize<market_data_pb.ComprehensiveAnalysisResponse>;
    responseDeserialize: grpc.deserialize<market_data_pb.ComprehensiveAnalysisResponse>;
}
interface IMarketDataServiceService_ICreateAlert extends grpc.MethodDefinition<market_data_pb.CreateAlertRequest, market_data_pb.AlertResponse> {
    path: "/marketdata.MarketDataService/CreateAlert";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<market_data_pb.CreateAlertRequest>;
    requestDeserialize: grpc.deserialize<market_data_pb.CreateAlertRequest>;
    responseSerialize: grpc.serialize<market_data_pb.AlertResponse>;
    responseDeserialize: grpc.deserialize<market_data_pb.AlertResponse>;
}
interface IMarketDataServiceService_IUpdateAlert extends grpc.MethodDefinition<market_data_pb.UpdateAlertRequest, market_data_pb.AlertResponse> {
    path: "/marketdata.MarketDataService/UpdateAlert";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<market_data_pb.UpdateAlertRequest>;
    requestDeserialize: grpc.deserialize<market_data_pb.UpdateAlertRequest>;
    responseSerialize: grpc.serialize<market_data_pb.AlertResponse>;
    responseDeserialize: grpc.deserialize<market_data_pb.AlertResponse>;
}
interface IMarketDataServiceService_IDeleteAlert extends grpc.MethodDefinition<market_data_pb.DeleteAlertRequest, google_protobuf_empty_pb.Empty> {
    path: "/marketdata.MarketDataService/DeleteAlert";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<market_data_pb.DeleteAlertRequest>;
    requestDeserialize: grpc.deserialize<market_data_pb.DeleteAlertRequest>;
    responseSerialize: grpc.serialize<google_protobuf_empty_pb.Empty>;
    responseDeserialize: grpc.deserialize<google_protobuf_empty_pb.Empty>;
}
interface IMarketDataServiceService_IGetUserAlerts extends grpc.MethodDefinition<market_data_pb.GetUserAlertsRequest, market_data_pb.UserAlertsResponse> {
    path: "/marketdata.MarketDataService/GetUserAlerts";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<market_data_pb.GetUserAlertsRequest>;
    requestDeserialize: grpc.deserialize<market_data_pb.GetUserAlertsRequest>;
    responseSerialize: grpc.serialize<market_data_pb.UserAlertsResponse>;
    responseDeserialize: grpc.deserialize<market_data_pb.UserAlertsResponse>;
}
interface IMarketDataServiceService_IGetAlertStatistics extends grpc.MethodDefinition<market_data_pb.GetAlertStatisticsRequest, market_data_pb.AlertStatisticsResponse> {
    path: "/marketdata.MarketDataService/GetAlertStatistics";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<market_data_pb.GetAlertStatisticsRequest>;
    requestDeserialize: grpc.deserialize<market_data_pb.GetAlertStatisticsRequest>;
    responseSerialize: grpc.serialize<market_data_pb.AlertStatisticsResponse>;
    responseDeserialize: grpc.deserialize<market_data_pb.AlertStatisticsResponse>;
}
interface IMarketDataServiceService_IAddToWatchlist extends grpc.MethodDefinition<market_data_pb.AddToWatchlistRequest, market_data_pb.WatchlistItemResponse> {
    path: "/marketdata.MarketDataService/AddToWatchlist";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<market_data_pb.AddToWatchlistRequest>;
    requestDeserialize: grpc.deserialize<market_data_pb.AddToWatchlistRequest>;
    responseSerialize: grpc.serialize<market_data_pb.WatchlistItemResponse>;
    responseDeserialize: grpc.deserialize<market_data_pb.WatchlistItemResponse>;
}
interface IMarketDataServiceService_IRemoveFromWatchlist extends grpc.MethodDefinition<market_data_pb.RemoveFromWatchlistRequest, google_protobuf_empty_pb.Empty> {
    path: "/marketdata.MarketDataService/RemoveFromWatchlist";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<market_data_pb.RemoveFromWatchlistRequest>;
    requestDeserialize: grpc.deserialize<market_data_pb.RemoveFromWatchlistRequest>;
    responseSerialize: grpc.serialize<google_protobuf_empty_pb.Empty>;
    responseDeserialize: grpc.deserialize<google_protobuf_empty_pb.Empty>;
}
interface IMarketDataServiceService_IGetUserWatchlist extends grpc.MethodDefinition<market_data_pb.GetUserWatchlistRequest, market_data_pb.UserWatchlistResponse> {
    path: "/marketdata.MarketDataService/GetUserWatchlist";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<market_data_pb.GetUserWatchlistRequest>;
    requestDeserialize: grpc.deserialize<market_data_pb.GetUserWatchlistRequest>;
    responseSerialize: grpc.serialize<market_data_pb.UserWatchlistResponse>;
    responseDeserialize: grpc.deserialize<market_data_pb.UserWatchlistResponse>;
}
interface IMarketDataServiceService_IUpdateWatchlistItem extends grpc.MethodDefinition<market_data_pb.UpdateWatchlistItemRequest, market_data_pb.WatchlistItemResponse> {
    path: "/marketdata.MarketDataService/UpdateWatchlistItem";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<market_data_pb.UpdateWatchlistItemRequest>;
    requestDeserialize: grpc.deserialize<market_data_pb.UpdateWatchlistItemRequest>;
    responseSerialize: grpc.serialize<market_data_pb.WatchlistItemResponse>;
    responseDeserialize: grpc.deserialize<market_data_pb.WatchlistItemResponse>;
}
interface IMarketDataServiceService_IGetWatchlistStatistics extends grpc.MethodDefinition<market_data_pb.GetWatchlistStatisticsRequest, market_data_pb.WatchlistStatisticsResponse> {
    path: "/marketdata.MarketDataService/GetWatchlistStatistics";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<market_data_pb.GetWatchlistStatisticsRequest>;
    requestDeserialize: grpc.deserialize<market_data_pb.GetWatchlistStatisticsRequest>;
    responseSerialize: grpc.serialize<market_data_pb.WatchlistStatisticsResponse>;
    responseDeserialize: grpc.deserialize<market_data_pb.WatchlistStatisticsResponse>;
}
interface IMarketDataServiceService_ISearchSymbols extends grpc.MethodDefinition<market_data_pb.SearchSymbolsRequest, market_data_pb.SearchSymbolsResponse> {
    path: "/marketdata.MarketDataService/SearchSymbols";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<market_data_pb.SearchSymbolsRequest>;
    requestDeserialize: grpc.deserialize<market_data_pb.SearchSymbolsRequest>;
    responseSerialize: grpc.serialize<market_data_pb.SearchSymbolsResponse>;
    responseDeserialize: grpc.deserialize<market_data_pb.SearchSymbolsResponse>;
}

export const MarketDataServiceService: IMarketDataServiceService;

export interface IMarketDataServiceServer extends grpc.UntypedServiceImplementation {
    getRealtimeData: grpc.handleUnaryCall<market_data_pb.GetRealtimeDataRequest, market_data_pb.MarketDataResponse>;
    getBatchRealtimeData: grpc.handleUnaryCall<market_data_pb.GetBatchRealtimeDataRequest, market_data_pb.BatchMarketDataResponse>;
    streamMarketData: grpc.handleServerStreamingCall<market_data_pb.StreamMarketDataRequest, market_data_pb.MarketDataResponse>;
    getHistoricalData: grpc.handleUnaryCall<market_data_pb.GetHistoricalDataRequest, market_data_pb.HistoricalDataResponse>;
    getOHLCData: grpc.handleUnaryCall<market_data_pb.GetOHLCDataRequest, market_data_pb.OHLCDataResponse>;
    getVolumeProfile: grpc.handleUnaryCall<market_data_pb.GetVolumeProfileRequest, market_data_pb.VolumeProfileResponse>;
    getRSI: grpc.handleUnaryCall<market_data_pb.GetRSIRequest, market_data_pb.RSIResponse>;
    getMACD: grpc.handleUnaryCall<market_data_pb.GetMACDRequest, market_data_pb.MACDResponse>;
    getBollingerBands: grpc.handleUnaryCall<market_data_pb.GetBollingerBandsRequest, market_data_pb.BollingerBandsResponse>;
    getMovingAverage: grpc.handleUnaryCall<market_data_pb.GetMovingAverageRequest, market_data_pb.MovingAverageResponse>;
    getStochastic: grpc.handleUnaryCall<market_data_pb.GetStochasticRequest, market_data_pb.StochasticResponse>;
    getVolumeIndicators: grpc.handleUnaryCall<market_data_pb.GetVolumeIndicatorsRequest, market_data_pb.VolumeIndicatorsResponse>;
    getComprehensiveAnalysis: grpc.handleUnaryCall<market_data_pb.GetComprehensiveAnalysisRequest, market_data_pb.ComprehensiveAnalysisResponse>;
    createAlert: grpc.handleUnaryCall<market_data_pb.CreateAlertRequest, market_data_pb.AlertResponse>;
    updateAlert: grpc.handleUnaryCall<market_data_pb.UpdateAlertRequest, market_data_pb.AlertResponse>;
    deleteAlert: grpc.handleUnaryCall<market_data_pb.DeleteAlertRequest, google_protobuf_empty_pb.Empty>;
    getUserAlerts: grpc.handleUnaryCall<market_data_pb.GetUserAlertsRequest, market_data_pb.UserAlertsResponse>;
    getAlertStatistics: grpc.handleUnaryCall<market_data_pb.GetAlertStatisticsRequest, market_data_pb.AlertStatisticsResponse>;
    addToWatchlist: grpc.handleUnaryCall<market_data_pb.AddToWatchlistRequest, market_data_pb.WatchlistItemResponse>;
    removeFromWatchlist: grpc.handleUnaryCall<market_data_pb.RemoveFromWatchlistRequest, google_protobuf_empty_pb.Empty>;
    getUserWatchlist: grpc.handleUnaryCall<market_data_pb.GetUserWatchlistRequest, market_data_pb.UserWatchlistResponse>;
    updateWatchlistItem: grpc.handleUnaryCall<market_data_pb.UpdateWatchlistItemRequest, market_data_pb.WatchlistItemResponse>;
    getWatchlistStatistics: grpc.handleUnaryCall<market_data_pb.GetWatchlistStatisticsRequest, market_data_pb.WatchlistStatisticsResponse>;
    searchSymbols: grpc.handleUnaryCall<market_data_pb.SearchSymbolsRequest, market_data_pb.SearchSymbolsResponse>;
}

export interface IMarketDataServiceClient {
    getRealtimeData(request: market_data_pb.GetRealtimeDataRequest, callback: (error: grpc.ServiceError | null, response: market_data_pb.MarketDataResponse) => void): grpc.ClientUnaryCall;
    getRealtimeData(request: market_data_pb.GetRealtimeDataRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: market_data_pb.MarketDataResponse) => void): grpc.ClientUnaryCall;
    getRealtimeData(request: market_data_pb.GetRealtimeDataRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: market_data_pb.MarketDataResponse) => void): grpc.ClientUnaryCall;
    getBatchRealtimeData(request: market_data_pb.GetBatchRealtimeDataRequest, callback: (error: grpc.ServiceError | null, response: market_data_pb.BatchMarketDataResponse) => void): grpc.ClientUnaryCall;
    getBatchRealtimeData(request: market_data_pb.GetBatchRealtimeDataRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: market_data_pb.BatchMarketDataResponse) => void): grpc.ClientUnaryCall;
    getBatchRealtimeData(request: market_data_pb.GetBatchRealtimeDataRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: market_data_pb.BatchMarketDataResponse) => void): grpc.ClientUnaryCall;
    streamMarketData(request: market_data_pb.StreamMarketDataRequest, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<market_data_pb.MarketDataResponse>;
    streamMarketData(request: market_data_pb.StreamMarketDataRequest, metadata?: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<market_data_pb.MarketDataResponse>;
    getHistoricalData(request: market_data_pb.GetHistoricalDataRequest, callback: (error: grpc.ServiceError | null, response: market_data_pb.HistoricalDataResponse) => void): grpc.ClientUnaryCall;
    getHistoricalData(request: market_data_pb.GetHistoricalDataRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: market_data_pb.HistoricalDataResponse) => void): grpc.ClientUnaryCall;
    getHistoricalData(request: market_data_pb.GetHistoricalDataRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: market_data_pb.HistoricalDataResponse) => void): grpc.ClientUnaryCall;
    getOHLCData(request: market_data_pb.GetOHLCDataRequest, callback: (error: grpc.ServiceError | null, response: market_data_pb.OHLCDataResponse) => void): grpc.ClientUnaryCall;
    getOHLCData(request: market_data_pb.GetOHLCDataRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: market_data_pb.OHLCDataResponse) => void): grpc.ClientUnaryCall;
    getOHLCData(request: market_data_pb.GetOHLCDataRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: market_data_pb.OHLCDataResponse) => void): grpc.ClientUnaryCall;
    getVolumeProfile(request: market_data_pb.GetVolumeProfileRequest, callback: (error: grpc.ServiceError | null, response: market_data_pb.VolumeProfileResponse) => void): grpc.ClientUnaryCall;
    getVolumeProfile(request: market_data_pb.GetVolumeProfileRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: market_data_pb.VolumeProfileResponse) => void): grpc.ClientUnaryCall;
    getVolumeProfile(request: market_data_pb.GetVolumeProfileRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: market_data_pb.VolumeProfileResponse) => void): grpc.ClientUnaryCall;
    getRSI(request: market_data_pb.GetRSIRequest, callback: (error: grpc.ServiceError | null, response: market_data_pb.RSIResponse) => void): grpc.ClientUnaryCall;
    getRSI(request: market_data_pb.GetRSIRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: market_data_pb.RSIResponse) => void): grpc.ClientUnaryCall;
    getRSI(request: market_data_pb.GetRSIRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: market_data_pb.RSIResponse) => void): grpc.ClientUnaryCall;
    getMACD(request: market_data_pb.GetMACDRequest, callback: (error: grpc.ServiceError | null, response: market_data_pb.MACDResponse) => void): grpc.ClientUnaryCall;
    getMACD(request: market_data_pb.GetMACDRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: market_data_pb.MACDResponse) => void): grpc.ClientUnaryCall;
    getMACD(request: market_data_pb.GetMACDRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: market_data_pb.MACDResponse) => void): grpc.ClientUnaryCall;
    getBollingerBands(request: market_data_pb.GetBollingerBandsRequest, callback: (error: grpc.ServiceError | null, response: market_data_pb.BollingerBandsResponse) => void): grpc.ClientUnaryCall;
    getBollingerBands(request: market_data_pb.GetBollingerBandsRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: market_data_pb.BollingerBandsResponse) => void): grpc.ClientUnaryCall;
    getBollingerBands(request: market_data_pb.GetBollingerBandsRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: market_data_pb.BollingerBandsResponse) => void): grpc.ClientUnaryCall;
    getMovingAverage(request: market_data_pb.GetMovingAverageRequest, callback: (error: grpc.ServiceError | null, response: market_data_pb.MovingAverageResponse) => void): grpc.ClientUnaryCall;
    getMovingAverage(request: market_data_pb.GetMovingAverageRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: market_data_pb.MovingAverageResponse) => void): grpc.ClientUnaryCall;
    getMovingAverage(request: market_data_pb.GetMovingAverageRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: market_data_pb.MovingAverageResponse) => void): grpc.ClientUnaryCall;
    getStochastic(request: market_data_pb.GetStochasticRequest, callback: (error: grpc.ServiceError | null, response: market_data_pb.StochasticResponse) => void): grpc.ClientUnaryCall;
    getStochastic(request: market_data_pb.GetStochasticRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: market_data_pb.StochasticResponse) => void): grpc.ClientUnaryCall;
    getStochastic(request: market_data_pb.GetStochasticRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: market_data_pb.StochasticResponse) => void): grpc.ClientUnaryCall;
    getVolumeIndicators(request: market_data_pb.GetVolumeIndicatorsRequest, callback: (error: grpc.ServiceError | null, response: market_data_pb.VolumeIndicatorsResponse) => void): grpc.ClientUnaryCall;
    getVolumeIndicators(request: market_data_pb.GetVolumeIndicatorsRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: market_data_pb.VolumeIndicatorsResponse) => void): grpc.ClientUnaryCall;
    getVolumeIndicators(request: market_data_pb.GetVolumeIndicatorsRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: market_data_pb.VolumeIndicatorsResponse) => void): grpc.ClientUnaryCall;
    getComprehensiveAnalysis(request: market_data_pb.GetComprehensiveAnalysisRequest, callback: (error: grpc.ServiceError | null, response: market_data_pb.ComprehensiveAnalysisResponse) => void): grpc.ClientUnaryCall;
    getComprehensiveAnalysis(request: market_data_pb.GetComprehensiveAnalysisRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: market_data_pb.ComprehensiveAnalysisResponse) => void): grpc.ClientUnaryCall;
    getComprehensiveAnalysis(request: market_data_pb.GetComprehensiveAnalysisRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: market_data_pb.ComprehensiveAnalysisResponse) => void): grpc.ClientUnaryCall;
    createAlert(request: market_data_pb.CreateAlertRequest, callback: (error: grpc.ServiceError | null, response: market_data_pb.AlertResponse) => void): grpc.ClientUnaryCall;
    createAlert(request: market_data_pb.CreateAlertRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: market_data_pb.AlertResponse) => void): grpc.ClientUnaryCall;
    createAlert(request: market_data_pb.CreateAlertRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: market_data_pb.AlertResponse) => void): grpc.ClientUnaryCall;
    updateAlert(request: market_data_pb.UpdateAlertRequest, callback: (error: grpc.ServiceError | null, response: market_data_pb.AlertResponse) => void): grpc.ClientUnaryCall;
    updateAlert(request: market_data_pb.UpdateAlertRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: market_data_pb.AlertResponse) => void): grpc.ClientUnaryCall;
    updateAlert(request: market_data_pb.UpdateAlertRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: market_data_pb.AlertResponse) => void): grpc.ClientUnaryCall;
    deleteAlert(request: market_data_pb.DeleteAlertRequest, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    deleteAlert(request: market_data_pb.DeleteAlertRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    deleteAlert(request: market_data_pb.DeleteAlertRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    getUserAlerts(request: market_data_pb.GetUserAlertsRequest, callback: (error: grpc.ServiceError | null, response: market_data_pb.UserAlertsResponse) => void): grpc.ClientUnaryCall;
    getUserAlerts(request: market_data_pb.GetUserAlertsRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: market_data_pb.UserAlertsResponse) => void): grpc.ClientUnaryCall;
    getUserAlerts(request: market_data_pb.GetUserAlertsRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: market_data_pb.UserAlertsResponse) => void): grpc.ClientUnaryCall;
    getAlertStatistics(request: market_data_pb.GetAlertStatisticsRequest, callback: (error: grpc.ServiceError | null, response: market_data_pb.AlertStatisticsResponse) => void): grpc.ClientUnaryCall;
    getAlertStatistics(request: market_data_pb.GetAlertStatisticsRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: market_data_pb.AlertStatisticsResponse) => void): grpc.ClientUnaryCall;
    getAlertStatistics(request: market_data_pb.GetAlertStatisticsRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: market_data_pb.AlertStatisticsResponse) => void): grpc.ClientUnaryCall;
    addToWatchlist(request: market_data_pb.AddToWatchlistRequest, callback: (error: grpc.ServiceError | null, response: market_data_pb.WatchlistItemResponse) => void): grpc.ClientUnaryCall;
    addToWatchlist(request: market_data_pb.AddToWatchlistRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: market_data_pb.WatchlistItemResponse) => void): grpc.ClientUnaryCall;
    addToWatchlist(request: market_data_pb.AddToWatchlistRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: market_data_pb.WatchlistItemResponse) => void): grpc.ClientUnaryCall;
    removeFromWatchlist(request: market_data_pb.RemoveFromWatchlistRequest, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    removeFromWatchlist(request: market_data_pb.RemoveFromWatchlistRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    removeFromWatchlist(request: market_data_pb.RemoveFromWatchlistRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    getUserWatchlist(request: market_data_pb.GetUserWatchlistRequest, callback: (error: grpc.ServiceError | null, response: market_data_pb.UserWatchlistResponse) => void): grpc.ClientUnaryCall;
    getUserWatchlist(request: market_data_pb.GetUserWatchlistRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: market_data_pb.UserWatchlistResponse) => void): grpc.ClientUnaryCall;
    getUserWatchlist(request: market_data_pb.GetUserWatchlistRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: market_data_pb.UserWatchlistResponse) => void): grpc.ClientUnaryCall;
    updateWatchlistItem(request: market_data_pb.UpdateWatchlistItemRequest, callback: (error: grpc.ServiceError | null, response: market_data_pb.WatchlistItemResponse) => void): grpc.ClientUnaryCall;
    updateWatchlistItem(request: market_data_pb.UpdateWatchlistItemRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: market_data_pb.WatchlistItemResponse) => void): grpc.ClientUnaryCall;
    updateWatchlistItem(request: market_data_pb.UpdateWatchlistItemRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: market_data_pb.WatchlistItemResponse) => void): grpc.ClientUnaryCall;
    getWatchlistStatistics(request: market_data_pb.GetWatchlistStatisticsRequest, callback: (error: grpc.ServiceError | null, response: market_data_pb.WatchlistStatisticsResponse) => void): grpc.ClientUnaryCall;
    getWatchlistStatistics(request: market_data_pb.GetWatchlistStatisticsRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: market_data_pb.WatchlistStatisticsResponse) => void): grpc.ClientUnaryCall;
    getWatchlistStatistics(request: market_data_pb.GetWatchlistStatisticsRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: market_data_pb.WatchlistStatisticsResponse) => void): grpc.ClientUnaryCall;
    searchSymbols(request: market_data_pb.SearchSymbolsRequest, callback: (error: grpc.ServiceError | null, response: market_data_pb.SearchSymbolsResponse) => void): grpc.ClientUnaryCall;
    searchSymbols(request: market_data_pb.SearchSymbolsRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: market_data_pb.SearchSymbolsResponse) => void): grpc.ClientUnaryCall;
    searchSymbols(request: market_data_pb.SearchSymbolsRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: market_data_pb.SearchSymbolsResponse) => void): grpc.ClientUnaryCall;
}

export class MarketDataServiceClient extends grpc.Client implements IMarketDataServiceClient {
    constructor(address: string, credentials: grpc.ChannelCredentials, options?: Partial<grpc.ClientOptions>);
    public getRealtimeData(request: market_data_pb.GetRealtimeDataRequest, callback: (error: grpc.ServiceError | null, response: market_data_pb.MarketDataResponse) => void): grpc.ClientUnaryCall;
    public getRealtimeData(request: market_data_pb.GetRealtimeDataRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: market_data_pb.MarketDataResponse) => void): grpc.ClientUnaryCall;
    public getRealtimeData(request: market_data_pb.GetRealtimeDataRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: market_data_pb.MarketDataResponse) => void): grpc.ClientUnaryCall;
    public getBatchRealtimeData(request: market_data_pb.GetBatchRealtimeDataRequest, callback: (error: grpc.ServiceError | null, response: market_data_pb.BatchMarketDataResponse) => void): grpc.ClientUnaryCall;
    public getBatchRealtimeData(request: market_data_pb.GetBatchRealtimeDataRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: market_data_pb.BatchMarketDataResponse) => void): grpc.ClientUnaryCall;
    public getBatchRealtimeData(request: market_data_pb.GetBatchRealtimeDataRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: market_data_pb.BatchMarketDataResponse) => void): grpc.ClientUnaryCall;
    public streamMarketData(request: market_data_pb.StreamMarketDataRequest, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<market_data_pb.MarketDataResponse>;
    public streamMarketData(request: market_data_pb.StreamMarketDataRequest, metadata?: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<market_data_pb.MarketDataResponse>;
    public getHistoricalData(request: market_data_pb.GetHistoricalDataRequest, callback: (error: grpc.ServiceError | null, response: market_data_pb.HistoricalDataResponse) => void): grpc.ClientUnaryCall;
    public getHistoricalData(request: market_data_pb.GetHistoricalDataRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: market_data_pb.HistoricalDataResponse) => void): grpc.ClientUnaryCall;
    public getHistoricalData(request: market_data_pb.GetHistoricalDataRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: market_data_pb.HistoricalDataResponse) => void): grpc.ClientUnaryCall;
    public getOHLCData(request: market_data_pb.GetOHLCDataRequest, callback: (error: grpc.ServiceError | null, response: market_data_pb.OHLCDataResponse) => void): grpc.ClientUnaryCall;
    public getOHLCData(request: market_data_pb.GetOHLCDataRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: market_data_pb.OHLCDataResponse) => void): grpc.ClientUnaryCall;
    public getOHLCData(request: market_data_pb.GetOHLCDataRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: market_data_pb.OHLCDataResponse) => void): grpc.ClientUnaryCall;
    public getVolumeProfile(request: market_data_pb.GetVolumeProfileRequest, callback: (error: grpc.ServiceError | null, response: market_data_pb.VolumeProfileResponse) => void): grpc.ClientUnaryCall;
    public getVolumeProfile(request: market_data_pb.GetVolumeProfileRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: market_data_pb.VolumeProfileResponse) => void): grpc.ClientUnaryCall;
    public getVolumeProfile(request: market_data_pb.GetVolumeProfileRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: market_data_pb.VolumeProfileResponse) => void): grpc.ClientUnaryCall;
    public getRSI(request: market_data_pb.GetRSIRequest, callback: (error: grpc.ServiceError | null, response: market_data_pb.RSIResponse) => void): grpc.ClientUnaryCall;
    public getRSI(request: market_data_pb.GetRSIRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: market_data_pb.RSIResponse) => void): grpc.ClientUnaryCall;
    public getRSI(request: market_data_pb.GetRSIRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: market_data_pb.RSIResponse) => void): grpc.ClientUnaryCall;
    public getMACD(request: market_data_pb.GetMACDRequest, callback: (error: grpc.ServiceError | null, response: market_data_pb.MACDResponse) => void): grpc.ClientUnaryCall;
    public getMACD(request: market_data_pb.GetMACDRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: market_data_pb.MACDResponse) => void): grpc.ClientUnaryCall;
    public getMACD(request: market_data_pb.GetMACDRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: market_data_pb.MACDResponse) => void): grpc.ClientUnaryCall;
    public getBollingerBands(request: market_data_pb.GetBollingerBandsRequest, callback: (error: grpc.ServiceError | null, response: market_data_pb.BollingerBandsResponse) => void): grpc.ClientUnaryCall;
    public getBollingerBands(request: market_data_pb.GetBollingerBandsRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: market_data_pb.BollingerBandsResponse) => void): grpc.ClientUnaryCall;
    public getBollingerBands(request: market_data_pb.GetBollingerBandsRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: market_data_pb.BollingerBandsResponse) => void): grpc.ClientUnaryCall;
    public getMovingAverage(request: market_data_pb.GetMovingAverageRequest, callback: (error: grpc.ServiceError | null, response: market_data_pb.MovingAverageResponse) => void): grpc.ClientUnaryCall;
    public getMovingAverage(request: market_data_pb.GetMovingAverageRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: market_data_pb.MovingAverageResponse) => void): grpc.ClientUnaryCall;
    public getMovingAverage(request: market_data_pb.GetMovingAverageRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: market_data_pb.MovingAverageResponse) => void): grpc.ClientUnaryCall;
    public getStochastic(request: market_data_pb.GetStochasticRequest, callback: (error: grpc.ServiceError | null, response: market_data_pb.StochasticResponse) => void): grpc.ClientUnaryCall;
    public getStochastic(request: market_data_pb.GetStochasticRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: market_data_pb.StochasticResponse) => void): grpc.ClientUnaryCall;
    public getStochastic(request: market_data_pb.GetStochasticRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: market_data_pb.StochasticResponse) => void): grpc.ClientUnaryCall;
    public getVolumeIndicators(request: market_data_pb.GetVolumeIndicatorsRequest, callback: (error: grpc.ServiceError | null, response: market_data_pb.VolumeIndicatorsResponse) => void): grpc.ClientUnaryCall;
    public getVolumeIndicators(request: market_data_pb.GetVolumeIndicatorsRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: market_data_pb.VolumeIndicatorsResponse) => void): grpc.ClientUnaryCall;
    public getVolumeIndicators(request: market_data_pb.GetVolumeIndicatorsRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: market_data_pb.VolumeIndicatorsResponse) => void): grpc.ClientUnaryCall;
    public getComprehensiveAnalysis(request: market_data_pb.GetComprehensiveAnalysisRequest, callback: (error: grpc.ServiceError | null, response: market_data_pb.ComprehensiveAnalysisResponse) => void): grpc.ClientUnaryCall;
    public getComprehensiveAnalysis(request: market_data_pb.GetComprehensiveAnalysisRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: market_data_pb.ComprehensiveAnalysisResponse) => void): grpc.ClientUnaryCall;
    public getComprehensiveAnalysis(request: market_data_pb.GetComprehensiveAnalysisRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: market_data_pb.ComprehensiveAnalysisResponse) => void): grpc.ClientUnaryCall;
    public createAlert(request: market_data_pb.CreateAlertRequest, callback: (error: grpc.ServiceError | null, response: market_data_pb.AlertResponse) => void): grpc.ClientUnaryCall;
    public createAlert(request: market_data_pb.CreateAlertRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: market_data_pb.AlertResponse) => void): grpc.ClientUnaryCall;
    public createAlert(request: market_data_pb.CreateAlertRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: market_data_pb.AlertResponse) => void): grpc.ClientUnaryCall;
    public updateAlert(request: market_data_pb.UpdateAlertRequest, callback: (error: grpc.ServiceError | null, response: market_data_pb.AlertResponse) => void): grpc.ClientUnaryCall;
    public updateAlert(request: market_data_pb.UpdateAlertRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: market_data_pb.AlertResponse) => void): grpc.ClientUnaryCall;
    public updateAlert(request: market_data_pb.UpdateAlertRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: market_data_pb.AlertResponse) => void): grpc.ClientUnaryCall;
    public deleteAlert(request: market_data_pb.DeleteAlertRequest, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public deleteAlert(request: market_data_pb.DeleteAlertRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public deleteAlert(request: market_data_pb.DeleteAlertRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public getUserAlerts(request: market_data_pb.GetUserAlertsRequest, callback: (error: grpc.ServiceError | null, response: market_data_pb.UserAlertsResponse) => void): grpc.ClientUnaryCall;
    public getUserAlerts(request: market_data_pb.GetUserAlertsRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: market_data_pb.UserAlertsResponse) => void): grpc.ClientUnaryCall;
    public getUserAlerts(request: market_data_pb.GetUserAlertsRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: market_data_pb.UserAlertsResponse) => void): grpc.ClientUnaryCall;
    public getAlertStatistics(request: market_data_pb.GetAlertStatisticsRequest, callback: (error: grpc.ServiceError | null, response: market_data_pb.AlertStatisticsResponse) => void): grpc.ClientUnaryCall;
    public getAlertStatistics(request: market_data_pb.GetAlertStatisticsRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: market_data_pb.AlertStatisticsResponse) => void): grpc.ClientUnaryCall;
    public getAlertStatistics(request: market_data_pb.GetAlertStatisticsRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: market_data_pb.AlertStatisticsResponse) => void): grpc.ClientUnaryCall;
    public addToWatchlist(request: market_data_pb.AddToWatchlistRequest, callback: (error: grpc.ServiceError | null, response: market_data_pb.WatchlistItemResponse) => void): grpc.ClientUnaryCall;
    public addToWatchlist(request: market_data_pb.AddToWatchlistRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: market_data_pb.WatchlistItemResponse) => void): grpc.ClientUnaryCall;
    public addToWatchlist(request: market_data_pb.AddToWatchlistRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: market_data_pb.WatchlistItemResponse) => void): grpc.ClientUnaryCall;
    public removeFromWatchlist(request: market_data_pb.RemoveFromWatchlistRequest, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public removeFromWatchlist(request: market_data_pb.RemoveFromWatchlistRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public removeFromWatchlist(request: market_data_pb.RemoveFromWatchlistRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public getUserWatchlist(request: market_data_pb.GetUserWatchlistRequest, callback: (error: grpc.ServiceError | null, response: market_data_pb.UserWatchlistResponse) => void): grpc.ClientUnaryCall;
    public getUserWatchlist(request: market_data_pb.GetUserWatchlistRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: market_data_pb.UserWatchlistResponse) => void): grpc.ClientUnaryCall;
    public getUserWatchlist(request: market_data_pb.GetUserWatchlistRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: market_data_pb.UserWatchlistResponse) => void): grpc.ClientUnaryCall;
    public updateWatchlistItem(request: market_data_pb.UpdateWatchlistItemRequest, callback: (error: grpc.ServiceError | null, response: market_data_pb.WatchlistItemResponse) => void): grpc.ClientUnaryCall;
    public updateWatchlistItem(request: market_data_pb.UpdateWatchlistItemRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: market_data_pb.WatchlistItemResponse) => void): grpc.ClientUnaryCall;
    public updateWatchlistItem(request: market_data_pb.UpdateWatchlistItemRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: market_data_pb.WatchlistItemResponse) => void): grpc.ClientUnaryCall;
    public getWatchlistStatistics(request: market_data_pb.GetWatchlistStatisticsRequest, callback: (error: grpc.ServiceError | null, response: market_data_pb.WatchlistStatisticsResponse) => void): grpc.ClientUnaryCall;
    public getWatchlistStatistics(request: market_data_pb.GetWatchlistStatisticsRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: market_data_pb.WatchlistStatisticsResponse) => void): grpc.ClientUnaryCall;
    public getWatchlistStatistics(request: market_data_pb.GetWatchlistStatisticsRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: market_data_pb.WatchlistStatisticsResponse) => void): grpc.ClientUnaryCall;
    public searchSymbols(request: market_data_pb.SearchSymbolsRequest, callback: (error: grpc.ServiceError | null, response: market_data_pb.SearchSymbolsResponse) => void): grpc.ClientUnaryCall;
    public searchSymbols(request: market_data_pb.SearchSymbolsRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: market_data_pb.SearchSymbolsResponse) => void): grpc.ClientUnaryCall;
    public searchSymbols(request: market_data_pb.SearchSymbolsRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: market_data_pb.SearchSymbolsResponse) => void): grpc.ClientUnaryCall;
}
