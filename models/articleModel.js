const db = require('../config/db');

const ArticleModel = {
  createArticle: ({ titre, contenu, auteur, date, categorie, tags, image }, callback) => {
    const sql = `
      INSERT INTO articles (titre, contenu, auteur, date, categorie, tags, image)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    db.run(sql, [titre, contenu, auteur, date, categorie, tags, image], function (err) {
      if (err) return callback(err);
      callback(null, {
        id: this.lastID,
        titre,
        contenu,
        auteur,
        date,
        categorie,
        tags,
        image
      });
    });
  },

  getAllArticles: ({ categorie, auteur, date }, callback) => {
    let sql = `SELECT * FROM articles WHERE 1=1`;
    const params = [];

    if (categorie) {
      sql += ` AND categorie = ?`;
      params.push(categorie);
    }

    if (auteur) {
      sql += ` AND auteur = ?`;
      params.push(auteur);
    }

    if (date) {
      sql += ` AND date = ?`;
      params.push(date);
    }

    sql += ` ORDER BY id DESC`;

    db.all(sql, params, (err, rows) => {
      if (err) return callback(err);
      callback(null, rows);
    });
  },

  getArticleById: (id, callback) => {
    db.get(`SELECT * FROM articles WHERE id = ?`, [id], (err, row) => {
      if (err) return callback(err);
      callback(null, row);
    });
  },

  updateArticle: (id, { titre, contenu, categorie, tags, image }, callback) => {
    let sql;
    let params;

    if (image) {
      sql = `
        UPDATE articles
        SET titre = ?, contenu = ?, categorie = ?, tags = ?, image = ?
        WHERE id = ?
      `;
      params = [titre, contenu, categorie, tags, image, id];
    } else {
      sql = `
        UPDATE articles
        SET titre = ?, contenu = ?, categorie = ?, tags = ?
        WHERE id = ?
      `;
      params = [titre, contenu, categorie, tags, id];
    }

    db.run(sql, params, function (err) {
      if (err) return callback(err);
      callback(null, this.changes);
    });
  },

  deleteArticle: (id, callback) => {
    db.run(`DELETE FROM articles WHERE id = ?`, [id], function (err) {
      if (err) return callback(err);
      callback(null, this.changes);
    });
  },

  searchArticles: (query, callback) => {
    const sql = `
      SELECT * FROM articles
      WHERE titre LIKE ? OR contenu LIKE ?
      ORDER BY id DESC
    `;
    const search = `%${query}%`;
    db.all(sql, [search, search], (err, rows) => {
      if (err) return callback(err);
      callback(null, rows);
    });
  }
};

module.exports = ArticleModel;