// package: treum.payment
// file: payment.proto

/* tslint:disable */
/* eslint-disable */

import * as jspb from "google-protobuf";
import * as google_protobuf_timestamp_pb from "google-protobuf/google/protobuf/timestamp_pb";
import * as google_protobuf_empty_pb from "google-protobuf/google/protobuf/empty_pb";
import * as google_protobuf_struct_pb from "google-protobuf/google/protobuf/struct_pb";

export class CreatePaymentRequest extends jspb.Message { 
    getUserId(): string;
    setUserId(value: string): CreatePaymentRequest;
    getAmount(): number;
    setAmount(value: number): CreatePaymentRequest;
    getCurrency(): string;
    setCurrency(value: string): CreatePaymentRequest;
    getMethod(): PaymentMethod;
    setMethod(value: PaymentMethod): CreatePaymentRequest;
    getDescription(): string;
    setDescription(value: string): CreatePaymentRequest;
    getSubscriptionId(): string;
    setSubscriptionId(value: string): CreatePaymentRequest;

    hasMetadata(): boolean;
    clearMetadata(): void;
    getMetadata(): google_protobuf_struct_pb.Struct | undefined;
    setMetadata(value?: google_protobuf_struct_pb.Struct): CreatePaymentRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): CreatePaymentRequest.AsObject;
    static toObject(includeInstance: boolean, msg: CreatePaymentRequest): CreatePaymentRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: CreatePaymentRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): CreatePaymentRequest;
    static deserializeBinaryFromReader(message: CreatePaymentRequest, reader: jspb.BinaryReader): CreatePaymentRequest;
}

export namespace CreatePaymentRequest {
    export type AsObject = {
        userId: string,
        amount: number,
        currency: string,
        method: PaymentMethod,
        description: string,
        subscriptionId: string,
        metadata?: google_protobuf_struct_pb.Struct.AsObject,
    }
}

export class ProcessPaymentRequest extends jspb.Message { 
    getPaymentId(): string;
    setPaymentId(value: string): ProcessPaymentRequest;
    getPaymentMethodToken(): string;
    setPaymentMethodToken(value: string): ProcessPaymentRequest;

    hasPaymentDetails(): boolean;
    clearPaymentDetails(): void;
    getPaymentDetails(): google_protobuf_struct_pb.Struct | undefined;
    setPaymentDetails(value?: google_protobuf_struct_pb.Struct): ProcessPaymentRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ProcessPaymentRequest.AsObject;
    static toObject(includeInstance: boolean, msg: ProcessPaymentRequest): ProcessPaymentRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ProcessPaymentRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ProcessPaymentRequest;
    static deserializeBinaryFromReader(message: ProcessPaymentRequest, reader: jspb.BinaryReader): ProcessPaymentRequest;
}

export namespace ProcessPaymentRequest {
    export type AsObject = {
        paymentId: string,
        paymentMethodToken: string,
        paymentDetails?: google_protobuf_struct_pb.Struct.AsObject,
    }
}

export class GetPaymentRequest extends jspb.Message { 
    getId(): string;
    setId(value: string): GetPaymentRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): GetPaymentRequest.AsObject;
    static toObject(includeInstance: boolean, msg: GetPaymentRequest): GetPaymentRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: GetPaymentRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): GetPaymentRequest;
    static deserializeBinaryFromReader(message: GetPaymentRequest, reader: jspb.BinaryReader): GetPaymentRequest;
}

export namespace GetPaymentRequest {
    export type AsObject = {
        id: string,
    }
}

export class RefundPaymentRequest extends jspb.Message { 
    getPaymentId(): string;
    setPaymentId(value: string): RefundPaymentRequest;
    getAmount(): number;
    setAmount(value: number): RefundPaymentRequest;
    getReason(): string;
    setReason(value: string): RefundPaymentRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): RefundPaymentRequest.AsObject;
    static toObject(includeInstance: boolean, msg: RefundPaymentRequest): RefundPaymentRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: RefundPaymentRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): RefundPaymentRequest;
    static deserializeBinaryFromReader(message: RefundPaymentRequest, reader: jspb.BinaryReader): RefundPaymentRequest;
}

export namespace RefundPaymentRequest {
    export type AsObject = {
        paymentId: string,
        amount: number,
        reason: string,
    }
}

export class ListPaymentsRequest extends jspb.Message { 
    getUserId(): string;
    setUserId(value: string): ListPaymentsRequest;
    getPage(): number;
    setPage(value: number): ListPaymentsRequest;
    getLimit(): number;
    setLimit(value: number): ListPaymentsRequest;
    getStatusFilter(): PaymentStatus;
    setStatusFilter(value: PaymentStatus): ListPaymentsRequest;
    getMethodFilter(): PaymentMethod;
    setMethodFilter(value: PaymentMethod): ListPaymentsRequest;

