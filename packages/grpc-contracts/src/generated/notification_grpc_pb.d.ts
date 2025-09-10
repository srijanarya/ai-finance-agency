// package: notification
// file: notification.proto

/* tslint:disable */
/* eslint-disable */

import * as grpc from "@grpc/grpc-js";
import * as notification_pb from "./notification_pb";
import * as common_pb from "./common_pb";

interface INotificationServiceService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
    sendNotification: INotificationServiceService_ISendNotification;
    sendBulkNotifications: INotificationServiceService_ISendBulkNotifications;
    sendTemplateNotification: INotificationServiceService_ISendTemplateNotification;
    getUserNotifications: INotificationServiceService_IGetUserNotifications;
    markAsRead: INotificationServiceService_IMarkAsRead;
    markAsClicked: INotificationServiceService_IMarkAsClicked;
    updatePreferences: INotificationServiceService_IUpdatePreferences;
    getPreferences: INotificationServiceService_IGetPreferences;
    subscribePush: INotificationServiceService_ISubscribePush;
    unsubscribePush: INotificationServiceService_IUnsubscribePush;
}

interface INotificationServiceService_ISendNotification extends grpc.MethodDefinition<notification_pb.SendNotificationRequest, notification_pb.NotificationResponse> {
    path: "/notification.NotificationService/SendNotification";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<notification_pb.SendNotificationRequest>;
    requestDeserialize: grpc.deserialize<notification_pb.SendNotificationRequest>;
    responseSerialize: grpc.serialize<notification_pb.NotificationResponse>;
    responseDeserialize: grpc.deserialize<notification_pb.NotificationResponse>;
}
interface INotificationServiceService_ISendBulkNotifications extends grpc.MethodDefinition<notification_pb.SendBulkNotificationsRequest, notification_pb.BulkNotificationResponse> {
    path: "/notification.NotificationService/SendBulkNotifications";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<notification_pb.SendBulkNotificationsRequest>;
    requestDeserialize: grpc.deserialize<notification_pb.SendBulkNotificationsRequest>;
    responseSerialize: grpc.serialize<notification_pb.BulkNotificationResponse>;
    responseDeserialize: grpc.deserialize<notification_pb.BulkNotificationResponse>;
}
interface INotificationServiceService_ISendTemplateNotification extends grpc.MethodDefinition<notification_pb.SendTemplateNotificationRequest, notification_pb.TemplateNotificationResponse> {
    path: "/notification.NotificationService/SendTemplateNotification";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<notification_pb.SendTemplateNotificationRequest>;
    requestDeserialize: grpc.deserialize<notification_pb.SendTemplateNotificationRequest>;
    responseSerialize: grpc.serialize<notification_pb.TemplateNotificationResponse>;
    responseDeserialize: grpc.deserialize<notification_pb.TemplateNotificationResponse>;
}
interface INotificationServiceService_IGetUserNotifications extends grpc.MethodDefinition<notification_pb.GetUserNotificationsRequest, notification_pb.GetUserNotificationsResponse> {
    path: "/notification.NotificationService/GetUserNotifications";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<notification_pb.GetUserNotificationsRequest>;
    requestDeserialize: grpc.deserialize<notification_pb.GetUserNotificationsRequest>;
    responseSerialize: grpc.serialize<notification_pb.GetUserNotificationsResponse>;
    responseDeserialize: grpc.deserialize<notification_pb.GetUserNotificationsResponse>;
}
interface INotificationServiceService_IMarkAsRead extends grpc.MethodDefinition<notification_pb.MarkAsReadRequest, notification_pb.NotificationResponse> {
    path: "/notification.NotificationService/MarkAsRead";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<notification_pb.MarkAsReadRequest>;
    requestDeserialize: grpc.deserialize<notification_pb.MarkAsReadRequest>;
    responseSerialize: grpc.serialize<notification_pb.NotificationResponse>;
    responseDeserialize: grpc.deserialize<notification_pb.NotificationResponse>;
}
interface INotificationServiceService_IMarkAsClicked extends grpc.MethodDefinition<notification_pb.MarkAsClickedRequest, notification_pb.NotificationResponse> {
    path: "/notification.NotificationService/MarkAsClicked";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<notification_pb.MarkAsClickedRequest>;
    requestDeserialize: grpc.deserialize<notification_pb.MarkAsClickedRequest>;
    responseSerialize: grpc.serialize<notification_pb.NotificationResponse>;
    responseDeserialize: grpc.deserialize<notification_pb.NotificationResponse>;
}
interface INotificationServiceService_IUpdatePreferences extends grpc.MethodDefinition<notification_pb.UpdatePreferencesRequest, notification_pb.PreferencesResponse> {
    path: "/notification.NotificationService/UpdatePreferences";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<notification_pb.UpdatePreferencesRequest>;
    requestDeserialize: grpc.deserialize<notification_pb.UpdatePreferencesRequest>;
    responseSerialize: grpc.serialize<notification_pb.PreferencesResponse>;
    responseDeserialize: grpc.deserialize<notification_pb.PreferencesResponse>;
}
interface INotificationServiceService_IGetPreferences extends grpc.MethodDefinition<notification_pb.GetPreferencesRequest, notification_pb.GetPreferencesResponse> {
    path: "/notification.NotificationService/GetPreferences";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<notification_pb.GetPreferencesRequest>;
    requestDeserialize: grpc.deserialize<notification_pb.GetPreferencesRequest>;
    responseSerialize: grpc.serialize<notification_pb.GetPreferencesResponse>;
    responseDeserialize: grpc.deserialize<notification_pb.GetPreferencesResponse>;
}
interface INotificationServiceService_ISubscribePush extends grpc.MethodDefinition<notification_pb.SubscribePushRequest, notification_pb.PushSubscriptionResponse> {
    path: "/notification.NotificationService/SubscribePush";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<notification_pb.SubscribePushRequest>;
    requestDeserialize: grpc.deserialize<notification_pb.SubscribePushRequest>;
    responseSerialize: grpc.serialize<notification_pb.PushSubscriptionResponse>;
    responseDeserialize: grpc.deserialize<notification_pb.PushSubscriptionResponse>;
}
interface INotificationServiceService_IUnsubscribePush extends grpc.MethodDefinition<notification_pb.UnsubscribePushRequest, common_pb.OperationResult> {
    path: "/notification.NotificationService/UnsubscribePush";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<notification_pb.UnsubscribePushRequest>;
    requestDeserialize: grpc.deserialize<notification_pb.UnsubscribePushRequest>;
    responseSerialize: grpc.serialize<common_pb.OperationResult>;
    responseDeserialize: grpc.deserialize<common_pb.OperationResult>;
}

