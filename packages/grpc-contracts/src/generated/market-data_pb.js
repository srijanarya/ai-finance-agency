// source: market-data.proto
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

var common_pb = require('./common_pb.js');
goog.object.extend(proto, common_pb);
var google_protobuf_empty_pb = require('google-protobuf/google/protobuf/empty_pb.js');
goog.object.extend(proto, google_protobuf_empty_pb);
goog.exportSymbol('proto.marketdata.AddToWatchlistRequest', null, global);
goog.exportSymbol('proto.marketdata.Alert', null, global);
goog.exportSymbol('proto.marketdata.AlertPriority', null, global);
goog.exportSymbol('proto.marketdata.AlertResponse', null, global);
goog.exportSymbol('proto.marketdata.AlertStatisticsResponse', null, global);
goog.exportSymbol('proto.marketdata.AlertStatus', null, global);
goog.exportSymbol('proto.marketdata.AlertType', null, global);
goog.exportSymbol('proto.marketdata.BatchMarketDataResponse', null, global);
goog.exportSymbol('proto.marketdata.BollingerBands', null, global);
goog.exportSymbol('proto.marketdata.BollingerBandsCurrent', null, global);
goog.exportSymbol('proto.marketdata.BollingerBandsResponse', null, global);
goog.exportSymbol('proto.marketdata.BollingerBandsValue', null, global);
goog.exportSymbol('proto.marketdata.ComprehensiveAnalysis', null, global);
goog.exportSymbol('proto.marketdata.ComprehensiveAnalysisResponse', null, global);
goog.exportSymbol('proto.marketdata.CreateAlertRequest', null, global);
goog.exportSymbol('proto.marketdata.DataSource', null, global);
goog.exportSymbol('proto.marketdata.DeleteAlertRequest', null, global);
goog.exportSymbol('proto.marketdata.GetAlertStatisticsRequest', null, global);
goog.exportSymbol('proto.marketdata.GetBatchRealtimeDataRequest', null, global);
goog.exportSymbol('proto.marketdata.GetBollingerBandsRequest', null, global);
goog.exportSymbol('proto.marketdata.GetComprehensiveAnalysisRequest', null, global);
goog.exportSymbol('proto.marketdata.GetHistoricalDataRequest', null, global);
goog.exportSymbol('proto.marketdata.GetMACDRequest', null, global);
goog.exportSymbol('proto.marketdata.GetMovingAverageRequest', null, global);
goog.exportSymbol('proto.marketdata.GetOHLCDataRequest', null, global);
goog.exportSymbol('proto.marketdata.GetRSIRequest', null, global);
goog.exportSymbol('proto.marketdata.GetRealtimeDataRequest', null, global);
goog.exportSymbol('proto.marketdata.GetStochasticRequest', null, global);
goog.exportSymbol('proto.marketdata.GetUserAlertsRequest', null, global);
goog.exportSymbol('proto.marketdata.GetUserWatchlistRequest', null, global);
goog.exportSymbol('proto.marketdata.GetVolumeIndicatorsRequest', null, global);
goog.exportSymbol('proto.marketdata.GetVolumeProfileRequest', null, global);
goog.exportSymbol('proto.marketdata.GetWatchlistStatisticsRequest', null, global);
goog.exportSymbol('proto.marketdata.HistoricalDataPoint', null, global);
goog.exportSymbol('proto.marketdata.HistoricalDataResponse', null, global);
goog.exportSymbol('proto.marketdata.MACD', null, global);
goog.exportSymbol('proto.marketdata.MACDCurrent', null, global);
goog.exportSymbol('proto.marketdata.MACDResponse', null, global);
goog.exportSymbol('proto.marketdata.MACDValue', null, global);
goog.exportSymbol('proto.marketdata.MarketDataPoint', null, global);
goog.exportSymbol('proto.marketdata.MarketDataResponse', null, global);
goog.exportSymbol('proto.marketdata.MovingAverage', null, global);
goog.exportSymbol('proto.marketdata.MovingAverageResponse', null, global);
goog.exportSymbol('proto.marketdata.MovingAverageValue', null, global);
goog.exportSymbol('proto.marketdata.OBVValue', null, global);
goog.exportSymbol('proto.marketdata.OHLCDataResponse', null, global);
goog.exportSymbol('proto.marketdata.RSI', null, global);
goog.exportSymbol('proto.marketdata.RSIResponse', null, global);
goog.exportSymbol('proto.marketdata.RSIValue', null, global);
goog.exportSymbol('proto.marketdata.RemoveFromWatchlistRequest', null, global);
goog.exportSymbol('proto.marketdata.SearchSymbolsRequest', null, global);
goog.exportSymbol('proto.marketdata.SearchSymbolsResponse', null, global);
goog.exportSymbol('proto.marketdata.Signal', null, global);
goog.exportSymbol('proto.marketdata.Stochastic', null, global);
goog.exportSymbol('proto.marketdata.StochasticCurrent', null, global);
goog.exportSymbol('proto.marketdata.StochasticResponse', null, global);
goog.exportSymbol('proto.marketdata.StochasticValue', null, global);
goog.exportSymbol('proto.marketdata.StreamMarketDataRequest', null, global);
goog.exportSymbol('proto.marketdata.SymbolCount', null, global);
goog.exportSymbol('proto.marketdata.TagCount', null, global);
goog.exportSymbol('proto.marketdata.TimeInterval', null, global);
goog.exportSymbol('proto.marketdata.TypeCount', null, global);
goog.exportSymbol('proto.marketdata.UpdateAlertRequest', null, global);
goog.exportSymbol('proto.marketdata.UpdateWatchlistItemRequest', null, global);
goog.exportSymbol('proto.marketdata.UserAlertsResponse', null, global);
goog.exportSymbol('proto.marketdata.UserWatchlistResponse', null, global);
goog.exportSymbol('proto.marketdata.VolumeIndicators', null, global);
goog.exportSymbol('proto.marketdata.VolumeIndicatorsResponse', null, global);
goog.exportSymbol('proto.marketdata.VolumeProfileLevel', null, global);
goog.exportSymbol('proto.marketdata.VolumeProfileResponse', null, global);
goog.exportSymbol('proto.marketdata.VolumeSMAValue', null, global);
goog.exportSymbol('proto.marketdata.WatchlistItem', null, global);
goog.exportSymbol('proto.marketdata.WatchlistItemResponse', null, global);
goog.exportSymbol('proto.marketdata.WatchlistItemWithMarketData', null, global);
goog.exportSymbol('proto.marketdata.WatchlistStatisticsResponse', null, global);
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
proto.marketdata.MarketDataPoint = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.marketdata.MarketDataPoint, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.marketdata.MarketDataPoint.displayName = 'proto.marketdata.MarketDataPoint';
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
proto.marketdata.HistoricalDataPoint = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.marketdata.HistoricalDataPoint, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.marketdata.HistoricalDataPoint.displayName = 'proto.marketdata.HistoricalDataPoint';
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
proto.marketdata.Alert = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.marketdata.Alert.repeatedFields_, null);
};
goog.inherits(proto.marketdata.Alert, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.marketdata.Alert.displayName = 'proto.marketdata.Alert';
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
proto.marketdata.WatchlistItem = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.marketdata.WatchlistItem.repeatedFields_, null);
};
goog.inherits(proto.marketdata.WatchlistItem, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.marketdata.WatchlistItem.displayName = 'proto.marketdata.WatchlistItem';
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
proto.marketdata.WatchlistItemWithMarketData = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.marketdata.WatchlistItemWithMarketData, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.marketdata.WatchlistItemWithMarketData.displayName = 'proto.marketdata.WatchlistItemWithMarketData';
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
proto.marketdata.RSIValue = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.marketdata.RSIValue, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.marketdata.RSIValue.displayName = 'proto.marketdata.RSIValue';
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
proto.marketdata.RSI = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.marketdata.RSI.repeatedFields_, null);
};
goog.inherits(proto.marketdata.RSI, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.marketdata.RSI.displayName = 'proto.marketdata.RSI';
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
proto.marketdata.MACDValue = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.marketdata.MACDValue, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.marketdata.MACDValue.displayName = 'proto.marketdata.MACDValue';
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
proto.marketdata.MACDCurrent = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.marketdata.MACDCurrent, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.marketdata.MACDCurrent.displayName = 'proto.marketdata.MACDCurrent';
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
proto.marketdata.MACD = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.marketdata.MACD.repeatedFields_, null);
};
goog.inherits(proto.marketdata.MACD, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.marketdata.MACD.displayName = 'proto.marketdata.MACD';
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
proto.marketdata.BollingerBandsValue = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.marketdata.BollingerBandsValue, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.marketdata.BollingerBandsValue.displayName = 'proto.marketdata.BollingerBandsValue';
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
proto.marketdata.BollingerBandsCurrent = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.marketdata.BollingerBandsCurrent, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.marketdata.BollingerBandsCurrent.displayName = 'proto.marketdata.BollingerBandsCurrent';
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
proto.marketdata.BollingerBands = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.marketdata.BollingerBands.repeatedFields_, null);
};
goog.inherits(proto.marketdata.BollingerBands, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.marketdata.BollingerBands.displayName = 'proto.marketdata.BollingerBands';
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
proto.marketdata.MovingAverageValue = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.marketdata.MovingAverageValue, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.marketdata.MovingAverageValue.displayName = 'proto.marketdata.MovingAverageValue';
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
proto.marketdata.MovingAverage = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.marketdata.MovingAverage.repeatedFields_, null);
};
goog.inherits(proto.marketdata.MovingAverage, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.marketdata.MovingAverage.displayName = 'proto.marketdata.MovingAverage';
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
proto.marketdata.StochasticValue = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.marketdata.StochasticValue, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.marketdata.StochasticValue.displayName = 'proto.marketdata.StochasticValue';
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
proto.marketdata.StochasticCurrent = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.marketdata.StochasticCurrent, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.marketdata.StochasticCurrent.displayName = 'proto.marketdata.StochasticCurrent';
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
proto.marketdata.Stochastic = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.marketdata.Stochastic.repeatedFields_, null);
};
goog.inherits(proto.marketdata.Stochastic, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.marketdata.Stochastic.displayName = 'proto.marketdata.Stochastic';
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
proto.marketdata.OBVValue = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.marketdata.OBVValue, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.marketdata.OBVValue.displayName = 'proto.marketdata.OBVValue';
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
proto.marketdata.VolumeSMAValue = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.marketdata.VolumeSMAValue, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.marketdata.VolumeSMAValue.displayName = 'proto.marketdata.VolumeSMAValue';
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
proto.marketdata.VolumeIndicators = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.marketdata.VolumeIndicators.repeatedFields_, null);
};
goog.inherits(proto.marketdata.VolumeIndicators, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.marketdata.VolumeIndicators.displayName = 'proto.marketdata.VolumeIndicators';
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
proto.marketdata.VolumeProfileLevel = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.marketdata.VolumeProfileLevel, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.marketdata.VolumeProfileLevel.displayName = 'proto.marketdata.VolumeProfileLevel';
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
proto.marketdata.Signal = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.marketdata.Signal, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.marketdata.Signal.displayName = 'proto.marketdata.Signal';
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
proto.marketdata.ComprehensiveAnalysis = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.marketdata.ComprehensiveAnalysis.repeatedFields_, null);
};
goog.inherits(proto.marketdata.ComprehensiveAnalysis, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.marketdata.ComprehensiveAnalysis.displayName = 'proto.marketdata.ComprehensiveAnalysis';
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
proto.marketdata.GetRealtimeDataRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.marketdata.GetRealtimeDataRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.marketdata.GetRealtimeDataRequest.displayName = 'proto.marketdata.GetRealtimeDataRequest';
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
proto.marketdata.GetBatchRealtimeDataRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.marketdata.GetBatchRealtimeDataRequest.repeatedFields_, null);
};
goog.inherits(proto.marketdata.GetBatchRealtimeDataRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.marketdata.GetBatchRealtimeDataRequest.displayName = 'proto.marketdata.GetBatchRealtimeDataRequest';
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
proto.marketdata.StreamMarketDataRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.marketdata.StreamMarketDataRequest.repeatedFields_, null);
};
goog.inherits(proto.marketdata.StreamMarketDataRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.marketdata.StreamMarketDataRequest.displayName = 'proto.marketdata.StreamMarketDataRequest';
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
proto.marketdata.GetHistoricalDataRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.marketdata.GetHistoricalDataRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.marketdata.GetHistoricalDataRequest.displayName = 'proto.marketdata.GetHistoricalDataRequest';
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
proto.marketdata.GetOHLCDataRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.marketdata.GetOHLCDataRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.marketdata.GetOHLCDataRequest.displayName = 'proto.marketdata.GetOHLCDataRequest';
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
proto.marketdata.GetVolumeProfileRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.marketdata.GetVolumeProfileRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.marketdata.GetVolumeProfileRequest.displayName = 'proto.marketdata.GetVolumeProfileRequest';
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
proto.marketdata.GetRSIRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.marketdata.GetRSIRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.marketdata.GetRSIRequest.displayName = 'proto.marketdata.GetRSIRequest';
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
proto.marketdata.GetMACDRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.marketdata.GetMACDRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.marketdata.GetMACDRequest.displayName = 'proto.marketdata.GetMACDRequest';
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
proto.marketdata.GetBollingerBandsRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.marketdata.GetBollingerBandsRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.marketdata.GetBollingerBandsRequest.displayName = 'proto.marketdata.GetBollingerBandsRequest';
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
proto.marketdata.GetMovingAverageRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.marketdata.GetMovingAverageRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.marketdata.GetMovingAverageRequest.displayName = 'proto.marketdata.GetMovingAverageRequest';
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
proto.marketdata.GetStochasticRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.marketdata.GetStochasticRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.marketdata.GetStochasticRequest.displayName = 'proto.marketdata.GetStochasticRequest';
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
proto.marketdata.GetVolumeIndicatorsRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.marketdata.GetVolumeIndicatorsRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.marketdata.GetVolumeIndicatorsRequest.displayName = 'proto.marketdata.GetVolumeIndicatorsRequest';
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
proto.marketdata.GetComprehensiveAnalysisRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.marketdata.GetComprehensiveAnalysisRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.marketdata.GetComprehensiveAnalysisRequest.displayName = 'proto.marketdata.GetComprehensiveAnalysisRequest';
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
proto.marketdata.CreateAlertRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.marketdata.CreateAlertRequest.repeatedFields_, null);
};
goog.inherits(proto.marketdata.CreateAlertRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.marketdata.CreateAlertRequest.displayName = 'proto.marketdata.CreateAlertRequest';
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
proto.marketdata.UpdateAlertRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.marketdata.UpdateAlertRequest.repeatedFields_, null);
};
goog.inherits(proto.marketdata.UpdateAlertRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.marketdata.UpdateAlertRequest.displayName = 'proto.marketdata.UpdateAlertRequest';
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
proto.marketdata.DeleteAlertRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.marketdata.DeleteAlertRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.marketdata.DeleteAlertRequest.displayName = 'proto.marketdata.DeleteAlertRequest';
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
proto.marketdata.GetUserAlertsRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.marketdata.GetUserAlertsRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.marketdata.GetUserAlertsRequest.displayName = 'proto.marketdata.GetUserAlertsRequest';
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
proto.marketdata.GetAlertStatisticsRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.marketdata.GetAlertStatisticsRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.marketdata.GetAlertStatisticsRequest.displayName = 'proto.marketdata.GetAlertStatisticsRequest';
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
proto.marketdata.AddToWatchlistRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.marketdata.AddToWatchlistRequest.repeatedFields_, null);
};
goog.inherits(proto.marketdata.AddToWatchlistRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.marketdata.AddToWatchlistRequest.displayName = 'proto.marketdata.AddToWatchlistRequest';
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
proto.marketdata.RemoveFromWatchlistRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.marketdata.RemoveFromWatchlistRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.marketdata.RemoveFromWatchlistRequest.displayName = 'proto.marketdata.RemoveFromWatchlistRequest';
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
proto.marketdata.GetUserWatchlistRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.marketdata.GetUserWatchlistRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.marketdata.GetUserWatchlistRequest.displayName = 'proto.marketdata.GetUserWatchlistRequest';
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
proto.marketdata.UpdateWatchlistItemRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.marketdata.UpdateWatchlistItemRequest.repeatedFields_, null);
};
goog.inherits(proto.marketdata.UpdateWatchlistItemRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.marketdata.UpdateWatchlistItemRequest.displayName = 'proto.marketdata.UpdateWatchlistItemRequest';
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
proto.marketdata.GetWatchlistStatisticsRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.marketdata.GetWatchlistStatisticsRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.marketdata.GetWatchlistStatisticsRequest.displayName = 'proto.marketdata.GetWatchlistStatisticsRequest';
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
proto.marketdata.SearchSymbolsRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.marketdata.SearchSymbolsRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.marketdata.SearchSymbolsRequest.displayName = 'proto.marketdata.SearchSymbolsRequest';
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
proto.marketdata.MarketDataResponse = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.marketdata.MarketDataResponse, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.marketdata.MarketDataResponse.displayName = 'proto.marketdata.MarketDataResponse';
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
proto.marketdata.BatchMarketDataResponse = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.marketdata.BatchMarketDataResponse.repeatedFields_, null);
};
goog.inherits(proto.marketdata.BatchMarketDataResponse, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.marketdata.BatchMarketDataResponse.displayName = 'proto.marketdata.BatchMarketDataResponse';
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
proto.marketdata.HistoricalDataResponse = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.marketdata.HistoricalDataResponse.repeatedFields_, null);
};
goog.inherits(proto.marketdata.HistoricalDataResponse, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.marketdata.HistoricalDataResponse.displayName = 'proto.marketdata.HistoricalDataResponse';
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
proto.marketdata.OHLCDataResponse = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.marketdata.OHLCDataResponse.repeatedFields_, null);
};
goog.inherits(proto.marketdata.OHLCDataResponse, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.marketdata.OHLCDataResponse.displayName = 'proto.marketdata.OHLCDataResponse';
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
proto.marketdata.VolumeProfileResponse = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.marketdata.VolumeProfileResponse.repeatedFields_, null);
};
goog.inherits(proto.marketdata.VolumeProfileResponse, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.marketdata.VolumeProfileResponse.displayName = 'proto.marketdata.VolumeProfileResponse';
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
proto.marketdata.RSIResponse = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.marketdata.RSIResponse, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.marketdata.RSIResponse.displayName = 'proto.marketdata.RSIResponse';
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
proto.marketdata.MACDResponse = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.marketdata.MACDResponse, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.marketdata.MACDResponse.displayName = 'proto.marketdata.MACDResponse';
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
proto.marketdata.BollingerBandsResponse = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.marketdata.BollingerBandsResponse, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.marketdata.BollingerBandsResponse.displayName = 'proto.marketdata.BollingerBandsResponse';
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
proto.marketdata.MovingAverageResponse = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.marketdata.MovingAverageResponse, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.marketdata.MovingAverageResponse.displayName = 'proto.marketdata.MovingAverageResponse';
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
proto.marketdata.StochasticResponse = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.marketdata.StochasticResponse, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.marketdata.StochasticResponse.displayName = 'proto.marketdata.StochasticResponse';
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
proto.marketdata.VolumeIndicatorsResponse = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.marketdata.VolumeIndicatorsResponse, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.marketdata.VolumeIndicatorsResponse.displayName = 'proto.marketdata.VolumeIndicatorsResponse';
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
proto.marketdata.ComprehensiveAnalysisResponse = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.marketdata.ComprehensiveAnalysisResponse, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.marketdata.ComprehensiveAnalysisResponse.displayName = 'proto.marketdata.ComprehensiveAnalysisResponse';
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
proto.marketdata.AlertResponse = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.marketdata.AlertResponse, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.marketdata.AlertResponse.displayName = 'proto.marketdata.AlertResponse';
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
proto.marketdata.UserAlertsResponse = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.marketdata.UserAlertsResponse.repeatedFields_, null);
};
goog.inherits(proto.marketdata.UserAlertsResponse, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.marketdata.UserAlertsResponse.displayName = 'proto.marketdata.UserAlertsResponse';
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
proto.marketdata.AlertStatisticsResponse = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.marketdata.AlertStatisticsResponse.repeatedFields_, null);
};
goog.inherits(proto.marketdata.AlertStatisticsResponse, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.marketdata.AlertStatisticsResponse.displayName = 'proto.marketdata.AlertStatisticsResponse';
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
proto.marketdata.SymbolCount = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.marketdata.SymbolCount, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.marketdata.SymbolCount.displayName = 'proto.marketdata.SymbolCount';
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
proto.marketdata.TypeCount = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.marketdata.TypeCount, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.marketdata.TypeCount.displayName = 'proto.marketdata.TypeCount';
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
proto.marketdata.WatchlistItemResponse = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.marketdata.WatchlistItemResponse, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.marketdata.WatchlistItemResponse.displayName = 'proto.marketdata.WatchlistItemResponse';
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
proto.marketdata.UserWatchlistResponse = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.marketdata.UserWatchlistResponse.repeatedFields_, null);
};
goog.inherits(proto.marketdata.UserWatchlistResponse, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.marketdata.UserWatchlistResponse.displayName = 'proto.marketdata.UserWatchlistResponse';
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
proto.marketdata.WatchlistStatisticsResponse = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.marketdata.WatchlistStatisticsResponse.repeatedFields_, null);
};
goog.inherits(proto.marketdata.WatchlistStatisticsResponse, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.marketdata.WatchlistStatisticsResponse.displayName = 'proto.marketdata.WatchlistStatisticsResponse';
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
proto.marketdata.TagCount = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.marketdata.TagCount, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.marketdata.TagCount.displayName = 'proto.marketdata.TagCount';
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
proto.marketdata.SearchSymbolsResponse = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.marketdata.SearchSymbolsResponse.repeatedFields_, null);
};
goog.inherits(proto.marketdata.SearchSymbolsResponse, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.marketdata.SearchSymbolsResponse.displayName = 'proto.marketdata.SearchSymbolsResponse';
}



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
proto.marketdata.MarketDataPoint.prototype.toObject = function(opt_includeInstance) {
  return proto.marketdata.MarketDataPoint.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.marketdata.MarketDataPoint} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.MarketDataPoint.toObject = function(includeInstance, msg) {
  var f, obj = {
    symbol: jspb.Message.getFieldWithDefault(msg, 1, ""),
    price: jspb.Message.getFloatingPointFieldWithDefault(msg, 2, 0.0),
    bid: jspb.Message.getFloatingPointFieldWithDefault(msg, 3, 0.0),
    ask: jspb.Message.getFloatingPointFieldWithDefault(msg, 4, 0.0),
    bidSize: jspb.Message.getFloatingPointFieldWithDefault(msg, 5, 0.0),
    askSize: jspb.Message.getFloatingPointFieldWithDefault(msg, 6, 0.0),
    volume: jspb.Message.getFieldWithDefault(msg, 7, 0),
    previousClose: jspb.Message.getFloatingPointFieldWithDefault(msg, 8, 0.0),
    change: jspb.Message.getFloatingPointFieldWithDefault(msg, 9, 0.0),
    changePercent: jspb.Message.getFloatingPointFieldWithDefault(msg, 10, 0.0),
    dayHigh: jspb.Message.getFloatingPointFieldWithDefault(msg, 11, 0.0),
    dayLow: jspb.Message.getFloatingPointFieldWithDefault(msg, 12, 0.0),
    marketCap: jspb.Message.getFieldWithDefault(msg, 13, 0),
    source: jspb.Message.getFieldWithDefault(msg, 14, 0),
    timestamp: jspb.Message.getFieldWithDefault(msg, 15, 0),
    isMarketOpen: jspb.Message.getBooleanFieldWithDefault(msg, 16, false),
    marketSession: jspb.Message.getFieldWithDefault(msg, 17, "")
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
 * @return {!proto.marketdata.MarketDataPoint}
 */
proto.marketdata.MarketDataPoint.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.marketdata.MarketDataPoint;
  return proto.marketdata.MarketDataPoint.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.marketdata.MarketDataPoint} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.marketdata.MarketDataPoint}
 */
proto.marketdata.MarketDataPoint.deserializeBinaryFromReader = function(msg, reader) {
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
      msg.setPrice(value);
      break;
    case 3:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setBid(value);
      break;
    case 4:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setAsk(value);
      break;
    case 5:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setBidSize(value);
      break;
    case 6:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setAskSize(value);
      break;
    case 7:
      var value = /** @type {number} */ (reader.readInt64());
      msg.setVolume(value);
      break;
    case 8:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setPreviousClose(value);
      break;
    case 9:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setChange(value);
      break;
    case 10:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setChangePercent(value);
      break;
    case 11:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setDayHigh(value);
      break;
    case 12:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setDayLow(value);
      break;
    case 13:
      var value = /** @type {number} */ (reader.readInt64());
      msg.setMarketCap(value);
      break;
    case 14:
      var value = /** @type {!proto.marketdata.DataSource} */ (reader.readEnum());
      msg.setSource(value);
      break;
    case 15:
      var value = /** @type {number} */ (reader.readInt64());
      msg.setTimestamp(value);
      break;
    case 16:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setIsMarketOpen(value);
      break;
    case 17:
      var value = /** @type {string} */ (reader.readString());
      msg.setMarketSession(value);
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
proto.marketdata.MarketDataPoint.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.marketdata.MarketDataPoint.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.marketdata.MarketDataPoint} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.MarketDataPoint.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getSymbol();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getPrice();
  if (f !== 0.0) {
    writer.writeDouble(
      2,
      f
    );
  }
  f = /** @type {number} */ (jspb.Message.getField(message, 3));
  if (f != null) {
    writer.writeDouble(
      3,
      f
    );
  }
  f = /** @type {number} */ (jspb.Message.getField(message, 4));
  if (f != null) {
    writer.writeDouble(
      4,
      f
    );
  }
  f = /** @type {number} */ (jspb.Message.getField(message, 5));
  if (f != null) {
    writer.writeDouble(
      5,
      f
    );
  }
  f = /** @type {number} */ (jspb.Message.getField(message, 6));
  if (f != null) {
    writer.writeDouble(
      6,
      f
    );
  }
  f = message.getVolume();
  if (f !== 0) {
    writer.writeInt64(
      7,
      f
    );
  }
  f = /** @type {number} */ (jspb.Message.getField(message, 8));
  if (f != null) {
    writer.writeDouble(
      8,
      f
    );
  }
  f = /** @type {number} */ (jspb.Message.getField(message, 9));
  if (f != null) {
    writer.writeDouble(
      9,
      f
    );
  }
  f = /** @type {number} */ (jspb.Message.getField(message, 10));
  if (f != null) {
    writer.writeDouble(
      10,
      f
    );
  }
  f = /** @type {number} */ (jspb.Message.getField(message, 11));
  if (f != null) {
    writer.writeDouble(
      11,
      f
    );
  }
  f = /** @type {number} */ (jspb.Message.getField(message, 12));
  if (f != null) {
    writer.writeDouble(
      12,
      f
    );
  }
  f = /** @type {number} */ (jspb.Message.getField(message, 13));
  if (f != null) {
    writer.writeInt64(
      13,
      f
    );
  }
  f = message.getSource();
  if (f !== 0.0) {
    writer.writeEnum(
      14,
      f
    );
  }
  f = message.getTimestamp();
  if (f !== 0) {
    writer.writeInt64(
      15,
      f
    );
  }
  f = message.getIsMarketOpen();
  if (f) {
    writer.writeBool(
      16,
      f
    );
  }
  f = /** @type {string} */ (jspb.Message.getField(message, 17));
  if (f != null) {
    writer.writeString(
      17,
      f
    );
  }
};


/**
 * optional string symbol = 1;
 * @return {string}
 */
proto.marketdata.MarketDataPoint.prototype.getSymbol = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.marketdata.MarketDataPoint} returns this
 */
proto.marketdata.MarketDataPoint.prototype.setSymbol = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional double price = 2;
 * @return {number}
 */
proto.marketdata.MarketDataPoint.prototype.getPrice = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 2, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.MarketDataPoint} returns this
 */
proto.marketdata.MarketDataPoint.prototype.setPrice = function(value) {
  return jspb.Message.setProto3FloatField(this, 2, value);
};


/**
 * optional double bid = 3;
 * @return {number}
 */
proto.marketdata.MarketDataPoint.prototype.getBid = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 3, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.MarketDataPoint} returns this
 */
