import sqlite3
import json
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'lunch_video.db')
OUT_PATH = os.path.join(os.path.dirname(__file__), '..', 'assets', 'data', 'shops.json')

os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)

conn = sqlite3.connect(DB_PATH)
conn.row_factory = sqlite3.Row
cur = conn.cursor()

cur.execute('''SELECT shop_id as id, posted_date, name, genre, nearest_station, address, url, members, video_title, video_url, order_detail, episode_detail FROM shops ORDER BY shop_id DESC''')
rows = cur.fetchall()

shops = []
for r in rows:
    shops.append({
        'id': r['id'],
        'posted_date': r['posted_date'],
        'name': r['name'],
        'genre': r['genre'],
        'nearest_station': r['nearest_station'],
        'address': r['address'],
        'url': r['url'],
        'members': r['members'],
        'video_title': r['video_title'],
        'video_url': r['video_url'],
        'order_detail': r['order_detail'],
        'episode_detail': r['episode_detail']
    })

with open(OUT_PATH, 'w', encoding='utf-8') as f:
    json.dump(shops, f, ensure_ascii=False, indent=2)

print(f"Wrote {len(shops)} shops to {OUT_PATH}")
