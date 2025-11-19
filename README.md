# Samambaia Bar - Cardápio Digital

Aplicação de cardápio digital moderna e responsiva para o Samambaia Bar, desenvolvida com Django e otimizada para navegação mobile.

## Funcionalidades

- **Design Responsivo**: Otimizado para dispositivos móveis com navegação suave
- **Navegação por Categorias**: Menu horizontal com categorias de fácil acesso
- **Galeria de Imagens**: Itens do cardápio com imagens de alta qualidade
- **Cabeçalho Fixo**: Navegação fixa para fácil acesso durante a rolagem
- **Pronto para Produção**: Configurado com suporte SSL via HTTPS Portal
- **Gerenciamento de Arquivos Estáticos**: Integrado com WhiteNoise para servir arquivos estáticos de forma eficiente

## Stack Tecnológica

- **Backend**: Django 5.2.4
- **Server**: Gunicorn
- **Static Files**: WhiteNoise
- **Database**: SQLite (development)
- **Containerization**: Docker & Docker Compose
- **SSL/HTTPS**: HTTPS Portal
- **Package Manager**: UV (Astral)

## Pré-requisitos

- Docker and Docker Compose installed
- Environment variables configured (see `.env.example`)

## Como Começar

### Configuração para Desenvolvimento

1. Clone the repository:
```bash
git clone https://github.com/yourusername/samambaia-bar.git
cd samambaia-bar
```

2. Create a `.env` file with required environment variables:
```env
SECRET_KEY=your-secret-key-here
DEBUG=True
```

3. Run the development server:
```bash
docker-compose --profile dev up
```

A aplicação estará disponível em `http://localhost:8000`

### Deploy em Produção

1. Update your `.env` file for production:
```env
SECRET_KEY=your-production-secret-key
DEBUG=False
```

2. Start the production services:
```bash
docker-compose --profile prod up -d
```

A aplicação estará disponível em:
- `https://samambaiabar.com.br`
- `https://www.samambaiabar.com.br`

## Estrutura do Projeto

```
.
├── core/                  # Configurações do projeto Django
│   ├── settings.py       # Arquivo principal de configuração
│   ├── urls.py
│   └── wsgi.py
├── menuapp/              # Aplicação principal
│   ├── static/          # CSS, JS e imagens
│   ├── templates/       # Templates HTML
│   └── models.py        # Modelos do banco de dados
├── static/              # Arquivos estáticos coletados
├── media/               # Arquivos enviados por usuários
├── Dockerfile           # Configuração do Docker
├── docker-compose.yml   # Configuração do Docker Compose
├── requirements.txt     # Dependências Python
└── manage.py           # Script de gerenciamento do Django
```

## Personalização

### Adicionar Itens ao Cardápio

Os itens do cardápio podem ser adicionados através do painel administrativo do Django em `/admin/`

### Estilização

Os estilos principais estão localizados em:
- `menuapp/static/style.css`
- Scripts personalizados em `menuapp/static/script.js`

### Categorias

A navegação utiliza rolagem suave com offset customizável para o cabeçalho fixo.

## Configurações Principais

### Arquivos Estáticos

Os arquivos estáticos são gerenciados pelo WhiteNoise com compressão:
```python
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
```

### Segurança

- Origens CSRF confiáveis configuradas para os domínios de produção
- Cabeçalho SSL de proxy seguro para HTTPS
- Gerenciamento de chave secreta via variáveis de ambiente

## Comandos Disponíveis

### Desenvolvimento
```bash
# Executar migrações
docker-compose --profile dev run web python manage.py migrate

# Criar superusuário
docker-compose --profile dev run web python manage.py createsuperuser

# Coletar arquivos estáticos
docker-compose --profile dev run web python manage.py collectstatic
```

### Produção
```bash
# Ver logs
docker-compose --profile prod logs -f

# Reiniciar serviços
docker-compose --profile prod restart
```

## Certificado SSL

A configuração de produção utiliza HTTPS Portal para gerenciamento automático de certificados SSL via Let's Encrypt. Os certificados são renovados automaticamente.

---

Desenvolvido para o Samambaia Bar e lanches
