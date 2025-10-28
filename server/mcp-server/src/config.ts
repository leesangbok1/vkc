import { config } from 'dotenv';
import { Config } from './types.js';

// Load environment variables
config();

export const getConfig = (): Config => {
  const requiredEnvVars = ['JWT_SECRET', 'PHONE_NUMBER'];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  }

  return {
    port: parseInt(process.env.PORT || '8991', 10),
    jwtSecret: process.env.JWT_SECRET!,
    phoneNumber: process.env.PHONE_NUMBER!,
    iMessagePollInterval: parseInt(process.env.IMESSAGE_POLL_INTERVAL || '2000', 10),
    maxMessageAge: parseInt(process.env.MAX_MESSAGE_AGE || '300000', 10),
    allowedCommands: (process.env.ALLOWED_COMMANDS || 'git,npm,node,test,build,claude').split(','),
    commandTimeout: parseInt(process.env.COMMAND_TIMEOUT || '30000', 10),
    logLevel: process.env.LOG_LEVEL || 'info',
    logFile: process.env.LOG_FILE || './logs/mcp-server.log',
    projectRoot: process.env.PROJECT_ROOT || '/Users/bk/Desktop/poi-main',
    claudeConfigPath: process.env.CLAUDE_CONFIG_PATH || '~/Library/Application Support/Claude/claude_desktop_config.json'
  };
};

export const CONFIG = getConfig();