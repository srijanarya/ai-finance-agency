// package: treum.risk
// file: risk.proto

/* tslint:disable */
/* eslint-disable */

import * as grpc from "@grpc/grpc-js";
import * as risk_pb from "./risk_pb";
import * as google_protobuf_timestamp_pb from "google-protobuf/google/protobuf/timestamp_pb";
import * as google_protobuf_empty_pb from "google-protobuf/google/protobuf/empty_pb";

interface IRiskManagementServiceService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
    assessTradeRisk: IRiskManagementServiceService_IAssessTradeRisk;
    calculatePortfolioRisk: IRiskManagementServiceService_ICalculatePortfolioRisk;
    getRiskAssessment: IRiskManagementServiceService_IGetRiskAssessment;
    listRiskAssessments: IRiskManagementServiceService_IListRiskAssessments;
    performKYCCheck: IRiskManagementServiceService_IPerformKYCCheck;
    performAMLCheck: IRiskManagementServiceService_IPerformAMLCheck;
    performTradeComplianceCheck: IRiskManagementServiceService_IPerformTradeComplianceCheck;
    getComplianceStatus: IRiskManagementServiceService_IGetComplianceStatus;
    createRiskAlert: IRiskManagementServiceService_ICreateRiskAlert;
    getActiveAlerts: IRiskManagementServiceService_IGetActiveAlerts;
    acknowledgeAlert: IRiskManagementServiceService_IAcknowledgeAlert;
    resolveAlert: IRiskManagementServiceService_IResolveAlert;
    createRiskLimit: IRiskManagementServiceService_ICreateRiskLimit;
    updateRiskLimit: IRiskManagementServiceService_IUpdateRiskLimit;
    getRiskLimits: IRiskManagementServiceService_IGetRiskLimits;
    checkLimitBreach: IRiskManagementServiceService_ICheckLimitBreach;
    detectFraud: IRiskManagementServiceService_IDetectFraud;
    getFraudScore: IRiskManagementServiceService_IGetFraudScore;
    getRiskMetrics: IRiskManagementServiceService_IGetRiskMetrics;
    listRiskMetrics: IRiskManagementServiceService_IListRiskMetrics;
}

