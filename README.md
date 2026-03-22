# Noumbi Joël – INF222 Backend Project

API backend moderne pour la gestion d’un blog simple, réalisée dans le cadre du cours **INF222 – EC1 (Développement Backend)**.

Ce projet permet de créer, consulter, modifier, supprimer et rechercher des articles de blog, avec **image de couverture**, **documentation Swagger** et **interface web moderne**.

---

## Aperçu du projet

L’application met en œuvre une architecture backend claire avec :

- **Node.js**
- **Express**
- **SQLite**
- **Swagger**
- **HTML / CSS / JavaScript** pour l’interface web
- **Multer** pour l’upload d’images de couverture

Chaque article possède les informations suivantes :

- `titre`
- `contenu`
- `auteur`
- `date`
- `categorie`
- `tags`
- `image` *(ajout fonctionnel supplémentaire)*

---

## Fonctionnalités principales

### API Backend
- Créer un article
- Lire tous les articles
- Lire un article par son ID
- Modifier un article
- Supprimer un article
- Rechercher un article par mot-clé
- Filtrer les articles par catégorie, auteur ou date
- Upload d’image de couverture

### Interface Web
- Tableau de bord moderne en mode sombre
- Formulaire de création / modification
- Aperçu de l’image de couverture
- Recherche et filtres
- Tri par date
- Pagination
- Lecture complète d’un article dans une fenêtre modale
- Notifications toast élégantes
- Design éditorial moderne

### Documentation
- Documentation API avec Swagger UI
- Tests des routes directement depuis le navigateur

---

## Structure du projet

```bash
blog-api/
├── config/
│   ├── db.js
│   └── upload.js
├── controllers/
│   └── articleController.js
├── database/
├── docs/
│   └── swagger.js
├── models/
│   └── articleModel.js
├── public/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── routes/
│   └── articleRoutes.js
├── uploads/
├── app.js
├── package.json
├── package-lock.json
└── README.md
