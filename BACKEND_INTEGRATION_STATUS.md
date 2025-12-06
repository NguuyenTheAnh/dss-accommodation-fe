===========================================
HƯỚNG DẪN TÍCH HỢP BACKEND - DORMFINDER
===========================================
Ngày cập nhật: 05/12/2025

═══════════════════════════════════════════
I. ĐÃ HOÀN THÀNH
═══════════════════════════════════════════

✅ 1. CẬP NHẬT API.JS
─────────────────────

Đã implement đầy đủ các API functions theo spec backend:

AUTH APIs:
✓ adminLoginApi(username, password)

ROOM APIs:
✓ getAllRoomsApi(pageNumber, pageSize)
✓ getRoomDetailApi(roomId)
✓ createRoomApi(roomData)
✓ updateRoomApi(roomData)
✓ deleteRoomsApi(ids)

AREA TYPE APIs:
✓ getAllAreaTypesApi()

SURVEY APIs:
✓ getAllSurveysApi()

SURVEY QUESTION APIs:
✓ getAllSurveyQuestionsApi(surveyId)
✓ createSurveyQuestionApi(data)
✓ updateSurveyQuestionApi(data)
✓ deleteSurveyQuestionsApi(ids)

FILE APIs:
✓ uploadFilesApi(formData)

PUBLIC APIs (TODO khi backend ready):
⏳ searchRoomsApi(filter, pageNumber, pageSize)
⏳ getFeaturedRoomsApi()
⏳ getPublicRoomDetailApi(roomId)

✅ 2. CẬP NHẬT LOGINPAGE
────────────────────────

✓ Import adminLoginApi từ api.js
✓ Thay thế mock login bằng API call thực
✓ Check response.code === '00' để verify success
✓ Hiển thị response.message khi có lỗi
✓ Try-catch error handling

✅ 3. CẬP NHẬT ROOMMANAGEMENTPAGE
──────────────────────────────────

✓ Import các API: getAllRoomsApi, deleteRoomsApi, createRoomApi, getAllAreaTypesApi
✓ Thêm state pagination với { current, pageSize, total }
✓ Thêm state areaTypes
✓ fetchRooms() gọi getAllRoomsApi với pagination
✓ fetchAreaTypes() load danh sách khu vực
✓ handleDelete() gọi deleteRoomsApi
✓ handleSubmit() gọi createRoomApi với đầy đủ fields:
  - landlordUserId (tạm hard-code = 1)
  - title, description, address
  - latitude, longitude
  - priceVnd, areaSqm
  - roomType, status, areaTypeId
  - surveyAnswers, roomCoverImageId, roomNotCoverImageIds

✓ Cập nhật Table columns mapping với API response:
  - id → id
  - name → title
  - price → priceVnd
  - area → areaSqm
  - distance → REMOVED (backend không có trong response)
  - status → status (AVAILABLE/RENTED)
  - THÊM: roomCoverImageUrl, roomType, avgAmenity, avgSecurity

✓ Cập nhật Modal form:
  - Thêm field: description, latitude, longitude
  - Thêm Select: roomType, areaTypeId
  - Đổi status từ <select> sang <Select> Ant Design
  - initialValues: roomType='SINGLE', status='AVAILABLE'
  - Grid layout 2 columns cho các field số

✓ Cập nhật Pagination:
  - Hiển thị current, total từ API response
  - onChange callback gọi fetchRooms(page)

✅ 4. TẠO CONSTANTS.JS
───────────────────────

✓ ROOM_TYPE: SINGLE, SHARED, STUDIO, APARTMENT
✓ ROOM_TYPE_LABELS: mapping sang tiếng Việt
✓ ROOM_STATUS: AVAILABLE, RENTED
✓ ROOM_STATUS_LABELS: mapping sang tiếng Việt
✓ SURVEY_TYPE: AMENITY, SECURITY
✓ DEFAULT_COORDINATES: Hà Nội (21.0285, 105.8542)
✓ RESPONSE_CODE: SUCCESS='00', ERROR='exception'

✅ 5. KIỂM TRA .ENV
────────────────────

✓ .env.development có VITE_BACKEND_URL=http://localhost:8080
✓ axios.customize.js đã dùng import.meta.env.VITE_BACKEND_URL

═══════════════════════════════════════════
II. CẦN HOÀN THIỆN TIẾP
═══════════════════════════════════════════

⏳ A. ROOMDETAILMANAGEMENT COMPONENT
─────────────────────────────────────

1. Cập nhật để nhận đúng data structure từ API:
   - room.title thay vì room.name
   - room.priceVnd thay vì room.price
   - room.areaSqm thay vì room.area
   - room.status: 'AVAILABLE' thay vì 'available'

