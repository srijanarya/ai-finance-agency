// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('@grpc/grpc-js');
var education_pb = require('./education_pb.js');
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

function serialize_treum_education_CertificateResponse(arg) {
  if (!(arg instanceof education_pb.CertificateResponse)) {
    throw new Error('Expected argument of type treum.education.CertificateResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_education_CertificateResponse(buffer_arg) {
  return education_pb.CertificateResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_education_CompleteCourseRequest(arg) {
  if (!(arg instanceof education_pb.CompleteCourseRequest)) {
    throw new Error('Expected argument of type treum.education.CompleteCourseRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_education_CompleteCourseRequest(buffer_arg) {
  return education_pb.CompleteCourseRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_education_CourseResponse(arg) {
  if (!(arg instanceof education_pb.CourseResponse)) {
    throw new Error('Expected argument of type treum.education.CourseResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_education_CourseResponse(buffer_arg) {
  return education_pb.CourseResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_education_CreateCourseRequest(arg) {
  if (!(arg instanceof education_pb.CreateCourseRequest)) {
    throw new Error('Expected argument of type treum.education.CreateCourseRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_education_CreateCourseRequest(buffer_arg) {
  return education_pb.CreateCourseRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_education_CreateLessonRequest(arg) {
  if (!(arg instanceof education_pb.CreateLessonRequest)) {
    throw new Error('Expected argument of type treum.education.CreateLessonRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_education_CreateLessonRequest(buffer_arg) {
  return education_pb.CreateLessonRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_education_DeleteCourseRequest(arg) {
  if (!(arg instanceof education_pb.DeleteCourseRequest)) {
    throw new Error('Expected argument of type treum.education.DeleteCourseRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_education_DeleteCourseRequest(buffer_arg) {
  return education_pb.DeleteCourseRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_education_DeleteLessonRequest(arg) {
  if (!(arg instanceof education_pb.DeleteLessonRequest)) {
    throw new Error('Expected argument of type treum.education.DeleteLessonRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_education_DeleteLessonRequest(buffer_arg) {
  return education_pb.DeleteLessonRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_education_EnrollInCourseRequest(arg) {
  if (!(arg instanceof education_pb.EnrollInCourseRequest)) {
    throw new Error('Expected argument of type treum.education.EnrollInCourseRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_education_EnrollInCourseRequest(buffer_arg) {
  return education_pb.EnrollInCourseRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_education_GetCertificateRequest(arg) {
  if (!(arg instanceof education_pb.GetCertificateRequest)) {
    throw new Error('Expected argument of type treum.education.GetCertificateRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_education_GetCertificateRequest(buffer_arg) {
  return education_pb.GetCertificateRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_education_GetCourseRequest(arg) {
  if (!(arg instanceof education_pb.GetCourseRequest)) {
    throw new Error('Expected argument of type treum.education.GetCourseRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_education_GetCourseRequest(buffer_arg) {
  return education_pb.GetCourseRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_education_GetLessonRequest(arg) {
  if (!(arg instanceof education_pb.GetLessonRequest)) {
    throw new Error('Expected argument of type treum.education.GetLessonRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_education_GetLessonRequest(buffer_arg) {
  return education_pb.GetLessonRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_education_GetUserProgressRequest(arg) {
  if (!(arg instanceof education_pb.GetUserProgressRequest)) {
    throw new Error('Expected argument of type treum.education.GetUserProgressRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_education_GetUserProgressRequest(buffer_arg) {
  return education_pb.GetUserProgressRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_education_LessonResponse(arg) {
  if (!(arg instanceof education_pb.LessonResponse)) {
    throw new Error('Expected argument of type treum.education.LessonResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_education_LessonResponse(buffer_arg) {
  return education_pb.LessonResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_education_ListCoursesRequest(arg) {
  if (!(arg instanceof education_pb.ListCoursesRequest)) {
    throw new Error('Expected argument of type treum.education.ListCoursesRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_education_ListCoursesRequest(buffer_arg) {
  return education_pb.ListCoursesRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_education_ListCoursesResponse(arg) {
  if (!(arg instanceof education_pb.ListCoursesResponse)) {
    throw new Error('Expected argument of type treum.education.ListCoursesResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_education_ListCoursesResponse(buffer_arg) {
  return education_pb.ListCoursesResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_education_ListLessonsRequest(arg) {
  if (!(arg instanceof education_pb.ListLessonsRequest)) {
    throw new Error('Expected argument of type treum.education.ListLessonsRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_education_ListLessonsRequest(buffer_arg) {
  return education_pb.ListLessonsRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_education_ListLessonsResponse(arg) {
  if (!(arg instanceof education_pb.ListLessonsResponse)) {
    throw new Error('Expected argument of type treum.education.ListLessonsResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_education_ListLessonsResponse(buffer_arg) {
  return education_pb.ListLessonsResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_education_ListUserCoursesRequest(arg) {
  if (!(arg instanceof education_pb.ListUserCoursesRequest)) {
    throw new Error('Expected argument of type treum.education.ListUserCoursesRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_education_ListUserCoursesRequest(buffer_arg) {
  return education_pb.ListUserCoursesRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_education_ListUserCoursesResponse(arg) {
  if (!(arg instanceof education_pb.ListUserCoursesResponse)) {
    throw new Error('Expected argument of type treum.education.ListUserCoursesResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_education_ListUserCoursesResponse(buffer_arg) {
  return education_pb.ListUserCoursesResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_education_UpdateCourseRequest(arg) {
  if (!(arg instanceof education_pb.UpdateCourseRequest)) {
    throw new Error('Expected argument of type treum.education.UpdateCourseRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_education_UpdateCourseRequest(buffer_arg) {
  return education_pb.UpdateCourseRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_education_UpdateLessonRequest(arg) {
  if (!(arg instanceof education_pb.UpdateLessonRequest)) {
    throw new Error('Expected argument of type treum.education.UpdateLessonRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_education_UpdateLessonRequest(buffer_arg) {
  return education_pb.UpdateLessonRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_education_UpdateUserProgressRequest(arg) {
  if (!(arg instanceof education_pb.UpdateUserProgressRequest)) {
    throw new Error('Expected argument of type treum.education.UpdateUserProgressRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_education_UpdateUserProgressRequest(buffer_arg) {
  return education_pb.UpdateUserProgressRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_treum_education_UserProgressResponse(arg) {
  if (!(arg instanceof education_pb.UserProgressResponse)) {
    throw new Error('Expected argument of type treum.education.UserProgressResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_treum_education_UserProgressResponse(buffer_arg) {
  return education_pb.UserProgressResponse.deserializeBinary(new Uint8Array(buffer_arg));
}


var EducationServiceService = exports.EducationServiceService = {
  createCourse: {
    path: '/treum.education.EducationService/CreateCourse',
    requestStream: false,
    responseStream: false,
    requestType: education_pb.CreateCourseRequest,
    responseType: education_pb.CourseResponse,
    requestSerialize: serialize_treum_education_CreateCourseRequest,
    requestDeserialize: deserialize_treum_education_CreateCourseRequest,
    responseSerialize: serialize_treum_education_CourseResponse,
    responseDeserialize: deserialize_treum_education_CourseResponse,
  },
  getCourse: {
    path: '/treum.education.EducationService/GetCourse',
    requestStream: false,
    responseStream: false,
    requestType: education_pb.GetCourseRequest,
    responseType: education_pb.CourseResponse,
    requestSerialize: serialize_treum_education_GetCourseRequest,
    requestDeserialize: deserialize_treum_education_GetCourseRequest,
    responseSerialize: serialize_treum_education_CourseResponse,
    responseDeserialize: deserialize_treum_education_CourseResponse,
  },
  listCourses: {
    path: '/treum.education.EducationService/ListCourses',
    requestStream: false,
    responseStream: false,
    requestType: education_pb.ListCoursesRequest,
    responseType: education_pb.ListCoursesResponse,
    requestSerialize: serialize_treum_education_ListCoursesRequest,
    requestDeserialize: deserialize_treum_education_ListCoursesRequest,
    responseSerialize: serialize_treum_education_ListCoursesResponse,
    responseDeserialize: deserialize_treum_education_ListCoursesResponse,
  },
  updateCourse: {
    path: '/treum.education.EducationService/UpdateCourse',
    requestStream: false,
    responseStream: false,
    requestType: education_pb.UpdateCourseRequest,
    responseType: education_pb.CourseResponse,
    requestSerialize: serialize_treum_education_UpdateCourseRequest,
    requestDeserialize: deserialize_treum_education_UpdateCourseRequest,
    responseSerialize: serialize_treum_education_CourseResponse,
    responseDeserialize: deserialize_treum_education_CourseResponse,
  },
  deleteCourse: {
    path: '/treum.education.EducationService/DeleteCourse',
    requestStream: false,
    responseStream: false,
    requestType: education_pb.DeleteCourseRequest,
    responseType: google_protobuf_empty_pb.Empty,
    requestSerialize: serialize_treum_education_DeleteCourseRequest,
    requestDeserialize: deserialize_treum_education_DeleteCourseRequest,
    responseSerialize: serialize_google_protobuf_Empty,
    responseDeserialize: deserialize_google_protobuf_Empty,
  },
  createLesson: {
    path: '/treum.education.EducationService/CreateLesson',
    requestStream: false,
    responseStream: false,
    requestType: education_pb.CreateLessonRequest,
    responseType: education_pb.LessonResponse,
    requestSerialize: serialize_treum_education_CreateLessonRequest,
    requestDeserialize: deserialize_treum_education_CreateLessonRequest,
    responseSerialize: serialize_treum_education_LessonResponse,
    responseDeserialize: deserialize_treum_education_LessonResponse,
  },
  getLesson: {
    path: '/treum.education.EducationService/GetLesson',
    requestStream: false,
    responseStream: false,
    requestType: education_pb.GetLessonRequest,
    responseType: education_pb.LessonResponse,
    requestSerialize: serialize_treum_education_GetLessonRequest,
    requestDeserialize: deserialize_treum_education_GetLessonRequest,
    responseSerialize: serialize_treum_education_LessonResponse,
    responseDeserialize: deserialize_treum_education_LessonResponse,
  },
  listLessons: {
    path: '/treum.education.EducationService/ListLessons',
    requestStream: false,
    responseStream: false,
    requestType: education_pb.ListLessonsRequest,
    responseType: education_pb.ListLessonsResponse,
    requestSerialize: serialize_treum_education_ListLessonsRequest,
    requestDeserialize: deserialize_treum_education_ListLessonsRequest,
    responseSerialize: serialize_treum_education_ListLessonsResponse,
    responseDeserialize: deserialize_treum_education_ListLessonsResponse,
  },
  updateLesson: {
    path: '/treum.education.EducationService/UpdateLesson',
    requestStream: false,
    responseStream: false,
    requestType: education_pb.UpdateLessonRequest,
    responseType: education_pb.LessonResponse,
    requestSerialize: serialize_treum_education_UpdateLessonRequest,
    requestDeserialize: deserialize_treum_education_UpdateLessonRequest,
    responseSerialize: serialize_treum_education_LessonResponse,
    responseDeserialize: deserialize_treum_education_LessonResponse,
  },
  deleteLesson: {
    path: '/treum.education.EducationService/DeleteLesson',
    requestStream: false,
    responseStream: false,
    requestType: education_pb.DeleteLessonRequest,
    responseType: google_protobuf_empty_pb.Empty,
    requestSerialize: serialize_treum_education_DeleteLessonRequest,
    requestDeserialize: deserialize_treum_education_DeleteLessonRequest,
    responseSerialize: serialize_google_protobuf_Empty,
    responseDeserialize: deserialize_google_protobuf_Empty,
  },
  enrollInCourse: {
    path: '/treum.education.EducationService/EnrollInCourse',
    requestStream: false,
    responseStream: false,
    requestType: education_pb.EnrollInCourseRequest,
    responseType: education_pb.UserProgressResponse,
    requestSerialize: serialize_treum_education_EnrollInCourseRequest,
    requestDeserialize: deserialize_treum_education_EnrollInCourseRequest,
    responseSerialize: serialize_treum_education_UserProgressResponse,
    responseDeserialize: deserialize_treum_education_UserProgressResponse,
  },
  getUserProgress: {
    path: '/treum.education.EducationService/GetUserProgress',
    requestStream: false,
    responseStream: false,
    requestType: education_pb.GetUserProgressRequest,
    responseType: education_pb.UserProgressResponse,
    requestSerialize: serialize_treum_education_GetUserProgressRequest,
    requestDeserialize: deserialize_treum_education_GetUserProgressRequest,
    responseSerialize: serialize_treum_education_UserProgressResponse,
    responseDeserialize: deserialize_treum_education_UserProgressResponse,
  },
  updateUserProgress: {
    path: '/treum.education.EducationService/UpdateUserProgress',
    requestStream: false,
    responseStream: false,
    requestType: education_pb.UpdateUserProgressRequest,
    responseType: education_pb.UserProgressResponse,
    requestSerialize: serialize_treum_education_UpdateUserProgressRequest,
    requestDeserialize: deserialize_treum_education_UpdateUserProgressRequest,
    responseSerialize: serialize_treum_education_UserProgressResponse,
    responseDeserialize: deserialize_treum_education_UserProgressResponse,
  },
  completeCourse: {
    path: '/treum.education.EducationService/CompleteCourse',
    requestStream: false,
    responseStream: false,
    requestType: education_pb.CompleteCourseRequest,
    responseType: education_pb.UserProgressResponse,
    requestSerialize: serialize_treum_education_CompleteCourseRequest,
    requestDeserialize: deserialize_treum_education_CompleteCourseRequest,
    responseSerialize: serialize_treum_education_UserProgressResponse,
    responseDeserialize: deserialize_treum_education_UserProgressResponse,
  },
  getCertificate: {
    path: '/treum.education.EducationService/GetCertificate',
    requestStream: false,
    responseStream: false,
    requestType: education_pb.GetCertificateRequest,
    responseType: education_pb.CertificateResponse,
    requestSerialize: serialize_treum_education_GetCertificateRequest,
    requestDeserialize: deserialize_treum_education_GetCertificateRequest,
    responseSerialize: serialize_treum_education_CertificateResponse,
    responseDeserialize: deserialize_treum_education_CertificateResponse,
  },
  listUserCourses: {
    path: '/treum.education.EducationService/ListUserCourses',
    requestStream: false,
    responseStream: false,
    requestType: education_pb.ListUserCoursesRequest,
    responseType: education_pb.ListUserCoursesResponse,
    requestSerialize: serialize_treum_education_ListUserCoursesRequest,
    requestDeserialize: deserialize_treum_education_ListUserCoursesRequest,
    responseSerialize: serialize_treum_education_ListUserCoursesResponse,
    responseDeserialize: deserialize_treum_education_ListUserCoursesResponse,
  },
};

exports.EducationServiceClient = grpc.makeGenericClientConstructor(EducationServiceService, 'EducationService');
