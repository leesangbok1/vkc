import { exec } from 'child_process';
import { promisify } from 'util';
import { Command, CommandType, CommandStatus, CommandResult } from './types.js';
import { CONFIG } from './config.js';
import { logger } from './logger.js';
import { iMessageServiceInstance as iMessageService } from './imessage.js';

const execAsync = promisify(exec);

export class CommandProcessor {
  private runningCommands = new Map<string, NodeJS.Timeout>();

  async processCommand(command: Command): Promise<CommandResult> {
    logger.info('Processing command', {
      id: command.id,
      type: command.type,
      payload: command.payload.substring(0, 100)
    });

    command.status = CommandStatus.RUNNING;
    const startTime = Date.now();

    try {
      // Set timeout for command execution
      const timeoutPromise = new Promise<CommandResult>((_, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Command execution timeout'));
        }, CONFIG.commandTimeout);

        this.runningCommands.set(command.id, timeout);
      });

      // Execute command
      const executePromise = this.executeCommand(command);

      // Race between execution and timeout
      const result = await Promise.race([executePromise, timeoutPromise]);

      // Clear timeout
      const timeout = this.runningCommands.get(command.id);
      if (timeout) {
        clearTimeout(timeout);
        this.runningCommands.delete(command.id);
      }

      result.duration = Date.now() - startTime;
      command.status = result.success ? CommandStatus.COMPLETED : CommandStatus.FAILED;
      command.result = result;

      logger.info('Command completed', {
        id: command.id,
        success: result.success,
        duration: result.duration
      });

      // Send result back to iPhone
      await this.sendCommandResult(command);

