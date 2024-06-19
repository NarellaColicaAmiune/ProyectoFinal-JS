const urlUsuarios = "https://jsonplaceholder.typicode.com/users";
const listaUsuarios = document.querySelector("#lista-usuarios");

fetch(urlUsuarios)
    .then(response => response.json())
    .then((data) => {
        console.log(data);
        data.forEach(usuario => {
            const li = document.createElement("li");
            li.textContent = usuario.name;
            listaUsuarios.appendChild(li);
        });
    })
    .catch(error => console.error(error));