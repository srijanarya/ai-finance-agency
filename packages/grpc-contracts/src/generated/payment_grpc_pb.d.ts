// package: treum.payment
// file: payment.proto

/* tslint:disable */
/* eslint-disable */

import * as grpc from "@grpc/grpc-js";
import * as payment_pb from "./payment_pb";
import * as google_protobuf_timestamp_pb from "google-protobuf/google/protobuf/timestamp_pb";
import * as google_protobuf_empty_pb from "google-protobuf/google/protobuf/empty_pb";
import * as google_protobuf_struct_pb from "google-protobuf/google/protobuf/struct_pb";

interface IPaymentServiceService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
    createPayment: IPaymentServiceService_ICreatePayment;
    getPayment: IPaymentServiceService_IGetPayment;
    listPayments: IPaymentServiceService_IListPayments;
    processPayment: IPaymentServiceService_IProcessPayment;
    refundPayment: IPaymentServiceService_IRefundPayment;
    createSubscription: IPaymentServiceService_ICreateSubscription;
    getSubscription: IPaymentServiceService_IGetSubscription;
    updateSubscription: IPaymentServiceService_IUpdateSubscription;
    cancelSubscription: IPaymentServiceService_ICancelSubscription;
    listSubscriptions: IPaymentServiceService_IListSubscriptions;
    validatePaymentMethod: IPaymentServiceService_IValidatePaymentMethod;
}

