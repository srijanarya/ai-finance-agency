// package: treum.education
// file: education.proto

/* tslint:disable */
/* eslint-disable */

import * as jspb from "google-protobuf";
import * as google_protobuf_timestamp_pb from "google-protobuf/google/protobuf/timestamp_pb";
import * as google_protobuf_empty_pb from "google-protobuf/google/protobuf/empty_pb";

export class CreateCourseRequest extends jspb.Message { 
    getTitle(): string;
    setTitle(value: string): CreateCourseRequest;
    getDescription(): string;
    setDescription(value: string): CreateCourseRequest;
    getLevel(): CourseLevel;
    setLevel(value: CourseLevel): CreateCourseRequest;
    getCategory(): string;
    setCategory(value: string): CreateCourseRequest;
    getDuration(): number;
    setDuration(value: number): CreateCourseRequest;
    getPrice(): number;
    setPrice(value: number): CreateCourseRequest;
    getCurrency(): string;
    setCurrency(value: string): CreateCourseRequest;
    getThumbnailUrl(): string;
    setThumbnailUrl(value: string): CreateCourseRequest;
    clearTagsList(): void;
    getTagsList(): Array<string>;
    setTagsList(value: Array<string>): CreateCourseRequest;
    addTags(value: string, index?: number): string;
    clearPrerequisiteCoursesList(): void;
    getPrerequisiteCoursesList(): Array<string>;
    setPrerequisiteCoursesList(value: Array<string>): CreateCourseRequest;
    addPrerequisiteCourses(value: string, index?: number): string;
    clearLearningOutcomesList(): void;
    getLearningOutcomesList(): Array<string>;
    setLearningOutcomesList(value: Array<string>): CreateCourseRequest;
    addLearningOutcomes(value: string, index?: number): string;
    getInstructorId(): string;
    setInstructorId(value: string): CreateCourseRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): CreateCourseRequest.AsObject;
    static toObject(includeInstance: boolean, msg: CreateCourseRequest): CreateCourseRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: CreateCourseRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): CreateCourseRequest;
    static deserializeBinaryFromReader(message: CreateCourseRequest, reader: jspb.BinaryReader): CreateCourseRequest;
}

export namespace CreateCourseRequest {
    export type AsObject = {
        title: string,
        description: string,
        level: CourseLevel,
        category: string,
        duration: number,
        price: number,
        currency: string,
        thumbnailUrl: string,
        tagsList: Array<string>,
        prerequisiteCoursesList: Array<string>,
        learningOutcomesList: Array<string>,
        instructorId: string,
    }
}

export class UpdateCourseRequest extends jspb.Message { 
    getId(): string;
    setId(value: string): UpdateCourseRequest;
    getTitle(): string;
    setTitle(value: string): UpdateCourseRequest;
    getDescription(): string;
    setDescription(value: string): UpdateCourseRequest;
    getLevel(): CourseLevel;
    setLevel(value: CourseLevel): UpdateCourseRequest;
    getCategory(): string;
    setCategory(value: string): UpdateCourseRequest;
    getDuration(): number;
    setDuration(value: number): UpdateCourseRequest;
    getPrice(): number;
    setPrice(value: number): UpdateCourseRequest;
    getCurrency(): string;
    setCurrency(value: string): UpdateCourseRequest;
    getThumbnailUrl(): string;
    setThumbnailUrl(value: string): UpdateCourseRequest;
    clearTagsList(): void;
    getTagsList(): Array<string>;
    setTagsList(value: Array<string>): UpdateCourseRequest;
    addTags(value: string, index?: number): string;
    clearPrerequisiteCoursesList(): void;
    getPrerequisiteCoursesList(): Array<string>;
    setPrerequisiteCoursesList(value: Array<string>): UpdateCourseRequest;
    addPrerequisiteCourses(value: string, index?: number): string;
    clearLearningOutcomesList(): void;
    getLearningOutcomesList(): Array<string>;
    setLearningOutcomesList(value: Array<string>): UpdateCourseRequest;
    addLearningOutcomes(value: string, index?: number): string;
    getIsActive(): boolean;
    setIsActive(value: boolean): UpdateCourseRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): UpdateCourseRequest.AsObject;
    static toObject(includeInstance: boolean, msg: UpdateCourseRequest): UpdateCourseRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: UpdateCourseRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): UpdateCourseRequest;
    static deserializeBinaryFromReader(message: UpdateCourseRequest, reader: jspb.BinaryReader): UpdateCourseRequest;
}

