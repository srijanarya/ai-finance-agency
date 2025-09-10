// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('@grpc/grpc-js');
var notification_pb = require('./notification_pb.js');
var common_pb = require('./common_pb.js');

function serialize_notification_BulkNotificationResponse(arg) {
  if (!(arg instanceof notification_pb.BulkNotificationResponse)) {
    throw new Error('Expected argument of type notification.BulkNotificationResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_notification_BulkNotificationResponse(buffer_arg) {
  return notification_pb.BulkNotificationResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_notification_GetPreferencesRequest(arg) {
  if (!(arg instanceof notification_pb.GetPreferencesRequest)) {
    throw new Error('Expected argument of type notification.GetPreferencesRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_notification_GetPreferencesRequest(buffer_arg) {
  return notification_pb.GetPreferencesRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_notification_GetPreferencesResponse(arg) {
  if (!(arg instanceof notification_pb.GetPreferencesResponse)) {
    throw new Error('Expected argument of type notification.GetPreferencesResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_notification_GetPreferencesResponse(buffer_arg) {
  return notification_pb.GetPreferencesResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_notification_GetUserNotificationsRequest(arg) {
  if (!(arg instanceof notification_pb.GetUserNotificationsRequest)) {
    throw new Error('Expected argument of type notification.GetUserNotificationsRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_notification_GetUserNotificationsRequest(buffer_arg) {
  return notification_pb.GetUserNotificationsRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_notification_GetUserNotificationsResponse(arg) {
  if (!(arg instanceof notification_pb.GetUserNotificationsResponse)) {
    throw new Error('Expected argument of type notification.GetUserNotificationsResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_notification_GetUserNotificationsResponse(buffer_arg) {
  return notification_pb.GetUserNotificationsResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_notification_MarkAsClickedRequest(arg) {
  if (!(arg instanceof notification_pb.MarkAsClickedRequest)) {
    throw new Error('Expected argument of type notification.MarkAsClickedRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_notification_MarkAsClickedRequest(buffer_arg) {
  return notification_pb.MarkAsClickedRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_notification_MarkAsReadRequest(arg) {
  if (!(arg instanceof notification_pb.MarkAsReadRequest)) {
    throw new Error('Expected argument of type notification.MarkAsReadRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_notification_MarkAsReadRequest(buffer_arg) {
  return notification_pb.MarkAsReadRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_notification_NotificationResponse(arg) {
  if (!(arg instanceof notification_pb.NotificationResponse)) {
    throw new Error('Expected argument of type notification.NotificationResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_notification_NotificationResponse(buffer_arg) {
  return notification_pb.NotificationResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_notification_PreferencesResponse(arg) {
  if (!(arg instanceof notification_pb.PreferencesResponse)) {
    throw new Error('Expected argument of type notification.PreferencesResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_notification_PreferencesResponse(buffer_arg) {
  return notification_pb.PreferencesResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_notification_PushSubscriptionResponse(arg) {
  if (!(arg instanceof notification_pb.PushSubscriptionResponse)) {
    throw new Error('Expected argument of type notification.PushSubscriptionResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_notification_PushSubscriptionResponse(buffer_arg) {
  return notification_pb.PushSubscriptionResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_notification_SendBulkNotificationsRequest(arg) {
  if (!(arg instanceof notification_pb.SendBulkNotificationsRequest)) {
    throw new Error('Expected argument of type notification.SendBulkNotificationsRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_notification_SendBulkNotificationsRequest(buffer_arg) {
  return notification_pb.SendBulkNotificationsRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_notification_SendNotificationRequest(arg) {
  if (!(arg instanceof notification_pb.SendNotificationRequest)) {
    throw new Error('Expected argument of type notification.SendNotificationRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_notification_SendNotificationRequest(buffer_arg) {
  return notification_pb.SendNotificationRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_notification_SendTemplateNotificationRequest(arg) {
  if (!(arg instanceof notification_pb.SendTemplateNotificationRequest)) {
    throw new Error('Expected argument of type notification.SendTemplateNotificationRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_notification_SendTemplateNotificationRequest(buffer_arg) {
  return notification_pb.SendTemplateNotificationRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_notification_SubscribePushRequest(arg) {
  if (!(arg instanceof notification_pb.SubscribePushRequest)) {
    throw new Error('Expected argument of type notification.SubscribePushRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_notification_SubscribePushRequest(buffer_arg) {
  return notification_pb.SubscribePushRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_notification_TemplateNotificationResponse(arg) {
  if (!(arg instanceof notification_pb.TemplateNotificationResponse)) {
    throw new Error('Expected argument of type notification.TemplateNotificationResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_notification_TemplateNotificationResponse(buffer_arg) {
  return notification_pb.TemplateNotificationResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_notification_UnsubscribePushRequest(arg) {
  if (!(arg instanceof notification_pb.UnsubscribePushRequest)) {
    throw new Error('Expected argument of type notification.UnsubscribePushRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_notification_UnsubscribePushRequest(buffer_arg) {
  return notification_pb.UnsubscribePushRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_notification_UpdatePreferencesRequest(arg) {
  if (!(arg instanceof notification_pb.UpdatePreferencesRequest)) {
    throw new Error('Expected argument of type notification.UpdatePreferencesRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_notification_UpdatePreferencesRequest(buffer_arg) {
  return notification_pb.UpdatePreferencesRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_common_OperationResult(arg) {
  if (!(arg instanceof common_pb.OperationResult)) {
    throw new Error('Expected argument of type treum.common.OperationResult');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_common_OperationResult(buffer_arg) {
  return common_pb.OperationResult.deserializeBinary(new Uint8Array(buffer_arg));
}


// Notification service definition
var NotificationServiceService = exports.NotificationServiceService = {
  // Send a single notification
sendNotification: {
    path: '/notification.NotificationService/SendNotification',
    requestStream: false,
    responseStream: false,
    requestType: notification_pb.SendNotificationRequest,
    responseType: notification_pb.NotificationResponse,
    requestSerialize: serialize_notification_SendNotificationRequest,
    requestDeserialize: deserialize_notification_SendNotificationRequest,
    responseSerialize: serialize_notification_NotificationResponse,
    responseDeserialize: deserialize_notification_NotificationResponse,
  },
  // Send bulk notifications
sendBulkNotifications: {
    path: '/notification.NotificationService/SendBulkNotifications',
    requestStream: false,
    responseStream: false,
    requestType: notification_pb.SendBulkNotificationsRequest,
    responseType: notification_pb.BulkNotificationResponse,
    requestSerialize: serialize_notification_SendBulkNotificationsRequest,
    requestDeserialize: deserialize_notification_SendBulkNotificationsRequest,
    responseSerialize: serialize_notification_BulkNotificationResponse,
    responseDeserialize: deserialize_notification_BulkNotificationResponse,
  },
  // Send notification using template
sendTemplateNotification: {
    path: '/notification.NotificationService/SendTemplateNotification',
    requestStream: false,
    responseStream: false,
    requestType: notification_pb.SendTemplateNotificationRequest,
    responseType: notification_pb.TemplateNotificationResponse,
    requestSerialize: serialize_notification_SendTemplateNotificationRequest,
    requestDeserialize: deserialize_notification_SendTemplateNotificationRequest,
    responseSerialize: serialize_notification_TemplateNotificationResponse,
    responseDeserialize: deserialize_notification_TemplateNotificationResponse,
  },
  // Get notifications for a user
getUserNotifications: {
    path: '/notification.NotificationService/GetUserNotifications',
    requestStream: false,
    responseStream: false,
    requestType: notification_pb.GetUserNotificationsRequest,
    responseType: notification_pb.GetUserNotificationsResponse,
    requestSerialize: serialize_notification_GetUserNotificationsRequest,
    requestDeserialize: deserialize_notification_GetUserNotificationsRequest,
    responseSerialize: serialize_notification_GetUserNotificationsResponse,
    responseDeserialize: deserialize_notification_GetUserNotificationsResponse,
  },
  // Mark notification as read
markAsRead: {
    path: '/notification.NotificationService/MarkAsRead',
    requestStream: false,
    responseStream: false,
    requestType: notification_pb.MarkAsReadRequest,
    responseType: notification_pb.NotificationResponse,
    requestSerialize: serialize_notification_MarkAsReadRequest,
    requestDeserialize: deserialize_notification_MarkAsReadRequest,
    responseSerialize: serialize_notification_NotificationResponse,
    responseDeserialize: deserialize_notification_NotificationResponse,
  },
  // Mark notification as clicked
markAsClicked: {
    path: '/notification.NotificationService/MarkAsClicked',
    requestStream: false,
    responseStream: false,
    requestType: notification_pb.MarkAsClickedRequest,
    responseType: notification_pb.NotificationResponse,
    requestSerialize: serialize_notification_MarkAsClickedRequest,
    requestDeserialize: deserialize_notification_MarkAsClickedRequest,
    responseSerialize: serialize_notification_NotificationResponse,
    responseDeserialize: deserialize_notification_NotificationResponse,
  },
  // Update notification preferences
updatePreferences: {
    path: '/notification.NotificationService/UpdatePreferences',
    requestStream: false,
    responseStream: false,
    requestType: notification_pb.UpdatePreferencesRequest,
    responseType: notification_pb.PreferencesResponse,
    requestSerialize: serialize_notification_UpdatePreferencesRequest,
    requestDeserialize: deserialize_notification_UpdatePreferencesRequest,
    responseSerialize: serialize_notification_PreferencesResponse,
    responseDeserialize: deserialize_notification_PreferencesResponse,
  },
  // Get user notification preferences
getPreferences: {
    path: '/notification.NotificationService/GetPreferences',
    requestStream: false,
    responseStream: false,
    requestType: notification_pb.GetPreferencesRequest,
    responseType: notification_pb.GetPreferencesResponse,
    requestSerialize: serialize_notification_GetPreferencesRequest,
    requestDeserialize: deserialize_notification_GetPreferencesRequest,
    responseSerialize: serialize_notification_GetPreferencesResponse,
    responseDeserialize: deserialize_notification_GetPreferencesResponse,
  },
  // Subscribe to push notifications
subscribePush: {
    path: '/notification.NotificationService/SubscribePush',
    requestStream: false,
    responseStream: false,
    requestType: notification_pb.SubscribePushRequest,
    responseType: notification_pb.PushSubscriptionResponse,
    requestSerialize: serialize_notification_SubscribePushRequest,
    requestDeserialize: deserialize_notification_SubscribePushRequest,
    responseSerialize: serialize_notification_PushSubscriptionResponse,
    responseDeserialize: deserialize_notification_PushSubscriptionResponse,
  },
  // Unsubscribe from push notifications
unsubscribePush: {
    path: '/notification.NotificationService/UnsubscribePush',
    requestStream: false,
    responseStream: false,
    requestType: notification_pb.UnsubscribePushRequest,
    responseType: common_pb.OperationResult,
    requestSerialize: serialize_notification_UnsubscribePushRequest,
    requestDeserialize: deserialize_notification_UnsubscribePushRequest,
    responseSerialize: serialize_treum_common_OperationResult,
    responseDeserialize: deserialize_treum_common_OperationResult,
  },
};

exports.NotificationServiceClient = grpc.makeGenericClientConstructor(NotificationServiceService, 'NotificationService');
