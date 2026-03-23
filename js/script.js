const SENHA_MESTRA = "bee123";
const SUPABASE_URL = "https://ltcvsdhcrlwbvzbezcwm.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_VV2VV93_3Srsyh0GfBG41A_EzLzckYa";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let familias = ["bee"];
let membros = [
    { id: 1, nome: "Myh", sobrenome: "Bee", foto: "texte.png", status: "Matriarca", familia: "bee", pai: null, mae: null, conjuge: null, filhos: [] }
];
let familiaSelecionada = null;
let isAdmin = false;

function temSupabase() {
    return SUPABASE_URL.indexOf('YOUR_SUPABASE') < 0 && SUPABASE_ANON_KEY.indexOf('YOUR_SUPABASE') < 0;
}

function showMessage(msg, type = "info") {
    const box = document.getElementById('messageBox');
    box.textContent = msg;
    box.className = `message ${type}`;
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
        showMessage("🎉 Painel ADM liberado! Agora você pode editar membros, criar famílias e gerenciar relacionamentos.", "success");
        document.getElementById('managementSection').style.display = 'block';
        document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'inline-block');
        atualizarSelects();
        renderFamilyNav();
        fecharModal();
    } else {
        showMessage("Senha incorreta! Acesso negado.", "error");
        document.getElementById('adminPassword').value = '';
        document.getElementById('adminPassword').focus();
    }
}

// Event listener para Enter no input de senha
document.getElementById('adminPassword').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        verificarSenha();
    }
});

function renderFamilyNav() {
    const container = document.getElementById('familyNav');
    let html = '<button class="btn-family" onclick="filtrarFamilia(\'all\')">Todas as Famílias</button>';
    html += '<button class="btn-family" onclick="filtrarFamilia(\'all\')">Página Inicial</button>';
    html += '<button class="btn-admin-link" onclick="toggleAdminPanel()">Acesso Restrito</button>';
    if (document.querySelector('#managementSection').style.display === 'block') {
        html += '<button id="btnNovaFamilia" class="btn-family admin-only" onclick="novaFamilia()">Nova Família +</button>';
    }
    container.innerHTML = html;
    renderFamilyButtons();
}

function renderFamilyButtons() {
    const container = document.getElementById('familyButtons');
    if (!container) return;
    container.innerHTML = '';
    familias.forEach(f => {
        const btn = document.createElement('button');
        btn.className = 'btn-family';
        btn.textContent = `Família ${f}`;
        btn.onclick = () => filtrarFamilia(f);
        container.appendChild(btn);
    });
}

function filtrarFamilia(familia) {
    familiaSelecionada = familia === 'all' ? null : familia;
    document.getElementById('treeContainer').innerHTML = '';

    if (!familiaSelecionada) {
        document.getElementById('treeContainer').innerHTML = '<p>Selecione uma família para exibir seus membros.</p>';
        return;
    }

    const groupButtons = document.querySelectorAll('#familyButtons .btn-family');
    groupButtons.forEach(btn => {
        btn.classList.toggle('active', btn.textContent.toLowerCase().includes(familiaSelecionada.toLowerCase()));
    });
    desenharArvore(familiaSelecionada);
}

function mostrarFormMembro() {
    document.getElementById('memberForm').style.display = 'block';
    atualizarSelects();
}

function novaFamilia() {
    const nome = prompt("Digite o nome da nova família:");
    if (!nome || !nome.trim()) return;
    const lower = nome.trim().toLowerCase();
    if (familias.includes(lower)) return showMessage('Família já existe.', "error");
    familias.push(lower);
    showMessage(`Família ${nome.trim()} criada!`, "success");
    renderFamilyNav();
    atualizarSelects();
}

async function excluirFamilia() {
    const familia = prompt("Digite o nome da família a excluir (todos os membros serão removidos):");
    if (!familia || !familia.trim()) return;
    const lower = familia.trim().toLowerCase();
    if (!familias.includes(lower)) return showMessage('Família não encontrada.', "error");
    if (lower === 'bee') return showMessage('Não é possível excluir a família Bee.', "error");
    if (!confirm(`Confirmar exclusão da família ${familia.trim()}? Todos os membros serão removidos.`)) return;
    
    // Remover todos os membros da família
    const membrosParaRemover = membros.filter(m => m.familia === lower);
    for (const m of membrosParaRemover) {
        await excluirMembroSupabase(m.id);
    }
    membros = membros.filter(m => m.familia !== lower);
    familias = familias.filter(f => f !== lower);
    
    showMessage(`Família ${familia.trim()} excluída com sucesso.`, "success");
    renderFamilyNav();
    atualizarSelects();
    desenharArvore();
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

    familias.forEach(f => familia.innerHTML += `<option value="${f}">${f}</option>`);
    membros.forEach(m => {
        const nomeFull = `${m.nome} ${m.sobrenome || ''}`.trim();
        pai.innerHTML += `<option value="${m.id}">${nomeFull}</option>`;
        mae.innerHTML += `<option value="${m.id}">${nomeFull}</option>`;
        conjuge.innerHTML += `<option value="${m.id}">${nomeFull}</option>`;
    });
}