export namespace UpdateCourseRequest {
    export type AsObject = {
        id: string,
        title: string,
        description: string,
        level: CourseLevel,
        category: string,
        duration: number,
        price: number,
        currency: string,
        thumbnailUrl: string,
        tagsList: Array<string>,
        prerequisiteCoursesList: Array<string>,
        learningOutcomesList: Array<string>,
        isActive: boolean,
    }
}

export class GetCourseRequest extends jspb.Message { 
    getId(): string;
    setId(value: string): GetCourseRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): GetCourseRequest.AsObject;
    static toObject(includeInstance: boolean, msg: GetCourseRequest): GetCourseRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: GetCourseRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): GetCourseRequest;
    static deserializeBinaryFromReader(message: GetCourseRequest, reader: jspb.BinaryReader): GetCourseRequest;
}

export namespace GetCourseRequest {
    export type AsObject = {
        id: string,
    }
}

export class DeleteCourseRequest extends jspb.Message { 
    getId(): string;
    setId(value: string): DeleteCourseRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): DeleteCourseRequest.AsObject;
    static toObject(includeInstance: boolean, msg: DeleteCourseRequest): DeleteCourseRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: DeleteCourseRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): DeleteCourseRequest;
    static deserializeBinaryFromReader(message: DeleteCourseRequest, reader: jspb.BinaryReader): DeleteCourseRequest;
}

export namespace DeleteCourseRequest {
    export type AsObject = {
        id: string,
    }
}

export class ListCoursesRequest extends jspb.Message { 
    getPage(): number;
    setPage(value: number): ListCoursesRequest;
    getLimit(): number;
    setLimit(value: number): ListCoursesRequest;
    getLevelFilter(): CourseLevel;
    setLevelFilter(value: CourseLevel): ListCoursesRequest;
    getCategoryFilter(): string;
    setCategoryFilter(value: string): ListCoursesRequest;
    getIsActiveFilter(): boolean;
    setIsActiveFilter(value: boolean): ListCoursesRequest;
    getInstructorIdFilter(): string;
    setInstructorIdFilter(value: string): ListCoursesRequest;
    clearTagsList(): void;
    getTagsList(): Array<string>;
    setTagsList(value: Array<string>): ListCoursesRequest;
    addTags(value: string, index?: number): string;
    getMaxPrice(): number;
    setMaxPrice(value: number): ListCoursesRequest;
    getSearchQuery(): string;
    setSearchQuery(value: string): ListCoursesRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ListCoursesRequest.AsObject;
    static toObject(includeInstance: boolean, msg: ListCoursesRequest): ListCoursesRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ListCoursesRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ListCoursesRequest;
    static deserializeBinaryFromReader(message: ListCoursesRequest, reader: jspb.BinaryReader): ListCoursesRequest;
}

export namespace ListCoursesRequest {
    export type AsObject = {
        page: number,
        limit: number,
        levelFilter: CourseLevel,
        categoryFilter: string,
        isActiveFilter: boolean,
        instructorIdFilter: string,
        tagsList: Array<string>,
        maxPrice: number,
        searchQuery: string,
    }
}

