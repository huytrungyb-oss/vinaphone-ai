# Hướng dẫn Deploy Vinaphone AI lên Hostinger VPS

## Yêu cầu

- VPS Hostinger (KVM 1 trở lên) chạy Ubuntu 22.04/24.04
- Domain đã trỏ bản ghi A về IP của VPS
- Tài khoản MongoDB Atlas (free tier) và OpenAI API key

## Bước 1: Chuẩn bị VPS

SSH vào VPS:

```bash
ssh root@<IP_VPS>
```

Cài Node.js 20 LTS (yêu cầu tối thiểu của Next.js 16):

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v   # phải >= 20.9
```

Cài PM2 (quản lý process Node.js) và Nginx:

```bash
sudo npm install -g pm2
sudo apt update && sudo apt install -y nginx
```

## Bước 2: Lấy code từ GitHub

```bash
cd /var/www
sudo git clone https://github.com/<your-github-username>/vinaphone-ai.git
cd vinaphone-ai
sudo chown -R $USER:$USER /var/www/vinaphone-ai
```

## Bước 3: Cấu hình biến môi trường

```bash
cp .env.example .env.local
nano .env.local
```

Điền:
- `MONGODB_URI` — connection string MongoDB Atlas
- `OPENAI_API_KEY` — API key OpenAI
- `NEXTAUTH_SECRET` — tạo bằng `openssl rand -base64 32`
- `NEXTAUTH_URL` — `https://<domain-cua-ban>`

## Bước 4: Cài đặt & build

```bash
npm install
npm run build
```

## Bước 5: Chạy app với PM2

```bash
pm2 start npm --name "vinaphone-ai" -- start
pm2 save
pm2 startup   # chạy lệnh mà PM2 in ra để tự khởi động cùng VPS
```

Kiểm tra app đang chạy ở cổng 3000:

```bash
curl http://localhost:3000
pm2 logs vinaphone-ai
```

## Bước 6: Cấu hình Nginx reverse proxy

Tạo file cấu hình site:

```bash
sudo nano /etc/nginx/sites-available/vinaphone-ai
```

Nội dung:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        # cần cho streaming response (SSE) của chat
        proxy_buffering off;
        proxy_read_timeout 120s;
    }
}
```

Kích hoạt site:

```bash
sudo ln -s /etc/nginx/sites-available/vinaphone-ai /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Bước 7: Cài SSL miễn phí (Let's Encrypt)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

Certbot sẽ tự động cấu hình HTTPS và redirect HTTP → HTTPS. Chứng chỉ tự gia hạn qua cron/systemd timer có sẵn.

Sau khi có domain HTTPS, cập nhật lại `NEXTAUTH_URL=https://your-domain.com` trong `.env.local`, sau đó:

```bash
pm2 restart vinaphone-ai
```

## Cập nhật phiên bản mới sau này

```bash
cd /var/www/vinaphone-ai
git pull
npm install
npm run build
pm2 restart vinaphone-ai
```

## Mở firewall (nếu dùng UFW)

```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

## Lưu ý bảo mật

- Không bao giờ commit `.env.local` lên GitHub (đã có trong `.gitignore`)
- Đặt `MONGODB_URI` dùng user có quyền giới hạn (read/write trên database `vinaphone-ai` thôi)
- Giới hạn IP truy cập MongoDB Atlas (Network Access) hoặc cho phép `0.0.0.0/0` nếu VPS có IP động
- Theo dõi usage OpenAI API để tránh phát sinh chi phí ngoài ý muốn
