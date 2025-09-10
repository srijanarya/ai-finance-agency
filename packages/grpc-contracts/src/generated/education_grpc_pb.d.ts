// package: treum.education
// file: education.proto

/* tslint:disable */
/* eslint-disable */

import * as grpc from "@grpc/grpc-js";
import * as education_pb from "./education_pb";
import * as google_protobuf_timestamp_pb from "google-protobuf/google/protobuf/timestamp_pb";
import * as google_protobuf_empty_pb from "google-protobuf/google/protobuf/empty_pb";

interface IEducationServiceService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
    createCourse: IEducationServiceService_ICreateCourse;
    getCourse: IEducationServiceService_IGetCourse;
    listCourses: IEducationServiceService_IListCourses;
    updateCourse: IEducationServiceService_IUpdateCourse;
    deleteCourse: IEducationServiceService_IDeleteCourse;
    createLesson: IEducationServiceService_ICreateLesson;
    getLesson: IEducationServiceService_IGetLesson;
    listLessons: IEducationServiceService_IListLessons;
    updateLesson: IEducationServiceService_IUpdateLesson;
    deleteLesson: IEducationServiceService_IDeleteLesson;
    enrollInCourse: IEducationServiceService_IEnrollInCourse;
    getUserProgress: IEducationServiceService_IGetUserProgress;
    updateUserProgress: IEducationServiceService_IUpdateUserProgress;
    completeCourse: IEducationServiceService_ICompleteCourse;
    getCertificate: IEducationServiceService_IGetCertificate;
    listUserCourses: IEducationServiceService_IListUserCourses;
}