      return result;

    } catch (error) {
      const result: CommandResult = {
        success: false,
        output: '',
        error: error.message,
        duration: Date.now() - startTime,
        exitCode: 1
      };

      command.status = error.message.includes('timeout') ? CommandStatus.TIMEOUT : CommandStatus.FAILED;
      command.result = result;

      logger.error('Command failed', {
        id: command.id,
        error: error.message,
        duration: result.duration
      });

      await this.sendCommandResult(command);
      return result;
    }
  }

  private async executeCommand(command: Command): Promise<CommandResult> {
    switch (command.type) {
      case CommandType.GIT:
        return this.executeGitCommand(command.payload);

      case CommandType.NPM:
        return this.executeNpmCommand(command.payload);

      case CommandType.BUILD:
        return this.executeBuildCommand();

      case CommandType.TEST:
        return this.executeTestCommand();

      case CommandType.STATUS:
        return this.executeStatusCommand();

      case CommandType.CLAUDE:
        return this.executeClaudeCommand(command.payload);

      case CommandType.CUSTOM:
        return this.executeCustomCommand(command.payload);

      default:
        throw new Error(`Unknown command type: ${command.type}`);
    }
  }

  private async executeGitCommand(payload: string): Promise<CommandResult> {
    const allowedGitCommands = ['status', 'pull', 'push', 'commit', 'diff', 'log', 'branch'];
    const gitCommand = payload.split(' ')[0];

    if (!allowedGitCommands.includes(gitCommand)) {
      throw new Error(`Git command '${gitCommand}' is not allowed`);
    }

    const { stdout, stderr } = await execAsync(`git ${payload}`, {
      cwd: CONFIG.projectRoot,
      maxBuffer: 1024 * 1024 // 1MB buffer
    });

    return {
      success: true,
      output: stdout || stderr,
      duration: 0,
      exitCode: 0
    };
  }

  private async executeNpmCommand(payload: string): Promise<CommandResult> {
    const allowedNpmCommands = ['install', 'test', 'build', 'start', 'run', 'ls', 'outdated'];
    const npmCommand = payload.split(' ')[0];

    if (!allowedNpmCommands.includes(npmCommand)) {
      throw new Error(`NPM command '${npmCommand}' is not allowed`);
    }

    const { stdout, stderr } = await execAsync(`npm ${payload}`, {
      cwd: CONFIG.projectRoot,
      maxBuffer: 1024 * 1024
    });

    return {
      success: true,
      output: stdout || stderr,
      duration: 0,
      exitCode: 0
    };
  }

  private async executeBuildCommand(): Promise<CommandResult> {
    const { stdout, stderr } = await execAsync('npm run build', {
      cwd: CONFIG.projectRoot,
      maxBuffer: 1024 * 1024
    });

    return {
      success: true,
      output: stdout || stderr,
      duration: 0,
      exitCode: 0
    };
  }

  private async executeTestCommand(): Promise<CommandResult> {
    const { stdout, stderr } = await execAsync('npm test', {
      cwd: CONFIG.projectRoot,
      maxBuffer: 1024 * 1024
    });

    return {
      success: true,
      output: stdout || stderr,
      duration: 0,
      exitCode: 0
    };
  }

  private async executeStatusCommand(): Promise<CommandResult> {
    try {
      const [gitStatus, npmVersion, nodeVersion] = await Promise.all([
        execAsync('git status --porcelain', { cwd: CONFIG.projectRoot }),
        execAsync('npm --version'),
        execAsync('node --version')
      ]);

      const branch = await execAsync('git branch --show-current', { cwd: CONFIG.projectRoot });

      const output = `
🏠 Project Status
📁 Directory: ${CONFIG.projectRoot}
🌿 Branch: ${branch.stdout.trim()}
📝 Changes: ${gitStatus.stdout.trim() || 'No changes'}
📦 npm: ${npmVersion.stdout.trim()}
🟢 Node: ${nodeVersion.stdout.trim()}
      `.trim();

      return {
        success: true,
        output,
        duration: 0,
        exitCode: 0
      };
    } catch (error) {
      throw new Error(`Failed to get status: ${error.message}`);
    }
  }

  private async executeClaudeCommand(payload: string): Promise<CommandResult> {
    // This would integrate with Claude Code directly
    // For now, we'll just log the command and send a placeholder response
    logger.info('Claude command received', { payload });

    return {
      success: true,
      output: `Claude command received: "${payload}"\nThis would be forwarded to Claude Code for processing.`,
      duration: 0,
      exitCode: 0
    };
  }

  private async executeCustomCommand(payload: string): Promise<CommandResult> {
    // Validate command is in allowed list
    const commandName = payload.split(' ')[0];
    if (!CONFIG.allowedCommands.includes(commandName)) {
      throw new Error(`Command '${commandName}' is not in allowed commands list`);
    }

    const { stdout, stderr } = await execAsync(payload, {
      cwd: CONFIG.projectRoot,
      maxBuffer: 1024 * 1024
    });

    return {
      success: true,
      output: stdout || stderr,
      duration: 0,
      exitCode: 0
    };
  }

  private async sendCommandResult(command: Command): Promise<void> {
    if (!command.result) return;

    const { result } = command;
    const statusEmoji = result.success ? '✅' : '❌';
    const duration = Math.round(result.duration / 1000 * 10) / 10; // Round to 1 decimal

    let message = `${statusEmoji} ${command.type.toUpperCase()}: ${command.payload}`;

    if (result.success) {
      message += `\n⏱️ ${duration}s`;
      if (result.output && result.output.length > 0) {
        const truncatedOutput = result.output.length > 500
          ? result.output.substring(0, 500) + '...'
          : result.output;
        message += `\n📋 ${truncatedOutput}`;
      }
    } else {
      message += `\n❌ ${result.error}`;
      if (result.output) {
        message += `\n📋 ${result.output.substring(0, 300)}`;
      }
    }

    try {
      await iMessageService.sendMessage(CONFIG.phoneNumber, message);
    } catch (error) {
      logger.error('Failed to send command result', {
        commandId: command.id,
        error: error.message
      });
    }
  }

  parseCommandFromMessage(message: string): Command | null {
    try {
      // Remove token prefix if present
      const cleanMessage = message.replace(/^token:[a-zA-Z0-9.-_]+\s+/, '');

      // Parse command format: "cmd: type payload"
      const cmdMatch = cleanMessage.match(/^cmd:\s*(\w+)\s*(.*)$/);
      if (!cmdMatch) {
        return null;
      }

      const [, typeStr, payload] = cmdMatch;
      const type = this.mapStringToCommandType(typeStr);

      if (!type) {
        logger.warn('Unknown command type', { typeStr });
        return null;
      }

      return {
        id: `cmd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type,
        payload: payload.trim(),
        timestamp: Date.now(),
        sender: CONFIG.phoneNumber,
        status: CommandStatus.PENDING
      };
    } catch (error) {
      logger.error('Failed to parse command', { message, error: error.message });
      return null;
    }
  }

  private mapStringToCommandType(typeStr: string): CommandType | null {
    const mapping: Record<string, CommandType> = {
      'git': CommandType.GIT,
      'npm': CommandType.NPM,
      'build': CommandType.BUILD,
      'test': CommandType.TEST,
      'status': CommandType.STATUS,
      'claude': CommandType.CLAUDE
    };

    return mapping[typeStr.toLowerCase()] || CommandType.CUSTOM;
  }
}

export const commandProcessor = new CommandProcessor();