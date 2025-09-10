// package: treum.user
// file: user.proto

/* tslint:disable */
/* eslint-disable */

import * as jspb from "google-protobuf";
import * as google_protobuf_timestamp_pb from "google-protobuf/google/protobuf/timestamp_pb";
import * as google_protobuf_empty_pb from "google-protobuf/google/protobuf/empty_pb";

export class CreateUserRequest extends jspb.Message { 
    getEmail(): string;
    setEmail(value: string): CreateUserRequest;
    getUsername(): string;
    setUsername(value: string): CreateUserRequest;
    getPassword(): string;
    setPassword(value: string): CreateUserRequest;
    getFirstName(): string;
    setFirstName(value: string): CreateUserRequest;
    getLastName(): string;
    setLastName(value: string): CreateUserRequest;
    getPhone(): string;
    setPhone(value: string): CreateUserRequest;
    getSubscriptionTier(): SubscriptionTier;
    setSubscriptionTier(value: SubscriptionTier): CreateUserRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): CreateUserRequest.AsObject;
    static toObject(includeInstance: boolean, msg: CreateUserRequest): CreateUserRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: CreateUserRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): CreateUserRequest;
    static deserializeBinaryFromReader(message: CreateUserRequest, reader: jspb.BinaryReader): CreateUserRequest;
}

export namespace CreateUserRequest {
    export type AsObject = {
        email: string,
        username: string,
        password: string,
        firstName: string,
        lastName: string,
        phone: string,
        subscriptionTier: SubscriptionTier,
    }
}

export class UpdateUserRequest extends jspb.Message { 
    getId(): string;
    setId(value: string): UpdateUserRequest;
    getFirstName(): string;
    setFirstName(value: string): UpdateUserRequest;
    getLastName(): string;
    setLastName(value: string): UpdateUserRequest;
    getPhone(): string;
    setPhone(value: string): UpdateUserRequest;
    getAvatar(): string;
    setAvatar(value: string): UpdateUserRequest;
    getStatus(): UserStatus;
    setStatus(value: UserStatus): UpdateUserRequest;
    getTwoFactorEnabled(): boolean;
    setTwoFactorEnabled(value: boolean): UpdateUserRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): UpdateUserRequest.AsObject;
    static toObject(includeInstance: boolean, msg: UpdateUserRequest): UpdateUserRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: UpdateUserRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): UpdateUserRequest;
    static deserializeBinaryFromReader(message: UpdateUserRequest, reader: jspb.BinaryReader): UpdateUserRequest;
}

export namespace UpdateUserRequest {
    export type AsObject = {
        id: string,
        firstName: string,
        lastName: string,
        phone: string,
        avatar: string,
        status: UserStatus,
        twoFactorEnabled: boolean,
    }
}

export class GetUserRequest extends jspb.Message { 
    getId(): string;
    setId(value: string): GetUserRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): GetUserRequest.AsObject;
    static toObject(includeInstance: boolean, msg: GetUserRequest): GetUserRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: GetUserRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): GetUserRequest;
    static deserializeBinaryFromReader(message: GetUserRequest, reader: jspb.BinaryReader): GetUserRequest;
}

export namespace GetUserRequest {
    export type AsObject = {
        id: string,
    }
}

export class DeleteUserRequest extends jspb.Message { 
    getId(): string;
    setId(value: string): DeleteUserRequest;
    getReason(): string;
    setReason(value: string): DeleteUserRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): DeleteUserRequest.AsObject;
    static toObject(includeInstance: boolean, msg: DeleteUserRequest): DeleteUserRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: DeleteUserRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): DeleteUserRequest;
    static deserializeBinaryFromReader(message: DeleteUserRequest, reader: jspb.BinaryReader): DeleteUserRequest;
}

export namespace DeleteUserRequest {
    export type AsObject = {
        id: string,
        reason: string,
    }
}

export class ValidateUserRequest extends jspb.Message { 
    getEmail(): string;
    setEmail(value: string): ValidateUserRequest;
    getPassword(): string;
    setPassword(value: string): ValidateUserRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ValidateUserRequest.AsObject;
    static toObject(includeInstance: boolean, msg: ValidateUserRequest): ValidateUserRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ValidateUserRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ValidateUserRequest;
    static deserializeBinaryFromReader(message: ValidateUserRequest, reader: jspb.BinaryReader): ValidateUserRequest;
}

