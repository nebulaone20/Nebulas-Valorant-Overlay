// -------------------------------
// CONFIG
// -------------------------------
const clientId = "36304abf3c674b89ba2489ab3e554e0b";
const redirectUri = "https://nebulaone20.github.io/Nebulas-Valorant-Overlay/console/";


// -------------------------------
// PKCE HELPERS
// -------------------------------
function generateCodeVerifier(length = 128) {
    let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
    let output = "";
    for (let i = 0; i < length; i++) {
        output += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return output;
}

async function generateCodeChallenge(verifier) {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const digest = await crypto.subtle.digest("SHA-256", data);
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
}


// -------------------------------
// LOGIN BUTTON CLICK
// -------------------------------
document.getElementById("login-btn").onclick = async () => {
    const verifier = generateCodeVerifier();
    const challenge = await generateCodeChallenge(verifier);

    localStorage.setItem("spotify_code_verifier", verifier);

    const authUrl = new URL("https://accounts.spotify.com/authorize");
    authUrl.searchParams.append("client_id", clientId);
    authUrl.searchParams.append("response_type", "code");
    authUrl.searchParams.append("redirect_uri", redirectUri);
    authUrl.searchParams.append("scope", "user-read-currently-playing user-read-playback-state");
    authUrl.searchParams.append("code_challenge_method", "S256");
    authUrl.searchParams.append("code_challenge", challenge);

    window.location = authUrl.toString();
};


// -------------------------------
// EXCHANGE CODE FOR TOKEN
// -------------------------------
async function getAccessToken(code) {
    const verifier = localStorage.getItem("spotify_code_verifier");

    const body = new URLSearchParams({
        client_id: clientId,
        grant_type: "authorization_code",
        code: code,
        redirect_uri: redirectUri,
        code_verifier: verifier
    });

    const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body
    });

    if (!response.ok) {
        console.error("Token exchange failed");
        return null;
    }

    return await response.json();
}


// -------------------------------
// HANDLE REDIRECT
// -------------------------------
async function handleRedirect() {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (!code) return;

    const tokenData = await getAccessToken(code);
    if (!tokenData) return;

    localStorage.setItem("spotify_access_token", tokenData.access_token);

    document.getElementById("login-btn").style.display = "none";

    startNowPlaying();
}

handleRedirect();


// -------------------------------
// FETCH CURRENTLY PLAYING
// -------------------------------
async function startNowPlaying() {
    const token = localStorage.getItem("spotify_access_token");

    if (!token) return;

    setInterval(async () => {
        const res = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
            headers: { Authorization: "Bearer " + token }
        });

        if (!res.ok) return;

        const data = await res.json();
        if (!data || !data.item) return;

        const track = data.item;
        const text = `${track.name} — ${track.artists.map(a => a.name).join(", ")}`;

        document.getElementById("scroll-text").textContent = text;
        document.getElementById("song-marquee").classList.remove("hidden");

    }, 2000);
}
