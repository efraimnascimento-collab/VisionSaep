# SAEPVision 📸

## Sobre o projeto

O **SAEPVision** é uma plataforma web desenvolvida para compartilhar fotografias e conectar usuários e fotógrafos. A aplicação permite publicar imagens, visualizar publicações, curtir fotos e conhecer outros usuários.

## 👩‍💻 Desenvolvedora

- **Nome:** Efraim dos Santos Nascimento
- **Curso:** Técnico em Informática para Internet
- **Instituição:** SENAI

## 🎯 Objetivo

Desenvolver uma aplicação web que permita o compartilhamento de fotografias de maneira simples e organizada, utilizando tecnologias de desenvolvimento front-end e back-end.

## 🛠️ Tecnologias utilizadas

- HTML5
- CSS3
- JavaScript
- Node.js
- Express
- MySQL
- JSON Web Token (JWT)
- bcrypt
- Multer

## ⚙️ Funcionalidades do sistema

- Cadastro de usuários.
- Login e autenticação.
- Diferenciação entre usuários comuns e fotógrafos.
- Publicação de fotografias.
- Visualização das publicações.
- Curtidas nas fotografias.
- Pesquisa de usuários.
- Visualização de perfis.
- Exclusão das próprias publicações.

## 🗂️ Estrutura do projeto

```text
VisionSaep/
│
├── database/
│   └── saepvision.sql
│
├── backend/
│   ├── middleware/
│   │   └── auth.js
│   │
│   ├── routes/
│   │   ├── auth.js
│   │   ├── publicacoes.js
│   │   └── usuarios.js
│   │
│   ├── uploads/
│   ├── public/
│   │   ├── css/
│   │   │   └── style.css
│   │   ├── js/
│   │   │   └── app.js
│   │   └── index.html
│   │
│   ├── database.js
│   ├── server.js
│   ├── package.json
│   └── .env
│
└── README.md
```

## 🗄️ Banco de dados

O projeto utiliza o MySQL com o banco de dados `saepvision`, composto pelas seguintes tabelas:

- `usuarios`: armazena os dados dos usuários.
- `publicacoes`: armazena as fotografias publicadas.
- `curtidas`: registra as curtidas realizadas nas publicações.

## 🚀 Como executar o projeto

### 1. Instalar as dependências