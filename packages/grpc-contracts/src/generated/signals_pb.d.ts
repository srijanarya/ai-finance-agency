// package: treum.signals
// file: signals.proto

/* tslint:disable */
/* eslint-disable */

import * as jspb from "google-protobuf";
import * as google_protobuf_timestamp_pb from "google-protobuf/google/protobuf/timestamp_pb";
import * as google_protobuf_empty_pb from "google-protobuf/google/protobuf/empty_pb";

export class CreateSignalRequest extends jspb.Message { 
    getSymbol(): string;
    setSymbol(value: string): CreateSignalRequest;
    getAssetType(): AssetType;
    setAssetType(value: AssetType): CreateSignalRequest;
    getType(): SignalType;
    setType(value: SignalType): CreateSignalRequest;
    getPrice(): number;
    setPrice(value: number): CreateSignalRequest;
    getStopLoss(): number;
    setStopLoss(value: number): CreateSignalRequest;
    getTakeProfit(): number;
    setTakeProfit(value: number): CreateSignalRequest;
    getRiskLevel(): RiskLevel;
    setRiskLevel(value: RiskLevel): CreateSignalRequest;
    getTimeFrame(): TimeFrame;
    setTimeFrame(value: TimeFrame): CreateSignalRequest;
    getConfidence(): number;
    setConfidence(value: number): CreateSignalRequest;
    getAnalysis(): string;
    setAnalysis(value: string): CreateSignalRequest;

    hasExpiresAt(): boolean;
    clearExpiresAt(): void;
    getExpiresAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setExpiresAt(value?: google_protobuf_timestamp_pb.Timestamp): CreateSignalRequest;
    getCreatedBy(): string;
    setCreatedBy(value: string): CreateSignalRequest;
    clearTargetAudienceList(): void;
    getTargetAudienceList(): Array<SubscriptionTier>;
    setTargetAudienceList(value: Array<SubscriptionTier>): CreateSignalRequest;
    addTargetAudience(value: SubscriptionTier, index?: number): SubscriptionTier;
    clearTagsList(): void;
    getTagsList(): Array<string>;
    setTagsList(value: Array<string>): CreateSignalRequest;
    addTags(value: string, index?: number): string;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): CreateSignalRequest.AsObject;
    static toObject(includeInstance: boolean, msg: CreateSignalRequest): CreateSignalRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: CreateSignalRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): CreateSignalRequest;
    static deserializeBinaryFromReader(message: CreateSignalRequest, reader: jspb.BinaryReader): CreateSignalRequest;
}

export namespace CreateSignalRequest {
    export type AsObject = {
        symbol: string,
        assetType: AssetType,
        type: SignalType,
        price: number,
        stopLoss: number,
        takeProfit: number,
        riskLevel: RiskLevel,
        timeFrame: TimeFrame,
        confidence: number,
        analysis: string,
        expiresAt?: google_protobuf_timestamp_pb.Timestamp.AsObject,
        createdBy: string,
        targetAudienceList: Array<SubscriptionTier>,
        tagsList: Array<string>,
    }
}

export class UpdateSignalRequest extends jspb.Message { 
    getId(): string;
    setId(value: string): UpdateSignalRequest;
    getPrice(): number;
    setPrice(value: number): UpdateSignalRequest;
    getStopLoss(): number;
    setStopLoss(value: number): UpdateSignalRequest;
    getTakeProfit(): number;
    setTakeProfit(value: number): UpdateSignalRequest;
    getConfidence(): number;
    setConfidence(value: number): UpdateSignalRequest;
    getAnalysis(): string;
    setAnalysis(value: string): UpdateSignalRequest;

    hasExpiresAt(): boolean;
    clearExpiresAt(): void;
    getExpiresAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setExpiresAt(value?: google_protobuf_timestamp_pb.Timestamp): UpdateSignalRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): UpdateSignalRequest.AsObject;
    static toObject(includeInstance: boolean, msg: UpdateSignalRequest): UpdateSignalRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: UpdateSignalRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): UpdateSignalRequest;
    static deserializeBinaryFromReader(message: UpdateSignalRequest, reader: jspb.BinaryReader): UpdateSignalRequest;
}

