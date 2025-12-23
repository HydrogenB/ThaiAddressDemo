# 🇹🇭 Thai Address Auto-fill Demo

สาธิตการกรอกที่อยู่แบบ Best Practice UX - กรอกรหัสไปรษณีย์และระบบจะเติมจังหวัด, อำเภอ, ตำบล อัตโนมัติ

**🚀 Live Demo:** [https://hydrogenb.github.io/ThaiAddressDemo/](https://hydrogenb.github.io/ThaiAddressDemo/)

---

## ✨ Features

| Feature                   | Description                                             |
| ------------------------- | ------------------------------------------------------- |
| **Zip Code Auto-fill**    | พิมพ์รหัสไปรษณีย์ → ระบบแนะนำและเติมที่อยู่อัตโนมัติ    |
| **Cascading Dropdowns**   | จังหวัด → อำเภอ → ตำบล เชื่อมโยงกัน                     |
| **Manual Edit Support**   | แก้ไขจังหวัด/อำเภอ/ตำบลด้วยตัวเองได้                    |
| **Zip Format Validation** | ตรวจสอบรูปแบบรหัสไปรษณีย์ (5 หลัก, ขึ้นต้นด้วย 1-9)     |
| **Debug Panel**           | แสดง Variable Watch, Pseudo Code Flow, และ Runtime Logs |
| **TH/EN Language**        | สลับภาษาไทย/อังกฤษได้                                   |

---

## 🛠️ Debug Panel (Developer Mode)

Panel ด้านขวาสำหรับ Developers แสดง:

- **🔍 Variable Watch** - ติดตามค่าตัวแปร (`isManualMode`, `currentLang`, `selectedZipData`)
- **📜 Logic Flow (Pseudo Code)** - Algorithm ของการ Auto-fill แบบ Step-by-step
- **📝 Runtime Logs** - ดู Events แบบ Real-time
- **📤 Form Data State** - ดู JSON output ที่จะได้

---

## 🎯 How It Works

```
1. กรอกรหัสไปรษณีย์ → ระบบค้นหาและแสดง dropdown แนะนำ
2. เลือกรหัสไปรษณีย์ → Auto-fill จังหวัด, อำเภอ, ตำบล
3. แก้ไขได้ → ถ้าต้องการเปลี่ยน dropdown ก็ทำได้ (Manual Mode)
4. ส่งข้อมูล → แสดง Modal ยืนยันที่อยู่
```

---

## 📤 Output Format

| Form Field     | JSON Key       | Example   |
| -------------- | -------------- | --------- |
| บ้านเลขที่     | `houseNo`      | "123"     |
| ซอย/ชั้น/ห้อง  | `soi`          | ""        |
| หมู่           | `moo`          | ""        |
| หมู่บ้าน/อาคาร | `buildingName` | ""        |
| ถนน            | `streetName`   | "Silom"   |
| ตำบล           | `tumbon`       | "สีลม"    |
| อำเภอ          | `amphur`       | "บางรัก"  |
| จังหวัด        | `city`         | "Bangkok" |
| รหัสไปรษณีย์   | `zip`          | "10500"   |

```json
{
  "houseNo": "123",
  "soi": "",
  "moo": "",
  "buildingName": "",
  "streetName": "Silom",
  "tumbon": "สีลม",
  "amphur": "บางรัก",
  "city": "Bangkok",
  "zip": "10500"
}
```

---

## 📁 Project Structure

```
ThaiAddressDemo/
├── index.html        # Main HTML with form & debug panel
├── styles.css        # Modern CSS styling
├── app.js            # JavaScript auto-fill logic
├── geography.json    # Thailand geography data (~3MB)
└── README.md         # This file
```

---

## 📊 Data Credits

**ข้อมูลภูมิศาสตร์ประเทศไทย (Thailand Geography Data):**

> 📦 **[thailand-geography-data/thailand-geography-json](https://github.com/thailand-geography-data/thailand-geography-json)**
>
> ข้อมูลจังหวัด อำเภอ ตำบล และรหัสไปรษณีย์ของประเทศไทยในรูปแบบ JSON

ขอบคุณผู้จัดทำข้อมูลที่เปิดให้ใช้งานสาธารณะ 🙏

---

## 📝 Changelog

| Date       | Type   | Description                                         |
| ---------- | ------ | --------------------------------------------------- |
| 2025-12-23 | NEW    | Debug Panel with Variable Watch, Pseudo-code Flow   |
| 2025-12-23 | NEW    | Zip code format validation (5 digits, start 1-9)    |
| 2025-12-23 | UPDATE | Enable all address dropdowns by default             |
| 2025-12-23 | UPDATE | Update geography data DEC 2025                      |
| 2025-12-23 | NEW    | Thai Address Auto-fill from Zip Code (first commit) |

---

## 📝 License

MIT License - Feel free to use and modify.

---

Made with ❤️ for demonstrating Thai address form UX best practices.