export namespace ValidateUserRequest {
    export type AsObject = {
        email: string,
        password: string,
    }
}

export class ValidateUserResponse extends jspb.Message { 
    getValid(): boolean;
    setValid(value: boolean): ValidateUserResponse;

    hasUser(): boolean;
    clearUser(): void;
    getUser(): UserResponse | undefined;
    setUser(value?: UserResponse): ValidateUserResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ValidateUserResponse.AsObject;
    static toObject(includeInstance: boolean, msg: ValidateUserResponse): ValidateUserResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ValidateUserResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ValidateUserResponse;
    static deserializeBinaryFromReader(message: ValidateUserResponse, reader: jspb.BinaryReader): ValidateUserResponse;
}

export namespace ValidateUserResponse {
    export type AsObject = {
        valid: boolean,
        user?: UserResponse.AsObject,
    }
}

export class ListUsersRequest extends jspb.Message { 
    getPage(): number;
    setPage(value: number): ListUsersRequest;
    getLimit(): number;
    setLimit(value: number): ListUsersRequest;
    getSortBy(): string;
    setSortBy(value: string): ListUsersRequest;
    getSortOrder(): string;
    setSortOrder(value: string): ListUsersRequest;
    getStatusFilter(): UserStatus;
    setStatusFilter(value: UserStatus): ListUsersRequest;
    getTierFilter(): SubscriptionTier;
    setTierFilter(value: SubscriptionTier): ListUsersRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ListUsersRequest.AsObject;
    static toObject(includeInstance: boolean, msg: ListUsersRequest): ListUsersRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ListUsersRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ListUsersRequest;
    static deserializeBinaryFromReader(message: ListUsersRequest, reader: jspb.BinaryReader): ListUsersRequest;
}

export namespace ListUsersRequest {
    export type AsObject = {
        page: number,
        limit: number,
        sortBy: string,
        sortOrder: string,
        statusFilter: UserStatus,
        tierFilter: SubscriptionTier,
    }
}

export class ListUsersResponse extends jspb.Message { 
    clearUsersList(): void;
    getUsersList(): Array<UserResponse>;
    setUsersList(value: Array<UserResponse>): ListUsersResponse;
    addUsers(value?: UserResponse, index?: number): UserResponse;
    getTotal(): number;
    setTotal(value: number): ListUsersResponse;
    getPage(): number;
    setPage(value: number): ListUsersResponse;
    getLimit(): number;
    setLimit(value: number): ListUsersResponse;
    getTotalPages(): number;
    setTotalPages(value: number): ListUsersResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ListUsersResponse.AsObject;
    static toObject(includeInstance: boolean, msg: ListUsersResponse): ListUsersResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ListUsersResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ListUsersResponse;
    static deserializeBinaryFromReader(message: ListUsersResponse, reader: jspb.BinaryReader): ListUsersResponse;
}

export namespace ListUsersResponse {
    export type AsObject = {
        usersList: Array<UserResponse.AsObject>,
        total: number,
        page: number,
        limit: number,
        totalPages: number,
    }
}

export class UserResponse extends jspb.Message { 
    getId(): string;
    setId(value: string): UserResponse;
    getEmail(): string;
    setEmail(value: string): UserResponse;
    getUsername(): string;
    setUsername(value: string): UserResponse;
    getFirstName(): string;
    setFirstName(value: string): UserResponse;
    getLastName(): string;
    setLastName(value: string): UserResponse;
    getPhone(): string;
    setPhone(value: string): UserResponse;
    getAvatar(): string;
    setAvatar(value: string): UserResponse;
    getStatus(): UserStatus;
    setStatus(value: UserStatus): UserResponse;
    getSubscriptionTier(): SubscriptionTier;
    setSubscriptionTier(value: SubscriptionTier): UserResponse;
    getEmailVerified(): boolean;
    setEmailVerified(value: boolean): UserResponse;
    getPhoneVerified(): boolean;
    setPhoneVerified(value: boolean): UserResponse;
    getTwoFactorEnabled(): boolean;
    setTwoFactorEnabled(value: boolean): UserResponse;