interface IEducationServiceService_ICreateCourse extends grpc.MethodDefinition<education_pb.CreateCourseRequest, education_pb.CourseResponse> {
    path: "/treum.education.EducationService/CreateCourse";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<education_pb.CreateCourseRequest>;
    requestDeserialize: grpc.deserialize<education_pb.CreateCourseRequest>;
    responseSerialize: grpc.serialize<education_pb.CourseResponse>;
    responseDeserialize: grpc.deserialize<education_pb.CourseResponse>;
}
interface IEducationServiceService_IGetCourse extends grpc.MethodDefinition<education_pb.GetCourseRequest, education_pb.CourseResponse> {
    path: "/treum.education.EducationService/GetCourse";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<education_pb.GetCourseRequest>;
    requestDeserialize: grpc.deserialize<education_pb.GetCourseRequest>;
    responseSerialize: grpc.serialize<education_pb.CourseResponse>;
    responseDeserialize: grpc.deserialize<education_pb.CourseResponse>;
}
interface IEducationServiceService_IListCourses extends grpc.MethodDefinition<education_pb.ListCoursesRequest, education_pb.ListCoursesResponse> {
    path: "/treum.education.EducationService/ListCourses";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<education_pb.ListCoursesRequest>;
    requestDeserialize: grpc.deserialize<education_pb.ListCoursesRequest>;
    responseSerialize: grpc.serialize<education_pb.ListCoursesResponse>;
    responseDeserialize: grpc.deserialize<education_pb.ListCoursesResponse>;
}
interface IEducationServiceService_IUpdateCourse extends grpc.MethodDefinition<education_pb.UpdateCourseRequest, education_pb.CourseResponse> {
    path: "/treum.education.EducationService/UpdateCourse";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<education_pb.UpdateCourseRequest>;
    requestDeserialize: grpc.deserialize<education_pb.UpdateCourseRequest>;
    responseSerialize: grpc.serialize<education_pb.CourseResponse>;
    responseDeserialize: grpc.deserialize<education_pb.CourseResponse>;
}
interface IEducationServiceService_IDeleteCourse extends grpc.MethodDefinition<education_pb.DeleteCourseRequest, google_protobuf_empty_pb.Empty> {
    path: "/treum.education.EducationService/DeleteCourse";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<education_pb.DeleteCourseRequest>;
    requestDeserialize: grpc.deserialize<education_pb.DeleteCourseRequest>;
    responseSerialize: grpc.serialize<google_protobuf_empty_pb.Empty>;
    responseDeserialize: grpc.deserialize<google_protobuf_empty_pb.Empty>;
}
interface IEducationServiceService_ICreateLesson extends grpc.MethodDefinition<education_pb.CreateLessonRequest, education_pb.LessonResponse> {
    path: "/treum.education.EducationService/CreateLesson";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<education_pb.CreateLessonRequest>;
    requestDeserialize: grpc.deserialize<education_pb.CreateLessonRequest>;
    responseSerialize: grpc.serialize<education_pb.LessonResponse>;
    responseDeserialize: grpc.deserialize<education_pb.LessonResponse>;
}
interface IEducationServiceService_IGetLesson extends grpc.MethodDefinition<education_pb.GetLessonRequest, education_pb.LessonResponse> {
    path: "/treum.education.EducationService/GetLesson";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<education_pb.GetLessonRequest>;
    requestDeserialize: grpc.deserialize<education_pb.GetLessonRequest>;
    responseSerialize: grpc.serialize<education_pb.LessonResponse>;
    responseDeserialize: grpc.deserialize<education_pb.LessonResponse>;
}
interface IEducationServiceService_IListLessons extends grpc.MethodDefinition<education_pb.ListLessonsRequest, education_pb.ListLessonsResponse> {
    path: "/treum.education.EducationService/ListLessons";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<education_pb.ListLessonsRequest>;
    requestDeserialize: grpc.deserialize<education_pb.ListLessonsRequest>;
    responseSerialize: grpc.serialize<education_pb.ListLessonsResponse>;
    responseDeserialize: grpc.deserialize<education_pb.ListLessonsResponse>;
}
interface IEducationServiceService_IUpdateLesson extends grpc.MethodDefinition<education_pb.UpdateLessonRequest, education_pb.LessonResponse> {
    path: "/treum.education.EducationService/UpdateLesson";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<education_pb.UpdateLessonRequest>;
    requestDeserialize: grpc.deserialize<education_pb.UpdateLessonRequest>;
    responseSerialize: grpc.serialize<education_pb.LessonResponse>;
    responseDeserialize: grpc.deserialize<education_pb.LessonResponse>;
}
interface IEducationServiceService_IDeleteLesson extends grpc.MethodDefinition<education_pb.DeleteLessonRequest, google_protobuf_empty_pb.Empty> {
    path: "/treum.education.EducationService/DeleteLesson";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<education_pb.DeleteLessonRequest>;
    requestDeserialize: grpc.deserialize<education_pb.DeleteLessonRequest>;
    responseSerialize: grpc.serialize<google_protobuf_empty_pb.Empty>;
    responseDeserialize: grpc.deserialize<google_protobuf_empty_pb.Empty>;
}
interface IEducationServiceService_IEnrollInCourse extends grpc.MethodDefinition<education_pb.EnrollInCourseRequest, education_pb.UserProgressResponse> {
    path: "/treum.education.EducationService/EnrollInCourse";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<education_pb.EnrollInCourseRequest>;
    requestDeserialize: grpc.deserialize<education_pb.EnrollInCourseRequest>;
    responseSerialize: grpc.serialize<education_pb.UserProgressResponse>;
    responseDeserialize: grpc.deserialize<education_pb.UserProgressResponse>;
}
interface IEducationServiceService_IGetUserProgress extends grpc.MethodDefinition<education_pb.GetUserProgressRequest, education_pb.UserProgressResponse> {
    path: "/treum.education.EducationService/GetUserProgress";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<education_pb.GetUserProgressRequest>;
    requestDeserialize: grpc.deserialize<education_pb.GetUserProgressRequest>;
    responseSerialize: grpc.serialize<education_pb.UserProgressResponse>;
    responseDeserialize: grpc.deserialize<education_pb.UserProgressResponse>;
}
interface IEducationServiceService_IUpdateUserProgress extends grpc.MethodDefinition<education_pb.UpdateUserProgressRequest, education_pb.UserProgressResponse> {
    path: "/treum.education.EducationService/UpdateUserProgress";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<education_pb.UpdateUserProgressRequest>;
    requestDeserialize: grpc.deserialize<education_pb.UpdateUserProgressRequest>;
    responseSerialize: grpc.serialize<education_pb.UserProgressResponse>;
    responseDeserialize: grpc.deserialize<education_pb.UserProgressResponse>;
}
interface IEducationServiceService_ICompleteCourse extends grpc.MethodDefinition<education_pb.CompleteCourseRequest, education_pb.UserProgressResponse> {
    path: "/treum.education.EducationService/CompleteCourse";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<education_pb.CompleteCourseRequest>;
    requestDeserialize: grpc.deserialize<education_pb.CompleteCourseRequest>;
    responseSerialize: grpc.serialize<education_pb.UserProgressResponse>;
    responseDeserialize: grpc.deserialize<education_pb.UserProgressResponse>;
}
interface IEducationServiceService_IGetCertificate extends grpc.MethodDefinition<education_pb.GetCertificateRequest, education_pb.CertificateResponse> {
    path: "/treum.education.EducationService/GetCertificate";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<education_pb.GetCertificateRequest>;
    requestDeserialize: grpc.deserialize<education_pb.GetCertificateRequest>;
    responseSerialize: grpc.serialize<education_pb.CertificateResponse>;
    responseDeserialize: grpc.deserialize<education_pb.CertificateResponse>;
}
interface IEducationServiceService_IListUserCourses extends grpc.MethodDefinition<education_pb.ListUserCoursesRequest, education_pb.ListUserCoursesResponse> {
    path: "/treum.education.EducationService/ListUserCourses";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<education_pb.ListUserCoursesRequest>;
    requestDeserialize: grpc.deserialize<education_pb.ListUserCoursesRequest>;
    responseSerialize: grpc.serialize<education_pb.ListUserCoursesResponse>;
    responseDeserialize: grpc.deserialize<education_pb.ListUserCoursesResponse>;
}

