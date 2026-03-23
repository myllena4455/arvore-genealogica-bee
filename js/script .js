// Teste de conexão (Se isso aparecer ao abrir o site, o JS ligou!)
console.log("Arquivo script.js carregado com sucesso!");

// 1. Banco de Dados de Membros
let membros = [
    { nome: "Myh", sobrenome: "Bee", foto: "texte.png", status: "Matriarca", familia: "bee" }
];

// 2. Função para o botão "Família Bee"
function filtrarFamilia(nomeFamilia) {
    console.log("Filtrando por: " + nomeFamilia);
    const container = document.getElementById('treeContainer');
    container.innerHTML = ""; 

    const filtrados = membros.filter(m => m.familia.toLowerCase() === nomeFamilia.toLowerCase());

    filtrados.forEach(membro => {
        container.innerHTML += `
            <div class="member-card">
                <div class="photo-container">
                    <img src="${membro.foto}" alt="Foto">
                </div>
                <div class="info">
                    <h3>${membro.nome} <span class="surname">${membro.sobrenome}</span></h3>
                    <p class="status">${membro.status}</p>
                </div>
            </div>
        `;
    });
}

// 3. Função para o Painel de ADM
function toggleAdminPanel() {
    const senha = prompt("Digite a chave de acesso:");
    if (senha === "bee123") {
        document.getElementById('managementSection').style.display = 'block';
        document.getElementById('btnNovaFamilia').style.display = 'inline-block';
    } else {
        alert("Senha incorreta!");
    }
}

// 4. Outras funções para não dar erro
function buscarMembro() { alert("Buscando..."); }
function mostrarFormMembro() { document.getElementById('memberForm').style.display = 'block'; }