export class ListCoursesResponse extends jspb.Message { 
    clearCoursesList(): void;
    getCoursesList(): Array<CourseResponse>;
    setCoursesList(value: Array<CourseResponse>): ListCoursesResponse;
    addCourses(value?: CourseResponse, index?: number): CourseResponse;
    getTotal(): number;
    setTotal(value: number): ListCoursesResponse;
    getPage(): number;
    setPage(value: number): ListCoursesResponse;
    getLimit(): number;
    setLimit(value: number): ListCoursesResponse;
    getTotalPages(): number;
    setTotalPages(value: number): ListCoursesResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ListCoursesResponse.AsObject;
    static toObject(includeInstance: boolean, msg: ListCoursesResponse): ListCoursesResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ListCoursesResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ListCoursesResponse;
    static deserializeBinaryFromReader(message: ListCoursesResponse, reader: jspb.BinaryReader): ListCoursesResponse;
}

export namespace ListCoursesResponse {
    export type AsObject = {
        coursesList: Array<CourseResponse.AsObject>,
        total: number,
        page: number,
        limit: number,
        totalPages: number,
    }
}

export class CourseResponse extends jspb.Message { 
    getId(): string;
    setId(value: string): CourseResponse;
    getTitle(): string;
    setTitle(value: string): CourseResponse;
    getDescription(): string;
    setDescription(value: string): CourseResponse;
    getLevel(): CourseLevel;
    setLevel(value: CourseLevel): CourseResponse;
    getCategory(): string;
    setCategory(value: string): CourseResponse;
    getDuration(): number;
    setDuration(value: number): CourseResponse;
    getPrice(): number;
    setPrice(value: number): CourseResponse;
    getCurrency(): string;
    setCurrency(value: string): CourseResponse;
    getIsActive(): boolean;
    setIsActive(value: boolean): CourseResponse;
    getThumbnailUrl(): string;
    setThumbnailUrl(value: string): CourseResponse;
    clearTagsList(): void;
    getTagsList(): Array<string>;
    setTagsList(value: Array<string>): CourseResponse;
    addTags(value: string, index?: number): string;
    clearPrerequisiteCoursesList(): void;
    getPrerequisiteCoursesList(): Array<string>;
    setPrerequisiteCoursesList(value: Array<string>): CourseResponse;
    addPrerequisiteCourses(value: string, index?: number): string;
    clearLearningOutcomesList(): void;
    getLearningOutcomesList(): Array<string>;
    setLearningOutcomesList(value: Array<string>): CourseResponse;
    addLearningOutcomes(value: string, index?: number): string;
    getInstructorId(): string;
    setInstructorId(value: string): CourseResponse;
    getEnrolledCount(): number;
    setEnrolledCount(value: number): CourseResponse;
    getRating(): number;
    setRating(value: number): CourseResponse;
    getLessonCount(): number;
    setLessonCount(value: number): CourseResponse;

    hasCreatedAt(): boolean;
    clearCreatedAt(): void;
    getCreatedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setCreatedAt(value?: google_protobuf_timestamp_pb.Timestamp): CourseResponse;

    hasUpdatedAt(): boolean;
    clearUpdatedAt(): void;
    getUpdatedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setUpdatedAt(value?: google_protobuf_timestamp_pb.Timestamp): CourseResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): CourseResponse.AsObject;
    static toObject(includeInstance: boolean, msg: CourseResponse): CourseResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: CourseResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): CourseResponse;
    static deserializeBinaryFromReader(message: CourseResponse, reader: jspb.BinaryReader): CourseResponse;
}

export namespace CourseResponse {
    export type AsObject = {
        id: string,
        title: string,
        description: string,
        level: CourseLevel,
        category: string,
        duration: number,
        price: number,
        currency: string,
        isActive: boolean,
        thumbnailUrl: string,
        tagsList: Array<string>,
        prerequisiteCoursesList: Array<string>,
        learningOutcomesList: Array<string>,
        instructorId: string,
        enrolledCount: number,
        rating: number,
        lessonCount: number,
        createdAt?: google_protobuf_timestamp_pb.Timestamp.AsObject,
        updatedAt?: google_protobuf_timestamp_pb.Timestamp.AsObject,
    }
}

