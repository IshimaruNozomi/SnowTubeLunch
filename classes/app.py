from flask import Flask, request, jsonify, send_from_directory, render_template, redirect
import sqlite3

app = Flask(__name__, template_folder='../views', static_folder='../assets', static_url_path='/assets')

@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET,POST,OPTIONS'
    return response

def get_connection():
    conn = sqlite3.connect('lunch_video.db')
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/assets/<path:filename>')
def assets(filename):
    return send_from_directory('../assets', filename)

@app.route('/image/<path:filename>')
def images(filename):
    return send_from_directory('../image', filename)

@app.route('/add_shop', methods=['POST'])
def add_shop():
    data = request.json

    conn = get_connection()
    cur = conn.cursor()

    cur.execute('''
    INSERT INTO shops (
        posted_date,
        name,
        genre,
        url,
        address,
        nearest_station,
        members,
        video_title,
        video_url,
        order_detail,
        episode_detail
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        data['posted_date'],
        data['name'],
        data['genre'],
        data['url'],
        data['address'],
        data['nearest_station'],
        data['members'],
        data['video_title'],
        data['video_url'],
        data['order_detail'],
        data['episode_detail']
    ))

    conn.commit()
    conn.close()

    return jsonify({"message": "動画情報を登録しました"})

@app.route('/get_shops', methods=['GET'])
def get_shops():
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT
            shop_id AS id,
            posted_date,
            name,
            genre,
            url,
            address,
            nearest_station,
            members,
            video_title,
            video_url,
            order_detail,
            episode_detail
        FROM shops
        ORDER BY id DESC;
    """)

    rows = cur.fetchall()
    conn.close()

    shops = []
    for row in rows:
        shops.append({
            "id": row['id'],
            "posted_date": row['posted_date'],
            "name": row['name'],
            "genre": row['genre'],
            "url": row['url'],
            "address": row['address'],
            "nearest_station": row['nearest_station'],
            "members": row['members'],
            "video_title": row['video_title'],
            "video_url": row['video_url'],
            "order_detail": row['order_detail'],
            "episode_detail": row['episode_detail']
        })

    return jsonify(shops)

@app.route('/shop/<int:shop_id>')
def shop_detail(shop_id):
    conn = sqlite3.connect('lunch_video.db')
    cur = conn.cursor()

    cur.execute("""
        SELECT
            shop_id AS id,
            posted_date,
            name,
            genre,
            url,
            address,
            nearest_station,
            members,
            video_title,
            video_url,
            order_detail,
            episode_detail
        FROM shops
        WHERE shop_id = ?;
    """, (shop_id,))

    row = cur.fetchone()
    conn.close()

    if row is None:
        return "Shop not found", 404
    
    shop = {
        "id": row[0],
        "posted_date": row[1],
        "name": row[2],
        "genre": row[3],
        "url": row[4],
        "address": row[5],
        "nearest_station": row[6],
        "members": row[7],
        "video_title": row[8],
        "video_url": row[9],
        "order_detail": row[10],
        "episode_detail": row[11]
    }

    # render the existing detail template (views/detail.html)
    return render_template('detail.html', shop=shop)

@app.route('/update_shop/<int:shop_id>', methods=['POST'])
def update_shop(shop_id):
    conn = sqlite3.connect('lunch_video.db')
    cur = conn.cursor()

    name = request.form['name']
    date = request.form['posted_date']
    genre = request.form['genre']
    url = request.form['url']
    address = request.form['address']
    station = request.form['nearest_station']
    members = request.form['members']
    video_title = request.form['video_title']
    video_url = request.form['video_url']
    order_detail = request.form['order_detail']
    episode_detail = request.form['episode_detail']

    cur.execute("""
        UPDATE shops
        SET
            name = ?,
            posted_date = ?,
            genre = ?,
            url = ?,
            address = ?,
            nearest_station = ?,
            members = ?,
            video_title = ?,
            video_url = ?,
            order_detail = ?,
            episode_detail = ?
        WHERE shop_id = ?;
    """, (
        name,
        date,
        genre,
        url,
        address,
        station,
        members,
        video_title,
        video_url,
        order_detail,
        episode_detail,
        shop_id
    ))

    conn.commit()
    conn.close()
    return redirect(f'/shop/{shop_id}')

if __name__ == '__main__':
    # 開発用サーバを起動（ポート5000）
    app.run(host='127.0.0.1', port=5000, debug=True)