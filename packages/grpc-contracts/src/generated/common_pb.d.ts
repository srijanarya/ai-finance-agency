// package: treum.common
// file: common.proto

/* tslint:disable */
/* eslint-disable */

import * as jspb from "google-protobuf";
import * as google_protobuf_timestamp_pb from "google-protobuf/google/protobuf/timestamp_pb";
import * as google_protobuf_empty_pb from "google-protobuf/google/protobuf/empty_pb";

export class HealthCheckRequest extends jspb.Message { 
    getService(): string;
    setService(value: string): HealthCheckRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): HealthCheckRequest.AsObject;
    static toObject(includeInstance: boolean, msg: HealthCheckRequest): HealthCheckRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: HealthCheckRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): HealthCheckRequest;
    static deserializeBinaryFromReader(message: HealthCheckRequest, reader: jspb.BinaryReader): HealthCheckRequest;
}

export namespace HealthCheckRequest {
    export type AsObject = {
        service: string,
    }
}

export class HealthCheckResponse extends jspb.Message { 
    getStatus(): HealthStatus;
    setStatus(value: HealthStatus): HealthCheckResponse;
    clearChecksList(): void;
    getChecksList(): Array<HealthCheckDetail>;
    setChecksList(value: Array<HealthCheckDetail>): HealthCheckResponse;
    addChecks(value?: HealthCheckDetail, index?: number): HealthCheckDetail;

    hasTimestamp(): boolean;
    clearTimestamp(): void;
    getTimestamp(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setTimestamp(value?: google_protobuf_timestamp_pb.Timestamp): HealthCheckResponse;
    getVersion(): string;
    setVersion(value: string): HealthCheckResponse;
    getUptime(): number;
    setUptime(value: number): HealthCheckResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): HealthCheckResponse.AsObject;
    static toObject(includeInstance: boolean, msg: HealthCheckResponse): HealthCheckResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: HealthCheckResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): HealthCheckResponse;
    static deserializeBinaryFromReader(message: HealthCheckResponse, reader: jspb.BinaryReader): HealthCheckResponse;
}

export namespace HealthCheckResponse {
    export type AsObject = {
        status: HealthStatus,
        checksList: Array<HealthCheckDetail.AsObject>,
        timestamp?: google_protobuf_timestamp_pb.Timestamp.AsObject,
        version: string,
        uptime: number,
    }
}

export class HealthCheckDetail extends jspb.Message { 
    getName(): string;
    setName(value: string): HealthCheckDetail;
    getStatus(): HealthStatus;
    setStatus(value: HealthStatus): HealthCheckDetail;
    getMessage(): string;
    setMessage(value: string): HealthCheckDetail;
    getResponseTimeMs(): number;
    setResponseTimeMs(value: number): HealthCheckDetail;

    getMetadataMap(): jspb.Map<string, string>;
    clearMetadataMap(): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): HealthCheckDetail.AsObject;
    static toObject(includeInstance: boolean, msg: HealthCheckDetail): HealthCheckDetail.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: HealthCheckDetail, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): HealthCheckDetail;
    static deserializeBinaryFromReader(message: HealthCheckDetail, reader: jspb.BinaryReader): HealthCheckDetail;
}

export namespace HealthCheckDetail {
    export type AsObject = {
        name: string,
        status: HealthStatus,
        message: string,
        responseTimeMs: number,

        metadataMap: Array<[string, string]>,
    }
}

export class RecordMetricRequest extends jspb.Message { 
    getName(): string;
    setName(value: string): RecordMetricRequest;
    getValue(): number;
    setValue(value: number): RecordMetricRequest;
    getType(): MetricType;
    setType(value: MetricType): RecordMetricRequest;
    getUnit(): string;
    setUnit(value: string): RecordMetricRequest;

    getTagsMap(): jspb.Map<string, string>;
    clearTagsMap(): void;

    hasTimestamp(): boolean;
    clearTimestamp(): void;
    getTimestamp(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setTimestamp(value?: google_protobuf_timestamp_pb.Timestamp): RecordMetricRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): RecordMetricRequest.AsObject;
    static toObject(includeInstance: boolean, msg: RecordMetricRequest): RecordMetricRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: RecordMetricRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): RecordMetricRequest;
    static deserializeBinaryFromReader(message: RecordMetricRequest, reader: jspb.BinaryReader): RecordMetricRequest;
}