export class CreateLessonRequest extends jspb.Message { 
    getCourseId(): string;
    setCourseId(value: string): CreateLessonRequest;
    getTitle(): string;
    setTitle(value: string): CreateLessonRequest;
    getDescription(): string;
    setDescription(value: string): CreateLessonRequest;
    getOrder(): number;
    setOrder(value: number): CreateLessonRequest;
    getDuration(): number;
    setDuration(value: number): CreateLessonRequest;
    getType(): LessonType;
    setType(value: LessonType): CreateLessonRequest;
    getContentUrl(): string;
    setContentUrl(value: string): CreateLessonRequest;
    getIsFree(): boolean;
    setIsFree(value: boolean): CreateLessonRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): CreateLessonRequest.AsObject;
    static toObject(includeInstance: boolean, msg: CreateLessonRequest): CreateLessonRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: CreateLessonRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): CreateLessonRequest;
    static deserializeBinaryFromReader(message: CreateLessonRequest, reader: jspb.BinaryReader): CreateLessonRequest;
}

export namespace CreateLessonRequest {
    export type AsObject = {
        courseId: string,
        title: string,
        description: string,
        order: number,
        duration: number,
        type: LessonType,
        contentUrl: string,
        isFree: boolean,
    }
}

export class UpdateLessonRequest extends jspb.Message { 
    getId(): string;
    setId(value: string): UpdateLessonRequest;
    getTitle(): string;
    setTitle(value: string): UpdateLessonRequest;
    getDescription(): string;
    setDescription(value: string): UpdateLessonRequest;
    getOrder(): number;
    setOrder(value: number): UpdateLessonRequest;
    getDuration(): number;
    setDuration(value: number): UpdateLessonRequest;
    getType(): LessonType;
    setType(value: LessonType): UpdateLessonRequest;
    getContentUrl(): string;
    setContentUrl(value: string): UpdateLessonRequest;
    getIsActive(): boolean;
    setIsActive(value: boolean): UpdateLessonRequest;
    getIsFree(): boolean;
    setIsFree(value: boolean): UpdateLessonRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): UpdateLessonRequest.AsObject;
    static toObject(includeInstance: boolean, msg: UpdateLessonRequest): UpdateLessonRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: UpdateLessonRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): UpdateLessonRequest;
    static deserializeBinaryFromReader(message: UpdateLessonRequest, reader: jspb.BinaryReader): UpdateLessonRequest;
}

export namespace UpdateLessonRequest {
    export type AsObject = {
        id: string,
        title: string,
        description: string,
        order: number,
        duration: number,
        type: LessonType,
        contentUrl: string,
        isActive: boolean,
        isFree: boolean,
    }
}

export class GetLessonRequest extends jspb.Message { 
    getId(): string;
    setId(value: string): GetLessonRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): GetLessonRequest.AsObject;
    static toObject(includeInstance: boolean, msg: GetLessonRequest): GetLessonRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: GetLessonRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): GetLessonRequest;
    static deserializeBinaryFromReader(message: GetLessonRequest, reader: jspb.BinaryReader): GetLessonRequest;
}

export namespace GetLessonRequest {
    export type AsObject = {
        id: string,
    }
}

export class DeleteLessonRequest extends jspb.Message { 
    getId(): string;
    setId(value: string): DeleteLessonRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): DeleteLessonRequest.AsObject;
    static toObject(includeInstance: boolean, msg: DeleteLessonRequest): DeleteLessonRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: DeleteLessonRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): DeleteLessonRequest;
    static deserializeBinaryFromReader(message: DeleteLessonRequest, reader: jspb.BinaryReader): DeleteLessonRequest;
}

export namespace DeleteLessonRequest {
    export type AsObject = {
        id: string,
    }
}

