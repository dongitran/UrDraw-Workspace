# Quy tắc đặt tên file SQL

Ví dụ: 001-start.sql
- 001: là tiền tố, theo số thứ tự tăng dần
- start: tên file (mô tả ngắn gọn mục đích của file, viết theo dạng CamelCase)
- sql: là loại file

# Quy tắc khi viết file SQL

> Luôn luôn tạo file sql mới, chứ không được phép sửa trên chính file cũ. Vì đang theo nguyên tắc là history log. Nếu bạn muốn sửa cột như: sửa tên cột, thay đổi kiểu dữ liệu thì tạo file sql mới và viết câu lệnh after table để thay đổi. Tương tự cho xóa cột, xóa table, thêm mối quan hệ, thêm khóa ngoại...v..v...
