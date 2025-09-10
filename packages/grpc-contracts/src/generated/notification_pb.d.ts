// package: notification
// file: notification.proto

/* tslint:disable */
/* eslint-disable */

import * as jspb from "google-protobuf";
import * as common_pb from "./common_pb";

export class NotificationMessage extends jspb.Message { 
    getId(): string;
    setId(value: string): NotificationMessage;
    getUserId(): string;
    setUserId(value: string): NotificationMessage;
    getType(): NotificationType;
    setType(value: NotificationType): NotificationMessage;
    getCategory(): NotificationCategory;
    setCategory(value: NotificationCategory): NotificationMessage;
    getPriority(): NotificationPriority;
    setPriority(value: NotificationPriority): NotificationMessage;
    getStatus(): NotificationStatus;
    setStatus(value: NotificationStatus): NotificationMessage;
    getTitle(): string;
    setTitle(value: string): NotificationMessage;
    getMessage(): string;
    setMessage(value: string): NotificationMessage;

    getPayloadMap(): jspb.Map<string, string>;
    clearPayloadMap(): void;
    getTemplateId(): string;
    setTemplateId(value: string): NotificationMessage;
    getScheduledAt(): number;
    setScheduledAt(value: number): NotificationMessage;
    getSentAt(): number;
    setSentAt(value: number): NotificationMessage;
    getDeliveredAt(): number;
    setDeliveredAt(value: number): NotificationMessage;
    getFailedAt(): number;
    setFailedAt(value: number): NotificationMessage;
    getErrorMessage(): string;
    setErrorMessage(value: string): NotificationMessage;
    getRetryCount(): number;
    setRetryCount(value: number): NotificationMessage;
    getMaxRetries(): number;
    setMaxRetries(value: number): NotificationMessage;
    getExternalId(): string;
    setExternalId(value: string): NotificationMessage;

    getMetadataMap(): jspb.Map<string, string>;
    clearMetadataMap(): void;
    getReadAt(): number;
    setReadAt(value: number): NotificationMessage;
    getClickedAt(): number;
    setClickedAt(value: number): NotificationMessage;
    getCreatedAt(): number;
    setCreatedAt(value: number): NotificationMessage;
    getUpdatedAt(): number;
    setUpdatedAt(value: number): NotificationMessage;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): NotificationMessage.AsObject;
    static toObject(includeInstance: boolean, msg: NotificationMessage): NotificationMessage.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: NotificationMessage, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): NotificationMessage;
    static deserializeBinaryFromReader(message: NotificationMessage, reader: jspb.BinaryReader): NotificationMessage;
}

export namespace NotificationMessage {
    export type AsObject = {
        id: string,
        userId: string,
        type: NotificationType,
        category: NotificationCategory,
        priority: NotificationPriority,
        status: NotificationStatus,
        title: string,
        message: string,

        payloadMap: Array<[string, string]>,
        templateId: string,
        scheduledAt: number,
        sentAt: number,
        deliveredAt: number,
        failedAt: number,
        errorMessage: string,
        retryCount: number,
        maxRetries: number,
        externalId: string,

        metadataMap: Array<[string, string]>,
        readAt: number,
        clickedAt: number,
        createdAt: number,
        updatedAt: number,
    }
}

export class NotificationPreference extends jspb.Message { 
    getId(): string;
    setId(value: string): NotificationPreference;
    getUserId(): string;
    setUserId(value: string): NotificationPreference;
    getCategory(): NotificationCategory;
    setCategory(value: NotificationCategory): NotificationPreference;
    getType(): NotificationType;
    setType(value: NotificationType): NotificationPreference;
    getEnabled(): boolean;
    setEnabled(value: boolean): NotificationPreference;
    getQuietHoursStart(): string;
    setQuietHoursStart(value: string): NotificationPreference;
    getQuietHoursEnd(): string;
    setQuietHoursEnd(value: string): NotificationPreference;
    getTimezone(): string;
    setTimezone(value: string): NotificationPreference;

