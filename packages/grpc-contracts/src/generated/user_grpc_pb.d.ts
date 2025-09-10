// package: treum.user
// file: user.proto

/* tslint:disable */
/* eslint-disable */

import * as grpc from "@grpc/grpc-js";
import * as user_pb from "./user_pb";
import * as google_protobuf_timestamp_pb from "google-protobuf/google/protobuf/timestamp_pb";
import * as google_protobuf_empty_pb from "google-protobuf/google/protobuf/empty_pb";

interface IUserServiceService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
    createUser: IUserServiceService_ICreateUser;
    getUser: IUserServiceService_IGetUser;
    updateUser: IUserServiceService_IUpdateUser;
    deleteUser: IUserServiceService_IDeleteUser;
    listUsers: IUserServiceService_IListUsers;
    validateUser: IUserServiceService_IValidateUser;
    getUserProfile: IUserServiceService_IGetUserProfile;
    updateUserProfile: IUserServiceService_IUpdateUserProfile;
}

interface IUserServiceService_ICreateUser extends grpc.MethodDefinition<user_pb.CreateUserRequest, user_pb.UserResponse> {
    path: "/treum.user.UserService/CreateUser";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<user_pb.CreateUserRequest>;
    requestDeserialize: grpc.deserialize<user_pb.CreateUserRequest>;
    responseSerialize: grpc.serialize<user_pb.UserResponse>;
    responseDeserialize: grpc.deserialize<user_pb.UserResponse>;
}
interface IUserServiceService_IGetUser extends grpc.MethodDefinition<user_pb.GetUserRequest, user_pb.UserResponse> {
    path: "/treum.user.UserService/GetUser";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<user_pb.GetUserRequest>;
    requestDeserialize: grpc.deserialize<user_pb.GetUserRequest>;
    responseSerialize: grpc.serialize<user_pb.UserResponse>;
    responseDeserialize: grpc.deserialize<user_pb.UserResponse>;
}
interface IUserServiceService_IUpdateUser extends grpc.MethodDefinition<user_pb.UpdateUserRequest, user_pb.UserResponse> {
    path: "/treum.user.UserService/UpdateUser";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<user_pb.UpdateUserRequest>;
    requestDeserialize: grpc.deserialize<user_pb.UpdateUserRequest>;
    responseSerialize: grpc.serialize<user_pb.UserResponse>;
    responseDeserialize: grpc.deserialize<user_pb.UserResponse>;
}
interface IUserServiceService_IDeleteUser extends grpc.MethodDefinition<user_pb.DeleteUserRequest, google_protobuf_empty_pb.Empty> {
    path: "/treum.user.UserService/DeleteUser";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<user_pb.DeleteUserRequest>;
    requestDeserialize: grpc.deserialize<user_pb.DeleteUserRequest>;
    responseSerialize: grpc.serialize<google_protobuf_empty_pb.Empty>;
    responseDeserialize: grpc.deserialize<google_protobuf_empty_pb.Empty>;
}
interface IUserServiceService_IListUsers extends grpc.MethodDefinition<user_pb.ListUsersRequest, user_pb.ListUsersResponse> {
    path: "/treum.user.UserService/ListUsers";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<user_pb.ListUsersRequest>;
    requestDeserialize: grpc.deserialize<user_pb.ListUsersRequest>;
    responseSerialize: grpc.serialize<user_pb.ListUsersResponse>;
    responseDeserialize: grpc.deserialize<user_pb.ListUsersResponse>;
}
interface IUserServiceService_IValidateUser extends grpc.MethodDefinition<user_pb.ValidateUserRequest, user_pb.ValidateUserResponse> {
    path: "/treum.user.UserService/ValidateUser";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<user_pb.ValidateUserRequest>;
    requestDeserialize: grpc.deserialize<user_pb.ValidateUserRequest>;
    responseSerialize: grpc.serialize<user_pb.ValidateUserResponse>;
    responseDeserialize: grpc.deserialize<user_pb.ValidateUserResponse>;
}
interface IUserServiceService_IGetUserProfile extends grpc.MethodDefinition<user_pb.GetUserRequest, user_pb.UserProfileResponse> {
    path: "/treum.user.UserService/GetUserProfile";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<user_pb.GetUserRequest>;
    requestDeserialize: grpc.deserialize<user_pb.GetUserRequest>;
    responseSerialize: grpc.serialize<user_pb.UserProfileResponse>;
    responseDeserialize: grpc.deserialize<user_pb.UserProfileResponse>;
}
interface IUserServiceService_IUpdateUserProfile extends grpc.MethodDefinition<user_pb.UpdateUserProfileRequest, user_pb.UserProfileResponse> {
    path: "/treum.user.UserService/UpdateUserProfile";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<user_pb.UpdateUserProfileRequest>;
    requestDeserialize: grpc.deserialize<user_pb.UpdateUserProfileRequest>;
    responseSerialize: grpc.serialize<user_pb.UserProfileResponse>;
    responseDeserialize: grpc.deserialize<user_pb.UserProfileResponse>;
}

