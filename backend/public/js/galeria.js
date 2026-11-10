
const fotografias = [
    {
        arquivo: "foto1.jpg",
        titulo: "Fotografia 1"
    },
    {
        arquivo: "foto2.jpg",
        titulo: "Fotografia 2"
    },
    {
        arquivo: "foto3.jpg",
        titulo: "Fotografia 3"
    },
    {
        arquivo: "foto4.jpg",
        titulo: "Fotografia 4"
    },
    {
        arquivo: "foto5.jpg",
        titulo: "Fotografia 5"
    },
    {
        arquivo: "foto6.jpg",
        titulo: "Fotografia 6"
    },
    {
        arquivo: "foto7.jpg",
        titulo: "Fotografia 7"
    },
    {
        arquivo: "foto8.jpg",
        titulo: "Fotografia 8"
    },
    {
        arquivo: "foto9.jpg",
        titulo: "Fotografia 9"
    }
];

const galeria = document.getElementById("galeria");

if (galeria) {
    fotografias.forEach((foto) => {
        const cartao = document.createElement("article");
        cartao.classList.add("foto-card");

        cartao.innerHTML = `
            <img
                src="/assets/fotografias/${foto.arquivo}"
                alt="${foto.titulo}"
            >
            <div class="foto-info">
                <h3>${foto.titulo}</h3>
            </div>
        `;

        galeria.appendChild(cartao);
    });
}