export const NotificationServiceService: INotificationServiceService;

export interface INotificationServiceServer extends grpc.UntypedServiceImplementation {
    sendNotification: grpc.handleUnaryCall<notification_pb.SendNotificationRequest, notification_pb.NotificationResponse>;
    sendBulkNotifications: grpc.handleUnaryCall<notification_pb.SendBulkNotificationsRequest, notification_pb.BulkNotificationResponse>;
    sendTemplateNotification: grpc.handleUnaryCall<notification_pb.SendTemplateNotificationRequest, notification_pb.TemplateNotificationResponse>;
    getUserNotifications: grpc.handleUnaryCall<notification_pb.GetUserNotificationsRequest, notification_pb.GetUserNotificationsResponse>;
    markAsRead: grpc.handleUnaryCall<notification_pb.MarkAsReadRequest, notification_pb.NotificationResponse>;
    markAsClicked: grpc.handleUnaryCall<notification_pb.MarkAsClickedRequest, notification_pb.NotificationResponse>;
    updatePreferences: grpc.handleUnaryCall<notification_pb.UpdatePreferencesRequest, notification_pb.PreferencesResponse>;
    getPreferences: grpc.handleUnaryCall<notification_pb.GetPreferencesRequest, notification_pb.GetPreferencesResponse>;
    subscribePush: grpc.handleUnaryCall<notification_pb.SubscribePushRequest, notification_pb.PushSubscriptionResponse>;
    unsubscribePush: grpc.handleUnaryCall<notification_pb.UnsubscribePushRequest, common_pb.OperationResult>;
}

