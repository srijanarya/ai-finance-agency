// package: treum.common
// file: common.proto

/* tslint:disable */
/* eslint-disable */

import * as grpc from "@grpc/grpc-js";
import * as common_pb from "./common_pb";
import * as google_protobuf_timestamp_pb from "google-protobuf/google/protobuf/timestamp_pb";
import * as google_protobuf_empty_pb from "google-protobuf/google/protobuf/empty_pb";

interface IHealthServiceService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
    check: IHealthServiceService_ICheck;
    watch: IHealthServiceService_IWatch;
}

interface IHealthServiceService_ICheck extends grpc.MethodDefinition<common_pb.HealthCheckRequest, common_pb.HealthCheckResponse> {
    path: "/treum.common.HealthService/Check";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<common_pb.HealthCheckRequest>;
    requestDeserialize: grpc.deserialize<common_pb.HealthCheckRequest>;
    responseSerialize: grpc.serialize<common_pb.HealthCheckResponse>;
    responseDeserialize: grpc.deserialize<common_pb.HealthCheckResponse>;
}
interface IHealthServiceService_IWatch extends grpc.MethodDefinition<common_pb.HealthCheckRequest, common_pb.HealthCheckResponse> {
    path: "/treum.common.HealthService/Watch";
    requestStream: false;
    responseStream: true;
    requestSerialize: grpc.serialize<common_pb.HealthCheckRequest>;
    requestDeserialize: grpc.deserialize<common_pb.HealthCheckRequest>;
    responseSerialize: grpc.serialize<common_pb.HealthCheckResponse>;
    responseDeserialize: grpc.deserialize<common_pb.HealthCheckResponse>;
}

export const HealthServiceService: IHealthServiceService;

export interface IHealthServiceServer extends grpc.UntypedServiceImplementation {
    check: grpc.handleUnaryCall<common_pb.HealthCheckRequest, common_pb.HealthCheckResponse>;
    watch: grpc.handleServerStreamingCall<common_pb.HealthCheckRequest, common_pb.HealthCheckResponse>;
}

export interface IHealthServiceClient {
    check(request: common_pb.HealthCheckRequest, callback: (error: grpc.ServiceError | null, response: common_pb.HealthCheckResponse) => void): grpc.ClientUnaryCall;
    check(request: common_pb.HealthCheckRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: common_pb.HealthCheckResponse) => void): grpc.ClientUnaryCall;
    check(request: common_pb.HealthCheckRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: common_pb.HealthCheckResponse) => void): grpc.ClientUnaryCall;
    watch(request: common_pb.HealthCheckRequest, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<common_pb.HealthCheckResponse>;
    watch(request: common_pb.HealthCheckRequest, metadata?: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<common_pb.HealthCheckResponse>;
}

export class HealthServiceClient extends grpc.Client implements IHealthServiceClient {
    constructor(address: string, credentials: grpc.ChannelCredentials, options?: Partial<grpc.ClientOptions>);
    public check(request: common_pb.HealthCheckRequest, callback: (error: grpc.ServiceError | null, response: common_pb.HealthCheckResponse) => void): grpc.ClientUnaryCall;
    public check(request: common_pb.HealthCheckRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: common_pb.HealthCheckResponse) => void): grpc.ClientUnaryCall;
    public check(request: common_pb.HealthCheckRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: common_pb.HealthCheckResponse) => void): grpc.ClientUnaryCall;
    public watch(request: common_pb.HealthCheckRequest, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<common_pb.HealthCheckResponse>;
    public watch(request: common_pb.HealthCheckRequest, metadata?: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<common_pb.HealthCheckResponse>;
}

interface IMetricsServiceService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
    recordMetric: IMetricsServiceService_IRecordMetric;
    getMetrics: IMetricsServiceService_IGetMetrics;
}

interface IMetricsServiceService_IRecordMetric extends grpc.MethodDefinition<common_pb.RecordMetricRequest, google_protobuf_empty_pb.Empty> {
    path: "/treum.common.MetricsService/RecordMetric";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<common_pb.RecordMetricRequest>;
    requestDeserialize: grpc.deserialize<common_pb.RecordMetricRequest>;
    responseSerialize: grpc.serialize<google_protobuf_empty_pb.Empty>;
    responseDeserialize: grpc.deserialize<google_protobuf_empty_pb.Empty>;
}
interface IMetricsServiceService_IGetMetrics extends grpc.MethodDefinition<common_pb.GetMetricsRequest, common_pb.GetMetricsResponse> {
    path: "/treum.common.MetricsService/GetMetrics";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<common_pb.GetMetricsRequest>;
    requestDeserialize: grpc.deserialize<common_pb.GetMetricsRequest>;
    responseSerialize: grpc.serialize<common_pb.GetMetricsResponse>;
    responseDeserialize: grpc.deserialize<common_pb.GetMetricsResponse>;
}

export const MetricsServiceService: IMetricsServiceService;

export interface IMetricsServiceServer extends grpc.UntypedServiceImplementation {
    recordMetric: grpc.handleUnaryCall<common_pb.RecordMetricRequest, google_protobuf_empty_pb.Empty>;
    getMetrics: grpc.handleUnaryCall<common_pb.GetMetricsRequest, common_pb.GetMetricsResponse>;
}

export interface IMetricsServiceClient {
    recordMetric(request: common_pb.RecordMetricRequest, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    recordMetric(request: common_pb.RecordMetricRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    recordMetric(request: common_pb.RecordMetricRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    getMetrics(request: common_pb.GetMetricsRequest, callback: (error: grpc.ServiceError | null, response: common_pb.GetMetricsResponse) => void): grpc.ClientUnaryCall;
    getMetrics(request: common_pb.GetMetricsRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: common_pb.GetMetricsResponse) => void): grpc.ClientUnaryCall;
    getMetrics(request: common_pb.GetMetricsRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: common_pb.GetMetricsResponse) => void): grpc.ClientUnaryCall;
}

export class MetricsServiceClient extends grpc.Client implements IMetricsServiceClient {
    constructor(address: string, credentials: grpc.ChannelCredentials, options?: Partial<grpc.ClientOptions>);
    public recordMetric(request: common_pb.RecordMetricRequest, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public recordMetric(request: common_pb.RecordMetricRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public recordMetric(request: common_pb.RecordMetricRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public getMetrics(request: common_pb.GetMetricsRequest, callback: (error: grpc.ServiceError | null, response: common_pb.GetMetricsResponse) => void): grpc.ClientUnaryCall;
    public getMetrics(request: common_pb.GetMetricsRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: common_pb.GetMetricsResponse) => void): grpc.ClientUnaryCall;
    public getMetrics(request: common_pb.GetMetricsRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: common_pb.GetMetricsResponse) => void): grpc.ClientUnaryCall;
}
