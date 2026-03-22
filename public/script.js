const API_URL = '/api/articles';
const ITEMS_PER_PAGE = 6;

const articleForm = document.getElementById('articleForm');
const articleIdInput = document.getElementById('articleId');
const titreInput = document.getElementById('titre');
const contenuInput = document.getElementById('contenu');
const auteurInput = document.getElementById('auteur');
const dateInput = document.getElementById('date');
const categorieInput = document.getElementById('categorie');
const tagsInput = document.getElementById('tags');
const imageInput = document.getElementById('image');
const coverPreview = document.getElementById('coverPreview');

const searchQueryInput = document.getElementById('searchQuery');
const filterCategorieInput = document.getElementById('filterCategorie');
const filterAuteurInput = document.getElementById('filterAuteur');
const filterDateInput = document.getElementById('filterDate');
const sortDateSelect = document.getElementById('sortDate');

const searchBtn = document.getElementById('searchBtn');
const filterBtn = document.getElementById('filterBtn');
const resetBtn = document.getElementById('resetBtn');
const resetBtnTop = document.getElementById('resetBtnTop');
const cancelEditBtn = document.getElementById('cancelEdit');

const articlesContainer = document.getElementById('articlesContainer');
const articleCount = document.getElementById('articleCount');

const statTotal = document.getElementById('statTotal');
const statCategories = document.getElementById('statCategories');
const statAuthors = document.getElementById('statAuthors');

const toastContainer = document.getElementById('toastContainer');

const articleModal = document.getElementById('articleModal');
const modalOverlay = document.getElementById('modalOverlay');
const closeModalBtn = document.getElementById('closeModalBtn');
const modalBody = document.getElementById('modalBody');

const prevPageBtn = document.getElementById('prevPageBtn');
const nextPageBtn = document.getElementById('nextPageBtn');
const pageIndicator = document.getElementById('pageIndicator');

let allArticles = [];
let filteredArticles = [];
let currentPage = 1;

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    toast.style.transition = '0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function resetForm() {
  articleForm.reset();
  articleIdInput.value = '';
  coverPreview.src = '';
  coverPreview.classList.add('hidden');
}

function formatTags(tags) {
  if (!tags) return [];
  return tags.split(',').map(tag => tag.trim()).filter(Boolean);
}

function truncateText(text, maxLength = 120) {
  if (!text) return '';
  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
}

function sortArticlesByDate(articles, order = 'desc') {
  return [...articles].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return order === 'asc' ? dateA - dateB : dateB - dateA;
  });
}

function updateStats(articles) {
  statTotal.textContent = articles.length;
  statCategories.textContent = new Set(articles.map(a => a.categorie).filter(Boolean)).size;
  statAuthors.textContent = new Set(articles.map(a => a.auteur).filter(Boolean)).size;
}

function paginateArticles(articles, page) {
  const start = (page - 1) * ITEMS_PER_PAGE;
  return articles.slice(start, start + ITEMS_PER_PAGE);
}

function updatePaginationControls(totalItems) {
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  if (currentPage > totalPages) currentPage = totalPages;

  pageIndicator.textContent = `Page ${currentPage} / ${totalPages}`;
  prevPageBtn.disabled = currentPage === 1;
  nextPageBtn.disabled = currentPage === totalPages;
}

