// package: treum.trading
// file: trading.proto

/* tslint:disable */
/* eslint-disable */

import * as jspb from "google-protobuf";
import * as google_protobuf_timestamp_pb from "google-protobuf/google/protobuf/timestamp_pb";
import * as google_protobuf_empty_pb from "google-protobuf/google/protobuf/empty_pb";

export class CreateTradeRequest extends jspb.Message { 
    getUserId(): string;
    setUserId(value: string): CreateTradeRequest;
    getAccountId(): string;
    setAccountId(value: string): CreateTradeRequest;
    getSymbol(): string;
    setSymbol(value: string): CreateTradeRequest;
    getAssetType(): AssetType;
    setAssetType(value: AssetType): CreateTradeRequest;
    getSignalId(): string;
    setSignalId(value: string): CreateTradeRequest;
    getType(): TradeType;
    setType(value: TradeType): CreateTradeRequest;
    getSide(): TradeSide;
    setSide(value: TradeSide): CreateTradeRequest;
    getQuantity(): number;
    setQuantity(value: number): CreateTradeRequest;
    getPrice(): number;
    setPrice(value: number): CreateTradeRequest;
    getStopLoss(): number;
    setStopLoss(value: number): CreateTradeRequest;
    getTakeProfit(): number;
    setTakeProfit(value: number): CreateTradeRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): CreateTradeRequest.AsObject;
    static toObject(includeInstance: boolean, msg: CreateTradeRequest): CreateTradeRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: CreateTradeRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): CreateTradeRequest;
    static deserializeBinaryFromReader(message: CreateTradeRequest, reader: jspb.BinaryReader): CreateTradeRequest;
}

export namespace CreateTradeRequest {
    export type AsObject = {
        userId: string,
        accountId: string,
        symbol: string,
        assetType: AssetType,
        signalId: string,
        type: TradeType,
        side: TradeSide,
        quantity: number,
        price: number,
        stopLoss: number,
        takeProfit: number,
    }
}

export class GetTradeRequest extends jspb.Message { 
    getId(): string;
    setId(value: string): GetTradeRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): GetTradeRequest.AsObject;
    static toObject(includeInstance: boolean, msg: GetTradeRequest): GetTradeRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: GetTradeRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): GetTradeRequest;
    static deserializeBinaryFromReader(message: GetTradeRequest, reader: jspb.BinaryReader): GetTradeRequest;
}

export namespace GetTradeRequest {
    export type AsObject = {
        id: string,
    }
}

export class CancelTradeRequest extends jspb.Message { 
    getId(): string;
    setId(value: string): CancelTradeRequest;
    getReason(): string;
    setReason(value: string): CancelTradeRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): CancelTradeRequest.AsObject;
    static toObject(includeInstance: boolean, msg: CancelTradeRequest): CancelTradeRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: CancelTradeRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): CancelTradeRequest;
    static deserializeBinaryFromReader(message: CancelTradeRequest, reader: jspb.BinaryReader): CancelTradeRequest;
}

export namespace CancelTradeRequest {
    export type AsObject = {
        id: string,
        reason: string,
    }
}

export class ListTradesRequest extends jspb.Message { 
    getUserId(): string;
    setUserId(value: string): ListTradesRequest;
    getAccountId(): string;
    setAccountId(value: string): ListTradesRequest;
    getPage(): number;
    setPage(value: number): ListTradesRequest;
    getLimit(): number;
    setLimit(value: number): ListTradesRequest;
    getStatusFilter(): TradeStatus;
    setStatusFilter(value: TradeStatus): ListTradesRequest;
    getAssetTypeFilter(): AssetType;
    setAssetTypeFilter(value: AssetType): ListTradesRequest;

