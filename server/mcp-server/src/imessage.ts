import { exec } from 'child_process';
import { promisify } from 'util';
import { iMessageData } from './types.js';
import { CONFIG } from './config.js';
import { logger } from './logger.js';

const execAsync = promisify(exec);

export class iMessageService {
  private lastMessageId: string | null = null;
  private isMonitoring = false;

  async sendMessage(phoneNumber: string, message: string): Promise<void> {
    const script = `
      tell application "Messages"
        set targetService to 1st service whose service type = iMessage
        set targetBuddy to buddy "${phoneNumber}" of targetService
        send "${message}" to targetBuddy
      end tell
    `;

    try {
      await execAsync(`osascript -e '${script}'`);
      logger.info('Message sent successfully', { phoneNumber, messageLength: message.length });
    } catch (error) {
      logger.error('Failed to send iMessage', { phoneNumber, error: error.message });
      throw new Error(`Failed to send message: ${error.message}`);
    }
  }

  async getRecentMessages(limit = 10): Promise<iMessageData[]> {
    const script = `
      tell application "Messages"
        set messageList to {}
        repeat with chatIndex from 1 to (count of chats)
          set currentChat to chat chatIndex
          set chatId to id of currentChat
          repeat with msgIndex from 1 to (count of messages in currentChat)
            set currentMessage to message msgIndex of currentChat
            try
              set messageText to text of currentMessage
              set messageDate to date sent of currentMessage
              set messageSender to handle of sender of currentMessage
              set messageId to id of currentMessage

              set messageRecord to {messageId, messageText, messageSender, messageDate, chatId}
              set end of messageList to messageRecord
            end try
          end repeat
        end repeat

        -- Sort by date and return recent messages
        return items 1 thru ${limit} of messageList
      end tell
    `;

    try {
      const { stdout } = await execAsync(`osascript -e '${script}'`);
      return this.parseAppleScriptMessages(stdout);
    } catch (error) {
      logger.error('Failed to get recent messages', { error: error.message });
      return [];
    }
  }

  async getNewMessages(): Promise<iMessageData[]> {
    const script = `
      tell application "Messages"
        set newMessages to {}
        set targetPhone to "${CONFIG.phoneNumber}"

        repeat with chatIndex from 1 to (count of chats)
          set currentChat to chat chatIndex
          set chatId to id of currentChat

          -- Check if this chat involves our target phone number
          set chatParticipants to ""
          repeat with participant in participants of currentChat
            set chatParticipants to chatParticipants & (handle of participant) & ","
          end repeat

          if chatParticipants contains targetPhone then
            set messageCount to count of messages in currentChat
            repeat with msgIndex from (messageCount - 20) to messageCount
              if msgIndex > 0 then
                try
                  set currentMessage to message msgIndex of currentChat
                  set messageText to text of currentMessage
                  set messageDate to date sent of currentMessage
                  set messageSender to handle of sender of currentMessage
                  set messageId to id of currentMessage

                  -- Only include messages from our target phone
                  if messageSender is equal to targetPhone then
                    set messageRecord to {messageId, messageText, messageSender, messageDate, chatId}
                    set end of newMessages to messageRecord
                  end if
                end try
              end if
            end repeat
          end if
        end repeat

        return newMessages
      end tell
    `;

    try {
      const { stdout } = await execAsync(`osascript -e '${script}'`);
      const messages = this.parseAppleScriptMessages(stdout);

      // Filter out old messages and ones we've already processed
      const newMessages = messages.filter(msg => {
        const messageAge = Date.now() - msg.timestamp.getTime();
        const isNew = !this.lastMessageId || msg.id > this.lastMessageId;
        const isRecent = messageAge < CONFIG.maxMessageAge;

        return isNew && isRecent;
      });

      // Update last processed message ID
      if (newMessages.length > 0) {
        this.lastMessageId = newMessages[newMessages.length - 1].id;
      }

      return newMessages;
    } catch (error) {
      logger.error('Failed to get new messages', { error: error.message });
      return [];
    }
  }

  private parseAppleScriptMessages(output: string): iMessageData[] {
    try {
      // Parse AppleScript output format
      const messages: iMessageData[] = [];
      const lines = output.trim().split('\n');

      for (const line of lines) {
        if (line.trim()) {
          try {
            // Expected format: {messageId, messageText, messageSender, messageDate, chatId}
            const parts = line.split(',').map(part => part.trim());
            if (parts.length >= 5) {
              messages.push({
                id: parts[0],
                text: parts[1],
                sender: parts[2],
                timestamp: new Date(parts[3]),
                chatId: parts[4]
              });
            }
          } catch (parseError) {
            logger.debug('Failed to parse message line', { line, error: parseError.message });
          }
        }
      }

      return messages;
    } catch (error) {
      logger.error('Failed to parse AppleScript messages', { error: error.message });
      return [];
    }
  }

  async startMonitoring(callback: (messages: iMessageData[]) => void): Promise<void> {
    if (this.isMonitoring) {
      logger.warn('iMessage monitoring already started');
      return;
    }

    this.isMonitoring = true;
    logger.info('Starting iMessage monitoring', {
      interval: CONFIG.iMessagePollInterval,
      phoneNumber: CONFIG.phoneNumber
    });

    const poll = async () => {
      if (!this.isMonitoring) return;

      try {
        const newMessages = await this.getNewMessages();
        if (newMessages.length > 0) {
          logger.debug('New messages received', { count: newMessages.length });
          callback(newMessages);
        }
      } catch (error) {
        logger.error('Error during message polling', { error: error.message });
      }

      setTimeout(poll, CONFIG.iMessagePollInterval);
    };

    poll();
  }

  stopMonitoring(): void {
    this.isMonitoring = false;
    logger.info('Stopped iMessage monitoring');
  }

  async sendReport(message: string, type: 'success' | 'error' | 'info' = 'info'): Promise<void> {
    const emoji = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
    const formattedMessage = `${emoji} ${message}`;

    try {
      await this.sendMessage(CONFIG.phoneNumber, formattedMessage);
    } catch (error) {
      logger.error('Failed to send report', { type, message, error: error.message });
    }
  }
}

export const iMessageServiceInstance = new iMessageService();