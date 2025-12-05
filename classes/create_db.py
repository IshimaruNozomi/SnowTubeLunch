import sqlite3

conn = sqlite3.connect('lunch_video.db')
cur = conn.cursor()

cur.execute("PRAGMA foreign_keys = ON;")

# ショップデータベース
cur.execute('''
CREATE TABLE IF NOT EXISTS shops (
    shop_id INTEGER PRIMARY KEY AUTOINCREMENT,
    posted_date TEXT NOT NULL,
    name TEXT NOT NULL,
    genre TEXT,
    url TEXT,
    address TEXT,
    nearest_station TEXT,
    members TEXT,
    video_title TEXT,
    video_url TEXT,
    order_detail TEXT,
    episode_detail TEXT
);
''')

# コメントデータベース
cur.execute('''
CREATE TABLE IF NOT EXISTS comments (
    comment_id INTEGER PRIMARY KEY AUTOINCREMENT,
    shop_id INTEGER NOT NULL,
    author TEXT,
    memo TEXT,
    FOREIGN KEY (shop_id) REFERENCES shops (shop_id)
);
''')

conn.commit()
conn.close()

print("データベース作成完了！")