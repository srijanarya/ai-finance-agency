// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('@grpc/grpc-js');
var user_pb = require('./user_pb.js');
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

function serialize_treum_user_CreateUserRequest(arg) {
  if (!(arg instanceof user_pb.CreateUserRequest)) {
    throw new Error('Expected argument of type treum.user.CreateUserRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_user_CreateUserRequest(buffer_arg) {
  return user_pb.CreateUserRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_user_DeleteUserRequest(arg) {
  if (!(arg instanceof user_pb.DeleteUserRequest)) {
    throw new Error('Expected argument of type treum.user.DeleteUserRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_user_DeleteUserRequest(buffer_arg) {
  return user_pb.DeleteUserRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_user_GetUserRequest(arg) {
  if (!(arg instanceof user_pb.GetUserRequest)) {
    throw new Error('Expected argument of type treum.user.GetUserRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_user_GetUserRequest(buffer_arg) {
  return user_pb.GetUserRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_user_ListUsersRequest(arg) {
  if (!(arg instanceof user_pb.ListUsersRequest)) {
    throw new Error('Expected argument of type treum.user.ListUsersRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_user_ListUsersRequest(buffer_arg) {
  return user_pb.ListUsersRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_user_ListUsersResponse(arg) {
  if (!(arg instanceof user_pb.ListUsersResponse)) {
    throw new Error('Expected argument of type treum.user.ListUsersResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_user_ListUsersResponse(buffer_arg) {
  return user_pb.ListUsersResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_user_UpdateUserProfileRequest(arg) {
  if (!(arg instanceof user_pb.UpdateUserProfileRequest)) {
    throw new Error('Expected argument of type treum.user.UpdateUserProfileRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_user_UpdateUserProfileRequest(buffer_arg) {
  return user_pb.UpdateUserProfileRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_user_UpdateUserRequest(arg) {
  if (!(arg instanceof user_pb.UpdateUserRequest)) {
    throw new Error('Expected argument of type treum.user.UpdateUserRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_user_UpdateUserRequest(buffer_arg) {
  return user_pb.UpdateUserRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_user_UserProfileResponse(arg) {
  if (!(arg instanceof user_pb.UserProfileResponse)) {
    throw new Error('Expected argument of type treum.user.UserProfileResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_user_UserProfileResponse(buffer_arg) {
  return user_pb.UserProfileResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_user_UserResponse(arg) {
  if (!(arg instanceof user_pb.UserResponse)) {
    throw new Error('Expected argument of type treum.user.UserResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_user_UserResponse(buffer_arg) {
  return user_pb.UserResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_user_ValidateUserRequest(arg) {
  if (!(arg instanceof user_pb.ValidateUserRequest)) {
    throw new Error('Expected argument of type treum.user.ValidateUserRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_user_ValidateUserRequest(buffer_arg) {
  return user_pb.ValidateUserRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_user_ValidateUserResponse(arg) {
  if (!(arg instanceof user_pb.ValidateUserResponse)) {
    throw new Error('Expected argument of type treum.user.ValidateUserResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_user_ValidateUserResponse(buffer_arg) {
  return user_pb.ValidateUserResponse.deserializeBinary(new Uint8Array(buffer_arg));
}


var UserServiceService = exports.UserServiceService = {
  createUser: {
    path: '/treum.user.UserService/CreateUser',
    requestStream: false,
    responseStream: false,
    requestType: user_pb.CreateUserRequest,
    responseType: user_pb.UserResponse,
    requestSerialize: serialize_treum_user_CreateUserRequest,
    requestDeserialize: deserialize_treum_user_CreateUserRequest,
    responseSerialize: serialize_treum_user_UserResponse,
    responseDeserialize: deserialize_treum_user_UserResponse,
  },
  getUser: {
    path: '/treum.user.UserService/GetUser',
    requestStream: false,
    responseStream: false,
    requestType: user_pb.GetUserRequest,
    responseType: user_pb.UserResponse,
    requestSerialize: serialize_treum_user_GetUserRequest,
    requestDeserialize: deserialize_treum_user_GetUserRequest,
    responseSerialize: serialize_treum_user_UserResponse,
    responseDeserialize: deserialize_treum_user_UserResponse,
  },
  updateUser: {
    path: '/treum.user.UserService/UpdateUser',
    requestStream: false,
    responseStream: false,
    requestType: user_pb.UpdateUserRequest,
    responseType: user_pb.UserResponse,
    requestSerialize: serialize_treum_user_UpdateUserRequest,
    requestDeserialize: deserialize_treum_user_UpdateUserRequest,
    responseSerialize: serialize_treum_user_UserResponse,
    responseDeserialize: deserialize_treum_user_UserResponse,
  },
  deleteUser: {
    path: '/treum.user.UserService/DeleteUser',
    requestStream: false,
    responseStream: false,
    requestType: user_pb.DeleteUserRequest,
    responseType: google_protobuf_empty_pb.Empty,
    requestSerialize: serialize_treum_user_DeleteUserRequest,
    requestDeserialize: deserialize_treum_user_DeleteUserRequest,
    responseSerialize: serialize_google_protobuf_Empty,
    responseDeserialize: deserialize_google_protobuf_Empty,
  },
  listUsers: {
    path: '/treum.user.UserService/ListUsers',
    requestStream: false,
    responseStream: false,
    requestType: user_pb.ListUsersRequest,
    responseType: user_pb.ListUsersResponse,
    requestSerialize: serialize_treum_user_ListUsersRequest,
    requestDeserialize: deserialize_treum_user_ListUsersRequest,
    responseSerialize: serialize_treum_user_ListUsersResponse,
    responseDeserialize: deserialize_treum_user_ListUsersResponse,
  },
  validateUser: {
    path: '/treum.user.UserService/ValidateUser',
    requestStream: false,
    responseStream: false,
    requestType: user_pb.ValidateUserRequest,
    responseType: user_pb.ValidateUserResponse,
    requestSerialize: serialize_treum_user_ValidateUserRequest,
    requestDeserialize: deserialize_treum_user_ValidateUserRequest,
    responseSerialize: serialize_treum_user_ValidateUserResponse,
    responseDeserialize: deserialize_treum_user_ValidateUserResponse,
  },
  getUserProfile: {
    path: '/treum.user.UserService/GetUserProfile',
    requestStream: false,
    responseStream: false,
    requestType: user_pb.GetUserRequest,
    responseType: user_pb.UserProfileResponse,
    requestSerialize: serialize_treum_user_GetUserRequest,
    requestDeserialize: deserialize_treum_user_GetUserRequest,
    responseSerialize: serialize_treum_user_UserProfileResponse,
    responseDeserialize: deserialize_treum_user_UserProfileResponse,
  },
  updateUserProfile: {
    path: '/treum.user.UserService/UpdateUserProfile',
    requestStream: false,
    responseStream: false,
    requestType: user_pb.UpdateUserProfileRequest,
    responseType: user_pb.UserProfileResponse,
    requestSerialize: serialize_treum_user_UpdateUserProfileRequest,
    requestDeserialize: deserialize_treum_user_UpdateUserProfileRequest,
    responseSerialize: serialize_treum_user_UserProfileResponse,
    responseDeserialize: deserialize_treum_user_UserProfileResponse,
  },
};

exports.UserServiceClient = grpc.makeGenericClientConstructor(UserServiceService, 'UserService');
