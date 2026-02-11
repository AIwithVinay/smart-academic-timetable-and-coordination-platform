import csv
import io
import chardet

def debug_csv():
    file_path = r"C:\Users\vinay\Downloads\erp_users_sections_A_to_K.csv"
    print(f"Reading {file_path}")
    
    with open(file_path, 'rb') as f:
        content = f.read()

    # Detect encoding
    result = chardet.detect(content)
    encoding = result['encoding'] or 'utf-8'
    print(f"Detected encoding: {encoding}")
    
    try:
        text_content = content.decode(encoding)
    except UnicodeDecodeError:
        print("UnicodeDecodeError, trying utf-8 ignore")
        text_content = content.decode('utf-8', errors='ignore')

    stream = io.StringIO(text_content)
    reader = csv.DictReader(stream)
    
    # Normalize headers
    if reader.fieldnames:
        original_headers = list(reader.fieldnames)
        reader.fieldnames = [name.strip().replace('\ufeff', '') for name in reader.fieldnames]
        print(f"Headers: {reader.fieldnames}")
        print(f"Original Headers: {original_headers}")

    count = 0
    for row in reader:
        email = row.get("Email") or row.get("email")
        marks = row.get("Marks") or row.get("marks")
        grade_letter = row.get("Grade") or row.get("grade")
        comments = row.get("Comments") or row.get("comments")
        
        print(f"Row {count+1}: Email='{email}', Marks='{marks}', Grade='{grade_letter}', Comments='{comments}'")
        
        if count >= 5:
            break
        count += 1

if __name__ == "__main__":
    debug_csv()