interface IRiskManagementServiceService_IAssessTradeRisk extends grpc.MethodDefinition<risk_pb.AssessTradeRiskRequest, risk_pb.TradeRiskResponse> {
    path: "/treum.risk.RiskManagementService/AssessTradeRisk";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<risk_pb.AssessTradeRiskRequest>;
    requestDeserialize: grpc.deserialize<risk_pb.AssessTradeRiskRequest>;
    responseSerialize: grpc.serialize<risk_pb.TradeRiskResponse>;
    responseDeserialize: grpc.deserialize<risk_pb.TradeRiskResponse>;
}
interface IRiskManagementServiceService_ICalculatePortfolioRisk extends grpc.MethodDefinition<risk_pb.CalculatePortfolioRiskRequest, risk_pb.PortfolioRiskResponse> {
    path: "/treum.risk.RiskManagementService/CalculatePortfolioRisk";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<risk_pb.CalculatePortfolioRiskRequest>;
    requestDeserialize: grpc.deserialize<risk_pb.CalculatePortfolioRiskRequest>;
    responseSerialize: grpc.serialize<risk_pb.PortfolioRiskResponse>;
    responseDeserialize: grpc.deserialize<risk_pb.PortfolioRiskResponse>;
}
interface IRiskManagementServiceService_IGetRiskAssessment extends grpc.MethodDefinition<risk_pb.GetRiskAssessmentRequest, risk_pb.RiskAssessmentResponse> {
    path: "/treum.risk.RiskManagementService/GetRiskAssessment";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<risk_pb.GetRiskAssessmentRequest>;
    requestDeserialize: grpc.deserialize<risk_pb.GetRiskAssessmentRequest>;
    responseSerialize: grpc.serialize<risk_pb.RiskAssessmentResponse>;
    responseDeserialize: grpc.deserialize<risk_pb.RiskAssessmentResponse>;
}
interface IRiskManagementServiceService_IListRiskAssessments extends grpc.MethodDefinition<risk_pb.ListRiskAssessmentsRequest, risk_pb.ListRiskAssessmentsResponse> {
    path: "/treum.risk.RiskManagementService/ListRiskAssessments";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<risk_pb.ListRiskAssessmentsRequest>;
    requestDeserialize: grpc.deserialize<risk_pb.ListRiskAssessmentsRequest>;
    responseSerialize: grpc.serialize<risk_pb.ListRiskAssessmentsResponse>;
    responseDeserialize: grpc.deserialize<risk_pb.ListRiskAssessmentsResponse>;
}
interface IRiskManagementServiceService_IPerformKYCCheck extends grpc.MethodDefinition<risk_pb.KYCCheckRequest, risk_pb.ComplianceCheckResponse> {
    path: "/treum.risk.RiskManagementService/PerformKYCCheck";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<risk_pb.KYCCheckRequest>;
    requestDeserialize: grpc.deserialize<risk_pb.KYCCheckRequest>;
    responseSerialize: grpc.serialize<risk_pb.ComplianceCheckResponse>;
    responseDeserialize: grpc.deserialize<risk_pb.ComplianceCheckResponse>;
}
interface IRiskManagementServiceService_IPerformAMLCheck extends grpc.MethodDefinition<risk_pb.AMLCheckRequest, risk_pb.ComplianceCheckResponse> {
    path: "/treum.risk.RiskManagementService/PerformAMLCheck";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<risk_pb.AMLCheckRequest>;
    requestDeserialize: grpc.deserialize<risk_pb.AMLCheckRequest>;
    responseSerialize: grpc.serialize<risk_pb.ComplianceCheckResponse>;
    responseDeserialize: grpc.deserialize<risk_pb.ComplianceCheckResponse>;
}
interface IRiskManagementServiceService_IPerformTradeComplianceCheck extends grpc.MethodDefinition<risk_pb.TradeComplianceCheckRequest, risk_pb.ComplianceCheckResponse> {
    path: "/treum.risk.RiskManagementService/PerformTradeComplianceCheck";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<risk_pb.TradeComplianceCheckRequest>;
    requestDeserialize: grpc.deserialize<risk_pb.TradeComplianceCheckRequest>;
    responseSerialize: grpc.serialize<risk_pb.ComplianceCheckResponse>;
    responseDeserialize: grpc.deserialize<risk_pb.ComplianceCheckResponse>;
}
interface IRiskManagementServiceService_IGetComplianceStatus extends grpc.MethodDefinition<risk_pb.GetComplianceStatusRequest, risk_pb.ComplianceStatusResponse> {
    path: "/treum.risk.RiskManagementService/GetComplianceStatus";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<risk_pb.GetComplianceStatusRequest>;
    requestDeserialize: grpc.deserialize<risk_pb.GetComplianceStatusRequest>;
    responseSerialize: grpc.serialize<risk_pb.ComplianceStatusResponse>;
    responseDeserialize: grpc.deserialize<risk_pb.ComplianceStatusResponse>;
}
interface IRiskManagementServiceService_ICreateRiskAlert extends grpc.MethodDefinition<risk_pb.CreateRiskAlertRequest, risk_pb.RiskAlertResponse> {
    path: "/treum.risk.RiskManagementService/CreateRiskAlert";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<risk_pb.CreateRiskAlertRequest>;
    requestDeserialize: grpc.deserialize<risk_pb.CreateRiskAlertRequest>;
    responseSerialize: grpc.serialize<risk_pb.RiskAlertResponse>;
    responseDeserialize: grpc.deserialize<risk_pb.RiskAlertResponse>;
}
interface IRiskManagementServiceService_IGetActiveAlerts extends grpc.MethodDefinition<risk_pb.GetActiveAlertsRequest, risk_pb.ListRiskAlertsResponse> {
    path: "/treum.risk.RiskManagementService/GetActiveAlerts";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<risk_pb.GetActiveAlertsRequest>;
    requestDeserialize: grpc.deserialize<risk_pb.GetActiveAlertsRequest>;
    responseSerialize: grpc.serialize<risk_pb.ListRiskAlertsResponse>;
    responseDeserialize: grpc.deserialize<risk_pb.ListRiskAlertsResponse>;
}
interface IRiskManagementServiceService_IAcknowledgeAlert extends grpc.MethodDefinition<risk_pb.AcknowledgeAlertRequest, risk_pb.RiskAlertResponse> {
    path: "/treum.risk.RiskManagementService/AcknowledgeAlert";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<risk_pb.AcknowledgeAlertRequest>;
    requestDeserialize: grpc.deserialize<risk_pb.AcknowledgeAlertRequest>;
    responseSerialize: grpc.serialize<risk_pb.RiskAlertResponse>;
    responseDeserialize: grpc.deserialize<risk_pb.RiskAlertResponse>;
}
interface IRiskManagementServiceService_IResolveAlert extends grpc.MethodDefinition<risk_pb.ResolveAlertRequest, risk_pb.RiskAlertResponse> {
    path: "/treum.risk.RiskManagementService/ResolveAlert";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<risk_pb.ResolveAlertRequest>;
    requestDeserialize: grpc.deserialize<risk_pb.ResolveAlertRequest>;
    responseSerialize: grpc.serialize<risk_pb.RiskAlertResponse>;
    responseDeserialize: grpc.deserialize<risk_pb.RiskAlertResponse>;
}
interface IRiskManagementServiceService_ICreateRiskLimit extends grpc.MethodDefinition<risk_pb.CreateRiskLimitRequest, risk_pb.RiskLimitResponse> {
    path: "/treum.risk.RiskManagementService/CreateRiskLimit";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<risk_pb.CreateRiskLimitRequest>;
    requestDeserialize: grpc.deserialize<risk_pb.CreateRiskLimitRequest>;
    responseSerialize: grpc.serialize<risk_pb.RiskLimitResponse>;
    responseDeserialize: grpc.deserialize<risk_pb.RiskLimitResponse>;
}
interface IRiskManagementServiceService_IUpdateRiskLimit extends grpc.MethodDefinition<risk_pb.UpdateRiskLimitRequest, risk_pb.RiskLimitResponse> {
    path: "/treum.risk.RiskManagementService/UpdateRiskLimit";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<risk_pb.UpdateRiskLimitRequest>;
    requestDeserialize: grpc.deserialize<risk_pb.UpdateRiskLimitRequest>;
    responseSerialize: grpc.serialize<risk_pb.RiskLimitResponse>;
    responseDeserialize: grpc.deserialize<risk_pb.RiskLimitResponse>;
}
interface IRiskManagementServiceService_IGetRiskLimits extends grpc.MethodDefinition<risk_pb.GetRiskLimitsRequest, risk_pb.ListRiskLimitsResponse> {
    path: "/treum.risk.RiskManagementService/GetRiskLimits";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<risk_pb.GetRiskLimitsRequest>;
    requestDeserialize: grpc.deserialize<risk_pb.GetRiskLimitsRequest>;
    responseSerialize: grpc.serialize<risk_pb.ListRiskLimitsResponse>;
    responseDeserialize: grpc.deserialize<risk_pb.ListRiskLimitsResponse>;
}
interface IRiskManagementServiceService_ICheckLimitBreach extends grpc.MethodDefinition<risk_pb.CheckLimitBreachRequest, risk_pb.LimitBreachResponse> {
    path: "/treum.risk.RiskManagementService/CheckLimitBreach";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<risk_pb.CheckLimitBreachRequest>;
    requestDeserialize: grpc.deserialize<risk_pb.CheckLimitBreachRequest>;
    responseSerialize: grpc.serialize<risk_pb.LimitBreachResponse>;
    responseDeserialize: grpc.deserialize<risk_pb.LimitBreachResponse>;
}
interface IRiskManagementServiceService_IDetectFraud extends grpc.MethodDefinition<risk_pb.DetectFraudRequest, risk_pb.FraudDetectionResponse> {
    path: "/treum.risk.RiskManagementService/DetectFraud";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<risk_pb.DetectFraudRequest>;
    requestDeserialize: grpc.deserialize<risk_pb.DetectFraudRequest>;
    responseSerialize: grpc.serialize<risk_pb.FraudDetectionResponse>;
    responseDeserialize: grpc.deserialize<risk_pb.FraudDetectionResponse>;
}
interface IRiskManagementServiceService_IGetFraudScore extends grpc.MethodDefinition<risk_pb.GetFraudScoreRequest, risk_pb.FraudScoreResponse> {
    path: "/treum.risk.RiskManagementService/GetFraudScore";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<risk_pb.GetFraudScoreRequest>;
    requestDeserialize: grpc.deserialize<risk_pb.GetFraudScoreRequest>;
    responseSerialize: grpc.serialize<risk_pb.FraudScoreResponse>;
    responseDeserialize: grpc.deserialize<risk_pb.FraudScoreResponse>;
}
interface IRiskManagementServiceService_IGetRiskMetrics extends grpc.MethodDefinition<risk_pb.GetRiskMetricsRequest, risk_pb.RiskMetricsResponse> {
    path: "/treum.risk.RiskManagementService/GetRiskMetrics";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<risk_pb.GetRiskMetricsRequest>;
    requestDeserialize: grpc.deserialize<risk_pb.GetRiskMetricsRequest>;
    responseSerialize: grpc.serialize<risk_pb.RiskMetricsResponse>;
    responseDeserialize: grpc.deserialize<risk_pb.RiskMetricsResponse>;
}
interface IRiskManagementServiceService_IListRiskMetrics extends grpc.MethodDefinition<risk_pb.ListRiskMetricsRequest, risk_pb.ListRiskMetricsResponse> {
    path: "/treum.risk.RiskManagementService/ListRiskMetrics";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<risk_pb.ListRiskMetricsRequest>;
    requestDeserialize: grpc.deserialize<risk_pb.ListRiskMetricsRequest>;
    responseSerialize: grpc.serialize<risk_pb.ListRiskMetricsResponse>;
    responseDeserialize: grpc.deserialize<risk_pb.ListRiskMetricsResponse>;
}

