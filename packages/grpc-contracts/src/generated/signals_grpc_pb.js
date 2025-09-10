// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('@grpc/grpc-js');
var signals_pb = require('./signals_pb.js');
var google_protobuf_timestamp_pb = require('google-protobuf/google/protobuf/timestamp_pb.js');
var google_protobuf_empty_pb = require('google-protobuf/google/protobuf/empty_pb.js');

function serialize_google_protobuf_Empty(arg) {
  if (!(arg instanceof google_protobuf_empty_pb.Empty)) {
    throw new Error('Expected argument of type google.protobuf.Empty');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_google_protobuf_Empty(buffer_arg) {
  return google_protobuf_empty_pb.Empty.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_signals_CreateSignalRequest(arg) {
  if (!(arg instanceof signals_pb.CreateSignalRequest)) {
    throw new Error('Expected argument of type treum.signals.CreateSignalRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_signals_CreateSignalRequest(buffer_arg) {
  return signals_pb.CreateSignalRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_signals_ExpireSignalRequest(arg) {
  if (!(arg instanceof signals_pb.ExpireSignalRequest)) {
    throw new Error('Expected argument of type treum.signals.ExpireSignalRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_signals_ExpireSignalRequest(buffer_arg) {
  return signals_pb.ExpireSignalRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_signals_FollowSignalRequest(arg) {
  if (!(arg instanceof signals_pb.FollowSignalRequest)) {
    throw new Error('Expected argument of type treum.signals.FollowSignalRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_signals_FollowSignalRequest(buffer_arg) {
  return signals_pb.FollowSignalRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_signals_GetSignalPerformanceRequest(arg) {
  if (!(arg instanceof signals_pb.GetSignalPerformanceRequest)) {
    throw new Error('Expected argument of type treum.signals.GetSignalPerformanceRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_signals_GetSignalPerformanceRequest(buffer_arg) {
  return signals_pb.GetSignalPerformanceRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_signals_GetSignalRequest(arg) {
  if (!(arg instanceof signals_pb.GetSignalRequest)) {
    throw new Error('Expected argument of type treum.signals.GetSignalRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_signals_GetSignalRequest(buffer_arg) {
  return signals_pb.GetSignalRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_signals_GetUserSignalHistoryRequest(arg) {
  if (!(arg instanceof signals_pb.GetUserSignalHistoryRequest)) {
    throw new Error('Expected argument of type treum.signals.GetUserSignalHistoryRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_signals_GetUserSignalHistoryRequest(buffer_arg) {
  return signals_pb.GetUserSignalHistoryRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_signals_ListActiveSignalsRequest(arg) {
  if (!(arg instanceof signals_pb.ListActiveSignalsRequest)) {
    throw new Error('Expected argument of type treum.signals.ListActiveSignalsRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_signals_ListActiveSignalsRequest(buffer_arg) {
  return signals_pb.ListActiveSignalsRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_signals_ListSignalsRequest(arg) {
  if (!(arg instanceof signals_pb.ListSignalsRequest)) {
    throw new Error('Expected argument of type treum.signals.ListSignalsRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_signals_ListSignalsRequest(buffer_arg) {
  return signals_pb.ListSignalsRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_signals_ListSignalsResponse(arg) {
  if (!(arg instanceof signals_pb.ListSignalsResponse)) {
    throw new Error('Expected argument of type treum.signals.ListSignalsResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_signals_ListSignalsResponse(buffer_arg) {
  return signals_pb.ListSignalsResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_signals_SignalPerformanceResponse(arg) {
  if (!(arg instanceof signals_pb.SignalPerformanceResponse)) {
    throw new Error('Expected argument of type treum.signals.SignalPerformanceResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_signals_SignalPerformanceResponse(buffer_arg) {
  return signals_pb.SignalPerformanceResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_signals_SignalResponse(arg) {
  if (!(arg instanceof signals_pb.SignalResponse)) {
    throw new Error('Expected argument of type treum.signals.SignalResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_signals_SignalResponse(buffer_arg) {
  return signals_pb.SignalResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_signals_UnfollowSignalRequest(arg) {
  if (!(arg instanceof signals_pb.UnfollowSignalRequest)) {
    throw new Error('Expected argument of type treum.signals.UnfollowSignalRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_signals_UnfollowSignalRequest(buffer_arg) {
  return signals_pb.UnfollowSignalRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_signals_UpdateSignalRequest(arg) {
  if (!(arg instanceof signals_pb.UpdateSignalRequest)) {
    throw new Error('Expected argument of type treum.signals.UpdateSignalRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_signals_UpdateSignalRequest(buffer_arg) {
  return signals_pb.UpdateSignalRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_signals_UserSignalHistoryResponse(arg) {
  if (!(arg instanceof signals_pb.UserSignalHistoryResponse)) {
    throw new Error('Expected argument of type treum.signals.UserSignalHistoryResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_signals_UserSignalHistoryResponse(buffer_arg) {
  return signals_pb.UserSignalHistoryResponse.deserializeBinary(new Uint8Array(buffer_arg));
}


var SignalsServiceService = exports.SignalsServiceService = {
  createSignal: {
    path: '/treum.signals.SignalsService/CreateSignal',
    requestStream: false,
    responseStream: false,
    requestType: signals_pb.CreateSignalRequest,
    responseType: signals_pb.SignalResponse,
    requestSerialize: serialize_treum_signals_CreateSignalRequest,
    requestDeserialize: deserialize_treum_signals_CreateSignalRequest,
    responseSerialize: serialize_treum_signals_SignalResponse,
    responseDeserialize: deserialize_treum_signals_SignalResponse,
  },
  getSignal: {
    path: '/treum.signals.SignalsService/GetSignal',
    requestStream: false,
    responseStream: false,
    requestType: signals_pb.GetSignalRequest,
    responseType: signals_pb.SignalResponse,
    requestSerialize: serialize_treum_signals_GetSignalRequest,
    requestDeserialize: deserialize_treum_signals_GetSignalRequest,
    responseSerialize: serialize_treum_signals_SignalResponse,
    responseDeserialize: deserialize_treum_signals_SignalResponse,
  },
  listSignals: {
    path: '/treum.signals.SignalsService/ListSignals',
    requestStream: false,
    responseStream: false,
    requestType: signals_pb.ListSignalsRequest,
    responseType: signals_pb.ListSignalsResponse,
    requestSerialize: serialize_treum_signals_ListSignalsRequest,
    requestDeserialize: deserialize_treum_signals_ListSignalsRequest,
    responseSerialize: serialize_treum_signals_ListSignalsResponse,
    responseDeserialize: deserialize_treum_signals_ListSignalsResponse,
  },
  updateSignal: {
    path: '/treum.signals.SignalsService/UpdateSignal',
    requestStream: false,
    responseStream: false,
    requestType: signals_pb.UpdateSignalRequest,
    responseType: signals_pb.SignalResponse,
    requestSerialize: serialize_treum_signals_UpdateSignalRequest,
    requestDeserialize: deserialize_treum_signals_UpdateSignalRequest,
    responseSerialize: serialize_treum_signals_SignalResponse,
    responseDeserialize: deserialize_treum_signals_SignalResponse,
  },
  expireSignal: {
    path: '/treum.signals.SignalsService/ExpireSignal',
    requestStream: false,
    responseStream: false,
    requestType: signals_pb.ExpireSignalRequest,
    responseType: signals_pb.SignalResponse,
    requestSerialize: serialize_treum_signals_ExpireSignalRequest,
    requestDeserialize: deserialize_treum_signals_ExpireSignalRequest,
    responseSerialize: serialize_treum_signals_SignalResponse,
    responseDeserialize: deserialize_treum_signals_SignalResponse,
  },
  getSignalPerformance: {
    path: '/treum.signals.SignalsService/GetSignalPerformance',
    requestStream: false,
    responseStream: false,
    requestType: signals_pb.GetSignalPerformanceRequest,
    responseType: signals_pb.SignalPerformanceResponse,
    requestSerialize: serialize_treum_signals_GetSignalPerformanceRequest,
    requestDeserialize: deserialize_treum_signals_GetSignalPerformanceRequest,
    responseSerialize: serialize_treum_signals_SignalPerformanceResponse,
    responseDeserialize: deserialize_treum_signals_SignalPerformanceResponse,
  },
  listActiveSignals: {
    path: '/treum.signals.SignalsService/ListActiveSignals',
    requestStream: false,
    responseStream: false,
    requestType: signals_pb.ListActiveSignalsRequest,
    responseType: signals_pb.ListSignalsResponse,
    requestSerialize: serialize_treum_signals_ListActiveSignalsRequest,
    requestDeserialize: deserialize_treum_signals_ListActiveSignalsRequest,
    responseSerialize: serialize_treum_signals_ListSignalsResponse,
    responseDeserialize: deserialize_treum_signals_ListSignalsResponse,
  },
  followSignal: {
    path: '/treum.signals.SignalsService/FollowSignal',
    requestStream: false,
    responseStream: false,
    requestType: signals_pb.FollowSignalRequest,
    responseType: google_protobuf_empty_pb.Empty,
    requestSerialize: serialize_treum_signals_FollowSignalRequest,
    requestDeserialize: deserialize_treum_signals_FollowSignalRequest,
    responseSerialize: serialize_google_protobuf_Empty,
    responseDeserialize: deserialize_google_protobuf_Empty,
  },
  unfollowSignal: {
    path: '/treum.signals.SignalsService/UnfollowSignal',
    requestStream: false,
    responseStream: false,
    requestType: signals_pb.UnfollowSignalRequest,
    responseType: google_protobuf_empty_pb.Empty,
    requestSerialize: serialize_treum_signals_UnfollowSignalRequest,
    requestDeserialize: deserialize_treum_signals_UnfollowSignalRequest,
    responseSerialize: serialize_google_protobuf_Empty,
    responseDeserialize: deserialize_google_protobuf_Empty,
  },
  getUserSignalHistory: {
    path: '/treum.signals.SignalsService/GetUserSignalHistory',
    requestStream: false,
    responseStream: false,
    requestType: signals_pb.GetUserSignalHistoryRequest,
    responseType: signals_pb.UserSignalHistoryResponse,
    requestSerialize: serialize_treum_signals_GetUserSignalHistoryRequest,
    requestDeserialize: deserialize_treum_signals_GetUserSignalHistoryRequest,
    responseSerialize: serialize_treum_signals_UserSignalHistoryResponse,
    responseDeserialize: deserialize_treum_signals_UserSignalHistoryResponse,
  },
};

exports.SignalsServiceClient = grpc.makeGenericClientConstructor(SignalsServiceService, 'SignalsService');
