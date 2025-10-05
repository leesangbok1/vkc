import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  McpError,
  ErrorCode,
} from '@modelcontextprotocol/sdk/types.js';

import { logger } from './logger.js';
import { commandProcessor } from './commands.js';
import { iMessageServiceInstance as iMessageService } from './imessage.js';
import { authService } from './auth.js';
import { CONFIG } from './config.js';
import { Command, CommandType, CommandStatus, MCPTool } from './types.js';

export class MCPServer {
  private server: Server;
  private isRunning = false;

  constructor() {
    this.server = new Server(
      {
        name: 'imessage-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  private setupHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: this.getAvailableTools(),
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'send_imessage':
            return await this.handleSendMessage(args);

          case 'execute_command':
            return await this.handleExecuteCommand(args);

          case 'get_project_status':
            return await this.handleGetProjectStatus(args);

          case 'authenticate_phone':
            return await this.handleAuthenticatePhone(args);

          case 'register_phone':
            return await this.handleRegisterPhone(args);

          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }
      } catch (error) {
        logger.error('Tool execution failed', {
          tool: name,
          error: error.message,
          args
        });

        throw new McpError(
          ErrorCode.InternalError,
          `Tool execution failed: ${error.message}`
        );
      }
    });
  }

  private getAvailableTools(): MCPTool[] {
    return [
      {
        name: 'send_imessage',
        description: 'Send an iMessage to a specified phone number',
        inputSchema: {
          type: 'object',
          properties: {
            phoneNumber: {
              type: 'string',
              description: 'The phone number to send the message to'
            },
            message: {
              type: 'string',
              description: 'The message content to send'
            }
          },
          required: ['phoneNumber', 'message']
        }
      },
      {
        name: 'execute_command',
        description: 'Execute a command received from iPhone via iMessage',
        inputSchema: {
          type: 'object',
          properties: {
            commandType: {
              type: 'string',
              enum: ['git', 'npm', 'build', 'test', 'status', 'claude', 'custom'],
              description: 'The type of command to execute'
            },
            payload: {
              type: 'string',
              description: 'The command payload or arguments'
            },
            sender: {
              type: 'string',
              description: 'The phone number of the command sender'
            }
          },
          required: ['commandType', 'payload', 'sender']
        }
      },
      {
        name: 'get_project_status',
        description: 'Get current project status including git, npm, and file changes',
        inputSchema: {
          type: 'object',
          properties: {},
          required: []
        }
      },
      {
        name: 'authenticate_phone',
        description: 'Authenticate a phone number for command execution',
        inputSchema: {
          type: 'object',
          properties: {
            phoneNumber: {
              type: 'string',
              description: 'The phone number to authenticate'
            },
            token: {
              type: 'string',
              description: 'The JWT token for authentication'
            }
          },
          required: ['phoneNumber', 'token']
        }
      },
      {
        name: 'register_phone',
        description: 'Register a new phone number and generate authentication token',
        inputSchema: {
          type: 'object',
          properties: {
            phoneNumber: {
              type: 'string',
              description: 'The phone number to register'
            }
          },
          required: ['phoneNumber']
        }
      }
    ];
  }

  private async handleSendMessage(args: any): Promise<any> {
    const { phoneNumber, message } = args;

    if (!phoneNumber || !message) {
      throw new Error('Phone number and message are required');
    }

    await iMessageService.sendMessage(phoneNumber, message);

    return {
      content: [
        {
          type: 'text',
          text: `Message sent successfully to ${phoneNumber}`
        }
      ]
    };
  }

  private async handleExecuteCommand(args: any): Promise<any> {
    const { commandType, payload, sender } = args;

    if (!commandType || !payload || !sender) {
      throw new Error('Command type, payload, and sender are required');
    }

    // Validate sender authorization
    if (!authService.isAuthorizedPhone(sender)) {
      throw new Error('Unauthorized phone number');
    }

    const command: Command = {
      id: `mcp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: commandType as CommandType,
      payload,
      timestamp: Date.now(),
      sender,
      status: CommandStatus.PENDING
    };

    const result = await commandProcessor.processCommand(command);

    return {
      content: [
        {
          type: 'text',
          text: `Command executed: ${commandType} ${payload}\nResult: ${result.success ? 'Success' : 'Failed'}\nOutput: ${result.output}\n${result.error ? `Error: ${result.error}` : ''}`
        }
      ]
    };
  }

  private async handleGetProjectStatus(args: any): Promise<any> {
    const command: Command = {
      id: `status_${Date.now()}`,
      type: CommandType.STATUS,
      payload: '',
      timestamp: Date.now(),
      sender: 'mcp-server',
      status: CommandStatus.PENDING
    };

    const result = await commandProcessor.processCommand(command);

    return {
      content: [
        {
          type: 'text',
          text: result.output
        }
      ]
    };
  }

  private async handleAuthenticatePhone(args: any): Promise<any> {
    const { phoneNumber, token } = args;

    if (!phoneNumber || !token) {
      throw new Error('Phone number and token are required');
    }

    const authData = authService.verifyToken(token);
    const isValid = authData && authData.phoneNumber === phoneNumber;

    return {
      content: [
        {
          type: 'text',
          text: `Authentication ${isValid ? 'successful' : 'failed'} for ${phoneNumber}`
        }
      ]
    };
  }

  private async handleRegisterPhone(args: any): Promise<any> {
    const { phoneNumber } = args;

    if (!phoneNumber) {
      throw new Error('Phone number is required');
    }

    if (!authService.isAuthorizedPhone(phoneNumber)) {
      throw new Error('Phone number not authorized for registration');
    }

    const token = authService.generateToken(phoneNumber);

    return {
      content: [
        {
          type: 'text',
          text: `Registration successful for ${phoneNumber}\nToken: ${token}\n\nSave this token and use it in your iPhone messages like:\ntoken:${token} cmd:status`
        }
      ]
    };
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      logger.warn('MCP Server is already running');
      return;
    }

    try {
      // Start iMessage monitoring
      await this.startMessageMonitoring();

      // Start MCP server with stdio transport
      const transport = new StdioServerTransport();
      await this.server.connect(transport);

      this.isRunning = true;
      logger.info('MCP Server started successfully', {
        port: CONFIG.port,
        phoneNumber: CONFIG.phoneNumber
      });

    } catch (error) {
      logger.error('Failed to start MCP Server', { error: error.message });
      throw error;
    }
  }

  private async startMessageMonitoring(): Promise<void> {
    await iMessageService.startMonitoring(async (messages) => {
      for (const message of messages) {
        try {
          // Authenticate message
          if (!authService.authenticateMessage(message.text, message.sender)) {
            logger.warn('Unauthenticated message received', {
              sender: message.sender,
              messageId: message.id
            });

            // Send help message for unauthenticated users
            if (message.text.startsWith('register:')) {
              const token = authService.generateToken(message.sender);
              await iMessageService.sendMessage(
                message.sender,
                `✅ Registration successful!\nToken: ${token}\n\nUse: token:${token} cmd:status`
              );
            } else {
              await iMessageService.sendMessage(
                message.sender,
                `❌ Authentication required. Send: register:your-phone`
              );
            }
            continue;
          }

          // Parse and execute command
          const command = commandProcessor.parseCommandFromMessage(message.text);
          if (command) {
            logger.info('Command received from iPhone', {
              commandId: command.id,
              type: command.type,
              sender: message.sender
            });

            // Execute command asynchronously
            commandProcessor.processCommand(command).catch((error) => {
              logger.error('Command execution failed', {
                commandId: command.id,
                error: error.message
              });
            });
          } else {
            logger.debug('Message not recognized as command', {
              text: message.text.substring(0, 50),
              sender: message.sender
            });
          }

        } catch (error) {
          logger.error('Error processing message', {
            messageId: message.id,
            error: error.message
          });
        }
      }
    });
  }

  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;
    iMessageService.stopMonitoring();

    logger.info('MCP Server stopped');
  }
}

export const mcpServer = new MCPServer();