export namespace RecordMetricRequest {
    export type AsObject = {
        name: string,
        value: number,
        type: MetricType,
        unit: string,

        tagsMap: Array<[string, string]>,
        timestamp?: google_protobuf_timestamp_pb.Timestamp.AsObject,
    }
}

export class GetMetricsRequest extends jspb.Message { 
    getService(): string;
    setService(value: string): GetMetricsRequest;
    clearMetricNamesList(): void;
    getMetricNamesList(): Array<string>;
    setMetricNamesList(value: Array<string>): GetMetricsRequest;
    addMetricNames(value: string, index?: number): string;

    hasFromTime(): boolean;
    clearFromTime(): void;
    getFromTime(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setFromTime(value?: google_protobuf_timestamp_pb.Timestamp): GetMetricsRequest;

    hasToTime(): boolean;
    clearToTime(): void;
    getToTime(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setToTime(value?: google_protobuf_timestamp_pb.Timestamp): GetMetricsRequest;

    getTagsMap(): jspb.Map<string, string>;
    clearTagsMap(): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): GetMetricsRequest.AsObject;
    static toObject(includeInstance: boolean, msg: GetMetricsRequest): GetMetricsRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: GetMetricsRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): GetMetricsRequest;
    static deserializeBinaryFromReader(message: GetMetricsRequest, reader: jspb.BinaryReader): GetMetricsRequest;
}

export namespace GetMetricsRequest {
    export type AsObject = {
        service: string,
        metricNamesList: Array<string>,
        fromTime?: google_protobuf_timestamp_pb.Timestamp.AsObject,
        toTime?: google_protobuf_timestamp_pb.Timestamp.AsObject,

        tagsMap: Array<[string, string]>,
    }
}

export class GetMetricsResponse extends jspb.Message { 
    clearMetricsList(): void;
    getMetricsList(): Array<MetricData>;
    setMetricsList(value: Array<MetricData>): GetMetricsResponse;
    addMetrics(value?: MetricData, index?: number): MetricData;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): GetMetricsResponse.AsObject;
    static toObject(includeInstance: boolean, msg: GetMetricsResponse): GetMetricsResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: GetMetricsResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): GetMetricsResponse;
    static deserializeBinaryFromReader(message: GetMetricsResponse, reader: jspb.BinaryReader): GetMetricsResponse;
}

export namespace GetMetricsResponse {
    export type AsObject = {
        metricsList: Array<MetricData.AsObject>,
    }
}

export class MetricData extends jspb.Message { 
    getName(): string;
    setName(value: string): MetricData;
    getValue(): number;
    setValue(value: number): MetricData;
    getType(): MetricType;
    setType(value: MetricType): MetricData;
    getUnit(): string;
    setUnit(value: string): MetricData;

    getTagsMap(): jspb.Map<string, string>;
    clearTagsMap(): void;

    hasTimestamp(): boolean;
    clearTimestamp(): void;
    getTimestamp(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setTimestamp(value?: google_protobuf_timestamp_pb.Timestamp): MetricData;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): MetricData.AsObject;
    static toObject(includeInstance: boolean, msg: MetricData): MetricData.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: MetricData, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): MetricData;
    static deserializeBinaryFromReader(message: MetricData, reader: jspb.BinaryReader): MetricData;
}

export namespace MetricData {
    export type AsObject = {
        name: string,
        value: number,
        type: MetricType,
        unit: string,

        tagsMap: Array<[string, string]>,
        timestamp?: google_protobuf_timestamp_pb.Timestamp.AsObject,
    }
}

export class OperationResult extends jspb.Message { 
    getSuccess(): boolean;
    setSuccess(value: boolean): OperationResult;
    getMessage(): string;
    setMessage(value: string): OperationResult;
    getErrorCode(): string;
    setErrorCode(value: string): OperationResult;

    getMetadataMap(): jspb.Map<string, string>;
    clearMetadataMap(): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): OperationResult.AsObject;
    static toObject(includeInstance: boolean, msg: OperationResult): OperationResult.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: OperationResult, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): OperationResult;
    static deserializeBinaryFromReader(message: OperationResult, reader: jspb.BinaryReader): OperationResult;
}

export namespace OperationResult {
    export type AsObject = {
        success: boolean,
        message: string,
        errorCode: string,

        metadataMap: Array<[string, string]>,
    }
}

export class ErrorResponse extends jspb.Message { 
    getCode(): string;
    setCode(value: string): ErrorResponse;
    getMessage(): string;
    setMessage(value: string): ErrorResponse;
    getService(): string;
    setService(value: string): ErrorResponse;

