# Apartment Coordinate Map

## Mục đích

Component `apartment-coordinate-map.tsx` cung cấp map picker để chọn tọa độ căn hộ (latitude, longitude) trong màn hình tạo/chỉnh sửa căn hộ.

## Thư viện sử dụng

- `leaflet`: vẽ map, marker, kéo marker, bắt sự kiện click map.
- OpenStreetMap tile layer: dữ liệu nền map qua URL `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`.
- Nominatim (OpenStreetMap): geocoding địa chỉ -> tọa độ (được gọi từ service geocode riêng).

## Nguyên lý hoạt động

1. Component khởi tạo map một lần khi mount.
2. Nếu form có tọa độ sẵn, map center theo tọa độ đó.
3. Nếu form chưa có tọa độ, map dùng default center (TP. Hồ Chí Minh).
4. Người dùng có thể:
   - Click lên map để đặt marker.
   - Kéo marker để chỉnh chính xác vị trí.
5. Mỗi lần marker thay đổi, component gọi `onPickCoordinate` để đồng bộ ngược về form.

## Đồng bộ với geocode tự động

- Luồng tổng thể:
  1. User chọn tỉnh/phường + nhập street.
  2. Editor tạo full address và gọi geocode service.
  3. Nếu geocode thành công, form cập nhật latitude/longitude.
  4. Map nhận props mới và di chuyển marker đến vị trí mới.
- Nếu geocode không tìm thấy, user vẫn có thể chọn tay trên map.

## Lý do xử lý z-index

Map (Leaflet panes và controls) mặc định dùng z-index cao, có thể đè lên popup/dropdown của form.

Đã áp dụng 2 lớp bảo vệ:

1. Wrapper map dùng stacking context riêng (`relative z-0 isolate`).
2. Hạ z-index của Leaflet panes/controls bằng Leaflet API ngay khi khởi tạo map (runtime).

Kết quả: dropdown tỉnh/phường xã luôn hiển thị trên map khi mở.

## Cấu hình môi trường

Biến môi trường bắt buộc:

- `NEXT_PUBLIC_NOMINATIM_BASE_URL`

Ví dụ trong file `.env.local`:

```env
NEXT_PUBLIC_NOMINATIM_BASE_URL=https://nominatim.openstreetmap.org
```

Service geocode sẽ throw lỗi nếu biến này không tồn tại.

## Lưu ý kỹ thuật

- Component tự thêm Leaflet CSS vào `document.head` nếu chưa có.
- Tọa độ gửi ra callback đã được làm tròn 6 chữ số thập phân.
- `disabled` mode sẽ khóa drag marker và thao tác map.

## Checklist test nhanh

1. Mở dropdown tỉnh/phường trên khu vực gần map, đảm bảo dropdown không bị map đè.
2. Chọn địa chỉ để geocode tự động cập nhật tọa độ.
3. Thử một địa chỉ khó (không ra kết quả ngay), xác nhận fallback query vẫn có thể tìm được.
4. Click map/kéo marker, xác nhận input latitude/longitude đổi theo.
5. Lưu form và mở lại detail, xác nhận tọa độ đã được persist.