    getSettingsMap(): jspb.Map<string, string>;
    clearSettingsMap(): void;
    getCreatedAt(): number;
    setCreatedAt(value: number): NotificationPreference;
    getUpdatedAt(): number;
    setUpdatedAt(value: number): NotificationPreference;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): NotificationPreference.AsObject;
    static toObject(includeInstance: boolean, msg: NotificationPreference): NotificationPreference.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: NotificationPreference, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): NotificationPreference;
    static deserializeBinaryFromReader(message: NotificationPreference, reader: jspb.BinaryReader): NotificationPreference;
}

export namespace NotificationPreference {
    export type AsObject = {
        id: string,
        userId: string,
        category: NotificationCategory,
        type: NotificationType,
        enabled: boolean,
        quietHoursStart: string,
        quietHoursEnd: string,
        timezone: string,

        settingsMap: Array<[string, string]>,
        createdAt: number,
        updatedAt: number,
    }
}

export class PushSubscription extends jspb.Message { 
    getId(): string;
    setId(value: string): PushSubscription;
    getUserId(): string;
    setUserId(value: string): PushSubscription;
    getEndpoint(): string;
    setEndpoint(value: string): PushSubscription;
    getP256dhKey(): string;
    setP256dhKey(value: string): PushSubscription;
    getAuthKey(): string;
    setAuthKey(value: string): PushSubscription;
    getUserAgent(): string;
    setUserAgent(value: string): PushSubscription;
    getDeviceType(): string;
    setDeviceType(value: string): PushSubscription;
    getBrowserName(): string;
    setBrowserName(value: string): PushSubscription;
    getBrowserVersion(): string;
    setBrowserVersion(value: string): PushSubscription;
    getOsName(): string;
    setOsName(value: string): PushSubscription;
    getOsVersion(): string;
    setOsVersion(value: string): PushSubscription;
    getActive(): boolean;
    setActive(value: boolean): PushSubscription;
    getLastUsedAt(): number;
    setLastUsedAt(value: number): PushSubscription;
    getFailureCount(): number;
    setFailureCount(value: number): PushSubscription;

    getMetadataMap(): jspb.Map<string, string>;
    clearMetadataMap(): void;
    getCreatedAt(): number;
    setCreatedAt(value: number): PushSubscription;
    getUpdatedAt(): number;
    setUpdatedAt(value: number): PushSubscription;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): PushSubscription.AsObject;
    static toObject(includeInstance: boolean, msg: PushSubscription): PushSubscription.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: PushSubscription, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): PushSubscription;
    static deserializeBinaryFromReader(message: PushSubscription, reader: jspb.BinaryReader): PushSubscription;
}

export namespace PushSubscription {
    export type AsObject = {
        id: string,
        userId: string,
        endpoint: string,
        p256dhKey: string,
        authKey: string,
        userAgent: string,
        deviceType: string,
        browserName: string,
        browserVersion: string,
        osName: string,
        osVersion: string,
        active: boolean,
        lastUsedAt: number,
        failureCount: number,

        metadataMap: Array<[string, string]>,
        createdAt: number,
        updatedAt: number,
    }
}

export class SendNotificationRequest extends jspb.Message { 
    getUserId(): string;
    setUserId(value: string): SendNotificationRequest;
    getType(): NotificationType;
    setType(value: NotificationType): SendNotificationRequest;
    getCategory(): NotificationCategory;
    setCategory(value: NotificationCategory): SendNotificationRequest;
    getPriority(): NotificationPriority;
    setPriority(value: NotificationPriority): SendNotificationRequest;
    getTitle(): string;
    setTitle(value: string): SendNotificationRequest;
    getMessage(): string;
    setMessage(value: string): SendNotificationRequest;

