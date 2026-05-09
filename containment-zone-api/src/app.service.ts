import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'THE CONTAINMENT ZONE API — OPERATIONAL';
  }
}