    hasFromDate(): boolean;
    clearFromDate(): void;
    getFromDate(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setFromDate(value?: google_protobuf_timestamp_pb.Timestamp): ListTradesRequest;

    hasToDate(): boolean;
    clearToDate(): void;
    getToDate(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setToDate(value?: google_protobuf_timestamp_pb.Timestamp): ListTradesRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ListTradesRequest.AsObject;
    static toObject(includeInstance: boolean, msg: ListTradesRequest): ListTradesRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ListTradesRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ListTradesRequest;
    static deserializeBinaryFromReader(message: ListTradesRequest, reader: jspb.BinaryReader): ListTradesRequest;
}

export namespace ListTradesRequest {
    export type AsObject = {
        userId: string,
        accountId: string,
        page: number,
        limit: number,
        statusFilter: TradeStatus,
        assetTypeFilter: AssetType,
        fromDate?: google_protobuf_timestamp_pb.Timestamp.AsObject,
        toDate?: google_protobuf_timestamp_pb.Timestamp.AsObject,
    }
}

export class ListTradesResponse extends jspb.Message { 
    clearTradesList(): void;
    getTradesList(): Array<TradeResponse>;
    setTradesList(value: Array<TradeResponse>): ListTradesResponse;
    addTrades(value?: TradeResponse, index?: number): TradeResponse;
    getTotal(): number;
    setTotal(value: number): ListTradesResponse;
    getPage(): number;
    setPage(value: number): ListTradesResponse;
    getLimit(): number;
    setLimit(value: number): ListTradesResponse;
    getTotalPages(): number;
    setTotalPages(value: number): ListTradesResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ListTradesResponse.AsObject;
    static toObject(includeInstance: boolean, msg: ListTradesResponse): ListTradesResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ListTradesResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ListTradesResponse;
    static deserializeBinaryFromReader(message: ListTradesResponse, reader: jspb.BinaryReader): ListTradesResponse;
}

export namespace ListTradesResponse {
    export type AsObject = {
        tradesList: Array<TradeResponse.AsObject>,
        total: number,
        page: number,
        limit: number,
        totalPages: number,
    }
}

export class TradeResponse extends jspb.Message { 
    getId(): string;
    setId(value: string): TradeResponse;
    getUserId(): string;
    setUserId(value: string): TradeResponse;
    getAccountId(): string;
    setAccountId(value: string): TradeResponse;
    getSymbol(): string;
    setSymbol(value: string): TradeResponse;
    getAssetType(): AssetType;
    setAssetType(value: AssetType): TradeResponse;
    getSignalId(): string;
    setSignalId(value: string): TradeResponse;
    getType(): TradeType;
    setType(value: TradeType): TradeResponse;
    getSide(): TradeSide;
    setSide(value: TradeSide): TradeResponse;
    getQuantity(): number;
    setQuantity(value: number): TradeResponse;
    getPrice(): number;
    setPrice(value: number): TradeResponse;
    getStopLoss(): number;
    setStopLoss(value: number): TradeResponse;
    getTakeProfit(): number;
    setTakeProfit(value: number): TradeResponse;
    getStatus(): TradeStatus;
    setStatus(value: TradeStatus): TradeResponse;
    getFillPrice(): number;
    setFillPrice(value: number): TradeResponse;
    getCommission(): number;
    setCommission(value: number): TradeResponse;
    getPnl(): number;
    setPnl(value: number): TradeResponse;

    hasExecutedAt(): boolean;
    clearExecutedAt(): void;
    getExecutedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setExecutedAt(value?: google_protobuf_timestamp_pb.Timestamp): TradeResponse;

    hasCreatedAt(): boolean;
    clearCreatedAt(): void;
    getCreatedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setCreatedAt(value?: google_protobuf_timestamp_pb.Timestamp): TradeResponse;

    hasUpdatedAt(): boolean;
    clearUpdatedAt(): void;
    getUpdatedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setUpdatedAt(value?: google_protobuf_timestamp_pb.Timestamp): TradeResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): TradeResponse.AsObject;
    static toObject(includeInstance: boolean, msg: TradeResponse): TradeResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: TradeResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): TradeResponse;
    static deserializeBinaryFromReader(message: TradeResponse, reader: jspb.BinaryReader): TradeResponse;
}

export namespace TradeResponse {
    export type AsObject = {
        id: string,
        userId: string,
        accountId: string,
        symbol: string,
        assetType: AssetType,
        signalId: string,
        type: TradeType,
        side: TradeSide,
        quantity: number,
        price: number,
        stopLoss: number,
        takeProfit: number,
        status: TradeStatus,
        fillPrice: number,
        commission: number,
        pnl: number,
        executedAt?: google_protobuf_timestamp_pb.Timestamp.AsObject,
        createdAt?: google_protobuf_timestamp_pb.Timestamp.AsObject,
        updatedAt?: google_protobuf_timestamp_pb.Timestamp.AsObject,
    }
}