interface IPaymentServiceService_ICreatePayment extends grpc.MethodDefinition<payment_pb.CreatePaymentRequest, payment_pb.PaymentResponse> {
    path: "/treum.payment.PaymentService/CreatePayment";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<payment_pb.CreatePaymentRequest>;
    requestDeserialize: grpc.deserialize<payment_pb.CreatePaymentRequest>;
    responseSerialize: grpc.serialize<payment_pb.PaymentResponse>;
    responseDeserialize: grpc.deserialize<payment_pb.PaymentResponse>;
}
interface IPaymentServiceService_IGetPayment extends grpc.MethodDefinition<payment_pb.GetPaymentRequest, payment_pb.PaymentResponse> {
    path: "/treum.payment.PaymentService/GetPayment";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<payment_pb.GetPaymentRequest>;
    requestDeserialize: grpc.deserialize<payment_pb.GetPaymentRequest>;
    responseSerialize: grpc.serialize<payment_pb.PaymentResponse>;
    responseDeserialize: grpc.deserialize<payment_pb.PaymentResponse>;
}
interface IPaymentServiceService_IListPayments extends grpc.MethodDefinition<payment_pb.ListPaymentsRequest, payment_pb.ListPaymentsResponse> {
    path: "/treum.payment.PaymentService/ListPayments";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<payment_pb.ListPaymentsRequest>;
    requestDeserialize: grpc.deserialize<payment_pb.ListPaymentsRequest>;
    responseSerialize: grpc.serialize<payment_pb.ListPaymentsResponse>;
    responseDeserialize: grpc.deserialize<payment_pb.ListPaymentsResponse>;
}
interface IPaymentServiceService_IProcessPayment extends grpc.MethodDefinition<payment_pb.ProcessPaymentRequest, payment_pb.PaymentResponse> {
    path: "/treum.payment.PaymentService/ProcessPayment";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<payment_pb.ProcessPaymentRequest>;
    requestDeserialize: grpc.deserialize<payment_pb.ProcessPaymentRequest>;
    responseSerialize: grpc.serialize<payment_pb.PaymentResponse>;
    responseDeserialize: grpc.deserialize<payment_pb.PaymentResponse>;
}
interface IPaymentServiceService_IRefundPayment extends grpc.MethodDefinition<payment_pb.RefundPaymentRequest, payment_pb.PaymentResponse> {
    path: "/treum.payment.PaymentService/RefundPayment";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<payment_pb.RefundPaymentRequest>;
    requestDeserialize: grpc.deserialize<payment_pb.RefundPaymentRequest>;
    responseSerialize: grpc.serialize<payment_pb.PaymentResponse>;
    responseDeserialize: grpc.deserialize<payment_pb.PaymentResponse>;
}
interface IPaymentServiceService_ICreateSubscription extends grpc.MethodDefinition<payment_pb.CreateSubscriptionRequest, payment_pb.SubscriptionResponse> {
    path: "/treum.payment.PaymentService/CreateSubscription";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<payment_pb.CreateSubscriptionRequest>;
    requestDeserialize: grpc.deserialize<payment_pb.CreateSubscriptionRequest>;
    responseSerialize: grpc.serialize<payment_pb.SubscriptionResponse>;
    responseDeserialize: grpc.deserialize<payment_pb.SubscriptionResponse>;
}
interface IPaymentServiceService_IGetSubscription extends grpc.MethodDefinition<payment_pb.GetSubscriptionRequest, payment_pb.SubscriptionResponse> {
    path: "/treum.payment.PaymentService/GetSubscription";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<payment_pb.GetSubscriptionRequest>;
    requestDeserialize: grpc.deserialize<payment_pb.GetSubscriptionRequest>;
    responseSerialize: grpc.serialize<payment_pb.SubscriptionResponse>;
    responseDeserialize: grpc.deserialize<payment_pb.SubscriptionResponse>;
}
interface IPaymentServiceService_IUpdateSubscription extends grpc.MethodDefinition<payment_pb.UpdateSubscriptionRequest, payment_pb.SubscriptionResponse> {
    path: "/treum.payment.PaymentService/UpdateSubscription";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<payment_pb.UpdateSubscriptionRequest>;
    requestDeserialize: grpc.deserialize<payment_pb.UpdateSubscriptionRequest>;
    responseSerialize: grpc.serialize<payment_pb.SubscriptionResponse>;
    responseDeserialize: grpc.deserialize<payment_pb.SubscriptionResponse>;
}
interface IPaymentServiceService_ICancelSubscription extends grpc.MethodDefinition<payment_pb.CancelSubscriptionRequest, payment_pb.SubscriptionResponse> {
    path: "/treum.payment.PaymentService/CancelSubscription";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<payment_pb.CancelSubscriptionRequest>;
    requestDeserialize: grpc.deserialize<payment_pb.CancelSubscriptionRequest>;
    responseSerialize: grpc.serialize<payment_pb.SubscriptionResponse>;
    responseDeserialize: grpc.deserialize<payment_pb.SubscriptionResponse>;
}
interface IPaymentServiceService_IListSubscriptions extends grpc.MethodDefinition<payment_pb.ListSubscriptionsRequest, payment_pb.ListSubscriptionsResponse> {
    path: "/treum.payment.PaymentService/ListSubscriptions";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<payment_pb.ListSubscriptionsRequest>;
    requestDeserialize: grpc.deserialize<payment_pb.ListSubscriptionsRequest>;
    responseSerialize: grpc.serialize<payment_pb.ListSubscriptionsResponse>;
    responseDeserialize: grpc.deserialize<payment_pb.ListSubscriptionsResponse>;
}
interface IPaymentServiceService_IValidatePaymentMethod extends grpc.MethodDefinition<payment_pb.ValidatePaymentMethodRequest, payment_pb.ValidatePaymentMethodResponse> {
    path: "/treum.payment.PaymentService/ValidatePaymentMethod";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<payment_pb.ValidatePaymentMethodRequest>;
    requestDeserialize: grpc.deserialize<payment_pb.ValidatePaymentMethodRequest>;
    responseSerialize: grpc.serialize<payment_pb.ValidatePaymentMethodResponse>;
    responseDeserialize: grpc.deserialize<payment_pb.ValidatePaymentMethodResponse>;
}

export const PaymentServiceService: IPaymentServiceService;

