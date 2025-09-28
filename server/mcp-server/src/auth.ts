import jwt from 'jsonwebtoken';
import { CONFIG } from './config.js';
import { AuthToken } from './types.js';
import { logger } from './logger.js';

export class AuthService {
  generateToken(phoneNumber: string): string {
    const payload: Omit<AuthToken, 'iat' | 'exp'> = {
      phoneNumber
    };

    return jwt.sign(payload, CONFIG.jwtSecret, {
      expiresIn: '24h',
      issuer: 'imessage-mcp-server'
    });
  }

  verifyToken(token: string): AuthToken | null {
    try {
      const decoded = jwt.verify(token, CONFIG.jwtSecret) as AuthToken;
      return decoded;
    } catch (error) {
      logger.warn('Invalid token verification', { error: error.message });
      return null;
    }
  }

  isAuthorizedPhone(phoneNumber: string): boolean {
    return phoneNumber === CONFIG.phoneNumber;
  }

  extractTokenFromMessage(message: string): string | null {
    // Extract token from message format: "token:YOUR_TOKEN cmd:command"
    const tokenMatch = message.match(/token:([a-zA-Z0-9.-_]+)/);
    return tokenMatch ? tokenMatch[1] : null;
  }

  authenticateMessage(message: string, sender: string): boolean {
    // Check if sender is authorized phone number
    if (!this.isAuthorizedPhone(sender)) {
      logger.warn('Unauthorized phone number', { sender });
      return false;
    }

    // For initial setup, allow registration without token
    if (message.startsWith('register:')) {
      return true;
    }

    // Extract and verify token
    const token = this.extractTokenFromMessage(message);
    if (!token) {
      logger.warn('No token found in message', { sender });
      return false;
    }

    const authData = this.verifyToken(token);
    if (!authData) {
      logger.warn('Invalid token', { sender, token: token.substring(0, 10) + '...' });
      return false;
    }

    return authData.phoneNumber === sender;
  }
}

export const authService = new AuthService();