    hasTimestamp(): boolean;
    clearTimestamp(): void;
    getTimestamp(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setTimestamp(value?: google_protobuf_timestamp_pb.Timestamp): ErrorResponse;
    getCorrelationId(): string;
    setCorrelationId(value: string): ErrorResponse;
    getStackTrace(): string;
    setStackTrace(value: string): ErrorResponse;

    getContextMap(): jspb.Map<string, string>;
    clearContextMap(): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ErrorResponse.AsObject;
    static toObject(includeInstance: boolean, msg: ErrorResponse): ErrorResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ErrorResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ErrorResponse;
    static deserializeBinaryFromReader(message: ErrorResponse, reader: jspb.BinaryReader): ErrorResponse;
}

export namespace ErrorResponse {
    export type AsObject = {
        code: string,
        message: string,
        service: string,
        timestamp?: google_protobuf_timestamp_pb.Timestamp.AsObject,
        correlationId: string,
        stackTrace: string,

        contextMap: Array<[string, string]>,
    }
}

export class PaginationRequest extends jspb.Message { 
    getPage(): number;
    setPage(value: number): PaginationRequest;
    getLimit(): number;
    setLimit(value: number): PaginationRequest;
    getSortBy(): string;
    setSortBy(value: string): PaginationRequest;
    getSortOrder(): string;
    setSortOrder(value: string): PaginationRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): PaginationRequest.AsObject;
    static toObject(includeInstance: boolean, msg: PaginationRequest): PaginationRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: PaginationRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): PaginationRequest;
    static deserializeBinaryFromReader(message: PaginationRequest, reader: jspb.BinaryReader): PaginationRequest;
}

export namespace PaginationRequest {
    export type AsObject = {
        page: number,
        limit: number,
        sortBy: string,
        sortOrder: string,
    }
}

export class PaginationResponse extends jspb.Message { 
    getPage(): number;
    setPage(value: number): PaginationResponse;
    getLimit(): number;
    setLimit(value: number): PaginationResponse;
    getTotal(): number;
    setTotal(value: number): PaginationResponse;
    getTotalPages(): number;
    setTotalPages(value: number): PaginationResponse;
    getHasNext(): boolean;
    setHasNext(value: boolean): PaginationResponse;
    getHasPrevious(): boolean;
    setHasPrevious(value: boolean): PaginationResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): PaginationResponse.AsObject;
    static toObject(includeInstance: boolean, msg: PaginationResponse): PaginationResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: PaginationResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): PaginationResponse;
    static deserializeBinaryFromReader(message: PaginationResponse, reader: jspb.BinaryReader): PaginationResponse;
}

export namespace PaginationResponse {
    export type AsObject = {
        page: number,
        limit: number,
        total: number,
        totalPages: number,
        hasNext: boolean,
        hasPrevious: boolean,
    }
}

export class AuthContext extends jspb.Message { 
    getUserId(): string;
    setUserId(value: string): AuthContext;
    getEmail(): string;
    setEmail(value: string): AuthContext;
    getUsername(): string;
    setUsername(value: string): AuthContext;
    getRole(): string;
    setRole(value: string): AuthContext;
    getSubscriptionTier(): SubscriptionTier;
    setSubscriptionTier(value: SubscriptionTier): AuthContext;
    getCorrelationId(): string;
    setCorrelationId(value: string): AuthContext;

    hasIssuedAt(): boolean;
    clearIssuedAt(): void;
    getIssuedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setIssuedAt(value?: google_protobuf_timestamp_pb.Timestamp): AuthContext;

    hasExpiresAt(): boolean;
    clearExpiresAt(): void;
    getExpiresAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setExpiresAt(value?: google_protobuf_timestamp_pb.Timestamp): AuthContext;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): AuthContext.AsObject;
    static toObject(includeInstance: boolean, msg: AuthContext): AuthContext.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: AuthContext, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): AuthContext;
    static deserializeBinaryFromReader(message: AuthContext, reader: jspb.BinaryReader): AuthContext;
}

export namespace AuthContext {
    export type AsObject = {
        userId: string,
        email: string,
        username: string,
        role: string,
        subscriptionTier: SubscriptionTier,
        correlationId: string,
        issuedAt?: google_protobuf_timestamp_pb.Timestamp.AsObject,
        expiresAt?: google_protobuf_timestamp_pb.Timestamp.AsObject,
    }
}