    getPayloadMap(): jspb.Map<string, string>;
    clearPayloadMap(): void;
    getTemplateId(): string;
    setTemplateId(value: string): SendNotificationRequest;
    getScheduledAt(): number;
    setScheduledAt(value: number): SendNotificationRequest;
    getMaxRetries(): number;
    setMaxRetries(value: number): SendNotificationRequest;

    getMetadataMap(): jspb.Map<string, string>;
    clearMetadataMap(): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): SendNotificationRequest.AsObject;
    static toObject(includeInstance: boolean, msg: SendNotificationRequest): SendNotificationRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: SendNotificationRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): SendNotificationRequest;
    static deserializeBinaryFromReader(message: SendNotificationRequest, reader: jspb.BinaryReader): SendNotificationRequest;
}

export namespace SendNotificationRequest {
    export type AsObject = {
        userId: string,
        type: NotificationType,
        category: NotificationCategory,
        priority: NotificationPriority,
        title: string,
        message: string,

        payloadMap: Array<[string, string]>,
        templateId: string,
        scheduledAt: number,
        maxRetries: number,

        metadataMap: Array<[string, string]>,
    }
}

export class NotificationResponse extends jspb.Message { 
    getSuccess(): boolean;
    setSuccess(value: boolean): NotificationResponse;
    getMessage(): string;
    setMessage(value: string): NotificationResponse;

    hasNotification(): boolean;
    clearNotification(): void;
    getNotification(): NotificationMessage | undefined;
    setNotification(value?: NotificationMessage): NotificationResponse;
    clearErrorsList(): void;
    getErrorsList(): Array<string>;
    setErrorsList(value: Array<string>): NotificationResponse;
    addErrors(value: string, index?: number): string;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): NotificationResponse.AsObject;
    static toObject(includeInstance: boolean, msg: NotificationResponse): NotificationResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: NotificationResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): NotificationResponse;
    static deserializeBinaryFromReader(message: NotificationResponse, reader: jspb.BinaryReader): NotificationResponse;
}

export namespace NotificationResponse {
    export type AsObject = {
        success: boolean,
        message: string,
        notification?: NotificationMessage.AsObject,
        errorsList: Array<string>,
    }
}

export class SendBulkNotificationsRequest extends jspb.Message { 
    clearUserIdsList(): void;
    getUserIdsList(): Array<string>;
    setUserIdsList(value: Array<string>): SendBulkNotificationsRequest;
    addUserIds(value: string, index?: number): string;
    getType(): NotificationType;
    setType(value: NotificationType): SendBulkNotificationsRequest;
    getCategory(): NotificationCategory;
    setCategory(value: NotificationCategory): SendBulkNotificationsRequest;
    getPriority(): NotificationPriority;
    setPriority(value: NotificationPriority): SendBulkNotificationsRequest;
    getTitle(): string;
    setTitle(value: string): SendBulkNotificationsRequest;
    getMessage(): string;
    setMessage(value: string): SendBulkNotificationsRequest;

    getPayloadMap(): jspb.Map<string, string>;
    clearPayloadMap(): void;
    getTemplateId(): string;
    setTemplateId(value: string): SendBulkNotificationsRequest;
    getScheduledAt(): number;
    setScheduledAt(value: number): SendBulkNotificationsRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): SendBulkNotificationsRequest.AsObject;
    static toObject(includeInstance: boolean, msg: SendBulkNotificationsRequest): SendBulkNotificationsRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: SendBulkNotificationsRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): SendBulkNotificationsRequest;
    static deserializeBinaryFromReader(message: SendBulkNotificationsRequest, reader: jspb.BinaryReader): SendBulkNotificationsRequest;
}

export namespace SendBulkNotificationsRequest {
    export type AsObject = {
        userIdsList: Array<string>,
        type: NotificationType,
        category: NotificationCategory,
        priority: NotificationPriority,
        title: string,
        message: string,

        payloadMap: Array<[string, string]>,
        templateId: string,
        scheduledAt: number,
    }
}