export const UserServiceService: IUserServiceService;

export interface IUserServiceServer extends grpc.UntypedServiceImplementation {
    createUser: grpc.handleUnaryCall<user_pb.CreateUserRequest, user_pb.UserResponse>;
    getUser: grpc.handleUnaryCall<user_pb.GetUserRequest, user_pb.UserResponse>;
    updateUser: grpc.handleUnaryCall<user_pb.UpdateUserRequest, user_pb.UserResponse>;
    deleteUser: grpc.handleUnaryCall<user_pb.DeleteUserRequest, google_protobuf_empty_pb.Empty>;
    listUsers: grpc.handleUnaryCall<user_pb.ListUsersRequest, user_pb.ListUsersResponse>;
    validateUser: grpc.handleUnaryCall<user_pb.ValidateUserRequest, user_pb.ValidateUserResponse>;
    getUserProfile: grpc.handleUnaryCall<user_pb.GetUserRequest, user_pb.UserProfileResponse>;
    updateUserProfile: grpc.handleUnaryCall<user_pb.UpdateUserProfileRequest, user_pb.UserProfileResponse>;
}

export interface IUserServiceClient {
    createUser(request: user_pb.CreateUserRequest, callback: (error: grpc.ServiceError | null, response: user_pb.UserResponse) => void): grpc.ClientUnaryCall;
    createUser(request: user_pb.CreateUserRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: user_pb.UserResponse) => void): grpc.ClientUnaryCall;
    createUser(request: user_pb.CreateUserRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: user_pb.UserResponse) => void): grpc.ClientUnaryCall;
    getUser(request: user_pb.GetUserRequest, callback: (error: grpc.ServiceError | null, response: user_pb.UserResponse) => void): grpc.ClientUnaryCall;
    getUser(request: user_pb.GetUserRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: user_pb.UserResponse) => void): grpc.ClientUnaryCall;
    getUser(request: user_pb.GetUserRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: user_pb.UserResponse) => void): grpc.ClientUnaryCall;
    updateUser(request: user_pb.UpdateUserRequest, callback: (error: grpc.ServiceError | null, response: user_pb.UserResponse) => void): grpc.ClientUnaryCall;
    updateUser(request: user_pb.UpdateUserRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: user_pb.UserResponse) => void): grpc.ClientUnaryCall;
    updateUser(request: user_pb.UpdateUserRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: user_pb.UserResponse) => void): grpc.ClientUnaryCall;
    deleteUser(request: user_pb.DeleteUserRequest, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    deleteUser(request: user_pb.DeleteUserRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    deleteUser(request: user_pb.DeleteUserRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    listUsers(request: user_pb.ListUsersRequest, callback: (error: grpc.ServiceError | null, response: user_pb.ListUsersResponse) => void): grpc.ClientUnaryCall;
    listUsers(request: user_pb.ListUsersRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: user_pb.ListUsersResponse) => void): grpc.ClientUnaryCall;
    listUsers(request: user_pb.ListUsersRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: user_pb.ListUsersResponse) => void): grpc.ClientUnaryCall;
    validateUser(request: user_pb.ValidateUserRequest, callback: (error: grpc.ServiceError | null, response: user_pb.ValidateUserResponse) => void): grpc.ClientUnaryCall;
    validateUser(request: user_pb.ValidateUserRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: user_pb.ValidateUserResponse) => void): grpc.ClientUnaryCall;
    validateUser(request: user_pb.ValidateUserRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: user_pb.ValidateUserResponse) => void): grpc.ClientUnaryCall;
    getUserProfile(request: user_pb.GetUserRequest, callback: (error: grpc.ServiceError | null, response: user_pb.UserProfileResponse) => void): grpc.ClientUnaryCall;
    getUserProfile(request: user_pb.GetUserRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: user_pb.UserProfileResponse) => void): grpc.ClientUnaryCall;
    getUserProfile(request: user_pb.GetUserRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: user_pb.UserProfileResponse) => void): grpc.ClientUnaryCall;
    updateUserProfile(request: user_pb.UpdateUserProfileRequest, callback: (error: grpc.ServiceError | null, response: user_pb.UserProfileResponse) => void): grpc.ClientUnaryCall;
    updateUserProfile(request: user_pb.UpdateUserProfileRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: user_pb.UserProfileResponse) => void): grpc.ClientUnaryCall;
    updateUserProfile(request: user_pb.UpdateUserProfileRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: user_pb.UserProfileResponse) => void): grpc.ClientUnaryCall;
}

