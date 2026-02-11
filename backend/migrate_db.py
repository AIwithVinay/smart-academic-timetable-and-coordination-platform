from sqlmodel import create_engine, text

# Adjust path if needed, assuming default sqlite.db in root or backend
sqlite_url = "sqlite:///database.db"
engine = create_engine(sqlite_url)

def migrate():
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE user ADD COLUMN parent_phone VARCHAR;"))
            print("Successfully added 'parent_phone' column.")
        except Exception as e:
            print(f"Migration failed (might already exist): {e}")

if __name__ == "__main__":
    migrate()
