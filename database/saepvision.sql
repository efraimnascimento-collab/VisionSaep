CREATE DATABASE IF NOT EXISTS saepvision
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE saepvision;

CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  usuario VARCHAR(40) NOT NULL UNIQUE,
  email VARCHAR(160) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL,
  tipo ENUM('comum','fotografo') NOT NULL DEFAULT 'comum',
  foto_perfil VARCHAR(500) DEFAULT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS publicacoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  titulo VARCHAR(160) NOT NULL,
  local VARCHAR(160) NOT NULL,
  imagem VARCHAR(500) NOT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_publicacao_usuario FOREIGN KEY (usuario_id)
    REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS curtidas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  publicacao_id INT NOT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_usuario_publicacao (usuario_id, publicacao_id),
  CONSTRAINT fk_curtida_usuario FOREIGN KEY (usuario_id)
    REFERENCES usuarios(id) ON DELETE CASCADE,
  CONSTRAINT fk_curtida_publicacao FOREIGN KEY (publicacao_id)
    REFERENCES publicacoes(id) ON DELETE CASCADE
) ENGINE=InnoDB;