proto.marketdata.MarketDataPoint.prototype.setBid = function(value) {
  return jspb.Message.setField(this, 3, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.marketdata.MarketDataPoint} returns this
 */
proto.marketdata.MarketDataPoint.prototype.clearBid = function() {
  return jspb.Message.setField(this, 3, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.marketdata.MarketDataPoint.prototype.hasBid = function() {
  return jspb.Message.getField(this, 3) != null;
};


/**
 * optional double ask = 4;
 * @return {number}
 */
proto.marketdata.MarketDataPoint.prototype.getAsk = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 4, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.MarketDataPoint} returns this
 */
proto.marketdata.MarketDataPoint.prototype.setAsk = function(value) {
  return jspb.Message.setField(this, 4, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.marketdata.MarketDataPoint} returns this
 */
proto.marketdata.MarketDataPoint.prototype.clearAsk = function() {
  return jspb.Message.setField(this, 4, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.marketdata.MarketDataPoint.prototype.hasAsk = function() {
  return jspb.Message.getField(this, 4) != null;
};


/**
 * optional double bid_size = 5;
 * @return {number}
 */
proto.marketdata.MarketDataPoint.prototype.getBidSize = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 5, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.MarketDataPoint} returns this
 */
proto.marketdata.MarketDataPoint.prototype.setBidSize = function(value) {
  return jspb.Message.setField(this, 5, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.marketdata.MarketDataPoint} returns this
 */
proto.marketdata.MarketDataPoint.prototype.clearBidSize = function() {
  return jspb.Message.setField(this, 5, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.marketdata.MarketDataPoint.prototype.hasBidSize = function() {
  return jspb.Message.getField(this, 5) != null;
};


/**
 * optional double ask_size = 6;
 * @return {number}
 */
proto.marketdata.MarketDataPoint.prototype.getAskSize = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 6, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.MarketDataPoint} returns this
 */
proto.marketdata.MarketDataPoint.prototype.setAskSize = function(value) {
  return jspb.Message.setField(this, 6, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.marketdata.MarketDataPoint} returns this
 */
proto.marketdata.MarketDataPoint.prototype.clearAskSize = function() {
  return jspb.Message.setField(this, 6, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.marketdata.MarketDataPoint.prototype.hasAskSize = function() {
  return jspb.Message.getField(this, 6) != null;
};


/**
 * optional int64 volume = 7;
 * @return {number}
 */
proto.marketdata.MarketDataPoint.prototype.getVolume = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 7, 0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.MarketDataPoint} returns this
 */
proto.marketdata.MarketDataPoint.prototype.setVolume = function(value) {
  return jspb.Message.setProto3IntField(this, 7, value);
};


/**
 * optional double previous_close = 8;
 * @return {number}
 */
proto.marketdata.MarketDataPoint.prototype.getPreviousClose = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 8, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.MarketDataPoint} returns this
 */
proto.marketdata.MarketDataPoint.prototype.setPreviousClose = function(value) {
  return jspb.Message.setField(this, 8, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.marketdata.MarketDataPoint} returns this
 */
proto.marketdata.MarketDataPoint.prototype.clearPreviousClose = function() {
  return jspb.Message.setField(this, 8, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.marketdata.MarketDataPoint.prototype.hasPreviousClose = function() {
  return jspb.Message.getField(this, 8) != null;
};


/**
 * optional double change = 9;
 * @return {number}
 */
proto.marketdata.MarketDataPoint.prototype.getChange = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 9, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.MarketDataPoint} returns this
 */
proto.marketdata.MarketDataPoint.prototype.setChange = function(value) {
  return jspb.Message.setField(this, 9, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.marketdata.MarketDataPoint} returns this
 */
proto.marketdata.MarketDataPoint.prototype.clearChange = function() {
  return jspb.Message.setField(this, 9, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.marketdata.MarketDataPoint.prototype.hasChange = function() {
  return jspb.Message.getField(this, 9) != null;
};


/**
 * optional double change_percent = 10;
 * @return {number}
 */
proto.marketdata.MarketDataPoint.prototype.getChangePercent = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 10, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.MarketDataPoint} returns this
 */
proto.marketdata.MarketDataPoint.prototype.setChangePercent = function(value) {
  return jspb.Message.setField(this, 10, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.marketdata.MarketDataPoint} returns this
 */
proto.marketdata.MarketDataPoint.prototype.clearChangePercent = function() {
  return jspb.Message.setField(this, 10, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.marketdata.MarketDataPoint.prototype.hasChangePercent = function() {
  return jspb.Message.getField(this, 10) != null;
};


/**
 * optional double day_high = 11;
 * @return {number}
 */
proto.marketdata.MarketDataPoint.prototype.getDayHigh = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 11, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.MarketDataPoint} returns this
 */
proto.marketdata.MarketDataPoint.prototype.setDayHigh = function(value) {
  return jspb.Message.setField(this, 11, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.marketdata.MarketDataPoint} returns this
 */
proto.marketdata.MarketDataPoint.prototype.clearDayHigh = function() {
  return jspb.Message.setField(this, 11, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.marketdata.MarketDataPoint.prototype.hasDayHigh = function() {
  return jspb.Message.getField(this, 11) != null;
};


/**
 * optional double day_low = 12;
 * @return {number}
 */
proto.marketdata.MarketDataPoint.prototype.getDayLow = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 12, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.MarketDataPoint} returns this
 */
proto.marketdata.MarketDataPoint.prototype.setDayLow = function(value) {
  return jspb.Message.setField(this, 12, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.marketdata.MarketDataPoint} returns this
 */
proto.marketdata.MarketDataPoint.prototype.clearDayLow = function() {
  return jspb.Message.setField(this, 12, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.marketdata.MarketDataPoint.prototype.hasDayLow = function() {
  return jspb.Message.getField(this, 12) != null;
};


/**
 * optional int64 market_cap = 13;
 * @return {number}
 */
proto.marketdata.MarketDataPoint.prototype.getMarketCap = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 13, 0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.MarketDataPoint} returns this
 */
proto.marketdata.MarketDataPoint.prototype.setMarketCap = function(value) {
  return jspb.Message.setField(this, 13, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.marketdata.MarketDataPoint} returns this
 */
proto.marketdata.MarketDataPoint.prototype.clearMarketCap = function() {
  return jspb.Message.setField(this, 13, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.marketdata.MarketDataPoint.prototype.hasMarketCap = function() {
  return jspb.Message.getField(this, 13) != null;
};


/**
 * optional DataSource source = 14;
 * @return {!proto.marketdata.DataSource}
 */
proto.marketdata.MarketDataPoint.prototype.getSource = function() {
  return /** @type {!proto.marketdata.DataSource} */ (jspb.Message.getFieldWithDefault(this, 14, 0));
};


/**
 * @param {!proto.marketdata.DataSource} value
 * @return {!proto.marketdata.MarketDataPoint} returns this
 */
proto.marketdata.MarketDataPoint.prototype.setSource = function(value) {
  return jspb.Message.setProto3EnumField(this, 14, value);
};


/**
 * optional int64 timestamp = 15;
 * @return {number}
 */
proto.marketdata.MarketDataPoint.prototype.getTimestamp = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 15, 0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.MarketDataPoint} returns this
 */
proto.marketdata.MarketDataPoint.prototype.setTimestamp = function(value) {
  return jspb.Message.setProto3IntField(this, 15, value);
};


/**
 * optional bool is_market_open = 16;
 * @return {boolean}
 */
proto.marketdata.MarketDataPoint.prototype.getIsMarketOpen = function() {
  return /** @type {boolean} */ (jspb.Message.getBooleanFieldWithDefault(this, 16, false));
};


/**
 * @param {boolean} value
 * @return {!proto.marketdata.MarketDataPoint} returns this
 */
proto.marketdata.MarketDataPoint.prototype.setIsMarketOpen = function(value) {
  return jspb.Message.setProto3BooleanField(this, 16, value);
};


/**
 * optional string market_session = 17;
 * @return {string}
 */
proto.marketdata.MarketDataPoint.prototype.getMarketSession = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 17, ""));
};


/**
 * @param {string} value
 * @return {!proto.marketdata.MarketDataPoint} returns this
 */
proto.marketdata.MarketDataPoint.prototype.setMarketSession = function(value) {
  return jspb.Message.setField(this, 17, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.marketdata.MarketDataPoint} returns this
 */
proto.marketdata.MarketDataPoint.prototype.clearMarketSession = function() {
  return jspb.Message.setField(this, 17, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.marketdata.MarketDataPoint.prototype.hasMarketSession = function() {
  return jspb.Message.getField(this, 17) != null;
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
proto.marketdata.HistoricalDataPoint.prototype.toObject = function(opt_includeInstance) {
  return proto.marketdata.HistoricalDataPoint.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.marketdata.HistoricalDataPoint} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.HistoricalDataPoint.toObject = function(includeInstance, msg) {
  var f, obj = {
    symbol: jspb.Message.getFieldWithDefault(msg, 1, ""),
    interval: jspb.Message.getFieldWithDefault(msg, 2, 0),
    open: jspb.Message.getFloatingPointFieldWithDefault(msg, 3, 0.0),
    high: jspb.Message.getFloatingPointFieldWithDefault(msg, 4, 0.0),
    low: jspb.Message.getFloatingPointFieldWithDefault(msg, 5, 0.0),
    close: jspb.Message.getFloatingPointFieldWithDefault(msg, 6, 0.0),
    adjustedClose: jspb.Message.getFloatingPointFieldWithDefault(msg, 7, 0.0),
    volume: jspb.Message.getFieldWithDefault(msg, 8, 0),
    vwap: jspb.Message.getFloatingPointFieldWithDefault(msg, 9, 0.0),
    source: jspb.Message.getFieldWithDefault(msg, 10, 0),
    timestamp: jspb.Message.getFieldWithDefault(msg, 11, 0),
    tradeCount: jspb.Message.getFieldWithDefault(msg, 12, 0)
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
 * @return {!proto.marketdata.HistoricalDataPoint}
 */
proto.marketdata.HistoricalDataPoint.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.marketdata.HistoricalDataPoint;
  return proto.marketdata.HistoricalDataPoint.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.marketdata.HistoricalDataPoint} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.marketdata.HistoricalDataPoint}
 */
proto.marketdata.HistoricalDataPoint.deserializeBinaryFromReader = function(msg, reader) {
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
      var value = /** @type {!proto.marketdata.TimeInterval} */ (reader.readEnum());
      msg.setInterval(value);
      break;
    case 3:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setOpen(value);
      break;
    case 4:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setHigh(value);
      break;
    case 5:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setLow(value);
      break;
    case 6:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setClose(value);
      break;
    case 7:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setAdjustedClose(value);
      break;
    case 8:
      var value = /** @type {number} */ (reader.readInt64());
      msg.setVolume(value);
      break;
    case 9:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setVwap(value);
      break;
    case 10:
      var value = /** @type {!proto.marketdata.DataSource} */ (reader.readEnum());
      msg.setSource(value);
      break;
    case 11:
      var value = /** @type {number} */ (reader.readInt64());
      msg.setTimestamp(value);
      break;
    case 12:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setTradeCount(value);
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
proto.marketdata.HistoricalDataPoint.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.marketdata.HistoricalDataPoint.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.marketdata.HistoricalDataPoint} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.HistoricalDataPoint.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getSymbol();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getInterval();
  if (f !== 0.0) {
    writer.writeEnum(
      2,
      f
    );
  }
  f = message.getOpen();
  if (f !== 0.0) {
    writer.writeDouble(
      3,
      f
    );
  }
  f = message.getHigh();
  if (f !== 0.0) {
    writer.writeDouble(
      4,
      f
    );
  }
  f = message.getLow();
  if (f !== 0.0) {
    writer.writeDouble(
      5,
      f
    );
  }
  f = message.getClose();
  if (f !== 0.0) {
    writer.writeDouble(
      6,
      f
    );
  }
  f = /** @type {number} */ (jspb.Message.getField(message, 7));
  if (f != null) {
    writer.writeDouble(
      7,
      f
    );
  }
  f = message.getVolume();
  if (f !== 0) {
    writer.writeInt64(
      8,
      f
    );
  }
  f = /** @type {number} */ (jspb.Message.getField(message, 9));
  if (f != null) {
    writer.writeDouble(
      9,
      f
    );
  }
  f = message.getSource();
  if (f !== 0.0) {
    writer.writeEnum(
      10,
      f
    );
  }
  f = message.getTimestamp();
  if (f !== 0) {
    writer.writeInt64(
      11,
      f
    );
  }
  f = /** @type {number} */ (jspb.Message.getField(message, 12));
  if (f != null) {
    writer.writeInt32(
      12,
      f
    );
  }
};


/**
 * optional string symbol = 1;
 * @return {string}
 */
proto.marketdata.HistoricalDataPoint.prototype.getSymbol = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.marketdata.HistoricalDataPoint} returns this
 */
proto.marketdata.HistoricalDataPoint.prototype.setSymbol = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional TimeInterval interval = 2;
 * @return {!proto.marketdata.TimeInterval}
 */
proto.marketdata.HistoricalDataPoint.prototype.getInterval = function() {
  return /** @type {!proto.marketdata.TimeInterval} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/**
 * @param {!proto.marketdata.TimeInterval} value
 * @return {!proto.marketdata.HistoricalDataPoint} returns this
 */
proto.marketdata.HistoricalDataPoint.prototype.setInterval = function(value) {
  return jspb.Message.setProto3EnumField(this, 2, value);
};


/**
 * optional double open = 3;
 * @return {number}
 */
proto.marketdata.HistoricalDataPoint.prototype.getOpen = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 3, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.HistoricalDataPoint} returns this
 */
proto.marketdata.HistoricalDataPoint.prototype.setOpen = function(value) {
  return jspb.Message.setProto3FloatField(this, 3, value);
};


/**
 * optional double high = 4;
 * @return {number}
 */
proto.marketdata.HistoricalDataPoint.prototype.getHigh = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 4, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.HistoricalDataPoint} returns this
 */
proto.marketdata.HistoricalDataPoint.prototype.setHigh = function(value) {
  return jspb.Message.setProto3FloatField(this, 4, value);
};


/**
 * optional double low = 5;
 * @return {number}
 */
proto.marketdata.HistoricalDataPoint.prototype.getLow = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 5, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.HistoricalDataPoint} returns this
 */
proto.marketdata.HistoricalDataPoint.prototype.setLow = function(value) {
  return jspb.Message.setProto3FloatField(this, 5, value);
};


/**
 * optional double close = 6;
 * @return {number}
 */
proto.marketdata.HistoricalDataPoint.prototype.getClose = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 6, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.HistoricalDataPoint} returns this
 */
proto.marketdata.HistoricalDataPoint.prototype.setClose = function(value) {
  return jspb.Message.setProto3FloatField(this, 6, value);
};


/**
 * optional double adjusted_close = 7;
 * @return {number}
 */
proto.marketdata.HistoricalDataPoint.prototype.getAdjustedClose = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 7, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.HistoricalDataPoint} returns this
 */
proto.marketdata.HistoricalDataPoint.prototype.setAdjustedClose = function(value) {
  return jspb.Message.setField(this, 7, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.marketdata.HistoricalDataPoint} returns this
 */
proto.marketdata.HistoricalDataPoint.prototype.clearAdjustedClose = function() {
  return jspb.Message.setField(this, 7, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.marketdata.HistoricalDataPoint.prototype.hasAdjustedClose = function() {
  return jspb.Message.getField(this, 7) != null;
};


/**
 * optional int64 volume = 8;
 * @return {number}
 */
proto.marketdata.HistoricalDataPoint.prototype.getVolume = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 8, 0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.HistoricalDataPoint} returns this
 */
proto.marketdata.HistoricalDataPoint.prototype.setVolume = function(value) {
  return jspb.Message.setProto3IntField(this, 8, value);
};


/**
 * optional double vwap = 9;
 * @return {number}
 */
proto.marketdata.HistoricalDataPoint.prototype.getVwap = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 9, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.HistoricalDataPoint} returns this
 */
proto.marketdata.HistoricalDataPoint.prototype.setVwap = function(value) {
  return jspb.Message.setField(this, 9, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.marketdata.HistoricalDataPoint} returns this
 */
proto.marketdata.HistoricalDataPoint.prototype.clearVwap = function() {
  return jspb.Message.setField(this, 9, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.marketdata.HistoricalDataPoint.prototype.hasVwap = function() {
  return jspb.Message.getField(this, 9) != null;
};


/**
 * optional DataSource source = 10;
 * @return {!proto.marketdata.DataSource}
 */
proto.marketdata.HistoricalDataPoint.prototype.getSource = function() {
  return /** @type {!proto.marketdata.DataSource} */ (jspb.Message.getFieldWithDefault(this, 10, 0));
};


/**
 * @param {!proto.marketdata.DataSource} value
 * @return {!proto.marketdata.HistoricalDataPoint} returns this
 */
proto.marketdata.HistoricalDataPoint.prototype.setSource = function(value) {
  return jspb.Message.setProto3EnumField(this, 10, value);
};


/**
 * optional int64 timestamp = 11;
 * @return {number}
 */
proto.marketdata.HistoricalDataPoint.prototype.getTimestamp = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 11, 0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.HistoricalDataPoint} returns this
 */
proto.marketdata.HistoricalDataPoint.prototype.setTimestamp = function(value) {
  return jspb.Message.setProto3IntField(this, 11, value);
};


/**
 * optional int32 trade_count = 12;
 * @return {number}
 */
proto.marketdata.HistoricalDataPoint.prototype.getTradeCount = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 12, 0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.HistoricalDataPoint} returns this
 */
proto.marketdata.HistoricalDataPoint.prototype.setTradeCount = function(value) {
  return jspb.Message.setField(this, 12, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.marketdata.HistoricalDataPoint} returns this
 */
proto.marketdata.HistoricalDataPoint.prototype.clearTradeCount = function() {
  return jspb.Message.setField(this, 12, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.marketdata.HistoricalDataPoint.prototype.hasTradeCount = function() {
  return jspb.Message.getField(this, 12) != null;
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.marketdata.Alert.repeatedFields_ = [19];



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
proto.marketdata.Alert.prototype.toObject = function(opt_includeInstance) {
  return proto.marketdata.Alert.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.marketdata.Alert} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.Alert.toObject = function(includeInstance, msg) {
  var f, obj = {
    id: jspb.Message.getFieldWithDefault(msg, 1, ""),
    userId: jspb.Message.getFieldWithDefault(msg, 2, ""),
    symbol: jspb.Message.getFieldWithDefault(msg, 3, ""),
    alertType: jspb.Message.getFieldWithDefault(msg, 4, 0),
    title: jspb.Message.getFieldWithDefault(msg, 5, ""),
    description: jspb.Message.getFieldWithDefault(msg, 6, ""),
    conditionsMap: (f = msg.getConditionsMap()) ? f.toObject(includeInstance, undefined) : [],
    targetPrice: jspb.Message.getFloatingPointFieldWithDefault(msg, 8, 0.0),
    percentageThreshold: jspb.Message.getFloatingPointFieldWithDefault(msg, 9, 0.0),
    volumeThreshold: jspb.Message.getFieldWithDefault(msg, 10, 0),
    status: jspb.Message.getFieldWithDefault(msg, 11, 0),
    priority: jspb.Message.getFieldWithDefault(msg, 12, 0),
    isRecurring: jspb.Message.getBooleanFieldWithDefault(msg, 13, false),
    expiresAt: jspb.Message.getFieldWithDefault(msg, 14, 0),
    triggeredAt: jspb.Message.getFieldWithDefault(msg, 15, 0),
    triggeredPrice: jspb.Message.getFloatingPointFieldWithDefault(msg, 16, 0.0),
    triggerCount: jspb.Message.getFieldWithDefault(msg, 17, 0),
    lastNotificationAt: jspb.Message.getFieldWithDefault(msg, 18, 0),
    notificationMethodsList: (f = jspb.Message.getRepeatedField(msg, 19)) == null ? undefined : f,
    createdAt: jspb.Message.getFieldWithDefault(msg, 20, 0),
    updatedAt: jspb.Message.getFieldWithDefault(msg, 21, 0)
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
 * @return {!proto.marketdata.Alert}
 */
proto.marketdata.Alert.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.marketdata.Alert;
  return proto.marketdata.Alert.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.marketdata.Alert} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.marketdata.Alert}
 */
proto.marketdata.Alert.deserializeBinaryFromReader = function(msg, reader) {
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
      msg.setSymbol(value);
      break;
    case 4:
      var value = /** @type {!proto.marketdata.AlertType} */ (reader.readEnum());
      msg.setAlertType(value);
      break;
    case 5:
      var value = /** @type {string} */ (reader.readString());
      msg.setTitle(value);
      break;
    case 6:
      var value = /** @type {string} */ (reader.readString());
      msg.setDescription(value);
      break;
    case 7:
      var value = msg.getConditionsMap();
      reader.readMessage(value, function(message, reader) {
        jspb.Map.deserializeBinary(message, reader, jspb.BinaryReader.prototype.readString, jspb.BinaryReader.prototype.readString, null, "", "");
         });
      break;
    case 8:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setTargetPrice(value);
      break;
    case 9:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setPercentageThreshold(value);
      break;
    case 10:
      var value = /** @type {number} */ (reader.readInt64());
      msg.setVolumeThreshold(value);
      break;
    case 11:
      var value = /** @type {!proto.marketdata.AlertStatus} */ (reader.readEnum());
      msg.setStatus(value);
      break;
    case 12:
      var value = /** @type {!proto.marketdata.AlertPriority} */ (reader.readEnum());
      msg.setPriority(value);
      break;
    case 13:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setIsRecurring(value);
      break;
    case 14:
      var value = /** @type {number} */ (reader.readInt64());
      msg.setExpiresAt(value);
      break;
    case 15:
      var value = /** @type {number} */ (reader.readInt64());
      msg.setTriggeredAt(value);
      break;
    case 16:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setTriggeredPrice(value);
      break;
    case 17:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setTriggerCount(value);
      break;
    case 18:
      var value = /** @type {number} */ (reader.readInt64());
      msg.setLastNotificationAt(value);
      break;
    case 19:
      var value = /** @type {string} */ (reader.readString());
      msg.addNotificationMethods(value);
      break;
    case 20:
      var value = /** @type {number} */ (reader.readInt64());
      msg.setCreatedAt(value);
      break;
    case 21:
      var value = /** @type {number} */ (reader.readInt64());
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
proto.marketdata.Alert.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.marketdata.Alert.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.marketdata.Alert} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.Alert.serializeBinaryToWriter = function(message, writer) {
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
  f = message.getSymbol();
  if (f.length > 0) {
    writer.writeString(
      3,
      f
    );
  }
  f = message.getAlertType();
  if (f !== 0.0) {
    writer.writeEnum(
      4,
      f
    );
  }
  f = message.getTitle();
  if (f.length > 0) {
    writer.writeString(
      5,
      f
    );
  }
  f = /** @type {string} */ (jspb.Message.getField(message, 6));
  if (f != null) {
    writer.writeString(
      6,
      f
    );
  }
  f = message.getConditionsMap(true);
  if (f && f.getLength() > 0) {
    f.serializeBinary(7, writer, jspb.BinaryWriter.prototype.writeString, jspb.BinaryWriter.prototype.writeString);
  }
  f = /** @type {number} */ (jspb.Message.getField(message, 8));
  if (f != null) {
    writer.writeDouble(
      8,
      f
    );
  }
  f = /** @type {number} */ (jspb.Message.getField(message, 9));
  if (f != null) {
    writer.writeDouble(
      9,
      f
    );
  }
  f = /** @type {number} */ (jspb.Message.getField(message, 10));
  if (f != null) {
    writer.writeInt64(
      10,
      f
    );
  }
  f = message.getStatus();
  if (f !== 0.0) {
    writer.writeEnum(
      11,
      f
    );
  }
  f = message.getPriority();
  if (f !== 0.0) {
    writer.writeEnum(
      12,
      f
    );
  }
  f = message.getIsRecurring();
  if (f) {
    writer.writeBool(
      13,
      f
    );
  }
  f = /** @type {number} */ (jspb.Message.getField(message, 14));
  if (f != null) {
    writer.writeInt64(
      14,
      f
    );
  }
  f = /** @type {number} */ (jspb.Message.getField(message, 15));
  if (f != null) {
    writer.writeInt64(
      15,
      f
    );
  }
  f = /** @type {number} */ (jspb.Message.getField(message, 16));
  if (f != null) {
    writer.writeDouble(
      16,
      f
    );
  }
  f = message.getTriggerCount();
  if (f !== 0) {
    writer.writeInt32(
      17,
      f
    );
  }
  f = /** @type {number} */ (jspb.Message.getField(message, 18));
  if (f != null) {
    writer.writeInt64(
      18,
      f
    );
  }
  f = message.getNotificationMethodsList();
  if (f.length > 0) {
    writer.writeRepeatedString(
      19,
      f
    );
  }
  f = message.getCreatedAt();
  if (f !== 0) {
    writer.writeInt64(
      20,
      f
    );
  }
  f = message.getUpdatedAt();
  if (f !== 0) {
    writer.writeInt64(
      21,
      f
    );
  }
};


/**
 * optional string id = 1;
 * @return {string}
 */
proto.marketdata.Alert.prototype.getId = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.marketdata.Alert} returns this
 */
proto.marketdata.Alert.prototype.setId = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional string user_id = 2;
 * @return {string}
 */
proto.marketdata.Alert.prototype.getUserId = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.marketdata.Alert} returns this
 */
proto.marketdata.Alert.prototype.setUserId = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};


/**
 * optional string symbol = 3;
 * @return {string}
 */
proto.marketdata.Alert.prototype.getSymbol = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/**
 * @param {string} value
 * @return {!proto.marketdata.Alert} returns this
 */
proto.marketdata.Alert.prototype.setSymbol = function(value) {
  return jspb.Message.setProto3StringField(this, 3, value);
};


/**
 * optional AlertType alert_type = 4;
 * @return {!proto.marketdata.AlertType}
 */
proto.marketdata.Alert.prototype.getAlertType = function() {
  return /** @type {!proto.marketdata.AlertType} */ (jspb.Message.getFieldWithDefault(this, 4, 0));
};


/**
 * @param {!proto.marketdata.AlertType} value
 * @return {!proto.marketdata.Alert} returns this
 */
proto.marketdata.Alert.prototype.setAlertType = function(value) {
  return jspb.Message.setProto3EnumField(this, 4, value);
};


/**
 * optional string title = 5;
 * @return {string}
 */
proto.marketdata.Alert.prototype.getTitle = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 5, ""));
};


/**
 * @param {string} value
 * @return {!proto.marketdata.Alert} returns this
 */
proto.marketdata.Alert.prototype.setTitle = function(value) {
  return jspb.Message.setProto3StringField(this, 5, value);
};


/**
 * optional string description = 6;
 * @return {string}
 */
proto.marketdata.Alert.prototype.getDescription = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 6, ""));
};


/**
 * @param {string} value
 * @return {!proto.marketdata.Alert} returns this
 */
proto.marketdata.Alert.prototype.setDescription = function(value) {
  return jspb.Message.setField(this, 6, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.marketdata.Alert} returns this
 */
proto.marketdata.Alert.prototype.clearDescription = function() {
  return jspb.Message.setField(this, 6, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.marketdata.Alert.prototype.hasDescription = function() {
  return jspb.Message.getField(this, 6) != null;
};


/**
 * map<string, string> conditions = 7;
 * @param {boolean=} opt_noLazyCreate Do not create the map if
 * empty, instead returning `undefined`
 * @return {!jspb.Map<string,string>}
 */
proto.marketdata.Alert.prototype.getConditionsMap = function(opt_noLazyCreate) {
  return /** @type {!jspb.Map<string,string>} */ (
      jspb.Message.getMapField(this, 7, opt_noLazyCreate,
      null));
};


/**
 * Clears values from the map. The map will be non-null.
 * @return {!proto.marketdata.Alert} returns this
 */
proto.marketdata.Alert.prototype.clearConditionsMap = function() {
  this.getConditionsMap().clear();
  return this;};


/**
 * optional double target_price = 8;
 * @return {number}
 */
proto.marketdata.Alert.prototype.getTargetPrice = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 8, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.Alert} returns this
 */
proto.marketdata.Alert.prototype.setTargetPrice = function(value) {
  return jspb.Message.setField(this, 8, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.marketdata.Alert} returns this
 */
proto.marketdata.Alert.prototype.clearTargetPrice = function() {
  return jspb.Message.setField(this, 8, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.marketdata.Alert.prototype.hasTargetPrice = function() {
  return jspb.Message.getField(this, 8) != null;
};


/**
 * optional double percentage_threshold = 9;
 * @return {number}
 */
proto.marketdata.Alert.prototype.getPercentageThreshold = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 9, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.Alert} returns this
 */
proto.marketdata.Alert.prototype.setPercentageThreshold = function(value) {
  return jspb.Message.setField(this, 9, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.marketdata.Alert} returns this
 */
proto.marketdata.Alert.prototype.clearPercentageThreshold = function() {
  return jspb.Message.setField(this, 9, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.marketdata.Alert.prototype.hasPercentageThreshold = function() {
  return jspb.Message.getField(this, 9) != null;
};


/**
 * optional int64 volume_threshold = 10;
 * @return {number}
 */
proto.marketdata.Alert.prototype.getVolumeThreshold = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 10, 0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.Alert} returns this
 */
proto.marketdata.Alert.prototype.setVolumeThreshold = function(value) {
  return jspb.Message.setField(this, 10, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.marketdata.Alert} returns this
 */
proto.marketdata.Alert.prototype.clearVolumeThreshold = function() {
  return jspb.Message.setField(this, 10, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.marketdata.Alert.prototype.hasVolumeThreshold = function() {
  return jspb.Message.getField(this, 10) != null;
};


/**
 * optional AlertStatus status = 11;
 * @return {!proto.marketdata.AlertStatus}
 */
proto.marketdata.Alert.prototype.getStatus = function() {
  return /** @type {!proto.marketdata.AlertStatus} */ (jspb.Message.getFieldWithDefault(this, 11, 0));
};


/**
 * @param {!proto.marketdata.AlertStatus} value
 * @return {!proto.marketdata.Alert} returns this
 */
proto.marketdata.Alert.prototype.setStatus = function(value) {
  return jspb.Message.setProto3EnumField(this, 11, value);
};


/**
 * optional AlertPriority priority = 12;
 * @return {!proto.marketdata.AlertPriority}
 */
proto.marketdata.Alert.prototype.getPriority = function() {
  return /** @type {!proto.marketdata.AlertPriority} */ (jspb.Message.getFieldWithDefault(this, 12, 0));
};


/**
 * @param {!proto.marketdata.AlertPriority} value
 * @return {!proto.marketdata.Alert} returns this
 */
proto.marketdata.Alert.prototype.setPriority = function(value) {
  return jspb.Message.setProto3EnumField(this, 12, value);
};


/**
 * optional bool is_recurring = 13;
 * @return {boolean}
 */
proto.marketdata.Alert.prototype.getIsRecurring = function() {
  return /** @type {boolean} */ (jspb.Message.getBooleanFieldWithDefault(this, 13, false));
};


/**
 * @param {boolean} value
 * @return {!proto.marketdata.Alert} returns this
 */
proto.marketdata.Alert.prototype.setIsRecurring = function(value) {
  return jspb.Message.setProto3BooleanField(this, 13, value);
};


/**
 * optional int64 expires_at = 14;
 * @return {number}
 */
proto.marketdata.Alert.prototype.getExpiresAt = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 14, 0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.Alert} returns this
 */
proto.marketdata.Alert.prototype.setExpiresAt = function(value) {
  return jspb.Message.setField(this, 14, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.marketdata.Alert} returns this
 */
proto.marketdata.Alert.prototype.clearExpiresAt = function() {
  return jspb.Message.setField(this, 14, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.marketdata.Alert.prototype.hasExpiresAt = function() {
  return jspb.Message.getField(this, 14) != null;
};


/**
 * optional int64 triggered_at = 15;
 * @return {number}
 */
proto.marketdata.Alert.prototype.getTriggeredAt = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 15, 0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.Alert} returns this
 */
proto.marketdata.Alert.prototype.setTriggeredAt = function(value) {
  return jspb.Message.setField(this, 15, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.marketdata.Alert} returns this
 */
proto.marketdata.Alert.prototype.clearTriggeredAt = function() {
  return jspb.Message.setField(this, 15, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.marketdata.Alert.prototype.hasTriggeredAt = function() {
  return jspb.Message.getField(this, 15) != null;
};


/**
 * optional double triggered_price = 16;
 * @return {number}
 */
proto.marketdata.Alert.prototype.getTriggeredPrice = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 16, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.Alert} returns this
 */
proto.marketdata.Alert.prototype.setTriggeredPrice = function(value) {
  return jspb.Message.setField(this, 16, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.marketdata.Alert} returns this
 */
proto.marketdata.Alert.prototype.clearTriggeredPrice = function() {
  return jspb.Message.setField(this, 16, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.marketdata.Alert.prototype.hasTriggeredPrice = function() {
  return jspb.Message.getField(this, 16) != null;
};


/**
 * optional int32 trigger_count = 17;
 * @return {number}
 */
proto.marketdata.Alert.prototype.getTriggerCount = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 17, 0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.Alert} returns this
 */
proto.marketdata.Alert.prototype.setTriggerCount = function(value) {
  return jspb.Message.setProto3IntField(this, 17, value);
};


/**
 * optional int64 last_notification_at = 18;
 * @return {number}
 */
proto.marketdata.Alert.prototype.getLastNotificationAt = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 18, 0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.Alert} returns this
 */
proto.marketdata.Alert.prototype.setLastNotificationAt = function(value) {
  return jspb.Message.setField(this, 18, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.marketdata.Alert} returns this
 */
proto.marketdata.Alert.prototype.clearLastNotificationAt = function() {
  return jspb.Message.setField(this, 18, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.marketdata.Alert.prototype.hasLastNotificationAt = function() {
  return jspb.Message.getField(this, 18) != null;
};


/**
 * repeated string notification_methods = 19;
 * @return {!Array<string>}
 */
proto.marketdata.Alert.prototype.getNotificationMethodsList = function() {
  return /** @type {!Array<string>} */ (jspb.Message.getRepeatedField(this, 19));
};


/**
 * @param {!Array<string>} value
 * @return {!proto.marketdata.Alert} returns this
 */
proto.marketdata.Alert.prototype.setNotificationMethodsList = function(value) {
  return jspb.Message.setField(this, 19, value || []);
};


/**
 * @param {string} value
 * @param {number=} opt_index
 * @return {!proto.marketdata.Alert} returns this
 */
proto.marketdata.Alert.prototype.addNotificationMethods = function(value, opt_index) {
  return jspb.Message.addToRepeatedField(this, 19, value, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.marketdata.Alert} returns this
 */
proto.marketdata.Alert.prototype.clearNotificationMethodsList = function() {
  return this.setNotificationMethodsList([]);
};


/**
 * optional int64 created_at = 20;
 * @return {number}
 */
proto.marketdata.Alert.prototype.getCreatedAt = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 20, 0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.Alert} returns this
 */
proto.marketdata.Alert.prototype.setCreatedAt = function(value) {
  return jspb.Message.setProto3IntField(this, 20, value);
};


/**
 * optional int64 updated_at = 21;
 * @return {number}
 */
proto.marketdata.Alert.prototype.getUpdatedAt = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 21, 0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.Alert} returns this
 */
proto.marketdata.Alert.prototype.setUpdatedAt = function(value) {
  return jspb.Message.setProto3IntField(this, 21, value);
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.marketdata.WatchlistItem.repeatedFields_ = [6];



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
proto.marketdata.WatchlistItem.prototype.toObject = function(opt_includeInstance) {
  return proto.marketdata.WatchlistItem.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.marketdata.WatchlistItem} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.WatchlistItem.toObject = function(includeInstance, msg) {
  var f, obj = {
    id: jspb.Message.getFieldWithDefault(msg, 1, ""),
    userId: jspb.Message.getFieldWithDefault(msg, 2, ""),
    symbol: jspb.Message.getFieldWithDefault(msg, 3, ""),
    displayName: jspb.Message.getFieldWithDefault(msg, 4, ""),
    notes: jspb.Message.getFieldWithDefault(msg, 5, ""),
    tagsList: (f = jspb.Message.getRepeatedField(msg, 6)) == null ? undefined : f,
    sortOrder: jspb.Message.getFieldWithDefault(msg, 7, 0),
    targetBuyPrice: jspb.Message.getFloatingPointFieldWithDefault(msg, 8, 0.0),
    targetSellPrice: jspb.Message.getFloatingPointFieldWithDefault(msg, 9, 0.0),
    stopLossPrice: jspb.Message.getFloatingPointFieldWithDefault(msg, 10, 0.0),
    isActive: jspb.Message.getBooleanFieldWithDefault(msg, 11, false),
    enableAlerts: jspb.Message.getBooleanFieldWithDefault(msg, 12, false),
    addedAtPrice: jspb.Message.getFloatingPointFieldWithDefault(msg, 13, 0.0),
    createdAt: jspb.Message.getFieldWithDefault(msg, 14, 0),
    updatedAt: jspb.Message.getFieldWithDefault(msg, 15, 0)
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
 * @return {!proto.marketdata.WatchlistItem}
 */
proto.marketdata.WatchlistItem.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.marketdata.WatchlistItem;
  return proto.marketdata.WatchlistItem.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.marketdata.WatchlistItem} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.marketdata.WatchlistItem}
 */
proto.marketdata.WatchlistItem.deserializeBinaryFromReader = function(msg, reader) {
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
      msg.setSymbol(value);
      break;
    case 4:
      var value = /** @type {string} */ (reader.readString());
      msg.setDisplayName(value);
      break;
    case 5:
      var value = /** @type {string} */ (reader.readString());
      msg.setNotes(value);
      break;
    case 6:
      var value = /** @type {string} */ (reader.readString());
      msg.addTags(value);
      break;
    case 7:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setSortOrder(value);
      break;
    case 8:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setTargetBuyPrice(value);
      break;
    case 9:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setTargetSellPrice(value);
      break;
    case 10:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setStopLossPrice(value);
      break;
    case 11:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setIsActive(value);
      break;
    case 12:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setEnableAlerts(value);
      break;
    case 13:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setAddedAtPrice(value);
      break;
    case 14:
      var value = /** @type {number} */ (reader.readInt64());
      msg.setCreatedAt(value);
      break;
    case 15:
      var value = /** @type {number} */ (reader.readInt64());
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
proto.marketdata.WatchlistItem.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.marketdata.WatchlistItem.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.marketdata.WatchlistItem} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.WatchlistItem.serializeBinaryToWriter = function(message, writer) {
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
  f = message.getSymbol();
  if (f.length > 0) {
    writer.writeString(
      3,
      f
    );
  }
  f = /** @type {string} */ (jspb.Message.getField(message, 4));
  if (f != null) {
    writer.writeString(
      4,
      f
    );
  }
  f = /** @type {string} */ (jspb.Message.getField(message, 5));
  if (f != null) {
    writer.writeString(
      5,
      f
    );
  }
  f = message.getTagsList();
  if (f.length > 0) {
    writer.writeRepeatedString(
      6,
      f
    );
  }
  f = message.getSortOrder();
  if (f !== 0) {
    writer.writeInt32(
      7,
      f
    );
  }
  f = /** @type {number} */ (jspb.Message.getField(message, 8));
  if (f != null) {
    writer.writeDouble(
      8,
      f
    );
  }
  f = /** @type {number} */ (jspb.Message.getField(message, 9));
  if (f != null) {
    writer.writeDouble(
      9,
      f
    );
  }
  f = /** @type {number} */ (jspb.Message.getField(message, 10));
  if (f != null) {
    writer.writeDouble(
      10,
      f
    );
  }
  f = message.getIsActive();
  if (f) {
    writer.writeBool(
      11,
      f
    );
  }
  f = message.getEnableAlerts();
  if (f) {
    writer.writeBool(
      12,
      f
    );
  }
  f = /** @type {number} */ (jspb.Message.getField(message, 13));
  if (f != null) {
    writer.writeDouble(
      13,
      f
    );
  }
  f = message.getCreatedAt();
  if (f !== 0) {
    writer.writeInt64(
      14,
      f
    );
  }
  f = message.getUpdatedAt();
  if (f !== 0) {
    writer.writeInt64(
      15,
      f
    );
  }
};


/**
 * optional string id = 1;
 * @return {string}
 */
proto.marketdata.WatchlistItem.prototype.getId = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.marketdata.WatchlistItem} returns this
 */
proto.marketdata.WatchlistItem.prototype.setId = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional string user_id = 2;
 * @return {string}
 */
proto.marketdata.WatchlistItem.prototype.getUserId = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.marketdata.WatchlistItem} returns this
 */
proto.marketdata.WatchlistItem.prototype.setUserId = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};


/**
 * optional string symbol = 3;
 * @return {string}
 */
proto.marketdata.WatchlistItem.prototype.getSymbol = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/**
 * @param {string} value
 * @return {!proto.marketdata.WatchlistItem} returns this
 */
proto.marketdata.WatchlistItem.prototype.setSymbol = function(value) {
  return jspb.Message.setProto3StringField(this, 3, value);
};


/**
 * optional string display_name = 4;
 * @return {string}
 */
proto.marketdata.WatchlistItem.prototype.getDisplayName = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 4, ""));
};


/**
 * @param {string} value
 * @return {!proto.marketdata.WatchlistItem} returns this
 */
proto.marketdata.WatchlistItem.prototype.setDisplayName = function(value) {
  return jspb.Message.setField(this, 4, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.marketdata.WatchlistItem} returns this
 */
proto.marketdata.WatchlistItem.prototype.clearDisplayName = function() {
  return jspb.Message.setField(this, 4, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.marketdata.WatchlistItem.prototype.hasDisplayName = function() {
  return jspb.Message.getField(this, 4) != null;
};


/**
 * optional string notes = 5;
 * @return {string}
 */
proto.marketdata.WatchlistItem.prototype.getNotes = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 5, ""));
};


/**
 * @param {string} value
 * @return {!proto.marketdata.WatchlistItem} returns this
 */
proto.marketdata.WatchlistItem.prototype.setNotes = function(value) {
  return jspb.Message.setField(this, 5, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.marketdata.WatchlistItem} returns this
 */
proto.marketdata.WatchlistItem.prototype.clearNotes = function() {
  return jspb.Message.setField(this, 5, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.marketdata.WatchlistItem.prototype.hasNotes = function() {
  return jspb.Message.getField(this, 5) != null;
};


/**
 * repeated string tags = 6;
 * @return {!Array<string>}
 */
proto.marketdata.WatchlistItem.prototype.getTagsList = function() {
  return /** @type {!Array<string>} */ (jspb.Message.getRepeatedField(this, 6));
};


/**
 * @param {!Array<string>} value
 * @return {!proto.marketdata.WatchlistItem} returns this
 */
proto.marketdata.WatchlistItem.prototype.setTagsList = function(value) {
  return jspb.Message.setField(this, 6, value || []);
};


/**
 * @param {string} value
 * @param {number=} opt_index
 * @return {!proto.marketdata.WatchlistItem} returns this
 */
proto.marketdata.WatchlistItem.prototype.addTags = function(value, opt_index) {
  return jspb.Message.addToRepeatedField(this, 6, value, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.marketdata.WatchlistItem} returns this
 */
proto.marketdata.WatchlistItem.prototype.clearTagsList = function() {
  return this.setTagsList([]);
};


/**
 * optional int32 sort_order = 7;
 * @return {number}
 */
proto.marketdata.WatchlistItem.prototype.getSortOrder = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 7, 0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.WatchlistItem} returns this
 */
proto.marketdata.WatchlistItem.prototype.setSortOrder = function(value) {
  return jspb.Message.setProto3IntField(this, 7, value);
};


/**
 * optional double target_buy_price = 8;
 * @return {number}
 */
proto.marketdata.WatchlistItem.prototype.getTargetBuyPrice = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 8, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.WatchlistItem} returns this
 */
proto.marketdata.WatchlistItem.prototype.setTargetBuyPrice = function(value) {
  return jspb.Message.setField(this, 8, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.marketdata.WatchlistItem} returns this
 */
proto.marketdata.WatchlistItem.prototype.clearTargetBuyPrice = function() {
  return jspb.Message.setField(this, 8, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.marketdata.WatchlistItem.prototype.hasTargetBuyPrice = function() {
  return jspb.Message.getField(this, 8) != null;
};


/**
 * optional double target_sell_price = 9;
 * @return {number}
 */
proto.marketdata.WatchlistItem.prototype.getTargetSellPrice = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 9, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.WatchlistItem} returns this
 */
proto.marketdata.WatchlistItem.prototype.setTargetSellPrice = function(value) {
  return jspb.Message.setField(this, 9, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.marketdata.WatchlistItem} returns this
 */
proto.marketdata.WatchlistItem.prototype.clearTargetSellPrice = function() {
  return jspb.Message.setField(this, 9, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.marketdata.WatchlistItem.prototype.hasTargetSellPrice = function() {
  return jspb.Message.getField(this, 9) != null;
};


/**
 * optional double stop_loss_price = 10;
 * @return {number}
 */
proto.marketdata.WatchlistItem.prototype.getStopLossPrice = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 10, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.WatchlistItem} returns this
 */
proto.marketdata.WatchlistItem.prototype.setStopLossPrice = function(value) {
  return jspb.Message.setField(this, 10, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.marketdata.WatchlistItem} returns this
 */
proto.marketdata.WatchlistItem.prototype.clearStopLossPrice = function() {
  return jspb.Message.setField(this, 10, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.marketdata.WatchlistItem.prototype.hasStopLossPrice = function() {
  return jspb.Message.getField(this, 10) != null;
};


/**
 * optional bool is_active = 11;
 * @return {boolean}
 */
proto.marketdata.WatchlistItem.prototype.getIsActive = function() {
  return /** @type {boolean} */ (jspb.Message.getBooleanFieldWithDefault(this, 11, false));
};


/**
 * @param {boolean} value
 * @return {!proto.marketdata.WatchlistItem} returns this
 */
proto.marketdata.WatchlistItem.prototype.setIsActive = function(value) {
  return jspb.Message.setProto3BooleanField(this, 11, value);
};


/**
 * optional bool enable_alerts = 12;
 * @return {boolean}
 */
proto.marketdata.WatchlistItem.prototype.getEnableAlerts = function() {
  return /** @type {boolean} */ (jspb.Message.getBooleanFieldWithDefault(this, 12, false));
};


/**
 * @param {boolean} value
 * @return {!proto.marketdata.WatchlistItem} returns this
 */
proto.marketdata.WatchlistItem.prototype.setEnableAlerts = function(value) {
  return jspb.Message.setProto3BooleanField(this, 12, value);
};


/**
 * optional double added_at_price = 13;
 * @return {number}
 */
proto.marketdata.WatchlistItem.prototype.getAddedAtPrice = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 13, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.WatchlistItem} returns this
 */
proto.marketdata.WatchlistItem.prototype.setAddedAtPrice = function(value) {
  return jspb.Message.setField(this, 13, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.marketdata.WatchlistItem} returns this
 */
proto.marketdata.WatchlistItem.prototype.clearAddedAtPrice = function() {
  return jspb.Message.setField(this, 13, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.marketdata.WatchlistItem.prototype.hasAddedAtPrice = function() {
  return jspb.Message.getField(this, 13) != null;
};


/**
 * optional int64 created_at = 14;
 * @return {number}
 */
proto.marketdata.WatchlistItem.prototype.getCreatedAt = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 14, 0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.WatchlistItem} returns this
 */
proto.marketdata.WatchlistItem.prototype.setCreatedAt = function(value) {
  return jspb.Message.setProto3IntField(this, 14, value);
};


/**
 * optional int64 updated_at = 15;
 * @return {number}
 */
proto.marketdata.WatchlistItem.prototype.getUpdatedAt = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 15, 0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.WatchlistItem} returns this
 */
proto.marketdata.WatchlistItem.prototype.setUpdatedAt = function(value) {
  return jspb.Message.setProto3IntField(this, 15, value);
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
proto.marketdata.WatchlistItemWithMarketData.prototype.toObject = function(opt_includeInstance) {
  return proto.marketdata.WatchlistItemWithMarketData.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.marketdata.WatchlistItemWithMarketData} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.WatchlistItemWithMarketData.toObject = function(includeInstance, msg) {
  var f, obj = {
    watchlistItem: (f = msg.getWatchlistItem()) && proto.marketdata.WatchlistItem.toObject(includeInstance, f),
    marketData: (f = msg.getMarketData()) && proto.marketdata.MarketDataPoint.toObject(includeInstance, f)
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
 * @return {!proto.marketdata.WatchlistItemWithMarketData}
 */
proto.marketdata.WatchlistItemWithMarketData.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.marketdata.WatchlistItemWithMarketData;
  return proto.marketdata.WatchlistItemWithMarketData.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.marketdata.WatchlistItemWithMarketData} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.marketdata.WatchlistItemWithMarketData}
 */
proto.marketdata.WatchlistItemWithMarketData.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.marketdata.WatchlistItem;
      reader.readMessage(value,proto.marketdata.WatchlistItem.deserializeBinaryFromReader);
      msg.setWatchlistItem(value);
      break;
    case 2:
      var value = new proto.marketdata.MarketDataPoint;
      reader.readMessage(value,proto.marketdata.MarketDataPoint.deserializeBinaryFromReader);
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
proto.marketdata.WatchlistItemWithMarketData.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.marketdata.WatchlistItemWithMarketData.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.marketdata.WatchlistItemWithMarketData} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.WatchlistItemWithMarketData.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getWatchlistItem();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.marketdata.WatchlistItem.serializeBinaryToWriter
    );
  }
  f = message.getMarketData();
  if (f != null) {
    writer.writeMessage(
      2,
      f,
      proto.marketdata.MarketDataPoint.serializeBinaryToWriter
    );
  }
};


/**
 * optional WatchlistItem watchlist_item = 1;
 * @return {?proto.marketdata.WatchlistItem}
 */
proto.marketdata.WatchlistItemWithMarketData.prototype.getWatchlistItem = function() {
  return /** @type{?proto.marketdata.WatchlistItem} */ (
    jspb.Message.getWrapperField(this, proto.marketdata.WatchlistItem, 1));
};


/**
 * @param {?proto.marketdata.WatchlistItem|undefined} value
 * @return {!proto.marketdata.WatchlistItemWithMarketData} returns this
*/
proto.marketdata.WatchlistItemWithMarketData.prototype.setWatchlistItem = function(value) {
  return jspb.Message.setWrapperField(this, 1, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.marketdata.WatchlistItemWithMarketData} returns this
 */
proto.marketdata.WatchlistItemWithMarketData.prototype.clearWatchlistItem = function() {
  return this.setWatchlistItem(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.marketdata.WatchlistItemWithMarketData.prototype.hasWatchlistItem = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional MarketDataPoint market_data = 2;
 * @return {?proto.marketdata.MarketDataPoint}
 */
proto.marketdata.WatchlistItemWithMarketData.prototype.getMarketData = function() {
  return /** @type{?proto.marketdata.MarketDataPoint} */ (
    jspb.Message.getWrapperField(this, proto.marketdata.MarketDataPoint, 2));
};


/**
 * @param {?proto.marketdata.MarketDataPoint|undefined} value
 * @return {!proto.marketdata.WatchlistItemWithMarketData} returns this
*/
proto.marketdata.WatchlistItemWithMarketData.prototype.setMarketData = function(value) {
  return jspb.Message.setWrapperField(this, 2, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.marketdata.WatchlistItemWithMarketData} returns this
 */
proto.marketdata.WatchlistItemWithMarketData.prototype.clearMarketData = function() {
  return this.setMarketData(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.marketdata.WatchlistItemWithMarketData.prototype.hasMarketData = function() {
  return jspb.Message.getField(this, 2) != null;
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
proto.marketdata.RSIValue.prototype.toObject = function(opt_includeInstance) {
  return proto.marketdata.RSIValue.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.marketdata.RSIValue} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.RSIValue.toObject = function(includeInstance, msg) {
  var f, obj = {
    timestamp: jspb.Message.getFieldWithDefault(msg, 1, 0),
    rsi: jspb.Message.getFloatingPointFieldWithDefault(msg, 2, 0.0)
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
 * @return {!proto.marketdata.RSIValue}
 */
proto.marketdata.RSIValue.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.marketdata.RSIValue;
  return proto.marketdata.RSIValue.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.marketdata.RSIValue} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.marketdata.RSIValue}
 */
proto.marketdata.RSIValue.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {number} */ (reader.readInt64());
      msg.setTimestamp(value);
      break;
    case 2:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setRsi(value);
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
proto.marketdata.RSIValue.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.marketdata.RSIValue.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.marketdata.RSIValue} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.RSIValue.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getTimestamp();
  if (f !== 0) {
    writer.writeInt64(
      1,
      f
    );
  }
  f = message.getRsi();
  if (f !== 0.0) {
    writer.writeDouble(
      2,
      f
    );
  }
};


/**
 * optional int64 timestamp = 1;
 * @return {number}
 */
proto.marketdata.RSIValue.prototype.getTimestamp = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 1, 0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.RSIValue} returns this
 */
proto.marketdata.RSIValue.prototype.setTimestamp = function(value) {
  return jspb.Message.setProto3IntField(this, 1, value);
};


/**
 * optional double rsi = 2;
 * @return {number}
 */
proto.marketdata.RSIValue.prototype.getRsi = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 2, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.RSIValue} returns this
 */
proto.marketdata.RSIValue.prototype.setRsi = function(value) {
  return jspb.Message.setProto3FloatField(this, 2, value);
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.marketdata.RSI.repeatedFields_ = [3];



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
proto.marketdata.RSI.prototype.toObject = function(opt_includeInstance) {
  return proto.marketdata.RSI.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.marketdata.RSI} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.RSI.toObject = function(includeInstance, msg) {
  var f, obj = {
    symbol: jspb.Message.getFieldWithDefault(msg, 1, ""),
    interval: jspb.Message.getFieldWithDefault(msg, 2, 0),
    valuesList: jspb.Message.toObjectList(msg.getValuesList(),
    proto.marketdata.RSIValue.toObject, includeInstance),
    currentRsi: jspb.Message.getFloatingPointFieldWithDefault(msg, 4, 0.0),
    signal: jspb.Message.getFieldWithDefault(msg, 5, "")
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
 * @return {!proto.marketdata.RSI}
 */
proto.marketdata.RSI.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.marketdata.RSI;
  return proto.marketdata.RSI.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.marketdata.RSI} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.marketdata.RSI}
 */
proto.marketdata.RSI.deserializeBinaryFromReader = function(msg, reader) {
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
      var value = /** @type {!proto.marketdata.TimeInterval} */ (reader.readEnum());
      msg.setInterval(value);
      break;
    case 3:
      var value = new proto.marketdata.RSIValue;
      reader.readMessage(value,proto.marketdata.RSIValue.deserializeBinaryFromReader);
      msg.addValues(value);
      break;
    case 4:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setCurrentRsi(value);
      break;
    case 5:
      var value = /** @type {string} */ (reader.readString());
      msg.setSignal(value);
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
proto.marketdata.RSI.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.marketdata.RSI.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.marketdata.RSI} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.RSI.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getSymbol();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getInterval();
  if (f !== 0.0) {
    writer.writeEnum(
      2,
      f
    );
  }
  f = message.getValuesList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      3,
      f,
      proto.marketdata.RSIValue.serializeBinaryToWriter
    );
  }
  f = message.getCurrentRsi();
  if (f !== 0.0) {
    writer.writeDouble(
      4,
      f
    );
  }
  f = message.getSignal();
  if (f.length > 0) {
    writer.writeString(
      5,
      f
    );
  }
};


/**
 * optional string symbol = 1;
 * @return {string}
 */
proto.marketdata.RSI.prototype.getSymbol = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.marketdata.RSI} returns this
 */
proto.marketdata.RSI.prototype.setSymbol = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional TimeInterval interval = 2;
 * @return {!proto.marketdata.TimeInterval}
 */
proto.marketdata.RSI.prototype.getInterval = function() {
  return /** @type {!proto.marketdata.TimeInterval} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/**
 * @param {!proto.marketdata.TimeInterval} value
 * @return {!proto.marketdata.RSI} returns this
 */
proto.marketdata.RSI.prototype.setInterval = function(value) {
  return jspb.Message.setProto3EnumField(this, 2, value);
};


/**
 * repeated RSIValue values = 3;
 * @return {!Array<!proto.marketdata.RSIValue>}
 */
proto.marketdata.RSI.prototype.getValuesList = function() {
  return /** @type{!Array<!proto.marketdata.RSIValue>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.marketdata.RSIValue, 3));
};


/**
 * @param {!Array<!proto.marketdata.RSIValue>} value
 * @return {!proto.marketdata.RSI} returns this
*/
proto.marketdata.RSI.prototype.setValuesList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 3, value);
};


/**
 * @param {!proto.marketdata.RSIValue=} opt_value
 * @param {number=} opt_index
 * @return {!proto.marketdata.RSIValue}
 */
proto.marketdata.RSI.prototype.addValues = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 3, opt_value, proto.marketdata.RSIValue, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.marketdata.RSI} returns this
 */
proto.marketdata.RSI.prototype.clearValuesList = function() {
  return this.setValuesList([]);
};


/**
 * optional double current_rsi = 4;
 * @return {number}
 */
proto.marketdata.RSI.prototype.getCurrentRsi = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 4, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.RSI} returns this
 */
proto.marketdata.RSI.prototype.setCurrentRsi = function(value) {
  return jspb.Message.setProto3FloatField(this, 4, value);
};


/**
 * optional string signal = 5;
 * @return {string}
 */
proto.marketdata.RSI.prototype.getSignal = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 5, ""));
};


/**
 * @param {string} value
 * @return {!proto.marketdata.RSI} returns this
 */
proto.marketdata.RSI.prototype.setSignal = function(value) {
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
proto.marketdata.MACDValue.prototype.toObject = function(opt_includeInstance) {
  return proto.marketdata.MACDValue.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.marketdata.MACDValue} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.MACDValue.toObject = function(includeInstance, msg) {
  var f, obj = {
    timestamp: jspb.Message.getFieldWithDefault(msg, 1, 0),
    macd: jspb.Message.getFloatingPointFieldWithDefault(msg, 2, 0.0),
    signal: jspb.Message.getFloatingPointFieldWithDefault(msg, 3, 0.0),
    histogram: jspb.Message.getFloatingPointFieldWithDefault(msg, 4, 0.0)
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
 * @return {!proto.marketdata.MACDValue}
 */
proto.marketdata.MACDValue.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.marketdata.MACDValue;
  return proto.marketdata.MACDValue.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.marketdata.MACDValue} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.marketdata.MACDValue}
 */
proto.marketdata.MACDValue.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {number} */ (reader.readInt64());
      msg.setTimestamp(value);
      break;
    case 2:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setMacd(value);
      break;
    case 3:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setSignal(value);
      break;
    case 4:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setHistogram(value);
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
proto.marketdata.MACDValue.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.marketdata.MACDValue.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.marketdata.MACDValue} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.MACDValue.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getTimestamp();
  if (f !== 0) {
    writer.writeInt64(
      1,
      f
    );
  }
  f = message.getMacd();
  if (f !== 0.0) {
    writer.writeDouble(
      2,
      f
    );
  }
  f = message.getSignal();
  if (f !== 0.0) {
    writer.writeDouble(
      3,
      f
    );
  }
  f = message.getHistogram();
  if (f !== 0.0) {
    writer.writeDouble(
      4,
      f
    );
  }
};


/**
 * optional int64 timestamp = 1;
 * @return {number}
 */
proto.marketdata.MACDValue.prototype.getTimestamp = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 1, 0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.MACDValue} returns this
 */
proto.marketdata.MACDValue.prototype.setTimestamp = function(value) {
  return jspb.Message.setProto3IntField(this, 1, value);
};


/**
 * optional double macd = 2;
 * @return {number}
 */
proto.marketdata.MACDValue.prototype.getMacd = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 2, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.MACDValue} returns this
 */
proto.marketdata.MACDValue.prototype.setMacd = function(value) {
  return jspb.Message.setProto3FloatField(this, 2, value);
};


/**
 * optional double signal = 3;
 * @return {number}
 */
proto.marketdata.MACDValue.prototype.getSignal = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 3, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.MACDValue} returns this
 */
proto.marketdata.MACDValue.prototype.setSignal = function(value) {
  return jspb.Message.setProto3FloatField(this, 3, value);
};


/**
 * optional double histogram = 4;
 * @return {number}
 */
proto.marketdata.MACDValue.prototype.getHistogram = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 4, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.MACDValue} returns this
 */
proto.marketdata.MACDValue.prototype.setHistogram = function(value) {
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
proto.marketdata.MACDCurrent.prototype.toObject = function(opt_includeInstance) {
  return proto.marketdata.MACDCurrent.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.marketdata.MACDCurrent} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.MACDCurrent.toObject = function(includeInstance, msg) {
  var f, obj = {
    macd: jspb.Message.getFloatingPointFieldWithDefault(msg, 1, 0.0),
    signal: jspb.Message.getFloatingPointFieldWithDefault(msg, 2, 0.0),
    histogram: jspb.Message.getFloatingPointFieldWithDefault(msg, 3, 0.0)
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
 * @return {!proto.marketdata.MACDCurrent}
 */
proto.marketdata.MACDCurrent.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.marketdata.MACDCurrent;
  return proto.marketdata.MACDCurrent.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.marketdata.MACDCurrent} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.marketdata.MACDCurrent}
 */
proto.marketdata.MACDCurrent.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setMacd(value);
      break;
    case 2:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setSignal(value);
      break;
    case 3:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setHistogram(value);
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
proto.marketdata.MACDCurrent.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.marketdata.MACDCurrent.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.marketdata.MACDCurrent} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.MACDCurrent.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getMacd();
  if (f !== 0.0) {
    writer.writeDouble(
      1,
      f
    );
  }
  f = message.getSignal();
  if (f !== 0.0) {
    writer.writeDouble(
      2,
      f
    );
  }
  f = message.getHistogram();
  if (f !== 0.0) {
    writer.writeDouble(
      3,
      f
    );
  }
};


/**
 * optional double macd = 1;
 * @return {number}
 */
proto.marketdata.MACDCurrent.prototype.getMacd = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 1, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.MACDCurrent} returns this
 */
proto.marketdata.MACDCurrent.prototype.setMacd = function(value) {
  return jspb.Message.setProto3FloatField(this, 1, value);
};


/**
 * optional double signal = 2;
 * @return {number}
 */
proto.marketdata.MACDCurrent.prototype.getSignal = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 2, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.MACDCurrent} returns this
 */
proto.marketdata.MACDCurrent.prototype.setSignal = function(value) {
  return jspb.Message.setProto3FloatField(this, 2, value);
};


/**
 * optional double histogram = 3;
 * @return {number}
 */
proto.marketdata.MACDCurrent.prototype.getHistogram = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 3, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.MACDCurrent} returns this
 */
proto.marketdata.MACDCurrent.prototype.setHistogram = function(value) {
  return jspb.Message.setProto3FloatField(this, 3, value);
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.marketdata.MACD.repeatedFields_ = [3];



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
proto.marketdata.MACD.prototype.toObject = function(opt_includeInstance) {
  return proto.marketdata.MACD.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.marketdata.MACD} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.MACD.toObject = function(includeInstance, msg) {
  var f, obj = {
    symbol: jspb.Message.getFieldWithDefault(msg, 1, ""),
    interval: jspb.Message.getFieldWithDefault(msg, 2, 0),
    valuesList: jspb.Message.toObjectList(msg.getValuesList(),
    proto.marketdata.MACDValue.toObject, includeInstance),
    currentMacd: (f = msg.getCurrentMacd()) && proto.marketdata.MACDCurrent.toObject(includeInstance, f),
    crossover: jspb.Message.getFieldWithDefault(msg, 5, "")
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
 * @return {!proto.marketdata.MACD}
 */
proto.marketdata.MACD.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.marketdata.MACD;
  return proto.marketdata.MACD.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.marketdata.MACD} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.marketdata.MACD}
 */
proto.marketdata.MACD.deserializeBinaryFromReader = function(msg, reader) {
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
      var value = /** @type {!proto.marketdata.TimeInterval} */ (reader.readEnum());
      msg.setInterval(value);
      break;
    case 3:
      var value = new proto.marketdata.MACDValue;
      reader.readMessage(value,proto.marketdata.MACDValue.deserializeBinaryFromReader);
      msg.addValues(value);
      break;
    case 4:
      var value = new proto.marketdata.MACDCurrent;
      reader.readMessage(value,proto.marketdata.MACDCurrent.deserializeBinaryFromReader);
      msg.setCurrentMacd(value);
      break;
    case 5:
      var value = /** @type {string} */ (reader.readString());
      msg.setCrossover(value);
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
proto.marketdata.MACD.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.marketdata.MACD.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.marketdata.MACD} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.MACD.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getSymbol();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getInterval();
  if (f !== 0.0) {
    writer.writeEnum(
      2,
      f
    );
  }
  f = message.getValuesList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      3,
      f,
      proto.marketdata.MACDValue.serializeBinaryToWriter
    );
  }
  f = message.getCurrentMacd();
  if (f != null) {
    writer.writeMessage(
      4,
      f,
      proto.marketdata.MACDCurrent.serializeBinaryToWriter
    );
  }
  f = message.getCrossover();
  if (f.length > 0) {
    writer.writeString(
      5,
      f
    );
  }
};


/**
 * optional string symbol = 1;
 * @return {string}
 */
proto.marketdata.MACD.prototype.getSymbol = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.marketdata.MACD} returns this
 */
proto.marketdata.MACD.prototype.setSymbol = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional TimeInterval interval = 2;
 * @return {!proto.marketdata.TimeInterval}
 */
proto.marketdata.MACD.prototype.getInterval = function() {
  return /** @type {!proto.marketdata.TimeInterval} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/**
 * @param {!proto.marketdata.TimeInterval} value
 * @return {!proto.marketdata.MACD} returns this
 */
proto.marketdata.MACD.prototype.setInterval = function(value) {
  return jspb.Message.setProto3EnumField(this, 2, value);
};


/**
 * repeated MACDValue values = 3;
 * @return {!Array<!proto.marketdata.MACDValue>}
 */
proto.marketdata.MACD.prototype.getValuesList = function() {
  return /** @type{!Array<!proto.marketdata.MACDValue>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.marketdata.MACDValue, 3));
};


/**
 * @param {!Array<!proto.marketdata.MACDValue>} value
 * @return {!proto.marketdata.MACD} returns this
*/
proto.marketdata.MACD.prototype.setValuesList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 3, value);
};


/**
 * @param {!proto.marketdata.MACDValue=} opt_value
 * @param {number=} opt_index
 * @return {!proto.marketdata.MACDValue}
 */
proto.marketdata.MACD.prototype.addValues = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 3, opt_value, proto.marketdata.MACDValue, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.marketdata.MACD} returns this
 */
proto.marketdata.MACD.prototype.clearValuesList = function() {
  return this.setValuesList([]);
};


/**
 * optional MACDCurrent current_macd = 4;
 * @return {?proto.marketdata.MACDCurrent}
 */
proto.marketdata.MACD.prototype.getCurrentMacd = function() {
  return /** @type{?proto.marketdata.MACDCurrent} */ (
    jspb.Message.getWrapperField(this, proto.marketdata.MACDCurrent, 4));
};


/**
 * @param {?proto.marketdata.MACDCurrent|undefined} value
 * @return {!proto.marketdata.MACD} returns this
*/
proto.marketdata.MACD.prototype.setCurrentMacd = function(value) {
  return jspb.Message.setWrapperField(this, 4, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.marketdata.MACD} returns this
 */
proto.marketdata.MACD.prototype.clearCurrentMacd = function() {
  return this.setCurrentMacd(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.marketdata.MACD.prototype.hasCurrentMacd = function() {
  return jspb.Message.getField(this, 4) != null;
};


/**
 * optional string crossover = 5;
 * @return {string}
 */
proto.marketdata.MACD.prototype.getCrossover = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 5, ""));
};


/**
 * @param {string} value
 * @return {!proto.marketdata.MACD} returns this
 */
proto.marketdata.MACD.prototype.setCrossover = function(value) {
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
proto.marketdata.BollingerBandsValue.prototype.toObject = function(opt_includeInstance) {
  return proto.marketdata.BollingerBandsValue.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.marketdata.BollingerBandsValue} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.BollingerBandsValue.toObject = function(includeInstance, msg) {
  var f, obj = {
    timestamp: jspb.Message.getFieldWithDefault(msg, 1, 0),
    upper: jspb.Message.getFloatingPointFieldWithDefault(msg, 2, 0.0),
    middle: jspb.Message.getFloatingPointFieldWithDefault(msg, 3, 0.0),
    lower: jspb.Message.getFloatingPointFieldWithDefault(msg, 4, 0.0),
    price: jspb.Message.getFloatingPointFieldWithDefault(msg, 5, 0.0)
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
 * @return {!proto.marketdata.BollingerBandsValue}
 */
proto.marketdata.BollingerBandsValue.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.marketdata.BollingerBandsValue;
  return proto.marketdata.BollingerBandsValue.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.marketdata.BollingerBandsValue} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.marketdata.BollingerBandsValue}
 */
proto.marketdata.BollingerBandsValue.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {number} */ (reader.readInt64());
      msg.setTimestamp(value);
      break;
    case 2:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setUpper(value);
      break;
    case 3:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setMiddle(value);
      break;
    case 4:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setLower(value);
      break;
    case 5:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setPrice(value);
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
proto.marketdata.BollingerBandsValue.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.marketdata.BollingerBandsValue.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.marketdata.BollingerBandsValue} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.BollingerBandsValue.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getTimestamp();
  if (f !== 0) {
    writer.writeInt64(
      1,
      f
    );
  }
  f = message.getUpper();
  if (f !== 0.0) {
    writer.writeDouble(
      2,
      f
    );
  }
  f = message.getMiddle();
  if (f !== 0.0) {
    writer.writeDouble(
      3,
      f
    );
  }
  f = message.getLower();
  if (f !== 0.0) {
    writer.writeDouble(
      4,
      f
    );
  }
  f = message.getPrice();
  if (f !== 0.0) {
    writer.writeDouble(
      5,
      f
    );
  }
};


/**
 * optional int64 timestamp = 1;
 * @return {number}
 */
proto.marketdata.BollingerBandsValue.prototype.getTimestamp = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 1, 0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.BollingerBandsValue} returns this
 */
proto.marketdata.BollingerBandsValue.prototype.setTimestamp = function(value) {
  return jspb.Message.setProto3IntField(this, 1, value);
};


/**
 * optional double upper = 2;
 * @return {number}
 */
proto.marketdata.BollingerBandsValue.prototype.getUpper = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 2, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.BollingerBandsValue} returns this
 */
proto.marketdata.BollingerBandsValue.prototype.setUpper = function(value) {
  return jspb.Message.setProto3FloatField(this, 2, value);
};


/**
 * optional double middle = 3;
 * @return {number}
 */
proto.marketdata.BollingerBandsValue.prototype.getMiddle = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 3, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.BollingerBandsValue} returns this
 */
proto.marketdata.BollingerBandsValue.prototype.setMiddle = function(value) {
  return jspb.Message.setProto3FloatField(this, 3, value);
};


/**
 * optional double lower = 4;
 * @return {number}
 */
proto.marketdata.BollingerBandsValue.prototype.getLower = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 4, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.BollingerBandsValue} returns this
 */
proto.marketdata.BollingerBandsValue.prototype.setLower = function(value) {
  return jspb.Message.setProto3FloatField(this, 4, value);
};


/**
 * optional double price = 5;
 * @return {number}
 */
proto.marketdata.BollingerBandsValue.prototype.getPrice = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 5, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.BollingerBandsValue} returns this
 */
proto.marketdata.BollingerBandsValue.prototype.setPrice = function(value) {
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
proto.marketdata.BollingerBandsCurrent.prototype.toObject = function(opt_includeInstance) {
  return proto.marketdata.BollingerBandsCurrent.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.marketdata.BollingerBandsCurrent} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.BollingerBandsCurrent.toObject = function(includeInstance, msg) {
  var f, obj = {
    upper: jspb.Message.getFloatingPointFieldWithDefault(msg, 1, 0.0),
    middle: jspb.Message.getFloatingPointFieldWithDefault(msg, 2, 0.0),
    lower: jspb.Message.getFloatingPointFieldWithDefault(msg, 3, 0.0),
    price: jspb.Message.getFloatingPointFieldWithDefault(msg, 4, 0.0)
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
 * @return {!proto.marketdata.BollingerBandsCurrent}
 */
proto.marketdata.BollingerBandsCurrent.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.marketdata.BollingerBandsCurrent;
  return proto.marketdata.BollingerBandsCurrent.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.marketdata.BollingerBandsCurrent} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.marketdata.BollingerBandsCurrent}
 */
proto.marketdata.BollingerBandsCurrent.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setUpper(value);
      break;
    case 2:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setMiddle(value);
      break;
    case 3:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setLower(value);
      break;
    case 4:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setPrice(value);
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
proto.marketdata.BollingerBandsCurrent.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.marketdata.BollingerBandsCurrent.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.marketdata.BollingerBandsCurrent} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.BollingerBandsCurrent.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getUpper();
  if (f !== 0.0) {
    writer.writeDouble(
      1,
      f
    );
  }
  f = message.getMiddle();
  if (f !== 0.0) {
    writer.writeDouble(
      2,
      f
    );
  }
  f = message.getLower();
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
};


/**
 * optional double upper = 1;
 * @return {number}
 */
proto.marketdata.BollingerBandsCurrent.prototype.getUpper = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 1, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.BollingerBandsCurrent} returns this
 */
proto.marketdata.BollingerBandsCurrent.prototype.setUpper = function(value) {
  return jspb.Message.setProto3FloatField(this, 1, value);
};


/**
 * optional double middle = 2;
 * @return {number}
 */
proto.marketdata.BollingerBandsCurrent.prototype.getMiddle = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 2, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.BollingerBandsCurrent} returns this
 */