export class CreateTradingAccountRequest extends jspb.Message { 
    getUserId(): string;
    setUserId(value: string): CreateTradingAccountRequest;
    getAccountType(): AccountType;
    setAccountType(value: AccountType): CreateTradingAccountRequest;
    getBroker(): string;
    setBroker(value: string): CreateTradingAccountRequest;
    getBalance(): number;
    setBalance(value: number): CreateTradingAccountRequest;
    getCurrency(): string;
    setCurrency(value: string): CreateTradingAccountRequest;
    getLeverage(): number;
    setLeverage(value: number): CreateTradingAccountRequest;
    getApiKey(): string;
    setApiKey(value: string): CreateTradingAccountRequest;
    getApiSecret(): string;
    setApiSecret(value: string): CreateTradingAccountRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): CreateTradingAccountRequest.AsObject;
    static toObject(includeInstance: boolean, msg: CreateTradingAccountRequest): CreateTradingAccountRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: CreateTradingAccountRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): CreateTradingAccountRequest;
    static deserializeBinaryFromReader(message: CreateTradingAccountRequest, reader: jspb.BinaryReader): CreateTradingAccountRequest;
}

export namespace CreateTradingAccountRequest {
    export type AsObject = {
        userId: string,
        accountType: AccountType,
        broker: string,
        balance: number,
        currency: string,
        leverage: number,
        apiKey: string,
        apiSecret: string,
    }
}

export class GetTradingAccountRequest extends jspb.Message { 
    getId(): string;
    setId(value: string): GetTradingAccountRequest;
    getUserId(): string;
    setUserId(value: string): GetTradingAccountRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): GetTradingAccountRequest.AsObject;
    static toObject(includeInstance: boolean, msg: GetTradingAccountRequest): GetTradingAccountRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: GetTradingAccountRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): GetTradingAccountRequest;
    static deserializeBinaryFromReader(message: GetTradingAccountRequest, reader: jspb.BinaryReader): GetTradingAccountRequest;
}

export namespace GetTradingAccountRequest {
    export type AsObject = {
        id: string,
        userId: string,
    }
}

export class TradingAccountResponse extends jspb.Message { 
    getId(): string;
    setId(value: string): TradingAccountResponse;
    getUserId(): string;
    setUserId(value: string): TradingAccountResponse;
    getAccountType(): AccountType;
    setAccountType(value: AccountType): TradingAccountResponse;
    getBroker(): string;
    setBroker(value: string): TradingAccountResponse;
    getBalance(): number;
    setBalance(value: number): TradingAccountResponse;
    getCurrency(): string;
    setCurrency(value: string): TradingAccountResponse;
    getLeverage(): number;
    setLeverage(value: number): TradingAccountResponse;
    getIsActive(): boolean;
    setIsActive(value: boolean): TradingAccountResponse;

    hasCreatedAt(): boolean;
    clearCreatedAt(): void;
    getCreatedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setCreatedAt(value?: google_protobuf_timestamp_pb.Timestamp): TradingAccountResponse;

    hasUpdatedAt(): boolean;
    clearUpdatedAt(): void;
    getUpdatedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setUpdatedAt(value?: google_protobuf_timestamp_pb.Timestamp): TradingAccountResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): TradingAccountResponse.AsObject;
    static toObject(includeInstance: boolean, msg: TradingAccountResponse): TradingAccountResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: TradingAccountResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): TradingAccountResponse;
    static deserializeBinaryFromReader(message: TradingAccountResponse, reader: jspb.BinaryReader): TradingAccountResponse;
}

export namespace TradingAccountResponse {
    export type AsObject = {
        id: string,
        userId: string,
        accountType: AccountType,
        broker: string,
        balance: number,
        currency: string,
        leverage: number,
        isActive: boolean,
        createdAt?: google_protobuf_timestamp_pb.Timestamp.AsObject,
        updatedAt?: google_protobuf_timestamp_pb.Timestamp.AsObject,
    }
}