export class ValidateTokenRequest extends jspb.Message { 
    getToken(): string;
    setToken(value: string): ValidateTokenRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ValidateTokenRequest.AsObject;
    static toObject(includeInstance: boolean, msg: ValidateTokenRequest): ValidateTokenRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ValidateTokenRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ValidateTokenRequest;
    static deserializeBinaryFromReader(message: ValidateTokenRequest, reader: jspb.BinaryReader): ValidateTokenRequest;
}

export namespace ValidateTokenRequest {
    export type AsObject = {
        token: string,
    }
}

export class ValidateTokenResponse extends jspb.Message { 
    getValid(): boolean;
    setValid(value: boolean): ValidateTokenResponse;

    hasAuthContext(): boolean;
    clearAuthContext(): void;
    getAuthContext(): AuthContext | undefined;
    setAuthContext(value?: AuthContext): ValidateTokenResponse;
    getErrorMessage(): string;
    setErrorMessage(value: string): ValidateTokenResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ValidateTokenResponse.AsObject;
    static toObject(includeInstance: boolean, msg: ValidateTokenResponse): ValidateTokenResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ValidateTokenResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ValidateTokenResponse;
    static deserializeBinaryFromReader(message: ValidateTokenResponse, reader: jspb.BinaryReader): ValidateTokenResponse;
}

export namespace ValidateTokenResponse {
    export type AsObject = {
        valid: boolean,
        authContext?: AuthContext.AsObject,
        errorMessage: string,
    }
}

export class CircuitBreakerConfig extends jspb.Message { 
    getServiceName(): string;
    setServiceName(value: string): CircuitBreakerConfig;
    getFailureThreshold(): number;
    setFailureThreshold(value: number): CircuitBreakerConfig;
    getRecoveryTimeoutSeconds(): number;
    setRecoveryTimeoutSeconds(value: number): CircuitBreakerConfig;
    getMonitoringPeriodSeconds(): number;
    setMonitoringPeriodSeconds(value: number): CircuitBreakerConfig;
    clearExpectedErrorsList(): void;
    getExpectedErrorsList(): Array<string>;
    setExpectedErrorsList(value: Array<string>): CircuitBreakerConfig;
    addExpectedErrors(value: string, index?: number): string;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): CircuitBreakerConfig.AsObject;
    static toObject(includeInstance: boolean, msg: CircuitBreakerConfig): CircuitBreakerConfig.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: CircuitBreakerConfig, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): CircuitBreakerConfig;
    static deserializeBinaryFromReader(message: CircuitBreakerConfig, reader: jspb.BinaryReader): CircuitBreakerConfig;
}

export namespace CircuitBreakerConfig {
    export type AsObject = {
        serviceName: string,
        failureThreshold: number,
        recoveryTimeoutSeconds: number,
        monitoringPeriodSeconds: number,
        expectedErrorsList: Array<string>,
    }
}

export class CircuitBreakerState extends jspb.Message { 
    getServiceName(): string;
    setServiceName(value: string): CircuitBreakerState;
    getState(): CircuitState;
    setState(value: CircuitState): CircuitBreakerState;
    getFailureCount(): number;
    setFailureCount(value: number): CircuitBreakerState;

    hasLastFailureTime(): boolean;
    clearLastFailureTime(): void;
    getLastFailureTime(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setLastFailureTime(value?: google_protobuf_timestamp_pb.Timestamp): CircuitBreakerState;

    hasNextAttemptTime(): boolean;
    clearNextAttemptTime(): void;
    getNextAttemptTime(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setNextAttemptTime(value?: google_protobuf_timestamp_pb.Timestamp): CircuitBreakerState;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): CircuitBreakerState.AsObject;
    static toObject(includeInstance: boolean, msg: CircuitBreakerState): CircuitBreakerState.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: CircuitBreakerState, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): CircuitBreakerState;
    static deserializeBinaryFromReader(message: CircuitBreakerState, reader: jspb.BinaryReader): CircuitBreakerState;
}

export namespace CircuitBreakerState {
    export type AsObject = {
        serviceName: string,
        state: CircuitState,
        failureCount: number,
        lastFailureTime?: google_protobuf_timestamp_pb.Timestamp.AsObject,
        nextAttemptTime?: google_protobuf_timestamp_pb.Timestamp.AsObject,
    }
}

export class TraceContext extends jspb.Message { 
    getTraceId(): string;
    setTraceId(value: string): TraceContext;
    getSpanId(): string;
    setSpanId(value: string): TraceContext;
    getParentSpanId(): string;
    setParentSpanId(value: string): TraceContext;
    getFlags(): number;
    setFlags(value: number): TraceContext;

