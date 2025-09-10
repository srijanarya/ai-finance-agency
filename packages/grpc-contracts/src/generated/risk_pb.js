// source: risk.proto
/**
 * @fileoverview
 * @enhanceable
 * @suppress {missingRequire} reports error on implicit type usages.
 * @suppress {messageConventions} JS Compiler reports an error if a variable or
 *     field starts with 'MSG_' and isn't a translatable message.
 * @public
 */
// GENERATED CODE -- DO NOT EDIT!
/* eslint-disable */
// @ts-nocheck

var jspb = require('google-protobuf');
var goog = jspb;
var global = (function() {
  if (this) { return this; }
  if (typeof window !== 'undefined') { return window; }
  if (typeof global !== 'undefined') { return global; }
  if (typeof self !== 'undefined') { return self; }
  return Function('return this')();
}.call(null));

var google_protobuf_timestamp_pb = require('google-protobuf/google/protobuf/timestamp_pb.js');
goog.object.extend(proto, google_protobuf_timestamp_pb);
var google_protobuf_empty_pb = require('google-protobuf/google/protobuf/empty_pb.js');
goog.object.extend(proto, google_protobuf_empty_pb);
goog.exportSymbol('proto.treum.risk.AMLCheckRequest', null, global);
goog.exportSymbol('proto.treum.risk.AcknowledgeAlertRequest', null, global);
goog.exportSymbol('proto.treum.risk.Address', null, global);
goog.exportSymbol('proto.treum.risk.AlertPriority', null, global);
goog.exportSymbol('proto.treum.risk.AlertSeverity', null, global);
goog.exportSymbol('proto.treum.risk.AlertStatus', null, global);
goog.exportSymbol('proto.treum.risk.AlertType', null, global);
goog.exportSymbol('proto.treum.risk.AssessTradeRiskRequest', null, global);
goog.exportSymbol('proto.treum.risk.AssessmentStatus', null, global);
goog.exportSymbol('proto.treum.risk.AssessmentType', null, global);
goog.exportSymbol('proto.treum.risk.CalculatePortfolioRiskRequest', null, global);
goog.exportSymbol('proto.treum.risk.CheckLimitBreachRequest', null, global);
goog.exportSymbol('proto.treum.risk.ComplianceCheckResponse', null, global);
goog.exportSymbol('proto.treum.risk.ComplianceFlag', null, global);
goog.exportSymbol('proto.treum.risk.ComplianceResults', null, global);
goog.exportSymbol('proto.treum.risk.ComplianceSeverity', null, global);
goog.exportSymbol('proto.treum.risk.ComplianceStatus', null, global);
goog.exportSymbol('proto.treum.risk.ComplianceStatusResponse', null, global);
goog.exportSymbol('proto.treum.risk.ComplianceType', null, global);
goog.exportSymbol('proto.treum.risk.ConcentrationRisk', null, global);
goog.exportSymbol('proto.treum.risk.Coordinates', null, global);
goog.exportSymbol('proto.treum.risk.CreateRiskAlertRequest', null, global);
goog.exportSymbol('proto.treum.risk.CreateRiskLimitRequest', null, global);
goog.exportSymbol('proto.treum.risk.DetectFraudRequest', null, global);
goog.exportSymbol('proto.treum.risk.DeviceHistory', null, global);
goog.exportSymbol('proto.treum.risk.Document', null, global);
goog.exportSymbol('proto.treum.risk.DocumentType', null, global);
goog.exportSymbol('proto.treum.risk.EscalationRules', null, global);
goog.exportSymbol('proto.treum.risk.ExpectedShortfall', null, global);
goog.exportSymbol('proto.treum.risk.FraudCategories', null, global);
goog.exportSymbol('proto.treum.risk.FraudDetectionResponse', null, global);
goog.exportSymbol('proto.treum.risk.FraudRecommendation', null, global);
goog.exportSymbol('proto.treum.risk.FraudRiskFactor', null, global);
goog.exportSymbol('proto.treum.risk.FraudScoreResponse', null, global);
goog.exportSymbol('proto.treum.risk.FraudSeverity', null, global);
goog.exportSymbol('proto.treum.risk.FraudTrend', null, global);
goog.exportSymbol('proto.treum.risk.GeographicRisk', null, global);
goog.exportSymbol('proto.treum.risk.GetActiveAlertsRequest', null, global);
goog.exportSymbol('proto.treum.risk.GetComplianceStatusRequest', null, global);
goog.exportSymbol('proto.treum.risk.GetFraudScoreRequest', null, global);
goog.exportSymbol('proto.treum.risk.GetRiskAssessmentRequest', null, global);
goog.exportSymbol('proto.treum.risk.GetRiskLimitsRequest', null, global);
goog.exportSymbol('proto.treum.risk.GetRiskMetricsRequest', null, global);
goog.exportSymbol('proto.treum.risk.ImpactAssessment', null, global);
goog.exportSymbol('proto.treum.risk.InvestmentExperience', null, global);
goog.exportSymbol('proto.treum.risk.KYCCheckRequest', null, global);
goog.exportSymbol('proto.treum.risk.LimitBreachResponse', null, global);
goog.exportSymbol('proto.treum.risk.LimitFrequency', null, global);
goog.exportSymbol('proto.treum.risk.LimitScope', null, global);
goog.exportSymbol('proto.treum.risk.LimitStatus', null, global);
goog.exportSymbol('proto.treum.risk.LimitType', null, global);
goog.exportSymbol('proto.treum.risk.ListRiskAlertsResponse', null, global);
goog.exportSymbol('proto.treum.risk.ListRiskAssessmentsRequest', null, global);
goog.exportSymbol('proto.treum.risk.ListRiskAssessmentsResponse', null, global);
goog.exportSymbol('proto.treum.risk.ListRiskLimitsResponse', null, global);
goog.exportSymbol('proto.treum.risk.ListRiskMetricsRequest', null, global);
goog.exportSymbol('proto.treum.risk.ListRiskMetricsResponse', null, global);
goog.exportSymbol('proto.treum.risk.Location', null, global);
goog.exportSymbol('proto.treum.risk.MarketData', null, global);
goog.exportSymbol('proto.treum.risk.MarketDataForCompliance', null, global);
goog.exportSymbol('proto.treum.risk.MetricFrequency', null, global);
goog.exportSymbol('proto.treum.risk.MetricScope', null, global);
goog.exportSymbol('proto.treum.risk.MetricType', null, global);
goog.exportSymbol('proto.treum.risk.PersonalInfo', null, global);
goog.exportSymbol('proto.treum.risk.PortfolioPosition', null, global);
goog.exportSymbol('proto.treum.risk.PortfolioRiskResponse', null, global);
goog.exportSymbol('proto.treum.risk.Position', null, global);
goog.exportSymbol('proto.treum.risk.PreviousTransaction', null, global);
goog.exportSymbol('proto.treum.risk.RelatedEntities', null, global);
goog.exportSymbol('proto.treum.risk.ResolveAlertRequest', null, global);
goog.exportSymbol('proto.treum.risk.RiskAlertResponse', null, global);
goog.exportSymbol('proto.treum.risk.RiskAssessmentResponse', null, global);
goog.exportSymbol('proto.treum.risk.RiskFactor', null, global);
goog.exportSymbol('proto.treum.risk.RiskLevel', null, global);
goog.exportSymbol('proto.treum.risk.RiskLimitResponse', null, global);
goog.exportSymbol('proto.treum.risk.RiskMetricsResponse', null, global);
goog.exportSymbol('proto.treum.risk.RiskProfile', null, global);
goog.exportSymbol('proto.treum.risk.SessionData', null, global);
goog.exportSymbol('proto.treum.risk.TradeComplianceCheckRequest', null, global);
goog.exportSymbol('proto.treum.risk.TradeData', null, global);
goog.exportSymbol('proto.treum.risk.TradeRiskResponse', null, global);
goog.exportSymbol('proto.treum.risk.TradeSide', null, global);
goog.exportSymbol('proto.treum.risk.TradingActivity', null, global);
goog.exportSymbol('proto.treum.risk.TransactionData', null, global);
goog.exportSymbol('proto.treum.risk.TransactionDataForFraud', null, global);
goog.exportSymbol('proto.treum.risk.TriggerConditions', null, global);
goog.exportSymbol('proto.treum.risk.TypicalLocation', null, global);
goog.exportSymbol('proto.treum.risk.UpdateRiskLimitRequest', null, global);
goog.exportSymbol('proto.treum.risk.UserProfile', null, global);
goog.exportSymbol('proto.treum.risk.UserProfileForFraud', null, global);
goog.exportSymbol('proto.treum.risk.ValueAtRisk', null, global);
goog.exportSymbol('proto.treum.risk.Volatility', null, global);
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.treum.risk.AssessTradeRiskRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.treum.risk.AssessTradeRiskRequest.repeatedFields_, null);
};
goog.inherits(proto.treum.risk.AssessTradeRiskRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.treum.risk.AssessTradeRiskRequest.displayName = 'proto.treum.risk.AssessTradeRiskRequest';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.treum.risk.Position = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.treum.risk.Position, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.treum.risk.Position.displayName = 'proto.treum.risk.Position';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.treum.risk.MarketData = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.treum.risk.MarketData, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.treum.risk.MarketData.displayName = 'proto.treum.risk.MarketData';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.treum.risk.TradeRiskResponse = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.treum.risk.TradeRiskResponse.repeatedFields_, null);
};
goog.inherits(proto.treum.risk.TradeRiskResponse, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.treum.risk.TradeRiskResponse.displayName = 'proto.treum.risk.TradeRiskResponse';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.treum.risk.RiskFactor = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.treum.risk.RiskFactor, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.treum.risk.RiskFactor.displayName = 'proto.treum.risk.RiskFactor';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.treum.risk.CalculatePortfolioRiskRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.treum.risk.CalculatePortfolioRiskRequest.repeatedFields_, null);
};
goog.inherits(proto.treum.risk.CalculatePortfolioRiskRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.treum.risk.CalculatePortfolioRiskRequest.displayName = 'proto.treum.risk.CalculatePortfolioRiskRequest';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.treum.risk.PortfolioPosition = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.treum.risk.PortfolioPosition, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.treum.risk.PortfolioPosition.displayName = 'proto.treum.risk.PortfolioPosition';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.treum.risk.PortfolioRiskResponse = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.treum.risk.PortfolioRiskResponse, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.treum.risk.PortfolioRiskResponse.displayName = 'proto.treum.risk.PortfolioRiskResponse';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.treum.risk.ValueAtRisk = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.treum.risk.ValueAtRisk, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.treum.risk.ValueAtRisk.displayName = 'proto.treum.risk.ValueAtRisk';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.treum.risk.ExpectedShortfall = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.treum.risk.ExpectedShortfall, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.treum.risk.ExpectedShortfall.displayName = 'proto.treum.risk.ExpectedShortfall';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.treum.risk.Volatility = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.treum.risk.Volatility, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.treum.risk.Volatility.displayName = 'proto.treum.risk.Volatility';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.treum.risk.ConcentrationRisk = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.treum.risk.ConcentrationRisk, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.treum.risk.ConcentrationRisk.displayName = 'proto.treum.risk.ConcentrationRisk';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.treum.risk.KYCCheckRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.treum.risk.KYCCheckRequest.repeatedFields_, null);
};
goog.inherits(proto.treum.risk.KYCCheckRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.treum.risk.KYCCheckRequest.displayName = 'proto.treum.risk.KYCCheckRequest';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.treum.risk.PersonalInfo = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.treum.risk.PersonalInfo, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.treum.risk.PersonalInfo.displayName = 'proto.treum.risk.PersonalInfo';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.treum.risk.Address = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.treum.risk.Address, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.treum.risk.Address.displayName = 'proto.treum.risk.Address';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.treum.risk.Document = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.treum.risk.Document, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.treum.risk.Document.displayName = 'proto.treum.risk.Document';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.treum.risk.AMLCheckRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.treum.risk.AMLCheckRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.treum.risk.AMLCheckRequest.displayName = 'proto.treum.risk.AMLCheckRequest';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.treum.risk.TransactionData = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.treum.risk.TransactionData, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.treum.risk.TransactionData.displayName = 'proto.treum.risk.TransactionData';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.treum.risk.UserProfile = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.treum.risk.UserProfile.repeatedFields_, null);
};
goog.inherits(proto.treum.risk.UserProfile, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.treum.risk.UserProfile.displayName = 'proto.treum.risk.UserProfile';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.treum.risk.PreviousTransaction = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.treum.risk.PreviousTransaction, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.treum.risk.PreviousTransaction.displayName = 'proto.treum.risk.PreviousTransaction';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.treum.risk.TradeComplianceCheckRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.treum.risk.TradeComplianceCheckRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.treum.risk.TradeComplianceCheckRequest.displayName = 'proto.treum.risk.TradeComplianceCheckRequest';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.treum.risk.TradeData = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.treum.risk.TradeData, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.treum.risk.TradeData.displayName = 'proto.treum.risk.TradeData';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.treum.risk.MarketDataForCompliance = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.treum.risk.MarketDataForCompliance, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.treum.risk.MarketDataForCompliance.displayName = 'proto.treum.risk.MarketDataForCompliance';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.treum.risk.ComplianceCheckResponse = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.treum.risk.ComplianceCheckResponse.repeatedFields_, null);
};
goog.inherits(proto.treum.risk.ComplianceCheckResponse, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.treum.risk.ComplianceCheckResponse.displayName = 'proto.treum.risk.ComplianceCheckResponse';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.treum.risk.ComplianceResults = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.treum.risk.ComplianceResults.repeatedFields_, null);
};
goog.inherits(proto.treum.risk.ComplianceResults, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.treum.risk.ComplianceResults.displayName = 'proto.treum.risk.ComplianceResults';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.treum.risk.ComplianceFlag = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.treum.risk.ComplianceFlag, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.treum.risk.ComplianceFlag.displayName = 'proto.treum.risk.ComplianceFlag';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.treum.risk.GetComplianceStatusRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.treum.risk.GetComplianceStatusRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.treum.risk.GetComplianceStatusRequest.displayName = 'proto.treum.risk.GetComplianceStatusRequest';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.treum.risk.ComplianceStatusResponse = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.treum.risk.ComplianceStatusResponse, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.treum.risk.ComplianceStatusResponse.displayName = 'proto.treum.risk.ComplianceStatusResponse';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.treum.risk.CreateRiskAlertRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.treum.risk.CreateRiskAlertRequest.repeatedFields_, null);
};
goog.inherits(proto.treum.risk.CreateRiskAlertRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.treum.risk.CreateRiskAlertRequest.displayName = 'proto.treum.risk.CreateRiskAlertRequest';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.treum.risk.TriggerConditions = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.treum.risk.TriggerConditions, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.treum.risk.TriggerConditions.displayName = 'proto.treum.risk.TriggerConditions';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.treum.risk.ImpactAssessment = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.treum.risk.ImpactAssessment, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.treum.risk.ImpactAssessment.displayName = 'proto.treum.risk.ImpactAssessment';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.treum.risk.RelatedEntities = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.treum.risk.RelatedEntities.repeatedFields_, null);
};
goog.inherits(proto.treum.risk.RelatedEntities, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.treum.risk.RelatedEntities.displayName = 'proto.treum.risk.RelatedEntities';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.treum.risk.EscalationRules = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.treum.risk.EscalationRules.repeatedFields_, null);
};
goog.inherits(proto.treum.risk.EscalationRules, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.treum.risk.EscalationRules.displayName = 'proto.treum.risk.EscalationRules';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.treum.risk.RiskAlertResponse = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.treum.risk.RiskAlertResponse.repeatedFields_, null);
};
goog.inherits(proto.treum.risk.RiskAlertResponse, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.treum.risk.RiskAlertResponse.displayName = 'proto.treum.risk.RiskAlertResponse';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.treum.risk.GetActiveAlertsRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.treum.risk.GetActiveAlertsRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.treum.risk.GetActiveAlertsRequest.displayName = 'proto.treum.risk.GetActiveAlertsRequest';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.treum.risk.ListRiskAlertsResponse = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.treum.risk.ListRiskAlertsResponse.repeatedFields_, null);
};
goog.inherits(proto.treum.risk.ListRiskAlertsResponse, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.treum.risk.ListRiskAlertsResponse.displayName = 'proto.treum.risk.ListRiskAlertsResponse';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.treum.risk.AcknowledgeAlertRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.treum.risk.AcknowledgeAlertRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.treum.risk.AcknowledgeAlertRequest.displayName = 'proto.treum.risk.AcknowledgeAlertRequest';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.treum.risk.ResolveAlertRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.treum.risk.ResolveAlertRequest.repeatedFields_, null);
};
goog.inherits(proto.treum.risk.ResolveAlertRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.treum.risk.ResolveAlertRequest.displayName = 'proto.treum.risk.ResolveAlertRequest';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.treum.risk.CreateRiskLimitRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.treum.risk.CreateRiskLimitRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.treum.risk.CreateRiskLimitRequest.displayName = 'proto.treum.risk.CreateRiskLimitRequest';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.treum.risk.RiskLimitResponse = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.treum.risk.RiskLimitResponse, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.treum.risk.RiskLimitResponse.displayName = 'proto.treum.risk.RiskLimitResponse';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.treum.risk.UpdateRiskLimitRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.treum.risk.UpdateRiskLimitRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.treum.risk.UpdateRiskLimitRequest.displayName = 'proto.treum.risk.UpdateRiskLimitRequest';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.treum.risk.GetRiskLimitsRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.treum.risk.GetRiskLimitsRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.treum.risk.GetRiskLimitsRequest.displayName = 'proto.treum.risk.GetRiskLimitsRequest';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.treum.risk.ListRiskLimitsResponse = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.treum.risk.ListRiskLimitsResponse.repeatedFields_, null);
};
goog.inherits(proto.treum.risk.ListRiskLimitsResponse, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.treum.risk.ListRiskLimitsResponse.displayName = 'proto.treum.risk.ListRiskLimitsResponse';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.treum.risk.CheckLimitBreachRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.treum.risk.CheckLimitBreachRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.treum.risk.CheckLimitBreachRequest.displayName = 'proto.treum.risk.CheckLimitBreachRequest';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.treum.risk.LimitBreachResponse = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.treum.risk.LimitBreachResponse.repeatedFields_, null);
};
goog.inherits(proto.treum.risk.LimitBreachResponse, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.treum.risk.LimitBreachResponse.displayName = 'proto.treum.risk.LimitBreachResponse';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.treum.risk.DetectFraudRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.treum.risk.DetectFraudRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.treum.risk.DetectFraudRequest.displayName = 'proto.treum.risk.DetectFraudRequest';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.treum.risk.SessionData = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.treum.risk.SessionData, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.treum.risk.SessionData.displayName = 'proto.treum.risk.SessionData';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.treum.risk.Location = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.treum.risk.Location, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.treum.risk.Location.displayName = 'proto.treum.risk.Location';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.treum.risk.Coordinates = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.treum.risk.Coordinates, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.treum.risk.Coordinates.displayName = 'proto.treum.risk.Coordinates';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.treum.risk.TransactionDataForFraud = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.treum.risk.TransactionDataForFraud, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.treum.risk.TransactionDataForFraud.displayName = 'proto.treum.risk.TransactionDataForFraud';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.treum.risk.TradingActivity = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.treum.risk.TradingActivity, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.treum.risk.TradingActivity.displayName = 'proto.treum.risk.TradingActivity';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.treum.risk.UserProfileForFraud = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.treum.risk.UserProfileForFraud.repeatedFields_, null);
};
goog.inherits(proto.treum.risk.UserProfileForFraud, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.treum.risk.UserProfileForFraud.displayName = 'proto.treum.risk.UserProfileForFraud';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.treum.risk.TypicalLocation = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.treum.risk.TypicalLocation, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.treum.risk.TypicalLocation.displayName = 'proto.treum.risk.TypicalLocation';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.treum.risk.DeviceHistory = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.treum.risk.DeviceHistory, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.treum.risk.DeviceHistory.displayName = 'proto.treum.risk.DeviceHistory';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.treum.risk.FraudDetectionResponse = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.treum.risk.FraudDetectionResponse.repeatedFields_, null);
};
goog.inherits(proto.treum.risk.FraudDetectionResponse, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.treum.risk.FraudDetectionResponse.displayName = 'proto.treum.risk.FraudDetectionResponse';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.treum.risk.FraudCategories = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.treum.risk.FraudCategories, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.treum.risk.FraudCategories.displayName = 'proto.treum.risk.FraudCategories';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.treum.risk.FraudRiskFactor = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.treum.risk.FraudRiskFactor, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.treum.risk.FraudRiskFactor.displayName = 'proto.treum.risk.FraudRiskFactor';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.treum.risk.GetFraudScoreRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.treum.risk.GetFraudScoreRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.treum.risk.GetFraudScoreRequest.displayName = 'proto.treum.risk.GetFraudScoreRequest';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.treum.risk.FraudScoreResponse = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.treum.risk.FraudScoreResponse, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.treum.risk.FraudScoreResponse.displayName = 'proto.treum.risk.FraudScoreResponse';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.treum.risk.GetRiskMetricsRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.treum.risk.GetRiskMetricsRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.treum.risk.GetRiskMetricsRequest.displayName = 'proto.treum.risk.GetRiskMetricsRequest';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.treum.risk.RiskMetricsResponse = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.treum.risk.RiskMetricsResponse.repeatedFields_, null);
};
goog.inherits(proto.treum.risk.RiskMetricsResponse, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.treum.risk.RiskMetricsResponse.displayName = 'proto.treum.risk.RiskMetricsResponse';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.treum.risk.ListRiskMetricsRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.treum.risk.ListRiskMetricsRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.treum.risk.ListRiskMetricsRequest.displayName = 'proto.treum.risk.ListRiskMetricsRequest';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.treum.risk.ListRiskMetricsResponse = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.treum.risk.ListRiskMetricsResponse.repeatedFields_, null);
};
goog.inherits(proto.treum.risk.ListRiskMetricsResponse, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.treum.risk.ListRiskMetricsResponse.displayName = 'proto.treum.risk.ListRiskMetricsResponse';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.treum.risk.GetRiskAssessmentRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.treum.risk.GetRiskAssessmentRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.treum.risk.GetRiskAssessmentRequest.displayName = 'proto.treum.risk.GetRiskAssessmentRequest';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.treum.risk.RiskAssessmentResponse = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.treum.risk.RiskAssessmentResponse.repeatedFields_, null);
};
goog.inherits(proto.treum.risk.RiskAssessmentResponse, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.treum.risk.RiskAssessmentResponse.displayName = 'proto.treum.risk.RiskAssessmentResponse';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.treum.risk.ListRiskAssessmentsRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.treum.risk.ListRiskAssessmentsRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.treum.risk.ListRiskAssessmentsRequest.displayName = 'proto.treum.risk.ListRiskAssessmentsRequest';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.treum.risk.ListRiskAssessmentsResponse = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.treum.risk.ListRiskAssessmentsResponse.repeatedFields_, null);
};
goog.inherits(proto.treum.risk.ListRiskAssessmentsResponse, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.treum.risk.ListRiskAssessmentsResponse.displayName = 'proto.treum.risk.ListRiskAssessmentsResponse';
}

/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.treum.risk.AssessTradeRiskRequest.repeatedFields_ = [14];



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.treum.risk.AssessTradeRiskRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.treum.risk.AssessTradeRiskRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.treum.risk.AssessTradeRiskRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.AssessTradeRiskRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    userId: jspb.Message.getFieldWithDefault(msg, 1, ""),
    accountId: jspb.Message.getFieldWithDefault(msg, 2, ""),
    tradeId: jspb.Message.getFieldWithDefault(msg, 3, ""),
    symbol: jspb.Message.getFieldWithDefault(msg, 4, ""),
    assetType: jspb.Message.getFieldWithDefault(msg, 5, ""),
    side: jspb.Message.getFieldWithDefault(msg, 6, 0),
    quantity: jspb.Message.getFloatingPointFieldWithDefault(msg, 7, 0.0),
    price: jspb.Message.getFloatingPointFieldWithDefault(msg, 8, 0.0),
    stopLoss: jspb.Message.getFloatingPointFieldWithDefault(msg, 9, 0.0),
    takeProfit: jspb.Message.getFloatingPointFieldWithDefault(msg, 10, 0.0),
    leverage: jspb.Message.getFloatingPointFieldWithDefault(msg, 11, 0.0),
    portfolioValue: jspb.Message.getFloatingPointFieldWithDefault(msg, 12, 0.0),
    availableBalance: jspb.Message.getFloatingPointFieldWithDefault(msg, 13, 0.0),
    existingPositionsList: jspb.Message.toObjectList(msg.getExistingPositionsList(),
    proto.treum.risk.Position.toObject, includeInstance),
    marketData: (f = msg.getMarketData()) && proto.treum.risk.MarketData.toObject(includeInstance, f)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.treum.risk.AssessTradeRiskRequest}
 */
proto.treum.risk.AssessTradeRiskRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.treum.risk.AssessTradeRiskRequest;
  return proto.treum.risk.AssessTradeRiskRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.treum.risk.AssessTradeRiskRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.treum.risk.AssessTradeRiskRequest}
 */
proto.treum.risk.AssessTradeRiskRequest.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setUserId(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setAccountId(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readString());
      msg.setTradeId(value);
      break;
    case 4:
      var value = /** @type {string} */ (reader.readString());
      msg.setSymbol(value);
      break;
    case 5:
      var value = /** @type {string} */ (reader.readString());
      msg.setAssetType(value);
      break;
    case 6:
      var value = /** @type {!proto.treum.risk.TradeSide} */ (reader.readEnum());
      msg.setSide(value);
      break;
    case 7:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setQuantity(value);
      break;
    case 8:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setPrice(value);
      break;
    case 9:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setStopLoss(value);
      break;
    case 10:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setTakeProfit(value);
      break;
    case 11:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setLeverage(value);
      break;
    case 12:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setPortfolioValue(value);
      break;
    case 13:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setAvailableBalance(value);
      break;
    case 14:
      var value = new proto.treum.risk.Position;
      reader.readMessage(value,proto.treum.risk.Position.deserializeBinaryFromReader);
      msg.addExistingPositions(value);
      break;
    case 15:
      var value = new proto.treum.risk.MarketData;
      reader.readMessage(value,proto.treum.risk.MarketData.deserializeBinaryFromReader);
      msg.setMarketData(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.treum.risk.AssessTradeRiskRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.treum.risk.AssessTradeRiskRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.treum.risk.AssessTradeRiskRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.AssessTradeRiskRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getUserId();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getAccountId();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
  f = message.getTradeId();
  if (f.length > 0) {
    writer.writeString(
      3,
      f
    );
  }
  f = message.getSymbol();
  if (f.length > 0) {
    writer.writeString(
      4,
      f
    );
  }
  f = message.getAssetType();
  if (f.length > 0) {
    writer.writeString(
      5,
      f
    );
  }
  f = message.getSide();
  if (f !== 0.0) {
    writer.writeEnum(
      6,
      f
    );
  }
  f = message.getQuantity();
  if (f !== 0.0) {
    writer.writeDouble(
      7,
      f
    );
  }
  f = message.getPrice();
  if (f !== 0.0) {
    writer.writeDouble(
      8,
      f
    );
  }
  f = message.getStopLoss();
  if (f !== 0.0) {
    writer.writeDouble(
      9,
      f
    );
  }
  f = message.getTakeProfit();
  if (f !== 0.0) {
    writer.writeDouble(
      10,
      f
    );
  }
  f = message.getLeverage();
  if (f !== 0.0) {
    writer.writeDouble(
      11,
      f
    );
  }
  f = message.getPortfolioValue();
  if (f !== 0.0) {
    writer.writeDouble(
      12,
      f
    );
  }
  f = message.getAvailableBalance();
  if (f !== 0.0) {
    writer.writeDouble(
      13,
      f
    );
  }
  f = message.getExistingPositionsList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      14,
      f,
      proto.treum.risk.Position.serializeBinaryToWriter
    );
  }
  f = message.getMarketData();
  if (f != null) {
    writer.writeMessage(
      15,
      f,
      proto.treum.risk.MarketData.serializeBinaryToWriter
    );
  }
};


/**
 * optional string user_id = 1;
 * @return {string}
 */
proto.treum.risk.AssessTradeRiskRequest.prototype.getUserId = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.AssessTradeRiskRequest} returns this
 */
proto.treum.risk.AssessTradeRiskRequest.prototype.setUserId = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional string account_id = 2;
 * @return {string}
 */
proto.treum.risk.AssessTradeRiskRequest.prototype.getAccountId = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.AssessTradeRiskRequest} returns this
 */
proto.treum.risk.AssessTradeRiskRequest.prototype.setAccountId = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};


/**
 * optional string trade_id = 3;
 * @return {string}
 */
proto.treum.risk.AssessTradeRiskRequest.prototype.getTradeId = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.AssessTradeRiskRequest} returns this
 */
proto.treum.risk.AssessTradeRiskRequest.prototype.setTradeId = function(value) {
  return jspb.Message.setProto3StringField(this, 3, value);
};


/**
 * optional string symbol = 4;
 * @return {string}
 */
proto.treum.risk.AssessTradeRiskRequest.prototype.getSymbol = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 4, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.AssessTradeRiskRequest} returns this
 */
proto.treum.risk.AssessTradeRiskRequest.prototype.setSymbol = function(value) {
  return jspb.Message.setProto3StringField(this, 4, value);
};


/**
 * optional string asset_type = 5;
 * @return {string}
 */
proto.treum.risk.AssessTradeRiskRequest.prototype.getAssetType = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 5, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.AssessTradeRiskRequest} returns this
 */
proto.treum.risk.AssessTradeRiskRequest.prototype.setAssetType = function(value) {
  return jspb.Message.setProto3StringField(this, 5, value);
};


/**
 * optional TradeSide side = 6;
 * @return {!proto.treum.risk.TradeSide}
 */
proto.treum.risk.AssessTradeRiskRequest.prototype.getSide = function() {
  return /** @type {!proto.treum.risk.TradeSide} */ (jspb.Message.getFieldWithDefault(this, 6, 0));
};


/**
 * @param {!proto.treum.risk.TradeSide} value
 * @return {!proto.treum.risk.AssessTradeRiskRequest} returns this
 */
proto.treum.risk.AssessTradeRiskRequest.prototype.setSide = function(value) {
  return jspb.Message.setProto3EnumField(this, 6, value);
};


/**
 * optional double quantity = 7;
 * @return {number}
 */
proto.treum.risk.AssessTradeRiskRequest.prototype.getQuantity = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 7, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.AssessTradeRiskRequest} returns this
 */
proto.treum.risk.AssessTradeRiskRequest.prototype.setQuantity = function(value) {
  return jspb.Message.setProto3FloatField(this, 7, value);
};


/**
 * optional double price = 8;
 * @return {number}
 */
proto.treum.risk.AssessTradeRiskRequest.prototype.getPrice = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 8, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.AssessTradeRiskRequest} returns this
 */
proto.treum.risk.AssessTradeRiskRequest.prototype.setPrice = function(value) {
  return jspb.Message.setProto3FloatField(this, 8, value);
};


/**
 * optional double stop_loss = 9;
 * @return {number}
 */
proto.treum.risk.AssessTradeRiskRequest.prototype.getStopLoss = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 9, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.AssessTradeRiskRequest} returns this
 */
proto.treum.risk.AssessTradeRiskRequest.prototype.setStopLoss = function(value) {
  return jspb.Message.setProto3FloatField(this, 9, value);
};


/**
 * optional double take_profit = 10;
 * @return {number}
 */
proto.treum.risk.AssessTradeRiskRequest.prototype.getTakeProfit = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 10, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.AssessTradeRiskRequest} returns this
 */
proto.treum.risk.AssessTradeRiskRequest.prototype.setTakeProfit = function(value) {
  return jspb.Message.setProto3FloatField(this, 10, value);
};


/**
 * optional double leverage = 11;
 * @return {number}
 */
proto.treum.risk.AssessTradeRiskRequest.prototype.getLeverage = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 11, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.AssessTradeRiskRequest} returns this
 */
proto.treum.risk.AssessTradeRiskRequest.prototype.setLeverage = function(value) {
  return jspb.Message.setProto3FloatField(this, 11, value);
};


/**
 * optional double portfolio_value = 12;
 * @return {number}
 */
proto.treum.risk.AssessTradeRiskRequest.prototype.getPortfolioValue = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 12, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.AssessTradeRiskRequest} returns this
 */
proto.treum.risk.AssessTradeRiskRequest.prototype.setPortfolioValue = function(value) {
  return jspb.Message.setProto3FloatField(this, 12, value);
};


/**
 * optional double available_balance = 13;
 * @return {number}
 */
proto.treum.risk.AssessTradeRiskRequest.prototype.getAvailableBalance = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 13, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.AssessTradeRiskRequest} returns this
 */
proto.treum.risk.AssessTradeRiskRequest.prototype.setAvailableBalance = function(value) {
  return jspb.Message.setProto3FloatField(this, 13, value);
};


/**
 * repeated Position existing_positions = 14;
 * @return {!Array<!proto.treum.risk.Position>}
 */
proto.treum.risk.AssessTradeRiskRequest.prototype.getExistingPositionsList = function() {
  return /** @type{!Array<!proto.treum.risk.Position>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.treum.risk.Position, 14));
};


/**
 * @param {!Array<!proto.treum.risk.Position>} value
 * @return {!proto.treum.risk.AssessTradeRiskRequest} returns this
*/
proto.treum.risk.AssessTradeRiskRequest.prototype.setExistingPositionsList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 14, value);
};


/**
 * @param {!proto.treum.risk.Position=} opt_value
 * @param {number=} opt_index
 * @return {!proto.treum.risk.Position}
 */
proto.treum.risk.AssessTradeRiskRequest.prototype.addExistingPositions = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 14, opt_value, proto.treum.risk.Position, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.treum.risk.AssessTradeRiskRequest} returns this
 */
proto.treum.risk.AssessTradeRiskRequest.prototype.clearExistingPositionsList = function() {
  return this.setExistingPositionsList([]);
};


/**
 * optional MarketData market_data = 15;
 * @return {?proto.treum.risk.MarketData}
 */
proto.treum.risk.AssessTradeRiskRequest.prototype.getMarketData = function() {
  return /** @type{?proto.treum.risk.MarketData} */ (
    jspb.Message.getWrapperField(this, proto.treum.risk.MarketData, 15));
};


/**
 * @param {?proto.treum.risk.MarketData|undefined} value
 * @return {!proto.treum.risk.AssessTradeRiskRequest} returns this
*/
proto.treum.risk.AssessTradeRiskRequest.prototype.setMarketData = function(value) {
  return jspb.Message.setWrapperField(this, 15, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.treum.risk.AssessTradeRiskRequest} returns this
 */
proto.treum.risk.AssessTradeRiskRequest.prototype.clearMarketData = function() {
  return this.setMarketData(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.treum.risk.AssessTradeRiskRequest.prototype.hasMarketData = function() {
  return jspb.Message.getField(this, 15) != null;
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.treum.risk.Position.prototype.toObject = function(opt_includeInstance) {
  return proto.treum.risk.Position.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.treum.risk.Position} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.Position.toObject = function(includeInstance, msg) {
  var f, obj = {
    symbol: jspb.Message.getFieldWithDefault(msg, 1, ""),
    quantity: jspb.Message.getFloatingPointFieldWithDefault(msg, 2, 0.0),
    marketValue: jspb.Message.getFloatingPointFieldWithDefault(msg, 3, 0.0),
    unrealizedPnl: jspb.Message.getFloatingPointFieldWithDefault(msg, 4, 0.0)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.treum.risk.Position}
 */
proto.treum.risk.Position.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.treum.risk.Position;
  return proto.treum.risk.Position.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.treum.risk.Position} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.treum.risk.Position}
 */
proto.treum.risk.Position.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setSymbol(value);
      break;
    case 2:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setQuantity(value);
      break;
    case 3:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setMarketValue(value);
      break;
    case 4:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setUnrealizedPnl(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.treum.risk.Position.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.treum.risk.Position.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.treum.risk.Position} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.Position.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getSymbol();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getQuantity();
  if (f !== 0.0) {
    writer.writeDouble(
      2,
      f
    );
  }
  f = message.getMarketValue();
  if (f !== 0.0) {
    writer.writeDouble(
      3,
      f
    );
  }
  f = message.getUnrealizedPnl();
  if (f !== 0.0) {
    writer.writeDouble(
      4,
      f
    );
  }
};


/**
 * optional string symbol = 1;
 * @return {string}
 */
proto.treum.risk.Position.prototype.getSymbol = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.Position} returns this
 */
proto.treum.risk.Position.prototype.setSymbol = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional double quantity = 2;
 * @return {number}
 */
proto.treum.risk.Position.prototype.getQuantity = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 2, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.Position} returns this
 */
proto.treum.risk.Position.prototype.setQuantity = function(value) {
  return jspb.Message.setProto3FloatField(this, 2, value);
};


/**
 * optional double market_value = 3;
 * @return {number}
 */
proto.treum.risk.Position.prototype.getMarketValue = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 3, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.Position} returns this
 */
proto.treum.risk.Position.prototype.setMarketValue = function(value) {
  return jspb.Message.setProto3FloatField(this, 3, value);
};


/**
 * optional double unrealized_pnl = 4;
 * @return {number}
 */
proto.treum.risk.Position.prototype.getUnrealizedPnl = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 4, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.Position} returns this
 */
proto.treum.risk.Position.prototype.setUnrealizedPnl = function(value) {
  return jspb.Message.setProto3FloatField(this, 4, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.treum.risk.MarketData.prototype.toObject = function(opt_includeInstance) {
  return proto.treum.risk.MarketData.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.treum.risk.MarketData} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.MarketData.toObject = function(includeInstance, msg) {
  var f, obj = {
    volatility: jspb.Message.getFloatingPointFieldWithDefault(msg, 1, 0.0),
    liquidity: jspb.Message.getFloatingPointFieldWithDefault(msg, 2, 0.0),
    beta: jspb.Message.getFloatingPointFieldWithDefault(msg, 3, 0.0),
    correlation: jspb.Message.getFloatingPointFieldWithDefault(msg, 4, 0.0)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.treum.risk.MarketData}
 */
proto.treum.risk.MarketData.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.treum.risk.MarketData;
  return proto.treum.risk.MarketData.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.treum.risk.MarketData} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.treum.risk.MarketData}
 */
proto.treum.risk.MarketData.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setVolatility(value);
      break;
    case 2:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setLiquidity(value);
      break;
    case 3:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setBeta(value);
      break;
    case 4:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setCorrelation(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.treum.risk.MarketData.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.treum.risk.MarketData.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.treum.risk.MarketData} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.MarketData.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getVolatility();
  if (f !== 0.0) {
    writer.writeDouble(
      1,
      f
    );
  }
  f = message.getLiquidity();
  if (f !== 0.0) {
    writer.writeDouble(
      2,
      f
    );
  }
  f = message.getBeta();
  if (f !== 0.0) {
    writer.writeDouble(
      3,
      f
    );
  }
  f = message.getCorrelation();
  if (f !== 0.0) {
    writer.writeDouble(
      4,
      f
    );
  }
};


/**
 * optional double volatility = 1;
 * @return {number}
 */
proto.treum.risk.MarketData.prototype.getVolatility = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 1, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.MarketData} returns this
 */
proto.treum.risk.MarketData.prototype.setVolatility = function(value) {
  return jspb.Message.setProto3FloatField(this, 1, value);
};


/**
 * optional double liquidity = 2;
 * @return {number}
 */
proto.treum.risk.MarketData.prototype.getLiquidity = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 2, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.MarketData} returns this
 */
proto.treum.risk.MarketData.prototype.setLiquidity = function(value) {
  return jspb.Message.setProto3FloatField(this, 2, value);
};


/**
 * optional double beta = 3;
 * @return {number}
 */
proto.treum.risk.MarketData.prototype.getBeta = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 3, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.MarketData} returns this
 */
proto.treum.risk.MarketData.prototype.setBeta = function(value) {
  return jspb.Message.setProto3FloatField(this, 3, value);
};


/**
 * optional double correlation = 4;
 * @return {number}
 */
proto.treum.risk.MarketData.prototype.getCorrelation = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 4, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.MarketData} returns this
 */
proto.treum.risk.MarketData.prototype.setCorrelation = function(value) {
  return jspb.Message.setProto3FloatField(this, 4, value);
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.treum.risk.TradeRiskResponse.repeatedFields_ = [3,4,5];



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.treum.risk.TradeRiskResponse.prototype.toObject = function(opt_includeInstance) {
  return proto.treum.risk.TradeRiskResponse.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.treum.risk.TradeRiskResponse} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.TradeRiskResponse.toObject = function(includeInstance, msg) {
  var f, obj = {
    riskLevel: jspb.Message.getFieldWithDefault(msg, 1, 0),
    riskScore: jspb.Message.getFloatingPointFieldWithDefault(msg, 2, 0.0),
    riskFactorsList: jspb.Message.toObjectList(msg.getRiskFactorsList(),
    proto.treum.risk.RiskFactor.toObject, includeInstance),
    recommendationsList: (f = jspb.Message.getRepeatedField(msg, 4)) == null ? undefined : f,
    warningsList: (f = jspb.Message.getRepeatedField(msg, 5)) == null ? undefined : f,
    approved: jspb.Message.getBooleanFieldWithDefault(msg, 6, false),
    maxPositionSize: jspb.Message.getFloatingPointFieldWithDefault(msg, 7, 0.0),
    suggestedStopLoss: jspb.Message.getFloatingPointFieldWithDefault(msg, 8, 0.0)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.treum.risk.TradeRiskResponse}
 */
proto.treum.risk.TradeRiskResponse.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.treum.risk.TradeRiskResponse;
  return proto.treum.risk.TradeRiskResponse.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.treum.risk.TradeRiskResponse} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.treum.risk.TradeRiskResponse}
 */
proto.treum.risk.TradeRiskResponse.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!proto.treum.risk.RiskLevel} */ (reader.readEnum());
      msg.setRiskLevel(value);
      break;
    case 2:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setRiskScore(value);
      break;
    case 3:
      var value = new proto.treum.risk.RiskFactor;
      reader.readMessage(value,proto.treum.risk.RiskFactor.deserializeBinaryFromReader);
      msg.addRiskFactors(value);
      break;
    case 4:
      var value = /** @type {string} */ (reader.readString());
      msg.addRecommendations(value);
      break;
    case 5:
      var value = /** @type {string} */ (reader.readString());
      msg.addWarnings(value);
      break;
    case 6:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setApproved(value);
      break;
    case 7:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setMaxPositionSize(value);
      break;
    case 8:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setSuggestedStopLoss(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.treum.risk.TradeRiskResponse.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.treum.risk.TradeRiskResponse.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.treum.risk.TradeRiskResponse} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.TradeRiskResponse.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getRiskLevel();
  if (f !== 0.0) {
    writer.writeEnum(
      1,
      f
    );
  }
  f = message.getRiskScore();
  if (f !== 0.0) {
    writer.writeDouble(
      2,
      f
    );
  }
  f = message.getRiskFactorsList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      3,
      f,
      proto.treum.risk.RiskFactor.serializeBinaryToWriter
    );
  }
  f = message.getRecommendationsList();
  if (f.length > 0) {
    writer.writeRepeatedString(
      4,
      f
    );
  }
  f = message.getWarningsList();
  if (f.length > 0) {
    writer.writeRepeatedString(
      5,
      f
    );
  }
  f = message.getApproved();
  if (f) {
    writer.writeBool(
      6,
      f
    );
  }
  f = message.getMaxPositionSize();
  if (f !== 0.0) {
    writer.writeDouble(
      7,
      f
    );
  }
  f = message.getSuggestedStopLoss();
  if (f !== 0.0) {
    writer.writeDouble(
      8,
      f
    );
  }
};


/**
 * optional RiskLevel risk_level = 1;
 * @return {!proto.treum.risk.RiskLevel}
 */
proto.treum.risk.TradeRiskResponse.prototype.getRiskLevel = function() {
  return /** @type {!proto.treum.risk.RiskLevel} */ (jspb.Message.getFieldWithDefault(this, 1, 0));
};


/**
 * @param {!proto.treum.risk.RiskLevel} value
 * @return {!proto.treum.risk.TradeRiskResponse} returns this
 */
proto.treum.risk.TradeRiskResponse.prototype.setRiskLevel = function(value) {
  return jspb.Message.setProto3EnumField(this, 1, value);
};


/**
 * optional double risk_score = 2;
 * @return {number}
 */
proto.treum.risk.TradeRiskResponse.prototype.getRiskScore = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 2, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.TradeRiskResponse} returns this
 */
proto.treum.risk.TradeRiskResponse.prototype.setRiskScore = function(value) {
  return jspb.Message.setProto3FloatField(this, 2, value);
};


/**
 * repeated RiskFactor risk_factors = 3;
 * @return {!Array<!proto.treum.risk.RiskFactor>}
 */
proto.treum.risk.TradeRiskResponse.prototype.getRiskFactorsList = function() {
  return /** @type{!Array<!proto.treum.risk.RiskFactor>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.treum.risk.RiskFactor, 3));
};


/**
 * @param {!Array<!proto.treum.risk.RiskFactor>} value
 * @return {!proto.treum.risk.TradeRiskResponse} returns this
*/
proto.treum.risk.TradeRiskResponse.prototype.setRiskFactorsList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 3, value);
};


/**
 * @param {!proto.treum.risk.RiskFactor=} opt_value
 * @param {number=} opt_index
 * @return {!proto.treum.risk.RiskFactor}
 */
proto.treum.risk.TradeRiskResponse.prototype.addRiskFactors = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 3, opt_value, proto.treum.risk.RiskFactor, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.treum.risk.TradeRiskResponse} returns this
 */
proto.treum.risk.TradeRiskResponse.prototype.clearRiskFactorsList = function() {
  return this.setRiskFactorsList([]);
};


/**
 * repeated string recommendations = 4;
 * @return {!Array<string>}
 */
proto.treum.risk.TradeRiskResponse.prototype.getRecommendationsList = function() {
  return /** @type {!Array<string>} */ (jspb.Message.getRepeatedField(this, 4));
};


/**
 * @param {!Array<string>} value
 * @return {!proto.treum.risk.TradeRiskResponse} returns this
 */
proto.treum.risk.TradeRiskResponse.prototype.setRecommendationsList = function(value) {
  return jspb.Message.setField(this, 4, value || []);
};


/**
 * @param {string} value
 * @param {number=} opt_index
 * @return {!proto.treum.risk.TradeRiskResponse} returns this
 */
proto.treum.risk.TradeRiskResponse.prototype.addRecommendations = function(value, opt_index) {
  return jspb.Message.addToRepeatedField(this, 4, value, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.treum.risk.TradeRiskResponse} returns this
 */
proto.treum.risk.TradeRiskResponse.prototype.clearRecommendationsList = function() {
  return this.setRecommendationsList([]);
};


/**
 * repeated string warnings = 5;
 * @return {!Array<string>}
 */
proto.treum.risk.TradeRiskResponse.prototype.getWarningsList = function() {
  return /** @type {!Array<string>} */ (jspb.Message.getRepeatedField(this, 5));
};


/**
 * @param {!Array<string>} value
 * @return {!proto.treum.risk.TradeRiskResponse} returns this
 */
proto.treum.risk.TradeRiskResponse.prototype.setWarningsList = function(value) {
  return jspb.Message.setField(this, 5, value || []);
};


/**
 * @param {string} value
 * @param {number=} opt_index
 * @return {!proto.treum.risk.TradeRiskResponse} returns this
 */
proto.treum.risk.TradeRiskResponse.prototype.addWarnings = function(value, opt_index) {
  return jspb.Message.addToRepeatedField(this, 5, value, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.treum.risk.TradeRiskResponse} returns this
 */
proto.treum.risk.TradeRiskResponse.prototype.clearWarningsList = function() {
  return this.setWarningsList([]);
};


/**
 * optional bool approved = 6;
 * @return {boolean}
 */
proto.treum.risk.TradeRiskResponse.prototype.getApproved = function() {
  return /** @type {boolean} */ (jspb.Message.getBooleanFieldWithDefault(this, 6, false));
};


/**
 * @param {boolean} value
 * @return {!proto.treum.risk.TradeRiskResponse} returns this
 */
proto.treum.risk.TradeRiskResponse.prototype.setApproved = function(value) {
  return jspb.Message.setProto3BooleanField(this, 6, value);
};


/**
 * optional double max_position_size = 7;
 * @return {number}
 */
proto.treum.risk.TradeRiskResponse.prototype.getMaxPositionSize = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 7, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.TradeRiskResponse} returns this
 */
proto.treum.risk.TradeRiskResponse.prototype.setMaxPositionSize = function(value) {
  return jspb.Message.setProto3FloatField(this, 7, value);
};


/**
 * optional double suggested_stop_loss = 8;
 * @return {number}
 */
proto.treum.risk.TradeRiskResponse.prototype.getSuggestedStopLoss = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 8, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.TradeRiskResponse} returns this
 */
proto.treum.risk.TradeRiskResponse.prototype.setSuggestedStopLoss = function(value) {
  return jspb.Message.setProto3FloatField(this, 8, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.treum.risk.RiskFactor.prototype.toObject = function(opt_includeInstance) {
  return proto.treum.risk.RiskFactor.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.treum.risk.RiskFactor} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.RiskFactor.toObject = function(includeInstance, msg) {
  var f, obj = {
    factor: jspb.Message.getFieldWithDefault(msg, 1, ""),
    value: jspb.Message.getFloatingPointFieldWithDefault(msg, 2, 0.0),
    weight: jspb.Message.getFloatingPointFieldWithDefault(msg, 3, 0.0),
    contribution: jspb.Message.getFloatingPointFieldWithDefault(msg, 4, 0.0),
    description: jspb.Message.getFieldWithDefault(msg, 5, "")
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.treum.risk.RiskFactor}
 */
proto.treum.risk.RiskFactor.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.treum.risk.RiskFactor;
  return proto.treum.risk.RiskFactor.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.treum.risk.RiskFactor} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.treum.risk.RiskFactor}
 */
proto.treum.risk.RiskFactor.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setFactor(value);
      break;
    case 2:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setValue(value);
      break;
    case 3:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setWeight(value);
      break;
    case 4:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setContribution(value);
      break;
    case 5:
      var value = /** @type {string} */ (reader.readString());
      msg.setDescription(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.treum.risk.RiskFactor.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.treum.risk.RiskFactor.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.treum.risk.RiskFactor} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.RiskFactor.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getFactor();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getValue();
  if (f !== 0.0) {
    writer.writeDouble(
      2,
      f
    );
  }
  f = message.getWeight();
  if (f !== 0.0) {
    writer.writeDouble(
      3,
      f
    );
  }
  f = message.getContribution();
  if (f !== 0.0) {
    writer.writeDouble(
      4,
      f
    );
  }
  f = message.getDescription();
  if (f.length > 0) {
    writer.writeString(
      5,
      f
    );
  }
};


/**
 * optional string factor = 1;
 * @return {string}
 */
proto.treum.risk.RiskFactor.prototype.getFactor = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.RiskFactor} returns this
 */
proto.treum.risk.RiskFactor.prototype.setFactor = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional double value = 2;
 * @return {number}
 */
proto.treum.risk.RiskFactor.prototype.getValue = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 2, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.RiskFactor} returns this
 */
proto.treum.risk.RiskFactor.prototype.setValue = function(value) {
  return jspb.Message.setProto3FloatField(this, 2, value);
};


/**
 * optional double weight = 3;
 * @return {number}
 */
proto.treum.risk.RiskFactor.prototype.getWeight = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 3, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.RiskFactor} returns this
 */
proto.treum.risk.RiskFactor.prototype.setWeight = function(value) {
  return jspb.Message.setProto3FloatField(this, 3, value);
};


/**
 * optional double contribution = 4;
 * @return {number}
 */
proto.treum.risk.RiskFactor.prototype.getContribution = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 4, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.RiskFactor} returns this
 */
proto.treum.risk.RiskFactor.prototype.setContribution = function(value) {
  return jspb.Message.setProto3FloatField(this, 4, value);
};


/**
 * optional string description = 5;
 * @return {string}
 */
proto.treum.risk.RiskFactor.prototype.getDescription = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 5, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.RiskFactor} returns this
 */
proto.treum.risk.RiskFactor.prototype.setDescription = function(value) {
  return jspb.Message.setProto3StringField(this, 5, value);
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.treum.risk.CalculatePortfolioRiskRequest.repeatedFields_ = [8,9,10];



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.treum.risk.CalculatePortfolioRiskRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.treum.risk.CalculatePortfolioRiskRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.treum.risk.CalculatePortfolioRiskRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.CalculatePortfolioRiskRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    userId: jspb.Message.getFieldWithDefault(msg, 1, ""),
    accountId: jspb.Message.getFieldWithDefault(msg, 2, ""),
    portfolioId: jspb.Message.getFieldWithDefault(msg, 3, ""),
    totalValue: jspb.Message.getFloatingPointFieldWithDefault(msg, 4, 0.0),
    availableBalance: jspb.Message.getFloatingPointFieldWithDefault(msg, 5, 0.0),
    usedMargin: jspb.Message.getFloatingPointFieldWithDefault(msg, 6, 0.0),
    leverage: jspb.Message.getFloatingPointFieldWithDefault(msg, 7, 0.0),
    positionsList: jspb.Message.toObjectList(msg.getPositionsList(),
    proto.treum.risk.PortfolioPosition.toObject, includeInstance),
    historicalReturnsList: (f = jspb.Message.getRepeatedFloatingPointField(msg, 9)) == null ? undefined : f,
    benchmarkReturnsList: (f = jspb.Message.getRepeatedFloatingPointField(msg, 10)) == null ? undefined : f
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.treum.risk.CalculatePortfolioRiskRequest}
 */
proto.treum.risk.CalculatePortfolioRiskRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.treum.risk.CalculatePortfolioRiskRequest;
  return proto.treum.risk.CalculatePortfolioRiskRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.treum.risk.CalculatePortfolioRiskRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.treum.risk.CalculatePortfolioRiskRequest}
 */
proto.treum.risk.CalculatePortfolioRiskRequest.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setUserId(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setAccountId(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readString());
      msg.setPortfolioId(value);
      break;
    case 4:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setTotalValue(value);
      break;
    case 5:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setAvailableBalance(value);
      break;
    case 6:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setUsedMargin(value);
      break;
    case 7:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setLeverage(value);
      break;
    case 8:
      var value = new proto.treum.risk.PortfolioPosition;
      reader.readMessage(value,proto.treum.risk.PortfolioPosition.deserializeBinaryFromReader);
      msg.addPositions(value);
      break;
    case 9:
      var values = /** @type {!Array<number>} */ (reader.isDelimited() ? reader.readPackedDouble() : [reader.readDouble()]);
      for (var i = 0; i < values.length; i++) {
        msg.addHistoricalReturns(values[i]);
      }
      break;
    case 10:
      var values = /** @type {!Array<number>} */ (reader.isDelimited() ? reader.readPackedDouble() : [reader.readDouble()]);
      for (var i = 0; i < values.length; i++) {
        msg.addBenchmarkReturns(values[i]);
      }
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.treum.risk.CalculatePortfolioRiskRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.treum.risk.CalculatePortfolioRiskRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.treum.risk.CalculatePortfolioRiskRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.CalculatePortfolioRiskRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getUserId();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getAccountId();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
  f = message.getPortfolioId();
  if (f.length > 0) {
    writer.writeString(
      3,
      f
    );
  }
  f = message.getTotalValue();
  if (f !== 0.0) {
    writer.writeDouble(
      4,
      f
    );
  }
  f = message.getAvailableBalance();
  if (f !== 0.0) {
    writer.writeDouble(
      5,
      f
    );
  }
  f = message.getUsedMargin();
  if (f !== 0.0) {
    writer.writeDouble(
      6,
      f
    );
  }
  f = message.getLeverage();
  if (f !== 0.0) {
    writer.writeDouble(
      7,
      f
    );
  }
  f = message.getPositionsList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      8,
      f,
      proto.treum.risk.PortfolioPosition.serializeBinaryToWriter
    );
  }
  f = message.getHistoricalReturnsList();
  if (f.length > 0) {
    writer.writePackedDouble(
      9,
      f
    );
  }
  f = message.getBenchmarkReturnsList();
  if (f.length > 0) {
    writer.writePackedDouble(
      10,
      f
    );
  }
};


/**
 * optional string user_id = 1;
 * @return {string}
 */
proto.treum.risk.CalculatePortfolioRiskRequest.prototype.getUserId = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.CalculatePortfolioRiskRequest} returns this
 */
proto.treum.risk.CalculatePortfolioRiskRequest.prototype.setUserId = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional string account_id = 2;
 * @return {string}
 */
proto.treum.risk.CalculatePortfolioRiskRequest.prototype.getAccountId = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.CalculatePortfolioRiskRequest} returns this
 */
proto.treum.risk.CalculatePortfolioRiskRequest.prototype.setAccountId = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};


/**
 * optional string portfolio_id = 3;
 * @return {string}
 */
proto.treum.risk.CalculatePortfolioRiskRequest.prototype.getPortfolioId = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.CalculatePortfolioRiskRequest} returns this
 */
proto.treum.risk.CalculatePortfolioRiskRequest.prototype.setPortfolioId = function(value) {
  return jspb.Message.setProto3StringField(this, 3, value);
};


/**
 * optional double total_value = 4;
 * @return {number}
 */
proto.treum.risk.CalculatePortfolioRiskRequest.prototype.getTotalValue = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 4, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.CalculatePortfolioRiskRequest} returns this
 */
proto.treum.risk.CalculatePortfolioRiskRequest.prototype.setTotalValue = function(value) {
  return jspb.Message.setProto3FloatField(this, 4, value);
};


/**
 * optional double available_balance = 5;
 * @return {number}
 */
proto.treum.risk.CalculatePortfolioRiskRequest.prototype.getAvailableBalance = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 5, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.CalculatePortfolioRiskRequest} returns this
 */
proto.treum.risk.CalculatePortfolioRiskRequest.prototype.setAvailableBalance = function(value) {
  return jspb.Message.setProto3FloatField(this, 5, value);
};


/**
 * optional double used_margin = 6;
 * @return {number}
 */
proto.treum.risk.CalculatePortfolioRiskRequest.prototype.getUsedMargin = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 6, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.CalculatePortfolioRiskRequest} returns this
 */
proto.treum.risk.CalculatePortfolioRiskRequest.prototype.setUsedMargin = function(value) {
  return jspb.Message.setProto3FloatField(this, 6, value);
};


/**
 * optional double leverage = 7;
 * @return {number}
 */
proto.treum.risk.CalculatePortfolioRiskRequest.prototype.getLeverage = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 7, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.CalculatePortfolioRiskRequest} returns this
 */
proto.treum.risk.CalculatePortfolioRiskRequest.prototype.setLeverage = function(value) {
  return jspb.Message.setProto3FloatField(this, 7, value);
};


/**
 * repeated PortfolioPosition positions = 8;
 * @return {!Array<!proto.treum.risk.PortfolioPosition>}
 */
proto.treum.risk.CalculatePortfolioRiskRequest.prototype.getPositionsList = function() {
  return /** @type{!Array<!proto.treum.risk.PortfolioPosition>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.treum.risk.PortfolioPosition, 8));
};


/**
 * @param {!Array<!proto.treum.risk.PortfolioPosition>} value
 * @return {!proto.treum.risk.CalculatePortfolioRiskRequest} returns this
*/
proto.treum.risk.CalculatePortfolioRiskRequest.prototype.setPositionsList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 8, value);
};


/**
 * @param {!proto.treum.risk.PortfolioPosition=} opt_value
 * @param {number=} opt_index
 * @return {!proto.treum.risk.PortfolioPosition}
 */
proto.treum.risk.CalculatePortfolioRiskRequest.prototype.addPositions = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 8, opt_value, proto.treum.risk.PortfolioPosition, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.treum.risk.CalculatePortfolioRiskRequest} returns this
 */
proto.treum.risk.CalculatePortfolioRiskRequest.prototype.clearPositionsList = function() {
  return this.setPositionsList([]);
};


/**
 * repeated double historical_returns = 9;
 * @return {!Array<number>}
 */
proto.treum.risk.CalculatePortfolioRiskRequest.prototype.getHistoricalReturnsList = function() {
  return /** @type {!Array<number>} */ (jspb.Message.getRepeatedFloatingPointField(this, 9));
};


/**
 * @param {!Array<number>} value
 * @return {!proto.treum.risk.CalculatePortfolioRiskRequest} returns this
 */
proto.treum.risk.CalculatePortfolioRiskRequest.prototype.setHistoricalReturnsList = function(value) {
  return jspb.Message.setField(this, 9, value || []);
};


/**
 * @param {number} value
 * @param {number=} opt_index
 * @return {!proto.treum.risk.CalculatePortfolioRiskRequest} returns this
 */
proto.treum.risk.CalculatePortfolioRiskRequest.prototype.addHistoricalReturns = function(value, opt_index) {
  return jspb.Message.addToRepeatedField(this, 9, value, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.treum.risk.CalculatePortfolioRiskRequest} returns this
 */
proto.treum.risk.CalculatePortfolioRiskRequest.prototype.clearHistoricalReturnsList = function() {
  return this.setHistoricalReturnsList([]);
};


/**
 * repeated double benchmark_returns = 10;
 * @return {!Array<number>}
 */
proto.treum.risk.CalculatePortfolioRiskRequest.prototype.getBenchmarkReturnsList = function() {
  return /** @type {!Array<number>} */ (jspb.Message.getRepeatedFloatingPointField(this, 10));
};


/**
 * @param {!Array<number>} value
 * @return {!proto.treum.risk.CalculatePortfolioRiskRequest} returns this
 */
proto.treum.risk.CalculatePortfolioRiskRequest.prototype.setBenchmarkReturnsList = function(value) {
  return jspb.Message.setField(this, 10, value || []);
};


/**
 * @param {number} value
 * @param {number=} opt_index
 * @return {!proto.treum.risk.CalculatePortfolioRiskRequest} returns this
 */
proto.treum.risk.CalculatePortfolioRiskRequest.prototype.addBenchmarkReturns = function(value, opt_index) {
  return jspb.Message.addToRepeatedField(this, 10, value, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.treum.risk.CalculatePortfolioRiskRequest} returns this
 */
proto.treum.risk.CalculatePortfolioRiskRequest.prototype.clearBenchmarkReturnsList = function() {
  return this.setBenchmarkReturnsList([]);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.treum.risk.PortfolioPosition.prototype.toObject = function(opt_includeInstance) {
  return proto.treum.risk.PortfolioPosition.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.treum.risk.PortfolioPosition} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.PortfolioPosition.toObject = function(includeInstance, msg) {
  var f, obj = {
    symbol: jspb.Message.getFieldWithDefault(msg, 1, ""),
    assetType: jspb.Message.getFieldWithDefault(msg, 2, ""),
    quantity: jspb.Message.getFloatingPointFieldWithDefault(msg, 3, 0.0),
    averagePrice: jspb.Message.getFloatingPointFieldWithDefault(msg, 4, 0.0),
    currentPrice: jspb.Message.getFloatingPointFieldWithDefault(msg, 5, 0.0),
    marketValue: jspb.Message.getFloatingPointFieldWithDefault(msg, 6, 0.0),
    unrealizedPnl: jspb.Message.getFloatingPointFieldWithDefault(msg, 7, 0.0),
    sector: jspb.Message.getFieldWithDefault(msg, 8, ""),
    currency: jspb.Message.getFieldWithDefault(msg, 9, ""),
    beta: jspb.Message.getFloatingPointFieldWithDefault(msg, 10, 0.0),
    volatility: jspb.Message.getFloatingPointFieldWithDefault(msg, 11, 0.0)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.treum.risk.PortfolioPosition}
 */
proto.treum.risk.PortfolioPosition.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.treum.risk.PortfolioPosition;
  return proto.treum.risk.PortfolioPosition.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.treum.risk.PortfolioPosition} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.treum.risk.PortfolioPosition}
 */
proto.treum.risk.PortfolioPosition.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setSymbol(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setAssetType(value);
      break;
    case 3:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setQuantity(value);
      break;
    case 4:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setAveragePrice(value);
      break;
    case 5:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setCurrentPrice(value);
      break;
    case 6:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setMarketValue(value);
      break;
    case 7:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setUnrealizedPnl(value);
      break;
    case 8:
      var value = /** @type {string} */ (reader.readString());
      msg.setSector(value);
      break;
    case 9:
      var value = /** @type {string} */ (reader.readString());
      msg.setCurrency(value);
      break;
    case 10:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setBeta(value);
      break;
    case 11:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setVolatility(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.treum.risk.PortfolioPosition.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.treum.risk.PortfolioPosition.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.treum.risk.PortfolioPosition} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.PortfolioPosition.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getSymbol();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getAssetType();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
  f = message.getQuantity();
  if (f !== 0.0) {
    writer.writeDouble(
      3,
      f
    );
  }
  f = message.getAveragePrice();
  if (f !== 0.0) {
    writer.writeDouble(
      4,
      f
    );
  }
  f = message.getCurrentPrice();
  if (f !== 0.0) {
    writer.writeDouble(
      5,
      f
    );
  }
  f = message.getMarketValue();
  if (f !== 0.0) {
    writer.writeDouble(
      6,
      f
    );
  }
  f = message.getUnrealizedPnl();
  if (f !== 0.0) {
    writer.writeDouble(
      7,
      f
    );
  }
  f = message.getSector();
  if (f.length > 0) {
    writer.writeString(
      8,
      f
    );
  }
  f = message.getCurrency();
  if (f.length > 0) {
    writer.writeString(
      9,
      f
    );
  }
  f = message.getBeta();
  if (f !== 0.0) {
    writer.writeDouble(
      10,
      f
    );
  }
  f = message.getVolatility();
  if (f !== 0.0) {
    writer.writeDouble(
      11,
      f
    );
  }
};


/**
 * optional string symbol = 1;
 * @return {string}
 */
proto.treum.risk.PortfolioPosition.prototype.getSymbol = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.PortfolioPosition} returns this
 */
proto.treum.risk.PortfolioPosition.prototype.setSymbol = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional string asset_type = 2;
 * @return {string}
 */
proto.treum.risk.PortfolioPosition.prototype.getAssetType = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.PortfolioPosition} returns this
 */
proto.treum.risk.PortfolioPosition.prototype.setAssetType = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};


/**
 * optional double quantity = 3;
 * @return {number}
 */
proto.treum.risk.PortfolioPosition.prototype.getQuantity = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 3, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.PortfolioPosition} returns this
 */
proto.treum.risk.PortfolioPosition.prototype.setQuantity = function(value) {
  return jspb.Message.setProto3FloatField(this, 3, value);
};


/**
 * optional double average_price = 4;
 * @return {number}
 */
proto.treum.risk.PortfolioPosition.prototype.getAveragePrice = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 4, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.PortfolioPosition} returns this
 */
proto.treum.risk.PortfolioPosition.prototype.setAveragePrice = function(value) {
  return jspb.Message.setProto3FloatField(this, 4, value);
};


/**
 * optional double current_price = 5;
 * @return {number}
 */
proto.treum.risk.PortfolioPosition.prototype.getCurrentPrice = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 5, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.PortfolioPosition} returns this
 */
proto.treum.risk.PortfolioPosition.prototype.setCurrentPrice = function(value) {
  return jspb.Message.setProto3FloatField(this, 5, value);
};


/**
 * optional double market_value = 6;
 * @return {number}
 */
proto.treum.risk.PortfolioPosition.prototype.getMarketValue = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 6, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.PortfolioPosition} returns this
 */
proto.treum.risk.PortfolioPosition.prototype.setMarketValue = function(value) {
  return jspb.Message.setProto3FloatField(this, 6, value);
};


/**
 * optional double unrealized_pnl = 7;
 * @return {number}
 */
proto.treum.risk.PortfolioPosition.prototype.getUnrealizedPnl = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 7, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.PortfolioPosition} returns this
 */
proto.treum.risk.PortfolioPosition.prototype.setUnrealizedPnl = function(value) {
  return jspb.Message.setProto3FloatField(this, 7, value);
};


/**
 * optional string sector = 8;
 * @return {string}
 */
proto.treum.risk.PortfolioPosition.prototype.getSector = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 8, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.PortfolioPosition} returns this
 */
proto.treum.risk.PortfolioPosition.prototype.setSector = function(value) {
  return jspb.Message.setProto3StringField(this, 8, value);
};


/**
 * optional string currency = 9;
 * @return {string}
 */
proto.treum.risk.PortfolioPosition.prototype.getCurrency = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 9, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.PortfolioPosition} returns this
 */
proto.treum.risk.PortfolioPosition.prototype.setCurrency = function(value) {
  return jspb.Message.setProto3StringField(this, 9, value);
};


/**
 * optional double beta = 10;
 * @return {number}
 */
proto.treum.risk.PortfolioPosition.prototype.getBeta = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 10, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.PortfolioPosition} returns this
 */
proto.treum.risk.PortfolioPosition.prototype.setBeta = function(value) {
  return jspb.Message.setProto3FloatField(this, 10, value);
};


/**
 * optional double volatility = 11;
 * @return {number}
 */
proto.treum.risk.PortfolioPosition.prototype.getVolatility = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 11, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.PortfolioPosition} returns this
 */
proto.treum.risk.PortfolioPosition.prototype.setVolatility = function(value) {
  return jspb.Message.setProto3FloatField(this, 11, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.treum.risk.PortfolioRiskResponse.prototype.toObject = function(opt_includeInstance) {
  return proto.treum.risk.PortfolioRiskResponse.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.treum.risk.PortfolioRiskResponse} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.PortfolioRiskResponse.toObject = function(includeInstance, msg) {
  var f, obj = {
    valueAtRisk: (f = msg.getValueAtRisk()) && proto.treum.risk.ValueAtRisk.toObject(includeInstance, f),
    expectedShortfall: (f = msg.getExpectedShortfall()) && proto.treum.risk.ExpectedShortfall.toObject(includeInstance, f),
    volatility: (f = msg.getVolatility()) && proto.treum.risk.Volatility.toObject(includeInstance, f),
    sharpeRatio: jspb.Message.getFloatingPointFieldWithDefault(msg, 4, 0.0),
    sortinoRatio: jspb.Message.getFloatingPointFieldWithDefault(msg, 5, 0.0),
    maximumDrawdown: jspb.Message.getFloatingPointFieldWithDefault(msg, 6, 0.0),
    beta: jspb.Message.getFloatingPointFieldWithDefault(msg, 7, 0.0),
    concentration: (f = msg.getConcentration()) && proto.treum.risk.ConcentrationRisk.toObject(includeInstance, f),
    sectorExposureMap: (f = msg.getSectorExposureMap()) ? f.toObject(includeInstance, undefined) : [],
    currencyExposureMap: (f = msg.getCurrencyExposureMap()) ? f.toObject(includeInstance, undefined) : [],
    leverageRatio: jspb.Message.getFloatingPointFieldWithDefault(msg, 11, 0.0),
    marginUtilization: jspb.Message.getFloatingPointFieldWithDefault(msg, 12, 0.0)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.treum.risk.PortfolioRiskResponse}
 */
proto.treum.risk.PortfolioRiskResponse.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.treum.risk.PortfolioRiskResponse;
  return proto.treum.risk.PortfolioRiskResponse.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.treum.risk.PortfolioRiskResponse} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.treum.risk.PortfolioRiskResponse}
 */
proto.treum.risk.PortfolioRiskResponse.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.treum.risk.ValueAtRisk;
      reader.readMessage(value,proto.treum.risk.ValueAtRisk.deserializeBinaryFromReader);
      msg.setValueAtRisk(value);
      break;
    case 2:
      var value = new proto.treum.risk.ExpectedShortfall;
      reader.readMessage(value,proto.treum.risk.ExpectedShortfall.deserializeBinaryFromReader);
      msg.setExpectedShortfall(value);
      break;
    case 3:
      var value = new proto.treum.risk.Volatility;
      reader.readMessage(value,proto.treum.risk.Volatility.deserializeBinaryFromReader);
      msg.setVolatility(value);
      break;
    case 4:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setSharpeRatio(value);
      break;
    case 5:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setSortinoRatio(value);
      break;
    case 6:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setMaximumDrawdown(value);
      break;
    case 7:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setBeta(value);
      break;
    case 8:
      var value = new proto.treum.risk.ConcentrationRisk;
      reader.readMessage(value,proto.treum.risk.ConcentrationRisk.deserializeBinaryFromReader);
      msg.setConcentration(value);
      break;
    case 9:
      var value = msg.getSectorExposureMap();
      reader.readMessage(value, function(message, reader) {
        jspb.Map.deserializeBinary(message, reader, jspb.BinaryReader.prototype.readString, jspb.BinaryReader.prototype.readDouble, null, "", 0.0);
         });
      break;
    case 10:
      var value = msg.getCurrencyExposureMap();
      reader.readMessage(value, function(message, reader) {
        jspb.Map.deserializeBinary(message, reader, jspb.BinaryReader.prototype.readString, jspb.BinaryReader.prototype.readDouble, null, "", 0.0);
         });
      break;
    case 11:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setLeverageRatio(value);
      break;
    case 12:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setMarginUtilization(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.treum.risk.PortfolioRiskResponse.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.treum.risk.PortfolioRiskResponse.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.treum.risk.PortfolioRiskResponse} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.PortfolioRiskResponse.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getValueAtRisk();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.treum.risk.ValueAtRisk.serializeBinaryToWriter
    );
  }
  f = message.getExpectedShortfall();
  if (f != null) {
    writer.writeMessage(
      2,
      f,
      proto.treum.risk.ExpectedShortfall.serializeBinaryToWriter
    );
  }
  f = message.getVolatility();
  if (f != null) {
    writer.writeMessage(
      3,
      f,
      proto.treum.risk.Volatility.serializeBinaryToWriter
    );
  }
  f = message.getSharpeRatio();
  if (f !== 0.0) {
    writer.writeDouble(
      4,
      f
    );
  }
  f = message.getSortinoRatio();
  if (f !== 0.0) {
    writer.writeDouble(
      5,
      f
    );
  }
  f = message.getMaximumDrawdown();
  if (f !== 0.0) {
    writer.writeDouble(
      6,
      f
    );
  }
  f = message.getBeta();
  if (f !== 0.0) {
    writer.writeDouble(
      7,
      f
    );
  }
  f = message.getConcentration();
  if (f != null) {
    writer.writeMessage(
      8,
      f,
      proto.treum.risk.ConcentrationRisk.serializeBinaryToWriter
    );
  }
  f = message.getSectorExposureMap(true);
  if (f && f.getLength() > 0) {
    f.serializeBinary(9, writer, jspb.BinaryWriter.prototype.writeString, jspb.BinaryWriter.prototype.writeDouble);
  }
  f = message.getCurrencyExposureMap(true);
  if (f && f.getLength() > 0) {
    f.serializeBinary(10, writer, jspb.BinaryWriter.prototype.writeString, jspb.BinaryWriter.prototype.writeDouble);
  }
  f = message.getLeverageRatio();
  if (f !== 0.0) {
    writer.writeDouble(
      11,
      f
    );
  }
  f = message.getMarginUtilization();
  if (f !== 0.0) {
    writer.writeDouble(
      12,
      f
    );
  }
};


/**
 * optional ValueAtRisk value_at_risk = 1;
 * @return {?proto.treum.risk.ValueAtRisk}
 */
proto.treum.risk.PortfolioRiskResponse.prototype.getValueAtRisk = function() {
  return /** @type{?proto.treum.risk.ValueAtRisk} */ (
    jspb.Message.getWrapperField(this, proto.treum.risk.ValueAtRisk, 1));
};


/**
 * @param {?proto.treum.risk.ValueAtRisk|undefined} value
 * @return {!proto.treum.risk.PortfolioRiskResponse} returns this
*/
proto.treum.risk.PortfolioRiskResponse.prototype.setValueAtRisk = function(value) {
  return jspb.Message.setWrapperField(this, 1, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.treum.risk.PortfolioRiskResponse} returns this
 */
proto.treum.risk.PortfolioRiskResponse.prototype.clearValueAtRisk = function() {
  return this.setValueAtRisk(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.treum.risk.PortfolioRiskResponse.prototype.hasValueAtRisk = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional ExpectedShortfall expected_shortfall = 2;
 * @return {?proto.treum.risk.ExpectedShortfall}
 */
proto.treum.risk.PortfolioRiskResponse.prototype.getExpectedShortfall = function() {
  return /** @type{?proto.treum.risk.ExpectedShortfall} */ (
    jspb.Message.getWrapperField(this, proto.treum.risk.ExpectedShortfall, 2));
};


/**
 * @param {?proto.treum.risk.ExpectedShortfall|undefined} value
 * @return {!proto.treum.risk.PortfolioRiskResponse} returns this
*/
proto.treum.risk.PortfolioRiskResponse.prototype.setExpectedShortfall = function(value) {
  return jspb.Message.setWrapperField(this, 2, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.treum.risk.PortfolioRiskResponse} returns this
 */
proto.treum.risk.PortfolioRiskResponse.prototype.clearExpectedShortfall = function() {
  return this.setExpectedShortfall(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.treum.risk.PortfolioRiskResponse.prototype.hasExpectedShortfall = function() {
  return jspb.Message.getField(this, 2) != null;
};


/**
 * optional Volatility volatility = 3;
 * @return {?proto.treum.risk.Volatility}
 */
proto.treum.risk.PortfolioRiskResponse.prototype.getVolatility = function() {
  return /** @type{?proto.treum.risk.Volatility} */ (
    jspb.Message.getWrapperField(this, proto.treum.risk.Volatility, 3));
};


/**
 * @param {?proto.treum.risk.Volatility|undefined} value
 * @return {!proto.treum.risk.PortfolioRiskResponse} returns this
*/
proto.treum.risk.PortfolioRiskResponse.prototype.setVolatility = function(value) {
  return jspb.Message.setWrapperField(this, 3, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.treum.risk.PortfolioRiskResponse} returns this
 */
proto.treum.risk.PortfolioRiskResponse.prototype.clearVolatility = function() {
  return this.setVolatility(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.treum.risk.PortfolioRiskResponse.prototype.hasVolatility = function() {
  return jspb.Message.getField(this, 3) != null;
};


/**
 * optional double sharpe_ratio = 4;
 * @return {number}
 */
proto.treum.risk.PortfolioRiskResponse.prototype.getSharpeRatio = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 4, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.PortfolioRiskResponse} returns this
 */
proto.treum.risk.PortfolioRiskResponse.prototype.setSharpeRatio = function(value) {
  return jspb.Message.setProto3FloatField(this, 4, value);
};


/**
 * optional double sortino_ratio = 5;
 * @return {number}
 */
proto.treum.risk.PortfolioRiskResponse.prototype.getSortinoRatio = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 5, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.PortfolioRiskResponse} returns this
 */
proto.treum.risk.PortfolioRiskResponse.prototype.setSortinoRatio = function(value) {
  return jspb.Message.setProto3FloatField(this, 5, value);
};


/**
 * optional double maximum_drawdown = 6;
 * @return {number}
 */
proto.treum.risk.PortfolioRiskResponse.prototype.getMaximumDrawdown = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 6, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.PortfolioRiskResponse} returns this
 */
proto.treum.risk.PortfolioRiskResponse.prototype.setMaximumDrawdown = function(value) {
  return jspb.Message.setProto3FloatField(this, 6, value);
};


/**
 * optional double beta = 7;
 * @return {number}
 */
proto.treum.risk.PortfolioRiskResponse.prototype.getBeta = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 7, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.PortfolioRiskResponse} returns this
 */
proto.treum.risk.PortfolioRiskResponse.prototype.setBeta = function(value) {
  return jspb.Message.setProto3FloatField(this, 7, value);
};


/**
 * optional ConcentrationRisk concentration = 8;
 * @return {?proto.treum.risk.ConcentrationRisk}
 */
proto.treum.risk.PortfolioRiskResponse.prototype.getConcentration = function() {
  return /** @type{?proto.treum.risk.ConcentrationRisk} */ (
    jspb.Message.getWrapperField(this, proto.treum.risk.ConcentrationRisk, 8));
};


/**
 * @param {?proto.treum.risk.ConcentrationRisk|undefined} value
 * @return {!proto.treum.risk.PortfolioRiskResponse} returns this
*/
proto.treum.risk.PortfolioRiskResponse.prototype.setConcentration = function(value) {
  return jspb.Message.setWrapperField(this, 8, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.treum.risk.PortfolioRiskResponse} returns this
 */
proto.treum.risk.PortfolioRiskResponse.prototype.clearConcentration = function() {
  return this.setConcentration(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.treum.risk.PortfolioRiskResponse.prototype.hasConcentration = function() {
  return jspb.Message.getField(this, 8) != null;
};


/**
 * map<string, double> sector_exposure = 9;
 * @param {boolean=} opt_noLazyCreate Do not create the map if
 * empty, instead returning `undefined`
 * @return {!jspb.Map<string,number>}
 */
proto.treum.risk.PortfolioRiskResponse.prototype.getSectorExposureMap = function(opt_noLazyCreate) {
  return /** @type {!jspb.Map<string,number>} */ (
      jspb.Message.getMapField(this, 9, opt_noLazyCreate,
      null));
};


/**
 * Clears values from the map. The map will be non-null.
 * @return {!proto.treum.risk.PortfolioRiskResponse} returns this
 */
proto.treum.risk.PortfolioRiskResponse.prototype.clearSectorExposureMap = function() {
  this.getSectorExposureMap().clear();
  return this;};


/**
 * map<string, double> currency_exposure = 10;
 * @param {boolean=} opt_noLazyCreate Do not create the map if
 * empty, instead returning `undefined`
 * @return {!jspb.Map<string,number>}
 */
proto.treum.risk.PortfolioRiskResponse.prototype.getCurrencyExposureMap = function(opt_noLazyCreate) {
  return /** @type {!jspb.Map<string,number>} */ (
      jspb.Message.getMapField(this, 10, opt_noLazyCreate,
      null));
};


/**
 * Clears values from the map. The map will be non-null.
 * @return {!proto.treum.risk.PortfolioRiskResponse} returns this
 */
proto.treum.risk.PortfolioRiskResponse.prototype.clearCurrencyExposureMap = function() {
  this.getCurrencyExposureMap().clear();
  return this;};


/**
 * optional double leverage_ratio = 11;
 * @return {number}
 */
proto.treum.risk.PortfolioRiskResponse.prototype.getLeverageRatio = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 11, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.PortfolioRiskResponse} returns this
 */
proto.treum.risk.PortfolioRiskResponse.prototype.setLeverageRatio = function(value) {
  return jspb.Message.setProto3FloatField(this, 11, value);
};


/**
 * optional double margin_utilization = 12;
 * @return {number}
 */
proto.treum.risk.PortfolioRiskResponse.prototype.getMarginUtilization = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 12, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.PortfolioRiskResponse} returns this
 */
proto.treum.risk.PortfolioRiskResponse.prototype.setMarginUtilization = function(value) {
  return jspb.Message.setProto3FloatField(this, 12, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.treum.risk.ValueAtRisk.prototype.toObject = function(opt_includeInstance) {
  return proto.treum.risk.ValueAtRisk.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.treum.risk.ValueAtRisk} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.ValueAtRisk.toObject = function(includeInstance, msg) {
  var f, obj = {
    var95: jspb.Message.getFloatingPointFieldWithDefault(msg, 1, 0.0),
    var99: jspb.Message.getFloatingPointFieldWithDefault(msg, 2, 0.0),
    var999: jspb.Message.getFloatingPointFieldWithDefault(msg, 3, 0.0)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.treum.risk.ValueAtRisk}
 */
proto.treum.risk.ValueAtRisk.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.treum.risk.ValueAtRisk;
  return proto.treum.risk.ValueAtRisk.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.treum.risk.ValueAtRisk} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.treum.risk.ValueAtRisk}
 */
proto.treum.risk.ValueAtRisk.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setVar95(value);
      break;
    case 2:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setVar99(value);
      break;
    case 3:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setVar999(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.treum.risk.ValueAtRisk.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.treum.risk.ValueAtRisk.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.treum.risk.ValueAtRisk} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.ValueAtRisk.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getVar95();
  if (f !== 0.0) {
    writer.writeDouble(
      1,
      f
    );
  }
  f = message.getVar99();
  if (f !== 0.0) {
    writer.writeDouble(
      2,
      f
    );
  }
  f = message.getVar999();
  if (f !== 0.0) {
    writer.writeDouble(
      3,
      f
    );
  }
};


/**
 * optional double var95 = 1;
 * @return {number}
 */
proto.treum.risk.ValueAtRisk.prototype.getVar95 = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 1, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.ValueAtRisk} returns this
 */
proto.treum.risk.ValueAtRisk.prototype.setVar95 = function(value) {
  return jspb.Message.setProto3FloatField(this, 1, value);
};


/**
 * optional double var99 = 2;
 * @return {number}
 */
proto.treum.risk.ValueAtRisk.prototype.getVar99 = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 2, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.ValueAtRisk} returns this
 */
proto.treum.risk.ValueAtRisk.prototype.setVar99 = function(value) {
  return jspb.Message.setProto3FloatField(this, 2, value);
};


/**
 * optional double var999 = 3;
 * @return {number}
 */
proto.treum.risk.ValueAtRisk.prototype.getVar999 = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 3, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.ValueAtRisk} returns this
 */
proto.treum.risk.ValueAtRisk.prototype.setVar999 = function(value) {
  return jspb.Message.setProto3FloatField(this, 3, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.treum.risk.ExpectedShortfall.prototype.toObject = function(opt_includeInstance) {
  return proto.treum.risk.ExpectedShortfall.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.treum.risk.ExpectedShortfall} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.ExpectedShortfall.toObject = function(includeInstance, msg) {
  var f, obj = {
    es95: jspb.Message.getFloatingPointFieldWithDefault(msg, 1, 0.0),
    es99: jspb.Message.getFloatingPointFieldWithDefault(msg, 2, 0.0)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.treum.risk.ExpectedShortfall}
 */
proto.treum.risk.ExpectedShortfall.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.treum.risk.ExpectedShortfall;
  return proto.treum.risk.ExpectedShortfall.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.treum.risk.ExpectedShortfall} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.treum.risk.ExpectedShortfall}
 */
proto.treum.risk.ExpectedShortfall.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setEs95(value);
      break;
    case 2:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setEs99(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.treum.risk.ExpectedShortfall.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.treum.risk.ExpectedShortfall.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.treum.risk.ExpectedShortfall} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.ExpectedShortfall.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getEs95();
  if (f !== 0.0) {
    writer.writeDouble(
      1,
      f
    );
  }
  f = message.getEs99();
  if (f !== 0.0) {
    writer.writeDouble(
      2,
      f
    );
  }
};


/**
 * optional double es95 = 1;
 * @return {number}
 */
proto.treum.risk.ExpectedShortfall.prototype.getEs95 = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 1, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.ExpectedShortfall} returns this
 */
proto.treum.risk.ExpectedShortfall.prototype.setEs95 = function(value) {
  return jspb.Message.setProto3FloatField(this, 1, value);
};


/**
 * optional double es99 = 2;
 * @return {number}
 */
proto.treum.risk.ExpectedShortfall.prototype.getEs99 = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 2, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.ExpectedShortfall} returns this
 */
proto.treum.risk.ExpectedShortfall.prototype.setEs99 = function(value) {
  return jspb.Message.setProto3FloatField(this, 2, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.treum.risk.Volatility.prototype.toObject = function(opt_includeInstance) {
  return proto.treum.risk.Volatility.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.treum.risk.Volatility} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.Volatility.toObject = function(includeInstance, msg) {
  var f, obj = {
    daily: jspb.Message.getFloatingPointFieldWithDefault(msg, 1, 0.0),
    annualized: jspb.Message.getFloatingPointFieldWithDefault(msg, 2, 0.0)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.treum.risk.Volatility}
 */
proto.treum.risk.Volatility.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.treum.risk.Volatility;
  return proto.treum.risk.Volatility.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.treum.risk.Volatility} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.treum.risk.Volatility}
 */
proto.treum.risk.Volatility.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setDaily(value);
      break;
    case 2:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setAnnualized(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.treum.risk.Volatility.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.treum.risk.Volatility.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.treum.risk.Volatility} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.Volatility.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getDaily();
  if (f !== 0.0) {
    writer.writeDouble(
      1,
      f
    );
  }
  f = message.getAnnualized();
  if (f !== 0.0) {
    writer.writeDouble(
      2,
      f
    );
  }
};


/**
 * optional double daily = 1;
 * @return {number}
 */
proto.treum.risk.Volatility.prototype.getDaily = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 1, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.Volatility} returns this
 */
proto.treum.risk.Volatility.prototype.setDaily = function(value) {
  return jspb.Message.setProto3FloatField(this, 1, value);
};


/**
 * optional double annualized = 2;
 * @return {number}
 */
proto.treum.risk.Volatility.prototype.getAnnualized = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 2, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.Volatility} returns this
 */
proto.treum.risk.Volatility.prototype.setAnnualized = function(value) {
  return jspb.Message.setProto3FloatField(this, 2, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.treum.risk.ConcentrationRisk.prototype.toObject = function(opt_includeInstance) {
  return proto.treum.risk.ConcentrationRisk.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.treum.risk.ConcentrationRisk} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.ConcentrationRisk.toObject = function(includeInstance, msg) {
  var f, obj = {
    herfindahlIndex: jspb.Message.getFloatingPointFieldWithDefault(msg, 1, 0.0),
    topPositionWeight: jspb.Message.getFloatingPointFieldWithDefault(msg, 2, 0.0),
    top5PositionWeight: jspb.Message.getFloatingPointFieldWithDefault(msg, 3, 0.0)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.treum.risk.ConcentrationRisk}
 */
proto.treum.risk.ConcentrationRisk.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.treum.risk.ConcentrationRisk;
  return proto.treum.risk.ConcentrationRisk.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.treum.risk.ConcentrationRisk} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.treum.risk.ConcentrationRisk}
 */
proto.treum.risk.ConcentrationRisk.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setHerfindahlIndex(value);
      break;
    case 2:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setTopPositionWeight(value);
      break;
    case 3:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setTop5PositionWeight(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.treum.risk.ConcentrationRisk.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.treum.risk.ConcentrationRisk.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.treum.risk.ConcentrationRisk} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.ConcentrationRisk.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getHerfindahlIndex();
  if (f !== 0.0) {
    writer.writeDouble(
      1,
      f
    );
  }
  f = message.getTopPositionWeight();
  if (f !== 0.0) {
    writer.writeDouble(
      2,
      f
    );
  }
  f = message.getTop5PositionWeight();
  if (f !== 0.0) {
    writer.writeDouble(
      3,
      f
    );
  }
};


/**
 * optional double herfindahl_index = 1;
 * @return {number}
 */
proto.treum.risk.ConcentrationRisk.prototype.getHerfindahlIndex = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 1, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.ConcentrationRisk} returns this
 */
proto.treum.risk.ConcentrationRisk.prototype.setHerfindahlIndex = function(value) {
  return jspb.Message.setProto3FloatField(this, 1, value);
};


/**
 * optional double top_position_weight = 2;
 * @return {number}
 */
proto.treum.risk.ConcentrationRisk.prototype.getTopPositionWeight = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 2, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.ConcentrationRisk} returns this
 */
proto.treum.risk.ConcentrationRisk.prototype.setTopPositionWeight = function(value) {
  return jspb.Message.setProto3FloatField(this, 2, value);
};


/**
 * optional double top5_position_weight = 3;
 * @return {number}
 */
proto.treum.risk.ConcentrationRisk.prototype.getTop5PositionWeight = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 3, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.ConcentrationRisk} returns this
 */
proto.treum.risk.ConcentrationRisk.prototype.setTop5PositionWeight = function(value) {
  return jspb.Message.setProto3FloatField(this, 3, value);
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.treum.risk.KYCCheckRequest.repeatedFields_ = [3];



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.treum.risk.KYCCheckRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.treum.risk.KYCCheckRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.treum.risk.KYCCheckRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.KYCCheckRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    userId: jspb.Message.getFieldWithDefault(msg, 1, ""),
    personalInfo: (f = msg.getPersonalInfo()) && proto.treum.risk.PersonalInfo.toObject(includeInstance, f),
    documentsList: jspb.Message.toObjectList(msg.getDocumentsList(),
    proto.treum.risk.Document.toObject, includeInstance),
    riskProfile: jspb.Message.getFieldWithDefault(msg, 4, 0),
    investmentExperience: jspb.Message.getFieldWithDefault(msg, 5, 0),
    estimatedNetWorth: jspb.Message.getFloatingPointFieldWithDefault(msg, 6, 0.0),
    annualIncome: jspb.Message.getFloatingPointFieldWithDefault(msg, 7, 0.0)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.treum.risk.KYCCheckRequest}
 */
proto.treum.risk.KYCCheckRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.treum.risk.KYCCheckRequest;
  return proto.treum.risk.KYCCheckRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.treum.risk.KYCCheckRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.treum.risk.KYCCheckRequest}
 */
proto.treum.risk.KYCCheckRequest.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setUserId(value);
      break;
    case 2:
      var value = new proto.treum.risk.PersonalInfo;
      reader.readMessage(value,proto.treum.risk.PersonalInfo.deserializeBinaryFromReader);
      msg.setPersonalInfo(value);
      break;
    case 3:
      var value = new proto.treum.risk.Document;
      reader.readMessage(value,proto.treum.risk.Document.deserializeBinaryFromReader);
      msg.addDocuments(value);
      break;
    case 4:
      var value = /** @type {!proto.treum.risk.RiskProfile} */ (reader.readEnum());
      msg.setRiskProfile(value);
      break;
    case 5:
      var value = /** @type {!proto.treum.risk.InvestmentExperience} */ (reader.readEnum());
      msg.setInvestmentExperience(value);
      break;
    case 6:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setEstimatedNetWorth(value);
      break;
    case 7:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setAnnualIncome(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.treum.risk.KYCCheckRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.treum.risk.KYCCheckRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.treum.risk.KYCCheckRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.KYCCheckRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getUserId();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getPersonalInfo();
  if (f != null) {
    writer.writeMessage(
      2,
      f,
      proto.treum.risk.PersonalInfo.serializeBinaryToWriter
    );
  }
  f = message.getDocumentsList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      3,
      f,
      proto.treum.risk.Document.serializeBinaryToWriter
    );
  }
  f = message.getRiskProfile();
  if (f !== 0.0) {
    writer.writeEnum(
      4,
      f
    );
  }
  f = message.getInvestmentExperience();
  if (f !== 0.0) {
    writer.writeEnum(
      5,
      f
    );
  }
  f = message.getEstimatedNetWorth();
  if (f !== 0.0) {
    writer.writeDouble(
      6,
      f
    );
  }
  f = message.getAnnualIncome();
  if (f !== 0.0) {
    writer.writeDouble(
      7,
      f
    );
  }
};


/**
 * optional string user_id = 1;
 * @return {string}
 */
proto.treum.risk.KYCCheckRequest.prototype.getUserId = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.KYCCheckRequest} returns this
 */
proto.treum.risk.KYCCheckRequest.prototype.setUserId = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional PersonalInfo personal_info = 2;
 * @return {?proto.treum.risk.PersonalInfo}
 */
proto.treum.risk.KYCCheckRequest.prototype.getPersonalInfo = function() {
  return /** @type{?proto.treum.risk.PersonalInfo} */ (
    jspb.Message.getWrapperField(this, proto.treum.risk.PersonalInfo, 2));
};


/**
 * @param {?proto.treum.risk.PersonalInfo|undefined} value
 * @return {!proto.treum.risk.KYCCheckRequest} returns this
*/
proto.treum.risk.KYCCheckRequest.prototype.setPersonalInfo = function(value) {
  return jspb.Message.setWrapperField(this, 2, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.treum.risk.KYCCheckRequest} returns this
 */
proto.treum.risk.KYCCheckRequest.prototype.clearPersonalInfo = function() {
  return this.setPersonalInfo(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.treum.risk.KYCCheckRequest.prototype.hasPersonalInfo = function() {
  return jspb.Message.getField(this, 2) != null;
};


/**
 * repeated Document documents = 3;
 * @return {!Array<!proto.treum.risk.Document>}
 */
proto.treum.risk.KYCCheckRequest.prototype.getDocumentsList = function() {
  return /** @type{!Array<!proto.treum.risk.Document>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.treum.risk.Document, 3));
};


/**
 * @param {!Array<!proto.treum.risk.Document>} value
 * @return {!proto.treum.risk.KYCCheckRequest} returns this
*/
proto.treum.risk.KYCCheckRequest.prototype.setDocumentsList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 3, value);
};


/**
 * @param {!proto.treum.risk.Document=} opt_value
 * @param {number=} opt_index
 * @return {!proto.treum.risk.Document}
 */
proto.treum.risk.KYCCheckRequest.prototype.addDocuments = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 3, opt_value, proto.treum.risk.Document, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.treum.risk.KYCCheckRequest} returns this
 */
proto.treum.risk.KYCCheckRequest.prototype.clearDocumentsList = function() {
  return this.setDocumentsList([]);
};


/**
 * optional RiskProfile risk_profile = 4;
 * @return {!proto.treum.risk.RiskProfile}
 */
proto.treum.risk.KYCCheckRequest.prototype.getRiskProfile = function() {
  return /** @type {!proto.treum.risk.RiskProfile} */ (jspb.Message.getFieldWithDefault(this, 4, 0));
};


/**
 * @param {!proto.treum.risk.RiskProfile} value
 * @return {!proto.treum.risk.KYCCheckRequest} returns this
 */
proto.treum.risk.KYCCheckRequest.prototype.setRiskProfile = function(value) {
  return jspb.Message.setProto3EnumField(this, 4, value);
};


/**
 * optional InvestmentExperience investment_experience = 5;
 * @return {!proto.treum.risk.InvestmentExperience}
 */
proto.treum.risk.KYCCheckRequest.prototype.getInvestmentExperience = function() {
  return /** @type {!proto.treum.risk.InvestmentExperience} */ (jspb.Message.getFieldWithDefault(this, 5, 0));
};


/**
 * @param {!proto.treum.risk.InvestmentExperience} value
 * @return {!proto.treum.risk.KYCCheckRequest} returns this
 */
proto.treum.risk.KYCCheckRequest.prototype.setInvestmentExperience = function(value) {
  return jspb.Message.setProto3EnumField(this, 5, value);
};


/**
 * optional double estimated_net_worth = 6;
 * @return {number}
 */
proto.treum.risk.KYCCheckRequest.prototype.getEstimatedNetWorth = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 6, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.KYCCheckRequest} returns this
 */
proto.treum.risk.KYCCheckRequest.prototype.setEstimatedNetWorth = function(value) {
  return jspb.Message.setProto3FloatField(this, 6, value);
};


/**
 * optional double annual_income = 7;
 * @return {number}
 */
proto.treum.risk.KYCCheckRequest.prototype.getAnnualIncome = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 7, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.KYCCheckRequest} returns this
 */
proto.treum.risk.KYCCheckRequest.prototype.setAnnualIncome = function(value) {
  return jspb.Message.setProto3FloatField(this, 7, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.treum.risk.PersonalInfo.prototype.toObject = function(opt_includeInstance) {
  return proto.treum.risk.PersonalInfo.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.treum.risk.PersonalInfo} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.PersonalInfo.toObject = function(includeInstance, msg) {
  var f, obj = {
    fullName: jspb.Message.getFieldWithDefault(msg, 1, ""),
    dateOfBirth: jspb.Message.getFieldWithDefault(msg, 2, ""),
    nationality: jspb.Message.getFieldWithDefault(msg, 3, ""),
    address: (f = msg.getAddress()) && proto.treum.risk.Address.toObject(includeInstance, f),
    phone: jspb.Message.getFieldWithDefault(msg, 5, ""),
    email: jspb.Message.getFieldWithDefault(msg, 6, ""),
    taxId: jspb.Message.getFieldWithDefault(msg, 7, ""),
    passportNumber: jspb.Message.getFieldWithDefault(msg, 8, ""),
    drivingLicenseNumber: jspb.Message.getFieldWithDefault(msg, 9, "")
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.treum.risk.PersonalInfo}
 */
proto.treum.risk.PersonalInfo.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.treum.risk.PersonalInfo;
  return proto.treum.risk.PersonalInfo.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.treum.risk.PersonalInfo} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.treum.risk.PersonalInfo}
 */
proto.treum.risk.PersonalInfo.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setFullName(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setDateOfBirth(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readString());
      msg.setNationality(value);
      break;
    case 4:
      var value = new proto.treum.risk.Address;
      reader.readMessage(value,proto.treum.risk.Address.deserializeBinaryFromReader);
      msg.setAddress(value);
      break;
    case 5:
      var value = /** @type {string} */ (reader.readString());
      msg.setPhone(value);
      break;
    case 6:
      var value = /** @type {string} */ (reader.readString());
      msg.setEmail(value);
      break;
    case 7:
      var value = /** @type {string} */ (reader.readString());
      msg.setTaxId(value);
      break;
    case 8:
      var value = /** @type {string} */ (reader.readString());
      msg.setPassportNumber(value);
      break;
    case 9:
      var value = /** @type {string} */ (reader.readString());
      msg.setDrivingLicenseNumber(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.treum.risk.PersonalInfo.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.treum.risk.PersonalInfo.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.treum.risk.PersonalInfo} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.PersonalInfo.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getFullName();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getDateOfBirth();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
  f = message.getNationality();
  if (f.length > 0) {
    writer.writeString(
      3,
      f
    );
  }
  f = message.getAddress();
  if (f != null) {
    writer.writeMessage(
      4,
      f,
      proto.treum.risk.Address.serializeBinaryToWriter
    );
  }
  f = message.getPhone();
  if (f.length > 0) {
    writer.writeString(
      5,
      f
    );
  }
  f = message.getEmail();
  if (f.length > 0) {
    writer.writeString(
      6,
      f
    );
  }
  f = message.getTaxId();
  if (f.length > 0) {
    writer.writeString(
      7,
      f
    );
  }
  f = message.getPassportNumber();
  if (f.length > 0) {
    writer.writeString(
      8,
      f
    );
  }
  f = message.getDrivingLicenseNumber();
  if (f.length > 0) {
    writer.writeString(
      9,
      f
    );
  }
};


/**
 * optional string full_name = 1;
 * @return {string}
 */
proto.treum.risk.PersonalInfo.prototype.getFullName = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.PersonalInfo} returns this
 */
proto.treum.risk.PersonalInfo.prototype.setFullName = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional string date_of_birth = 2;
 * @return {string}
 */
proto.treum.risk.PersonalInfo.prototype.getDateOfBirth = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.PersonalInfo} returns this
 */
proto.treum.risk.PersonalInfo.prototype.setDateOfBirth = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};


/**
 * optional string nationality = 3;
 * @return {string}
 */
proto.treum.risk.PersonalInfo.prototype.getNationality = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.PersonalInfo} returns this
 */
proto.treum.risk.PersonalInfo.prototype.setNationality = function(value) {
  return jspb.Message.setProto3StringField(this, 3, value);
};


/**
 * optional Address address = 4;
 * @return {?proto.treum.risk.Address}
 */
proto.treum.risk.PersonalInfo.prototype.getAddress = function() {
  return /** @type{?proto.treum.risk.Address} */ (
    jspb.Message.getWrapperField(this, proto.treum.risk.Address, 4));
};


/**
 * @param {?proto.treum.risk.Address|undefined} value
 * @return {!proto.treum.risk.PersonalInfo} returns this
*/
proto.treum.risk.PersonalInfo.prototype.setAddress = function(value) {
  return jspb.Message.setWrapperField(this, 4, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.treum.risk.PersonalInfo} returns this
 */
proto.treum.risk.PersonalInfo.prototype.clearAddress = function() {
  return this.setAddress(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.treum.risk.PersonalInfo.prototype.hasAddress = function() {
  return jspb.Message.getField(this, 4) != null;
};


/**
 * optional string phone = 5;
 * @return {string}
 */
proto.treum.risk.PersonalInfo.prototype.getPhone = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 5, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.PersonalInfo} returns this
 */
proto.treum.risk.PersonalInfo.prototype.setPhone = function(value) {
  return jspb.Message.setProto3StringField(this, 5, value);
};


/**
 * optional string email = 6;
 * @return {string}
 */
proto.treum.risk.PersonalInfo.prototype.getEmail = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 6, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.PersonalInfo} returns this
 */
proto.treum.risk.PersonalInfo.prototype.setEmail = function(value) {
  return jspb.Message.setProto3StringField(this, 6, value);
};


/**
 * optional string tax_id = 7;
 * @return {string}
 */
proto.treum.risk.PersonalInfo.prototype.getTaxId = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 7, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.PersonalInfo} returns this
 */
proto.treum.risk.PersonalInfo.prototype.setTaxId = function(value) {
  return jspb.Message.setProto3StringField(this, 7, value);
};


/**
 * optional string passport_number = 8;
 * @return {string}
 */
proto.treum.risk.PersonalInfo.prototype.getPassportNumber = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 8, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.PersonalInfo} returns this
 */
proto.treum.risk.PersonalInfo.prototype.setPassportNumber = function(value) {
  return jspb.Message.setProto3StringField(this, 8, value);
};


/**
 * optional string driving_license_number = 9;
 * @return {string}
 */
proto.treum.risk.PersonalInfo.prototype.getDrivingLicenseNumber = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 9, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.PersonalInfo} returns this
 */
proto.treum.risk.PersonalInfo.prototype.setDrivingLicenseNumber = function(value) {
  return jspb.Message.setProto3StringField(this, 9, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.treum.risk.Address.prototype.toObject = function(opt_includeInstance) {
  return proto.treum.risk.Address.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.treum.risk.Address} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.Address.toObject = function(includeInstance, msg) {
  var f, obj = {
    street: jspb.Message.getFieldWithDefault(msg, 1, ""),
    city: jspb.Message.getFieldWithDefault(msg, 2, ""),
    state: jspb.Message.getFieldWithDefault(msg, 3, ""),
    country: jspb.Message.getFieldWithDefault(msg, 4, ""),
    postalCode: jspb.Message.getFieldWithDefault(msg, 5, "")
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.treum.risk.Address}
 */
proto.treum.risk.Address.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.treum.risk.Address;
  return proto.treum.risk.Address.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.treum.risk.Address} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.treum.risk.Address}
 */
proto.treum.risk.Address.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setStreet(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setCity(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readString());
      msg.setState(value);
      break;
    case 4:
      var value = /** @type {string} */ (reader.readString());
      msg.setCountry(value);
      break;
    case 5:
      var value = /** @type {string} */ (reader.readString());
      msg.setPostalCode(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.treum.risk.Address.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.treum.risk.Address.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.treum.risk.Address} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.Address.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getStreet();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getCity();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
  f = message.getState();
  if (f.length > 0) {
    writer.writeString(
      3,
      f
    );
  }
  f = message.getCountry();
  if (f.length > 0) {
    writer.writeString(
      4,
      f
    );
  }
  f = message.getPostalCode();
  if (f.length > 0) {
    writer.writeString(
      5,
      f
    );
  }
};


/**
 * optional string street = 1;
 * @return {string}
 */
proto.treum.risk.Address.prototype.getStreet = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.Address} returns this
 */
proto.treum.risk.Address.prototype.setStreet = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional string city = 2;
 * @return {string}
 */
proto.treum.risk.Address.prototype.getCity = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.Address} returns this
 */
proto.treum.risk.Address.prototype.setCity = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};


/**
 * optional string state = 3;
 * @return {string}
 */
proto.treum.risk.Address.prototype.getState = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.Address} returns this
 */
proto.treum.risk.Address.prototype.setState = function(value) {
  return jspb.Message.setProto3StringField(this, 3, value);
};


/**
 * optional string country = 4;
 * @return {string}
 */
proto.treum.risk.Address.prototype.getCountry = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 4, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.Address} returns this
 */
proto.treum.risk.Address.prototype.setCountry = function(value) {
  return jspb.Message.setProto3StringField(this, 4, value);
};


/**
 * optional string postal_code = 5;
 * @return {string}
 */
proto.treum.risk.Address.prototype.getPostalCode = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 5, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.Address} returns this
 */
proto.treum.risk.Address.prototype.setPostalCode = function(value) {
  return jspb.Message.setProto3StringField(this, 5, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.treum.risk.Document.prototype.toObject = function(opt_includeInstance) {
  return proto.treum.risk.Document.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.treum.risk.Document} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.Document.toObject = function(includeInstance, msg) {
  var f, obj = {
    type: jspb.Message.getFieldWithDefault(msg, 1, 0),
    url: jspb.Message.getFieldWithDefault(msg, 2, ""),
    verified: jspb.Message.getBooleanFieldWithDefault(msg, 3, false)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.treum.risk.Document}
 */
proto.treum.risk.Document.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.treum.risk.Document;
  return proto.treum.risk.Document.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.treum.risk.Document} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.treum.risk.Document}
 */
proto.treum.risk.Document.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!proto.treum.risk.DocumentType} */ (reader.readEnum());
      msg.setType(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setUrl(value);
      break;
    case 3:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setVerified(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.treum.risk.Document.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.treum.risk.Document.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.treum.risk.Document} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.Document.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getType();
  if (f !== 0.0) {
    writer.writeEnum(
      1,
      f
    );
  }
  f = message.getUrl();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
  f = message.getVerified();
  if (f) {
    writer.writeBool(
      3,
      f
    );
  }
};


/**
 * optional DocumentType type = 1;
 * @return {!proto.treum.risk.DocumentType}
 */
proto.treum.risk.Document.prototype.getType = function() {
  return /** @type {!proto.treum.risk.DocumentType} */ (jspb.Message.getFieldWithDefault(this, 1, 0));
};


/**
 * @param {!proto.treum.risk.DocumentType} value
 * @return {!proto.treum.risk.Document} returns this
 */
proto.treum.risk.Document.prototype.setType = function(value) {
  return jspb.Message.setProto3EnumField(this, 1, value);
};


/**
 * optional string url = 2;
 * @return {string}
 */
proto.treum.risk.Document.prototype.getUrl = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.Document} returns this
 */
proto.treum.risk.Document.prototype.setUrl = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};


/**
 * optional bool verified = 3;
 * @return {boolean}
 */
proto.treum.risk.Document.prototype.getVerified = function() {
  return /** @type {boolean} */ (jspb.Message.getBooleanFieldWithDefault(this, 3, false));
};


/**
 * @param {boolean} value
 * @return {!proto.treum.risk.Document} returns this
 */
proto.treum.risk.Document.prototype.setVerified = function(value) {
  return jspb.Message.setProto3BooleanField(this, 3, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.treum.risk.AMLCheckRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.treum.risk.AMLCheckRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.treum.risk.AMLCheckRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.AMLCheckRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    userId: jspb.Message.getFieldWithDefault(msg, 1, ""),
    transactionData: (f = msg.getTransactionData()) && proto.treum.risk.TransactionData.toObject(includeInstance, f),
    userProfile: (f = msg.getUserProfile()) && proto.treum.risk.UserProfile.toObject(includeInstance, f)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.treum.risk.AMLCheckRequest}
 */
proto.treum.risk.AMLCheckRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.treum.risk.AMLCheckRequest;
  return proto.treum.risk.AMLCheckRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.treum.risk.AMLCheckRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.treum.risk.AMLCheckRequest}
 */
proto.treum.risk.AMLCheckRequest.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setUserId(value);
      break;
    case 2:
      var value = new proto.treum.risk.TransactionData;
      reader.readMessage(value,proto.treum.risk.TransactionData.deserializeBinaryFromReader);
      msg.setTransactionData(value);
      break;
    case 3:
      var value = new proto.treum.risk.UserProfile;
      reader.readMessage(value,proto.treum.risk.UserProfile.deserializeBinaryFromReader);
      msg.setUserProfile(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.treum.risk.AMLCheckRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.treum.risk.AMLCheckRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.treum.risk.AMLCheckRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.AMLCheckRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getUserId();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getTransactionData();
  if (f != null) {
    writer.writeMessage(
      2,
      f,
      proto.treum.risk.TransactionData.serializeBinaryToWriter
    );
  }
  f = message.getUserProfile();
  if (f != null) {
    writer.writeMessage(
      3,
      f,
      proto.treum.risk.UserProfile.serializeBinaryToWriter
    );
  }
};


/**
 * optional string user_id = 1;
 * @return {string}
 */
proto.treum.risk.AMLCheckRequest.prototype.getUserId = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.AMLCheckRequest} returns this
 */
proto.treum.risk.AMLCheckRequest.prototype.setUserId = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional TransactionData transaction_data = 2;
 * @return {?proto.treum.risk.TransactionData}
 */
proto.treum.risk.AMLCheckRequest.prototype.getTransactionData = function() {
  return /** @type{?proto.treum.risk.TransactionData} */ (
    jspb.Message.getWrapperField(this, proto.treum.risk.TransactionData, 2));
};


/**
 * @param {?proto.treum.risk.TransactionData|undefined} value
 * @return {!proto.treum.risk.AMLCheckRequest} returns this
*/
proto.treum.risk.AMLCheckRequest.prototype.setTransactionData = function(value) {
  return jspb.Message.setWrapperField(this, 2, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.treum.risk.AMLCheckRequest} returns this
 */
proto.treum.risk.AMLCheckRequest.prototype.clearTransactionData = function() {
  return this.setTransactionData(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.treum.risk.AMLCheckRequest.prototype.hasTransactionData = function() {
  return jspb.Message.getField(this, 2) != null;
};


/**
 * optional UserProfile user_profile = 3;
 * @return {?proto.treum.risk.UserProfile}
 */
proto.treum.risk.AMLCheckRequest.prototype.getUserProfile = function() {
  return /** @type{?proto.treum.risk.UserProfile} */ (
    jspb.Message.getWrapperField(this, proto.treum.risk.UserProfile, 3));
};


/**
 * @param {?proto.treum.risk.UserProfile|undefined} value
 * @return {!proto.treum.risk.AMLCheckRequest} returns this
*/
proto.treum.risk.AMLCheckRequest.prototype.setUserProfile = function(value) {
  return jspb.Message.setWrapperField(this, 3, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.treum.risk.AMLCheckRequest} returns this
 */
proto.treum.risk.AMLCheckRequest.prototype.clearUserProfile = function() {
  return this.setUserProfile(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.treum.risk.AMLCheckRequest.prototype.hasUserProfile = function() {
  return jspb.Message.getField(this, 3) != null;
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.treum.risk.TransactionData.prototype.toObject = function(opt_includeInstance) {
  return proto.treum.risk.TransactionData.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.treum.risk.TransactionData} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.TransactionData.toObject = function(includeInstance, msg) {
  var f, obj = {
    amount: jspb.Message.getFloatingPointFieldWithDefault(msg, 1, 0.0),
    currency: jspb.Message.getFieldWithDefault(msg, 2, ""),
    sourceOfFunds: jspb.Message.getFieldWithDefault(msg, 3, ""),
    destinationAccount: jspb.Message.getFieldWithDefault(msg, 4, ""),
    purpose: jspb.Message.getFieldWithDefault(msg, 5, "")
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.treum.risk.TransactionData}
 */
proto.treum.risk.TransactionData.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.treum.risk.TransactionData;
  return proto.treum.risk.TransactionData.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.treum.risk.TransactionData} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.treum.risk.TransactionData}
 */
proto.treum.risk.TransactionData.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setAmount(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setCurrency(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readString());
      msg.setSourceOfFunds(value);
      break;
    case 4:
      var value = /** @type {string} */ (reader.readString());
      msg.setDestinationAccount(value);
      break;
    case 5:
      var value = /** @type {string} */ (reader.readString());
      msg.setPurpose(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.treum.risk.TransactionData.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.treum.risk.TransactionData.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.treum.risk.TransactionData} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.TransactionData.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getAmount();
  if (f !== 0.0) {
    writer.writeDouble(
      1,
      f
    );
  }
  f = message.getCurrency();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
  f = message.getSourceOfFunds();
  if (f.length > 0) {
    writer.writeString(
      3,
      f
    );
  }
  f = message.getDestinationAccount();
  if (f.length > 0) {
    writer.writeString(
      4,
      f
    );
  }
  f = message.getPurpose();
  if (f.length > 0) {
    writer.writeString(
      5,
      f
    );
  }
};


/**
 * optional double amount = 1;
 * @return {number}
 */
proto.treum.risk.TransactionData.prototype.getAmount = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 1, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.TransactionData} returns this
 */
proto.treum.risk.TransactionData.prototype.setAmount = function(value) {
  return jspb.Message.setProto3FloatField(this, 1, value);
};


/**
 * optional string currency = 2;
 * @return {string}
 */
proto.treum.risk.TransactionData.prototype.getCurrency = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.TransactionData} returns this
 */
proto.treum.risk.TransactionData.prototype.setCurrency = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};


/**
 * optional string source_of_funds = 3;
 * @return {string}
 */
proto.treum.risk.TransactionData.prototype.getSourceOfFunds = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.TransactionData} returns this
 */
proto.treum.risk.TransactionData.prototype.setSourceOfFunds = function(value) {
  return jspb.Message.setProto3StringField(this, 3, value);
};


/**
 * optional string destination_account = 4;
 * @return {string}
 */
proto.treum.risk.TransactionData.prototype.getDestinationAccount = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 4, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.TransactionData} returns this
 */
proto.treum.risk.TransactionData.prototype.setDestinationAccount = function(value) {
  return jspb.Message.setProto3StringField(this, 4, value);
};


/**
 * optional string purpose = 5;
 * @return {string}
 */
proto.treum.risk.TransactionData.prototype.getPurpose = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 5, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.TransactionData} returns this
 */
proto.treum.risk.TransactionData.prototype.setPurpose = function(value) {
  return jspb.Message.setProto3StringField(this, 5, value);
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.treum.risk.UserProfile.repeatedFields_ = [2];



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.treum.risk.UserProfile.prototype.toObject = function(opt_includeInstance) {
  return proto.treum.risk.UserProfile.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.treum.risk.UserProfile} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.UserProfile.toObject = function(includeInstance, msg) {
  var f, obj = {
    riskRating: jspb.Message.getFloatingPointFieldWithDefault(msg, 1, 0.0),
    previousTransactionsList: jspb.Message.toObjectList(msg.getPreviousTransactionsList(),
    proto.treum.risk.PreviousTransaction.toObject, includeInstance),
    geographicRisk: jspb.Message.getFieldWithDefault(msg, 3, 0),
    businessRelationshipDuration: jspb.Message.getFieldWithDefault(msg, 4, 0)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.treum.risk.UserProfile}
 */
proto.treum.risk.UserProfile.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.treum.risk.UserProfile;
  return proto.treum.risk.UserProfile.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.treum.risk.UserProfile} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.treum.risk.UserProfile}
 */
proto.treum.risk.UserProfile.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setRiskRating(value);
      break;
    case 2:
      var value = new proto.treum.risk.PreviousTransaction;
      reader.readMessage(value,proto.treum.risk.PreviousTransaction.deserializeBinaryFromReader);
      msg.addPreviousTransactions(value);
      break;
    case 3:
      var value = /** @type {!proto.treum.risk.GeographicRisk} */ (reader.readEnum());
      msg.setGeographicRisk(value);
      break;
    case 4:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setBusinessRelationshipDuration(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.treum.risk.UserProfile.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.treum.risk.UserProfile.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.treum.risk.UserProfile} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.UserProfile.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getRiskRating();
  if (f !== 0.0) {
    writer.writeDouble(
      1,
      f
    );
  }
  f = message.getPreviousTransactionsList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      2,
      f,
      proto.treum.risk.PreviousTransaction.serializeBinaryToWriter
    );
  }
  f = message.getGeographicRisk();
  if (f !== 0.0) {
    writer.writeEnum(
      3,
      f
    );
  }
  f = message.getBusinessRelationshipDuration();
  if (f !== 0) {
    writer.writeInt32(
      4,
      f
    );
  }
};


/**
 * optional double risk_rating = 1;
 * @return {number}
 */
proto.treum.risk.UserProfile.prototype.getRiskRating = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 1, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.UserProfile} returns this
 */
proto.treum.risk.UserProfile.prototype.setRiskRating = function(value) {
  return jspb.Message.setProto3FloatField(this, 1, value);
};


/**
 * repeated PreviousTransaction previous_transactions = 2;
 * @return {!Array<!proto.treum.risk.PreviousTransaction>}
 */
proto.treum.risk.UserProfile.prototype.getPreviousTransactionsList = function() {
  return /** @type{!Array<!proto.treum.risk.PreviousTransaction>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.treum.risk.PreviousTransaction, 2));
};


/**
 * @param {!Array<!proto.treum.risk.PreviousTransaction>} value
 * @return {!proto.treum.risk.UserProfile} returns this
*/
proto.treum.risk.UserProfile.prototype.setPreviousTransactionsList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 2, value);
};


/**
 * @param {!proto.treum.risk.PreviousTransaction=} opt_value
 * @param {number=} opt_index
 * @return {!proto.treum.risk.PreviousTransaction}
 */
proto.treum.risk.UserProfile.prototype.addPreviousTransactions = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 2, opt_value, proto.treum.risk.PreviousTransaction, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.treum.risk.UserProfile} returns this
 */
proto.treum.risk.UserProfile.prototype.clearPreviousTransactionsList = function() {
  return this.setPreviousTransactionsList([]);
};


/**
 * optional GeographicRisk geographic_risk = 3;
 * @return {!proto.treum.risk.GeographicRisk}
 */
proto.treum.risk.UserProfile.prototype.getGeographicRisk = function() {
  return /** @type {!proto.treum.risk.GeographicRisk} */ (jspb.Message.getFieldWithDefault(this, 3, 0));
};


/**
 * @param {!proto.treum.risk.GeographicRisk} value
 * @return {!proto.treum.risk.UserProfile} returns this
 */
proto.treum.risk.UserProfile.prototype.setGeographicRisk = function(value) {
  return jspb.Message.setProto3EnumField(this, 3, value);
};


/**
 * optional int32 business_relationship_duration = 4;
 * @return {number}
 */
proto.treum.risk.UserProfile.prototype.getBusinessRelationshipDuration = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 4, 0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.UserProfile} returns this
 */
proto.treum.risk.UserProfile.prototype.setBusinessRelationshipDuration = function(value) {
  return jspb.Message.setProto3IntField(this, 4, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.treum.risk.PreviousTransaction.prototype.toObject = function(opt_includeInstance) {
  return proto.treum.risk.PreviousTransaction.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.treum.risk.PreviousTransaction} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.PreviousTransaction.toObject = function(includeInstance, msg) {
  var f, obj = {
    amount: jspb.Message.getFloatingPointFieldWithDefault(msg, 1, 0.0),
    date: (f = msg.getDate()) && google_protobuf_timestamp_pb.Timestamp.toObject(includeInstance, f),
    type: jspb.Message.getFieldWithDefault(msg, 3, "")
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.treum.risk.PreviousTransaction}
 */
proto.treum.risk.PreviousTransaction.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.treum.risk.PreviousTransaction;
  return proto.treum.risk.PreviousTransaction.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.treum.risk.PreviousTransaction} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.treum.risk.PreviousTransaction}
 */
proto.treum.risk.PreviousTransaction.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setAmount(value);
      break;
    case 2:
      var value = new google_protobuf_timestamp_pb.Timestamp;
      reader.readMessage(value,google_protobuf_timestamp_pb.Timestamp.deserializeBinaryFromReader);
      msg.setDate(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readString());
      msg.setType(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.treum.risk.PreviousTransaction.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.treum.risk.PreviousTransaction.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.treum.risk.PreviousTransaction} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.PreviousTransaction.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getAmount();
  if (f !== 0.0) {
    writer.writeDouble(
      1,
      f
    );
  }
  f = message.getDate();
  if (f != null) {
    writer.writeMessage(
      2,
      f,
      google_protobuf_timestamp_pb.Timestamp.serializeBinaryToWriter
    );
  }
  f = message.getType();
  if (f.length > 0) {
    writer.writeString(
      3,
      f
    );
  }
};


/**
 * optional double amount = 1;
 * @return {number}
 */
proto.treum.risk.PreviousTransaction.prototype.getAmount = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 1, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.PreviousTransaction} returns this
 */
proto.treum.risk.PreviousTransaction.prototype.setAmount = function(value) {
  return jspb.Message.setProto3FloatField(this, 1, value);
};


/**
 * optional google.protobuf.Timestamp date = 2;
 * @return {?proto.google.protobuf.Timestamp}
 */
proto.treum.risk.PreviousTransaction.prototype.getDate = function() {
  return /** @type{?proto.google.protobuf.Timestamp} */ (
    jspb.Message.getWrapperField(this, google_protobuf_timestamp_pb.Timestamp, 2));
};


/**
 * @param {?proto.google.protobuf.Timestamp|undefined} value
 * @return {!proto.treum.risk.PreviousTransaction} returns this
*/
proto.treum.risk.PreviousTransaction.prototype.setDate = function(value) {
  return jspb.Message.setWrapperField(this, 2, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.treum.risk.PreviousTransaction} returns this
 */
proto.treum.risk.PreviousTransaction.prototype.clearDate = function() {
  return this.setDate(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.treum.risk.PreviousTransaction.prototype.hasDate = function() {
  return jspb.Message.getField(this, 2) != null;
};


/**
 * optional string type = 3;
 * @return {string}
 */
proto.treum.risk.PreviousTransaction.prototype.getType = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.PreviousTransaction} returns this
 */
proto.treum.risk.PreviousTransaction.prototype.setType = function(value) {
  return jspb.Message.setProto3StringField(this, 3, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.treum.risk.TradeComplianceCheckRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.treum.risk.TradeComplianceCheckRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.treum.risk.TradeComplianceCheckRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.TradeComplianceCheckRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    userId: jspb.Message.getFieldWithDefault(msg, 1, ""),
    accountId: jspb.Message.getFieldWithDefault(msg, 2, ""),
    tradeData: (f = msg.getTradeData()) && proto.treum.risk.TradeData.toObject(includeInstance, f),
    marketData: (f = msg.getMarketData()) && proto.treum.risk.MarketDataForCompliance.toObject(includeInstance, f)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.treum.risk.TradeComplianceCheckRequest}
 */
proto.treum.risk.TradeComplianceCheckRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.treum.risk.TradeComplianceCheckRequest;
  return proto.treum.risk.TradeComplianceCheckRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.treum.risk.TradeComplianceCheckRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.treum.risk.TradeComplianceCheckRequest}
 */
proto.treum.risk.TradeComplianceCheckRequest.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setUserId(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setAccountId(value);
      break;
    case 3:
      var value = new proto.treum.risk.TradeData;
      reader.readMessage(value,proto.treum.risk.TradeData.deserializeBinaryFromReader);
      msg.setTradeData(value);
      break;
    case 4:
      var value = new proto.treum.risk.MarketDataForCompliance;
      reader.readMessage(value,proto.treum.risk.MarketDataForCompliance.deserializeBinaryFromReader);
      msg.setMarketData(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.treum.risk.TradeComplianceCheckRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.treum.risk.TradeComplianceCheckRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.treum.risk.TradeComplianceCheckRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.TradeComplianceCheckRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getUserId();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getAccountId();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
  f = message.getTradeData();
  if (f != null) {
    writer.writeMessage(
      3,
      f,
      proto.treum.risk.TradeData.serializeBinaryToWriter
    );
  }
  f = message.getMarketData();
  if (f != null) {
    writer.writeMessage(
      4,
      f,
      proto.treum.risk.MarketDataForCompliance.serializeBinaryToWriter
    );
  }
};


/**
 * optional string user_id = 1;
 * @return {string}
 */
proto.treum.risk.TradeComplianceCheckRequest.prototype.getUserId = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.TradeComplianceCheckRequest} returns this
 */
proto.treum.risk.TradeComplianceCheckRequest.prototype.setUserId = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional string account_id = 2;
 * @return {string}
 */
proto.treum.risk.TradeComplianceCheckRequest.prototype.getAccountId = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.TradeComplianceCheckRequest} returns this
 */
proto.treum.risk.TradeComplianceCheckRequest.prototype.setAccountId = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};


/**
 * optional TradeData trade_data = 3;
 * @return {?proto.treum.risk.TradeData}
 */
proto.treum.risk.TradeComplianceCheckRequest.prototype.getTradeData = function() {
  return /** @type{?proto.treum.risk.TradeData} */ (
    jspb.Message.getWrapperField(this, proto.treum.risk.TradeData, 3));
};


/**
 * @param {?proto.treum.risk.TradeData|undefined} value
 * @return {!proto.treum.risk.TradeComplianceCheckRequest} returns this
*/
proto.treum.risk.TradeComplianceCheckRequest.prototype.setTradeData = function(value) {
  return jspb.Message.setWrapperField(this, 3, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.treum.risk.TradeComplianceCheckRequest} returns this
 */
proto.treum.risk.TradeComplianceCheckRequest.prototype.clearTradeData = function() {
  return this.setTradeData(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.treum.risk.TradeComplianceCheckRequest.prototype.hasTradeData = function() {
  return jspb.Message.getField(this, 3) != null;
};


/**
 * optional MarketDataForCompliance market_data = 4;
 * @return {?proto.treum.risk.MarketDataForCompliance}
 */
proto.treum.risk.TradeComplianceCheckRequest.prototype.getMarketData = function() {
  return /** @type{?proto.treum.risk.MarketDataForCompliance} */ (
    jspb.Message.getWrapperField(this, proto.treum.risk.MarketDataForCompliance, 4));
};


/**
 * @param {?proto.treum.risk.MarketDataForCompliance|undefined} value
 * @return {!proto.treum.risk.TradeComplianceCheckRequest} returns this
*/
proto.treum.risk.TradeComplianceCheckRequest.prototype.setMarketData = function(value) {
  return jspb.Message.setWrapperField(this, 4, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.treum.risk.TradeComplianceCheckRequest} returns this
 */
proto.treum.risk.TradeComplianceCheckRequest.prototype.clearMarketData = function() {
  return this.setMarketData(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.treum.risk.TradeComplianceCheckRequest.prototype.hasMarketData = function() {
  return jspb.Message.getField(this, 4) != null;
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.treum.risk.TradeData.prototype.toObject = function(opt_includeInstance) {
  return proto.treum.risk.TradeData.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.treum.risk.TradeData} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.TradeData.toObject = function(includeInstance, msg) {
  var f, obj = {
    symbol: jspb.Message.getFieldWithDefault(msg, 1, ""),
    side: jspb.Message.getFieldWithDefault(msg, 2, 0),
    quantity: jspb.Message.getFloatingPointFieldWithDefault(msg, 3, 0.0),
    price: jspb.Message.getFloatingPointFieldWithDefault(msg, 4, 0.0),
    orderType: jspb.Message.getFieldWithDefault(msg, 5, ""),
    timestamp: (f = msg.getTimestamp()) && google_protobuf_timestamp_pb.Timestamp.toObject(includeInstance, f)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.treum.risk.TradeData}
 */
proto.treum.risk.TradeData.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.treum.risk.TradeData;
  return proto.treum.risk.TradeData.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.treum.risk.TradeData} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.treum.risk.TradeData}
 */
proto.treum.risk.TradeData.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setSymbol(value);
      break;
    case 2:
      var value = /** @type {!proto.treum.risk.TradeSide} */ (reader.readEnum());
      msg.setSide(value);
      break;
    case 3:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setQuantity(value);
      break;
    case 4:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setPrice(value);
      break;
    case 5:
      var value = /** @type {string} */ (reader.readString());
      msg.setOrderType(value);
      break;
    case 6:
      var value = new google_protobuf_timestamp_pb.Timestamp;
      reader.readMessage(value,google_protobuf_timestamp_pb.Timestamp.deserializeBinaryFromReader);
      msg.setTimestamp(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.treum.risk.TradeData.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.treum.risk.TradeData.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.treum.risk.TradeData} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.TradeData.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getSymbol();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getSide();
  if (f !== 0.0) {
    writer.writeEnum(
      2,
      f
    );
  }
  f = message.getQuantity();
  if (f !== 0.0) {
    writer.writeDouble(
      3,
      f
    );
  }
  f = message.getPrice();
  if (f !== 0.0) {
    writer.writeDouble(
      4,
      f
    );
  }
  f = message.getOrderType();
  if (f.length > 0) {
    writer.writeString(
      5,
      f
    );
  }
  f = message.getTimestamp();
  if (f != null) {
    writer.writeMessage(
      6,
      f,
      google_protobuf_timestamp_pb.Timestamp.serializeBinaryToWriter
    );
  }
};


/**
 * optional string symbol = 1;
 * @return {string}
 */
proto.treum.risk.TradeData.prototype.getSymbol = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.TradeData} returns this
 */
proto.treum.risk.TradeData.prototype.setSymbol = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional TradeSide side = 2;
 * @return {!proto.treum.risk.TradeSide}
 */
proto.treum.risk.TradeData.prototype.getSide = function() {
  return /** @type {!proto.treum.risk.TradeSide} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/**
 * @param {!proto.treum.risk.TradeSide} value
 * @return {!proto.treum.risk.TradeData} returns this
 */
proto.treum.risk.TradeData.prototype.setSide = function(value) {
  return jspb.Message.setProto3EnumField(this, 2, value);
};


/**
 * optional double quantity = 3;
 * @return {number}
 */
proto.treum.risk.TradeData.prototype.getQuantity = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 3, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.TradeData} returns this
 */
proto.treum.risk.TradeData.prototype.setQuantity = function(value) {
  return jspb.Message.setProto3FloatField(this, 3, value);
};


/**
 * optional double price = 4;
 * @return {number}
 */
proto.treum.risk.TradeData.prototype.getPrice = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 4, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.TradeData} returns this
 */
proto.treum.risk.TradeData.prototype.setPrice = function(value) {
  return jspb.Message.setProto3FloatField(this, 4, value);
};


/**
 * optional string order_type = 5;
 * @return {string}
 */
proto.treum.risk.TradeData.prototype.getOrderType = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 5, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.TradeData} returns this
 */
proto.treum.risk.TradeData.prototype.setOrderType = function(value) {
  return jspb.Message.setProto3StringField(this, 5, value);
};


/**
 * optional google.protobuf.Timestamp timestamp = 6;
 * @return {?proto.google.protobuf.Timestamp}
 */
proto.treum.risk.TradeData.prototype.getTimestamp = function() {
  return /** @type{?proto.google.protobuf.Timestamp} */ (
    jspb.Message.getWrapperField(this, google_protobuf_timestamp_pb.Timestamp, 6));
};


/**
 * @param {?proto.google.protobuf.Timestamp|undefined} value
 * @return {!proto.treum.risk.TradeData} returns this
*/
proto.treum.risk.TradeData.prototype.setTimestamp = function(value) {
  return jspb.Message.setWrapperField(this, 6, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.treum.risk.TradeData} returns this
 */
proto.treum.risk.TradeData.prototype.clearTimestamp = function() {
  return this.setTimestamp(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.treum.risk.TradeData.prototype.hasTimestamp = function() {
  return jspb.Message.getField(this, 6) != null;
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.treum.risk.MarketDataForCompliance.prototype.toObject = function(opt_includeInstance) {
  return proto.treum.risk.MarketDataForCompliance.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.treum.risk.MarketDataForCompliance} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.MarketDataForCompliance.toObject = function(includeInstance, msg) {
  var f, obj = {
    volume: jspb.Message.getFloatingPointFieldWithDefault(msg, 1, 0.0),
    volatility: jspb.Message.getFloatingPointFieldWithDefault(msg, 2, 0.0),
    priceMovement: jspb.Message.getFloatingPointFieldWithDefault(msg, 3, 0.0),
    timeOfDay: jspb.Message.getFieldWithDefault(msg, 4, "")
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.treum.risk.MarketDataForCompliance}
 */
proto.treum.risk.MarketDataForCompliance.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.treum.risk.MarketDataForCompliance;
  return proto.treum.risk.MarketDataForCompliance.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.treum.risk.MarketDataForCompliance} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.treum.risk.MarketDataForCompliance}
 */
proto.treum.risk.MarketDataForCompliance.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setVolume(value);
      break;
    case 2:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setVolatility(value);
      break;
    case 3:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setPriceMovement(value);
      break;
    case 4:
      var value = /** @type {string} */ (reader.readString());
      msg.setTimeOfDay(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.treum.risk.MarketDataForCompliance.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.treum.risk.MarketDataForCompliance.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.treum.risk.MarketDataForCompliance} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.MarketDataForCompliance.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getVolume();
  if (f !== 0.0) {
    writer.writeDouble(
      1,
      f
    );
  }
  f = message.getVolatility();
  if (f !== 0.0) {
    writer.writeDouble(
      2,
      f
    );
  }
  f = message.getPriceMovement();
  if (f !== 0.0) {
    writer.writeDouble(
      3,
      f
    );
  }
  f = message.getTimeOfDay();
  if (f.length > 0) {
    writer.writeString(
      4,
      f
    );
  }
};


/**
 * optional double volume = 1;
 * @return {number}
 */
proto.treum.risk.MarketDataForCompliance.prototype.getVolume = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 1, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.MarketDataForCompliance} returns this
 */
proto.treum.risk.MarketDataForCompliance.prototype.setVolume = function(value) {
  return jspb.Message.setProto3FloatField(this, 1, value);
};


/**
 * optional double volatility = 2;
 * @return {number}
 */
proto.treum.risk.MarketDataForCompliance.prototype.getVolatility = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 2, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.MarketDataForCompliance} returns this
 */
proto.treum.risk.MarketDataForCompliance.prototype.setVolatility = function(value) {
  return jspb.Message.setProto3FloatField(this, 2, value);
};


/**
 * optional double price_movement = 3;
 * @return {number}
 */
proto.treum.risk.MarketDataForCompliance.prototype.getPriceMovement = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 3, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.MarketDataForCompliance} returns this
 */
proto.treum.risk.MarketDataForCompliance.prototype.setPriceMovement = function(value) {
  return jspb.Message.setProto3FloatField(this, 3, value);
};


/**
 * optional string time_of_day = 4;
 * @return {string}
 */
proto.treum.risk.MarketDataForCompliance.prototype.getTimeOfDay = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 4, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.MarketDataForCompliance} returns this
 */
proto.treum.risk.MarketDataForCompliance.prototype.setTimeOfDay = function(value) {
  return jspb.Message.setProto3StringField(this, 4, value);
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.treum.risk.ComplianceCheckResponse.repeatedFields_ = [8,9,10,11];



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.treum.risk.ComplianceCheckResponse.prototype.toObject = function(opt_includeInstance) {
  return proto.treum.risk.ComplianceCheckResponse.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.treum.risk.ComplianceCheckResponse} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.ComplianceCheckResponse.toObject = function(includeInstance, msg) {
  var f, obj = {
    id: jspb.Message.getFieldWithDefault(msg, 1, ""),
    userId: jspb.Message.getFieldWithDefault(msg, 2, ""),
    accountId: jspb.Message.getFieldWithDefault(msg, 3, ""),
    complianceType: jspb.Message.getFieldWithDefault(msg, 4, 0),
    status: jspb.Message.getFieldWithDefault(msg, 5, 0),
    severity: jspb.Message.getFieldWithDefault(msg, 6, 0),
    checkResults: (f = msg.getCheckResults()) && proto.treum.risk.ComplianceResults.toObject(includeInstance, f),
    rulesEvaluatedList: (f = jspb.Message.getRepeatedField(msg, 8)) == null ? undefined : f,
    failedRulesList: (f = jspb.Message.getRepeatedField(msg, 9)) == null ? undefined : f,
    regulatoryRefsList: (f = jspb.Message.getRepeatedField(msg, 10)) == null ? undefined : f,
    remedialActionsList: (f = jspb.Message.getRepeatedField(msg, 11)) == null ? undefined : f,
    nextReviewDate: (f = msg.getNextReviewDate()) && google_protobuf_timestamp_pb.Timestamp.toObject(includeInstance, f),
    processingTimeMs: jspb.Message.getFieldWithDefault(msg, 13, 0),
    requiresEscalation: jspb.Message.getBooleanFieldWithDefault(msg, 14, false),
    escalationReason: jspb.Message.getFieldWithDefault(msg, 15, ""),
    createdAt: (f = msg.getCreatedAt()) && google_protobuf_timestamp_pb.Timestamp.toObject(includeInstance, f),
    updatedAt: (f = msg.getUpdatedAt()) && google_protobuf_timestamp_pb.Timestamp.toObject(includeInstance, f)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.treum.risk.ComplianceCheckResponse}
 */
proto.treum.risk.ComplianceCheckResponse.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.treum.risk.ComplianceCheckResponse;
  return proto.treum.risk.ComplianceCheckResponse.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.treum.risk.ComplianceCheckResponse} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.treum.risk.ComplianceCheckResponse}
 */
proto.treum.risk.ComplianceCheckResponse.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setId(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setUserId(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readString());
      msg.setAccountId(value);
      break;
    case 4:
      var value = /** @type {!proto.treum.risk.ComplianceType} */ (reader.readEnum());
      msg.setComplianceType(value);
      break;
    case 5:
      var value = /** @type {!proto.treum.risk.ComplianceStatus} */ (reader.readEnum());
      msg.setStatus(value);
      break;
    case 6:
      var value = /** @type {!proto.treum.risk.ComplianceSeverity} */ (reader.readEnum());
      msg.setSeverity(value);
      break;
    case 7:
      var value = new proto.treum.risk.ComplianceResults;
      reader.readMessage(value,proto.treum.risk.ComplianceResults.deserializeBinaryFromReader);
      msg.setCheckResults(value);
      break;
    case 8:
      var value = /** @type {string} */ (reader.readString());
      msg.addRulesEvaluated(value);
      break;
    case 9:
      var value = /** @type {string} */ (reader.readString());
      msg.addFailedRules(value);
      break;
    case 10:
      var value = /** @type {string} */ (reader.readString());
      msg.addRegulatoryRefs(value);
      break;
    case 11:
      var value = /** @type {string} */ (reader.readString());
      msg.addRemedialActions(value);
      break;
    case 12:
      var value = new google_protobuf_timestamp_pb.Timestamp;
      reader.readMessage(value,google_protobuf_timestamp_pb.Timestamp.deserializeBinaryFromReader);
      msg.setNextReviewDate(value);
      break;
    case 13:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setProcessingTimeMs(value);
      break;
    case 14:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setRequiresEscalation(value);
      break;
    case 15:
      var value = /** @type {string} */ (reader.readString());
      msg.setEscalationReason(value);
      break;
    case 16:
      var value = new google_protobuf_timestamp_pb.Timestamp;
      reader.readMessage(value,google_protobuf_timestamp_pb.Timestamp.deserializeBinaryFromReader);
      msg.setCreatedAt(value);
      break;
    case 17:
      var value = new google_protobuf_timestamp_pb.Timestamp;
      reader.readMessage(value,google_protobuf_timestamp_pb.Timestamp.deserializeBinaryFromReader);
      msg.setUpdatedAt(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.treum.risk.ComplianceCheckResponse.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.treum.risk.ComplianceCheckResponse.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.treum.risk.ComplianceCheckResponse} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.ComplianceCheckResponse.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getId();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getUserId();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
  f = message.getAccountId();
  if (f.length > 0) {
    writer.writeString(
      3,
      f
    );
  }
  f = message.getComplianceType();
  if (f !== 0.0) {
    writer.writeEnum(
      4,
      f
    );
  }
  f = message.getStatus();
  if (f !== 0.0) {
    writer.writeEnum(
      5,
      f
    );
  }
  f = message.getSeverity();
  if (f !== 0.0) {
    writer.writeEnum(
      6,
      f
    );
  }
  f = message.getCheckResults();
  if (f != null) {
    writer.writeMessage(
      7,
      f,
      proto.treum.risk.ComplianceResults.serializeBinaryToWriter
    );
  }
  f = message.getRulesEvaluatedList();
  if (f.length > 0) {
    writer.writeRepeatedString(
      8,
      f
    );
  }
  f = message.getFailedRulesList();
  if (f.length > 0) {
    writer.writeRepeatedString(
      9,
      f
    );
  }
  f = message.getRegulatoryRefsList();
  if (f.length > 0) {
    writer.writeRepeatedString(
      10,
      f
    );
  }
  f = message.getRemedialActionsList();
  if (f.length > 0) {
    writer.writeRepeatedString(
      11,
      f
    );
  }
  f = message.getNextReviewDate();
  if (f != null) {
    writer.writeMessage(
      12,
      f,
      google_protobuf_timestamp_pb.Timestamp.serializeBinaryToWriter
    );
  }
  f = message.getProcessingTimeMs();
  if (f !== 0) {
    writer.writeInt32(
      13,
      f
    );
  }
  f = message.getRequiresEscalation();
  if (f) {
    writer.writeBool(
      14,
      f
    );
  }
  f = message.getEscalationReason();
  if (f.length > 0) {
    writer.writeString(
      15,
      f
    );
  }
  f = message.getCreatedAt();
  if (f != null) {
    writer.writeMessage(
      16,
      f,
      google_protobuf_timestamp_pb.Timestamp.serializeBinaryToWriter
    );
  }
  f = message.getUpdatedAt();
  if (f != null) {
    writer.writeMessage(
      17,
      f,
      google_protobuf_timestamp_pb.Timestamp.serializeBinaryToWriter
    );
  }
};


/**
 * optional string id = 1;
 * @return {string}
 */
proto.treum.risk.ComplianceCheckResponse.prototype.getId = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.ComplianceCheckResponse} returns this
 */
proto.treum.risk.ComplianceCheckResponse.prototype.setId = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional string user_id = 2;
 * @return {string}
 */
proto.treum.risk.ComplianceCheckResponse.prototype.getUserId = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.ComplianceCheckResponse} returns this
 */
proto.treum.risk.ComplianceCheckResponse.prototype.setUserId = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};


/**
 * optional string account_id = 3;
 * @return {string}
 */
proto.treum.risk.ComplianceCheckResponse.prototype.getAccountId = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.ComplianceCheckResponse} returns this
 */
proto.treum.risk.ComplianceCheckResponse.prototype.setAccountId = function(value) {
  return jspb.Message.setProto3StringField(this, 3, value);
};


/**
 * optional ComplianceType compliance_type = 4;
 * @return {!proto.treum.risk.ComplianceType}
 */
proto.treum.risk.ComplianceCheckResponse.prototype.getComplianceType = function() {
  return /** @type {!proto.treum.risk.ComplianceType} */ (jspb.Message.getFieldWithDefault(this, 4, 0));
};


/**
 * @param {!proto.treum.risk.ComplianceType} value
 * @return {!proto.treum.risk.ComplianceCheckResponse} returns this
 */
proto.treum.risk.ComplianceCheckResponse.prototype.setComplianceType = function(value) {
  return jspb.Message.setProto3EnumField(this, 4, value);
};


/**
 * optional ComplianceStatus status = 5;
 * @return {!proto.treum.risk.ComplianceStatus}
 */
proto.treum.risk.ComplianceCheckResponse.prototype.getStatus = function() {
  return /** @type {!proto.treum.risk.ComplianceStatus} */ (jspb.Message.getFieldWithDefault(this, 5, 0));
};


/**
 * @param {!proto.treum.risk.ComplianceStatus} value
 * @return {!proto.treum.risk.ComplianceCheckResponse} returns this
 */
proto.treum.risk.ComplianceCheckResponse.prototype.setStatus = function(value) {
  return jspb.Message.setProto3EnumField(this, 5, value);
};


/**
 * optional ComplianceSeverity severity = 6;
 * @return {!proto.treum.risk.ComplianceSeverity}
 */
proto.treum.risk.ComplianceCheckResponse.prototype.getSeverity = function() {
  return /** @type {!proto.treum.risk.ComplianceSeverity} */ (jspb.Message.getFieldWithDefault(this, 6, 0));
};


/**
 * @param {!proto.treum.risk.ComplianceSeverity} value
 * @return {!proto.treum.risk.ComplianceCheckResponse} returns this
 */
proto.treum.risk.ComplianceCheckResponse.prototype.setSeverity = function(value) {
  return jspb.Message.setProto3EnumField(this, 6, value);
};


/**
 * optional ComplianceResults check_results = 7;
 * @return {?proto.treum.risk.ComplianceResults}
 */
proto.treum.risk.ComplianceCheckResponse.prototype.getCheckResults = function() {
  return /** @type{?proto.treum.risk.ComplianceResults} */ (
    jspb.Message.getWrapperField(this, proto.treum.risk.ComplianceResults, 7));
};


/**
 * @param {?proto.treum.risk.ComplianceResults|undefined} value
 * @return {!proto.treum.risk.ComplianceCheckResponse} returns this
*/
proto.treum.risk.ComplianceCheckResponse.prototype.setCheckResults = function(value) {
  return jspb.Message.setWrapperField(this, 7, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.treum.risk.ComplianceCheckResponse} returns this
 */
proto.treum.risk.ComplianceCheckResponse.prototype.clearCheckResults = function() {
  return this.setCheckResults(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.treum.risk.ComplianceCheckResponse.prototype.hasCheckResults = function() {
  return jspb.Message.getField(this, 7) != null;
};


/**
 * repeated string rules_evaluated = 8;
 * @return {!Array<string>}
 */
proto.treum.risk.ComplianceCheckResponse.prototype.getRulesEvaluatedList = function() {
  return /** @type {!Array<string>} */ (jspb.Message.getRepeatedField(this, 8));
};


/**
 * @param {!Array<string>} value
 * @return {!proto.treum.risk.ComplianceCheckResponse} returns this
 */
proto.treum.risk.ComplianceCheckResponse.prototype.setRulesEvaluatedList = function(value) {
  return jspb.Message.setField(this, 8, value || []);
};


/**
 * @param {string} value
 * @param {number=} opt_index
 * @return {!proto.treum.risk.ComplianceCheckResponse} returns this
 */
proto.treum.risk.ComplianceCheckResponse.prototype.addRulesEvaluated = function(value, opt_index) {
  return jspb.Message.addToRepeatedField(this, 8, value, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.treum.risk.ComplianceCheckResponse} returns this
 */
proto.treum.risk.ComplianceCheckResponse.prototype.clearRulesEvaluatedList = function() {
  return this.setRulesEvaluatedList([]);
};


/**
 * repeated string failed_rules = 9;
 * @return {!Array<string>}
 */
proto.treum.risk.ComplianceCheckResponse.prototype.getFailedRulesList = function() {
  return /** @type {!Array<string>} */ (jspb.Message.getRepeatedField(this, 9));
};


/**
 * @param {!Array<string>} value
 * @return {!proto.treum.risk.ComplianceCheckResponse} returns this
 */
proto.treum.risk.ComplianceCheckResponse.prototype.setFailedRulesList = function(value) {
  return jspb.Message.setField(this, 9, value || []);
};


/**
 * @param {string} value
 * @param {number=} opt_index
 * @return {!proto.treum.risk.ComplianceCheckResponse} returns this
 */
proto.treum.risk.ComplianceCheckResponse.prototype.addFailedRules = function(value, opt_index) {
  return jspb.Message.addToRepeatedField(this, 9, value, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.treum.risk.ComplianceCheckResponse} returns this
 */
proto.treum.risk.ComplianceCheckResponse.prototype.clearFailedRulesList = function() {
  return this.setFailedRulesList([]);
};


/**
 * repeated string regulatory_refs = 10;
 * @return {!Array<string>}
 */
proto.treum.risk.ComplianceCheckResponse.prototype.getRegulatoryRefsList = function() {
  return /** @type {!Array<string>} */ (jspb.Message.getRepeatedField(this, 10));
};


/**
 * @param {!Array<string>} value
 * @return {!proto.treum.risk.ComplianceCheckResponse} returns this
 */
proto.treum.risk.ComplianceCheckResponse.prototype.setRegulatoryRefsList = function(value) {
  return jspb.Message.setField(this, 10, value || []);
};


/**
 * @param {string} value
 * @param {number=} opt_index
 * @return {!proto.treum.risk.ComplianceCheckResponse} returns this
 */
proto.treum.risk.ComplianceCheckResponse.prototype.addRegulatoryRefs = function(value, opt_index) {
  return jspb.Message.addToRepeatedField(this, 10, value, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.treum.risk.ComplianceCheckResponse} returns this
 */
proto.treum.risk.ComplianceCheckResponse.prototype.clearRegulatoryRefsList = function() {
  return this.setRegulatoryRefsList([]);
};


/**
 * repeated string remedial_actions = 11;
 * @return {!Array<string>}
 */
proto.treum.risk.ComplianceCheckResponse.prototype.getRemedialActionsList = function() {
  return /** @type {!Array<string>} */ (jspb.Message.getRepeatedField(this, 11));
};


/**
 * @param {!Array<string>} value
 * @return {!proto.treum.risk.ComplianceCheckResponse} returns this
 */
proto.treum.risk.ComplianceCheckResponse.prototype.setRemedialActionsList = function(value) {
  return jspb.Message.setField(this, 11, value || []);
};


/**
 * @param {string} value
 * @param {number=} opt_index
 * @return {!proto.treum.risk.ComplianceCheckResponse} returns this
 */
proto.treum.risk.ComplianceCheckResponse.prototype.addRemedialActions = function(value, opt_index) {
  return jspb.Message.addToRepeatedField(this, 11, value, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.treum.risk.ComplianceCheckResponse} returns this
 */
proto.treum.risk.ComplianceCheckResponse.prototype.clearRemedialActionsList = function() {
  return this.setRemedialActionsList([]);
};


/**
 * optional google.protobuf.Timestamp next_review_date = 12;
 * @return {?proto.google.protobuf.Timestamp}
 */
proto.treum.risk.ComplianceCheckResponse.prototype.getNextReviewDate = function() {
  return /** @type{?proto.google.protobuf.Timestamp} */ (
    jspb.Message.getWrapperField(this, google_protobuf_timestamp_pb.Timestamp, 12));
};


/**
 * @param {?proto.google.protobuf.Timestamp|undefined} value
 * @return {!proto.treum.risk.ComplianceCheckResponse} returns this
*/
proto.treum.risk.ComplianceCheckResponse.prototype.setNextReviewDate = function(value) {
  return jspb.Message.setWrapperField(this, 12, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.treum.risk.ComplianceCheckResponse} returns this
 */
proto.treum.risk.ComplianceCheckResponse.prototype.clearNextReviewDate = function() {
  return this.setNextReviewDate(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.treum.risk.ComplianceCheckResponse.prototype.hasNextReviewDate = function() {
  return jspb.Message.getField(this, 12) != null;
};


/**
 * optional int32 processing_time_ms = 13;
 * @return {number}
 */
proto.treum.risk.ComplianceCheckResponse.prototype.getProcessingTimeMs = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 13, 0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.ComplianceCheckResponse} returns this
 */
proto.treum.risk.ComplianceCheckResponse.prototype.setProcessingTimeMs = function(value) {
  return jspb.Message.setProto3IntField(this, 13, value);
};


/**
 * optional bool requires_escalation = 14;
 * @return {boolean}
 */
proto.treum.risk.ComplianceCheckResponse.prototype.getRequiresEscalation = function() {
  return /** @type {boolean} */ (jspb.Message.getBooleanFieldWithDefault(this, 14, false));
};


/**
 * @param {boolean} value
 * @return {!proto.treum.risk.ComplianceCheckResponse} returns this
 */
proto.treum.risk.ComplianceCheckResponse.prototype.setRequiresEscalation = function(value) {
  return jspb.Message.setProto3BooleanField(this, 14, value);
};


/**
 * optional string escalation_reason = 15;
 * @return {string}
 */
proto.treum.risk.ComplianceCheckResponse.prototype.getEscalationReason = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 15, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.ComplianceCheckResponse} returns this
 */
proto.treum.risk.ComplianceCheckResponse.prototype.setEscalationReason = function(value) {
  return jspb.Message.setProto3StringField(this, 15, value);
};


/**
 * optional google.protobuf.Timestamp created_at = 16;
 * @return {?proto.google.protobuf.Timestamp}
 */
proto.treum.risk.ComplianceCheckResponse.prototype.getCreatedAt = function() {
  return /** @type{?proto.google.protobuf.Timestamp} */ (
    jspb.Message.getWrapperField(this, google_protobuf_timestamp_pb.Timestamp, 16));
};


/**
 * @param {?proto.google.protobuf.Timestamp|undefined} value
 * @return {!proto.treum.risk.ComplianceCheckResponse} returns this
*/
proto.treum.risk.ComplianceCheckResponse.prototype.setCreatedAt = function(value) {
  return jspb.Message.setWrapperField(this, 16, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.treum.risk.ComplianceCheckResponse} returns this
 */
proto.treum.risk.ComplianceCheckResponse.prototype.clearCreatedAt = function() {
  return this.setCreatedAt(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.treum.risk.ComplianceCheckResponse.prototype.hasCreatedAt = function() {
  return jspb.Message.getField(this, 16) != null;
};


/**
 * optional google.protobuf.Timestamp updated_at = 17;
 * @return {?proto.google.protobuf.Timestamp}
 */
proto.treum.risk.ComplianceCheckResponse.prototype.getUpdatedAt = function() {
  return /** @type{?proto.google.protobuf.Timestamp} */ (
    jspb.Message.getWrapperField(this, google_protobuf_timestamp_pb.Timestamp, 17));
};


/**
 * @param {?proto.google.protobuf.Timestamp|undefined} value
 * @return {!proto.treum.risk.ComplianceCheckResponse} returns this
*/
proto.treum.risk.ComplianceCheckResponse.prototype.setUpdatedAt = function(value) {
  return jspb.Message.setWrapperField(this, 17, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.treum.risk.ComplianceCheckResponse} returns this
 */
proto.treum.risk.ComplianceCheckResponse.prototype.clearUpdatedAt = function() {
  return this.setUpdatedAt(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.treum.risk.ComplianceCheckResponse.prototype.hasUpdatedAt = function() {
  return jspb.Message.getField(this, 17) != null;
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.treum.risk.ComplianceResults.repeatedFields_ = [3,5];



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.treum.risk.ComplianceResults.prototype.toObject = function(opt_includeInstance) {
  return proto.treum.risk.ComplianceResults.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.treum.risk.ComplianceResults} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.ComplianceResults.toObject = function(includeInstance, msg) {
  var f, obj = {
    passed: jspb.Message.getBooleanFieldWithDefault(msg, 1, false),
    score: jspb.Message.getFloatingPointFieldWithDefault(msg, 2, 0.0),
    flagsList: jspb.Message.toObjectList(msg.getFlagsList(),
    proto.treum.risk.ComplianceFlag.toObject, includeInstance),
    evidence: jspb.Message.getFieldWithDefault(msg, 4, ""),
    externalSourcesList: (f = jspb.Message.getRepeatedField(msg, 5)) == null ? undefined : f
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.treum.risk.ComplianceResults}
 */
proto.treum.risk.ComplianceResults.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.treum.risk.ComplianceResults;
  return proto.treum.risk.ComplianceResults.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.treum.risk.ComplianceResults} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.treum.risk.ComplianceResults}
 */
proto.treum.risk.ComplianceResults.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setPassed(value);
      break;
    case 2:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setScore(value);
      break;
    case 3:
      var value = new proto.treum.risk.ComplianceFlag;
      reader.readMessage(value,proto.treum.risk.ComplianceFlag.deserializeBinaryFromReader);
      msg.addFlags(value);
      break;
    case 4:
      var value = /** @type {string} */ (reader.readString());
      msg.setEvidence(value);
      break;
    case 5:
      var value = /** @type {string} */ (reader.readString());
      msg.addExternalSources(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.treum.risk.ComplianceResults.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.treum.risk.ComplianceResults.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.treum.risk.ComplianceResults} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.ComplianceResults.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getPassed();
  if (f) {
    writer.writeBool(
      1,
      f
    );
  }
  f = message.getScore();
  if (f !== 0.0) {
    writer.writeDouble(
      2,
      f
    );
  }
  f = message.getFlagsList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      3,
      f,
      proto.treum.risk.ComplianceFlag.serializeBinaryToWriter
    );
  }
  f = message.getEvidence();
  if (f.length > 0) {
    writer.writeString(
      4,
      f
    );
  }
  f = message.getExternalSourcesList();
  if (f.length > 0) {
    writer.writeRepeatedString(
      5,
      f
    );
  }
};


/**
 * optional bool passed = 1;
 * @return {boolean}
 */
proto.treum.risk.ComplianceResults.prototype.getPassed = function() {
  return /** @type {boolean} */ (jspb.Message.getBooleanFieldWithDefault(this, 1, false));
};


/**
 * @param {boolean} value
 * @return {!proto.treum.risk.ComplianceResults} returns this
 */
proto.treum.risk.ComplianceResults.prototype.setPassed = function(value) {
  return jspb.Message.setProto3BooleanField(this, 1, value);
};


/**
 * optional double score = 2;
 * @return {number}
 */
proto.treum.risk.ComplianceResults.prototype.getScore = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 2, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.ComplianceResults} returns this
 */
proto.treum.risk.ComplianceResults.prototype.setScore = function(value) {
  return jspb.Message.setProto3FloatField(this, 2, value);
};


/**
 * repeated ComplianceFlag flags = 3;
 * @return {!Array<!proto.treum.risk.ComplianceFlag>}
 */
proto.treum.risk.ComplianceResults.prototype.getFlagsList = function() {
  return /** @type{!Array<!proto.treum.risk.ComplianceFlag>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.treum.risk.ComplianceFlag, 3));
};


/**
 * @param {!Array<!proto.treum.risk.ComplianceFlag>} value
 * @return {!proto.treum.risk.ComplianceResults} returns this
*/
proto.treum.risk.ComplianceResults.prototype.setFlagsList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 3, value);
};


/**
 * @param {!proto.treum.risk.ComplianceFlag=} opt_value
 * @param {number=} opt_index
 * @return {!proto.treum.risk.ComplianceFlag}
 */
proto.treum.risk.ComplianceResults.prototype.addFlags = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 3, opt_value, proto.treum.risk.ComplianceFlag, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.treum.risk.ComplianceResults} returns this
 */
proto.treum.risk.ComplianceResults.prototype.clearFlagsList = function() {
  return this.setFlagsList([]);
};


/**
 * optional string evidence = 4;
 * @return {string}
 */
proto.treum.risk.ComplianceResults.prototype.getEvidence = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 4, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.ComplianceResults} returns this
 */
proto.treum.risk.ComplianceResults.prototype.setEvidence = function(value) {
  return jspb.Message.setProto3StringField(this, 4, value);
};


/**
 * repeated string external_sources = 5;
 * @return {!Array<string>}
 */
proto.treum.risk.ComplianceResults.prototype.getExternalSourcesList = function() {
  return /** @type {!Array<string>} */ (jspb.Message.getRepeatedField(this, 5));
};


/**
 * @param {!Array<string>} value
 * @return {!proto.treum.risk.ComplianceResults} returns this
 */
proto.treum.risk.ComplianceResults.prototype.setExternalSourcesList = function(value) {
  return jspb.Message.setField(this, 5, value || []);
};


/**
 * @param {string} value
 * @param {number=} opt_index
 * @return {!proto.treum.risk.ComplianceResults} returns this
 */
proto.treum.risk.ComplianceResults.prototype.addExternalSources = function(value, opt_index) {
  return jspb.Message.addToRepeatedField(this, 5, value, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.treum.risk.ComplianceResults} returns this
 */
proto.treum.risk.ComplianceResults.prototype.clearExternalSourcesList = function() {
  return this.setExternalSourcesList([]);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.treum.risk.ComplianceFlag.prototype.toObject = function(opt_includeInstance) {
  return proto.treum.risk.ComplianceFlag.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.treum.risk.ComplianceFlag} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.ComplianceFlag.toObject = function(includeInstance, msg) {
  var f, obj = {
    flag: jspb.Message.getFieldWithDefault(msg, 1, ""),
    severity: jspb.Message.getFieldWithDefault(msg, 2, ""),
    description: jspb.Message.getFieldWithDefault(msg, 3, ""),
    value: jspb.Message.getFieldWithDefault(msg, 4, ""),
    threshold: jspb.Message.getFieldWithDefault(msg, 5, "")
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.treum.risk.ComplianceFlag}
 */
proto.treum.risk.ComplianceFlag.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.treum.risk.ComplianceFlag;
  return proto.treum.risk.ComplianceFlag.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.treum.risk.ComplianceFlag} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.treum.risk.ComplianceFlag}
 */
proto.treum.risk.ComplianceFlag.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setFlag(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setSeverity(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readString());
      msg.setDescription(value);
      break;
    case 4:
      var value = /** @type {string} */ (reader.readString());
      msg.setValue(value);
      break;
    case 5:
      var value = /** @type {string} */ (reader.readString());
      msg.setThreshold(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.treum.risk.ComplianceFlag.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.treum.risk.ComplianceFlag.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.treum.risk.ComplianceFlag} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.ComplianceFlag.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getFlag();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getSeverity();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
  f = message.getDescription();
  if (f.length > 0) {
    writer.writeString(
      3,
      f
    );
  }
  f = message.getValue();
  if (f.length > 0) {
    writer.writeString(
      4,
      f
    );
  }
  f = message.getThreshold();
  if (f.length > 0) {
    writer.writeString(
      5,
      f
    );
  }
};


/**
 * optional string flag = 1;
 * @return {string}
 */
proto.treum.risk.ComplianceFlag.prototype.getFlag = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.ComplianceFlag} returns this
 */
proto.treum.risk.ComplianceFlag.prototype.setFlag = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional string severity = 2;
 * @return {string}
 */
proto.treum.risk.ComplianceFlag.prototype.getSeverity = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.ComplianceFlag} returns this
 */
proto.treum.risk.ComplianceFlag.prototype.setSeverity = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};


/**
 * optional string description = 3;
 * @return {string}
 */
proto.treum.risk.ComplianceFlag.prototype.getDescription = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.ComplianceFlag} returns this
 */
proto.treum.risk.ComplianceFlag.prototype.setDescription = function(value) {
  return jspb.Message.setProto3StringField(this, 3, value);
};


/**
 * optional string value = 4;
 * @return {string}
 */
proto.treum.risk.ComplianceFlag.prototype.getValue = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 4, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.ComplianceFlag} returns this
 */
proto.treum.risk.ComplianceFlag.prototype.setValue = function(value) {
  return jspb.Message.setProto3StringField(this, 4, value);
};


/**
 * optional string threshold = 5;
 * @return {string}
 */
proto.treum.risk.ComplianceFlag.prototype.getThreshold = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 5, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.ComplianceFlag} returns this
 */
proto.treum.risk.ComplianceFlag.prototype.setThreshold = function(value) {
  return jspb.Message.setProto3StringField(this, 5, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.treum.risk.GetComplianceStatusRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.treum.risk.GetComplianceStatusRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.treum.risk.GetComplianceStatusRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.GetComplianceStatusRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    userId: jspb.Message.getFieldWithDefault(msg, 1, "")
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.treum.risk.GetComplianceStatusRequest}
 */
proto.treum.risk.GetComplianceStatusRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.treum.risk.GetComplianceStatusRequest;
  return proto.treum.risk.GetComplianceStatusRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.treum.risk.GetComplianceStatusRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.treum.risk.GetComplianceStatusRequest}
 */
proto.treum.risk.GetComplianceStatusRequest.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setUserId(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.treum.risk.GetComplianceStatusRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.treum.risk.GetComplianceStatusRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.treum.risk.GetComplianceStatusRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.GetComplianceStatusRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getUserId();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
};


/**
 * optional string user_id = 1;
 * @return {string}
 */
proto.treum.risk.GetComplianceStatusRequest.prototype.getUserId = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.GetComplianceStatusRequest} returns this
 */
proto.treum.risk.GetComplianceStatusRequest.prototype.setUserId = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.treum.risk.ComplianceStatusResponse.prototype.toObject = function(opt_includeInstance) {
  return proto.treum.risk.ComplianceStatusResponse.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.treum.risk.ComplianceStatusResponse} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.ComplianceStatusResponse.toObject = function(includeInstance, msg) {
  var f, obj = {
    userId: jspb.Message.getFieldWithDefault(msg, 1, ""),
    complianceStatusMap: (f = msg.getComplianceStatusMap()) ? f.toObject(includeInstance, undefined) : [],
    lastUpdated: (f = msg.getLastUpdated()) && google_protobuf_timestamp_pb.Timestamp.toObject(includeInstance, f)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.treum.risk.ComplianceStatusResponse}
 */
proto.treum.risk.ComplianceStatusResponse.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.treum.risk.ComplianceStatusResponse;
  return proto.treum.risk.ComplianceStatusResponse.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.treum.risk.ComplianceStatusResponse} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.treum.risk.ComplianceStatusResponse}
 */
proto.treum.risk.ComplianceStatusResponse.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setUserId(value);
      break;
    case 2:
      var value = msg.getComplianceStatusMap();
      reader.readMessage(value, function(message, reader) {
        jspb.Map.deserializeBinary(message, reader, jspb.BinaryReader.prototype.readString, jspb.BinaryReader.prototype.readString, null, "", "");
         });
      break;
    case 3:
      var value = new google_protobuf_timestamp_pb.Timestamp;
      reader.readMessage(value,google_protobuf_timestamp_pb.Timestamp.deserializeBinaryFromReader);
      msg.setLastUpdated(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.treum.risk.ComplianceStatusResponse.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.treum.risk.ComplianceStatusResponse.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.treum.risk.ComplianceStatusResponse} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.ComplianceStatusResponse.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getUserId();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getComplianceStatusMap(true);
  if (f && f.getLength() > 0) {
    f.serializeBinary(2, writer, jspb.BinaryWriter.prototype.writeString, jspb.BinaryWriter.prototype.writeString);
  }
  f = message.getLastUpdated();
  if (f != null) {
    writer.writeMessage(
      3,
      f,
      google_protobuf_timestamp_pb.Timestamp.serializeBinaryToWriter
    );
  }
};


/**
 * optional string user_id = 1;
 * @return {string}
 */
proto.treum.risk.ComplianceStatusResponse.prototype.getUserId = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.ComplianceStatusResponse} returns this
 */
proto.treum.risk.ComplianceStatusResponse.prototype.setUserId = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * map<string, string> compliance_status = 2;
 * @param {boolean=} opt_noLazyCreate Do not create the map if
 * empty, instead returning `undefined`
 * @return {!jspb.Map<string,string>}
 */
proto.treum.risk.ComplianceStatusResponse.prototype.getComplianceStatusMap = function(opt_noLazyCreate) {
  return /** @type {!jspb.Map<string,string>} */ (
      jspb.Message.getMapField(this, 2, opt_noLazyCreate,
      null));
};


/**
 * Clears values from the map. The map will be non-null.
 * @return {!proto.treum.risk.ComplianceStatusResponse} returns this
 */
proto.treum.risk.ComplianceStatusResponse.prototype.clearComplianceStatusMap = function() {
  this.getComplianceStatusMap().clear();
  return this;};


/**
 * optional google.protobuf.Timestamp last_updated = 3;
 * @return {?proto.google.protobuf.Timestamp}
 */
proto.treum.risk.ComplianceStatusResponse.prototype.getLastUpdated = function() {
  return /** @type{?proto.google.protobuf.Timestamp} */ (
    jspb.Message.getWrapperField(this, google_protobuf_timestamp_pb.Timestamp, 3));
};


/**
 * @param {?proto.google.protobuf.Timestamp|undefined} value
 * @return {!proto.treum.risk.ComplianceStatusResponse} returns this
*/
proto.treum.risk.ComplianceStatusResponse.prototype.setLastUpdated = function(value) {
  return jspb.Message.setWrapperField(this, 3, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.treum.risk.ComplianceStatusResponse} returns this
 */
proto.treum.risk.ComplianceStatusResponse.prototype.clearLastUpdated = function() {
  return this.setLastUpdated(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.treum.risk.ComplianceStatusResponse.prototype.hasLastUpdated = function() {
  return jspb.Message.getField(this, 3) != null;
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.treum.risk.CreateRiskAlertRequest.repeatedFields_ = [12,13,16];



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.treum.risk.CreateRiskAlertRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.treum.risk.CreateRiskAlertRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.treum.risk.CreateRiskAlertRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.CreateRiskAlertRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    userId: jspb.Message.getFieldWithDefault(msg, 1, ""),
    accountId: jspb.Message.getFieldWithDefault(msg, 2, ""),
    tradeId: jspb.Message.getFieldWithDefault(msg, 3, ""),
    portfolioId: jspb.Message.getFieldWithDefault(msg, 4, ""),
    alertType: jspb.Message.getFieldWithDefault(msg, 5, 0),
    severity: jspb.Message.getFieldWithDefault(msg, 6, 0),
    priority: jspb.Message.getFieldWithDefault(msg, 7, 0),
    title: jspb.Message.getFieldWithDefault(msg, 8, ""),
    description: jspb.Message.getFieldWithDefault(msg, 9, ""),
    triggerConditions: (f = msg.getTriggerConditions()) && proto.treum.risk.TriggerConditions.toObject(includeInstance, f),
    contextData: jspb.Message.getFieldWithDefault(msg, 11, ""),
    recommendedActionsList: (f = jspb.Message.getRepeatedField(msg, 12)) == null ? undefined : f,
    automaticActionsList: (f = jspb.Message.getRepeatedField(msg, 13)) == null ? undefined : f,
    impactAssessment: (f = msg.getImpactAssessment()) && proto.treum.risk.ImpactAssessment.toObject(includeInstance, f),
    relatedEntities: (f = msg.getRelatedEntities()) && proto.treum.risk.RelatedEntities.toObject(includeInstance, f),
    notificationChannelsList: (f = jspb.Message.getRepeatedField(msg, 16)) == null ? undefined : f,
    escalationRules: (f = msg.getEscalationRules()) && proto.treum.risk.EscalationRules.toObject(includeInstance, f),
    expiresAt: (f = msg.getExpiresAt()) && google_protobuf_timestamp_pb.Timestamp.toObject(includeInstance, f)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.treum.risk.CreateRiskAlertRequest}
 */
proto.treum.risk.CreateRiskAlertRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.treum.risk.CreateRiskAlertRequest;
  return proto.treum.risk.CreateRiskAlertRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.treum.risk.CreateRiskAlertRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.treum.risk.CreateRiskAlertRequest}
 */
proto.treum.risk.CreateRiskAlertRequest.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setUserId(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setAccountId(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readString());
      msg.setTradeId(value);
      break;
    case 4:
      var value = /** @type {string} */ (reader.readString());
      msg.setPortfolioId(value);
      break;
    case 5:
      var value = /** @type {!proto.treum.risk.AlertType} */ (reader.readEnum());
      msg.setAlertType(value);
      break;
    case 6:
      var value = /** @type {!proto.treum.risk.AlertSeverity} */ (reader.readEnum());
      msg.setSeverity(value);
      break;
    case 7:
      var value = /** @type {!proto.treum.risk.AlertPriority} */ (reader.readEnum());
      msg.setPriority(value);
      break;
    case 8:
      var value = /** @type {string} */ (reader.readString());
      msg.setTitle(value);
      break;
    case 9:
      var value = /** @type {string} */ (reader.readString());
      msg.setDescription(value);
      break;
    case 10:
      var value = new proto.treum.risk.TriggerConditions;
      reader.readMessage(value,proto.treum.risk.TriggerConditions.deserializeBinaryFromReader);
      msg.setTriggerConditions(value);
      break;
    case 11:
      var value = /** @type {string} */ (reader.readString());
      msg.setContextData(value);
      break;
    case 12:
      var value = /** @type {string} */ (reader.readString());
      msg.addRecommendedActions(value);
      break;
    case 13:
      var value = /** @type {string} */ (reader.readString());
      msg.addAutomaticActions(value);
      break;
    case 14:
      var value = new proto.treum.risk.ImpactAssessment;
      reader.readMessage(value,proto.treum.risk.ImpactAssessment.deserializeBinaryFromReader);
      msg.setImpactAssessment(value);
      break;
    case 15:
      var value = new proto.treum.risk.RelatedEntities;
      reader.readMessage(value,proto.treum.risk.RelatedEntities.deserializeBinaryFromReader);
      msg.setRelatedEntities(value);
      break;
    case 16:
      var value = /** @type {string} */ (reader.readString());
      msg.addNotificationChannels(value);
      break;
    case 17:
      var value = new proto.treum.risk.EscalationRules;
      reader.readMessage(value,proto.treum.risk.EscalationRules.deserializeBinaryFromReader);
      msg.setEscalationRules(value);
      break;
    case 18:
      var value = new google_protobuf_timestamp_pb.Timestamp;
      reader.readMessage(value,google_protobuf_timestamp_pb.Timestamp.deserializeBinaryFromReader);
      msg.setExpiresAt(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.treum.risk.CreateRiskAlertRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.treum.risk.CreateRiskAlertRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.treum.risk.CreateRiskAlertRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.CreateRiskAlertRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getUserId();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getAccountId();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
  f = message.getTradeId();
  if (f.length > 0) {
    writer.writeString(
      3,
      f
    );
  }
  f = message.getPortfolioId();
  if (f.length > 0) {
    writer.writeString(
      4,
      f
    );
  }
  f = message.getAlertType();
  if (f !== 0.0) {
    writer.writeEnum(
      5,
      f
    );
  }
  f = message.getSeverity();
  if (f !== 0.0) {
    writer.writeEnum(
      6,
      f
    );
  }
  f = message.getPriority();
  if (f !== 0.0) {
    writer.writeEnum(
      7,
      f
    );
  }
  f = message.getTitle();
  if (f.length > 0) {
    writer.writeString(
      8,
      f
    );
  }
  f = message.getDescription();
  if (f.length > 0) {
    writer.writeString(
      9,
      f
    );
  }
  f = message.getTriggerConditions();
  if (f != null) {
    writer.writeMessage(
      10,
      f,
      proto.treum.risk.TriggerConditions.serializeBinaryToWriter
    );
  }
  f = message.getContextData();
  if (f.length > 0) {
    writer.writeString(
      11,
      f
    );
  }
  f = message.getRecommendedActionsList();
  if (f.length > 0) {
    writer.writeRepeatedString(
      12,
      f
    );
  }
  f = message.getAutomaticActionsList();
  if (f.length > 0) {
    writer.writeRepeatedString(
      13,
      f
    );
  }
  f = message.getImpactAssessment();
  if (f != null) {
    writer.writeMessage(
      14,
      f,
      proto.treum.risk.ImpactAssessment.serializeBinaryToWriter
    );
  }
  f = message.getRelatedEntities();
  if (f != null) {
    writer.writeMessage(
      15,
      f,
      proto.treum.risk.RelatedEntities.serializeBinaryToWriter
    );
  }
  f = message.getNotificationChannelsList();
  if (f.length > 0) {
    writer.writeRepeatedString(
      16,
      f
    );
  }
  f = message.getEscalationRules();
  if (f != null) {
    writer.writeMessage(
      17,
      f,
      proto.treum.risk.EscalationRules.serializeBinaryToWriter
    );
  }
  f = message.getExpiresAt();
  if (f != null) {
    writer.writeMessage(
      18,
      f,
      google_protobuf_timestamp_pb.Timestamp.serializeBinaryToWriter
    );
  }
};


/**
 * optional string user_id = 1;
 * @return {string}
 */
proto.treum.risk.CreateRiskAlertRequest.prototype.getUserId = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.CreateRiskAlertRequest} returns this
 */
proto.treum.risk.CreateRiskAlertRequest.prototype.setUserId = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional string account_id = 2;
 * @return {string}
 */
proto.treum.risk.CreateRiskAlertRequest.prototype.getAccountId = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.CreateRiskAlertRequest} returns this
 */
proto.treum.risk.CreateRiskAlertRequest.prototype.setAccountId = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};


/**
 * optional string trade_id = 3;
 * @return {string}
 */
proto.treum.risk.CreateRiskAlertRequest.prototype.getTradeId = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.CreateRiskAlertRequest} returns this
 */
proto.treum.risk.CreateRiskAlertRequest.prototype.setTradeId = function(value) {
  return jspb.Message.setProto3StringField(this, 3, value);
};


/**
 * optional string portfolio_id = 4;
 * @return {string}
 */
proto.treum.risk.CreateRiskAlertRequest.prototype.getPortfolioId = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 4, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.CreateRiskAlertRequest} returns this
 */
proto.treum.risk.CreateRiskAlertRequest.prototype.setPortfolioId = function(value) {
  return jspb.Message.setProto3StringField(this, 4, value);
};


/**
 * optional AlertType alert_type = 5;
 * @return {!proto.treum.risk.AlertType}
 */
proto.treum.risk.CreateRiskAlertRequest.prototype.getAlertType = function() {
  return /** @type {!proto.treum.risk.AlertType} */ (jspb.Message.getFieldWithDefault(this, 5, 0));
};


/**
 * @param {!proto.treum.risk.AlertType} value
 * @return {!proto.treum.risk.CreateRiskAlertRequest} returns this
 */
proto.treum.risk.CreateRiskAlertRequest.prototype.setAlertType = function(value) {
  return jspb.Message.setProto3EnumField(this, 5, value);
};


/**
 * optional AlertSeverity severity = 6;
 * @return {!proto.treum.risk.AlertSeverity}
 */
proto.treum.risk.CreateRiskAlertRequest.prototype.getSeverity = function() {
  return /** @type {!proto.treum.risk.AlertSeverity} */ (jspb.Message.getFieldWithDefault(this, 6, 0));
};


/**
 * @param {!proto.treum.risk.AlertSeverity} value
 * @return {!proto.treum.risk.CreateRiskAlertRequest} returns this
 */
proto.treum.risk.CreateRiskAlertRequest.prototype.setSeverity = function(value) {
  return jspb.Message.setProto3EnumField(this, 6, value);
};


/**
 * optional AlertPriority priority = 7;
 * @return {!proto.treum.risk.AlertPriority}
 */
proto.treum.risk.CreateRiskAlertRequest.prototype.getPriority = function() {
  return /** @type {!proto.treum.risk.AlertPriority} */ (jspb.Message.getFieldWithDefault(this, 7, 0));
};


/**
 * @param {!proto.treum.risk.AlertPriority} value
 * @return {!proto.treum.risk.CreateRiskAlertRequest} returns this
 */
proto.treum.risk.CreateRiskAlertRequest.prototype.setPriority = function(value) {
  return jspb.Message.setProto3EnumField(this, 7, value);
};


/**
 * optional string title = 8;
 * @return {string}
 */
proto.treum.risk.CreateRiskAlertRequest.prototype.getTitle = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 8, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.CreateRiskAlertRequest} returns this
 */
proto.treum.risk.CreateRiskAlertRequest.prototype.setTitle = function(value) {
  return jspb.Message.setProto3StringField(this, 8, value);
};


/**
 * optional string description = 9;
 * @return {string}
 */
proto.treum.risk.CreateRiskAlertRequest.prototype.getDescription = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 9, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.CreateRiskAlertRequest} returns this
 */
proto.treum.risk.CreateRiskAlertRequest.prototype.setDescription = function(value) {
  return jspb.Message.setProto3StringField(this, 9, value);
};


/**
 * optional TriggerConditions trigger_conditions = 10;
 * @return {?proto.treum.risk.TriggerConditions}
 */
proto.treum.risk.CreateRiskAlertRequest.prototype.getTriggerConditions = function() {
  return /** @type{?proto.treum.risk.TriggerConditions} */ (
    jspb.Message.getWrapperField(this, proto.treum.risk.TriggerConditions, 10));
};


/**
 * @param {?proto.treum.risk.TriggerConditions|undefined} value
 * @return {!proto.treum.risk.CreateRiskAlertRequest} returns this
*/
proto.treum.risk.CreateRiskAlertRequest.prototype.setTriggerConditions = function(value) {
  return jspb.Message.setWrapperField(this, 10, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.treum.risk.CreateRiskAlertRequest} returns this
 */
proto.treum.risk.CreateRiskAlertRequest.prototype.clearTriggerConditions = function() {
  return this.setTriggerConditions(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.treum.risk.CreateRiskAlertRequest.prototype.hasTriggerConditions = function() {
  return jspb.Message.getField(this, 10) != null;
};


/**
 * optional string context_data = 11;
 * @return {string}
 */
proto.treum.risk.CreateRiskAlertRequest.prototype.getContextData = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 11, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.CreateRiskAlertRequest} returns this
 */
proto.treum.risk.CreateRiskAlertRequest.prototype.setContextData = function(value) {
  return jspb.Message.setProto3StringField(this, 11, value);
};


/**
 * repeated string recommended_actions = 12;
 * @return {!Array<string>}
 */
proto.treum.risk.CreateRiskAlertRequest.prototype.getRecommendedActionsList = function() {
  return /** @type {!Array<string>} */ (jspb.Message.getRepeatedField(this, 12));
};


/**
 * @param {!Array<string>} value
 * @return {!proto.treum.risk.CreateRiskAlertRequest} returns this
 */
proto.treum.risk.CreateRiskAlertRequest.prototype.setRecommendedActionsList = function(value) {
  return jspb.Message.setField(this, 12, value || []);
};


/**
 * @param {string} value
 * @param {number=} opt_index
 * @return {!proto.treum.risk.CreateRiskAlertRequest} returns this
 */
proto.treum.risk.CreateRiskAlertRequest.prototype.addRecommendedActions = function(value, opt_index) {
  return jspb.Message.addToRepeatedField(this, 12, value, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.treum.risk.CreateRiskAlertRequest} returns this
 */
proto.treum.risk.CreateRiskAlertRequest.prototype.clearRecommendedActionsList = function() {
  return this.setRecommendedActionsList([]);
};


/**
 * repeated string automatic_actions = 13;
 * @return {!Array<string>}
 */
proto.treum.risk.CreateRiskAlertRequest.prototype.getAutomaticActionsList = function() {
  return /** @type {!Array<string>} */ (jspb.Message.getRepeatedField(this, 13));
};


/**
 * @param {!Array<string>} value
 * @return {!proto.treum.risk.CreateRiskAlertRequest} returns this
 */
proto.treum.risk.CreateRiskAlertRequest.prototype.setAutomaticActionsList = function(value) {
  return jspb.Message.setField(this, 13, value || []);
};


/**
 * @param {string} value
 * @param {number=} opt_index
 * @return {!proto.treum.risk.CreateRiskAlertRequest} returns this
 */
proto.treum.risk.CreateRiskAlertRequest.prototype.addAutomaticActions = function(value, opt_index) {
  return jspb.Message.addToRepeatedField(this, 13, value, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.treum.risk.CreateRiskAlertRequest} returns this
 */
proto.treum.risk.CreateRiskAlertRequest.prototype.clearAutomaticActionsList = function() {
  return this.setAutomaticActionsList([]);
};


/**
 * optional ImpactAssessment impact_assessment = 14;
 * @return {?proto.treum.risk.ImpactAssessment}
 */
proto.treum.risk.CreateRiskAlertRequest.prototype.getImpactAssessment = function() {
  return /** @type{?proto.treum.risk.ImpactAssessment} */ (
    jspb.Message.getWrapperField(this, proto.treum.risk.ImpactAssessment, 14));
};


/**
 * @param {?proto.treum.risk.ImpactAssessment|undefined} value
 * @return {!proto.treum.risk.CreateRiskAlertRequest} returns this
*/
proto.treum.risk.CreateRiskAlertRequest.prototype.setImpactAssessment = function(value) {
  return jspb.Message.setWrapperField(this, 14, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.treum.risk.CreateRiskAlertRequest} returns this
 */
proto.treum.risk.CreateRiskAlertRequest.prototype.clearImpactAssessment = function() {
  return this.setImpactAssessment(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.treum.risk.CreateRiskAlertRequest.prototype.hasImpactAssessment = function() {
  return jspb.Message.getField(this, 14) != null;
};


/**
 * optional RelatedEntities related_entities = 15;
 * @return {?proto.treum.risk.RelatedEntities}
 */
proto.treum.risk.CreateRiskAlertRequest.prototype.getRelatedEntities = function() {
  return /** @type{?proto.treum.risk.RelatedEntities} */ (
    jspb.Message.getWrapperField(this, proto.treum.risk.RelatedEntities, 15));
};


/**
 * @param {?proto.treum.risk.RelatedEntities|undefined} value
 * @return {!proto.treum.risk.CreateRiskAlertRequest} returns this
*/
proto.treum.risk.CreateRiskAlertRequest.prototype.setRelatedEntities = function(value) {
  return jspb.Message.setWrapperField(this, 15, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.treum.risk.CreateRiskAlertRequest} returns this
 */
proto.treum.risk.CreateRiskAlertRequest.prototype.clearRelatedEntities = function() {
  return this.setRelatedEntities(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.treum.risk.CreateRiskAlertRequest.prototype.hasRelatedEntities = function() {
  return jspb.Message.getField(this, 15) != null;
};


/**
 * repeated string notification_channels = 16;
 * @return {!Array<string>}
 */
proto.treum.risk.CreateRiskAlertRequest.prototype.getNotificationChannelsList = function() {
  return /** @type {!Array<string>} */ (jspb.Message.getRepeatedField(this, 16));
};


/**
 * @param {!Array<string>} value
 * @return {!proto.treum.risk.CreateRiskAlertRequest} returns this
 */
proto.treum.risk.CreateRiskAlertRequest.prototype.setNotificationChannelsList = function(value) {
  return jspb.Message.setField(this, 16, value || []);
};


/**
 * @param {string} value
 * @param {number=} opt_index
 * @return {!proto.treum.risk.CreateRiskAlertRequest} returns this
 */
proto.treum.risk.CreateRiskAlertRequest.prototype.addNotificationChannels = function(value, opt_index) {
  return jspb.Message.addToRepeatedField(this, 16, value, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.treum.risk.CreateRiskAlertRequest} returns this
 */
proto.treum.risk.CreateRiskAlertRequest.prototype.clearNotificationChannelsList = function() {
  return this.setNotificationChannelsList([]);
};


/**
 * optional EscalationRules escalation_rules = 17;
 * @return {?proto.treum.risk.EscalationRules}
 */
proto.treum.risk.CreateRiskAlertRequest.prototype.getEscalationRules = function() {
  return /** @type{?proto.treum.risk.EscalationRules} */ (
    jspb.Message.getWrapperField(this, proto.treum.risk.EscalationRules, 17));
};


/**
 * @param {?proto.treum.risk.EscalationRules|undefined} value
 * @return {!proto.treum.risk.CreateRiskAlertRequest} returns this
*/
proto.treum.risk.CreateRiskAlertRequest.prototype.setEscalationRules = function(value) {
  return jspb.Message.setWrapperField(this, 17, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.treum.risk.CreateRiskAlertRequest} returns this
 */
proto.treum.risk.CreateRiskAlertRequest.prototype.clearEscalationRules = function() {
  return this.setEscalationRules(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.treum.risk.CreateRiskAlertRequest.prototype.hasEscalationRules = function() {
  return jspb.Message.getField(this, 17) != null;
};


/**
 * optional google.protobuf.Timestamp expires_at = 18;
 * @return {?proto.google.protobuf.Timestamp}
 */
proto.treum.risk.CreateRiskAlertRequest.prototype.getExpiresAt = function() {
  return /** @type{?proto.google.protobuf.Timestamp} */ (
    jspb.Message.getWrapperField(this, google_protobuf_timestamp_pb.Timestamp, 18));
};


/**
 * @param {?proto.google.protobuf.Timestamp|undefined} value
 * @return {!proto.treum.risk.CreateRiskAlertRequest} returns this
*/
proto.treum.risk.CreateRiskAlertRequest.prototype.setExpiresAt = function(value) {
  return jspb.Message.setWrapperField(this, 18, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.treum.risk.CreateRiskAlertRequest} returns this
 */
proto.treum.risk.CreateRiskAlertRequest.prototype.clearExpiresAt = function() {
  return this.setExpiresAt(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.treum.risk.CreateRiskAlertRequest.prototype.hasExpiresAt = function() {
  return jspb.Message.getField(this, 18) != null;
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.treum.risk.TriggerConditions.prototype.toObject = function(opt_includeInstance) {
  return proto.treum.risk.TriggerConditions.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.treum.risk.TriggerConditions} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.TriggerConditions.toObject = function(includeInstance, msg) {
  var f, obj = {
    rule: jspb.Message.getFieldWithDefault(msg, 1, ""),
    threshold: jspb.Message.getFieldWithDefault(msg, 2, ""),
    actualValue: jspb.Message.getFieldWithDefault(msg, 3, ""),
    operator: jspb.Message.getFieldWithDefault(msg, 4, ""),
    timeWindow: jspb.Message.getFieldWithDefault(msg, 5, "")
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.treum.risk.TriggerConditions}
 */
proto.treum.risk.TriggerConditions.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.treum.risk.TriggerConditions;
  return proto.treum.risk.TriggerConditions.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.treum.risk.TriggerConditions} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.treum.risk.TriggerConditions}
 */
proto.treum.risk.TriggerConditions.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setRule(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setThreshold(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readString());
      msg.setActualValue(value);
      break;
    case 4:
      var value = /** @type {string} */ (reader.readString());
      msg.setOperator(value);
      break;
    case 5:
      var value = /** @type {string} */ (reader.readString());
      msg.setTimeWindow(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.treum.risk.TriggerConditions.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.treum.risk.TriggerConditions.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.treum.risk.TriggerConditions} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.TriggerConditions.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getRule();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getThreshold();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
  f = message.getActualValue();
  if (f.length > 0) {
    writer.writeString(
      3,
      f
    );
  }
  f = message.getOperator();
  if (f.length > 0) {
    writer.writeString(
      4,
      f
    );
  }
  f = message.getTimeWindow();
  if (f.length > 0) {
    writer.writeString(
      5,
      f
    );
  }
};


/**
 * optional string rule = 1;
 * @return {string}
 */
proto.treum.risk.TriggerConditions.prototype.getRule = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.TriggerConditions} returns this
 */
proto.treum.risk.TriggerConditions.prototype.setRule = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional string threshold = 2;
 * @return {string}
 */
proto.treum.risk.TriggerConditions.prototype.getThreshold = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.TriggerConditions} returns this
 */
proto.treum.risk.TriggerConditions.prototype.setThreshold = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};


/**
 * optional string actual_value = 3;
 * @return {string}
 */
proto.treum.risk.TriggerConditions.prototype.getActualValue = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.TriggerConditions} returns this
 */
proto.treum.risk.TriggerConditions.prototype.setActualValue = function(value) {
  return jspb.Message.setProto3StringField(this, 3, value);
};


/**
 * optional string operator = 4;
 * @return {string}
 */
proto.treum.risk.TriggerConditions.prototype.getOperator = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 4, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.TriggerConditions} returns this
 */
proto.treum.risk.TriggerConditions.prototype.setOperator = function(value) {
  return jspb.Message.setProto3StringField(this, 4, value);
};


/**
 * optional string time_window = 5;
 * @return {string}
 */
proto.treum.risk.TriggerConditions.prototype.getTimeWindow = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 5, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.TriggerConditions} returns this
 */
proto.treum.risk.TriggerConditions.prototype.setTimeWindow = function(value) {
  return jspb.Message.setProto3StringField(this, 5, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.treum.risk.ImpactAssessment.prototype.toObject = function(opt_includeInstance) {
  return proto.treum.risk.ImpactAssessment.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.treum.risk.ImpactAssessment} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.ImpactAssessment.toObject = function(includeInstance, msg) {
  var f, obj = {
    financialImpact: jspb.Message.getFloatingPointFieldWithDefault(msg, 1, 0.0),
    riskExposure: jspb.Message.getFloatingPointFieldWithDefault(msg, 2, 0.0),
    affectedPositions: jspb.Message.getFieldWithDefault(msg, 3, 0),
    potentialLoss: jspb.Message.getFloatingPointFieldWithDefault(msg, 4, 0.0),
    timeToResolution: jspb.Message.getFieldWithDefault(msg, 5, "")
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.treum.risk.ImpactAssessment}
 */
proto.treum.risk.ImpactAssessment.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.treum.risk.ImpactAssessment;
  return proto.treum.risk.ImpactAssessment.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.treum.risk.ImpactAssessment} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.treum.risk.ImpactAssessment}
 */
proto.treum.risk.ImpactAssessment.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setFinancialImpact(value);
      break;
    case 2:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setRiskExposure(value);
      break;
    case 3:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setAffectedPositions(value);
      break;
    case 4:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setPotentialLoss(value);
      break;
    case 5:
      var value = /** @type {string} */ (reader.readString());
      msg.setTimeToResolution(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.treum.risk.ImpactAssessment.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.treum.risk.ImpactAssessment.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.treum.risk.ImpactAssessment} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.ImpactAssessment.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getFinancialImpact();
  if (f !== 0.0) {
    writer.writeDouble(
      1,
      f
    );
  }
  f = message.getRiskExposure();
  if (f !== 0.0) {
    writer.writeDouble(
      2,
      f
    );
  }
  f = message.getAffectedPositions();
  if (f !== 0) {
    writer.writeInt32(
      3,
      f
    );
  }
  f = message.getPotentialLoss();
  if (f !== 0.0) {
    writer.writeDouble(
      4,
      f
    );
  }
  f = message.getTimeToResolution();
  if (f.length > 0) {
    writer.writeString(
      5,
      f
    );
  }
};


/**
 * optional double financial_impact = 1;
 * @return {number}
 */
proto.treum.risk.ImpactAssessment.prototype.getFinancialImpact = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 1, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.ImpactAssessment} returns this
 */
proto.treum.risk.ImpactAssessment.prototype.setFinancialImpact = function(value) {
  return jspb.Message.setProto3FloatField(this, 1, value);
};


/**
 * optional double risk_exposure = 2;
 * @return {number}
 */
proto.treum.risk.ImpactAssessment.prototype.getRiskExposure = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 2, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.ImpactAssessment} returns this
 */
proto.treum.risk.ImpactAssessment.prototype.setRiskExposure = function(value) {
  return jspb.Message.setProto3FloatField(this, 2, value);
};


/**
 * optional int32 affected_positions = 3;
 * @return {number}
 */
proto.treum.risk.ImpactAssessment.prototype.getAffectedPositions = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 3, 0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.ImpactAssessment} returns this
 */
proto.treum.risk.ImpactAssessment.prototype.setAffectedPositions = function(value) {
  return jspb.Message.setProto3IntField(this, 3, value);
};


/**
 * optional double potential_loss = 4;
 * @return {number}
 */
proto.treum.risk.ImpactAssessment.prototype.getPotentialLoss = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 4, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.ImpactAssessment} returns this
 */
proto.treum.risk.ImpactAssessment.prototype.setPotentialLoss = function(value) {
  return jspb.Message.setProto3FloatField(this, 4, value);
};


/**
 * optional string time_to_resolution = 5;
 * @return {string}
 */
proto.treum.risk.ImpactAssessment.prototype.getTimeToResolution = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 5, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.ImpactAssessment} returns this
 */
proto.treum.risk.ImpactAssessment.prototype.setTimeToResolution = function(value) {
  return jspb.Message.setProto3StringField(this, 5, value);
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.treum.risk.RelatedEntities.repeatedFields_ = [1,2,3,4];



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.treum.risk.RelatedEntities.prototype.toObject = function(opt_includeInstance) {
  return proto.treum.risk.RelatedEntities.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.treum.risk.RelatedEntities} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.RelatedEntities.toObject = function(includeInstance, msg) {
  var f, obj = {
    tradesList: (f = jspb.Message.getRepeatedField(msg, 1)) == null ? undefined : f,
    positionsList: (f = jspb.Message.getRepeatedField(msg, 2)) == null ? undefined : f,
    accountsList: (f = jspb.Message.getRepeatedField(msg, 3)) == null ? undefined : f,
    alertsList: (f = jspb.Message.getRepeatedField(msg, 4)) == null ? undefined : f
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.treum.risk.RelatedEntities}
 */
proto.treum.risk.RelatedEntities.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.treum.risk.RelatedEntities;
  return proto.treum.risk.RelatedEntities.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.treum.risk.RelatedEntities} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.treum.risk.RelatedEntities}
 */
proto.treum.risk.RelatedEntities.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.addTrades(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.addPositions(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readString());
      msg.addAccounts(value);
      break;
    case 4:
      var value = /** @type {string} */ (reader.readString());
      msg.addAlerts(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.treum.risk.RelatedEntities.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.treum.risk.RelatedEntities.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.treum.risk.RelatedEntities} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.RelatedEntities.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getTradesList();
  if (f.length > 0) {
    writer.writeRepeatedString(
      1,
      f
    );
  }
  f = message.getPositionsList();
  if (f.length > 0) {
    writer.writeRepeatedString(
      2,
      f
    );
  }
  f = message.getAccountsList();
  if (f.length > 0) {
    writer.writeRepeatedString(
      3,
      f
    );
  }
  f = message.getAlertsList();
  if (f.length > 0) {
    writer.writeRepeatedString(
      4,
      f
    );
  }
};


/**
 * repeated string trades = 1;
 * @return {!Array<string>}
 */
proto.treum.risk.RelatedEntities.prototype.getTradesList = function() {
  return /** @type {!Array<string>} */ (jspb.Message.getRepeatedField(this, 1));
};


/**
 * @param {!Array<string>} value
 * @return {!proto.treum.risk.RelatedEntities} returns this
 */
proto.treum.risk.RelatedEntities.prototype.setTradesList = function(value) {
  return jspb.Message.setField(this, 1, value || []);
};


/**
 * @param {string} value
 * @param {number=} opt_index
 * @return {!proto.treum.risk.RelatedEntities} returns this
 */
proto.treum.risk.RelatedEntities.prototype.addTrades = function(value, opt_index) {
  return jspb.Message.addToRepeatedField(this, 1, value, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.treum.risk.RelatedEntities} returns this
 */
proto.treum.risk.RelatedEntities.prototype.clearTradesList = function() {
  return this.setTradesList([]);
};


/**
 * repeated string positions = 2;
 * @return {!Array<string>}
 */
proto.treum.risk.RelatedEntities.prototype.getPositionsList = function() {
  return /** @type {!Array<string>} */ (jspb.Message.getRepeatedField(this, 2));
};


/**
 * @param {!Array<string>} value
 * @return {!proto.treum.risk.RelatedEntities} returns this
 */
proto.treum.risk.RelatedEntities.prototype.setPositionsList = function(value) {
  return jspb.Message.setField(this, 2, value || []);
};


/**
 * @param {string} value
 * @param {number=} opt_index
 * @return {!proto.treum.risk.RelatedEntities} returns this
 */
proto.treum.risk.RelatedEntities.prototype.addPositions = function(value, opt_index) {
  return jspb.Message.addToRepeatedField(this, 2, value, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.treum.risk.RelatedEntities} returns this
 */
proto.treum.risk.RelatedEntities.prototype.clearPositionsList = function() {
  return this.setPositionsList([]);
};


/**
 * repeated string accounts = 3;
 * @return {!Array<string>}
 */
proto.treum.risk.RelatedEntities.prototype.getAccountsList = function() {
  return /** @type {!Array<string>} */ (jspb.Message.getRepeatedField(this, 3));
};


/**
 * @param {!Array<string>} value
 * @return {!proto.treum.risk.RelatedEntities} returns this
 */
proto.treum.risk.RelatedEntities.prototype.setAccountsList = function(value) {
  return jspb.Message.setField(this, 3, value || []);
};


/**
 * @param {string} value
 * @param {number=} opt_index
 * @return {!proto.treum.risk.RelatedEntities} returns this
 */
proto.treum.risk.RelatedEntities.prototype.addAccounts = function(value, opt_index) {
  return jspb.Message.addToRepeatedField(this, 3, value, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.treum.risk.RelatedEntities} returns this
 */
proto.treum.risk.RelatedEntities.prototype.clearAccountsList = function() {
  return this.setAccountsList([]);
};


/**
 * repeated string alerts = 4;
 * @return {!Array<string>}
 */
proto.treum.risk.RelatedEntities.prototype.getAlertsList = function() {
  return /** @type {!Array<string>} */ (jspb.Message.getRepeatedField(this, 4));
};


/**
 * @param {!Array<string>} value
 * @return {!proto.treum.risk.RelatedEntities} returns this
 */
proto.treum.risk.RelatedEntities.prototype.setAlertsList = function(value) {
  return jspb.Message.setField(this, 4, value || []);
};


/**
 * @param {string} value
 * @param {number=} opt_index
 * @return {!proto.treum.risk.RelatedEntities} returns this
 */
proto.treum.risk.RelatedEntities.prototype.addAlerts = function(value, opt_index) {
  return jspb.Message.addToRepeatedField(this, 4, value, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.treum.risk.RelatedEntities} returns this
 */
proto.treum.risk.RelatedEntities.prototype.clearAlertsList = function() {
  return this.setAlertsList([]);
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.treum.risk.EscalationRules.repeatedFields_ = [2];



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.treum.risk.EscalationRules.prototype.toObject = function(opt_includeInstance) {
  return proto.treum.risk.EscalationRules.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.treum.risk.EscalationRules} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.EscalationRules.toObject = function(includeInstance, msg) {
  var f, obj = {
    escalateAfterMinutes: jspb.Message.getFieldWithDefault(msg, 1, 0),
    escalateToList: (f = jspb.Message.getRepeatedField(msg, 2)) == null ? undefined : f,
    escalationSeverity: jspb.Message.getFieldWithDefault(msg, 3, 0)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.treum.risk.EscalationRules}
 */
proto.treum.risk.EscalationRules.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.treum.risk.EscalationRules;
  return proto.treum.risk.EscalationRules.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.treum.risk.EscalationRules} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.treum.risk.EscalationRules}
 */
proto.treum.risk.EscalationRules.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setEscalateAfterMinutes(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.addEscalateTo(value);
      break;
    case 3:
      var value = /** @type {!proto.treum.risk.AlertSeverity} */ (reader.readEnum());
      msg.setEscalationSeverity(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.treum.risk.EscalationRules.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.treum.risk.EscalationRules.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.treum.risk.EscalationRules} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.EscalationRules.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getEscalateAfterMinutes();
  if (f !== 0) {
    writer.writeInt32(
      1,
      f
    );
  }
  f = message.getEscalateToList();
  if (f.length > 0) {
    writer.writeRepeatedString(
      2,
      f
    );
  }
  f = message.getEscalationSeverity();
  if (f !== 0.0) {
    writer.writeEnum(
      3,
      f
    );
  }
};


/**
 * optional int32 escalate_after_minutes = 1;
 * @return {number}
 */
proto.treum.risk.EscalationRules.prototype.getEscalateAfterMinutes = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 1, 0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.EscalationRules} returns this
 */
proto.treum.risk.EscalationRules.prototype.setEscalateAfterMinutes = function(value) {
  return jspb.Message.setProto3IntField(this, 1, value);
};


/**
 * repeated string escalate_to = 2;
 * @return {!Array<string>}
 */
proto.treum.risk.EscalationRules.prototype.getEscalateToList = function() {
  return /** @type {!Array<string>} */ (jspb.Message.getRepeatedField(this, 2));
};


/**
 * @param {!Array<string>} value
 * @return {!proto.treum.risk.EscalationRules} returns this
 */
proto.treum.risk.EscalationRules.prototype.setEscalateToList = function(value) {
  return jspb.Message.setField(this, 2, value || []);
};


/**
 * @param {string} value
 * @param {number=} opt_index
 * @return {!proto.treum.risk.EscalationRules} returns this
 */
proto.treum.risk.EscalationRules.prototype.addEscalateTo = function(value, opt_index) {
  return jspb.Message.addToRepeatedField(this, 2, value, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.treum.risk.EscalationRules} returns this
 */
proto.treum.risk.EscalationRules.prototype.clearEscalateToList = function() {
  return this.setEscalateToList([]);
};


/**
 * optional AlertSeverity escalation_severity = 3;
 * @return {!proto.treum.risk.AlertSeverity}
 */
proto.treum.risk.EscalationRules.prototype.getEscalationSeverity = function() {
  return /** @type {!proto.treum.risk.AlertSeverity} */ (jspb.Message.getFieldWithDefault(this, 3, 0));
};


/**
 * @param {!proto.treum.risk.AlertSeverity} value
 * @return {!proto.treum.risk.EscalationRules} returns this
 */
proto.treum.risk.EscalationRules.prototype.setEscalationSeverity = function(value) {
  return jspb.Message.setProto3EnumField(this, 3, value);
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.treum.risk.RiskAlertResponse.repeatedFields_ = [14,15,26,30];



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.treum.risk.RiskAlertResponse.prototype.toObject = function(opt_includeInstance) {
  return proto.treum.risk.RiskAlertResponse.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.treum.risk.RiskAlertResponse} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.RiskAlertResponse.toObject = function(includeInstance, msg) {
  var f, obj = {
    id: jspb.Message.getFieldWithDefault(msg, 1, ""),
    userId: jspb.Message.getFieldWithDefault(msg, 2, ""),
    accountId: jspb.Message.getFieldWithDefault(msg, 3, ""),
    tradeId: jspb.Message.getFieldWithDefault(msg, 4, ""),
    portfolioId: jspb.Message.getFieldWithDefault(msg, 5, ""),
    alertType: jspb.Message.getFieldWithDefault(msg, 6, 0),
    severity: jspb.Message.getFieldWithDefault(msg, 7, 0),
    priority: jspb.Message.getFieldWithDefault(msg, 8, 0),
    status: jspb.Message.getFieldWithDefault(msg, 9, 0),
    title: jspb.Message.getFieldWithDefault(msg, 10, ""),
    description: jspb.Message.getFieldWithDefault(msg, 11, ""),
    triggerConditions: (f = msg.getTriggerConditions()) && proto.treum.risk.TriggerConditions.toObject(includeInstance, f),
    contextData: jspb.Message.getFieldWithDefault(msg, 13, ""),
    recommendedActionsList: (f = jspb.Message.getRepeatedField(msg, 14)) == null ? undefined : f,
    automaticActionsList: (f = jspb.Message.getRepeatedField(msg, 15)) == null ? undefined : f,
    impactAssessment: (f = msg.getImpactAssessment()) && proto.treum.risk.ImpactAssessment.toObject(includeInstance, f),
    relatedEntities: (f = msg.getRelatedEntities()) && proto.treum.risk.RelatedEntities.toObject(includeInstance, f),
    acknowledgedBy: jspb.Message.getFieldWithDefault(msg, 18, ""),
    acknowledgedAt: (f = msg.getAcknowledgedAt()) && google_protobuf_timestamp_pb.Timestamp.toObject(includeInstance, f),
    acknowledgmentComments: jspb.Message.getFieldWithDefault(msg, 20, ""),
    assignedTo: jspb.Message.getFieldWithDefault(msg, 21, ""),
    assignedAt: (f = msg.getAssignedAt()) && google_protobuf_timestamp_pb.Timestamp.toObject(includeInstance, f),
    resolvedBy: jspb.Message.getFieldWithDefault(msg, 23, ""),
    resolvedAt: (f = msg.getResolvedAt()) && google_protobuf_timestamp_pb.Timestamp.toObject(includeInstance, f),
    resolutionDetails: jspb.Message.getFieldWithDefault(msg, 25, ""),
    resolutionActionsList: (f = jspb.Message.getRepeatedField(msg, 26)) == null ? undefined : f,
    isEscalated: jspb.Message.getBooleanFieldWithDefault(msg, 27, false),
    escalatedAt: (f = msg.getEscalatedAt()) && google_protobuf_timestamp_pb.Timestamp.toObject(includeInstance, f),
    escalationRules: (f = msg.getEscalationRules()) && proto.treum.risk.EscalationRules.toObject(includeInstance, f),
    notificationChannelsList: (f = jspb.Message.getRepeatedField(msg, 30)) == null ? undefined : f,
    expiresAt: (f = msg.getExpiresAt()) && google_protobuf_timestamp_pb.Timestamp.toObject(includeInstance, f),
    isAutoGenerated: jspb.Message.getBooleanFieldWithDefault(msg, 32, false),
    createdAt: (f = msg.getCreatedAt()) && google_protobuf_timestamp_pb.Timestamp.toObject(includeInstance, f),
    updatedAt: (f = msg.getUpdatedAt()) && google_protobuf_timestamp_pb.Timestamp.toObject(includeInstance, f)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.treum.risk.RiskAlertResponse}
 */
proto.treum.risk.RiskAlertResponse.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.treum.risk.RiskAlertResponse;
  return proto.treum.risk.RiskAlertResponse.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.treum.risk.RiskAlertResponse} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.treum.risk.RiskAlertResponse}
 */
proto.treum.risk.RiskAlertResponse.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setId(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setUserId(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readString());
      msg.setAccountId(value);
      break;
    case 4:
      var value = /** @type {string} */ (reader.readString());
      msg.setTradeId(value);
      break;
    case 5:
      var value = /** @type {string} */ (reader.readString());
      msg.setPortfolioId(value);
      break;
    case 6:
      var value = /** @type {!proto.treum.risk.AlertType} */ (reader.readEnum());
      msg.setAlertType(value);
      break;
    case 7:
      var value = /** @type {!proto.treum.risk.AlertSeverity} */ (reader.readEnum());
      msg.setSeverity(value);
      break;
    case 8:
      var value = /** @type {!proto.treum.risk.AlertPriority} */ (reader.readEnum());
      msg.setPriority(value);
      break;
    case 9:
      var value = /** @type {!proto.treum.risk.AlertStatus} */ (reader.readEnum());
      msg.setStatus(value);
      break;
    case 10:
      var value = /** @type {string} */ (reader.readString());
      msg.setTitle(value);
      break;
    case 11:
      var value = /** @type {string} */ (reader.readString());
      msg.setDescription(value);
      break;
    case 12:
      var value = new proto.treum.risk.TriggerConditions;
      reader.readMessage(value,proto.treum.risk.TriggerConditions.deserializeBinaryFromReader);
      msg.setTriggerConditions(value);
      break;
    case 13:
      var value = /** @type {string} */ (reader.readString());
      msg.setContextData(value);
      break;
    case 14:
      var value = /** @type {string} */ (reader.readString());
      msg.addRecommendedActions(value);
      break;
    case 15:
      var value = /** @type {string} */ (reader.readString());
      msg.addAutomaticActions(value);
      break;
    case 16:
      var value = new proto.treum.risk.ImpactAssessment;
      reader.readMessage(value,proto.treum.risk.ImpactAssessment.deserializeBinaryFromReader);
      msg.setImpactAssessment(value);
      break;
    case 17:
      var value = new proto.treum.risk.RelatedEntities;
      reader.readMessage(value,proto.treum.risk.RelatedEntities.deserializeBinaryFromReader);
      msg.setRelatedEntities(value);
      break;
    case 18:
      var value = /** @type {string} */ (reader.readString());
      msg.setAcknowledgedBy(value);
      break;
    case 19:
      var value = new google_protobuf_timestamp_pb.Timestamp;
      reader.readMessage(value,google_protobuf_timestamp_pb.Timestamp.deserializeBinaryFromReader);
      msg.setAcknowledgedAt(value);
      break;
    case 20:
      var value = /** @type {string} */ (reader.readString());
      msg.setAcknowledgmentComments(value);
      break;
    case 21:
      var value = /** @type {string} */ (reader.readString());
      msg.setAssignedTo(value);
      break;
    case 22:
      var value = new google_protobuf_timestamp_pb.Timestamp;
      reader.readMessage(value,google_protobuf_timestamp_pb.Timestamp.deserializeBinaryFromReader);
      msg.setAssignedAt(value);
      break;
    case 23:
      var value = /** @type {string} */ (reader.readString());
      msg.setResolvedBy(value);
      break;
    case 24:
      var value = new google_protobuf_timestamp_pb.Timestamp;
      reader.readMessage(value,google_protobuf_timestamp_pb.Timestamp.deserializeBinaryFromReader);
      msg.setResolvedAt(value);
      break;
    case 25:
      var value = /** @type {string} */ (reader.readString());
      msg.setResolutionDetails(value);
      break;
    case 26:
      var value = /** @type {string} */ (reader.readString());
      msg.addResolutionActions(value);
      break;
    case 27:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setIsEscalated(value);
      break;
    case 28:
      var value = new google_protobuf_timestamp_pb.Timestamp;
      reader.readMessage(value,google_protobuf_timestamp_pb.Timestamp.deserializeBinaryFromReader);
      msg.setEscalatedAt(value);
      break;
    case 29:
      var value = new proto.treum.risk.EscalationRules;
      reader.readMessage(value,proto.treum.risk.EscalationRules.deserializeBinaryFromReader);
      msg.setEscalationRules(value);
      break;
    case 30:
      var value = /** @type {string} */ (reader.readString());
      msg.addNotificationChannels(value);
      break;
    case 31:
      var value = new google_protobuf_timestamp_pb.Timestamp;
      reader.readMessage(value,google_protobuf_timestamp_pb.Timestamp.deserializeBinaryFromReader);
      msg.setExpiresAt(value);
      break;
    case 32:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setIsAutoGenerated(value);
      break;
    case 33:
      var value = new google_protobuf_timestamp_pb.Timestamp;
      reader.readMessage(value,google_protobuf_timestamp_pb.Timestamp.deserializeBinaryFromReader);
      msg.setCreatedAt(value);
      break;
    case 34:
      var value = new google_protobuf_timestamp_pb.Timestamp;
      reader.readMessage(value,google_protobuf_timestamp_pb.Timestamp.deserializeBinaryFromReader);
      msg.setUpdatedAt(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.treum.risk.RiskAlertResponse.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.treum.risk.RiskAlertResponse.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.treum.risk.RiskAlertResponse} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.RiskAlertResponse.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getId();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getUserId();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
  f = message.getAccountId();
  if (f.length > 0) {
    writer.writeString(
      3,
      f
    );
  }
  f = message.getTradeId();
  if (f.length > 0) {
    writer.writeString(
      4,
      f
    );
  }
  f = message.getPortfolioId();
  if (f.length > 0) {
    writer.writeString(
      5,
      f
    );
  }
  f = message.getAlertType();
  if (f !== 0.0) {
    writer.writeEnum(
      6,
      f
    );
  }
  f = message.getSeverity();
  if (f !== 0.0) {
    writer.writeEnum(
      7,
      f
    );
  }
  f = message.getPriority();
  if (f !== 0.0) {
    writer.writeEnum(
      8,
      f
    );
  }
  f = message.getStatus();
  if (f !== 0.0) {
    writer.writeEnum(
      9,
      f
    );
  }
  f = message.getTitle();
  if (f.length > 0) {
    writer.writeString(
      10,
      f
    );
  }
  f = message.getDescription();
  if (f.length > 0) {
    writer.writeString(
      11,
      f
    );
  }
  f = message.getTriggerConditions();
  if (f != null) {
    writer.writeMessage(
      12,
      f,
      proto.treum.risk.TriggerConditions.serializeBinaryToWriter
    );
  }
  f = message.getContextData();
  if (f.length > 0) {
    writer.writeString(
      13,
      f
    );
  }
  f = message.getRecommendedActionsList();
  if (f.length > 0) {
    writer.writeRepeatedString(
      14,
      f
    );
  }
  f = message.getAutomaticActionsList();
  if (f.length > 0) {
    writer.writeRepeatedString(
      15,
      f
    );
  }
  f = message.getImpactAssessment();
  if (f != null) {
    writer.writeMessage(
      16,
      f,
      proto.treum.risk.ImpactAssessment.serializeBinaryToWriter
    );
  }
  f = message.getRelatedEntities();
  if (f != null) {
    writer.writeMessage(
      17,
      f,
      proto.treum.risk.RelatedEntities.serializeBinaryToWriter
    );
  }
  f = message.getAcknowledgedBy();
  if (f.length > 0) {
    writer.writeString(
      18,
      f
    );
  }
  f = message.getAcknowledgedAt();
  if (f != null) {
    writer.writeMessage(
      19,
      f,
      google_protobuf_timestamp_pb.Timestamp.serializeBinaryToWriter
    );
  }
  f = message.getAcknowledgmentComments();
  if (f.length > 0) {
    writer.writeString(
      20,
      f
    );
  }
  f = message.getAssignedTo();
  if (f.length > 0) {
    writer.writeString(
      21,
      f
    );
  }
  f = message.getAssignedAt();
  if (f != null) {
    writer.writeMessage(
      22,
      f,
      google_protobuf_timestamp_pb.Timestamp.serializeBinaryToWriter
    );
  }
  f = message.getResolvedBy();
  if (f.length > 0) {
    writer.writeString(
      23,
      f
    );
  }
  f = message.getResolvedAt();
  if (f != null) {
    writer.writeMessage(
      24,
      f,
      google_protobuf_timestamp_pb.Timestamp.serializeBinaryToWriter
    );
  }
  f = message.getResolutionDetails();
  if (f.length > 0) {
    writer.writeString(
      25,
      f
    );
  }
  f = message.getResolutionActionsList();
  if (f.length > 0) {
    writer.writeRepeatedString(
      26,
      f
    );
  }
  f = message.getIsEscalated();
  if (f) {
    writer.writeBool(
      27,
      f
    );
  }
  f = message.getEscalatedAt();
  if (f != null) {
    writer.writeMessage(
      28,
      f,
      google_protobuf_timestamp_pb.Timestamp.serializeBinaryToWriter
    );
  }
  f = message.getEscalationRules();
  if (f != null) {
    writer.writeMessage(
      29,
      f,
      proto.treum.risk.EscalationRules.serializeBinaryToWriter
    );
  }
  f = message.getNotificationChannelsList();
  if (f.length > 0) {
    writer.writeRepeatedString(
      30,
      f
    );
  }
  f = message.getExpiresAt();
  if (f != null) {
    writer.writeMessage(
      31,
      f,
      google_protobuf_timestamp_pb.Timestamp.serializeBinaryToWriter
    );
  }
  f = message.getIsAutoGenerated();
  if (f) {
    writer.writeBool(
      32,
      f
    );
  }
  f = message.getCreatedAt();
  if (f != null) {
    writer.writeMessage(
      33,
      f,
      google_protobuf_timestamp_pb.Timestamp.serializeBinaryToWriter
    );
  }
  f = message.getUpdatedAt();
  if (f != null) {
    writer.writeMessage(
      34,
      f,
      google_protobuf_timestamp_pb.Timestamp.serializeBinaryToWriter
    );
  }
};


/**
 * optional string id = 1;
 * @return {string}
 */
proto.treum.risk.RiskAlertResponse.prototype.getId = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.RiskAlertResponse} returns this
 */
proto.treum.risk.RiskAlertResponse.prototype.setId = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional string user_id = 2;
 * @return {string}
 */
proto.treum.risk.RiskAlertResponse.prototype.getUserId = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.RiskAlertResponse} returns this
 */
proto.treum.risk.RiskAlertResponse.prototype.setUserId = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};


/**
 * optional string account_id = 3;
 * @return {string}
 */
proto.treum.risk.RiskAlertResponse.prototype.getAccountId = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.RiskAlertResponse} returns this
 */
proto.treum.risk.RiskAlertResponse.prototype.setAccountId = function(value) {
  return jspb.Message.setProto3StringField(this, 3, value);
};


/**
 * optional string trade_id = 4;
 * @return {string}
 */
proto.treum.risk.RiskAlertResponse.prototype.getTradeId = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 4, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.RiskAlertResponse} returns this
 */
proto.treum.risk.RiskAlertResponse.prototype.setTradeId = function(value) {
  return jspb.Message.setProto3StringField(this, 4, value);
};


/**
 * optional string portfolio_id = 5;
 * @return {string}
 */
proto.treum.risk.RiskAlertResponse.prototype.getPortfolioId = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 5, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.RiskAlertResponse} returns this
 */
proto.treum.risk.RiskAlertResponse.prototype.setPortfolioId = function(value) {
  return jspb.Message.setProto3StringField(this, 5, value);
};


/**
 * optional AlertType alert_type = 6;
 * @return {!proto.treum.risk.AlertType}
 */
proto.treum.risk.RiskAlertResponse.prototype.getAlertType = function() {
  return /** @type {!proto.treum.risk.AlertType} */ (jspb.Message.getFieldWithDefault(this, 6, 0));
};


/**
 * @param {!proto.treum.risk.AlertType} value
 * @return {!proto.treum.risk.RiskAlertResponse} returns this
 */
proto.treum.risk.RiskAlertResponse.prototype.setAlertType = function(value) {
  return jspb.Message.setProto3EnumField(this, 6, value);
};


/**
 * optional AlertSeverity severity = 7;
 * @return {!proto.treum.risk.AlertSeverity}
 */
proto.treum.risk.RiskAlertResponse.prototype.getSeverity = function() {
  return /** @type {!proto.treum.risk.AlertSeverity} */ (jspb.Message.getFieldWithDefault(this, 7, 0));
};


/**
 * @param {!proto.treum.risk.AlertSeverity} value
 * @return {!proto.treum.risk.RiskAlertResponse} returns this
 */
proto.treum.risk.RiskAlertResponse.prototype.setSeverity = function(value) {
  return jspb.Message.setProto3EnumField(this, 7, value);
};


/**
 * optional AlertPriority priority = 8;
 * @return {!proto.treum.risk.AlertPriority}
 */
proto.treum.risk.RiskAlertResponse.prototype.getPriority = function() {
  return /** @type {!proto.treum.risk.AlertPriority} */ (jspb.Message.getFieldWithDefault(this, 8, 0));
};


/**
 * @param {!proto.treum.risk.AlertPriority} value
 * @return {!proto.treum.risk.RiskAlertResponse} returns this
 */
proto.treum.risk.RiskAlertResponse.prototype.setPriority = function(value) {
  return jspb.Message.setProto3EnumField(this, 8, value);
};


/**
 * optional AlertStatus status = 9;
 * @return {!proto.treum.risk.AlertStatus}
 */
proto.treum.risk.RiskAlertResponse.prototype.getStatus = function() {
  return /** @type {!proto.treum.risk.AlertStatus} */ (jspb.Message.getFieldWithDefault(this, 9, 0));
};


/**
 * @param {!proto.treum.risk.AlertStatus} value
 * @return {!proto.treum.risk.RiskAlertResponse} returns this
 */
proto.treum.risk.RiskAlertResponse.prototype.setStatus = function(value) {
  return jspb.Message.setProto3EnumField(this, 9, value);
};


/**
 * optional string title = 10;
 * @return {string}
 */
proto.treum.risk.RiskAlertResponse.prototype.getTitle = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 10, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.RiskAlertResponse} returns this
 */
proto.treum.risk.RiskAlertResponse.prototype.setTitle = function(value) {
  return jspb.Message.setProto3StringField(this, 10, value);
};


/**
 * optional string description = 11;
 * @return {string}
 */
proto.treum.risk.RiskAlertResponse.prototype.getDescription = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 11, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.RiskAlertResponse} returns this
 */
proto.treum.risk.RiskAlertResponse.prototype.setDescription = function(value) {
  return jspb.Message.setProto3StringField(this, 11, value);
};


/**
 * optional TriggerConditions trigger_conditions = 12;
 * @return {?proto.treum.risk.TriggerConditions}
 */
proto.treum.risk.RiskAlertResponse.prototype.getTriggerConditions = function() {
  return /** @type{?proto.treum.risk.TriggerConditions} */ (
    jspb.Message.getWrapperField(this, proto.treum.risk.TriggerConditions, 12));
};


/**
 * @param {?proto.treum.risk.TriggerConditions|undefined} value
 * @return {!proto.treum.risk.RiskAlertResponse} returns this
*/
proto.treum.risk.RiskAlertResponse.prototype.setTriggerConditions = function(value) {
  return jspb.Message.setWrapperField(this, 12, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.treum.risk.RiskAlertResponse} returns this
 */
proto.treum.risk.RiskAlertResponse.prototype.clearTriggerConditions = function() {
  return this.setTriggerConditions(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.treum.risk.RiskAlertResponse.prototype.hasTriggerConditions = function() {
  return jspb.Message.getField(this, 12) != null;
};


/**
 * optional string context_data = 13;
 * @return {string}
 */
proto.treum.risk.RiskAlertResponse.prototype.getContextData = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 13, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.RiskAlertResponse} returns this
 */
proto.treum.risk.RiskAlertResponse.prototype.setContextData = function(value) {
  return jspb.Message.setProto3StringField(this, 13, value);
};


/**
 * repeated string recommended_actions = 14;
 * @return {!Array<string>}
 */
proto.treum.risk.RiskAlertResponse.prototype.getRecommendedActionsList = function() {
  return /** @type {!Array<string>} */ (jspb.Message.getRepeatedField(this, 14));
};


/**
 * @param {!Array<string>} value
 * @return {!proto.treum.risk.RiskAlertResponse} returns this
 */
proto.treum.risk.RiskAlertResponse.prototype.setRecommendedActionsList = function(value) {
  return jspb.Message.setField(this, 14, value || []);
};


/**
 * @param {string} value
 * @param {number=} opt_index
 * @return {!proto.treum.risk.RiskAlertResponse} returns this
 */
proto.treum.risk.RiskAlertResponse.prototype.addRecommendedActions = function(value, opt_index) {
  return jspb.Message.addToRepeatedField(this, 14, value, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.treum.risk.RiskAlertResponse} returns this
 */
proto.treum.risk.RiskAlertResponse.prototype.clearRecommendedActionsList = function() {
  return this.setRecommendedActionsList([]);
};


/**
 * repeated string automatic_actions = 15;
 * @return {!Array<string>}
 */
proto.treum.risk.RiskAlertResponse.prototype.getAutomaticActionsList = function() {
  return /** @type {!Array<string>} */ (jspb.Message.getRepeatedField(this, 15));
};


/**
 * @param {!Array<string>} value
 * @return {!proto.treum.risk.RiskAlertResponse} returns this
 */
proto.treum.risk.RiskAlertResponse.prototype.setAutomaticActionsList = function(value) {
  return jspb.Message.setField(this, 15, value || []);
};


/**
 * @param {string} value
 * @param {number=} opt_index
 * @return {!proto.treum.risk.RiskAlertResponse} returns this
 */
proto.treum.risk.RiskAlertResponse.prototype.addAutomaticActions = function(value, opt_index) {
  return jspb.Message.addToRepeatedField(this, 15, value, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.treum.risk.RiskAlertResponse} returns this
 */
proto.treum.risk.RiskAlertResponse.prototype.clearAutomaticActionsList = function() {
  return this.setAutomaticActionsList([]);
};


/**
 * optional ImpactAssessment impact_assessment = 16;
 * @return {?proto.treum.risk.ImpactAssessment}
 */
proto.treum.risk.RiskAlertResponse.prototype.getImpactAssessment = function() {
  return /** @type{?proto.treum.risk.ImpactAssessment} */ (
    jspb.Message.getWrapperField(this, proto.treum.risk.ImpactAssessment, 16));
};


/**
 * @param {?proto.treum.risk.ImpactAssessment|undefined} value
 * @return {!proto.treum.risk.RiskAlertResponse} returns this
*/
proto.treum.risk.RiskAlertResponse.prototype.setImpactAssessment = function(value) {
  return jspb.Message.setWrapperField(this, 16, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.treum.risk.RiskAlertResponse} returns this
 */
proto.treum.risk.RiskAlertResponse.prototype.clearImpactAssessment = function() {
  return this.setImpactAssessment(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.treum.risk.RiskAlertResponse.prototype.hasImpactAssessment = function() {
  return jspb.Message.getField(this, 16) != null;
};


/**
 * optional RelatedEntities related_entities = 17;
 * @return {?proto.treum.risk.RelatedEntities}
 */
proto.treum.risk.RiskAlertResponse.prototype.getRelatedEntities = function() {
  return /** @type{?proto.treum.risk.RelatedEntities} */ (
    jspb.Message.getWrapperField(this, proto.treum.risk.RelatedEntities, 17));
};


/**
 * @param {?proto.treum.risk.RelatedEntities|undefined} value
 * @return {!proto.treum.risk.RiskAlertResponse} returns this
*/
proto.treum.risk.RiskAlertResponse.prototype.setRelatedEntities = function(value) {
  return jspb.Message.setWrapperField(this, 17, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.treum.risk.RiskAlertResponse} returns this
 */
proto.treum.risk.RiskAlertResponse.prototype.clearRelatedEntities = function() {
  return this.setRelatedEntities(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.treum.risk.RiskAlertResponse.prototype.hasRelatedEntities = function() {
  return jspb.Message.getField(this, 17) != null;
};


/**
 * optional string acknowledged_by = 18;
 * @return {string}
 */
proto.treum.risk.RiskAlertResponse.prototype.getAcknowledgedBy = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 18, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.RiskAlertResponse} returns this
 */
proto.treum.risk.RiskAlertResponse.prototype.setAcknowledgedBy = function(value) {
  return jspb.Message.setProto3StringField(this, 18, value);
};


/**
 * optional google.protobuf.Timestamp acknowledged_at = 19;
 * @return {?proto.google.protobuf.Timestamp}
 */
proto.treum.risk.RiskAlertResponse.prototype.getAcknowledgedAt = function() {
  return /** @type{?proto.google.protobuf.Timestamp} */ (
    jspb.Message.getWrapperField(this, google_protobuf_timestamp_pb.Timestamp, 19));
};


/**
 * @param {?proto.google.protobuf.Timestamp|undefined} value
 * @return {!proto.treum.risk.RiskAlertResponse} returns this
*/
proto.treum.risk.RiskAlertResponse.prototype.setAcknowledgedAt = function(value) {
  return jspb.Message.setWrapperField(this, 19, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.treum.risk.RiskAlertResponse} returns this
 */
proto.treum.risk.RiskAlertResponse.prototype.clearAcknowledgedAt = function() {
  return this.setAcknowledgedAt(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.treum.risk.RiskAlertResponse.prototype.hasAcknowledgedAt = function() {
  return jspb.Message.getField(this, 19) != null;
};


/**
 * optional string acknowledgment_comments = 20;
 * @return {string}
 */
proto.treum.risk.RiskAlertResponse.prototype.getAcknowledgmentComments = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 20, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.RiskAlertResponse} returns this
 */
proto.treum.risk.RiskAlertResponse.prototype.setAcknowledgmentComments = function(value) {
  return jspb.Message.setProto3StringField(this, 20, value);
};


/**
 * optional string assigned_to = 21;
 * @return {string}
 */
proto.treum.risk.RiskAlertResponse.prototype.getAssignedTo = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 21, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.RiskAlertResponse} returns this
 */
proto.treum.risk.RiskAlertResponse.prototype.setAssignedTo = function(value) {
  return jspb.Message.setProto3StringField(this, 21, value);
};


/**
 * optional google.protobuf.Timestamp assigned_at = 22;
 * @return {?proto.google.protobuf.Timestamp}
 */
proto.treum.risk.RiskAlertResponse.prototype.getAssignedAt = function() {
  return /** @type{?proto.google.protobuf.Timestamp} */ (
    jspb.Message.getWrapperField(this, google_protobuf_timestamp_pb.Timestamp, 22));
};


/**
 * @param {?proto.google.protobuf.Timestamp|undefined} value
 * @return {!proto.treum.risk.RiskAlertResponse} returns this
*/
proto.treum.risk.RiskAlertResponse.prototype.setAssignedAt = function(value) {
  return jspb.Message.setWrapperField(this, 22, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.treum.risk.RiskAlertResponse} returns this
 */
proto.treum.risk.RiskAlertResponse.prototype.clearAssignedAt = function() {
  return this.setAssignedAt(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.treum.risk.RiskAlertResponse.prototype.hasAssignedAt = function() {
  return jspb.Message.getField(this, 22) != null;
};


/**
 * optional string resolved_by = 23;
 * @return {string}
 */
proto.treum.risk.RiskAlertResponse.prototype.getResolvedBy = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 23, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.RiskAlertResponse} returns this
 */
proto.treum.risk.RiskAlertResponse.prototype.setResolvedBy = function(value) {
  return jspb.Message.setProto3StringField(this, 23, value);
};


/**
 * optional google.protobuf.Timestamp resolved_at = 24;
 * @return {?proto.google.protobuf.Timestamp}
 */
proto.treum.risk.RiskAlertResponse.prototype.getResolvedAt = function() {
  return /** @type{?proto.google.protobuf.Timestamp} */ (
    jspb.Message.getWrapperField(this, google_protobuf_timestamp_pb.Timestamp, 24));
};


/**
 * @param {?proto.google.protobuf.Timestamp|undefined} value
 * @return {!proto.treum.risk.RiskAlertResponse} returns this
*/
proto.treum.risk.RiskAlertResponse.prototype.setResolvedAt = function(value) {
  return jspb.Message.setWrapperField(this, 24, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.treum.risk.RiskAlertResponse} returns this
 */
proto.treum.risk.RiskAlertResponse.prototype.clearResolvedAt = function() {
  return this.setResolvedAt(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.treum.risk.RiskAlertResponse.prototype.hasResolvedAt = function() {
  return jspb.Message.getField(this, 24) != null;
};


/**
 * optional string resolution_details = 25;
 * @return {string}
 */
proto.treum.risk.RiskAlertResponse.prototype.getResolutionDetails = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 25, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.RiskAlertResponse} returns this
 */
proto.treum.risk.RiskAlertResponse.prototype.setResolutionDetails = function(value) {
  return jspb.Message.setProto3StringField(this, 25, value);
};


/**
 * repeated string resolution_actions = 26;
 * @return {!Array<string>}
 */
proto.treum.risk.RiskAlertResponse.prototype.getResolutionActionsList = function() {
  return /** @type {!Array<string>} */ (jspb.Message.getRepeatedField(this, 26));
};


/**
 * @param {!Array<string>} value
 * @return {!proto.treum.risk.RiskAlertResponse} returns this
 */
proto.treum.risk.RiskAlertResponse.prototype.setResolutionActionsList = function(value) {
  return jspb.Message.setField(this, 26, value || []);
};


/**
 * @param {string} value
 * @param {number=} opt_index
 * @return {!proto.treum.risk.RiskAlertResponse} returns this
 */
proto.treum.risk.RiskAlertResponse.prototype.addResolutionActions = function(value, opt_index) {
  return jspb.Message.addToRepeatedField(this, 26, value, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.treum.risk.RiskAlertResponse} returns this
 */
proto.treum.risk.RiskAlertResponse.prototype.clearResolutionActionsList = function() {
  return this.setResolutionActionsList([]);
};


/**
 * optional bool is_escalated = 27;
 * @return {boolean}
 */
proto.treum.risk.RiskAlertResponse.prototype.getIsEscalated = function() {
  return /** @type {boolean} */ (jspb.Message.getBooleanFieldWithDefault(this, 27, false));
};


/**
 * @param {boolean} value
 * @return {!proto.treum.risk.RiskAlertResponse} returns this
 */
proto.treum.risk.RiskAlertResponse.prototype.setIsEscalated = function(value) {
  return jspb.Message.setProto3BooleanField(this, 27, value);
};


/**
 * optional google.protobuf.Timestamp escalated_at = 28;
 * @return {?proto.google.protobuf.Timestamp}
 */
proto.treum.risk.RiskAlertResponse.prototype.getEscalatedAt = function() {
  return /** @type{?proto.google.protobuf.Timestamp} */ (
    jspb.Message.getWrapperField(this, google_protobuf_timestamp_pb.Timestamp, 28));
};


/**
 * @param {?proto.google.protobuf.Timestamp|undefined} value
 * @return {!proto.treum.risk.RiskAlertResponse} returns this
*/
proto.treum.risk.RiskAlertResponse.prototype.setEscalatedAt = function(value) {
  return jspb.Message.setWrapperField(this, 28, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.treum.risk.RiskAlertResponse} returns this
 */
proto.treum.risk.RiskAlertResponse.prototype.clearEscalatedAt = function() {
  return this.setEscalatedAt(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.treum.risk.RiskAlertResponse.prototype.hasEscalatedAt = function() {
  return jspb.Message.getField(this, 28) != null;
};


/**
 * optional EscalationRules escalation_rules = 29;
 * @return {?proto.treum.risk.EscalationRules}
 */
proto.treum.risk.RiskAlertResponse.prototype.getEscalationRules = function() {
  return /** @type{?proto.treum.risk.EscalationRules} */ (
    jspb.Message.getWrapperField(this, proto.treum.risk.EscalationRules, 29));
};


/**
 * @param {?proto.treum.risk.EscalationRules|undefined} value
 * @return {!proto.treum.risk.RiskAlertResponse} returns this
*/
proto.treum.risk.RiskAlertResponse.prototype.setEscalationRules = function(value) {
  return jspb.Message.setWrapperField(this, 29, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.treum.risk.RiskAlertResponse} returns this
 */
proto.treum.risk.RiskAlertResponse.prototype.clearEscalationRules = function() {
  return this.setEscalationRules(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.treum.risk.RiskAlertResponse.prototype.hasEscalationRules = function() {
  return jspb.Message.getField(this, 29) != null;
};


/**
 * repeated string notification_channels = 30;
 * @return {!Array<string>}
 */
proto.treum.risk.RiskAlertResponse.prototype.getNotificationChannelsList = function() {
  return /** @type {!Array<string>} */ (jspb.Message.getRepeatedField(this, 30));
};


/**
 * @param {!Array<string>} value
 * @return {!proto.treum.risk.RiskAlertResponse} returns this
 */
proto.treum.risk.RiskAlertResponse.prototype.setNotificationChannelsList = function(value) {
  return jspb.Message.setField(this, 30, value || []);
};


/**
 * @param {string} value
 * @param {number=} opt_index
 * @return {!proto.treum.risk.RiskAlertResponse} returns this
 */
proto.treum.risk.RiskAlertResponse.prototype.addNotificationChannels = function(value, opt_index) {
  return jspb.Message.addToRepeatedField(this, 30, value, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.treum.risk.RiskAlertResponse} returns this
 */
proto.treum.risk.RiskAlertResponse.prototype.clearNotificationChannelsList = function() {
  return this.setNotificationChannelsList([]);
};


/**
 * optional google.protobuf.Timestamp expires_at = 31;
 * @return {?proto.google.protobuf.Timestamp}
 */
proto.treum.risk.RiskAlertResponse.prototype.getExpiresAt = function() {
  return /** @type{?proto.google.protobuf.Timestamp} */ (
    jspb.Message.getWrapperField(this, google_protobuf_timestamp_pb.Timestamp, 31));
};


/**
 * @param {?proto.google.protobuf.Timestamp|undefined} value
 * @return {!proto.treum.risk.RiskAlertResponse} returns this
*/
proto.treum.risk.RiskAlertResponse.prototype.setExpiresAt = function(value) {
  return jspb.Message.setWrapperField(this, 31, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.treum.risk.RiskAlertResponse} returns this
 */
proto.treum.risk.RiskAlertResponse.prototype.clearExpiresAt = function() {
  return this.setExpiresAt(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.treum.risk.RiskAlertResponse.prototype.hasExpiresAt = function() {
  return jspb.Message.getField(this, 31) != null;
};


/**
 * optional bool is_auto_generated = 32;
 * @return {boolean}
 */
proto.treum.risk.RiskAlertResponse.prototype.getIsAutoGenerated = function() {
  return /** @type {boolean} */ (jspb.Message.getBooleanFieldWithDefault(this, 32, false));
};


/**
 * @param {boolean} value
 * @return {!proto.treum.risk.RiskAlertResponse} returns this
 */
proto.treum.risk.RiskAlertResponse.prototype.setIsAutoGenerated = function(value) {
  return jspb.Message.setProto3BooleanField(this, 32, value);
};


/**
 * optional google.protobuf.Timestamp created_at = 33;
 * @return {?proto.google.protobuf.Timestamp}
 */
proto.treum.risk.RiskAlertResponse.prototype.getCreatedAt = function() {
  return /** @type{?proto.google.protobuf.Timestamp} */ (
    jspb.Message.getWrapperField(this, google_protobuf_timestamp_pb.Timestamp, 33));
};


/**
 * @param {?proto.google.protobuf.Timestamp|undefined} value
 * @return {!proto.treum.risk.RiskAlertResponse} returns this
*/
proto.treum.risk.RiskAlertResponse.prototype.setCreatedAt = function(value) {
  return jspb.Message.setWrapperField(this, 33, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.treum.risk.RiskAlertResponse} returns this
 */
proto.treum.risk.RiskAlertResponse.prototype.clearCreatedAt = function() {
  return this.setCreatedAt(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.treum.risk.RiskAlertResponse.prototype.hasCreatedAt = function() {
  return jspb.Message.getField(this, 33) != null;
};


/**
 * optional google.protobuf.Timestamp updated_at = 34;
 * @return {?proto.google.protobuf.Timestamp}
 */
proto.treum.risk.RiskAlertResponse.prototype.getUpdatedAt = function() {
  return /** @type{?proto.google.protobuf.Timestamp} */ (
    jspb.Message.getWrapperField(this, google_protobuf_timestamp_pb.Timestamp, 34));
};


/**
 * @param {?proto.google.protobuf.Timestamp|undefined} value
 * @return {!proto.treum.risk.RiskAlertResponse} returns this
*/
proto.treum.risk.RiskAlertResponse.prototype.setUpdatedAt = function(value) {
  return jspb.Message.setWrapperField(this, 34, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.treum.risk.RiskAlertResponse} returns this
 */
proto.treum.risk.RiskAlertResponse.prototype.clearUpdatedAt = function() {
  return this.setUpdatedAt(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.treum.risk.RiskAlertResponse.prototype.hasUpdatedAt = function() {
  return jspb.Message.getField(this, 34) != null;
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.treum.risk.GetActiveAlertsRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.treum.risk.GetActiveAlertsRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.treum.risk.GetActiveAlertsRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.GetActiveAlertsRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    userId: jspb.Message.getFieldWithDefault(msg, 1, ""),
    accountId: jspb.Message.getFieldWithDefault(msg, 2, ""),
    alertType: jspb.Message.getFieldWithDefault(msg, 3, 0),
    severity: jspb.Message.getFieldWithDefault(msg, 4, 0),
    priority: jspb.Message.getFieldWithDefault(msg, 5, 0),
    limit: jspb.Message.getFieldWithDefault(msg, 6, 0)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.treum.risk.GetActiveAlertsRequest}
 */
proto.treum.risk.GetActiveAlertsRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.treum.risk.GetActiveAlertsRequest;
  return proto.treum.risk.GetActiveAlertsRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.treum.risk.GetActiveAlertsRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.treum.risk.GetActiveAlertsRequest}
 */
proto.treum.risk.GetActiveAlertsRequest.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setUserId(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setAccountId(value);
      break;
    case 3:
      var value = /** @type {!proto.treum.risk.AlertType} */ (reader.readEnum());
      msg.setAlertType(value);
      break;
    case 4:
      var value = /** @type {!proto.treum.risk.AlertSeverity} */ (reader.readEnum());
      msg.setSeverity(value);
      break;
    case 5:
      var value = /** @type {!proto.treum.risk.AlertPriority} */ (reader.readEnum());
      msg.setPriority(value);
      break;
    case 6:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setLimit(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.treum.risk.GetActiveAlertsRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.treum.risk.GetActiveAlertsRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.treum.risk.GetActiveAlertsRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.GetActiveAlertsRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getUserId();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getAccountId();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
  f = message.getAlertType();
  if (f !== 0.0) {
    writer.writeEnum(
      3,
      f
    );
  }
  f = message.getSeverity();
  if (f !== 0.0) {
    writer.writeEnum(
      4,
      f
    );
  }
  f = message.getPriority();
  if (f !== 0.0) {
    writer.writeEnum(
      5,
      f
    );
  }
  f = message.getLimit();
  if (f !== 0) {
    writer.writeInt32(
      6,
      f
    );
  }
};


/**
 * optional string user_id = 1;
 * @return {string}
 */
proto.treum.risk.GetActiveAlertsRequest.prototype.getUserId = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.GetActiveAlertsRequest} returns this
 */
proto.treum.risk.GetActiveAlertsRequest.prototype.setUserId = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional string account_id = 2;
 * @return {string}
 */
proto.treum.risk.GetActiveAlertsRequest.prototype.getAccountId = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.GetActiveAlertsRequest} returns this
 */
proto.treum.risk.GetActiveAlertsRequest.prototype.setAccountId = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};


/**
 * optional AlertType alert_type = 3;
 * @return {!proto.treum.risk.AlertType}
 */
proto.treum.risk.GetActiveAlertsRequest.prototype.getAlertType = function() {
  return /** @type {!proto.treum.risk.AlertType} */ (jspb.Message.getFieldWithDefault(this, 3, 0));
};


/**
 * @param {!proto.treum.risk.AlertType} value
 * @return {!proto.treum.risk.GetActiveAlertsRequest} returns this
 */
proto.treum.risk.GetActiveAlertsRequest.prototype.setAlertType = function(value) {
  return jspb.Message.setProto3EnumField(this, 3, value);
};


/**
 * optional AlertSeverity severity = 4;
 * @return {!proto.treum.risk.AlertSeverity}
 */
proto.treum.risk.GetActiveAlertsRequest.prototype.getSeverity = function() {
  return /** @type {!proto.treum.risk.AlertSeverity} */ (jspb.Message.getFieldWithDefault(this, 4, 0));
};


/**
 * @param {!proto.treum.risk.AlertSeverity} value
 * @return {!proto.treum.risk.GetActiveAlertsRequest} returns this
 */
proto.treum.risk.GetActiveAlertsRequest.prototype.setSeverity = function(value) {
  return jspb.Message.setProto3EnumField(this, 4, value);
};


/**
 * optional AlertPriority priority = 5;
 * @return {!proto.treum.risk.AlertPriority}
 */
proto.treum.risk.GetActiveAlertsRequest.prototype.getPriority = function() {
  return /** @type {!proto.treum.risk.AlertPriority} */ (jspb.Message.getFieldWithDefault(this, 5, 0));
};


/**
 * @param {!proto.treum.risk.AlertPriority} value
 * @return {!proto.treum.risk.GetActiveAlertsRequest} returns this
 */
proto.treum.risk.GetActiveAlertsRequest.prototype.setPriority = function(value) {
  return jspb.Message.setProto3EnumField(this, 5, value);
};


/**
 * optional int32 limit = 6;
 * @return {number}
 */
proto.treum.risk.GetActiveAlertsRequest.prototype.getLimit = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 6, 0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.GetActiveAlertsRequest} returns this
 */
proto.treum.risk.GetActiveAlertsRequest.prototype.setLimit = function(value) {
  return jspb.Message.setProto3IntField(this, 6, value);
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.treum.risk.ListRiskAlertsResponse.repeatedFields_ = [1];



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.treum.risk.ListRiskAlertsResponse.prototype.toObject = function(opt_includeInstance) {
  return proto.treum.risk.ListRiskAlertsResponse.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.treum.risk.ListRiskAlertsResponse} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.ListRiskAlertsResponse.toObject = function(includeInstance, msg) {
  var f, obj = {
    alertsList: jspb.Message.toObjectList(msg.getAlertsList(),
    proto.treum.risk.RiskAlertResponse.toObject, includeInstance),
    total: jspb.Message.getFieldWithDefault(msg, 2, 0),
    page: jspb.Message.getFieldWithDefault(msg, 3, 0),
    limit: jspb.Message.getFieldWithDefault(msg, 4, 0),
    totalPages: jspb.Message.getFieldWithDefault(msg, 5, 0)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.treum.risk.ListRiskAlertsResponse}
 */
proto.treum.risk.ListRiskAlertsResponse.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.treum.risk.ListRiskAlertsResponse;
  return proto.treum.risk.ListRiskAlertsResponse.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.treum.risk.ListRiskAlertsResponse} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.treum.risk.ListRiskAlertsResponse}
 */
proto.treum.risk.ListRiskAlertsResponse.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.treum.risk.RiskAlertResponse;
      reader.readMessage(value,proto.treum.risk.RiskAlertResponse.deserializeBinaryFromReader);
      msg.addAlerts(value);
      break;
    case 2:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setTotal(value);
      break;
    case 3:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setPage(value);
      break;
    case 4:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setLimit(value);
      break;
    case 5:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setTotalPages(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.treum.risk.ListRiskAlertsResponse.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.treum.risk.ListRiskAlertsResponse.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.treum.risk.ListRiskAlertsResponse} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.ListRiskAlertsResponse.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getAlertsList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      1,
      f,
      proto.treum.risk.RiskAlertResponse.serializeBinaryToWriter
    );
  }
  f = message.getTotal();
  if (f !== 0) {
    writer.writeInt32(
      2,
      f
    );
  }
  f = message.getPage();
  if (f !== 0) {
    writer.writeInt32(
      3,
      f
    );
  }
  f = message.getLimit();
  if (f !== 0) {
    writer.writeInt32(
      4,
      f
    );
  }
  f = message.getTotalPages();
  if (f !== 0) {
    writer.writeInt32(
      5,
      f
    );
  }
};


/**
 * repeated RiskAlertResponse alerts = 1;
 * @return {!Array<!proto.treum.risk.RiskAlertResponse>}
 */
proto.treum.risk.ListRiskAlertsResponse.prototype.getAlertsList = function() {
  return /** @type{!Array<!proto.treum.risk.RiskAlertResponse>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.treum.risk.RiskAlertResponse, 1));
};


/**
 * @param {!Array<!proto.treum.risk.RiskAlertResponse>} value
 * @return {!proto.treum.risk.ListRiskAlertsResponse} returns this
*/
proto.treum.risk.ListRiskAlertsResponse.prototype.setAlertsList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 1, value);
};


/**
 * @param {!proto.treum.risk.RiskAlertResponse=} opt_value
 * @param {number=} opt_index
 * @return {!proto.treum.risk.RiskAlertResponse}
 */
proto.treum.risk.ListRiskAlertsResponse.prototype.addAlerts = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 1, opt_value, proto.treum.risk.RiskAlertResponse, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.treum.risk.ListRiskAlertsResponse} returns this
 */
proto.treum.risk.ListRiskAlertsResponse.prototype.clearAlertsList = function() {
  return this.setAlertsList([]);
};


/**
 * optional int32 total = 2;
 * @return {number}
 */
proto.treum.risk.ListRiskAlertsResponse.prototype.getTotal = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.ListRiskAlertsResponse} returns this
 */
proto.treum.risk.ListRiskAlertsResponse.prototype.setTotal = function(value) {
  return jspb.Message.setProto3IntField(this, 2, value);
};


/**
 * optional int32 page = 3;
 * @return {number}
 */
proto.treum.risk.ListRiskAlertsResponse.prototype.getPage = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 3, 0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.ListRiskAlertsResponse} returns this
 */
proto.treum.risk.ListRiskAlertsResponse.prototype.setPage = function(value) {
  return jspb.Message.setProto3IntField(this, 3, value);
};


/**
 * optional int32 limit = 4;
 * @return {number}
 */
proto.treum.risk.ListRiskAlertsResponse.prototype.getLimit = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 4, 0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.ListRiskAlertsResponse} returns this
 */
proto.treum.risk.ListRiskAlertsResponse.prototype.setLimit = function(value) {
  return jspb.Message.setProto3IntField(this, 4, value);
};


/**
 * optional int32 total_pages = 5;
 * @return {number}
 */
proto.treum.risk.ListRiskAlertsResponse.prototype.getTotalPages = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 5, 0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.ListRiskAlertsResponse} returns this
 */
proto.treum.risk.ListRiskAlertsResponse.prototype.setTotalPages = function(value) {
  return jspb.Message.setProto3IntField(this, 5, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.treum.risk.AcknowledgeAlertRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.treum.risk.AcknowledgeAlertRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.treum.risk.AcknowledgeAlertRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.AcknowledgeAlertRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    alertId: jspb.Message.getFieldWithDefault(msg, 1, ""),
    acknowledgedBy: jspb.Message.getFieldWithDefault(msg, 2, ""),
    comments: jspb.Message.getFieldWithDefault(msg, 3, "")
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.treum.risk.AcknowledgeAlertRequest}
 */
proto.treum.risk.AcknowledgeAlertRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.treum.risk.AcknowledgeAlertRequest;
  return proto.treum.risk.AcknowledgeAlertRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.treum.risk.AcknowledgeAlertRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.treum.risk.AcknowledgeAlertRequest}
 */
proto.treum.risk.AcknowledgeAlertRequest.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setAlertId(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setAcknowledgedBy(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readString());
      msg.setComments(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.treum.risk.AcknowledgeAlertRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.treum.risk.AcknowledgeAlertRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.treum.risk.AcknowledgeAlertRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.AcknowledgeAlertRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getAlertId();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getAcknowledgedBy();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
  f = message.getComments();
  if (f.length > 0) {
    writer.writeString(
      3,
      f
    );
  }
};


/**
 * optional string alert_id = 1;
 * @return {string}
 */
proto.treum.risk.AcknowledgeAlertRequest.prototype.getAlertId = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.AcknowledgeAlertRequest} returns this
 */
proto.treum.risk.AcknowledgeAlertRequest.prototype.setAlertId = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional string acknowledged_by = 2;
 * @return {string}
 */
proto.treum.risk.AcknowledgeAlertRequest.prototype.getAcknowledgedBy = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.AcknowledgeAlertRequest} returns this
 */
proto.treum.risk.AcknowledgeAlertRequest.prototype.setAcknowledgedBy = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};


/**
 * optional string comments = 3;
 * @return {string}
 */
proto.treum.risk.AcknowledgeAlertRequest.prototype.getComments = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.AcknowledgeAlertRequest} returns this
 */
proto.treum.risk.AcknowledgeAlertRequest.prototype.setComments = function(value) {
  return jspb.Message.setProto3StringField(this, 3, value);
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.treum.risk.ResolveAlertRequest.repeatedFields_ = [4];



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.treum.risk.ResolveAlertRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.treum.risk.ResolveAlertRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.treum.risk.ResolveAlertRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.ResolveAlertRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    alertId: jspb.Message.getFieldWithDefault(msg, 1, ""),
    resolvedBy: jspb.Message.getFieldWithDefault(msg, 2, ""),
    resolutionDetails: jspb.Message.getFieldWithDefault(msg, 3, ""),
    resolutionActionsList: (f = jspb.Message.getRepeatedField(msg, 4)) == null ? undefined : f
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.treum.risk.ResolveAlertRequest}
 */
proto.treum.risk.ResolveAlertRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.treum.risk.ResolveAlertRequest;
  return proto.treum.risk.ResolveAlertRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.treum.risk.ResolveAlertRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.treum.risk.ResolveAlertRequest}
 */
proto.treum.risk.ResolveAlertRequest.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setAlertId(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setResolvedBy(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readString());
      msg.setResolutionDetails(value);
      break;
    case 4:
      var value = /** @type {string} */ (reader.readString());
      msg.addResolutionActions(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.treum.risk.ResolveAlertRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.treum.risk.ResolveAlertRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.treum.risk.ResolveAlertRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.ResolveAlertRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getAlertId();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getResolvedBy();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
  f = message.getResolutionDetails();
  if (f.length > 0) {
    writer.writeString(
      3,
      f
    );
  }
  f = message.getResolutionActionsList();
  if (f.length > 0) {
    writer.writeRepeatedString(
      4,
      f
    );
  }
};


/**
 * optional string alert_id = 1;
 * @return {string}
 */
proto.treum.risk.ResolveAlertRequest.prototype.getAlertId = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.ResolveAlertRequest} returns this
 */
proto.treum.risk.ResolveAlertRequest.prototype.setAlertId = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional string resolved_by = 2;
 * @return {string}
 */
proto.treum.risk.ResolveAlertRequest.prototype.getResolvedBy = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.ResolveAlertRequest} returns this
 */
proto.treum.risk.ResolveAlertRequest.prototype.setResolvedBy = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};


/**
 * optional string resolution_details = 3;
 * @return {string}
 */
proto.treum.risk.ResolveAlertRequest.prototype.getResolutionDetails = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.ResolveAlertRequest} returns this
 */
proto.treum.risk.ResolveAlertRequest.prototype.setResolutionDetails = function(value) {
  return jspb.Message.setProto3StringField(this, 3, value);
};


/**
 * repeated string resolution_actions = 4;
 * @return {!Array<string>}
 */
proto.treum.risk.ResolveAlertRequest.prototype.getResolutionActionsList = function() {
  return /** @type {!Array<string>} */ (jspb.Message.getRepeatedField(this, 4));
};


/**
 * @param {!Array<string>} value
 * @return {!proto.treum.risk.ResolveAlertRequest} returns this
 */
proto.treum.risk.ResolveAlertRequest.prototype.setResolutionActionsList = function(value) {
  return jspb.Message.setField(this, 4, value || []);
};


/**
 * @param {string} value
 * @param {number=} opt_index
 * @return {!proto.treum.risk.ResolveAlertRequest} returns this
 */
proto.treum.risk.ResolveAlertRequest.prototype.addResolutionActions = function(value, opt_index) {
  return jspb.Message.addToRepeatedField(this, 4, value, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.treum.risk.ResolveAlertRequest} returns this
 */
proto.treum.risk.ResolveAlertRequest.prototype.clearResolutionActionsList = function() {
  return this.setResolutionActionsList([]);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.treum.risk.CreateRiskLimitRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.treum.risk.CreateRiskLimitRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.treum.risk.CreateRiskLimitRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.CreateRiskLimitRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    userId: jspb.Message.getFieldWithDefault(msg, 1, ""),
    accountId: jspb.Message.getFieldWithDefault(msg, 2, ""),
    portfolioId: jspb.Message.getFieldWithDefault(msg, 3, ""),
    limitType: jspb.Message.getFieldWithDefault(msg, 4, 0),
    scope: jspb.Message.getFieldWithDefault(msg, 5, 0),
    name: jspb.Message.getFieldWithDefault(msg, 6, ""),
    description: jspb.Message.getFieldWithDefault(msg, 7, ""),
    limitValue: jspb.Message.getFloatingPointFieldWithDefault(msg, 8, 0.0),
    warningThreshold: jspb.Message.getFloatingPointFieldWithDefault(msg, 9, 0.0),
    status: jspb.Message.getFieldWithDefault(msg, 10, 0),
    frequency: jspb.Message.getFieldWithDefault(msg, 11, 0),
    limitConfig: jspb.Message.getFieldWithDefault(msg, 12, ""),
    breachActions: jspb.Message.getFieldWithDefault(msg, 13, ""),
    effectiveFrom: (f = msg.getEffectiveFrom()) && google_protobuf_timestamp_pb.Timestamp.toObject(includeInstance, f),
    effectiveTo: (f = msg.getEffectiveTo()) && google_protobuf_timestamp_pb.Timestamp.toObject(includeInstance, f),
    createdBy: jspb.Message.getFieldWithDefault(msg, 16, "")
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.treum.risk.CreateRiskLimitRequest}
 */
proto.treum.risk.CreateRiskLimitRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.treum.risk.CreateRiskLimitRequest;
  return proto.treum.risk.CreateRiskLimitRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.treum.risk.CreateRiskLimitRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.treum.risk.CreateRiskLimitRequest}
 */
proto.treum.risk.CreateRiskLimitRequest.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setUserId(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setAccountId(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readString());
      msg.setPortfolioId(value);
      break;
    case 4:
      var value = /** @type {!proto.treum.risk.LimitType} */ (reader.readEnum());
      msg.setLimitType(value);
      break;
    case 5:
      var value = /** @type {!proto.treum.risk.LimitScope} */ (reader.readEnum());
      msg.setScope(value);
      break;
    case 6:
      var value = /** @type {string} */ (reader.readString());
      msg.setName(value);
      break;
    case 7:
      var value = /** @type {string} */ (reader.readString());
      msg.setDescription(value);
      break;
    case 8:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setLimitValue(value);
      break;
    case 9:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setWarningThreshold(value);
      break;
    case 10:
      var value = /** @type {!proto.treum.risk.LimitStatus} */ (reader.readEnum());
      msg.setStatus(value);
      break;
    case 11:
      var value = /** @type {!proto.treum.risk.LimitFrequency} */ (reader.readEnum());
      msg.setFrequency(value);
      break;
    case 12:
      var value = /** @type {string} */ (reader.readString());
      msg.setLimitConfig(value);
      break;
    case 13:
      var value = /** @type {string} */ (reader.readString());
      msg.setBreachActions(value);
      break;
    case 14:
      var value = new google_protobuf_timestamp_pb.Timestamp;
      reader.readMessage(value,google_protobuf_timestamp_pb.Timestamp.deserializeBinaryFromReader);
      msg.setEffectiveFrom(value);
      break;
    case 15:
      var value = new google_protobuf_timestamp_pb.Timestamp;
      reader.readMessage(value,google_protobuf_timestamp_pb.Timestamp.deserializeBinaryFromReader);
      msg.setEffectiveTo(value);
      break;
    case 16:
      var value = /** @type {string} */ (reader.readString());
      msg.setCreatedBy(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.treum.risk.CreateRiskLimitRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.treum.risk.CreateRiskLimitRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.treum.risk.CreateRiskLimitRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.CreateRiskLimitRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getUserId();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getAccountId();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
  f = message.getPortfolioId();
  if (f.length > 0) {
    writer.writeString(
      3,
      f
    );
  }
  f = message.getLimitType();
  if (f !== 0.0) {
    writer.writeEnum(
      4,
      f
    );
  }
  f = message.getScope();
  if (f !== 0.0) {
    writer.writeEnum(
      5,
      f
    );
  }
  f = message.getName();
  if (f.length > 0) {
    writer.writeString(
      6,
      f
    );
  }
  f = message.getDescription();
  if (f.length > 0) {
    writer.writeString(
      7,
      f
    );
  }
  f = message.getLimitValue();
  if (f !== 0.0) {
    writer.writeDouble(
      8,
      f
    );
  }
  f = message.getWarningThreshold();
  if (f !== 0.0) {
    writer.writeDouble(
      9,
      f
    );
  }
  f = message.getStatus();
  if (f !== 0.0) {
    writer.writeEnum(
      10,
      f
    );
  }
  f = message.getFrequency();
  if (f !== 0.0) {
    writer.writeEnum(
      11,
      f
    );
  }
  f = message.getLimitConfig();
  if (f.length > 0) {
    writer.writeString(
      12,
      f
    );
  }
  f = message.getBreachActions();
  if (f.length > 0) {
    writer.writeString(
      13,
      f
    );
  }
  f = message.getEffectiveFrom();
  if (f != null) {
    writer.writeMessage(
      14,
      f,
      google_protobuf_timestamp_pb.Timestamp.serializeBinaryToWriter
    );
  }
  f = message.getEffectiveTo();
  if (f != null) {
    writer.writeMessage(
      15,
      f,
      google_protobuf_timestamp_pb.Timestamp.serializeBinaryToWriter
    );
  }
  f = message.getCreatedBy();
  if (f.length > 0) {
    writer.writeString(
      16,
      f
    );
  }
};


/**
 * optional string user_id = 1;
 * @return {string}
 */
proto.treum.risk.CreateRiskLimitRequest.prototype.getUserId = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.CreateRiskLimitRequest} returns this
 */
proto.treum.risk.CreateRiskLimitRequest.prototype.setUserId = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional string account_id = 2;
 * @return {string}
 */
proto.treum.risk.CreateRiskLimitRequest.prototype.getAccountId = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.CreateRiskLimitRequest} returns this
 */
proto.treum.risk.CreateRiskLimitRequest.prototype.setAccountId = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};


/**
 * optional string portfolio_id = 3;
 * @return {string}
 */
proto.treum.risk.CreateRiskLimitRequest.prototype.getPortfolioId = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.CreateRiskLimitRequest} returns this
 */
proto.treum.risk.CreateRiskLimitRequest.prototype.setPortfolioId = function(value) {
  return jspb.Message.setProto3StringField(this, 3, value);
};


/**
 * optional LimitType limit_type = 4;
 * @return {!proto.treum.risk.LimitType}
 */
proto.treum.risk.CreateRiskLimitRequest.prototype.getLimitType = function() {
  return /** @type {!proto.treum.risk.LimitType} */ (jspb.Message.getFieldWithDefault(this, 4, 0));
};


/**
 * @param {!proto.treum.risk.LimitType} value
 * @return {!proto.treum.risk.CreateRiskLimitRequest} returns this
 */
proto.treum.risk.CreateRiskLimitRequest.prototype.setLimitType = function(value) {
  return jspb.Message.setProto3EnumField(this, 4, value);
};


/**
 * optional LimitScope scope = 5;
 * @return {!proto.treum.risk.LimitScope}
 */
proto.treum.risk.CreateRiskLimitRequest.prototype.getScope = function() {
  return /** @type {!proto.treum.risk.LimitScope} */ (jspb.Message.getFieldWithDefault(this, 5, 0));
};


/**
 * @param {!proto.treum.risk.LimitScope} value
 * @return {!proto.treum.risk.CreateRiskLimitRequest} returns this
 */
proto.treum.risk.CreateRiskLimitRequest.prototype.setScope = function(value) {
  return jspb.Message.setProto3EnumField(this, 5, value);
};


/**
 * optional string name = 6;
 * @return {string}
 */
proto.treum.risk.CreateRiskLimitRequest.prototype.getName = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 6, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.CreateRiskLimitRequest} returns this
 */
proto.treum.risk.CreateRiskLimitRequest.prototype.setName = function(value) {
  return jspb.Message.setProto3StringField(this, 6, value);
};


/**
 * optional string description = 7;
 * @return {string}
 */
proto.treum.risk.CreateRiskLimitRequest.prototype.getDescription = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 7, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.CreateRiskLimitRequest} returns this
 */
proto.treum.risk.CreateRiskLimitRequest.prototype.setDescription = function(value) {
  return jspb.Message.setProto3StringField(this, 7, value);
};


/**
 * optional double limit_value = 8;
 * @return {number}
 */
proto.treum.risk.CreateRiskLimitRequest.prototype.getLimitValue = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 8, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.CreateRiskLimitRequest} returns this
 */
proto.treum.risk.CreateRiskLimitRequest.prototype.setLimitValue = function(value) {
  return jspb.Message.setProto3FloatField(this, 8, value);
};


/**
 * optional double warning_threshold = 9;
 * @return {number}
 */
proto.treum.risk.CreateRiskLimitRequest.prototype.getWarningThreshold = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 9, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.CreateRiskLimitRequest} returns this
 */
proto.treum.risk.CreateRiskLimitRequest.prototype.setWarningThreshold = function(value) {
  return jspb.Message.setProto3FloatField(this, 9, value);
};


/**
 * optional LimitStatus status = 10;
 * @return {!proto.treum.risk.LimitStatus}
 */
proto.treum.risk.CreateRiskLimitRequest.prototype.getStatus = function() {
  return /** @type {!proto.treum.risk.LimitStatus} */ (jspb.Message.getFieldWithDefault(this, 10, 0));
};


/**
 * @param {!proto.treum.risk.LimitStatus} value
 * @return {!proto.treum.risk.CreateRiskLimitRequest} returns this
 */
proto.treum.risk.CreateRiskLimitRequest.prototype.setStatus = function(value) {
  return jspb.Message.setProto3EnumField(this, 10, value);
};


/**
 * optional LimitFrequency frequency = 11;
 * @return {!proto.treum.risk.LimitFrequency}
 */
proto.treum.risk.CreateRiskLimitRequest.prototype.getFrequency = function() {
  return /** @type {!proto.treum.risk.LimitFrequency} */ (jspb.Message.getFieldWithDefault(this, 11, 0));
};


/**
 * @param {!proto.treum.risk.LimitFrequency} value
 * @return {!proto.treum.risk.CreateRiskLimitRequest} returns this
 */
proto.treum.risk.CreateRiskLimitRequest.prototype.setFrequency = function(value) {
  return jspb.Message.setProto3EnumField(this, 11, value);
};


/**
 * optional string limit_config = 12;
 * @return {string}
 */
proto.treum.risk.CreateRiskLimitRequest.prototype.getLimitConfig = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 12, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.CreateRiskLimitRequest} returns this
 */
proto.treum.risk.CreateRiskLimitRequest.prototype.setLimitConfig = function(value) {
  return jspb.Message.setProto3StringField(this, 12, value);
};


/**
 * optional string breach_actions = 13;
 * @return {string}
 */
proto.treum.risk.CreateRiskLimitRequest.prototype.getBreachActions = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 13, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.CreateRiskLimitRequest} returns this
 */
proto.treum.risk.CreateRiskLimitRequest.prototype.setBreachActions = function(value) {
  return jspb.Message.setProto3StringField(this, 13, value);
};


/**
 * optional google.protobuf.Timestamp effective_from = 14;
 * @return {?proto.google.protobuf.Timestamp}
 */
proto.treum.risk.CreateRiskLimitRequest.prototype.getEffectiveFrom = function() {
  return /** @type{?proto.google.protobuf.Timestamp} */ (
    jspb.Message.getWrapperField(this, google_protobuf_timestamp_pb.Timestamp, 14));
};


/**
 * @param {?proto.google.protobuf.Timestamp|undefined} value
 * @return {!proto.treum.risk.CreateRiskLimitRequest} returns this
*/
proto.treum.risk.CreateRiskLimitRequest.prototype.setEffectiveFrom = function(value) {
  return jspb.Message.setWrapperField(this, 14, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.treum.risk.CreateRiskLimitRequest} returns this
 */
proto.treum.risk.CreateRiskLimitRequest.prototype.clearEffectiveFrom = function() {
  return this.setEffectiveFrom(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.treum.risk.CreateRiskLimitRequest.prototype.hasEffectiveFrom = function() {
  return jspb.Message.getField(this, 14) != null;
};


/**
 * optional google.protobuf.Timestamp effective_to = 15;
 * @return {?proto.google.protobuf.Timestamp}
 */
proto.treum.risk.CreateRiskLimitRequest.prototype.getEffectiveTo = function() {
  return /** @type{?proto.google.protobuf.Timestamp} */ (
    jspb.Message.getWrapperField(this, google_protobuf_timestamp_pb.Timestamp, 15));
};


/**
 * @param {?proto.google.protobuf.Timestamp|undefined} value
 * @return {!proto.treum.risk.CreateRiskLimitRequest} returns this
*/
proto.treum.risk.CreateRiskLimitRequest.prototype.setEffectiveTo = function(value) {
  return jspb.Message.setWrapperField(this, 15, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.treum.risk.CreateRiskLimitRequest} returns this
 */
proto.treum.risk.CreateRiskLimitRequest.prototype.clearEffectiveTo = function() {
  return this.setEffectiveTo(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.treum.risk.CreateRiskLimitRequest.prototype.hasEffectiveTo = function() {
  return jspb.Message.getField(this, 15) != null;
};


/**
 * optional string created_by = 16;
 * @return {string}
 */
proto.treum.risk.CreateRiskLimitRequest.prototype.getCreatedBy = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 16, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.CreateRiskLimitRequest} returns this
 */
proto.treum.risk.CreateRiskLimitRequest.prototype.setCreatedBy = function(value) {
  return jspb.Message.setProto3StringField(this, 16, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.treum.risk.RiskLimitResponse.prototype.toObject = function(opt_includeInstance) {
  return proto.treum.risk.RiskLimitResponse.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.treum.risk.RiskLimitResponse} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.RiskLimitResponse.toObject = function(includeInstance, msg) {
  var f, obj = {
    id: jspb.Message.getFieldWithDefault(msg, 1, ""),
    userId: jspb.Message.getFieldWithDefault(msg, 2, ""),
    accountId: jspb.Message.getFieldWithDefault(msg, 3, ""),
    portfolioId: jspb.Message.getFieldWithDefault(msg, 4, ""),
    limitType: jspb.Message.getFieldWithDefault(msg, 5, 0),
    scope: jspb.Message.getFieldWithDefault(msg, 6, 0),
    name: jspb.Message.getFieldWithDefault(msg, 7, ""),
    description: jspb.Message.getFieldWithDefault(msg, 8, ""),
    limitValue: jspb.Message.getFloatingPointFieldWithDefault(msg, 9, 0.0),
    warningThreshold: jspb.Message.getFloatingPointFieldWithDefault(msg, 10, 0.0),
    currentUtilization: jspb.Message.getFloatingPointFieldWithDefault(msg, 11, 0.0),
    utilizationPercentage: jspb.Message.getFloatingPointFieldWithDefault(msg, 12, 0.0),
    peakUtilization: jspb.Message.getFloatingPointFieldWithDefault(msg, 13, 0.0),
    peakUtilizationAt: (f = msg.getPeakUtilizationAt()) && google_protobuf_timestamp_pb.Timestamp.toObject(includeInstance, f),
    status: jspb.Message.getFieldWithDefault(msg, 15, 0),
    frequency: jspb.Message.getFieldWithDefault(msg, 16, 0),
    limitConfig: jspb.Message.getFieldWithDefault(msg, 17, ""),
    breachActions: jspb.Message.getFieldWithDefault(msg, 18, ""),
    effectiveFrom: (f = msg.getEffectiveFrom()) && google_protobuf_timestamp_pb.Timestamp.toObject(includeInstance, f),
    effectiveTo: (f = msg.getEffectiveTo()) && google_protobuf_timestamp_pb.Timestamp.toObject(includeInstance, f),
    lastCheckedAt: (f = msg.getLastCheckedAt()) && google_protobuf_timestamp_pb.Timestamp.toObject(includeInstance, f),
    nextCheckAt: (f = msg.getNextCheckAt()) && google_protobuf_timestamp_pb.Timestamp.toObject(includeInstance, f),
    createdBy: jspb.Message.getFieldWithDefault(msg, 23, ""),
    modifiedBy: jspb.Message.getFieldWithDefault(msg, 24, ""),
    createdAt: (f = msg.getCreatedAt()) && google_protobuf_timestamp_pb.Timestamp.toObject(includeInstance, f),
    updatedAt: (f = msg.getUpdatedAt()) && google_protobuf_timestamp_pb.Timestamp.toObject(includeInstance, f)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.treum.risk.RiskLimitResponse}
 */
proto.treum.risk.RiskLimitResponse.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.treum.risk.RiskLimitResponse;
  return proto.treum.risk.RiskLimitResponse.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.treum.risk.RiskLimitResponse} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.treum.risk.RiskLimitResponse}
 */
proto.treum.risk.RiskLimitResponse.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setId(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setUserId(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readString());
      msg.setAccountId(value);
      break;
    case 4:
      var value = /** @type {string} */ (reader.readString());
      msg.setPortfolioId(value);
      break;
    case 5:
      var value = /** @type {!proto.treum.risk.LimitType} */ (reader.readEnum());
      msg.setLimitType(value);
      break;
    case 6:
      var value = /** @type {!proto.treum.risk.LimitScope} */ (reader.readEnum());
      msg.setScope(value);
      break;
    case 7:
      var value = /** @type {string} */ (reader.readString());
      msg.setName(value);
      break;
    case 8:
      var value = /** @type {string} */ (reader.readString());
      msg.setDescription(value);
      break;
    case 9:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setLimitValue(value);
      break;
    case 10:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setWarningThreshold(value);
      break;
    case 11:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setCurrentUtilization(value);
      break;
    case 12:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setUtilizationPercentage(value);
      break;
    case 13:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setPeakUtilization(value);
      break;
    case 14:
      var value = new google_protobuf_timestamp_pb.Timestamp;
      reader.readMessage(value,google_protobuf_timestamp_pb.Timestamp.deserializeBinaryFromReader);
      msg.setPeakUtilizationAt(value);
      break;
    case 15:
      var value = /** @type {!proto.treum.risk.LimitStatus} */ (reader.readEnum());
      msg.setStatus(value);
      break;
    case 16:
      var value = /** @type {!proto.treum.risk.LimitFrequency} */ (reader.readEnum());
      msg.setFrequency(value);
      break;
    case 17:
      var value = /** @type {string} */ (reader.readString());
      msg.setLimitConfig(value);
      break;
    case 18:
      var value = /** @type {string} */ (reader.readString());
      msg.setBreachActions(value);
      break;
    case 19:
      var value = new google_protobuf_timestamp_pb.Timestamp;
      reader.readMessage(value,google_protobuf_timestamp_pb.Timestamp.deserializeBinaryFromReader);
      msg.setEffectiveFrom(value);
      break;
    case 20:
      var value = new google_protobuf_timestamp_pb.Timestamp;
      reader.readMessage(value,google_protobuf_timestamp_pb.Timestamp.deserializeBinaryFromReader);
      msg.setEffectiveTo(value);
      break;
    case 21:
      var value = new google_protobuf_timestamp_pb.Timestamp;
      reader.readMessage(value,google_protobuf_timestamp_pb.Timestamp.deserializeBinaryFromReader);
      msg.setLastCheckedAt(value);
      break;
    case 22:
      var value = new google_protobuf_timestamp_pb.Timestamp;
      reader.readMessage(value,google_protobuf_timestamp_pb.Timestamp.deserializeBinaryFromReader);
      msg.setNextCheckAt(value);
      break;
    case 23:
      var value = /** @type {string} */ (reader.readString());
      msg.setCreatedBy(value);
      break;
    case 24:
      var value = /** @type {string} */ (reader.readString());
      msg.setModifiedBy(value);
      break;
    case 25:
      var value = new google_protobuf_timestamp_pb.Timestamp;
      reader.readMessage(value,google_protobuf_timestamp_pb.Timestamp.deserializeBinaryFromReader);
      msg.setCreatedAt(value);
      break;
    case 26:
      var value = new google_protobuf_timestamp_pb.Timestamp;
      reader.readMessage(value,google_protobuf_timestamp_pb.Timestamp.deserializeBinaryFromReader);
      msg.setUpdatedAt(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.treum.risk.RiskLimitResponse.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.treum.risk.RiskLimitResponse.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.treum.risk.RiskLimitResponse} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.RiskLimitResponse.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getId();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getUserId();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
  f = message.getAccountId();
  if (f.length > 0) {
    writer.writeString(
      3,
      f
    );
  }
  f = message.getPortfolioId();
  if (f.length > 0) {
    writer.writeString(
      4,
      f
    );
  }
  f = message.getLimitType();
  if (f !== 0.0) {
    writer.writeEnum(
      5,
      f
    );
  }
  f = message.getScope();
  if (f !== 0.0) {
    writer.writeEnum(
      6,
      f
    );
  }
  f = message.getName();
  if (f.length > 0) {
    writer.writeString(
      7,
      f
    );
  }
  f = message.getDescription();
  if (f.length > 0) {
    writer.writeString(
      8,
      f
    );
  }
  f = message.getLimitValue();
  if (f !== 0.0) {
    writer.writeDouble(
      9,
      f
    );
  }
  f = message.getWarningThreshold();
  if (f !== 0.0) {
    writer.writeDouble(
      10,
      f
    );
  }
  f = message.getCurrentUtilization();
  if (f !== 0.0) {
    writer.writeDouble(
      11,
      f
    );
  }
  f = message.getUtilizationPercentage();
  if (f !== 0.0) {
    writer.writeDouble(
      12,
      f
    );
  }
  f = message.getPeakUtilization();
  if (f !== 0.0) {
    writer.writeDouble(
      13,
      f
    );
  }
  f = message.getPeakUtilizationAt();
  if (f != null) {
    writer.writeMessage(
      14,
      f,
      google_protobuf_timestamp_pb.Timestamp.serializeBinaryToWriter
    );
  }
  f = message.getStatus();
  if (f !== 0.0) {
    writer.writeEnum(
      15,
      f
    );
  }
  f = message.getFrequency();
  if (f !== 0.0) {
    writer.writeEnum(
      16,
      f
    );
  }
  f = message.getLimitConfig();
  if (f.length > 0) {
    writer.writeString(
      17,
      f
    );
  }
  f = message.getBreachActions();
  if (f.length > 0) {
    writer.writeString(
      18,
      f
    );
  }
  f = message.getEffectiveFrom();
  if (f != null) {
    writer.writeMessage(
      19,
      f,
      google_protobuf_timestamp_pb.Timestamp.serializeBinaryToWriter
    );
  }
  f = message.getEffectiveTo();
  if (f != null) {
    writer.writeMessage(
      20,
      f,
      google_protobuf_timestamp_pb.Timestamp.serializeBinaryToWriter
    );
  }
  f = message.getLastCheckedAt();
  if (f != null) {
    writer.writeMessage(
      21,
      f,
      google_protobuf_timestamp_pb.Timestamp.serializeBinaryToWriter
    );
  }
  f = message.getNextCheckAt();
  if (f != null) {
    writer.writeMessage(
      22,
      f,
      google_protobuf_timestamp_pb.Timestamp.serializeBinaryToWriter
    );
  }
  f = message.getCreatedBy();
  if (f.length > 0) {
    writer.writeString(
      23,
      f
    );
  }
  f = message.getModifiedBy();
  if (f.length > 0) {
    writer.writeString(
      24,
      f
    );
  }
  f = message.getCreatedAt();
  if (f != null) {
    writer.writeMessage(
      25,
      f,
      google_protobuf_timestamp_pb.Timestamp.serializeBinaryToWriter
    );
  }
  f = message.getUpdatedAt();
  if (f != null) {
    writer.writeMessage(
      26,
      f,
      google_protobuf_timestamp_pb.Timestamp.serializeBinaryToWriter
    );
  }
};


/**
 * optional string id = 1;
 * @return {string}
 */
proto.treum.risk.RiskLimitResponse.prototype.getId = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.RiskLimitResponse} returns this
 */
proto.treum.risk.RiskLimitResponse.prototype.setId = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional string user_id = 2;
 * @return {string}
 */
proto.treum.risk.RiskLimitResponse.prototype.getUserId = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.RiskLimitResponse} returns this
 */
proto.treum.risk.RiskLimitResponse.prototype.setUserId = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};


/**
 * optional string account_id = 3;
 * @return {string}
 */
proto.treum.risk.RiskLimitResponse.prototype.getAccountId = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.RiskLimitResponse} returns this
 */
proto.treum.risk.RiskLimitResponse.prototype.setAccountId = function(value) {
  return jspb.Message.setProto3StringField(this, 3, value);
};


/**
 * optional string portfolio_id = 4;
 * @return {string}
 */
proto.treum.risk.RiskLimitResponse.prototype.getPortfolioId = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 4, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.RiskLimitResponse} returns this
 */
proto.treum.risk.RiskLimitResponse.prototype.setPortfolioId = function(value) {
  return jspb.Message.setProto3StringField(this, 4, value);
};


/**
 * optional LimitType limit_type = 5;
 * @return {!proto.treum.risk.LimitType}
 */
proto.treum.risk.RiskLimitResponse.prototype.getLimitType = function() {
  return /** @type {!proto.treum.risk.LimitType} */ (jspb.Message.getFieldWithDefault(this, 5, 0));
};


/**
 * @param {!proto.treum.risk.LimitType} value
 * @return {!proto.treum.risk.RiskLimitResponse} returns this
 */
proto.treum.risk.RiskLimitResponse.prototype.setLimitType = function(value) {
  return jspb.Message.setProto3EnumField(this, 5, value);
};


/**
 * optional LimitScope scope = 6;
 * @return {!proto.treum.risk.LimitScope}
 */
proto.treum.risk.RiskLimitResponse.prototype.getScope = function() {
  return /** @type {!proto.treum.risk.LimitScope} */ (jspb.Message.getFieldWithDefault(this, 6, 0));
};


/**
 * @param {!proto.treum.risk.LimitScope} value
 * @return {!proto.treum.risk.RiskLimitResponse} returns this
 */
proto.treum.risk.RiskLimitResponse.prototype.setScope = function(value) {
  return jspb.Message.setProto3EnumField(this, 6, value);
};


/**
 * optional string name = 7;
 * @return {string}
 */
proto.treum.risk.RiskLimitResponse.prototype.getName = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 7, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.RiskLimitResponse} returns this
 */
proto.treum.risk.RiskLimitResponse.prototype.setName = function(value) {
  return jspb.Message.setProto3StringField(this, 7, value);
};


/**
 * optional string description = 8;
 * @return {string}
 */
proto.treum.risk.RiskLimitResponse.prototype.getDescription = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 8, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.RiskLimitResponse} returns this
 */
proto.treum.risk.RiskLimitResponse.prototype.setDescription = function(value) {
  return jspb.Message.setProto3StringField(this, 8, value);
};


/**
 * optional double limit_value = 9;
 * @return {number}
 */
proto.treum.risk.RiskLimitResponse.prototype.getLimitValue = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 9, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.RiskLimitResponse} returns this
 */
proto.treum.risk.RiskLimitResponse.prototype.setLimitValue = function(value) {
  return jspb.Message.setProto3FloatField(this, 9, value);
};


/**
 * optional double warning_threshold = 10;
 * @return {number}
 */
proto.treum.risk.RiskLimitResponse.prototype.getWarningThreshold = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 10, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.RiskLimitResponse} returns this
 */
proto.treum.risk.RiskLimitResponse.prototype.setWarningThreshold = function(value) {
  return jspb.Message.setProto3FloatField(this, 10, value);
};


/**
 * optional double current_utilization = 11;
 * @return {number}
 */
proto.treum.risk.RiskLimitResponse.prototype.getCurrentUtilization = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 11, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.RiskLimitResponse} returns this
 */
proto.treum.risk.RiskLimitResponse.prototype.setCurrentUtilization = function(value) {
  return jspb.Message.setProto3FloatField(this, 11, value);
};


/**
 * optional double utilization_percentage = 12;
 * @return {number}
 */
proto.treum.risk.RiskLimitResponse.prototype.getUtilizationPercentage = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 12, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.RiskLimitResponse} returns this
 */
proto.treum.risk.RiskLimitResponse.prototype.setUtilizationPercentage = function(value) {
  return jspb.Message.setProto3FloatField(this, 12, value);
};


/**
 * optional double peak_utilization = 13;
 * @return {number}
 */
proto.treum.risk.RiskLimitResponse.prototype.getPeakUtilization = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 13, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.RiskLimitResponse} returns this
 */
proto.treum.risk.RiskLimitResponse.prototype.setPeakUtilization = function(value) {
  return jspb.Message.setProto3FloatField(this, 13, value);
};


/**
 * optional google.protobuf.Timestamp peak_utilization_at = 14;
 * @return {?proto.google.protobuf.Timestamp}
 */
proto.treum.risk.RiskLimitResponse.prototype.getPeakUtilizationAt = function() {
  return /** @type{?proto.google.protobuf.Timestamp} */ (
    jspb.Message.getWrapperField(this, google_protobuf_timestamp_pb.Timestamp, 14));
};


/**
 * @param {?proto.google.protobuf.Timestamp|undefined} value
 * @return {!proto.treum.risk.RiskLimitResponse} returns this
*/
proto.treum.risk.RiskLimitResponse.prototype.setPeakUtilizationAt = function(value) {
  return jspb.Message.setWrapperField(this, 14, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.treum.risk.RiskLimitResponse} returns this
 */
proto.treum.risk.RiskLimitResponse.prototype.clearPeakUtilizationAt = function() {
  return this.setPeakUtilizationAt(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.treum.risk.RiskLimitResponse.prototype.hasPeakUtilizationAt = function() {
  return jspb.Message.getField(this, 14) != null;
};


/**
 * optional LimitStatus status = 15;
 * @return {!proto.treum.risk.LimitStatus}
 */
proto.treum.risk.RiskLimitResponse.prototype.getStatus = function() {
  return /** @type {!proto.treum.risk.LimitStatus} */ (jspb.Message.getFieldWithDefault(this, 15, 0));
};


/**
 * @param {!proto.treum.risk.LimitStatus} value
 * @return {!proto.treum.risk.RiskLimitResponse} returns this
 */
proto.treum.risk.RiskLimitResponse.prototype.setStatus = function(value) {
  return jspb.Message.setProto3EnumField(this, 15, value);
};


/**
 * optional LimitFrequency frequency = 16;
 * @return {!proto.treum.risk.LimitFrequency}
 */
proto.treum.risk.RiskLimitResponse.prototype.getFrequency = function() {
  return /** @type {!proto.treum.risk.LimitFrequency} */ (jspb.Message.getFieldWithDefault(this, 16, 0));
};


/**
 * @param {!proto.treum.risk.LimitFrequency} value
 * @return {!proto.treum.risk.RiskLimitResponse} returns this
 */
proto.treum.risk.RiskLimitResponse.prototype.setFrequency = function(value) {
  return jspb.Message.setProto3EnumField(this, 16, value);
};


/**
 * optional string limit_config = 17;
 * @return {string}
 */
proto.treum.risk.RiskLimitResponse.prototype.getLimitConfig = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 17, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.RiskLimitResponse} returns this
 */
proto.treum.risk.RiskLimitResponse.prototype.setLimitConfig = function(value) {
  return jspb.Message.setProto3StringField(this, 17, value);
};


/**
 * optional string breach_actions = 18;
 * @return {string}
 */
proto.treum.risk.RiskLimitResponse.prototype.getBreachActions = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 18, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.RiskLimitResponse} returns this
 */
proto.treum.risk.RiskLimitResponse.prototype.setBreachActions = function(value) {
  return jspb.Message.setProto3StringField(this, 18, value);
};


/**
 * optional google.protobuf.Timestamp effective_from = 19;
 * @return {?proto.google.protobuf.Timestamp}
 */
proto.treum.risk.RiskLimitResponse.prototype.getEffectiveFrom = function() {
  return /** @type{?proto.google.protobuf.Timestamp} */ (
    jspb.Message.getWrapperField(this, google_protobuf_timestamp_pb.Timestamp, 19));
};


/**
 * @param {?proto.google.protobuf.Timestamp|undefined} value
 * @return {!proto.treum.risk.RiskLimitResponse} returns this
*/
proto.treum.risk.RiskLimitResponse.prototype.setEffectiveFrom = function(value) {
  return jspb.Message.setWrapperField(this, 19, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.treum.risk.RiskLimitResponse} returns this
 */
proto.treum.risk.RiskLimitResponse.prototype.clearEffectiveFrom = function() {
  return this.setEffectiveFrom(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.treum.risk.RiskLimitResponse.prototype.hasEffectiveFrom = function() {
  return jspb.Message.getField(this, 19) != null;
};


/**
 * optional google.protobuf.Timestamp effective_to = 20;
 * @return {?proto.google.protobuf.Timestamp}
 */
proto.treum.risk.RiskLimitResponse.prototype.getEffectiveTo = function() {
  return /** @type{?proto.google.protobuf.Timestamp} */ (
    jspb.Message.getWrapperField(this, google_protobuf_timestamp_pb.Timestamp, 20));
};


/**
 * @param {?proto.google.protobuf.Timestamp|undefined} value
 * @return {!proto.treum.risk.RiskLimitResponse} returns this
*/
proto.treum.risk.RiskLimitResponse.prototype.setEffectiveTo = function(value) {
  return jspb.Message.setWrapperField(this, 20, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.treum.risk.RiskLimitResponse} returns this
 */
proto.treum.risk.RiskLimitResponse.prototype.clearEffectiveTo = function() {
  return this.setEffectiveTo(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.treum.risk.RiskLimitResponse.prototype.hasEffectiveTo = function() {
  return jspb.Message.getField(this, 20) != null;
};


/**
 * optional google.protobuf.Timestamp last_checked_at = 21;
 * @return {?proto.google.protobuf.Timestamp}
 */
proto.treum.risk.RiskLimitResponse.prototype.getLastCheckedAt = function() {
  return /** @type{?proto.google.protobuf.Timestamp} */ (
    jspb.Message.getWrapperField(this, google_protobuf_timestamp_pb.Timestamp, 21));
};


/**
 * @param {?proto.google.protobuf.Timestamp|undefined} value
 * @return {!proto.treum.risk.RiskLimitResponse} returns this
*/
proto.treum.risk.RiskLimitResponse.prototype.setLastCheckedAt = function(value) {
  return jspb.Message.setWrapperField(this, 21, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.treum.risk.RiskLimitResponse} returns this
 */
proto.treum.risk.RiskLimitResponse.prototype.clearLastCheckedAt = function() {
  return this.setLastCheckedAt(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.treum.risk.RiskLimitResponse.prototype.hasLastCheckedAt = function() {
  return jspb.Message.getField(this, 21) != null;
};


/**
 * optional google.protobuf.Timestamp next_check_at = 22;
 * @return {?proto.google.protobuf.Timestamp}
 */
proto.treum.risk.RiskLimitResponse.prototype.getNextCheckAt = function() {
  return /** @type{?proto.google.protobuf.Timestamp} */ (
    jspb.Message.getWrapperField(this, google_protobuf_timestamp_pb.Timestamp, 22));
};


/**
 * @param {?proto.google.protobuf.Timestamp|undefined} value
 * @return {!proto.treum.risk.RiskLimitResponse} returns this
*/
proto.treum.risk.RiskLimitResponse.prototype.setNextCheckAt = function(value) {
  return jspb.Message.setWrapperField(this, 22, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.treum.risk.RiskLimitResponse} returns this
 */
proto.treum.risk.RiskLimitResponse.prototype.clearNextCheckAt = function() {
  return this.setNextCheckAt(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.treum.risk.RiskLimitResponse.prototype.hasNextCheckAt = function() {
  return jspb.Message.getField(this, 22) != null;
};


/**
 * optional string created_by = 23;
 * @return {string}
 */
proto.treum.risk.RiskLimitResponse.prototype.getCreatedBy = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 23, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.RiskLimitResponse} returns this
 */
proto.treum.risk.RiskLimitResponse.prototype.setCreatedBy = function(value) {
  return jspb.Message.setProto3StringField(this, 23, value);
};


/**
 * optional string modified_by = 24;
 * @return {string}
 */
proto.treum.risk.RiskLimitResponse.prototype.getModifiedBy = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 24, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.RiskLimitResponse} returns this
 */
proto.treum.risk.RiskLimitResponse.prototype.setModifiedBy = function(value) {
  return jspb.Message.setProto3StringField(this, 24, value);
};


/**
 * optional google.protobuf.Timestamp created_at = 25;
 * @return {?proto.google.protobuf.Timestamp}
 */
proto.treum.risk.RiskLimitResponse.prototype.getCreatedAt = function() {
  return /** @type{?proto.google.protobuf.Timestamp} */ (
    jspb.Message.getWrapperField(this, google_protobuf_timestamp_pb.Timestamp, 25));
};


/**
 * @param {?proto.google.protobuf.Timestamp|undefined} value
 * @return {!proto.treum.risk.RiskLimitResponse} returns this
*/
proto.treum.risk.RiskLimitResponse.prototype.setCreatedAt = function(value) {
  return jspb.Message.setWrapperField(this, 25, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.treum.risk.RiskLimitResponse} returns this
 */
proto.treum.risk.RiskLimitResponse.prototype.clearCreatedAt = function() {
  return this.setCreatedAt(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.treum.risk.RiskLimitResponse.prototype.hasCreatedAt = function() {
  return jspb.Message.getField(this, 25) != null;
};


/**
 * optional google.protobuf.Timestamp updated_at = 26;
 * @return {?proto.google.protobuf.Timestamp}
 */
proto.treum.risk.RiskLimitResponse.prototype.getUpdatedAt = function() {
  return /** @type{?proto.google.protobuf.Timestamp} */ (
    jspb.Message.getWrapperField(this, google_protobuf_timestamp_pb.Timestamp, 26));
};


/**
 * @param {?proto.google.protobuf.Timestamp|undefined} value
 * @return {!proto.treum.risk.RiskLimitResponse} returns this
*/
proto.treum.risk.RiskLimitResponse.prototype.setUpdatedAt = function(value) {
  return jspb.Message.setWrapperField(this, 26, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.treum.risk.RiskLimitResponse} returns this
 */
proto.treum.risk.RiskLimitResponse.prototype.clearUpdatedAt = function() {
  return this.setUpdatedAt(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.treum.risk.RiskLimitResponse.prototype.hasUpdatedAt = function() {
  return jspb.Message.getField(this, 26) != null;
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.treum.risk.UpdateRiskLimitRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.treum.risk.UpdateRiskLimitRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.treum.risk.UpdateRiskLimitRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.UpdateRiskLimitRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    id: jspb.Message.getFieldWithDefault(msg, 1, ""),
    limitValue: jspb.Message.getFloatingPointFieldWithDefault(msg, 2, 0.0),
    warningThreshold: jspb.Message.getFloatingPointFieldWithDefault(msg, 3, 0.0),
    status: jspb.Message.getFieldWithDefault(msg, 4, 0),
    description: jspb.Message.getFieldWithDefault(msg, 5, ""),
    limitConfig: jspb.Message.getFieldWithDefault(msg, 6, ""),
    breachActions: jspb.Message.getFieldWithDefault(msg, 7, ""),
    effectiveTo: (f = msg.getEffectiveTo()) && google_protobuf_timestamp_pb.Timestamp.toObject(includeInstance, f),
    modifiedBy: jspb.Message.getFieldWithDefault(msg, 9, "")
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.treum.risk.UpdateRiskLimitRequest}
 */
proto.treum.risk.UpdateRiskLimitRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.treum.risk.UpdateRiskLimitRequest;
  return proto.treum.risk.UpdateRiskLimitRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.treum.risk.UpdateRiskLimitRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.treum.risk.UpdateRiskLimitRequest}
 */
proto.treum.risk.UpdateRiskLimitRequest.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setId(value);
      break;
    case 2:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setLimitValue(value);
      break;
    case 3:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setWarningThreshold(value);
      break;
    case 4:
      var value = /** @type {!proto.treum.risk.LimitStatus} */ (reader.readEnum());
      msg.setStatus(value);
      break;
    case 5:
      var value = /** @type {string} */ (reader.readString());
      msg.setDescription(value);
      break;
    case 6:
      var value = /** @type {string} */ (reader.readString());
      msg.setLimitConfig(value);
      break;
    case 7:
      var value = /** @type {string} */ (reader.readString());
      msg.setBreachActions(value);
      break;
    case 8:
      var value = new google_protobuf_timestamp_pb.Timestamp;
      reader.readMessage(value,google_protobuf_timestamp_pb.Timestamp.deserializeBinaryFromReader);
      msg.setEffectiveTo(value);
      break;
    case 9:
      var value = /** @type {string} */ (reader.readString());
      msg.setModifiedBy(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.treum.risk.UpdateRiskLimitRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.treum.risk.UpdateRiskLimitRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.treum.risk.UpdateRiskLimitRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.UpdateRiskLimitRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getId();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getLimitValue();
  if (f !== 0.0) {
    writer.writeDouble(
      2,
      f
    );
  }
  f = message.getWarningThreshold();
  if (f !== 0.0) {
    writer.writeDouble(
      3,
      f
    );
  }
  f = message.getStatus();
  if (f !== 0.0) {
    writer.writeEnum(
      4,
      f
    );
  }
  f = message.getDescription();
  if (f.length > 0) {
    writer.writeString(
      5,
      f
    );
  }
  f = message.getLimitConfig();
  if (f.length > 0) {
    writer.writeString(
      6,
      f
    );
  }
  f = message.getBreachActions();
  if (f.length > 0) {
    writer.writeString(
      7,
      f
    );
  }
  f = message.getEffectiveTo();
  if (f != null) {
    writer.writeMessage(
      8,
      f,
      google_protobuf_timestamp_pb.Timestamp.serializeBinaryToWriter
    );
  }
  f = message.getModifiedBy();
  if (f.length > 0) {
    writer.writeString(
      9,
      f
    );
  }
};


/**
 * optional string id = 1;
 * @return {string}
 */
proto.treum.risk.UpdateRiskLimitRequest.prototype.getId = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.UpdateRiskLimitRequest} returns this
 */
proto.treum.risk.UpdateRiskLimitRequest.prototype.setId = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional double limit_value = 2;
 * @return {number}
 */
proto.treum.risk.UpdateRiskLimitRequest.prototype.getLimitValue = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 2, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.UpdateRiskLimitRequest} returns this
 */
proto.treum.risk.UpdateRiskLimitRequest.prototype.setLimitValue = function(value) {
  return jspb.Message.setProto3FloatField(this, 2, value);
};


/**
 * optional double warning_threshold = 3;
 * @return {number}
 */
proto.treum.risk.UpdateRiskLimitRequest.prototype.getWarningThreshold = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 3, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.UpdateRiskLimitRequest} returns this
 */
proto.treum.risk.UpdateRiskLimitRequest.prototype.setWarningThreshold = function(value) {
  return jspb.Message.setProto3FloatField(this, 3, value);
};


/**
 * optional LimitStatus status = 4;
 * @return {!proto.treum.risk.LimitStatus}
 */
proto.treum.risk.UpdateRiskLimitRequest.prototype.getStatus = function() {
  return /** @type {!proto.treum.risk.LimitStatus} */ (jspb.Message.getFieldWithDefault(this, 4, 0));
};


/**
 * @param {!proto.treum.risk.LimitStatus} value
 * @return {!proto.treum.risk.UpdateRiskLimitRequest} returns this
 */
proto.treum.risk.UpdateRiskLimitRequest.prototype.setStatus = function(value) {
  return jspb.Message.setProto3EnumField(this, 4, value);
};


/**
 * optional string description = 5;
 * @return {string}
 */
proto.treum.risk.UpdateRiskLimitRequest.prototype.getDescription = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 5, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.UpdateRiskLimitRequest} returns this
 */
proto.treum.risk.UpdateRiskLimitRequest.prototype.setDescription = function(value) {
  return jspb.Message.setProto3StringField(this, 5, value);
};


/**
 * optional string limit_config = 6;
 * @return {string}
 */
proto.treum.risk.UpdateRiskLimitRequest.prototype.getLimitConfig = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 6, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.UpdateRiskLimitRequest} returns this
 */
proto.treum.risk.UpdateRiskLimitRequest.prototype.setLimitConfig = function(value) {
  return jspb.Message.setProto3StringField(this, 6, value);
};


/**
 * optional string breach_actions = 7;
 * @return {string}
 */
proto.treum.risk.UpdateRiskLimitRequest.prototype.getBreachActions = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 7, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.UpdateRiskLimitRequest} returns this
 */
proto.treum.risk.UpdateRiskLimitRequest.prototype.setBreachActions = function(value) {
  return jspb.Message.setProto3StringField(this, 7, value);
};


/**
 * optional google.protobuf.Timestamp effective_to = 8;
 * @return {?proto.google.protobuf.Timestamp}
 */
proto.treum.risk.UpdateRiskLimitRequest.prototype.getEffectiveTo = function() {
  return /** @type{?proto.google.protobuf.Timestamp} */ (
    jspb.Message.getWrapperField(this, google_protobuf_timestamp_pb.Timestamp, 8));
};


/**
 * @param {?proto.google.protobuf.Timestamp|undefined} value
 * @return {!proto.treum.risk.UpdateRiskLimitRequest} returns this
*/
proto.treum.risk.UpdateRiskLimitRequest.prototype.setEffectiveTo = function(value) {
  return jspb.Message.setWrapperField(this, 8, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.treum.risk.UpdateRiskLimitRequest} returns this
 */
proto.treum.risk.UpdateRiskLimitRequest.prototype.clearEffectiveTo = function() {
  return this.setEffectiveTo(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.treum.risk.UpdateRiskLimitRequest.prototype.hasEffectiveTo = function() {
  return jspb.Message.getField(this, 8) != null;
};


/**
 * optional string modified_by = 9;
 * @return {string}
 */
proto.treum.risk.UpdateRiskLimitRequest.prototype.getModifiedBy = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 9, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.UpdateRiskLimitRequest} returns this
 */
proto.treum.risk.UpdateRiskLimitRequest.prototype.setModifiedBy = function(value) {
  return jspb.Message.setProto3StringField(this, 9, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.treum.risk.GetRiskLimitsRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.treum.risk.GetRiskLimitsRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.treum.risk.GetRiskLimitsRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.GetRiskLimitsRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    userId: jspb.Message.getFieldWithDefault(msg, 1, ""),
    accountId: jspb.Message.getFieldWithDefault(msg, 2, ""),
    portfolioId: jspb.Message.getFieldWithDefault(msg, 3, ""),
    limitType: jspb.Message.getFieldWithDefault(msg, 4, 0),
    scope: jspb.Message.getFieldWithDefault(msg, 5, 0),
    status: jspb.Message.getFieldWithDefault(msg, 6, 0),
    page: jspb.Message.getFieldWithDefault(msg, 7, 0),
    limit: jspb.Message.getFieldWithDefault(msg, 8, 0)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.treum.risk.GetRiskLimitsRequest}
 */
proto.treum.risk.GetRiskLimitsRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.treum.risk.GetRiskLimitsRequest;
  return proto.treum.risk.GetRiskLimitsRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.treum.risk.GetRiskLimitsRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.treum.risk.GetRiskLimitsRequest}
 */
proto.treum.risk.GetRiskLimitsRequest.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setUserId(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setAccountId(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readString());
      msg.setPortfolioId(value);
      break;
    case 4:
      var value = /** @type {!proto.treum.risk.LimitType} */ (reader.readEnum());
      msg.setLimitType(value);
      break;
    case 5:
      var value = /** @type {!proto.treum.risk.LimitScope} */ (reader.readEnum());
      msg.setScope(value);
      break;
    case 6:
      var value = /** @type {!proto.treum.risk.LimitStatus} */ (reader.readEnum());
      msg.setStatus(value);
      break;
    case 7:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setPage(value);
      break;
    case 8:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setLimit(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.treum.risk.GetRiskLimitsRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.treum.risk.GetRiskLimitsRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.treum.risk.GetRiskLimitsRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.GetRiskLimitsRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getUserId();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getAccountId();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
  f = message.getPortfolioId();
  if (f.length > 0) {
    writer.writeString(
      3,
      f
    );
  }
  f = message.getLimitType();
  if (f !== 0.0) {
    writer.writeEnum(
      4,
      f
    );
  }
  f = message.getScope();
  if (f !== 0.0) {
    writer.writeEnum(
      5,
      f
    );
  }
  f = message.getStatus();
  if (f !== 0.0) {
    writer.writeEnum(
      6,
      f
    );
  }
  f = message.getPage();
  if (f !== 0) {
    writer.writeInt32(
      7,
      f
    );
  }
  f = message.getLimit();
  if (f !== 0) {
    writer.writeInt32(
      8,
      f
    );
  }
};


/**
 * optional string user_id = 1;
 * @return {string}
 */
proto.treum.risk.GetRiskLimitsRequest.prototype.getUserId = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.GetRiskLimitsRequest} returns this
 */
proto.treum.risk.GetRiskLimitsRequest.prototype.setUserId = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional string account_id = 2;
 * @return {string}
 */
proto.treum.risk.GetRiskLimitsRequest.prototype.getAccountId = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.GetRiskLimitsRequest} returns this
 */
proto.treum.risk.GetRiskLimitsRequest.prototype.setAccountId = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};


/**
 * optional string portfolio_id = 3;
 * @return {string}
 */
proto.treum.risk.GetRiskLimitsRequest.prototype.getPortfolioId = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.GetRiskLimitsRequest} returns this
 */
proto.treum.risk.GetRiskLimitsRequest.prototype.setPortfolioId = function(value) {
  return jspb.Message.setProto3StringField(this, 3, value);
};


/**
 * optional LimitType limit_type = 4;
 * @return {!proto.treum.risk.LimitType}
 */
proto.treum.risk.GetRiskLimitsRequest.prototype.getLimitType = function() {
  return /** @type {!proto.treum.risk.LimitType} */ (jspb.Message.getFieldWithDefault(this, 4, 0));
};


/**
 * @param {!proto.treum.risk.LimitType} value
 * @return {!proto.treum.risk.GetRiskLimitsRequest} returns this
 */
proto.treum.risk.GetRiskLimitsRequest.prototype.setLimitType = function(value) {
  return jspb.Message.setProto3EnumField(this, 4, value);
};


/**
 * optional LimitScope scope = 5;
 * @return {!proto.treum.risk.LimitScope}
 */
proto.treum.risk.GetRiskLimitsRequest.prototype.getScope = function() {
  return /** @type {!proto.treum.risk.LimitScope} */ (jspb.Message.getFieldWithDefault(this, 5, 0));
};


/**
 * @param {!proto.treum.risk.LimitScope} value
 * @return {!proto.treum.risk.GetRiskLimitsRequest} returns this
 */
proto.treum.risk.GetRiskLimitsRequest.prototype.setScope = function(value) {
  return jspb.Message.setProto3EnumField(this, 5, value);
};


/**
 * optional LimitStatus status = 6;
 * @return {!proto.treum.risk.LimitStatus}
 */
proto.treum.risk.GetRiskLimitsRequest.prototype.getStatus = function() {
  return /** @type {!proto.treum.risk.LimitStatus} */ (jspb.Message.getFieldWithDefault(this, 6, 0));
};


/**
 * @param {!proto.treum.risk.LimitStatus} value
 * @return {!proto.treum.risk.GetRiskLimitsRequest} returns this
 */
proto.treum.risk.GetRiskLimitsRequest.prototype.setStatus = function(value) {
  return jspb.Message.setProto3EnumField(this, 6, value);
};


/**
 * optional int32 page = 7;
 * @return {number}
 */
proto.treum.risk.GetRiskLimitsRequest.prototype.getPage = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 7, 0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.GetRiskLimitsRequest} returns this
 */
proto.treum.risk.GetRiskLimitsRequest.prototype.setPage = function(value) {
  return jspb.Message.setProto3IntField(this, 7, value);
};


/**
 * optional int32 limit = 8;
 * @return {number}
 */
proto.treum.risk.GetRiskLimitsRequest.prototype.getLimit = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 8, 0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.GetRiskLimitsRequest} returns this
 */
proto.treum.risk.GetRiskLimitsRequest.prototype.setLimit = function(value) {
  return jspb.Message.setProto3IntField(this, 8, value);
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.treum.risk.ListRiskLimitsResponse.repeatedFields_ = [1];



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.treum.risk.ListRiskLimitsResponse.prototype.toObject = function(opt_includeInstance) {
  return proto.treum.risk.ListRiskLimitsResponse.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.treum.risk.ListRiskLimitsResponse} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.ListRiskLimitsResponse.toObject = function(includeInstance, msg) {
  var f, obj = {
    limitsList: jspb.Message.toObjectList(msg.getLimitsList(),
    proto.treum.risk.RiskLimitResponse.toObject, includeInstance),
    total: jspb.Message.getFieldWithDefault(msg, 2, 0),
    page: jspb.Message.getFieldWithDefault(msg, 3, 0),
    limit: jspb.Message.getFieldWithDefault(msg, 4, 0),
    totalPages: jspb.Message.getFieldWithDefault(msg, 5, 0)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.treum.risk.ListRiskLimitsResponse}
 */
proto.treum.risk.ListRiskLimitsResponse.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.treum.risk.ListRiskLimitsResponse;
  return proto.treum.risk.ListRiskLimitsResponse.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.treum.risk.ListRiskLimitsResponse} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.treum.risk.ListRiskLimitsResponse}
 */
proto.treum.risk.ListRiskLimitsResponse.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.treum.risk.RiskLimitResponse;
      reader.readMessage(value,proto.treum.risk.RiskLimitResponse.deserializeBinaryFromReader);
      msg.addLimits(value);
      break;
    case 2:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setTotal(value);
      break;
    case 3:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setPage(value);
      break;
    case 4:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setLimit(value);
      break;
    case 5:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setTotalPages(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.treum.risk.ListRiskLimitsResponse.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.treum.risk.ListRiskLimitsResponse.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.treum.risk.ListRiskLimitsResponse} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.ListRiskLimitsResponse.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getLimitsList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      1,
      f,
      proto.treum.risk.RiskLimitResponse.serializeBinaryToWriter
    );
  }
  f = message.getTotal();
  if (f !== 0) {
    writer.writeInt32(
      2,
      f
    );
  }
  f = message.getPage();
  if (f !== 0) {
    writer.writeInt32(
      3,
      f
    );
  }
  f = message.getLimit();
  if (f !== 0) {
    writer.writeInt32(
      4,
      f
    );
  }
  f = message.getTotalPages();
  if (f !== 0) {
    writer.writeInt32(
      5,
      f
    );
  }
};


/**
 * repeated RiskLimitResponse limits = 1;
 * @return {!Array<!proto.treum.risk.RiskLimitResponse>}
 */
proto.treum.risk.ListRiskLimitsResponse.prototype.getLimitsList = function() {
  return /** @type{!Array<!proto.treum.risk.RiskLimitResponse>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.treum.risk.RiskLimitResponse, 1));
};


/**
 * @param {!Array<!proto.treum.risk.RiskLimitResponse>} value
 * @return {!proto.treum.risk.ListRiskLimitsResponse} returns this
*/
proto.treum.risk.ListRiskLimitsResponse.prototype.setLimitsList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 1, value);
};


/**
 * @param {!proto.treum.risk.RiskLimitResponse=} opt_value
 * @param {number=} opt_index
 * @return {!proto.treum.risk.RiskLimitResponse}
 */
proto.treum.risk.ListRiskLimitsResponse.prototype.addLimits = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 1, opt_value, proto.treum.risk.RiskLimitResponse, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.treum.risk.ListRiskLimitsResponse} returns this
 */
proto.treum.risk.ListRiskLimitsResponse.prototype.clearLimitsList = function() {
  return this.setLimitsList([]);
};


/**
 * optional int32 total = 2;
 * @return {number}
 */
proto.treum.risk.ListRiskLimitsResponse.prototype.getTotal = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.ListRiskLimitsResponse} returns this
 */
proto.treum.risk.ListRiskLimitsResponse.prototype.setTotal = function(value) {
  return jspb.Message.setProto3IntField(this, 2, value);
};


/**
 * optional int32 page = 3;
 * @return {number}
 */
proto.treum.risk.ListRiskLimitsResponse.prototype.getPage = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 3, 0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.ListRiskLimitsResponse} returns this
 */
proto.treum.risk.ListRiskLimitsResponse.prototype.setPage = function(value) {
  return jspb.Message.setProto3IntField(this, 3, value);
};


/**
 * optional int32 limit = 4;
 * @return {number}
 */
proto.treum.risk.ListRiskLimitsResponse.prototype.getLimit = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 4, 0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.ListRiskLimitsResponse} returns this
 */
proto.treum.risk.ListRiskLimitsResponse.prototype.setLimit = function(value) {
  return jspb.Message.setProto3IntField(this, 4, value);
};


/**
 * optional int32 total_pages = 5;
 * @return {number}
 */
proto.treum.risk.ListRiskLimitsResponse.prototype.getTotalPages = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 5, 0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.ListRiskLimitsResponse} returns this
 */
proto.treum.risk.ListRiskLimitsResponse.prototype.setTotalPages = function(value) {
  return jspb.Message.setProto3IntField(this, 5, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.treum.risk.CheckLimitBreachRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.treum.risk.CheckLimitBreachRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.treum.risk.CheckLimitBreachRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.CheckLimitBreachRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    userId: jspb.Message.getFieldWithDefault(msg, 1, ""),
    accountId: jspb.Message.getFieldWithDefault(msg, 2, ""),
    portfolioId: jspb.Message.getFieldWithDefault(msg, 3, ""),
    limitType: jspb.Message.getFieldWithDefault(msg, 4, 0),
    currentValue: jspb.Message.getFloatingPointFieldWithDefault(msg, 5, 0.0)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.treum.risk.CheckLimitBreachRequest}
 */
proto.treum.risk.CheckLimitBreachRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.treum.risk.CheckLimitBreachRequest;
  return proto.treum.risk.CheckLimitBreachRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.treum.risk.CheckLimitBreachRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.treum.risk.CheckLimitBreachRequest}
 */
proto.treum.risk.CheckLimitBreachRequest.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setUserId(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setAccountId(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readString());
      msg.setPortfolioId(value);
      break;
    case 4:
      var value = /** @type {!proto.treum.risk.LimitType} */ (reader.readEnum());
      msg.setLimitType(value);
      break;
    case 5:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setCurrentValue(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.treum.risk.CheckLimitBreachRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.treum.risk.CheckLimitBreachRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.treum.risk.CheckLimitBreachRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.CheckLimitBreachRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getUserId();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getAccountId();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
  f = message.getPortfolioId();
  if (f.length > 0) {
    writer.writeString(
      3,
      f
    );
  }
  f = message.getLimitType();
  if (f !== 0.0) {
    writer.writeEnum(
      4,
      f
    );
  }
  f = message.getCurrentValue();
  if (f !== 0.0) {
    writer.writeDouble(
      5,
      f
    );
  }
};


/**
 * optional string user_id = 1;
 * @return {string}
 */
proto.treum.risk.CheckLimitBreachRequest.prototype.getUserId = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.CheckLimitBreachRequest} returns this
 */
proto.treum.risk.CheckLimitBreachRequest.prototype.setUserId = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional string account_id = 2;
 * @return {string}
 */
proto.treum.risk.CheckLimitBreachRequest.prototype.getAccountId = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.CheckLimitBreachRequest} returns this
 */
proto.treum.risk.CheckLimitBreachRequest.prototype.setAccountId = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};


/**
 * optional string portfolio_id = 3;
 * @return {string}
 */
proto.treum.risk.CheckLimitBreachRequest.prototype.getPortfolioId = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.CheckLimitBreachRequest} returns this
 */
proto.treum.risk.CheckLimitBreachRequest.prototype.setPortfolioId = function(value) {
  return jspb.Message.setProto3StringField(this, 3, value);
};


/**
 * optional LimitType limit_type = 4;
 * @return {!proto.treum.risk.LimitType}
 */
proto.treum.risk.CheckLimitBreachRequest.prototype.getLimitType = function() {
  return /** @type {!proto.treum.risk.LimitType} */ (jspb.Message.getFieldWithDefault(this, 4, 0));
};


/**
 * @param {!proto.treum.risk.LimitType} value
 * @return {!proto.treum.risk.CheckLimitBreachRequest} returns this
 */
proto.treum.risk.CheckLimitBreachRequest.prototype.setLimitType = function(value) {
  return jspb.Message.setProto3EnumField(this, 4, value);
};


/**
 * optional double current_value = 5;
 * @return {number}
 */
proto.treum.risk.CheckLimitBreachRequest.prototype.getCurrentValue = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 5, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.CheckLimitBreachRequest} returns this
 */
proto.treum.risk.CheckLimitBreachRequest.prototype.setCurrentValue = function(value) {
  return jspb.Message.setProto3FloatField(this, 5, value);
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.treum.risk.LimitBreachResponse.repeatedFields_ = [2,3,4];



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.treum.risk.LimitBreachResponse.prototype.toObject = function(opt_includeInstance) {
  return proto.treum.risk.LimitBreachResponse.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.treum.risk.LimitBreachResponse} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.LimitBreachResponse.toObject = function(includeInstance, msg) {
  var f, obj = {
    breachDetected: jspb.Message.getBooleanFieldWithDefault(msg, 1, false),
    breachedLimitsList: jspb.Message.toObjectList(msg.getBreachedLimitsList(),
    proto.treum.risk.RiskLimitResponse.toObject, includeInstance),
    warningLimitsList: jspb.Message.toObjectList(msg.getWarningLimitsList(),
    proto.treum.risk.RiskLimitResponse.toObject, includeInstance),
    recommendedActionsList: (f = jspb.Message.getRepeatedField(msg, 4)) == null ? undefined : f
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.treum.risk.LimitBreachResponse}
 */
proto.treum.risk.LimitBreachResponse.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.treum.risk.LimitBreachResponse;
  return proto.treum.risk.LimitBreachResponse.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.treum.risk.LimitBreachResponse} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.treum.risk.LimitBreachResponse}
 */
proto.treum.risk.LimitBreachResponse.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setBreachDetected(value);
      break;
    case 2:
      var value = new proto.treum.risk.RiskLimitResponse;
      reader.readMessage(value,proto.treum.risk.RiskLimitResponse.deserializeBinaryFromReader);
      msg.addBreachedLimits(value);
      break;
    case 3:
      var value = new proto.treum.risk.RiskLimitResponse;
      reader.readMessage(value,proto.treum.risk.RiskLimitResponse.deserializeBinaryFromReader);
      msg.addWarningLimits(value);
      break;
    case 4:
      var value = /** @type {string} */ (reader.readString());
      msg.addRecommendedActions(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.treum.risk.LimitBreachResponse.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.treum.risk.LimitBreachResponse.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.treum.risk.LimitBreachResponse} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.LimitBreachResponse.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getBreachDetected();
  if (f) {
    writer.writeBool(
      1,
      f
    );
  }
  f = message.getBreachedLimitsList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      2,
      f,
      proto.treum.risk.RiskLimitResponse.serializeBinaryToWriter
    );
  }
  f = message.getWarningLimitsList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      3,
      f,
      proto.treum.risk.RiskLimitResponse.serializeBinaryToWriter
    );
  }
  f = message.getRecommendedActionsList();
  if (f.length > 0) {
    writer.writeRepeatedString(
      4,
      f
    );
  }
};


/**
 * optional bool breach_detected = 1;
 * @return {boolean}
 */
proto.treum.risk.LimitBreachResponse.prototype.getBreachDetected = function() {
  return /** @type {boolean} */ (jspb.Message.getBooleanFieldWithDefault(this, 1, false));
};


/**
 * @param {boolean} value
 * @return {!proto.treum.risk.LimitBreachResponse} returns this
 */
proto.treum.risk.LimitBreachResponse.prototype.setBreachDetected = function(value) {
  return jspb.Message.setProto3BooleanField(this, 1, value);
};


/**
 * repeated RiskLimitResponse breached_limits = 2;
 * @return {!Array<!proto.treum.risk.RiskLimitResponse>}
 */
proto.treum.risk.LimitBreachResponse.prototype.getBreachedLimitsList = function() {
  return /** @type{!Array<!proto.treum.risk.RiskLimitResponse>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.treum.risk.RiskLimitResponse, 2));
};


/**
 * @param {!Array<!proto.treum.risk.RiskLimitResponse>} value
 * @return {!proto.treum.risk.LimitBreachResponse} returns this
*/
proto.treum.risk.LimitBreachResponse.prototype.setBreachedLimitsList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 2, value);
};


/**
 * @param {!proto.treum.risk.RiskLimitResponse=} opt_value
 * @param {number=} opt_index
 * @return {!proto.treum.risk.RiskLimitResponse}
 */
proto.treum.risk.LimitBreachResponse.prototype.addBreachedLimits = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 2, opt_value, proto.treum.risk.RiskLimitResponse, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.treum.risk.LimitBreachResponse} returns this
 */
proto.treum.risk.LimitBreachResponse.prototype.clearBreachedLimitsList = function() {
  return this.setBreachedLimitsList([]);
};


/**
 * repeated RiskLimitResponse warning_limits = 3;
 * @return {!Array<!proto.treum.risk.RiskLimitResponse>}
 */
proto.treum.risk.LimitBreachResponse.prototype.getWarningLimitsList = function() {
  return /** @type{!Array<!proto.treum.risk.RiskLimitResponse>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.treum.risk.RiskLimitResponse, 3));
};


/**
 * @param {!Array<!proto.treum.risk.RiskLimitResponse>} value
 * @return {!proto.treum.risk.LimitBreachResponse} returns this
*/
proto.treum.risk.LimitBreachResponse.prototype.setWarningLimitsList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 3, value);
};


/**
 * @param {!proto.treum.risk.RiskLimitResponse=} opt_value
 * @param {number=} opt_index
 * @return {!proto.treum.risk.RiskLimitResponse}
 */
proto.treum.risk.LimitBreachResponse.prototype.addWarningLimits = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 3, opt_value, proto.treum.risk.RiskLimitResponse, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.treum.risk.LimitBreachResponse} returns this
 */
proto.treum.risk.LimitBreachResponse.prototype.clearWarningLimitsList = function() {
  return this.setWarningLimitsList([]);
};


/**
 * repeated string recommended_actions = 4;
 * @return {!Array<string>}
 */
proto.treum.risk.LimitBreachResponse.prototype.getRecommendedActionsList = function() {
  return /** @type {!Array<string>} */ (jspb.Message.getRepeatedField(this, 4));
};


/**
 * @param {!Array<string>} value
 * @return {!proto.treum.risk.LimitBreachResponse} returns this
 */
proto.treum.risk.LimitBreachResponse.prototype.setRecommendedActionsList = function(value) {
  return jspb.Message.setField(this, 4, value || []);
};


/**
 * @param {string} value
 * @param {number=} opt_index
 * @return {!proto.treum.risk.LimitBreachResponse} returns this
 */
proto.treum.risk.LimitBreachResponse.prototype.addRecommendedActions = function(value, opt_index) {
  return jspb.Message.addToRepeatedField(this, 4, value, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.treum.risk.LimitBreachResponse} returns this
 */
proto.treum.risk.LimitBreachResponse.prototype.clearRecommendedActionsList = function() {
  return this.setRecommendedActionsList([]);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.treum.risk.DetectFraudRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.treum.risk.DetectFraudRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.treum.risk.DetectFraudRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.DetectFraudRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    userId: jspb.Message.getFieldWithDefault(msg, 1, ""),
    accountId: jspb.Message.getFieldWithDefault(msg, 2, ""),
    sessionData: (f = msg.getSessionData()) && proto.treum.risk.SessionData.toObject(includeInstance, f),
    transactionData: (f = msg.getTransactionData()) && proto.treum.risk.TransactionDataForFraud.toObject(includeInstance, f),
    tradingActivity: (f = msg.getTradingActivity()) && proto.treum.risk.TradingActivity.toObject(includeInstance, f),
    userProfile: (f = msg.getUserProfile()) && proto.treum.risk.UserProfileForFraud.toObject(includeInstance, f)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.treum.risk.DetectFraudRequest}
 */
proto.treum.risk.DetectFraudRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.treum.risk.DetectFraudRequest;
  return proto.treum.risk.DetectFraudRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.treum.risk.DetectFraudRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.treum.risk.DetectFraudRequest}
 */
proto.treum.risk.DetectFraudRequest.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setUserId(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setAccountId(value);
      break;
    case 3:
      var value = new proto.treum.risk.SessionData;
      reader.readMessage(value,proto.treum.risk.SessionData.deserializeBinaryFromReader);
      msg.setSessionData(value);
      break;
    case 4:
      var value = new proto.treum.risk.TransactionDataForFraud;
      reader.readMessage(value,proto.treum.risk.TransactionDataForFraud.deserializeBinaryFromReader);
      msg.setTransactionData(value);
      break;
    case 5:
      var value = new proto.treum.risk.TradingActivity;
      reader.readMessage(value,proto.treum.risk.TradingActivity.deserializeBinaryFromReader);
      msg.setTradingActivity(value);
      break;
    case 6:
      var value = new proto.treum.risk.UserProfileForFraud;
      reader.readMessage(value,proto.treum.risk.UserProfileForFraud.deserializeBinaryFromReader);
      msg.setUserProfile(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.treum.risk.DetectFraudRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.treum.risk.DetectFraudRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.treum.risk.DetectFraudRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.DetectFraudRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getUserId();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getAccountId();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
  f = message.getSessionData();
  if (f != null) {
    writer.writeMessage(
      3,
      f,
      proto.treum.risk.SessionData.serializeBinaryToWriter
    );
  }
  f = message.getTransactionData();
  if (f != null) {
    writer.writeMessage(
      4,
      f,
      proto.treum.risk.TransactionDataForFraud.serializeBinaryToWriter
    );
  }
  f = message.getTradingActivity();
  if (f != null) {
    writer.writeMessage(
      5,
      f,
      proto.treum.risk.TradingActivity.serializeBinaryToWriter
    );
  }
  f = message.getUserProfile();
  if (f != null) {
    writer.writeMessage(
      6,
      f,
      proto.treum.risk.UserProfileForFraud.serializeBinaryToWriter
    );
  }
};


/**
 * optional string user_id = 1;
 * @return {string}
 */
proto.treum.risk.DetectFraudRequest.prototype.getUserId = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.DetectFraudRequest} returns this
 */
proto.treum.risk.DetectFraudRequest.prototype.setUserId = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional string account_id = 2;
 * @return {string}
 */
proto.treum.risk.DetectFraudRequest.prototype.getAccountId = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.DetectFraudRequest} returns this
 */
proto.treum.risk.DetectFraudRequest.prototype.setAccountId = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};


/**
 * optional SessionData session_data = 3;
 * @return {?proto.treum.risk.SessionData}
 */
proto.treum.risk.DetectFraudRequest.prototype.getSessionData = function() {
  return /** @type{?proto.treum.risk.SessionData} */ (
    jspb.Message.getWrapperField(this, proto.treum.risk.SessionData, 3));
};


/**
 * @param {?proto.treum.risk.SessionData|undefined} value
 * @return {!proto.treum.risk.DetectFraudRequest} returns this
*/
proto.treum.risk.DetectFraudRequest.prototype.setSessionData = function(value) {
  return jspb.Message.setWrapperField(this, 3, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.treum.risk.DetectFraudRequest} returns this
 */
proto.treum.risk.DetectFraudRequest.prototype.clearSessionData = function() {
  return this.setSessionData(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.treum.risk.DetectFraudRequest.prototype.hasSessionData = function() {
  return jspb.Message.getField(this, 3) != null;
};


/**
 * optional TransactionDataForFraud transaction_data = 4;
 * @return {?proto.treum.risk.TransactionDataForFraud}
 */
proto.treum.risk.DetectFraudRequest.prototype.getTransactionData = function() {
  return /** @type{?proto.treum.risk.TransactionDataForFraud} */ (
    jspb.Message.getWrapperField(this, proto.treum.risk.TransactionDataForFraud, 4));
};


/**
 * @param {?proto.treum.risk.TransactionDataForFraud|undefined} value
 * @return {!proto.treum.risk.DetectFraudRequest} returns this
*/
proto.treum.risk.DetectFraudRequest.prototype.setTransactionData = function(value) {
  return jspb.Message.setWrapperField(this, 4, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.treum.risk.DetectFraudRequest} returns this
 */
proto.treum.risk.DetectFraudRequest.prototype.clearTransactionData = function() {
  return this.setTransactionData(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.treum.risk.DetectFraudRequest.prototype.hasTransactionData = function() {
  return jspb.Message.getField(this, 4) != null;
};


/**
 * optional TradingActivity trading_activity = 5;
 * @return {?proto.treum.risk.TradingActivity}
 */
proto.treum.risk.DetectFraudRequest.prototype.getTradingActivity = function() {
  return /** @type{?proto.treum.risk.TradingActivity} */ (
    jspb.Message.getWrapperField(this, proto.treum.risk.TradingActivity, 5));
};


/**
 * @param {?proto.treum.risk.TradingActivity|undefined} value
 * @return {!proto.treum.risk.DetectFraudRequest} returns this
*/
proto.treum.risk.DetectFraudRequest.prototype.setTradingActivity = function(value) {
  return jspb.Message.setWrapperField(this, 5, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.treum.risk.DetectFraudRequest} returns this
 */
proto.treum.risk.DetectFraudRequest.prototype.clearTradingActivity = function() {
  return this.setTradingActivity(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.treum.risk.DetectFraudRequest.prototype.hasTradingActivity = function() {
  return jspb.Message.getField(this, 5) != null;
};


/**
 * optional UserProfileForFraud user_profile = 6;
 * @return {?proto.treum.risk.UserProfileForFraud}
 */
proto.treum.risk.DetectFraudRequest.prototype.getUserProfile = function() {
  return /** @type{?proto.treum.risk.UserProfileForFraud} */ (
    jspb.Message.getWrapperField(this, proto.treum.risk.UserProfileForFraud, 6));
};


/**
 * @param {?proto.treum.risk.UserProfileForFraud|undefined} value
 * @return {!proto.treum.risk.DetectFraudRequest} returns this
*/
proto.treum.risk.DetectFraudRequest.prototype.setUserProfile = function(value) {
  return jspb.Message.setWrapperField(this, 6, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.treum.risk.DetectFraudRequest} returns this
 */
proto.treum.risk.DetectFraudRequest.prototype.clearUserProfile = function() {
  return this.setUserProfile(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.treum.risk.DetectFraudRequest.prototype.hasUserProfile = function() {
  return jspb.Message.getField(this, 6) != null;
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.treum.risk.SessionData.prototype.toObject = function(opt_includeInstance) {
  return proto.treum.risk.SessionData.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.treum.risk.SessionData} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.SessionData.toObject = function(includeInstance, msg) {
  var f, obj = {
    ipAddress: jspb.Message.getFieldWithDefault(msg, 1, ""),
    userAgent: jspb.Message.getFieldWithDefault(msg, 2, ""),
    deviceFingerprint: jspb.Message.getFieldWithDefault(msg, 3, ""),
    location: (f = msg.getLocation()) && proto.treum.risk.Location.toObject(includeInstance, f),
    sessionDuration: jspb.Message.getFieldWithDefault(msg, 5, 0),
    loginTime: (f = msg.getLoginTime()) && google_protobuf_timestamp_pb.Timestamp.toObject(includeInstance, f)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.treum.risk.SessionData}
 */
proto.treum.risk.SessionData.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.treum.risk.SessionData;
  return proto.treum.risk.SessionData.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.treum.risk.SessionData} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.treum.risk.SessionData}
 */
proto.treum.risk.SessionData.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setIpAddress(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setUserAgent(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readString());
      msg.setDeviceFingerprint(value);
      break;
    case 4:
      var value = new proto.treum.risk.Location;
      reader.readMessage(value,proto.treum.risk.Location.deserializeBinaryFromReader);
      msg.setLocation(value);
      break;
    case 5:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setSessionDuration(value);
      break;
    case 6:
      var value = new google_protobuf_timestamp_pb.Timestamp;
      reader.readMessage(value,google_protobuf_timestamp_pb.Timestamp.deserializeBinaryFromReader);
      msg.setLoginTime(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.treum.risk.SessionData.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.treum.risk.SessionData.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.treum.risk.SessionData} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.SessionData.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getIpAddress();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getUserAgent();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
  f = message.getDeviceFingerprint();
  if (f.length > 0) {
    writer.writeString(
      3,
      f
    );
  }
  f = message.getLocation();
  if (f != null) {
    writer.writeMessage(
      4,
      f,
      proto.treum.risk.Location.serializeBinaryToWriter
    );
  }
  f = message.getSessionDuration();
  if (f !== 0) {
    writer.writeInt32(
      5,
      f
    );
  }
  f = message.getLoginTime();
  if (f != null) {
    writer.writeMessage(
      6,
      f,
      google_protobuf_timestamp_pb.Timestamp.serializeBinaryToWriter
    );
  }
};


/**
 * optional string ip_address = 1;
 * @return {string}
 */
proto.treum.risk.SessionData.prototype.getIpAddress = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.SessionData} returns this
 */
proto.treum.risk.SessionData.prototype.setIpAddress = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional string user_agent = 2;
 * @return {string}
 */
proto.treum.risk.SessionData.prototype.getUserAgent = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.SessionData} returns this
 */
proto.treum.risk.SessionData.prototype.setUserAgent = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};


/**
 * optional string device_fingerprint = 3;
 * @return {string}
 */
proto.treum.risk.SessionData.prototype.getDeviceFingerprint = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.SessionData} returns this
 */
proto.treum.risk.SessionData.prototype.setDeviceFingerprint = function(value) {
  return jspb.Message.setProto3StringField(this, 3, value);
};


/**
 * optional Location location = 4;
 * @return {?proto.treum.risk.Location}
 */
proto.treum.risk.SessionData.prototype.getLocation = function() {
  return /** @type{?proto.treum.risk.Location} */ (
    jspb.Message.getWrapperField(this, proto.treum.risk.Location, 4));
};


/**
 * @param {?proto.treum.risk.Location|undefined} value
 * @return {!proto.treum.risk.SessionData} returns this
*/
proto.treum.risk.SessionData.prototype.setLocation = function(value) {
  return jspb.Message.setWrapperField(this, 4, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.treum.risk.SessionData} returns this
 */
proto.treum.risk.SessionData.prototype.clearLocation = function() {
  return this.setLocation(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.treum.risk.SessionData.prototype.hasLocation = function() {
  return jspb.Message.getField(this, 4) != null;
};


/**
 * optional int32 session_duration = 5;
 * @return {number}
 */
proto.treum.risk.SessionData.prototype.getSessionDuration = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 5, 0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.SessionData} returns this
 */
proto.treum.risk.SessionData.prototype.setSessionDuration = function(value) {
  return jspb.Message.setProto3IntField(this, 5, value);
};


/**
 * optional google.protobuf.Timestamp login_time = 6;
 * @return {?proto.google.protobuf.Timestamp}
 */
proto.treum.risk.SessionData.prototype.getLoginTime = function() {
  return /** @type{?proto.google.protobuf.Timestamp} */ (
    jspb.Message.getWrapperField(this, google_protobuf_timestamp_pb.Timestamp, 6));
};


/**
 * @param {?proto.google.protobuf.Timestamp|undefined} value
 * @return {!proto.treum.risk.SessionData} returns this
*/
proto.treum.risk.SessionData.prototype.setLoginTime = function(value) {
  return jspb.Message.setWrapperField(this, 6, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.treum.risk.SessionData} returns this
 */
proto.treum.risk.SessionData.prototype.clearLoginTime = function() {
  return this.setLoginTime(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.treum.risk.SessionData.prototype.hasLoginTime = function() {
  return jspb.Message.getField(this, 6) != null;
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.treum.risk.Location.prototype.toObject = function(opt_includeInstance) {
  return proto.treum.risk.Location.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.treum.risk.Location} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.Location.toObject = function(includeInstance, msg) {
  var f, obj = {
    country: jspb.Message.getFieldWithDefault(msg, 1, ""),
    city: jspb.Message.getFieldWithDefault(msg, 2, ""),
    coordinates: (f = msg.getCoordinates()) && proto.treum.risk.Coordinates.toObject(includeInstance, f)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.treum.risk.Location}
 */
proto.treum.risk.Location.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.treum.risk.Location;
  return proto.treum.risk.Location.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.treum.risk.Location} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.treum.risk.Location}
 */
proto.treum.risk.Location.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setCountry(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setCity(value);
      break;
    case 3:
      var value = new proto.treum.risk.Coordinates;
      reader.readMessage(value,proto.treum.risk.Coordinates.deserializeBinaryFromReader);
      msg.setCoordinates(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.treum.risk.Location.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.treum.risk.Location.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.treum.risk.Location} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.Location.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getCountry();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getCity();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
  f = message.getCoordinates();
  if (f != null) {
    writer.writeMessage(
      3,
      f,
      proto.treum.risk.Coordinates.serializeBinaryToWriter
    );
  }
};


/**
 * optional string country = 1;
 * @return {string}
 */
proto.treum.risk.Location.prototype.getCountry = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.Location} returns this
 */
proto.treum.risk.Location.prototype.setCountry = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional string city = 2;
 * @return {string}
 */
proto.treum.risk.Location.prototype.getCity = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.Location} returns this
 */
proto.treum.risk.Location.prototype.setCity = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};


/**
 * optional Coordinates coordinates = 3;
 * @return {?proto.treum.risk.Coordinates}
 */
proto.treum.risk.Location.prototype.getCoordinates = function() {
  return /** @type{?proto.treum.risk.Coordinates} */ (
    jspb.Message.getWrapperField(this, proto.treum.risk.Coordinates, 3));
};


/**
 * @param {?proto.treum.risk.Coordinates|undefined} value
 * @return {!proto.treum.risk.Location} returns this
*/
proto.treum.risk.Location.prototype.setCoordinates = function(value) {
  return jspb.Message.setWrapperField(this, 3, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.treum.risk.Location} returns this
 */
proto.treum.risk.Location.prototype.clearCoordinates = function() {
  return this.setCoordinates(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.treum.risk.Location.prototype.hasCoordinates = function() {
  return jspb.Message.getField(this, 3) != null;
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.treum.risk.Coordinates.prototype.toObject = function(opt_includeInstance) {
  return proto.treum.risk.Coordinates.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.treum.risk.Coordinates} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.Coordinates.toObject = function(includeInstance, msg) {
  var f, obj = {
    latitude: jspb.Message.getFloatingPointFieldWithDefault(msg, 1, 0.0),
    longitude: jspb.Message.getFloatingPointFieldWithDefault(msg, 2, 0.0)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.treum.risk.Coordinates}
 */
proto.treum.risk.Coordinates.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.treum.risk.Coordinates;
  return proto.treum.risk.Coordinates.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.treum.risk.Coordinates} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.treum.risk.Coordinates}
 */
proto.treum.risk.Coordinates.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setLatitude(value);
      break;
    case 2:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setLongitude(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.treum.risk.Coordinates.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.treum.risk.Coordinates.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.treum.risk.Coordinates} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.Coordinates.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getLatitude();
  if (f !== 0.0) {
    writer.writeDouble(
      1,
      f
    );
  }
  f = message.getLongitude();
  if (f !== 0.0) {
    writer.writeDouble(
      2,
      f
    );
  }
};


/**
 * optional double latitude = 1;
 * @return {number}
 */
proto.treum.risk.Coordinates.prototype.getLatitude = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 1, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.Coordinates} returns this
 */
proto.treum.risk.Coordinates.prototype.setLatitude = function(value) {
  return jspb.Message.setProto3FloatField(this, 1, value);
};


/**
 * optional double longitude = 2;
 * @return {number}
 */
proto.treum.risk.Coordinates.prototype.getLongitude = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 2, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.Coordinates} returns this
 */
proto.treum.risk.Coordinates.prototype.setLongitude = function(value) {
  return jspb.Message.setProto3FloatField(this, 2, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.treum.risk.TransactionDataForFraud.prototype.toObject = function(opt_includeInstance) {
  return proto.treum.risk.TransactionDataForFraud.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.treum.risk.TransactionDataForFraud} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.TransactionDataForFraud.toObject = function(includeInstance, msg) {
  var f, obj = {
    amount: jspb.Message.getFloatingPointFieldWithDefault(msg, 1, 0.0),
    currency: jspb.Message.getFieldWithDefault(msg, 2, ""),
    recipient: jspb.Message.getFieldWithDefault(msg, 3, ""),
    description: jspb.Message.getFieldWithDefault(msg, 4, ""),
    timestamp: (f = msg.getTimestamp()) && google_protobuf_timestamp_pb.Timestamp.toObject(includeInstance, f)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.treum.risk.TransactionDataForFraud}
 */
proto.treum.risk.TransactionDataForFraud.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.treum.risk.TransactionDataForFraud;
  return proto.treum.risk.TransactionDataForFraud.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.treum.risk.TransactionDataForFraud} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.treum.risk.TransactionDataForFraud}
 */
proto.treum.risk.TransactionDataForFraud.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setAmount(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setCurrency(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readString());
      msg.setRecipient(value);
      break;
    case 4:
      var value = /** @type {string} */ (reader.readString());
      msg.setDescription(value);
      break;
    case 5:
      var value = new google_protobuf_timestamp_pb.Timestamp;
      reader.readMessage(value,google_protobuf_timestamp_pb.Timestamp.deserializeBinaryFromReader);
      msg.setTimestamp(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.treum.risk.TransactionDataForFraud.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.treum.risk.TransactionDataForFraud.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.treum.risk.TransactionDataForFraud} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.TransactionDataForFraud.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getAmount();
  if (f !== 0.0) {
    writer.writeDouble(
      1,
      f
    );
  }
  f = message.getCurrency();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
  f = message.getRecipient();
  if (f.length > 0) {
    writer.writeString(
      3,
      f
    );
  }
  f = message.getDescription();
  if (f.length > 0) {
    writer.writeString(
      4,
      f
    );
  }
  f = message.getTimestamp();
  if (f != null) {
    writer.writeMessage(
      5,
      f,
      google_protobuf_timestamp_pb.Timestamp.serializeBinaryToWriter
    );
  }
};


/**
 * optional double amount = 1;
 * @return {number}
 */
proto.treum.risk.TransactionDataForFraud.prototype.getAmount = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 1, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.TransactionDataForFraud} returns this
 */
proto.treum.risk.TransactionDataForFraud.prototype.setAmount = function(value) {
  return jspb.Message.setProto3FloatField(this, 1, value);
};


/**
 * optional string currency = 2;
 * @return {string}
 */
proto.treum.risk.TransactionDataForFraud.prototype.getCurrency = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.TransactionDataForFraud} returns this
 */
proto.treum.risk.TransactionDataForFraud.prototype.setCurrency = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};


/**
 * optional string recipient = 3;
 * @return {string}
 */
proto.treum.risk.TransactionDataForFraud.prototype.getRecipient = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.TransactionDataForFraud} returns this
 */
proto.treum.risk.TransactionDataForFraud.prototype.setRecipient = function(value) {
  return jspb.Message.setProto3StringField(this, 3, value);
};


/**
 * optional string description = 4;
 * @return {string}
 */
proto.treum.risk.TransactionDataForFraud.prototype.getDescription = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 4, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.TransactionDataForFraud} returns this
 */
proto.treum.risk.TransactionDataForFraud.prototype.setDescription = function(value) {
  return jspb.Message.setProto3StringField(this, 4, value);
};


/**
 * optional google.protobuf.Timestamp timestamp = 5;
 * @return {?proto.google.protobuf.Timestamp}
 */
proto.treum.risk.TransactionDataForFraud.prototype.getTimestamp = function() {
  return /** @type{?proto.google.protobuf.Timestamp} */ (
    jspb.Message.getWrapperField(this, google_protobuf_timestamp_pb.Timestamp, 5));
};


/**
 * @param {?proto.google.protobuf.Timestamp|undefined} value
 * @return {!proto.treum.risk.TransactionDataForFraud} returns this
*/
proto.treum.risk.TransactionDataForFraud.prototype.setTimestamp = function(value) {
  return jspb.Message.setWrapperField(this, 5, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.treum.risk.TransactionDataForFraud} returns this
 */
proto.treum.risk.TransactionDataForFraud.prototype.clearTimestamp = function() {
  return this.setTimestamp(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.treum.risk.TransactionDataForFraud.prototype.hasTimestamp = function() {
  return jspb.Message.getField(this, 5) != null;
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.treum.risk.TradingActivity.prototype.toObject = function(opt_includeInstance) {
  return proto.treum.risk.TradingActivity.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.treum.risk.TradingActivity} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.TradingActivity.toObject = function(includeInstance, msg) {
  var f, obj = {
    symbol: jspb.Message.getFieldWithDefault(msg, 1, ""),
    side: jspb.Message.getFieldWithDefault(msg, 2, 0),
    quantity: jspb.Message.getFloatingPointFieldWithDefault(msg, 3, 0.0),
    price: jspb.Message.getFloatingPointFieldWithDefault(msg, 4, 0.0),
    timestamp: (f = msg.getTimestamp()) && google_protobuf_timestamp_pb.Timestamp.toObject(includeInstance, f)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.treum.risk.TradingActivity}
 */
proto.treum.risk.TradingActivity.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.treum.risk.TradingActivity;
  return proto.treum.risk.TradingActivity.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.treum.risk.TradingActivity} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.treum.risk.TradingActivity}
 */
proto.treum.risk.TradingActivity.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setSymbol(value);
      break;
    case 2:
      var value = /** @type {!proto.treum.risk.TradeSide} */ (reader.readEnum());
      msg.setSide(value);
      break;
    case 3:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setQuantity(value);
      break;
    case 4:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setPrice(value);
      break;
    case 5:
      var value = new google_protobuf_timestamp_pb.Timestamp;
      reader.readMessage(value,google_protobuf_timestamp_pb.Timestamp.deserializeBinaryFromReader);
      msg.setTimestamp(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.treum.risk.TradingActivity.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.treum.risk.TradingActivity.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.treum.risk.TradingActivity} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.TradingActivity.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getSymbol();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getSide();
  if (f !== 0.0) {
    writer.writeEnum(
      2,
      f
    );
  }
  f = message.getQuantity();
  if (f !== 0.0) {
    writer.writeDouble(
      3,
      f
    );
  }
  f = message.getPrice();
  if (f !== 0.0) {
    writer.writeDouble(
      4,
      f
    );
  }
  f = message.getTimestamp();
  if (f != null) {
    writer.writeMessage(
      5,
      f,
      google_protobuf_timestamp_pb.Timestamp.serializeBinaryToWriter
    );
  }
};


/**
 * optional string symbol = 1;
 * @return {string}
 */
proto.treum.risk.TradingActivity.prototype.getSymbol = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.TradingActivity} returns this
 */
proto.treum.risk.TradingActivity.prototype.setSymbol = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional TradeSide side = 2;
 * @return {!proto.treum.risk.TradeSide}
 */
proto.treum.risk.TradingActivity.prototype.getSide = function() {
  return /** @type {!proto.treum.risk.TradeSide} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/**
 * @param {!proto.treum.risk.TradeSide} value
 * @return {!proto.treum.risk.TradingActivity} returns this
 */
proto.treum.risk.TradingActivity.prototype.setSide = function(value) {
  return jspb.Message.setProto3EnumField(this, 2, value);
};


/**
 * optional double quantity = 3;
 * @return {number}
 */
proto.treum.risk.TradingActivity.prototype.getQuantity = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 3, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.TradingActivity} returns this
 */
proto.treum.risk.TradingActivity.prototype.setQuantity = function(value) {
  return jspb.Message.setProto3FloatField(this, 3, value);
};


/**
 * optional double price = 4;
 * @return {number}
 */
proto.treum.risk.TradingActivity.prototype.getPrice = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 4, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.TradingActivity} returns this
 */
proto.treum.risk.TradingActivity.prototype.setPrice = function(value) {
  return jspb.Message.setProto3FloatField(this, 4, value);
};


/**
 * optional google.protobuf.Timestamp timestamp = 5;
 * @return {?proto.google.protobuf.Timestamp}
 */
proto.treum.risk.TradingActivity.prototype.getTimestamp = function() {
  return /** @type{?proto.google.protobuf.Timestamp} */ (
    jspb.Message.getWrapperField(this, google_protobuf_timestamp_pb.Timestamp, 5));
};


/**
 * @param {?proto.google.protobuf.Timestamp|undefined} value
 * @return {!proto.treum.risk.TradingActivity} returns this
*/
proto.treum.risk.TradingActivity.prototype.setTimestamp = function(value) {
  return jspb.Message.setWrapperField(this, 5, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.treum.risk.TradingActivity} returns this
 */
proto.treum.risk.TradingActivity.prototype.clearTimestamp = function() {
  return this.setTimestamp(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.treum.risk.TradingActivity.prototype.hasTimestamp = function() {
  return jspb.Message.getField(this, 5) != null;
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.treum.risk.UserProfileForFraud.repeatedFields_ = [3,4,6];



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.treum.risk.UserProfileForFraud.prototype.toObject = function(opt_includeInstance) {
  return proto.treum.risk.UserProfileForFraud.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.treum.risk.UserProfileForFraud} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.UserProfileForFraud.toObject = function(includeInstance, msg) {
  var f, obj = {
    registrationDate: (f = msg.getRegistrationDate()) && google_protobuf_timestamp_pb.Timestamp.toObject(includeInstance, f),
    lastLoginDate: (f = msg.getLastLoginDate()) && google_protobuf_timestamp_pb.Timestamp.toObject(includeInstance, f),
    typicalLoginTimesList: (f = jspb.Message.getRepeatedField(msg, 3)) == null ? undefined : f,
    typicalLocationsList: jspb.Message.toObjectList(msg.getTypicalLocationsList(),
    proto.treum.risk.TypicalLocation.toObject, includeInstance),
    averageSessionDuration: jspb.Message.getFieldWithDefault(msg, 5, 0),
    deviceHistoryList: jspb.Message.toObjectList(msg.getDeviceHistoryList(),
    proto.treum.risk.DeviceHistory.toObject, includeInstance),
    riskScore: jspb.Message.getFloatingPointFieldWithDefault(msg, 7, 0.0)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.treum.risk.UserProfileForFraud}
 */
proto.treum.risk.UserProfileForFraud.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.treum.risk.UserProfileForFraud;
  return proto.treum.risk.UserProfileForFraud.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.treum.risk.UserProfileForFraud} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.treum.risk.UserProfileForFraud}
 */
proto.treum.risk.UserProfileForFraud.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new google_protobuf_timestamp_pb.Timestamp;
      reader.readMessage(value,google_protobuf_timestamp_pb.Timestamp.deserializeBinaryFromReader);
      msg.setRegistrationDate(value);
      break;
    case 2:
      var value = new google_protobuf_timestamp_pb.Timestamp;
      reader.readMessage(value,google_protobuf_timestamp_pb.Timestamp.deserializeBinaryFromReader);
      msg.setLastLoginDate(value);
      break;
    case 3:
      var values = /** @type {!Array<number>} */ (reader.isDelimited() ? reader.readPackedInt32() : [reader.readInt32()]);
      for (var i = 0; i < values.length; i++) {
        msg.addTypicalLoginTimes(values[i]);
      }
      break;
    case 4:
      var value = new proto.treum.risk.TypicalLocation;
      reader.readMessage(value,proto.treum.risk.TypicalLocation.deserializeBinaryFromReader);
      msg.addTypicalLocations(value);
      break;
    case 5:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setAverageSessionDuration(value);
      break;
    case 6:
      var value = new proto.treum.risk.DeviceHistory;
      reader.readMessage(value,proto.treum.risk.DeviceHistory.deserializeBinaryFromReader);
      msg.addDeviceHistory(value);
      break;
    case 7:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setRiskScore(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.treum.risk.UserProfileForFraud.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.treum.risk.UserProfileForFraud.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.treum.risk.UserProfileForFraud} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.UserProfileForFraud.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getRegistrationDate();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      google_protobuf_timestamp_pb.Timestamp.serializeBinaryToWriter
    );
  }
  f = message.getLastLoginDate();
  if (f != null) {
    writer.writeMessage(
      2,
      f,
      google_protobuf_timestamp_pb.Timestamp.serializeBinaryToWriter
    );
  }
  f = message.getTypicalLoginTimesList();
  if (f.length > 0) {
    writer.writePackedInt32(
      3,
      f
    );
  }
  f = message.getTypicalLocationsList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      4,
      f,
      proto.treum.risk.TypicalLocation.serializeBinaryToWriter
    );
  }
  f = message.getAverageSessionDuration();
  if (f !== 0) {
    writer.writeInt32(
      5,
      f
    );
  }
  f = message.getDeviceHistoryList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      6,
      f,
      proto.treum.risk.DeviceHistory.serializeBinaryToWriter
    );
  }
  f = message.getRiskScore();
  if (f !== 0.0) {
    writer.writeDouble(
      7,
      f
    );
  }
};


/**
 * optional google.protobuf.Timestamp registration_date = 1;
 * @return {?proto.google.protobuf.Timestamp}
 */
proto.treum.risk.UserProfileForFraud.prototype.getRegistrationDate = function() {
  return /** @type{?proto.google.protobuf.Timestamp} */ (
    jspb.Message.getWrapperField(this, google_protobuf_timestamp_pb.Timestamp, 1));
};


/**
 * @param {?proto.google.protobuf.Timestamp|undefined} value
 * @return {!proto.treum.risk.UserProfileForFraud} returns this
*/
proto.treum.risk.UserProfileForFraud.prototype.setRegistrationDate = function(value) {
  return jspb.Message.setWrapperField(this, 1, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.treum.risk.UserProfileForFraud} returns this
 */
proto.treum.risk.UserProfileForFraud.prototype.clearRegistrationDate = function() {
  return this.setRegistrationDate(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.treum.risk.UserProfileForFraud.prototype.hasRegistrationDate = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional google.protobuf.Timestamp last_login_date = 2;
 * @return {?proto.google.protobuf.Timestamp}
 */
proto.treum.risk.UserProfileForFraud.prototype.getLastLoginDate = function() {
  return /** @type{?proto.google.protobuf.Timestamp} */ (
    jspb.Message.getWrapperField(this, google_protobuf_timestamp_pb.Timestamp, 2));
};


/**
 * @param {?proto.google.protobuf.Timestamp|undefined} value
 * @return {!proto.treum.risk.UserProfileForFraud} returns this
*/
proto.treum.risk.UserProfileForFraud.prototype.setLastLoginDate = function(value) {
  return jspb.Message.setWrapperField(this, 2, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.treum.risk.UserProfileForFraud} returns this
 */
proto.treum.risk.UserProfileForFraud.prototype.clearLastLoginDate = function() {
  return this.setLastLoginDate(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.treum.risk.UserProfileForFraud.prototype.hasLastLoginDate = function() {
  return jspb.Message.getField(this, 2) != null;
};


/**
 * repeated int32 typical_login_times = 3;
 * @return {!Array<number>}
 */
proto.treum.risk.UserProfileForFraud.prototype.getTypicalLoginTimesList = function() {
  return /** @type {!Array<number>} */ (jspb.Message.getRepeatedField(this, 3));
};


/**
 * @param {!Array<number>} value
 * @return {!proto.treum.risk.UserProfileForFraud} returns this
 */
proto.treum.risk.UserProfileForFraud.prototype.setTypicalLoginTimesList = function(value) {
  return jspb.Message.setField(this, 3, value || []);
};


/**
 * @param {number} value
 * @param {number=} opt_index
 * @return {!proto.treum.risk.UserProfileForFraud} returns this
 */
proto.treum.risk.UserProfileForFraud.prototype.addTypicalLoginTimes = function(value, opt_index) {
  return jspb.Message.addToRepeatedField(this, 3, value, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.treum.risk.UserProfileForFraud} returns this
 */
proto.treum.risk.UserProfileForFraud.prototype.clearTypicalLoginTimesList = function() {
  return this.setTypicalLoginTimesList([]);
};


/**
 * repeated TypicalLocation typical_locations = 4;
 * @return {!Array<!proto.treum.risk.TypicalLocation>}
 */
proto.treum.risk.UserProfileForFraud.prototype.getTypicalLocationsList = function() {
  return /** @type{!Array<!proto.treum.risk.TypicalLocation>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.treum.risk.TypicalLocation, 4));
};


/**
 * @param {!Array<!proto.treum.risk.TypicalLocation>} value
 * @return {!proto.treum.risk.UserProfileForFraud} returns this
*/
proto.treum.risk.UserProfileForFraud.prototype.setTypicalLocationsList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 4, value);
};


/**
 * @param {!proto.treum.risk.TypicalLocation=} opt_value
 * @param {number=} opt_index
 * @return {!proto.treum.risk.TypicalLocation}
 */
proto.treum.risk.UserProfileForFraud.prototype.addTypicalLocations = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 4, opt_value, proto.treum.risk.TypicalLocation, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.treum.risk.UserProfileForFraud} returns this
 */
proto.treum.risk.UserProfileForFraud.prototype.clearTypicalLocationsList = function() {
  return this.setTypicalLocationsList([]);
};


/**
 * optional int32 average_session_duration = 5;
 * @return {number}
 */
proto.treum.risk.UserProfileForFraud.prototype.getAverageSessionDuration = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 5, 0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.UserProfileForFraud} returns this
 */
proto.treum.risk.UserProfileForFraud.prototype.setAverageSessionDuration = function(value) {
  return jspb.Message.setProto3IntField(this, 5, value);
};


/**
 * repeated DeviceHistory device_history = 6;
 * @return {!Array<!proto.treum.risk.DeviceHistory>}
 */
proto.treum.risk.UserProfileForFraud.prototype.getDeviceHistoryList = function() {
  return /** @type{!Array<!proto.treum.risk.DeviceHistory>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.treum.risk.DeviceHistory, 6));
};


/**
 * @param {!Array<!proto.treum.risk.DeviceHistory>} value
 * @return {!proto.treum.risk.UserProfileForFraud} returns this
*/
proto.treum.risk.UserProfileForFraud.prototype.setDeviceHistoryList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 6, value);
};


/**
 * @param {!proto.treum.risk.DeviceHistory=} opt_value
 * @param {number=} opt_index
 * @return {!proto.treum.risk.DeviceHistory}
 */
proto.treum.risk.UserProfileForFraud.prototype.addDeviceHistory = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 6, opt_value, proto.treum.risk.DeviceHistory, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.treum.risk.UserProfileForFraud} returns this
 */
proto.treum.risk.UserProfileForFraud.prototype.clearDeviceHistoryList = function() {
  return this.setDeviceHistoryList([]);
};


/**
 * optional double risk_score = 7;
 * @return {number}
 */
proto.treum.risk.UserProfileForFraud.prototype.getRiskScore = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 7, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.UserProfileForFraud} returns this
 */
proto.treum.risk.UserProfileForFraud.prototype.setRiskScore = function(value) {
  return jspb.Message.setProto3FloatField(this, 7, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.treum.risk.TypicalLocation.prototype.toObject = function(opt_includeInstance) {
  return proto.treum.risk.TypicalLocation.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.treum.risk.TypicalLocation} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.TypicalLocation.toObject = function(includeInstance, msg) {
  var f, obj = {
    country: jspb.Message.getFieldWithDefault(msg, 1, ""),
    city: jspb.Message.getFieldWithDefault(msg, 2, ""),
    frequency: jspb.Message.getFieldWithDefault(msg, 3, 0)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.treum.risk.TypicalLocation}
 */
proto.treum.risk.TypicalLocation.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.treum.risk.TypicalLocation;
  return proto.treum.risk.TypicalLocation.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.treum.risk.TypicalLocation} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.treum.risk.TypicalLocation}
 */
proto.treum.risk.TypicalLocation.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setCountry(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setCity(value);
      break;
    case 3:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setFrequency(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.treum.risk.TypicalLocation.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.treum.risk.TypicalLocation.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.treum.risk.TypicalLocation} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.TypicalLocation.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getCountry();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getCity();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
  f = message.getFrequency();
  if (f !== 0) {
    writer.writeInt32(
      3,
      f
    );
  }
};


/**
 * optional string country = 1;
 * @return {string}
 */
proto.treum.risk.TypicalLocation.prototype.getCountry = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.TypicalLocation} returns this
 */
proto.treum.risk.TypicalLocation.prototype.setCountry = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional string city = 2;
 * @return {string}
 */
proto.treum.risk.TypicalLocation.prototype.getCity = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.TypicalLocation} returns this
 */
proto.treum.risk.TypicalLocation.prototype.setCity = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};


/**
 * optional int32 frequency = 3;
 * @return {number}
 */
proto.treum.risk.TypicalLocation.prototype.getFrequency = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 3, 0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.TypicalLocation} returns this
 */
proto.treum.risk.TypicalLocation.prototype.setFrequency = function(value) {
  return jspb.Message.setProto3IntField(this, 3, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.treum.risk.DeviceHistory.prototype.toObject = function(opt_includeInstance) {
  return proto.treum.risk.DeviceHistory.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.treum.risk.DeviceHistory} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.DeviceHistory.toObject = function(includeInstance, msg) {
  var f, obj = {
    deviceFingerprint: jspb.Message.getFieldWithDefault(msg, 1, ""),
    lastUsed: (f = msg.getLastUsed()) && google_protobuf_timestamp_pb.Timestamp.toObject(includeInstance, f),
    trusted: jspb.Message.getBooleanFieldWithDefault(msg, 3, false)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.treum.risk.DeviceHistory}
 */
proto.treum.risk.DeviceHistory.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.treum.risk.DeviceHistory;
  return proto.treum.risk.DeviceHistory.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.treum.risk.DeviceHistory} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.treum.risk.DeviceHistory}
 */
proto.treum.risk.DeviceHistory.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setDeviceFingerprint(value);
      break;
    case 2:
      var value = new google_protobuf_timestamp_pb.Timestamp;
      reader.readMessage(value,google_protobuf_timestamp_pb.Timestamp.deserializeBinaryFromReader);
      msg.setLastUsed(value);
      break;
    case 3:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setTrusted(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.treum.risk.DeviceHistory.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.treum.risk.DeviceHistory.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.treum.risk.DeviceHistory} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.DeviceHistory.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getDeviceFingerprint();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getLastUsed();
  if (f != null) {
    writer.writeMessage(
      2,
      f,
      google_protobuf_timestamp_pb.Timestamp.serializeBinaryToWriter
    );
  }
  f = message.getTrusted();
  if (f) {
    writer.writeBool(
      3,
      f
    );
  }
};


/**
 * optional string device_fingerprint = 1;
 * @return {string}
 */
proto.treum.risk.DeviceHistory.prototype.getDeviceFingerprint = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.DeviceHistory} returns this
 */
proto.treum.risk.DeviceHistory.prototype.setDeviceFingerprint = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional google.protobuf.Timestamp last_used = 2;
 * @return {?proto.google.protobuf.Timestamp}
 */
proto.treum.risk.DeviceHistory.prototype.getLastUsed = function() {
  return /** @type{?proto.google.protobuf.Timestamp} */ (
    jspb.Message.getWrapperField(this, google_protobuf_timestamp_pb.Timestamp, 2));
};


/**
 * @param {?proto.google.protobuf.Timestamp|undefined} value
 * @return {!proto.treum.risk.DeviceHistory} returns this
*/
proto.treum.risk.DeviceHistory.prototype.setLastUsed = function(value) {
  return jspb.Message.setWrapperField(this, 2, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.treum.risk.DeviceHistory} returns this
 */
proto.treum.risk.DeviceHistory.prototype.clearLastUsed = function() {
  return this.setLastUsed(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.treum.risk.DeviceHistory.prototype.hasLastUsed = function() {
  return jspb.Message.getField(this, 2) != null;
};


/**
 * optional bool trusted = 3;
 * @return {boolean}
 */
proto.treum.risk.DeviceHistory.prototype.getTrusted = function() {
  return /** @type {boolean} */ (jspb.Message.getBooleanFieldWithDefault(this, 3, false));
};


/**
 * @param {boolean} value
 * @return {!proto.treum.risk.DeviceHistory} returns this
 */
proto.treum.risk.DeviceHistory.prototype.setTrusted = function(value) {
  return jspb.Message.setProto3BooleanField(this, 3, value);
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.treum.risk.FraudDetectionResponse.repeatedFields_ = [3];



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.treum.risk.FraudDetectionResponse.prototype.toObject = function(opt_includeInstance) {
  return proto.treum.risk.FraudDetectionResponse.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.treum.risk.FraudDetectionResponse} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.FraudDetectionResponse.toObject = function(includeInstance, msg) {
  var f, obj = {
    overallScore: jspb.Message.getFloatingPointFieldWithDefault(msg, 1, 0.0),
    categories: (f = msg.getCategories()) && proto.treum.risk.FraudCategories.toObject(includeInstance, f),
    riskFactorsList: jspb.Message.toObjectList(msg.getRiskFactorsList(),
    proto.treum.risk.FraudRiskFactor.toObject, includeInstance),
    recommendation: jspb.Message.getFieldWithDefault(msg, 4, 0),
    confidence: jspb.Message.getFloatingPointFieldWithDefault(msg, 5, 0.0)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.treum.risk.FraudDetectionResponse}
 */
proto.treum.risk.FraudDetectionResponse.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.treum.risk.FraudDetectionResponse;
  return proto.treum.risk.FraudDetectionResponse.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.treum.risk.FraudDetectionResponse} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.treum.risk.FraudDetectionResponse}
 */
proto.treum.risk.FraudDetectionResponse.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setOverallScore(value);
      break;
    case 2:
      var value = new proto.treum.risk.FraudCategories;
      reader.readMessage(value,proto.treum.risk.FraudCategories.deserializeBinaryFromReader);
      msg.setCategories(value);
      break;
    case 3:
      var value = new proto.treum.risk.FraudRiskFactor;
      reader.readMessage(value,proto.treum.risk.FraudRiskFactor.deserializeBinaryFromReader);
      msg.addRiskFactors(value);
      break;
    case 4:
      var value = /** @type {!proto.treum.risk.FraudRecommendation} */ (reader.readEnum());
      msg.setRecommendation(value);
      break;
    case 5:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setConfidence(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.treum.risk.FraudDetectionResponse.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.treum.risk.FraudDetectionResponse.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.treum.risk.FraudDetectionResponse} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.FraudDetectionResponse.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getOverallScore();
  if (f !== 0.0) {
    writer.writeDouble(
      1,
      f
    );
  }
  f = message.getCategories();
  if (f != null) {
    writer.writeMessage(
      2,
      f,
      proto.treum.risk.FraudCategories.serializeBinaryToWriter
    );
  }
  f = message.getRiskFactorsList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      3,
      f,
      proto.treum.risk.FraudRiskFactor.serializeBinaryToWriter
    );
  }
  f = message.getRecommendation();
  if (f !== 0.0) {
    writer.writeEnum(
      4,
      f
    );
  }
  f = message.getConfidence();
  if (f !== 0.0) {
    writer.writeDouble(
      5,
      f
    );
  }
};


/**
 * optional double overall_score = 1;
 * @return {number}
 */
proto.treum.risk.FraudDetectionResponse.prototype.getOverallScore = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 1, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.FraudDetectionResponse} returns this
 */
proto.treum.risk.FraudDetectionResponse.prototype.setOverallScore = function(value) {
  return jspb.Message.setProto3FloatField(this, 1, value);
};


/**
 * optional FraudCategories categories = 2;
 * @return {?proto.treum.risk.FraudCategories}
 */
proto.treum.risk.FraudDetectionResponse.prototype.getCategories = function() {
  return /** @type{?proto.treum.risk.FraudCategories} */ (
    jspb.Message.getWrapperField(this, proto.treum.risk.FraudCategories, 2));
};


/**
 * @param {?proto.treum.risk.FraudCategories|undefined} value
 * @return {!proto.treum.risk.FraudDetectionResponse} returns this
*/
proto.treum.risk.FraudDetectionResponse.prototype.setCategories = function(value) {
  return jspb.Message.setWrapperField(this, 2, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.treum.risk.FraudDetectionResponse} returns this
 */
proto.treum.risk.FraudDetectionResponse.prototype.clearCategories = function() {
  return this.setCategories(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.treum.risk.FraudDetectionResponse.prototype.hasCategories = function() {
  return jspb.Message.getField(this, 2) != null;
};


/**
 * repeated FraudRiskFactor risk_factors = 3;
 * @return {!Array<!proto.treum.risk.FraudRiskFactor>}
 */
proto.treum.risk.FraudDetectionResponse.prototype.getRiskFactorsList = function() {
  return /** @type{!Array<!proto.treum.risk.FraudRiskFactor>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.treum.risk.FraudRiskFactor, 3));
};


/**
 * @param {!Array<!proto.treum.risk.FraudRiskFactor>} value
 * @return {!proto.treum.risk.FraudDetectionResponse} returns this
*/
proto.treum.risk.FraudDetectionResponse.prototype.setRiskFactorsList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 3, value);
};


/**
 * @param {!proto.treum.risk.FraudRiskFactor=} opt_value
 * @param {number=} opt_index
 * @return {!proto.treum.risk.FraudRiskFactor}
 */
proto.treum.risk.FraudDetectionResponse.prototype.addRiskFactors = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 3, opt_value, proto.treum.risk.FraudRiskFactor, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.treum.risk.FraudDetectionResponse} returns this
 */
proto.treum.risk.FraudDetectionResponse.prototype.clearRiskFactorsList = function() {
  return this.setRiskFactorsList([]);
};


/**
 * optional FraudRecommendation recommendation = 4;
 * @return {!proto.treum.risk.FraudRecommendation}
 */
proto.treum.risk.FraudDetectionResponse.prototype.getRecommendation = function() {
  return /** @type {!proto.treum.risk.FraudRecommendation} */ (jspb.Message.getFieldWithDefault(this, 4, 0));
};


/**
 * @param {!proto.treum.risk.FraudRecommendation} value
 * @return {!proto.treum.risk.FraudDetectionResponse} returns this
 */
proto.treum.risk.FraudDetectionResponse.prototype.setRecommendation = function(value) {
  return jspb.Message.setProto3EnumField(this, 4, value);
};


/**
 * optional double confidence = 5;
 * @return {number}
 */
proto.treum.risk.FraudDetectionResponse.prototype.getConfidence = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 5, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.FraudDetectionResponse} returns this
 */
proto.treum.risk.FraudDetectionResponse.prototype.setConfidence = function(value) {
  return jspb.Message.setProto3FloatField(this, 5, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.treum.risk.FraudCategories.prototype.toObject = function(opt_includeInstance) {
  return proto.treum.risk.FraudCategories.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.treum.risk.FraudCategories} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.FraudCategories.toObject = function(includeInstance, msg) {
  var f, obj = {
    location: jspb.Message.getFloatingPointFieldWithDefault(msg, 1, 0.0),
    device: jspb.Message.getFloatingPointFieldWithDefault(msg, 2, 0.0),
    behavioral: jspb.Message.getFloatingPointFieldWithDefault(msg, 3, 0.0),
    transaction: jspb.Message.getFloatingPointFieldWithDefault(msg, 4, 0.0),
    temporal: jspb.Message.getFloatingPointFieldWithDefault(msg, 5, 0.0)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.treum.risk.FraudCategories}
 */
proto.treum.risk.FraudCategories.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.treum.risk.FraudCategories;
  return proto.treum.risk.FraudCategories.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.treum.risk.FraudCategories} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.treum.risk.FraudCategories}
 */
proto.treum.risk.FraudCategories.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setLocation(value);
      break;
    case 2:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setDevice(value);
      break;
    case 3:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setBehavioral(value);
      break;
    case 4:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setTransaction(value);
      break;
    case 5:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setTemporal(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.treum.risk.FraudCategories.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.treum.risk.FraudCategories.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.treum.risk.FraudCategories} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.FraudCategories.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getLocation();
  if (f !== 0.0) {
    writer.writeDouble(
      1,
      f
    );
  }
  f = message.getDevice();
  if (f !== 0.0) {
    writer.writeDouble(
      2,
      f
    );
  }
  f = message.getBehavioral();
  if (f !== 0.0) {
    writer.writeDouble(
      3,
      f
    );
  }
  f = message.getTransaction();
  if (f !== 0.0) {
    writer.writeDouble(
      4,
      f
    );
  }
  f = message.getTemporal();
  if (f !== 0.0) {
    writer.writeDouble(
      5,
      f
    );
  }
};


/**
 * optional double location = 1;
 * @return {number}
 */
proto.treum.risk.FraudCategories.prototype.getLocation = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 1, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.FraudCategories} returns this
 */
proto.treum.risk.FraudCategories.prototype.setLocation = function(value) {
  return jspb.Message.setProto3FloatField(this, 1, value);
};


/**
 * optional double device = 2;
 * @return {number}
 */
proto.treum.risk.FraudCategories.prototype.getDevice = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 2, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.FraudCategories} returns this
 */
proto.treum.risk.FraudCategories.prototype.setDevice = function(value) {
  return jspb.Message.setProto3FloatField(this, 2, value);
};


/**
 * optional double behavioral = 3;
 * @return {number}
 */
proto.treum.risk.FraudCategories.prototype.getBehavioral = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 3, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.FraudCategories} returns this
 */
proto.treum.risk.FraudCategories.prototype.setBehavioral = function(value) {
  return jspb.Message.setProto3FloatField(this, 3, value);
};


/**
 * optional double transaction = 4;
 * @return {number}
 */
proto.treum.risk.FraudCategories.prototype.getTransaction = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 4, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.FraudCategories} returns this
 */
proto.treum.risk.FraudCategories.prototype.setTransaction = function(value) {
  return jspb.Message.setProto3FloatField(this, 4, value);
};


/**
 * optional double temporal = 5;
 * @return {number}
 */
proto.treum.risk.FraudCategories.prototype.getTemporal = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 5, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.FraudCategories} returns this
 */
proto.treum.risk.FraudCategories.prototype.setTemporal = function(value) {
  return jspb.Message.setProto3FloatField(this, 5, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.treum.risk.FraudRiskFactor.prototype.toObject = function(opt_includeInstance) {
  return proto.treum.risk.FraudRiskFactor.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.treum.risk.FraudRiskFactor} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.FraudRiskFactor.toObject = function(includeInstance, msg) {
  var f, obj = {
    category: jspb.Message.getFieldWithDefault(msg, 1, ""),
    factor: jspb.Message.getFieldWithDefault(msg, 2, ""),
    score: jspb.Message.getFloatingPointFieldWithDefault(msg, 3, 0.0),
    weight: jspb.Message.getFloatingPointFieldWithDefault(msg, 4, 0.0),
    description: jspb.Message.getFieldWithDefault(msg, 5, ""),
    severity: jspb.Message.getFieldWithDefault(msg, 6, 0)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.treum.risk.FraudRiskFactor}
 */
proto.treum.risk.FraudRiskFactor.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.treum.risk.FraudRiskFactor;
  return proto.treum.risk.FraudRiskFactor.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.treum.risk.FraudRiskFactor} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.treum.risk.FraudRiskFactor}
 */
proto.treum.risk.FraudRiskFactor.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setCategory(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setFactor(value);
      break;
    case 3:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setScore(value);
      break;
    case 4:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setWeight(value);
      break;
    case 5:
      var value = /** @type {string} */ (reader.readString());
      msg.setDescription(value);
      break;
    case 6:
      var value = /** @type {!proto.treum.risk.FraudSeverity} */ (reader.readEnum());
      msg.setSeverity(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.treum.risk.FraudRiskFactor.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.treum.risk.FraudRiskFactor.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.treum.risk.FraudRiskFactor} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.FraudRiskFactor.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getCategory();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getFactor();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
  f = message.getScore();
  if (f !== 0.0) {
    writer.writeDouble(
      3,
      f
    );
  }
  f = message.getWeight();
  if (f !== 0.0) {
    writer.writeDouble(
      4,
      f
    );
  }
  f = message.getDescription();
  if (f.length > 0) {
    writer.writeString(
      5,
      f
    );
  }
  f = message.getSeverity();
  if (f !== 0.0) {
    writer.writeEnum(
      6,
      f
    );
  }
};


/**
 * optional string category = 1;
 * @return {string}
 */
proto.treum.risk.FraudRiskFactor.prototype.getCategory = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.FraudRiskFactor} returns this
 */
proto.treum.risk.FraudRiskFactor.prototype.setCategory = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional string factor = 2;
 * @return {string}
 */
proto.treum.risk.FraudRiskFactor.prototype.getFactor = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.FraudRiskFactor} returns this
 */
proto.treum.risk.FraudRiskFactor.prototype.setFactor = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};


/**
 * optional double score = 3;
 * @return {number}
 */
proto.treum.risk.FraudRiskFactor.prototype.getScore = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 3, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.FraudRiskFactor} returns this
 */
proto.treum.risk.FraudRiskFactor.prototype.setScore = function(value) {
  return jspb.Message.setProto3FloatField(this, 3, value);
};


/**
 * optional double weight = 4;
 * @return {number}
 */
proto.treum.risk.FraudRiskFactor.prototype.getWeight = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 4, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.FraudRiskFactor} returns this
 */
proto.treum.risk.FraudRiskFactor.prototype.setWeight = function(value) {
  return jspb.Message.setProto3FloatField(this, 4, value);
};


/**
 * optional string description = 5;
 * @return {string}
 */
proto.treum.risk.FraudRiskFactor.prototype.getDescription = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 5, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.FraudRiskFactor} returns this
 */
proto.treum.risk.FraudRiskFactor.prototype.setDescription = function(value) {
  return jspb.Message.setProto3StringField(this, 5, value);
};


/**
 * optional FraudSeverity severity = 6;
 * @return {!proto.treum.risk.FraudSeverity}
 */
proto.treum.risk.FraudRiskFactor.prototype.getSeverity = function() {
  return /** @type {!proto.treum.risk.FraudSeverity} */ (jspb.Message.getFieldWithDefault(this, 6, 0));
};


/**
 * @param {!proto.treum.risk.FraudSeverity} value
 * @return {!proto.treum.risk.FraudRiskFactor} returns this
 */
proto.treum.risk.FraudRiskFactor.prototype.setSeverity = function(value) {
  return jspb.Message.setProto3EnumField(this, 6, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.treum.risk.GetFraudScoreRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.treum.risk.GetFraudScoreRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.treum.risk.GetFraudScoreRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.GetFraudScoreRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    userId: jspb.Message.getFieldWithDefault(msg, 1, ""),
    days: jspb.Message.getFieldWithDefault(msg, 2, 0)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.treum.risk.GetFraudScoreRequest}
 */
proto.treum.risk.GetFraudScoreRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.treum.risk.GetFraudScoreRequest;
  return proto.treum.risk.GetFraudScoreRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.treum.risk.GetFraudScoreRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.treum.risk.GetFraudScoreRequest}
 */
proto.treum.risk.GetFraudScoreRequest.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setUserId(value);
      break;
    case 2:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setDays(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.treum.risk.GetFraudScoreRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.treum.risk.GetFraudScoreRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.treum.risk.GetFraudScoreRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.GetFraudScoreRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getUserId();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getDays();
  if (f !== 0) {
    writer.writeInt32(
      2,
      f
    );
  }
};


/**
 * optional string user_id = 1;
 * @return {string}
 */
proto.treum.risk.GetFraudScoreRequest.prototype.getUserId = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.GetFraudScoreRequest} returns this
 */
proto.treum.risk.GetFraudScoreRequest.prototype.setUserId = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional int32 days = 2;
 * @return {number}
 */
proto.treum.risk.GetFraudScoreRequest.prototype.getDays = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.GetFraudScoreRequest} returns this
 */
proto.treum.risk.GetFraudScoreRequest.prototype.setDays = function(value) {
  return jspb.Message.setProto3IntField(this, 2, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.treum.risk.FraudScoreResponse.prototype.toObject = function(opt_includeInstance) {
  return proto.treum.risk.FraudScoreResponse.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.treum.risk.FraudScoreResponse} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.FraudScoreResponse.toObject = function(includeInstance, msg) {
  var f, obj = {
    userId: jspb.Message.getFieldWithDefault(msg, 1, ""),
    currentRiskScore: jspb.Message.getFloatingPointFieldWithDefault(msg, 2, 0.0),
    riskTrend: jspb.Message.getFieldWithDefault(msg, 3, 0),
    lastFraudCheck: (f = msg.getLastFraudCheck()) && google_protobuf_timestamp_pb.Timestamp.toObject(includeInstance, f),
    trustedDevices: jspb.Message.getFieldWithDefault(msg, 5, 0),
    typicalLocations: jspb.Message.getFieldWithDefault(msg, 6, 0)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.treum.risk.FraudScoreResponse}
 */
proto.treum.risk.FraudScoreResponse.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.treum.risk.FraudScoreResponse;
  return proto.treum.risk.FraudScoreResponse.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.treum.risk.FraudScoreResponse} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.treum.risk.FraudScoreResponse}
 */
proto.treum.risk.FraudScoreResponse.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setUserId(value);
      break;
    case 2:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setCurrentRiskScore(value);
      break;
    case 3:
      var value = /** @type {!proto.treum.risk.FraudTrend} */ (reader.readEnum());
      msg.setRiskTrend(value);
      break;
    case 4:
      var value = new google_protobuf_timestamp_pb.Timestamp;
      reader.readMessage(value,google_protobuf_timestamp_pb.Timestamp.deserializeBinaryFromReader);
      msg.setLastFraudCheck(value);
      break;
    case 5:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setTrustedDevices(value);
      break;
    case 6:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setTypicalLocations(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.treum.risk.FraudScoreResponse.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.treum.risk.FraudScoreResponse.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.treum.risk.FraudScoreResponse} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.FraudScoreResponse.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getUserId();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getCurrentRiskScore();
  if (f !== 0.0) {
    writer.writeDouble(
      2,
      f
    );
  }
  f = message.getRiskTrend();
  if (f !== 0.0) {
    writer.writeEnum(
      3,
      f
    );
  }
  f = message.getLastFraudCheck();
  if (f != null) {
    writer.writeMessage(
      4,
      f,
      google_protobuf_timestamp_pb.Timestamp.serializeBinaryToWriter
    );
  }
  f = message.getTrustedDevices();
  if (f !== 0) {
    writer.writeInt32(
      5,
      f
    );
  }
  f = message.getTypicalLocations();
  if (f !== 0) {
    writer.writeInt32(
      6,
      f
    );
  }
};


/**
 * optional string user_id = 1;
 * @return {string}
 */
proto.treum.risk.FraudScoreResponse.prototype.getUserId = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.FraudScoreResponse} returns this
 */
proto.treum.risk.FraudScoreResponse.prototype.setUserId = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional double current_risk_score = 2;
 * @return {number}
 */
proto.treum.risk.FraudScoreResponse.prototype.getCurrentRiskScore = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 2, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.FraudScoreResponse} returns this
 */
proto.treum.risk.FraudScoreResponse.prototype.setCurrentRiskScore = function(value) {
  return jspb.Message.setProto3FloatField(this, 2, value);
};


/**
 * optional FraudTrend risk_trend = 3;
 * @return {!proto.treum.risk.FraudTrend}
 */
proto.treum.risk.FraudScoreResponse.prototype.getRiskTrend = function() {
  return /** @type {!proto.treum.risk.FraudTrend} */ (jspb.Message.getFieldWithDefault(this, 3, 0));
};


/**
 * @param {!proto.treum.risk.FraudTrend} value
 * @return {!proto.treum.risk.FraudScoreResponse} returns this
 */
proto.treum.risk.FraudScoreResponse.prototype.setRiskTrend = function(value) {
  return jspb.Message.setProto3EnumField(this, 3, value);
};


/**
 * optional google.protobuf.Timestamp last_fraud_check = 4;
 * @return {?proto.google.protobuf.Timestamp}
 */
proto.treum.risk.FraudScoreResponse.prototype.getLastFraudCheck = function() {
  return /** @type{?proto.google.protobuf.Timestamp} */ (
    jspb.Message.getWrapperField(this, google_protobuf_timestamp_pb.Timestamp, 4));
};


/**
 * @param {?proto.google.protobuf.Timestamp|undefined} value
 * @return {!proto.treum.risk.FraudScoreResponse} returns this
*/
proto.treum.risk.FraudScoreResponse.prototype.setLastFraudCheck = function(value) {
  return jspb.Message.setWrapperField(this, 4, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.treum.risk.FraudScoreResponse} returns this
 */
proto.treum.risk.FraudScoreResponse.prototype.clearLastFraudCheck = function() {
  return this.setLastFraudCheck(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.treum.risk.FraudScoreResponse.prototype.hasLastFraudCheck = function() {
  return jspb.Message.getField(this, 4) != null;
};


/**
 * optional int32 trusted_devices = 5;
 * @return {number}
 */
proto.treum.risk.FraudScoreResponse.prototype.getTrustedDevices = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 5, 0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.FraudScoreResponse} returns this
 */
proto.treum.risk.FraudScoreResponse.prototype.setTrustedDevices = function(value) {
  return jspb.Message.setProto3IntField(this, 5, value);
};


/**
 * optional int32 typical_locations = 6;
 * @return {number}
 */
proto.treum.risk.FraudScoreResponse.prototype.getTypicalLocations = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 6, 0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.FraudScoreResponse} returns this
 */
proto.treum.risk.FraudScoreResponse.prototype.setTypicalLocations = function(value) {
  return jspb.Message.setProto3IntField(this, 6, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.treum.risk.GetRiskMetricsRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.treum.risk.GetRiskMetricsRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.treum.risk.GetRiskMetricsRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.GetRiskMetricsRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    userId: jspb.Message.getFieldWithDefault(msg, 1, ""),
    accountId: jspb.Message.getFieldWithDefault(msg, 2, ""),
    portfolioId: jspb.Message.getFieldWithDefault(msg, 3, ""),
    positionId: jspb.Message.getFieldWithDefault(msg, 4, ""),
    metricType: jspb.Message.getFieldWithDefault(msg, 5, 0),
    scope: jspb.Message.getFieldWithDefault(msg, 6, 0),
    fromDate: (f = msg.getFromDate()) && google_protobuf_timestamp_pb.Timestamp.toObject(includeInstance, f),
    toDate: (f = msg.getToDate()) && google_protobuf_timestamp_pb.Timestamp.toObject(includeInstance, f)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.treum.risk.GetRiskMetricsRequest}
 */
proto.treum.risk.GetRiskMetricsRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.treum.risk.GetRiskMetricsRequest;
  return proto.treum.risk.GetRiskMetricsRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.treum.risk.GetRiskMetricsRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.treum.risk.GetRiskMetricsRequest}
 */
proto.treum.risk.GetRiskMetricsRequest.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setUserId(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setAccountId(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readString());
      msg.setPortfolioId(value);
      break;
    case 4:
      var value = /** @type {string} */ (reader.readString());
      msg.setPositionId(value);
      break;
    case 5:
      var value = /** @type {!proto.treum.risk.MetricType} */ (reader.readEnum());
      msg.setMetricType(value);
      break;
    case 6:
      var value = /** @type {!proto.treum.risk.MetricScope} */ (reader.readEnum());
      msg.setScope(value);
      break;
    case 7:
      var value = new google_protobuf_timestamp_pb.Timestamp;
      reader.readMessage(value,google_protobuf_timestamp_pb.Timestamp.deserializeBinaryFromReader);
      msg.setFromDate(value);
      break;
    case 8:
      var value = new google_protobuf_timestamp_pb.Timestamp;
      reader.readMessage(value,google_protobuf_timestamp_pb.Timestamp.deserializeBinaryFromReader);
      msg.setToDate(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.treum.risk.GetRiskMetricsRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.treum.risk.GetRiskMetricsRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.treum.risk.GetRiskMetricsRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.GetRiskMetricsRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getUserId();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getAccountId();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
  f = message.getPortfolioId();
  if (f.length > 0) {
    writer.writeString(
      3,
      f
    );
  }
  f = message.getPositionId();
  if (f.length > 0) {
    writer.writeString(
      4,
      f
    );
  }
  f = message.getMetricType();
  if (f !== 0.0) {
    writer.writeEnum(
      5,
      f
    );
  }
  f = message.getScope();
  if (f !== 0.0) {
    writer.writeEnum(
      6,
      f
    );
  }
  f = message.getFromDate();
  if (f != null) {
    writer.writeMessage(
      7,
      f,
      google_protobuf_timestamp_pb.Timestamp.serializeBinaryToWriter
    );
  }
  f = message.getToDate();
  if (f != null) {
    writer.writeMessage(
      8,
      f,
      google_protobuf_timestamp_pb.Timestamp.serializeBinaryToWriter
    );
  }
};


/**
 * optional string user_id = 1;
 * @return {string}
 */
proto.treum.risk.GetRiskMetricsRequest.prototype.getUserId = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.GetRiskMetricsRequest} returns this
 */
proto.treum.risk.GetRiskMetricsRequest.prototype.setUserId = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional string account_id = 2;
 * @return {string}
 */
proto.treum.risk.GetRiskMetricsRequest.prototype.getAccountId = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.GetRiskMetricsRequest} returns this
 */
proto.treum.risk.GetRiskMetricsRequest.prototype.setAccountId = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};


/**
 * optional string portfolio_id = 3;
 * @return {string}
 */
proto.treum.risk.GetRiskMetricsRequest.prototype.getPortfolioId = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.GetRiskMetricsRequest} returns this
 */
proto.treum.risk.GetRiskMetricsRequest.prototype.setPortfolioId = function(value) {
  return jspb.Message.setProto3StringField(this, 3, value);
};


/**
 * optional string position_id = 4;
 * @return {string}
 */
proto.treum.risk.GetRiskMetricsRequest.prototype.getPositionId = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 4, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.GetRiskMetricsRequest} returns this
 */
proto.treum.risk.GetRiskMetricsRequest.prototype.setPositionId = function(value) {
  return jspb.Message.setProto3StringField(this, 4, value);
};


/**
 * optional MetricType metric_type = 5;
 * @return {!proto.treum.risk.MetricType}
 */
proto.treum.risk.GetRiskMetricsRequest.prototype.getMetricType = function() {
  return /** @type {!proto.treum.risk.MetricType} */ (jspb.Message.getFieldWithDefault(this, 5, 0));
};


/**
 * @param {!proto.treum.risk.MetricType} value
 * @return {!proto.treum.risk.GetRiskMetricsRequest} returns this
 */
proto.treum.risk.GetRiskMetricsRequest.prototype.setMetricType = function(value) {
  return jspb.Message.setProto3EnumField(this, 5, value);
};


/**
 * optional MetricScope scope = 6;
 * @return {!proto.treum.risk.MetricScope}
 */
proto.treum.risk.GetRiskMetricsRequest.prototype.getScope = function() {
  return /** @type {!proto.treum.risk.MetricScope} */ (jspb.Message.getFieldWithDefault(this, 6, 0));
};


/**
 * @param {!proto.treum.risk.MetricScope} value
 * @return {!proto.treum.risk.GetRiskMetricsRequest} returns this
 */
proto.treum.risk.GetRiskMetricsRequest.prototype.setScope = function(value) {
  return jspb.Message.setProto3EnumField(this, 6, value);
};


/**
 * optional google.protobuf.Timestamp from_date = 7;
 * @return {?proto.google.protobuf.Timestamp}
 */
proto.treum.risk.GetRiskMetricsRequest.prototype.getFromDate = function() {
  return /** @type{?proto.google.protobuf.Timestamp} */ (
    jspb.Message.getWrapperField(this, google_protobuf_timestamp_pb.Timestamp, 7));
};


/**
 * @param {?proto.google.protobuf.Timestamp|undefined} value
 * @return {!proto.treum.risk.GetRiskMetricsRequest} returns this
*/
proto.treum.risk.GetRiskMetricsRequest.prototype.setFromDate = function(value) {
  return jspb.Message.setWrapperField(this, 7, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.treum.risk.GetRiskMetricsRequest} returns this
 */
proto.treum.risk.GetRiskMetricsRequest.prototype.clearFromDate = function() {
  return this.setFromDate(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.treum.risk.GetRiskMetricsRequest.prototype.hasFromDate = function() {
  return jspb.Message.getField(this, 7) != null;
};


/**
 * optional google.protobuf.Timestamp to_date = 8;
 * @return {?proto.google.protobuf.Timestamp}
 */
proto.treum.risk.GetRiskMetricsRequest.prototype.getToDate = function() {
  return /** @type{?proto.google.protobuf.Timestamp} */ (
    jspb.Message.getWrapperField(this, google_protobuf_timestamp_pb.Timestamp, 8));
};


/**
 * @param {?proto.google.protobuf.Timestamp|undefined} value
 * @return {!proto.treum.risk.GetRiskMetricsRequest} returns this
*/
proto.treum.risk.GetRiskMetricsRequest.prototype.setToDate = function(value) {
  return jspb.Message.setWrapperField(this, 8, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.treum.risk.GetRiskMetricsRequest} returns this
 */
proto.treum.risk.GetRiskMetricsRequest.prototype.clearToDate = function() {
  return this.setToDate(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.treum.risk.GetRiskMetricsRequest.prototype.hasToDate = function() {
  return jspb.Message.getField(this, 8) != null;
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.treum.risk.RiskMetricsResponse.repeatedFields_ = [21];



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.treum.risk.RiskMetricsResponse.prototype.toObject = function(opt_includeInstance) {
  return proto.treum.risk.RiskMetricsResponse.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.treum.risk.RiskMetricsResponse} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.RiskMetricsResponse.toObject = function(includeInstance, msg) {
  var f, obj = {
    id: jspb.Message.getFieldWithDefault(msg, 1, ""),
    userId: jspb.Message.getFieldWithDefault(msg, 2, ""),
    accountId: jspb.Message.getFieldWithDefault(msg, 3, ""),
    portfolioId: jspb.Message.getFieldWithDefault(msg, 4, ""),
    positionId: jspb.Message.getFieldWithDefault(msg, 5, ""),
    metricType: jspb.Message.getFieldWithDefault(msg, 6, 0),
    scope: jspb.Message.getFieldWithDefault(msg, 7, 0),
    frequency: jspb.Message.getFieldWithDefault(msg, 8, 0),
    metricValue: jspb.Message.getFloatingPointFieldWithDefault(msg, 9, 0.0),
    timestamp: (f = msg.getTimestamp()) && google_protobuf_timestamp_pb.Timestamp.toObject(includeInstance, f),
    confidenceLevel: jspb.Message.getFloatingPointFieldWithDefault(msg, 11, 0.0),
    timeHorizon: jspb.Message.getFieldWithDefault(msg, 12, 0),
    lookbackPeriod: jspb.Message.getFieldWithDefault(msg, 13, 0),
    metricDetails: jspb.Message.getFieldWithDefault(msg, 14, ""),
    trendData: jspb.Message.getFieldWithDefault(msg, 15, ""),
    riskAttribution: jspb.Message.getFieldWithDefault(msg, 16, ""),
    stressTestResults: jspb.Message.getFieldWithDefault(msg, 17, ""),
    modelParameters: jspb.Message.getFieldWithDefault(msg, 18, ""),
    dataQuality: jspb.Message.getFieldWithDefault(msg, 19, ""),
    benchmarks: jspb.Message.getFieldWithDefault(msg, 20, ""),
    associatedLimitsList: (f = jspb.Message.getRepeatedField(msg, 21)) == null ? undefined : f,
    warnings: jspb.Message.getFieldWithDefault(msg, 22, ""),
    performanceMetrics: jspb.Message.getFieldWithDefault(msg, 23, ""),
    nextCalculationAt: (f = msg.getNextCalculationAt()) && google_protobuf_timestamp_pb.Timestamp.toObject(includeInstance, f),
    isStale: jspb.Message.getBooleanFieldWithDefault(msg, 25, false),
    staleThresholdMinutes: jspb.Message.getFieldWithDefault(msg, 26, 0),
    metadata: jspb.Message.getFieldWithDefault(msg, 27, ""),
    createdAt: (f = msg.getCreatedAt()) && google_protobuf_timestamp_pb.Timestamp.toObject(includeInstance, f),
    updatedAt: (f = msg.getUpdatedAt()) && google_protobuf_timestamp_pb.Timestamp.toObject(includeInstance, f)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.treum.risk.RiskMetricsResponse}
 */
proto.treum.risk.RiskMetricsResponse.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.treum.risk.RiskMetricsResponse;
  return proto.treum.risk.RiskMetricsResponse.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.treum.risk.RiskMetricsResponse} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.treum.risk.RiskMetricsResponse}
 */
proto.treum.risk.RiskMetricsResponse.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setId(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setUserId(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readString());
      msg.setAccountId(value);
      break;
    case 4:
      var value = /** @type {string} */ (reader.readString());
      msg.setPortfolioId(value);
      break;
    case 5:
      var value = /** @type {string} */ (reader.readString());
      msg.setPositionId(value);
      break;
    case 6:
      var value = /** @type {!proto.treum.risk.MetricType} */ (reader.readEnum());
      msg.setMetricType(value);
      break;
    case 7:
      var value = /** @type {!proto.treum.risk.MetricScope} */ (reader.readEnum());
      msg.setScope(value);
      break;
    case 8:
      var value = /** @type {!proto.treum.risk.MetricFrequency} */ (reader.readEnum());
      msg.setFrequency(value);
      break;
    case 9:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setMetricValue(value);
      break;
    case 10:
      var value = new google_protobuf_timestamp_pb.Timestamp;
      reader.readMessage(value,google_protobuf_timestamp_pb.Timestamp.deserializeBinaryFromReader);
      msg.setTimestamp(value);
      break;
    case 11:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setConfidenceLevel(value);
      break;
    case 12:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setTimeHorizon(value);
      break;
    case 13:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setLookbackPeriod(value);
      break;
    case 14:
      var value = /** @type {string} */ (reader.readString());
      msg.setMetricDetails(value);
      break;
    case 15:
      var value = /** @type {string} */ (reader.readString());
      msg.setTrendData(value);
      break;
    case 16:
      var value = /** @type {string} */ (reader.readString());
      msg.setRiskAttribution(value);
      break;
    case 17:
      var value = /** @type {string} */ (reader.readString());
      msg.setStressTestResults(value);
      break;
    case 18:
      var value = /** @type {string} */ (reader.readString());
      msg.setModelParameters(value);
      break;
    case 19:
      var value = /** @type {string} */ (reader.readString());
      msg.setDataQuality(value);
      break;
    case 20:
      var value = /** @type {string} */ (reader.readString());
      msg.setBenchmarks(value);
      break;
    case 21:
      var value = /** @type {string} */ (reader.readString());
      msg.addAssociatedLimits(value);
      break;
    case 22:
      var value = /** @type {string} */ (reader.readString());
      msg.setWarnings(value);
      break;
    case 23:
      var value = /** @type {string} */ (reader.readString());
      msg.setPerformanceMetrics(value);
      break;
    case 24:
      var value = new google_protobuf_timestamp_pb.Timestamp;
      reader.readMessage(value,google_protobuf_timestamp_pb.Timestamp.deserializeBinaryFromReader);
      msg.setNextCalculationAt(value);
      break;
    case 25:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setIsStale(value);
      break;
    case 26:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setStaleThresholdMinutes(value);
      break;
    case 27:
      var value = /** @type {string} */ (reader.readString());
      msg.setMetadata(value);
      break;
    case 28:
      var value = new google_protobuf_timestamp_pb.Timestamp;
      reader.readMessage(value,google_protobuf_timestamp_pb.Timestamp.deserializeBinaryFromReader);
      msg.setCreatedAt(value);
      break;
    case 29:
      var value = new google_protobuf_timestamp_pb.Timestamp;
      reader.readMessage(value,google_protobuf_timestamp_pb.Timestamp.deserializeBinaryFromReader);
      msg.setUpdatedAt(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.treum.risk.RiskMetricsResponse.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.treum.risk.RiskMetricsResponse.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.treum.risk.RiskMetricsResponse} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.RiskMetricsResponse.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getId();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getUserId();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
  f = message.getAccountId();
  if (f.length > 0) {
    writer.writeString(
      3,
      f
    );
  }
  f = message.getPortfolioId();
  if (f.length > 0) {
    writer.writeString(
      4,
      f
    );
  }
  f = message.getPositionId();
  if (f.length > 0) {
    writer.writeString(
      5,
      f
    );
  }
  f = message.getMetricType();
  if (f !== 0.0) {
    writer.writeEnum(
      6,
      f
    );
  }
  f = message.getScope();
  if (f !== 0.0) {
    writer.writeEnum(
      7,
      f
    );
  }
  f = message.getFrequency();
  if (f !== 0.0) {
    writer.writeEnum(
      8,
      f
    );
  }
  f = message.getMetricValue();
  if (f !== 0.0) {
    writer.writeDouble(
      9,
      f
    );
  }
  f = message.getTimestamp();
  if (f != null) {
    writer.writeMessage(
      10,
      f,
      google_protobuf_timestamp_pb.Timestamp.serializeBinaryToWriter
    );
  }
  f = message.getConfidenceLevel();
  if (f !== 0.0) {
    writer.writeDouble(
      11,
      f
    );
  }
  f = message.getTimeHorizon();
  if (f !== 0) {
    writer.writeInt32(
      12,
      f
    );
  }
  f = message.getLookbackPeriod();
  if (f !== 0) {
    writer.writeInt32(
      13,
      f
    );
  }
  f = message.getMetricDetails();
  if (f.length > 0) {
    writer.writeString(
      14,
      f
    );
  }
  f = message.getTrendData();
  if (f.length > 0) {
    writer.writeString(
      15,
      f
    );
  }
  f = message.getRiskAttribution();
  if (f.length > 0) {
    writer.writeString(
      16,
      f
    );
  }
  f = message.getStressTestResults();
  if (f.length > 0) {
    writer.writeString(
      17,
      f
    );
  }
  f = message.getModelParameters();
  if (f.length > 0) {
    writer.writeString(
      18,
      f
    );
  }
  f = message.getDataQuality();
  if (f.length > 0) {
    writer.writeString(
      19,
      f
    );
  }
  f = message.getBenchmarks();
  if (f.length > 0) {
    writer.writeString(
      20,
      f
    );
  }
  f = message.getAssociatedLimitsList();
  if (f.length > 0) {
    writer.writeRepeatedString(
      21,
      f
    );
  }
  f = message.getWarnings();
  if (f.length > 0) {
    writer.writeString(
      22,
      f
    );
  }
  f = message.getPerformanceMetrics();
  if (f.length > 0) {
    writer.writeString(
      23,
      f
    );
  }
  f = message.getNextCalculationAt();
  if (f != null) {
    writer.writeMessage(
      24,
      f,
      google_protobuf_timestamp_pb.Timestamp.serializeBinaryToWriter
    );
  }
  f = message.getIsStale();
  if (f) {
    writer.writeBool(
      25,
      f
    );
  }
  f = message.getStaleThresholdMinutes();
  if (f !== 0) {
    writer.writeInt32(
      26,
      f
    );
  }
  f = message.getMetadata();
  if (f.length > 0) {
    writer.writeString(
      27,
      f
    );
  }
  f = message.getCreatedAt();
  if (f != null) {
    writer.writeMessage(
      28,
      f,
      google_protobuf_timestamp_pb.Timestamp.serializeBinaryToWriter
    );
  }
  f = message.getUpdatedAt();
  if (f != null) {
    writer.writeMessage(
      29,
      f,
      google_protobuf_timestamp_pb.Timestamp.serializeBinaryToWriter
    );
  }
};


/**
 * optional string id = 1;
 * @return {string}
 */
proto.treum.risk.RiskMetricsResponse.prototype.getId = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.RiskMetricsResponse} returns this
 */
proto.treum.risk.RiskMetricsResponse.prototype.setId = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional string user_id = 2;
 * @return {string}
 */
proto.treum.risk.RiskMetricsResponse.prototype.getUserId = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.RiskMetricsResponse} returns this
 */
proto.treum.risk.RiskMetricsResponse.prototype.setUserId = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};


/**
 * optional string account_id = 3;
 * @return {string}
 */
proto.treum.risk.RiskMetricsResponse.prototype.getAccountId = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.RiskMetricsResponse} returns this
 */
proto.treum.risk.RiskMetricsResponse.prototype.setAccountId = function(value) {
  return jspb.Message.setProto3StringField(this, 3, value);
};


/**
 * optional string portfolio_id = 4;
 * @return {string}
 */
proto.treum.risk.RiskMetricsResponse.prototype.getPortfolioId = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 4, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.RiskMetricsResponse} returns this
 */
proto.treum.risk.RiskMetricsResponse.prototype.setPortfolioId = function(value) {
  return jspb.Message.setProto3StringField(this, 4, value);
};


/**
 * optional string position_id = 5;
 * @return {string}
 */
proto.treum.risk.RiskMetricsResponse.prototype.getPositionId = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 5, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.RiskMetricsResponse} returns this
 */
proto.treum.risk.RiskMetricsResponse.prototype.setPositionId = function(value) {
  return jspb.Message.setProto3StringField(this, 5, value);
};


/**
 * optional MetricType metric_type = 6;
 * @return {!proto.treum.risk.MetricType}
 */
proto.treum.risk.RiskMetricsResponse.prototype.getMetricType = function() {
  return /** @type {!proto.treum.risk.MetricType} */ (jspb.Message.getFieldWithDefault(this, 6, 0));
};


/**
 * @param {!proto.treum.risk.MetricType} value
 * @return {!proto.treum.risk.RiskMetricsResponse} returns this
 */
proto.treum.risk.RiskMetricsResponse.prototype.setMetricType = function(value) {
  return jspb.Message.setProto3EnumField(this, 6, value);
};


/**
 * optional MetricScope scope = 7;
 * @return {!proto.treum.risk.MetricScope}
 */
proto.treum.risk.RiskMetricsResponse.prototype.getScope = function() {
  return /** @type {!proto.treum.risk.MetricScope} */ (jspb.Message.getFieldWithDefault(this, 7, 0));
};


/**
 * @param {!proto.treum.risk.MetricScope} value
 * @return {!proto.treum.risk.RiskMetricsResponse} returns this
 */
proto.treum.risk.RiskMetricsResponse.prototype.setScope = function(value) {
  return jspb.Message.setProto3EnumField(this, 7, value);
};


/**
 * optional MetricFrequency frequency = 8;
 * @return {!proto.treum.risk.MetricFrequency}
 */
proto.treum.risk.RiskMetricsResponse.prototype.getFrequency = function() {
  return /** @type {!proto.treum.risk.MetricFrequency} */ (jspb.Message.getFieldWithDefault(this, 8, 0));
};


/**
 * @param {!proto.treum.risk.MetricFrequency} value
 * @return {!proto.treum.risk.RiskMetricsResponse} returns this
 */
proto.treum.risk.RiskMetricsResponse.prototype.setFrequency = function(value) {
  return jspb.Message.setProto3EnumField(this, 8, value);
};


/**
 * optional double metric_value = 9;
 * @return {number}
 */
proto.treum.risk.RiskMetricsResponse.prototype.getMetricValue = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 9, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.RiskMetricsResponse} returns this
 */
proto.treum.risk.RiskMetricsResponse.prototype.setMetricValue = function(value) {
  return jspb.Message.setProto3FloatField(this, 9, value);
};


/**
 * optional google.protobuf.Timestamp timestamp = 10;
 * @return {?proto.google.protobuf.Timestamp}
 */
proto.treum.risk.RiskMetricsResponse.prototype.getTimestamp = function() {
  return /** @type{?proto.google.protobuf.Timestamp} */ (
    jspb.Message.getWrapperField(this, google_protobuf_timestamp_pb.Timestamp, 10));
};


/**
 * @param {?proto.google.protobuf.Timestamp|undefined} value
 * @return {!proto.treum.risk.RiskMetricsResponse} returns this
*/
proto.treum.risk.RiskMetricsResponse.prototype.setTimestamp = function(value) {
  return jspb.Message.setWrapperField(this, 10, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.treum.risk.RiskMetricsResponse} returns this
 */
proto.treum.risk.RiskMetricsResponse.prototype.clearTimestamp = function() {
  return this.setTimestamp(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.treum.risk.RiskMetricsResponse.prototype.hasTimestamp = function() {
  return jspb.Message.getField(this, 10) != null;
};


/**
 * optional double confidence_level = 11;
 * @return {number}
 */
proto.treum.risk.RiskMetricsResponse.prototype.getConfidenceLevel = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 11, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.RiskMetricsResponse} returns this
 */
proto.treum.risk.RiskMetricsResponse.prototype.setConfidenceLevel = function(value) {
  return jspb.Message.setProto3FloatField(this, 11, value);
};


/**
 * optional int32 time_horizon = 12;
 * @return {number}
 */
proto.treum.risk.RiskMetricsResponse.prototype.getTimeHorizon = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 12, 0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.RiskMetricsResponse} returns this
 */
proto.treum.risk.RiskMetricsResponse.prototype.setTimeHorizon = function(value) {
  return jspb.Message.setProto3IntField(this, 12, value);
};


/**
 * optional int32 lookback_period = 13;
 * @return {number}
 */
proto.treum.risk.RiskMetricsResponse.prototype.getLookbackPeriod = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 13, 0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.RiskMetricsResponse} returns this
 */
proto.treum.risk.RiskMetricsResponse.prototype.setLookbackPeriod = function(value) {
  return jspb.Message.setProto3IntField(this, 13, value);
};


/**
 * optional string metric_details = 14;
 * @return {string}
 */
proto.treum.risk.RiskMetricsResponse.prototype.getMetricDetails = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 14, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.RiskMetricsResponse} returns this
 */
proto.treum.risk.RiskMetricsResponse.prototype.setMetricDetails = function(value) {
  return jspb.Message.setProto3StringField(this, 14, value);
};


/**
 * optional string trend_data = 15;
 * @return {string}
 */
proto.treum.risk.RiskMetricsResponse.prototype.getTrendData = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 15, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.RiskMetricsResponse} returns this
 */
proto.treum.risk.RiskMetricsResponse.prototype.setTrendData = function(value) {
  return jspb.Message.setProto3StringField(this, 15, value);
};


/**
 * optional string risk_attribution = 16;
 * @return {string}
 */
proto.treum.risk.RiskMetricsResponse.prototype.getRiskAttribution = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 16, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.RiskMetricsResponse} returns this
 */
proto.treum.risk.RiskMetricsResponse.prototype.setRiskAttribution = function(value) {
  return jspb.Message.setProto3StringField(this, 16, value);
};


/**
 * optional string stress_test_results = 17;
 * @return {string}
 */
proto.treum.risk.RiskMetricsResponse.prototype.getStressTestResults = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 17, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.RiskMetricsResponse} returns this
 */
proto.treum.risk.RiskMetricsResponse.prototype.setStressTestResults = function(value) {
  return jspb.Message.setProto3StringField(this, 17, value);
};


/**
 * optional string model_parameters = 18;
 * @return {string}
 */
proto.treum.risk.RiskMetricsResponse.prototype.getModelParameters = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 18, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.RiskMetricsResponse} returns this
 */
proto.treum.risk.RiskMetricsResponse.prototype.setModelParameters = function(value) {
  return jspb.Message.setProto3StringField(this, 18, value);
};


/**
 * optional string data_quality = 19;
 * @return {string}
 */
proto.treum.risk.RiskMetricsResponse.prototype.getDataQuality = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 19, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.RiskMetricsResponse} returns this
 */
proto.treum.risk.RiskMetricsResponse.prototype.setDataQuality = function(value) {
  return jspb.Message.setProto3StringField(this, 19, value);
};


/**
 * optional string benchmarks = 20;
 * @return {string}
 */
proto.treum.risk.RiskMetricsResponse.prototype.getBenchmarks = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 20, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.RiskMetricsResponse} returns this
 */
proto.treum.risk.RiskMetricsResponse.prototype.setBenchmarks = function(value) {
  return jspb.Message.setProto3StringField(this, 20, value);
};


/**
 * repeated string associated_limits = 21;
 * @return {!Array<string>}
 */
proto.treum.risk.RiskMetricsResponse.prototype.getAssociatedLimitsList = function() {
  return /** @type {!Array<string>} */ (jspb.Message.getRepeatedField(this, 21));
};


/**
 * @param {!Array<string>} value
 * @return {!proto.treum.risk.RiskMetricsResponse} returns this
 */
proto.treum.risk.RiskMetricsResponse.prototype.setAssociatedLimitsList = function(value) {
  return jspb.Message.setField(this, 21, value || []);
};


/**
 * @param {string} value
 * @param {number=} opt_index
 * @return {!proto.treum.risk.RiskMetricsResponse} returns this
 */
proto.treum.risk.RiskMetricsResponse.prototype.addAssociatedLimits = function(value, opt_index) {
  return jspb.Message.addToRepeatedField(this, 21, value, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.treum.risk.RiskMetricsResponse} returns this
 */
proto.treum.risk.RiskMetricsResponse.prototype.clearAssociatedLimitsList = function() {
  return this.setAssociatedLimitsList([]);
};


/**
 * optional string warnings = 22;
 * @return {string}
 */
proto.treum.risk.RiskMetricsResponse.prototype.getWarnings = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 22, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.RiskMetricsResponse} returns this
 */
proto.treum.risk.RiskMetricsResponse.prototype.setWarnings = function(value) {
  return jspb.Message.setProto3StringField(this, 22, value);
};


/**
 * optional string performance_metrics = 23;
 * @return {string}
 */
proto.treum.risk.RiskMetricsResponse.prototype.getPerformanceMetrics = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 23, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.RiskMetricsResponse} returns this
 */
proto.treum.risk.RiskMetricsResponse.prototype.setPerformanceMetrics = function(value) {
  return jspb.Message.setProto3StringField(this, 23, value);
};


/**
 * optional google.protobuf.Timestamp next_calculation_at = 24;
 * @return {?proto.google.protobuf.Timestamp}
 */
proto.treum.risk.RiskMetricsResponse.prototype.getNextCalculationAt = function() {
  return /** @type{?proto.google.protobuf.Timestamp} */ (
    jspb.Message.getWrapperField(this, google_protobuf_timestamp_pb.Timestamp, 24));
};


/**
 * @param {?proto.google.protobuf.Timestamp|undefined} value
 * @return {!proto.treum.risk.RiskMetricsResponse} returns this
*/
proto.treum.risk.RiskMetricsResponse.prototype.setNextCalculationAt = function(value) {
  return jspb.Message.setWrapperField(this, 24, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.treum.risk.RiskMetricsResponse} returns this
 */
proto.treum.risk.RiskMetricsResponse.prototype.clearNextCalculationAt = function() {
  return this.setNextCalculationAt(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.treum.risk.RiskMetricsResponse.prototype.hasNextCalculationAt = function() {
  return jspb.Message.getField(this, 24) != null;
};


/**
 * optional bool is_stale = 25;
 * @return {boolean}
 */
proto.treum.risk.RiskMetricsResponse.prototype.getIsStale = function() {
  return /** @type {boolean} */ (jspb.Message.getBooleanFieldWithDefault(this, 25, false));
};


/**
 * @param {boolean} value
 * @return {!proto.treum.risk.RiskMetricsResponse} returns this
 */
proto.treum.risk.RiskMetricsResponse.prototype.setIsStale = function(value) {
  return jspb.Message.setProto3BooleanField(this, 25, value);
};


/**
 * optional int32 stale_threshold_minutes = 26;
 * @return {number}
 */
proto.treum.risk.RiskMetricsResponse.prototype.getStaleThresholdMinutes = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 26, 0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.RiskMetricsResponse} returns this
 */
proto.treum.risk.RiskMetricsResponse.prototype.setStaleThresholdMinutes = function(value) {
  return jspb.Message.setProto3IntField(this, 26, value);
};


/**
 * optional string metadata = 27;
 * @return {string}
 */
proto.treum.risk.RiskMetricsResponse.prototype.getMetadata = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 27, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.RiskMetricsResponse} returns this
 */
proto.treum.risk.RiskMetricsResponse.prototype.setMetadata = function(value) {
  return jspb.Message.setProto3StringField(this, 27, value);
};


/**
 * optional google.protobuf.Timestamp created_at = 28;
 * @return {?proto.google.protobuf.Timestamp}
 */
proto.treum.risk.RiskMetricsResponse.prototype.getCreatedAt = function() {
  return /** @type{?proto.google.protobuf.Timestamp} */ (
    jspb.Message.getWrapperField(this, google_protobuf_timestamp_pb.Timestamp, 28));
};


/**
 * @param {?proto.google.protobuf.Timestamp|undefined} value
 * @return {!proto.treum.risk.RiskMetricsResponse} returns this
*/
proto.treum.risk.RiskMetricsResponse.prototype.setCreatedAt = function(value) {
  return jspb.Message.setWrapperField(this, 28, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.treum.risk.RiskMetricsResponse} returns this
 */
proto.treum.risk.RiskMetricsResponse.prototype.clearCreatedAt = function() {
  return this.setCreatedAt(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.treum.risk.RiskMetricsResponse.prototype.hasCreatedAt = function() {
  return jspb.Message.getField(this, 28) != null;
};


/**
 * optional google.protobuf.Timestamp updated_at = 29;
 * @return {?proto.google.protobuf.Timestamp}
 */
proto.treum.risk.RiskMetricsResponse.prototype.getUpdatedAt = function() {
  return /** @type{?proto.google.protobuf.Timestamp} */ (
    jspb.Message.getWrapperField(this, google_protobuf_timestamp_pb.Timestamp, 29));
};


/**
 * @param {?proto.google.protobuf.Timestamp|undefined} value
 * @return {!proto.treum.risk.RiskMetricsResponse} returns this
*/
proto.treum.risk.RiskMetricsResponse.prototype.setUpdatedAt = function(value) {
  return jspb.Message.setWrapperField(this, 29, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.treum.risk.RiskMetricsResponse} returns this
 */
proto.treum.risk.RiskMetricsResponse.prototype.clearUpdatedAt = function() {
  return this.setUpdatedAt(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.treum.risk.RiskMetricsResponse.prototype.hasUpdatedAt = function() {
  return jspb.Message.getField(this, 29) != null;
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.treum.risk.ListRiskMetricsRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.treum.risk.ListRiskMetricsRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.treum.risk.ListRiskMetricsRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.ListRiskMetricsRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    userId: jspb.Message.getFieldWithDefault(msg, 1, ""),
    accountId: jspb.Message.getFieldWithDefault(msg, 2, ""),
    portfolioId: jspb.Message.getFieldWithDefault(msg, 3, ""),
    metricType: jspb.Message.getFieldWithDefault(msg, 4, 0),
    scope: jspb.Message.getFieldWithDefault(msg, 5, 0),
    frequency: jspb.Message.getFieldWithDefault(msg, 6, 0),
    fromDate: (f = msg.getFromDate()) && google_protobuf_timestamp_pb.Timestamp.toObject(includeInstance, f),
    toDate: (f = msg.getToDate()) && google_protobuf_timestamp_pb.Timestamp.toObject(includeInstance, f),
    page: jspb.Message.getFieldWithDefault(msg, 9, 0),
    limit: jspb.Message.getFieldWithDefault(msg, 10, 0)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.treum.risk.ListRiskMetricsRequest}
 */
proto.treum.risk.ListRiskMetricsRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.treum.risk.ListRiskMetricsRequest;
  return proto.treum.risk.ListRiskMetricsRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.treum.risk.ListRiskMetricsRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.treum.risk.ListRiskMetricsRequest}
 */
proto.treum.risk.ListRiskMetricsRequest.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setUserId(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setAccountId(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readString());
      msg.setPortfolioId(value);
      break;
    case 4:
      var value = /** @type {!proto.treum.risk.MetricType} */ (reader.readEnum());
      msg.setMetricType(value);
      break;
    case 5:
      var value = /** @type {!proto.treum.risk.MetricScope} */ (reader.readEnum());
      msg.setScope(value);
      break;
    case 6:
      var value = /** @type {!proto.treum.risk.MetricFrequency} */ (reader.readEnum());
      msg.setFrequency(value);
      break;
    case 7:
      var value = new google_protobuf_timestamp_pb.Timestamp;
      reader.readMessage(value,google_protobuf_timestamp_pb.Timestamp.deserializeBinaryFromReader);
      msg.setFromDate(value);
      break;
    case 8:
      var value = new google_protobuf_timestamp_pb.Timestamp;
      reader.readMessage(value,google_protobuf_timestamp_pb.Timestamp.deserializeBinaryFromReader);
      msg.setToDate(value);
      break;
    case 9:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setPage(value);
      break;
    case 10:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setLimit(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.treum.risk.ListRiskMetricsRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.treum.risk.ListRiskMetricsRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.treum.risk.ListRiskMetricsRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.ListRiskMetricsRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getUserId();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getAccountId();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
  f = message.getPortfolioId();
  if (f.length > 0) {
    writer.writeString(
      3,
      f
    );
  }
  f = message.getMetricType();
  if (f !== 0.0) {
    writer.writeEnum(
      4,
      f
    );
  }
  f = message.getScope();
  if (f !== 0.0) {
    writer.writeEnum(
      5,
      f
    );
  }
  f = message.getFrequency();
  if (f !== 0.0) {
    writer.writeEnum(
      6,
      f
    );
  }
  f = message.getFromDate();
  if (f != null) {
    writer.writeMessage(
      7,
      f,
      google_protobuf_timestamp_pb.Timestamp.serializeBinaryToWriter
    );
  }
  f = message.getToDate();
  if (f != null) {
    writer.writeMessage(
      8,
      f,
      google_protobuf_timestamp_pb.Timestamp.serializeBinaryToWriter
    );
  }
  f = message.getPage();
  if (f !== 0) {
    writer.writeInt32(
      9,
      f
    );
  }
  f = message.getLimit();
  if (f !== 0) {
    writer.writeInt32(
      10,
      f
    );
  }
};


/**
 * optional string user_id = 1;
 * @return {string}
 */
proto.treum.risk.ListRiskMetricsRequest.prototype.getUserId = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.ListRiskMetricsRequest} returns this
 */
proto.treum.risk.ListRiskMetricsRequest.prototype.setUserId = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional string account_id = 2;
 * @return {string}
 */
proto.treum.risk.ListRiskMetricsRequest.prototype.getAccountId = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.ListRiskMetricsRequest} returns this
 */
proto.treum.risk.ListRiskMetricsRequest.prototype.setAccountId = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};


/**
 * optional string portfolio_id = 3;
 * @return {string}
 */
proto.treum.risk.ListRiskMetricsRequest.prototype.getPortfolioId = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.ListRiskMetricsRequest} returns this
 */
proto.treum.risk.ListRiskMetricsRequest.prototype.setPortfolioId = function(value) {
  return jspb.Message.setProto3StringField(this, 3, value);
};


/**
 * optional MetricType metric_type = 4;
 * @return {!proto.treum.risk.MetricType}
 */
proto.treum.risk.ListRiskMetricsRequest.prototype.getMetricType = function() {
  return /** @type {!proto.treum.risk.MetricType} */ (jspb.Message.getFieldWithDefault(this, 4, 0));
};


/**
 * @param {!proto.treum.risk.MetricType} value
 * @return {!proto.treum.risk.ListRiskMetricsRequest} returns this
 */
proto.treum.risk.ListRiskMetricsRequest.prototype.setMetricType = function(value) {
  return jspb.Message.setProto3EnumField(this, 4, value);
};


/**
 * optional MetricScope scope = 5;
 * @return {!proto.treum.risk.MetricScope}
 */
proto.treum.risk.ListRiskMetricsRequest.prototype.getScope = function() {
  return /** @type {!proto.treum.risk.MetricScope} */ (jspb.Message.getFieldWithDefault(this, 5, 0));
};


/**
 * @param {!proto.treum.risk.MetricScope} value
 * @return {!proto.treum.risk.ListRiskMetricsRequest} returns this
 */
proto.treum.risk.ListRiskMetricsRequest.prototype.setScope = function(value) {
  return jspb.Message.setProto3EnumField(this, 5, value);
};


/**
 * optional MetricFrequency frequency = 6;
 * @return {!proto.treum.risk.MetricFrequency}
 */
proto.treum.risk.ListRiskMetricsRequest.prototype.getFrequency = function() {
  return /** @type {!proto.treum.risk.MetricFrequency} */ (jspb.Message.getFieldWithDefault(this, 6, 0));
};


/**
 * @param {!proto.treum.risk.MetricFrequency} value
 * @return {!proto.treum.risk.ListRiskMetricsRequest} returns this
 */
proto.treum.risk.ListRiskMetricsRequest.prototype.setFrequency = function(value) {
  return jspb.Message.setProto3EnumField(this, 6, value);
};


/**
 * optional google.protobuf.Timestamp from_date = 7;
 * @return {?proto.google.protobuf.Timestamp}
 */
proto.treum.risk.ListRiskMetricsRequest.prototype.getFromDate = function() {
  return /** @type{?proto.google.protobuf.Timestamp} */ (
    jspb.Message.getWrapperField(this, google_protobuf_timestamp_pb.Timestamp, 7));
};


/**
 * @param {?proto.google.protobuf.Timestamp|undefined} value
 * @return {!proto.treum.risk.ListRiskMetricsRequest} returns this
*/
proto.treum.risk.ListRiskMetricsRequest.prototype.setFromDate = function(value) {
  return jspb.Message.setWrapperField(this, 7, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.treum.risk.ListRiskMetricsRequest} returns this
 */
proto.treum.risk.ListRiskMetricsRequest.prototype.clearFromDate = function() {
  return this.setFromDate(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.treum.risk.ListRiskMetricsRequest.prototype.hasFromDate = function() {
  return jspb.Message.getField(this, 7) != null;
};


/**
 * optional google.protobuf.Timestamp to_date = 8;
 * @return {?proto.google.protobuf.Timestamp}
 */
proto.treum.risk.ListRiskMetricsRequest.prototype.getToDate = function() {
  return /** @type{?proto.google.protobuf.Timestamp} */ (
    jspb.Message.getWrapperField(this, google_protobuf_timestamp_pb.Timestamp, 8));
};


/**
 * @param {?proto.google.protobuf.Timestamp|undefined} value
 * @return {!proto.treum.risk.ListRiskMetricsRequest} returns this
*/
proto.treum.risk.ListRiskMetricsRequest.prototype.setToDate = function(value) {
  return jspb.Message.setWrapperField(this, 8, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.treum.risk.ListRiskMetricsRequest} returns this
 */
proto.treum.risk.ListRiskMetricsRequest.prototype.clearToDate = function() {
  return this.setToDate(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.treum.risk.ListRiskMetricsRequest.prototype.hasToDate = function() {
  return jspb.Message.getField(this, 8) != null;
};


/**
 * optional int32 page = 9;
 * @return {number}
 */
proto.treum.risk.ListRiskMetricsRequest.prototype.getPage = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 9, 0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.ListRiskMetricsRequest} returns this
 */
proto.treum.risk.ListRiskMetricsRequest.prototype.setPage = function(value) {
  return jspb.Message.setProto3IntField(this, 9, value);
};


/**
 * optional int32 limit = 10;
 * @return {number}
 */
proto.treum.risk.ListRiskMetricsRequest.prototype.getLimit = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 10, 0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.ListRiskMetricsRequest} returns this
 */
proto.treum.risk.ListRiskMetricsRequest.prototype.setLimit = function(value) {
  return jspb.Message.setProto3IntField(this, 10, value);
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.treum.risk.ListRiskMetricsResponse.repeatedFields_ = [1];



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.treum.risk.ListRiskMetricsResponse.prototype.toObject = function(opt_includeInstance) {
  return proto.treum.risk.ListRiskMetricsResponse.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.treum.risk.ListRiskMetricsResponse} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.ListRiskMetricsResponse.toObject = function(includeInstance, msg) {
  var f, obj = {
    metricsList: jspb.Message.toObjectList(msg.getMetricsList(),
    proto.treum.risk.RiskMetricsResponse.toObject, includeInstance),
    total: jspb.Message.getFieldWithDefault(msg, 2, 0),
    page: jspb.Message.getFieldWithDefault(msg, 3, 0),
    limit: jspb.Message.getFieldWithDefault(msg, 4, 0),
    totalPages: jspb.Message.getFieldWithDefault(msg, 5, 0)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.treum.risk.ListRiskMetricsResponse}
 */
proto.treum.risk.ListRiskMetricsResponse.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.treum.risk.ListRiskMetricsResponse;
  return proto.treum.risk.ListRiskMetricsResponse.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.treum.risk.ListRiskMetricsResponse} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.treum.risk.ListRiskMetricsResponse}
 */
proto.treum.risk.ListRiskMetricsResponse.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.treum.risk.RiskMetricsResponse;
      reader.readMessage(value,proto.treum.risk.RiskMetricsResponse.deserializeBinaryFromReader);
      msg.addMetrics(value);
      break;
    case 2:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setTotal(value);
      break;
    case 3:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setPage(value);
      break;
    case 4:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setLimit(value);
      break;
    case 5:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setTotalPages(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.treum.risk.ListRiskMetricsResponse.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.treum.risk.ListRiskMetricsResponse.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.treum.risk.ListRiskMetricsResponse} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.ListRiskMetricsResponse.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getMetricsList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      1,
      f,
      proto.treum.risk.RiskMetricsResponse.serializeBinaryToWriter
    );
  }
  f = message.getTotal();
  if (f !== 0) {
    writer.writeInt32(
      2,
      f
    );
  }
  f = message.getPage();
  if (f !== 0) {
    writer.writeInt32(
      3,
      f
    );
  }
  f = message.getLimit();
  if (f !== 0) {
    writer.writeInt32(
      4,
      f
    );
  }
  f = message.getTotalPages();
  if (f !== 0) {
    writer.writeInt32(
      5,
      f
    );
  }
};


/**
 * repeated RiskMetricsResponse metrics = 1;
 * @return {!Array<!proto.treum.risk.RiskMetricsResponse>}
 */
proto.treum.risk.ListRiskMetricsResponse.prototype.getMetricsList = function() {
  return /** @type{!Array<!proto.treum.risk.RiskMetricsResponse>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.treum.risk.RiskMetricsResponse, 1));
};


/**
 * @param {!Array<!proto.treum.risk.RiskMetricsResponse>} value
 * @return {!proto.treum.risk.ListRiskMetricsResponse} returns this
*/
proto.treum.risk.ListRiskMetricsResponse.prototype.setMetricsList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 1, value);
};


/**
 * @param {!proto.treum.risk.RiskMetricsResponse=} opt_value
 * @param {number=} opt_index
 * @return {!proto.treum.risk.RiskMetricsResponse}
 */
proto.treum.risk.ListRiskMetricsResponse.prototype.addMetrics = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 1, opt_value, proto.treum.risk.RiskMetricsResponse, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.treum.risk.ListRiskMetricsResponse} returns this
 */
proto.treum.risk.ListRiskMetricsResponse.prototype.clearMetricsList = function() {
  return this.setMetricsList([]);
};


/**
 * optional int32 total = 2;
 * @return {number}
 */
proto.treum.risk.ListRiskMetricsResponse.prototype.getTotal = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.ListRiskMetricsResponse} returns this
 */
proto.treum.risk.ListRiskMetricsResponse.prototype.setTotal = function(value) {
  return jspb.Message.setProto3IntField(this, 2, value);
};


/**
 * optional int32 page = 3;
 * @return {number}
 */
proto.treum.risk.ListRiskMetricsResponse.prototype.getPage = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 3, 0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.ListRiskMetricsResponse} returns this
 */
proto.treum.risk.ListRiskMetricsResponse.prototype.setPage = function(value) {
  return jspb.Message.setProto3IntField(this, 3, value);
};


/**
 * optional int32 limit = 4;
 * @return {number}
 */
proto.treum.risk.ListRiskMetricsResponse.prototype.getLimit = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 4, 0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.ListRiskMetricsResponse} returns this
 */
proto.treum.risk.ListRiskMetricsResponse.prototype.setLimit = function(value) {
  return jspb.Message.setProto3IntField(this, 4, value);
};


/**
 * optional int32 total_pages = 5;
 * @return {number}
 */
proto.treum.risk.ListRiskMetricsResponse.prototype.getTotalPages = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 5, 0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.ListRiskMetricsResponse} returns this
 */
proto.treum.risk.ListRiskMetricsResponse.prototype.setTotalPages = function(value) {
  return jspb.Message.setProto3IntField(this, 5, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.treum.risk.GetRiskAssessmentRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.treum.risk.GetRiskAssessmentRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.treum.risk.GetRiskAssessmentRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.GetRiskAssessmentRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    id: jspb.Message.getFieldWithDefault(msg, 1, "")
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.treum.risk.GetRiskAssessmentRequest}
 */
proto.treum.risk.GetRiskAssessmentRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.treum.risk.GetRiskAssessmentRequest;
  return proto.treum.risk.GetRiskAssessmentRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.treum.risk.GetRiskAssessmentRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.treum.risk.GetRiskAssessmentRequest}
 */
proto.treum.risk.GetRiskAssessmentRequest.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setId(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.treum.risk.GetRiskAssessmentRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.treum.risk.GetRiskAssessmentRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.treum.risk.GetRiskAssessmentRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.GetRiskAssessmentRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getId();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
};


/**
 * optional string id = 1;
 * @return {string}
 */
proto.treum.risk.GetRiskAssessmentRequest.prototype.getId = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.GetRiskAssessmentRequest} returns this
 */
proto.treum.risk.GetRiskAssessmentRequest.prototype.setId = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.treum.risk.RiskAssessmentResponse.repeatedFields_ = [12,13];



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.treum.risk.RiskAssessmentResponse.prototype.toObject = function(opt_includeInstance) {
  return proto.treum.risk.RiskAssessmentResponse.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.treum.risk.RiskAssessmentResponse} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.RiskAssessmentResponse.toObject = function(includeInstance, msg) {
  var f, obj = {
    id: jspb.Message.getFieldWithDefault(msg, 1, ""),
    userId: jspb.Message.getFieldWithDefault(msg, 2, ""),
    accountId: jspb.Message.getFieldWithDefault(msg, 3, ""),
    tradeId: jspb.Message.getFieldWithDefault(msg, 4, ""),
    portfolioId: jspb.Message.getFieldWithDefault(msg, 5, ""),
    assessmentType: jspb.Message.getFieldWithDefault(msg, 6, 0),
    riskLevel: jspb.Message.getFieldWithDefault(msg, 7, 0),
    riskScore: jspb.Message.getFloatingPointFieldWithDefault(msg, 8, 0.0),
    status: jspb.Message.getFieldWithDefault(msg, 9, 0),
    assessmentParams: jspb.Message.getFieldWithDefault(msg, 10, ""),
    assessmentResults: jspb.Message.getFieldWithDefault(msg, 11, ""),
    riskFactorsList: (f = jspb.Message.getRepeatedField(msg, 12)) == null ? undefined : f,
    recommendationsList: (f = jspb.Message.getRepeatedField(msg, 13)) == null ? undefined : f,
    requiresReview: jspb.Message.getBooleanFieldWithDefault(msg, 14, false),
    reviewedBy: jspb.Message.getFieldWithDefault(msg, 15, ""),
    reviewedAt: (f = msg.getReviewedAt()) && google_protobuf_timestamp_pb.Timestamp.toObject(includeInstance, f),
    reviewComments: jspb.Message.getFieldWithDefault(msg, 17, ""),
    processingTimeMs: jspb.Message.getFieldWithDefault(msg, 18, 0),
    modelVersion: jspb.Message.getFieldWithDefault(msg, 19, ""),
    expiresAt: (f = msg.getExpiresAt()) && google_protobuf_timestamp_pb.Timestamp.toObject(includeInstance, f),
    metadata: jspb.Message.getFieldWithDefault(msg, 21, ""),
    createdAt: (f = msg.getCreatedAt()) && google_protobuf_timestamp_pb.Timestamp.toObject(includeInstance, f),
    updatedAt: (f = msg.getUpdatedAt()) && google_protobuf_timestamp_pb.Timestamp.toObject(includeInstance, f)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.treum.risk.RiskAssessmentResponse}
 */
proto.treum.risk.RiskAssessmentResponse.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.treum.risk.RiskAssessmentResponse;
  return proto.treum.risk.RiskAssessmentResponse.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.treum.risk.RiskAssessmentResponse} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.treum.risk.RiskAssessmentResponse}
 */
proto.treum.risk.RiskAssessmentResponse.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setId(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setUserId(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readString());
      msg.setAccountId(value);
      break;
    case 4:
      var value = /** @type {string} */ (reader.readString());
      msg.setTradeId(value);
      break;
    case 5:
      var value = /** @type {string} */ (reader.readString());
      msg.setPortfolioId(value);
      break;
    case 6:
      var value = /** @type {!proto.treum.risk.AssessmentType} */ (reader.readEnum());
      msg.setAssessmentType(value);
      break;
    case 7:
      var value = /** @type {!proto.treum.risk.RiskLevel} */ (reader.readEnum());
      msg.setRiskLevel(value);
      break;
    case 8:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setRiskScore(value);
      break;
    case 9:
      var value = /** @type {!proto.treum.risk.AssessmentStatus} */ (reader.readEnum());
      msg.setStatus(value);
      break;
    case 10:
      var value = /** @type {string} */ (reader.readString());
      msg.setAssessmentParams(value);
      break;
    case 11:
      var value = /** @type {string} */ (reader.readString());
      msg.setAssessmentResults(value);
      break;
    case 12:
      var value = /** @type {string} */ (reader.readString());
      msg.addRiskFactors(value);
      break;
    case 13:
      var value = /** @type {string} */ (reader.readString());
      msg.addRecommendations(value);
      break;
    case 14:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setRequiresReview(value);
      break;
    case 15:
      var value = /** @type {string} */ (reader.readString());
      msg.setReviewedBy(value);
      break;
    case 16:
      var value = new google_protobuf_timestamp_pb.Timestamp;
      reader.readMessage(value,google_protobuf_timestamp_pb.Timestamp.deserializeBinaryFromReader);
      msg.setReviewedAt(value);
      break;
    case 17:
      var value = /** @type {string} */ (reader.readString());
      msg.setReviewComments(value);
      break;
    case 18:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setProcessingTimeMs(value);
      break;
    case 19:
      var value = /** @type {string} */ (reader.readString());
      msg.setModelVersion(value);
      break;
    case 20:
      var value = new google_protobuf_timestamp_pb.Timestamp;
      reader.readMessage(value,google_protobuf_timestamp_pb.Timestamp.deserializeBinaryFromReader);
      msg.setExpiresAt(value);
      break;
    case 21:
      var value = /** @type {string} */ (reader.readString());
      msg.setMetadata(value);
      break;
    case 22:
      var value = new google_protobuf_timestamp_pb.Timestamp;
      reader.readMessage(value,google_protobuf_timestamp_pb.Timestamp.deserializeBinaryFromReader);
      msg.setCreatedAt(value);
      break;
    case 23:
      var value = new google_protobuf_timestamp_pb.Timestamp;
      reader.readMessage(value,google_protobuf_timestamp_pb.Timestamp.deserializeBinaryFromReader);
      msg.setUpdatedAt(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.treum.risk.RiskAssessmentResponse.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.treum.risk.RiskAssessmentResponse.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.treum.risk.RiskAssessmentResponse} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.RiskAssessmentResponse.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getId();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getUserId();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
  f = message.getAccountId();
  if (f.length > 0) {
    writer.writeString(
      3,
      f
    );
  }
  f = message.getTradeId();
  if (f.length > 0) {
    writer.writeString(
      4,
      f
    );
  }
  f = message.getPortfolioId();
  if (f.length > 0) {
    writer.writeString(
      5,
      f
    );
  }
  f = message.getAssessmentType();
  if (f !== 0.0) {
    writer.writeEnum(
      6,
      f
    );
  }
  f = message.getRiskLevel();
  if (f !== 0.0) {
    writer.writeEnum(
      7,
      f
    );
  }
  f = message.getRiskScore();
  if (f !== 0.0) {
    writer.writeDouble(
      8,
      f
    );
  }
  f = message.getStatus();
  if (f !== 0.0) {
    writer.writeEnum(
      9,
      f
    );
  }
  f = message.getAssessmentParams();
  if (f.length > 0) {
    writer.writeString(
      10,
      f
    );
  }
  f = message.getAssessmentResults();
  if (f.length > 0) {
    writer.writeString(
      11,
      f
    );
  }
  f = message.getRiskFactorsList();
  if (f.length > 0) {
    writer.writeRepeatedString(
      12,
      f
    );
  }
  f = message.getRecommendationsList();
  if (f.length > 0) {
    writer.writeRepeatedString(
      13,
      f
    );
  }
  f = message.getRequiresReview();
  if (f) {
    writer.writeBool(
      14,
      f
    );
  }
  f = message.getReviewedBy();
  if (f.length > 0) {
    writer.writeString(
      15,
      f
    );
  }
  f = message.getReviewedAt();
  if (f != null) {
    writer.writeMessage(
      16,
      f,
      google_protobuf_timestamp_pb.Timestamp.serializeBinaryToWriter
    );
  }
  f = message.getReviewComments();
  if (f.length > 0) {
    writer.writeString(
      17,
      f
    );
  }
  f = message.getProcessingTimeMs();
  if (f !== 0) {
    writer.writeInt32(
      18,
      f
    );
  }
  f = message.getModelVersion();
  if (f.length > 0) {
    writer.writeString(
      19,
      f
    );
  }
  f = message.getExpiresAt();
  if (f != null) {
    writer.writeMessage(
      20,
      f,
      google_protobuf_timestamp_pb.Timestamp.serializeBinaryToWriter
    );
  }
  f = message.getMetadata();
  if (f.length > 0) {
    writer.writeString(
      21,
      f
    );
  }
  f = message.getCreatedAt();
  if (f != null) {
    writer.writeMessage(
      22,
      f,
      google_protobuf_timestamp_pb.Timestamp.serializeBinaryToWriter
    );
  }
  f = message.getUpdatedAt();
  if (f != null) {
    writer.writeMessage(
      23,
      f,
      google_protobuf_timestamp_pb.Timestamp.serializeBinaryToWriter
    );
  }
};


/**
 * optional string id = 1;
 * @return {string}
 */
proto.treum.risk.RiskAssessmentResponse.prototype.getId = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.RiskAssessmentResponse} returns this
 */
proto.treum.risk.RiskAssessmentResponse.prototype.setId = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional string user_id = 2;
 * @return {string}
 */
proto.treum.risk.RiskAssessmentResponse.prototype.getUserId = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.RiskAssessmentResponse} returns this
 */
proto.treum.risk.RiskAssessmentResponse.prototype.setUserId = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};


/**
 * optional string account_id = 3;
 * @return {string}
 */
proto.treum.risk.RiskAssessmentResponse.prototype.getAccountId = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.RiskAssessmentResponse} returns this
 */
proto.treum.risk.RiskAssessmentResponse.prototype.setAccountId = function(value) {
  return jspb.Message.setProto3StringField(this, 3, value);
};


/**
 * optional string trade_id = 4;
 * @return {string}
 */
proto.treum.risk.RiskAssessmentResponse.prototype.getTradeId = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 4, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.RiskAssessmentResponse} returns this
 */
proto.treum.risk.RiskAssessmentResponse.prototype.setTradeId = function(value) {
  return jspb.Message.setProto3StringField(this, 4, value);
};


/**
 * optional string portfolio_id = 5;
 * @return {string}
 */
proto.treum.risk.RiskAssessmentResponse.prototype.getPortfolioId = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 5, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.RiskAssessmentResponse} returns this
 */
proto.treum.risk.RiskAssessmentResponse.prototype.setPortfolioId = function(value) {
  return jspb.Message.setProto3StringField(this, 5, value);
};


/**
 * optional AssessmentType assessment_type = 6;
 * @return {!proto.treum.risk.AssessmentType}
 */
proto.treum.risk.RiskAssessmentResponse.prototype.getAssessmentType = function() {
  return /** @type {!proto.treum.risk.AssessmentType} */ (jspb.Message.getFieldWithDefault(this, 6, 0));
};


/**
 * @param {!proto.treum.risk.AssessmentType} value
 * @return {!proto.treum.risk.RiskAssessmentResponse} returns this
 */
proto.treum.risk.RiskAssessmentResponse.prototype.setAssessmentType = function(value) {
  return jspb.Message.setProto3EnumField(this, 6, value);
};


/**
 * optional RiskLevel risk_level = 7;
 * @return {!proto.treum.risk.RiskLevel}
 */
proto.treum.risk.RiskAssessmentResponse.prototype.getRiskLevel = function() {
  return /** @type {!proto.treum.risk.RiskLevel} */ (jspb.Message.getFieldWithDefault(this, 7, 0));
};


/**
 * @param {!proto.treum.risk.RiskLevel} value
 * @return {!proto.treum.risk.RiskAssessmentResponse} returns this
 */
proto.treum.risk.RiskAssessmentResponse.prototype.setRiskLevel = function(value) {
  return jspb.Message.setProto3EnumField(this, 7, value);
};


/**
 * optional double risk_score = 8;
 * @return {number}
 */
proto.treum.risk.RiskAssessmentResponse.prototype.getRiskScore = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 8, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.RiskAssessmentResponse} returns this
 */
proto.treum.risk.RiskAssessmentResponse.prototype.setRiskScore = function(value) {
  return jspb.Message.setProto3FloatField(this, 8, value);
};


/**
 * optional AssessmentStatus status = 9;
 * @return {!proto.treum.risk.AssessmentStatus}
 */
proto.treum.risk.RiskAssessmentResponse.prototype.getStatus = function() {
  return /** @type {!proto.treum.risk.AssessmentStatus} */ (jspb.Message.getFieldWithDefault(this, 9, 0));
};


/**
 * @param {!proto.treum.risk.AssessmentStatus} value
 * @return {!proto.treum.risk.RiskAssessmentResponse} returns this
 */
proto.treum.risk.RiskAssessmentResponse.prototype.setStatus = function(value) {
  return jspb.Message.setProto3EnumField(this, 9, value);
};


/**
 * optional string assessment_params = 10;
 * @return {string}
 */
proto.treum.risk.RiskAssessmentResponse.prototype.getAssessmentParams = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 10, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.RiskAssessmentResponse} returns this
 */
proto.treum.risk.RiskAssessmentResponse.prototype.setAssessmentParams = function(value) {
  return jspb.Message.setProto3StringField(this, 10, value);
};


/**
 * optional string assessment_results = 11;
 * @return {string}
 */
proto.treum.risk.RiskAssessmentResponse.prototype.getAssessmentResults = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 11, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.RiskAssessmentResponse} returns this
 */
proto.treum.risk.RiskAssessmentResponse.prototype.setAssessmentResults = function(value) {
  return jspb.Message.setProto3StringField(this, 11, value);
};


/**
 * repeated string risk_factors = 12;
 * @return {!Array<string>}
 */
proto.treum.risk.RiskAssessmentResponse.prototype.getRiskFactorsList = function() {
  return /** @type {!Array<string>} */ (jspb.Message.getRepeatedField(this, 12));
};


/**
 * @param {!Array<string>} value
 * @return {!proto.treum.risk.RiskAssessmentResponse} returns this
 */
proto.treum.risk.RiskAssessmentResponse.prototype.setRiskFactorsList = function(value) {
  return jspb.Message.setField(this, 12, value || []);
};


/**
 * @param {string} value
 * @param {number=} opt_index
 * @return {!proto.treum.risk.RiskAssessmentResponse} returns this
 */
proto.treum.risk.RiskAssessmentResponse.prototype.addRiskFactors = function(value, opt_index) {
  return jspb.Message.addToRepeatedField(this, 12, value, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.treum.risk.RiskAssessmentResponse} returns this
 */
proto.treum.risk.RiskAssessmentResponse.prototype.clearRiskFactorsList = function() {
  return this.setRiskFactorsList([]);
};


/**
 * repeated string recommendations = 13;
 * @return {!Array<string>}
 */
proto.treum.risk.RiskAssessmentResponse.prototype.getRecommendationsList = function() {
  return /** @type {!Array<string>} */ (jspb.Message.getRepeatedField(this, 13));
};


/**
 * @param {!Array<string>} value
 * @return {!proto.treum.risk.RiskAssessmentResponse} returns this
 */
proto.treum.risk.RiskAssessmentResponse.prototype.setRecommendationsList = function(value) {
  return jspb.Message.setField(this, 13, value || []);
};


/**
 * @param {string} value
 * @param {number=} opt_index
 * @return {!proto.treum.risk.RiskAssessmentResponse} returns this
 */
proto.treum.risk.RiskAssessmentResponse.prototype.addRecommendations = function(value, opt_index) {
  return jspb.Message.addToRepeatedField(this, 13, value, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.treum.risk.RiskAssessmentResponse} returns this
 */
proto.treum.risk.RiskAssessmentResponse.prototype.clearRecommendationsList = function() {
  return this.setRecommendationsList([]);
};


/**
 * optional bool requires_review = 14;
 * @return {boolean}
 */
proto.treum.risk.RiskAssessmentResponse.prototype.getRequiresReview = function() {
  return /** @type {boolean} */ (jspb.Message.getBooleanFieldWithDefault(this, 14, false));
};


/**
 * @param {boolean} value
 * @return {!proto.treum.risk.RiskAssessmentResponse} returns this
 */
proto.treum.risk.RiskAssessmentResponse.prototype.setRequiresReview = function(value) {
  return jspb.Message.setProto3BooleanField(this, 14, value);
};


/**
 * optional string reviewed_by = 15;
 * @return {string}
 */
proto.treum.risk.RiskAssessmentResponse.prototype.getReviewedBy = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 15, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.RiskAssessmentResponse} returns this
 */
proto.treum.risk.RiskAssessmentResponse.prototype.setReviewedBy = function(value) {
  return jspb.Message.setProto3StringField(this, 15, value);
};


/**
 * optional google.protobuf.Timestamp reviewed_at = 16;
 * @return {?proto.google.protobuf.Timestamp}
 */
proto.treum.risk.RiskAssessmentResponse.prototype.getReviewedAt = function() {
  return /** @type{?proto.google.protobuf.Timestamp} */ (
    jspb.Message.getWrapperField(this, google_protobuf_timestamp_pb.Timestamp, 16));
};


/**
 * @param {?proto.google.protobuf.Timestamp|undefined} value
 * @return {!proto.treum.risk.RiskAssessmentResponse} returns this
*/
proto.treum.risk.RiskAssessmentResponse.prototype.setReviewedAt = function(value) {
  return jspb.Message.setWrapperField(this, 16, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.treum.risk.RiskAssessmentResponse} returns this
 */
proto.treum.risk.RiskAssessmentResponse.prototype.clearReviewedAt = function() {
  return this.setReviewedAt(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.treum.risk.RiskAssessmentResponse.prototype.hasReviewedAt = function() {
  return jspb.Message.getField(this, 16) != null;
};


/**
 * optional string review_comments = 17;
 * @return {string}
 */
proto.treum.risk.RiskAssessmentResponse.prototype.getReviewComments = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 17, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.RiskAssessmentResponse} returns this
 */
proto.treum.risk.RiskAssessmentResponse.prototype.setReviewComments = function(value) {
  return jspb.Message.setProto3StringField(this, 17, value);
};


/**
 * optional int32 processing_time_ms = 18;
 * @return {number}
 */
proto.treum.risk.RiskAssessmentResponse.prototype.getProcessingTimeMs = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 18, 0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.RiskAssessmentResponse} returns this
 */
proto.treum.risk.RiskAssessmentResponse.prototype.setProcessingTimeMs = function(value) {
  return jspb.Message.setProto3IntField(this, 18, value);
};


/**
 * optional string model_version = 19;
 * @return {string}
 */
proto.treum.risk.RiskAssessmentResponse.prototype.getModelVersion = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 19, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.RiskAssessmentResponse} returns this
 */
proto.treum.risk.RiskAssessmentResponse.prototype.setModelVersion = function(value) {
  return jspb.Message.setProto3StringField(this, 19, value);
};


/**
 * optional google.protobuf.Timestamp expires_at = 20;
 * @return {?proto.google.protobuf.Timestamp}
 */
proto.treum.risk.RiskAssessmentResponse.prototype.getExpiresAt = function() {
  return /** @type{?proto.google.protobuf.Timestamp} */ (
    jspb.Message.getWrapperField(this, google_protobuf_timestamp_pb.Timestamp, 20));
};


/**
 * @param {?proto.google.protobuf.Timestamp|undefined} value
 * @return {!proto.treum.risk.RiskAssessmentResponse} returns this
*/
proto.treum.risk.RiskAssessmentResponse.prototype.setExpiresAt = function(value) {
  return jspb.Message.setWrapperField(this, 20, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.treum.risk.RiskAssessmentResponse} returns this
 */
proto.treum.risk.RiskAssessmentResponse.prototype.clearExpiresAt = function() {
  return this.setExpiresAt(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.treum.risk.RiskAssessmentResponse.prototype.hasExpiresAt = function() {
  return jspb.Message.getField(this, 20) != null;
};


/**
 * optional string metadata = 21;
 * @return {string}
 */
proto.treum.risk.RiskAssessmentResponse.prototype.getMetadata = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 21, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.RiskAssessmentResponse} returns this
 */
proto.treum.risk.RiskAssessmentResponse.prototype.setMetadata = function(value) {
  return jspb.Message.setProto3StringField(this, 21, value);
};


/**
 * optional google.protobuf.Timestamp created_at = 22;
 * @return {?proto.google.protobuf.Timestamp}
 */
proto.treum.risk.RiskAssessmentResponse.prototype.getCreatedAt = function() {
  return /** @type{?proto.google.protobuf.Timestamp} */ (
    jspb.Message.getWrapperField(this, google_protobuf_timestamp_pb.Timestamp, 22));
};


/**
 * @param {?proto.google.protobuf.Timestamp|undefined} value
 * @return {!proto.treum.risk.RiskAssessmentResponse} returns this
*/
proto.treum.risk.RiskAssessmentResponse.prototype.setCreatedAt = function(value) {
  return jspb.Message.setWrapperField(this, 22, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.treum.risk.RiskAssessmentResponse} returns this
 */
proto.treum.risk.RiskAssessmentResponse.prototype.clearCreatedAt = function() {
  return this.setCreatedAt(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.treum.risk.RiskAssessmentResponse.prototype.hasCreatedAt = function() {
  return jspb.Message.getField(this, 22) != null;
};


/**
 * optional google.protobuf.Timestamp updated_at = 23;
 * @return {?proto.google.protobuf.Timestamp}
 */
proto.treum.risk.RiskAssessmentResponse.prototype.getUpdatedAt = function() {
  return /** @type{?proto.google.protobuf.Timestamp} */ (
    jspb.Message.getWrapperField(this, google_protobuf_timestamp_pb.Timestamp, 23));
};


/**
 * @param {?proto.google.protobuf.Timestamp|undefined} value
 * @return {!proto.treum.risk.RiskAssessmentResponse} returns this
*/
proto.treum.risk.RiskAssessmentResponse.prototype.setUpdatedAt = function(value) {
  return jspb.Message.setWrapperField(this, 23, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.treum.risk.RiskAssessmentResponse} returns this
 */
proto.treum.risk.RiskAssessmentResponse.prototype.clearUpdatedAt = function() {
  return this.setUpdatedAt(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.treum.risk.RiskAssessmentResponse.prototype.hasUpdatedAt = function() {
  return jspb.Message.getField(this, 23) != null;
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.treum.risk.ListRiskAssessmentsRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.treum.risk.ListRiskAssessmentsRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.treum.risk.ListRiskAssessmentsRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.ListRiskAssessmentsRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    userId: jspb.Message.getFieldWithDefault(msg, 1, ""),
    accountId: jspb.Message.getFieldWithDefault(msg, 2, ""),
    assessmentType: jspb.Message.getFieldWithDefault(msg, 3, 0),
    riskLevel: jspb.Message.getFieldWithDefault(msg, 4, 0),
    status: jspb.Message.getFieldWithDefault(msg, 5, 0),
    fromDate: (f = msg.getFromDate()) && google_protobuf_timestamp_pb.Timestamp.toObject(includeInstance, f),
    toDate: (f = msg.getToDate()) && google_protobuf_timestamp_pb.Timestamp.toObject(includeInstance, f),
    page: jspb.Message.getFieldWithDefault(msg, 8, 0),
    limit: jspb.Message.getFieldWithDefault(msg, 9, 0)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.treum.risk.ListRiskAssessmentsRequest}
 */
proto.treum.risk.ListRiskAssessmentsRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.treum.risk.ListRiskAssessmentsRequest;
  return proto.treum.risk.ListRiskAssessmentsRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.treum.risk.ListRiskAssessmentsRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.treum.risk.ListRiskAssessmentsRequest}
 */
proto.treum.risk.ListRiskAssessmentsRequest.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setUserId(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setAccountId(value);
      break;
    case 3:
      var value = /** @type {!proto.treum.risk.AssessmentType} */ (reader.readEnum());
      msg.setAssessmentType(value);
      break;
    case 4:
      var value = /** @type {!proto.treum.risk.RiskLevel} */ (reader.readEnum());
      msg.setRiskLevel(value);
      break;
    case 5:
      var value = /** @type {!proto.treum.risk.AssessmentStatus} */ (reader.readEnum());
      msg.setStatus(value);
      break;
    case 6:
      var value = new google_protobuf_timestamp_pb.Timestamp;
      reader.readMessage(value,google_protobuf_timestamp_pb.Timestamp.deserializeBinaryFromReader);
      msg.setFromDate(value);
      break;
    case 7:
      var value = new google_protobuf_timestamp_pb.Timestamp;
      reader.readMessage(value,google_protobuf_timestamp_pb.Timestamp.deserializeBinaryFromReader);
      msg.setToDate(value);
      break;
    case 8:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setPage(value);
      break;
    case 9:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setLimit(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.treum.risk.ListRiskAssessmentsRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.treum.risk.ListRiskAssessmentsRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.treum.risk.ListRiskAssessmentsRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.ListRiskAssessmentsRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getUserId();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getAccountId();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
  f = message.getAssessmentType();
  if (f !== 0.0) {
    writer.writeEnum(
      3,
      f
    );
  }
  f = message.getRiskLevel();
  if (f !== 0.0) {
    writer.writeEnum(
      4,
      f
    );
  }
  f = message.getStatus();
  if (f !== 0.0) {
    writer.writeEnum(
      5,
      f
    );
  }
  f = message.getFromDate();
  if (f != null) {
    writer.writeMessage(
      6,
      f,
      google_protobuf_timestamp_pb.Timestamp.serializeBinaryToWriter
    );
  }
  f = message.getToDate();
  if (f != null) {
    writer.writeMessage(
      7,
      f,
      google_protobuf_timestamp_pb.Timestamp.serializeBinaryToWriter
    );
  }
  f = message.getPage();
  if (f !== 0) {
    writer.writeInt32(
      8,
      f
    );
  }
  f = message.getLimit();
  if (f !== 0) {
    writer.writeInt32(
      9,
      f
    );
  }
};


/**
 * optional string user_id = 1;
 * @return {string}
 */
proto.treum.risk.ListRiskAssessmentsRequest.prototype.getUserId = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.ListRiskAssessmentsRequest} returns this
 */
proto.treum.risk.ListRiskAssessmentsRequest.prototype.setUserId = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional string account_id = 2;
 * @return {string}
 */
proto.treum.risk.ListRiskAssessmentsRequest.prototype.getAccountId = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.treum.risk.ListRiskAssessmentsRequest} returns this
 */
proto.treum.risk.ListRiskAssessmentsRequest.prototype.setAccountId = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};


/**
 * optional AssessmentType assessment_type = 3;
 * @return {!proto.treum.risk.AssessmentType}
 */
proto.treum.risk.ListRiskAssessmentsRequest.prototype.getAssessmentType = function() {
  return /** @type {!proto.treum.risk.AssessmentType} */ (jspb.Message.getFieldWithDefault(this, 3, 0));
};


/**
 * @param {!proto.treum.risk.AssessmentType} value
 * @return {!proto.treum.risk.ListRiskAssessmentsRequest} returns this
 */
proto.treum.risk.ListRiskAssessmentsRequest.prototype.setAssessmentType = function(value) {
  return jspb.Message.setProto3EnumField(this, 3, value);
};


/**
 * optional RiskLevel risk_level = 4;
 * @return {!proto.treum.risk.RiskLevel}
 */
proto.treum.risk.ListRiskAssessmentsRequest.prototype.getRiskLevel = function() {
  return /** @type {!proto.treum.risk.RiskLevel} */ (jspb.Message.getFieldWithDefault(this, 4, 0));
};


/**
 * @param {!proto.treum.risk.RiskLevel} value
 * @return {!proto.treum.risk.ListRiskAssessmentsRequest} returns this
 */
proto.treum.risk.ListRiskAssessmentsRequest.prototype.setRiskLevel = function(value) {
  return jspb.Message.setProto3EnumField(this, 4, value);
};


/**
 * optional AssessmentStatus status = 5;
 * @return {!proto.treum.risk.AssessmentStatus}
 */
proto.treum.risk.ListRiskAssessmentsRequest.prototype.getStatus = function() {
  return /** @type {!proto.treum.risk.AssessmentStatus} */ (jspb.Message.getFieldWithDefault(this, 5, 0));
};


/**
 * @param {!proto.treum.risk.AssessmentStatus} value
 * @return {!proto.treum.risk.ListRiskAssessmentsRequest} returns this
 */
proto.treum.risk.ListRiskAssessmentsRequest.prototype.setStatus = function(value) {
  return jspb.Message.setProto3EnumField(this, 5, value);
};


/**
 * optional google.protobuf.Timestamp from_date = 6;
 * @return {?proto.google.protobuf.Timestamp}
 */
proto.treum.risk.ListRiskAssessmentsRequest.prototype.getFromDate = function() {
  return /** @type{?proto.google.protobuf.Timestamp} */ (
    jspb.Message.getWrapperField(this, google_protobuf_timestamp_pb.Timestamp, 6));
};


/**
 * @param {?proto.google.protobuf.Timestamp|undefined} value
 * @return {!proto.treum.risk.ListRiskAssessmentsRequest} returns this
*/
proto.treum.risk.ListRiskAssessmentsRequest.prototype.setFromDate = function(value) {
  return jspb.Message.setWrapperField(this, 6, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.treum.risk.ListRiskAssessmentsRequest} returns this
 */
proto.treum.risk.ListRiskAssessmentsRequest.prototype.clearFromDate = function() {
  return this.setFromDate(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.treum.risk.ListRiskAssessmentsRequest.prototype.hasFromDate = function() {
  return jspb.Message.getField(this, 6) != null;
};


/**
 * optional google.protobuf.Timestamp to_date = 7;
 * @return {?proto.google.protobuf.Timestamp}
 */
proto.treum.risk.ListRiskAssessmentsRequest.prototype.getToDate = function() {
  return /** @type{?proto.google.protobuf.Timestamp} */ (
    jspb.Message.getWrapperField(this, google_protobuf_timestamp_pb.Timestamp, 7));
};


/**
 * @param {?proto.google.protobuf.Timestamp|undefined} value
 * @return {!proto.treum.risk.ListRiskAssessmentsRequest} returns this
*/
proto.treum.risk.ListRiskAssessmentsRequest.prototype.setToDate = function(value) {
  return jspb.Message.setWrapperField(this, 7, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.treum.risk.ListRiskAssessmentsRequest} returns this
 */
proto.treum.risk.ListRiskAssessmentsRequest.prototype.clearToDate = function() {
  return this.setToDate(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.treum.risk.ListRiskAssessmentsRequest.prototype.hasToDate = function() {
  return jspb.Message.getField(this, 7) != null;
};


/**
 * optional int32 page = 8;
 * @return {number}
 */
proto.treum.risk.ListRiskAssessmentsRequest.prototype.getPage = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 8, 0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.ListRiskAssessmentsRequest} returns this
 */
proto.treum.risk.ListRiskAssessmentsRequest.prototype.setPage = function(value) {
  return jspb.Message.setProto3IntField(this, 8, value);
};


/**
 * optional int32 limit = 9;
 * @return {number}
 */
proto.treum.risk.ListRiskAssessmentsRequest.prototype.getLimit = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 9, 0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.ListRiskAssessmentsRequest} returns this
 */
proto.treum.risk.ListRiskAssessmentsRequest.prototype.setLimit = function(value) {
  return jspb.Message.setProto3IntField(this, 9, value);
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.treum.risk.ListRiskAssessmentsResponse.repeatedFields_ = [1];



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.treum.risk.ListRiskAssessmentsResponse.prototype.toObject = function(opt_includeInstance) {
  return proto.treum.risk.ListRiskAssessmentsResponse.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.treum.risk.ListRiskAssessmentsResponse} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.ListRiskAssessmentsResponse.toObject = function(includeInstance, msg) {
  var f, obj = {
    assessmentsList: jspb.Message.toObjectList(msg.getAssessmentsList(),
    proto.treum.risk.RiskAssessmentResponse.toObject, includeInstance),
    total: jspb.Message.getFieldWithDefault(msg, 2, 0),
    page: jspb.Message.getFieldWithDefault(msg, 3, 0),
    limit: jspb.Message.getFieldWithDefault(msg, 4, 0),
    totalPages: jspb.Message.getFieldWithDefault(msg, 5, 0)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.treum.risk.ListRiskAssessmentsResponse}
 */
proto.treum.risk.ListRiskAssessmentsResponse.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.treum.risk.ListRiskAssessmentsResponse;
  return proto.treum.risk.ListRiskAssessmentsResponse.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.treum.risk.ListRiskAssessmentsResponse} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.treum.risk.ListRiskAssessmentsResponse}
 */
proto.treum.risk.ListRiskAssessmentsResponse.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.treum.risk.RiskAssessmentResponse;
      reader.readMessage(value,proto.treum.risk.RiskAssessmentResponse.deserializeBinaryFromReader);
      msg.addAssessments(value);
      break;
    case 2:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setTotal(value);
      break;
    case 3:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setPage(value);
      break;
    case 4:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setLimit(value);
      break;
    case 5:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setTotalPages(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.treum.risk.ListRiskAssessmentsResponse.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.treum.risk.ListRiskAssessmentsResponse.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.treum.risk.ListRiskAssessmentsResponse} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.treum.risk.ListRiskAssessmentsResponse.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getAssessmentsList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      1,
      f,
      proto.treum.risk.RiskAssessmentResponse.serializeBinaryToWriter
    );
  }
  f = message.getTotal();
  if (f !== 0) {
    writer.writeInt32(
      2,
      f
    );
  }
  f = message.getPage();
  if (f !== 0) {
    writer.writeInt32(
      3,
      f
    );
  }
  f = message.getLimit();
  if (f !== 0) {
    writer.writeInt32(
      4,
      f
    );
  }
  f = message.getTotalPages();
  if (f !== 0) {
    writer.writeInt32(
      5,
      f
    );
  }
};


/**
 * repeated RiskAssessmentResponse assessments = 1;
 * @return {!Array<!proto.treum.risk.RiskAssessmentResponse>}
 */
proto.treum.risk.ListRiskAssessmentsResponse.prototype.getAssessmentsList = function() {
  return /** @type{!Array<!proto.treum.risk.RiskAssessmentResponse>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.treum.risk.RiskAssessmentResponse, 1));
};


/**
 * @param {!Array<!proto.treum.risk.RiskAssessmentResponse>} value
 * @return {!proto.treum.risk.ListRiskAssessmentsResponse} returns this
*/
proto.treum.risk.ListRiskAssessmentsResponse.prototype.setAssessmentsList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 1, value);
};


/**
 * @param {!proto.treum.risk.RiskAssessmentResponse=} opt_value
 * @param {number=} opt_index
 * @return {!proto.treum.risk.RiskAssessmentResponse}
 */
proto.treum.risk.ListRiskAssessmentsResponse.prototype.addAssessments = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 1, opt_value, proto.treum.risk.RiskAssessmentResponse, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.treum.risk.ListRiskAssessmentsResponse} returns this
 */
proto.treum.risk.ListRiskAssessmentsResponse.prototype.clearAssessmentsList = function() {
  return this.setAssessmentsList([]);
};


/**
 * optional int32 total = 2;
 * @return {number}
 */
proto.treum.risk.ListRiskAssessmentsResponse.prototype.getTotal = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.ListRiskAssessmentsResponse} returns this
 */
proto.treum.risk.ListRiskAssessmentsResponse.prototype.setTotal = function(value) {
  return jspb.Message.setProto3IntField(this, 2, value);
};


/**
 * optional int32 page = 3;
 * @return {number}
 */
proto.treum.risk.ListRiskAssessmentsResponse.prototype.getPage = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 3, 0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.ListRiskAssessmentsResponse} returns this
 */
proto.treum.risk.ListRiskAssessmentsResponse.prototype.setPage = function(value) {
  return jspb.Message.setProto3IntField(this, 3, value);
};


/**
 * optional int32 limit = 4;
 * @return {number}
 */
proto.treum.risk.ListRiskAssessmentsResponse.prototype.getLimit = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 4, 0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.ListRiskAssessmentsResponse} returns this
 */
proto.treum.risk.ListRiskAssessmentsResponse.prototype.setLimit = function(value) {
  return jspb.Message.setProto3IntField(this, 4, value);
};


/**
 * optional int32 total_pages = 5;
 * @return {number}
 */
proto.treum.risk.ListRiskAssessmentsResponse.prototype.getTotalPages = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 5, 0));
};


/**
 * @param {number} value
 * @return {!proto.treum.risk.ListRiskAssessmentsResponse} returns this
 */
proto.treum.risk.ListRiskAssessmentsResponse.prototype.setTotalPages = function(value) {
  return jspb.Message.setProto3IntField(this, 5, value);
};


/**
 * @enum {number}
 */
proto.treum.risk.RiskLevel = {
  RISK_LEVEL_UNSPECIFIED: 0,
  VERY_LOW: 1,
  LOW: 2,
  MEDIUM: 3,
  HIGH: 4,
  VERY_HIGH: 5,
  CRITICAL: 6
};

/**
 * @enum {number}
 */
proto.treum.risk.AssessmentType = {
  ASSESSMENT_TYPE_UNSPECIFIED: 0,
  TRADE_PRE_EXECUTION: 1,
  TRADE_POST_EXECUTION: 2,
  PORTFOLIO_DAILY: 3,
  PORTFOLIO_REALTIME: 4,
  ACCOUNT_OPENING: 5,
  POSITION_MONITORING: 6,
  MARKET_EVENT: 7
};

/**
 * @enum {number}
 */
proto.treum.risk.AssessmentStatus = {
  ASSESSMENT_STATUS_UNSPECIFIED: 0,
  PENDING: 1,
  COMPLETED: 2,
  FAILED: 3,
  ESCALATED: 4
};

/**
 * @enum {number}
 */
proto.treum.risk.TradeSide = {
  TRADE_SIDE_UNSPECIFIED: 0,
  BUY: 1,
  SELL: 2
};

/**
 * @enum {number}
 */
proto.treum.risk.ComplianceType = {
  COMPLIANCE_TYPE_UNSPECIFIED: 0,
  KYC: 1,
  AML: 2,
  CDD: 3,
  EDD: 4,
  SANCTIONS: 5,
  PEP: 6,
  TRADE_SURVEILLANCE: 7,
  POSITION_LIMITS: 8,
  MARKET_ABUSE: 9,
  INSIDER_TRADING: 10,
  MIFID_II: 11,
  GDPR: 12,
  SOX: 13,
  DODD_FRANK: 14
};

/**
 * @enum {number}
 */
proto.treum.risk.ComplianceStatus = {
  COMPLIANCE_STATUS_UNSPECIFIED: 0,
  COMPLIANCE_PENDING: 1,
  PASSED: 2,
  COMPLIANCE_FAILED: 3,
  REQUIRES_REVIEW: 4,
  COMPLIANCE_ESCALATED: 5,
  EXPIRED: 6
};

/**
 * @enum {number}
 */
proto.treum.risk.ComplianceSeverity = {
  COMPLIANCE_SEVERITY_UNSPECIFIED: 0,
  INFO: 1,
  WARNING: 2,
  MINOR: 3,
  MAJOR: 4,
  COMPLIANCE_CRITICAL: 5,
  REGULATORY_BREACH: 6
};

/**
 * @enum {number}
 */
proto.treum.risk.DocumentType = {
  DOCUMENT_TYPE_UNSPECIFIED: 0,
  PASSPORT: 1,
  DRIVING_LICENSE: 2,
  UTILITY_BILL: 3,
  BANK_STATEMENT: 4,
  TAX_DOCUMENT: 5
};

/**
 * @enum {number}
 */
proto.treum.risk.RiskProfile = {
  RISK_PROFILE_UNSPECIFIED: 0,
  RISK_LOW: 1,
  RISK_MEDIUM: 2,
  RISK_HIGH: 3
};

/**
 * @enum {number}
 */
proto.treum.risk.InvestmentExperience = {
  INVESTMENT_EXPERIENCE_UNSPECIFIED: 0,
  BEGINNER: 1,
  INTERMEDIATE: 2,
  EXPERIENCED: 3,
  PROFESSIONAL: 4
};

/**
 * @enum {number}
 */
proto.treum.risk.GeographicRisk = {
  GEOGRAPHIC_RISK_UNSPECIFIED: 0,
  GEO_LOW: 1,
  GEO_MEDIUM: 2,
  GEO_HIGH: 3
};

/**
 * @enum {number}
 */
proto.treum.risk.AlertType = {
  ALERT_TYPE_UNSPECIFIED: 0,
  RISK_LIMIT_BREACH: 1,
  POSITION_CONCENTRATION: 2,
  DRAWDOWN_THRESHOLD: 3,
  VOLATILITY_SPIKE: 4,
  LIQUIDITY_RISK: 5,
  COUNTERPARTY_RISK: 6,
  MARGIN_CALL: 7,
  SUSPICIOUS_ACTIVITY: 8,
  COMPLIANCE_VIOLATION: 9,
  SYSTEM_ANOMALY: 10,
  FRAUD_DETECTION: 11,
  MARKET_DISRUPTION: 12,
  CORRELATION_BREAKDOWN: 13,
  VAR_BREACH: 14,
  STRESS_TEST_FAILURE: 15
};

/**
 * @enum {number}
 */
proto.treum.risk.AlertSeverity = {
  ALERT_SEVERITY_UNSPECIFIED: 0,
  ALERT_INFO: 1,
  ALERT_LOW: 2,
  ALERT_MEDIUM: 3,
  ALERT_HIGH: 4,
  ALERT_CRITICAL: 5,
  EMERGENCY: 6
};

/**
 * @enum {number}
 */
proto.treum.risk.AlertStatus = {
  ALERT_STATUS_UNSPECIFIED: 0,
  ACTIVE: 1,
  ACKNOWLEDGED: 2,
  IN_PROGRESS: 3,
  RESOLVED: 4,
  DISMISSED: 5,
  ALERT_ESCALATED: 6,
  ALERT_EXPIRED: 7
};

/**
 * @enum {number}
 */
proto.treum.risk.AlertPriority = {
  ALERT_PRIORITY_UNSPECIFIED: 0,
  P1: 1,
  P2: 2,
  P3: 3,
  P4: 4,
  P5: 5
};

/**
 * @enum {number}
 */
proto.treum.risk.LimitType = {
  LIMIT_TYPE_UNSPECIFIED: 0,
  POSITION_SIZE: 1,
  PORTFOLIO_VALUE: 2,
  DAILY_LOSS: 3,
  WEEKLY_LOSS: 4,
  MONTHLY_LOSS: 5,
  DRAWDOWN: 6,
  LEVERAGE: 7,
  CONCENTRATION: 8,
  VAR_LIMIT: 9,
  SECTOR_EXPOSURE: 10,
  CURRENCY_EXPOSURE: 11,
  COUNTERPARTY_EXPOSURE: 12,
  TRADE_COUNT: 13,
  TRADE_SIZE: 14,
  INTRADAY_LOSS: 15,
  VOLATILITY_LIMIT: 16,
  CORRELATION_LIMIT: 17
};

/**
 * @enum {number}
 */
proto.treum.risk.LimitScope = {
  LIMIT_SCOPE_UNSPECIFIED: 0,
  USER: 1,
  ACCOUNT: 2,
  PORTFOLIO: 3,
  ASSET_CLASS: 4,
  SECTOR: 5,
  SYMBOL: 6,
  STRATEGY: 7,
  GLOBAL: 8
};

/**
 * @enum {number}
 */
proto.treum.risk.LimitStatus = {
  LIMIT_STATUS_UNSPECIFIED: 0,
  LIMIT_ACTIVE: 1,
  INACTIVE: 2,
  SUSPENDED: 3,
  BREACHED: 4,
  LIMIT_WARNING: 5,
  LIMIT_EXPIRED: 6
};

/**
 * @enum {number}
 */
proto.treum.risk.LimitFrequency = {
  LIMIT_FREQUENCY_UNSPECIFIED: 0,
  REALTIME: 1,
  INTRADAY: 2,
  DAILY: 3,
  WEEKLY: 4,
  MONTHLY: 5,
  QUARTERLY: 6,
  ANNUALLY: 7
};

/**
 * @enum {number}
 */
proto.treum.risk.MetricType = {
  METRIC_TYPE_UNSPECIFIED: 0,
  VALUE_AT_RISK: 1,
  EXPECTED_SHORTFALL: 2,
  MAXIMUM_DRAWDOWN: 3,
  SHARPE_RATIO: 4,
  SORTINO_RATIO: 5,
  METRIC_VOLATILITY: 6,
  BETA: 7,
  ALPHA: 8,
  CORRELATION: 9,
  PORTFOLIO_CONCENTRATION: 10,
  LEVERAGE_RATIO: 11,
  LIQUIDITY_RATIO: 12,
  SECTOR_CONCENTRATION: 13,
  METRIC_CURRENCY_EXPOSURE: 14,
  MARGIN_UTILIZATION: 15,
  POSITION_SIZE_RISK: 16,
  METRIC_COUNTERPARTY_RISK: 17
};

/**
 * @enum {number}
 */
proto.treum.risk.MetricScope = {
  METRIC_SCOPE_UNSPECIFIED: 0,
  METRIC_USER: 1,
  METRIC_ACCOUNT: 2,
  METRIC_PORTFOLIO: 3,
  POSITION: 4,
  METRIC_ASSET_CLASS: 5,
  METRIC_SECTOR: 6,
  METRIC_GLOBAL: 7
};

/**
 * @enum {number}
 */
proto.treum.risk.MetricFrequency = {
  METRIC_FREQUENCY_UNSPECIFIED: 0,
  METRIC_REALTIME: 1,
  MINUTELY: 2,
  HOURLY: 3,
  METRIC_DAILY: 4,
  METRIC_WEEKLY: 5,
  METRIC_MONTHLY: 6
};

/**
 * @enum {number}
 */
proto.treum.risk.FraudRecommendation = {
  FRAUD_RECOMMENDATION_UNSPECIFIED: 0,
  ALLOW: 1,
  CHALLENGE: 2,
  BLOCK: 3,
  REVIEW: 4
};

/**
 * @enum {number}
 */
proto.treum.risk.FraudSeverity = {
  FRAUD_SEVERITY_UNSPECIFIED: 0,
  FRAUD_LOW: 1,
  FRAUD_MEDIUM: 2,
  FRAUD_HIGH: 3,
  FRAUD_CRITICAL: 4
};

/**
 * @enum {number}
 */
proto.treum.risk.FraudTrend = {
  FRAUD_TREND_UNSPECIFIED: 0,
  INCREASING: 1,
  DECREASING: 2,
  STABLE: 3
};

goog.object.extend(exports, proto.treum.risk);
