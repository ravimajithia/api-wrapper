type ActivityCallback = (message: string, url: string) => void;

export class Wrapper {
  private inFlightRequests: Map<string, Promise<string>> = new Map();
  private endpointQueues: Map<string, (() => void)[]> = new Map();
  private activeRequests: Map<string, number> = new Map();
  private MAX_CONCURRENT_REQUESTS = 3;
  private onActivityChange?: ActivityCallback;

  constructor(onActivityChange?: ActivityCallback) {
    this.onActivityChange = onActivityChange;
  }

  /**
   * Logs hte activities of the API.
   *
   * @param message - The activity message to log.
   * @param url - The URL associated with the activity.
   */
  private logActivity(message: string, url: string) {
    if (this.onActivityChange) {
      this.onActivityChange(message, url);
    }
  }

  /**
   * Make fetch reques
   *
   * @param url - The URL to fetch.
   * @returns A promise that resolves to the response data.
   */
  async fetch(url: string): Promise<string> {
    this.logActivity(`Starting request:`, url);
    try {
      await this.handleRequest(url);
      return 'Done';
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logActivity(`Error occurred: ${errorMessage}`, url);
      throw error;
    }
  }

  /**
   * Handles the fetch request and queues it if necessary.
   *
   * @param url - The URL to fetch.
   * @returns A promise that resolves to the response data.
   */
  private async handleRequest(url: string): Promise<string> {
    if (this.inFlightRequests.has(url)) {
      this.logActivity(
        `Request is already in-flight and returning onging request's promise:`,
        url,
      );
      return this.inFlightRequests.get(url)!;
    }

    const promise = this.queueOrFetch(url);
    this.inFlightRequests.set(url, promise);
    promise.finally(() => this.inFlightRequests.delete(url));
    return promise;
  }

  /**
   * Queue the request if the maximum number of concurrent requests is reached.
   *
   * @param url - The URL to fetch.
   * @returns A promise that resolves to the response data.
   */
  private async queueOrFetch(url: string): Promise<string> {
    const endpoint = this.getEndpoint(url);

    if (!this.endpointQueues.has(endpoint)) {
      this.endpointQueues.set(endpoint, []);
    }
    if (!this.activeRequests.has(endpoint)) {
      this.activeRequests.set(endpoint, 0);
    }

    if (this.activeRequests.get(endpoint)! >= this.MAX_CONCURRENT_REQUESTS) {
      this.logActivity(`Queueing request:`, url);
      return new Promise((resolve, reject) => {
        this.endpointQueues.get(endpoint)!.push(() => {
          this.logActivity(`Dequeuing request for:`, url);
          this.makeRequest(url).then(resolve).catch(reject);
        });
      });
    }

    return this.makeRequest(url);
  }

  /**
   * Make API call.
   *
   * @param url - The URL to fetch.
   * @returns A promise that resolves to the response data.
   */
  private async makeRequest(url: string): Promise<string> {
    const endpoint = this.getEndpoint(url);
    const currentActiveRequests = this.activeRequests.get(endpoint)! + 1;
    this.activeRequests.set(endpoint, currentActiveRequests);

    try {
      this.logActivity(`Calling API:`, url);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Request failed with status: ${response.status}`);
      } 
      const data = await response.text();
      return data;
    } catch (error) {
      console.error(error);
      throw new Error(`Request failed: ${error}`);
    } finally {
      this.logActivity('Request ended:', url);
      this.activeRequests.set(endpoint, this.activeRequests.get(endpoint)! - 1);
      const queue = this.endpointQueues.get(endpoint)!;
      if (queue.length > 0) {
        const nextRequest = queue.shift();
        nextRequest && nextRequest();
      }
    }
  }

  /**
   * Get the endpoint from the URL.
   * 
   * @param url - The URL to fetch.
   * @returns endpoint
   */
  private getEndpoint(url: string): string {
    const { host, port } = new URL(url);
    return `${host}:${port || 80}`;
  }
}