    hasFromDate(): boolean;
    clearFromDate(): void;
    getFromDate(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setFromDate(value?: google_protobuf_timestamp_pb.Timestamp): ListPaymentsRequest;

    hasToDate(): boolean;
    clearToDate(): void;
    getToDate(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setToDate(value?: google_protobuf_timestamp_pb.Timestamp): ListPaymentsRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ListPaymentsRequest.AsObject;
    static toObject(includeInstance: boolean, msg: ListPaymentsRequest): ListPaymentsRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ListPaymentsRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ListPaymentsRequest;
    static deserializeBinaryFromReader(message: ListPaymentsRequest, reader: jspb.BinaryReader): ListPaymentsRequest;
}

export namespace ListPaymentsRequest {
    export type AsObject = {
        userId: string,
        page: number,
        limit: number,
        statusFilter: PaymentStatus,
        methodFilter: PaymentMethod,
        fromDate?: google_protobuf_timestamp_pb.Timestamp.AsObject,
        toDate?: google_protobuf_timestamp_pb.Timestamp.AsObject,
    }
}

export class ListPaymentsResponse extends jspb.Message { 
    clearPaymentsList(): void;
    getPaymentsList(): Array<PaymentResponse>;
    setPaymentsList(value: Array<PaymentResponse>): ListPaymentsResponse;
    addPayments(value?: PaymentResponse, index?: number): PaymentResponse;
    getTotal(): number;
    setTotal(value: number): ListPaymentsResponse;
    getPage(): number;
    setPage(value: number): ListPaymentsResponse;
    getLimit(): number;
    setLimit(value: number): ListPaymentsResponse;
    getTotalPages(): number;
    setTotalPages(value: number): ListPaymentsResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ListPaymentsResponse.AsObject;
    static toObject(includeInstance: boolean, msg: ListPaymentsResponse): ListPaymentsResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ListPaymentsResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ListPaymentsResponse;
    static deserializeBinaryFromReader(message: ListPaymentsResponse, reader: jspb.BinaryReader): ListPaymentsResponse;
}

export namespace ListPaymentsResponse {
    export type AsObject = {
        paymentsList: Array<PaymentResponse.AsObject>,
        total: number,
        page: number,
        limit: number,
        totalPages: number,
    }
}

export class PaymentResponse extends jspb.Message { 
    getId(): string;
    setId(value: string): PaymentResponse;
    getUserId(): string;
    setUserId(value: string): PaymentResponse;
    getAmount(): number;
    setAmount(value: number): PaymentResponse;
    getCurrency(): string;
    setCurrency(value: string): PaymentResponse;
    getStatus(): PaymentStatus;
    setStatus(value: PaymentStatus): PaymentResponse;
    getMethod(): PaymentMethod;
    setMethod(value: PaymentMethod): PaymentResponse;
    getTransactionId(): string;
    setTransactionId(value: string): PaymentResponse;
    getSubscriptionId(): string;
    setSubscriptionId(value: string): PaymentResponse;
    getDescription(): string;
    setDescription(value: string): PaymentResponse;

    hasMetadata(): boolean;
    clearMetadata(): void;
    getMetadata(): google_protobuf_struct_pb.Struct | undefined;
    setMetadata(value?: google_protobuf_struct_pb.Struct): PaymentResponse;

    hasProcessedAt(): boolean;
    clearProcessedAt(): void;
    getProcessedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setProcessedAt(value?: google_protobuf_timestamp_pb.Timestamp): PaymentResponse;

    hasCreatedAt(): boolean;
    clearCreatedAt(): void;
    getCreatedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setCreatedAt(value?: google_protobuf_timestamp_pb.Timestamp): PaymentResponse;

    hasUpdatedAt(): boolean;
    clearUpdatedAt(): void;
    getUpdatedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setUpdatedAt(value?: google_protobuf_timestamp_pb.Timestamp): PaymentResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): PaymentResponse.AsObject;
    static toObject(includeInstance: boolean, msg: PaymentResponse): PaymentResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: PaymentResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): PaymentResponse;
    static deserializeBinaryFromReader(message: PaymentResponse, reader: jspb.BinaryReader): PaymentResponse;
}