export const RiskManagementServiceService: IRiskManagementServiceService;

export interface IRiskManagementServiceServer extends grpc.UntypedServiceImplementation {
    assessTradeRisk: grpc.handleUnaryCall<risk_pb.AssessTradeRiskRequest, risk_pb.TradeRiskResponse>;
    calculatePortfolioRisk: grpc.handleUnaryCall<risk_pb.CalculatePortfolioRiskRequest, risk_pb.PortfolioRiskResponse>;
    getRiskAssessment: grpc.handleUnaryCall<risk_pb.GetRiskAssessmentRequest, risk_pb.RiskAssessmentResponse>;
    listRiskAssessments: grpc.handleUnaryCall<risk_pb.ListRiskAssessmentsRequest, risk_pb.ListRiskAssessmentsResponse>;
    performKYCCheck: grpc.handleUnaryCall<risk_pb.KYCCheckRequest, risk_pb.ComplianceCheckResponse>;
    performAMLCheck: grpc.handleUnaryCall<risk_pb.AMLCheckRequest, risk_pb.ComplianceCheckResponse>;
    performTradeComplianceCheck: grpc.handleUnaryCall<risk_pb.TradeComplianceCheckRequest, risk_pb.ComplianceCheckResponse>;
    getComplianceStatus: grpc.handleUnaryCall<risk_pb.GetComplianceStatusRequest, risk_pb.ComplianceStatusResponse>;
    createRiskAlert: grpc.handleUnaryCall<risk_pb.CreateRiskAlertRequest, risk_pb.RiskAlertResponse>;
    getActiveAlerts: grpc.handleUnaryCall<risk_pb.GetActiveAlertsRequest, risk_pb.ListRiskAlertsResponse>;
    acknowledgeAlert: grpc.handleUnaryCall<risk_pb.AcknowledgeAlertRequest, risk_pb.RiskAlertResponse>;
    resolveAlert: grpc.handleUnaryCall<risk_pb.ResolveAlertRequest, risk_pb.RiskAlertResponse>;
    createRiskLimit: grpc.handleUnaryCall<risk_pb.CreateRiskLimitRequest, risk_pb.RiskLimitResponse>;
    updateRiskLimit: grpc.handleUnaryCall<risk_pb.UpdateRiskLimitRequest, risk_pb.RiskLimitResponse>;
    getRiskLimits: grpc.handleUnaryCall<risk_pb.GetRiskLimitsRequest, risk_pb.ListRiskLimitsResponse>;
    checkLimitBreach: grpc.handleUnaryCall<risk_pb.CheckLimitBreachRequest, risk_pb.LimitBreachResponse>;
    detectFraud: grpc.handleUnaryCall<risk_pb.DetectFraudRequest, risk_pb.FraudDetectionResponse>;
    getFraudScore: grpc.handleUnaryCall<risk_pb.GetFraudScoreRequest, risk_pb.FraudScoreResponse>;
    getRiskMetrics: grpc.handleUnaryCall<risk_pb.GetRiskMetricsRequest, risk_pb.RiskMetricsResponse>;
    listRiskMetrics: grpc.handleUnaryCall<risk_pb.ListRiskMetricsRequest, risk_pb.ListRiskMetricsResponse>;
}

