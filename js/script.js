const SENHA_MESTRA = "586262";

// Firebase Configuration via Environment Variables (ou fallback para teste local)
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
firebase.initializeApp(firebaseConfig);
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
    box.textContent = msg;
    box.className = message ;
    box.style.display = 'block';
    setTimeout(() => box.style.display = 'none', 5000);
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
    let html = '<button class="btn-family" onclick="filtrarFamilia(\'all\')">Todas</button>';
    familias.forEach(f => {
        const activeClass = (familiaSelecionada === f) ? ' active' : '';
        html += <button class="btn-family\" onclick="filtrarFamilia('\')">\</button>;
    });
    html += '<button class="btn-admin-link" onclick="toggleAdminPanel()">?? ADM</button>';
    container.innerHTML = html;
}

function filtrarFamilia(familia) {
    familiaSelecionada = familia;
    desenharArvore();
    renderFamilyNav();
}

function mostrarFormMembro() {
    document.getElementById('memberForm').style.display = 'block';
    atualizarSelects();
}

function novaFamilia() {
    const nome = document.getElementById('familyNameInput').value.trim().toLowerCase();
    if (!nome) return showMessage('Digite o nome da família.', "error");
    if (familias.includes(nome)) return showMessage('Família já existe.', "error");
    familias.push(nome);
    document.getElementById('familyNameInput').value = '';
    showMessage(Família \ criada!, "success");
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
}

function atualizarSelects() {
    const pai = document.getElementById('selectPai');
    const mae = document.getElementById('selectMae');
    const conjuge = document.getElementById('selectConjuge');
    const familia = document.getElementById('selectFamilia');

    pai.innerHTML = '<option value="">Selecionar Pai...</option>';
    mae.innerHTML = '<option value="">Selecionar Mãe...</option>';
    conjuge.innerHTML = '<option value="">Selecionar cônjuge...</option>';
    familia.innerHTML = '';

    familias.forEach(f => familia.innerHTML += <option value="\">\</option>);
    membros.forEach(m => {
        const nomeFull = \ \.trim();
        pai.innerHTML += <option value="\">\</option>;
        mae.innerHTML += <option value="\">\</option>;
        conjuge.innerHTML += <option value="\">\</option>;
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
    const cleanMembro = {...membro};
    delete cleanMembro.filhos;
    await database.ref('membros/' + membro.id).set(cleanMembro);
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
            const response = await fetch(https://api.cloudinary.com/v1_1/\/image/upload, {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            if (data.secure_url) {
                foto = data.secure_url;
            } else {
                throw new Error(data.error?.message || 'Erro no Cloudinary');
            }
        } catch (err) {
            console.error('Upload erro:', err);
            return showMessage('Falha no upload da foto.', 'error');
        }
    }

    const id = membros.length ? Math.max(...membros.map(m => m.id)) + 1 : 1;
    const novo = { id, nome, sobrenome, foto, status: (hierarquia === 'patriarca' ? 'Patriarca' : 'Membro'), familia, pai, mae, conjuge };

    membros.push({...novo, filhos: []});
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
    const adminButtons = isAdmin ? <button onclick="removerMembro(\)">Excluir</button> : '';
    return 
        <div class="member-card">
            <img src="\">
            <div class="info">
                <h3>\ \</h3>
                <p>\</p>
                \
            </div>
        </div>
    ;
}

function desenharArvore() {
    const container = document.getElementById('treeContainer');
    container.innerHTML = '';
    const lista = familiaSelecionada === 'all' ? membros : membros.filter(m => m.familia === familiaSelecionada);
    if (!lista.length) {
        container.innerHTML = '<p>Nenhum membro nesta família.</p>';
        return;
    }
    const html = lista.map(criarCard).join('');
    container.innerHTML = <div class="geracao">\</div>;
}

async function removerMembro(id) {
    if (!confirm('Excluir?')) return;
    await database.ref('membros/' + id).remove();
    carregarMembros();
}

function checkHierarquia() {
    const h = document.getElementById('hierarquia').value;
    document.getElementById('parentescoFields').style.display = h === 'patriarca' ? 'none' : 'block';
}

window.onload = function() {
    setTimeout(() => {
        document.getElementById('splashScreen').style.display = 'none';
        document.getElementById('mainContent').style.display = 'block';
        carregarMembros();
    }, 2000);
};
