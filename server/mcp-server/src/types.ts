// MCP Server Types Definition
export interface Config {
  port: number;
  jwtSecret: string;
  phoneNumber: string;
  iMessagePollInterval: number;
  maxMessageAge: number;
  allowedCommands: string[];
  commandTimeout: number;
  logLevel: string;
  logFile: string;
  projectRoot: string;
  claudeConfigPath: string;
}

export interface Command {
  id: string;
  type: CommandType;
  payload: string;
  timestamp: number;
  sender: string;
  status: CommandStatus;
  result?: CommandResult;
}

export enum CommandType {
  GIT = 'git',
  NPM = 'npm',
  BUILD = 'build',
  TEST = 'test',
  STATUS = 'status',
  CLAUDE = 'claude',
  CUSTOM = 'custom'
}

export enum CommandStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  TIMEOUT = 'timeout'
}

export interface CommandResult {
  success: boolean;
  output: string;
  error?: string;
  duration: number;
  exitCode?: number;
}

export interface iMessageData {
  id: string;
  text: string;
  sender: string;
  timestamp: Date;
  chatId: string;
}

export interface AuthToken {
  phoneNumber: string;
  iat: number;
  exp: number;
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
}

export interface ClaudeIntegration {
  sendMessage(message: string): Promise<void>;
  receiveCommands(): Promise<Command[]>;
}