export interface IRiskManagementServiceClient {
    assessTradeRisk(request: risk_pb.AssessTradeRiskRequest, callback: (error: grpc.ServiceError | null, response: risk_pb.TradeRiskResponse) => void): grpc.ClientUnaryCall;
    assessTradeRisk(request: risk_pb.AssessTradeRiskRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: risk_pb.TradeRiskResponse) => void): grpc.ClientUnaryCall;
    assessTradeRisk(request: risk_pb.AssessTradeRiskRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: risk_pb.TradeRiskResponse) => void): grpc.ClientUnaryCall;
    calculatePortfolioRisk(request: risk_pb.CalculatePortfolioRiskRequest, callback: (error: grpc.ServiceError | null, response: risk_pb.PortfolioRiskResponse) => void): grpc.ClientUnaryCall;
    calculatePortfolioRisk(request: risk_pb.CalculatePortfolioRiskRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: risk_pb.PortfolioRiskResponse) => void): grpc.ClientUnaryCall;
    calculatePortfolioRisk(request: risk_pb.CalculatePortfolioRiskRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: risk_pb.PortfolioRiskResponse) => void): grpc.ClientUnaryCall;
    getRiskAssessment(request: risk_pb.GetRiskAssessmentRequest, callback: (error: grpc.ServiceError | null, response: risk_pb.RiskAssessmentResponse) => void): grpc.ClientUnaryCall;
    getRiskAssessment(request: risk_pb.GetRiskAssessmentRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: risk_pb.RiskAssessmentResponse) => void): grpc.ClientUnaryCall;
    getRiskAssessment(request: risk_pb.GetRiskAssessmentRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: risk_pb.RiskAssessmentResponse) => void): grpc.ClientUnaryCall;
    listRiskAssessments(request: risk_pb.ListRiskAssessmentsRequest, callback: (error: grpc.ServiceError | null, response: risk_pb.ListRiskAssessmentsResponse) => void): grpc.ClientUnaryCall;
    listRiskAssessments(request: risk_pb.ListRiskAssessmentsRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: risk_pb.ListRiskAssessmentsResponse) => void): grpc.ClientUnaryCall;
    listRiskAssessments(request: risk_pb.ListRiskAssessmentsRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: risk_pb.ListRiskAssessmentsResponse) => void): grpc.ClientUnaryCall;
    performKYCCheck(request: risk_pb.KYCCheckRequest, callback: (error: grpc.ServiceError | null, response: risk_pb.ComplianceCheckResponse) => void): grpc.ClientUnaryCall;
    performKYCCheck(request: risk_pb.KYCCheckRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: risk_pb.ComplianceCheckResponse) => void): grpc.ClientUnaryCall;
    performKYCCheck(request: risk_pb.KYCCheckRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: risk_pb.ComplianceCheckResponse) => void): grpc.ClientUnaryCall;
    performAMLCheck(request: risk_pb.AMLCheckRequest, callback: (error: grpc.ServiceError | null, response: risk_pb.ComplianceCheckResponse) => void): grpc.ClientUnaryCall;
    performAMLCheck(request: risk_pb.AMLCheckRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: risk_pb.ComplianceCheckResponse) => void): grpc.ClientUnaryCall;
    performAMLCheck(request: risk_pb.AMLCheckRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: risk_pb.ComplianceCheckResponse) => void): grpc.ClientUnaryCall;
    performTradeComplianceCheck(request: risk_pb.TradeComplianceCheckRequest, callback: (error: grpc.ServiceError | null, response: risk_pb.ComplianceCheckResponse) => void): grpc.ClientUnaryCall;
    performTradeComplianceCheck(request: risk_pb.TradeComplianceCheckRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: risk_pb.ComplianceCheckResponse) => void): grpc.ClientUnaryCall;
    performTradeComplianceCheck(request: risk_pb.TradeComplianceCheckRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: risk_pb.ComplianceCheckResponse) => void): grpc.ClientUnaryCall;
    getComplianceStatus(request: risk_pb.GetComplianceStatusRequest, callback: (error: grpc.ServiceError | null, response: risk_pb.ComplianceStatusResponse) => void): grpc.ClientUnaryCall;
    getComplianceStatus(request: risk_pb.GetComplianceStatusRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: risk_pb.ComplianceStatusResponse) => void): grpc.ClientUnaryCall;
    getComplianceStatus(request: risk_pb.GetComplianceStatusRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: risk_pb.ComplianceStatusResponse) => void): grpc.ClientUnaryCall;
    createRiskAlert(request: risk_pb.CreateRiskAlertRequest, callback: (error: grpc.ServiceError | null, response: risk_pb.RiskAlertResponse) => void): grpc.ClientUnaryCall;
    createRiskAlert(request: risk_pb.CreateRiskAlertRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: risk_pb.RiskAlertResponse) => void): grpc.ClientUnaryCall;
    createRiskAlert(request: risk_pb.CreateRiskAlertRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: risk_pb.RiskAlertResponse) => void): grpc.ClientUnaryCall;
    getActiveAlerts(request: risk_pb.GetActiveAlertsRequest, callback: (error: grpc.ServiceError | null, response: risk_pb.ListRiskAlertsResponse) => void): grpc.ClientUnaryCall;
    getActiveAlerts(request: risk_pb.GetActiveAlertsRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: risk_pb.ListRiskAlertsResponse) => void): grpc.ClientUnaryCall;
    getActiveAlerts(request: risk_pb.GetActiveAlertsRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: risk_pb.ListRiskAlertsResponse) => void): grpc.ClientUnaryCall;
    acknowledgeAlert(request: risk_pb.AcknowledgeAlertRequest, callback: (error: grpc.ServiceError | null, response: risk_pb.RiskAlertResponse) => void): grpc.ClientUnaryCall;
    acknowledgeAlert(request: risk_pb.AcknowledgeAlertRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: risk_pb.RiskAlertResponse) => void): grpc.ClientUnaryCall;
    acknowledgeAlert(request: risk_pb.AcknowledgeAlertRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: risk_pb.RiskAlertResponse) => void): grpc.ClientUnaryCall;
    resolveAlert(request: risk_pb.ResolveAlertRequest, callback: (error: grpc.ServiceError | null, response: risk_pb.RiskAlertResponse) => void): grpc.ClientUnaryCall;
    resolveAlert(request: risk_pb.ResolveAlertRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: risk_pb.RiskAlertResponse) => void): grpc.ClientUnaryCall;
    resolveAlert(request: risk_pb.ResolveAlertRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: risk_pb.RiskAlertResponse) => void): grpc.ClientUnaryCall;
    createRiskLimit(request: risk_pb.CreateRiskLimitRequest, callback: (error: grpc.ServiceError | null, response: risk_pb.RiskLimitResponse) => void): grpc.ClientUnaryCall;
    createRiskLimit(request: risk_pb.CreateRiskLimitRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: risk_pb.RiskLimitResponse) => void): grpc.ClientUnaryCall;
    createRiskLimit(request: risk_pb.CreateRiskLimitRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: risk_pb.RiskLimitResponse) => void): grpc.ClientUnaryCall;
    updateRiskLimit(request: risk_pb.UpdateRiskLimitRequest, callback: (error: grpc.ServiceError | null, response: risk_pb.RiskLimitResponse) => void): grpc.ClientUnaryCall;
    updateRiskLimit(request: risk_pb.UpdateRiskLimitRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: risk_pb.RiskLimitResponse) => void): grpc.ClientUnaryCall;
    updateRiskLimit(request: risk_pb.UpdateRiskLimitRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: risk_pb.RiskLimitResponse) => void): grpc.ClientUnaryCall;
    getRiskLimits(request: risk_pb.GetRiskLimitsRequest, callback: (error: grpc.ServiceError | null, response: risk_pb.ListRiskLimitsResponse) => void): grpc.ClientUnaryCall;
    getRiskLimits(request: risk_pb.GetRiskLimitsRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: risk_pb.ListRiskLimitsResponse) => void): grpc.ClientUnaryCall;
    getRiskLimits(request: risk_pb.GetRiskLimitsRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: risk_pb.ListRiskLimitsResponse) => void): grpc.ClientUnaryCall;
    checkLimitBreach(request: risk_pb.CheckLimitBreachRequest, callback: (error: grpc.ServiceError | null, response: risk_pb.LimitBreachResponse) => void): grpc.ClientUnaryCall;
    checkLimitBreach(request: risk_pb.CheckLimitBreachRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: risk_pb.LimitBreachResponse) => void): grpc.ClientUnaryCall;
    checkLimitBreach(request: risk_pb.CheckLimitBreachRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: risk_pb.LimitBreachResponse) => void): grpc.ClientUnaryCall;
    detectFraud(request: risk_pb.DetectFraudRequest, callback: (error: grpc.ServiceError | null, response: risk_pb.FraudDetectionResponse) => void): grpc.ClientUnaryCall;
    detectFraud(request: risk_pb.DetectFraudRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: risk_pb.FraudDetectionResponse) => void): grpc.ClientUnaryCall;
    detectFraud(request: risk_pb.DetectFraudRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: risk_pb.FraudDetectionResponse) => void): grpc.ClientUnaryCall;
    getFraudScore(request: risk_pb.GetFraudScoreRequest, callback: (error: grpc.ServiceError | null, response: risk_pb.FraudScoreResponse) => void): grpc.ClientUnaryCall;
    getFraudScore(request: risk_pb.GetFraudScoreRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: risk_pb.FraudScoreResponse) => void): grpc.ClientUnaryCall;
    getFraudScore(request: risk_pb.GetFraudScoreRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: risk_pb.FraudScoreResponse) => void): grpc.ClientUnaryCall;
    getRiskMetrics(request: risk_pb.GetRiskMetricsRequest, callback: (error: grpc.ServiceError | null, response: risk_pb.RiskMetricsResponse) => void): grpc.ClientUnaryCall;
    getRiskMetrics(request: risk_pb.GetRiskMetricsRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: risk_pb.RiskMetricsResponse) => void): grpc.ClientUnaryCall;
    getRiskMetrics(request: risk_pb.GetRiskMetricsRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: risk_pb.RiskMetricsResponse) => void): grpc.ClientUnaryCall;
    listRiskMetrics(request: risk_pb.ListRiskMetricsRequest, callback: (error: grpc.ServiceError | null, response: risk_pb.ListRiskMetricsResponse) => void): grpc.ClientUnaryCall;
    listRiskMetrics(request: risk_pb.ListRiskMetricsRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: risk_pb.ListRiskMetricsResponse) => void): grpc.ClientUnaryCall;
    listRiskMetrics(request: risk_pb.ListRiskMetricsRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: risk_pb.ListRiskMetricsResponse) => void): grpc.ClientUnaryCall;
}