export class ListLessonsRequest extends jspb.Message { 
    getCourseId(): string;
    setCourseId(value: string): ListLessonsRequest;
    getPage(): number;
    setPage(value: number): ListLessonsRequest;
    getLimit(): number;
    setLimit(value: number): ListLessonsRequest;
    getTypeFilter(): LessonType;
    setTypeFilter(value: LessonType): ListLessonsRequest;
    getIsActiveFilter(): boolean;
    setIsActiveFilter(value: boolean): ListLessonsRequest;
    getIsFreeFilter(): boolean;
    setIsFreeFilter(value: boolean): ListLessonsRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ListLessonsRequest.AsObject;
    static toObject(includeInstance: boolean, msg: ListLessonsRequest): ListLessonsRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ListLessonsRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ListLessonsRequest;
    static deserializeBinaryFromReader(message: ListLessonsRequest, reader: jspb.BinaryReader): ListLessonsRequest;
}

export namespace ListLessonsRequest {
    export type AsObject = {
        courseId: string,
        page: number,
        limit: number,
        typeFilter: LessonType,
        isActiveFilter: boolean,
        isFreeFilter: boolean,
    }
}

export class ListLessonsResponse extends jspb.Message { 
    clearLessonsList(): void;
    getLessonsList(): Array<LessonResponse>;
    setLessonsList(value: Array<LessonResponse>): ListLessonsResponse;
    addLessons(value?: LessonResponse, index?: number): LessonResponse;
    getTotal(): number;
    setTotal(value: number): ListLessonsResponse;
    getPage(): number;
    setPage(value: number): ListLessonsResponse;
    getLimit(): number;
    setLimit(value: number): ListLessonsResponse;
    getTotalPages(): number;
    setTotalPages(value: number): ListLessonsResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ListLessonsResponse.AsObject;
    static toObject(includeInstance: boolean, msg: ListLessonsResponse): ListLessonsResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ListLessonsResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ListLessonsResponse;
    static deserializeBinaryFromReader(message: ListLessonsResponse, reader: jspb.BinaryReader): ListLessonsResponse;
}

export namespace ListLessonsResponse {
    export type AsObject = {
        lessonsList: Array<LessonResponse.AsObject>,
        total: number,
        page: number,
        limit: number,
        totalPages: number,
    }
}

export class LessonResponse extends jspb.Message { 
    getId(): string;
    setId(value: string): LessonResponse;
    getCourseId(): string;
    setCourseId(value: string): LessonResponse;
    getTitle(): string;
    setTitle(value: string): LessonResponse;
    getDescription(): string;
    setDescription(value: string): LessonResponse;
    getOrder(): number;
    setOrder(value: number): LessonResponse;
    getDuration(): number;
    setDuration(value: number): LessonResponse;
    getType(): LessonType;
    setType(value: LessonType): LessonResponse;
    getContentUrl(): string;
    setContentUrl(value: string): LessonResponse;
    getIsActive(): boolean;
    setIsActive(value: boolean): LessonResponse;
    getIsFree(): boolean;
    setIsFree(value: boolean): LessonResponse;

    hasCreatedAt(): boolean;
    clearCreatedAt(): void;
    getCreatedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setCreatedAt(value?: google_protobuf_timestamp_pb.Timestamp): LessonResponse;

    hasUpdatedAt(): boolean;
    clearUpdatedAt(): void;
    getUpdatedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setUpdatedAt(value?: google_protobuf_timestamp_pb.Timestamp): LessonResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): LessonResponse.AsObject;
    static toObject(includeInstance: boolean, msg: LessonResponse): LessonResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: LessonResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): LessonResponse;
    static deserializeBinaryFromReader(message: LessonResponse, reader: jspb.BinaryReader): LessonResponse;
}

export namespace LessonResponse {
    export type AsObject = {
        id: string,
        courseId: string,
        title: string,
        description: string,
        order: number,
        duration: number,
        type: LessonType,
        contentUrl: string,
        isActive: boolean,
        isFree: boolean,
        createdAt?: google_protobuf_timestamp_pb.Timestamp.AsObject,
        updatedAt?: google_protobuf_timestamp_pb.Timestamp.AsObject,
    }
}