export const EducationServiceService: IEducationServiceService;

export interface IEducationServiceServer extends grpc.UntypedServiceImplementation {
    createCourse: grpc.handleUnaryCall<education_pb.CreateCourseRequest, education_pb.CourseResponse>;
    getCourse: grpc.handleUnaryCall<education_pb.GetCourseRequest, education_pb.CourseResponse>;
    listCourses: grpc.handleUnaryCall<education_pb.ListCoursesRequest, education_pb.ListCoursesResponse>;
    updateCourse: grpc.handleUnaryCall<education_pb.UpdateCourseRequest, education_pb.CourseResponse>;
    deleteCourse: grpc.handleUnaryCall<education_pb.DeleteCourseRequest, google_protobuf_empty_pb.Empty>;
    createLesson: grpc.handleUnaryCall<education_pb.CreateLessonRequest, education_pb.LessonResponse>;
    getLesson: grpc.handleUnaryCall<education_pb.GetLessonRequest, education_pb.LessonResponse>;
    listLessons: grpc.handleUnaryCall<education_pb.ListLessonsRequest, education_pb.ListLessonsResponse>;
    updateLesson: grpc.handleUnaryCall<education_pb.UpdateLessonRequest, education_pb.LessonResponse>;
    deleteLesson: grpc.handleUnaryCall<education_pb.DeleteLessonRequest, google_protobuf_empty_pb.Empty>;
    enrollInCourse: grpc.handleUnaryCall<education_pb.EnrollInCourseRequest, education_pb.UserProgressResponse>;
    getUserProgress: grpc.handleUnaryCall<education_pb.GetUserProgressRequest, education_pb.UserProgressResponse>;
    updateUserProgress: grpc.handleUnaryCall<education_pb.UpdateUserProgressRequest, education_pb.UserProgressResponse>;
    completeCourse: grpc.handleUnaryCall<education_pb.CompleteCourseRequest, education_pb.UserProgressResponse>;
    getCertificate: grpc.handleUnaryCall<education_pb.GetCertificateRequest, education_pb.CertificateResponse>;
    listUserCourses: grpc.handleUnaryCall<education_pb.ListUserCoursesRequest, education_pb.ListUserCoursesResponse>;
}