export namespace PaymentResponse {
    export type AsObject = {
        id: string,
        userId: string,
        amount: number,
        currency: string,
        status: PaymentStatus,
        method: PaymentMethod,
        transactionId: string,
        subscriptionId: string,
        description: string,
        metadata?: google_protobuf_struct_pb.Struct.AsObject,
        processedAt?: google_protobuf_timestamp_pb.Timestamp.AsObject,
        createdAt?: google_protobuf_timestamp_pb.Timestamp.AsObject,
        updatedAt?: google_protobuf_timestamp_pb.Timestamp.AsObject,
    }
}

export class CreateSubscriptionRequest extends jspb.Message { 
    getUserId(): string;
    setUserId(value: string): CreateSubscriptionRequest;
    getTier(): SubscriptionTier;
    setTier(value: SubscriptionTier): CreateSubscriptionRequest;
    getPaymentMethodId(): string;
    setPaymentMethodId(value: string): CreateSubscriptionRequest;
    getAutoRenew(): boolean;
    setAutoRenew(value: boolean): CreateSubscriptionRequest;

    hasMetadata(): boolean;
    clearMetadata(): void;
    getMetadata(): google_protobuf_struct_pb.Struct | undefined;
    setMetadata(value?: google_protobuf_struct_pb.Struct): CreateSubscriptionRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): CreateSubscriptionRequest.AsObject;
    static toObject(includeInstance: boolean, msg: CreateSubscriptionRequest): CreateSubscriptionRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: CreateSubscriptionRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): CreateSubscriptionRequest;
    static deserializeBinaryFromReader(message: CreateSubscriptionRequest, reader: jspb.BinaryReader): CreateSubscriptionRequest;
}

export namespace CreateSubscriptionRequest {
    export type AsObject = {
        userId: string,
        tier: SubscriptionTier,
        paymentMethodId: string,
        autoRenew: boolean,
        metadata?: google_protobuf_struct_pb.Struct.AsObject,
    }
}

export class UpdateSubscriptionRequest extends jspb.Message { 
    getId(): string;
    setId(value: string): UpdateSubscriptionRequest;
    getTier(): SubscriptionTier;
    setTier(value: SubscriptionTier): UpdateSubscriptionRequest;
    getPaymentMethodId(): string;
    setPaymentMethodId(value: string): UpdateSubscriptionRequest;
    getCancelAtPeriodEnd(): boolean;
    setCancelAtPeriodEnd(value: boolean): UpdateSubscriptionRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): UpdateSubscriptionRequest.AsObject;
    static toObject(includeInstance: boolean, msg: UpdateSubscriptionRequest): UpdateSubscriptionRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: UpdateSubscriptionRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): UpdateSubscriptionRequest;
    static deserializeBinaryFromReader(message: UpdateSubscriptionRequest, reader: jspb.BinaryReader): UpdateSubscriptionRequest;
}

export namespace UpdateSubscriptionRequest {
    export type AsObject = {
        id: string,
        tier: SubscriptionTier,
        paymentMethodId: string,
        cancelAtPeriodEnd: boolean,
    }
}

export class CancelSubscriptionRequest extends jspb.Message { 
    getId(): string;
    setId(value: string): CancelSubscriptionRequest;
    getImmediate(): boolean;
    setImmediate(value: boolean): CancelSubscriptionRequest;
    getReason(): string;
    setReason(value: string): CancelSubscriptionRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): CancelSubscriptionRequest.AsObject;
    static toObject(includeInstance: boolean, msg: CancelSubscriptionRequest): CancelSubscriptionRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: CancelSubscriptionRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): CancelSubscriptionRequest;
    static deserializeBinaryFromReader(message: CancelSubscriptionRequest, reader: jspb.BinaryReader): CancelSubscriptionRequest;
}

export namespace CancelSubscriptionRequest {
    export type AsObject = {
        id: string,
        immediate: boolean,
        reason: string,
    }
}

export class GetSubscriptionRequest extends jspb.Message { 
    getId(): string;
    setId(value: string): GetSubscriptionRequest;
    getUserId(): string;
    setUserId(value: string): GetSubscriptionRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): GetSubscriptionRequest.AsObject;
    static toObject(includeInstance: boolean, msg: GetSubscriptionRequest): GetSubscriptionRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: GetSubscriptionRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): GetSubscriptionRequest;
    static deserializeBinaryFromReader(message: GetSubscriptionRequest, reader: jspb.BinaryReader): GetSubscriptionRequest;
}

export namespace GetSubscriptionRequest {
    export type AsObject = {
        id: string,
        userId: string,
    }
}

