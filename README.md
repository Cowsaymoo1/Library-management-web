# Quan Ly Thu Vien

Ung dung quan ly thu vien gom 2 phan:

- Frontend: React + Vite + Ant Design
- Backend: Node.js + Express + MongoDB

## Tinh nang chinh

- Dang ky, dang nhap, dang xuat
- Quen mat khau (gui OTP qua email)
- Xem danh sach sach, tim kiem sach, xem chi tiet sach
- Tao yeu cau muon sach, huy yeu cau
- Quan tri sach, nguoi dung, yeu cau muon, cap the sinh vien
- Thong ke dashboard
- Tai lieu API bang Swagger UI

## Cau truc thu muc

```text
quan-ly-thu-vien/
  client/     # React app
  server/     # Express API
```

## Cong nghe

### Frontend

- React 19
- Vite 7
- Ant Design 5
- Axios
- React Router

### Backend

- Express 4
- Mongoose
- JWT
- Cookie-based auth
- Nodemailer + Google OAuth2
- Swagger UI Express

## Dieu kien can

- Node.js 18+
- npm 9+
- MongoDB (Atlas hoac local)

## Cai dat

### 1. Cai dat dependencies

Tu thu muc goc du an:

```bash
cd client
npm install

cd ../server
npm install
```

### 2. Cau hinh bien moi truong

Tao file `server/.env` (hoac cap nhat neu da co):

```dotenv
NODE_ENV="development"
PORT="3002"

SECRET_CRYPTO="your_secret_crypto"
JWT_SECRET="your_jwt_secret"
URL_CLIENT="http://localhost:5173"

USER_EMAIL="your_email@gmail.com"
CLIENT_ID="your_google_oauth_client_id"
CLIENT_SECRET="your_google_oauth_client_secret"
REDIRECT_URI="https://developers.google.com/oauthplayground"
REFRESH_TOKEN="your_google_oauth_refresh_token"

CLOUDINARY_CLOUD_NAME="your_cloudinary_cloud_name"
CLOUDINARY_API_KEY="your_cloudinary_api_key"
CLOUDINARY_API_SECRET="your_cloudinary_api_secret"

MONGODB_URI="your_mongodb_connection_string"
MONGODB_PORT="27017"
```

Tao file `client/.env`:

```dotenv
VITE_API_URL="http://localhost:3002"
VITE_API_URL_IMAGE="http://localhost:3002"
VITE_SECRET_CRYPTO="your_secret_crypto"
```

Luu y:

- `VITE_SECRET_CRYPTO` phai giong `SECRET_CRYPTO` ben server.
- Khong commit secret len git.

## Chay du an local

Mo 2 terminal:

### Terminal 1 - Backend

```bash
cd server
npm run dev
```

Server mac dinh: `http://localhost:3002`

### Terminal 2 - Frontend

```bash
cd client
npm run dev
```

Frontend mac dinh: `http://localhost:5173`

## API Documentation (Swagger)

Sau khi chay backend, mo:

- Swagger UI: `http://localhost:3002/api-docs`
- OpenAPI JSON: `http://localhost:3002/api-docs.json`

File spec hien tai:

- `server/src/docs/swagger.json`

## Build frontend

```bash
cd client
npm run build
```

## Deploy Render + Vercel (CI/CD)

### 1. Deploy backend len Render (lan dau)

1. Tao Web Service moi tren Render, ket noi den repo GitHub nay.
2. Chon Root Directory: `server`.
3. Build Command: `npm install`.
4. Start Command: `node src/server.js`.
5. Them Environment Variables tren Render:
    - `NODE_ENV=production`
    - `PORT=10000` (hoac de Render cap)
    - `URL_CLIENT=https://<ten-app-vercel>.vercel.app`
    - `SECRET_CRYPTO`, `JWT_SECRET`
    - `MONGODB_URI`
    - `USER_EMAIL`, `CLIENT_ID`, `CLIENT_SECRET`, `REDIRECT_URI`, `REFRESH_TOKEN`
    - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
6. Sau khi tao xong service, vao Settings > Deploy Hook va tao deploy hook URL.

### 2. Deploy frontend len Vercel (lan dau)

1. Import repo vao Vercel.
2. Chon Root Directory: `client`.
3. Build command: `npm run build`, Output directory: `dist`.
4. Them Environment Variables tren Vercel:
    - `VITE_API_URL=https://<render-service>.onrender.com`
    - `VITE_API_URL_IMAGE=https://<render-service>.onrender.com`
    - `VITE_SECRET_CRYPTO=<giong SECRET_CRYPTO ben backend>`

### 3. Cau hinh GitHub Secrets cho CI/CD

Vao GitHub repo > Settings > Secrets and variables > Actions, tao cac secrets:

- `RENDER_DEPLOY_HOOK_URL`: deploy hook URL cua Render service
- `VERCEL_TOKEN`: token tren Vercel
- `VERCEL_ORG_ID`: org id tren Vercel
- `VERCEL_PROJECT_ID`: project id cua frontend tren Vercel

### 4. Workflow da co san

- CI: `.github/workflows/ci.yml`
    - Build frontend
    - Sanity-check backend (validate swagger)
- CD: `.github/workflows/deploy.yml`
    - Trigger Render qua deploy hook
    - Deploy frontend production len Vercel

Sau khi setup xong secrets, moi lan push vao `main` (va CI pass) se tu dong deploy.

## Mot so loi thuong gap

### 1. 401 Unauthorized o `/api/user/auth`

- Kiem tra cookie dang nhap va cau hinh CORS credentials.
- Kiem tra `URL_CLIENT` va domain frontend.

### 2. Quen mat khau khong gui duoc mail

- Kiem tra bo `CLIENT_ID`, `CLIENT_SECRET`, `REFRESH_TOKEN` co cung mot OAuth client.
- Kiem tra `USER_EMAIL` dung tai khoan da cap quyen OAuth.
- Kiem tra Gmail API da enable trong Google Cloud.

### 3. Loi id undefined khi vao chi tiet sach

- Kiem tra link den trang chi tiet dung id (`id` hoac `_id`).

### 4. Upload anh loi voi Cloudinary

- Kiem tra du 3 bien `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` trong `server/.env`.
- Kiem tra API key/secret co dung voi cloud name khong.

## Ghi chu bao mat

- Khong de secret that trong README, issue, chat, screenshot.
- Neu secret da lo, can rotate ngay:
    - JWT_SECRET
    - SECRET_CRYPTO
    - Google OAuth secret/token
    - MongoDB password/URI
