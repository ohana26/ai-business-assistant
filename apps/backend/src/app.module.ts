import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { appConfig } from './config/app.config';
import { validateEnvironment } from './config/environment.validation';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { WorkspacesModule } from './modules/workspaces/workspaces.module';
import { KnowledgeModule } from './modules/knowledge/knowledge.module';
import { AssistantsModule } from './modules/assistants/assistants.module';
import { AgentModule } from './modules/agent/agent.module';
import { ToolsModule } from './modules/tools/tools.module';
import { AiProvidersModule } from './modules/ai-providers/ai-providers.module';
import { HealthModule } from './health/health.module';
import { DatabaseModule } from './database/database.module';
import { AuditModule } from './modules/audit/audit.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      validate: validateEnvironment,
      envFilePath: ['.env'],
    }),
    DatabaseModule,
    AuditModule,
    HealthModule,
    AuthModule,
    UsersModule,
    CompaniesModule,
    WorkspacesModule,
    KnowledgeModule,
    AssistantsModule,
    AgentModule,
    ToolsModule,
    AiProvidersModule,
  ],
})
export class AppModule {}