export namespace UpdateSignalRequest {
    export type AsObject = {
        id: string,
        price: number,
        stopLoss: number,
        takeProfit: number,
        confidence: number,
        analysis: string,
        expiresAt?: google_protobuf_timestamp_pb.Timestamp.AsObject,
    }
}

export class GetSignalRequest extends jspb.Message { 
    getId(): string;
    setId(value: string): GetSignalRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): GetSignalRequest.AsObject;
    static toObject(includeInstance: boolean, msg: GetSignalRequest): GetSignalRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: GetSignalRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): GetSignalRequest;
    static deserializeBinaryFromReader(message: GetSignalRequest, reader: jspb.BinaryReader): GetSignalRequest;
}

export namespace GetSignalRequest {
    export type AsObject = {
        id: string,
    }
}

export class ExpireSignalRequest extends jspb.Message { 
    getId(): string;
    setId(value: string): ExpireSignalRequest;
    getFinalPrice(): number;
    setFinalPrice(value: number): ExpireSignalRequest;
    getPerformance(): number;
    setPerformance(value: number): ExpireSignalRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ExpireSignalRequest.AsObject;
    static toObject(includeInstance: boolean, msg: ExpireSignalRequest): ExpireSignalRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ExpireSignalRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ExpireSignalRequest;
    static deserializeBinaryFromReader(message: ExpireSignalRequest, reader: jspb.BinaryReader): ExpireSignalRequest;
}

export namespace ExpireSignalRequest {
    export type AsObject = {
        id: string,
        finalPrice: number,
        performance: number,
    }
}

export class ListSignalsRequest extends jspb.Message { 
    getPage(): number;
    setPage(value: number): ListSignalsRequest;
    getLimit(): number;
    setLimit(value: number): ListSignalsRequest;
    getAssetTypeFilter(): AssetType;
    setAssetTypeFilter(value: AssetType): ListSignalsRequest;
    getTypeFilter(): SignalType;
    setTypeFilter(value: SignalType): ListSignalsRequest;
    getStatusFilter(): SignalStatus;
    setStatusFilter(value: SignalStatus): ListSignalsRequest;
    getRiskLevelFilter(): RiskLevel;
    setRiskLevelFilter(value: RiskLevel): ListSignalsRequest;
    getTimeFrameFilter(): TimeFrame;
    setTimeFrameFilter(value: TimeFrame): ListSignalsRequest;
    clearTagsList(): void;
    getTagsList(): Array<string>;
    setTagsList(value: Array<string>): ListSignalsRequest;
    addTags(value: string, index?: number): string;
    getUserTier(): SubscriptionTier;
    setUserTier(value: SubscriptionTier): ListSignalsRequest;

