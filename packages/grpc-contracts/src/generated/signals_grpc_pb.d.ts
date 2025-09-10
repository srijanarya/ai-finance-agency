// package: treum.signals
// file: signals.proto

/* tslint:disable */
/* eslint-disable */

import * as grpc from "@grpc/grpc-js";
import * as signals_pb from "./signals_pb";
import * as google_protobuf_timestamp_pb from "google-protobuf/google/protobuf/timestamp_pb";
import * as google_protobuf_empty_pb from "google-protobuf/google/protobuf/empty_pb";

interface ISignalsServiceService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
    createSignal: ISignalsServiceService_ICreateSignal;
    getSignal: ISignalsServiceService_IGetSignal;
    listSignals: ISignalsServiceService_IListSignals;
    updateSignal: ISignalsServiceService_IUpdateSignal;
    expireSignal: ISignalsServiceService_IExpireSignal;
    getSignalPerformance: ISignalsServiceService_IGetSignalPerformance;
    listActiveSignals: ISignalsServiceService_IListActiveSignals;
    followSignal: ISignalsServiceService_IFollowSignal;
    unfollowSignal: ISignalsServiceService_IUnfollowSignal;
    getUserSignalHistory: ISignalsServiceService_IGetUserSignalHistory;
}

interface ISignalsServiceService_ICreateSignal extends grpc.MethodDefinition<signals_pb.CreateSignalRequest, signals_pb.SignalResponse> {
    path: "/treum.signals.SignalsService/CreateSignal";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<signals_pb.CreateSignalRequest>;
    requestDeserialize: grpc.deserialize<signals_pb.CreateSignalRequest>;
    responseSerialize: grpc.serialize<signals_pb.SignalResponse>;
    responseDeserialize: grpc.deserialize<signals_pb.SignalResponse>;
}
interface ISignalsServiceService_IGetSignal extends grpc.MethodDefinition<signals_pb.GetSignalRequest, signals_pb.SignalResponse> {
    path: "/treum.signals.SignalsService/GetSignal";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<signals_pb.GetSignalRequest>;
    requestDeserialize: grpc.deserialize<signals_pb.GetSignalRequest>;
    responseSerialize: grpc.serialize<signals_pb.SignalResponse>;
    responseDeserialize: grpc.deserialize<signals_pb.SignalResponse>;
}
interface ISignalsServiceService_IListSignals extends grpc.MethodDefinition<signals_pb.ListSignalsRequest, signals_pb.ListSignalsResponse> {
    path: "/treum.signals.SignalsService/ListSignals";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<signals_pb.ListSignalsRequest>;
    requestDeserialize: grpc.deserialize<signals_pb.ListSignalsRequest>;
    responseSerialize: grpc.serialize<signals_pb.ListSignalsResponse>;
    responseDeserialize: grpc.deserialize<signals_pb.ListSignalsResponse>;
}
interface ISignalsServiceService_IUpdateSignal extends grpc.MethodDefinition<signals_pb.UpdateSignalRequest, signals_pb.SignalResponse> {
    path: "/treum.signals.SignalsService/UpdateSignal";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<signals_pb.UpdateSignalRequest>;
    requestDeserialize: grpc.deserialize<signals_pb.UpdateSignalRequest>;
    responseSerialize: grpc.serialize<signals_pb.SignalResponse>;
    responseDeserialize: grpc.deserialize<signals_pb.SignalResponse>;
}
interface ISignalsServiceService_IExpireSignal extends grpc.MethodDefinition<signals_pb.ExpireSignalRequest, signals_pb.SignalResponse> {
    path: "/treum.signals.SignalsService/ExpireSignal";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<signals_pb.ExpireSignalRequest>;
    requestDeserialize: grpc.deserialize<signals_pb.ExpireSignalRequest>;
    responseSerialize: grpc.serialize<signals_pb.SignalResponse>;
    responseDeserialize: grpc.deserialize<signals_pb.SignalResponse>;
}
interface ISignalsServiceService_IGetSignalPerformance extends grpc.MethodDefinition<signals_pb.GetSignalPerformanceRequest, signals_pb.SignalPerformanceResponse> {
    path: "/treum.signals.SignalsService/GetSignalPerformance";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<signals_pb.GetSignalPerformanceRequest>;
    requestDeserialize: grpc.deserialize<signals_pb.GetSignalPerformanceRequest>;
    responseSerialize: grpc.serialize<signals_pb.SignalPerformanceResponse>;
    responseDeserialize: grpc.deserialize<signals_pb.SignalPerformanceResponse>;
}
interface ISignalsServiceService_IListActiveSignals extends grpc.MethodDefinition<signals_pb.ListActiveSignalsRequest, signals_pb.ListSignalsResponse> {
    path: "/treum.signals.SignalsService/ListActiveSignals";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<signals_pb.ListActiveSignalsRequest>;
    requestDeserialize: grpc.deserialize<signals_pb.ListActiveSignalsRequest>;
    responseSerialize: grpc.serialize<signals_pb.ListSignalsResponse>;
    responseDeserialize: grpc.deserialize<signals_pb.ListSignalsResponse>;
}
interface ISignalsServiceService_IFollowSignal extends grpc.MethodDefinition<signals_pb.FollowSignalRequest, google_protobuf_empty_pb.Empty> {
    path: "/treum.signals.SignalsService/FollowSignal";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<signals_pb.FollowSignalRequest>;
    requestDeserialize: grpc.deserialize<signals_pb.FollowSignalRequest>;
    responseSerialize: grpc.serialize<google_protobuf_empty_pb.Empty>;
    responseDeserialize: grpc.deserialize<google_protobuf_empty_pb.Empty>;
}
interface ISignalsServiceService_IUnfollowSignal extends grpc.MethodDefinition<signals_pb.UnfollowSignalRequest, google_protobuf_empty_pb.Empty> {
    path: "/treum.signals.SignalsService/UnfollowSignal";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<signals_pb.UnfollowSignalRequest>;
    requestDeserialize: grpc.deserialize<signals_pb.UnfollowSignalRequest>;
    responseSerialize: grpc.serialize<google_protobuf_empty_pb.Empty>;
    responseDeserialize: grpc.deserialize<google_protobuf_empty_pb.Empty>;
}
interface ISignalsServiceService_IGetUserSignalHistory extends grpc.MethodDefinition<signals_pb.GetUserSignalHistoryRequest, signals_pb.UserSignalHistoryResponse> {
    path: "/treum.signals.SignalsService/GetUserSignalHistory";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<signals_pb.GetUserSignalHistoryRequest>;
    requestDeserialize: grpc.deserialize<signals_pb.GetUserSignalHistoryRequest>;
    responseSerialize: grpc.serialize<signals_pb.UserSignalHistoryResponse>;
    responseDeserialize: grpc.deserialize<signals_pb.UserSignalHistoryResponse>;
}