export class EnrollInCourseRequest extends jspb.Message { 
    getUserId(): string;
    setUserId(value: string): EnrollInCourseRequest;
    getCourseId(): string;
    setCourseId(value: string): EnrollInCourseRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): EnrollInCourseRequest.AsObject;
    static toObject(includeInstance: boolean, msg: EnrollInCourseRequest): EnrollInCourseRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: EnrollInCourseRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): EnrollInCourseRequest;
    static deserializeBinaryFromReader(message: EnrollInCourseRequest, reader: jspb.BinaryReader): EnrollInCourseRequest;
}

export namespace EnrollInCourseRequest {
    export type AsObject = {
        userId: string,
        courseId: string,
    }
}

export class GetUserProgressRequest extends jspb.Message { 
    getUserId(): string;
    setUserId(value: string): GetUserProgressRequest;
    getCourseId(): string;
    setCourseId(value: string): GetUserProgressRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): GetUserProgressRequest.AsObject;
    static toObject(includeInstance: boolean, msg: GetUserProgressRequest): GetUserProgressRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: GetUserProgressRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): GetUserProgressRequest;
    static deserializeBinaryFromReader(message: GetUserProgressRequest, reader: jspb.BinaryReader): GetUserProgressRequest;
}

export namespace GetUserProgressRequest {
    export type AsObject = {
        userId: string,
        courseId: string,
    }
}

export class UpdateUserProgressRequest extends jspb.Message { 
    getUserId(): string;
    setUserId(value: string): UpdateUserProgressRequest;
    getCourseId(): string;
    setCourseId(value: string): UpdateUserProgressRequest;
    getCurrentLessonId(): string;
    setCurrentLessonId(value: string): UpdateUserProgressRequest;
    clearCompletedLessonsList(): void;
    getCompletedLessonsList(): Array<string>;
    setCompletedLessonsList(value: Array<string>): UpdateUserProgressRequest;
    addCompletedLessons(value: string, index?: number): string;
    getCompletionPercentage(): number;
    setCompletionPercentage(value: number): UpdateUserProgressRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): UpdateUserProgressRequest.AsObject;
    static toObject(includeInstance: boolean, msg: UpdateUserProgressRequest): UpdateUserProgressRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: UpdateUserProgressRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): UpdateUserProgressRequest;
    static deserializeBinaryFromReader(message: UpdateUserProgressRequest, reader: jspb.BinaryReader): UpdateUserProgressRequest;
}

export namespace UpdateUserProgressRequest {
    export type AsObject = {
        userId: string,
        courseId: string,
        currentLessonId: string,
        completedLessonsList: Array<string>,
        completionPercentage: number,
    }
}

export class CompleteCourseRequest extends jspb.Message { 
    getUserId(): string;
    setUserId(value: string): CompleteCourseRequest;
    getCourseId(): string;
    setCourseId(value: string): CompleteCourseRequest;
    getIssueCertificate(): boolean;
    setIssueCertificate(value: boolean): CompleteCourseRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): CompleteCourseRequest.AsObject;
    static toObject(includeInstance: boolean, msg: CompleteCourseRequest): CompleteCourseRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: CompleteCourseRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): CompleteCourseRequest;
    static deserializeBinaryFromReader(message: CompleteCourseRequest, reader: jspb.BinaryReader): CompleteCourseRequest;
}

export namespace CompleteCourseRequest {
    export type AsObject = {
        userId: string,
        courseId: string,
        issueCertificate: boolean,
    }
}

export class UserProgressResponse extends jspb.Message { 
    getId(): string;
    setId(value: string): UserProgressResponse;
    getUserId(): string;
    setUserId(value: string): UserProgressResponse;
    getCourseId(): string;
    setCourseId(value: string): UserProgressResponse;
    clearCompletedLessonsList(): void;
    getCompletedLessonsList(): Array<string>;
    setCompletedLessonsList(value: Array<string>): UserProgressResponse;
    addCompletedLessons(value: string, index?: number): string;
    getCurrentLesson(): string;
    setCurrentLesson(value: string): UserProgressResponse;
    getCompletionPercentage(): number;
    setCompletionPercentage(value: number): UserProgressResponse;