    hasLastLoginAt(): boolean;
    clearLastLoginAt(): void;
    getLastLoginAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setLastLoginAt(value?: google_protobuf_timestamp_pb.Timestamp): UserResponse;

    hasCreatedAt(): boolean;
    clearCreatedAt(): void;
    getCreatedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setCreatedAt(value?: google_protobuf_timestamp_pb.Timestamp): UserResponse;

    hasUpdatedAt(): boolean;
    clearUpdatedAt(): void;
    getUpdatedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setUpdatedAt(value?: google_protobuf_timestamp_pb.Timestamp): UserResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): UserResponse.AsObject;
    static toObject(includeInstance: boolean, msg: UserResponse): UserResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: UserResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): UserResponse;
    static deserializeBinaryFromReader(message: UserResponse, reader: jspb.BinaryReader): UserResponse;
}

export namespace UserResponse {
    export type AsObject = {
        id: string,
        email: string,
        username: string,
        firstName: string,
        lastName: string,
        phone: string,
        avatar: string,
        status: UserStatus,
        subscriptionTier: SubscriptionTier,
        emailVerified: boolean,
        phoneVerified: boolean,
        twoFactorEnabled: boolean,
        lastLoginAt?: google_protobuf_timestamp_pb.Timestamp.AsObject,
        createdAt?: google_protobuf_timestamp_pb.Timestamp.AsObject,
        updatedAt?: google_protobuf_timestamp_pb.Timestamp.AsObject,
    }
}

export class UpdateUserProfileRequest extends jspb.Message { 
    getUserId(): string;
    setUserId(value: string): UpdateUserProfileRequest;
    getBio(): string;
    setBio(value: string): UpdateUserProfileRequest;
    getTradingExperience(): TradingExperience;
    setTradingExperience(value: TradingExperience): UpdateUserProfileRequest;
    getRiskTolerance(): RiskLevel;
    setRiskTolerance(value: RiskLevel): UpdateUserProfileRequest;
    clearPreferredAssetsList(): void;
    getPreferredAssetsList(): Array<AssetType>;
    setPreferredAssetsList(value: Array<AssetType>): UpdateUserProfileRequest;
    addPreferredAssets(value: AssetType, index?: number): AssetType;
    getTimezone(): string;
    setTimezone(value: string): UpdateUserProfileRequest;
    getLanguage(): string;
    setLanguage(value: string): UpdateUserProfileRequest;

    hasNotifications(): boolean;
    clearNotifications(): void;
    getNotifications(): NotificationSettings | undefined;
    setNotifications(value?: NotificationSettings): UpdateUserProfileRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): UpdateUserProfileRequest.AsObject;
    static toObject(includeInstance: boolean, msg: UpdateUserProfileRequest): UpdateUserProfileRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: UpdateUserProfileRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): UpdateUserProfileRequest;
    static deserializeBinaryFromReader(message: UpdateUserProfileRequest, reader: jspb.BinaryReader): UpdateUserProfileRequest;
}

export namespace UpdateUserProfileRequest {
    export type AsObject = {
        userId: string,
        bio: string,
        tradingExperience: TradingExperience,
        riskTolerance: RiskLevel,
        preferredAssetsList: Array<AssetType>,
        timezone: string,
        language: string,
        notifications?: NotificationSettings.AsObject,
    }
}

export class UserProfileResponse extends jspb.Message { 
    getUserId(): string;
    setUserId(value: string): UserProfileResponse;
    getBio(): string;
    setBio(value: string): UserProfileResponse;
    getTradingExperience(): TradingExperience;
    setTradingExperience(value: TradingExperience): UserProfileResponse;
    getRiskTolerance(): RiskLevel;
    setRiskTolerance(value: RiskLevel): UserProfileResponse;
    clearPreferredAssetsList(): void;
    getPreferredAssetsList(): Array<AssetType>;
    setPreferredAssetsList(value: Array<AssetType>): UserProfileResponse;
    addPreferredAssets(value: AssetType, index?: number): AssetType;
    getTimezone(): string;
    setTimezone(value: string): UserProfileResponse;
    getLanguage(): string;
    setLanguage(value: string): UserProfileResponse;

