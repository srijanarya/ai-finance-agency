// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('@grpc/grpc-js');
var risk_pb = require('./risk_pb.js');
var google_protobuf_timestamp_pb = require('google-protobuf/google/protobuf/timestamp_pb.js');
var google_protobuf_empty_pb = require('google-protobuf/google/protobuf/empty_pb.js');

function serialize_treum_risk_AMLCheckRequest(arg) {
  if (!(arg instanceof risk_pb.AMLCheckRequest)) {
    throw new Error('Expected argument of type treum.risk.AMLCheckRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_risk_AMLCheckRequest(buffer_arg) {
  return risk_pb.AMLCheckRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_risk_AcknowledgeAlertRequest(arg) {
  if (!(arg instanceof risk_pb.AcknowledgeAlertRequest)) {
    throw new Error('Expected argument of type treum.risk.AcknowledgeAlertRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_risk_AcknowledgeAlertRequest(buffer_arg) {
  return risk_pb.AcknowledgeAlertRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_risk_AssessTradeRiskRequest(arg) {
  if (!(arg instanceof risk_pb.AssessTradeRiskRequest)) {
    throw new Error('Expected argument of type treum.risk.AssessTradeRiskRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_risk_AssessTradeRiskRequest(buffer_arg) {
  return risk_pb.AssessTradeRiskRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_risk_CalculatePortfolioRiskRequest(arg) {
  if (!(arg instanceof risk_pb.CalculatePortfolioRiskRequest)) {
    throw new Error('Expected argument of type treum.risk.CalculatePortfolioRiskRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_risk_CalculatePortfolioRiskRequest(buffer_arg) {
  return risk_pb.CalculatePortfolioRiskRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_risk_CheckLimitBreachRequest(arg) {
  if (!(arg instanceof risk_pb.CheckLimitBreachRequest)) {
    throw new Error('Expected argument of type treum.risk.CheckLimitBreachRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_risk_CheckLimitBreachRequest(buffer_arg) {
  return risk_pb.CheckLimitBreachRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_risk_ComplianceCheckResponse(arg) {
  if (!(arg instanceof risk_pb.ComplianceCheckResponse)) {
    throw new Error('Expected argument of type treum.risk.ComplianceCheckResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_risk_ComplianceCheckResponse(buffer_arg) {
  return risk_pb.ComplianceCheckResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_risk_ComplianceStatusResponse(arg) {
  if (!(arg instanceof risk_pb.ComplianceStatusResponse)) {
    throw new Error('Expected argument of type treum.risk.ComplianceStatusResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_risk_ComplianceStatusResponse(buffer_arg) {
  return risk_pb.ComplianceStatusResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_risk_CreateRiskAlertRequest(arg) {
  if (!(arg instanceof risk_pb.CreateRiskAlertRequest)) {
    throw new Error('Expected argument of type treum.risk.CreateRiskAlertRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_risk_CreateRiskAlertRequest(buffer_arg) {
  return risk_pb.CreateRiskAlertRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_risk_CreateRiskLimitRequest(arg) {
  if (!(arg instanceof risk_pb.CreateRiskLimitRequest)) {
    throw new Error('Expected argument of type treum.risk.CreateRiskLimitRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_risk_CreateRiskLimitRequest(buffer_arg) {
  return risk_pb.CreateRiskLimitRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_risk_DetectFraudRequest(arg) {
  if (!(arg instanceof risk_pb.DetectFraudRequest)) {
    throw new Error('Expected argument of type treum.risk.DetectFraudRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_risk_DetectFraudRequest(buffer_arg) {
  return risk_pb.DetectFraudRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_risk_FraudDetectionResponse(arg) {
  if (!(arg instanceof risk_pb.FraudDetectionResponse)) {
    throw new Error('Expected argument of type treum.risk.FraudDetectionResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_risk_FraudDetectionResponse(buffer_arg) {
  return risk_pb.FraudDetectionResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_risk_FraudScoreResponse(arg) {
  if (!(arg instanceof risk_pb.FraudScoreResponse)) {
    throw new Error('Expected argument of type treum.risk.FraudScoreResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_risk_FraudScoreResponse(buffer_arg) {
  return risk_pb.FraudScoreResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_risk_GetActiveAlertsRequest(arg) {
  if (!(arg instanceof risk_pb.GetActiveAlertsRequest)) {
    throw new Error('Expected argument of type treum.risk.GetActiveAlertsRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_risk_GetActiveAlertsRequest(buffer_arg) {
  return risk_pb.GetActiveAlertsRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_risk_GetComplianceStatusRequest(arg) {
  if (!(arg instanceof risk_pb.GetComplianceStatusRequest)) {
    throw new Error('Expected argument of type treum.risk.GetComplianceStatusRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_risk_GetComplianceStatusRequest(buffer_arg) {
  return risk_pb.GetComplianceStatusRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_risk_GetFraudScoreRequest(arg) {
  if (!(arg instanceof risk_pb.GetFraudScoreRequest)) {
    throw new Error('Expected argument of type treum.risk.GetFraudScoreRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_risk_GetFraudScoreRequest(buffer_arg) {
  return risk_pb.GetFraudScoreRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_risk_GetRiskAssessmentRequest(arg) {
  if (!(arg instanceof risk_pb.GetRiskAssessmentRequest)) {
    throw new Error('Expected argument of type treum.risk.GetRiskAssessmentRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_risk_GetRiskAssessmentRequest(buffer_arg) {
  return risk_pb.GetRiskAssessmentRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_risk_GetRiskLimitsRequest(arg) {
  if (!(arg instanceof risk_pb.GetRiskLimitsRequest)) {
    throw new Error('Expected argument of type treum.risk.GetRiskLimitsRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_risk_GetRiskLimitsRequest(buffer_arg) {
  return risk_pb.GetRiskLimitsRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_risk_GetRiskMetricsRequest(arg) {
  if (!(arg instanceof risk_pb.GetRiskMetricsRequest)) {
    throw new Error('Expected argument of type treum.risk.GetRiskMetricsRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_risk_GetRiskMetricsRequest(buffer_arg) {
  return risk_pb.GetRiskMetricsRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_risk_KYCCheckRequest(arg) {
  if (!(arg instanceof risk_pb.KYCCheckRequest)) {
    throw new Error('Expected argument of type treum.risk.KYCCheckRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_risk_KYCCheckRequest(buffer_arg) {
  return risk_pb.KYCCheckRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_risk_LimitBreachResponse(arg) {
  if (!(arg instanceof risk_pb.LimitBreachResponse)) {
    throw new Error('Expected argument of type treum.risk.LimitBreachResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_risk_LimitBreachResponse(buffer_arg) {
  return risk_pb.LimitBreachResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_risk_ListRiskAlertsResponse(arg) {
  if (!(arg instanceof risk_pb.ListRiskAlertsResponse)) {
    throw new Error('Expected argument of type treum.risk.ListRiskAlertsResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_risk_ListRiskAlertsResponse(buffer_arg) {
  return risk_pb.ListRiskAlertsResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_risk_ListRiskAssessmentsRequest(arg) {
  if (!(arg instanceof risk_pb.ListRiskAssessmentsRequest)) {
    throw new Error('Expected argument of type treum.risk.ListRiskAssessmentsRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_risk_ListRiskAssessmentsRequest(buffer_arg) {
  return risk_pb.ListRiskAssessmentsRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_risk_ListRiskAssessmentsResponse(arg) {
  if (!(arg instanceof risk_pb.ListRiskAssessmentsResponse)) {
    throw new Error('Expected argument of type treum.risk.ListRiskAssessmentsResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_risk_ListRiskAssessmentsResponse(buffer_arg) {
  return risk_pb.ListRiskAssessmentsResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_risk_ListRiskLimitsResponse(arg) {
  if (!(arg instanceof risk_pb.ListRiskLimitsResponse)) {
    throw new Error('Expected argument of type treum.risk.ListRiskLimitsResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_risk_ListRiskLimitsResponse(buffer_arg) {
  return risk_pb.ListRiskLimitsResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_risk_ListRiskMetricsRequest(arg) {
  if (!(arg instanceof risk_pb.ListRiskMetricsRequest)) {
    throw new Error('Expected argument of type treum.risk.ListRiskMetricsRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_risk_ListRiskMetricsRequest(buffer_arg) {
  return risk_pb.ListRiskMetricsRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_risk_ListRiskMetricsResponse(arg) {
  if (!(arg instanceof risk_pb.ListRiskMetricsResponse)) {
    throw new Error('Expected argument of type treum.risk.ListRiskMetricsResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_risk_ListRiskMetricsResponse(buffer_arg) {
  return risk_pb.ListRiskMetricsResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_risk_PortfolioRiskResponse(arg) {
  if (!(arg instanceof risk_pb.PortfolioRiskResponse)) {
    throw new Error('Expected argument of type treum.risk.PortfolioRiskResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_risk_PortfolioRiskResponse(buffer_arg) {
  return risk_pb.PortfolioRiskResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_risk_ResolveAlertRequest(arg) {
  if (!(arg instanceof risk_pb.ResolveAlertRequest)) {
    throw new Error('Expected argument of type treum.risk.ResolveAlertRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_risk_ResolveAlertRequest(buffer_arg) {
  return risk_pb.ResolveAlertRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_risk_RiskAlertResponse(arg) {
  if (!(arg instanceof risk_pb.RiskAlertResponse)) {
    throw new Error('Expected argument of type treum.risk.RiskAlertResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_risk_RiskAlertResponse(buffer_arg) {
  return risk_pb.RiskAlertResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_risk_RiskAssessmentResponse(arg) {
  if (!(arg instanceof risk_pb.RiskAssessmentResponse)) {
    throw new Error('Expected argument of type treum.risk.RiskAssessmentResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_risk_RiskAssessmentResponse(buffer_arg) {
  return risk_pb.RiskAssessmentResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_risk_RiskLimitResponse(arg) {
  if (!(arg instanceof risk_pb.RiskLimitResponse)) {
    throw new Error('Expected argument of type treum.risk.RiskLimitResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_risk_RiskLimitResponse(buffer_arg) {
  return risk_pb.RiskLimitResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_risk_RiskMetricsResponse(arg) {
  if (!(arg instanceof risk_pb.RiskMetricsResponse)) {
    throw new Error('Expected argument of type treum.risk.RiskMetricsResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_risk_RiskMetricsResponse(buffer_arg) {
  return risk_pb.RiskMetricsResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_risk_TradeComplianceCheckRequest(arg) {
  if (!(arg instanceof risk_pb.TradeComplianceCheckRequest)) {
    throw new Error('Expected argument of type treum.risk.TradeComplianceCheckRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_risk_TradeComplianceCheckRequest(buffer_arg) {
  return risk_pb.TradeComplianceCheckRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_risk_TradeRiskResponse(arg) {
  if (!(arg instanceof risk_pb.TradeRiskResponse)) {
    throw new Error('Expected argument of type treum.risk.TradeRiskResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_risk_TradeRiskResponse(buffer_arg) {
  return risk_pb.TradeRiskResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_risk_UpdateRiskLimitRequest(arg) {
  if (!(arg instanceof risk_pb.UpdateRiskLimitRequest)) {
    throw new Error('Expected argument of type treum.risk.UpdateRiskLimitRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_risk_UpdateRiskLimitRequest(buffer_arg) {
  return risk_pb.UpdateRiskLimitRequest.deserializeBinary(new Uint8Array(buffer_arg));
}


// Risk Management Service
var RiskManagementServiceService = exports.RiskManagementServiceService = {
  // Risk Assessment
assessTradeRisk: {
    path: '/treum.risk.RiskManagementService/AssessTradeRisk',
    requestStream: false,
    responseStream: false,
    requestType: risk_pb.AssessTradeRiskRequest,
    responseType: risk_pb.TradeRiskResponse,
    requestSerialize: serialize_treum_risk_AssessTradeRiskRequest,
    requestDeserialize: deserialize_treum_risk_AssessTradeRiskRequest,
    responseSerialize: serialize_treum_risk_TradeRiskResponse,
    responseDeserialize: deserialize_treum_risk_TradeRiskResponse,
  },
  calculatePortfolioRisk: {
    path: '/treum.risk.RiskManagementService/CalculatePortfolioRisk',
    requestStream: false,
    responseStream: false,
    requestType: risk_pb.CalculatePortfolioRiskRequest,
    responseType: risk_pb.PortfolioRiskResponse,
    requestSerialize: serialize_treum_risk_CalculatePortfolioRiskRequest,
    requestDeserialize: deserialize_treum_risk_CalculatePortfolioRiskRequest,
    responseSerialize: serialize_treum_risk_PortfolioRiskResponse,
    responseDeserialize: deserialize_treum_risk_PortfolioRiskResponse,
  },
  getRiskAssessment: {
    path: '/treum.risk.RiskManagementService/GetRiskAssessment',
    requestStream: false,
    responseStream: false,
    requestType: risk_pb.GetRiskAssessmentRequest,
    responseType: risk_pb.RiskAssessmentResponse,
    requestSerialize: serialize_treum_risk_GetRiskAssessmentRequest,
    requestDeserialize: deserialize_treum_risk_GetRiskAssessmentRequest,
    responseSerialize: serialize_treum_risk_RiskAssessmentResponse,
    responseDeserialize: deserialize_treum_risk_RiskAssessmentResponse,
  },
  listRiskAssessments: {
    path: '/treum.risk.RiskManagementService/ListRiskAssessments',
    requestStream: false,
    responseStream: false,
    requestType: risk_pb.ListRiskAssessmentsRequest,
    responseType: risk_pb.ListRiskAssessmentsResponse,
    requestSerialize: serialize_treum_risk_ListRiskAssessmentsRequest,
    requestDeserialize: deserialize_treum_risk_ListRiskAssessmentsRequest,
    responseSerialize: serialize_treum_risk_ListRiskAssessmentsResponse,
    responseDeserialize: deserialize_treum_risk_ListRiskAssessmentsResponse,
  },
  // Compliance
performKYCCheck: {
    path: '/treum.risk.RiskManagementService/PerformKYCCheck',
    requestStream: false,
    responseStream: false,
    requestType: risk_pb.KYCCheckRequest,
    responseType: risk_pb.ComplianceCheckResponse,
    requestSerialize: serialize_treum_risk_KYCCheckRequest,
    requestDeserialize: deserialize_treum_risk_KYCCheckRequest,
    responseSerialize: serialize_treum_risk_ComplianceCheckResponse,
    responseDeserialize: deserialize_treum_risk_ComplianceCheckResponse,
  },
  performAMLCheck: {
    path: '/treum.risk.RiskManagementService/PerformAMLCheck',
    requestStream: false,
    responseStream: false,
    requestType: risk_pb.AMLCheckRequest,
    responseType: risk_pb.ComplianceCheckResponse,
    requestSerialize: serialize_treum_risk_AMLCheckRequest,
    requestDeserialize: deserialize_treum_risk_AMLCheckRequest,
    responseSerialize: serialize_treum_risk_ComplianceCheckResponse,
    responseDeserialize: deserialize_treum_risk_ComplianceCheckResponse,
  },
  performTradeComplianceCheck: {
    path: '/treum.risk.RiskManagementService/PerformTradeComplianceCheck',
    requestStream: false,
    responseStream: false,
    requestType: risk_pb.TradeComplianceCheckRequest,
    responseType: risk_pb.ComplianceCheckResponse,
    requestSerialize: serialize_treum_risk_TradeComplianceCheckRequest,
    requestDeserialize: deserialize_treum_risk_TradeComplianceCheckRequest,
    responseSerialize: serialize_treum_risk_ComplianceCheckResponse,
    responseDeserialize: deserialize_treum_risk_ComplianceCheckResponse,
  },
  getComplianceStatus: {
    path: '/treum.risk.RiskManagementService/GetComplianceStatus',
    requestStream: false,
    responseStream: false,
    requestType: risk_pb.GetComplianceStatusRequest,
    responseType: risk_pb.ComplianceStatusResponse,
    requestSerialize: serialize_treum_risk_GetComplianceStatusRequest,
    requestDeserialize: deserialize_treum_risk_GetComplianceStatusRequest,
    responseSerialize: serialize_treum_risk_ComplianceStatusResponse,
    responseDeserialize: deserialize_treum_risk_ComplianceStatusResponse,
  },
  // Risk Alerts
createRiskAlert: {
    path: '/treum.risk.RiskManagementService/CreateRiskAlert',
    requestStream: false,
    responseStream: false,
    requestType: risk_pb.CreateRiskAlertRequest,
    responseType: risk_pb.RiskAlertResponse,
    requestSerialize: serialize_treum_risk_CreateRiskAlertRequest,
    requestDeserialize: deserialize_treum_risk_CreateRiskAlertRequest,
    responseSerialize: serialize_treum_risk_RiskAlertResponse,
    responseDeserialize: deserialize_treum_risk_RiskAlertResponse,
  },
  getActiveAlerts: {
    path: '/treum.risk.RiskManagementService/GetActiveAlerts',
    requestStream: false,
    responseStream: false,
    requestType: risk_pb.GetActiveAlertsRequest,
    responseType: risk_pb.ListRiskAlertsResponse,
    requestSerialize: serialize_treum_risk_GetActiveAlertsRequest,
    requestDeserialize: deserialize_treum_risk_GetActiveAlertsRequest,
    responseSerialize: serialize_treum_risk_ListRiskAlertsResponse,
    responseDeserialize: deserialize_treum_risk_ListRiskAlertsResponse,
  },
  acknowledgeAlert: {
    path: '/treum.risk.RiskManagementService/AcknowledgeAlert',
    requestStream: false,
    responseStream: false,
    requestType: risk_pb.AcknowledgeAlertRequest,
    responseType: risk_pb.RiskAlertResponse,
    requestSerialize: serialize_treum_risk_AcknowledgeAlertRequest,
    requestDeserialize: deserialize_treum_risk_AcknowledgeAlertRequest,
    responseSerialize: serialize_treum_risk_RiskAlertResponse,
    responseDeserialize: deserialize_treum_risk_RiskAlertResponse,
  },
  resolveAlert: {
    path: '/treum.risk.RiskManagementService/ResolveAlert',
    requestStream: false,
    responseStream: false,
    requestType: risk_pb.ResolveAlertRequest,
    responseType: risk_pb.RiskAlertResponse,
    requestSerialize: serialize_treum_risk_ResolveAlertRequest,
    requestDeserialize: deserialize_treum_risk_ResolveAlertRequest,
    responseSerialize: serialize_treum_risk_RiskAlertResponse,
    responseDeserialize: deserialize_treum_risk_RiskAlertResponse,
  },
  // Risk Limits
createRiskLimit: {
    path: '/treum.risk.RiskManagementService/CreateRiskLimit',
    requestStream: false,
    responseStream: false,
    requestType: risk_pb.CreateRiskLimitRequest,
    responseType: risk_pb.RiskLimitResponse,
    requestSerialize: serialize_treum_risk_CreateRiskLimitRequest,
    requestDeserialize: deserialize_treum_risk_CreateRiskLimitRequest,
    responseSerialize: serialize_treum_risk_RiskLimitResponse,
    responseDeserialize: deserialize_treum_risk_RiskLimitResponse,
  },
  updateRiskLimit: {
    path: '/treum.risk.RiskManagementService/UpdateRiskLimit',
    requestStream: false,
    responseStream: false,
    requestType: risk_pb.UpdateRiskLimitRequest,
    responseType: risk_pb.RiskLimitResponse,
    requestSerialize: serialize_treum_risk_UpdateRiskLimitRequest,
    requestDeserialize: deserialize_treum_risk_UpdateRiskLimitRequest,
    responseSerialize: serialize_treum_risk_RiskLimitResponse,
    responseDeserialize: deserialize_treum_risk_RiskLimitResponse,
  },
  getRiskLimits: {
    path: '/treum.risk.RiskManagementService/GetRiskLimits',
    requestStream: false,
    responseStream: false,
    requestType: risk_pb.GetRiskLimitsRequest,
    responseType: risk_pb.ListRiskLimitsResponse,
    requestSerialize: serialize_treum_risk_GetRiskLimitsRequest,
    requestDeserialize: deserialize_treum_risk_GetRiskLimitsRequest,
    responseSerialize: serialize_treum_risk_ListRiskLimitsResponse,
    responseDeserialize: deserialize_treum_risk_ListRiskLimitsResponse,
  },
  checkLimitBreach: {
    path: '/treum.risk.RiskManagementService/CheckLimitBreach',
    requestStream: false,
    responseStream: false,
    requestType: risk_pb.CheckLimitBreachRequest,
    responseType: risk_pb.LimitBreachResponse,
    requestSerialize: serialize_treum_risk_CheckLimitBreachRequest,
    requestDeserialize: deserialize_treum_risk_CheckLimitBreachRequest,
    responseSerialize: serialize_treum_risk_LimitBreachResponse,
    responseDeserialize: deserialize_treum_risk_LimitBreachResponse,
  },
  // Fraud Detection
detectFraud: {
    path: '/treum.risk.RiskManagementService/DetectFraud',
    requestStream: false,
    responseStream: false,
    requestType: risk_pb.DetectFraudRequest,
    responseType: risk_pb.FraudDetectionResponse,
    requestSerialize: serialize_treum_risk_DetectFraudRequest,
    requestDeserialize: deserialize_treum_risk_DetectFraudRequest,
    responseSerialize: serialize_treum_risk_FraudDetectionResponse,
    responseDeserialize: deserialize_treum_risk_FraudDetectionResponse,
  },
  getFraudScore: {
    path: '/treum.risk.RiskManagementService/GetFraudScore',
    requestStream: false,
    responseStream: false,
    requestType: risk_pb.GetFraudScoreRequest,
    responseType: risk_pb.FraudScoreResponse,
    requestSerialize: serialize_treum_risk_GetFraudScoreRequest,
    requestDeserialize: deserialize_treum_risk_GetFraudScoreRequest,
    responseSerialize: serialize_treum_risk_FraudScoreResponse,
    responseDeserialize: deserialize_treum_risk_FraudScoreResponse,
  },
  // Risk Metrics
getRiskMetrics: {
    path: '/treum.risk.RiskManagementService/GetRiskMetrics',
    requestStream: false,
    responseStream: false,
    requestType: risk_pb.GetRiskMetricsRequest,
    responseType: risk_pb.RiskMetricsResponse,
    requestSerialize: serialize_treum_risk_GetRiskMetricsRequest,
    requestDeserialize: deserialize_treum_risk_GetRiskMetricsRequest,
    responseSerialize: serialize_treum_risk_RiskMetricsResponse,
    responseDeserialize: deserialize_treum_risk_RiskMetricsResponse,
  },
  listRiskMetrics: {
    path: '/treum.risk.RiskManagementService/ListRiskMetrics',
    requestStream: false,
    responseStream: false,
    requestType: risk_pb.ListRiskMetricsRequest,
    responseType: risk_pb.ListRiskMetricsResponse,
    requestSerialize: serialize_treum_risk_ListRiskMetricsRequest,
    requestDeserialize: deserialize_treum_risk_ListRiskMetricsRequest,
    responseSerialize: serialize_treum_risk_ListRiskMetricsResponse,
    responseDeserialize: deserialize_treum_risk_ListRiskMetricsResponse,
  },
};

exports.RiskManagementServiceClient = grpc.makeGenericClientConstructor(RiskManagementServiceService, 'RiskManagementService');