    hasStartedAt(): boolean;
    clearStartedAt(): void;
    getStartedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setStartedAt(value?: google_protobuf_timestamp_pb.Timestamp): UserProgressResponse;

    hasCompletedAt(): boolean;
    clearCompletedAt(): void;
    getCompletedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setCompletedAt(value?: google_protobuf_timestamp_pb.Timestamp): UserProgressResponse;
    getCertificateIssued(): boolean;
    setCertificateIssued(value: boolean): UserProgressResponse;

    hasCreatedAt(): boolean;
    clearCreatedAt(): void;
    getCreatedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setCreatedAt(value?: google_protobuf_timestamp_pb.Timestamp): UserProgressResponse;

    hasUpdatedAt(): boolean;
    clearUpdatedAt(): void;
    getUpdatedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setUpdatedAt(value?: google_protobuf_timestamp_pb.Timestamp): UserProgressResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): UserProgressResponse.AsObject;
    static toObject(includeInstance: boolean, msg: UserProgressResponse): UserProgressResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: UserProgressResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): UserProgressResponse;
    static deserializeBinaryFromReader(message: UserProgressResponse, reader: jspb.BinaryReader): UserProgressResponse;
}

export namespace UserProgressResponse {
    export type AsObject = {
        id: string,
        userId: string,
        courseId: string,
        completedLessonsList: Array<string>,
        currentLesson: string,
        completionPercentage: number,
        startedAt?: google_protobuf_timestamp_pb.Timestamp.AsObject,
        completedAt?: google_protobuf_timestamp_pb.Timestamp.AsObject,
        certificateIssued: boolean,
        createdAt?: google_protobuf_timestamp_pb.Timestamp.AsObject,
        updatedAt?: google_protobuf_timestamp_pb.Timestamp.AsObject,
    }
}

export class GetCertificateRequest extends jspb.Message { 
    getUserId(): string;
    setUserId(value: string): GetCertificateRequest;
    getCourseId(): string;
    setCourseId(value: string): GetCertificateRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): GetCertificateRequest.AsObject;
    static toObject(includeInstance: boolean, msg: GetCertificateRequest): GetCertificateRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: GetCertificateRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): GetCertificateRequest;
    static deserializeBinaryFromReader(message: GetCertificateRequest, reader: jspb.BinaryReader): GetCertificateRequest;
}

export namespace GetCertificateRequest {
    export type AsObject = {
        userId: string,
        courseId: string,
    }
}

export class CertificateResponse extends jspb.Message { 
    getId(): string;
    setId(value: string): CertificateResponse;
    getUserId(): string;
    setUserId(value: string): CertificateResponse;
    getCourseId(): string;
    setCourseId(value: string): CertificateResponse;
    getCourseTitle(): string;
    setCourseTitle(value: string): CertificateResponse;
    getUserName(): string;
    setUserName(value: string): CertificateResponse;

    hasIssuedAt(): boolean;
    clearIssuedAt(): void;
    getIssuedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setIssuedAt(value?: google_protobuf_timestamp_pb.Timestamp): CertificateResponse;
    getCertificateUrl(): string;
    setCertificateUrl(value: string): CertificateResponse;
    getVerificationCode(): string;
    setVerificationCode(value: string): CertificateResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): CertificateResponse.AsObject;
    static toObject(includeInstance: boolean, msg: CertificateResponse): CertificateResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: CertificateResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): CertificateResponse;
    static deserializeBinaryFromReader(message: CertificateResponse, reader: jspb.BinaryReader): CertificateResponse;
}

export namespace CertificateResponse {
    export type AsObject = {
        id: string,
        userId: string,
        courseId: string,
        courseTitle: string,
        userName: string,
        issuedAt?: google_protobuf_timestamp_pb.Timestamp.AsObject,
        certificateUrl: string,
        verificationCode: string,
    }
}

