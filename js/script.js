const SENHA_MESTRA = "bee123";
const SUPABASE_URL = "https://ltcvsdhcrlwbvzbezcwm.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_VV2VV93_3Srsyh0GfBG41A_EzLzckYa";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let familias = ["bee"];
let membros = [
    { id: 1, nome: "Myh", sobrenome: "Bee", foto: "texte.png", status: "Matriarca", familia: "bee", pai: null, mae: null, conjuge: null, filhos: [] }
];

function temSupabase() {
    return SUPABASE_URL.indexOf('YOUR_SUPABASE') < 0 && SUPABASE_ANON_KEY.indexOf('YOUR_SUPABASE') < 0;
}

function toggleAdminPanel() {
    const senha = prompt("Chave de acesso House Bee:");
    if (senha === SENHA_MESTRA) {
        alert("Acesso Administrativo Liberado!");
        document.getElementById('managementSection').style.display = 'block';
        document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'inline-block');
        atualizarSelects();
        renderFamilyNav();
    } else {
        alert("Senha incorreta!");
    }
}

function renderFamilyNav() {
    const container = document.getElementById('familyNav');
    const mainButtons = `<button class="btn-family" onclick="filtrarFamilia('all')">Todas as Famílias</button>`;
    const familyButtons = familias.map(f => `<button class="btn-family" onclick="filtrarFamilia('${f}')">Família ${f}</button>`).join('');
    let html = mainButtons + familyButtons + `<button class="btn-family active" onclick="filtrarFamilia('all')">Página Inicial</button>`;
    if (document.querySelector('#managementSection').style.display === 'block') {
        html += `<button id="btnNovaFamilia" class="btn-family admin-only" onclick="novaFamilia()">Nova Família +</button>`;
    }
    container.innerHTML = html;
}

function mostrarFormMembro() {
    document.getElementById('memberForm').style.display = 'block';
    atualizarSelects();
}

function novaFamilia() {
    const nome = prompt("Digite o nome da nova família:");
    if (!nome || !nome.trim()) return;
    const lower = nome.trim().toLowerCase();
    if (familias.includes(lower)) return alert('Família já existe.');
    familias.push(lower);
    alert(`Família ${nome.trim()} criada!`);
    renderFamilyNav();
    atualizarSelects();
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
            alert('Erro ao carregar membros do Supabase. Usando modo offline.');
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
    const foto = document.getElementById('fotoMembro').value.trim() || 'https://via.placeholder.com/80';
    const hierarquia = document.getElementById('hierarquia').value;
    const pai = parseInt(document.getElementById('selectPai').value) || null;
    const mae = parseInt(document.getElementById('selectMae').value) || null;
    const conjuge = parseInt(document.getElementById('selectConjuge').value) || null;
    const familia = document.getElementById('selectFamilia').value || 'bee';

    if (!nome) return alert('Nome obrigatório.');

    const duplicado = membros.find(m => m.nome.toLowerCase() === nome.toLowerCase() && m.sobrenome.toLowerCase() === sobrenome.toLowerCase());
    if (duplicado) return alert(`${nome} já está cadastrado na família ${duplicado.familia}.`);

    if (pai && mae && pai === mae) return alert('Pai e mãe não podem ser a mesma pessoa.');

    if (conjuge) {
        const c = membros.find(m => m.id === conjuge);
        if (c && (c.pai !== null || c.mae !== null)) return alert('Trava 1: cônjuge deve ser órfão.');
        if (c && c.filhos && c.filhos.length > 0) return alert('Trava 2: pessoa com filhos não pode casar com quem já tem família.');
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

    alert('Membro adicionado com sucesso!');
    document.getElementById('memberForm').reset();
    document.getElementById('memberForm').style.display = 'none';
    atualizarSelects();
    desenharArvore();
}

function criarCard(m) {
    const c = m.conjuge ? membros.find(x => x.id === m.conjuge) : null;
    return `<div class="member-card"><div class="photo-container"><img src="${m.foto}" alt="Foto"></div><div class="info"><h3>${m.nome} <span class="surname">${m.sobrenome}</span></h3><p class="status">${m.status} - Família: ${m.familia || 'Órfão'}</p><p>Pai: ${m.pai ? (membros.find(x => x.id === m.pai)?.nome || 'Desconhecido') : 'Nenhum'} | Mãe: ${m.mae ? (membros.find(x => x.id === m.mae)?.nome || 'Desconhecida') : 'Nenhuma'}</p><p>Cônjuge: ${c ? `${c.nome} ${c.sobrenome}` : 'Nenhum'}</p><p>Filhos: ${m.filhos.length}</p><button class="admin-only" style="display:none;" onclick="tornarOrfao(${m.id})">Reset (órfão)</button><button class="admin-only" style="display:none;color:red;" onclick="removerMembro(${m.id})">Excluir</button></div></div>`;
}

function desenharArvore(familiaFiltro = 'all') {
    const container = document.getElementById('treeContainer');
    container.innerHTML = '';
    let lista = familiaFiltro === 'all' ? membros.slice() : membros.filter(m => m.familia === familiaFiltro);
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

function filtrarFamilia(familia) {
    desenharArvore(familia);
}

function buscarMembro() {
    const query = document.getElementById('searchInput').value.toLowerCase().trim();
    const achados = membros.filter(m => (`${m.nome} ${m.sobrenome}`.toLowerCase()).includes(query));
    if (!achados.length) return alert('Não encontrado');
    alert(achados.map(m => `${m.nome} ${m.sobrenome} - ${m.familia || 'Órfão'}`).join('\n'));
}

window.onload = carregarMembros;
