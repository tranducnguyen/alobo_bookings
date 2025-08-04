# Quản lý đặt sân bóng - alobo_bookings

## Giới thiệu

Dự án này hỗ trợ quản lý trạng thái đặt sân, kiểm tra sân trống, xử lý thời gian, lọc và xuất danh sách sân, mã hóa/giải mã dữ liệu liên quan đến đặt sân.

## Cấu trúc thư mục

- `main.js`: Hàm chính, xử lý mã hóa/giải mã AES, gọi các hàm tiện ích.
- `fill.util.js`: Tổng hợp trạng thái đặt sân theo từng slot thời gian.
- `util.js`: Tiện ích xử lý thời gian, kiểm tra sân trống, kiểm tra đặt lịch, chuyển đổi thời gian.
- `get_yards.js`: Lọc và xuất danh sách sân theo điều kiện từ file `input.json`.
- `config.js`: Cấu hình các thương hiệu (`BRANDS`).
- `branchs.json`, `input.json`: Dữ liệu đầu vào về các sân/chi nhánh.
- `output.txt`: Kết quả xuất dữ liệu.
- `package.json`: Thông tin cấu hình npm.

## Các chức năng chính

### 1. Quản lý trạng thái đặt sân

Tổng hợp trạng thái đặt sân theo từng slot 30 phút trong ngày, dựa trên các nguồn:
- Sân bị khóa
- Đặt lịch theo lịch trình
- Đặt lịch một lần

### 2. Kiểm tra sân còn trống

Trả về danh sách các sân còn trống trong khoảng thời gian chỉ định, loại trừ các sân đã bị khóa hoặc đã được đặt.

### 3. Xử lý thời gian và kiểm tra trùng lặp

Hỗ trợ chuyển đổi và kiểm tra thời gian đặt sân, phát hiện trùng lặp.

### 4. Lọc và xuất danh sách sân

Lọc danh sách sân theo điều kiện (loại, trạng thái, tỉnh/thành) và xuất ra file JSON.

### 5. Mã hóa/giải mã dữ liệu

Hỗ trợ xử lý dữ liệu trả về từ API bằng mã hóa/giải mã AES.

## Hướng dẫn sử dụng

1. Cài đặt các package cần thiết:
    ```sh
    npm install
    ```
2. Chạy script lọc sân:
    ```sh
    node get_yards.js
    ```
3. Sử dụng các hàm tiện ích trong các file JS để kiểm tra trạng thái sân, đặt lịch, hoặc xử lý dữ liệu theo nhu cầu.

---

**Lưu ý:** Dự án này chỉ nhằm mục đích học tập, *không sử dụng vào các mục đích trái phép, thương mại hoặc vi phạm pháp luật*
