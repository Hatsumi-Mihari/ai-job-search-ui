import { Module } from '@nestjs/common';
import { McpModule } from '@nestjs/mcp';
import { HelloTool } from './tools/mcpTool.service.js';

@Module({
  imports: [
    McpModule.forRoot({
      name: 'my-mcp-server',
      version: '1.0.0',
      path: '/mcp',
    }),
  ],
  controllers: [],
  providers: [HelloTool],
  exports: [McpServerModule],
})
export class McpServerModule {}