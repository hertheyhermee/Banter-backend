# Banter Backend API Documentation

## Overview
Banter is a football social platform that allows fans to engage in discussions, share memes, participate in banter battles, and follow live matches.

## Base URL
```
http://localhost:3002/api
```

## View Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/login` | Render login page |
| GET | `/signup` | Render signup page |
| GET | `/` | Render index page |

## Authentication Endpoints

### Auth Routes (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register a new user | No |
| POST | `/auth/login` | Login user | No |
| POST | `/auth/logout` | Logout user | Yes |

### OAuth Routes (`/auth`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/auth/google` | Google OAuth login | No |

## User Management

### User Routes (`/api/users`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/users` | Get all users | Yes |
| GET | `/users/:id` | Get specific user | Yes |
| PUT | `/users/:id` | Update user | Yes |
| DELETE | `/users/:id` | Delete user | Yes |

## Match & Commentary

### Match Routes (`/api/matches`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/matches/live` | Get all live matches | No |
| GET | `/matches/:id` | Get specific match details | No |
| GET | `/matches/:id/comments` | Get match comments | No |
| GET | `/comments/:commentId/replies` | Get comment replies | No |
| GET | `/memes/available` | Get available memes | No |
| POST | `/matches/:id/comments` | Add comment to match | Yes |
| POST | `/matches/:id/memes` | Add meme comment to match | Yes |
| POST | `/comments/:commentId/like` | Like/unlike a comment | Yes |

## Memes & Media

### Meme Routes (`/api/memes`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/memes` | Create new meme | Yes |
| GET | `/memes/:memeId` | Get specific meme | Yes |
| POST | `/memes/:memeId/like` | Like a meme | Yes |
| POST | `/memes/:memeId/share` | Share a meme | Yes |
| GET | `/memes/club/:clubId` | Get club memes | Yes |
| GET | `/memes/user/:userId` | Get user memes | Yes |
| GET | `/memes/trending` | Get trending memes | Yes |

## Clubs & Leagues

### Club Routes (`/api/clubs`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/clubs` | Get all clubs | No |
| GET | `/clubs/:id` | Get specific club | No |

### League Routes (`/api/leagues`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/leagues` | Get all leagues | No |
| GET | `/leagues/:id` | Get specific league | No |

## WebSocket Events

### Real-time Events
| Event | Description |
|-------|-------------|
| `match:update` | Live match updates |
| `user:joined` | User joined room |
| `user:left` | User left room |

## Authentication

All protected endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Error Responses
All endpoints follow the same error response format:
```json
{
    "message": "Error description",
    "code": "ERROR_CODE",
    "details": {}
}
```

## Status Codes
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Server Error 