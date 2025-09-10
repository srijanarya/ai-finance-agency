# 5. INTERFACE DEPENDENCY MATRIX

| Interface | Depends On | Used By | Critical Path |
|-----------|------------|---------|---------------|
| API Gateway | Auth Service, All Services | Web, Mobile, Admin | Yes |
| User Management | Database, Cache, Event Bus | All Services | Yes |
| Education Platform | User Mgmt, Payment, Storage | Web, Mobile | Yes |
| Signal Generation | Market Data, ML Models, Event Bus | Web, Mobile, Trading | Yes |
| Payment Processing | User Mgmt, KYC, External Gateway | Education, Signals | Yes |
| WebSocket | Redis, Event Bus | Web, Mobile | Yes |
| Database Access | PostgreSQL, MongoDB, Redis | All Services | Yes |
| Event Bus | Kafka, Redis | All Services | Yes |
| Cache | Redis | All Services | No |
| Exchange Integration | External APIs | Trading Service | Yes |
| KYC Provider | External APIs | User Management | Yes |
| Analytics | Database, Event Bus | Admin, Reports | No |
| Notification | Email, SMS, Push Services | All Services | No |
| Audit Logging | Database, Event Bus | All Services | Yes |

---
