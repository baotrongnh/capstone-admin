# Revenue Module Flow Documentation

## 1) Mục tiêu tài liệu

Tài liệu này mô tả đầy đủ:

- code hoạt động như thế nào (từ UI đến API và ngược lại)
- cách gọi API thực tế
- cách truyền data qua từng lớp
- file nào nằm ở đâu và vai trò từng file

## 2) Sơ đồ file và trách nhiệm

### 2.1) UI layer

- `src/app/admin/revenues/page.tsx`
  - Trang quản lý doanh thu.
  - Giữ state ngày đang áp dụng (`appliedFrom`, `appliedTo`) và period đang chọn (`selectedPeriod`).
  - Gọi hook `useRevenueDashboardByPeriod(selectedPeriod, filter)` để lấy dữ liệu chart + summary theo mode đang chọn.
  - Render các block: header, date picker, total card, summary card, trend chart (1 chart có selector), pie chart.

- `src/app/admin/dashboard/page.tsx`
  - Dashboard nhanh.
  - Gọi `useRevenueMonthlySummary()` để lấy doanh thu tháng hiện tại và tháng trước.
  - Render 1 card tổng doanh thu + CTA sang trang revenues.

- `src/components/revenue/revenue-date-range-picker.tsx`
  - Chọn khoảng ngày A -> B.
  - Trả dữ liệu về page bằng `onApply({ from, to })` (định dạng `YYYY-MM-DD`).

- `src/components/revenue/revenue-range-total-card.tsx`
  - Nhận `from`, `to` từ page.
  - Chuyển sang ISO đầu ngày/cuối ngày.
  - Gọi `useRevenueOverview(params)` để lấy tổng doanh thu cho đúng range A -> B.
  - Render `TotalRevenueCard`.

- `src/components/revenue/total-revenue-card.tsx`
  - Card hiển thị số doanh thu chính.
  - Có thể hiển thị trend nếu được truyền prop `trend`.

- `src/components/revenue/revenue-summary-cards.tsx`
  - Hiển thị 1 summary card theo period đang chọn.

- `src/components/revenue/revenue-trend-charts.tsx`
  - Hiển thị 1 chart chính theo period đang chọn (selector Ngày/Tháng/Quý/Năm) + 1 pie chart cơ cấu.

### 2.2) Hook + service + types

- `src/hooks/query/useRevenues.ts`
  - Chứa 3 hook public:
    - `useRevenueOverview(params)`
    - `useRevenueDashboardByPeriod(period, filter)`
    - `useRevenueDashboard(filter)` (wrapper mặc định period = month)
    - `useRevenueMonthlySummary()`
  - Build ranges, gọi service, tính `current/previous/changePercent` theo calendar shift của period.

- `src/lib/services/revenue.service.ts`
  - Hàm gọi API revenue:
    - `revenueService.getOverview(params)`

- `src/lib/apis/client.ts`
  - Axios client base config (`NEXT_PUBLIC_API_BASE_URL` + auth interceptor).

- `src/lib/apis/endpoints.ts`
  - Build endpoint path từ `API_PREFIX`.
  - `endpoints.revenues` dùng để ghép URL call revenues.

- `src/types/revenue.ts`
  - Type dùng chung toàn module revenues.
  - Type query/response lấy trực tiếp từ OpenAPI.

- `src/types/api.d.ts`
  - OpenAPI generated type source-of-truth.

### 2.3) Utility dùng chung

- `src/utils/date-utils.ts`
  - Parse/format date, convert ISO, chuẩn hóa range, helper period labels.

- `src/utils/revenue-calc.ts`
  - Constants period (`REVENUE_PERIOD_META`, `REVENUE_MAX_POINTS`, `REVENUE_PERIOD_ORDER`).
  - Công thức tăng trưởng và format phần trăm.

## 3) Cách gọi API thực tế

## 3.1) Endpoint

- API resource: `/revenues`
- Endpoint overview: `/overview`
- Full path gọi từ frontend service:
  - `GET ${endpoints.revenues}/overview`

Giá trị `endpoints.revenues` được tạo ở `src/lib/apis/endpoints.ts`:

- `endpoints.revenues = createEndpoints("revenues")`
- `createEndpoints(resource) => ${API_PREFIX}/${resource}`

Base URL được lấy từ `src/lib/apis/client.ts`:

- `baseURL = process.env.NEXT_PUBLIC_API_BASE_URL`

=> URL thực thi cuối cùng theo dạng:

- `${NEXT_PUBLIC_API_BASE_URL}${API_PREFIX}/revenues/overview`

## 3.2) Query params truyền lên API

Trong toàn module đang dùng các params sau:

- `from` (ISO string)
- `to` (ISO string)
- `partnerId` (optional)
- `page`, `limit` (optional, hiện chưa dùng ở flow chính)

## 3.3) Service function

File: `src/lib/services/revenue.service.ts`

- Hàm: `getOverview(params?: RevenueOverviewQuery): Promise<RevenueOverviewData>`
- Nếu backend chưa trả `data`, fallback về `EMPTY_REVENUE_OVERVIEW` để UI không crash.

## 4) Cách truyền data qua từng lớp

## 4.1) Flow trang Revenues (admin/revenues)