    hasFromDate(): boolean;
    clearFromDate(): void;
    getFromDate(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setFromDate(value?: google_protobuf_timestamp_pb.Timestamp): ListSignalsRequest;

    hasToDate(): boolean;
    clearToDate(): void;
    getToDate(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setToDate(value?: google_protobuf_timestamp_pb.Timestamp): ListSignalsRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ListSignalsRequest.AsObject;
    static toObject(includeInstance: boolean, msg: ListSignalsRequest): ListSignalsRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ListSignalsRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ListSignalsRequest;
    static deserializeBinaryFromReader(message: ListSignalsRequest, reader: jspb.BinaryReader): ListSignalsRequest;
}

export namespace ListSignalsRequest {
    export type AsObject = {
        page: number,
        limit: number,
        assetTypeFilter: AssetType,
        typeFilter: SignalType,
        statusFilter: SignalStatus,
        riskLevelFilter: RiskLevel,
        timeFrameFilter: TimeFrame,
        tagsList: Array<string>,
        userTier: SubscriptionTier,
        fromDate?: google_protobuf_timestamp_pb.Timestamp.AsObject,
        toDate?: google_protobuf_timestamp_pb.Timestamp.AsObject,
    }
}

export class ListSignalsResponse extends jspb.Message { 
    clearSignalsList(): void;
    getSignalsList(): Array<SignalResponse>;
    setSignalsList(value: Array<SignalResponse>): ListSignalsResponse;
    addSignals(value?: SignalResponse, index?: number): SignalResponse;
    getTotal(): number;
    setTotal(value: number): ListSignalsResponse;
    getPage(): number;
    setPage(value: number): ListSignalsResponse;
    getLimit(): number;
    setLimit(value: number): ListSignalsResponse;
    getTotalPages(): number;
    setTotalPages(value: number): ListSignalsResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ListSignalsResponse.AsObject;
    static toObject(includeInstance: boolean, msg: ListSignalsResponse): ListSignalsResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ListSignalsResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ListSignalsResponse;
    static deserializeBinaryFromReader(message: ListSignalsResponse, reader: jspb.BinaryReader): ListSignalsResponse;
}

export namespace ListSignalsResponse {
    export type AsObject = {
        signalsList: Array<SignalResponse.AsObject>,
        total: number,
        page: number,
        limit: number,
        totalPages: number,
    }
}

export class SignalResponse extends jspb.Message { 
    getId(): string;
    setId(value: string): SignalResponse;
    getSymbol(): string;
    setSymbol(value: string): SignalResponse;
    getAssetType(): AssetType;
    setAssetType(value: AssetType): SignalResponse;
    getType(): SignalType;
    setType(value: SignalType): SignalResponse;
    getStatus(): SignalStatus;
    setStatus(value: SignalStatus): SignalResponse;
    getPrice(): number;
    setPrice(value: number): SignalResponse;
    getStopLoss(): number;
    setStopLoss(value: number): SignalResponse;
    getTakeProfit(): number;
    setTakeProfit(value: number): SignalResponse;
    getRiskLevel(): RiskLevel;
    setRiskLevel(value: RiskLevel): SignalResponse;
    getTimeFrame(): TimeFrame;
    setTimeFrame(value: TimeFrame): SignalResponse;
    getConfidence(): number;
    setConfidence(value: number): SignalResponse;
    getAnalysis(): string;
    setAnalysis(value: string): SignalResponse;

    hasExpiresAt(): boolean;
    clearExpiresAt(): void;
    getExpiresAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setExpiresAt(value?: google_protobuf_timestamp_pb.Timestamp): SignalResponse;
    getCreatedBy(): string;
    setCreatedBy(value: string): SignalResponse;
    clearTargetAudienceList(): void;
    getTargetAudienceList(): Array<SubscriptionTier>;
    setTargetAudienceList(value: Array<SubscriptionTier>): SignalResponse;
    addTargetAudience(value: SubscriptionTier, index?: number): SubscriptionTier;
    clearTagsList(): void;
    getTagsList(): Array<string>;
    setTagsList(value: Array<string>): SignalResponse;
    addTags(value: string, index?: number): string;

    hasPerformance(): boolean;
    clearPerformance(): void;
    getPerformance(): SignalPerformanceData | undefined;
    setPerformance(value?: SignalPerformanceData): SignalResponse;

    hasCreatedAt(): boolean;
    clearCreatedAt(): void;
    getCreatedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setCreatedAt(value?: google_protobuf_timestamp_pb.Timestamp): SignalResponse;

    hasUpdatedAt(): boolean;
    clearUpdatedAt(): void;
    getUpdatedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setUpdatedAt(value?: google_protobuf_timestamp_pb.Timestamp): SignalResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): SignalResponse.AsObject;
    static toObject(includeInstance: boolean, msg: SignalResponse): SignalResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: SignalResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): SignalResponse;
    static deserializeBinaryFromReader(message: SignalResponse, reader: jspb.BinaryReader): SignalResponse;
}

export namespace SignalResponse {
    export type AsObject = {
        id: string,
        symbol: string,
        assetType: AssetType,
        type: SignalType,
        status: SignalStatus,
        price: number,
        stopLoss: number,
        takeProfit: number,
        riskLevel: RiskLevel,
        timeFrame: TimeFrame,
        confidence: number,
        analysis: string,
        expiresAt?: google_protobuf_timestamp_pb.Timestamp.AsObject,
        createdBy: string,
        targetAudienceList: Array<SubscriptionTier>,
        tagsList: Array<string>,
        performance?: SignalPerformanceData.AsObject,
        createdAt?: google_protobuf_timestamp_pb.Timestamp.AsObject,
        updatedAt?: google_protobuf_timestamp_pb.Timestamp.AsObject,
    }
}

