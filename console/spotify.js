// -----------------------------
// CONFIG
// -----------------------------
const clientId = "36304abf3c674b89ba2489ab3e554e0b";
const redirectUri = "https://nebulaone20.github.io/Nebulas-Valorant-Overlay/console/";
const scopes = "user-read-playback-state user-read-currently-playing";

// -----------------------------
// LOGIN BUTTON
// -----------------------------
document.getElementById("login-btn").onclick = () => {

    const authUrl =
        "https://accounts.spotify.com/authorize" +
        "?response_type=token" +                                // IMPORTANT
        "&client_id=" + encodeURIComponent(clientId) +
        "&redirect_uri=" + encodeURIComponent(redirectUri) +
        "&scope=" + encodeURIComponent(scopes);

    window.location.href = authUrl;
};

// -----------------------------
// GET ACCESS TOKEN FROM URL
// -----------------------------
function getAccessTokenFromUrl() {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    return params.get("access_token");
}

const token = getAccessTokenFromUrl();

if (token) {
    document.getElementById("login-btn").style.display = "none";
    startNowPlaying();
}

// -----------------------------
// FETCH CURRENT SONG
// -----------------------------
async function startNowPlaying() {
    setInterval(async () => {
        const response = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
            headers: { Authorization: "Bearer " + token }
        });

        if (!response.ok) return;

        const data = await response.json();
        if (!data || !data.item) return;

        const track = data.item;

        const text = `${track.name} — ${track.artists[0].name}`;

        document.getElementById("scroll-text").textContent = text;
        document.getElementById("song-marquee").classList.remove("hidden");

    }, 2000);
}
