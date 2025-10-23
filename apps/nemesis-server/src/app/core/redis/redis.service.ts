import {Injectable, Logger, OnModuleDestroy, OnModuleInit} from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis;

  onModuleInit() {
    this.client = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      retryStrategy: (times) => Math.min(times * 50, 2000),
    });

    this.client.on('connect', () => {
      this.logger.log('✅ Conectado a Redis');
    });

    this.client.on('error', (err) => {
      this.logger.error('❌ Error en Redis:', err);
    });
  }

  onModuleDestroy() {
    this.client.disconnect();
    this.logger.log('❌ Desconectado de Redis');
  }

  getClient(): Redis {
    return this.client;
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.client.setex(key, ttlSeconds, value);
    } else {
      await this.client.set(key, value);
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }
}
