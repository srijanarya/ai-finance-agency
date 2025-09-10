// package: treum.trading
// file: trading.proto

/* tslint:disable */
/* eslint-disable */

import * as grpc from "@grpc/grpc-js";
import * as trading_pb from "./trading_pb";
import * as google_protobuf_timestamp_pb from "google-protobuf/google/protobuf/timestamp_pb";
import * as google_protobuf_empty_pb from "google-protobuf/google/protobuf/empty_pb";

interface ITradingServiceService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
    createTrade: ITradingServiceService_ICreateTrade;
    getTrade: ITradingServiceService_IGetTrade;
    listTrades: ITradingServiceService_IListTrades;
    cancelTrade: ITradingServiceService_ICancelTrade;
    getTradingAccount: ITradingServiceService_IGetTradingAccount;
    createTradingAccount: ITradingServiceService_ICreateTradingAccount;
    getPortfolio: ITradingServiceService_IGetPortfolio;
    getTradeHistory: ITradingServiceService_IGetTradeHistory;
}

interface ITradingServiceService_ICreateTrade extends grpc.MethodDefinition<trading_pb.CreateTradeRequest, trading_pb.TradeResponse> {
    path: "/treum.trading.TradingService/CreateTrade";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<trading_pb.CreateTradeRequest>;
    requestDeserialize: grpc.deserialize<trading_pb.CreateTradeRequest>;
    responseSerialize: grpc.serialize<trading_pb.TradeResponse>;
    responseDeserialize: grpc.deserialize<trading_pb.TradeResponse>;
}
interface ITradingServiceService_IGetTrade extends grpc.MethodDefinition<trading_pb.GetTradeRequest, trading_pb.TradeResponse> {
    path: "/treum.trading.TradingService/GetTrade";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<trading_pb.GetTradeRequest>;
    requestDeserialize: grpc.deserialize<trading_pb.GetTradeRequest>;
    responseSerialize: grpc.serialize<trading_pb.TradeResponse>;
    responseDeserialize: grpc.deserialize<trading_pb.TradeResponse>;
}
interface ITradingServiceService_IListTrades extends grpc.MethodDefinition<trading_pb.ListTradesRequest, trading_pb.ListTradesResponse> {
    path: "/treum.trading.TradingService/ListTrades";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<trading_pb.ListTradesRequest>;
    requestDeserialize: grpc.deserialize<trading_pb.ListTradesRequest>;
    responseSerialize: grpc.serialize<trading_pb.ListTradesResponse>;
    responseDeserialize: grpc.deserialize<trading_pb.ListTradesResponse>;
}
interface ITradingServiceService_ICancelTrade extends grpc.MethodDefinition<trading_pb.CancelTradeRequest, trading_pb.TradeResponse> {
    path: "/treum.trading.TradingService/CancelTrade";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<trading_pb.CancelTradeRequest>;
    requestDeserialize: grpc.deserialize<trading_pb.CancelTradeRequest>;
    responseSerialize: grpc.serialize<trading_pb.TradeResponse>;
    responseDeserialize: grpc.deserialize<trading_pb.TradeResponse>;
}
interface ITradingServiceService_IGetTradingAccount extends grpc.MethodDefinition<trading_pb.GetTradingAccountRequest, trading_pb.TradingAccountResponse> {
    path: "/treum.trading.TradingService/GetTradingAccount";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<trading_pb.GetTradingAccountRequest>;
    requestDeserialize: grpc.deserialize<trading_pb.GetTradingAccountRequest>;
    responseSerialize: grpc.serialize<trading_pb.TradingAccountResponse>;
    responseDeserialize: grpc.deserialize<trading_pb.TradingAccountResponse>;
}
interface ITradingServiceService_ICreateTradingAccount extends grpc.MethodDefinition<trading_pb.CreateTradingAccountRequest, trading_pb.TradingAccountResponse> {
    path: "/treum.trading.TradingService/CreateTradingAccount";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<trading_pb.CreateTradingAccountRequest>;
    requestDeserialize: grpc.deserialize<trading_pb.CreateTradingAccountRequest>;
    responseSerialize: grpc.serialize<trading_pb.TradingAccountResponse>;
    responseDeserialize: grpc.deserialize<trading_pb.TradingAccountResponse>;
}
interface ITradingServiceService_IGetPortfolio extends grpc.MethodDefinition<trading_pb.GetPortfolioRequest, trading_pb.PortfolioResponse> {
    path: "/treum.trading.TradingService/GetPortfolio";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<trading_pb.GetPortfolioRequest>;
    requestDeserialize: grpc.deserialize<trading_pb.GetPortfolioRequest>;
    responseSerialize: grpc.serialize<trading_pb.PortfolioResponse>;
    responseDeserialize: grpc.deserialize<trading_pb.PortfolioResponse>;
}
interface ITradingServiceService_IGetTradeHistory extends grpc.MethodDefinition<trading_pb.GetTradeHistoryRequest, trading_pb.TradeHistoryResponse> {
    path: "/treum.trading.TradingService/GetTradeHistory";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<trading_pb.GetTradeHistoryRequest>;
    requestDeserialize: grpc.deserialize<trading_pb.GetTradeHistoryRequest>;
    responseSerialize: grpc.serialize<trading_pb.TradeHistoryResponse>;
    responseDeserialize: grpc.deserialize<trading_pb.TradeHistoryResponse>;
}