export class BulkNotificationResponse extends jspb.Message { 
    getSuccess(): boolean;
    setSuccess(value: boolean): BulkNotificationResponse;
    getMessage(): string;
    setMessage(value: string): BulkNotificationResponse;
    clearNotificationsList(): void;
    getNotificationsList(): Array<NotificationMessage>;
    setNotificationsList(value: Array<NotificationMessage>): BulkNotificationResponse;
    addNotifications(value?: NotificationMessage, index?: number): NotificationMessage;
    getSuccessCount(): number;
    setSuccessCount(value: number): BulkNotificationResponse;
    getFailureCount(): number;
    setFailureCount(value: number): BulkNotificationResponse;
    clearErrorsList(): void;
    getErrorsList(): Array<string>;
    setErrorsList(value: Array<string>): BulkNotificationResponse;
    addErrors(value: string, index?: number): string;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): BulkNotificationResponse.AsObject;
    static toObject(includeInstance: boolean, msg: BulkNotificationResponse): BulkNotificationResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: BulkNotificationResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): BulkNotificationResponse;
    static deserializeBinaryFromReader(message: BulkNotificationResponse, reader: jspb.BinaryReader): BulkNotificationResponse;
}

export namespace BulkNotificationResponse {
    export type AsObject = {
        success: boolean,
        message: string,
        notificationsList: Array<NotificationMessage.AsObject>,
        successCount: number,
        failureCount: number,
        errorsList: Array<string>,
    }
}

export class SendTemplateNotificationRequest extends jspb.Message { 

    hasUserId(): boolean;
    clearUserId(): void;
    getUserId(): string;
    setUserId(value: string): SendTemplateNotificationRequest;

    hasUserIds(): boolean;
    clearUserIds(): void;
    getUserIds(): UserIdList | undefined;
    setUserIds(value?: UserIdList): SendTemplateNotificationRequest;
    getTemplateId(): string;
    setTemplateId(value: string): SendTemplateNotificationRequest;

    getVariablesMap(): jspb.Map<string, string>;
    clearVariablesMap(): void;
    getScheduledAt(): number;
    setScheduledAt(value: number): SendTemplateNotificationRequest;

    getMetadataMap(): jspb.Map<string, string>;
    clearMetadataMap(): void;

    getUserTargetCase(): SendTemplateNotificationRequest.UserTargetCase;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): SendTemplateNotificationRequest.AsObject;
    static toObject(includeInstance: boolean, msg: SendTemplateNotificationRequest): SendTemplateNotificationRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: SendTemplateNotificationRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): SendTemplateNotificationRequest;
    static deserializeBinaryFromReader(message: SendTemplateNotificationRequest, reader: jspb.BinaryReader): SendTemplateNotificationRequest;
}

export namespace SendTemplateNotificationRequest {
    export type AsObject = {
        userId: string,
        userIds?: UserIdList.AsObject,
        templateId: string,

        variablesMap: Array<[string, string]>,
        scheduledAt: number,

        metadataMap: Array<[string, string]>,
    }

    export enum UserTargetCase {
        USER_TARGET_NOT_SET = 0,
        USER_ID = 1,
        USER_IDS = 2,
    }

}

export class UserIdList extends jspb.Message { 
    clearIdsList(): void;
    getIdsList(): Array<string>;
    setIdsList(value: Array<string>): UserIdList;
    addIds(value: string, index?: number): string;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): UserIdList.AsObject;
    static toObject(includeInstance: boolean, msg: UserIdList): UserIdList.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: UserIdList, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): UserIdList;
    static deserializeBinaryFromReader(message: UserIdList, reader: jspb.BinaryReader): UserIdList;
}

export namespace UserIdList {
    export type AsObject = {
        idsList: Array<string>,
    }
}