proto.marketdata.BollingerBandsCurrent.prototype.setMiddle = function(value) {
  return jspb.Message.setProto3FloatField(this, 2, value);
};


/**
 * optional double lower = 3;
 * @return {number}
 */
proto.marketdata.BollingerBandsCurrent.prototype.getLower = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 3, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.BollingerBandsCurrent} returns this
 */
proto.marketdata.BollingerBandsCurrent.prototype.setLower = function(value) {
  return jspb.Message.setProto3FloatField(this, 3, value);
};


/**
 * optional double price = 4;
 * @return {number}
 */
proto.marketdata.BollingerBandsCurrent.prototype.getPrice = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 4, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.BollingerBandsCurrent} returns this
 */
proto.marketdata.BollingerBandsCurrent.prototype.setPrice = function(value) {
  return jspb.Message.setProto3FloatField(this, 4, value);
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.marketdata.BollingerBands.repeatedFields_ = [3];



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
proto.marketdata.BollingerBands.prototype.toObject = function(opt_includeInstance) {
  return proto.marketdata.BollingerBands.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.marketdata.BollingerBands} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.BollingerBands.toObject = function(includeInstance, msg) {
  var f, obj = {
    symbol: jspb.Message.getFieldWithDefault(msg, 1, ""),
    interval: jspb.Message.getFieldWithDefault(msg, 2, 0),
    valuesList: jspb.Message.toObjectList(msg.getValuesList(),
    proto.marketdata.BollingerBandsValue.toObject, includeInstance),
    currentBands: (f = msg.getCurrentBands()) && proto.marketdata.BollingerBandsCurrent.toObject(includeInstance, f),
    signal: jspb.Message.getFieldWithDefault(msg, 5, "")
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
 * @return {!proto.marketdata.BollingerBands}
 */
proto.marketdata.BollingerBands.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.marketdata.BollingerBands;
  return proto.marketdata.BollingerBands.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.marketdata.BollingerBands} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.marketdata.BollingerBands}
 */
proto.marketdata.BollingerBands.deserializeBinaryFromReader = function(msg, reader) {
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
      var value = /** @type {!proto.marketdata.TimeInterval} */ (reader.readEnum());
      msg.setInterval(value);
      break;
    case 3:
      var value = new proto.marketdata.BollingerBandsValue;
      reader.readMessage(value,proto.marketdata.BollingerBandsValue.deserializeBinaryFromReader);
      msg.addValues(value);
      break;
    case 4:
      var value = new proto.marketdata.BollingerBandsCurrent;
      reader.readMessage(value,proto.marketdata.BollingerBandsCurrent.deserializeBinaryFromReader);
      msg.setCurrentBands(value);
      break;
    case 5:
      var value = /** @type {string} */ (reader.readString());
      msg.setSignal(value);
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
proto.marketdata.BollingerBands.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.marketdata.BollingerBands.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.marketdata.BollingerBands} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.BollingerBands.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getSymbol();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getInterval();
  if (f !== 0.0) {
    writer.writeEnum(
      2,
      f
    );
  }
  f = message.getValuesList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      3,
      f,
      proto.marketdata.BollingerBandsValue.serializeBinaryToWriter
    );
  }
  f = message.getCurrentBands();
  if (f != null) {
    writer.writeMessage(
      4,
      f,
      proto.marketdata.BollingerBandsCurrent.serializeBinaryToWriter
    );
  }
  f = message.getSignal();
  if (f.length > 0) {
    writer.writeString(
      5,
      f
    );
  }
};


/**
 * optional string symbol = 1;
 * @return {string}
 */
proto.marketdata.BollingerBands.prototype.getSymbol = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.marketdata.BollingerBands} returns this
 */
proto.marketdata.BollingerBands.prototype.setSymbol = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional TimeInterval interval = 2;
 * @return {!proto.marketdata.TimeInterval}
 */
proto.marketdata.BollingerBands.prototype.getInterval = function() {
  return /** @type {!proto.marketdata.TimeInterval} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/**
 * @param {!proto.marketdata.TimeInterval} value
 * @return {!proto.marketdata.BollingerBands} returns this
 */
proto.marketdata.BollingerBands.prototype.setInterval = function(value) {
  return jspb.Message.setProto3EnumField(this, 2, value);
};


/**
 * repeated BollingerBandsValue values = 3;
 * @return {!Array<!proto.marketdata.BollingerBandsValue>}
 */
proto.marketdata.BollingerBands.prototype.getValuesList = function() {
  return /** @type{!Array<!proto.marketdata.BollingerBandsValue>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.marketdata.BollingerBandsValue, 3));
};


/**
 * @param {!Array<!proto.marketdata.BollingerBandsValue>} value
 * @return {!proto.marketdata.BollingerBands} returns this
*/
proto.marketdata.BollingerBands.prototype.setValuesList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 3, value);
};


/**
 * @param {!proto.marketdata.BollingerBandsValue=} opt_value
 * @param {number=} opt_index
 * @return {!proto.marketdata.BollingerBandsValue}
 */
proto.marketdata.BollingerBands.prototype.addValues = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 3, opt_value, proto.marketdata.BollingerBandsValue, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.marketdata.BollingerBands} returns this
 */
proto.marketdata.BollingerBands.prototype.clearValuesList = function() {
  return this.setValuesList([]);
};


/**
 * optional BollingerBandsCurrent current_bands = 4;
 * @return {?proto.marketdata.BollingerBandsCurrent}
 */
proto.marketdata.BollingerBands.prototype.getCurrentBands = function() {
  return /** @type{?proto.marketdata.BollingerBandsCurrent} */ (
    jspb.Message.getWrapperField(this, proto.marketdata.BollingerBandsCurrent, 4));
};


/**
 * @param {?proto.marketdata.BollingerBandsCurrent|undefined} value
 * @return {!proto.marketdata.BollingerBands} returns this
*/
proto.marketdata.BollingerBands.prototype.setCurrentBands = function(value) {
  return jspb.Message.setWrapperField(this, 4, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.marketdata.BollingerBands} returns this
 */
proto.marketdata.BollingerBands.prototype.clearCurrentBands = function() {
  return this.setCurrentBands(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.marketdata.BollingerBands.prototype.hasCurrentBands = function() {
  return jspb.Message.getField(this, 4) != null;
};


/**
 * optional string signal = 5;
 * @return {string}
 */
proto.marketdata.BollingerBands.prototype.getSignal = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 5, ""));
};


/**
 * @param {string} value
 * @return {!proto.marketdata.BollingerBands} returns this
 */
proto.marketdata.BollingerBands.prototype.setSignal = function(value) {
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
proto.marketdata.MovingAverageValue.prototype.toObject = function(opt_includeInstance) {
  return proto.marketdata.MovingAverageValue.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.marketdata.MovingAverageValue} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.MovingAverageValue.toObject = function(includeInstance, msg) {
  var f, obj = {
    timestamp: jspb.Message.getFieldWithDefault(msg, 1, 0),
    ma: jspb.Message.getFloatingPointFieldWithDefault(msg, 2, 0.0),
    price: jspb.Message.getFloatingPointFieldWithDefault(msg, 3, 0.0)
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
 * @return {!proto.marketdata.MovingAverageValue}
 */
proto.marketdata.MovingAverageValue.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.marketdata.MovingAverageValue;
  return proto.marketdata.MovingAverageValue.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.marketdata.MovingAverageValue} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.marketdata.MovingAverageValue}
 */
proto.marketdata.MovingAverageValue.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {number} */ (reader.readInt64());
      msg.setTimestamp(value);
      break;
    case 2:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setMa(value);
      break;
    case 3:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setPrice(value);
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
proto.marketdata.MovingAverageValue.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.marketdata.MovingAverageValue.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.marketdata.MovingAverageValue} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.MovingAverageValue.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getTimestamp();
  if (f !== 0) {
    writer.writeInt64(
      1,
      f
    );
  }
  f = message.getMa();
  if (f !== 0.0) {
    writer.writeDouble(
      2,
      f
    );
  }
  f = message.getPrice();
  if (f !== 0.0) {
    writer.writeDouble(
      3,
      f
    );
  }
};


/**
 * optional int64 timestamp = 1;
 * @return {number}
 */
proto.marketdata.MovingAverageValue.prototype.getTimestamp = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 1, 0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.MovingAverageValue} returns this
 */
proto.marketdata.MovingAverageValue.prototype.setTimestamp = function(value) {
  return jspb.Message.setProto3IntField(this, 1, value);
};


/**
 * optional double ma = 2;
 * @return {number}
 */
proto.marketdata.MovingAverageValue.prototype.getMa = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 2, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.MovingAverageValue} returns this
 */
proto.marketdata.MovingAverageValue.prototype.setMa = function(value) {
  return jspb.Message.setProto3FloatField(this, 2, value);
};


/**
 * optional double price = 3;
 * @return {number}
 */
proto.marketdata.MovingAverageValue.prototype.getPrice = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 3, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.MovingAverageValue} returns this
 */
proto.marketdata.MovingAverageValue.prototype.setPrice = function(value) {
  return jspb.Message.setProto3FloatField(this, 3, value);
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.marketdata.MovingAverage.repeatedFields_ = [5];



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
proto.marketdata.MovingAverage.prototype.toObject = function(opt_includeInstance) {
  return proto.marketdata.MovingAverage.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.marketdata.MovingAverage} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.MovingAverage.toObject = function(includeInstance, msg) {
  var f, obj = {
    symbol: jspb.Message.getFieldWithDefault(msg, 1, ""),
    interval: jspb.Message.getFieldWithDefault(msg, 2, 0),
    type: jspb.Message.getFieldWithDefault(msg, 3, ""),
    period: jspb.Message.getFieldWithDefault(msg, 4, 0),
    valuesList: jspb.Message.toObjectList(msg.getValuesList(),
    proto.marketdata.MovingAverageValue.toObject, includeInstance),
    currentMa: jspb.Message.getFloatingPointFieldWithDefault(msg, 6, 0.0),
    currentPrice: jspb.Message.getFloatingPointFieldWithDefault(msg, 7, 0.0),
    signal: jspb.Message.getFieldWithDefault(msg, 8, "")
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
 * @return {!proto.marketdata.MovingAverage}
 */
proto.marketdata.MovingAverage.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.marketdata.MovingAverage;
  return proto.marketdata.MovingAverage.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.marketdata.MovingAverage} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.marketdata.MovingAverage}
 */
proto.marketdata.MovingAverage.deserializeBinaryFromReader = function(msg, reader) {
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
      var value = /** @type {!proto.marketdata.TimeInterval} */ (reader.readEnum());
      msg.setInterval(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readString());
      msg.setType(value);
      break;
    case 4:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setPeriod(value);
      break;
    case 5:
      var value = new proto.marketdata.MovingAverageValue;
      reader.readMessage(value,proto.marketdata.MovingAverageValue.deserializeBinaryFromReader);
      msg.addValues(value);
      break;
    case 6:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setCurrentMa(value);
      break;
    case 7:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setCurrentPrice(value);
      break;
    case 8:
      var value = /** @type {string} */ (reader.readString());
      msg.setSignal(value);
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
proto.marketdata.MovingAverage.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.marketdata.MovingAverage.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.marketdata.MovingAverage} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.MovingAverage.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getSymbol();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getInterval();
  if (f !== 0.0) {
    writer.writeEnum(
      2,
      f
    );
  }
  f = message.getType();
  if (f.length > 0) {
    writer.writeString(
      3,
      f
    );
  }
  f = message.getPeriod();
  if (f !== 0) {
    writer.writeInt32(
      4,
      f
    );
  }
  f = message.getValuesList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      5,
      f,
      proto.marketdata.MovingAverageValue.serializeBinaryToWriter
    );
  }
  f = message.getCurrentMa();
  if (f !== 0.0) {
    writer.writeDouble(
      6,
      f
    );
  }
  f = message.getCurrentPrice();
  if (f !== 0.0) {
    writer.writeDouble(
      7,
      f
    );
  }
  f = message.getSignal();
  if (f.length > 0) {
    writer.writeString(
      8,
      f
    );
  }
};


/**
 * optional string symbol = 1;
 * @return {string}
 */
proto.marketdata.MovingAverage.prototype.getSymbol = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.marketdata.MovingAverage} returns this
 */
proto.marketdata.MovingAverage.prototype.setSymbol = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional TimeInterval interval = 2;
 * @return {!proto.marketdata.TimeInterval}
 */
proto.marketdata.MovingAverage.prototype.getInterval = function() {
  return /** @type {!proto.marketdata.TimeInterval} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/**
 * @param {!proto.marketdata.TimeInterval} value
 * @return {!proto.marketdata.MovingAverage} returns this
 */
proto.marketdata.MovingAverage.prototype.setInterval = function(value) {
  return jspb.Message.setProto3EnumField(this, 2, value);
};


/**
 * optional string type = 3;
 * @return {string}
 */
proto.marketdata.MovingAverage.prototype.getType = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/**
 * @param {string} value
 * @return {!proto.marketdata.MovingAverage} returns this
 */
proto.marketdata.MovingAverage.prototype.setType = function(value) {
  return jspb.Message.setProto3StringField(this, 3, value);
};


/**
 * optional int32 period = 4;
 * @return {number}
 */
proto.marketdata.MovingAverage.prototype.getPeriod = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 4, 0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.MovingAverage} returns this
 */
proto.marketdata.MovingAverage.prototype.setPeriod = function(value) {
  return jspb.Message.setProto3IntField(this, 4, value);
};


/**
 * repeated MovingAverageValue values = 5;
 * @return {!Array<!proto.marketdata.MovingAverageValue>}
 */
proto.marketdata.MovingAverage.prototype.getValuesList = function() {
  return /** @type{!Array<!proto.marketdata.MovingAverageValue>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.marketdata.MovingAverageValue, 5));
};


/**
 * @param {!Array<!proto.marketdata.MovingAverageValue>} value
 * @return {!proto.marketdata.MovingAverage} returns this
*/
proto.marketdata.MovingAverage.prototype.setValuesList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 5, value);
};


/**
 * @param {!proto.marketdata.MovingAverageValue=} opt_value
 * @param {number=} opt_index
 * @return {!proto.marketdata.MovingAverageValue}
 */
proto.marketdata.MovingAverage.prototype.addValues = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 5, opt_value, proto.marketdata.MovingAverageValue, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.marketdata.MovingAverage} returns this
 */
proto.marketdata.MovingAverage.prototype.clearValuesList = function() {
  return this.setValuesList([]);
};


/**
 * optional double current_ma = 6;
 * @return {number}
 */
proto.marketdata.MovingAverage.prototype.getCurrentMa = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 6, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.MovingAverage} returns this
 */
proto.marketdata.MovingAverage.prototype.setCurrentMa = function(value) {
  return jspb.Message.setProto3FloatField(this, 6, value);
};


/**
 * optional double current_price = 7;
 * @return {number}
 */
proto.marketdata.MovingAverage.prototype.getCurrentPrice = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 7, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.MovingAverage} returns this
 */
proto.marketdata.MovingAverage.prototype.setCurrentPrice = function(value) {
  return jspb.Message.setProto3FloatField(this, 7, value);
};


/**
 * optional string signal = 8;
 * @return {string}
 */