export interface IPaymentServiceServer extends grpc.UntypedServiceImplementation {
    createPayment: grpc.handleUnaryCall<payment_pb.CreatePaymentRequest, payment_pb.PaymentResponse>;
    getPayment: grpc.handleUnaryCall<payment_pb.GetPaymentRequest, payment_pb.PaymentResponse>;
    listPayments: grpc.handleUnaryCall<payment_pb.ListPaymentsRequest, payment_pb.ListPaymentsResponse>;
    processPayment: grpc.handleUnaryCall<payment_pb.ProcessPaymentRequest, payment_pb.PaymentResponse>;
    refundPayment: grpc.handleUnaryCall<payment_pb.RefundPaymentRequest, payment_pb.PaymentResponse>;
    createSubscription: grpc.handleUnaryCall<payment_pb.CreateSubscriptionRequest, payment_pb.SubscriptionResponse>;
    getSubscription: grpc.handleUnaryCall<payment_pb.GetSubscriptionRequest, payment_pb.SubscriptionResponse>;
    updateSubscription: grpc.handleUnaryCall<payment_pb.UpdateSubscriptionRequest, payment_pb.SubscriptionResponse>;
    cancelSubscription: grpc.handleUnaryCall<payment_pb.CancelSubscriptionRequest, payment_pb.SubscriptionResponse>;
    listSubscriptions: grpc.handleUnaryCall<payment_pb.ListSubscriptionsRequest, payment_pb.ListSubscriptionsResponse>;
    validatePaymentMethod: grpc.handleUnaryCall<payment_pb.ValidatePaymentMethodRequest, payment_pb.ValidatePaymentMethodResponse>;
}

export interface IPaymentServiceClient {
    createPayment(request: payment_pb.CreatePaymentRequest, callback: (error: grpc.ServiceError | null, response: payment_pb.PaymentResponse) => void): grpc.ClientUnaryCall;
    createPayment(request: payment_pb.CreatePaymentRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: payment_pb.PaymentResponse) => void): grpc.ClientUnaryCall;
    createPayment(request: payment_pb.CreatePaymentRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: payment_pb.PaymentResponse) => void): grpc.ClientUnaryCall;
    getPayment(request: payment_pb.GetPaymentRequest, callback: (error: grpc.ServiceError | null, response: payment_pb.PaymentResponse) => void): grpc.ClientUnaryCall;
    getPayment(request: payment_pb.GetPaymentRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: payment_pb.PaymentResponse) => void): grpc.ClientUnaryCall;
    getPayment(request: payment_pb.GetPaymentRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: payment_pb.PaymentResponse) => void): grpc.ClientUnaryCall;
    listPayments(request: payment_pb.ListPaymentsRequest, callback: (error: grpc.ServiceError | null, response: payment_pb.ListPaymentsResponse) => void): grpc.ClientUnaryCall;
    listPayments(request: payment_pb.ListPaymentsRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: payment_pb.ListPaymentsResponse) => void): grpc.ClientUnaryCall;
    listPayments(request: payment_pb.ListPaymentsRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: payment_pb.ListPaymentsResponse) => void): grpc.ClientUnaryCall;
    processPayment(request: payment_pb.ProcessPaymentRequest, callback: (error: grpc.ServiceError | null, response: payment_pb.PaymentResponse) => void): grpc.ClientUnaryCall;
    processPayment(request: payment_pb.ProcessPaymentRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: payment_pb.PaymentResponse) => void): grpc.ClientUnaryCall;
    processPayment(request: payment_pb.ProcessPaymentRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: payment_pb.PaymentResponse) => void): grpc.ClientUnaryCall;
    refundPayment(request: payment_pb.RefundPaymentRequest, callback: (error: grpc.ServiceError | null, response: payment_pb.PaymentResponse) => void): grpc.ClientUnaryCall;
    refundPayment(request: payment_pb.RefundPaymentRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: payment_pb.PaymentResponse) => void): grpc.ClientUnaryCall;
    refundPayment(request: payment_pb.RefundPaymentRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: payment_pb.PaymentResponse) => void): grpc.ClientUnaryCall;
    createSubscription(request: payment_pb.CreateSubscriptionRequest, callback: (error: grpc.ServiceError | null, response: payment_pb.SubscriptionResponse) => void): grpc.ClientUnaryCall;
    createSubscription(request: payment_pb.CreateSubscriptionRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: payment_pb.SubscriptionResponse) => void): grpc.ClientUnaryCall;
    createSubscription(request: payment_pb.CreateSubscriptionRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: payment_pb.SubscriptionResponse) => void): grpc.ClientUnaryCall;
    getSubscription(request: payment_pb.GetSubscriptionRequest, callback: (error: grpc.ServiceError | null, response: payment_pb.SubscriptionResponse) => void): grpc.ClientUnaryCall;
    getSubscription(request: payment_pb.GetSubscriptionRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: payment_pb.SubscriptionResponse) => void): grpc.ClientUnaryCall;
    getSubscription(request: payment_pb.GetSubscriptionRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: payment_pb.SubscriptionResponse) => void): grpc.ClientUnaryCall;
    updateSubscription(request: payment_pb.UpdateSubscriptionRequest, callback: (error: grpc.ServiceError | null, response: payment_pb.SubscriptionResponse) => void): grpc.ClientUnaryCall;
    updateSubscription(request: payment_pb.UpdateSubscriptionRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: payment_pb.SubscriptionResponse) => void): grpc.ClientUnaryCall;
    updateSubscription(request: payment_pb.UpdateSubscriptionRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: payment_pb.SubscriptionResponse) => void): grpc.ClientUnaryCall;
    cancelSubscription(request: payment_pb.CancelSubscriptionRequest, callback: (error: grpc.ServiceError | null, response: payment_pb.SubscriptionResponse) => void): grpc.ClientUnaryCall;
    cancelSubscription(request: payment_pb.CancelSubscriptionRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: payment_pb.SubscriptionResponse) => void): grpc.ClientUnaryCall;
    cancelSubscription(request: payment_pb.CancelSubscriptionRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: payment_pb.SubscriptionResponse) => void): grpc.ClientUnaryCall;
    listSubscriptions(request: payment_pb.ListSubscriptionsRequest, callback: (error: grpc.ServiceError | null, response: payment_pb.ListSubscriptionsResponse) => void): grpc.ClientUnaryCall;
    listSubscriptions(request: payment_pb.ListSubscriptionsRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: payment_pb.ListSubscriptionsResponse) => void): grpc.ClientUnaryCall;
    listSubscriptions(request: payment_pb.ListSubscriptionsRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: payment_pb.ListSubscriptionsResponse) => void): grpc.ClientUnaryCall;
    validatePaymentMethod(request: payment_pb.ValidatePaymentMethodRequest, callback: (error: grpc.ServiceError | null, response: payment_pb.ValidatePaymentMethodResponse) => void): grpc.ClientUnaryCall;
    validatePaymentMethod(request: payment_pb.ValidatePaymentMethodRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: payment_pb.ValidatePaymentMethodResponse) => void): grpc.ClientUnaryCall;
    validatePaymentMethod(request: payment_pb.ValidatePaymentMethodRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: payment_pb.ValidatePaymentMethodResponse) => void): grpc.ClientUnaryCall;
}