1. User chọn khoảng ngày ở `RevenueDateRangePicker`.
2. Picker trả về `from/to` dạng `YYYY-MM-DD` qua `onApply`.
3. `page.tsx` cập nhật state `appliedFrom`, `appliedTo`.
4. `page.tsx` tạo `filter = { from, to }` và dùng `selectedPeriod` truyền vào `useRevenueDashboardByPeriod(selectedPeriod, filter)`.
5. Trong hook:

- `normalizeDateFilter` chuẩn hóa date input.
- `buildRanges` tạo mốc theo rule cố định:
  - day: đủ tất cả ngày của tháng đang chọn
  - month: đủ 12 tháng của năm đang chọn
  - quarter: đủ 4 quý của năm đang chọn
  - year: chuỗi nhiều năm (rolling theo năm đang chọn)
- Mỗi mốc gọi `revenueService.getOverview({ from, to })`.
- `current` lấy theo period chứa mốc `filter.to` (hoặc hiện tại nếu không có filter).
- So sánh `previous` bằng cách lùi calendar theo period (day=-1 ngày, month=-1 tháng, quarter=-1 quý, year=-1 năm) rồi gọi API range trước đó.

6. Hook trả về `trend` + `summary` + `piePoint` cho period đang chọn.
7. `page.tsx` truyền:

- `summary` + `period` vào `RevenueSummaryCards`
- `trend` + `piePoint` + `period` + `onPeriodChange` vào `RevenueTrendCharts`

8. Song song đó, `RevenueRangeTotalCard` nhận `from/to` từ page:
   - convert `YYYY-MM-DD` -> ISO đầu ngày/cuối ngày
   - gọi `useRevenueOverview(params)`
   - render tổng doanh thu cho đúng khoảng A -> B.

## 4.2) Flow trang Dashboard (admin/dashboard)

1. `dashboard/page.tsx` gọi `useRevenueMonthlySummary()`.
2. Hook tạo 2 range:
   - tháng hiện tại
   - tháng trước
3. Gọi API overview 2 lần bằng `Promise.all`.
4. Tính `changePercent` và trả về `RevenueSummary`.
5. Dashboard truyền data vào `TotalRevenueCard`.

## 5) Cách tính toán trong code

## 5.1) Build period ranges

`useRevenueDashboardByPeriod` build mốc theo quy tắc đơn giản và cố định:

- `day`: luôn tạo đủ ngày của tháng đang chọn (1..lastDay)
- `month`: luôn tạo đủ 12 tháng của năm đang chọn
- `quarter`: luôn tạo đủ Q1..Q4 của năm đang chọn
- `year`: luôn tạo chuỗi năm tổng hợp (mặc định 5 năm gần nhất, neo theo năm đang chọn)

Trong đó “tháng/năm đang chọn” lấy theo mốc `to` của filter; nếu không có filter thì lấy thời điểm hiện tại.

## 5.2) Công thức tăng trưởng

File: `src/utils/revenue-calc.ts`

- `percentChange = ((current - previous) / previous) * 100`
- Chống chia 0:
  - nếu `previous <= 0` và `current > 0` => `100`
  - nếu `previous <= 0` và `current <= 0` => `0`
- Kết quả hiển thị dùng `roundPercent` (1 chữ số thập phân).

## 6) Type dùng chung và nguồn OpenAPI

File: `src/types/revenue.ts`

- `RevenueOverviewQuery` lấy trực tiếp từ:
  - `paths["/api/v1/revenues/overview"]["get"]["parameters"]["query"]`

- `RevenueOverviewData` lấy trực tiếp từ:
  - `paths["/api/v1/revenues/overview"]["get"]["responses"]["200"]["content"]["application/json"]["data"]`

- Các type view-model dùng chung cho UI:
  - `RevenueDateFilter`
  - `RevenueDateRange`
  - `RevenuePoint`
  - `RevenueSummary`
  - `RevenueTrend`
  - `RevenueDashboardData`

## 7) Query key và cache strategy

Trong `useRevenues.ts`, query key dùng primitive để ổn định cache:

- overview:
  - `["revenues", "overview", from, to, partnerId, page, limit]`
- dashboard:
  - `["revenues", "dashboard", period, from, to]`
- monthly summary:
  - `["revenues", "summary", "month"]`

## 8) Checklist khi sửa code

Khi cần đổi logic, sửa theo đúng lớp để tránh side-effect:

1. Đổi type API: `src/types/api.d.ts` (generate lại) -> cập nhật `src/types/revenue.ts`.
2. Đổi logic call API: `src/lib/services/revenue.service.ts`.
3. Đổi logic period/range/calc: `src/hooks/query/useRevenues.ts` + `src/utils/date-utils.ts` + `src/utils/revenue-calc.ts`.
4. Đổi UI hiển thị: `src/components/revenue/*`.

## 9) Lưu ý timezone

- Hiện đang gửi `from/to` dạng ISO UTC (`Date.toISOString()`).
- Nếu backend nhóm dữ liệu theo timezone khác UTC, có thể lệch biên ngày.
- Nếu cần chuẩn VN timezone tuyệt đối, cần thống nhất rule timezone ở backend hoặc chuẩn hóa lại tại lớp `src/utils/date-utils.ts`.
