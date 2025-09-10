// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('@grpc/grpc-js');
var common_pb = require('./common_pb.js');
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

function serialize_treum_common_GetMetricsRequest(arg) {
  if (!(arg instanceof common_pb.GetMetricsRequest)) {
    throw new Error('Expected argument of type treum.common.GetMetricsRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_common_GetMetricsRequest(buffer_arg) {
  return common_pb.GetMetricsRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_common_GetMetricsResponse(arg) {
  if (!(arg instanceof common_pb.GetMetricsResponse)) {
    throw new Error('Expected argument of type treum.common.GetMetricsResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_common_GetMetricsResponse(buffer_arg) {
  return common_pb.GetMetricsResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_common_HealthCheckRequest(arg) {
  if (!(arg instanceof common_pb.HealthCheckRequest)) {
    throw new Error('Expected argument of type treum.common.HealthCheckRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_common_HealthCheckRequest(buffer_arg) {
  return common_pb.HealthCheckRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_common_HealthCheckResponse(arg) {
  if (!(arg instanceof common_pb.HealthCheckResponse)) {
    throw new Error('Expected argument of type treum.common.HealthCheckResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_common_HealthCheckResponse(buffer_arg) {
  return common_pb.HealthCheckResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_common_RecordMetricRequest(arg) {
  if (!(arg instanceof common_pb.RecordMetricRequest)) {
    throw new Error('Expected argument of type treum.common.RecordMetricRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_common_RecordMetricRequest(buffer_arg) {
  return common_pb.RecordMetricRequest.deserializeBinary(new Uint8Array(buffer_arg));
}


var HealthServiceService = exports.HealthServiceService = {
  check: {
    path: '/treum.common.HealthService/Check',
    requestStream: false,
    responseStream: false,
    requestType: common_pb.HealthCheckRequest,
    responseType: common_pb.HealthCheckResponse,
    requestSerialize: serialize_treum_common_HealthCheckRequest,
    requestDeserialize: deserialize_treum_common_HealthCheckRequest,
    responseSerialize: serialize_treum_common_HealthCheckResponse,
    responseDeserialize: deserialize_treum_common_HealthCheckResponse,
  },
  watch: {
    path: '/treum.common.HealthService/Watch',
    requestStream: false,
    responseStream: true,
    requestType: common_pb.HealthCheckRequest,
    responseType: common_pb.HealthCheckResponse,
    requestSerialize: serialize_treum_common_HealthCheckRequest,
    requestDeserialize: deserialize_treum_common_HealthCheckRequest,
    responseSerialize: serialize_treum_common_HealthCheckResponse,
    responseDeserialize: deserialize_treum_common_HealthCheckResponse,
  },
};

exports.HealthServiceClient = grpc.makeGenericClientConstructor(HealthServiceService, 'HealthService');
var MetricsServiceService = exports.MetricsServiceService = {
  recordMetric: {
    path: '/treum.common.MetricsService/RecordMetric',
    requestStream: false,
    responseStream: false,
    requestType: common_pb.RecordMetricRequest,
    responseType: google_protobuf_empty_pb.Empty,
    requestSerialize: serialize_treum_common_RecordMetricRequest,
    requestDeserialize: deserialize_treum_common_RecordMetricRequest,
    responseSerialize: serialize_google_protobuf_Empty,
    responseDeserialize: deserialize_google_protobuf_Empty,
  },
  getMetrics: {
    path: '/treum.common.MetricsService/GetMetrics',
    requestStream: false,
    responseStream: false,
    requestType: common_pb.GetMetricsRequest,
    responseType: common_pb.GetMetricsResponse,
    requestSerialize: serialize_treum_common_GetMetricsRequest,
    requestDeserialize: deserialize_treum_common_GetMetricsRequest,
    responseSerialize: serialize_treum_common_GetMetricsResponse,
    responseDeserialize: deserialize_treum_common_GetMetricsResponse,
  },
};

exports.MetricsServiceClient = grpc.makeGenericClientConstructor(MetricsServiceService, 'MetricsService');