export class ListSubscriptionsRequest extends jspb.Message { 
    getUserId(): string;
    setUserId(value: string): ListSubscriptionsRequest;
    getPage(): number;
    setPage(value: number): ListSubscriptionsRequest;
    getLimit(): number;
    setLimit(value: number): ListSubscriptionsRequest;
    getStatusFilter(): SubscriptionStatus;
    setStatusFilter(value: SubscriptionStatus): ListSubscriptionsRequest;
    getTierFilter(): SubscriptionTier;
    setTierFilter(value: SubscriptionTier): ListSubscriptionsRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ListSubscriptionsRequest.AsObject;
    static toObject(includeInstance: boolean, msg: ListSubscriptionsRequest): ListSubscriptionsRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ListSubscriptionsRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ListSubscriptionsRequest;
    static deserializeBinaryFromReader(message: ListSubscriptionsRequest, reader: jspb.BinaryReader): ListSubscriptionsRequest;
}

export namespace ListSubscriptionsRequest {
    export type AsObject = {
        userId: string,
        page: number,
        limit: number,
        statusFilter: SubscriptionStatus,
        tierFilter: SubscriptionTier,
    }
}

export class ListSubscriptionsResponse extends jspb.Message { 
    clearSubscriptionsList(): void;
    getSubscriptionsList(): Array<SubscriptionResponse>;
    setSubscriptionsList(value: Array<SubscriptionResponse>): ListSubscriptionsResponse;
    addSubscriptions(value?: SubscriptionResponse, index?: number): SubscriptionResponse;
    getTotal(): number;
    setTotal(value: number): ListSubscriptionsResponse;
    getPage(): number;
    setPage(value: number): ListSubscriptionsResponse;
    getLimit(): number;
    setLimit(value: number): ListSubscriptionsResponse;
    getTotalPages(): number;
    setTotalPages(value: number): ListSubscriptionsResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ListSubscriptionsResponse.AsObject;
    static toObject(includeInstance: boolean, msg: ListSubscriptionsResponse): ListSubscriptionsResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ListSubscriptionsResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ListSubscriptionsResponse;
    static deserializeBinaryFromReader(message: ListSubscriptionsResponse, reader: jspb.BinaryReader): ListSubscriptionsResponse;
}

export namespace ListSubscriptionsResponse {
    export type AsObject = {
        subscriptionsList: Array<SubscriptionResponse.AsObject>,
        total: number,
        page: number,
        limit: number,
        totalPages: number,
    }
}

export class SubscriptionResponse extends jspb.Message { 
    getId(): string;
    setId(value: string): SubscriptionResponse;
    getUserId(): string;
    setUserId(value: string): SubscriptionResponse;
    getTier(): SubscriptionTier;
    setTier(value: SubscriptionTier): SubscriptionResponse;
    getStatus(): SubscriptionStatus;
    setStatus(value: SubscriptionStatus): SubscriptionResponse;

    hasCurrentPeriodStart(): boolean;
    clearCurrentPeriodStart(): void;
    getCurrentPeriodStart(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setCurrentPeriodStart(value?: google_protobuf_timestamp_pb.Timestamp): SubscriptionResponse;

    hasCurrentPeriodEnd(): boolean;
    clearCurrentPeriodEnd(): void;
    getCurrentPeriodEnd(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setCurrentPeriodEnd(value?: google_protobuf_timestamp_pb.Timestamp): SubscriptionResponse;
    getCancelAtPeriodEnd(): boolean;
    setCancelAtPeriodEnd(value: boolean): SubscriptionResponse;
    getPaymentMethodId(): string;
    setPaymentMethodId(value: string): SubscriptionResponse;
    getLastPaymentId(): string;
    setLastPaymentId(value: string): SubscriptionResponse;

    hasNextPaymentDate(): boolean;
    clearNextPaymentDate(): void;
    getNextPaymentDate(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setNextPaymentDate(value?: google_protobuf_timestamp_pb.Timestamp): SubscriptionResponse;

    hasCreatedAt(): boolean;
    clearCreatedAt(): void;
    getCreatedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setCreatedAt(value?: google_protobuf_timestamp_pb.Timestamp): SubscriptionResponse;

    hasUpdatedAt(): boolean;
    clearUpdatedAt(): void;
    getUpdatedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setUpdatedAt(value?: google_protobuf_timestamp_pb.Timestamp): SubscriptionResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): SubscriptionResponse.AsObject;
    static toObject(includeInstance: boolean, msg: SubscriptionResponse): SubscriptionResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: SubscriptionResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): SubscriptionResponse;
    static deserializeBinaryFromReader(message: SubscriptionResponse, reader: jspb.BinaryReader): SubscriptionResponse;
}

export namespace SubscriptionResponse {
    export type AsObject = {
        id: string,
        userId: string,
        tier: SubscriptionTier,
        status: SubscriptionStatus,
        currentPeriodStart?: google_protobuf_timestamp_pb.Timestamp.AsObject,
        currentPeriodEnd?: google_protobuf_timestamp_pb.Timestamp.AsObject,
        cancelAtPeriodEnd: boolean,
        paymentMethodId: string,
        lastPaymentId: string,
        nextPaymentDate?: google_protobuf_timestamp_pb.Timestamp.AsObject,
        createdAt?: google_protobuf_timestamp_pb.Timestamp.AsObject,
        updatedAt?: google_protobuf_timestamp_pb.Timestamp.AsObject,
    }
}

export class ValidatePaymentMethodRequest extends jspb.Message { 
    getUserId(): string;
    setUserId(value: string): ValidatePaymentMethodRequest;
    getMethod(): PaymentMethod;
    setMethod(value: PaymentMethod): ValidatePaymentMethodRequest;

