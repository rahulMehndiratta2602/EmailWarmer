# ABCProxy API Testing with Postman

This guide explains how to use the provided Postman collection to test the ABCProxy API endpoints.

## Prerequisites

1. [Postman](https://www.postman.com/downloads/) installed
2. Backend server running locally on port 3001 (or configured in the environment)
3. Database properly set up with the required schema

## Setup

### 1. Import Collection and Environment

1. Open Postman
2. Click on "Import" in the top left
3. Select the files `ABCProxy_API_Collection.postman_collection.json` and `ABCProxy_Environment.postman_environment.json` from this directory
4. Both the collection and environment should appear in your Postman workspace

### 2. Select Environment

1. Look for the environment dropdown in the top right corner of Postman
2. Select "ABCProxy Environment" from the dropdown

### 3. Set Environment Variables

The collection uses the following variables:
- `base_url`: The base URL of your API (default: `http://localhost:3001`)
- `email_account_id`: ID of an email account for testing endpoints that require an email ID
- `proxy_id`: ID of a proxy for testing endpoints that require a proxy ID
- `email_id`: ID of an email account for testing proxy mapping endpoints

You can set these variables:
1. Click on the "eye" icon in the top right corner
2. Update the values as needed
3. Click "Save"

## Testing Guide

### Recommended Testing Sequence

1. **Health Check**
   - Verify the API is running

2. **Email Accounts**
   - Create email accounts
   - Get all email accounts
   - Use a returned ID to update the `email_account_id` and `email_id` variables

3. **Proxies**
   - Fetch proxies from ABCProxy
   - Get all proxies
   - Use a returned ID to update the `proxy_id` variable

4. **Proxy Mappings**
   - Create a proxy mapping between emails and proxies
   - Get all proxy mappings

5. **Browser Automation**
   - Open browser windows
   - Get browser stats
   - Close browser windows

### Response Handling

Many requests will return IDs that you'll need for subsequent requests. To automatically extract and set these IDs:

1. Send a request like "Get All Email Accounts" or "Get All Proxies"
2. In the "Tests" tab of the request, add code like:

```javascript
// For email accounts
if (pm.response.code === 200 && pm.response.json().length > 0) {
    pm.environment.set("email_account_id", pm.response.json()[0].id);
    pm.environment.set("email_id", pm.response.json()[0].id);
}

// For proxies
if (pm.response.code === 200 && pm.response.json().length > 0) {
    pm.environment.set("proxy_id", pm.response.json()[0].id);
}
```

## Error Handling

If you encounter errors:

1. Check that your server is running
2. Verify that the database is properly set up and accessible
3. Ensure environment variables like `ABCPROXY_API_KEY` are properly set
4. Check that the port in the `base_url` matches your server's port

## Advanced Testing

### Creating Test Suites

You can create test suites by adding scripts to the "Tests" tab in Postman:

```javascript
// Example test for the health endpoint
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response contains status and timestamp", function () {
    const responseJson = pm.response.json();
    pm.expect(responseJson).to.have.property('status');
    pm.expect(responseJson).to.have.property('timestamp');
    pm.expect(responseJson.status).to.eql('ok');
});
```

### Running Collections Automatically

You can run the entire collection automatically:

1. Click on the "..." next to the collection name
2. Select "Run collection"
3. Configure the run settings
4. Click "Run"

The collection runner will execute all requests in sequence and show you the results. 