2. Tab "Chi tiết phòng":
   - Load và hiển thị room từ getRoomDetailApi(id)
   - Edit mode: gọi updateRoomApi với đúng format
   - Cần thêm fields: latitude, longitude, roomType, areaTypeId

3. Tab "Form khảo sát":
   - Hiện đang dùng mock data
   - CẦN: Load survey questions từ getAllSurveyQuestionsApi
   - Hiển thị câu trả lời survey của phòng (nếu có từ room detail API)
   - Mock data survey responses cần thay bằng data thực

⏳ B. HOMEPAGE
──────────────

1. Thay mock data 6 phòng bằng getFeaturedRoomsApi()
2. Cập nhật RoomCard để map đúng fields:
   - title, priceVnd, areaSqm
   - roomCoverImageUrl
   - avgAmenity, avgSecurity (hiển thị như rating)

⏳ C. SEARCHRESULTPAGE
──────────────────────

1. Thay mock data 50 phòng bằng searchRoomsApi()
2. Gửi filters khi user thay đổi SidebarFilter:
   - areaTypeId
   - roomType
   - maxPriceVnd
   - minAreaSqm
   - (có thể thêm: minAvgAmenity, minAvgSecurity)

3. Cập nhật RoomCardHorizontal:
   - Map đúng fields như HomePage
   - Best Choice logic (nếu backend có field)

⏳ D. ROOMDETAILPAGE (Student)
──────────────────────────────

1. Gọi getPublicRoomDetailApi(id) thay vì getRoomDetailApi
2. Cập nhật RoomInfoSection:
   - title, priceVnd, areaSqm
   - latitude, longitude cho map
   - avgAmenity, avgSecurity
   - landlord info: fullName, phoneNumber

3. RouteMapSection:
   - Dùng room.latitude, room.longitude
   - School coordinates có thể từ areaType hoặc fix

4. DecisionExplanation:
   - Nếu backend trả về score/normalized data → hiển thị
   - Nếu không → FE tự tính như hiện tại

⏳ E. SURVEYFORMPAGE
────────────────────

1. Hiện tại chỉ có form input
2. CẦN implement submitSurveyApi khi submit
3. Validation theo backend schema
4. Success → redirect hoặc reset form

⏳ F. FILE UPLOAD
─────────────────

1. Tạo ImageUpload component:
   - Multi-file upload
   - Preview thumbnails
   - Gọi uploadFilesApi(formData)
   - Lưu response.data (list {id, url})

2. Tích hợp vào Modal "Thêm phòng":
   - Upload ảnh trước
   - Chọn 1 ảnh làm cover
   - Gửi roomCoverImageId + roomNotCoverImageIds

3. Tích hợp vào RoomDetailManagement Edit mode

⏳ G. SURVEY QUESTIONS MANAGEMENT
──────────────────────────────────

1. Tạo trang /management/survey-questions
2. Tabs theo survey type (AMENITY, SECURITY)
3. CRUD survey questions:
   - List với questionOrder
   - Add, Edit, Delete
   - Drag to reorder (optional)

4. Dùng trong form tạo/sửa phòng:
   - Load questions từ getAllSurveyQuestionsApi
   - Render inputs để chấm điểm 1-5
   - Submit surveyAnswers array

═══════════════════════════════════════════
III. MAPPING DATA STRUCTURE
═══════════════════════════════════════════

📋 A. ROOM OBJECT (từ /api/rooms/all)
─────────────────────────────────

API Response:
```json
{
  "id": 1,
  "landlordUserId": 1,
  "areaTypeId": 1,
  "title": "Phòng A101",
  "description": "Phòng đẹp, thoáng mát",
  "address": "123 Đường ABC",
  "latitude": 21.0285,
  "longitude": 105.8542,
  "priceVnd": 3000000,
  "areaSqm": 25.5,
  "roomType": "SINGLE",
  "status": "AVAILABLE",
  "avgAmenity": 4.5,
  "avgSecurity": 4.2,
  "roomCoverImageId": 1,
  "roomCoverImageUrl": "https://..."
}
```

FE Old → New mapping:
- name → title ✓
- price → priceVnd ✓
- area → areaSqm ✓
- distance → KHÔNG CÓ (cần tính từ lat/lng)
- status: 'available' → 'AVAILABLE' ✓

📋 B. CREATE/UPDATE ROOM REQUEST
─────────────────────────────────

