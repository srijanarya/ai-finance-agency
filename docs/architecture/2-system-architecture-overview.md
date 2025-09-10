# 2. System Architecture Overview

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        TREUM ALGOTECH PLATFORM                  │
├─────────────────────────────────────────────────────────────────┤
│  Frontend Layer                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │ Web Portal  │  │ Mobile Apps │  │ Admin Panel │             │
│  │ (Next.js)   │  │(React Native│  │  (React)    │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
├─────────────────────────────────────────────────────────────────┤
│  API Gateway Layer                                              │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ Kong API Gateway + Auth0 + Rate Limiting + Load Balancer  │ │
│  └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│  Microservices Layer                                           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐│
│  │User Mgmt │ │Education │ │ Signals  │ │ Trading  │ │Payment ││
│  │ Service  │ │ Service  │ │ Service  │ │ Service  │ │Service ││
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └────────┘│
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │Analytics │ │Notification│ │ Content  │ │ Audit    │           │
│  │ Service  │ │ Service   │ │ Service  │ │ Service  │           │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │
├─────────────────────────────────────────────────────────────────┤
│  Data Layer                                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │PostgreSQL│ │ MongoDB  │ │  Redis   │ │InfluxDB  │           │
│  │(Transact)│ │(Content) │ │ (Cache)  │ │(Metrics) │           │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │
├─────────────────────────────────────────────────────────────────┤
│  Message & Event Layer                                         │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ Apache Kafka + Event Store + WebSocket Clusters           │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Component Interactions

**Request Flow**:
1. Client → API Gateway → Authentication → Service
2. Service → Event Bus → Dependent Services
3. Service → Database → Cache → Response

**Event Flow**:
1. Signal Generated → Kafka Topic → Real-time Distribution
2. Payment Processed → Event Store → Audit & Analytics
3. User Action → Event Bus → Multiple Service Updates

---
