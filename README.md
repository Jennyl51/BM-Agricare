# BM-Agricare
## This is a project

## Rewards / Points / Redemptions API

### GET `/rewards`

- **Header:** `Authorization: Bearer <access_token>`
- **Input:** none
- **Response:** `[ { reward_id, name, points_needed, quantity_available, tier_requirement }, ... ]`
- **Errors:** 401 invalid token

### GET `/points/history`

- **Header:** `Authorization: Bearer <access_token>`
- **Input:** none
- **Response:** `[ { points_earned, points_redeemed, description, occurred_at }, ... ]`
- **Errors:** 401 invalid token

### POST `/redemptions`

- **Header:** `Authorization: Bearer <access_token>`, `Content-Type: application/json`
- **Input:** `{ items: [ { reward_id, quantity } ], retailer_location? }`
- **Response:** `{ redemption_id, status, points_spent }`
- **Errors:** 401 invalid token, 400 empty items / invalid item body

### GET `/redemptions/me`

- **Header:** `Authorization: Bearer <access_token>`
- **Input:** none
- **Response:** `[ { redemption_id, created_at, status, task_done }, ... ]`
- **Errors:** 401 invalid token

### GET `/tce/redemptions`

- **Header:** `Authorization: Bearer <access_token>` (TCE only)
- **Input:** query `pending_only` boolean, default `true`
- **Response:** `[ { redemption_id, status }, ... ]`
- **Errors:** 401 invalid token, 403 not TCE

### GET `/tce/redemptions/{redemption_id}`

- **Header:** `Authorization: Bearer <access_token>` (TCE only)
- **Input:** path `redemption_id`
- **Response:** `{ redemption_id, status, task_done, retailer_user_id, retailer_username, retailer_location, notes, created_at, updated_at, items: [ { reward_id, name, quantity, points_per_unit }, ... ] }`
- **Errors:** 401 invalid token, 403 not TCE, 404 redemption not found

### PATCH `/tce/redemptions/{redemption_id}`

- **Header:** `Authorization: Bearer <access_token>` (TCE only), `Content-Type: application/json`
- **Input:** `{ status?, task_done?, notes? }`
- **Response:** `{ message, redemption_id }`
- **Errors:** 401 invalid token, 403 not TCE, 400 no fields, 404 redemption not found

### Error response format

When the API returns a user-facing error for these endpoints, it uses:

- **Response:** `{ "detail": { "message": "<human readable>", "code": "<MACHINE_CODE>" } }`

Example:

- **400**: `{ "detail": { "message": "No fields to update", "code": "NO_FIELDS" } }`