const clientId = "36304abf3c674b89ba2489ab3e554e0b";

// IMPORTANT: redirect must match EXACTLY the Spotify dashboard entry
const redirectUri = "https://nebulaone20.github.io/Nebulas-Valorant-Overlay/console/";

const scopes = "user-read-playback-state user-read-currently-playing";

// --- LOGIN BUTTON ---
document.getElementById("login-btn").onclick = () => {
    const authUrl =
        "https://accounts.spotify.com/authorize" +
        "?response_type=token" +                // MUST use token for GitHub Pages
        "&client_id=" + encodeURIComponent(clientId) +
        "&scope=" + encodeURIComponent(scopes) +
        "&redirect_uri=" + encodeURIComponent(redirectUri);

    window.location.href = authUrl;
};

// --- PARSE ACCESS TOKEN FROM URL ---
function getAccessTokenFromUrl() {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    return params.get("access_token");
}

const token = getAccessTokenFromUrl();

// Hide login if token exists
if (token) {
    document.getElementById("login-btn").style.display = "none";
    startNowPlaying();
}

// --- CURRENT SONG POLLING ---
async function startNowPlaying() {
    setInterval(async () => {
        const response = await fetch(
            "https://api.spotify.com/v1/me/player/currently-playing",
            { headers: { Authorization: "Bearer " + token } }
        );

        if (!response.ok) return;

        const data = await response.json();
        const track = data.item;

        if (!track) return;

        const text = `${track.name} — ${track.artists[0].name}`;

        document.getElementById("scroll-text").textContent = text;
        document.getElementById("song-marquee").classList.remove("hidden");
    }, 2000);
}