export interface INotificationServiceClient {
    sendNotification(request: notification_pb.SendNotificationRequest, callback: (error: grpc.ServiceError | null, response: notification_pb.NotificationResponse) => void): grpc.ClientUnaryCall;
    sendNotification(request: notification_pb.SendNotificationRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: notification_pb.NotificationResponse) => void): grpc.ClientUnaryCall;
    sendNotification(request: notification_pb.SendNotificationRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: notification_pb.NotificationResponse) => void): grpc.ClientUnaryCall;
    sendBulkNotifications(request: notification_pb.SendBulkNotificationsRequest, callback: (error: grpc.ServiceError | null, response: notification_pb.BulkNotificationResponse) => void): grpc.ClientUnaryCall;
    sendBulkNotifications(request: notification_pb.SendBulkNotificationsRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: notification_pb.BulkNotificationResponse) => void): grpc.ClientUnaryCall;
    sendBulkNotifications(request: notification_pb.SendBulkNotificationsRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: notification_pb.BulkNotificationResponse) => void): grpc.ClientUnaryCall;
    sendTemplateNotification(request: notification_pb.SendTemplateNotificationRequest, callback: (error: grpc.ServiceError | null, response: notification_pb.TemplateNotificationResponse) => void): grpc.ClientUnaryCall;
    sendTemplateNotification(request: notification_pb.SendTemplateNotificationRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: notification_pb.TemplateNotificationResponse) => void): grpc.ClientUnaryCall;
    sendTemplateNotification(request: notification_pb.SendTemplateNotificationRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: notification_pb.TemplateNotificationResponse) => void): grpc.ClientUnaryCall;
    getUserNotifications(request: notification_pb.GetUserNotificationsRequest, callback: (error: grpc.ServiceError | null, response: notification_pb.GetUserNotificationsResponse) => void): grpc.ClientUnaryCall;
    getUserNotifications(request: notification_pb.GetUserNotificationsRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: notification_pb.GetUserNotificationsResponse) => void): grpc.ClientUnaryCall;
    getUserNotifications(request: notification_pb.GetUserNotificationsRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: notification_pb.GetUserNotificationsResponse) => void): grpc.ClientUnaryCall;
    markAsRead(request: notification_pb.MarkAsReadRequest, callback: (error: grpc.ServiceError | null, response: notification_pb.NotificationResponse) => void): grpc.ClientUnaryCall;
    markAsRead(request: notification_pb.MarkAsReadRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: notification_pb.NotificationResponse) => void): grpc.ClientUnaryCall;
    markAsRead(request: notification_pb.MarkAsReadRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: notification_pb.NotificationResponse) => void): grpc.ClientUnaryCall;
    markAsClicked(request: notification_pb.MarkAsClickedRequest, callback: (error: grpc.ServiceError | null, response: notification_pb.NotificationResponse) => void): grpc.ClientUnaryCall;
    markAsClicked(request: notification_pb.MarkAsClickedRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: notification_pb.NotificationResponse) => void): grpc.ClientUnaryCall;
    markAsClicked(request: notification_pb.MarkAsClickedRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: notification_pb.NotificationResponse) => void): grpc.ClientUnaryCall;
    updatePreferences(request: notification_pb.UpdatePreferencesRequest, callback: (error: grpc.ServiceError | null, response: notification_pb.PreferencesResponse) => void): grpc.ClientUnaryCall;
    updatePreferences(request: notification_pb.UpdatePreferencesRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: notification_pb.PreferencesResponse) => void): grpc.ClientUnaryCall;
    updatePreferences(request: notification_pb.UpdatePreferencesRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: notification_pb.PreferencesResponse) => void): grpc.ClientUnaryCall;
    getPreferences(request: notification_pb.GetPreferencesRequest, callback: (error: grpc.ServiceError | null, response: notification_pb.GetPreferencesResponse) => void): grpc.ClientUnaryCall;
    getPreferences(request: notification_pb.GetPreferencesRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: notification_pb.GetPreferencesResponse) => void): grpc.ClientUnaryCall;
    getPreferences(request: notification_pb.GetPreferencesRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: notification_pb.GetPreferencesResponse) => void): grpc.ClientUnaryCall;
    subscribePush(request: notification_pb.SubscribePushRequest, callback: (error: grpc.ServiceError | null, response: notification_pb.PushSubscriptionResponse) => void): grpc.ClientUnaryCall;
    subscribePush(request: notification_pb.SubscribePushRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: notification_pb.PushSubscriptionResponse) => void): grpc.ClientUnaryCall;
    subscribePush(request: notification_pb.SubscribePushRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: notification_pb.PushSubscriptionResponse) => void): grpc.ClientUnaryCall;
    unsubscribePush(request: notification_pb.UnsubscribePushRequest, callback: (error: grpc.ServiceError | null, response: common_pb.OperationResult) => void): grpc.ClientUnaryCall;
    unsubscribePush(request: notification_pb.UnsubscribePushRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: common_pb.OperationResult) => void): grpc.ClientUnaryCall;
    unsubscribePush(request: notification_pb.UnsubscribePushRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: common_pb.OperationResult) => void): grpc.ClientUnaryCall;
}

