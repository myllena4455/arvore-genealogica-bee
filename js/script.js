const SENHA_MESTRA = "bee123";
const SUPABASE_URL = "https://ltcvsdhcrlwbvzbezcwm.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_VV2VV93_3Srsyh0GfBG41A_EzLzckYa";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Cloudinary config
const CLOUDINARY_CLOUD_NAME = "atelier-do-gandolf";
const CLOUDINARY_UPLOAD_PRESET = "arvore_genealogica"; // Crie isso no painel Cloudinary

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
        atualizarSelects();
        renderFamilyNav();
        desenharArvore();
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

function animateBee() {
    const bee = document.getElementById('beeIcon');
    const hive = document.getElementById('hive');
    const trailContainer = document.querySelector('.trail');

    // Pegar posição da colmeia
    const hiveRect = hive.getBoundingClientRect();
    const splashRect = document.getElementById('splashScreen').getBoundingClientRect();
    const potPos = {
        x: hiveRect.left - splashRect.left - splashRect.width / 2,
        y: hiveRect.top - splashRect.top - splashRect.height / 2
    };

    // Pegar posição do último "e" de "Bee"
    const lastE = document.querySelector('#beeText span:nth-child(3)'); // Segundo "e" de "Bee"
    const lastERect = lastE.getBoundingClientRect();
    const endPos = {
        x: lastERect.left - splashRect.left - splashRect.width / 2 + lastERect.width / 2,
        y: lastERect.top - splashRect.top - splashRect.height / 2 + lastERect.height / 2
    };

    // Setar posição inicial da abelha na colmeia
    bee.style.left = `${splashRect.width / 2 + potPos.x}px`;
    bee.style.top = `${splashRect.height / 2 + potPos.y}px`;
    bee.style.transform = 'translate(-50%, -50%) rotate(0deg)';

    const trailPoints = [];
    let t = 0; // Tempo da animação (0 a 1)

    function draw() {
        // Definir a curva (Caminho da abelha)
        // Ponto inicial: Colmeia | Pontos de controle: Curva no ar | Ponto final: Último "e" de "Bee"
        const startX = potPos.x;
        const startY = potPos.y;
        const cp1X = -100, cp1Y = -200;   // Curva para cima e esquerda
        const cp2X = endPos.x - 50, cp2Y = endPos.y - 50;  // Ajustar para chegar ao final
        const endX = endPos.x;
        const endY = endPos.y;

        // Cálculo da posição atual (Curva de Bézier Cúbica)
        const x = Math.pow(1-t, 3) * startX + 3 * Math.pow(1-t, 2) * t * cp1X + 3 * (1-t) * Math.pow(t, 2) * cp2X + Math.pow(t, 3) * endX;
        const y = Math.pow(1-t, 3) * startY + 3 * Math.pow(1-t, 2) * t * cp1Y + 3 * (1-t) * Math.pow(t, 2) * cp2Y + Math.pow(t, 3) * endY;

        // Calcular direção (derivada para rotação)
        const dx = 3 * Math.pow(1-t, 2) * (cp1X - startX) + 6 * (1-t) * t * (cp2X - cp1X) + 3 * Math.pow(t, 2) * (endX - cp2X);
        const dy = 3 * Math.pow(1-t, 2) * (cp1Y - startY) + 6 * (1-t) * t * (cp2Y - cp1Y) + 3 * Math.pow(t, 2) * (endY - cp2Y);
        const angle = Math.atan2(dy, dx) * (180 / Math.PI); // Ângulo em graus

        // Guardar rastro
        if (t < 1 && trailPoints.length < 50) { // Limitar pontos
            trailPoints.push({x, y});
            const dot = document.createElement('div');
            dot.className = 'dot';
            dot.style.left = `${splashRect.width / 2 + x}px`;
            dot.style.top = `${splashRect.height / 2 + y}px`;
            trailContainer.appendChild(dot);
        }

        // Posicionar abelha com rotação
        bee.style.left = `${splashRect.width / 2 + x}px`;
        bee.style.top = `${splashRect.height / 2 + y}px`;
        bee.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
        bee.style.opacity = t > 0.05 ? 1 : 0;

        // Incrementar animação
        if (t < 1) {
            t += 0.003; // Velocidade da abelha (mais lenta para ver o caminho)
            requestAnimationFrame(draw);
        } else {
            // Pouso: animar suavemente para baixo
            bee.style.transition = 'transform 1s ease-out';
            bee.style.transform = `translate(-50%, -50%) rotate(0deg) scale(0.8)`;
        }
    }

    setTimeout(() => requestAnimationFrame(draw), 1000); // Iniciar após 1s
}

