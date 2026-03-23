// 1. BANCO DE DADOS INICIAL (Lista de Membros)
let membros = [
    { nome: "Myh", sobrenome: "Bee", foto: "texte.png", status: "Matriarca", familia: "bee" }
];

const SENHA_MESTRA = "bee123"; 

// 2. FUNÇÃO PARA FILTRAR POR FAMÍLIA (Faz o botão funcionar)
function filtrarFamilia(nomeFamilia) {
    const container = document.getElementById('treeContainer');
    container.innerHTML = ""; // Limpa a tela antes de mostrar os novos

    // Procura na lista quem é daquela família
    const filtrados = membros.filter(m => m.familia.toLowerCase() === nomeFamilia.toLowerCase());

    if (filtrados.length === 0) {
        container.innerHTML = "<p>Nenhum membro encontrado nesta família.</p>";
        return;
    }

    // Desenha os cards na tela
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

// 3. AJUSTE NO LOGIN (Para liberar as funções de ADM)
function toggleAdminPanel() {
    const senha = prompt("Digite a chave de acesso da House Bee:");
    
    if (senha === SENHA_MESTRA) {
        alert("Acesso liberado!");
        document.getElementById('managementSection').style.display = 'block';
        document.getElementById('btnNovaFamilia').style.display = 'inline-block';
        
        // Mostrar botões de excluir/editar se quiser futuramente
        document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'inline-block');
    } else {
        alert("Senha incorreta!");
    }
}

// Outras funções que você já tem...
function mostrarFormMembro() {
    document.getElementById('memberForm').style.display = 'block';
}

function buscarMembro() {
    let busca = document.getElementById('searchInput').value.toLowerCase();
    const membroEncontrado = membros.find(m => m.nome.toLowerCase() === busca);
    
    if(membroEncontrado) {
        alert(`Membro encontrado: ${membroEncontrado.nome} da Família ${membroEncontrado.familia}`);
        filtrarFamilia(membroEncontrado.familia);
    } else {
        alert("Pessoa não encontrada em nenhuma família!");
    }
}
