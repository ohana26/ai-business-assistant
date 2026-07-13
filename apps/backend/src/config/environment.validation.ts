import { plainToInstance } from 'class-transformer';
import {
  IsIn,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  Matches,
  IsUrl,
  validateSync,
} from 'class-validator';

class EnvironmentVariables {
  @IsNumberString()
  PORT!: string;

  @IsString()
  @IsNotEmpty()
  DATABASE_URL!: string;

  @IsString()
  @IsIn(['ollama', 'openai', 'anthropic', 'azure-openai', 'private-llm'])
  AI_PROVIDER!: string;

  @IsString()
  @IsUrl({
    require_tld: false,
  })
  OLLAMA_URL!: string;

  @IsOptional()
  @IsString()
  NODE_ENV?: string;

  @IsOptional()
  @IsString()
  CORS_ORIGINS?: string;

  @IsString()
  @IsNotEmpty()
  JWT_ACCESS_SECRET!: string;

  @IsString()
  @IsNotEmpty()
  JWT_REFRESH_SECRET!: string;

  @IsString()
  @Matches(/^\d+[smhd]$/i)
  JWT_ACCESS_EXPIRES_IN!: string;

  @IsString()
  @Matches(/^\d+[smhd]$/i)
  JWT_REFRESH_EXPIRES_IN!: string;

  @IsString()
  @IsIn(['local', 's3', 'azure-blob', 'private-cloud'])
  STORAGE_PROVIDER!: string;

  @IsString()
  @IsNotEmpty()
  STORAGE_PATH!: string;

  @IsOptional()
  @IsString()
  OLLAMA_CHAT_MODEL?: string;

  @IsOptional()
  @IsString()
  OLLAMA_EMBED_MODEL?: string;

  @IsOptional()
  @IsNumberString()
  CHUNK_SIZE?: string;

  @IsOptional()
  @IsNumberString()
  CHUNK_OVERLAP?: string;

  @IsOptional()
  @IsNumberString()
  RETRIEVAL_TOP_K?: string;
}

export function validateEnvironment(
  config: Record<string, unknown>,
): EnvironmentVariables {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}