function renderFamilyNav() {
    const container = document.getElementById('familyNav');
    let html = '<button class="btn-family" onclick="filtrarFamilia(\'all\')">Todas as Famílias</button>';
    html += '<button class="btn-family" onclick="filtrarFamilia(\'all\')">Página Inicial</button>';
    html += '<button class="btn-admin-link" onclick="toggleAdminPanel()">Acesso Restrito</button>';
    if (document.querySelector('#managementSection').style.display === 'block') {
        const adminClass = isAdmin ? ' admin-only active' : ' admin-only';
        html += `<button id="btnNovaFamilia" class="btn-family${adminClass}" onclick="novaFamilia()">Nova Família +</button>`;
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
    const input = document.getElementById('familyNameInput');
    const nome = input ? input.value.trim() : '';

    if (!nome) {
        return showMessage('Digite o nome da nova família no campo acima.', "error");
    }

    const lower = nome.toLowerCase();
    if (familias.includes(lower)) {
        return showMessage('Família já existe.', "error");
    }

    familias.push(lower);
    if (input) input.value = '';
    showMessage(`Família ${nome} criada!`, "success");
    renderFamilyNav();
    atualizarSelects();
    desenharArvore();
}

function adicionarFamiliaFromInput() {
    novaFamilia();
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
        const { data, error } = await supabaseClient.from('membros').select('id,nome,sobrenome,foto_url,status,familia,pai_id,mae_id,conjuge_id').order('id', { ascending: true });
        if (!error && data && data.length) {
            membros = data.map(item => ({
                id: item.id,
                nome: item.nome,
                sobrenome: item.sobrenome,
                foto: item.foto_url || '',
                status: item.status,
                familia: item.familia,
                pai: item.pai_id || null,
                mae: item.mae_id || null,
                conjuge: item.conjuge_id || null,
                filhos: []
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

    // Durante o desenvolvimento, a tabela pode não ter todas as colunas ainda (ex: conjuge/pai/mae).
    const supaData = {
        id: membro.id,
        nome: membro.nome,
        sobrenome: membro.sobrenome,
        foto_url: membro.foto || '',
        status: membro.status,
        familia: membro.familia
    };

    if (membro.pai !== null && membro.pai !== undefined) supaData.pai_id = membro.pai;
    if (membro.mae !== null && membro.mae !== undefined) supaData.mae_id = membro.mae;
    if (membro.conjuge !== null && membro.conjuge !== undefined) supaData.conjuge_id = membro.conjuge;

    let { error } = await supabaseClient.from('membros').upsert(supaData, { onConflict: 'id' });

    if (error && error.code === 'PGRST204' && error.message && error.message.includes('conjuge')) {
        // Se não existe coluna conjuge, re-tentar sem esse campo
        delete supaData.conjuge;
        const retry = await supabaseClient.from('membros').upsert(supaData, { onConflict: 'id' });
        error = retry.error;
    }

    if (error) {
        console.error('Supabase save error', error);
        showMessage('Erro ao salvar no Supabase: ' + error.message, 'error');
    }
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

    let foto = '';
    if (arquivoFoto) {
        try {
            // Upload para Cloudinary
            const formData = new FormData();
            formData.append('file', arquivoFoto);
            formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
            
            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
                { method: 'POST', body: formData }
            );
            
            if (!response.ok) {
                throw new Error(`Upload falhou: ${response.statusText}`);
            }
            
            const data = await response.json();
            foto = data.secure_url; // URL segura da imagem no Cloudinary
            showMessage('Foto enviada com sucesso!', 'success');
        } catch (err) {
            console.error('Erro ao fazer upload da foto:', err);
            showMessage('Erro ao fazer upload da foto. Membro será cadastrado sem foto.', 'warning');
            foto = '';
        }
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
    const placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="150" height="150"%3E%3Crect width="150" height="150" fill="%23ffd1dc"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-size="14" fill="%23663"%3ESem Foto%3C/text%3E%3C/svg%3E';
    const errorPlaceholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="150" height="150"%3E%3Crect width="150" height="150" fill="%23ffb7c5"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-size="14" fill="%23422"%3EImagem Inválida%3C/text%3E%3C/svg%3E';
    const fotoUrl = m.foto && m.foto.trim() ? m.foto.trim() : placeholder;
    const adminButtons = isAdmin ? `<button class="admin-only active" onclick="editarMembro(${m.id})">Editar</button><button class="admin-only active" onclick="tornarOrfao(${m.id})">Reset (órfão)</button><button class="admin-only active" style="color:red;" onclick="removerMembro(${m.id})">Excluir</button>` : '';
    return `<div class="member-card"><div class="photo-container"><img src="${fotoUrl}" alt="Foto de ${m.nome} ${m.sobrenome}" onerror="this.src='${errorPlaceholder}';"></div><div class="info"><h3>${m.nome} <span class="surname">${m.sobrenome}</span></h3><p class="status">${m.status} - Família: ${m.familia || 'Órfão'}</p><p>Pai: ${m.pai ? (membros.find(x => x.id === m.pai)?.nome || 'Desconhecido') : 'Nenhum'} | Mãe: ${m.mae ? (membros.find(x => x.id === m.mae)?.nome || 'Desconhecida') : 'Nenhuma'}</p><p>Cônjuge: ${c ? `${c.nome} ${c.sobrenome}` : 'Nenhum'}</p><p>Filhos: ${m.filhos.length}</p>${adminButtons}</div></div>`;
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

    // Guardar o ID do membro sendo editado
    window.membroEmEdicao = id;

    // Preencher modal com dados atuais
    document.getElementById('editNome').value = membro.nome;
    document.getElementById('editSobrenome').value = membro.sobrenome;
    document.getElementById('editFoto').value = membro.foto;

    // Abrir modal
    document.getElementById('editModal').style.display = 'block';
    document.getElementById('editNome').focus();
}

function fecharEditModal() {
    document.getElementById('editModal').style.display = 'none';
    window.membroEmEdicao = null;
}

async function salvarEdicaoMembro() {
    const id = window.membroEmEdicao;
    if (!id) return;

    const membro = membros.find(m => m.id === id);
    if (!membro) return showMessage('Membro não encontrado.', "error");

    const novoNome = document.getElementById('editNome').value.trim();
    const novoSobrenome = document.getElementById('editSobrenome').value.trim();
    const arquivoFoto = document.getElementById('editFoto').files[0] || null;

    if (!novoNome) return showMessage('Nome não pode estar vazio.', "error");

    let novaFoto = membro.foto; // Manter foto atual se não houver novo upload

    if (arquivoFoto) {
        try {
            // Upload para Cloudinary
            const formData = new FormData();
            formData.append('file', arquivoFoto);
            formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
            
            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
                { method: 'POST', body: formData }
            );
            
            if (!response.ok) {
                throw new Error(`Upload falhou: ${response.statusText}`);
            }
            
            const data = await response.json();
            novaFoto = data.secure_url;
            showMessage('Foto enviada com sucesso!', 'success');
        } catch (err) {
            console.error('Erro ao fazer upload da foto:', err);
            showMessage('Erro ao fazer upload da foto. Membro será salvo com foto anterior.', 'warning');
        }
    }

    membro.nome = novoNome;
    membro.sobrenome = novoSobrenome;
    membro.foto = novaFoto;

    await salvarMembroSupabase(membro);
    showMessage('Membro atualizado com sucesso!', "success");
    fecharEditModal();
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

window.onload = function() {
    // Mostrar splash screen por 4 segundos
    setTimeout(() => {
        document.getElementById('splashScreen').classList.add('fadeOut');
        setTimeout(() => {
            document.getElementById('splashScreen').style.display = 'none';
            document.getElementById('mainContent').style.display = 'block';
            carregarMembros(); // Carregar o conteúdo após a splash
        }, 1000); // Tempo do fade out
    }, 4000); // Tempo total da splash

    // Iniciar animação da abelha com JS
    animateBee();
};