proto.marketdata.MovingAverage.prototype.getSignal = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 8, ""));
};


/**
 * @param {string} value
 * @return {!proto.marketdata.MovingAverage} returns this
 */
proto.marketdata.MovingAverage.prototype.setSignal = function(value) {
  return jspb.Message.setProto3StringField(this, 8, value);
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
proto.marketdata.StochasticValue.prototype.toObject = function(opt_includeInstance) {
  return proto.marketdata.StochasticValue.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.marketdata.StochasticValue} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.StochasticValue.toObject = function(includeInstance, msg) {
  var f, obj = {
    timestamp: jspb.Message.getFieldWithDefault(msg, 1, 0),
    k: jspb.Message.getFloatingPointFieldWithDefault(msg, 2, 0.0),
    d: jspb.Message.getFloatingPointFieldWithDefault(msg, 3, 0.0)
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
 * @return {!proto.marketdata.StochasticValue}
 */
proto.marketdata.StochasticValue.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.marketdata.StochasticValue;
  return proto.marketdata.StochasticValue.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.marketdata.StochasticValue} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.marketdata.StochasticValue}
 */
proto.marketdata.StochasticValue.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {number} */ (reader.readInt64());
      msg.setTimestamp(value);
      break;
    case 2:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setK(value);
      break;
    case 3:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setD(value);
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
proto.marketdata.StochasticValue.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.marketdata.StochasticValue.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.marketdata.StochasticValue} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.StochasticValue.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getTimestamp();
  if (f !== 0) {
    writer.writeInt64(
      1,
      f
    );
  }
  f = message.getK();
  if (f !== 0.0) {
    writer.writeDouble(
      2,
      f
    );
  }
  f = message.getD();
  if (f !== 0.0) {
    writer.writeDouble(
      3,
      f
    );
  }
};


/**
 * optional int64 timestamp = 1;
 * @return {number}
 */
proto.marketdata.StochasticValue.prototype.getTimestamp = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 1, 0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.StochasticValue} returns this
 */
proto.marketdata.StochasticValue.prototype.setTimestamp = function(value) {
  return jspb.Message.setProto3IntField(this, 1, value);
};


/**
 * optional double k = 2;
 * @return {number}
 */
proto.marketdata.StochasticValue.prototype.getK = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 2, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.StochasticValue} returns this
 */
proto.marketdata.StochasticValue.prototype.setK = function(value) {
  return jspb.Message.setProto3FloatField(this, 2, value);
};


/**
 * optional double d = 3;
 * @return {number}
 */
proto.marketdata.StochasticValue.prototype.getD = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 3, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.StochasticValue} returns this
 */
proto.marketdata.StochasticValue.prototype.setD = function(value) {
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
proto.marketdata.StochasticCurrent.prototype.toObject = function(opt_includeInstance) {
  return proto.marketdata.StochasticCurrent.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.marketdata.StochasticCurrent} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.StochasticCurrent.toObject = function(includeInstance, msg) {
  var f, obj = {
    k: jspb.Message.getFloatingPointFieldWithDefault(msg, 1, 0.0),
    d: jspb.Message.getFloatingPointFieldWithDefault(msg, 2, 0.0)
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
 * @return {!proto.marketdata.StochasticCurrent}
 */
proto.marketdata.StochasticCurrent.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.marketdata.StochasticCurrent;
  return proto.marketdata.StochasticCurrent.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.marketdata.StochasticCurrent} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.marketdata.StochasticCurrent}
 */
proto.marketdata.StochasticCurrent.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setK(value);
      break;
    case 2:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setD(value);
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
proto.marketdata.StochasticCurrent.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.marketdata.StochasticCurrent.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.marketdata.StochasticCurrent} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.StochasticCurrent.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getK();
  if (f !== 0.0) {
    writer.writeDouble(
      1,
      f
    );
  }
  f = message.getD();
  if (f !== 0.0) {
    writer.writeDouble(
      2,
      f
    );
  }
};


/**
 * optional double k = 1;
 * @return {number}
 */
proto.marketdata.StochasticCurrent.prototype.getK = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 1, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.StochasticCurrent} returns this
 */
proto.marketdata.StochasticCurrent.prototype.setK = function(value) {
  return jspb.Message.setProto3FloatField(this, 1, value);
};


/**
 * optional double d = 2;
 * @return {number}
 */
proto.marketdata.StochasticCurrent.prototype.getD = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 2, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.StochasticCurrent} returns this
 */
proto.marketdata.StochasticCurrent.prototype.setD = function(value) {
  return jspb.Message.setProto3FloatField(this, 2, value);
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.marketdata.Stochastic.repeatedFields_ = [3];



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
proto.marketdata.Stochastic.prototype.toObject = function(opt_includeInstance) {
  return proto.marketdata.Stochastic.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.marketdata.Stochastic} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.Stochastic.toObject = function(includeInstance, msg) {
  var f, obj = {
    symbol: jspb.Message.getFieldWithDefault(msg, 1, ""),
    interval: jspb.Message.getFieldWithDefault(msg, 2, 0),
    valuesList: jspb.Message.toObjectList(msg.getValuesList(),
    proto.marketdata.StochasticValue.toObject, includeInstance),
    currentStochastic: (f = msg.getCurrentStochastic()) && proto.marketdata.StochasticCurrent.toObject(includeInstance, f),
    signal: jspb.Message.getFieldWithDefault(msg, 5, "")
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
 * @return {!proto.marketdata.Stochastic}
 */
proto.marketdata.Stochastic.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.marketdata.Stochastic;
  return proto.marketdata.Stochastic.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.marketdata.Stochastic} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.marketdata.Stochastic}
 */
proto.marketdata.Stochastic.deserializeBinaryFromReader = function(msg, reader) {
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
      var value = /** @type {!proto.marketdata.TimeInterval} */ (reader.readEnum());
      msg.setInterval(value);
      break;
    case 3:
      var value = new proto.marketdata.StochasticValue;
      reader.readMessage(value,proto.marketdata.StochasticValue.deserializeBinaryFromReader);
      msg.addValues(value);
      break;
    case 4:
      var value = new proto.marketdata.StochasticCurrent;
      reader.readMessage(value,proto.marketdata.StochasticCurrent.deserializeBinaryFromReader);
      msg.setCurrentStochastic(value);
      break;
    case 5:
      var value = /** @type {string} */ (reader.readString());
      msg.setSignal(value);
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
proto.marketdata.Stochastic.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.marketdata.Stochastic.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.marketdata.Stochastic} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.Stochastic.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getSymbol();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getInterval();
  if (f !== 0.0) {
    writer.writeEnum(
      2,
      f
    );
  }
  f = message.getValuesList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      3,
      f,
      proto.marketdata.StochasticValue.serializeBinaryToWriter
    );
  }
  f = message.getCurrentStochastic();
  if (f != null) {
    writer.writeMessage(
      4,
      f,
      proto.marketdata.StochasticCurrent.serializeBinaryToWriter
    );
  }
  f = message.getSignal();
  if (f.length > 0) {
    writer.writeString(
      5,
      f
    );
  }
};


/**
 * optional string symbol = 1;
 * @return {string}
 */
proto.marketdata.Stochastic.prototype.getSymbol = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.marketdata.Stochastic} returns this
 */
proto.marketdata.Stochastic.prototype.setSymbol = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional TimeInterval interval = 2;
 * @return {!proto.marketdata.TimeInterval}
 */
proto.marketdata.Stochastic.prototype.getInterval = function() {
  return /** @type {!proto.marketdata.TimeInterval} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/**
 * @param {!proto.marketdata.TimeInterval} value
 * @return {!proto.marketdata.Stochastic} returns this
 */
proto.marketdata.Stochastic.prototype.setInterval = function(value) {
  return jspb.Message.setProto3EnumField(this, 2, value);
};


/**
 * repeated StochasticValue values = 3;
 * @return {!Array<!proto.marketdata.StochasticValue>}
 */
proto.marketdata.Stochastic.prototype.getValuesList = function() {
  return /** @type{!Array<!proto.marketdata.StochasticValue>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.marketdata.StochasticValue, 3));
};


/**
 * @param {!Array<!proto.marketdata.StochasticValue>} value
 * @return {!proto.marketdata.Stochastic} returns this
*/
proto.marketdata.Stochastic.prototype.setValuesList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 3, value);
};


/**
 * @param {!proto.marketdata.StochasticValue=} opt_value
 * @param {number=} opt_index
 * @return {!proto.marketdata.StochasticValue}
 */
proto.marketdata.Stochastic.prototype.addValues = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 3, opt_value, proto.marketdata.StochasticValue, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.marketdata.Stochastic} returns this
 */
proto.marketdata.Stochastic.prototype.clearValuesList = function() {
  return this.setValuesList([]);
};


/**
 * optional StochasticCurrent current_stochastic = 4;
 * @return {?proto.marketdata.StochasticCurrent}
 */
proto.marketdata.Stochastic.prototype.getCurrentStochastic = function() {
  return /** @type{?proto.marketdata.StochasticCurrent} */ (
    jspb.Message.getWrapperField(this, proto.marketdata.StochasticCurrent, 4));
};


/**
 * @param {?proto.marketdata.StochasticCurrent|undefined} value
 * @return {!proto.marketdata.Stochastic} returns this
*/
proto.marketdata.Stochastic.prototype.setCurrentStochastic = function(value) {
  return jspb.Message.setWrapperField(this, 4, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.marketdata.Stochastic} returns this
 */
proto.marketdata.Stochastic.prototype.clearCurrentStochastic = function() {
  return this.setCurrentStochastic(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.marketdata.Stochastic.prototype.hasCurrentStochastic = function() {
  return jspb.Message.getField(this, 4) != null;
};


/**
 * optional string signal = 5;
 * @return {string}
 */
proto.marketdata.Stochastic.prototype.getSignal = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 5, ""));
};


/**
 * @param {string} value
 * @return {!proto.marketdata.Stochastic} returns this
 */
proto.marketdata.Stochastic.prototype.setSignal = function(value) {
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
proto.marketdata.OBVValue.prototype.toObject = function(opt_includeInstance) {
  return proto.marketdata.OBVValue.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.marketdata.OBVValue} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.OBVValue.toObject = function(includeInstance, msg) {
  var f, obj = {
    timestamp: jspb.Message.getFieldWithDefault(msg, 1, 0),
    obv: jspb.Message.getFloatingPointFieldWithDefault(msg, 2, 0.0)
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
 * @return {!proto.marketdata.OBVValue}
 */
proto.marketdata.OBVValue.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.marketdata.OBVValue;
  return proto.marketdata.OBVValue.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.marketdata.OBVValue} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.marketdata.OBVValue}
 */
proto.marketdata.OBVValue.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {number} */ (reader.readInt64());
      msg.setTimestamp(value);
      break;
    case 2:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setObv(value);
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
proto.marketdata.OBVValue.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.marketdata.OBVValue.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.marketdata.OBVValue} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.OBVValue.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getTimestamp();
  if (f !== 0) {
    writer.writeInt64(
      1,
      f
    );
  }
  f = message.getObv();
  if (f !== 0.0) {
    writer.writeDouble(
      2,
      f
    );
  }
};


/**
 * optional int64 timestamp = 1;
 * @return {number}
 */
proto.marketdata.OBVValue.prototype.getTimestamp = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 1, 0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.OBVValue} returns this
 */
proto.marketdata.OBVValue.prototype.setTimestamp = function(value) {
  return jspb.Message.setProto3IntField(this, 1, value);
};


/**
 * optional double obv = 2;
 * @return {number}
 */
proto.marketdata.OBVValue.prototype.getObv = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 2, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.OBVValue} returns this
 */
proto.marketdata.OBVValue.prototype.setObv = function(value) {
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
proto.marketdata.VolumeSMAValue.prototype.toObject = function(opt_includeInstance) {
  return proto.marketdata.VolumeSMAValue.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.marketdata.VolumeSMAValue} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.VolumeSMAValue.toObject = function(includeInstance, msg) {
  var f, obj = {
    timestamp: jspb.Message.getFieldWithDefault(msg, 1, 0),
    volumeSma: jspb.Message.getFloatingPointFieldWithDefault(msg, 2, 0.0),
    volume: jspb.Message.getFloatingPointFieldWithDefault(msg, 3, 0.0)
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
 * @return {!proto.marketdata.VolumeSMAValue}
 */
proto.marketdata.VolumeSMAValue.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.marketdata.VolumeSMAValue;
  return proto.marketdata.VolumeSMAValue.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.marketdata.VolumeSMAValue} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.marketdata.VolumeSMAValue}
 */
proto.marketdata.VolumeSMAValue.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {number} */ (reader.readInt64());
      msg.setTimestamp(value);
      break;
    case 2:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setVolumeSma(value);
      break;
    case 3:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setVolume(value);
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
proto.marketdata.VolumeSMAValue.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.marketdata.VolumeSMAValue.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.marketdata.VolumeSMAValue} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.VolumeSMAValue.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getTimestamp();
  if (f !== 0) {
    writer.writeInt64(
      1,
      f
    );
  }
  f = message.getVolumeSma();
  if (f !== 0.0) {
    writer.writeDouble(
      2,
      f
    );
  }
  f = message.getVolume();
  if (f !== 0.0) {
    writer.writeDouble(
      3,
      f
    );
  }
};


/**
 * optional int64 timestamp = 1;
 * @return {number}
 */
proto.marketdata.VolumeSMAValue.prototype.getTimestamp = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 1, 0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.VolumeSMAValue} returns this
 */
proto.marketdata.VolumeSMAValue.prototype.setTimestamp = function(value) {
  return jspb.Message.setProto3IntField(this, 1, value);
};


/**
 * optional double volume_sma = 2;
 * @return {number}
 */
proto.marketdata.VolumeSMAValue.prototype.getVolumeSma = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 2, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.VolumeSMAValue} returns this
 */
proto.marketdata.VolumeSMAValue.prototype.setVolumeSma = function(value) {
  return jspb.Message.setProto3FloatField(this, 2, value);
};


/**
 * optional double volume = 3;
 * @return {number}
 */
proto.marketdata.VolumeSMAValue.prototype.getVolume = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 3, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.VolumeSMAValue} returns this
 */
proto.marketdata.VolumeSMAValue.prototype.setVolume = function(value) {
  return jspb.Message.setProto3FloatField(this, 3, value);
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.marketdata.VolumeIndicators.repeatedFields_ = [3,4];



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
proto.marketdata.VolumeIndicators.prototype.toObject = function(opt_includeInstance) {
  return proto.marketdata.VolumeIndicators.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.marketdata.VolumeIndicators} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.VolumeIndicators.toObject = function(includeInstance, msg) {
  var f, obj = {
    symbol: jspb.Message.getFieldWithDefault(msg, 1, ""),
    interval: jspb.Message.getFieldWithDefault(msg, 2, 0),
    obvList: jspb.Message.toObjectList(msg.getObvList(),
    proto.marketdata.OBVValue.toObject, includeInstance),
    volumeSmaList: jspb.Message.toObjectList(msg.getVolumeSmaList(),
    proto.marketdata.VolumeSMAValue.toObject, includeInstance),
    volumeSpike: jspb.Message.getBooleanFieldWithDefault(msg, 5, false),
    currentObv: jspb.Message.getFloatingPointFieldWithDefault(msg, 6, 0.0)
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
 * @return {!proto.marketdata.VolumeIndicators}
 */
proto.marketdata.VolumeIndicators.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.marketdata.VolumeIndicators;
  return proto.marketdata.VolumeIndicators.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.marketdata.VolumeIndicators} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.marketdata.VolumeIndicators}
 */
proto.marketdata.VolumeIndicators.deserializeBinaryFromReader = function(msg, reader) {
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
      var value = /** @type {!proto.marketdata.TimeInterval} */ (reader.readEnum());
      msg.setInterval(value);
      break;
    case 3:
      var value = new proto.marketdata.OBVValue;
      reader.readMessage(value,proto.marketdata.OBVValue.deserializeBinaryFromReader);
      msg.addObv(value);
      break;
    case 4:
      var value = new proto.marketdata.VolumeSMAValue;
      reader.readMessage(value,proto.marketdata.VolumeSMAValue.deserializeBinaryFromReader);
      msg.addVolumeSma(value);
      break;
    case 5:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setVolumeSpike(value);
      break;
    case 6:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setCurrentObv(value);
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
proto.marketdata.VolumeIndicators.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.marketdata.VolumeIndicators.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.marketdata.VolumeIndicators} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.VolumeIndicators.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getSymbol();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getInterval();
  if (f !== 0.0) {
    writer.writeEnum(
      2,
      f
    );
  }
  f = message.getObvList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      3,
      f,
      proto.marketdata.OBVValue.serializeBinaryToWriter
    );
  }
  f = message.getVolumeSmaList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      4,
      f,
      proto.marketdata.VolumeSMAValue.serializeBinaryToWriter
    );
  }
  f = message.getVolumeSpike();
  if (f) {
    writer.writeBool(
      5,
      f
    );
  }
  f = message.getCurrentObv();
  if (f !== 0.0) {
    writer.writeDouble(
      6,
      f
    );
  }
};


/**
 * optional string symbol = 1;
 * @return {string}
 */
proto.marketdata.VolumeIndicators.prototype.getSymbol = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.marketdata.VolumeIndicators} returns this
 */
proto.marketdata.VolumeIndicators.prototype.setSymbol = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional TimeInterval interval = 2;
 * @return {!proto.marketdata.TimeInterval}
 */
proto.marketdata.VolumeIndicators.prototype.getInterval = function() {
  return /** @type {!proto.marketdata.TimeInterval} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/**
 * @param {!proto.marketdata.TimeInterval} value
 * @return {!proto.marketdata.VolumeIndicators} returns this
 */
proto.marketdata.VolumeIndicators.prototype.setInterval = function(value) {
  return jspb.Message.setProto3EnumField(this, 2, value);
};


/**
 * repeated OBVValue obv = 3;
 * @return {!Array<!proto.marketdata.OBVValue>}
 */
proto.marketdata.VolumeIndicators.prototype.getObvList = function() {
  return /** @type{!Array<!proto.marketdata.OBVValue>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.marketdata.OBVValue, 3));
};


/**
 * @param {!Array<!proto.marketdata.OBVValue>} value
 * @return {!proto.marketdata.VolumeIndicators} returns this
*/
proto.marketdata.VolumeIndicators.prototype.setObvList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 3, value);
};


/**
 * @param {!proto.marketdata.OBVValue=} opt_value
 * @param {number=} opt_index
 * @return {!proto.marketdata.OBVValue}
 */
proto.marketdata.VolumeIndicators.prototype.addObv = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 3, opt_value, proto.marketdata.OBVValue, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.marketdata.VolumeIndicators} returns this
 */
proto.marketdata.VolumeIndicators.prototype.clearObvList = function() {
  return this.setObvList([]);
};


/**
 * repeated VolumeSMAValue volume_sma = 4;
 * @return {!Array<!proto.marketdata.VolumeSMAValue>}
 */
proto.marketdata.VolumeIndicators.prototype.getVolumeSmaList = function() {
  return /** @type{!Array<!proto.marketdata.VolumeSMAValue>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.marketdata.VolumeSMAValue, 4));
};


/**
 * @param {!Array<!proto.marketdata.VolumeSMAValue>} value
 * @return {!proto.marketdata.VolumeIndicators} returns this
*/
proto.marketdata.VolumeIndicators.prototype.setVolumeSmaList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 4, value);
};


/**
 * @param {!proto.marketdata.VolumeSMAValue=} opt_value
 * @param {number=} opt_index
 * @return {!proto.marketdata.VolumeSMAValue}
 */
proto.marketdata.VolumeIndicators.prototype.addVolumeSma = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 4, opt_value, proto.marketdata.VolumeSMAValue, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.marketdata.VolumeIndicators} returns this
 */
proto.marketdata.VolumeIndicators.prototype.clearVolumeSmaList = function() {
  return this.setVolumeSmaList([]);
};


/**
 * optional bool volume_spike = 5;
 * @return {boolean}
 */
proto.marketdata.VolumeIndicators.prototype.getVolumeSpike = function() {
  return /** @type {boolean} */ (jspb.Message.getBooleanFieldWithDefault(this, 5, false));
};


/**
 * @param {boolean} value
 * @return {!proto.marketdata.VolumeIndicators} returns this
 */
proto.marketdata.VolumeIndicators.prototype.setVolumeSpike = function(value) {
  return jspb.Message.setProto3BooleanField(this, 5, value);
};


/**
 * optional double current_obv = 6;
 * @return {number}
 */
proto.marketdata.VolumeIndicators.prototype.getCurrentObv = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 6, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.VolumeIndicators} returns this
 */
proto.marketdata.VolumeIndicators.prototype.setCurrentObv = function(value) {
  return jspb.Message.setProto3FloatField(this, 6, value);
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
proto.marketdata.VolumeProfileLevel.prototype.toObject = function(opt_includeInstance) {
  return proto.marketdata.VolumeProfileLevel.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.marketdata.VolumeProfileLevel} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.VolumeProfileLevel.toObject = function(includeInstance, msg) {
  var f, obj = {
    price: jspb.Message.getFloatingPointFieldWithDefault(msg, 1, 0.0),
    volume: jspb.Message.getFloatingPointFieldWithDefault(msg, 2, 0.0)
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
 * @return {!proto.marketdata.VolumeProfileLevel}
 */
proto.marketdata.VolumeProfileLevel.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.marketdata.VolumeProfileLevel;
  return proto.marketdata.VolumeProfileLevel.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.marketdata.VolumeProfileLevel} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.marketdata.VolumeProfileLevel}
 */
proto.marketdata.VolumeProfileLevel.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setPrice(value);
      break;
    case 2:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setVolume(value);
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
proto.marketdata.VolumeProfileLevel.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.marketdata.VolumeProfileLevel.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.marketdata.VolumeProfileLevel} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.VolumeProfileLevel.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getPrice();
  if (f !== 0.0) {
    writer.writeDouble(
      1,
      f
    );
  }
  f = message.getVolume();
  if (f !== 0.0) {
    writer.writeDouble(
      2,
      f
    );
  }
};


/**
 * optional double price = 1;
 * @return {number}
 */
proto.marketdata.VolumeProfileLevel.prototype.getPrice = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 1, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.VolumeProfileLevel} returns this
 */
proto.marketdata.VolumeProfileLevel.prototype.setPrice = function(value) {
  return jspb.Message.setProto3FloatField(this, 1, value);
};


/**
 * optional double volume = 2;
 * @return {number}
 */
proto.marketdata.VolumeProfileLevel.prototype.getVolume = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 2, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.VolumeProfileLevel} returns this
 */
proto.marketdata.VolumeProfileLevel.prototype.setVolume = function(value) {
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
proto.marketdata.Signal.prototype.toObject = function(opt_includeInstance) {
  return proto.marketdata.Signal.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.marketdata.Signal} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.Signal.toObject = function(includeInstance, msg) {
  var f, obj = {
    indicator: jspb.Message.getFieldWithDefault(msg, 1, ""),
    signal: jspb.Message.getFieldWithDefault(msg, 2, ""),
    strength: jspb.Message.getFieldWithDefault(msg, 3, "")
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
 * @return {!proto.marketdata.Signal}
 */
proto.marketdata.Signal.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.marketdata.Signal;
  return proto.marketdata.Signal.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.marketdata.Signal} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.marketdata.Signal}
 */
proto.marketdata.Signal.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setIndicator(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setSignal(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readString());
      msg.setStrength(value);
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
proto.marketdata.Signal.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.marketdata.Signal.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.marketdata.Signal} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.Signal.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getIndicator();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getSignal();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
  f = message.getStrength();
  if (f.length > 0) {
    writer.writeString(
      3,
      f
    );
  }
};


/**
 * optional string indicator = 1;
 * @return {string}
 */
proto.marketdata.Signal.prototype.getIndicator = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.marketdata.Signal} returns this
 */
proto.marketdata.Signal.prototype.setIndicator = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional string signal = 2;
 * @return {string}
 */
proto.marketdata.Signal.prototype.getSignal = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.marketdata.Signal} returns this
 */
proto.marketdata.Signal.prototype.setSignal = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};


/**
 * optional string strength = 3;
 * @return {string}
 */
proto.marketdata.Signal.prototype.getStrength = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/**
 * @param {string} value
 * @return {!proto.marketdata.Signal} returns this
 */
proto.marketdata.Signal.prototype.setStrength = function(value) {
  return jspb.Message.setProto3StringField(this, 3, value);
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.marketdata.ComprehensiveAnalysis.repeatedFields_ = [12];



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
proto.marketdata.ComprehensiveAnalysis.prototype.toObject = function(opt_includeInstance) {
  return proto.marketdata.ComprehensiveAnalysis.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.marketdata.ComprehensiveAnalysis} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.ComprehensiveAnalysis.toObject = function(includeInstance, msg) {
  var f, obj = {
    symbol: jspb.Message.getFieldWithDefault(msg, 1, ""),
    interval: jspb.Message.getFieldWithDefault(msg, 2, 0),
    timestamp: jspb.Message.getFieldWithDefault(msg, 3, 0),
    rsi: (f = msg.getRsi()) && proto.marketdata.RSI.toObject(includeInstance, f),
    macd: (f = msg.getMacd()) && proto.marketdata.MACD.toObject(includeInstance, f),
    bollingerBands: (f = msg.getBollingerBands()) && proto.marketdata.BollingerBands.toObject(includeInstance, f),
    sma20: (f = msg.getSma20()) && proto.marketdata.MovingAverage.toObject(includeInstance, f),
    ema20: (f = msg.getEma20()) && proto.marketdata.MovingAverage.toObject(includeInstance, f),
    stochastic: (f = msg.getStochastic()) && proto.marketdata.Stochastic.toObject(includeInstance, f),
    volumeIndicators: (f = msg.getVolumeIndicators()) && proto.marketdata.VolumeIndicators.toObject(includeInstance, f),
    overallSignal: jspb.Message.getFieldWithDefault(msg, 11, ""),
    signalsList: jspb.Message.toObjectList(msg.getSignalsList(),
    proto.marketdata.Signal.toObject, includeInstance)
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
 * @return {!proto.marketdata.ComprehensiveAnalysis}
 */
proto.marketdata.ComprehensiveAnalysis.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.marketdata.ComprehensiveAnalysis;
  return proto.marketdata.ComprehensiveAnalysis.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.marketdata.ComprehensiveAnalysis} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.marketdata.ComprehensiveAnalysis}
 */
proto.marketdata.ComprehensiveAnalysis.deserializeBinaryFromReader = function(msg, reader) {
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
      var value = /** @type {!proto.marketdata.TimeInterval} */ (reader.readEnum());
      msg.setInterval(value);
      break;
    case 3:
      var value = /** @type {number} */ (reader.readInt64());
      msg.setTimestamp(value);
      break;
    case 4:
      var value = new proto.marketdata.RSI;
      reader.readMessage(value,proto.marketdata.RSI.deserializeBinaryFromReader);
      msg.setRsi(value);
      break;
    case 5:
      var value = new proto.marketdata.MACD;
      reader.readMessage(value,proto.marketdata.MACD.deserializeBinaryFromReader);
      msg.setMacd(value);
      break;
    case 6:
      var value = new proto.marketdata.BollingerBands;
      reader.readMessage(value,proto.marketdata.BollingerBands.deserializeBinaryFromReader);
      msg.setBollingerBands(value);
      break;
    case 7:
      var value = new proto.marketdata.MovingAverage;
      reader.readMessage(value,proto.marketdata.MovingAverage.deserializeBinaryFromReader);
      msg.setSma20(value);
      break;
    case 8:
      var value = new proto.marketdata.MovingAverage;
      reader.readMessage(value,proto.marketdata.MovingAverage.deserializeBinaryFromReader);
      msg.setEma20(value);
      break;
    case 9:
      var value = new proto.marketdata.Stochastic;
      reader.readMessage(value,proto.marketdata.Stochastic.deserializeBinaryFromReader);
      msg.setStochastic(value);
      break;
    case 10:
      var value = new proto.marketdata.VolumeIndicators;
      reader.readMessage(value,proto.marketdata.VolumeIndicators.deserializeBinaryFromReader);
      msg.setVolumeIndicators(value);
      break;
    case 11:
      var value = /** @type {string} */ (reader.readString());
      msg.setOverallSignal(value);
      break;
    case 12:
      var value = new proto.marketdata.Signal;
      reader.readMessage(value,proto.marketdata.Signal.deserializeBinaryFromReader);
      msg.addSignals(value);
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
proto.marketdata.ComprehensiveAnalysis.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.marketdata.ComprehensiveAnalysis.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.marketdata.ComprehensiveAnalysis} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.ComprehensiveAnalysis.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getSymbol();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getInterval();
  if (f !== 0.0) {
    writer.writeEnum(
      2,
      f
    );
  }
  f = message.getTimestamp();
  if (f !== 0) {
    writer.writeInt64(
      3,
      f
    );
  }
  f = message.getRsi();
  if (f != null) {
    writer.writeMessage(
      4,
      f,
      proto.marketdata.RSI.serializeBinaryToWriter
    );
  }
  f = message.getMacd();
  if (f != null) {
    writer.writeMessage(
      5,
      f,
      proto.marketdata.MACD.serializeBinaryToWriter
    );
  }
  f = message.getBollingerBands();
  if (f != null) {
    writer.writeMessage(
      6,
      f,
      proto.marketdata.BollingerBands.serializeBinaryToWriter
    );
  }
  f = message.getSma20();
  if (f != null) {
    writer.writeMessage(
      7,
      f,
      proto.marketdata.MovingAverage.serializeBinaryToWriter
    );
  }
  f = message.getEma20();
  if (f != null) {
    writer.writeMessage(
      8,
      f,
      proto.marketdata.MovingAverage.serializeBinaryToWriter
    );
  }
  f = message.getStochastic();
  if (f != null) {
    writer.writeMessage(
      9,
      f,
      proto.marketdata.Stochastic.serializeBinaryToWriter
    );
  }
  f = message.getVolumeIndicators();
  if (f != null) {
    writer.writeMessage(
      10,
      f,
      proto.marketdata.VolumeIndicators.serializeBinaryToWriter
    );
  }
  f = message.getOverallSignal();
  if (f.length > 0) {
    writer.writeString(
      11,
      f
    );
  }
  f = message.getSignalsList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      12,
      f,
      proto.marketdata.Signal.serializeBinaryToWriter
    );
  }
};


/**
 * optional string symbol = 1;
 * @return {string}
 */
proto.marketdata.ComprehensiveAnalysis.prototype.getSymbol = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.marketdata.ComprehensiveAnalysis} returns this
 */
proto.marketdata.ComprehensiveAnalysis.prototype.setSymbol = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional TimeInterval interval = 2;
 * @return {!proto.marketdata.TimeInterval}
 */
proto.marketdata.ComprehensiveAnalysis.prototype.getInterval = function() {
  return /** @type {!proto.marketdata.TimeInterval} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/**
 * @param {!proto.marketdata.TimeInterval} value
 * @return {!proto.marketdata.ComprehensiveAnalysis} returns this
 */
proto.marketdata.ComprehensiveAnalysis.prototype.setInterval = function(value) {
  return jspb.Message.setProto3EnumField(this, 2, value);
};


/**
 * optional int64 timestamp = 3;
 * @return {number}
 */
proto.marketdata.ComprehensiveAnalysis.prototype.getTimestamp = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 3, 0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.ComprehensiveAnalysis} returns this
 */
proto.marketdata.ComprehensiveAnalysis.prototype.setTimestamp = function(value) {
  return jspb.Message.setProto3IntField(this, 3, value);
};


/**
 * optional RSI rsi = 4;
 * @return {?proto.marketdata.RSI}
 */
proto.marketdata.ComprehensiveAnalysis.prototype.getRsi = function() {
  return /** @type{?proto.marketdata.RSI} */ (
    jspb.Message.getWrapperField(this, proto.marketdata.RSI, 4));
};


