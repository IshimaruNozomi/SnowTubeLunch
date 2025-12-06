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
fetch(staticPath)
    .then(response => {
        if (!response.ok) throw new Error('no static');
        return response.json();
    })
    .catch(() => {
        // fallback to dynamic API (local dev)
        return fetch('http://127.0.0.1:5000/get_shops').then(r => r.json());
    })
    .then(data => {
        const list = document.getElementById("shop_list");

        data.forEach(shop => {
            const item = document.createElement("div");
            item.className = "shop-item";

            item.onclick = () => {
                // prefer static detail page if present under views, otherwise link to API path
                const detailPath = `../views/detail.html`;
                // If using static JSON, we can't generate dynamic detail pages; link to views/detail.html with query param
                if (!isLocal) {
                    // open static detail page and pass id as query param so JS on detail page (if implemented) can read it
                    window.location.href = `../views/detail.html?id=${shop.id}`;
                } else {
                    window.location.href = `/shop/${shop.id}`;
                }
            };

            item.innerHTML =`
                <div class="shop-name">${shop.name}</div>
                <div class="shop-meta">投稿日: ${shop.posted_date} ・ ${shop.genre}</div>
                <div class="shop-info">${shop.nearest_station} | ${shop.members}</div>
                <div class="shop-video">${shop.video_title ? '▶ ' + shop.video_title : ''}</div>`;  
            list.appendChild(item);
        });
    });