export interface IEducationServiceClient {
    createCourse(request: education_pb.CreateCourseRequest, callback: (error: grpc.ServiceError | null, response: education_pb.CourseResponse) => void): grpc.ClientUnaryCall;
    createCourse(request: education_pb.CreateCourseRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: education_pb.CourseResponse) => void): grpc.ClientUnaryCall;
    createCourse(request: education_pb.CreateCourseRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: education_pb.CourseResponse) => void): grpc.ClientUnaryCall;
    getCourse(request: education_pb.GetCourseRequest, callback: (error: grpc.ServiceError | null, response: education_pb.CourseResponse) => void): grpc.ClientUnaryCall;
    getCourse(request: education_pb.GetCourseRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: education_pb.CourseResponse) => void): grpc.ClientUnaryCall;
    getCourse(request: education_pb.GetCourseRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: education_pb.CourseResponse) => void): grpc.ClientUnaryCall;
    listCourses(request: education_pb.ListCoursesRequest, callback: (error: grpc.ServiceError | null, response: education_pb.ListCoursesResponse) => void): grpc.ClientUnaryCall;
    listCourses(request: education_pb.ListCoursesRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: education_pb.ListCoursesResponse) => void): grpc.ClientUnaryCall;
    listCourses(request: education_pb.ListCoursesRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: education_pb.ListCoursesResponse) => void): grpc.ClientUnaryCall;
    updateCourse(request: education_pb.UpdateCourseRequest, callback: (error: grpc.ServiceError | null, response: education_pb.CourseResponse) => void): grpc.ClientUnaryCall;
    updateCourse(request: education_pb.UpdateCourseRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: education_pb.CourseResponse) => void): grpc.ClientUnaryCall;
    updateCourse(request: education_pb.UpdateCourseRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: education_pb.CourseResponse) => void): grpc.ClientUnaryCall;
    deleteCourse(request: education_pb.DeleteCourseRequest, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    deleteCourse(request: education_pb.DeleteCourseRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    deleteCourse(request: education_pb.DeleteCourseRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    createLesson(request: education_pb.CreateLessonRequest, callback: (error: grpc.ServiceError | null, response: education_pb.LessonResponse) => void): grpc.ClientUnaryCall;
    createLesson(request: education_pb.CreateLessonRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: education_pb.LessonResponse) => void): grpc.ClientUnaryCall;
    createLesson(request: education_pb.CreateLessonRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: education_pb.LessonResponse) => void): grpc.ClientUnaryCall;
    getLesson(request: education_pb.GetLessonRequest, callback: (error: grpc.ServiceError | null, response: education_pb.LessonResponse) => void): grpc.ClientUnaryCall;
    getLesson(request: education_pb.GetLessonRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: education_pb.LessonResponse) => void): grpc.ClientUnaryCall;
    getLesson(request: education_pb.GetLessonRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: education_pb.LessonResponse) => void): grpc.ClientUnaryCall;
    listLessons(request: education_pb.ListLessonsRequest, callback: (error: grpc.ServiceError | null, response: education_pb.ListLessonsResponse) => void): grpc.ClientUnaryCall;
    listLessons(request: education_pb.ListLessonsRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: education_pb.ListLessonsResponse) => void): grpc.ClientUnaryCall;
    listLessons(request: education_pb.ListLessonsRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: education_pb.ListLessonsResponse) => void): grpc.ClientUnaryCall;
    updateLesson(request: education_pb.UpdateLessonRequest, callback: (error: grpc.ServiceError | null, response: education_pb.LessonResponse) => void): grpc.ClientUnaryCall;
    updateLesson(request: education_pb.UpdateLessonRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: education_pb.LessonResponse) => void): grpc.ClientUnaryCall;
    updateLesson(request: education_pb.UpdateLessonRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: education_pb.LessonResponse) => void): grpc.ClientUnaryCall;
    deleteLesson(request: education_pb.DeleteLessonRequest, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    deleteLesson(request: education_pb.DeleteLessonRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    deleteLesson(request: education_pb.DeleteLessonRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    enrollInCourse(request: education_pb.EnrollInCourseRequest, callback: (error: grpc.ServiceError | null, response: education_pb.UserProgressResponse) => void): grpc.ClientUnaryCall;
    enrollInCourse(request: education_pb.EnrollInCourseRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: education_pb.UserProgressResponse) => void): grpc.ClientUnaryCall;
    enrollInCourse(request: education_pb.EnrollInCourseRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: education_pb.UserProgressResponse) => void): grpc.ClientUnaryCall;
    getUserProgress(request: education_pb.GetUserProgressRequest, callback: (error: grpc.ServiceError | null, response: education_pb.UserProgressResponse) => void): grpc.ClientUnaryCall;
    getUserProgress(request: education_pb.GetUserProgressRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: education_pb.UserProgressResponse) => void): grpc.ClientUnaryCall;
    getUserProgress(request: education_pb.GetUserProgressRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: education_pb.UserProgressResponse) => void): grpc.ClientUnaryCall;
    updateUserProgress(request: education_pb.UpdateUserProgressRequest, callback: (error: grpc.ServiceError | null, response: education_pb.UserProgressResponse) => void): grpc.ClientUnaryCall;
    updateUserProgress(request: education_pb.UpdateUserProgressRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: education_pb.UserProgressResponse) => void): grpc.ClientUnaryCall;
    updateUserProgress(request: education_pb.UpdateUserProgressRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: education_pb.UserProgressResponse) => void): grpc.ClientUnaryCall;
    completeCourse(request: education_pb.CompleteCourseRequest, callback: (error: grpc.ServiceError | null, response: education_pb.UserProgressResponse) => void): grpc.ClientUnaryCall;
    completeCourse(request: education_pb.CompleteCourseRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: education_pb.UserProgressResponse) => void): grpc.ClientUnaryCall;
    completeCourse(request: education_pb.CompleteCourseRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: education_pb.UserProgressResponse) => void): grpc.ClientUnaryCall;
    getCertificate(request: education_pb.GetCertificateRequest, callback: (error: grpc.ServiceError | null, response: education_pb.CertificateResponse) => void): grpc.ClientUnaryCall;
    getCertificate(request: education_pb.GetCertificateRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: education_pb.CertificateResponse) => void): grpc.ClientUnaryCall;
    getCertificate(request: education_pb.GetCertificateRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: education_pb.CertificateResponse) => void): grpc.ClientUnaryCall;
    listUserCourses(request: education_pb.ListUserCoursesRequest, callback: (error: grpc.ServiceError | null, response: education_pb.ListUserCoursesResponse) => void): grpc.ClientUnaryCall;
    listUserCourses(request: education_pb.ListUserCoursesRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: education_pb.ListUserCoursesResponse) => void): grpc.ClientUnaryCall;
    listUserCourses(request: education_pb.ListUserCoursesRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: education_pb.ListUserCoursesResponse) => void): grpc.ClientUnaryCall;
}