export class GetPortfolioRequest extends jspb.Message { 
    getUserId(): string;
    setUserId(value: string): GetPortfolioRequest;
    getAccountId(): string;
    setAccountId(value: string): GetPortfolioRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): GetPortfolioRequest.AsObject;
    static toObject(includeInstance: boolean, msg: GetPortfolioRequest): GetPortfolioRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: GetPortfolioRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): GetPortfolioRequest;
    static deserializeBinaryFromReader(message: GetPortfolioRequest, reader: jspb.BinaryReader): GetPortfolioRequest;
}

export namespace GetPortfolioRequest {
    export type AsObject = {
        userId: string,
        accountId: string,
    }
}

export class PortfolioResponse extends jspb.Message { 
    getUserId(): string;
    setUserId(value: string): PortfolioResponse;
    getAccountId(): string;
    setAccountId(value: string): PortfolioResponse;
    getTotalValue(): number;
    setTotalValue(value: number): PortfolioResponse;
    getAvailableBalance(): number;
    setAvailableBalance(value: number): PortfolioResponse;
    getUsedMargin(): number;
    setUsedMargin(value: number): PortfolioResponse;
    getUnrealizedPnl(): number;
    setUnrealizedPnl(value: number): PortfolioResponse;
    getRealizedPnl(): number;
    setRealizedPnl(value: number): PortfolioResponse;
    clearPositionsList(): void;
    getPositionsList(): Array<Position>;
    setPositionsList(value: Array<Position>): PortfolioResponse;
    addPositions(value?: Position, index?: number): Position;

    hasLastUpdated(): boolean;
    clearLastUpdated(): void;
    getLastUpdated(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setLastUpdated(value?: google_protobuf_timestamp_pb.Timestamp): PortfolioResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): PortfolioResponse.AsObject;
    static toObject(includeInstance: boolean, msg: PortfolioResponse): PortfolioResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: PortfolioResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): PortfolioResponse;
    static deserializeBinaryFromReader(message: PortfolioResponse, reader: jspb.BinaryReader): PortfolioResponse;
}

export namespace PortfolioResponse {
    export type AsObject = {
        userId: string,
        accountId: string,
        totalValue: number,
        availableBalance: number,
        usedMargin: number,
        unrealizedPnl: number,
        realizedPnl: number,
        positionsList: Array<Position.AsObject>,
        lastUpdated?: google_protobuf_timestamp_pb.Timestamp.AsObject,
    }
}

export class Position extends jspb.Message { 
    getSymbol(): string;
    setSymbol(value: string): Position;
    getAssetType(): AssetType;
    setAssetType(value: AssetType): Position;
    getQuantity(): number;
    setQuantity(value: number): Position;
    getAveragePrice(): number;
    setAveragePrice(value: number): Position;
    getCurrentPrice(): number;
    setCurrentPrice(value: number): Position;
    getMarketValue(): number;
    setMarketValue(value: number): Position;
    getUnrealizedPnl(): number;
    setUnrealizedPnl(value: number): Position;
    getUnrealizedPnlPercent(): number;
    setUnrealizedPnlPercent(value: number): Position;
    getSide(): TradeSide;
    setSide(value: TradeSide): Position;

    hasOpenedAt(): boolean;
    clearOpenedAt(): void;
    getOpenedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setOpenedAt(value?: google_protobuf_timestamp_pb.Timestamp): Position;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Position.AsObject;
    static toObject(includeInstance: boolean, msg: Position): Position.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Position, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Position;
    static deserializeBinaryFromReader(message: Position, reader: jspb.BinaryReader): Position;
}

export namespace Position {
    export type AsObject = {
        symbol: string,
        assetType: AssetType,
        quantity: number,
        averagePrice: number,
        currentPrice: number,
        marketValue: number,
        unrealizedPnl: number,
        unrealizedPnlPercent: number,
        side: TradeSide,
        openedAt?: google_protobuf_timestamp_pb.Timestamp.AsObject,
    }
}

export class GetTradeHistoryRequest extends jspb.Message { 
    getUserId(): string;
    setUserId(value: string): GetTradeHistoryRequest;
    getAccountId(): string;
    setAccountId(value: string): GetTradeHistoryRequest;
    getPage(): number;
    setPage(value: number): GetTradeHistoryRequest;
    getLimit(): number;
    setLimit(value: number): GetTradeHistoryRequest;