function renderArticles(articles) {
  filteredArticles = sortArticlesByDate(articles, sortDateSelect.value);
  updateStats(filteredArticles);
  articleCount.textContent = `${filteredArticles.length} article(s)`;

  updatePaginationControls(filteredArticles.length);
  const pageItems = paginateArticles(filteredArticles, currentPage);

  if (!pageItems.length) {
    articlesContainer.innerHTML = `
      <div class="empty-state">
        <h3>Aucun article trouvé</h3>
        <p>Ajoute un article ou modifie les critères de recherche.</p>
      </div>
    `;
    return;
  }

  articlesContainer.innerHTML = pageItems.map(article => `
    <article class="article-card" onclick="openArticleModal(${article.id})">
      <img class="article-cover" src="${article.image}" alt="${article.titre}">
      <div class="article-body">
        <div class="article-category-row">
          <span class="article-category">${article.categorie}</span>
          <span class="article-date-badge">${article.date}</span>
        </div>

        <h3 class="article-title">${article.titre}</h3>

        <div class="article-meta">
          <span><strong>Auteur :</strong> ${article.auteur}</span>
          <span><strong>ID :</strong> ${article.id}</span>
        </div>

        <p class="article-content">${truncateText(article.contenu)}</p>

        <div class="tags">
          ${formatTags(article.tags).map(tag => `<span class="tag">#${tag}</span>`).join('')}
        </div>

        <div class="article-actions" onclick="event.stopPropagation()">
          <button class="btn-read" onclick="openArticleModal(${article.id})">Lire</button>
          <button class="btn-edit" onclick="editArticle(${article.id})">Modifier</button>
          <button class="btn-delete" onclick="deleteArticle(${article.id})">Supprimer</button>
        </div>
      </div>
    </article>
  `).join('');
}

function openModal(article) {
  modalBody.innerHTML = `
    <img class="modal-article-cover" src="${article.image}" alt="${article.titre}">
    <div class="modal-body-inner">
      <span class="modal-category">${article.categorie}</span>
      <h2 class="modal-title">${article.titre}</h2>

      <div class="modal-meta">
        <span><strong>Auteur :</strong> ${article.auteur}</span>
        <span><strong>Date :</strong> ${article.date}</span>
        <span><strong>ID :</strong> ${article.id}</span>
      </div>

      <div class="tags" style="margin-bottom:18px;">
        ${formatTags(article.tags).map(tag => `<span class="tag">#${tag}</span>`).join('')}
      </div>

      <div class="modal-content-text">${article.contenu}</div>
    </div>
  `;

  articleModal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  articleModal.classList.add('hidden');
  document.body.style.overflow = '';
}

async function openArticleModal(id) {
  try {
    const response = await fetch(`${API_URL}/${id}`);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Impossible d’ouvrir cet article.');
    }

    openModal(result.data);
  } catch (error) {
    showToast(error.message, 'error');
  }
}

async function fetchArticles(url = API_URL) {
  try {
    const response = await fetch(url);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Erreur lors du chargement des articles.');
    }

    allArticles = result.data || [];
    renderArticles(allArticles);
  } catch (error) {
    showToast(error.message, 'error');
  }
}

articleForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const id = articleIdInput.value.trim();
  const formData = new FormData();

  formData.append('titre', titreInput.value.trim());
  formData.append('contenu', contenuInput.value.trim());
  formData.append('auteur', auteurInput.value.trim());
  formData.append('date', dateInput.value);
  formData.append('categorie', categorieInput.value.trim());
  formData.append('tags', tagsInput.value.trim());

  if (imageInput.files[0]) {
    formData.append('image', imageInput.files[0]);
  }

  if (!id && !imageInput.files[0]) {
    showToast('L’image de couverture est obligatoire pour créer un article.', 'error');
    return;
  }

  try {
    const response = await fetch(id ? `${API_URL}/${id}` : API_URL, {
      method: id ? 'PUT' : 'POST',
      body: formData
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Erreur lors de l’enregistrement.');
    }

    showToast(result.message || 'Opération réussie.', 'success');
    resetForm();
    currentPage = 1;
    fetchArticles();
  } catch (error) {
    showToast(error.message, 'error');
  }
});

async function editArticle(id) {
  try {
    const response = await fetch(`${API_URL}/${id}`);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Article introuvable.');
    }

    const article = result.data;

    articleIdInput.value = article.id;
    titreInput.value = article.titre;
    contenuInput.value = article.contenu;
    auteurInput.value = article.auteur;
    dateInput.value = article.date;
    categorieInput.value = article.categorie;
    tagsInput.value = article.tags || '';

    if (article.image) {
      coverPreview.src = article.image;
      coverPreview.classList.remove('hidden');
    } else {
      coverPreview.classList.add('hidden');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast('Mode modification activé.', 'info');
  } catch (error) {
    showToast(error.message, 'error');
  }
}

async function deleteArticle(id) {
  const confirmation = confirm('Voulez-vous vraiment supprimer cet article ?');
  if (!confirmation) return;

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE'
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Erreur lors de la suppression.');
    }

    showToast(result.message || 'Article supprimé.', 'success');
    fetchArticles();
  } catch (error) {
    showToast(error.message, 'error');
  }
}

function applyFiltersLocally() {
  let result = [...allArticles];

  const query = searchQueryInput.value.trim().toLowerCase();
  const categorie = filterCategorieInput.value.trim().toLowerCase();
  const auteur = filterAuteurInput.value.trim().toLowerCase();
  const date = filterDateInput.value;

  if (query) {
    result = result.filter(article =>
      article.titre.toLowerCase().includes(query) ||
      article.contenu.toLowerCase().includes(query)
    );
  }

  if (categorie) {
    result = result.filter(article =>
      article.categorie && article.categorie.toLowerCase().includes(categorie)
    );
  }

  if (auteur) {
    result = result.filter(article =>
      article.auteur && article.auteur.toLowerCase().includes(auteur)
    );
  }

  if (date) {
    result = result.filter(article => article.date === date);
  }

  currentPage = 1;
  renderArticles(result);
}

function resetEverything() {
  searchQueryInput.value = '';
  filterCategorieInput.value = '';
  filterAuteurInput.value = '';
  filterDateInput.value = '';
  sortDateSelect.value = 'desc';
  resetForm();
  currentPage = 1;
  renderArticles(allArticles);
}

searchBtn.addEventListener('click', (e) => {
  e.preventDefault();
  applyFiltersLocally();
});

filterBtn.addEventListener('click', (e) => {
  e.preventDefault();
  applyFiltersLocally();
});

resetBtn.addEventListener('click', (e) => {
  e.preventDefault();
  resetEverything();
});

resetBtnTop.addEventListener('click', () => {
  resetEverything();
});

cancelEditBtn.addEventListener('click', () => {
  resetForm();
  showToast('Modification annulée.', 'info');
});

sortDateSelect.addEventListener('change', () => {
  currentPage = 1;
  applyFiltersLocally();
});

imageInput.addEventListener('change', () => {
  const file = imageInput.files[0];
  if (!file) {
    coverPreview.src = '';
    coverPreview.classList.add('hidden');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    coverPreview.src = e.target.result;
    coverPreview.classList.remove('hidden');
  };
  reader.readAsDataURL(file);
});

prevPageBtn.addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    renderArticles(filteredArticles);
    window.scrollTo({ top: document.body.scrollHeight / 2, behavior: 'smooth' });
  }
});

nextPageBtn.addEventListener('click', () => {
  const totalPages = Math.max(1, Math.ceil(filteredArticles.length / ITEMS_PER_PAGE));
  if (currentPage < totalPages) {
    currentPage++;
    renderArticles(filteredArticles);
    window.scrollTo({ top: document.body.scrollHeight / 2, behavior: 'smooth' });
  }
});

closeModalBtn.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', closeModal);

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !articleModal.classList.contains('hidden')) {
    closeModal();
  }
});

fetchArticles();

window.editArticle = editArticle;
window.deleteArticle = deleteArticle;
window.openArticleModal = openArticleModal;