export class UserServiceClient extends grpc.Client implements IUserServiceClient {
    constructor(address: string, credentials: grpc.ChannelCredentials, options?: Partial<grpc.ClientOptions>);
    public createUser(request: user_pb.CreateUserRequest, callback: (error: grpc.ServiceError | null, response: user_pb.UserResponse) => void): grpc.ClientUnaryCall;
    public createUser(request: user_pb.CreateUserRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: user_pb.UserResponse) => void): grpc.ClientUnaryCall;
    public createUser(request: user_pb.CreateUserRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: user_pb.UserResponse) => void): grpc.ClientUnaryCall;
    public getUser(request: user_pb.GetUserRequest, callback: (error: grpc.ServiceError | null, response: user_pb.UserResponse) => void): grpc.ClientUnaryCall;
    public getUser(request: user_pb.GetUserRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: user_pb.UserResponse) => void): grpc.ClientUnaryCall;
    public getUser(request: user_pb.GetUserRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: user_pb.UserResponse) => void): grpc.ClientUnaryCall;
    public updateUser(request: user_pb.UpdateUserRequest, callback: (error: grpc.ServiceError | null, response: user_pb.UserResponse) => void): grpc.ClientUnaryCall;
    public updateUser(request: user_pb.UpdateUserRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: user_pb.UserResponse) => void): grpc.ClientUnaryCall;
    public updateUser(request: user_pb.UpdateUserRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: user_pb.UserResponse) => void): grpc.ClientUnaryCall;
    public deleteUser(request: user_pb.DeleteUserRequest, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public deleteUser(request: user_pb.DeleteUserRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public deleteUser(request: user_pb.DeleteUserRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public listUsers(request: user_pb.ListUsersRequest, callback: (error: grpc.ServiceError | null, response: user_pb.ListUsersResponse) => void): grpc.ClientUnaryCall;
    public listUsers(request: user_pb.ListUsersRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: user_pb.ListUsersResponse) => void): grpc.ClientUnaryCall;
    public listUsers(request: user_pb.ListUsersRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: user_pb.ListUsersResponse) => void): grpc.ClientUnaryCall;
    public validateUser(request: user_pb.ValidateUserRequest, callback: (error: grpc.ServiceError | null, response: user_pb.ValidateUserResponse) => void): grpc.ClientUnaryCall;
    public validateUser(request: user_pb.ValidateUserRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: user_pb.ValidateUserResponse) => void): grpc.ClientUnaryCall;
    public validateUser(request: user_pb.ValidateUserRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: user_pb.ValidateUserResponse) => void): grpc.ClientUnaryCall;
    public getUserProfile(request: user_pb.GetUserRequest, callback: (error: grpc.ServiceError | null, response: user_pb.UserProfileResponse) => void): grpc.ClientUnaryCall;
    public getUserProfile(request: user_pb.GetUserRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: user_pb.UserProfileResponse) => void): grpc.ClientUnaryCall;
    public getUserProfile(request: user_pb.GetUserRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: user_pb.UserProfileResponse) => void): grpc.ClientUnaryCall;
    public updateUserProfile(request: user_pb.UpdateUserProfileRequest, callback: (error: grpc.ServiceError | null, response: user_pb.UserProfileResponse) => void): grpc.ClientUnaryCall;
    public updateUserProfile(request: user_pb.UpdateUserProfileRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: user_pb.UserProfileResponse) => void): grpc.ClientUnaryCall;
    public updateUserProfile(request: user_pb.UpdateUserProfileRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: user_pb.UserProfileResponse) => void): grpc.ClientUnaryCall;
}
