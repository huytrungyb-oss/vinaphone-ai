# Vinaphone AI

Ứng dụng chatbot AI thương hiệu Vinaphone, xây dựng bằng Next.js 16 (App Router) + MongoDB + OpenAI API.

## Tính năng

- Đăng ký / đăng nhập tài khoản (NextAuth.js, mật khẩu mã hoá bcrypt)
- Trò chuyện với AI theo thời gian thực (streaming) qua OpenAI API
- Chọn model AI (GPT-4o mini, GPT-4o, GPT-4 Turbo)
- Lưu lịch sử hội thoại theo từng người dùng (MongoDB)
- Giao diện sidebar lịch sử chat giống ChatGPT, theme thương hiệu Vinaphone

## Công nghệ

- **Frontend/Backend**: Next.js 16 (App Router, Turbopack), TypeScript, Tailwind CSS 4
- **Auth**: NextAuth.js v5 (Credentials provider)
- **Database**: MongoDB Atlas (Mongoose ODM)
- **AI**: OpenAI API (streaming chat completion)

## Cài đặt local

1. Cài dependencies:

```bash
npm install
```

2. Tạo file `.env.local` từ `.env.example` và điền giá trị thật:

```bash
cp .env.example .env.local
```

| Biến | Mô tả |
|---|---|
| `MONGODB_URI` | Connection string MongoDB Atlas |
| `OPENAI_API_KEY` | API key từ platform.openai.com |
| `NEXTAUTH_SECRET` | Chuỗi bí mật, tạo bằng `openssl rand -base64 32` |
| `NEXTAUTH_URL` | URL của app (local: `http://localhost:3000`) |

3. Chạy dev server:

```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000).

## Build production

```bash
npm run build
npm run start
```

## Triển khai lên Hostinger VPS

Xem hướng dẫn chi tiết tại [`DEPLOY.md`](./DEPLOY.md).

Tóm tắt:

1. SSH vào VPS, cài Node.js 20+, PM2, Nginx
2. Clone repo từ GitHub, `npm install && npm run build`
3. Chạy app bằng PM2 (`pm2 start npm --name vinaphone-ai -- start`)
4. Cấu hình Nginx reverse proxy trỏ về `localhost:3000`
5. Cài SSL miễn phí bằng Certbot (Let's Encrypt)

## Cấu trúc thư mục chính

```
src/
  app/
    page.tsx            # Landing page
    login/               # Trang đăng nhập
    register/             # Trang đăng ký
    chat/                 # Giao diện chat (yêu cầu đăng nhập)
    api/
      auth/[...nextauth]/ # NextAuth route
      register/            # API đăng ký tài khoản
      chat/                # API chat streaming (OpenAI)
      conversations/        # API quản lý lịch sử hội thoại
  components/
    chat/                # Sidebar, ChatWindow
  lib/                    # db, auth, openai config
  models/                 # Mongoose schemas (User, Conversation)
  proxy.ts                # Bảo vệ route /chat (yêu cầu đăng nhập)
```