export class ListUserCoursesRequest extends jspb.Message { 
    getUserId(): string;
    setUserId(value: string): ListUserCoursesRequest;
    getPage(): number;
    setPage(value: number): ListUserCoursesRequest;
    getLimit(): number;
    setLimit(value: number): ListUserCoursesRequest;
    getCompletedOnly(): boolean;
    setCompletedOnly(value: boolean): ListUserCoursesRequest;
    getInProgressOnly(): boolean;
    setInProgressOnly(value: boolean): ListUserCoursesRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ListUserCoursesRequest.AsObject;
    static toObject(includeInstance: boolean, msg: ListUserCoursesRequest): ListUserCoursesRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ListUserCoursesRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ListUserCoursesRequest;
    static deserializeBinaryFromReader(message: ListUserCoursesRequest, reader: jspb.BinaryReader): ListUserCoursesRequest;
}

export namespace ListUserCoursesRequest {
    export type AsObject = {
        userId: string,
        page: number,
        limit: number,
        completedOnly: boolean,
        inProgressOnly: boolean,
    }
}

export class ListUserCoursesResponse extends jspb.Message { 
    clearCoursesList(): void;
    getCoursesList(): Array<UserCourseInfo>;
    setCoursesList(value: Array<UserCourseInfo>): ListUserCoursesResponse;
    addCourses(value?: UserCourseInfo, index?: number): UserCourseInfo;
    getTotal(): number;
    setTotal(value: number): ListUserCoursesResponse;
    getPage(): number;
    setPage(value: number): ListUserCoursesResponse;
    getLimit(): number;
    setLimit(value: number): ListUserCoursesResponse;
    getTotalPages(): number;
    setTotalPages(value: number): ListUserCoursesResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ListUserCoursesResponse.AsObject;
    static toObject(includeInstance: boolean, msg: ListUserCoursesResponse): ListUserCoursesResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ListUserCoursesResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ListUserCoursesResponse;
    static deserializeBinaryFromReader(message: ListUserCoursesResponse, reader: jspb.BinaryReader): ListUserCoursesResponse;
}

export namespace ListUserCoursesResponse {
    export type AsObject = {
        coursesList: Array<UserCourseInfo.AsObject>,
        total: number,
        page: number,
        limit: number,
        totalPages: number,
    }
}

export class UserCourseInfo extends jspb.Message { 

    hasCourse(): boolean;
    clearCourse(): void;
    getCourse(): CourseResponse | undefined;
    setCourse(value?: CourseResponse): UserCourseInfo;

    hasProgress(): boolean;
    clearProgress(): void;
    getProgress(): UserProgressResponse | undefined;
    setProgress(value?: UserProgressResponse): UserCourseInfo;

    hasEnrolledAt(): boolean;
    clearEnrolledAt(): void;
    getEnrolledAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setEnrolledAt(value?: google_protobuf_timestamp_pb.Timestamp): UserCourseInfo;
    getIsFavorite(): boolean;
    setIsFavorite(value: boolean): UserCourseInfo;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): UserCourseInfo.AsObject;
    static toObject(includeInstance: boolean, msg: UserCourseInfo): UserCourseInfo.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: UserCourseInfo, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): UserCourseInfo;
    static deserializeBinaryFromReader(message: UserCourseInfo, reader: jspb.BinaryReader): UserCourseInfo;
}

export namespace UserCourseInfo {
    export type AsObject = {
        course?: CourseResponse.AsObject,
        progress?: UserProgressResponse.AsObject,
        enrolledAt?: google_protobuf_timestamp_pb.Timestamp.AsObject,
        isFavorite: boolean,
    }
}

export enum CourseLevel {
    COURSE_LEVEL_UNSPECIFIED = 0,
    COURSE_LEVEL_BEGINNER = 1,
    COURSE_LEVEL_INTERMEDIATE = 2,
    COURSE_LEVEL_ADVANCED = 3,
}

export enum LessonType {
    LESSON_TYPE_UNSPECIFIED = 0,
    LESSON_TYPE_VIDEO = 1,
    LESSON_TYPE_TEXT = 2,
    LESSON_TYPE_QUIZ = 3,
    LESSON_TYPE_ASSIGNMENT = 4,
}
