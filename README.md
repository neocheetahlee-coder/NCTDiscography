# NCT Discography & Sub-unit Explorer

> **วิชา:** 801201 การออกแบบอัลกอริทึมและการพัฒนาเว็บ (Algorithm Design and Web Development)  
> **ใบงาน:** ต่อยอดงาน API ด้วย React-Vite + Express  
> **Repository:** [neocheetahlee-coder/NCTDiscography](https://github.com/neocheetahlee-coder/NCTDiscography)  
> **ลิงก์คลิปนำเสนอ:** `[ใส่ลิงก์คลิป YouTube ที่นี่]`

---

## 7.1 ตารางส่วนร่วม (Contribution Table)

| กัญญ์กณิษฐ์ เชื้อฉลาด | 681310001 | รับผิดชอบ ไฟล์ / Component / Route / DSA | ช่วงที่นำเสนอในคลิป ตั้งแต่ต้น-จบ
---
## 7.2 ตารางข้อแนะนำจากงานแรก → สิ่งที่แก้ (Before → After)
| ข้อแนะนำ / ปัญหาจากงานแรก | สิ่งที่แก้ในงานนี้ | หลักฐาน Before → After |

| **1. ขาดฟังก์ชันเฉพาะสำหรับสมาชิก (Members)**<br>งานเดิมโฟกัสเฉพาะผลงานเพลงรวม ขาดการดูประวัติสมาชิก รายละเอียดยูนิต และผลงานเดี่ยว | เพิ่มหน้า **Members** แยกต่างหาก พร้อมระบบคัดกรองตาม Sub-unit (127, DREAM, WISH, WayV), เรียงลำดับอายุ, ช่องทางติดตาม Instagram และดึงข้อมูล Solo Albums จาก Apple Music API | **Before:** มีเฉพาะหน้ารวมเพลง ไม่สามารถดูข้อมูลสมาชิกรายบุคคลได้<br>**After:** หน้า `MembersView` + `MemberModal` แสดงรูปภาพ สัญชาติ อายุ ไอจี และปุ่มฟัง Solo Album |

| **2. การค้นหาและจัดอันดับทำงานช้าเมื่อข้อมูลมีจำนวนมาก**<br>เดิมใช้การวนลูป Linear Search $O(N)$ ในการค้นหา และ Sort Array ทั้งก้อนทุกครั้ง | นำ **DSA เชิงลึก** มาปรับปรุงประสิทธิภาพทั้งฝั่ง Backend และ Frontend: ใช้ **Hash Table (Inverted Index)** ในการค้นหาเพลง และใช้ **Min-Heap** คัดเลือก Top 3 เพลงล่าสุด | **Before:** ทำ Linear Filter ใน Frontend ทุกการกดค้นหา ทำให้กระตุกเมื่อข้อมูลเยอะ<br>**After:** สร้าง `SearchHashTable` ค้นหาได้เร็วเฉลี่ย $O(1)$ และคัด Top 3 ด้วย `MinHeap` ใช้เวลา $O(N \log 3) \approx O(N)$ |

| **4. ขาด Feedback สถานะการโหลดและกรณีเกิดข้อผิดพลาด (UX States)**<br>ไม่มีสถานะแจ้งผู้ใช้เมื่อระบบกำลังดึงข้อมูล หรือเมื่อค้นหาไม่พบข้อมูล | เพิ่มสถานะ **Loading, Empty, Error และ Success** ครบถ้วนทุกหน้าจอ ทั้ง Discography, Members, Highlights และ Modal | **Before:** หน้าจอค้างว่างเปล่า หรือเกิด Error เงียบโดยไม่แจ้งผู้ใช้<br>**After:** แสดง Skeleton / Loading text, ข้อความ Error alert ที่ชัดเจน และข้อความ "No tracks/members found" |

| **5. การนำทางและการสลับหน้าเว็บ**<br>เดิมใช้การซ่อน/แสดง DOM แบบ Manual ทำให้ Flow การใช้งานซับซ้อน | ใช้ **Graph Data Structure + BFS** ในการจัดการเส้นทางและตรวจสอบ Route ระหว่างหน้าเว็บอย่างเป็นระบบ | **Before:** เขียนสคริปต์ toggle class แสดง/ซ่อนแบบ manual<br>**After:** คลาส `NavigationGraph` ตรวจสอบและค้นหา Path ก่อนเปลี่ยนหน้า |

---

## เบื้องหลังระบบและสถาปัตยกรรม (System Architecture)

### 1. แผนภาพการเชื่อมต่อ (Data Flow Diagram)
```
[User Browser]
       ↕ (HTTP / JSON)
[React 18 + Vite Frontend] (Port 5173)
       ↕ (Proxy / API Request)
[Express Backend Server] (Port 3000)
       ↕ (Fetch & Aggregate Data)
[Apple Music / iTunes Search API] (TH & JP Stores)
```

### 2. โครงสร้าง Component Tree (Frontend)
```
App
├── Header
│   ├── SearchInput (Debounced 300ms)
│   ├── SortSelect (Date / Name)
│   └── ThemeToggle (Dark / Light Mode)
├── Marquee (Neo Culture Technology ticker)
├── MainNav (Discography ↔ Members นำทางผ่าน NavigationGraph)
├── HighlightsSection (NCT Highlights)
│   └── DraggableGallery (Custom Hook useDraggable สำหรับเลื่อนดูวิดีโอ)
├── [View: Discography]
│   ├── UnitTabs (ALL, NCT 127, NCT DREAM, NCT U, NCT WISH, WayV)
│   ├── Top 3 Most Streamed (SongGrid isTop3)
│   │   └── SongCard (Rank Badges #1, #2, #3)
│   ├── Discography Catalog (SongGrid)
│   │   └── SongCard
│   └── SongModal (รายละเอียดเพลง + Audio Preview Player)
├── [View: Members]
│   └── MembersView
│       ├── MemberControls (Filter Unit, Sort Age / A-Z / Solo)
│       ├── MembersGrid
│       │   └── MemberCard (ภาพสมาชิก, ธงสัญชาติ, อายุ, ยูนิต)
│       └── MemberModal (Instagram link + รายการ Solo Albums บน Apple Music)
├── Footer
└── BackToTop (Smooth Scroll Button เมื่อเลื่อนเกิน 300px)
```

### 3. หน้าที่ของ Express Backend 
1. **Data Aggregation & Deduplication:** ดึงข้อมูลจาก iTunes API หลาย Endpoint (NCT 127, NCT DREAM, NCT U, NCT WISH สโตร์ไทยและญี่ปุ่น, WayV) และรวมผลลัพธ์พร้อมตัดเพลงที่ซ้ำกันออกด้วย Map

2. **Inverted Index Construction:** สร้าง Hash Table จากคำในชื่อเพลง, อัลบั้ม และศิลปินตอนเริ่มต้น เพื่อให้การค้นหาทำได้ทันที

3. **Validation & Sanitization:** ตรวจสอบ Parameter `unit`, `sort`, `search` และตรวจสอบ `memberId` ในการค้นหาอัลบั้มเดี่ยว

4. **Data Enrichment (Solo Albums Lookup):** เชื่อมโยงข้อมูลสมาชิกจาก `members.json` กับ Apple Music Lookup API เพื่อดึงลิงก์อัลบั้มเดี่ยวของสมาชิกแต่ละคนแบบ Dynamic

---

## ⚡ การประยุกต์ใช้โครงสร้างข้อมูลและอัลกอริทึม (DSA เชิงลึก)

### 1. `SearchHashTable` (Inverted Index) — ฝั่ง Express Backend
- **ตำแหน่ง:** `backend/server.js` (คลาส `SearchHashTable`)
- **การทำงาน:** แตกคำ (Tokens) จาก `trackName`, `collectionName`, และ `artistName` ทั้งหมดลงใน Hash Table ที่มีคำศัพท์เป็น Key และรายการเพลงเป็น Value
- **ความซับซ้อนเชิงเวลา (Time Complexity):**
  - **สร้างดัชนี (Build Index):** $O(M)$ โดย $M$ คือจำนวนคำทั้งหมด
  - **การค้นหา (Exact Match):** เฉลี่ย $O(1)$
  - **การค้นหาบางส่วน (Substring Match):** $O(W)$ โดย $W$ คือจำนวนคำที่ไม่ซ้ำในตาราง
- **เหตุผลที่เลือกใช้:** ดีกว่าการใช้ Array `filter()` ที่ต้องวนลูปทุกตัวแบบ $O(N)$ ทุกครั้งที่มี Request ค้นหาเข้ามา

### 2. `MinHeap` (Top-K Selection) — ฝั่ง Express Backend
- **ตำแหน่ง:** `backend/server.js` (ฟังก์ชัน `getTopThreeNewestSongs`)
- **การทำงาน:** ใช้ Min-Heap ขนาด $K = 3$ ในการวนอ่านเพลงทั้งหมด หากเจอเพลงที่ใหม่กว่ารากของ Heap จะทำการ `pop()` ตัวที่เก่าที่สุดออก แล้ว `push()` ตัวใหม่เข้าไป
- **ความซับซ้อนเชิงเวลา (Time Complexity):** $O(N \log K) = O(N \log 3) \approx O(N)$
- **ความซับซ้อนเชิงพื้นที่ (Space Complexity):** $O(K) = O(1)$
- **เหตุผลที่เลือกใช้:** หากใช้วิธีเรียงข้อมูลทั้ง Array จะใช้เวลา $O(N \log N)$ และเปลือง Memory การใช้ Min-Heap ทำให้ประหยัดทั้งเวลาและพื้นที่หน่วยความจำอย่างมาก

### 3. `HeapSort` (`customSort`) — ฝั่ง Express Backend
- **ตำแหน่ง:** `backend/server.js` (ฟังก์ชัน `customSort`)
- **การทำงาน:** สร้าง Max-Heap จากรายการเพลง และทำ Heapify Sift-Down เพื่อจัดเรียงลำดับตามวันที่ หรือตัวอักษร A-Z / Z-A
- **ความซับซ้อนเชิงเวลา (Time Complexity):** $O(N \log N)$ ในทุกกรณี (Best, Average, Worst)

### 4. `NavigationGraph` (Graph & BFS) — ฝั่ง React Frontend
- **ตำแหน่ง:** `frontend/src/navigation/navigationGraph.js`
- **การทำงาน:** จำลองโครงสร้างหน้าเว็บเป็น Directed Graph โดยใช้ Adjacency List และใช้ Breadth-First Search (BFS) ในการค้นหาเส้นทางสั้นที่สุด (`findPath`) ระหว่างหน้าก่อนอนุญาตให้สลับ View
- **ความซับซ้อนเชิงเวลา (Time Complexity):** $O(V + E)$ โดย $V$ คือจำนวนหน้า และ $E$ คือเส้นทางเชื่อมโยง
- **เหตุผลที่เลือกใช้:** รองรับการขยายหน้าเว็บในอนาคต (Scalability) และป้องกันการเกิด Broken Routing หรือเข้าสู่หน้าที่ไม่มีสิทธิ์เข้าถึง

---

## วิธีการติดตั้งและรันโปรเจกต์ (Local Development)

### 1. ติดตั้ง Dependencies
```bash
# ติดตั้ง backend dependencies
cd backend
npm install

# ติดตั้ง frontend dependencies
cd ../frontend
npm install
```

### 2. รันระบบ (Run Development Mode)
เปิด 2 Terminal เพื่อรัน Backend และ Frontend พร้อมกัน:

**Terminal 1 (Backend):**
```bash
cd backend
node server.js
# Backend รันอยู่ที่ http://localhost:3000
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
# Frontend รันอยู่ที่ http://localhost:5173
```
(เมื่อเปิดเว็บที่ `http://localhost:5173` ระบบจะทำการ Proxy request `/api/*` ไปยัง Express ที่พอร์ต 3000 โดยอัตโนมัติ)
