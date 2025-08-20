# Step 7 – Slack Action pack

This step provides a minimal integration with Slack for sending messages.  It defines an OpenAPI spec for the `chat.postMessage` endpoint and outlines how to call Slack from the GPT stack.  All Slack interactions must be gated by an approval step inserted by the router.

### Files

- `openapi.lexvion-slack.json` – OpenAPI 3.0 specification for Slack’s `chat.postMessage` method.  It requires a bearer token (Slack bot token) for authorization.  Only the `channel`, `text` and optional `blocks` fields are supported to keep the action size small.

### Action to add

```json
{
  "name": "lexvion-slack",
  "spec_path": "openapi.lexvion-slack.json",
  "headers": {
    "Authorization": "Bearer ${SLACK_BOT_TOKEN}"
  }
}
```

### Usage example

After an approval gate has been approved, the router can call the Slack API to post a message:

```sh
curl -X POST "https://slack.com/api/chat.postMessage" \
  -H "Authorization: Bearer ${SLACK_BOT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "channel": "#general",
    "text": "Deployment completed successfully",
    "blocks": null
  }'
```

### Gaps

- Slack API responses and error handling are not defined in detail.  Extend the schema if you need to capture more fields.
- Always ensure there is an approval gate before sending any Slack message to avoid unintended communications.
