# Chat with OpenAI Edge Function

This Edge Function provides an interface to OpenAI's GPT API for task management assistance.

## Deployment

```bash
supabase functions deploy chat-with-gemini --no-verify-jwt
supabase secrets set OPENAI_API_KEY=your-api-key
```

## Environment Variables

- `OPENAI_API_KEY`: Your OpenAI API key

## Usage

The function expects a POST request with the following body:

```json
{
  "messages": [
    {
      "content": "タスクの整理方法を教えてください",
      "mode": "user"
    }
  ]
}
```

Response format:

```json
{
  "content": "AIからの応答メッセージ"
}
```

## Error Handling

Errors are returned with a 500 status code and include an error message:

```json
{
  "error": "エラーメッセージ"
}