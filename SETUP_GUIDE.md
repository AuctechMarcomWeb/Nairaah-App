# Redux + API Setup Guide

## 📁 Structure

```
src/
├── api/
│   ├── apiConfig.js          # Axios instance + interceptors
│   └── auth.js               # Auth API calls
├── redux/
│   ├── slice/
│   │   └── userSlice.js      # User state + thunks
│   └── store.js              # Redux store config
└── navigation/
    └── RootNavigation.js     # Auth check + navigation
```

## 🔐 API Endpoints

### Login
**POST** `https://api.nairaah.in/api/auth/loginWithPassword`

Request:
```json
{
  "userId": "Admin",
  "password": "Admin@123"
}
```

Response:
```json
{
  "statusCode": 200,
  "data": {
    "_id": "6a5f26f613127c77461be7b7",
    "userId": "Admin",
    "name": "Admin",
    "role": "Admin",
    "authToken": "eyJhbGc..."
  },
  "success": true
}
```

### Get Profile
**GET** `https://api.nairaah.in/api/auth/profile`

Headers: `Authorization: Bearer {authToken}`

Response:
```json
{
  "statusCode": 200,
  "data": {
    "user": {
      "_id": "6a5f26f613127c77461be7b7",
      "userId": "Admin",
      "name": "Admin",
      "role": "Admin",
      "phone": "1111111111",
      "wallet": 0
    }
  },
  "success": true
}
```

## 🚀 Usage Examples

### 1. Login in LoginScreen

```javascript
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from './src/redux/slice/userSlice';

const LoginScreen = () => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector(state => state.user);

  const handleLogin = async () => {
    try {
      await dispatch(loginUser({ 
        userId: 'Admin', 
        password: 'Admin@123' 
      })).unwrap();
      
      // Navigation happens automatically!
    } catch (err) {
      console.log('Login failed:', err);
    }
  };

  return (
    <TouchableOpacity onPress={handleLogin}>
      <Text>{loading ? 'Logging in...' : 'Login'}</Text>
    </TouchableOpacity>
  );
};
```

### 2. Get User Data in Any Screen

```javascript
import { useSelector } from 'react-redux';

const DashboardScreen = () => {
  const { user, token, loading } = useSelector(state => state.user);

  return (
    <View>
      <Text>Welcome, {user?.name}</Text>
      <Text>Role: {user?.role}</Text>
      <Text>Phone: {user?.phone}</Text>
    </View>
  );
};
```

### 3. Fetch Updated Profile

```javascript
import { useDispatch, useSelector } from 'react-redux';
import { fetchProfile } from './src/redux/slice/userSlice';

const ProfileScreen = () => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector(state => state.user);

  useEffect(() => {
    dispatch(fetchProfile());
  }, []);

  if (loading) return <ActivityIndicator />;

  return (
    <View>
      <Text>{user?.name}</Text>
      <Text>Wallet: ₹{user?.wallet}</Text>
    </View>
  );
};
```

### 4. Logout

```javascript
import { useDispatch } from 'react-redux';
import { logoutUser } from './src/redux/slice/userSlice';

const ProfileScreen = () => {
  const dispatch = useDispatch();

  const handleLogout = async () => {
    await dispatch(logoutUser());
    // Automatically navigates back to LoginScreen
  };

  return (
    <TouchableOpacity onPress={handleLogout}>
      <Text>Logout</Text>
    </TouchableOpacity>
  );
};
```

## 🔄 Flow

```
App.js
  ↓
Redux Store (Provider)
  ↓
RootNavigation
  ├─ Restores token from AsyncStorage
  ├─ Sets Redux token
  ├─ Checks if token exists
  │
  ├─ Token found → AuthNavigation
  │   ├─ Dashboard
  │   ├─ Team
  │   ├─ Profile
  │   └─ etc.
  │
  └─ No token → UnauthNavigation
      ├─ Splash
      └─ Login
```

## 🎯 Redux Selectors

```javascript
const { user, token, loading, error, isAuthenticated } = useSelector(state => state.user);

// user: { _id, userId, name, role, phone, ... }
// token: "eyJhbGc..."
// loading: boolean
// error: string or null
// isAuthenticated: boolean
```

## 🔑 API Interceptor

All API calls automatically:
- ✅ Add `Authorization: Bearer {token}` header
- ✅ Cache token in memory (faster than AsyncStorage)
- ✅ Handle 401 errors (auto-logout)
- ✅ Timeout after 15 seconds

## 📝 API Configuration

File: `src/api/apiConfig.js`

```javascript
const api = createAxiosInstance('auth');
// baseURL: https://api.nairaah.in/api/auth

const api2 = createAxiosInstance('users');
// baseURL: https://api.nairaah.in/api/users
```

## ✅ Checklist

- [x] Redux slice setup (userSlice.js)
- [x] API config (apiConfig.js)
- [x] Auth API endpoints (auth.js)
- [x] RootNavigation with Redux
- [x] App.js with Redux Provider
- [x] Token pre-warming

## 🚀 Ready to Use!

Start with the login screen example in `LOGIN_REDUX_EXAMPLE.js`