async function carregarMembros() {
    if (temSupabase()) {
        const { data, error } = await supabaseClient.from('membros').select('*').order('id', { ascending: true });
        if (!error && data && data.length) {
            membros = data.map(item => ({
                id: item.id,
                nome: item.nome,
                sobrenome: item.sobrenome,
                foto: item.foto,
                status: item.status,
                familia: item.familia,
                pai: item.pai,
                mae: item.mae,
                conjuge: item.conjuge,
                filhos: item.filhos || []
            }));
        } else if (error) {
            console.error('Supabase load error', error);
            showMessage('Erro ao carregar membros do Supabase. Usando modo offline.', "error");
        }
    }

    const possiveisFamilias = new Set(membros.filter(m => m.familia).map(m => m.familia));
    possiveisFamilias.forEach(f => { if (!familias.includes(f)) familias.push(f); });

    renderFamilyNav();
    desenharArvore();
    atualizarSelects();
}

async function salvarMembroSupabase(membro) {
    if (!temSupabase()) return;
    const { error } = await supabaseClient.from('membros').upsert(membro, { onConflict: 'id' });
    if (error) console.error('Supabase save error', error);
}

async function excluirMembroSupabase(id) {
    if (!temSupabase()) return;
    const { error } = await supabaseClient.from('membros').delete().eq('id', id);
    if (error) console.error('Supabase delete error', error);
}

async function executarCadastro() {
    const nome = document.getElementById('nomeMembro').value.trim();
    const sobrenome = document.getElementById('sobrenomeMembro').value.trim();
    const fotoInput = document.getElementById('fotoMembro');
    const arquivoFoto = fotoInput.files[0] || null;
    const hierarquia = document.getElementById('hierarquia').value;
    const pai = parseInt(document.getElementById('selectPai').value) || null;
    const mae = parseInt(document.getElementById('selectMae').value) || null;
    const conjuge = parseInt(document.getElementById('selectConjuge').value) || null;
    const familia = document.getElementById('selectFamilia').value || 'bee';

    if (!nome) return showMessage('Nome obrigatório.', "error");

    const duplicado = membros.find(m => m.nome.toLowerCase() === nome.toLowerCase() && m.sobrenome.toLowerCase() === sobrenome.toLowerCase());
    if (duplicado) return showMessage(`${nome} já está cadastrado na família ${duplicado.familia}.`, "error");

    if (pai && mae && pai === mae) return showMessage('Pai e mãe não podem ser a mesma pessoa.', "error");

    if (conjuge) {
        const c = membros.find(m => m.id === conjuge);
        if (c && (c.pai !== null || c.mae !== null)) return showMessage('Trava 1: cônjuge deve ser órfão.', "error");
        if (c && c.filhos && c.filhos.length > 0) return showMessage('Trava 2: pessoa com filhos não pode casar com quem já tem família.', "error");
    }

    const id = membros.length ? Math.max(...membros.map(m => m.id)) + 1 : 1;
    const novo = { id, nome, sobrenome, foto, status: (hierarquia === 'patriarca' ? 'Patriarca' : 'Membro'), familia, pai, mae, conjuge, filhos: [] };

    membros.push(novo);

    if (pai) { const p = membros.find(m => m.id === pai); if (p && !p.filhos.includes(id)) p.filhos.push(id); }
    if (mae) { const m = membros.find(m => m.id === mae); if (m && !m.filhos.includes(id)) m.filhos.push(id); }
    if (conjuge) { const c = membros.find(m => m.id === conjuge); if (c) { c.conjuge = id; c.familia = familia; } }

    await salvarMembroSupabase(novo);
    if (pai) { const p = membros.find(m => m.id === pai); if (p) await salvarMembroSupabase(p); }
    if (mae) { const m = membros.find(m => m.id === mae); if (m) await salvarMembroSupabase(m); }
    if (conjuge) { const c = membros.find(m => m.id === conjuge); if (c) await salvarMembroSupabase(c); }

    showMessage('Membro adicionado com sucesso!', "success");
    document.getElementById('memberForm').reset();
    document.getElementById('memberForm').style.display = 'none';
    atualizarSelects();
    desenharArvore();
}

