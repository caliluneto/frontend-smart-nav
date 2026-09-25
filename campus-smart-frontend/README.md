# 🗺️ Campus Smart Navigation — Frontend (UNAERP)

Frontend moderno, responsivo e focado em acessibilidade para navegação inteligente no campus da UNAERP.

---

## 🚀 Tecnologias

- **React 18** + **Vite**
- **TailwindCSS** (identidade visual UNAERP e modos de alto contraste)
- **Leaflet** + **React-Leaflet** (mapa interativo com polígonos e rotas)
- **Lucide React** (ícones)

---

## ♿ Recursos de Acessibilidade

- **Rotas Acessíveis:** Opções para cadeirantes, rotas sem escadas e com elevadores.
- **Modos Visuais:** Alto contraste e texto ampliado com apenas 1 clique.
- **Design Adaptativo:** Mobile-first com áreas de toque generosas para dispositivos móveis.

---

## 🛠️ Como Executar Localmente

### Pré-requisitos
- Node.js 18+ instalado
- Backend rodando em `http://localhost:3000/api`

### Instalação e Execução
```bash
# Instalar dependências
npm install

# Rodar servidor de desenvolvimento
npm run dev

# Gerar build de produção
npm run build
```

---

## ⚙️ Variáveis de Ambiente

Crie um arquivo `.env` na raiz do frontend:

```env
VITE_API_URL=http://localhost:3000/api
```
