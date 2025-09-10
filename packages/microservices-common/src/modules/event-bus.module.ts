import { Module, DynamicModule, Global } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { EventBusService } from './event-bus.service';
import { EventPublisher } from './event-publisher.service';
import { EventSubscriber } from './event-subscriber.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

export interface EventBusModuleOptions {
  rabbitMqUrl?: string;
  exchange?: string;
  queues?: Array<{
    name: string;
    routingKey: string;
    durable?: boolean;
  }>;
}

@Global()
@Module({})
export class EventBusModule {
  static forRoot(options: EventBusModuleOptions = {}): DynamicModule {
    return {
      module: EventBusModule,
      imports: [
        ConfigModule,
        ClientsModule.registerAsync([
          {
            name: 'RABBITMQ_SERVICE',
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
              transport: Transport.RMQ,
              options: {
                urls: [options.rabbitMqUrl || configService.get('RABBITMQ_URL', 'amqp://localhost:5672')],
                queue: `${configService.get('SERVICE_NAME', 'unknown')}_queue`,
                queueOptions: {
                  durable: true,
                  exclusive: false,
                  autoDelete: false,
                  arguments: {
                    'x-message-ttl': 300000, // 5 minutes
                    'x-max-retries': 3,
                  },
                },
                socketOptions: {
                  heartbeatIntervalInSeconds: 60,
                  reconnectTimeInSeconds: 5,
                },
              },
            }),
            inject: [ConfigService],
          },
        ]),
      ],
      providers: [
        EventBusService,
        EventPublisher,
        EventSubscriber,
        {
          provide: 'EVENT_BUS_OPTIONS',
          useValue: options,
        },
      ],
      exports: [
        EventBusService,
        EventPublisher,
        EventSubscriber,
        ClientsModule,
      ],
    };
  }
}