export class EducationServiceClient extends grpc.Client implements IEducationServiceClient {
    constructor(address: string, credentials: grpc.ChannelCredentials, options?: Partial<grpc.ClientOptions>);
    public createCourse(request: education_pb.CreateCourseRequest, callback: (error: grpc.ServiceError | null, response: education_pb.CourseResponse) => void): grpc.ClientUnaryCall;
    public createCourse(request: education_pb.CreateCourseRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: education_pb.CourseResponse) => void): grpc.ClientUnaryCall;
    public createCourse(request: education_pb.CreateCourseRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: education_pb.CourseResponse) => void): grpc.ClientUnaryCall;
    public getCourse(request: education_pb.GetCourseRequest, callback: (error: grpc.ServiceError | null, response: education_pb.CourseResponse) => void): grpc.ClientUnaryCall;
    public getCourse(request: education_pb.GetCourseRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: education_pb.CourseResponse) => void): grpc.ClientUnaryCall;
    public getCourse(request: education_pb.GetCourseRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: education_pb.CourseResponse) => void): grpc.ClientUnaryCall;
    public listCourses(request: education_pb.ListCoursesRequest, callback: (error: grpc.ServiceError | null, response: education_pb.ListCoursesResponse) => void): grpc.ClientUnaryCall;
    public listCourses(request: education_pb.ListCoursesRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: education_pb.ListCoursesResponse) => void): grpc.ClientUnaryCall;
    public listCourses(request: education_pb.ListCoursesRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: education_pb.ListCoursesResponse) => void): grpc.ClientUnaryCall;
    public updateCourse(request: education_pb.UpdateCourseRequest, callback: (error: grpc.ServiceError | null, response: education_pb.CourseResponse) => void): grpc.ClientUnaryCall;
    public updateCourse(request: education_pb.UpdateCourseRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: education_pb.CourseResponse) => void): grpc.ClientUnaryCall;
    public updateCourse(request: education_pb.UpdateCourseRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: education_pb.CourseResponse) => void): grpc.ClientUnaryCall;
    public deleteCourse(request: education_pb.DeleteCourseRequest, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public deleteCourse(request: education_pb.DeleteCourseRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public deleteCourse(request: education_pb.DeleteCourseRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public createLesson(request: education_pb.CreateLessonRequest, callback: (error: grpc.ServiceError | null, response: education_pb.LessonResponse) => void): grpc.ClientUnaryCall;
    public createLesson(request: education_pb.CreateLessonRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: education_pb.LessonResponse) => void): grpc.ClientUnaryCall;
    public createLesson(request: education_pb.CreateLessonRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: education_pb.LessonResponse) => void): grpc.ClientUnaryCall;
    public getLesson(request: education_pb.GetLessonRequest, callback: (error: grpc.ServiceError | null, response: education_pb.LessonResponse) => void): grpc.ClientUnaryCall;
    public getLesson(request: education_pb.GetLessonRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: education_pb.LessonResponse) => void): grpc.ClientUnaryCall;
    public getLesson(request: education_pb.GetLessonRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: education_pb.LessonResponse) => void): grpc.ClientUnaryCall;
    public listLessons(request: education_pb.ListLessonsRequest, callback: (error: grpc.ServiceError | null, response: education_pb.ListLessonsResponse) => void): grpc.ClientUnaryCall;
    public listLessons(request: education_pb.ListLessonsRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: education_pb.ListLessonsResponse) => void): grpc.ClientUnaryCall;
    public listLessons(request: education_pb.ListLessonsRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: education_pb.ListLessonsResponse) => void): grpc.ClientUnaryCall;
    public updateLesson(request: education_pb.UpdateLessonRequest, callback: (error: grpc.ServiceError | null, response: education_pb.LessonResponse) => void): grpc.ClientUnaryCall;
    public updateLesson(request: education_pb.UpdateLessonRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: education_pb.LessonResponse) => void): grpc.ClientUnaryCall;
    public updateLesson(request: education_pb.UpdateLessonRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: education_pb.LessonResponse) => void): grpc.ClientUnaryCall;
    public deleteLesson(request: education_pb.DeleteLessonRequest, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public deleteLesson(request: education_pb.DeleteLessonRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public deleteLesson(request: education_pb.DeleteLessonRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public enrollInCourse(request: education_pb.EnrollInCourseRequest, callback: (error: grpc.ServiceError | null, response: education_pb.UserProgressResponse) => void): grpc.ClientUnaryCall;
    public enrollInCourse(request: education_pb.EnrollInCourseRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: education_pb.UserProgressResponse) => void): grpc.ClientUnaryCall;
    public enrollInCourse(request: education_pb.EnrollInCourseRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: education_pb.UserProgressResponse) => void): grpc.ClientUnaryCall;
    public getUserProgress(request: education_pb.GetUserProgressRequest, callback: (error: grpc.ServiceError | null, response: education_pb.UserProgressResponse) => void): grpc.ClientUnaryCall;
    public getUserProgress(request: education_pb.GetUserProgressRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: education_pb.UserProgressResponse) => void): grpc.ClientUnaryCall;
    public getUserProgress(request: education_pb.GetUserProgressRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: education_pb.UserProgressResponse) => void): grpc.ClientUnaryCall;
    public updateUserProgress(request: education_pb.UpdateUserProgressRequest, callback: (error: grpc.ServiceError | null, response: education_pb.UserProgressResponse) => void): grpc.ClientUnaryCall;
    public updateUserProgress(request: education_pb.UpdateUserProgressRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: education_pb.UserProgressResponse) => void): grpc.ClientUnaryCall;
    public updateUserProgress(request: education_pb.UpdateUserProgressRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: education_pb.UserProgressResponse) => void): grpc.ClientUnaryCall;
    public completeCourse(request: education_pb.CompleteCourseRequest, callback: (error: grpc.ServiceError | null, response: education_pb.UserProgressResponse) => void): grpc.ClientUnaryCall;
    public completeCourse(request: education_pb.CompleteCourseRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: education_pb.UserProgressResponse) => void): grpc.ClientUnaryCall;
    public completeCourse(request: education_pb.CompleteCourseRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: education_pb.UserProgressResponse) => void): grpc.ClientUnaryCall;
    public getCertificate(request: education_pb.GetCertificateRequest, callback: (error: grpc.ServiceError | null, response: education_pb.CertificateResponse) => void): grpc.ClientUnaryCall;
    public getCertificate(request: education_pb.GetCertificateRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: education_pb.CertificateResponse) => void): grpc.ClientUnaryCall;
    public getCertificate(request: education_pb.GetCertificateRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: education_pb.CertificateResponse) => void): grpc.ClientUnaryCall;
    public listUserCourses(request: education_pb.ListUserCoursesRequest, callback: (error: grpc.ServiceError | null, response: education_pb.ListUserCoursesResponse) => void): grpc.ClientUnaryCall;
    public listUserCourses(request: education_pb.ListUserCoursesRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: education_pb.ListUserCoursesResponse) => void): grpc.ClientUnaryCall;
    public listUserCourses(request: education_pb.ListUserCoursesRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: education_pb.ListUserCoursesResponse) => void): grpc.ClientUnaryCall;
}
