import { Injectable, Logger } from '@nestjs/common';
import { Tool } from '@nestjs/mcp';
import { z } from 'zod';

@Injectable()
export class HelloTool {
  @Tool({
    name: 'hello',
    description: 'Returns greeting',
    inputSchema: z.object({
      name: z.string().describe('Имя пользователя'),
    }),
  })
  async hello({ name }: { name: string }) {
    Logger.log(`name: ${name}`, 'MPC SERVER TOOL TEST');
    return {
      content: [
        {
          type: 'text',
          text: `Hello, ${name}!`,
        },
      ],
    };
  }
}