export class TemplateNotificationResponse extends jspb.Message { 
    getSuccess(): boolean;
    setSuccess(value: boolean): TemplateNotificationResponse;
    getMessage(): string;
    setMessage(value: string): TemplateNotificationResponse;
    clearNotificationsList(): void;
    getNotificationsList(): Array<NotificationMessage>;
    setNotificationsList(value: Array<NotificationMessage>): TemplateNotificationResponse;
    addNotifications(value?: NotificationMessage, index?: number): NotificationMessage;
    clearErrorsList(): void;
    getErrorsList(): Array<string>;
    setErrorsList(value: Array<string>): TemplateNotificationResponse;
    addErrors(value: string, index?: number): string;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): TemplateNotificationResponse.AsObject;
    static toObject(includeInstance: boolean, msg: TemplateNotificationResponse): TemplateNotificationResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: TemplateNotificationResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): TemplateNotificationResponse;
    static deserializeBinaryFromReader(message: TemplateNotificationResponse, reader: jspb.BinaryReader): TemplateNotificationResponse;
}

export namespace TemplateNotificationResponse {
    export type AsObject = {
        success: boolean,
        message: string,
        notificationsList: Array<NotificationMessage.AsObject>,
        errorsList: Array<string>,
    }
}

export class GetUserNotificationsRequest extends jspb.Message { 
    getUserId(): string;
    setUserId(value: string): GetUserNotificationsRequest;
    getType(): NotificationType;
    setType(value: NotificationType): GetUserNotificationsRequest;
    getStatus(): NotificationStatus;
    setStatus(value: NotificationStatus): GetUserNotificationsRequest;
    getLimit(): number;
    setLimit(value: number): GetUserNotificationsRequest;
    getOffset(): number;
    setOffset(value: number): GetUserNotificationsRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): GetUserNotificationsRequest.AsObject;
    static toObject(includeInstance: boolean, msg: GetUserNotificationsRequest): GetUserNotificationsRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: GetUserNotificationsRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): GetUserNotificationsRequest;
    static deserializeBinaryFromReader(message: GetUserNotificationsRequest, reader: jspb.BinaryReader): GetUserNotificationsRequest;
}

export namespace GetUserNotificationsRequest {
    export type AsObject = {
        userId: string,
        type: NotificationType,
        status: NotificationStatus,
        limit: number,
        offset: number,
    }
}

export class GetUserNotificationsResponse extends jspb.Message { 
    getSuccess(): boolean;
    setSuccess(value: boolean): GetUserNotificationsResponse;
    getMessage(): string;
    setMessage(value: string): GetUserNotificationsResponse;
    clearNotificationsList(): void;
    getNotificationsList(): Array<NotificationMessage>;
    setNotificationsList(value: Array<NotificationMessage>): GetUserNotificationsResponse;
    addNotifications(value?: NotificationMessage, index?: number): NotificationMessage;
    getTotal(): number;
    setTotal(value: number): GetUserNotificationsResponse;
    getHasMore(): boolean;
    setHasMore(value: boolean): GetUserNotificationsResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): GetUserNotificationsResponse.AsObject;
    static toObject(includeInstance: boolean, msg: GetUserNotificationsResponse): GetUserNotificationsResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: GetUserNotificationsResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): GetUserNotificationsResponse;
    static deserializeBinaryFromReader(message: GetUserNotificationsResponse, reader: jspb.BinaryReader): GetUserNotificationsResponse;
}

export namespace GetUserNotificationsResponse {
    export type AsObject = {
        success: boolean,
        message: string,
        notificationsList: Array<NotificationMessage.AsObject>,
        total: number,
        hasMore: boolean,
    }
}

export class MarkAsReadRequest extends jspb.Message { 
    getNotificationId(): string;
    setNotificationId(value: string): MarkAsReadRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): MarkAsReadRequest.AsObject;
    static toObject(includeInstance: boolean, msg: MarkAsReadRequest): MarkAsReadRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: MarkAsReadRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): MarkAsReadRequest;
    static deserializeBinaryFromReader(message: MarkAsReadRequest, reader: jspb.BinaryReader): MarkAsReadRequest;
}

