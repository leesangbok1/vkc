#!/usr/bin/env node

import { mcpServer } from './mcp-server.js';
import { logger } from './logger.js';
import { CONFIG } from './config.js';

async function main() {
  logger.info('Starting iMessage MCP Server', {
    version: '1.0.0',
    config: {
      port: CONFIG.port,
      phoneNumber: CONFIG.phoneNumber.replace(/\d{4}$/, '****'), // Mask last 4 digits
      projectRoot: CONFIG.projectRoot,
      allowedCommands: CONFIG.allowedCommands
    }
  });

  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    logger.info('Received SIGINT, shutting down gracefully...');
    await mcpServer.stop();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    logger.info('Received SIGTERM, shutting down gracefully...');
    await mcpServer.stop();
    process.exit(0);
  });

  process.on('uncaughtException', (error) => {
    logger.error('Uncaught exception', { error: error.message, stack: error.stack });
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled rejection', { reason, promise });
    process.exit(1);
  });

  try {
    await mcpServer.start();
    logger.info('iMessage MCP Server is running and waiting for commands...');
  } catch (error) {
    logger.error('Failed to start server', { error: error.message });
    process.exit(1);
  }
}

main().catch((error) => {
  logger.error('Application startup failed', { error: error.message });
  process.exit(1);
});