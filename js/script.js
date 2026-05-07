const SENHA_MESTRA = "586262";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDtevoI8ScPg0_2933xJDnznHITwSk8TXQ",
  authDomain: "bee-infor.firebaseapp.com",
  databaseURL: "https://bee-infor-default-rtdb.firebaseio.com",
  projectId: "bee-infor",
  storageBucket: "bee-infor.firebasestorage.app",
  messagingSenderId: "807740056937",
  appId: "1:807740056937:web:adb0f645712685a25fc9f8",
  measurementId: "G-N5VBJC6VZ3"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const database = firebase.database();

// Cloudinary config
const CLOUDINARY_CLOUD_NAME = "atelier-do-gandolf";
const CLOUDINARY_UPLOAD_PRESET = "arvore_genealogica";

let familias = ["bee"];
let membros = [];
let familiaSelecionada = "bee";
let isAdmin = false;

function showMessage(msg, type = "info") {
    const box = document.getElementById('messageBox');
    if (!box) return;
    box.textContent = msg;
    box.className = 'message ' + type;
    box.style.display = 'block';
    setTimeout(() => { if(box) box.style.display = 'none'; }, 5000);
}

function toggleAdminPanel() {
    document.getElementById('passwordModal').style.display = 'block';
    document.getElementById('adminPassword').focus();
}

function fecharModal() {
    document.getElementById('passwordModal').style.display = 'none';
    document.getElementById('adminPassword').value = '';
}

function verificarSenha() {
    const senha = document.getElementById('adminPassword').value;
    if (senha === SENHA_MESTRA) {
        isAdmin = true;
        showMessage("?? Painel ADM liberado!", "success");
        document.getElementById('managementSection').style.display = 'block';
        atualizarSelects();
        renderFamilyNav();
        desenharArvore();
        fecharModal();
    } else {
        showMessage("Senha incorreta!", "error");
    }
}

function renderFamilyNav() {
    const container = document.getElementById('familyNav');
    if (!container) return;
    let html = '<button class="btn-family" onclick="filtrarFamilia(\'all\')">Todas</button>';
    familias.forEach(f => {
        const activeClass = (familiaSelecionada === f) ? ' active' : '';
        html += '<button class="btn-family' + activeClass + '" onclick="filtrarFamilia(\'' + f + '\')">' + f + '</button>';
    });
    html += '<button class="btn-admin-link" onclick="toggleAdminPanel()">?? ADM</button>';
    container.innerHTML = html;
}

function filtrarFamilia(familia) {
    familiaSelecionada = familia;
    renderFamilyNav();
    desenharArvore();
}

function mostrarFormMembro() {
    document.getElementById('memberForm').style.display = 'block';
    atualizarSelects();
}

function novaFamilia() {
    const input = document.getElementById('familyNameInput');
    if (!input) return;
    const nome = input.value.trim().toLowerCase();
    if (!nome) return showMessage('Digite o nome da família.', "error");
    if (familias.includes(nome)) return showMessage('Família já existe.', "error");
    familias.push(nome);
    input.value = '';
    showMessage('Família ' + nome + ' criada!', "success");
    renderFamilyNav();
    atualizarSelects();
}

function excluirFamilia() {
    const familia = prompt("Digite o nome da família a excluir:");
    if (!familia) return;
    const lower = familia.toLowerCase();
    if (lower === 'bee') return showMessage('Não pode excluir a família Bee.', "error");
    familias = familias.filter(f => f !== lower);
    renderFamilyNav();
    atualizarSelects();
    desenharArvore();
}

function atualizarSelects() {
    const pai = document.getElementById('selectPai');
    const mae = document.getElementById('selectMae');
    const conjuge = document.getElementById('selectConjuge');
    const familia = document.getElementById('selectFamilia');

    if (!pai || !mae || !conjuge || !familia) return;

    pai.innerHTML = '<option value="">Selecionar Pai...</option>';
    mae.innerHTML = '<option value="">Selecionar Mãe...</option>';
    conjuge.innerHTML = '<option value="">Selecionar cônjuge...</option>';
    familia.innerHTML = '';

    familias.forEach(f => {
        familia.innerHTML += '<option value="' + f + '">' + f + '</option>';
    });

    membros.forEach(m => {
        const nomeFull = m.nome + ' ' + (m.sobrenome || '');
        const opt = '<option value="' + m.id + '">' + nomeFull + '</option>';
        pai.innerHTML += opt;
        mae.innerHTML += opt;
        conjuge.innerHTML += opt;
    });
}

