﻿document.getElementById("btnLogin").addEventListener("click", function () {
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;

    fetch("http://localhost:5000/api/user/authenticate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })  
    })
        .then(response => response.json())
        .then(data => {
            if (data.token) {
                localStorage.setItem("access_token", data.token);  
                console.log("Token stored successfully:", data.token);
                window.location.href = "chat.html";  
            } else {
                alert("Login failed! Please check your credentials.");
            }
        })
        .catch(error => console.error("Login failed:", error));
});