export namespace MarkAsReadRequest {
    export type AsObject = {
        notificationId: string,
    }
}

export class MarkAsClickedRequest extends jspb.Message { 
    getNotificationId(): string;
    setNotificationId(value: string): MarkAsClickedRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): MarkAsClickedRequest.AsObject;
    static toObject(includeInstance: boolean, msg: MarkAsClickedRequest): MarkAsClickedRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: MarkAsClickedRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): MarkAsClickedRequest;
    static deserializeBinaryFromReader(message: MarkAsClickedRequest, reader: jspb.BinaryReader): MarkAsClickedRequest;
}

export namespace MarkAsClickedRequest {
    export type AsObject = {
        notificationId: string,
    }
}

export class UpdatePreferencesRequest extends jspb.Message { 
    getUserId(): string;
    setUserId(value: string): UpdatePreferencesRequest;
    clearPreferencesList(): void;
    getPreferencesList(): Array<NotificationPreference>;
    setPreferencesList(value: Array<NotificationPreference>): UpdatePreferencesRequest;
    addPreferences(value?: NotificationPreference, index?: number): NotificationPreference;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): UpdatePreferencesRequest.AsObject;
    static toObject(includeInstance: boolean, msg: UpdatePreferencesRequest): UpdatePreferencesRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: UpdatePreferencesRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): UpdatePreferencesRequest;
    static deserializeBinaryFromReader(message: UpdatePreferencesRequest, reader: jspb.BinaryReader): UpdatePreferencesRequest;
}

export namespace UpdatePreferencesRequest {
    export type AsObject = {
        userId: string,
        preferencesList: Array<NotificationPreference.AsObject>,
    }
}

export class PreferencesResponse extends jspb.Message { 
    getSuccess(): boolean;
    setSuccess(value: boolean): PreferencesResponse;
    getMessage(): string;
    setMessage(value: string): PreferencesResponse;
    clearPreferencesList(): void;
    getPreferencesList(): Array<NotificationPreference>;
    setPreferencesList(value: Array<NotificationPreference>): PreferencesResponse;
    addPreferences(value?: NotificationPreference, index?: number): NotificationPreference;
    clearErrorsList(): void;
    getErrorsList(): Array<string>;
    setErrorsList(value: Array<string>): PreferencesResponse;
    addErrors(value: string, index?: number): string;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): PreferencesResponse.AsObject;
    static toObject(includeInstance: boolean, msg: PreferencesResponse): PreferencesResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: PreferencesResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): PreferencesResponse;
    static deserializeBinaryFromReader(message: PreferencesResponse, reader: jspb.BinaryReader): PreferencesResponse;
}

export namespace PreferencesResponse {
    export type AsObject = {
        success: boolean,
        message: string,
        preferencesList: Array<NotificationPreference.AsObject>,
        errorsList: Array<string>,
    }
}

export class GetPreferencesRequest extends jspb.Message { 
    getUserId(): string;
    setUserId(value: string): GetPreferencesRequest;
    getCategory(): NotificationCategory;
    setCategory(value: NotificationCategory): GetPreferencesRequest;
    getType(): NotificationType;
    setType(value: NotificationType): GetPreferencesRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): GetPreferencesRequest.AsObject;
    static toObject(includeInstance: boolean, msg: GetPreferencesRequest): GetPreferencesRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: GetPreferencesRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): GetPreferencesRequest;
    static deserializeBinaryFromReader(message: GetPreferencesRequest, reader: jspb.BinaryReader): GetPreferencesRequest;
}

export namespace GetPreferencesRequest {
    export type AsObject = {
        userId: string,
        category: NotificationCategory,
        type: NotificationType,
    }
}