export class PaymentServiceClient extends grpc.Client implements IPaymentServiceClient {
    constructor(address: string, credentials: grpc.ChannelCredentials, options?: Partial<grpc.ClientOptions>);
    public createPayment(request: payment_pb.CreatePaymentRequest, callback: (error: grpc.ServiceError | null, response: payment_pb.PaymentResponse) => void): grpc.ClientUnaryCall;
    public createPayment(request: payment_pb.CreatePaymentRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: payment_pb.PaymentResponse) => void): grpc.ClientUnaryCall;
    public createPayment(request: payment_pb.CreatePaymentRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: payment_pb.PaymentResponse) => void): grpc.ClientUnaryCall;
    public getPayment(request: payment_pb.GetPaymentRequest, callback: (error: grpc.ServiceError | null, response: payment_pb.PaymentResponse) => void): grpc.ClientUnaryCall;
    public getPayment(request: payment_pb.GetPaymentRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: payment_pb.PaymentResponse) => void): grpc.ClientUnaryCall;
    public getPayment(request: payment_pb.GetPaymentRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: payment_pb.PaymentResponse) => void): grpc.ClientUnaryCall;
    public listPayments(request: payment_pb.ListPaymentsRequest, callback: (error: grpc.ServiceError | null, response: payment_pb.ListPaymentsResponse) => void): grpc.ClientUnaryCall;
    public listPayments(request: payment_pb.ListPaymentsRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: payment_pb.ListPaymentsResponse) => void): grpc.ClientUnaryCall;
    public listPayments(request: payment_pb.ListPaymentsRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: payment_pb.ListPaymentsResponse) => void): grpc.ClientUnaryCall;
    public processPayment(request: payment_pb.ProcessPaymentRequest, callback: (error: grpc.ServiceError | null, response: payment_pb.PaymentResponse) => void): grpc.ClientUnaryCall;
    public processPayment(request: payment_pb.ProcessPaymentRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: payment_pb.PaymentResponse) => void): grpc.ClientUnaryCall;
    public processPayment(request: payment_pb.ProcessPaymentRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: payment_pb.PaymentResponse) => void): grpc.ClientUnaryCall;
    public refundPayment(request: payment_pb.RefundPaymentRequest, callback: (error: grpc.ServiceError | null, response: payment_pb.PaymentResponse) => void): grpc.ClientUnaryCall;
    public refundPayment(request: payment_pb.RefundPaymentRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: payment_pb.PaymentResponse) => void): grpc.ClientUnaryCall;
    public refundPayment(request: payment_pb.RefundPaymentRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: payment_pb.PaymentResponse) => void): grpc.ClientUnaryCall;
    public createSubscription(request: payment_pb.CreateSubscriptionRequest, callback: (error: grpc.ServiceError | null, response: payment_pb.SubscriptionResponse) => void): grpc.ClientUnaryCall;
    public createSubscription(request: payment_pb.CreateSubscriptionRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: payment_pb.SubscriptionResponse) => void): grpc.ClientUnaryCall;
    public createSubscription(request: payment_pb.CreateSubscriptionRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: payment_pb.SubscriptionResponse) => void): grpc.ClientUnaryCall;
    public getSubscription(request: payment_pb.GetSubscriptionRequest, callback: (error: grpc.ServiceError | null, response: payment_pb.SubscriptionResponse) => void): grpc.ClientUnaryCall;
    public getSubscription(request: payment_pb.GetSubscriptionRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: payment_pb.SubscriptionResponse) => void): grpc.ClientUnaryCall;
    public getSubscription(request: payment_pb.GetSubscriptionRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: payment_pb.SubscriptionResponse) => void): grpc.ClientUnaryCall;
    public updateSubscription(request: payment_pb.UpdateSubscriptionRequest, callback: (error: grpc.ServiceError | null, response: payment_pb.SubscriptionResponse) => void): grpc.ClientUnaryCall;
    public updateSubscription(request: payment_pb.UpdateSubscriptionRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: payment_pb.SubscriptionResponse) => void): grpc.ClientUnaryCall;
    public updateSubscription(request: payment_pb.UpdateSubscriptionRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: payment_pb.SubscriptionResponse) => void): grpc.ClientUnaryCall;
    public cancelSubscription(request: payment_pb.CancelSubscriptionRequest, callback: (error: grpc.ServiceError | null, response: payment_pb.SubscriptionResponse) => void): grpc.ClientUnaryCall;
    public cancelSubscription(request: payment_pb.CancelSubscriptionRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: payment_pb.SubscriptionResponse) => void): grpc.ClientUnaryCall;
    public cancelSubscription(request: payment_pb.CancelSubscriptionRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: payment_pb.SubscriptionResponse) => void): grpc.ClientUnaryCall;
    public listSubscriptions(request: payment_pb.ListSubscriptionsRequest, callback: (error: grpc.ServiceError | null, response: payment_pb.ListSubscriptionsResponse) => void): grpc.ClientUnaryCall;
    public listSubscriptions(request: payment_pb.ListSubscriptionsRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: payment_pb.ListSubscriptionsResponse) => void): grpc.ClientUnaryCall;
    public listSubscriptions(request: payment_pb.ListSubscriptionsRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: payment_pb.ListSubscriptionsResponse) => void): grpc.ClientUnaryCall;
    public validatePaymentMethod(request: payment_pb.ValidatePaymentMethodRequest, callback: (error: grpc.ServiceError | null, response: payment_pb.ValidatePaymentMethodResponse) => void): grpc.ClientUnaryCall;
    public validatePaymentMethod(request: payment_pb.ValidatePaymentMethodRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: payment_pb.ValidatePaymentMethodResponse) => void): grpc.ClientUnaryCall;
    public validatePaymentMethod(request: payment_pb.ValidatePaymentMethodRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: payment_pb.ValidatePaymentMethodResponse) => void): grpc.ClientUnaryCall;
}