export class SignalPerformanceData extends jspb.Message { 
    getMaxPnl(): number;
    setMaxPnl(value: number): SignalPerformanceData;
    getCurrentPnl(): number;
    setCurrentPnl(value: number): SignalPerformanceData;
    getHitStopLoss(): boolean;
    setHitStopLoss(value: boolean): SignalPerformanceData;
    getHitTakeProfit(): boolean;
    setHitTakeProfit(value: boolean): SignalPerformanceData;

    hasClosedAt(): boolean;
    clearClosedAt(): void;
    getClosedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setClosedAt(value?: google_protobuf_timestamp_pb.Timestamp): SignalPerformanceData;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): SignalPerformanceData.AsObject;
    static toObject(includeInstance: boolean, msg: SignalPerformanceData): SignalPerformanceData.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: SignalPerformanceData, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): SignalPerformanceData;
    static deserializeBinaryFromReader(message: SignalPerformanceData, reader: jspb.BinaryReader): SignalPerformanceData;
}

export namespace SignalPerformanceData {
    export type AsObject = {
        maxPnl: number,
        currentPnl: number,
        hitStopLoss: boolean,
        hitTakeProfit: boolean,
        closedAt?: google_protobuf_timestamp_pb.Timestamp.AsObject,
    }
}

export class GetSignalPerformanceRequest extends jspb.Message { 
    getSignalId(): string;
    setSignalId(value: string): GetSignalPerformanceRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): GetSignalPerformanceRequest.AsObject;
    static toObject(includeInstance: boolean, msg: GetSignalPerformanceRequest): GetSignalPerformanceRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: GetSignalPerformanceRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): GetSignalPerformanceRequest;
    static deserializeBinaryFromReader(message: GetSignalPerformanceRequest, reader: jspb.BinaryReader): GetSignalPerformanceRequest;
}

export namespace GetSignalPerformanceRequest {
    export type AsObject = {
        signalId: string,
    }
}

export class SignalPerformanceResponse extends jspb.Message { 
    getSignalId(): string;
    setSignalId(value: string): SignalPerformanceResponse;
    getTotalFollowers(): number;
    setTotalFollowers(value: number): SignalPerformanceResponse;
    getSuccessfulTrades(): number;
    setSuccessfulTrades(value: number): SignalPerformanceResponse;
    getTotalTrades(): number;
    setTotalTrades(value: number): SignalPerformanceResponse;
    getAvgPnl(): number;
    setAvgPnl(value: number): SignalPerformanceResponse;
    getWinRate(): number;
    setWinRate(value: number): SignalPerformanceResponse;
    getAvgHoldingTime(): number;
    setAvgHoldingTime(value: number): SignalPerformanceResponse;
    getRiskAdjustedReturn(): number;
    setRiskAdjustedReturn(value: number): SignalPerformanceResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): SignalPerformanceResponse.AsObject;
    static toObject(includeInstance: boolean, msg: SignalPerformanceResponse): SignalPerformanceResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: SignalPerformanceResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): SignalPerformanceResponse;
    static deserializeBinaryFromReader(message: SignalPerformanceResponse, reader: jspb.BinaryReader): SignalPerformanceResponse;
}

export namespace SignalPerformanceResponse {
    export type AsObject = {
        signalId: string,
        totalFollowers: number,
        successfulTrades: number,
        totalTrades: number,
        avgPnl: number,
        winRate: number,
        avgHoldingTime: number,
        riskAdjustedReturn: number,
    }
}

export class ListActiveSignalsRequest extends jspb.Message { 
    getUserTier(): SubscriptionTier;
    setUserTier(value: SubscriptionTier): ListActiveSignalsRequest;
    getAssetTypeFilter(): AssetType;
    setAssetTypeFilter(value: AssetType): ListActiveSignalsRequest;
    getRiskLevelFilter(): RiskLevel;
    setRiskLevelFilter(value: RiskLevel): ListActiveSignalsRequest;
    getLimit(): number;
    setLimit(value: number): ListActiveSignalsRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ListActiveSignalsRequest.AsObject;
    static toObject(includeInstance: boolean, msg: ListActiveSignalsRequest): ListActiveSignalsRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ListActiveSignalsRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ListActiveSignalsRequest;
    static deserializeBinaryFromReader(message: ListActiveSignalsRequest, reader: jspb.BinaryReader): ListActiveSignalsRequest;
}

