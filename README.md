# API Wrapper

This application serves as an interface between the client and an API endpoint. It optimizes requests made to the endpoint to prevent resource exhaustion by managing concurrent requests and queuing excess requests.

This application provides a user interface to interact with the Wrapper class. It allows users to send random requests and view the activity log.

## Techstack

- **TypeScript**: For type-safe JavaScript development.
- **React**: For building the user interface.
- **Vite**: For fast development and build tooling.
- **Vitest**: For unit testing.

## Directory Structure

```plaintext
api-wrapper/
├── public/
│   └── index.html
├── src/
│   ├── api/
|   |   ├── tests/
│   |   |   └── Wrapper.test.ts
│   │   └── Wrapper.ts --- Brain of the application
│   ├── components/
│   │   └── App.tsx
|   |   └── App.css
│   ├── utils/
│   │   └── helper.ts
│   ├── index.tsx
│   └── main.tsx
├── .gitignore
├── package.json
├── README.md
├── tsconfig.json
└── vite.config.ts
```

## How to Run the Application

1. **Install dependencies**:
    ```sh
    npm install
    ```

2. **Run the application**:
    ```sh
    npm run dev
    ```

3. **Run tests**:
    ```sh
    npx vitest
    ```

## Usage

### Wrapper Class

The `Wrapper` class is designed to manage API requests efficiently. It ensures that no more than a specified number of concurrent requests are made to the same endpoint. Excess requests are queued and processed in order.


### React Application

This application will run on `3000` port and it can be accessible using http://localhost:3000/. The React application provides a user interface to interact with the `Wrapper` class. It allows users to send random requests and view the activity log.

In addition, the request will be seen in different colors, the reason is to highlight duplicate requests, so duplicate requests will shown in same color. This will make easy to detect status of the requests.

### Buttons

1. **Send Random Requests**: Generates a set of random requests, including some with duplicate query strings and some with unique query strings.
2. **Send Duplicate Requests**: Generates a set of requests with identical query strings.
3. **Clear**: Clears the logs and resets the application state.
**Note:** It is recommended to use the "Clear" button after clicking either the "Send Random Requests" or "Send Duplicate Requests" button, after reviewing the results.

### Activities

1. **All Requests**: Displays all generated requests with a `Highlight` button next to each request. Clicking the `Highlight` button will highlight the specific request in the "Parallel Requests Log" card.
2. **Requests Activity**: Displays the log activity of all requests, including their statuses at specific points in time.

### How to review the logs

Here, the primary focus is on **Requests Activity** card, when some rquests are made the logs will be generated in this card. So here is the explaination of those logs.

1. **Starting request: \<URL\>** - This means the request execution has started.
2. **Calling API: \<URL\>** - This means the API is being called and waiting for response.
3. **Request is already in-flight and returning onging request's promise: \<URL\>** - This means that the application has detected duplicate request and set ongoing request's promise for current request.
4. **Queueing request: \<URL\>** - This means `MAX_CONCURRENT_REQUESTS` count has reached and adding into queue
5. **Dequeuing request for: \<URL\>** - This means that now this request allowed to make API call
6. **Request ended: \<URL\>** - This means that we have receive the response from the API
