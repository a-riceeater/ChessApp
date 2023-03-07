function register() {
  fetch("/app-api/register", {
    method: "POST",
    mode: "cors",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username: "a",
      password: 'a'
    }),
    
  })
  .then((data) => {
    return data.json();
  })
  .then((data) => {
    console.dir(data);
  })
  .catch(err => {
  document.body.innerHTML = `
        <div style="position: fixed; transform: translate(-50%, -50%); top: 50%; left: 50%; width: 50%; height: 50%; font-family: var(--m); text-align: center;">
        <img src="images/pawn-black.png"> 
        <h1>Whoops!</h1>
        <p>An error occured.</p>
        <p>${err}</p>
        <p><a href="" style="color: blue; text-decoration: none;">Reload</a></p>
        </div>
        `
  })
}

document.getElementById("registerBtn").addEventListener("click", register);

document.querySelectorAll("input").forEach(ele => {
  ele.addEventListener("keydown", (e) => {
    if (e.key == "Enter") register();
  })
})