export namespace ListActiveSignalsRequest {
    export type AsObject = {
        userTier: SubscriptionTier,
        assetTypeFilter: AssetType,
        riskLevelFilter: RiskLevel,
        limit: number,
    }
}

export class FollowSignalRequest extends jspb.Message { 
    getUserId(): string;
    setUserId(value: string): FollowSignalRequest;
    getSignalId(): string;
    setSignalId(value: string): FollowSignalRequest;
    getAllocationAmount(): number;
    setAllocationAmount(value: number): FollowSignalRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): FollowSignalRequest.AsObject;
    static toObject(includeInstance: boolean, msg: FollowSignalRequest): FollowSignalRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: FollowSignalRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): FollowSignalRequest;
    static deserializeBinaryFromReader(message: FollowSignalRequest, reader: jspb.BinaryReader): FollowSignalRequest;
}

export namespace FollowSignalRequest {
    export type AsObject = {
        userId: string,
        signalId: string,
        allocationAmount: number,
    }
}

export class UnfollowSignalRequest extends jspb.Message { 
    getUserId(): string;
    setUserId(value: string): UnfollowSignalRequest;
    getSignalId(): string;
    setSignalId(value: string): UnfollowSignalRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): UnfollowSignalRequest.AsObject;
    static toObject(includeInstance: boolean, msg: UnfollowSignalRequest): UnfollowSignalRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: UnfollowSignalRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): UnfollowSignalRequest;
    static deserializeBinaryFromReader(message: UnfollowSignalRequest, reader: jspb.BinaryReader): UnfollowSignalRequest;
}

export namespace UnfollowSignalRequest {
    export type AsObject = {
        userId: string,
        signalId: string,
    }
}

export class GetUserSignalHistoryRequest extends jspb.Message { 
    getUserId(): string;
    setUserId(value: string): GetUserSignalHistoryRequest;
    getPage(): number;
    setPage(value: number): GetUserSignalHistoryRequest;
    getLimit(): number;
    setLimit(value: number): GetUserSignalHistoryRequest;

    hasFromDate(): boolean;
    clearFromDate(): void;
    getFromDate(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setFromDate(value?: google_protobuf_timestamp_pb.Timestamp): GetUserSignalHistoryRequest;

    hasToDate(): boolean;
    clearToDate(): void;
    getToDate(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setToDate(value?: google_protobuf_timestamp_pb.Timestamp): GetUserSignalHistoryRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): GetUserSignalHistoryRequest.AsObject;
    static toObject(includeInstance: boolean, msg: GetUserSignalHistoryRequest): GetUserSignalHistoryRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: GetUserSignalHistoryRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): GetUserSignalHistoryRequest;
    static deserializeBinaryFromReader(message: GetUserSignalHistoryRequest, reader: jspb.BinaryReader): GetUserSignalHistoryRequest;
}

export namespace GetUserSignalHistoryRequest {
    export type AsObject = {
        userId: string,
        page: number,
        limit: number,
        fromDate?: google_protobuf_timestamp_pb.Timestamp.AsObject,
        toDate?: google_protobuf_timestamp_pb.Timestamp.AsObject,
    }
}

export class UserSignalHistoryResponse extends jspb.Message { 
    clearFollowsList(): void;
    getFollowsList(): Array<UserSignalFollow>;
    setFollowsList(value: Array<UserSignalFollow>): UserSignalHistoryResponse;
    addFollows(value?: UserSignalFollow, index?: number): UserSignalFollow;
    getTotal(): number;
    setTotal(value: number): UserSignalHistoryResponse;
    getPage(): number;
    setPage(value: number): UserSignalHistoryResponse;
    getLimit(): number;
    setLimit(value: number): UserSignalHistoryResponse;
    getTotalPnl(): number;
    setTotalPnl(value: number): UserSignalHistoryResponse;
    getTotalAllocated(): number;
    setTotalAllocated(value: number): UserSignalHistoryResponse;
    getSuccessfulSignals(): number;
    setSuccessfulSignals(value: number): UserSignalHistoryResponse;
    getWinRate(): number;
    setWinRate(value: number): UserSignalHistoryResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): UserSignalHistoryResponse.AsObject;
    static toObject(includeInstance: boolean, msg: UserSignalHistoryResponse): UserSignalHistoryResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: UserSignalHistoryResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): UserSignalHistoryResponse;
    static deserializeBinaryFromReader(message: UserSignalHistoryResponse, reader: jspb.BinaryReader): UserSignalHistoryResponse;
}

