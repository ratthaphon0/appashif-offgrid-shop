# AppAshif Classroom Demo

เอกสารนี้เป็นจุดเริ่มต้นสำหรับเพื่อนที่ต้องการศึกษาและทำตามโปรเจกต์ AppAshif
โดยไม่ใช้ฐานข้อมูลหรือบัญชีจริงของเจ้าของโปรเจกต์

## ตอนนี้กำลังเรียนอะไร

**หัวข้อปัจจุบัน: Cloud Database + Fetch API + Admin Product CRUD**

ลำดับที่ควรศึกษา:

1. React Native / Expo เรียกข้อมูลด้วย Fetch API
2. Express รับ request และตอบ JSON
3. MySQL เก็บ categories, products, product images และ admins
4. หน้า Products ค้นหา กรอง และเรียงข้อมูล
5. Admin login ด้วย JWT ก่อนแก้ไขข้อมูล
6. Add, Edit และ Delete Product
7. Category แบบเลือกจาก dropdown หรือพิมพ์ชื่อใหม่เพื่อสร้างอัตโนมัติ

Payment ยังไม่อยู่ในบทเรียนนี้

## โครงสร้างที่ควรรู้

```text
Expo frontend
  -> src/lib/api.ts
  -> Express /api/v1
  -> backend/src/routes
  -> backend/src/*-repository.js
  -> MySQL
```

ไฟล์สำคัญ:

- `src/lib/api.ts` — frontend API client
- `src/context/product-context.tsx` — state และ CRUD ของสินค้า/category
- `src/app/products.tsx` — list, search, filter, sort, edit และ delete
- `src/app/add.tsx` — add/edit form และ category combobox
- `backend/src/routes/products.js` — Product REST API
- `backend/src/product-repository.js` — SQL สำหรับ Product CRUD
- `backend/database/database.sql` — schema เปล่าสำหรับ import

## เริ่มต้นฐานข้อมูลเปล่า

ไฟล์ `backend/database/database.sql` มีเฉพาะโครงสร้างตาราง ไม่มีสินค้า ไม่มี category
และไม่มี admin สามารถ import ผ่าน phpMyAdmin ได้เลย

ชื่อฐานข้อมูลตัวอย่างคือ `appashif_demo` หากอาจารย์หรือ cloud กำหนดชื่ออื่น
ให้เปลี่ยน `DB_NAME` ใน `backend/.env` และแก้ชื่อใน SQL ให้ตรงกัน

หลัง import ตารางแล้วให้สร้าง admin ของตัวเอง:

```bash
cd backend
cp .env.example .env
npm ci
read -rsp 'Admin password: ' APPASHIF_ADMIN_PASSWORD
echo
ADMIN_PASSWORD="$APPASHIF_ADMIN_PASSWORD" npm run admin:create -- --email admin@example.com
unset APPASHIF_ADMIN_PASSWORD
node server.js
```

ตัวแปรรหัสผ่านจะอยู่เฉพาะใน shell ชั่วคราว ห้ามเขียนรหัสผ่านลง source code หรือ Git

## เชื่อม frontend

```bash
cp .env.example .env.local
npm ci
npm run web
```

ค่าเริ่มต้นใน `.env.example` คือ:

```dotenv
EXPO_PUBLIC_API_URL=http://localhost:3000/api/v1
EXPO_PUBLIC_DEPLOYMENT_LABEL=LOCAL CLASSROOM API
```

## แบบฝึกหัด Add / Edit Product

1. Login ที่หน้า Add
2. เลือก category จาก dropdown หรือพิมพ์ชื่อ category ใหม่
3. กรอกชื่อ คำอธิบาย ราคา stock badge และ URL รูป
4. กด Create Product แล้วตรวจข้อมูลในหน้า Products และ MySQL
5. กด Edit เปลี่ยนราคา stock หรือ category แล้วบันทึก
6. กด Delete ยืนยันการลบ และตรวจว่าสินค้าหายจากหน้าเว็บและฐานข้อมูล

## เผื่อบทเรียนสัปดาห์หน้า

โค้ด Add/Edit/Delete ถูกแยกเป็น API client, context, route และ repository แล้ว
จึงต่อยอดเรื่อง upload รูป, validation, role เพิ่มเติม, audit log หรือ pagination ได้โดยไม่ต้องรื้อระบบเดิม

## สิ่งที่ไม่ควรอัปขึ้น Git

- `.env` และ `.env.local`
- รหัสผ่าน MySQL/Admin/JWT
- `node_modules/`
- SQL export ที่มีข้อมูลจริง
- รูปหน้าจอหรือเอกสารที่มีข้อมูลบัญชี cloud
