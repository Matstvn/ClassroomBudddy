import openpyxl
from datetime import datetime, date
from app.schemas.student import StudentCreate
from app.models.student import Gender

def parse_sf1(file_path: str) -> list[StudentCreate]:
    wb = openpyxl.load_workbook(file_path, data_only=True)
    ws = wb.active

    students = []
    print("=== SF1 Parser: reading rows 3+ ===")

    for row in ws.iter_rows(min_row=3, values_only=True):
        # Skip completely empty rows
        if all(cell is None for cell in row):
            continue

        def cell(idx, default=None):
            if idx < len(row) and row[idx] is not None:
                return str(row[idx]).strip()
            return default

        # LRN
        lrn_val = row[0] if len(row) > 0 else None
        if lrn_val is not None:
            if isinstance(lrn_val, (int, float)):
                lrn = str(int(lrn_val))
            else:
                lrn = str(lrn_val).strip()
        else:
            lrn = None

        # Name cell (index 2): "ANAMPA,MIKO, JR SILATAN"
        name_cell = cell(2, '')
        if not name_cell:
            continue

        # Split name by commas. Expected: Last,First,Middle/Extension
        parts = [p.strip() for p in name_cell.split(',')]
        last_name = parts[0] if len(parts) > 0 else ''
        first_name = parts[1] if len(parts) > 1 else ''
        # Middle name / Extension: join remaining parts (could be "JR SILATAN" or empty)
        middle_name = ' '.join(parts[2:]) if len(parts) > 2 else None
        extension = None  # We'll handle extension separately if needed

        # Clean middle name: sometimes it's just "JR" or "III", could be extension
        if middle_name and middle_name.upper() in ('JR', 'JR.', 'III', 'II', 'IV', 'SR', 'SR.'):
            extension = middle_name
            middle_name = None

        if not last_name or not first_name:
            continue  # skip invalid rows

        # Gender
        gender_str = cell(6, '').upper()
        gender = Gender.MALE if gender_str == 'M' else Gender.FEMALE

        # Birth date (index 7): format mm-dd-yyyy
        birth_date = date(2000, 1, 1)  # default
        raw_date = cell(7)
        if raw_date:
            # Try mm-dd-yyyy first
            try:
                birth_date = datetime.strptime(raw_date, "%m-%d-%Y").date()
            except ValueError:
                # Fallback to other formats
                for fmt in ("%Y-%m-%d", "%m/%d/%Y", "%d/%m/%Y"):
                    try:
                        birth_date = datetime.strptime(raw_date, fmt).date()
                        break
                    except ValueError:
                        pass

        # Age (index 9) – may have trailing spaces
        age = 0
        age_str = cell(9)
        if age_str:
            try:
                age = int(float(age_str))
            except:
                pass

        # Mother Tongue (index 10)
        mother_tongue = cell(10) or None

        # IP (index 13) – treat non‑empty as yes
        ip_raw = cell(13)
        ip = bool(ip_raw)  # any non-empty string means yes

        # Religion (index 14)
        religion = cell(14) or None

        # Address: combine street (15), barangay (17), municipality (20), province (22)
        street = cell(15, '')
        barangay = cell(17, '')
        municipality = cell(20, '')
        province = cell(22, '')

        address_parts = []
        if street: address_parts.append(street)
        if barangay: address_parts.append(barangay)
        if municipality: address_parts.append(municipality)
        if province: address_parts.append(province)
        address = ', '.join(address_parts) if address_parts else None

        # Father (27)
        father = cell(27)
        if father:
            # remove trailing comma
            father = father.rstrip(',').strip()
        # Mother (30)
        mother = cell(30)
        if mother:
            mother = mother.rstrip(',').strip()
        # Guardian (33)
        guardian = cell(33) or None
        # Guardian contact (37)
        guardian_contact = cell(37) or None

        student = StudentCreate(
            lrn=lrn,
            first_name=first_name,
            last_name=last_name,
            middle_name=middle_name,
            extension=extension,
            gender=gender,
            birth_date=birth_date,
            age=age,
            mother_tongue=mother_tongue,
            ip=ip,
            religion=religion,
            address=address,
            father_name=father if father else None,
            mother_name=mother if mother else None,
            guardian_name=guardian,
            guardian_contact=guardian_contact,
        )
        students.append(student)

    print(f"Parsed {len(students)} valid student records.")
    return students