export namespace UserSignalHistoryResponse {
    export type AsObject = {
        followsList: Array<UserSignalFollow.AsObject>,
        total: number,
        page: number,
        limit: number,
        totalPnl: number,
        totalAllocated: number,
        successfulSignals: number,
        winRate: number,
    }
}

export class UserSignalFollow extends jspb.Message { 
    getUserId(): string;
    setUserId(value: string): UserSignalFollow;
    getSignalId(): string;
    setSignalId(value: string): UserSignalFollow;

    hasSignal(): boolean;
    clearSignal(): void;
    getSignal(): SignalResponse | undefined;
    setSignal(value?: SignalResponse): UserSignalFollow;
    getAllocationAmount(): number;
    setAllocationAmount(value: number): UserSignalFollow;
    getRealizedPnl(): number;
    setRealizedPnl(value: number): UserSignalFollow;

    hasFollowedAt(): boolean;
    clearFollowedAt(): void;
    getFollowedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setFollowedAt(value?: google_protobuf_timestamp_pb.Timestamp): UserSignalFollow;

    hasClosedAt(): boolean;
    clearClosedAt(): void;
    getClosedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setClosedAt(value?: google_protobuf_timestamp_pb.Timestamp): UserSignalFollow;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): UserSignalFollow.AsObject;
    static toObject(includeInstance: boolean, msg: UserSignalFollow): UserSignalFollow.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: UserSignalFollow, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): UserSignalFollow;
    static deserializeBinaryFromReader(message: UserSignalFollow, reader: jspb.BinaryReader): UserSignalFollow;
}

export namespace UserSignalFollow {
    export type AsObject = {
        userId: string,
        signalId: string,
        signal?: SignalResponse.AsObject,
        allocationAmount: number,
        realizedPnl: number,
        followedAt?: google_protobuf_timestamp_pb.Timestamp.AsObject,
        closedAt?: google_protobuf_timestamp_pb.Timestamp.AsObject,
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

export enum SignalType {
    SIGNAL_TYPE_UNSPECIFIED = 0,
    SIGNAL_TYPE_BUY = 1,
    SIGNAL_TYPE_SELL = 2,
    SIGNAL_TYPE_HOLD = 3,
}

export enum SignalStatus {
    SIGNAL_STATUS_UNSPECIFIED = 0,
    SIGNAL_STATUS_ACTIVE = 1,
    SIGNAL_STATUS_EXPIRED = 2,
    SIGNAL_STATUS_EXECUTED = 3,
    SIGNAL_STATUS_CANCELLED = 4,
}

export enum RiskLevel {
    RISK_LEVEL_UNSPECIFIED = 0,
    RISK_LEVEL_LOW = 1,
    RISK_LEVEL_MEDIUM = 2,
    RISK_LEVEL_HIGH = 3,
    RISK_LEVEL_VERY_HIGH = 4,
}

export enum TimeFrame {
    TIME_FRAME_UNSPECIFIED = 0,
    TIME_FRAME_1M = 1,
    TIME_FRAME_5M = 2,
    TIME_FRAME_15M = 3,
    TIME_FRAME_30M = 4,
    TIME_FRAME_1H = 5,
    TIME_FRAME_4H = 6,
    TIME_FRAME_1D = 7,
    TIME_FRAME_1W = 8,
    TIME_FRAME_1MONTH = 9,
}

export enum SubscriptionTier {
    SUBSCRIPTION_TIER_UNSPECIFIED = 0,
    SUBSCRIPTION_TIER_FREE = 1,
    SUBSCRIPTION_TIER_BASIC = 2,
    SUBSCRIPTION_TIER_PREMIUM = 3,
    SUBSCRIPTION_TIER_ENTERPRISE = 4,
}