async function carregarMembros() {
    try {
        const snapshot = await database.ref('membros').once('value');
        const data = snapshot.val();
        membros = [];
        if (data) {
            Object.keys(data).forEach(key => {
                const m = data[key];
                m.id = parseInt(m.id);
                m.filhos = [];
                membros.push(m);
            });
        }

        const possiveisFamilias = new Set(membros.filter(m => m.familia).map(m => m.familia));
        possiveisFamilias.forEach(f => { if (!familias.includes(f)) familias.push(f); });

        membros.forEach(m => {
            if (m.pai) {
                const p = membros.find(x => x.id === parseInt(m.pai));
                if (p && !p.filhos.includes(m.id)) p.filhos.push(m.id);
            }
            if (m.mae) {
                const maeMembro = membros.find(x => x.id === parseInt(m.mae));
                if (maeMembro && !maeMembro.filhos.includes(m.id)) maeMembro.filhos.push(m.id);
            }
        });

        renderFamilyNav();
        desenharArvore();
        atualizarSelects();
    } catch (error) {
        console.error('Erro Firebase:', error);
    }
}

async function salvarMembroFirebase(membro) {
    const mToSave = { ...membro };
    delete mToSave.filhos;
    await database.ref('membros/' + mToSave.id).set(mToSave);
}

async function executarCadastro() {
    const nome = document.getElementById('nomeMembro').value.trim();
    const sobrenome = document.getElementById('sobrenomeMembro').value.trim();
    const arquivoFoto = document.getElementById('fotoMembro').files[0];
    const hierarquia = document.getElementById('hierarquia').value;
    const pai = parseInt(document.getElementById('selectPai').value) || null;
    const mae = parseInt(document.getElementById('selectMae').value) || null;
    const conjuge = parseInt(document.getElementById('selectConjuge').value) || null;
    const familia = document.getElementById('selectFamilia').value || 'bee';

    if (!nome) return showMessage('Nome obrigatório.', "error");

    let foto = '';
    if (arquivoFoto) {
        try {
            const formData = new FormData();
            formData.append('file', arquivoFoto);
            formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
            const response = await fetch('https://api.cloudinary.com/v1_1/' + CLOUDINARY_CLOUD_NAME + '/image/upload', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            if (data.secure_url) {
                foto = data.secure_url;
            } else {
                throw new Error(data.error ? data.error.message : 'Erro no Cloudinary');
            }
        } catch (err) {
            console.error('Upload erro:', err);
            return showMessage('Falha no upload da foto.', 'error');
        }
    }

    const id = membros.length ? Math.max(...membros.map(m => m.id)) + 1 : 1;
    const novo = { id, nome, sobrenome, foto, status: (hierarquia === 'patriarca' ? 'Patriarca' : 'Membro'), familia, pai, mae, conjuge };

    await salvarMembroFirebase(novo);

    if (conjuge) {
        const c = membros.find(m => m.id === conjuge);
        if (c) { 
            c.conjuge = id; 
            await salvarMembroFirebase(c); 
        }
    }

    showMessage('Membro cadastrado!', "success");
    document.getElementById('memberForm').style.display = 'none';
    carregarMembros();
}

function criarCard(m) {
    const placeholder = 'https://via.placeholder.com/150/ffd1dc/663300?text=Sem+Foto';
    const fotoUrl = m.foto || placeholder;
    const adminButtons = isAdmin ? '<button class="btn-delete" onclick="removerMembro(' + m.id + ')">Excluir</button>' : '';
    
    return (
        '<div class="member-card">' +
            '<div class="photo-container">' +
                '<img src="' + fotoUrl + '" alt="' + m.nome + '">' +
            '</div>' +
            '<div class="info">' +
                '<h3>' + m.nome + ' ' + (m.sobrenome || '') + '</h3>' +
                '<p class="status">' + m.status + '</p>' +
                adminButtons +
            '</div>' +
        '</div>'
    );
}

function desenharArvore() {
    const container = document.getElementById('treeContainer');
    if (!container) return;
    container.innerHTML = '';
    
    const lista = (familiaSelecionada === 'all') ? membros : membros.filter(m => m.familia === familiaSelecionada);
    
    if (lista.length === 0) {
        container.innerHTML = '<p>Nenhum membro nesta família ainda.</p>';
        return;
    }

    const html = lista.map(criarCard).join('');
    container.innerHTML = '<div class="geracao">' + html + '</div>';
}

async function removerMembro(id) {
    if (!confirm('Deseja realmente remover este membro da colmeia?')) return;
    try {
        await database.ref('membros/' + id).remove();
        showMessage('Membro removido!', 'success');
        carregarMembros();
    } catch (error) {
        showMessage('Erro ao remover membro.', 'error');
    }
}

function checkHierarquia() {
    const h = document.getElementById('hierarquia').value;
    const fields = document.getElementById('parentescoFields');
    if (fields) fields.style.display = h === 'patriarca' ? 'none' : 'block';
}

window.onload = function() {
    setTimeout(() => {
        const splash = document.getElementById('splashScreen');
        const main = document.getElementById('mainContent');
        if (splash) splash.style.display = 'none';
        if (main) main.style.display = 'block';
        carregarMembros();
    }, 2000);
};
