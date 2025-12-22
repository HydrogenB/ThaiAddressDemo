# 🇹🇭 Thai Address Auto-fill Demo

สาธิตการกรอกที่อยู่แบบ Best Practice UX - กรอกรหัสไปรษณีย์และระบบจะเติมจังหวัด, อำเภอ, ตำบล อัตโนมัติ

## ✨ Features

- **Zip Code Auto-fill** - พิมพ์รหัสไปรษณีย์ → ระบบแนะนำและเติมที่อยู่อัตโนมัติ
- **Cascading Dropdowns** - จังหวัด → อำเภอ → ตำบล เชื่อมโยงกัน
- **Manual Edit Support** - แก้ไขจังหวัด/อำเภอ/ตำบลด้วยตัวเองได้
- **Learning Panel** - แสดง Pseudo Code และ Event Log สำหรับ Junior Developers

## 🚀 Demo

เปิดดูได้ที่: [GitHub Pages URL]

## 📁 Files

```
ThaiAddressDemo/
├── index.html        # Main HTML with form & learning panel
├── styles.css        # Modern CSS styling
├── app.js            # JavaScript auto-fill logic
├── geography.json    # Thailand geography data
├── provinces.json    # Province data
├── districts.json    # District data
├── subdistricts.json # Subdistrict data
└── README.md         # This file
```

## 🎯 How It Works

1. **กรอกรหัสไปรษณีย์** → ระบบค้นหาและแสดง dropdown แนะนำ
2. **เลือกรหัสไปรษณีย์** → Auto-fill จังหวัด, อำเภอ, ตำบล
3. **แก้ไขได้** → ถ้าต้องการเปลี่ยน dropdown ก็ทำได้ (Manual Mode)
4. **ส่งข้อมูล** → แสดง Modal ยืนยันที่อยู่

## 📤 Output Format

```json
{
  "houseNo": "123",
  "soi": "",
  "moo": "",
  "buildingName": "อาคารทรู ทาวเวอร์",
  "streetName": "รัชดาภิเษก",
  "tumbon": "ห้วยขวาง",
  "amphur": "ห้วยขวาง",
  "city": "กรุงเทพมหานคร",
  "zip": "10310"
}
```

## 🎓 Learning Panel

สำหรับ Junior Developers - มี Panel ด้านขวาแสดง:

- **Pseudo Code** - Algorithm ของการ Auto-fill
- **Current State** - สถานะปัจจุบัน (Mode, Selected Values)
- **Event Log** - ดู Events แบบ Real-time
- **Output Preview** - ดู JSON output ที่จะได้

## 📊 Data Credits

**ข้อมูลภูมิศาสตร์ประเทศไทย (Thailand Geography Data) ได้มาจาก:**

> 📦 **[thailand-geography-data/thailand-geography-json](https://github.com/thailand-geography-data/thailand-geography-json)**
>
> ข้อมูลจังหวัด อำเภอ ตำบล และรหัสไปรษณีย์ของประเทศไทยในรูปแบบ JSON

ขอบคุณผู้จัดทำข้อมูลที่เปิดให้ใช้งานสาธารณะ 🙏

## 🛠 Local Development

```bash
# วิธีที่ 1: Python
python -m http.server 8000
# เปิด http://localhost:8000

# วิธีที่ 2: Node.js
npx serve .

# วิธีที่ 3: VS Code
# ใช้ Live Server Extension
```

## 📝 License

MIT License - Feel free to use and modify.

---

Made with ❤️ for demonstrating Thai address form UX best practices.
