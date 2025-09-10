// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('@grpc/grpc-js');
var payment_pb = require('./payment_pb.js');
var google_protobuf_timestamp_pb = require('google-protobuf/google/protobuf/timestamp_pb.js');
var google_protobuf_empty_pb = require('google-protobuf/google/protobuf/empty_pb.js');
var google_protobuf_struct_pb = require('google-protobuf/google/protobuf/struct_pb.js');

function serialize_treum_payment_CancelSubscriptionRequest(arg) {
  if (!(arg instanceof payment_pb.CancelSubscriptionRequest)) {
    throw new Error('Expected argument of type treum.payment.CancelSubscriptionRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_payment_CancelSubscriptionRequest(buffer_arg) {
  return payment_pb.CancelSubscriptionRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_payment_CreatePaymentRequest(arg) {
  if (!(arg instanceof payment_pb.CreatePaymentRequest)) {
    throw new Error('Expected argument of type treum.payment.CreatePaymentRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_payment_CreatePaymentRequest(buffer_arg) {
  return payment_pb.CreatePaymentRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_payment_CreateSubscriptionRequest(arg) {
  if (!(arg instanceof payment_pb.CreateSubscriptionRequest)) {
    throw new Error('Expected argument of type treum.payment.CreateSubscriptionRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_payment_CreateSubscriptionRequest(buffer_arg) {
  return payment_pb.CreateSubscriptionRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_payment_GetPaymentRequest(arg) {
  if (!(arg instanceof payment_pb.GetPaymentRequest)) {
    throw new Error('Expected argument of type treum.payment.GetPaymentRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_payment_GetPaymentRequest(buffer_arg) {
  return payment_pb.GetPaymentRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_payment_GetSubscriptionRequest(arg) {
  if (!(arg instanceof payment_pb.GetSubscriptionRequest)) {
    throw new Error('Expected argument of type treum.payment.GetSubscriptionRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_payment_GetSubscriptionRequest(buffer_arg) {
  return payment_pb.GetSubscriptionRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_payment_ListPaymentsRequest(arg) {
  if (!(arg instanceof payment_pb.ListPaymentsRequest)) {
    throw new Error('Expected argument of type treum.payment.ListPaymentsRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_payment_ListPaymentsRequest(buffer_arg) {
  return payment_pb.ListPaymentsRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_payment_ListPaymentsResponse(arg) {
  if (!(arg instanceof payment_pb.ListPaymentsResponse)) {
    throw new Error('Expected argument of type treum.payment.ListPaymentsResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_payment_ListPaymentsResponse(buffer_arg) {
  return payment_pb.ListPaymentsResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_payment_ListSubscriptionsRequest(arg) {
  if (!(arg instanceof payment_pb.ListSubscriptionsRequest)) {
    throw new Error('Expected argument of type treum.payment.ListSubscriptionsRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_payment_ListSubscriptionsRequest(buffer_arg) {
  return payment_pb.ListSubscriptionsRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_payment_ListSubscriptionsResponse(arg) {
  if (!(arg instanceof payment_pb.ListSubscriptionsResponse)) {
    throw new Error('Expected argument of type treum.payment.ListSubscriptionsResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_payment_ListSubscriptionsResponse(buffer_arg) {
  return payment_pb.ListSubscriptionsResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_payment_PaymentResponse(arg) {
  if (!(arg instanceof payment_pb.PaymentResponse)) {
    throw new Error('Expected argument of type treum.payment.PaymentResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_payment_PaymentResponse(buffer_arg) {
  return payment_pb.PaymentResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_payment_ProcessPaymentRequest(arg) {
  if (!(arg instanceof payment_pb.ProcessPaymentRequest)) {
    throw new Error('Expected argument of type treum.payment.ProcessPaymentRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_payment_ProcessPaymentRequest(buffer_arg) {
  return payment_pb.ProcessPaymentRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_payment_RefundPaymentRequest(arg) {
  if (!(arg instanceof payment_pb.RefundPaymentRequest)) {
    throw new Error('Expected argument of type treum.payment.RefundPaymentRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_payment_RefundPaymentRequest(buffer_arg) {
  return payment_pb.RefundPaymentRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_payment_SubscriptionResponse(arg) {
  if (!(arg instanceof payment_pb.SubscriptionResponse)) {
    throw new Error('Expected argument of type treum.payment.SubscriptionResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_payment_SubscriptionResponse(buffer_arg) {
  return payment_pb.SubscriptionResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_payment_UpdateSubscriptionRequest(arg) {
  if (!(arg instanceof payment_pb.UpdateSubscriptionRequest)) {
    throw new Error('Expected argument of type treum.payment.UpdateSubscriptionRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_payment_UpdateSubscriptionRequest(buffer_arg) {
  return payment_pb.UpdateSubscriptionRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_payment_ValidatePaymentMethodRequest(arg) {
  if (!(arg instanceof payment_pb.ValidatePaymentMethodRequest)) {
    throw new Error('Expected argument of type treum.payment.ValidatePaymentMethodRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_payment_ValidatePaymentMethodRequest(buffer_arg) {
  return payment_pb.ValidatePaymentMethodRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_payment_ValidatePaymentMethodResponse(arg) {
  if (!(arg instanceof payment_pb.ValidatePaymentMethodResponse)) {
    throw new Error('Expected argument of type treum.payment.ValidatePaymentMethodResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_payment_ValidatePaymentMethodResponse(buffer_arg) {
  return payment_pb.ValidatePaymentMethodResponse.deserializeBinary(new Uint8Array(buffer_arg));
}


var PaymentServiceService = exports.PaymentServiceService = {
  createPayment: {
    path: '/treum.payment.PaymentService/CreatePayment',
    requestStream: false,
    responseStream: false,
    requestType: payment_pb.CreatePaymentRequest,
    responseType: payment_pb.PaymentResponse,
    requestSerialize: serialize_treum_payment_CreatePaymentRequest,
    requestDeserialize: deserialize_treum_payment_CreatePaymentRequest,
    responseSerialize: serialize_treum_payment_PaymentResponse,
    responseDeserialize: deserialize_treum_payment_PaymentResponse,
  },
  getPayment: {
    path: '/treum.payment.PaymentService/GetPayment',
    requestStream: false,
    responseStream: false,
    requestType: payment_pb.GetPaymentRequest,
    responseType: payment_pb.PaymentResponse,
    requestSerialize: serialize_treum_payment_GetPaymentRequest,
    requestDeserialize: deserialize_treum_payment_GetPaymentRequest,
    responseSerialize: serialize_treum_payment_PaymentResponse,
    responseDeserialize: deserialize_treum_payment_PaymentResponse,
  },
  listPayments: {
    path: '/treum.payment.PaymentService/ListPayments',
    requestStream: false,
    responseStream: false,
    requestType: payment_pb.ListPaymentsRequest,
    responseType: payment_pb.ListPaymentsResponse,
    requestSerialize: serialize_treum_payment_ListPaymentsRequest,
    requestDeserialize: deserialize_treum_payment_ListPaymentsRequest,
    responseSerialize: serialize_treum_payment_ListPaymentsResponse,
    responseDeserialize: deserialize_treum_payment_ListPaymentsResponse,
  },
  processPayment: {
    path: '/treum.payment.PaymentService/ProcessPayment',
    requestStream: false,
    responseStream: false,
    requestType: payment_pb.ProcessPaymentRequest,
    responseType: payment_pb.PaymentResponse,
    requestSerialize: serialize_treum_payment_ProcessPaymentRequest,
    requestDeserialize: deserialize_treum_payment_ProcessPaymentRequest,
    responseSerialize: serialize_treum_payment_PaymentResponse,
    responseDeserialize: deserialize_treum_payment_PaymentResponse,
  },
  refundPayment: {
    path: '/treum.payment.PaymentService/RefundPayment',
    requestStream: false,
    responseStream: false,
    requestType: payment_pb.RefundPaymentRequest,
    responseType: payment_pb.PaymentResponse,
    requestSerialize: serialize_treum_payment_RefundPaymentRequest,
    requestDeserialize: deserialize_treum_payment_RefundPaymentRequest,
    responseSerialize: serialize_treum_payment_PaymentResponse,
    responseDeserialize: deserialize_treum_payment_PaymentResponse,
  },
  createSubscription: {
    path: '/treum.payment.PaymentService/CreateSubscription',
    requestStream: false,
    responseStream: false,
    requestType: payment_pb.CreateSubscriptionRequest,
    responseType: payment_pb.SubscriptionResponse,
    requestSerialize: serialize_treum_payment_CreateSubscriptionRequest,
    requestDeserialize: deserialize_treum_payment_CreateSubscriptionRequest,
    responseSerialize: serialize_treum_payment_SubscriptionResponse,
    responseDeserialize: deserialize_treum_payment_SubscriptionResponse,
  },
  getSubscription: {
    path: '/treum.payment.PaymentService/GetSubscription',
    requestStream: false,
    responseStream: false,
    requestType: payment_pb.GetSubscriptionRequest,
    responseType: payment_pb.SubscriptionResponse,
    requestSerialize: serialize_treum_payment_GetSubscriptionRequest,
    requestDeserialize: deserialize_treum_payment_GetSubscriptionRequest,
    responseSerialize: serialize_treum_payment_SubscriptionResponse,
    responseDeserialize: deserialize_treum_payment_SubscriptionResponse,
  },
  updateSubscription: {
    path: '/treum.payment.PaymentService/UpdateSubscription',
    requestStream: false,
    responseStream: false,
    requestType: payment_pb.UpdateSubscriptionRequest,
    responseType: payment_pb.SubscriptionResponse,
    requestSerialize: serialize_treum_payment_UpdateSubscriptionRequest,
    requestDeserialize: deserialize_treum_payment_UpdateSubscriptionRequest,
    responseSerialize: serialize_treum_payment_SubscriptionResponse,
    responseDeserialize: deserialize_treum_payment_SubscriptionResponse,
  },
  cancelSubscription: {
    path: '/treum.payment.PaymentService/CancelSubscription',
    requestStream: false,
    responseStream: false,
    requestType: payment_pb.CancelSubscriptionRequest,
    responseType: payment_pb.SubscriptionResponse,
    requestSerialize: serialize_treum_payment_CancelSubscriptionRequest,
    requestDeserialize: deserialize_treum_payment_CancelSubscriptionRequest,
    responseSerialize: serialize_treum_payment_SubscriptionResponse,
    responseDeserialize: deserialize_treum_payment_SubscriptionResponse,
  },
  listSubscriptions: {
    path: '/treum.payment.PaymentService/ListSubscriptions',
    requestStream: false,
    responseStream: false,
    requestType: payment_pb.ListSubscriptionsRequest,
    responseType: payment_pb.ListSubscriptionsResponse,
    requestSerialize: serialize_treum_payment_ListSubscriptionsRequest,
    requestDeserialize: deserialize_treum_payment_ListSubscriptionsRequest,
    responseSerialize: serialize_treum_payment_ListSubscriptionsResponse,
    responseDeserialize: deserialize_treum_payment_ListSubscriptionsResponse,
  },
  validatePaymentMethod: {
    path: '/treum.payment.PaymentService/ValidatePaymentMethod',
    requestStream: false,
    responseStream: false,
    requestType: payment_pb.ValidatePaymentMethodRequest,
    responseType: payment_pb.ValidatePaymentMethodResponse,
    requestSerialize: serialize_treum_payment_ValidatePaymentMethodRequest,
    requestDeserialize: deserialize_treum_payment_ValidatePaymentMethodRequest,
    responseSerialize: serialize_treum_payment_ValidatePaymentMethodResponse,
    responseDeserialize: deserialize_treum_payment_ValidatePaymentMethodResponse,
  },
};

exports.PaymentServiceClient = grpc.makeGenericClientConstructor(PaymentServiceService, 'PaymentService');
