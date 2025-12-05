const modal = document.getElementById("edit_modal");
const btn = document.querySelector(".edit_btn");
const close_btn = document.getElementById("close_modal");

if (btn && modal) {
    btn.addEventListener("click", () => {
        const dataset = btn.dataset || {};
        const setIf = (id, value) => {
            const el = document.getElementById(id);
            if (!el) return;
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.value = value ?? '';
            } else {
                el.textContent = value ?? '';
            }
        };

        setIf('edit_id', dataset.shopId);
        setIf('edit_shop_name', dataset.shopName);
        setIf('edit_posted_date', dataset.postedDate);
        setIf('edit_genre', dataset.genre);
        setIf('edit_nearest_station', dataset.nearestStation);
        setIf('edit_address', dataset.address);
        setIf('edit_url', dataset.url);
        setIf('edit_members', dataset.members);
        setIf('edit_video_title', dataset.videoTitle);
        setIf('edit_video_url', dataset.videoUrl);
        setIf('edit_order_detail', dataset.orderDetail);
        setIf('edit_episode_detail', dataset.episodeDetail);

        // show modal centered (flex)
        modal.style.display = "flex";
    });
}

if (close_btn && modal) {
    close_btn.addEventListener("click", () => {
        modal.style.display = "none";
    });
}

window.addEventListener("click", (event) => {
    if (event.target === modal) {
        modal.style.display = "none";
    }
});

// Save button handler: collect form values and POST to update endpoint
const saveBtn = document.getElementById('save_btn');
if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
        const idEl = document.getElementById('edit_id');
        const shopId = idEl ? idEl.value : null;
        if (!shopId) {
            alert('ショップIDが取得できませんでした');
            return;
        }

        const payload = new URLSearchParams();
        const fields = [
            ['name', 'edit_shop_name'],
            ['posted_date', 'edit_posted_date'],
            ['genre', 'edit_genre'],
            ['url', 'edit_url'],
            ['address', 'edit_address'],
            ['nearest_station', 'edit_nearest_station'],
            ['members', 'edit_members'],
            ['video_title', 'edit_video_title'],
            ['video_url', 'edit_video_url'],
            ['order_detail', 'edit_order_detail'],
            ['episode_detail', 'edit_episode_detail']
        ];

        for (const [name, elId] of fields) {
            const el = document.getElementById(elId);
            payload.append(name, el ? el.value : '');
        }

        try {
            const res = await fetch(`/update_shop/${encodeURIComponent(shopId)}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: payload.toString()
            });

            if (res.ok) {
                // Redirect to the shop detail page to reflect updates
                window.location.href = `/shop/${encodeURIComponent(shopId)}`;
            } else {
                const text = await res.text();
                alert('更新に失敗しました: ' + res.status + '\n' + text);
            }
        } catch (err) {
            console.error(err);
            alert('更新中にエラーが発生しました');
        }
    });
}
