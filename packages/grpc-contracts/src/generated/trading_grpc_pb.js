// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('@grpc/grpc-js');
var trading_pb = require('./trading_pb.js');
var google_protobuf_timestamp_pb = require('google-protobuf/google/protobuf/timestamp_pb.js');
var google_protobuf_empty_pb = require('google-protobuf/google/protobuf/empty_pb.js');

function serialize_treum_trading_CancelTradeRequest(arg) {
  if (!(arg instanceof trading_pb.CancelTradeRequest)) {
    throw new Error('Expected argument of type treum.trading.CancelTradeRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_trading_CancelTradeRequest(buffer_arg) {
  return trading_pb.CancelTradeRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_trading_CreateTradeRequest(arg) {
  if (!(arg instanceof trading_pb.CreateTradeRequest)) {
    throw new Error('Expected argument of type treum.trading.CreateTradeRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_trading_CreateTradeRequest(buffer_arg) {
  return trading_pb.CreateTradeRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_trading_CreateTradingAccountRequest(arg) {
  if (!(arg instanceof trading_pb.CreateTradingAccountRequest)) {
    throw new Error('Expected argument of type treum.trading.CreateTradingAccountRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_trading_CreateTradingAccountRequest(buffer_arg) {
  return trading_pb.CreateTradingAccountRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_trading_GetPortfolioRequest(arg) {
  if (!(arg instanceof trading_pb.GetPortfolioRequest)) {
    throw new Error('Expected argument of type treum.trading.GetPortfolioRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_trading_GetPortfolioRequest(buffer_arg) {
  return trading_pb.GetPortfolioRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_trading_GetTradeHistoryRequest(arg) {
  if (!(arg instanceof trading_pb.GetTradeHistoryRequest)) {
    throw new Error('Expected argument of type treum.trading.GetTradeHistoryRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_trading_GetTradeHistoryRequest(buffer_arg) {
  return trading_pb.GetTradeHistoryRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_trading_GetTradeRequest(arg) {
  if (!(arg instanceof trading_pb.GetTradeRequest)) {
    throw new Error('Expected argument of type treum.trading.GetTradeRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_trading_GetTradeRequest(buffer_arg) {
  return trading_pb.GetTradeRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_trading_GetTradingAccountRequest(arg) {
  if (!(arg instanceof trading_pb.GetTradingAccountRequest)) {
    throw new Error('Expected argument of type treum.trading.GetTradingAccountRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_trading_GetTradingAccountRequest(buffer_arg) {
  return trading_pb.GetTradingAccountRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_trading_ListTradesRequest(arg) {
  if (!(arg instanceof trading_pb.ListTradesRequest)) {
    throw new Error('Expected argument of type treum.trading.ListTradesRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_trading_ListTradesRequest(buffer_arg) {
  return trading_pb.ListTradesRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_trading_ListTradesResponse(arg) {
  if (!(arg instanceof trading_pb.ListTradesResponse)) {
    throw new Error('Expected argument of type treum.trading.ListTradesResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_trading_ListTradesResponse(buffer_arg) {
  return trading_pb.ListTradesResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_trading_PortfolioResponse(arg) {
  if (!(arg instanceof trading_pb.PortfolioResponse)) {
    throw new Error('Expected argument of type treum.trading.PortfolioResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_trading_PortfolioResponse(buffer_arg) {
  return trading_pb.PortfolioResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_trading_TradeHistoryResponse(arg) {
  if (!(arg instanceof trading_pb.TradeHistoryResponse)) {
    throw new Error('Expected argument of type treum.trading.TradeHistoryResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_trading_TradeHistoryResponse(buffer_arg) {
  return trading_pb.TradeHistoryResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_trading_TradeResponse(arg) {
  if (!(arg instanceof trading_pb.TradeResponse)) {
    throw new Error('Expected argument of type treum.trading.TradeResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_trading_TradeResponse(buffer_arg) {
  return trading_pb.TradeResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_trading_TradingAccountResponse(arg) {
  if (!(arg instanceof trading_pb.TradingAccountResponse)) {
    throw new Error('Expected argument of type treum.trading.TradingAccountResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_trading_TradingAccountResponse(buffer_arg) {
  return trading_pb.TradingAccountResponse.deserializeBinary(new Uint8Array(buffer_arg));
}


var TradingServiceService = exports.TradingServiceService = {
  createTrade: {
    path: '/treum.trading.TradingService/CreateTrade',
    requestStream: false,
    responseStream: false,
    requestType: trading_pb.CreateTradeRequest,
    responseType: trading_pb.TradeResponse,
    requestSerialize: serialize_treum_trading_CreateTradeRequest,
    requestDeserialize: deserialize_treum_trading_CreateTradeRequest,
    responseSerialize: serialize_treum_trading_TradeResponse,
    responseDeserialize: deserialize_treum_trading_TradeResponse,
  },
  getTrade: {
    path: '/treum.trading.TradingService/GetTrade',
    requestStream: false,
    responseStream: false,
    requestType: trading_pb.GetTradeRequest,
    responseType: trading_pb.TradeResponse,
    requestSerialize: serialize_treum_trading_GetTradeRequest,
    requestDeserialize: deserialize_treum_trading_GetTradeRequest,
    responseSerialize: serialize_treum_trading_TradeResponse,
    responseDeserialize: deserialize_treum_trading_TradeResponse,
  },
  listTrades: {
    path: '/treum.trading.TradingService/ListTrades',
    requestStream: false,
    responseStream: false,
    requestType: trading_pb.ListTradesRequest,
    responseType: trading_pb.ListTradesResponse,
    requestSerialize: serialize_treum_trading_ListTradesRequest,
    requestDeserialize: deserialize_treum_trading_ListTradesRequest,
    responseSerialize: serialize_treum_trading_ListTradesResponse,
    responseDeserialize: deserialize_treum_trading_ListTradesResponse,
  },
  cancelTrade: {
    path: '/treum.trading.TradingService/CancelTrade',
    requestStream: false,
    responseStream: false,
    requestType: trading_pb.CancelTradeRequest,
    responseType: trading_pb.TradeResponse,
    requestSerialize: serialize_treum_trading_CancelTradeRequest,
    requestDeserialize: deserialize_treum_trading_CancelTradeRequest,
    responseSerialize: serialize_treum_trading_TradeResponse,
    responseDeserialize: deserialize_treum_trading_TradeResponse,
  },
  getTradingAccount: {
    path: '/treum.trading.TradingService/GetTradingAccount',
    requestStream: false,
    responseStream: false,
    requestType: trading_pb.GetTradingAccountRequest,
    responseType: trading_pb.TradingAccountResponse,
    requestSerialize: serialize_treum_trading_GetTradingAccountRequest,
    requestDeserialize: deserialize_treum_trading_GetTradingAccountRequest,
    responseSerialize: serialize_treum_trading_TradingAccountResponse,
    responseDeserialize: deserialize_treum_trading_TradingAccountResponse,
  },
  createTradingAccount: {
    path: '/treum.trading.TradingService/CreateTradingAccount',
    requestStream: false,
    responseStream: false,
    requestType: trading_pb.CreateTradingAccountRequest,
    responseType: trading_pb.TradingAccountResponse,
    requestSerialize: serialize_treum_trading_CreateTradingAccountRequest,
    requestDeserialize: deserialize_treum_trading_CreateTradingAccountRequest,
    responseSerialize: serialize_treum_trading_TradingAccountResponse,
    responseDeserialize: deserialize_treum_trading_TradingAccountResponse,
  },
  getPortfolio: {
    path: '/treum.trading.TradingService/GetPortfolio',
    requestStream: false,
    responseStream: false,
    requestType: trading_pb.GetPortfolioRequest,
    responseType: trading_pb.PortfolioResponse,
    requestSerialize: serialize_treum_trading_GetPortfolioRequest,
    requestDeserialize: deserialize_treum_trading_GetPortfolioRequest,
    responseSerialize: serialize_treum_trading_PortfolioResponse,
    responseDeserialize: deserialize_treum_trading_PortfolioResponse,
  },
  getTradeHistory: {
    path: '/treum.trading.TradingService/GetTradeHistory',
    requestStream: false,
    responseStream: false,
    requestType: trading_pb.GetTradeHistoryRequest,
    responseType: trading_pb.TradeHistoryResponse,
    requestSerialize: serialize_treum_trading_GetTradeHistoryRequest,
    requestDeserialize: deserialize_treum_trading_GetTradeHistoryRequest,
    responseSerialize: serialize_treum_trading_TradeHistoryResponse,
    responseDeserialize: deserialize_treum_trading_TradeHistoryResponse,
  },
};

exports.TradingServiceClient = grpc.makeGenericClientConstructor(TradingServiceService, 'TradingService');
