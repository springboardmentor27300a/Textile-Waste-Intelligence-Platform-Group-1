import sqlite3
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')

conn = sqlite3.connect('textile_waste.db')
cursor = conn.cursor()
cursor.execute("SELECT password_hash FROM users WHERE email = 'varshiniyerramsetti109@gmail.com'")
hash_val = cursor.fetchone()[0]
conn.close()

words = ['Admin082007!', 'admin', 'password', '123456', 'test', 'Admin082007', 'varshini', 'varshini123', 'admin123']
matches = [w for w in words if pwd_context.verify(w, hash_val)]
print(f"Matches for {hash_val}: {matches}")