export class GetPreferencesResponse extends jspb.Message { 
    getSuccess(): boolean;
    setSuccess(value: boolean): GetPreferencesResponse;
    getMessage(): string;
    setMessage(value: string): GetPreferencesResponse;
    clearPreferencesList(): void;
    getPreferencesList(): Array<NotificationPreference>;
    setPreferencesList(value: Array<NotificationPreference>): GetPreferencesResponse;
    addPreferences(value?: NotificationPreference, index?: number): NotificationPreference;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): GetPreferencesResponse.AsObject;
    static toObject(includeInstance: boolean, msg: GetPreferencesResponse): GetPreferencesResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: GetPreferencesResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): GetPreferencesResponse;
    static deserializeBinaryFromReader(message: GetPreferencesResponse, reader: jspb.BinaryReader): GetPreferencesResponse;
}

export namespace GetPreferencesResponse {
    export type AsObject = {
        success: boolean,
        message: string,
        preferencesList: Array<NotificationPreference.AsObject>,
    }
}

export class SubscribePushRequest extends jspb.Message { 
    getUserId(): string;
    setUserId(value: string): SubscribePushRequest;
    getEndpoint(): string;
    setEndpoint(value: string): SubscribePushRequest;
    getP256dhKey(): string;
    setP256dhKey(value: string): SubscribePushRequest;
    getAuthKey(): string;
    setAuthKey(value: string): SubscribePushRequest;
    getUserAgent(): string;
    setUserAgent(value: string): SubscribePushRequest;
    getDeviceType(): string;
    setDeviceType(value: string): SubscribePushRequest;
    getBrowserName(): string;
    setBrowserName(value: string): SubscribePushRequest;
    getBrowserVersion(): string;
    setBrowserVersion(value: string): SubscribePushRequest;
    getOsName(): string;
    setOsName(value: string): SubscribePushRequest;
    getOsVersion(): string;
    setOsVersion(value: string): SubscribePushRequest;

    getMetadataMap(): jspb.Map<string, string>;
    clearMetadataMap(): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): SubscribePushRequest.AsObject;
    static toObject(includeInstance: boolean, msg: SubscribePushRequest): SubscribePushRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: SubscribePushRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): SubscribePushRequest;
    static deserializeBinaryFromReader(message: SubscribePushRequest, reader: jspb.BinaryReader): SubscribePushRequest;
}

export namespace SubscribePushRequest {
    export type AsObject = {
        userId: string,
        endpoint: string,
        p256dhKey: string,
        authKey: string,
        userAgent: string,
        deviceType: string,
        browserName: string,
        browserVersion: string,
        osName: string,
        osVersion: string,

        metadataMap: Array<[string, string]>,
    }
}

export class PushSubscriptionResponse extends jspb.Message { 
    getSuccess(): boolean;
    setSuccess(value: boolean): PushSubscriptionResponse;
    getMessage(): string;
    setMessage(value: string): PushSubscriptionResponse;

    hasSubscription(): boolean;
    clearSubscription(): void;
    getSubscription(): PushSubscription | undefined;
    setSubscription(value?: PushSubscription): PushSubscriptionResponse;
    clearErrorsList(): void;
    getErrorsList(): Array<string>;
    setErrorsList(value: Array<string>): PushSubscriptionResponse;
    addErrors(value: string, index?: number): string;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): PushSubscriptionResponse.AsObject;
    static toObject(includeInstance: boolean, msg: PushSubscriptionResponse): PushSubscriptionResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: PushSubscriptionResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): PushSubscriptionResponse;
    static deserializeBinaryFromReader(message: PushSubscriptionResponse, reader: jspb.BinaryReader): PushSubscriptionResponse;
}

export namespace PushSubscriptionResponse {
    export type AsObject = {
        success: boolean,
        message: string,
        subscription?: PushSubscription.AsObject,
        errorsList: Array<string>,
    }
}

