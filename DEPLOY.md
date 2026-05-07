# House Bee - RPG de Árvore Genealógica

### Configuração para Deploy (Render)

1. **Service Type:** Web Service
2. **Runtime:** Node
3. **Build Command:** `npm install`
4. **Start Command:** `node server.js`

### Variáveis de Ambiente (Environment Variables no Render)

| Key | Value |
|---|---|
| `SENHA_MESTRA` | bee123 |
| `CLOUDINARY_CLOUD_NAME` | atelier-do-gandolf |
| `FIREBASE_SERVICE_ACCOUNT` | (Cole aqui o conteúdo do arquivo JSON da sua 'Service Account' do Firebase) |

---
*Este projeto agora utiliza **Firebase Realtime Database** para dados e **Cloudinary** para imagens.*