export const SignalsServiceService: ISignalsServiceService;

export interface ISignalsServiceServer extends grpc.UntypedServiceImplementation {
    createSignal: grpc.handleUnaryCall<signals_pb.CreateSignalRequest, signals_pb.SignalResponse>;
    getSignal: grpc.handleUnaryCall<signals_pb.GetSignalRequest, signals_pb.SignalResponse>;
    listSignals: grpc.handleUnaryCall<signals_pb.ListSignalsRequest, signals_pb.ListSignalsResponse>;
    updateSignal: grpc.handleUnaryCall<signals_pb.UpdateSignalRequest, signals_pb.SignalResponse>;
    expireSignal: grpc.handleUnaryCall<signals_pb.ExpireSignalRequest, signals_pb.SignalResponse>;
    getSignalPerformance: grpc.handleUnaryCall<signals_pb.GetSignalPerformanceRequest, signals_pb.SignalPerformanceResponse>;
    listActiveSignals: grpc.handleUnaryCall<signals_pb.ListActiveSignalsRequest, signals_pb.ListSignalsResponse>;
    followSignal: grpc.handleUnaryCall<signals_pb.FollowSignalRequest, google_protobuf_empty_pb.Empty>;
    unfollowSignal: grpc.handleUnaryCall<signals_pb.UnfollowSignalRequest, google_protobuf_empty_pb.Empty>;
    getUserSignalHistory: grpc.handleUnaryCall<signals_pb.GetUserSignalHistoryRequest, signals_pb.UserSignalHistoryResponse>;
}

