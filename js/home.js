async function loadHomeEvents() {

    const events = await fetchSheet(SHEETS.events);

    const upcoming = events.filter(e => getEventStatus(e) === "soon");
    const live = events.filter(e => getEventStatus(e) === "live");

    let featured = live[0] || upcoming[0];

    if (!featured) return;

    const hero = document.getElementById("heroEvents");

    hero.innerHTML = `
        <div class="hero-event-card">

            <span class="badge">
                ${getEventStatus(featured) === "live"
                    ? "🔴 Live"
                    : "Coming Soon"}
            </span>

            <h3>${featured.name}</h3>

            <p class="meta">
                ${featured.startdate ? formatDateShort(featured.startdate) : "Date To Be Announced"}<br>
                ${featured.venue || ""}
            </p>

            <a href="events.html" class="card-link">
                View Event →
            </a>

        </div>
    `;

    const workshop = document.getElementById("featuredWorkshop");

    workshop.innerHTML = `

<div class="workshop-card-header">

<div>

<span class="workshop-badge">
${getEventStatus(featured) === "live"
? "🔴 Live Event"
: "Coming Soon"}
</span>

<h3>${featured.name}</h3>

<p>${featured.description || ""}</p>

</div>

<a href="events.html" class="btn-primary">
View Details
</a>

</div>

<div class="workshop-card-body">

<div>
<div class="detail-label">Date</div>
<div class="detail-value">
${featured.startdate
? formatDateShort(featured.startdate)
: "To Be Announced"}
</div>
</div>

<div>
<div class="detail-label">Venue</div>
<div class="detail-value">
${featured.venue || "TBA"}
</div>
</div>

<div>
<div class="detail-label">Time</div>
<div class="detail-value">
${featured.timings || "TBA"}
</div>
</div>

</div>

<div class="workshop-topics">
${topicTags(featured.topics)}
</div>

`;

}

loadHomeEvents();