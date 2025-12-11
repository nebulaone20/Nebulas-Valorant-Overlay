const CLIENT_ID = "36304abf3c674b89ba2489ab3e554e0b";
const REDIRECT_URI = "https://nebulaone20.github.io/Nebulas-Valorant-Overlay/console/";
const SCOPES = "user-read-playback-state user-read-currently-playing";

document.getElementById("login-btn").onclick = () => {
    const authUrl =
      "https://accounts.spotify.com/authorize" +
      "?response_type=token" +
      "&client_id=" + CLIENT_ID +
      "&redirect_uri=" + encodeURIComponent(REDIRECT_URI) +
      "&scope=" + encodeURIComponent(SCOPES);

    window.location.href = authUrl;
};

function getTokenFromUrl() {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    return params.get("access_token");
}

const token = getTokenFromUrl();
if (token) {
    localStorage.setItem("spotify_access_token", token);
    window.location.hash = ""; // clean URL
}

const savedToken = localStorage.getItem("spotify_access_token");
if (savedToken) {
    startNowPlaying(savedToken);
}

async function startNowPlaying(token) {
    document.getElementById("login-btn").style.display = "none";
    document.getElementById("current-track").classList.remove("hidden");

    setInterval(async () => {
        const r = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
            headers: { Authorization: "Bearer " + token }
        });

        if (!r.ok) return;
        const json = await r.json();
        const track = json?.item;

        if (track) {
            const text = `${track.name} — ${track.artists[0].name}`;
            document.getElementById("track-text").textContent = text;
            localStorage.setItem("now_playing_text", text);
        }
    }, 2000);
}