/**
 * @param {?proto.marketdata.RSI|undefined} value
 * @return {!proto.marketdata.ComprehensiveAnalysis} returns this
*/
proto.marketdata.ComprehensiveAnalysis.prototype.setRsi = function(value) {
  return jspb.Message.setWrapperField(this, 4, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.marketdata.ComprehensiveAnalysis} returns this
 */
proto.marketdata.ComprehensiveAnalysis.prototype.clearRsi = function() {
  return this.setRsi(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.marketdata.ComprehensiveAnalysis.prototype.hasRsi = function() {
  return jspb.Message.getField(this, 4) != null;
};


/**
 * optional MACD macd = 5;
 * @return {?proto.marketdata.MACD}
 */
proto.marketdata.ComprehensiveAnalysis.prototype.getMacd = function() {
  return /** @type{?proto.marketdata.MACD} */ (
    jspb.Message.getWrapperField(this, proto.marketdata.MACD, 5));
};


/**
 * @param {?proto.marketdata.MACD|undefined} value
 * @return {!proto.marketdata.ComprehensiveAnalysis} returns this
*/
proto.marketdata.ComprehensiveAnalysis.prototype.setMacd = function(value) {
  return jspb.Message.setWrapperField(this, 5, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.marketdata.ComprehensiveAnalysis} returns this
 */
proto.marketdata.ComprehensiveAnalysis.prototype.clearMacd = function() {
  return this.setMacd(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.marketdata.ComprehensiveAnalysis.prototype.hasMacd = function() {
  return jspb.Message.getField(this, 5) != null;
};


/**
 * optional BollingerBands bollinger_bands = 6;
 * @return {?proto.marketdata.BollingerBands}
 */
proto.marketdata.ComprehensiveAnalysis.prototype.getBollingerBands = function() {
  return /** @type{?proto.marketdata.BollingerBands} */ (
    jspb.Message.getWrapperField(this, proto.marketdata.BollingerBands, 6));
};


/**
 * @param {?proto.marketdata.BollingerBands|undefined} value
 * @return {!proto.marketdata.ComprehensiveAnalysis} returns this
*/
proto.marketdata.ComprehensiveAnalysis.prototype.setBollingerBands = function(value) {
  return jspb.Message.setWrapperField(this, 6, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.marketdata.ComprehensiveAnalysis} returns this
 */
proto.marketdata.ComprehensiveAnalysis.prototype.clearBollingerBands = function() {
  return this.setBollingerBands(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.marketdata.ComprehensiveAnalysis.prototype.hasBollingerBands = function() {
  return jspb.Message.getField(this, 6) != null;
};


/**
 * optional MovingAverage sma20 = 7;
 * @return {?proto.marketdata.MovingAverage}
 */
proto.marketdata.ComprehensiveAnalysis.prototype.getSma20 = function() {
  return /** @type{?proto.marketdata.MovingAverage} */ (
    jspb.Message.getWrapperField(this, proto.marketdata.MovingAverage, 7));
};


/**
 * @param {?proto.marketdata.MovingAverage|undefined} value
 * @return {!proto.marketdata.ComprehensiveAnalysis} returns this
*/
proto.marketdata.ComprehensiveAnalysis.prototype.setSma20 = function(value) {
  return jspb.Message.setWrapperField(this, 7, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.marketdata.ComprehensiveAnalysis} returns this
 */
proto.marketdata.ComprehensiveAnalysis.prototype.clearSma20 = function() {
  return this.setSma20(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.marketdata.ComprehensiveAnalysis.prototype.hasSma20 = function() {
  return jspb.Message.getField(this, 7) != null;
};


/**
 * optional MovingAverage ema20 = 8;
 * @return {?proto.marketdata.MovingAverage}
 */
proto.marketdata.ComprehensiveAnalysis.prototype.getEma20 = function() {
  return /** @type{?proto.marketdata.MovingAverage} */ (
    jspb.Message.getWrapperField(this, proto.marketdata.MovingAverage, 8));
};


/**
 * @param {?proto.marketdata.MovingAverage|undefined} value
 * @return {!proto.marketdata.ComprehensiveAnalysis} returns this
*/
proto.marketdata.ComprehensiveAnalysis.prototype.setEma20 = function(value) {
  return jspb.Message.setWrapperField(this, 8, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.marketdata.ComprehensiveAnalysis} returns this
 */
proto.marketdata.ComprehensiveAnalysis.prototype.clearEma20 = function() {
  return this.setEma20(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.marketdata.ComprehensiveAnalysis.prototype.hasEma20 = function() {
  return jspb.Message.getField(this, 8) != null;
};


/**
 * optional Stochastic stochastic = 9;
 * @return {?proto.marketdata.Stochastic}
 */
proto.marketdata.ComprehensiveAnalysis.prototype.getStochastic = function() {
  return /** @type{?proto.marketdata.Stochastic} */ (
    jspb.Message.getWrapperField(this, proto.marketdata.Stochastic, 9));
};


/**
 * @param {?proto.marketdata.Stochastic|undefined} value
 * @return {!proto.marketdata.ComprehensiveAnalysis} returns this
*/
proto.marketdata.ComprehensiveAnalysis.prototype.setStochastic = function(value) {
  return jspb.Message.setWrapperField(this, 9, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.marketdata.ComprehensiveAnalysis} returns this
 */
proto.marketdata.ComprehensiveAnalysis.prototype.clearStochastic = function() {
  return this.setStochastic(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.marketdata.ComprehensiveAnalysis.prototype.hasStochastic = function() {
  return jspb.Message.getField(this, 9) != null;
};


/**
 * optional VolumeIndicators volume_indicators = 10;
 * @return {?proto.marketdata.VolumeIndicators}
 */
proto.marketdata.ComprehensiveAnalysis.prototype.getVolumeIndicators = function() {
  return /** @type{?proto.marketdata.VolumeIndicators} */ (
    jspb.Message.getWrapperField(this, proto.marketdata.VolumeIndicators, 10));
};


/**
 * @param {?proto.marketdata.VolumeIndicators|undefined} value
 * @return {!proto.marketdata.ComprehensiveAnalysis} returns this
*/
proto.marketdata.ComprehensiveAnalysis.prototype.setVolumeIndicators = function(value) {
  return jspb.Message.setWrapperField(this, 10, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.marketdata.ComprehensiveAnalysis} returns this
 */
proto.marketdata.ComprehensiveAnalysis.prototype.clearVolumeIndicators = function() {
  return this.setVolumeIndicators(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.marketdata.ComprehensiveAnalysis.prototype.hasVolumeIndicators = function() {
  return jspb.Message.getField(this, 10) != null;
};


/**
 * optional string overall_signal = 11;
 * @return {string}
 */
proto.marketdata.ComprehensiveAnalysis.prototype.getOverallSignal = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 11, ""));
};


/**
 * @param {string} value
 * @return {!proto.marketdata.ComprehensiveAnalysis} returns this
 */
proto.marketdata.ComprehensiveAnalysis.prototype.setOverallSignal = function(value) {
  return jspb.Message.setProto3StringField(this, 11, value);
};


/**
 * repeated Signal signals = 12;
 * @return {!Array<!proto.marketdata.Signal>}
 */
proto.marketdata.ComprehensiveAnalysis.prototype.getSignalsList = function() {
  return /** @type{!Array<!proto.marketdata.Signal>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.marketdata.Signal, 12));
};


/**
 * @param {!Array<!proto.marketdata.Signal>} value
 * @return {!proto.marketdata.ComprehensiveAnalysis} returns this
*/
proto.marketdata.ComprehensiveAnalysis.prototype.setSignalsList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 12, value);
};


/**
 * @param {!proto.marketdata.Signal=} opt_value
 * @param {number=} opt_index
 * @return {!proto.marketdata.Signal}
 */
proto.marketdata.ComprehensiveAnalysis.prototype.addSignals = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 12, opt_value, proto.marketdata.Signal, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.marketdata.ComprehensiveAnalysis} returns this
 */
proto.marketdata.ComprehensiveAnalysis.prototype.clearSignalsList = function() {
  return this.setSignalsList([]);
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
proto.marketdata.GetRealtimeDataRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.marketdata.GetRealtimeDataRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.marketdata.GetRealtimeDataRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.GetRealtimeDataRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    symbol: jspb.Message.getFieldWithDefault(msg, 1, "")
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
 * @return {!proto.marketdata.GetRealtimeDataRequest}
 */
proto.marketdata.GetRealtimeDataRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.marketdata.GetRealtimeDataRequest;
  return proto.marketdata.GetRealtimeDataRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.marketdata.GetRealtimeDataRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.marketdata.GetRealtimeDataRequest}
 */
proto.marketdata.GetRealtimeDataRequest.deserializeBinaryFromReader = function(msg, reader) {
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
proto.marketdata.GetRealtimeDataRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.marketdata.GetRealtimeDataRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.marketdata.GetRealtimeDataRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.GetRealtimeDataRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getSymbol();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
};


/**
 * optional string symbol = 1;
 * @return {string}
 */
proto.marketdata.GetRealtimeDataRequest.prototype.getSymbol = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.marketdata.GetRealtimeDataRequest} returns this
 */
proto.marketdata.GetRealtimeDataRequest.prototype.setSymbol = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.marketdata.GetBatchRealtimeDataRequest.repeatedFields_ = [1];



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
proto.marketdata.GetBatchRealtimeDataRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.marketdata.GetBatchRealtimeDataRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.marketdata.GetBatchRealtimeDataRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.GetBatchRealtimeDataRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    symbolsList: (f = jspb.Message.getRepeatedField(msg, 1)) == null ? undefined : f
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
 * @return {!proto.marketdata.GetBatchRealtimeDataRequest}
 */
proto.marketdata.GetBatchRealtimeDataRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.marketdata.GetBatchRealtimeDataRequest;
  return proto.marketdata.GetBatchRealtimeDataRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.marketdata.GetBatchRealtimeDataRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.marketdata.GetBatchRealtimeDataRequest}
 */
proto.marketdata.GetBatchRealtimeDataRequest.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.addSymbols(value);
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
proto.marketdata.GetBatchRealtimeDataRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.marketdata.GetBatchRealtimeDataRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.marketdata.GetBatchRealtimeDataRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.GetBatchRealtimeDataRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getSymbolsList();
  if (f.length > 0) {
    writer.writeRepeatedString(
      1,
      f
    );
  }
};


/**
 * repeated string symbols = 1;
 * @return {!Array<string>}
 */
proto.marketdata.GetBatchRealtimeDataRequest.prototype.getSymbolsList = function() {
  return /** @type {!Array<string>} */ (jspb.Message.getRepeatedField(this, 1));
};


/**
 * @param {!Array<string>} value
 * @return {!proto.marketdata.GetBatchRealtimeDataRequest} returns this
 */
proto.marketdata.GetBatchRealtimeDataRequest.prototype.setSymbolsList = function(value) {
  return jspb.Message.setField(this, 1, value || []);
};


/**
 * @param {string} value
 * @param {number=} opt_index
 * @return {!proto.marketdata.GetBatchRealtimeDataRequest} returns this
 */
proto.marketdata.GetBatchRealtimeDataRequest.prototype.addSymbols = function(value, opt_index) {
  return jspb.Message.addToRepeatedField(this, 1, value, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.marketdata.GetBatchRealtimeDataRequest} returns this
 */
proto.marketdata.GetBatchRealtimeDataRequest.prototype.clearSymbolsList = function() {
  return this.setSymbolsList([]);
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.marketdata.StreamMarketDataRequest.repeatedFields_ = [1];



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
proto.marketdata.StreamMarketDataRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.marketdata.StreamMarketDataRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.marketdata.StreamMarketDataRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.StreamMarketDataRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    symbolsList: (f = jspb.Message.getRepeatedField(msg, 1)) == null ? undefined : f
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
 * @return {!proto.marketdata.StreamMarketDataRequest}
 */
proto.marketdata.StreamMarketDataRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.marketdata.StreamMarketDataRequest;
  return proto.marketdata.StreamMarketDataRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.marketdata.StreamMarketDataRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.marketdata.StreamMarketDataRequest}
 */
proto.marketdata.StreamMarketDataRequest.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.addSymbols(value);
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
proto.marketdata.StreamMarketDataRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.marketdata.StreamMarketDataRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.marketdata.StreamMarketDataRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.StreamMarketDataRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getSymbolsList();
  if (f.length > 0) {
    writer.writeRepeatedString(
      1,
      f
    );
  }
};


/**
 * repeated string symbols = 1;
 * @return {!Array<string>}
 */
proto.marketdata.StreamMarketDataRequest.prototype.getSymbolsList = function() {
  return /** @type {!Array<string>} */ (jspb.Message.getRepeatedField(this, 1));
};


/**
 * @param {!Array<string>} value
 * @return {!proto.marketdata.StreamMarketDataRequest} returns this
 */
proto.marketdata.StreamMarketDataRequest.prototype.setSymbolsList = function(value) {
  return jspb.Message.setField(this, 1, value || []);
};


/**
 * @param {string} value
 * @param {number=} opt_index
 * @return {!proto.marketdata.StreamMarketDataRequest} returns this
 */
proto.marketdata.StreamMarketDataRequest.prototype.addSymbols = function(value, opt_index) {
  return jspb.Message.addToRepeatedField(this, 1, value, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.marketdata.StreamMarketDataRequest} returns this
 */
proto.marketdata.StreamMarketDataRequest.prototype.clearSymbolsList = function() {
  return this.setSymbolsList([]);
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
proto.marketdata.GetHistoricalDataRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.marketdata.GetHistoricalDataRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.marketdata.GetHistoricalDataRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.GetHistoricalDataRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    symbol: jspb.Message.getFieldWithDefault(msg, 1, ""),
    interval: jspb.Message.getFieldWithDefault(msg, 2, 0),
    startDate: jspb.Message.getFieldWithDefault(msg, 3, 0),
    endDate: jspb.Message.getFieldWithDefault(msg, 4, 0),
    limit: jspb.Message.getFieldWithDefault(msg, 5, 0)
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
 * @return {!proto.marketdata.GetHistoricalDataRequest}
 */
proto.marketdata.GetHistoricalDataRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.marketdata.GetHistoricalDataRequest;
  return proto.marketdata.GetHistoricalDataRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.marketdata.GetHistoricalDataRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.marketdata.GetHistoricalDataRequest}
 */
proto.marketdata.GetHistoricalDataRequest.deserializeBinaryFromReader = function(msg, reader) {
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
      var value = /** @type {!proto.marketdata.TimeInterval} */ (reader.readEnum());
      msg.setInterval(value);
      break;
    case 3:
      var value = /** @type {number} */ (reader.readInt64());
      msg.setStartDate(value);
      break;
    case 4:
      var value = /** @type {number} */ (reader.readInt64());
      msg.setEndDate(value);
      break;
    case 5:
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
proto.marketdata.GetHistoricalDataRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.marketdata.GetHistoricalDataRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.marketdata.GetHistoricalDataRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.GetHistoricalDataRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getSymbol();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getInterval();
  if (f !== 0.0) {
    writer.writeEnum(
      2,
      f
    );
  }
  f = /** @type {number} */ (jspb.Message.getField(message, 3));
  if (f != null) {
    writer.writeInt64(
      3,
      f
    );
  }
  f = /** @type {number} */ (jspb.Message.getField(message, 4));
  if (f != null) {
    writer.writeInt64(
      4,
      f
    );
  }
  f = /** @type {number} */ (jspb.Message.getField(message, 5));
  if (f != null) {
    writer.writeInt32(
      5,
      f
    );
  }
};


/**
 * optional string symbol = 1;
 * @return {string}
 */
proto.marketdata.GetHistoricalDataRequest.prototype.getSymbol = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.marketdata.GetHistoricalDataRequest} returns this
 */
proto.marketdata.GetHistoricalDataRequest.prototype.setSymbol = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional TimeInterval interval = 2;
 * @return {!proto.marketdata.TimeInterval}
 */
proto.marketdata.GetHistoricalDataRequest.prototype.getInterval = function() {
  return /** @type {!proto.marketdata.TimeInterval} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/**
 * @param {!proto.marketdata.TimeInterval} value
 * @return {!proto.marketdata.GetHistoricalDataRequest} returns this
 */
proto.marketdata.GetHistoricalDataRequest.prototype.setInterval = function(value) {
  return jspb.Message.setProto3EnumField(this, 2, value);
};


/**
 * optional int64 start_date = 3;
 * @return {number}
 */
proto.marketdata.GetHistoricalDataRequest.prototype.getStartDate = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 3, 0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.GetHistoricalDataRequest} returns this
 */
proto.marketdata.GetHistoricalDataRequest.prototype.setStartDate = function(value) {
  return jspb.Message.setField(this, 3, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.marketdata.GetHistoricalDataRequest} returns this
 */
proto.marketdata.GetHistoricalDataRequest.prototype.clearStartDate = function() {
  return jspb.Message.setField(this, 3, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.marketdata.GetHistoricalDataRequest.prototype.hasStartDate = function() {
  return jspb.Message.getField(this, 3) != null;
};


/**
 * optional int64 end_date = 4;
 * @return {number}
 */
proto.marketdata.GetHistoricalDataRequest.prototype.getEndDate = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 4, 0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.GetHistoricalDataRequest} returns this
 */
proto.marketdata.GetHistoricalDataRequest.prototype.setEndDate = function(value) {
  return jspb.Message.setField(this, 4, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.marketdata.GetHistoricalDataRequest} returns this
 */
proto.marketdata.GetHistoricalDataRequest.prototype.clearEndDate = function() {
  return jspb.Message.setField(this, 4, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.marketdata.GetHistoricalDataRequest.prototype.hasEndDate = function() {
  return jspb.Message.getField(this, 4) != null;
};


/**
 * optional int32 limit = 5;
 * @return {number}
 */
proto.marketdata.GetHistoricalDataRequest.prototype.getLimit = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 5, 0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.GetHistoricalDataRequest} returns this
 */
proto.marketdata.GetHistoricalDataRequest.prototype.setLimit = function(value) {
  return jspb.Message.setField(this, 5, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.marketdata.GetHistoricalDataRequest} returns this
 */
proto.marketdata.GetHistoricalDataRequest.prototype.clearLimit = function() {
  return jspb.Message.setField(this, 5, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.marketdata.GetHistoricalDataRequest.prototype.hasLimit = function() {
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
proto.marketdata.GetOHLCDataRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.marketdata.GetOHLCDataRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.marketdata.GetOHLCDataRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.GetOHLCDataRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    symbol: jspb.Message.getFieldWithDefault(msg, 1, ""),
    interval: jspb.Message.getFieldWithDefault(msg, 2, 0),
    startDate: jspb.Message.getFieldWithDefault(msg, 3, 0),
    endDate: jspb.Message.getFieldWithDefault(msg, 4, 0),
    limit: jspb.Message.getFieldWithDefault(msg, 5, 0)
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
 * @return {!proto.marketdata.GetOHLCDataRequest}
 */
proto.marketdata.GetOHLCDataRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.marketdata.GetOHLCDataRequest;
  return proto.marketdata.GetOHLCDataRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.marketdata.GetOHLCDataRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.marketdata.GetOHLCDataRequest}
 */
proto.marketdata.GetOHLCDataRequest.deserializeBinaryFromReader = function(msg, reader) {
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
      var value = /** @type {!proto.marketdata.TimeInterval} */ (reader.readEnum());
      msg.setInterval(value);
      break;
    case 3:
      var value = /** @type {number} */ (reader.readInt64());
      msg.setStartDate(value);
      break;
    case 4:
      var value = /** @type {number} */ (reader.readInt64());
      msg.setEndDate(value);
      break;
    case 5:
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
proto.marketdata.GetOHLCDataRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.marketdata.GetOHLCDataRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.marketdata.GetOHLCDataRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.GetOHLCDataRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getSymbol();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getInterval();
  if (f !== 0.0) {
    writer.writeEnum(
      2,
      f
    );
  }
  f = /** @type {number} */ (jspb.Message.getField(message, 3));
  if (f != null) {
    writer.writeInt64(
      3,
      f
    );
  }
  f = /** @type {number} */ (jspb.Message.getField(message, 4));
  if (f != null) {
    writer.writeInt64(
      4,
      f
    );
  }
  f = /** @type {number} */ (jspb.Message.getField(message, 5));
  if (f != null) {
    writer.writeInt32(
      5,
      f
    );
  }
};


/**
 * optional string symbol = 1;
 * @return {string}
 */
proto.marketdata.GetOHLCDataRequest.prototype.getSymbol = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.marketdata.GetOHLCDataRequest} returns this
 */
proto.marketdata.GetOHLCDataRequest.prototype.setSymbol = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional TimeInterval interval = 2;
 * @return {!proto.marketdata.TimeInterval}
 */
proto.marketdata.GetOHLCDataRequest.prototype.getInterval = function() {
  return /** @type {!proto.marketdata.TimeInterval} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/**
 * @param {!proto.marketdata.TimeInterval} value
 * @return {!proto.marketdata.GetOHLCDataRequest} returns this
 */
proto.marketdata.GetOHLCDataRequest.prototype.setInterval = function(value) {
  return jspb.Message.setProto3EnumField(this, 2, value);
};


/**
 * optional int64 start_date = 3;
 * @return {number}
 */
proto.marketdata.GetOHLCDataRequest.prototype.getStartDate = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 3, 0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.GetOHLCDataRequest} returns this
 */
proto.marketdata.GetOHLCDataRequest.prototype.setStartDate = function(value) {
  return jspb.Message.setField(this, 3, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.marketdata.GetOHLCDataRequest} returns this
 */
proto.marketdata.GetOHLCDataRequest.prototype.clearStartDate = function() {
  return jspb.Message.setField(this, 3, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.marketdata.GetOHLCDataRequest.prototype.hasStartDate = function() {
  return jspb.Message.getField(this, 3) != null;
};


/**
 * optional int64 end_date = 4;
 * @return {number}
 */
proto.marketdata.GetOHLCDataRequest.prototype.getEndDate = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 4, 0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.GetOHLCDataRequest} returns this
 */
proto.marketdata.GetOHLCDataRequest.prototype.setEndDate = function(value) {
  return jspb.Message.setField(this, 4, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.marketdata.GetOHLCDataRequest} returns this
 */
proto.marketdata.GetOHLCDataRequest.prototype.clearEndDate = function() {
  return jspb.Message.setField(this, 4, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.marketdata.GetOHLCDataRequest.prototype.hasEndDate = function() {
  return jspb.Message.getField(this, 4) != null;
};


/**
 * optional int32 limit = 5;
 * @return {number}
 */
proto.marketdata.GetOHLCDataRequest.prototype.getLimit = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 5, 0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.GetOHLCDataRequest} returns this
 */
proto.marketdata.GetOHLCDataRequest.prototype.setLimit = function(value) {
  return jspb.Message.setField(this, 5, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.marketdata.GetOHLCDataRequest} returns this
 */
proto.marketdata.GetOHLCDataRequest.prototype.clearLimit = function() {
  return jspb.Message.setField(this, 5, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.marketdata.GetOHLCDataRequest.prototype.hasLimit = function() {
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
proto.marketdata.GetVolumeProfileRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.marketdata.GetVolumeProfileRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.marketdata.GetVolumeProfileRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.GetVolumeProfileRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    symbol: jspb.Message.getFieldWithDefault(msg, 1, ""),
    interval: jspb.Message.getFieldWithDefault(msg, 2, 0),
    days: jspb.Message.getFieldWithDefault(msg, 3, 0)
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
 * @return {!proto.marketdata.GetVolumeProfileRequest}
 */
proto.marketdata.GetVolumeProfileRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.marketdata.GetVolumeProfileRequest;
  return proto.marketdata.GetVolumeProfileRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.marketdata.GetVolumeProfileRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.marketdata.GetVolumeProfileRequest}
 */
proto.marketdata.GetVolumeProfileRequest.deserializeBinaryFromReader = function(msg, reader) {
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
      var value = /** @type {!proto.marketdata.TimeInterval} */ (reader.readEnum());
      msg.setInterval(value);
      break;
    case 3:
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
proto.marketdata.GetVolumeProfileRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.marketdata.GetVolumeProfileRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.marketdata.GetVolumeProfileRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.GetVolumeProfileRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getSymbol();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getInterval();
  if (f !== 0.0) {
    writer.writeEnum(
      2,
      f
    );
  }
  f = /** @type {number} */ (jspb.Message.getField(message, 3));
  if (f != null) {
    writer.writeInt32(
      3,
      f
    );
  }
};


/**
 * optional string symbol = 1;
 * @return {string}
 */
proto.marketdata.GetVolumeProfileRequest.prototype.getSymbol = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.marketdata.GetVolumeProfileRequest} returns this
 */
proto.marketdata.GetVolumeProfileRequest.prototype.setSymbol = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional TimeInterval interval = 2;
 * @return {!proto.marketdata.TimeInterval}
 */
proto.marketdata.GetVolumeProfileRequest.prototype.getInterval = function() {
  return /** @type {!proto.marketdata.TimeInterval} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/**
 * @param {!proto.marketdata.TimeInterval} value
 * @return {!proto.marketdata.GetVolumeProfileRequest} returns this
 */
proto.marketdata.GetVolumeProfileRequest.prototype.setInterval = function(value) {
  return jspb.Message.setProto3EnumField(this, 2, value);
};


/**
 * optional int32 days = 3;
 * @return {number}
 */
proto.marketdata.GetVolumeProfileRequest.prototype.getDays = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 3, 0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.GetVolumeProfileRequest} returns this
 */
proto.marketdata.GetVolumeProfileRequest.prototype.setDays = function(value) {
  return jspb.Message.setField(this, 3, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.marketdata.GetVolumeProfileRequest} returns this
 */
proto.marketdata.GetVolumeProfileRequest.prototype.clearDays = function() {
  return jspb.Message.setField(this, 3, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.marketdata.GetVolumeProfileRequest.prototype.hasDays = function() {
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
proto.marketdata.GetRSIRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.marketdata.GetRSIRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.marketdata.GetRSIRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.GetRSIRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    symbol: jspb.Message.getFieldWithDefault(msg, 1, ""),
    interval: jspb.Message.getFieldWithDefault(msg, 2, 0),
    period: jspb.Message.getFieldWithDefault(msg, 3, 0),
    days: jspb.Message.getFieldWithDefault(msg, 4, 0)
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
 * @return {!proto.marketdata.GetRSIRequest}
 */
proto.marketdata.GetRSIRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.marketdata.GetRSIRequest;
  return proto.marketdata.GetRSIRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.marketdata.GetRSIRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.marketdata.GetRSIRequest}
 */
proto.marketdata.GetRSIRequest.deserializeBinaryFromReader = function(msg, reader) {
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
      var value = /** @type {!proto.marketdata.TimeInterval} */ (reader.readEnum());
      msg.setInterval(value);
      break;
    case 3:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setPeriod(value);
      break;
    case 4:
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
proto.marketdata.GetRSIRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.marketdata.GetRSIRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.marketdata.GetRSIRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.GetRSIRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getSymbol();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getInterval();
  if (f !== 0.0) {
    writer.writeEnum(
      2,
      f
    );
  }
  f = /** @type {number} */ (jspb.Message.getField(message, 3));
  if (f != null) {
    writer.writeInt32(
      3,
      f
    );
  }
  f = /** @type {number} */ (jspb.Message.getField(message, 4));
  if (f != null) {
    writer.writeInt32(
      4,
      f
    );
  }
};


/**
 * optional string symbol = 1;
 * @return {string}
 */
proto.marketdata.GetRSIRequest.prototype.getSymbol = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.marketdata.GetRSIRequest} returns this
 */
proto.marketdata.GetRSIRequest.prototype.setSymbol = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional TimeInterval interval = 2;
 * @return {!proto.marketdata.TimeInterval}
 */
proto.marketdata.GetRSIRequest.prototype.getInterval = function() {
  return /** @type {!proto.marketdata.TimeInterval} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/**
 * @param {!proto.marketdata.TimeInterval} value
 * @return {!proto.marketdata.GetRSIRequest} returns this
 */
proto.marketdata.GetRSIRequest.prototype.setInterval = function(value) {
  return jspb.Message.setProto3EnumField(this, 2, value);
};


/**
 * optional int32 period = 3;
 * @return {number}
 */
proto.marketdata.GetRSIRequest.prototype.getPeriod = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 3, 0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.GetRSIRequest} returns this
 */
proto.marketdata.GetRSIRequest.prototype.setPeriod = function(value) {
  return jspb.Message.setField(this, 3, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.marketdata.GetRSIRequest} returns this
 */
proto.marketdata.GetRSIRequest.prototype.clearPeriod = function() {
  return jspb.Message.setField(this, 3, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.marketdata.GetRSIRequest.prototype.hasPeriod = function() {
  return jspb.Message.getField(this, 3) != null;
};


/**
 * optional int32 days = 4;
 * @return {number}
 */
proto.marketdata.GetRSIRequest.prototype.getDays = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 4, 0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.GetRSIRequest} returns this
 */
proto.marketdata.GetRSIRequest.prototype.setDays = function(value) {
  return jspb.Message.setField(this, 4, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.marketdata.GetRSIRequest} returns this
 */
proto.marketdata.GetRSIRequest.prototype.clearDays = function() {
  return jspb.Message.setField(this, 4, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.marketdata.GetRSIRequest.prototype.hasDays = function() {
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
proto.marketdata.GetMACDRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.marketdata.GetMACDRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.marketdata.GetMACDRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.GetMACDRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    symbol: jspb.Message.getFieldWithDefault(msg, 1, ""),
    interval: jspb.Message.getFieldWithDefault(msg, 2, 0),
    days: jspb.Message.getFieldWithDefault(msg, 3, 0)
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
 * @return {!proto.marketdata.GetMACDRequest}
 */
proto.marketdata.GetMACDRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.marketdata.GetMACDRequest;
  return proto.marketdata.GetMACDRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.marketdata.GetMACDRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.marketdata.GetMACDRequest}
 */
proto.marketdata.GetMACDRequest.deserializeBinaryFromReader = function(msg, reader) {
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
      var value = /** @type {!proto.marketdata.TimeInterval} */ (reader.readEnum());
      msg.setInterval(value);
      break;
    case 3:
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
proto.marketdata.GetMACDRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.marketdata.GetMACDRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.marketdata.GetMACDRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.GetMACDRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getSymbol();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getInterval();
  if (f !== 0.0) {
    writer.writeEnum(
      2,
      f
    );
  }
  f = /** @type {number} */ (jspb.Message.getField(message, 3));
  if (f != null) {
    writer.writeInt32(
      3,
      f
    );
  }
};


/**
 * optional string symbol = 1;
 * @return {string}
 */
proto.marketdata.GetMACDRequest.prototype.getSymbol = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.marketdata.GetMACDRequest} returns this
 */
proto.marketdata.GetMACDRequest.prototype.setSymbol = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional TimeInterval interval = 2;
 * @return {!proto.marketdata.TimeInterval}
 */
proto.marketdata.GetMACDRequest.prototype.getInterval = function() {
  return /** @type {!proto.marketdata.TimeInterval} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/**
 * @param {!proto.marketdata.TimeInterval} value
 * @return {!proto.marketdata.GetMACDRequest} returns this
 */
proto.marketdata.GetMACDRequest.prototype.setInterval = function(value) {
  return jspb.Message.setProto3EnumField(this, 2, value);
};


/**
 * optional int32 days = 3;
 * @return {number}
 */
proto.marketdata.GetMACDRequest.prototype.getDays = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 3, 0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.GetMACDRequest} returns this
 */
proto.marketdata.GetMACDRequest.prototype.setDays = function(value) {
  return jspb.Message.setField(this, 3, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.marketdata.GetMACDRequest} returns this
 */
proto.marketdata.GetMACDRequest.prototype.clearDays = function() {
  return jspb.Message.setField(this, 3, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.marketdata.GetMACDRequest.prototype.hasDays = function() {
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
proto.marketdata.GetBollingerBandsRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.marketdata.GetBollingerBandsRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.marketdata.GetBollingerBandsRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.GetBollingerBandsRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    symbol: jspb.Message.getFieldWithDefault(msg, 1, ""),
    interval: jspb.Message.getFieldWithDefault(msg, 2, 0),
    period: jspb.Message.getFieldWithDefault(msg, 3, 0),
    days: jspb.Message.getFieldWithDefault(msg, 4, 0)
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
 * @return {!proto.marketdata.GetBollingerBandsRequest}
 */
proto.marketdata.GetBollingerBandsRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.marketdata.GetBollingerBandsRequest;
  return proto.marketdata.GetBollingerBandsRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.marketdata.GetBollingerBandsRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.marketdata.GetBollingerBandsRequest}
 */
proto.marketdata.GetBollingerBandsRequest.deserializeBinaryFromReader = function(msg, reader) {
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
      var value = /** @type {!proto.marketdata.TimeInterval} */ (reader.readEnum());
      msg.setInterval(value);
      break;
    case 3:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setPeriod(value);
      break;
    case 4:
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
proto.marketdata.GetBollingerBandsRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.marketdata.GetBollingerBandsRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.marketdata.GetBollingerBandsRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.GetBollingerBandsRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getSymbol();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getInterval();
  if (f !== 0.0) {
    writer.writeEnum(
      2,
      f
    );
  }
  f = /** @type {number} */ (jspb.Message.getField(message, 3));
  if (f != null) {
    writer.writeInt32(
      3,
      f
    );
  }
  f = /** @type {number} */ (jspb.Message.getField(message, 4));
  if (f != null) {
    writer.writeInt32(
      4,
      f
    );
  }
};


/**
 * optional string symbol = 1;
 * @return {string}
 */
proto.marketdata.GetBollingerBandsRequest.prototype.getSymbol = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.marketdata.GetBollingerBandsRequest} returns this
 */
proto.marketdata.GetBollingerBandsRequest.prototype.setSymbol = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional TimeInterval interval = 2;
 * @return {!proto.marketdata.TimeInterval}
 */
proto.marketdata.GetBollingerBandsRequest.prototype.getInterval = function() {
  return /** @type {!proto.marketdata.TimeInterval} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/**
 * @param {!proto.marketdata.TimeInterval} value
 * @return {!proto.marketdata.GetBollingerBandsRequest} returns this
 */
proto.marketdata.GetBollingerBandsRequest.prototype.setInterval = function(value) {
  return jspb.Message.setProto3EnumField(this, 2, value);
};


/**
 * optional int32 period = 3;
 * @return {number}
 */
proto.marketdata.GetBollingerBandsRequest.prototype.getPeriod = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 3, 0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.GetBollingerBandsRequest} returns this
 */
proto.marketdata.GetBollingerBandsRequest.prototype.setPeriod = function(value) {
  return jspb.Message.setField(this, 3, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.marketdata.GetBollingerBandsRequest} returns this
 */
proto.marketdata.GetBollingerBandsRequest.prototype.clearPeriod = function() {
  return jspb.Message.setField(this, 3, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.marketdata.GetBollingerBandsRequest.prototype.hasPeriod = function() {
  return jspb.Message.getField(this, 3) != null;
};


/**
 * optional int32 days = 4;
 * @return {number}
 */
proto.marketdata.GetBollingerBandsRequest.prototype.getDays = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 4, 0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.GetBollingerBandsRequest} returns this
 */
proto.marketdata.GetBollingerBandsRequest.prototype.setDays = function(value) {
  return jspb.Message.setField(this, 4, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.marketdata.GetBollingerBandsRequest} returns this
 */
proto.marketdata.GetBollingerBandsRequest.prototype.clearDays = function() {
  return jspb.Message.setField(this, 4, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.marketdata.GetBollingerBandsRequest.prototype.hasDays = function() {
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
proto.marketdata.GetMovingAverageRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.marketdata.GetMovingAverageRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.marketdata.GetMovingAverageRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.GetMovingAverageRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    symbol: jspb.Message.getFieldWithDefault(msg, 1, ""),
    interval: jspb.Message.getFieldWithDefault(msg, 2, 0),
    type: jspb.Message.getFieldWithDefault(msg, 3, ""),
    period: jspb.Message.getFieldWithDefault(msg, 4, 0),
    days: jspb.Message.getFieldWithDefault(msg, 5, 0)
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
 * @return {!proto.marketdata.GetMovingAverageRequest}
 */
proto.marketdata.GetMovingAverageRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.marketdata.GetMovingAverageRequest;
  return proto.marketdata.GetMovingAverageRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.marketdata.GetMovingAverageRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.marketdata.GetMovingAverageRequest}
 */
proto.marketdata.GetMovingAverageRequest.deserializeBinaryFromReader = function(msg, reader) {
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
      var value = /** @type {!proto.marketdata.TimeInterval} */ (reader.readEnum());
      msg.setInterval(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readString());
      msg.setType(value);
      break;
    case 4:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setPeriod(value);
      break;
    case 5:
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
proto.marketdata.GetMovingAverageRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.marketdata.GetMovingAverageRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.marketdata.GetMovingAverageRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.GetMovingAverageRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getSymbol();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getInterval();
  if (f !== 0.0) {
    writer.writeEnum(
      2,
      f
    );
  }
  f = message.getType();
  if (f.length > 0) {
    writer.writeString(
      3,
      f
    );
  }
  f = /** @type {number} */ (jspb.Message.getField(message, 4));
  if (f != null) {
    writer.writeInt32(
      4,
      f
    );
  }
  f = /** @type {number} */ (jspb.Message.getField(message, 5));
  if (f != null) {
    writer.writeInt32(
      5,
      f
    );
  }
};


/**
 * optional string symbol = 1;
 * @return {string}
 */
proto.marketdata.GetMovingAverageRequest.prototype.getSymbol = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.marketdata.GetMovingAverageRequest} returns this
 */
proto.marketdata.GetMovingAverageRequest.prototype.setSymbol = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional TimeInterval interval = 2;
 * @return {!proto.marketdata.TimeInterval}
 */
proto.marketdata.GetMovingAverageRequest.prototype.getInterval = function() {
  return /** @type {!proto.marketdata.TimeInterval} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/**
 * @param {!proto.marketdata.TimeInterval} value
 * @return {!proto.marketdata.GetMovingAverageRequest} returns this
 */
proto.marketdata.GetMovingAverageRequest.prototype.setInterval = function(value) {
  return jspb.Message.setProto3EnumField(this, 2, value);
};


/**
 * optional string type = 3;
 * @return {string}
 */
proto.marketdata.GetMovingAverageRequest.prototype.getType = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/**
 * @param {string} value
 * @return {!proto.marketdata.GetMovingAverageRequest} returns this
 */
proto.marketdata.GetMovingAverageRequest.prototype.setType = function(value) {
  return jspb.Message.setProto3StringField(this, 3, value);
};


/**
 * optional int32 period = 4;
 * @return {number}
 */
proto.marketdata.GetMovingAverageRequest.prototype.getPeriod = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 4, 0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.GetMovingAverageRequest} returns this
 */
proto.marketdata.GetMovingAverageRequest.prototype.setPeriod = function(value) {
  return jspb.Message.setField(this, 4, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.marketdata.GetMovingAverageRequest} returns this
 */
proto.marketdata.GetMovingAverageRequest.prototype.clearPeriod = function() {
  return jspb.Message.setField(this, 4, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.marketdata.GetMovingAverageRequest.prototype.hasPeriod = function() {
  return jspb.Message.getField(this, 4) != null;
};


/**
 * optional int32 days = 5;
 * @return {number}
 */
proto.marketdata.GetMovingAverageRequest.prototype.getDays = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 5, 0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.GetMovingAverageRequest} returns this
 */
proto.marketdata.GetMovingAverageRequest.prototype.setDays = function(value) {
  return jspb.Message.setField(this, 5, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.marketdata.GetMovingAverageRequest} returns this
 */
proto.marketdata.GetMovingAverageRequest.prototype.clearDays = function() {
  return jspb.Message.setField(this, 5, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.marketdata.GetMovingAverageRequest.prototype.hasDays = function() {
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
proto.marketdata.GetStochasticRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.marketdata.GetStochasticRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.marketdata.GetStochasticRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.GetStochasticRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    symbol: jspb.Message.getFieldWithDefault(msg, 1, ""),
    interval: jspb.Message.getFieldWithDefault(msg, 2, 0),
    period: jspb.Message.getFieldWithDefault(msg, 3, 0),
    days: jspb.Message.getFieldWithDefault(msg, 4, 0)
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
 * @return {!proto.marketdata.GetStochasticRequest}
 */
proto.marketdata.GetStochasticRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.marketdata.GetStochasticRequest;
  return proto.marketdata.GetStochasticRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.marketdata.GetStochasticRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.marketdata.GetStochasticRequest}
 */
proto.marketdata.GetStochasticRequest.deserializeBinaryFromReader = function(msg, reader) {
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
      var value = /** @type {!proto.marketdata.TimeInterval} */ (reader.readEnum());
      msg.setInterval(value);
      break;
    case 3:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setPeriod(value);
      break;
    case 4:
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
proto.marketdata.GetStochasticRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.marketdata.GetStochasticRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.marketdata.GetStochasticRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.GetStochasticRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getSymbol();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getInterval();
  if (f !== 0.0) {
    writer.writeEnum(
      2,
      f
    );
  }
  f = /** @type {number} */ (jspb.Message.getField(message, 3));
  if (f != null) {
    writer.writeInt32(
      3,
      f
    );
  }
  f = /** @type {number} */ (jspb.Message.getField(message, 4));
  if (f != null) {
    writer.writeInt32(
      4,
      f
    );
  }
};


/**
 * optional string symbol = 1;
 * @return {string}
 */
proto.marketdata.GetStochasticRequest.prototype.getSymbol = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.marketdata.GetStochasticRequest} returns this
 */
proto.marketdata.GetStochasticRequest.prototype.setSymbol = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional TimeInterval interval = 2;
 * @return {!proto.marketdata.TimeInterval}
 */
proto.marketdata.GetStochasticRequest.prototype.getInterval = function() {
  return /** @type {!proto.marketdata.TimeInterval} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/**
 * @param {!proto.marketdata.TimeInterval} value
 * @return {!proto.marketdata.GetStochasticRequest} returns this
 */
proto.marketdata.GetStochasticRequest.prototype.setInterval = function(value) {
  return jspb.Message.setProto3EnumField(this, 2, value);
};


/**
 * optional int32 period = 3;
 * @return {number}
 */
proto.marketdata.GetStochasticRequest.prototype.getPeriod = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 3, 0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.GetStochasticRequest} returns this
 */
proto.marketdata.GetStochasticRequest.prototype.setPeriod = function(value) {
  return jspb.Message.setField(this, 3, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.marketdata.GetStochasticRequest} returns this
 */
proto.marketdata.GetStochasticRequest.prototype.clearPeriod = function() {
  return jspb.Message.setField(this, 3, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.marketdata.GetStochasticRequest.prototype.hasPeriod = function() {
  return jspb.Message.getField(this, 3) != null;
};


/**
 * optional int32 days = 4;
 * @return {number}
 */
proto.marketdata.GetStochasticRequest.prototype.getDays = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 4, 0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.GetStochasticRequest} returns this
 */
proto.marketdata.GetStochasticRequest.prototype.setDays = function(value) {
  return jspb.Message.setField(this, 4, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.marketdata.GetStochasticRequest} returns this
 */
proto.marketdata.GetStochasticRequest.prototype.clearDays = function() {
  return jspb.Message.setField(this, 4, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.marketdata.GetStochasticRequest.prototype.hasDays = function() {
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
proto.marketdata.GetVolumeIndicatorsRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.marketdata.GetVolumeIndicatorsRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.marketdata.GetVolumeIndicatorsRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.GetVolumeIndicatorsRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    symbol: jspb.Message.getFieldWithDefault(msg, 1, ""),
    interval: jspb.Message.getFieldWithDefault(msg, 2, 0),
    days: jspb.Message.getFieldWithDefault(msg, 3, 0)
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
 * @return {!proto.marketdata.GetVolumeIndicatorsRequest}
 */
proto.marketdata.GetVolumeIndicatorsRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.marketdata.GetVolumeIndicatorsRequest;
  return proto.marketdata.GetVolumeIndicatorsRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.marketdata.GetVolumeIndicatorsRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.marketdata.GetVolumeIndicatorsRequest}
 */
proto.marketdata.GetVolumeIndicatorsRequest.deserializeBinaryFromReader = function(msg, reader) {
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
      var value = /** @type {!proto.marketdata.TimeInterval} */ (reader.readEnum());
      msg.setInterval(value);
      break;
    case 3:
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
proto.marketdata.GetVolumeIndicatorsRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.marketdata.GetVolumeIndicatorsRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.marketdata.GetVolumeIndicatorsRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.GetVolumeIndicatorsRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getSymbol();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getInterval();
  if (f !== 0.0) {
    writer.writeEnum(
      2,
      f
    );
  }
  f = /** @type {number} */ (jspb.Message.getField(message, 3));
  if (f != null) {
    writer.writeInt32(
      3,
      f
    );
  }
};


/**
 * optional string symbol = 1;
 * @return {string}
 */
proto.marketdata.GetVolumeIndicatorsRequest.prototype.getSymbol = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.marketdata.GetVolumeIndicatorsRequest} returns this
 */
proto.marketdata.GetVolumeIndicatorsRequest.prototype.setSymbol = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional TimeInterval interval = 2;
 * @return {!proto.marketdata.TimeInterval}
 */
proto.marketdata.GetVolumeIndicatorsRequest.prototype.getInterval = function() {
  return /** @type {!proto.marketdata.TimeInterval} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/**
 * @param {!proto.marketdata.TimeInterval} value
 * @return {!proto.marketdata.GetVolumeIndicatorsRequest} returns this
 */
proto.marketdata.GetVolumeIndicatorsRequest.prototype.setInterval = function(value) {
  return jspb.Message.setProto3EnumField(this, 2, value);
};


/**
 * optional int32 days = 3;
 * @return {number}
 */
proto.marketdata.GetVolumeIndicatorsRequest.prototype.getDays = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 3, 0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.GetVolumeIndicatorsRequest} returns this
 */
proto.marketdata.GetVolumeIndicatorsRequest.prototype.setDays = function(value) {
  return jspb.Message.setField(this, 3, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.marketdata.GetVolumeIndicatorsRequest} returns this
 */
proto.marketdata.GetVolumeIndicatorsRequest.prototype.clearDays = function() {
  return jspb.Message.setField(this, 3, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.marketdata.GetVolumeIndicatorsRequest.prototype.hasDays = function() {
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
proto.marketdata.GetComprehensiveAnalysisRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.marketdata.GetComprehensiveAnalysisRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.marketdata.GetComprehensiveAnalysisRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.GetComprehensiveAnalysisRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    symbol: jspb.Message.getFieldWithDefault(msg, 1, ""),
    interval: jspb.Message.getFieldWithDefault(msg, 2, 0),
    days: jspb.Message.getFieldWithDefault(msg, 3, 0)
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
 * @return {!proto.marketdata.GetComprehensiveAnalysisRequest}
 */
proto.marketdata.GetComprehensiveAnalysisRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.marketdata.GetComprehensiveAnalysisRequest;
  return proto.marketdata.GetComprehensiveAnalysisRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.marketdata.GetComprehensiveAnalysisRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.marketdata.GetComprehensiveAnalysisRequest}
 */
proto.marketdata.GetComprehensiveAnalysisRequest.deserializeBinaryFromReader = function(msg, reader) {
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
      var value = /** @type {!proto.marketdata.TimeInterval} */ (reader.readEnum());
      msg.setInterval(value);
      break;
    case 3:
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
proto.marketdata.GetComprehensiveAnalysisRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.marketdata.GetComprehensiveAnalysisRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.marketdata.GetComprehensiveAnalysisRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.GetComprehensiveAnalysisRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getSymbol();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getInterval();
  if (f !== 0.0) {
    writer.writeEnum(
      2,
      f
    );
  }
  f = /** @type {number} */ (jspb.Message.getField(message, 3));
  if (f != null) {
    writer.writeInt32(
      3,
      f
    );
  }
};


/**
 * optional string symbol = 1;
 * @return {string}
 */
proto.marketdata.GetComprehensiveAnalysisRequest.prototype.getSymbol = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.marketdata.GetComprehensiveAnalysisRequest} returns this
 */
proto.marketdata.GetComprehensiveAnalysisRequest.prototype.setSymbol = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional TimeInterval interval = 2;
 * @return {!proto.marketdata.TimeInterval}
 */
proto.marketdata.GetComprehensiveAnalysisRequest.prototype.getInterval = function() {
  return /** @type {!proto.marketdata.TimeInterval} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/**
 * @param {!proto.marketdata.TimeInterval} value
 * @return {!proto.marketdata.GetComprehensiveAnalysisRequest} returns this
 */
proto.marketdata.GetComprehensiveAnalysisRequest.prototype.setInterval = function(value) {
  return jspb.Message.setProto3EnumField(this, 2, value);
};


/**
 * optional int32 days = 3;
 * @return {number}
 */
proto.marketdata.GetComprehensiveAnalysisRequest.prototype.getDays = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 3, 0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.GetComprehensiveAnalysisRequest} returns this
 */
proto.marketdata.GetComprehensiveAnalysisRequest.prototype.setDays = function(value) {
  return jspb.Message.setField(this, 3, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.marketdata.GetComprehensiveAnalysisRequest} returns this
 */
proto.marketdata.GetComprehensiveAnalysisRequest.prototype.clearDays = function() {
  return jspb.Message.setField(this, 3, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.marketdata.GetComprehensiveAnalysisRequest.prototype.hasDays = function() {
  return jspb.Message.getField(this, 3) != null;
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.marketdata.CreateAlertRequest.repeatedFields_ = [13];



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
proto.marketdata.CreateAlertRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.marketdata.CreateAlertRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.marketdata.CreateAlertRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.CreateAlertRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    userId: jspb.Message.getFieldWithDefault(msg, 1, ""),
    symbol: jspb.Message.getFieldWithDefault(msg, 2, ""),
    alertType: jspb.Message.getFieldWithDefault(msg, 3, 0),
    title: jspb.Message.getFieldWithDefault(msg, 4, ""),
    description: jspb.Message.getFieldWithDefault(msg, 5, ""),
    conditionsMap: (f = msg.getConditionsMap()) ? f.toObject(includeInstance, undefined) : [],
    targetPrice: jspb.Message.getFloatingPointFieldWithDefault(msg, 7, 0.0),
    percentageThreshold: jspb.Message.getFloatingPointFieldWithDefault(msg, 8, 0.0),
    volumeThreshold: jspb.Message.getFieldWithDefault(msg, 9, 0),
    priority: jspb.Message.getFieldWithDefault(msg, 10, 0),
    isRecurring: jspb.Message.getBooleanFieldWithDefault(msg, 11, false),
    expiresAt: jspb.Message.getFieldWithDefault(msg, 12, 0),
    notificationMethodsList: (f = jspb.Message.getRepeatedField(msg, 13)) == null ? undefined : f
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
 * @return {!proto.marketdata.CreateAlertRequest}
 */
proto.marketdata.CreateAlertRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.marketdata.CreateAlertRequest;
  return proto.marketdata.CreateAlertRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.marketdata.CreateAlertRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.marketdata.CreateAlertRequest}
 */
proto.marketdata.CreateAlertRequest.deserializeBinaryFromReader = function(msg, reader) {
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
      msg.setSymbol(value);
      break;
    case 3:
      var value = /** @type {!proto.marketdata.AlertType} */ (reader.readEnum());
      msg.setAlertType(value);
      break;
    case 4:
      var value = /** @type {string} */ (reader.readString());
      msg.setTitle(value);
      break;
    case 5:
      var value = /** @type {string} */ (reader.readString());
      msg.setDescription(value);
      break;
    case 6:
      var value = msg.getConditionsMap();
      reader.readMessage(value, function(message, reader) {
        jspb.Map.deserializeBinary(message, reader, jspb.BinaryReader.prototype.readString, jspb.BinaryReader.prototype.readString, null, "", "");
         });
      break;
    case 7:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setTargetPrice(value);
      break;
    case 8:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setPercentageThreshold(value);
      break;
    case 9:
      var value = /** @type {number} */ (reader.readInt64());
      msg.setVolumeThreshold(value);
      break;
    case 10:
      var value = /** @type {!proto.marketdata.AlertPriority} */ (reader.readEnum());
      msg.setPriority(value);
      break;
    case 11:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setIsRecurring(value);
      break;
    case 12:
      var value = /** @type {number} */ (reader.readInt64());
      msg.setExpiresAt(value);
      break;
    case 13:
      var value = /** @type {string} */ (reader.readString());
      msg.addNotificationMethods(value);
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
proto.marketdata.CreateAlertRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.marketdata.CreateAlertRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.marketdata.CreateAlertRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.CreateAlertRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getUserId();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getSymbol();
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
  f = message.getTitle();
  if (f.length > 0) {
    writer.writeString(
      4,
      f
    );
  }
  f = /** @type {string} */ (jspb.Message.getField(message, 5));
  if (f != null) {
    writer.writeString(
      5,
      f
    );
  }
  f = message.getConditionsMap(true);
  if (f && f.getLength() > 0) {
    f.serializeBinary(6, writer, jspb.BinaryWriter.prototype.writeString, jspb.BinaryWriter.prototype.writeString);
  }
  f = /** @type {number} */ (jspb.Message.getField(message, 7));
  if (f != null) {
    writer.writeDouble(
      7,
      f
    );
  }
  f = /** @type {number} */ (jspb.Message.getField(message, 8));
  if (f != null) {
    writer.writeDouble(
      8,
      f
    );
  }
  f = /** @type {number} */ (jspb.Message.getField(message, 9));
  if (f != null) {
    writer.writeInt64(
      9,
      f
    );
  }
  f = /** @type {!proto.marketdata.AlertPriority} */ (jspb.Message.getField(message, 10));
  if (f != null) {
    writer.writeEnum(
      10,
      f
    );
  }
  f = /** @type {boolean} */ (jspb.Message.getField(message, 11));
  if (f != null) {
    writer.writeBool(
      11,
      f
    );
  }
  f = /** @type {number} */ (jspb.Message.getField(message, 12));
  if (f != null) {
    writer.writeInt64(
      12,
      f
    );
  }
  f = message.getNotificationMethodsList();
  if (f.length > 0) {
    writer.writeRepeatedString(
      13,
      f
    );
  }
};


/**
 * optional string user_id = 1;
 * @return {string}
 */
proto.marketdata.CreateAlertRequest.prototype.getUserId = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.marketdata.CreateAlertRequest} returns this
 */
proto.marketdata.CreateAlertRequest.prototype.setUserId = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional string symbol = 2;
 * @return {string}
 */
proto.marketdata.CreateAlertRequest.prototype.getSymbol = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.marketdata.CreateAlertRequest} returns this
 */
proto.marketdata.CreateAlertRequest.prototype.setSymbol = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};


/**
 * optional AlertType alert_type = 3;
 * @return {!proto.marketdata.AlertType}
 */
proto.marketdata.CreateAlertRequest.prototype.getAlertType = function() {
  return /** @type {!proto.marketdata.AlertType} */ (jspb.Message.getFieldWithDefault(this, 3, 0));
};


/**
 * @param {!proto.marketdata.AlertType} value
 * @return {!proto.marketdata.CreateAlertRequest} returns this
 */
proto.marketdata.CreateAlertRequest.prototype.setAlertType = function(value) {
  return jspb.Message.setProto3EnumField(this, 3, value);
};


/**
 * optional string title = 4;
 * @return {string}
 */
proto.marketdata.CreateAlertRequest.prototype.getTitle = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 4, ""));
};


/**
 * @param {string} value
 * @return {!proto.marketdata.CreateAlertRequest} returns this
 */
proto.marketdata.CreateAlertRequest.prototype.setTitle = function(value) {
  return jspb.Message.setProto3StringField(this, 4, value);
};


/**
 * optional string description = 5;
 * @return {string}
 */
proto.marketdata.CreateAlertRequest.prototype.getDescription = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 5, ""));
};


/**
 * @param {string} value
 * @return {!proto.marketdata.CreateAlertRequest} returns this
 */
proto.marketdata.CreateAlertRequest.prototype.setDescription = function(value) {
  return jspb.Message.setField(this, 5, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.marketdata.CreateAlertRequest} returns this
 */
proto.marketdata.CreateAlertRequest.prototype.clearDescription = function() {
  return jspb.Message.setField(this, 5, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.marketdata.CreateAlertRequest.prototype.hasDescription = function() {
  return jspb.Message.getField(this, 5) != null;
};


/**
 * map<string, string> conditions = 6;
 * @param {boolean=} opt_noLazyCreate Do not create the map if
 * empty, instead returning `undefined`
 * @return {!jspb.Map<string,string>}
 */
proto.marketdata.CreateAlertRequest.prototype.getConditionsMap = function(opt_noLazyCreate) {
  return /** @type {!jspb.Map<string,string>} */ (
      jspb.Message.getMapField(this, 6, opt_noLazyCreate,
      null));
};


/**
 * Clears values from the map. The map will be non-null.
 * @return {!proto.marketdata.CreateAlertRequest} returns this
 */
proto.marketdata.CreateAlertRequest.prototype.clearConditionsMap = function() {
  this.getConditionsMap().clear();
  return this;};


/**
 * optional double target_price = 7;
 * @return {number}
 */
proto.marketdata.CreateAlertRequest.prototype.getTargetPrice = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 7, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.CreateAlertRequest} returns this
 */
proto.marketdata.CreateAlertRequest.prototype.setTargetPrice = function(value) {
  return jspb.Message.setField(this, 7, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.marketdata.CreateAlertRequest} returns this
 */
proto.marketdata.CreateAlertRequest.prototype.clearTargetPrice = function() {
  return jspb.Message.setField(this, 7, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.marketdata.CreateAlertRequest.prototype.hasTargetPrice = function() {
  return jspb.Message.getField(this, 7) != null;
};


/**
 * optional double percentage_threshold = 8;
 * @return {number}
 */
proto.marketdata.CreateAlertRequest.prototype.getPercentageThreshold = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 8, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.CreateAlertRequest} returns this
 */
proto.marketdata.CreateAlertRequest.prototype.setPercentageThreshold = function(value) {
  return jspb.Message.setField(this, 8, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.marketdata.CreateAlertRequest} returns this
 */
proto.marketdata.CreateAlertRequest.prototype.clearPercentageThreshold = function() {
  return jspb.Message.setField(this, 8, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.marketdata.CreateAlertRequest.prototype.hasPercentageThreshold = function() {
  return jspb.Message.getField(this, 8) != null;
};


/**
 * optional int64 volume_threshold = 9;
 * @return {number}
 */
proto.marketdata.CreateAlertRequest.prototype.getVolumeThreshold = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 9, 0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.CreateAlertRequest} returns this
 */
proto.marketdata.CreateAlertRequest.prototype.setVolumeThreshold = function(value) {
  return jspb.Message.setField(this, 9, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.marketdata.CreateAlertRequest} returns this
 */
proto.marketdata.CreateAlertRequest.prototype.clearVolumeThreshold = function() {
  return jspb.Message.setField(this, 9, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.marketdata.CreateAlertRequest.prototype.hasVolumeThreshold = function() {
  return jspb.Message.getField(this, 9) != null;
};


/**
 * optional AlertPriority priority = 10;
 * @return {!proto.marketdata.AlertPriority}
 */
proto.marketdata.CreateAlertRequest.prototype.getPriority = function() {
  return /** @type {!proto.marketdata.AlertPriority} */ (jspb.Message.getFieldWithDefault(this, 10, 0));
};


/**
 * @param {!proto.marketdata.AlertPriority} value
 * @return {!proto.marketdata.CreateAlertRequest} returns this
 */
proto.marketdata.CreateAlertRequest.prototype.setPriority = function(value) {
  return jspb.Message.setField(this, 10, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.marketdata.CreateAlertRequest} returns this
 */
proto.marketdata.CreateAlertRequest.prototype.clearPriority = function() {
  return jspb.Message.setField(this, 10, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.marketdata.CreateAlertRequest.prototype.hasPriority = function() {
  return jspb.Message.getField(this, 10) != null;
};


/**
 * optional bool is_recurring = 11;
 * @return {boolean}
 */
proto.marketdata.CreateAlertRequest.prototype.getIsRecurring = function() {
  return /** @type {boolean} */ (jspb.Message.getBooleanFieldWithDefault(this, 11, false));
};


/**
 * @param {boolean} value
 * @return {!proto.marketdata.CreateAlertRequest} returns this
 */
proto.marketdata.CreateAlertRequest.prototype.setIsRecurring = function(value) {
  return jspb.Message.setField(this, 11, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.marketdata.CreateAlertRequest} returns this
 */
proto.marketdata.CreateAlertRequest.prototype.clearIsRecurring = function() {
  return jspb.Message.setField(this, 11, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.marketdata.CreateAlertRequest.prototype.hasIsRecurring = function() {
  return jspb.Message.getField(this, 11) != null;
};


/**
 * optional int64 expires_at = 12;
 * @return {number}
 */
proto.marketdata.CreateAlertRequest.prototype.getExpiresAt = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 12, 0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.CreateAlertRequest} returns this
 */
proto.marketdata.CreateAlertRequest.prototype.setExpiresAt = function(value) {
  return jspb.Message.setField(this, 12, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.marketdata.CreateAlertRequest} returns this
 */
proto.marketdata.CreateAlertRequest.prototype.clearExpiresAt = function() {
  return jspb.Message.setField(this, 12, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.marketdata.CreateAlertRequest.prototype.hasExpiresAt = function() {
  return jspb.Message.getField(this, 12) != null;
};


/**
 * repeated string notification_methods = 13;
 * @return {!Array<string>}
 */
proto.marketdata.CreateAlertRequest.prototype.getNotificationMethodsList = function() {
  return /** @type {!Array<string>} */ (jspb.Message.getRepeatedField(this, 13));
};


/**
 * @param {!Array<string>} value
 * @return {!proto.marketdata.CreateAlertRequest} returns this
 */
proto.marketdata.CreateAlertRequest.prototype.setNotificationMethodsList = function(value) {
  return jspb.Message.setField(this, 13, value || []);
};


/**
 * @param {string} value
 * @param {number=} opt_index
 * @return {!proto.marketdata.CreateAlertRequest} returns this
 */
proto.marketdata.CreateAlertRequest.prototype.addNotificationMethods = function(value, opt_index) {
  return jspb.Message.addToRepeatedField(this, 13, value, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.marketdata.CreateAlertRequest} returns this
 */
proto.marketdata.CreateAlertRequest.prototype.clearNotificationMethodsList = function() {
  return this.setNotificationMethodsList([]);
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.marketdata.UpdateAlertRequest.repeatedFields_ = [12];



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
proto.marketdata.UpdateAlertRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.marketdata.UpdateAlertRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.marketdata.UpdateAlertRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.UpdateAlertRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    alertId: jspb.Message.getFieldWithDefault(msg, 1, ""),
    title: jspb.Message.getFieldWithDefault(msg, 2, ""),
    description: jspb.Message.getFieldWithDefault(msg, 3, ""),
    conditionsMap: (f = msg.getConditionsMap()) ? f.toObject(includeInstance, undefined) : [],
    targetPrice: jspb.Message.getFloatingPointFieldWithDefault(msg, 5, 0.0),
    percentageThreshold: jspb.Message.getFloatingPointFieldWithDefault(msg, 6, 0.0),
    volumeThreshold: jspb.Message.getFieldWithDefault(msg, 7, 0),
    priority: jspb.Message.getFieldWithDefault(msg, 8, 0),
    status: jspb.Message.getFieldWithDefault(msg, 9, 0),
    isRecurring: jspb.Message.getBooleanFieldWithDefault(msg, 10, false),
    expiresAt: jspb.Message.getFieldWithDefault(msg, 11, 0),
    notificationMethodsList: (f = jspb.Message.getRepeatedField(msg, 12)) == null ? undefined : f
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
 * @return {!proto.marketdata.UpdateAlertRequest}
 */
proto.marketdata.UpdateAlertRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.marketdata.UpdateAlertRequest;
  return proto.marketdata.UpdateAlertRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.marketdata.UpdateAlertRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.marketdata.UpdateAlertRequest}
 */
proto.marketdata.UpdateAlertRequest.deserializeBinaryFromReader = function(msg, reader) {
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
      msg.setTitle(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readString());
      msg.setDescription(value);
      break;
    case 4:
      var value = msg.getConditionsMap();
      reader.readMessage(value, function(message, reader) {
        jspb.Map.deserializeBinary(message, reader, jspb.BinaryReader.prototype.readString, jspb.BinaryReader.prototype.readString, null, "", "");
         });
      break;
    case 5:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setTargetPrice(value);
      break;
    case 6:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setPercentageThreshold(value);
      break;
    case 7:
      var value = /** @type {number} */ (reader.readInt64());
      msg.setVolumeThreshold(value);
      break;
    case 8:
      var value = /** @type {!proto.marketdata.AlertPriority} */ (reader.readEnum());
      msg.setPriority(value);
      break;
    case 9:
      var value = /** @type {!proto.marketdata.AlertStatus} */ (reader.readEnum());
      msg.setStatus(value);
      break;
    case 10:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setIsRecurring(value);
      break;
    case 11:
      var value = /** @type {number} */ (reader.readInt64());
      msg.setExpiresAt(value);
      break;
    case 12:
      var value = /** @type {string} */ (reader.readString());
      msg.addNotificationMethods(value);
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
proto.marketdata.UpdateAlertRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.marketdata.UpdateAlertRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.marketdata.UpdateAlertRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.UpdateAlertRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getAlertId();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = /** @type {string} */ (jspb.Message.getField(message, 2));
  if (f != null) {
    writer.writeString(
      2,
      f
    );
  }
  f = /** @type {string} */ (jspb.Message.getField(message, 3));
  if (f != null) {
    writer.writeString(
      3,
      f
    );
  }
  f = message.getConditionsMap(true);
  if (f && f.getLength() > 0) {
    f.serializeBinary(4, writer, jspb.BinaryWriter.prototype.writeString, jspb.BinaryWriter.prototype.writeString);
  }
  f = /** @type {number} */ (jspb.Message.getField(message, 5));
  if (f != null) {
    writer.writeDouble(
      5,
      f
    );
  }
  f = /** @type {number} */ (jspb.Message.getField(message, 6));
  if (f != null) {
    writer.writeDouble(
      6,
      f
    );
  }
  f = /** @type {number} */ (jspb.Message.getField(message, 7));
  if (f != null) {
    writer.writeInt64(
      7,
      f
    );
  }
  f = /** @type {!proto.marketdata.AlertPriority} */ (jspb.Message.getField(message, 8));
  if (f != null) {
    writer.writeEnum(
      8,
      f
    );
  }
  f = /** @type {!proto.marketdata.AlertStatus} */ (jspb.Message.getField(message, 9));
  if (f != null) {
    writer.writeEnum(
      9,
      f
    );
  }
  f = /** @type {boolean} */ (jspb.Message.getField(message, 10));
  if (f != null) {
    writer.writeBool(
      10,
      f
    );
  }
  f = /** @type {number} */ (jspb.Message.getField(message, 11));
  if (f != null) {
    writer.writeInt64(
      11,
      f
    );
  }
  f = message.getNotificationMethodsList();
  if (f.length > 0) {
    writer.writeRepeatedString(
      12,
      f
    );
  }
};


/**
 * optional string alert_id = 1;
 * @return {string}
 */
proto.marketdata.UpdateAlertRequest.prototype.getAlertId = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.marketdata.UpdateAlertRequest} returns this
 */
proto.marketdata.UpdateAlertRequest.prototype.setAlertId = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional string title = 2;
 * @return {string}
 */
proto.marketdata.UpdateAlertRequest.prototype.getTitle = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.marketdata.UpdateAlertRequest} returns this
 */
proto.marketdata.UpdateAlertRequest.prototype.setTitle = function(value) {
  return jspb.Message.setField(this, 2, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.marketdata.UpdateAlertRequest} returns this
 */
proto.marketdata.UpdateAlertRequest.prototype.clearTitle = function() {
  return jspb.Message.setField(this, 2, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.marketdata.UpdateAlertRequest.prototype.hasTitle = function() {
  return jspb.Message.getField(this, 2) != null;
};


/**
 * optional string description = 3;
 * @return {string}
 */
proto.marketdata.UpdateAlertRequest.prototype.getDescription = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/**
 * @param {string} value
 * @return {!proto.marketdata.UpdateAlertRequest} returns this
 */
proto.marketdata.UpdateAlertRequest.prototype.setDescription = function(value) {
  return jspb.Message.setField(this, 3, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.marketdata.UpdateAlertRequest} returns this
 */
proto.marketdata.UpdateAlertRequest.prototype.clearDescription = function() {
  return jspb.Message.setField(this, 3, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.marketdata.UpdateAlertRequest.prototype.hasDescription = function() {
  return jspb.Message.getField(this, 3) != null;
};


/**
 * map<string, string> conditions = 4;
 * @param {boolean=} opt_noLazyCreate Do not create the map if
 * empty, instead returning `undefined`
 * @return {!jspb.Map<string,string>}
 */
proto.marketdata.UpdateAlertRequest.prototype.getConditionsMap = function(opt_noLazyCreate) {
  return /** @type {!jspb.Map<string,string>} */ (
      jspb.Message.getMapField(this, 4, opt_noLazyCreate,
      null));
};


/**
 * Clears values from the map. The map will be non-null.
 * @return {!proto.marketdata.UpdateAlertRequest} returns this
 */
proto.marketdata.UpdateAlertRequest.prototype.clearConditionsMap = function() {
  this.getConditionsMap().clear();
  return this;};


/**
 * optional double target_price = 5;
 * @return {number}
 */
proto.marketdata.UpdateAlertRequest.prototype.getTargetPrice = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 5, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.UpdateAlertRequest} returns this
 */
proto.marketdata.UpdateAlertRequest.prototype.setTargetPrice = function(value) {
  return jspb.Message.setField(this, 5, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.marketdata.UpdateAlertRequest} returns this
 */
proto.marketdata.UpdateAlertRequest.prototype.clearTargetPrice = function() {
  return jspb.Message.setField(this, 5, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.marketdata.UpdateAlertRequest.prototype.hasTargetPrice = function() {
  return jspb.Message.getField(this, 5) != null;
};


/**
 * optional double percentage_threshold = 6;
 * @return {number}
 */
proto.marketdata.UpdateAlertRequest.prototype.getPercentageThreshold = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 6, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.UpdateAlertRequest} returns this
 */
proto.marketdata.UpdateAlertRequest.prototype.setPercentageThreshold = function(value) {
  return jspb.Message.setField(this, 6, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.marketdata.UpdateAlertRequest} returns this
 */
proto.marketdata.UpdateAlertRequest.prototype.clearPercentageThreshold = function() {
  return jspb.Message.setField(this, 6, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.marketdata.UpdateAlertRequest.prototype.hasPercentageThreshold = function() {
  return jspb.Message.getField(this, 6) != null;
};


/**
 * optional int64 volume_threshold = 7;
 * @return {number}
 */
proto.marketdata.UpdateAlertRequest.prototype.getVolumeThreshold = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 7, 0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.UpdateAlertRequest} returns this
 */
proto.marketdata.UpdateAlertRequest.prototype.setVolumeThreshold = function(value) {
  return jspb.Message.setField(this, 7, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.marketdata.UpdateAlertRequest} returns this
 */
proto.marketdata.UpdateAlertRequest.prototype.clearVolumeThreshold = function() {
  return jspb.Message.setField(this, 7, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.marketdata.UpdateAlertRequest.prototype.hasVolumeThreshold = function() {
  return jspb.Message.getField(this, 7) != null;
};


/**
 * optional AlertPriority priority = 8;
 * @return {!proto.marketdata.AlertPriority}
 */
proto.marketdata.UpdateAlertRequest.prototype.getPriority = function() {
  return /** @type {!proto.marketdata.AlertPriority} */ (jspb.Message.getFieldWithDefault(this, 8, 0));
};


/**
 * @param {!proto.marketdata.AlertPriority} value
 * @return {!proto.marketdata.UpdateAlertRequest} returns this
 */
proto.marketdata.UpdateAlertRequest.prototype.setPriority = function(value) {
  return jspb.Message.setField(this, 8, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.marketdata.UpdateAlertRequest} returns this
 */
proto.marketdata.UpdateAlertRequest.prototype.clearPriority = function() {
  return jspb.Message.setField(this, 8, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.marketdata.UpdateAlertRequest.prototype.hasPriority = function() {
  return jspb.Message.getField(this, 8) != null;
};


/**
 * optional AlertStatus status = 9;
 * @return {!proto.marketdata.AlertStatus}
 */
proto.marketdata.UpdateAlertRequest.prototype.getStatus = function() {
  return /** @type {!proto.marketdata.AlertStatus} */ (jspb.Message.getFieldWithDefault(this, 9, 0));
};


/**
 * @param {!proto.marketdata.AlertStatus} value
 * @return {!proto.marketdata.UpdateAlertRequest} returns this
 */
proto.marketdata.UpdateAlertRequest.prototype.setStatus = function(value) {
  return jspb.Message.setField(this, 9, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.marketdata.UpdateAlertRequest} returns this
 */
proto.marketdata.UpdateAlertRequest.prototype.clearStatus = function() {
  return jspb.Message.setField(this, 9, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.marketdata.UpdateAlertRequest.prototype.hasStatus = function() {
  return jspb.Message.getField(this, 9) != null;
};


/**
 * optional bool is_recurring = 10;
 * @return {boolean}
 */
proto.marketdata.UpdateAlertRequest.prototype.getIsRecurring = function() {
  return /** @type {boolean} */ (jspb.Message.getBooleanFieldWithDefault(this, 10, false));
};


/**
 * @param {boolean} value
 * @return {!proto.marketdata.UpdateAlertRequest} returns this
 */
proto.marketdata.UpdateAlertRequest.prototype.setIsRecurring = function(value) {
  return jspb.Message.setField(this, 10, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.marketdata.UpdateAlertRequest} returns this
 */
proto.marketdata.UpdateAlertRequest.prototype.clearIsRecurring = function() {
  return jspb.Message.setField(this, 10, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.marketdata.UpdateAlertRequest.prototype.hasIsRecurring = function() {
  return jspb.Message.getField(this, 10) != null;
};


/**
 * optional int64 expires_at = 11;
 * @return {number}
 */
proto.marketdata.UpdateAlertRequest.prototype.getExpiresAt = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 11, 0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.UpdateAlertRequest} returns this
 */
proto.marketdata.UpdateAlertRequest.prototype.setExpiresAt = function(value) {
  return jspb.Message.setField(this, 11, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.marketdata.UpdateAlertRequest} returns this
 */
proto.marketdata.UpdateAlertRequest.prototype.clearExpiresAt = function() {
  return jspb.Message.setField(this, 11, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.marketdata.UpdateAlertRequest.prototype.hasExpiresAt = function() {
  return jspb.Message.getField(this, 11) != null;
};


/**
 * repeated string notification_methods = 12;
 * @return {!Array<string>}
 */
proto.marketdata.UpdateAlertRequest.prototype.getNotificationMethodsList = function() {
  return /** @type {!Array<string>} */ (jspb.Message.getRepeatedField(this, 12));
};


/**
 * @param {!Array<string>} value
 * @return {!proto.marketdata.UpdateAlertRequest} returns this
 */
proto.marketdata.UpdateAlertRequest.prototype.setNotificationMethodsList = function(value) {
  return jspb.Message.setField(this, 12, value || []);
};


/**
 * @param {string} value
 * @param {number=} opt_index
 * @return {!proto.marketdata.UpdateAlertRequest} returns this
 */
proto.marketdata.UpdateAlertRequest.prototype.addNotificationMethods = function(value, opt_index) {
  return jspb.Message.addToRepeatedField(this, 12, value, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.marketdata.UpdateAlertRequest} returns this
 */
proto.marketdata.UpdateAlertRequest.prototype.clearNotificationMethodsList = function() {
  return this.setNotificationMethodsList([]);
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
proto.marketdata.DeleteAlertRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.marketdata.DeleteAlertRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.marketdata.DeleteAlertRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.DeleteAlertRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    alertId: jspb.Message.getFieldWithDefault(msg, 1, "")
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
 * @return {!proto.marketdata.DeleteAlertRequest}
 */
proto.marketdata.DeleteAlertRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.marketdata.DeleteAlertRequest;
  return proto.marketdata.DeleteAlertRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.marketdata.DeleteAlertRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.marketdata.DeleteAlertRequest}
 */
proto.marketdata.DeleteAlertRequest.deserializeBinaryFromReader = function(msg, reader) {
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
proto.marketdata.DeleteAlertRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.marketdata.DeleteAlertRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.marketdata.DeleteAlertRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.DeleteAlertRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getAlertId();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
};


/**
 * optional string alert_id = 1;
 * @return {string}
 */
proto.marketdata.DeleteAlertRequest.prototype.getAlertId = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.marketdata.DeleteAlertRequest} returns this
 */
proto.marketdata.DeleteAlertRequest.prototype.setAlertId = function(value) {
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
proto.marketdata.GetUserAlertsRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.marketdata.GetUserAlertsRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.marketdata.GetUserAlertsRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.GetUserAlertsRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    userId: jspb.Message.getFieldWithDefault(msg, 1, ""),
    status: jspb.Message.getFieldWithDefault(msg, 2, 0)
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
 * @return {!proto.marketdata.GetUserAlertsRequest}
 */
proto.marketdata.GetUserAlertsRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.marketdata.GetUserAlertsRequest;
  return proto.marketdata.GetUserAlertsRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.marketdata.GetUserAlertsRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.marketdata.GetUserAlertsRequest}
 */
proto.marketdata.GetUserAlertsRequest.deserializeBinaryFromReader = function(msg, reader) {
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
      var value = /** @type {!proto.marketdata.AlertStatus} */ (reader.readEnum());
      msg.setStatus(value);
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
proto.marketdata.GetUserAlertsRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.marketdata.GetUserAlertsRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.marketdata.GetUserAlertsRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.GetUserAlertsRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getUserId();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = /** @type {!proto.marketdata.AlertStatus} */ (jspb.Message.getField(message, 2));
  if (f != null) {
    writer.writeEnum(
      2,
      f
    );
  }
};


/**
 * optional string user_id = 1;
 * @return {string}
 */
proto.marketdata.GetUserAlertsRequest.prototype.getUserId = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.marketdata.GetUserAlertsRequest} returns this
 */
proto.marketdata.GetUserAlertsRequest.prototype.setUserId = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional AlertStatus status = 2;
 * @return {!proto.marketdata.AlertStatus}
 */
proto.marketdata.GetUserAlertsRequest.prototype.getStatus = function() {
  return /** @type {!proto.marketdata.AlertStatus} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/**
 * @param {!proto.marketdata.AlertStatus} value
 * @return {!proto.marketdata.GetUserAlertsRequest} returns this
 */
proto.marketdata.GetUserAlertsRequest.prototype.setStatus = function(value) {
  return jspb.Message.setField(this, 2, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.marketdata.GetUserAlertsRequest} returns this
 */
proto.marketdata.GetUserAlertsRequest.prototype.clearStatus = function() {
  return jspb.Message.setField(this, 2, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.marketdata.GetUserAlertsRequest.prototype.hasStatus = function() {
  return jspb.Message.getField(this, 2) != null;
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
proto.marketdata.GetAlertStatisticsRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.marketdata.GetAlertStatisticsRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.marketdata.GetAlertStatisticsRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.GetAlertStatisticsRequest.toObject = function(includeInstance, msg) {
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
 * @return {!proto.marketdata.GetAlertStatisticsRequest}
 */
proto.marketdata.GetAlertStatisticsRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.marketdata.GetAlertStatisticsRequest;
  return proto.marketdata.GetAlertStatisticsRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.marketdata.GetAlertStatisticsRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.marketdata.GetAlertStatisticsRequest}
 */
proto.marketdata.GetAlertStatisticsRequest.deserializeBinaryFromReader = function(msg, reader) {
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
proto.marketdata.GetAlertStatisticsRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.marketdata.GetAlertStatisticsRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.marketdata.GetAlertStatisticsRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.GetAlertStatisticsRequest.serializeBinaryToWriter = function(message, writer) {
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
proto.marketdata.GetAlertStatisticsRequest.prototype.getUserId = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.marketdata.GetAlertStatisticsRequest} returns this
 */
proto.marketdata.GetAlertStatisticsRequest.prototype.setUserId = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.marketdata.AddToWatchlistRequest.repeatedFields_ = [5];



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
proto.marketdata.AddToWatchlistRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.marketdata.AddToWatchlistRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.marketdata.AddToWatchlistRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.AddToWatchlistRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    userId: jspb.Message.getFieldWithDefault(msg, 1, ""),
    symbol: jspb.Message.getFieldWithDefault(msg, 2, ""),
    displayName: jspb.Message.getFieldWithDefault(msg, 3, ""),
    notes: jspb.Message.getFieldWithDefault(msg, 4, ""),
    tagsList: (f = jspb.Message.getRepeatedField(msg, 5)) == null ? undefined : f,
    targetBuyPrice: jspb.Message.getFloatingPointFieldWithDefault(msg, 6, 0.0),
    targetSellPrice: jspb.Message.getFloatingPointFieldWithDefault(msg, 7, 0.0),
    stopLossPrice: jspb.Message.getFloatingPointFieldWithDefault(msg, 8, 0.0),
    enableAlerts: jspb.Message.getBooleanFieldWithDefault(msg, 9, false)
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
 * @return {!proto.marketdata.AddToWatchlistRequest}
 */
proto.marketdata.AddToWatchlistRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.marketdata.AddToWatchlistRequest;
  return proto.marketdata.AddToWatchlistRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.marketdata.AddToWatchlistRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.marketdata.AddToWatchlistRequest}
 */
proto.marketdata.AddToWatchlistRequest.deserializeBinaryFromReader = function(msg, reader) {
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
      msg.setSymbol(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readString());
      msg.setDisplayName(value);
      break;
    case 4:
      var value = /** @type {string} */ (reader.readString());
      msg.setNotes(value);
      break;
    case 5:
      var value = /** @type {string} */ (reader.readString());
      msg.addTags(value);
      break;
    case 6:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setTargetBuyPrice(value);
      break;
    case 7:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setTargetSellPrice(value);
      break;
    case 8:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setStopLossPrice(value);
      break;
    case 9:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setEnableAlerts(value);
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
proto.marketdata.AddToWatchlistRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.marketdata.AddToWatchlistRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.marketdata.AddToWatchlistRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.AddToWatchlistRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getUserId();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getSymbol();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
  f = /** @type {string} */ (jspb.Message.getField(message, 3));
  if (f != null) {
    writer.writeString(
      3,
      f
    );
  }
  f = /** @type {string} */ (jspb.Message.getField(message, 4));
  if (f != null) {
    writer.writeString(
      4,
      f
    );
  }
  f = message.getTagsList();
  if (f.length > 0) {
    writer.writeRepeatedString(
      5,
      f
    );
  }
  f = /** @type {number} */ (jspb.Message.getField(message, 6));
  if (f != null) {
    writer.writeDouble(
      6,
      f
    );
  }
  f = /** @type {number} */ (jspb.Message.getField(message, 7));
  if (f != null) {
    writer.writeDouble(
      7,
      f
    );
  }
  f = /** @type {number} */ (jspb.Message.getField(message, 8));
  if (f != null) {
    writer.writeDouble(
      8,
      f
    );
  }
  f = /** @type {boolean} */ (jspb.Message.getField(message, 9));
  if (f != null) {
    writer.writeBool(
      9,
      f
    );
  }
};


/**
 * optional string user_id = 1;
 * @return {string}
 */
proto.marketdata.AddToWatchlistRequest.prototype.getUserId = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.marketdata.AddToWatchlistRequest} returns this
 */
proto.marketdata.AddToWatchlistRequest.prototype.setUserId = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional string symbol = 2;
 * @return {string}
 */
proto.marketdata.AddToWatchlistRequest.prototype.getSymbol = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.marketdata.AddToWatchlistRequest} returns this
 */
proto.marketdata.AddToWatchlistRequest.prototype.setSymbol = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};


/**
 * optional string display_name = 3;
 * @return {string}
 */
proto.marketdata.AddToWatchlistRequest.prototype.getDisplayName = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/**
 * @param {string} value
 * @return {!proto.marketdata.AddToWatchlistRequest} returns this
 */
proto.marketdata.AddToWatchlistRequest.prototype.setDisplayName = function(value) {
  return jspb.Message.setField(this, 3, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.marketdata.AddToWatchlistRequest} returns this
 */
proto.marketdata.AddToWatchlistRequest.prototype.clearDisplayName = function() {
  return jspb.Message.setField(this, 3, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.marketdata.AddToWatchlistRequest.prototype.hasDisplayName = function() {
  return jspb.Message.getField(this, 3) != null;
};


/**
 * optional string notes = 4;
 * @return {string}
 */
proto.marketdata.AddToWatchlistRequest.prototype.getNotes = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 4, ""));
};


/**
 * @param {string} value
 * @return {!proto.marketdata.AddToWatchlistRequest} returns this
 */
proto.marketdata.AddToWatchlistRequest.prototype.setNotes = function(value) {
  return jspb.Message.setField(this, 4, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.marketdata.AddToWatchlistRequest} returns this
 */
proto.marketdata.AddToWatchlistRequest.prototype.clearNotes = function() {
  return jspb.Message.setField(this, 4, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.marketdata.AddToWatchlistRequest.prototype.hasNotes = function() {
  return jspb.Message.getField(this, 4) != null;
};


/**
 * repeated string tags = 5;
 * @return {!Array<string>}
 */
proto.marketdata.AddToWatchlistRequest.prototype.getTagsList = function() {
  return /** @type {!Array<string>} */ (jspb.Message.getRepeatedField(this, 5));
};


/**
 * @param {!Array<string>} value
 * @return {!proto.marketdata.AddToWatchlistRequest} returns this
 */
proto.marketdata.AddToWatchlistRequest.prototype.setTagsList = function(value) {
  return jspb.Message.setField(this, 5, value || []);
};


/**
 * @param {string} value
 * @param {number=} opt_index
 * @return {!proto.marketdata.AddToWatchlistRequest} returns this
 */
proto.marketdata.AddToWatchlistRequest.prototype.addTags = function(value, opt_index) {
  return jspb.Message.addToRepeatedField(this, 5, value, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.marketdata.AddToWatchlistRequest} returns this
 */
proto.marketdata.AddToWatchlistRequest.prototype.clearTagsList = function() {
  return this.setTagsList([]);
};


/**
 * optional double target_buy_price = 6;
 * @return {number}
 */
proto.marketdata.AddToWatchlistRequest.prototype.getTargetBuyPrice = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 6, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.AddToWatchlistRequest} returns this
 */
proto.marketdata.AddToWatchlistRequest.prototype.setTargetBuyPrice = function(value) {
  return jspb.Message.setField(this, 6, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.marketdata.AddToWatchlistRequest} returns this
 */
proto.marketdata.AddToWatchlistRequest.prototype.clearTargetBuyPrice = function() {
  return jspb.Message.setField(this, 6, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.marketdata.AddToWatchlistRequest.prototype.hasTargetBuyPrice = function() {
  return jspb.Message.getField(this, 6) != null;
};


/**
 * optional double target_sell_price = 7;
 * @return {number}
 */
proto.marketdata.AddToWatchlistRequest.prototype.getTargetSellPrice = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 7, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.AddToWatchlistRequest} returns this
 */
proto.marketdata.AddToWatchlistRequest.prototype.setTargetSellPrice = function(value) {
  return jspb.Message.setField(this, 7, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.marketdata.AddToWatchlistRequest} returns this
 */
proto.marketdata.AddToWatchlistRequest.prototype.clearTargetSellPrice = function() {
  return jspb.Message.setField(this, 7, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.marketdata.AddToWatchlistRequest.prototype.hasTargetSellPrice = function() {
  return jspb.Message.getField(this, 7) != null;
};


/**
 * optional double stop_loss_price = 8;
 * @return {number}
 */
proto.marketdata.AddToWatchlistRequest.prototype.getStopLossPrice = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 8, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.AddToWatchlistRequest} returns this
 */
proto.marketdata.AddToWatchlistRequest.prototype.setStopLossPrice = function(value) {
  return jspb.Message.setField(this, 8, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.marketdata.AddToWatchlistRequest} returns this
 */
proto.marketdata.AddToWatchlistRequest.prototype.clearStopLossPrice = function() {
  return jspb.Message.setField(this, 8, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.marketdata.AddToWatchlistRequest.prototype.hasStopLossPrice = function() {
  return jspb.Message.getField(this, 8) != null;
};


/**
 * optional bool enable_alerts = 9;
 * @return {boolean}
 */
proto.marketdata.AddToWatchlistRequest.prototype.getEnableAlerts = function() {
  return /** @type {boolean} */ (jspb.Message.getBooleanFieldWithDefault(this, 9, false));
};


/**
 * @param {boolean} value
 * @return {!proto.marketdata.AddToWatchlistRequest} returns this
 */
proto.marketdata.AddToWatchlistRequest.prototype.setEnableAlerts = function(value) {
  return jspb.Message.setField(this, 9, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.marketdata.AddToWatchlistRequest} returns this
 */
proto.marketdata.AddToWatchlistRequest.prototype.clearEnableAlerts = function() {
  return jspb.Message.setField(this, 9, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.marketdata.AddToWatchlistRequest.prototype.hasEnableAlerts = function() {
  return jspb.Message.getField(this, 9) != null;
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
proto.marketdata.RemoveFromWatchlistRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.marketdata.RemoveFromWatchlistRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.marketdata.RemoveFromWatchlistRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.RemoveFromWatchlistRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    watchlistItemId: jspb.Message.getFieldWithDefault(msg, 1, "")
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
 * @return {!proto.marketdata.RemoveFromWatchlistRequest}
 */
proto.marketdata.RemoveFromWatchlistRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.marketdata.RemoveFromWatchlistRequest;
  return proto.marketdata.RemoveFromWatchlistRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.marketdata.RemoveFromWatchlistRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.marketdata.RemoveFromWatchlistRequest}
 */
proto.marketdata.RemoveFromWatchlistRequest.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setWatchlistItemId(value);
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
proto.marketdata.RemoveFromWatchlistRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.marketdata.RemoveFromWatchlistRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.marketdata.RemoveFromWatchlistRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.RemoveFromWatchlistRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getWatchlistItemId();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
};


/**
 * optional string watchlist_item_id = 1;
 * @return {string}
 */
proto.marketdata.RemoveFromWatchlistRequest.prototype.getWatchlistItemId = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.marketdata.RemoveFromWatchlistRequest} returns this
 */
proto.marketdata.RemoveFromWatchlistRequest.prototype.setWatchlistItemId = function(value) {
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
proto.marketdata.GetUserWatchlistRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.marketdata.GetUserWatchlistRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.marketdata.GetUserWatchlistRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.GetUserWatchlistRequest.toObject = function(includeInstance, msg) {
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
 * @return {!proto.marketdata.GetUserWatchlistRequest}
 */
proto.marketdata.GetUserWatchlistRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.marketdata.GetUserWatchlistRequest;
  return proto.marketdata.GetUserWatchlistRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.marketdata.GetUserWatchlistRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.marketdata.GetUserWatchlistRequest}
 */
proto.marketdata.GetUserWatchlistRequest.deserializeBinaryFromReader = function(msg, reader) {
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
proto.marketdata.GetUserWatchlistRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.marketdata.GetUserWatchlistRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.marketdata.GetUserWatchlistRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.GetUserWatchlistRequest.serializeBinaryToWriter = function(message, writer) {
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
proto.marketdata.GetUserWatchlistRequest.prototype.getUserId = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.marketdata.GetUserWatchlistRequest} returns this
 */
proto.marketdata.GetUserWatchlistRequest.prototype.setUserId = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.marketdata.UpdateWatchlistItemRequest.repeatedFields_ = [4];



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
proto.marketdata.UpdateWatchlistItemRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.marketdata.UpdateWatchlistItemRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.marketdata.UpdateWatchlistItemRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.UpdateWatchlistItemRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    watchlistItemId: jspb.Message.getFieldWithDefault(msg, 1, ""),
    displayName: jspb.Message.getFieldWithDefault(msg, 2, ""),
    notes: jspb.Message.getFieldWithDefault(msg, 3, ""),
    tagsList: (f = jspb.Message.getRepeatedField(msg, 4)) == null ? undefined : f,
    sortOrder: jspb.Message.getFieldWithDefault(msg, 5, 0),
    targetBuyPrice: jspb.Message.getFloatingPointFieldWithDefault(msg, 6, 0.0),
    targetSellPrice: jspb.Message.getFloatingPointFieldWithDefault(msg, 7, 0.0),
    stopLossPrice: jspb.Message.getFloatingPointFieldWithDefault(msg, 8, 0.0),
    isActive: jspb.Message.getBooleanFieldWithDefault(msg, 9, false),
    enableAlerts: jspb.Message.getBooleanFieldWithDefault(msg, 10, false)
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
 * @return {!proto.marketdata.UpdateWatchlistItemRequest}
 */
proto.marketdata.UpdateWatchlistItemRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.marketdata.UpdateWatchlistItemRequest;
  return proto.marketdata.UpdateWatchlistItemRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.marketdata.UpdateWatchlistItemRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.marketdata.UpdateWatchlistItemRequest}
 */
proto.marketdata.UpdateWatchlistItemRequest.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setWatchlistItemId(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setDisplayName(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readString());
      msg.setNotes(value);
      break;
    case 4:
      var value = /** @type {string} */ (reader.readString());
      msg.addTags(value);
      break;
    case 5:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setSortOrder(value);
      break;
    case 6:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setTargetBuyPrice(value);
      break;
    case 7:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setTargetSellPrice(value);
      break;
    case 8:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setStopLossPrice(value);
      break;
    case 9:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setIsActive(value);
      break;
    case 10:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setEnableAlerts(value);
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
proto.marketdata.UpdateWatchlistItemRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.marketdata.UpdateWatchlistItemRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.marketdata.UpdateWatchlistItemRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.UpdateWatchlistItemRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getWatchlistItemId();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = /** @type {string} */ (jspb.Message.getField(message, 2));
  if (f != null) {
    writer.writeString(
      2,
      f
    );
  }
  f = /** @type {string} */ (jspb.Message.getField(message, 3));
  if (f != null) {
    writer.writeString(
      3,
      f
    );
  }
  f = message.getTagsList();
  if (f.length > 0) {
    writer.writeRepeatedString(
      4,
      f
    );
  }
  f = /** @type {number} */ (jspb.Message.getField(message, 5));
  if (f != null) {
    writer.writeInt32(
      5,
      f
    );
  }
  f = /** @type {number} */ (jspb.Message.getField(message, 6));
  if (f != null) {
    writer.writeDouble(
      6,
      f
    );
  }
  f = /** @type {number} */ (jspb.Message.getField(message, 7));
  if (f != null) {
    writer.writeDouble(
      7,
      f
    );
  }
  f = /** @type {number} */ (jspb.Message.getField(message, 8));
  if (f != null) {
    writer.writeDouble(
      8,
      f
    );
  }
  f = /** @type {boolean} */ (jspb.Message.getField(message, 9));
  if (f != null) {
    writer.writeBool(
      9,
      f
    );
  }
  f = /** @type {boolean} */ (jspb.Message.getField(message, 10));
  if (f != null) {
    writer.writeBool(
      10,
      f
    );
  }
};


/**
 * optional string watchlist_item_id = 1;
 * @return {string}
 */
proto.marketdata.UpdateWatchlistItemRequest.prototype.getWatchlistItemId = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.marketdata.UpdateWatchlistItemRequest} returns this
 */
proto.marketdata.UpdateWatchlistItemRequest.prototype.setWatchlistItemId = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional string display_name = 2;
 * @return {string}
 */
proto.marketdata.UpdateWatchlistItemRequest.prototype.getDisplayName = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.marketdata.UpdateWatchlistItemRequest} returns this
 */
proto.marketdata.UpdateWatchlistItemRequest.prototype.setDisplayName = function(value) {
  return jspb.Message.setField(this, 2, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.marketdata.UpdateWatchlistItemRequest} returns this
 */
proto.marketdata.UpdateWatchlistItemRequest.prototype.clearDisplayName = function() {
  return jspb.Message.setField(this, 2, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.marketdata.UpdateWatchlistItemRequest.prototype.hasDisplayName = function() {
  return jspb.Message.getField(this, 2) != null;
};


/**
 * optional string notes = 3;
 * @return {string}
 */
proto.marketdata.UpdateWatchlistItemRequest.prototype.getNotes = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/**
 * @param {string} value
 * @return {!proto.marketdata.UpdateWatchlistItemRequest} returns this
 */
proto.marketdata.UpdateWatchlistItemRequest.prototype.setNotes = function(value) {
  return jspb.Message.setField(this, 3, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.marketdata.UpdateWatchlistItemRequest} returns this
 */
proto.marketdata.UpdateWatchlistItemRequest.prototype.clearNotes = function() {
  return jspb.Message.setField(this, 3, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.marketdata.UpdateWatchlistItemRequest.prototype.hasNotes = function() {
  return jspb.Message.getField(this, 3) != null;
};


/**
 * repeated string tags = 4;
 * @return {!Array<string>}
 */
proto.marketdata.UpdateWatchlistItemRequest.prototype.getTagsList = function() {
  return /** @type {!Array<string>} */ (jspb.Message.getRepeatedField(this, 4));
};


/**
 * @param {!Array<string>} value
 * @return {!proto.marketdata.UpdateWatchlistItemRequest} returns this
 */
proto.marketdata.UpdateWatchlistItemRequest.prototype.setTagsList = function(value) {
  return jspb.Message.setField(this, 4, value || []);
};


/**
 * @param {string} value
 * @param {number=} opt_index
 * @return {!proto.marketdata.UpdateWatchlistItemRequest} returns this
 */
proto.marketdata.UpdateWatchlistItemRequest.prototype.addTags = function(value, opt_index) {
  return jspb.Message.addToRepeatedField(this, 4, value, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.marketdata.UpdateWatchlistItemRequest} returns this
 */
proto.marketdata.UpdateWatchlistItemRequest.prototype.clearTagsList = function() {
  return this.setTagsList([]);
};


/**
 * optional int32 sort_order = 5;
 * @return {number}
 */
proto.marketdata.UpdateWatchlistItemRequest.prototype.getSortOrder = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 5, 0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.UpdateWatchlistItemRequest} returns this
 */
proto.marketdata.UpdateWatchlistItemRequest.prototype.setSortOrder = function(value) {
  return jspb.Message.setField(this, 5, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.marketdata.UpdateWatchlistItemRequest} returns this
 */
proto.marketdata.UpdateWatchlistItemRequest.prototype.clearSortOrder = function() {
  return jspb.Message.setField(this, 5, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.marketdata.UpdateWatchlistItemRequest.prototype.hasSortOrder = function() {
  return jspb.Message.getField(this, 5) != null;
};


/**
 * optional double target_buy_price = 6;
 * @return {number}
 */
proto.marketdata.UpdateWatchlistItemRequest.prototype.getTargetBuyPrice = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 6, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.UpdateWatchlistItemRequest} returns this
 */
proto.marketdata.UpdateWatchlistItemRequest.prototype.setTargetBuyPrice = function(value) {
  return jspb.Message.setField(this, 6, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.marketdata.UpdateWatchlistItemRequest} returns this
 */
proto.marketdata.UpdateWatchlistItemRequest.prototype.clearTargetBuyPrice = function() {
  return jspb.Message.setField(this, 6, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.marketdata.UpdateWatchlistItemRequest.prototype.hasTargetBuyPrice = function() {
  return jspb.Message.getField(this, 6) != null;
};


/**
 * optional double target_sell_price = 7;
 * @return {number}
 */
proto.marketdata.UpdateWatchlistItemRequest.prototype.getTargetSellPrice = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 7, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.UpdateWatchlistItemRequest} returns this
 */
proto.marketdata.UpdateWatchlistItemRequest.prototype.setTargetSellPrice = function(value) {
  return jspb.Message.setField(this, 7, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.marketdata.UpdateWatchlistItemRequest} returns this
 */
proto.marketdata.UpdateWatchlistItemRequest.prototype.clearTargetSellPrice = function() {
  return jspb.Message.setField(this, 7, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.marketdata.UpdateWatchlistItemRequest.prototype.hasTargetSellPrice = function() {
  return jspb.Message.getField(this, 7) != null;
};


/**
 * optional double stop_loss_price = 8;
 * @return {number}
 */
proto.marketdata.UpdateWatchlistItemRequest.prototype.getStopLossPrice = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 8, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.UpdateWatchlistItemRequest} returns this
 */
proto.marketdata.UpdateWatchlistItemRequest.prototype.setStopLossPrice = function(value) {
  return jspb.Message.setField(this, 8, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.marketdata.UpdateWatchlistItemRequest} returns this
 */
proto.marketdata.UpdateWatchlistItemRequest.prototype.clearStopLossPrice = function() {
  return jspb.Message.setField(this, 8, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.marketdata.UpdateWatchlistItemRequest.prototype.hasStopLossPrice = function() {
  return jspb.Message.getField(this, 8) != null;
};


/**
 * optional bool is_active = 9;
 * @return {boolean}
 */
proto.marketdata.UpdateWatchlistItemRequest.prototype.getIsActive = function() {
  return /** @type {boolean} */ (jspb.Message.getBooleanFieldWithDefault(this, 9, false));
};


/**
 * @param {boolean} value
 * @return {!proto.marketdata.UpdateWatchlistItemRequest} returns this
 */
proto.marketdata.UpdateWatchlistItemRequest.prototype.setIsActive = function(value) {
  return jspb.Message.setField(this, 9, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.marketdata.UpdateWatchlistItemRequest} returns this
 */
proto.marketdata.UpdateWatchlistItemRequest.prototype.clearIsActive = function() {
  return jspb.Message.setField(this, 9, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.marketdata.UpdateWatchlistItemRequest.prototype.hasIsActive = function() {
  return jspb.Message.getField(this, 9) != null;
};


/**
 * optional bool enable_alerts = 10;
 * @return {boolean}
 */
proto.marketdata.UpdateWatchlistItemRequest.prototype.getEnableAlerts = function() {
  return /** @type {boolean} */ (jspb.Message.getBooleanFieldWithDefault(this, 10, false));
};


/**
 * @param {boolean} value
 * @return {!proto.marketdata.UpdateWatchlistItemRequest} returns this
 */
proto.marketdata.UpdateWatchlistItemRequest.prototype.setEnableAlerts = function(value) {
  return jspb.Message.setField(this, 10, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.marketdata.UpdateWatchlistItemRequest} returns this
 */
proto.marketdata.UpdateWatchlistItemRequest.prototype.clearEnableAlerts = function() {
  return jspb.Message.setField(this, 10, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.marketdata.UpdateWatchlistItemRequest.prototype.hasEnableAlerts = function() {
  return jspb.Message.getField(this, 10) != null;
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
proto.marketdata.GetWatchlistStatisticsRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.marketdata.GetWatchlistStatisticsRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.marketdata.GetWatchlistStatisticsRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.GetWatchlistStatisticsRequest.toObject = function(includeInstance, msg) {
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
 * @return {!proto.marketdata.GetWatchlistStatisticsRequest}
 */
proto.marketdata.GetWatchlistStatisticsRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.marketdata.GetWatchlistStatisticsRequest;
  return proto.marketdata.GetWatchlistStatisticsRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.marketdata.GetWatchlistStatisticsRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.marketdata.GetWatchlistStatisticsRequest}
 */
proto.marketdata.GetWatchlistStatisticsRequest.deserializeBinaryFromReader = function(msg, reader) {
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
proto.marketdata.GetWatchlistStatisticsRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.marketdata.GetWatchlistStatisticsRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.marketdata.GetWatchlistStatisticsRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.GetWatchlistStatisticsRequest.serializeBinaryToWriter = function(message, writer) {
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
proto.marketdata.GetWatchlistStatisticsRequest.prototype.getUserId = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.marketdata.GetWatchlistStatisticsRequest} returns this
 */
proto.marketdata.GetWatchlistStatisticsRequest.prototype.setUserId = function(value) {
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
proto.marketdata.SearchSymbolsRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.marketdata.SearchSymbolsRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.marketdata.SearchSymbolsRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.SearchSymbolsRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    query: jspb.Message.getFieldWithDefault(msg, 1, "")
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
 * @return {!proto.marketdata.SearchSymbolsRequest}
 */
proto.marketdata.SearchSymbolsRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.marketdata.SearchSymbolsRequest;
  return proto.marketdata.SearchSymbolsRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.marketdata.SearchSymbolsRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.marketdata.SearchSymbolsRequest}
 */
proto.marketdata.SearchSymbolsRequest.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setQuery(value);
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
proto.marketdata.SearchSymbolsRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.marketdata.SearchSymbolsRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.marketdata.SearchSymbolsRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.SearchSymbolsRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getQuery();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
};


/**
 * optional string query = 1;
 * @return {string}
 */
proto.marketdata.SearchSymbolsRequest.prototype.getQuery = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.marketdata.SearchSymbolsRequest} returns this
 */
proto.marketdata.SearchSymbolsRequest.prototype.setQuery = function(value) {
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
proto.marketdata.MarketDataResponse.prototype.toObject = function(opt_includeInstance) {
  return proto.marketdata.MarketDataResponse.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.marketdata.MarketDataResponse} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.MarketDataResponse.toObject = function(includeInstance, msg) {
  var f, obj = {
    data: (f = msg.getData()) && proto.marketdata.MarketDataPoint.toObject(includeInstance, f)
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
 * @return {!proto.marketdata.MarketDataResponse}
 */
proto.marketdata.MarketDataResponse.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.marketdata.MarketDataResponse;
  return proto.marketdata.MarketDataResponse.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.marketdata.MarketDataResponse} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.marketdata.MarketDataResponse}
 */
proto.marketdata.MarketDataResponse.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.marketdata.MarketDataPoint;
      reader.readMessage(value,proto.marketdata.MarketDataPoint.deserializeBinaryFromReader);
      msg.setData(value);
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
proto.marketdata.MarketDataResponse.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.marketdata.MarketDataResponse.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.marketdata.MarketDataResponse} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.MarketDataResponse.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getData();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.marketdata.MarketDataPoint.serializeBinaryToWriter
    );
  }
};


/**
 * optional MarketDataPoint data = 1;
 * @return {?proto.marketdata.MarketDataPoint}
 */
proto.marketdata.MarketDataResponse.prototype.getData = function() {
  return /** @type{?proto.marketdata.MarketDataPoint} */ (
    jspb.Message.getWrapperField(this, proto.marketdata.MarketDataPoint, 1));
};


/**
 * @param {?proto.marketdata.MarketDataPoint|undefined} value
 * @return {!proto.marketdata.MarketDataResponse} returns this
*/
proto.marketdata.MarketDataResponse.prototype.setData = function(value) {
  return jspb.Message.setWrapperField(this, 1, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.marketdata.MarketDataResponse} returns this
 */
proto.marketdata.MarketDataResponse.prototype.clearData = function() {
  return this.setData(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.marketdata.MarketDataResponse.prototype.hasData = function() {
  return jspb.Message.getField(this, 1) != null;
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.marketdata.BatchMarketDataResponse.repeatedFields_ = [1];



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
proto.marketdata.BatchMarketDataResponse.prototype.toObject = function(opt_includeInstance) {
  return proto.marketdata.BatchMarketDataResponse.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.marketdata.BatchMarketDataResponse} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.BatchMarketDataResponse.toObject = function(includeInstance, msg) {
  var f, obj = {
    dataList: jspb.Message.toObjectList(msg.getDataList(),
    proto.marketdata.MarketDataPoint.toObject, includeInstance)
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
 * @return {!proto.marketdata.BatchMarketDataResponse}
 */
proto.marketdata.BatchMarketDataResponse.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.marketdata.BatchMarketDataResponse;
  return proto.marketdata.BatchMarketDataResponse.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.marketdata.BatchMarketDataResponse} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.marketdata.BatchMarketDataResponse}
 */
proto.marketdata.BatchMarketDataResponse.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.marketdata.MarketDataPoint;
      reader.readMessage(value,proto.marketdata.MarketDataPoint.deserializeBinaryFromReader);
      msg.addData(value);
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
proto.marketdata.BatchMarketDataResponse.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.marketdata.BatchMarketDataResponse.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.marketdata.BatchMarketDataResponse} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.BatchMarketDataResponse.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getDataList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      1,
      f,
      proto.marketdata.MarketDataPoint.serializeBinaryToWriter
    );
  }
};


/**
 * repeated MarketDataPoint data = 1;
 * @return {!Array<!proto.marketdata.MarketDataPoint>}
 */
proto.marketdata.BatchMarketDataResponse.prototype.getDataList = function() {
  return /** @type{!Array<!proto.marketdata.MarketDataPoint>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.marketdata.MarketDataPoint, 1));
};


/**
 * @param {!Array<!proto.marketdata.MarketDataPoint>} value
 * @return {!proto.marketdata.BatchMarketDataResponse} returns this
*/
proto.marketdata.BatchMarketDataResponse.prototype.setDataList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 1, value);
};


/**
 * @param {!proto.marketdata.MarketDataPoint=} opt_value
 * @param {number=} opt_index
 * @return {!proto.marketdata.MarketDataPoint}
 */
proto.marketdata.BatchMarketDataResponse.prototype.addData = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 1, opt_value, proto.marketdata.MarketDataPoint, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.marketdata.BatchMarketDataResponse} returns this
 */
proto.marketdata.BatchMarketDataResponse.prototype.clearDataList = function() {
  return this.setDataList([]);
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.marketdata.HistoricalDataResponse.repeatedFields_ = [1];



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
proto.marketdata.HistoricalDataResponse.prototype.toObject = function(opt_includeInstance) {
  return proto.marketdata.HistoricalDataResponse.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.marketdata.HistoricalDataResponse} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.HistoricalDataResponse.toObject = function(includeInstance, msg) {
  var f, obj = {
    dataList: jspb.Message.toObjectList(msg.getDataList(),
    proto.marketdata.HistoricalDataPoint.toObject, includeInstance)
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
 * @return {!proto.marketdata.HistoricalDataResponse}
 */
proto.marketdata.HistoricalDataResponse.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.marketdata.HistoricalDataResponse;
  return proto.marketdata.HistoricalDataResponse.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.marketdata.HistoricalDataResponse} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.marketdata.HistoricalDataResponse}
 */
proto.marketdata.HistoricalDataResponse.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.marketdata.HistoricalDataPoint;
      reader.readMessage(value,proto.marketdata.HistoricalDataPoint.deserializeBinaryFromReader);
      msg.addData(value);
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
proto.marketdata.HistoricalDataResponse.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.marketdata.HistoricalDataResponse.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.marketdata.HistoricalDataResponse} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.HistoricalDataResponse.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getDataList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      1,
      f,
      proto.marketdata.HistoricalDataPoint.serializeBinaryToWriter
    );
  }
};


/**
 * repeated HistoricalDataPoint data = 1;
 * @return {!Array<!proto.marketdata.HistoricalDataPoint>}
 */
proto.marketdata.HistoricalDataResponse.prototype.getDataList = function() {
  return /** @type{!Array<!proto.marketdata.HistoricalDataPoint>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.marketdata.HistoricalDataPoint, 1));
};


/**
 * @param {!Array<!proto.marketdata.HistoricalDataPoint>} value
 * @return {!proto.marketdata.HistoricalDataResponse} returns this
*/
proto.marketdata.HistoricalDataResponse.prototype.setDataList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 1, value);
};


/**
 * @param {!proto.marketdata.HistoricalDataPoint=} opt_value
 * @param {number=} opt_index
 * @return {!proto.marketdata.HistoricalDataPoint}
 */
proto.marketdata.HistoricalDataResponse.prototype.addData = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 1, opt_value, proto.marketdata.HistoricalDataPoint, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.marketdata.HistoricalDataResponse} returns this
 */
proto.marketdata.HistoricalDataResponse.prototype.clearDataList = function() {
  return this.setDataList([]);
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.marketdata.OHLCDataResponse.repeatedFields_ = [1];



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
proto.marketdata.OHLCDataResponse.prototype.toObject = function(opt_includeInstance) {
  return proto.marketdata.OHLCDataResponse.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.marketdata.OHLCDataResponse} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.OHLCDataResponse.toObject = function(includeInstance, msg) {
  var f, obj = {
    dataList: jspb.Message.toObjectList(msg.getDataList(),
    proto.marketdata.HistoricalDataPoint.toObject, includeInstance)
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
 * @return {!proto.marketdata.OHLCDataResponse}
 */
proto.marketdata.OHLCDataResponse.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.marketdata.OHLCDataResponse;
  return proto.marketdata.OHLCDataResponse.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.marketdata.OHLCDataResponse} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.marketdata.OHLCDataResponse}
 */
proto.marketdata.OHLCDataResponse.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.marketdata.HistoricalDataPoint;
      reader.readMessage(value,proto.marketdata.HistoricalDataPoint.deserializeBinaryFromReader);
      msg.addData(value);
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
proto.marketdata.OHLCDataResponse.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.marketdata.OHLCDataResponse.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.marketdata.OHLCDataResponse} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.OHLCDataResponse.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getDataList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      1,
      f,
      proto.marketdata.HistoricalDataPoint.serializeBinaryToWriter
    );
  }
};


/**
 * repeated HistoricalDataPoint data = 1;
 * @return {!Array<!proto.marketdata.HistoricalDataPoint>}
 */
proto.marketdata.OHLCDataResponse.prototype.getDataList = function() {
  return /** @type{!Array<!proto.marketdata.HistoricalDataPoint>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.marketdata.HistoricalDataPoint, 1));
};


/**
 * @param {!Array<!proto.marketdata.HistoricalDataPoint>} value
 * @return {!proto.marketdata.OHLCDataResponse} returns this
*/
proto.marketdata.OHLCDataResponse.prototype.setDataList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 1, value);
};


/**
 * @param {!proto.marketdata.HistoricalDataPoint=} opt_value
 * @param {number=} opt_index
 * @return {!proto.marketdata.HistoricalDataPoint}
 */
proto.marketdata.OHLCDataResponse.prototype.addData = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 1, opt_value, proto.marketdata.HistoricalDataPoint, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.marketdata.OHLCDataResponse} returns this
 */
proto.marketdata.OHLCDataResponse.prototype.clearDataList = function() {
  return this.setDataList([]);
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.marketdata.VolumeProfileResponse.repeatedFields_ = [1];



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
proto.marketdata.VolumeProfileResponse.prototype.toObject = function(opt_includeInstance) {
  return proto.marketdata.VolumeProfileResponse.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.marketdata.VolumeProfileResponse} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.VolumeProfileResponse.toObject = function(includeInstance, msg) {
  var f, obj = {
    levelsList: jspb.Message.toObjectList(msg.getLevelsList(),
    proto.marketdata.VolumeProfileLevel.toObject, includeInstance)
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
 * @return {!proto.marketdata.VolumeProfileResponse}
 */
proto.marketdata.VolumeProfileResponse.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.marketdata.VolumeProfileResponse;
  return proto.marketdata.VolumeProfileResponse.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.marketdata.VolumeProfileResponse} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.marketdata.VolumeProfileResponse}
 */
proto.marketdata.VolumeProfileResponse.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.marketdata.VolumeProfileLevel;
      reader.readMessage(value,proto.marketdata.VolumeProfileLevel.deserializeBinaryFromReader);
      msg.addLevels(value);
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
proto.marketdata.VolumeProfileResponse.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.marketdata.VolumeProfileResponse.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.marketdata.VolumeProfileResponse} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.VolumeProfileResponse.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getLevelsList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      1,
      f,
      proto.marketdata.VolumeProfileLevel.serializeBinaryToWriter
    );
  }
};


/**
 * repeated VolumeProfileLevel levels = 1;
 * @return {!Array<!proto.marketdata.VolumeProfileLevel>}
 */
proto.marketdata.VolumeProfileResponse.prototype.getLevelsList = function() {
  return /** @type{!Array<!proto.marketdata.VolumeProfileLevel>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.marketdata.VolumeProfileLevel, 1));
};


/**
 * @param {!Array<!proto.marketdata.VolumeProfileLevel>} value
 * @return {!proto.marketdata.VolumeProfileResponse} returns this
*/
proto.marketdata.VolumeProfileResponse.prototype.setLevelsList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 1, value);
};


/**
 * @param {!proto.marketdata.VolumeProfileLevel=} opt_value
 * @param {number=} opt_index
 * @return {!proto.marketdata.VolumeProfileLevel}
 */
proto.marketdata.VolumeProfileResponse.prototype.addLevels = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 1, opt_value, proto.marketdata.VolumeProfileLevel, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.marketdata.VolumeProfileResponse} returns this
 */
proto.marketdata.VolumeProfileResponse.prototype.clearLevelsList = function() {
  return this.setLevelsList([]);
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
proto.marketdata.RSIResponse.prototype.toObject = function(opt_includeInstance) {
  return proto.marketdata.RSIResponse.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.marketdata.RSIResponse} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.RSIResponse.toObject = function(includeInstance, msg) {
  var f, obj = {
    data: (f = msg.getData()) && proto.marketdata.RSI.toObject(includeInstance, f)
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
 * @return {!proto.marketdata.RSIResponse}
 */
proto.marketdata.RSIResponse.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.marketdata.RSIResponse;
  return proto.marketdata.RSIResponse.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.marketdata.RSIResponse} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.marketdata.RSIResponse}
 */
proto.marketdata.RSIResponse.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.marketdata.RSI;
      reader.readMessage(value,proto.marketdata.RSI.deserializeBinaryFromReader);
      msg.setData(value);
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
proto.marketdata.RSIResponse.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.marketdata.RSIResponse.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.marketdata.RSIResponse} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.RSIResponse.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getData();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.marketdata.RSI.serializeBinaryToWriter
    );
  }
};


/**
 * optional RSI data = 1;
 * @return {?proto.marketdata.RSI}
 */
proto.marketdata.RSIResponse.prototype.getData = function() {
  return /** @type{?proto.marketdata.RSI} */ (
    jspb.Message.getWrapperField(this, proto.marketdata.RSI, 1));
};


/**
 * @param {?proto.marketdata.RSI|undefined} value
 * @return {!proto.marketdata.RSIResponse} returns this
*/
proto.marketdata.RSIResponse.prototype.setData = function(value) {
  return jspb.Message.setWrapperField(this, 1, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.marketdata.RSIResponse} returns this
 */
proto.marketdata.RSIResponse.prototype.clearData = function() {
  return this.setData(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.marketdata.RSIResponse.prototype.hasData = function() {
  return jspb.Message.getField(this, 1) != null;
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
proto.marketdata.MACDResponse.prototype.toObject = function(opt_includeInstance) {
  return proto.marketdata.MACDResponse.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.marketdata.MACDResponse} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.MACDResponse.toObject = function(includeInstance, msg) {
  var f, obj = {
    data: (f = msg.getData()) && proto.marketdata.MACD.toObject(includeInstance, f)
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
 * @return {!proto.marketdata.MACDResponse}
 */
proto.marketdata.MACDResponse.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.marketdata.MACDResponse;
  return proto.marketdata.MACDResponse.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.marketdata.MACDResponse} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.marketdata.MACDResponse}
 */
proto.marketdata.MACDResponse.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.marketdata.MACD;
      reader.readMessage(value,proto.marketdata.MACD.deserializeBinaryFromReader);
      msg.setData(value);
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
proto.marketdata.MACDResponse.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.marketdata.MACDResponse.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.marketdata.MACDResponse} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.MACDResponse.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getData();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.marketdata.MACD.serializeBinaryToWriter
    );
  }
};


/**
 * optional MACD data = 1;
 * @return {?proto.marketdata.MACD}
 */
proto.marketdata.MACDResponse.prototype.getData = function() {
  return /** @type{?proto.marketdata.MACD} */ (
    jspb.Message.getWrapperField(this, proto.marketdata.MACD, 1));
};


/**
 * @param {?proto.marketdata.MACD|undefined} value
 * @return {!proto.marketdata.MACDResponse} returns this
*/
proto.marketdata.MACDResponse.prototype.setData = function(value) {
  return jspb.Message.setWrapperField(this, 1, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.marketdata.MACDResponse} returns this
 */
proto.marketdata.MACDResponse.prototype.clearData = function() {
  return this.setData(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.marketdata.MACDResponse.prototype.hasData = function() {
  return jspb.Message.getField(this, 1) != null;
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
proto.marketdata.BollingerBandsResponse.prototype.toObject = function(opt_includeInstance) {
  return proto.marketdata.BollingerBandsResponse.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.marketdata.BollingerBandsResponse} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.BollingerBandsResponse.toObject = function(includeInstance, msg) {
  var f, obj = {
    data: (f = msg.getData()) && proto.marketdata.BollingerBands.toObject(includeInstance, f)
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
 * @return {!proto.marketdata.BollingerBandsResponse}
 */
proto.marketdata.BollingerBandsResponse.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.marketdata.BollingerBandsResponse;
  return proto.marketdata.BollingerBandsResponse.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.marketdata.BollingerBandsResponse} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.marketdata.BollingerBandsResponse}
 */
proto.marketdata.BollingerBandsResponse.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.marketdata.BollingerBands;
      reader.readMessage(value,proto.marketdata.BollingerBands.deserializeBinaryFromReader);
      msg.setData(value);
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
proto.marketdata.BollingerBandsResponse.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.marketdata.BollingerBandsResponse.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.marketdata.BollingerBandsResponse} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.BollingerBandsResponse.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getData();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.marketdata.BollingerBands.serializeBinaryToWriter
    );
  }
};


/**
 * optional BollingerBands data = 1;
 * @return {?proto.marketdata.BollingerBands}
 */
proto.marketdata.BollingerBandsResponse.prototype.getData = function() {
  return /** @type{?proto.marketdata.BollingerBands} */ (
    jspb.Message.getWrapperField(this, proto.marketdata.BollingerBands, 1));
};


/**
 * @param {?proto.marketdata.BollingerBands|undefined} value
 * @return {!proto.marketdata.BollingerBandsResponse} returns this
*/
proto.marketdata.BollingerBandsResponse.prototype.setData = function(value) {
  return jspb.Message.setWrapperField(this, 1, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.marketdata.BollingerBandsResponse} returns this
 */
proto.marketdata.BollingerBandsResponse.prototype.clearData = function() {
  return this.setData(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.marketdata.BollingerBandsResponse.prototype.hasData = function() {
  return jspb.Message.getField(this, 1) != null;
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
proto.marketdata.MovingAverageResponse.prototype.toObject = function(opt_includeInstance) {
  return proto.marketdata.MovingAverageResponse.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.marketdata.MovingAverageResponse} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.MovingAverageResponse.toObject = function(includeInstance, msg) {
  var f, obj = {
    data: (f = msg.getData()) && proto.marketdata.MovingAverage.toObject(includeInstance, f)
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
 * @return {!proto.marketdata.MovingAverageResponse}
 */
proto.marketdata.MovingAverageResponse.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.marketdata.MovingAverageResponse;
  return proto.marketdata.MovingAverageResponse.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.marketdata.MovingAverageResponse} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.marketdata.MovingAverageResponse}
 */
proto.marketdata.MovingAverageResponse.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.marketdata.MovingAverage;
      reader.readMessage(value,proto.marketdata.MovingAverage.deserializeBinaryFromReader);
      msg.setData(value);
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
proto.marketdata.MovingAverageResponse.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.marketdata.MovingAverageResponse.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.marketdata.MovingAverageResponse} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.MovingAverageResponse.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getData();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.marketdata.MovingAverage.serializeBinaryToWriter
    );
  }
};


/**
 * optional MovingAverage data = 1;
 * @return {?proto.marketdata.MovingAverage}
 */
proto.marketdata.MovingAverageResponse.prototype.getData = function() {
  return /** @type{?proto.marketdata.MovingAverage} */ (
    jspb.Message.getWrapperField(this, proto.marketdata.MovingAverage, 1));
};


/**
 * @param {?proto.marketdata.MovingAverage|undefined} value
 * @return {!proto.marketdata.MovingAverageResponse} returns this
*/
proto.marketdata.MovingAverageResponse.prototype.setData = function(value) {
  return jspb.Message.setWrapperField(this, 1, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.marketdata.MovingAverageResponse} returns this
 */
proto.marketdata.MovingAverageResponse.prototype.clearData = function() {
  return this.setData(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.marketdata.MovingAverageResponse.prototype.hasData = function() {
  return jspb.Message.getField(this, 1) != null;
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
proto.marketdata.StochasticResponse.prototype.toObject = function(opt_includeInstance) {
  return proto.marketdata.StochasticResponse.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.marketdata.StochasticResponse} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.StochasticResponse.toObject = function(includeInstance, msg) {
  var f, obj = {
    data: (f = msg.getData()) && proto.marketdata.Stochastic.toObject(includeInstance, f)
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
 * @return {!proto.marketdata.StochasticResponse}
 */
proto.marketdata.StochasticResponse.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.marketdata.StochasticResponse;
  return proto.marketdata.StochasticResponse.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.marketdata.StochasticResponse} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.marketdata.StochasticResponse}
 */
proto.marketdata.StochasticResponse.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.marketdata.Stochastic;
      reader.readMessage(value,proto.marketdata.Stochastic.deserializeBinaryFromReader);
      msg.setData(value);
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
proto.marketdata.StochasticResponse.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.marketdata.StochasticResponse.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.marketdata.StochasticResponse} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.StochasticResponse.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getData();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.marketdata.Stochastic.serializeBinaryToWriter
    );
  }
};


/**
 * optional Stochastic data = 1;
 * @return {?proto.marketdata.Stochastic}
 */
proto.marketdata.StochasticResponse.prototype.getData = function() {
  return /** @type{?proto.marketdata.Stochastic} */ (
    jspb.Message.getWrapperField(this, proto.marketdata.Stochastic, 1));
};


/**
 * @param {?proto.marketdata.Stochastic|undefined} value
 * @return {!proto.marketdata.StochasticResponse} returns this
*/
proto.marketdata.StochasticResponse.prototype.setData = function(value) {
  return jspb.Message.setWrapperField(this, 1, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.marketdata.StochasticResponse} returns this
 */
proto.marketdata.StochasticResponse.prototype.clearData = function() {
  return this.setData(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.marketdata.StochasticResponse.prototype.hasData = function() {
  return jspb.Message.getField(this, 1) != null;
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
proto.marketdata.VolumeIndicatorsResponse.prototype.toObject = function(opt_includeInstance) {
  return proto.marketdata.VolumeIndicatorsResponse.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.marketdata.VolumeIndicatorsResponse} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.VolumeIndicatorsResponse.toObject = function(includeInstance, msg) {
  var f, obj = {
    data: (f = msg.getData()) && proto.marketdata.VolumeIndicators.toObject(includeInstance, f)
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
 * @return {!proto.marketdata.VolumeIndicatorsResponse}
 */
proto.marketdata.VolumeIndicatorsResponse.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.marketdata.VolumeIndicatorsResponse;
  return proto.marketdata.VolumeIndicatorsResponse.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.marketdata.VolumeIndicatorsResponse} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.marketdata.VolumeIndicatorsResponse}
 */
proto.marketdata.VolumeIndicatorsResponse.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.marketdata.VolumeIndicators;
      reader.readMessage(value,proto.marketdata.VolumeIndicators.deserializeBinaryFromReader);
      msg.setData(value);
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
proto.marketdata.VolumeIndicatorsResponse.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.marketdata.VolumeIndicatorsResponse.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.marketdata.VolumeIndicatorsResponse} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.VolumeIndicatorsResponse.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getData();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.marketdata.VolumeIndicators.serializeBinaryToWriter
    );
  }
};


/**
 * optional VolumeIndicators data = 1;
 * @return {?proto.marketdata.VolumeIndicators}
 */
proto.marketdata.VolumeIndicatorsResponse.prototype.getData = function() {
  return /** @type{?proto.marketdata.VolumeIndicators} */ (
    jspb.Message.getWrapperField(this, proto.marketdata.VolumeIndicators, 1));
};


/**
 * @param {?proto.marketdata.VolumeIndicators|undefined} value
 * @return {!proto.marketdata.VolumeIndicatorsResponse} returns this
*/
proto.marketdata.VolumeIndicatorsResponse.prototype.setData = function(value) {
  return jspb.Message.setWrapperField(this, 1, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.marketdata.VolumeIndicatorsResponse} returns this
 */
proto.marketdata.VolumeIndicatorsResponse.prototype.clearData = function() {
  return this.setData(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.marketdata.VolumeIndicatorsResponse.prototype.hasData = function() {
  return jspb.Message.getField(this, 1) != null;
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
proto.marketdata.ComprehensiveAnalysisResponse.prototype.toObject = function(opt_includeInstance) {
  return proto.marketdata.ComprehensiveAnalysisResponse.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.marketdata.ComprehensiveAnalysisResponse} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.ComprehensiveAnalysisResponse.toObject = function(includeInstance, msg) {
  var f, obj = {
    data: (f = msg.getData()) && proto.marketdata.ComprehensiveAnalysis.toObject(includeInstance, f)
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
 * @return {!proto.marketdata.ComprehensiveAnalysisResponse}
 */
proto.marketdata.ComprehensiveAnalysisResponse.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.marketdata.ComprehensiveAnalysisResponse;
  return proto.marketdata.ComprehensiveAnalysisResponse.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.marketdata.ComprehensiveAnalysisResponse} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.marketdata.ComprehensiveAnalysisResponse}
 */
proto.marketdata.ComprehensiveAnalysisResponse.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.marketdata.ComprehensiveAnalysis;
      reader.readMessage(value,proto.marketdata.ComprehensiveAnalysis.deserializeBinaryFromReader);
      msg.setData(value);
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
proto.marketdata.ComprehensiveAnalysisResponse.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.marketdata.ComprehensiveAnalysisResponse.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.marketdata.ComprehensiveAnalysisResponse} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.ComprehensiveAnalysisResponse.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getData();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.marketdata.ComprehensiveAnalysis.serializeBinaryToWriter
    );
  }
};


/**
 * optional ComprehensiveAnalysis data = 1;
 * @return {?proto.marketdata.ComprehensiveAnalysis}
 */
proto.marketdata.ComprehensiveAnalysisResponse.prototype.getData = function() {
  return /** @type{?proto.marketdata.ComprehensiveAnalysis} */ (
    jspb.Message.getWrapperField(this, proto.marketdata.ComprehensiveAnalysis, 1));
};


/**
 * @param {?proto.marketdata.ComprehensiveAnalysis|undefined} value
 * @return {!proto.marketdata.ComprehensiveAnalysisResponse} returns this
*/
proto.marketdata.ComprehensiveAnalysisResponse.prototype.setData = function(value) {
  return jspb.Message.setWrapperField(this, 1, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.marketdata.ComprehensiveAnalysisResponse} returns this
 */
proto.marketdata.ComprehensiveAnalysisResponse.prototype.clearData = function() {
  return this.setData(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.marketdata.ComprehensiveAnalysisResponse.prototype.hasData = function() {
  return jspb.Message.getField(this, 1) != null;
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
proto.marketdata.AlertResponse.prototype.toObject = function(opt_includeInstance) {
  return proto.marketdata.AlertResponse.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.marketdata.AlertResponse} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.AlertResponse.toObject = function(includeInstance, msg) {
  var f, obj = {
    alert: (f = msg.getAlert()) && proto.marketdata.Alert.toObject(includeInstance, f)
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
 * @return {!proto.marketdata.AlertResponse}
 */
proto.marketdata.AlertResponse.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.marketdata.AlertResponse;
  return proto.marketdata.AlertResponse.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.marketdata.AlertResponse} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.marketdata.AlertResponse}
 */
proto.marketdata.AlertResponse.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.marketdata.Alert;
      reader.readMessage(value,proto.marketdata.Alert.deserializeBinaryFromReader);
      msg.setAlert(value);
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
proto.marketdata.AlertResponse.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.marketdata.AlertResponse.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.marketdata.AlertResponse} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.AlertResponse.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getAlert();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.marketdata.Alert.serializeBinaryToWriter
    );
  }
};


/**
 * optional Alert alert = 1;
 * @return {?proto.marketdata.Alert}
 */
proto.marketdata.AlertResponse.prototype.getAlert = function() {
  return /** @type{?proto.marketdata.Alert} */ (
    jspb.Message.getWrapperField(this, proto.marketdata.Alert, 1));
};


/**
 * @param {?proto.marketdata.Alert|undefined} value
 * @return {!proto.marketdata.AlertResponse} returns this
*/
proto.marketdata.AlertResponse.prototype.setAlert = function(value) {
  return jspb.Message.setWrapperField(this, 1, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.marketdata.AlertResponse} returns this
 */
proto.marketdata.AlertResponse.prototype.clearAlert = function() {
  return this.setAlert(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.marketdata.AlertResponse.prototype.hasAlert = function() {
  return jspb.Message.getField(this, 1) != null;
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.marketdata.UserAlertsResponse.repeatedFields_ = [1];



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
proto.marketdata.UserAlertsResponse.prototype.toObject = function(opt_includeInstance) {
  return proto.marketdata.UserAlertsResponse.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.marketdata.UserAlertsResponse} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.UserAlertsResponse.toObject = function(includeInstance, msg) {
  var f, obj = {
    alertsList: jspb.Message.toObjectList(msg.getAlertsList(),
    proto.marketdata.Alert.toObject, includeInstance)
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
 * @return {!proto.marketdata.UserAlertsResponse}
 */
proto.marketdata.UserAlertsResponse.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.marketdata.UserAlertsResponse;
  return proto.marketdata.UserAlertsResponse.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.marketdata.UserAlertsResponse} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.marketdata.UserAlertsResponse}
 */
proto.marketdata.UserAlertsResponse.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.marketdata.Alert;
      reader.readMessage(value,proto.marketdata.Alert.deserializeBinaryFromReader);
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
proto.marketdata.UserAlertsResponse.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.marketdata.UserAlertsResponse.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.marketdata.UserAlertsResponse} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.UserAlertsResponse.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getAlertsList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      1,
      f,
      proto.marketdata.Alert.serializeBinaryToWriter
    );
  }
};


/**
 * repeated Alert alerts = 1;
 * @return {!Array<!proto.marketdata.Alert>}
 */
proto.marketdata.UserAlertsResponse.prototype.getAlertsList = function() {
  return /** @type{!Array<!proto.marketdata.Alert>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.marketdata.Alert, 1));
};


/**
 * @param {!Array<!proto.marketdata.Alert>} value
 * @return {!proto.marketdata.UserAlertsResponse} returns this
*/
proto.marketdata.UserAlertsResponse.prototype.setAlertsList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 1, value);
};


/**
 * @param {!proto.marketdata.Alert=} opt_value
 * @param {number=} opt_index
 * @return {!proto.marketdata.Alert}
 */
proto.marketdata.UserAlertsResponse.prototype.addAlerts = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 1, opt_value, proto.marketdata.Alert, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.marketdata.UserAlertsResponse} returns this
 */
proto.marketdata.UserAlertsResponse.prototype.clearAlertsList = function() {
  return this.setAlertsList([]);
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.marketdata.AlertStatisticsResponse.repeatedFields_ = [5,6];



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
proto.marketdata.AlertStatisticsResponse.prototype.toObject = function(opt_includeInstance) {
  return proto.marketdata.AlertStatisticsResponse.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.marketdata.AlertStatisticsResponse} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.AlertStatisticsResponse.toObject = function(includeInstance, msg) {
  var f, obj = {
    total: jspb.Message.getFieldWithDefault(msg, 1, 0),
    active: jspb.Message.getFieldWithDefault(msg, 2, 0),
    triggered: jspb.Message.getFieldWithDefault(msg, 3, 0),
    expired: jspb.Message.getFieldWithDefault(msg, 4, 0),
    bySymbolList: jspb.Message.toObjectList(msg.getBySymbolList(),
    proto.marketdata.SymbolCount.toObject, includeInstance),
    byTypeList: jspb.Message.toObjectList(msg.getByTypeList(),
    proto.marketdata.TypeCount.toObject, includeInstance)
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
 * @return {!proto.marketdata.AlertStatisticsResponse}
 */
proto.marketdata.AlertStatisticsResponse.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.marketdata.AlertStatisticsResponse;
  return proto.marketdata.AlertStatisticsResponse.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.marketdata.AlertStatisticsResponse} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.marketdata.AlertStatisticsResponse}
 */
proto.marketdata.AlertStatisticsResponse.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setTotal(value);
      break;
    case 2:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setActive(value);
      break;
    case 3:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setTriggered(value);
      break;
    case 4:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setExpired(value);
      break;
    case 5:
      var value = new proto.marketdata.SymbolCount;
      reader.readMessage(value,proto.marketdata.SymbolCount.deserializeBinaryFromReader);
      msg.addBySymbol(value);
      break;
    case 6:
      var value = new proto.marketdata.TypeCount;
      reader.readMessage(value,proto.marketdata.TypeCount.deserializeBinaryFromReader);
      msg.addByType(value);
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
proto.marketdata.AlertStatisticsResponse.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.marketdata.AlertStatisticsResponse.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.marketdata.AlertStatisticsResponse} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.AlertStatisticsResponse.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getTotal();
  if (f !== 0) {
    writer.writeInt32(
      1,
      f
    );
  }
  f = message.getActive();
  if (f !== 0) {
    writer.writeInt32(
      2,
      f
    );
  }
  f = message.getTriggered();
  if (f !== 0) {
    writer.writeInt32(
      3,
      f
    );
  }
  f = message.getExpired();
  if (f !== 0) {
    writer.writeInt32(
      4,
      f
    );
  }
  f = message.getBySymbolList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      5,
      f,
      proto.marketdata.SymbolCount.serializeBinaryToWriter
    );
  }
  f = message.getByTypeList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      6,
      f,
      proto.marketdata.TypeCount.serializeBinaryToWriter
    );
  }
};


/**
 * optional int32 total = 1;
 * @return {number}
 */
proto.marketdata.AlertStatisticsResponse.prototype.getTotal = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 1, 0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.AlertStatisticsResponse} returns this
 */
proto.marketdata.AlertStatisticsResponse.prototype.setTotal = function(value) {
  return jspb.Message.setProto3IntField(this, 1, value);
};


/**
 * optional int32 active = 2;
 * @return {number}
 */
proto.marketdata.AlertStatisticsResponse.prototype.getActive = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.AlertStatisticsResponse} returns this
 */
proto.marketdata.AlertStatisticsResponse.prototype.setActive = function(value) {
  return jspb.Message.setProto3IntField(this, 2, value);
};


/**
 * optional int32 triggered = 3;
 * @return {number}
 */
proto.marketdata.AlertStatisticsResponse.prototype.getTriggered = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 3, 0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.AlertStatisticsResponse} returns this
 */
proto.marketdata.AlertStatisticsResponse.prototype.setTriggered = function(value) {
  return jspb.Message.setProto3IntField(this, 3, value);
};


/**
 * optional int32 expired = 4;
 * @return {number}
 */
proto.marketdata.AlertStatisticsResponse.prototype.getExpired = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 4, 0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.AlertStatisticsResponse} returns this
 */
proto.marketdata.AlertStatisticsResponse.prototype.setExpired = function(value) {
  return jspb.Message.setProto3IntField(this, 4, value);
};


/**
 * repeated SymbolCount by_symbol = 5;
 * @return {!Array<!proto.marketdata.SymbolCount>}
 */
proto.marketdata.AlertStatisticsResponse.prototype.getBySymbolList = function() {
  return /** @type{!Array<!proto.marketdata.SymbolCount>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.marketdata.SymbolCount, 5));
};


/**
 * @param {!Array<!proto.marketdata.SymbolCount>} value
 * @return {!proto.marketdata.AlertStatisticsResponse} returns this
*/
proto.marketdata.AlertStatisticsResponse.prototype.setBySymbolList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 5, value);
};


/**
 * @param {!proto.marketdata.SymbolCount=} opt_value
 * @param {number=} opt_index
 * @return {!proto.marketdata.SymbolCount}
 */
proto.marketdata.AlertStatisticsResponse.prototype.addBySymbol = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 5, opt_value, proto.marketdata.SymbolCount, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.marketdata.AlertStatisticsResponse} returns this
 */
proto.marketdata.AlertStatisticsResponse.prototype.clearBySymbolList = function() {
  return this.setBySymbolList([]);
};


/**
 * repeated TypeCount by_type = 6;
 * @return {!Array<!proto.marketdata.TypeCount>}
 */
proto.marketdata.AlertStatisticsResponse.prototype.getByTypeList = function() {
  return /** @type{!Array<!proto.marketdata.TypeCount>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.marketdata.TypeCount, 6));
};


/**
 * @param {!Array<!proto.marketdata.TypeCount>} value
 * @return {!proto.marketdata.AlertStatisticsResponse} returns this
*/
proto.marketdata.AlertStatisticsResponse.prototype.setByTypeList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 6, value);
};


/**
 * @param {!proto.marketdata.TypeCount=} opt_value
 * @param {number=} opt_index
 * @return {!proto.marketdata.TypeCount}
 */
proto.marketdata.AlertStatisticsResponse.prototype.addByType = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 6, opt_value, proto.marketdata.TypeCount, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.marketdata.AlertStatisticsResponse} returns this
 */
proto.marketdata.AlertStatisticsResponse.prototype.clearByTypeList = function() {
  return this.setByTypeList([]);
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
proto.marketdata.SymbolCount.prototype.toObject = function(opt_includeInstance) {
  return proto.marketdata.SymbolCount.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.marketdata.SymbolCount} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.SymbolCount.toObject = function(includeInstance, msg) {
  var f, obj = {
    symbol: jspb.Message.getFieldWithDefault(msg, 1, ""),
    count: jspb.Message.getFieldWithDefault(msg, 2, 0)
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
 * @return {!proto.marketdata.SymbolCount}
 */
proto.marketdata.SymbolCount.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.marketdata.SymbolCount;
  return proto.marketdata.SymbolCount.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.marketdata.SymbolCount} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.marketdata.SymbolCount}
 */
proto.marketdata.SymbolCount.deserializeBinaryFromReader = function(msg, reader) {
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
      var value = /** @type {number} */ (reader.readInt32());
      msg.setCount(value);
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
proto.marketdata.SymbolCount.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.marketdata.SymbolCount.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.marketdata.SymbolCount} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.SymbolCount.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getSymbol();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getCount();
  if (f !== 0) {
    writer.writeInt32(
      2,
      f
    );
  }
};


/**
 * optional string symbol = 1;
 * @return {string}
 */
proto.marketdata.SymbolCount.prototype.getSymbol = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.marketdata.SymbolCount} returns this
 */
proto.marketdata.SymbolCount.prototype.setSymbol = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional int32 count = 2;
 * @return {number}
 */
proto.marketdata.SymbolCount.prototype.getCount = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.SymbolCount} returns this
 */
proto.marketdata.SymbolCount.prototype.setCount = function(value) {
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
proto.marketdata.TypeCount.prototype.toObject = function(opt_includeInstance) {
  return proto.marketdata.TypeCount.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.marketdata.TypeCount} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.TypeCount.toObject = function(includeInstance, msg) {
  var f, obj = {
    type: jspb.Message.getFieldWithDefault(msg, 1, 0),
    count: jspb.Message.getFieldWithDefault(msg, 2, 0)
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
 * @return {!proto.marketdata.TypeCount}
 */
proto.marketdata.TypeCount.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.marketdata.TypeCount;
  return proto.marketdata.TypeCount.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.marketdata.TypeCount} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.marketdata.TypeCount}
 */
proto.marketdata.TypeCount.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!proto.marketdata.AlertType} */ (reader.readEnum());
      msg.setType(value);
      break;
    case 2:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setCount(value);
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
proto.marketdata.TypeCount.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.marketdata.TypeCount.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.marketdata.TypeCount} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.TypeCount.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getType();
  if (f !== 0.0) {
    writer.writeEnum(
      1,
      f
    );
  }
  f = message.getCount();
  if (f !== 0) {
    writer.writeInt32(
      2,
      f
    );
  }
};


/**
 * optional AlertType type = 1;
 * @return {!proto.marketdata.AlertType}
 */
proto.marketdata.TypeCount.prototype.getType = function() {
  return /** @type {!proto.marketdata.AlertType} */ (jspb.Message.getFieldWithDefault(this, 1, 0));
};


/**
 * @param {!proto.marketdata.AlertType} value
 * @return {!proto.marketdata.TypeCount} returns this
 */
proto.marketdata.TypeCount.prototype.setType = function(value) {
  return jspb.Message.setProto3EnumField(this, 1, value);
};


/**
 * optional int32 count = 2;
 * @return {number}
 */
proto.marketdata.TypeCount.prototype.getCount = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.TypeCount} returns this
 */
proto.marketdata.TypeCount.prototype.setCount = function(value) {
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
proto.marketdata.WatchlistItemResponse.prototype.toObject = function(opt_includeInstance) {
  return proto.marketdata.WatchlistItemResponse.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.marketdata.WatchlistItemResponse} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.WatchlistItemResponse.toObject = function(includeInstance, msg) {
  var f, obj = {
    item: (f = msg.getItem()) && proto.marketdata.WatchlistItem.toObject(includeInstance, f)
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
 * @return {!proto.marketdata.WatchlistItemResponse}
 */
proto.marketdata.WatchlistItemResponse.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.marketdata.WatchlistItemResponse;
  return proto.marketdata.WatchlistItemResponse.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.marketdata.WatchlistItemResponse} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.marketdata.WatchlistItemResponse}
 */
proto.marketdata.WatchlistItemResponse.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.marketdata.WatchlistItem;
      reader.readMessage(value,proto.marketdata.WatchlistItem.deserializeBinaryFromReader);
      msg.setItem(value);
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
proto.marketdata.WatchlistItemResponse.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.marketdata.WatchlistItemResponse.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.marketdata.WatchlistItemResponse} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.WatchlistItemResponse.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getItem();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.marketdata.WatchlistItem.serializeBinaryToWriter
    );
  }
};


/**
 * optional WatchlistItem item = 1;
 * @return {?proto.marketdata.WatchlistItem}
 */
proto.marketdata.WatchlistItemResponse.prototype.getItem = function() {
  return /** @type{?proto.marketdata.WatchlistItem} */ (
    jspb.Message.getWrapperField(this, proto.marketdata.WatchlistItem, 1));
};


/**
 * @param {?proto.marketdata.WatchlistItem|undefined} value
 * @return {!proto.marketdata.WatchlistItemResponse} returns this
*/
proto.marketdata.WatchlistItemResponse.prototype.setItem = function(value) {
  return jspb.Message.setWrapperField(this, 1, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.marketdata.WatchlistItemResponse} returns this
 */
proto.marketdata.WatchlistItemResponse.prototype.clearItem = function() {
  return this.setItem(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.marketdata.WatchlistItemResponse.prototype.hasItem = function() {
  return jspb.Message.getField(this, 1) != null;
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.marketdata.UserWatchlistResponse.repeatedFields_ = [1];



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
proto.marketdata.UserWatchlistResponse.prototype.toObject = function(opt_includeInstance) {
  return proto.marketdata.UserWatchlistResponse.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.marketdata.UserWatchlistResponse} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.UserWatchlistResponse.toObject = function(includeInstance, msg) {
  var f, obj = {
    itemsList: jspb.Message.toObjectList(msg.getItemsList(),
    proto.marketdata.WatchlistItemWithMarketData.toObject, includeInstance)
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
 * @return {!proto.marketdata.UserWatchlistResponse}
 */
proto.marketdata.UserWatchlistResponse.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.marketdata.UserWatchlistResponse;
  return proto.marketdata.UserWatchlistResponse.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.marketdata.UserWatchlistResponse} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.marketdata.UserWatchlistResponse}
 */
proto.marketdata.UserWatchlistResponse.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.marketdata.WatchlistItemWithMarketData;
      reader.readMessage(value,proto.marketdata.WatchlistItemWithMarketData.deserializeBinaryFromReader);
      msg.addItems(value);
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
proto.marketdata.UserWatchlistResponse.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.marketdata.UserWatchlistResponse.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.marketdata.UserWatchlistResponse} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.UserWatchlistResponse.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getItemsList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      1,
      f,
      proto.marketdata.WatchlistItemWithMarketData.serializeBinaryToWriter
    );
  }
};


/**
 * repeated WatchlistItemWithMarketData items = 1;
 * @return {!Array<!proto.marketdata.WatchlistItemWithMarketData>}
 */
proto.marketdata.UserWatchlistResponse.prototype.getItemsList = function() {
  return /** @type{!Array<!proto.marketdata.WatchlistItemWithMarketData>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.marketdata.WatchlistItemWithMarketData, 1));
};


/**
 * @param {!Array<!proto.marketdata.WatchlistItemWithMarketData>} value
 * @return {!proto.marketdata.UserWatchlistResponse} returns this
*/
proto.marketdata.UserWatchlistResponse.prototype.setItemsList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 1, value);
};


/**
 * @param {!proto.marketdata.WatchlistItemWithMarketData=} opt_value
 * @param {number=} opt_index
 * @return {!proto.marketdata.WatchlistItemWithMarketData}
 */
proto.marketdata.UserWatchlistResponse.prototype.addItems = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 1, opt_value, proto.marketdata.WatchlistItemWithMarketData, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.marketdata.UserWatchlistResponse} returns this
 */
proto.marketdata.UserWatchlistResponse.prototype.clearItemsList = function() {
  return this.setItemsList([]);
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.marketdata.WatchlistStatisticsResponse.repeatedFields_ = [3,5,6];



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
proto.marketdata.WatchlistStatisticsResponse.prototype.toObject = function(opt_includeInstance) {
  return proto.marketdata.WatchlistStatisticsResponse.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.marketdata.WatchlistStatisticsResponse} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.WatchlistStatisticsResponse.toObject = function(includeInstance, msg) {
  var f, obj = {
    totalSymbols: jspb.Message.getFieldWithDefault(msg, 1, 0),
    activeSymbols: jspb.Message.getFieldWithDefault(msg, 2, 0),
    symbolsByTagsList: jspb.Message.toObjectList(msg.getSymbolsByTagsList(),
    proto.marketdata.TagCount.toObject, includeInstance),
    priceAlerts: jspb.Message.getFieldWithDefault(msg, 4, 0),
    topGainersList: jspb.Message.toObjectList(msg.getTopGainersList(),
    proto.marketdata.WatchlistItemWithMarketData.toObject, includeInstance),
    topLosersList: jspb.Message.toObjectList(msg.getTopLosersList(),
    proto.marketdata.WatchlistItemWithMarketData.toObject, includeInstance)
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
 * @return {!proto.marketdata.WatchlistStatisticsResponse}
 */
proto.marketdata.WatchlistStatisticsResponse.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.marketdata.WatchlistStatisticsResponse;
  return proto.marketdata.WatchlistStatisticsResponse.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.marketdata.WatchlistStatisticsResponse} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.marketdata.WatchlistStatisticsResponse}
 */
proto.marketdata.WatchlistStatisticsResponse.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setTotalSymbols(value);
      break;
    case 2:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setActiveSymbols(value);
      break;
    case 3:
      var value = new proto.marketdata.TagCount;
      reader.readMessage(value,proto.marketdata.TagCount.deserializeBinaryFromReader);
      msg.addSymbolsByTags(value);
      break;
    case 4:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setPriceAlerts(value);
      break;
    case 5:
      var value = new proto.marketdata.WatchlistItemWithMarketData;
      reader.readMessage(value,proto.marketdata.WatchlistItemWithMarketData.deserializeBinaryFromReader);
      msg.addTopGainers(value);
      break;
    case 6:
      var value = new proto.marketdata.WatchlistItemWithMarketData;
      reader.readMessage(value,proto.marketdata.WatchlistItemWithMarketData.deserializeBinaryFromReader);
      msg.addTopLosers(value);
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
proto.marketdata.WatchlistStatisticsResponse.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.marketdata.WatchlistStatisticsResponse.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.marketdata.WatchlistStatisticsResponse} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.WatchlistStatisticsResponse.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getTotalSymbols();
  if (f !== 0) {
    writer.writeInt32(
      1,
      f
    );
  }
  f = message.getActiveSymbols();
  if (f !== 0) {
    writer.writeInt32(
      2,
      f
    );
  }
  f = message.getSymbolsByTagsList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      3,
      f,
      proto.marketdata.TagCount.serializeBinaryToWriter
    );
  }
  f = message.getPriceAlerts();
  if (f !== 0) {
    writer.writeInt32(
      4,
      f
    );
  }
  f = message.getTopGainersList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      5,
      f,
      proto.marketdata.WatchlistItemWithMarketData.serializeBinaryToWriter
    );
  }
  f = message.getTopLosersList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      6,
      f,
      proto.marketdata.WatchlistItemWithMarketData.serializeBinaryToWriter
    );
  }
};


/**
 * optional int32 total_symbols = 1;
 * @return {number}
 */
proto.marketdata.WatchlistStatisticsResponse.prototype.getTotalSymbols = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 1, 0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.WatchlistStatisticsResponse} returns this
 */
proto.marketdata.WatchlistStatisticsResponse.prototype.setTotalSymbols = function(value) {
  return jspb.Message.setProto3IntField(this, 1, value);
};


/**
 * optional int32 active_symbols = 2;
 * @return {number}
 */
proto.marketdata.WatchlistStatisticsResponse.prototype.getActiveSymbols = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.WatchlistStatisticsResponse} returns this
 */
proto.marketdata.WatchlistStatisticsResponse.prototype.setActiveSymbols = function(value) {
  return jspb.Message.setProto3IntField(this, 2, value);
};


/**
 * repeated TagCount symbols_by_tags = 3;
 * @return {!Array<!proto.marketdata.TagCount>}
 */
proto.marketdata.WatchlistStatisticsResponse.prototype.getSymbolsByTagsList = function() {
  return /** @type{!Array<!proto.marketdata.TagCount>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.marketdata.TagCount, 3));
};


/**
 * @param {!Array<!proto.marketdata.TagCount>} value
 * @return {!proto.marketdata.WatchlistStatisticsResponse} returns this
*/
proto.marketdata.WatchlistStatisticsResponse.prototype.setSymbolsByTagsList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 3, value);
};


/**
 * @param {!proto.marketdata.TagCount=} opt_value
 * @param {number=} opt_index
 * @return {!proto.marketdata.TagCount}
 */
proto.marketdata.WatchlistStatisticsResponse.prototype.addSymbolsByTags = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 3, opt_value, proto.marketdata.TagCount, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.marketdata.WatchlistStatisticsResponse} returns this
 */
proto.marketdata.WatchlistStatisticsResponse.prototype.clearSymbolsByTagsList = function() {
  return this.setSymbolsByTagsList([]);
};


/**
 * optional int32 price_alerts = 4;
 * @return {number}
 */
proto.marketdata.WatchlistStatisticsResponse.prototype.getPriceAlerts = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 4, 0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.WatchlistStatisticsResponse} returns this
 */
proto.marketdata.WatchlistStatisticsResponse.prototype.setPriceAlerts = function(value) {
  return jspb.Message.setProto3IntField(this, 4, value);
};


/**
 * repeated WatchlistItemWithMarketData top_gainers = 5;
 * @return {!Array<!proto.marketdata.WatchlistItemWithMarketData>}
 */
proto.marketdata.WatchlistStatisticsResponse.prototype.getTopGainersList = function() {
  return /** @type{!Array<!proto.marketdata.WatchlistItemWithMarketData>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.marketdata.WatchlistItemWithMarketData, 5));
};


/**
 * @param {!Array<!proto.marketdata.WatchlistItemWithMarketData>} value
 * @return {!proto.marketdata.WatchlistStatisticsResponse} returns this
*/
proto.marketdata.WatchlistStatisticsResponse.prototype.setTopGainersList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 5, value);
};


/**
 * @param {!proto.marketdata.WatchlistItemWithMarketData=} opt_value
 * @param {number=} opt_index
 * @return {!proto.marketdata.WatchlistItemWithMarketData}
 */
proto.marketdata.WatchlistStatisticsResponse.prototype.addTopGainers = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 5, opt_value, proto.marketdata.WatchlistItemWithMarketData, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.marketdata.WatchlistStatisticsResponse} returns this
 */
proto.marketdata.WatchlistStatisticsResponse.prototype.clearTopGainersList = function() {
  return this.setTopGainersList([]);
};


/**
 * repeated WatchlistItemWithMarketData top_losers = 6;
 * @return {!Array<!proto.marketdata.WatchlistItemWithMarketData>}
 */
proto.marketdata.WatchlistStatisticsResponse.prototype.getTopLosersList = function() {
  return /** @type{!Array<!proto.marketdata.WatchlistItemWithMarketData>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.marketdata.WatchlistItemWithMarketData, 6));
};


/**
 * @param {!Array<!proto.marketdata.WatchlistItemWithMarketData>} value
 * @return {!proto.marketdata.WatchlistStatisticsResponse} returns this
*/
proto.marketdata.WatchlistStatisticsResponse.prototype.setTopLosersList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 6, value);
};


/**
 * @param {!proto.marketdata.WatchlistItemWithMarketData=} opt_value
 * @param {number=} opt_index
 * @return {!proto.marketdata.WatchlistItemWithMarketData}
 */
proto.marketdata.WatchlistStatisticsResponse.prototype.addTopLosers = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 6, opt_value, proto.marketdata.WatchlistItemWithMarketData, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.marketdata.WatchlistStatisticsResponse} returns this
 */
proto.marketdata.WatchlistStatisticsResponse.prototype.clearTopLosersList = function() {
  return this.setTopLosersList([]);
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
proto.marketdata.TagCount.prototype.toObject = function(opt_includeInstance) {
  return proto.marketdata.TagCount.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.marketdata.TagCount} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.TagCount.toObject = function(includeInstance, msg) {
  var f, obj = {
    tag: jspb.Message.getFieldWithDefault(msg, 1, ""),
    count: jspb.Message.getFieldWithDefault(msg, 2, 0)
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
 * @return {!proto.marketdata.TagCount}
 */
proto.marketdata.TagCount.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.marketdata.TagCount;
  return proto.marketdata.TagCount.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.marketdata.TagCount} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.marketdata.TagCount}
 */
proto.marketdata.TagCount.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setTag(value);
      break;
    case 2:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setCount(value);
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
proto.marketdata.TagCount.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.marketdata.TagCount.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.marketdata.TagCount} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.TagCount.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getTag();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getCount();
  if (f !== 0) {
    writer.writeInt32(
      2,
      f
    );
  }
};


/**
 * optional string tag = 1;
 * @return {string}
 */
proto.marketdata.TagCount.prototype.getTag = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.marketdata.TagCount} returns this
 */
proto.marketdata.TagCount.prototype.setTag = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional int32 count = 2;
 * @return {number}
 */
proto.marketdata.TagCount.prototype.getCount = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/**
 * @param {number} value
 * @return {!proto.marketdata.TagCount} returns this
 */
proto.marketdata.TagCount.prototype.setCount = function(value) {
  return jspb.Message.setProto3IntField(this, 2, value);
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.marketdata.SearchSymbolsResponse.repeatedFields_ = [1];



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
proto.marketdata.SearchSymbolsResponse.prototype.toObject = function(opt_includeInstance) {
  return proto.marketdata.SearchSymbolsResponse.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.marketdata.SearchSymbolsResponse} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.SearchSymbolsResponse.toObject = function(includeInstance, msg) {
  var f, obj = {
    symbolsList: (f = jspb.Message.getRepeatedField(msg, 1)) == null ? undefined : f
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
 * @return {!proto.marketdata.SearchSymbolsResponse}
 */
proto.marketdata.SearchSymbolsResponse.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.marketdata.SearchSymbolsResponse;
  return proto.marketdata.SearchSymbolsResponse.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.marketdata.SearchSymbolsResponse} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.marketdata.SearchSymbolsResponse}
 */
proto.marketdata.SearchSymbolsResponse.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.addSymbols(value);
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
proto.marketdata.SearchSymbolsResponse.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.marketdata.SearchSymbolsResponse.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.marketdata.SearchSymbolsResponse} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.marketdata.SearchSymbolsResponse.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getSymbolsList();
  if (f.length > 0) {
    writer.writeRepeatedString(
      1,
      f
    );
  }
};


/**
 * repeated string symbols = 1;
 * @return {!Array<string>}
 */
proto.marketdata.SearchSymbolsResponse.prototype.getSymbolsList = function() {
  return /** @type {!Array<string>} */ (jspb.Message.getRepeatedField(this, 1));
};


/**
 * @param {!Array<string>} value
 * @return {!proto.marketdata.SearchSymbolsResponse} returns this
 */
proto.marketdata.SearchSymbolsResponse.prototype.setSymbolsList = function(value) {
  return jspb.Message.setField(this, 1, value || []);
};


/**
 * @param {string} value
 * @param {number=} opt_index
 * @return {!proto.marketdata.SearchSymbolsResponse} returns this
 */
proto.marketdata.SearchSymbolsResponse.prototype.addSymbols = function(value, opt_index) {
  return jspb.Message.addToRepeatedField(this, 1, value, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.marketdata.SearchSymbolsResponse} returns this
 */
proto.marketdata.SearchSymbolsResponse.prototype.clearSymbolsList = function() {
  return this.setSymbolsList([]);
};


/**
 * @enum {number}
 */
proto.marketdata.DataSource = {
  DATA_SOURCE_UNSPECIFIED: 0,
  DATA_SOURCE_ALPHA_VANTAGE: 1,
  DATA_SOURCE_IEX: 2,
  DATA_SOURCE_YAHOO_FINANCE: 3,
  DATA_SOURCE_BINANCE: 4,
  DATA_SOURCE_COINBASE: 5
};

/**
 * @enum {number}
 */
proto.marketdata.TimeInterval = {
  TIME_INTERVAL_UNSPECIFIED: 0,
  TIME_INTERVAL_ONE_MINUTE: 1,
  TIME_INTERVAL_FIVE_MINUTES: 2,
  TIME_INTERVAL_FIFTEEN_MINUTES: 3,
  TIME_INTERVAL_THIRTY_MINUTES: 4,
  TIME_INTERVAL_ONE_HOUR: 5,
  TIME_INTERVAL_FOUR_HOURS: 6,
  TIME_INTERVAL_ONE_DAY: 7,
  TIME_INTERVAL_ONE_WEEK: 8,
  TIME_INTERVAL_ONE_MONTH: 9
};

/**
 * @enum {number}
 */
proto.marketdata.AlertType = {
  ALERT_TYPE_UNSPECIFIED: 0,
  ALERT_TYPE_PRICE_ABOVE: 1,
  ALERT_TYPE_PRICE_BELOW: 2,
  ALERT_TYPE_PRICE_CHANGE: 3,
  ALERT_TYPE_VOLUME_SPIKE: 4,
  ALERT_TYPE_TECHNICAL_INDICATOR: 5,
  ALERT_TYPE_NEWS_SENTIMENT: 6
};

/**
 * @enum {number}
 */
proto.marketdata.AlertStatus = {
  ALERT_STATUS_UNSPECIFIED: 0,
  ALERT_STATUS_ACTIVE: 1,
  ALERT_STATUS_TRIGGERED: 2,
  ALERT_STATUS_DISABLED: 3,
  ALERT_STATUS_EXPIRED: 4
};

/**
 * @enum {number}
 */
proto.marketdata.AlertPriority = {
  ALERT_PRIORITY_UNSPECIFIED: 0,
  ALERT_PRIORITY_LOW: 1,
  ALERT_PRIORITY_MEDIUM: 2,
  ALERT_PRIORITY_HIGH: 3,
  ALERT_PRIORITY_CRITICAL: 4
};

goog.object.extend(exports, proto.marketdata);
