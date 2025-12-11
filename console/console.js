document.getElementById("save-tags").onclick = () => {
    localStorage.setItem("team1", document.getElementById("team1").value);
    localStorage.setItem("team2", document.getElementById("team2").value);
};
