# Setup development
step 0: seed json data vô file database.sqlite ở thư mục gốc

`npm run seed`

step 1: dev chương trình

`npm run dev`

# Build & run

`npm run build`
`npm run start`

# Note

## 1. Lấy sqlite làm datasource 
Từ data từ [json](https://microsoftedge.github.io/Demos/json-dummy-data/5MB.json) trên Figma, tải về và import vào file database.sqlite

Dùn một database giúp dễ dàng thao tác dữ liệu như insert, update, delete hơn là data ở bộ nhớ khi start server. Nó giống môi trường thật với data được persist ngay cả khi restart server

## 2. Lazy load/infinite scroll

Để có performance tốt với hàng ngàn row cần cân nhắc tới giải pháp virtualization (aka occlude culling) chỉ giới hạn render, DOM writes ở một khoảng nhất định như viewport. Trong bài làm, em qui định height là 600px.

Các thư viện TanStack như TanStack Query, TanStack Table, TanStack Virtual, v.v. giúp hỗ trợ đặc biệt hữu ích cho yêu cầu này.

## 3. Editing & Inline editing

Trong database.sqlite có field position: number thể hiện vị trí.

pros: giúp cập nhật data ở một row cụ thể
cons: chưa có solution để thêm row mới vào giữa các rows

TanStack table có ví dụ để inline editing [link](https://tanstack.com/table/latest/docs/framework/react/examples/editable-data), ngoài ra còn có search, sort và filter bảng.