```json
{
  "surveyAnswers": [
    { "surveyQuestionId": 1, "point": 4 }
  ],
  "roomNotCoverImageIds": [1,2],
  "roomCoverImageId": 3,
  
  "landlordUserId": 1,
  "title": "Phòng A101",
  "description": "...",
  "address": "...",
  "latitude": 21.0285,
  "longitude": 105.8542,
  "priceVnd": 3000000,
  "areaSqm": 25.5,
  "roomType": "SINGLE",
  "status": "AVAILABLE",
  "areaTypeId": 1
}
```

📋 C. AREA TYPE
───────────────

```json
{
  "id": 1,
  "name": "Gần trường"
}
```

📋 D. SURVEY QUESTION
─────────────────────

```json
{
  "id": 1,
  "surveyId": 1,
  "questionText": "Phòng có điều hòa không?",
  "questionOrder": 1
}
```

═══════════════════════════════════════════
IV. CHECKLIST TÍCH HỢP
═══════════════════════════════════════════

BACKEND READY:
✅ /auth/login
✅ /api/rooms/all
✅ /api/rooms/detail
✅ /api/rooms/create
✅ /api/rooms/update
✅ /api/rooms/delete
✅ /area-types/all
✅ /survey/all
✅ /survey-question/all
✅ /survey-question/create
✅ /survey-question/update
✅ /survey-question/delete
✅ /file/upload

BACKEND TODO (cần BE implement):
⏳ /api/rooms/search
⏳ /api/rooms/featured
⏳ /api/rooms/detail

FRONTEND DONE:
✅ API functions trong api.js
✅ LoginPage với API
✅ RoomManagementPage với API (list, delete, create)
✅ Constants.js
✅ Axios interceptor đã sẵn sàng

FRONTEND TODO:
⏳ RoomDetailManagement update với API
⏳ HomePage với getFeaturedRoomsApi
⏳ SearchResultPage với searchRoomsApi
⏳ RoomDetailPage với publicRoomDetailApi
⏳ SurveyFormPage submit
⏳ ImageUpload component
⏳ Survey Questions Management page

═══════════════════════════════════════════
V. TESTING GUIDE
═══════════════════════════════════════════

1. START BACKEND
   - Đảm bảo backend chạy ở http://localhost:8080
   - Database đã seed data mẫu

2. START FRONTEND
   ```bash
   npm run dev
   ```

3. TEST LOGIN
   - Vào /management/login
   - Nhập username/password từ database
   - Check console network tab → POST /auth/login
   - Verify localStorage có isAdminLoggedIn

4. TEST ROOM MANAGEMENT
   - Vào /management/rooms
   - Check console → POST /api/rooms/all
   - Verify table hiển thị data từ API
   - Test pagination
   - Test delete (check confirm modal)
   - Test add room (fill form → submit)

5. TEST AREA TYPES
   - Mở modal "Thêm phòng"
   - Check dropdown "Khu vực" có data
   - Console → GET /area-types/all

═══════════════════════════════════════════
VI. COMMON ISSUES & SOLUTIONS
═══════════════════════════════════════════

❌ CORS Error
─────────────
Backend cần enable CORS cho http://localhost:5173

❌ 401 Unauthorized
────────────────────
- Check localStorage có isAdminLoggedIn
- Nếu dùng JWT: check axios interceptor gửi token

❌ Response code !== "00"
──────────────────────────
- Log response.message để debug
- Check backend validation errors

❌ Fields undefined
───────────────────
- Đảm bảo map đúng tên field (title vs name, priceVnd vs price)
- Check null safety (price?.toLocaleString())

❌ Pagination không hoạt động
──────────────────────────────
- Check pageNumber 0-based
- Verify total từ API response
- Console log pagination state

═══════════════════════════════════════════
VII. NEXT STEPS
═══════════════════════════════════════════

PRIORITY 1 (Critical):
1. Hoàn thiện RoomDetailManagement với updateRoomApi
2. Implement ImageUpload component
3. Tích hợp survey questions vào create/update room

PRIORITY 2 (High):
4. Update HomePage với getFeaturedRoomsApi (khi BE ready)
5. Update SearchResultPage với searchRoomsApi (khi BE ready)
6. Update RoomDetailPage với publicRoomDetailApi (khi BE ready)

PRIORITY 3 (Medium):
7. Survey Questions Management page
8. SurveyFormPage submit với API
9. Error handling toàn diện
10. Loading states cho tất cả API calls

PRIORITY 4 (Nice to have):
11. Optimistic UI updates
12. Caching với React Query
13. Debounce cho search/filter
14. Image lazy loading

═══════════════════════════════════════════
END OF BACKEND INTEGRATION GUIDE
═══════════════════════════════════════════