function criarCard(m) {
    const c = m.conjuge ? membros.find(x => x.id === m.conjuge) : null;
    const adminButtons = isAdmin ? `<button class="admin-only" onclick="editarMembro(${m.id})">Editar</button><button class="admin-only" onclick="tornarOrfao(${m.id})">Reset (órfão)</button><button class="admin-only" style="color:red;" onclick="removerMembro(${m.id})">Excluir</button>` : '';
    return `<div class="member-card"><div class="photo-container"><img src="${m.foto}" alt="Foto"></div><div class="info"><h3>${m.nome} <span class="surname">${m.sobrenome}</span></h3><p class="status">${m.status} - Família: ${m.familia || 'Órfão'}</p><p>Pai: ${m.pai ? (membros.find(x => x.id === m.pai)?.nome || 'Desconhecido') : 'Nenhum'} | Mãe: ${m.mae ? (membros.find(x => x.id === m.mae)?.nome || 'Desconhecida') : 'Nenhuma'}</p><p>Cônjuge: ${c ? `${c.nome} ${c.sobrenome}` : 'Nenhum'}</p><p>Filhos: ${m.filhos.length}</p>${adminButtons}</div></div>`;
}

function desenharArvore() {
    const container = document.getElementById('treeContainer');
    container.innerHTML = '';

    if (!familiaSelecionada || familiaSelecionada === 'none') {
        container.innerHTML = '<p>Escolha uma família para visualizar seus membros.</p>';
        return;
    }

    const lista = familiaSelecionada === 'all' ? membros.slice() : membros.filter(m => m.familia === familiaSelecionada);
    if (!lista.length) {
        container.innerHTML = `<p>Nenhum membro encontrado na família ${familiaSelecionada}.</p>`;
        return;
    }

    const lideres = lista.filter(m => m.status === 'Patriarca' || m.status === 'Matriarca' || (m.pai === null && m.mae === null));
    const outros = lista.filter(m => !lideres.includes(m));
    let html = '<div class="geracao topo">' + lideres.map(criarCard).join('') + '</div>';
    if (outros.length) html += '<div class="geracao">' + outros.map(criarCard).join('') + '</div>';
    container.innerHTML = html;
}

async function removerMembro(id) {
    if (!confirm('Excluir membro?')) return;
    const membro = membros.find(m => m.id === id);
    if (!membro) return;
    if (membro.conjuge) { const c = membros.find(m => m.id === membro.conjuge); if (c) { c.conjuge = null; await salvarMembroSupabase(c); } }
    membros = membros.filter(m => m.id !== id);
    membros.forEach(m => { if (m.pai === id) m.pai = null; if (m.mae === id) m.mae = null; });
    await excluirMembroSupabase(id);
    membros.forEach(async m => await salvarMembroSupabase(m));
    atualizarSelects();
    desenharArvore();
}

function editarMembro(id) {
    const membro = membros.find(m => m.id === id);
    if (!membro) return showMessage('Membro não encontrado.', "error");

    const novoNome = prompt('Editar nome:', membro.nome);
    const novoSobrenome = prompt('Editar sobrenome:', membro.sobrenome);
    const novaFoto = prompt('Editar URL foto:', membro.foto);

    if (novoNome) membro.nome = novoNome;
    if (novoSobrenome) membro.sobrenome = novoSobrenome;
    if (novaFoto) membro.foto = novaFoto;

    salvarMembroSupabase(membro);
    atualizarSelects();
    desenharArvore();
}

async function tornarOrfao(id) {
    const membro = membros.find(m => m.id === id);
    if (!membro || !confirm('Confirmar órfão?')) return;
    if (membro.conjuge) { const c = membros.find(m => m.id === membro.conjuge); if (c) { c.conjuge = null; await salvarMembroSupabase(c); } }
    membro.familia = null; membro.pai = null; membro.mae = null; membro.conjuge = null;
    membros.forEach(m => { if (m.pai === id) m.pai = null; if (m.mae === id) m.mae = null; });
    await salvarMembroSupabase(membro);
    atualizarSelects();
    desenharArvore();
}

function buscarMembro() {
    const query = document.getElementById('searchInput').value.toLowerCase().trim();
    const achados = membros.filter(m => (`${m.nome} ${m.sobrenome}`.toLowerCase()).includes(query));
    if (!achados.length) return showMessage('Não encontrado', "error");
    showMessage(achados.map(m => `${m.nome} ${m.sobrenome} - ${m.familia || 'Órfão'}`).join('\n'), "info");
}

window.onload = carregarMembros;
