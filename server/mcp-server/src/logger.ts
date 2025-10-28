import fs from 'fs';
import path from 'path';
import { CONFIG } from './config.js';

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug'
}

export class Logger {
  private logLevel: LogLevel;
  private logFile: string;

  constructor() {
    this.logLevel = CONFIG.logLevel as LogLevel;
    this.logFile = CONFIG.logFile;
    this.ensureLogDirectory();
  }

  private ensureLogDirectory(): void {
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  private formatMessage(level: LogLevel, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}\n`;
  }

  private writeToFile(message: string): void {
    try {
      fs.appendFileSync(this.logFile, message);
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.ERROR, LogLevel.WARN, LogLevel.INFO, LogLevel.DEBUG];
    const currentIndex = levels.indexOf(this.logLevel);
    const messageIndex = levels.indexOf(level);
    return messageIndex <= currentIndex;
  }

  error(message: string, meta?: any): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const formatted = this.formatMessage(LogLevel.ERROR, message, meta);
      console.error(formatted.trim());
      this.writeToFile(formatted);
    }
  }

  warn(message: string, meta?: any): void {
    if (this.shouldLog(LogLevel.WARN)) {
      const formatted = this.formatMessage(LogLevel.WARN, message, meta);
      console.warn(formatted.trim());
      this.writeToFile(formatted);
    }
  }

  info(message: string, meta?: any): void {
    if (this.shouldLog(LogLevel.INFO)) {
      const formatted = this.formatMessage(LogLevel.INFO, message, meta);
      console.log(formatted.trim());
      this.writeToFile(formatted);
    }
  }

  debug(message: string, meta?: any): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      const formatted = this.formatMessage(LogLevel.DEBUG, message, meta);
      console.log(formatted.trim());
      this.writeToFile(formatted);
    }
  }
}

export const logger = new Logger();