    hasFromDate(): boolean;
    clearFromDate(): void;
    getFromDate(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setFromDate(value?: google_protobuf_timestamp_pb.Timestamp): GetTradeHistoryRequest;

    hasToDate(): boolean;
    clearToDate(): void;
    getToDate(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setToDate(value?: google_protobuf_timestamp_pb.Timestamp): GetTradeHistoryRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): GetTradeHistoryRequest.AsObject;
    static toObject(includeInstance: boolean, msg: GetTradeHistoryRequest): GetTradeHistoryRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: GetTradeHistoryRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): GetTradeHistoryRequest;
    static deserializeBinaryFromReader(message: GetTradeHistoryRequest, reader: jspb.BinaryReader): GetTradeHistoryRequest;
}

export namespace GetTradeHistoryRequest {
    export type AsObject = {
        userId: string,
        accountId: string,
        page: number,
        limit: number,
        fromDate?: google_protobuf_timestamp_pb.Timestamp.AsObject,
        toDate?: google_protobuf_timestamp_pb.Timestamp.AsObject,
    }
}

export class TradeHistoryResponse extends jspb.Message { 
    clearTradesList(): void;
    getTradesList(): Array<TradeResponse>;
    setTradesList(value: Array<TradeResponse>): TradeHistoryResponse;
    addTrades(value?: TradeResponse, index?: number): TradeResponse;
    getTotal(): number;
    setTotal(value: number): TradeHistoryResponse;
    getPage(): number;
    setPage(value: number): TradeHistoryResponse;
    getLimit(): number;
    setLimit(value: number): TradeHistoryResponse;
    getTotalPnl(): number;
    setTotalPnl(value: number): TradeHistoryResponse;
    getTotalCommission(): number;
    setTotalCommission(value: number): TradeHistoryResponse;
    getWinningTrades(): number;
    setWinningTrades(value: number): TradeHistoryResponse;
    getLosingTrades(): number;
    setLosingTrades(value: number): TradeHistoryResponse;
    getWinRate(): number;
    setWinRate(value: number): TradeHistoryResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): TradeHistoryResponse.AsObject;
    static toObject(includeInstance: boolean, msg: TradeHistoryResponse): TradeHistoryResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: TradeHistoryResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): TradeHistoryResponse;
    static deserializeBinaryFromReader(message: TradeHistoryResponse, reader: jspb.BinaryReader): TradeHistoryResponse;
}

export namespace TradeHistoryResponse {
    export type AsObject = {
        tradesList: Array<TradeResponse.AsObject>,
        total: number,
        page: number,
        limit: number,
        totalPnl: number,
        totalCommission: number,
        winningTrades: number,
        losingTrades: number,
        winRate: number,
    }
}

export enum AssetType {
    ASSET_TYPE_UNSPECIFIED = 0,
    ASSET_TYPE_STOCK = 1,
    ASSET_TYPE_CRYPTO = 2,
    ASSET_TYPE_FOREX = 3,
    ASSET_TYPE_COMMODITY = 4,
    ASSET_TYPE_INDEX = 5,
    ASSET_TYPE_BOND = 6,
}

export enum TradeType {
    TRADE_TYPE_UNSPECIFIED = 0,
    TRADE_TYPE_MARKET = 1,
    TRADE_TYPE_LIMIT = 2,
    TRADE_TYPE_STOP = 3,
    TRADE_TYPE_STOP_LIMIT = 4,
}

export enum TradeSide {
    TRADE_SIDE_UNSPECIFIED = 0,
    TRADE_SIDE_BUY = 1,
    TRADE_SIDE_SELL = 2,
}

export enum TradeStatus {
    TRADE_STATUS_UNSPECIFIED = 0,
    TRADE_STATUS_PENDING = 1,
    TRADE_STATUS_FILLED = 2,
    TRADE_STATUS_PARTIALLY_FILLED = 3,
    TRADE_STATUS_CANCELLED = 4,
    TRADE_STATUS_REJECTED = 5,
}

export enum AccountType {
    ACCOUNT_TYPE_UNSPECIFIED = 0,
    ACCOUNT_TYPE_DEMO = 1,
    ACCOUNT_TYPE_LIVE = 2,
}