    getBaggageMap(): jspb.Map<string, string>;
    clearBaggageMap(): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): TraceContext.AsObject;
    static toObject(includeInstance: boolean, msg: TraceContext): TraceContext.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: TraceContext, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): TraceContext;
    static deserializeBinaryFromReader(message: TraceContext, reader: jspb.BinaryReader): TraceContext;
}

export namespace TraceContext {
    export type AsObject = {
        traceId: string,
        spanId: string,
        parentSpanId: string,
        flags: number,

        baggageMap: Array<[string, string]>,
    }
}

export class SpanInfo extends jspb.Message { 
    getOperationName(): string;
    setOperationName(value: string): SpanInfo;
    getStartTime(): number;
    setStartTime(value: number): SpanInfo;
    getEndTime(): number;
    setEndTime(value: number): SpanInfo;

    getTagsMap(): jspb.Map<string, string>;
    clearTagsMap(): void;
    clearLogsList(): void;
    getLogsList(): Array<LogEntry>;
    setLogsList(value: Array<LogEntry>): SpanInfo;
    addLogs(value?: LogEntry, index?: number): LogEntry;

    hasStatus(): boolean;
    clearStatus(): void;
    getStatus(): SpanStatus | undefined;
    setStatus(value?: SpanStatus): SpanInfo;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): SpanInfo.AsObject;
    static toObject(includeInstance: boolean, msg: SpanInfo): SpanInfo.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: SpanInfo, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): SpanInfo;
    static deserializeBinaryFromReader(message: SpanInfo, reader: jspb.BinaryReader): SpanInfo;
}

export namespace SpanInfo {
    export type AsObject = {
        operationName: string,
        startTime: number,
        endTime: number,

        tagsMap: Array<[string, string]>,
        logsList: Array<LogEntry.AsObject>,
        status?: SpanStatus.AsObject,
    }
}

export class LogEntry extends jspb.Message { 
    getTimestamp(): number;
    setTimestamp(value: number): LogEntry;

    getFieldsMap(): jspb.Map<string, string>;
    clearFieldsMap(): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): LogEntry.AsObject;
    static toObject(includeInstance: boolean, msg: LogEntry): LogEntry.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: LogEntry, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): LogEntry;
    static deserializeBinaryFromReader(message: LogEntry, reader: jspb.BinaryReader): LogEntry;
}

export namespace LogEntry {
    export type AsObject = {
        timestamp: number,

        fieldsMap: Array<[string, string]>,
    }
}

export class SpanStatus extends jspb.Message { 
    getCode(): number;
    setCode(value: number): SpanStatus;
    getMessage(): string;
    setMessage(value: string): SpanStatus;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): SpanStatus.AsObject;
    static toObject(includeInstance: boolean, msg: SpanStatus): SpanStatus.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: SpanStatus, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): SpanStatus;
    static deserializeBinaryFromReader(message: SpanStatus, reader: jspb.BinaryReader): SpanStatus;
}

export namespace SpanStatus {
    export type AsObject = {
        code: number,
        message: string,
    }
}

export class RateLimitInfo extends jspb.Message { 
    getLimit(): number;
    setLimit(value: number): RateLimitInfo;
    getCurrent(): number;
    setCurrent(value: number): RateLimitInfo;
    getRemaining(): number;
    setRemaining(value: number): RateLimitInfo;

    hasResetTime(): boolean;
    clearResetTime(): void;
    getResetTime(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setResetTime(value?: google_protobuf_timestamp_pb.Timestamp): RateLimitInfo;
    getKey(): string;
    setKey(value: string): RateLimitInfo;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): RateLimitInfo.AsObject;
    static toObject(includeInstance: boolean, msg: RateLimitInfo): RateLimitInfo.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: RateLimitInfo, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): RateLimitInfo;
    static deserializeBinaryFromReader(message: RateLimitInfo, reader: jspb.BinaryReader): RateLimitInfo;
}

export namespace RateLimitInfo {
    export type AsObject = {
        limit: number,
        current: number,
        remaining: number,
        resetTime?: google_protobuf_timestamp_pb.Timestamp.AsObject,
        key: string,
    }
}

export class RateLimitRequest extends jspb.Message { 
    getKey(): string;
    setKey(value: string): RateLimitRequest;
    getLimit(): number;
    setLimit(value: number): RateLimitRequest;
    getWindowSeconds(): number;
    setWindowSeconds(value: number): RateLimitRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): RateLimitRequest.AsObject;
    static toObject(includeInstance: boolean, msg: RateLimitRequest): RateLimitRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: RateLimitRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): RateLimitRequest;
    static deserializeBinaryFromReader(message: RateLimitRequest, reader: jspb.BinaryReader): RateLimitRequest;
}