export class RiskManagementServiceClient extends grpc.Client implements IRiskManagementServiceClient {
    constructor(address: string, credentials: grpc.ChannelCredentials, options?: Partial<grpc.ClientOptions>);
    public assessTradeRisk(request: risk_pb.AssessTradeRiskRequest, callback: (error: grpc.ServiceError | null, response: risk_pb.TradeRiskResponse) => void): grpc.ClientUnaryCall;
    public assessTradeRisk(request: risk_pb.AssessTradeRiskRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: risk_pb.TradeRiskResponse) => void): grpc.ClientUnaryCall;
    public assessTradeRisk(request: risk_pb.AssessTradeRiskRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: risk_pb.TradeRiskResponse) => void): grpc.ClientUnaryCall;
    public calculatePortfolioRisk(request: risk_pb.CalculatePortfolioRiskRequest, callback: (error: grpc.ServiceError | null, response: risk_pb.PortfolioRiskResponse) => void): grpc.ClientUnaryCall;
    public calculatePortfolioRisk(request: risk_pb.CalculatePortfolioRiskRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: risk_pb.PortfolioRiskResponse) => void): grpc.ClientUnaryCall;
    public calculatePortfolioRisk(request: risk_pb.CalculatePortfolioRiskRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: risk_pb.PortfolioRiskResponse) => void): grpc.ClientUnaryCall;
    public getRiskAssessment(request: risk_pb.GetRiskAssessmentRequest, callback: (error: grpc.ServiceError | null, response: risk_pb.RiskAssessmentResponse) => void): grpc.ClientUnaryCall;
    public getRiskAssessment(request: risk_pb.GetRiskAssessmentRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: risk_pb.RiskAssessmentResponse) => void): grpc.ClientUnaryCall;
    public getRiskAssessment(request: risk_pb.GetRiskAssessmentRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: risk_pb.RiskAssessmentResponse) => void): grpc.ClientUnaryCall;
    public listRiskAssessments(request: risk_pb.ListRiskAssessmentsRequest, callback: (error: grpc.ServiceError | null, response: risk_pb.ListRiskAssessmentsResponse) => void): grpc.ClientUnaryCall;
    public listRiskAssessments(request: risk_pb.ListRiskAssessmentsRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: risk_pb.ListRiskAssessmentsResponse) => void): grpc.ClientUnaryCall;
    public listRiskAssessments(request: risk_pb.ListRiskAssessmentsRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: risk_pb.ListRiskAssessmentsResponse) => void): grpc.ClientUnaryCall;
    public performKYCCheck(request: risk_pb.KYCCheckRequest, callback: (error: grpc.ServiceError | null, response: risk_pb.ComplianceCheckResponse) => void): grpc.ClientUnaryCall;
    public performKYCCheck(request: risk_pb.KYCCheckRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: risk_pb.ComplianceCheckResponse) => void): grpc.ClientUnaryCall;
    public performKYCCheck(request: risk_pb.KYCCheckRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: risk_pb.ComplianceCheckResponse) => void): grpc.ClientUnaryCall;
    public performAMLCheck(request: risk_pb.AMLCheckRequest, callback: (error: grpc.ServiceError | null, response: risk_pb.ComplianceCheckResponse) => void): grpc.ClientUnaryCall;
    public performAMLCheck(request: risk_pb.AMLCheckRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: risk_pb.ComplianceCheckResponse) => void): grpc.ClientUnaryCall;
    public performAMLCheck(request: risk_pb.AMLCheckRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: risk_pb.ComplianceCheckResponse) => void): grpc.ClientUnaryCall;
    public performTradeComplianceCheck(request: risk_pb.TradeComplianceCheckRequest, callback: (error: grpc.ServiceError | null, response: risk_pb.ComplianceCheckResponse) => void): grpc.ClientUnaryCall;
    public performTradeComplianceCheck(request: risk_pb.TradeComplianceCheckRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: risk_pb.ComplianceCheckResponse) => void): grpc.ClientUnaryCall;
    public performTradeComplianceCheck(request: risk_pb.TradeComplianceCheckRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: risk_pb.ComplianceCheckResponse) => void): grpc.ClientUnaryCall;
    public getComplianceStatus(request: risk_pb.GetComplianceStatusRequest, callback: (error: grpc.ServiceError | null, response: risk_pb.ComplianceStatusResponse) => void): grpc.ClientUnaryCall;
    public getComplianceStatus(request: risk_pb.GetComplianceStatusRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: risk_pb.ComplianceStatusResponse) => void): grpc.ClientUnaryCall;
    public getComplianceStatus(request: risk_pb.GetComplianceStatusRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: risk_pb.ComplianceStatusResponse) => void): grpc.ClientUnaryCall;
    public createRiskAlert(request: risk_pb.CreateRiskAlertRequest, callback: (error: grpc.ServiceError | null, response: risk_pb.RiskAlertResponse) => void): grpc.ClientUnaryCall;
    public createRiskAlert(request: risk_pb.CreateRiskAlertRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: risk_pb.RiskAlertResponse) => void): grpc.ClientUnaryCall;
    public createRiskAlert(request: risk_pb.CreateRiskAlertRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: risk_pb.RiskAlertResponse) => void): grpc.ClientUnaryCall;
    public getActiveAlerts(request: risk_pb.GetActiveAlertsRequest, callback: (error: grpc.ServiceError | null, response: risk_pb.ListRiskAlertsResponse) => void): grpc.ClientUnaryCall;
    public getActiveAlerts(request: risk_pb.GetActiveAlertsRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: risk_pb.ListRiskAlertsResponse) => void): grpc.ClientUnaryCall;
    public getActiveAlerts(request: risk_pb.GetActiveAlertsRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: risk_pb.ListRiskAlertsResponse) => void): grpc.ClientUnaryCall;
    public acknowledgeAlert(request: risk_pb.AcknowledgeAlertRequest, callback: (error: grpc.ServiceError | null, response: risk_pb.RiskAlertResponse) => void): grpc.ClientUnaryCall;
    public acknowledgeAlert(request: risk_pb.AcknowledgeAlertRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: risk_pb.RiskAlertResponse) => void): grpc.ClientUnaryCall;
    public acknowledgeAlert(request: risk_pb.AcknowledgeAlertRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: risk_pb.RiskAlertResponse) => void): grpc.ClientUnaryCall;
    public resolveAlert(request: risk_pb.ResolveAlertRequest, callback: (error: grpc.ServiceError | null, response: risk_pb.RiskAlertResponse) => void): grpc.ClientUnaryCall;
    public resolveAlert(request: risk_pb.ResolveAlertRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: risk_pb.RiskAlertResponse) => void): grpc.ClientUnaryCall;
    public resolveAlert(request: risk_pb.ResolveAlertRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: risk_pb.RiskAlertResponse) => void): grpc.ClientUnaryCall;
    public createRiskLimit(request: risk_pb.CreateRiskLimitRequest, callback: (error: grpc.ServiceError | null, response: risk_pb.RiskLimitResponse) => void): grpc.ClientUnaryCall;
    public createRiskLimit(request: risk_pb.CreateRiskLimitRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: risk_pb.RiskLimitResponse) => void): grpc.ClientUnaryCall;
    public createRiskLimit(request: risk_pb.CreateRiskLimitRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: risk_pb.RiskLimitResponse) => void): grpc.ClientUnaryCall;
    public updateRiskLimit(request: risk_pb.UpdateRiskLimitRequest, callback: (error: grpc.ServiceError | null, response: risk_pb.RiskLimitResponse) => void): grpc.ClientUnaryCall;
    public updateRiskLimit(request: risk_pb.UpdateRiskLimitRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: risk_pb.RiskLimitResponse) => void): grpc.ClientUnaryCall;
    public updateRiskLimit(request: risk_pb.UpdateRiskLimitRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: risk_pb.RiskLimitResponse) => void): grpc.ClientUnaryCall;
    public getRiskLimits(request: risk_pb.GetRiskLimitsRequest, callback: (error: grpc.ServiceError | null, response: risk_pb.ListRiskLimitsResponse) => void): grpc.ClientUnaryCall;
    public getRiskLimits(request: risk_pb.GetRiskLimitsRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: risk_pb.ListRiskLimitsResponse) => void): grpc.ClientUnaryCall;
    public getRiskLimits(request: risk_pb.GetRiskLimitsRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: risk_pb.ListRiskLimitsResponse) => void): grpc.ClientUnaryCall;
    public checkLimitBreach(request: risk_pb.CheckLimitBreachRequest, callback: (error: grpc.ServiceError | null, response: risk_pb.LimitBreachResponse) => void): grpc.ClientUnaryCall;
    public checkLimitBreach(request: risk_pb.CheckLimitBreachRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: risk_pb.LimitBreachResponse) => void): grpc.ClientUnaryCall;
    public checkLimitBreach(request: risk_pb.CheckLimitBreachRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: risk_pb.LimitBreachResponse) => void): grpc.ClientUnaryCall;
    public detectFraud(request: risk_pb.DetectFraudRequest, callback: (error: grpc.ServiceError | null, response: risk_pb.FraudDetectionResponse) => void): grpc.ClientUnaryCall;
    public detectFraud(request: risk_pb.DetectFraudRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: risk_pb.FraudDetectionResponse) => void): grpc.ClientUnaryCall;
    public detectFraud(request: risk_pb.DetectFraudRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: risk_pb.FraudDetectionResponse) => void): grpc.ClientUnaryCall;
    public getFraudScore(request: risk_pb.GetFraudScoreRequest, callback: (error: grpc.ServiceError | null, response: risk_pb.FraudScoreResponse) => void): grpc.ClientUnaryCall;
    public getFraudScore(request: risk_pb.GetFraudScoreRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: risk_pb.FraudScoreResponse) => void): grpc.ClientUnaryCall;
    public getFraudScore(request: risk_pb.GetFraudScoreRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: risk_pb.FraudScoreResponse) => void): grpc.ClientUnaryCall;
    public getRiskMetrics(request: risk_pb.GetRiskMetricsRequest, callback: (error: grpc.ServiceError | null, response: risk_pb.RiskMetricsResponse) => void): grpc.ClientUnaryCall;
    public getRiskMetrics(request: risk_pb.GetRiskMetricsRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: risk_pb.RiskMetricsResponse) => void): grpc.ClientUnaryCall;
    public getRiskMetrics(request: risk_pb.GetRiskMetricsRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: risk_pb.RiskMetricsResponse) => void): grpc.ClientUnaryCall;
    public listRiskMetrics(request: risk_pb.ListRiskMetricsRequest, callback: (error: grpc.ServiceError | null, response: risk_pb.ListRiskMetricsResponse) => void): grpc.ClientUnaryCall;
    public listRiskMetrics(request: risk_pb.ListRiskMetricsRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: risk_pb.ListRiskMetricsResponse) => void): grpc.ClientUnaryCall;
    public listRiskMetrics(request: risk_pb.ListRiskMetricsRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: risk_pb.ListRiskMetricsResponse) => void): grpc.ClientUnaryCall;
}
