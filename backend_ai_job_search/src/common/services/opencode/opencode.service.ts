import {
  BadGatewayException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';

interface OpenCodeSession {
  id: string;
  title?: string;
  [key: string]: unknown;
}

interface OpenCodeApiResponse<T> {
  data: T;
}

@Injectable()
export class OpenCodeService {
  private readonly baseUrl =
    process.env.OPENCODE_URL ?? 'http://127.0.0.1:4096';

  private async request<T>(
    path: string,
    options: RequestInit = {},
  ): Promise<T> {
    const password = process.env.OPENCODE_SERVER_PASSWORD;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (password) {
      const username = process.env.OPENCODE_SERVER_USERNAME ?? 'opencode';

      headers.Authorization =
        'Basic ' + Buffer.from(`${username}:${password}`).toString('base64');
    }

    const method = options.method ?? 'GET';

    Logger.log(
      `Sending ${method} request to OpenCode: ${path}`,
      'OpenCodeService',
    );

    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      Logger.log(
        `OpenCode responded with status ${response.status} for ${path}`,
        'OpenCodeService',
      );

      if (!response.ok) {
        const error = await response.text();

        Logger.error(
          `OpenCode request failed: ${response.status} - ${error}`,
          undefined,
          'OpenCodeService',
        );

        throw new BadGatewayException({
          message: 'OpenCode request failed',
          status: response.status,
          details: error,
        });
      }

      if (response.status === 204) {
        Logger.log(
          `OpenCode request completed successfully with no content: ${path}`,
          'OpenCodeService',
        );

        return undefined as T;
      }

      const result = (await response.json()) as T;

      Logger.log(
        `OpenCode request completed successfully: ${path}`,
        'OpenCodeService',
      );

      Logger.debug(
        `OpenCode response: ${JSON.stringify(result)}`,
        'OpenCodeService',
      );

      return result;
    } catch (error) {
      if (error instanceof BadGatewayException) {
        throw error;
      }

      Logger.error(
        `Failed to connect to OpenCode: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
        'OpenCodeService',
      );

      throw new BadGatewayException('Failed to connect to OpenCode');
    }
  }

  async sendPrompt(sessionId: string, text: string) {
    return this.request(
      `/api/session/${encodeURIComponent(sessionId)}/prompt`,
      {
        method: 'POST',
        body: JSON.stringify({
          text,
          delivery: 'queue',
        }),
      },
    );
  }

  async waitForCompletion(sessionId: string) {
    return this.request(
      `/api/experimental/session/${encodeURIComponent(sessionId)}/wait`,
      {
        method: 'POST',
        body: JSON.stringify({}),
      },
    );
  }

  async getMessages(sessionId: string) {
    return this.request(
      `/api/session/${encodeURIComponent(sessionId)}/message?order=desc&limit=20`,
      {
        method: 'GET',
      },
    );
  }

  async promptAndWait(sessionId: string, text: string) {
    const accepted = await this.sendPrompt(sessionId, text);

    await this.waitForCompletion(sessionId);

    const messages = await this.getMessages(sessionId);

    return {
      accepted,
      messages,
    };
  }

  async createSession(title: string): Promise<OpenCodeSession> {
    const result = await this.request<OpenCodeApiResponse<OpenCodeSession>>(
      '/api/session',
      {
        method: 'POST',
        body: JSON.stringify({ title }),
      },
    );

    Logger.log(`Created session ${result.data.id}`, 'OpenCodeService');

    return result.data;
  }
}
