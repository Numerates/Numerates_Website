/* ============================================
   NUMERATES Gallery
   ============================================ */

const GALLERY_WRAP = document.getElementById("galleryWrap");
const GALLERY_LOADING = document.getElementById("galleryLoading");
const GALLERY_FILTERS = document.getElementById("galleryFilters");

const LIGHTBOX = document.getElementById("lightbox");
const LB_IMG = document.getElementById("lbImg");
const LB_CAP = document.getElementById("lbCaption");

let allImages = [];
let currentIndex = 0;

async function loadGallery() {
    try {
        const rows = await fetchSheet(SHEETS.gallery);

        const groups = {};
        const order = [];

        rows.forEach(row => {
            const event = row.eventname?.trim();
            const image = driveUrl(row.imageurl);

            if (!event || !image) return;

            if (!groups[event]) {
                groups[event] = [];
                order.push(event);
            }

            groups[event].push(image);
            allImages.push({
                event,
                url: image
            });
        });

        createFilters(order, groups);
        renderGallery("all", groups, order);

        GALLERY_LOADING.style.display = "none";

    } catch (err) {
        console.error(err);
        GALLERY_LOADING.innerHTML =
            "<p>Unable to load gallery.</p>";
    }
}

function createFilters(order, groups) {

    GALLERY_FILTERS.innerHTML =
        `<button class="gallery-filter-btn active" data-filter="all">All</button>` +
        order.map(e =>
            `<button class="gallery-filter-btn" data-filter="${e}">${e}</button>`
        ).join("");

    GALLERY_FILTERS.querySelectorAll("button").forEach(btn => {

        btn.onclick = () => {

            GALLERY_FILTERS.querySelectorAll("button")
                .forEach(b => b.classList.remove("active"));

            btn.classList.add("active");

            renderGallery(btn.dataset.filter, groups, order);

        };

    });

}

function renderGallery(filter, groups, order) {

    GALLERY_WRAP.innerHTML = "";

    const events = filter === "all"
        ? order
        : [filter];

    events.forEach(event => {

        const images = groups[event];
        if (!images) return;

        const section = document.createElement("div");
        section.className = "gallery-event-section";

        section.innerHTML = `
        <div class="gallery-event-header">
            <h3 class="gallery-event-title">${event}</h3>
            <span class="gallery-event-count">${images.length} Photos</span>
        </div>

        <div class="gallery-grid">

        ${images.map(url=>`

            <div class="gallery-item">

                <img src="${url}" loading="lazy">

                <div class="gallery-overlay">
                    <i class="fa-solid fa-magnifying-glass-plus"></i>
                </div>

            </div>

        `).join("")}

        </div>
        `;

        GALLERY_WRAP.appendChild(section);

    });

    bindGalleryClicks();

}

function bindGalleryClicks(){

    document.querySelectorAll(".gallery-item").forEach(item=>{

        item.onclick=()=>{

            const img=item.querySelector("img").src;

            currentIndex=allImages.findIndex(i=>i.url===img);

            showImage();

            LIGHTBOX.classList.add("open");

            document.body.style.overflow="hidden";

        };

    });

}

function showImage(){

    LB_IMG.src=allImages[currentIndex].url;

    LB_CAP.textContent=allImages[currentIndex].event;

}

function closeLightbox(){

    LIGHTBOX.classList.remove("open");

    document.body.style.overflow="";

}

document.getElementById("lbClose").onclick=closeLightbox;

document.getElementById("lbPrev").onclick=()=>{

    currentIndex=(currentIndex-1+allImages.length)%allImages.length;

    showImage();

};

document.getElementById("lbNext").onclick=()=>{

    currentIndex=(currentIndex+1)%allImages.length;

    showImage();

};

LIGHTBOX.onclick=e=>{
    if(e.target===LIGHTBOX) closeLightbox();
};

document.addEventListener("keydown",e=>{

    if(!LIGHTBOX.classList.contains("open")) return;

    if(e.key==="ArrowRight"){
        currentIndex=(currentIndex+1)%allImages.length;
        showImage();
    }

    if(e.key==="ArrowLeft"){
        currentIndex=(currentIndex-1+allImages.length)%allImages.length;
        showImage();
    }

    if(e.key==="Escape"){
        closeLightbox();
    }

});

loadGallery();