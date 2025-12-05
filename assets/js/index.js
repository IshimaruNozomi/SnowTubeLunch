const create_btn = document.getElementById("create_btn");
const modal = document.getElementById("modal");
const close_modal = document.getElementById("close_modal");

create_btn.addEventListener("click", () => {
    modal.style.display = "flex";
});

close_modal.addEventListener("click", () => {
    modal.style.display = "none";
});

const submit_btn = document.getElementById("submit_btn");

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

fetch('http://127.0.0.1:5000/get_shops')
    .then(response => response.json())
    .then(data => {
        const list = document.getElementById("shop_list");

        data.forEach(shop => {
            const item = document.createElement("div");
            item.className = "shop-item";

            item.onclick = () => {
                window.location.href = `/shop/${shop.id}`;
            };

            item.innerHTML =`
                <div class="shop-name">${shop.name}</div>
                <div class="shop-info">　${shop.genre}　　|　　${shop.nearest_station}　　|　　${shop.members}</div>`;  
            list.appendChild(item);
        });
    });