export namespace RateLimitRequest {
    export type AsObject = {
        key: string,
        limit: number,
        windowSeconds: number,
    }
}

export class RateLimitResponse extends jspb.Message { 
    getAllowed(): boolean;
    setAllowed(value: boolean): RateLimitResponse;

    hasInfo(): boolean;
    clearInfo(): void;
    getInfo(): RateLimitInfo | undefined;
    setInfo(value?: RateLimitInfo): RateLimitResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): RateLimitResponse.AsObject;
    static toObject(includeInstance: boolean, msg: RateLimitResponse): RateLimitResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: RateLimitResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): RateLimitResponse;
    static deserializeBinaryFromReader(message: RateLimitResponse, reader: jspb.BinaryReader): RateLimitResponse;
}

export namespace RateLimitResponse {
    export type AsObject = {
        allowed: boolean,
        info?: RateLimitInfo.AsObject,
    }
}

export class FeatureFlagRequest extends jspb.Message { 
    getFlagKey(): string;
    setFlagKey(value: string): FeatureFlagRequest;
    getUserId(): string;
    setUserId(value: string): FeatureFlagRequest;
    getUserTier(): SubscriptionTier;
    setUserTier(value: SubscriptionTier): FeatureFlagRequest;
    getEnvironment(): string;
    setEnvironment(value: string): FeatureFlagRequest;

    getCustomAttributesMap(): jspb.Map<string, string>;
    clearCustomAttributesMap(): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): FeatureFlagRequest.AsObject;
    static toObject(includeInstance: boolean, msg: FeatureFlagRequest): FeatureFlagRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: FeatureFlagRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): FeatureFlagRequest;
    static deserializeBinaryFromReader(message: FeatureFlagRequest, reader: jspb.BinaryReader): FeatureFlagRequest;
}

export namespace FeatureFlagRequest {
    export type AsObject = {
        flagKey: string,
        userId: string,
        userTier: SubscriptionTier,
        environment: string,

        customAttributesMap: Array<[string, string]>,
    }
}

export class FeatureFlagResponse extends jspb.Message { 
    getEnabled(): boolean;
    setEnabled(value: boolean): FeatureFlagResponse;
    getVariation(): string;
    setVariation(value: string): FeatureFlagResponse;
    getReason(): string;
    setReason(value: string): FeatureFlagResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): FeatureFlagResponse.AsObject;
    static toObject(includeInstance: boolean, msg: FeatureFlagResponse): FeatureFlagResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: FeatureFlagResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): FeatureFlagResponse;
    static deserializeBinaryFromReader(message: FeatureFlagResponse, reader: jspb.BinaryReader): FeatureFlagResponse;
}

export namespace FeatureFlagResponse {
    export type AsObject = {
        enabled: boolean,
        variation: string,
        reason: string,
    }
}

export enum HealthStatus {
    HEALTH_STATUS_UNSPECIFIED = 0,
    HEALTH_STATUS_SERVING = 1,
    HEALTH_STATUS_NOT_SERVING = 2,
    HEALTH_STATUS_UNKNOWN = 3,
}

export enum MetricType {
    METRIC_TYPE_UNSPECIFIED = 0,
    METRIC_TYPE_COUNTER = 1,
    METRIC_TYPE_GAUGE = 2,
    METRIC_TYPE_HISTOGRAM = 3,
    METRIC_TYPE_SUMMARY = 4,
}

export enum CircuitState {
    CIRCUIT_STATE_UNSPECIFIED = 0,
    CIRCUIT_STATE_CLOSED = 1,
    CIRCUIT_STATE_OPEN = 2,
    CIRCUIT_STATE_HALF_OPEN = 3,
}

export enum SubscriptionTier {
    SUBSCRIPTION_TIER_UNSPECIFIED = 0,
    SUBSCRIPTION_TIER_FREE = 1,
    SUBSCRIPTION_TIER_BASIC = 2,
    SUBSCRIPTION_TIER_PREMIUM = 3,
    SUBSCRIPTION_TIER_ENTERPRISE = 4,
}

export enum Environment {
    ENVIRONMENT_UNSPECIFIED = 0,
    ENVIRONMENT_DEVELOPMENT = 1,
    ENVIRONMENT_STAGING = 2,
    ENVIRONMENT_PRODUCTION = 3,
}
