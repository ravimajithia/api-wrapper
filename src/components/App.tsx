import React, { useState } from 'react';
import './App.css';
import { Wrapper as ApiWrapper } from '../api/Wrapper';
import {
  clearPage,
  generateRandomColor,
  generateRandomQueryString,
  shuffleRequests,
} from '../utils/helper';
import { v4 as uuidv4 } from 'uuid';

interface Activity {
  message: string;
  url: string;
}

const App: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [allRequests, setAllRequests] = useState<string[]>([]);
  const [urlColors, setUrlColors] = useState<Map<string, string>>(new Map());
  const [highlightedUrl, setHighlightedUrl] = useState<string | null>(null);

  const logActivity = (message: string, url: string) => {
    setActivities((prev) => [...prev, { message, url }]);
  };

  const apiWrapper = new ApiWrapper(logActivity);

  const sendRequest = async () => {
    try {
      const numRequests = Math.floor(Math.random() * 12) + 5;
      const queryStrings: string[] = [];
      let urls: string[] = [];
      const newUrlColors = new Map(urlColors);

      // Generate all the URLs
      for (let i = 0; i < numRequests; i++) {
        let queryString;
        if (queryStrings.length > 0 && Math.random() < 0.5) {
          queryString =
            queryStrings[Math.floor(Math.random() * queryStrings.length)];
        } else {
          queryString = generateRandomQueryString();
          queryStrings.push(queryString);
        }
        const url = `https://httpbin.org/anything?${queryString}`;
        urls.push(url);

        if (!newUrlColors.has(url)) {
          newUrlColors.set(url, generateRandomColor());
        }
      }

      setAllRequests(urls);
      setUrlColors(newUrlColors);

      urls = shuffleRequests(urls);
      const promises = urls.map((url) => apiWrapper.fetch(url));

      for await (const result of promises) {
        console.log('Result:', result);
      }
    } catch (err) {
      logActivity(`Error: ${err}`, '');
    }
  };

  const sendDuplicateRequest = async () => {
    try {
      const urls = [
        'https://httpbin.org/anything?a=1',
        'https://httpbin.org/anything?a=1',
        'https://httpbin.org/anything?a=1',
        'https://httpbin.org/anything?a=1',
      ];
      setAllRequests(urls);
      const promises = urls.map((url) => apiWrapper.fetch(url));

      for await (const result of promises) {
        console.log('Result:', result);
      }
    } catch (err) {
      logActivity(`Error: ${err}`, 'https://httpbin.org/anything?a=1');
    }
  };

  const highlightRequest = (url: string) => {
    setHighlightedUrl(url);
  };

  return (
    <div>
      <h1>HTTP API Wrapper</h1>
      <button onClick={sendRequest}>Send random requests</button>
      <button onClick={sendDuplicateRequest}>Send duplicate requests</button>
      <button onClick={clearPage}>Clear</button>
      <div className="wrapper">
        <div className="all-requests">
          <h2>
            All Requests{' '}
            <span className="small">
              Reqests with same querystring shown in same color code
            </span>
          </h2>
          <ol>
            {allRequests.length === 0 && (
              <li style={{ listStyleType: 'none' }}>No requests made yet</li>
            )}
            {allRequests.map((url) => (
              <li
                key={uuidv4()}
                style={{
                  color: urlColors.get(url),
                  backgroundColor:
                    highlightedUrl === url ? 'yellow' : 'transparent',
                }}
              >
                <span style={{ wordBreak: 'break-all' }}>{url}</span>
                <button
                  className="small-btn"
                  onClick={() => highlightRequest(url)}
                >
                  Highlight
                </button>
              </li>
            ))}
          </ol>
        </div>
        <div className="parellel">
          <h2>Activity Log</h2>
          <ul>
            {activities.length === 0 && (
              <li
                style={{
                  listStyleType: 'none',
                }}
              >
                No requests made yet
              </li>
            )}
            {activities.map((activity) => (
              <li
                key={uuidv4()}
                style={{
                  color: urlColors.get(activity.url),
                  backgroundColor:
                    highlightedUrl === activity.url ? 'yellow' : 'transparent',
                }}
              >
                <strong style={{ color: 'black' }}>{activity.message}</strong>
                &nbsp;{activity.url}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default App;