    hasNotifications(): boolean;
    clearNotifications(): void;
    getNotifications(): NotificationSettings | undefined;
    setNotifications(value?: NotificationSettings): UserProfileResponse;

    hasCreatedAt(): boolean;
    clearCreatedAt(): void;
    getCreatedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setCreatedAt(value?: google_protobuf_timestamp_pb.Timestamp): UserProfileResponse;

    hasUpdatedAt(): boolean;
    clearUpdatedAt(): void;
    getUpdatedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setUpdatedAt(value?: google_protobuf_timestamp_pb.Timestamp): UserProfileResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): UserProfileResponse.AsObject;
    static toObject(includeInstance: boolean, msg: UserProfileResponse): UserProfileResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: UserProfileResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): UserProfileResponse;
    static deserializeBinaryFromReader(message: UserProfileResponse, reader: jspb.BinaryReader): UserProfileResponse;
}

export namespace UserProfileResponse {
    export type AsObject = {
        userId: string,
        bio: string,
        tradingExperience: TradingExperience,
        riskTolerance: RiskLevel,
        preferredAssetsList: Array<AssetType>,
        timezone: string,
        language: string,
        notifications?: NotificationSettings.AsObject,
        createdAt?: google_protobuf_timestamp_pb.Timestamp.AsObject,
        updatedAt?: google_protobuf_timestamp_pb.Timestamp.AsObject,
    }
}

export class NotificationSettings extends jspb.Message { 
    getEmail(): boolean;
    setEmail(value: boolean): NotificationSettings;
    getSms(): boolean;
    setSms(value: boolean): NotificationSettings;
    getPush(): boolean;
    setPush(value: boolean): NotificationSettings;
    getTrading(): boolean;
    setTrading(value: boolean): NotificationSettings;
    getEducation(): boolean;
    setEducation(value: boolean): NotificationSettings;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): NotificationSettings.AsObject;
    static toObject(includeInstance: boolean, msg: NotificationSettings): NotificationSettings.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: NotificationSettings, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): NotificationSettings;
    static deserializeBinaryFromReader(message: NotificationSettings, reader: jspb.BinaryReader): NotificationSettings;
}

export namespace NotificationSettings {
    export type AsObject = {
        email: boolean,
        sms: boolean,
        push: boolean,
        trading: boolean,
        education: boolean,
    }
}

export enum UserStatus {
    USER_STATUS_UNSPECIFIED = 0,
    USER_STATUS_ACTIVE = 1,
    USER_STATUS_INACTIVE = 2,
    USER_STATUS_SUSPENDED = 3,
    USER_STATUS_PENDING_VERIFICATION = 4,
}

export enum SubscriptionTier {
    SUBSCRIPTION_TIER_UNSPECIFIED = 0,
    SUBSCRIPTION_TIER_FREE = 1,
    SUBSCRIPTION_TIER_BASIC = 2,
    SUBSCRIPTION_TIER_PREMIUM = 3,
    SUBSCRIPTION_TIER_ENTERPRISE = 4,
}

export enum TradingExperience {
    TRADING_EXPERIENCE_UNSPECIFIED = 0,
    TRADING_EXPERIENCE_BEGINNER = 1,
    TRADING_EXPERIENCE_INTERMEDIATE = 2,
    TRADING_EXPERIENCE_ADVANCED = 3,
    TRADING_EXPERIENCE_EXPERT = 4,
}

export enum RiskLevel {
    RISK_LEVEL_UNSPECIFIED = 0,
    RISK_LEVEL_LOW = 1,
    RISK_LEVEL_MEDIUM = 2,
    RISK_LEVEL_HIGH = 3,
    RISK_LEVEL_VERY_HIGH = 4,
}

export enum AssetType {
    ASSET_TYPE_UNSPECIFIED = 0,
    ASSET_TYPE_STOCK = 1,
    ASSET_TYPE_CRYPTO = 2,
    ASSET_TYPE_FOREX = 3,
    ASSET_TYPE_COMMODITY = 4,
    ASSET_TYPE_INDEX = 5,
    ASSET_TYPE_BOND = 6,
}