export const TradingServiceService: ITradingServiceService;

export interface ITradingServiceServer extends grpc.UntypedServiceImplementation {
    createTrade: grpc.handleUnaryCall<trading_pb.CreateTradeRequest, trading_pb.TradeResponse>;
    getTrade: grpc.handleUnaryCall<trading_pb.GetTradeRequest, trading_pb.TradeResponse>;
    listTrades: grpc.handleUnaryCall<trading_pb.ListTradesRequest, trading_pb.ListTradesResponse>;
    cancelTrade: grpc.handleUnaryCall<trading_pb.CancelTradeRequest, trading_pb.TradeResponse>;
    getTradingAccount: grpc.handleUnaryCall<trading_pb.GetTradingAccountRequest, trading_pb.TradingAccountResponse>;
    createTradingAccount: grpc.handleUnaryCall<trading_pb.CreateTradingAccountRequest, trading_pb.TradingAccountResponse>;
    getPortfolio: grpc.handleUnaryCall<trading_pb.GetPortfolioRequest, trading_pb.PortfolioResponse>;
    getTradeHistory: grpc.handleUnaryCall<trading_pb.GetTradeHistoryRequest, trading_pb.TradeHistoryResponse>;
}

export interface ITradingServiceClient {
    createTrade(request: trading_pb.CreateTradeRequest, callback: (error: grpc.ServiceError | null, response: trading_pb.TradeResponse) => void): grpc.ClientUnaryCall;
    createTrade(request: trading_pb.CreateTradeRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: trading_pb.TradeResponse) => void): grpc.ClientUnaryCall;
    createTrade(request: trading_pb.CreateTradeRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: trading_pb.TradeResponse) => void): grpc.ClientUnaryCall;
    getTrade(request: trading_pb.GetTradeRequest, callback: (error: grpc.ServiceError | null, response: trading_pb.TradeResponse) => void): grpc.ClientUnaryCall;
    getTrade(request: trading_pb.GetTradeRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: trading_pb.TradeResponse) => void): grpc.ClientUnaryCall;
    getTrade(request: trading_pb.GetTradeRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: trading_pb.TradeResponse) => void): grpc.ClientUnaryCall;
    listTrades(request: trading_pb.ListTradesRequest, callback: (error: grpc.ServiceError | null, response: trading_pb.ListTradesResponse) => void): grpc.ClientUnaryCall;
    listTrades(request: trading_pb.ListTradesRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: trading_pb.ListTradesResponse) => void): grpc.ClientUnaryCall;
    listTrades(request: trading_pb.ListTradesRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: trading_pb.ListTradesResponse) => void): grpc.ClientUnaryCall;
    cancelTrade(request: trading_pb.CancelTradeRequest, callback: (error: grpc.ServiceError | null, response: trading_pb.TradeResponse) => void): grpc.ClientUnaryCall;
    cancelTrade(request: trading_pb.CancelTradeRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: trading_pb.TradeResponse) => void): grpc.ClientUnaryCall;
    cancelTrade(request: trading_pb.CancelTradeRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: trading_pb.TradeResponse) => void): grpc.ClientUnaryCall;
    getTradingAccount(request: trading_pb.GetTradingAccountRequest, callback: (error: grpc.ServiceError | null, response: trading_pb.TradingAccountResponse) => void): grpc.ClientUnaryCall;
    getTradingAccount(request: trading_pb.GetTradingAccountRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: trading_pb.TradingAccountResponse) => void): grpc.ClientUnaryCall;
    getTradingAccount(request: trading_pb.GetTradingAccountRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: trading_pb.TradingAccountResponse) => void): grpc.ClientUnaryCall;
    createTradingAccount(request: trading_pb.CreateTradingAccountRequest, callback: (error: grpc.ServiceError | null, response: trading_pb.TradingAccountResponse) => void): grpc.ClientUnaryCall;
    createTradingAccount(request: trading_pb.CreateTradingAccountRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: trading_pb.TradingAccountResponse) => void): grpc.ClientUnaryCall;
    createTradingAccount(request: trading_pb.CreateTradingAccountRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: trading_pb.TradingAccountResponse) => void): grpc.ClientUnaryCall;
    getPortfolio(request: trading_pb.GetPortfolioRequest, callback: (error: grpc.ServiceError | null, response: trading_pb.PortfolioResponse) => void): grpc.ClientUnaryCall;
    getPortfolio(request: trading_pb.GetPortfolioRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: trading_pb.PortfolioResponse) => void): grpc.ClientUnaryCall;
    getPortfolio(request: trading_pb.GetPortfolioRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: trading_pb.PortfolioResponse) => void): grpc.ClientUnaryCall;
    getTradeHistory(request: trading_pb.GetTradeHistoryRequest, callback: (error: grpc.ServiceError | null, response: trading_pb.TradeHistoryResponse) => void): grpc.ClientUnaryCall;
    getTradeHistory(request: trading_pb.GetTradeHistoryRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: trading_pb.TradeHistoryResponse) => void): grpc.ClientUnaryCall;
    getTradeHistory(request: trading_pb.GetTradeHistoryRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: trading_pb.TradeHistoryResponse) => void): grpc.ClientUnaryCall;
}