    hasPaymentDetails(): boolean;
    clearPaymentDetails(): void;
    getPaymentDetails(): google_protobuf_struct_pb.Struct | undefined;
    setPaymentDetails(value?: google_protobuf_struct_pb.Struct): ValidatePaymentMethodRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ValidatePaymentMethodRequest.AsObject;
    static toObject(includeInstance: boolean, msg: ValidatePaymentMethodRequest): ValidatePaymentMethodRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ValidatePaymentMethodRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ValidatePaymentMethodRequest;
    static deserializeBinaryFromReader(message: ValidatePaymentMethodRequest, reader: jspb.BinaryReader): ValidatePaymentMethodRequest;
}

export namespace ValidatePaymentMethodRequest {
    export type AsObject = {
        userId: string,
        method: PaymentMethod,
        paymentDetails?: google_protobuf_struct_pb.Struct.AsObject,
    }
}

export class ValidatePaymentMethodResponse extends jspb.Message { 
    getValid(): boolean;
    setValid(value: boolean): ValidatePaymentMethodResponse;
    getErrorMessage(): string;
    setErrorMessage(value: string): ValidatePaymentMethodResponse;
    getPaymentMethodToken(): string;
    setPaymentMethodToken(value: string): ValidatePaymentMethodResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ValidatePaymentMethodResponse.AsObject;
    static toObject(includeInstance: boolean, msg: ValidatePaymentMethodResponse): ValidatePaymentMethodResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ValidatePaymentMethodResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ValidatePaymentMethodResponse;
    static deserializeBinaryFromReader(message: ValidatePaymentMethodResponse, reader: jspb.BinaryReader): ValidatePaymentMethodResponse;
}

export namespace ValidatePaymentMethodResponse {
    export type AsObject = {
        valid: boolean,
        errorMessage: string,
        paymentMethodToken: string,
    }
}

export enum PaymentStatus {
    PAYMENT_STATUS_UNSPECIFIED = 0,
    PAYMENT_STATUS_PENDING = 1,
    PAYMENT_STATUS_PROCESSING = 2,
    PAYMENT_STATUS_COMPLETED = 3,
    PAYMENT_STATUS_FAILED = 4,
    PAYMENT_STATUS_REFUNDED = 5,
    PAYMENT_STATUS_CANCELLED = 6,
}

export enum PaymentMethod {
    PAYMENT_METHOD_UNSPECIFIED = 0,
    PAYMENT_METHOD_CARD = 1,
    PAYMENT_METHOD_BANK_TRANSFER = 2,
    PAYMENT_METHOD_CRYPTO = 3,
    PAYMENT_METHOD_PAYPAL = 4,
    PAYMENT_METHOD_STRIPE = 5,
}

export enum SubscriptionTier {
    SUBSCRIPTION_TIER_UNSPECIFIED = 0,
    SUBSCRIPTION_TIER_FREE = 1,
    SUBSCRIPTION_TIER_BASIC = 2,
    SUBSCRIPTION_TIER_PREMIUM = 3,
    SUBSCRIPTION_TIER_ENTERPRISE = 4,
}

export enum SubscriptionStatus {
    SUBSCRIPTION_STATUS_UNSPECIFIED = 0,
    SUBSCRIPTION_STATUS_ACTIVE = 1,
    SUBSCRIPTION_STATUS_CANCELLED = 2,
    SUBSCRIPTION_STATUS_EXPIRED = 3,
    SUBSCRIPTION_STATUS_PAST_DUE = 4,
}
