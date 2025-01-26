import { describe, it, expect, vi } from 'vitest';
import { Wrapper } from '../Wrapper';
import { beforeEach } from 'vitest';

interface WrapperTestContext {
  wrapper: Wrapper;
}

beforeEach<WrapperTestContext>(async (context) => {
  context.wrapper = new Wrapper();
});

describe('Wrapper class', () => {
  it<WrapperTestContext>('should create an instance of Wrapper', ({
    wrapper,
  }) => {
    expect(wrapper).toBeInstanceOf(Wrapper);
  });

  it('should log activities correctly', async () => {
    const log: string[] = [];
    const wrapperWithLogging = new Wrapper((message, url) =>
      log.push(`${message} ${url}`),
    );

    const url = 'https://httpbin.org/anything?a=1';
    await wrapperWithLogging.fetch(url);

    expect(log).toEqual([
      'Starting request: https://httpbin.org/anything?a=1',
      'Calling API: https://httpbin.org/anything?a=1',
      'Request ended: https://httpbin.org/anything?a=1',
    ]);
  });

  it('should handle in-flight requests correctly', async () => {
    const log: string[] = [];
    const wrapperWithLogging = new Wrapper((message, url) =>
      log.push(`${message} ${url}`),
    );
    const url = 'https://httpbin.org/anything?a=1';

    const promise1 = wrapperWithLogging.fetch(url);
    const promise2 = wrapperWithLogging.fetch(url);

    // Both promises should resolve to the same value
    const [response1, response2] = await Promise.all([promise1, promise2]);

    expect(log).toEqual([
      'Starting request: https://httpbin.org/anything?a=1',
      'Calling API: https://httpbin.org/anything?a=1',
      'Starting request: https://httpbin.org/anything?a=1',
      "Request is already in-flight and returning onging request's promise: https://httpbin.org/anything?a=1",
      'Request ended: https://httpbin.org/anything?a=1',
    ]);
    expect(response1).toBe('Done');
    expect(response2).toBe('Done');
  });

  it('should queue requests when MAX_CONCURRENT is reached', async () => {
    const log: string[] = [];
    const wrapperWithLogging = new Wrapper((message, url) =>
      log.push(`${message} ${url}`),
    );

    const urls = [
      'https://httpbin.org/anything?a=1',
      'https://httpbin.org/anything?a=2',
      'https://httpbin.org/anything?a=3',
      'https://httpbin.org/anything?a=4',
    ];

    const promises = urls.map((url) => wrapperWithLogging.fetch(url));
    for await (const result of promises) {
      console.log('Result:', result);
    }

    expect(log).toEqual([
      'Starting request: https://httpbin.org/anything?a=1',
      'Calling API: https://httpbin.org/anything?a=1',
      'Starting request: https://httpbin.org/anything?a=2',
      'Calling API: https://httpbin.org/anything?a=2',
      'Starting request: https://httpbin.org/anything?a=3',
      'Calling API: https://httpbin.org/anything?a=3',
      'Starting request: https://httpbin.org/anything?a=4',
      'Queueing request: https://httpbin.org/anything?a=4',
      expect.stringContaining('Request ended: https://httpbin.org/anything'), // because it's hard to predict the order of the requests
      'Dequeuing request for: https://httpbin.org/anything?a=4',
      'Calling API: https://httpbin.org/anything?a=4',
      expect.stringContaining('Request ended: https://httpbin.org/anything'),
      expect.stringContaining('Request ended: https://httpbin.org/anything'),
      expect.stringContaining('Request ended: https://httpbin.org/anything'),
    ]);
  });

  it<WrapperTestContext>('should handle status code correctly', async ({
    wrapper,
  }) => {
    const url = 'https://httpbin.org/status/400';
    await expect(wrapper.fetch(url)).rejects.toThrow(
      'Request failed: Error: Request failed with status: 400',
    );
  });
});
