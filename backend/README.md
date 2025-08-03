# Backend API Documentation

## Authentication Endpoints

### Register User

- **URL**: `/api/auth/register`
- **Method**: `POST`
- **Auth required**: No
- **Data constraints**:

```json
{
  "name": "[name of user]",
  "email": "[valid email address]",
  "password": "[password with minimum 6 characters]"
}
```

- **Success Response**:

```json
{
  "_id": "[user id]",
  "name": "[user name]",
  "email": "[user email]",
  "token": "[jwt token]"
}
```

### Login User

- **URL**: `/api/auth/login`
- **Method**: `POST`
- **Auth required**: No
- **Data constraints**:

```json
{
  "email": "[valid email address]",
  "password": "[password]"
}
```

- **Success Response**:

```json
{
  "_id": "[user id]",
  "name": "[user name]",
  "email": "[user email]",
  "token": "[jwt token]"
}
```

### Get User Profile

- **URL**: `/api/auth/profile`
- **Method**: `GET`
- **Auth required**: Yes (Bearer token in Authorization header)
- **Success Response**:

```json
{
  "_id": "[user id]",
  "name": "[user name]",
  "email": "[user email]",
  "createdAt": "[timestamp]",
  "updatedAt": "[timestamp]"
}
```

## AI Code Review Endpoints

### Get Code Review

- **URL**: `/ai/get-review`
- **Method**: `POST`
- **Auth required**: No
- **Data constraints**:

```json
{
  "code": "[code to review]"
}
```

- **Success Response**: AI-generated code review

## Environment Variables

Create a `.env` file in the root of the backend directory with the following variables:

```
PORT=3000
GOOGLE_API_KEY=your_google_api_key_here
MONGODB_URI=your_mongodb_connection_string_here
JWT_SECRET=your_jwt_secret_here
```
