import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Synapse Knowledge Graph Service is running!';
  }
}