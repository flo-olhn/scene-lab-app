# SceneLab

SceneLab est une plateforme SaaS permettant aux streamers et créateurs de contenu de concevoir, personnaliser et déployer des environnements virtuels professionnels sans compétences techniques avancées.

## Structure du projet

- `/frontend`: Application Next.js
- `/backend`: API NestJS
- `/docs`: Documentation

## Prérequis

- Node.js 18+
- Docker et Docker Compose
- Git

## Installation

1. Clonez ce dépôt
2. Installez les dépendances:
   ```
   cd frontend && npm install
   cd ../backend && npm install
   ```
3. Démarrez les services de développement:
   ```
   docker-compose up -d
   ```
4. Configurez les variables d'environnement:
   ```
   cp .env.example .env
   ```
5. Démarrez l'application:
   ```
   npm run dev
   ```

## Fonctionnalités principales

- Scene Templates
- Scene Mixer
- Scene Reactor
- Experiment Library

## Licence

Tous droits réservés
