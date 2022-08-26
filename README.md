# QRCode payment
Domain: wificaphe.com (có cả http và https)

### Client:
 - git clone: https://git.appota.com/congcf/qrcode-payment
 - cd vào thư mục src
### Biến môi trường:
 - Tạo ra file .env.local 
 - Tạo ra biến API_URL=https://dev.wificaphe.com trong file .env.local

### Đăng ký tài khoản:
 - Nếu Chưa Có Thì Đăng Ký Tài Khoản
 - Trước khi đăng nhập thì vào gmail cty cấp check để xác thực tài khoản
 - Lên CH Play tải ứng dụng Google Authenthiation để lấy mã Pin mỗi lần đăng nhập 
## Chạy Ứng Dụng:
    - yarn next
## Server
 - NodeJS: 14.15.0
 - Redis: lastest
 - MongoDB: lastest

## Biến môi trường:

```jsx
- DB_DSN (Connect to mongoDB)
- REDIS_HOST (Host redis)
- REDIS_PORT (Port redis)
- PORT (Port server)
```
- Config env được trên https://vault.appotapay.com để thêm sau

## Run
```bash
1. yarn install
2. yarn build
3. yarn start
```

- Note: Code giống như https://git.appota.com/congcf/landing-page-wifi-caphe, có thể tham khảo cách deploy của Repo trên