export interface ISignalsServiceClient {
    createSignal(request: signals_pb.CreateSignalRequest, callback: (error: grpc.ServiceError | null, response: signals_pb.SignalResponse) => void): grpc.ClientUnaryCall;
    createSignal(request: signals_pb.CreateSignalRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: signals_pb.SignalResponse) => void): grpc.ClientUnaryCall;
    createSignal(request: signals_pb.CreateSignalRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: signals_pb.SignalResponse) => void): grpc.ClientUnaryCall;
    getSignal(request: signals_pb.GetSignalRequest, callback: (error: grpc.ServiceError | null, response: signals_pb.SignalResponse) => void): grpc.ClientUnaryCall;
    getSignal(request: signals_pb.GetSignalRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: signals_pb.SignalResponse) => void): grpc.ClientUnaryCall;
    getSignal(request: signals_pb.GetSignalRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: signals_pb.SignalResponse) => void): grpc.ClientUnaryCall;
    listSignals(request: signals_pb.ListSignalsRequest, callback: (error: grpc.ServiceError | null, response: signals_pb.ListSignalsResponse) => void): grpc.ClientUnaryCall;
    listSignals(request: signals_pb.ListSignalsRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: signals_pb.ListSignalsResponse) => void): grpc.ClientUnaryCall;
    listSignals(request: signals_pb.ListSignalsRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: signals_pb.ListSignalsResponse) => void): grpc.ClientUnaryCall;
    updateSignal(request: signals_pb.UpdateSignalRequest, callback: (error: grpc.ServiceError | null, response: signals_pb.SignalResponse) => void): grpc.ClientUnaryCall;
    updateSignal(request: signals_pb.UpdateSignalRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: signals_pb.SignalResponse) => void): grpc.ClientUnaryCall;
    updateSignal(request: signals_pb.UpdateSignalRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: signals_pb.SignalResponse) => void): grpc.ClientUnaryCall;
    expireSignal(request: signals_pb.ExpireSignalRequest, callback: (error: grpc.ServiceError | null, response: signals_pb.SignalResponse) => void): grpc.ClientUnaryCall;
    expireSignal(request: signals_pb.ExpireSignalRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: signals_pb.SignalResponse) => void): grpc.ClientUnaryCall;
    expireSignal(request: signals_pb.ExpireSignalRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: signals_pb.SignalResponse) => void): grpc.ClientUnaryCall;
    getSignalPerformance(request: signals_pb.GetSignalPerformanceRequest, callback: (error: grpc.ServiceError | null, response: signals_pb.SignalPerformanceResponse) => void): grpc.ClientUnaryCall;
    getSignalPerformance(request: signals_pb.GetSignalPerformanceRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: signals_pb.SignalPerformanceResponse) => void): grpc.ClientUnaryCall;
    getSignalPerformance(request: signals_pb.GetSignalPerformanceRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: signals_pb.SignalPerformanceResponse) => void): grpc.ClientUnaryCall;
    listActiveSignals(request: signals_pb.ListActiveSignalsRequest, callback: (error: grpc.ServiceError | null, response: signals_pb.ListSignalsResponse) => void): grpc.ClientUnaryCall;
    listActiveSignals(request: signals_pb.ListActiveSignalsRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: signals_pb.ListSignalsResponse) => void): grpc.ClientUnaryCall;
    listActiveSignals(request: signals_pb.ListActiveSignalsRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: signals_pb.ListSignalsResponse) => void): grpc.ClientUnaryCall;
    followSignal(request: signals_pb.FollowSignalRequest, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    followSignal(request: signals_pb.FollowSignalRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    followSignal(request: signals_pb.FollowSignalRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    unfollowSignal(request: signals_pb.UnfollowSignalRequest, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    unfollowSignal(request: signals_pb.UnfollowSignalRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    unfollowSignal(request: signals_pb.UnfollowSignalRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    getUserSignalHistory(request: signals_pb.GetUserSignalHistoryRequest, callback: (error: grpc.ServiceError | null, response: signals_pb.UserSignalHistoryResponse) => void): grpc.ClientUnaryCall;
    getUserSignalHistory(request: signals_pb.GetUserSignalHistoryRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: signals_pb.UserSignalHistoryResponse) => void): grpc.ClientUnaryCall;
    getUserSignalHistory(request: signals_pb.GetUserSignalHistoryRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: signals_pb.UserSignalHistoryResponse) => void): grpc.ClientUnaryCall;
}

export class SignalsServiceClient extends grpc.Client implements ISignalsServiceClient {
    constructor(address: string, credentials: grpc.ChannelCredentials, options?: Partial<grpc.ClientOptions>);
    public createSignal(request: signals_pb.CreateSignalRequest, callback: (error: grpc.ServiceError | null, response: signals_pb.SignalResponse) => void): grpc.ClientUnaryCall;
    public createSignal(request: signals_pb.CreateSignalRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: signals_pb.SignalResponse) => void): grpc.ClientUnaryCall;
    public createSignal(request: signals_pb.CreateSignalRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: signals_pb.SignalResponse) => void): grpc.ClientUnaryCall;
    public getSignal(request: signals_pb.GetSignalRequest, callback: (error: grpc.ServiceError | null, response: signals_pb.SignalResponse) => void): grpc.ClientUnaryCall;
    public getSignal(request: signals_pb.GetSignalRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: signals_pb.SignalResponse) => void): grpc.ClientUnaryCall;
    public getSignal(request: signals_pb.GetSignalRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: signals_pb.SignalResponse) => void): grpc.ClientUnaryCall;
    public listSignals(request: signals_pb.ListSignalsRequest, callback: (error: grpc.ServiceError | null, response: signals_pb.ListSignalsResponse) => void): grpc.ClientUnaryCall;
    public listSignals(request: signals_pb.ListSignalsRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: signals_pb.ListSignalsResponse) => void): grpc.ClientUnaryCall;
    public listSignals(request: signals_pb.ListSignalsRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: signals_pb.ListSignalsResponse) => void): grpc.ClientUnaryCall;
    public updateSignal(request: signals_pb.UpdateSignalRequest, callback: (error: grpc.ServiceError | null, response: signals_pb.SignalResponse) => void): grpc.ClientUnaryCall;
    public updateSignal(request: signals_pb.UpdateSignalRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: signals_pb.SignalResponse) => void): grpc.ClientUnaryCall;
    public updateSignal(request: signals_pb.UpdateSignalRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: signals_pb.SignalResponse) => void): grpc.ClientUnaryCall;
    public expireSignal(request: signals_pb.ExpireSignalRequest, callback: (error: grpc.ServiceError | null, response: signals_pb.SignalResponse) => void): grpc.ClientUnaryCall;
    public expireSignal(request: signals_pb.ExpireSignalRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: signals_pb.SignalResponse) => void): grpc.ClientUnaryCall;
    public expireSignal(request: signals_pb.ExpireSignalRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: signals_pb.SignalResponse) => void): grpc.ClientUnaryCall;
    public getSignalPerformance(request: signals_pb.GetSignalPerformanceRequest, callback: (error: grpc.ServiceError | null, response: signals_pb.SignalPerformanceResponse) => void): grpc.ClientUnaryCall;
    public getSignalPerformance(request: signals_pb.GetSignalPerformanceRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: signals_pb.SignalPerformanceResponse) => void): grpc.ClientUnaryCall;
    public getSignalPerformance(request: signals_pb.GetSignalPerformanceRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: signals_pb.SignalPerformanceResponse) => void): grpc.ClientUnaryCall;
    public listActiveSignals(request: signals_pb.ListActiveSignalsRequest, callback: (error: grpc.ServiceError | null, response: signals_pb.ListSignalsResponse) => void): grpc.ClientUnaryCall;
    public listActiveSignals(request: signals_pb.ListActiveSignalsRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: signals_pb.ListSignalsResponse) => void): grpc.ClientUnaryCall;
    public listActiveSignals(request: signals_pb.ListActiveSignalsRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: signals_pb.ListSignalsResponse) => void): grpc.ClientUnaryCall;
    public followSignal(request: signals_pb.FollowSignalRequest, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public followSignal(request: signals_pb.FollowSignalRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public followSignal(request: signals_pb.FollowSignalRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public unfollowSignal(request: signals_pb.UnfollowSignalRequest, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public unfollowSignal(request: signals_pb.UnfollowSignalRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public unfollowSignal(request: signals_pb.UnfollowSignalRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public getUserSignalHistory(request: signals_pb.GetUserSignalHistoryRequest, callback: (error: grpc.ServiceError | null, response: signals_pb.UserSignalHistoryResponse) => void): grpc.ClientUnaryCall;
    public getUserSignalHistory(request: signals_pb.GetUserSignalHistoryRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: signals_pb.UserSignalHistoryResponse) => void): grpc.ClientUnaryCall;
    public getUserSignalHistory(request: signals_pb.GetUserSignalHistoryRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: signals_pb.UserSignalHistoryResponse) => void): grpc.ClientUnaryCall;
}
