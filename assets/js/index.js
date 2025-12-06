const create_btn = document.getElementById("create_btn");
const modal = document.getElementById("modal");
const close_modal = document.getElementById("close_modal");

// detect running environment: consider local when hostname is localhost or 127.0.0.1
const hostname = window.location.hostname;
const isLocal = hostname === '127.0.0.1' || hostname === 'localhost' || hostname === '::1';

if (create_btn) {
    if (!isLocal) {
        // hide create button on static deployed site (read-only)
        create_btn.style.display = 'none';
    } else {
        create_btn.addEventListener("click", () => {
            modal.style.display = "flex";
        });
    }
}

close_modal.addEventListener("click", () => {
    modal.style.display = "none";
});

const submit_btn = document.getElementById("submit_btn");

if (submit_btn && isLocal) {
    submit_btn.addEventListener("click", async () => {
    const data = {
        posted_date: document.getElementById("posted_date").value,
        name: document.getElementById("name").value,
        genre: document.getElementById("genre").value,
        url: document.getElementById("url").value,
        address: document.getElementById("address").value,
        nearest_station: document.getElementById("station").value,
        members: document.getElementById("members").value,
        video_title: document.getElementById("video_title").value,
        video_url: document.getElementById("video_url").value,
        order_detail: document.getElementById("order_details").value,
        episode_detail: document.getElementById("episode_details").value
    };

        try {
            const response = await fetch("http://127.0.0.1:5000/add_shop",{
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            alert(result.message);

            modal.style.display = "none";
        } catch (err) {
            console.error(err);
            alert("Failed to submit: " + (err.message || err));
        }
    });
}

// First try to load static JSON (deployed on GitHub Pages). If not found, fall back to local API.
const staticPath = '../assets/data/shops.json';
let shopsData = [];

function safeText(val){ return val === null || val === undefined ? '' : String(val); }

function populateGenreOptions(data){
    const sel = document.getElementById('genre_filter');
    if (!sel) return;
    const genres = new Set();
    data.forEach(s => { if (s.genre) genres.add(s.genre); });
    // clear existing except the first 'すべて'
    while (sel.options.length > 1) sel.remove(1);
    Array.from(genres).sort().forEach(g => {
        const opt = document.createElement('option');
        opt.value = g;
        opt.textContent = g;
        sel.appendChild(opt);
    });
}

function renderList(){
    const list = document.getElementById('shop_list');
    if (!list) return;
    // read filters
    const genreVal = document.getElementById('genre_filter') ? document.getElementById('genre_filter').value.trim() : '';
    const memberVal = document.getElementById('member_filter') ? document.getElementById('member_filter').value.trim().toLowerCase() : '';
    const sortOrder = document.getElementById('sort_order') ? document.getElementById('sort_order').value : 'desc';

    // filter
    let filtered = shopsData.filter(s => {
        const genreOk = !genreVal || (safeText(s.genre).toLowerCase().indexOf(genreVal.toLowerCase()) !== -1);
        const memberOk = !memberVal || (safeText(s.members).toLowerCase().indexOf(memberVal) !== -1);
        return genreOk && memberOk;
    });

    // sort by posted_date
    filtered.sort((a,b) => {
        const da = a.posted_date ? new Date(a.posted_date) : new Date(0);
        const db = b.posted_date ? new Date(b.posted_date) : new Date(0);
        if (isNaN(da)) da = new Date(0);
        if (isNaN(db)) db = new Date(0);
        if (sortOrder === 'asc') return da - db;
        return db - da;
    });

    // render
    list.innerHTML = '';
    filtered.forEach(shop => {
        const item = document.createElement('div');
        item.className = 'shop-item';
        item.onclick = () => {
            if (!isLocal) {
                window.location.href = `../views/detail.html?id=${shop.id}`;
            } else {
                window.location.href = `/shop/${shop.id}`;
            }
        };
        item.innerHTML = `
            <div class="shop-name">${safeText(shop.name)}</div>
            <div class="shop-meta">投稿日: ${safeText(shop.posted_date)} ・ ${safeText(shop.genre)}</div>
            <div class="shop-info">${safeText(shop.nearest_station)} | ${safeText(shop.members)}</div>`;
        list.appendChild(item);
    });
}

function attachFilterHandlers(){
    const g = document.getElementById('genre_filter');
    const m = document.getElementById('member_filter');
    const s = document.getElementById('sort_order');
    const reset = document.getElementById('reset_filters');
    if (g) g.addEventListener('change', renderList);
    if (m) m.addEventListener('input', renderList);
    if (s) s.addEventListener('change', renderList);
    if (reset) reset.addEventListener('click', () => {
        if (g) g.value = '';
        if (m) m.value = '';
        if (s) s.value = 'desc';
        renderList();
    });
}

fetch(staticPath)
    .then(response => { if (!response.ok) throw new Error('no static'); return response.json(); })
    .catch(() => fetch('http://127.0.0.1:5000/get_shops').then(r => r.json()))
    .then(data => {
        shopsData = Array.isArray(data) ? data : [];
        populateGenreOptions(shopsData);
        attachFilterHandlers();
        renderList();
    })
    .catch(err => {
        console.error('Failed to load shops data', err);
    });