export class NotificationServiceClient extends grpc.Client implements INotificationServiceClient {
    constructor(address: string, credentials: grpc.ChannelCredentials, options?: Partial<grpc.ClientOptions>);
    public sendNotification(request: notification_pb.SendNotificationRequest, callback: (error: grpc.ServiceError | null, response: notification_pb.NotificationResponse) => void): grpc.ClientUnaryCall;
    public sendNotification(request: notification_pb.SendNotificationRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: notification_pb.NotificationResponse) => void): grpc.ClientUnaryCall;
    public sendNotification(request: notification_pb.SendNotificationRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: notification_pb.NotificationResponse) => void): grpc.ClientUnaryCall;
    public sendBulkNotifications(request: notification_pb.SendBulkNotificationsRequest, callback: (error: grpc.ServiceError | null, response: notification_pb.BulkNotificationResponse) => void): grpc.ClientUnaryCall;
    public sendBulkNotifications(request: notification_pb.SendBulkNotificationsRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: notification_pb.BulkNotificationResponse) => void): grpc.ClientUnaryCall;
    public sendBulkNotifications(request: notification_pb.SendBulkNotificationsRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: notification_pb.BulkNotificationResponse) => void): grpc.ClientUnaryCall;
    public sendTemplateNotification(request: notification_pb.SendTemplateNotificationRequest, callback: (error: grpc.ServiceError | null, response: notification_pb.TemplateNotificationResponse) => void): grpc.ClientUnaryCall;
    public sendTemplateNotification(request: notification_pb.SendTemplateNotificationRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: notification_pb.TemplateNotificationResponse) => void): grpc.ClientUnaryCall;
    public sendTemplateNotification(request: notification_pb.SendTemplateNotificationRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: notification_pb.TemplateNotificationResponse) => void): grpc.ClientUnaryCall;
    public getUserNotifications(request: notification_pb.GetUserNotificationsRequest, callback: (error: grpc.ServiceError | null, response: notification_pb.GetUserNotificationsResponse) => void): grpc.ClientUnaryCall;
    public getUserNotifications(request: notification_pb.GetUserNotificationsRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: notification_pb.GetUserNotificationsResponse) => void): grpc.ClientUnaryCall;
    public getUserNotifications(request: notification_pb.GetUserNotificationsRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: notification_pb.GetUserNotificationsResponse) => void): grpc.ClientUnaryCall;
    public markAsRead(request: notification_pb.MarkAsReadRequest, callback: (error: grpc.ServiceError | null, response: notification_pb.NotificationResponse) => void): grpc.ClientUnaryCall;
    public markAsRead(request: notification_pb.MarkAsReadRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: notification_pb.NotificationResponse) => void): grpc.ClientUnaryCall;
    public markAsRead(request: notification_pb.MarkAsReadRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: notification_pb.NotificationResponse) => void): grpc.ClientUnaryCall;
    public markAsClicked(request: notification_pb.MarkAsClickedRequest, callback: (error: grpc.ServiceError | null, response: notification_pb.NotificationResponse) => void): grpc.ClientUnaryCall;
    public markAsClicked(request: notification_pb.MarkAsClickedRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: notification_pb.NotificationResponse) => void): grpc.ClientUnaryCall;
    public markAsClicked(request: notification_pb.MarkAsClickedRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: notification_pb.NotificationResponse) => void): grpc.ClientUnaryCall;
    public updatePreferences(request: notification_pb.UpdatePreferencesRequest, callback: (error: grpc.ServiceError | null, response: notification_pb.PreferencesResponse) => void): grpc.ClientUnaryCall;
    public updatePreferences(request: notification_pb.UpdatePreferencesRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: notification_pb.PreferencesResponse) => void): grpc.ClientUnaryCall;
    public updatePreferences(request: notification_pb.UpdatePreferencesRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: notification_pb.PreferencesResponse) => void): grpc.ClientUnaryCall;
    public getPreferences(request: notification_pb.GetPreferencesRequest, callback: (error: grpc.ServiceError | null, response: notification_pb.GetPreferencesResponse) => void): grpc.ClientUnaryCall;
    public getPreferences(request: notification_pb.GetPreferencesRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: notification_pb.GetPreferencesResponse) => void): grpc.ClientUnaryCall;
    public getPreferences(request: notification_pb.GetPreferencesRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: notification_pb.GetPreferencesResponse) => void): grpc.ClientUnaryCall;
    public subscribePush(request: notification_pb.SubscribePushRequest, callback: (error: grpc.ServiceError | null, response: notification_pb.PushSubscriptionResponse) => void): grpc.ClientUnaryCall;
    public subscribePush(request: notification_pb.SubscribePushRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: notification_pb.PushSubscriptionResponse) => void): grpc.ClientUnaryCall;
    public subscribePush(request: notification_pb.SubscribePushRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: notification_pb.PushSubscriptionResponse) => void): grpc.ClientUnaryCall;
    public unsubscribePush(request: notification_pb.UnsubscribePushRequest, callback: (error: grpc.ServiceError | null, response: common_pb.OperationResult) => void): grpc.ClientUnaryCall;
    public unsubscribePush(request: notification_pb.UnsubscribePushRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: common_pb.OperationResult) => void): grpc.ClientUnaryCall;
    public unsubscribePush(request: notification_pb.UnsubscribePushRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: common_pb.OperationResult) => void): grpc.ClientUnaryCall;
}
