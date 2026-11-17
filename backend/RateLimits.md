# Rate limits

Each action has its own counter in Redis. Past the limit the response is `429` and `{ "message": "Too many attempts." }`. With no `REDIS_URL` the limiter does nothing.

The window starts on the first request for that key. `EXPIRE` with `NX` does not extend it on later attempts.

## Flow

The gateway only proxies. The service that performs the action rejects the request.

Login, register, and token refresh are counted in auth by client IP. Avatar reads are counted in user by client IP. Both services trust one proxy hop, so `req.ip` is the client address forwarded by the gateway.

The other limits use `userId` from the verified token. For an attachment and an avatar write, the counter runs before the file is accepted.

WebSocket, the internal user routes (`POST /` and `POST /userOfEmailActive`), and reads of chats, messages, and games are not limited.

## Auth and user, key `rl:{action}:{ip}`

| Action | Where | Limit | Window | Variables |
| --- | --- | --- | --- | --- |
| login and register | auth, `POST /login`, `POST /register` | 5 | 30 s | `AUTH_RATE_LIMIT`, `AUTH_RATE_WINDOW_SECONDS` |
| token refresh | auth, `POST /refresh` | 10 | 30 s | `AUTH_REFRESH_RATE_LIMIT`, `AUTH_REFRESH_RATE_WINDOW_SECONDS` |
| avatar read | user, `GET /:id/avatar` | 30 | 30 s | `AVATAR_READ_RATE_LIMIT`, `AVATAR_READ_RATE_WINDOW_SECONDS` |

Login and register share one key, `rl:auth:{ip}`.

## Services, key `rl:{action}:{userId}`

| Action | Where | Limit | Window | Variables |
| --- | --- | --- | --- | --- |
| message | chat, `POST /:id/messages` | 20 | 30 s | `CHAT_MESSAGE_RATE_LIMIT`, `CHAT_MESSAGE_RATE_WINDOW_SECONDS` |
| attachment | chat, `POST /:id/attachment` | 5 | 60 s | `CHAT_ATTACHMENT_RATE_LIMIT`, `CHAT_ATTACHMENT_RATE_WINDOW_SECONDS` |
| new chat | chat, `POST /` | 10 | 60 s | `CHAT_CREATE_RATE_LIMIT`, `CHAT_CREATE_RATE_WINDOW_SECONDS` |
| add member | chat, `POST /:id/members` | 50 | 60 s | `CHAT_MEMBER_RATE_LIMIT`, `CHAT_MEMBER_RATE_WINDOW_SECONDS` |
| user search | user, `GET /` only when `username` is present | 20 | 30 s | `USER_SEARCH_RATE_LIMIT`, `USER_SEARCH_RATE_WINDOW_SECONDS` |
| avatar write | user, `PUT /:id/avatar` | 5 | 60 s | `AVATAR_WRITE_RATE_LIMIT`, `AVATAR_WRITE_RATE_WINDOW_SECONDS` |
| new game | game, `POST /` | 10 | 60 s | `GAME_CREATE_RATE_LIMIT`, `GAME_CREATE_RATE_WINDOW_SECONDS` |
| move | game, `POST /:id/moves` | 30 | 30 s | `GAME_MOVE_RATE_LIMIT`, `GAME_MOVE_RATE_WINDOW_SECONDS` |

Adding a member has its own key, `rl:chat-member:{userId}`. A group still holds at most 50 members.