export class UnsubscribePushRequest extends jspb.Message { 
    getUserId(): string;
    setUserId(value: string): UnsubscribePushRequest;
    getEndpoint(): string;
    setEndpoint(value: string): UnsubscribePushRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): UnsubscribePushRequest.AsObject;
    static toObject(includeInstance: boolean, msg: UnsubscribePushRequest): UnsubscribePushRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: UnsubscribePushRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): UnsubscribePushRequest;
    static deserializeBinaryFromReader(message: UnsubscribePushRequest, reader: jspb.BinaryReader): UnsubscribePushRequest;
}

export namespace UnsubscribePushRequest {
    export type AsObject = {
        userId: string,
        endpoint: string,
    }
}

export class NotificationEvent extends jspb.Message { 
    getEventType(): string;
    setEventType(value: string): NotificationEvent;

    hasNotification(): boolean;
    clearNotification(): void;
    getNotification(): NotificationMessage | undefined;
    setNotification(value?: NotificationMessage): NotificationEvent;
    getTimestamp(): number;
    setTimestamp(value: number): NotificationEvent;

    getMetadataMap(): jspb.Map<string, string>;
    clearMetadataMap(): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): NotificationEvent.AsObject;
    static toObject(includeInstance: boolean, msg: NotificationEvent): NotificationEvent.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: NotificationEvent, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): NotificationEvent;
    static deserializeBinaryFromReader(message: NotificationEvent, reader: jspb.BinaryReader): NotificationEvent;
}

export namespace NotificationEvent {
    export type AsObject = {
        eventType: string,
        notification?: NotificationMessage.AsObject,
        timestamp: number,

        metadataMap: Array<[string, string]>,
    }
}

export class PreferencesUpdatedEvent extends jspb.Message { 
    getUserId(): string;
    setUserId(value: string): PreferencesUpdatedEvent;
    clearPreferencesList(): void;
    getPreferencesList(): Array<NotificationPreference>;
    setPreferencesList(value: Array<NotificationPreference>): PreferencesUpdatedEvent;
    addPreferences(value?: NotificationPreference, index?: number): NotificationPreference;
    getTimestamp(): number;
    setTimestamp(value: number): PreferencesUpdatedEvent;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): PreferencesUpdatedEvent.AsObject;
    static toObject(includeInstance: boolean, msg: PreferencesUpdatedEvent): PreferencesUpdatedEvent.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: PreferencesUpdatedEvent, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): PreferencesUpdatedEvent;
    static deserializeBinaryFromReader(message: PreferencesUpdatedEvent, reader: jspb.BinaryReader): PreferencesUpdatedEvent;
}

export namespace PreferencesUpdatedEvent {
    export type AsObject = {
        userId: string,
        preferencesList: Array<NotificationPreference.AsObject>,
        timestamp: number,
    }
}

export enum NotificationType {
    NOTIFICATION_TYPE_UNSPECIFIED = 0,
    EMAIL = 1,
    SMS = 2,
    PUSH = 3,
    IN_APP = 4,
    WEBHOOK = 5,
}

export enum NotificationCategory {
    NOTIFICATION_CATEGORY_UNSPECIFIED = 0,
    SYSTEM = 1,
    TRADING = 2,
    ACCOUNT = 3,
    SECURITY = 4,
    EDUCATIONAL = 5,
    PROMOTIONAL = 6,
    SIGNAL = 7,
    PAYMENT = 8,
}

export enum NotificationPriority {
    NOTIFICATION_PRIORITY_UNSPECIFIED = 0,
    LOW = 1,
    NORMAL = 2,
    HIGH = 3,
    URGENT = 4,
}

export enum NotificationStatus {
    NOTIFICATION_STATUS_UNSPECIFIED = 0,
    PENDING = 1,
    SENT = 2,
    DELIVERED = 3,
    FAILED = 4,
    CANCELLED = 5,
}
