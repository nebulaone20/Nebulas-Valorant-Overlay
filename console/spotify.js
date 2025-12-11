// ===============================
// CONFIG
// ===============================
const clientId = "36304abf3c674b89ba2489ab3e554e0b";
const redirectUri = "https://nebulaone20.github.io/Nebulas-Valorant-Overlay/console/";
const scopes = "user-read-currently-playing user-read-playback-state";

// ===============================
// HELPER: Generate PKCE code verifier
// ===============================
function generateCodeVerifier(length) {
    let text = "";
    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
    for (let i = 0; i < length; i++) text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}

// ===============================
// HELPER: SHA256 encoder
// ===============================
async function sha256(plain) {
    const encoder = new TextEncoder();
    const data = encoder.encode(plain);
    return window.crypto.subtle.digest("SHA-256", data);
}

// ===============================
// HELPER: Convert buffer to base64url
// ===============================
function base64urlencode(buffer) {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    bytes.forEach((b) => (binary += String.fromCharCode(b)));
    return btoa(binary)
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
}

// ===============================
// STEP 1: Redirect to Spotify
// ===============================
document.getElementById("login-btn").onclick = async () => {
    const codeVerifier = generateCodeVerifier(128);
    localStorage.setItem("code_verifier", codeVerifier);

    const codeChallenge = base64urlencode(await sha256(codeVerifier));

    const authUrl =
        "https://accounts.spotify.com/authorize?" +
        new URLSearchParams({
            response_type: "code",
            client_id: clientId,
            scope: scopes,
            code_challenge_method: "S256",
            code_challenge: codeChallenge,
            redirect_uri: redirectUri
        });

    window.location.href = authUrl;
};

// ===============================
// STEP 2: Handle returned authorization code
// ===============================
async function checkForAuthCode() {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (!code) return; // No code → do nothing

    const codeVerifier = localStorage.getItem("code_verifier");

    // Exchange code for token
    const body = new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: redirectUri,
        client_id: clientId,
        code_verifier: codeVerifier
    });

    const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body
    });

    const data = await response.json();

    if (data.error) {
        alert("Token exchange failed: " + JSON.stringify(data));
        return;
    }

    localStorage.setItem("access_token", data.access_token);

    startNowPlaying();
}

checkForAuthCode();

// ===============================
// STEP 3: Request currently playing track
// ===============================
async function startNowPlaying() {
    document.getElementById("song-box").style.display = "block";

    setInterval(async () => {
        const token = localStorage.getItem("access_token");
        if (!token) return;

        const response = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
            headers: { Authorization: "Bearer " + token }
        });

        if (!response.ok) return;

        const data = await response.json();
        if (!data || !data.item) return;

        const track = data.item;
        const text = `${track.name} — ${track.artists[0].name}`;

        document.getElementById("scroll-text").textContent = text;
    }, 2000);
}
