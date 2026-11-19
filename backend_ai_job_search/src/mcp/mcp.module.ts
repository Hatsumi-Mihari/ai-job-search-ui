import { forwardRef, Module } from '@nestjs/common';
import { McpModule } from '@nestjs/mcp';
import { HelloTool } from './tools/mcpTool.service.js';
import { McpVacWorker } from '@/mcp/tools/mcpWorkers/vacancy/mcpVac.service.js';
import { McpUserDataModule } from '@/mcp/tools/mcpWorkers/user_data/mcpUserData.module.js';
import { WorkersModule } from '@/common/workers/worker.module.js';

@Module({
  imports: [
    McpModule.forRoot({
      name: 'my-mcp-server',
      version: '1.0.0',
      path: '/mcp',
    }),
    forwardRef(() => WorkersModule),
    McpUserDataModule,
  ],
  controllers: [],
  providers: [HelloTool],
  exports: [McpServerModule],
})
export class McpServerModule {}