export class TradingServiceClient extends grpc.Client implements ITradingServiceClient {
    constructor(address: string, credentials: grpc.ChannelCredentials, options?: Partial<grpc.ClientOptions>);
    public createTrade(request: trading_pb.CreateTradeRequest, callback: (error: grpc.ServiceError | null, response: trading_pb.TradeResponse) => void): grpc.ClientUnaryCall;
    public createTrade(request: trading_pb.CreateTradeRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: trading_pb.TradeResponse) => void): grpc.ClientUnaryCall;
    public createTrade(request: trading_pb.CreateTradeRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: trading_pb.TradeResponse) => void): grpc.ClientUnaryCall;
    public getTrade(request: trading_pb.GetTradeRequest, callback: (error: grpc.ServiceError | null, response: trading_pb.TradeResponse) => void): grpc.ClientUnaryCall;
    public getTrade(request: trading_pb.GetTradeRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: trading_pb.TradeResponse) => void): grpc.ClientUnaryCall;
    public getTrade(request: trading_pb.GetTradeRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: trading_pb.TradeResponse) => void): grpc.ClientUnaryCall;
    public listTrades(request: trading_pb.ListTradesRequest, callback: (error: grpc.ServiceError | null, response: trading_pb.ListTradesResponse) => void): grpc.ClientUnaryCall;
    public listTrades(request: trading_pb.ListTradesRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: trading_pb.ListTradesResponse) => void): grpc.ClientUnaryCall;
    public listTrades(request: trading_pb.ListTradesRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: trading_pb.ListTradesResponse) => void): grpc.ClientUnaryCall;
    public cancelTrade(request: trading_pb.CancelTradeRequest, callback: (error: grpc.ServiceError | null, response: trading_pb.TradeResponse) => void): grpc.ClientUnaryCall;
    public cancelTrade(request: trading_pb.CancelTradeRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: trading_pb.TradeResponse) => void): grpc.ClientUnaryCall;
    public cancelTrade(request: trading_pb.CancelTradeRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: trading_pb.TradeResponse) => void): grpc.ClientUnaryCall;
    public getTradingAccount(request: trading_pb.GetTradingAccountRequest, callback: (error: grpc.ServiceError | null, response: trading_pb.TradingAccountResponse) => void): grpc.ClientUnaryCall;
    public getTradingAccount(request: trading_pb.GetTradingAccountRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: trading_pb.TradingAccountResponse) => void): grpc.ClientUnaryCall;
    public getTradingAccount(request: trading_pb.GetTradingAccountRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: trading_pb.TradingAccountResponse) => void): grpc.ClientUnaryCall;
    public createTradingAccount(request: trading_pb.CreateTradingAccountRequest, callback: (error: grpc.ServiceError | null, response: trading_pb.TradingAccountResponse) => void): grpc.ClientUnaryCall;
    public createTradingAccount(request: trading_pb.CreateTradingAccountRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: trading_pb.TradingAccountResponse) => void): grpc.ClientUnaryCall;
    public createTradingAccount(request: trading_pb.CreateTradingAccountRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: trading_pb.TradingAccountResponse) => void): grpc.ClientUnaryCall;
    public getPortfolio(request: trading_pb.GetPortfolioRequest, callback: (error: grpc.ServiceError | null, response: trading_pb.PortfolioResponse) => void): grpc.ClientUnaryCall;
    public getPortfolio(request: trading_pb.GetPortfolioRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: trading_pb.PortfolioResponse) => void): grpc.ClientUnaryCall;
    public getPortfolio(request: trading_pb.GetPortfolioRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: trading_pb.PortfolioResponse) => void): grpc.ClientUnaryCall;
    public getTradeHistory(request: trading_pb.GetTradeHistoryRequest, callback: (error: grpc.ServiceError | null, response: trading_pb.TradeHistoryResponse) => void): grpc.ClientUnaryCall;
    public getTradeHistory(request: trading_pb.GetTradeHistoryRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: trading_pb.TradeHistoryResponse) => void): grpc.ClientUnaryCall;
    public getTradeHistory(request: trading_pb.GetTradeHistoryRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: trading_pb.TradeHistoryResponse) => void): grpc.ClientUnaryCall;
}
