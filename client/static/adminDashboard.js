// adminDashboard.js
document.addEventListener('DOMContentLoaded', () => {
  // Verificar autenticação
  checkAuth();

  // Elementos do DOM
  const addCategoryBtn = document.getElementById('addCategoryBtn');
  const categoryModal = document.getElementById('categoryModal');
  const categoryForm = document.getElementById('categoryForm');
  const cancelCategoryBtn = document.getElementById('cancelCategoryBtn');
  const modalCloseButtons = document.querySelectorAll('.modal-close');
  const logoutBtn = document.getElementById('logoutBtn');

  // Event Listeners
  addCategoryBtn.addEventListener('click', openCategoryModal);
  cancelCategoryBtn.addEventListener('click', closeCategoryModal);
  categoryForm.addEventListener('submit', handleCategorySubmit);
  logoutBtn.addEventListener('click', handleLogout);

  // Fechar modal ao clicar no X
  modalCloseButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      closeCategoryModal();
      closeProductModal();
    });
  });

  // Fechar modal ao clicar fora dele
  categoryModal.addEventListener('click', (e) => {
    if (e.target === categoryModal) {
      closeCategoryModal();
    }
  });

  // Carregar categorias ao iniciar
  loadCategories();

  // ==================== FUNÇÕES DE AUTENTICAÇÃO ====================
  function checkAuth() {
    const token = localStorage.getItem('authToken');
    if (!token) {
      window.location.href = '/admin/login';
      return;
    }

    // Validar token com o servidor
    validateToken(token);
  }

  async function validateToken(token) {
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Token inválido');
      }

      const data = await response.json();
      // Atualizar dados do admin se necessário
      localStorage.setItem('adminUser', JSON.stringify(data.admin));
    } catch (error) {
      console.error('Erro ao validar token:', error);
      localStorage.removeItem('authToken');
      localStorage.removeItem('adminUser');
      window.location.href = '/admin/login';
    }
  }

  function handleLogout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('adminUser');
    window.location.href = '/admin/login';
  }

  // ==================== FUNÇÕES DO MODAL ====================
  function openCategoryModal() {
    categoryModal.classList.add('active');
    document.getElementById('categoryName').focus();
  }

  function closeCategoryModal() {
    categoryModal.classList.remove('active');
    categoryForm.reset();
  }

  function closeProductModal() {
    const productModal = document.getElementById('productModal');
    productModal.classList.remove('active');
  }

  // ==================== FUNÇÕES DE CATEGORIA ====================
  async function handleCategorySubmit(e) {
    e.preventDefault();

    const categoryName = document.getElementById('categoryName').value.trim();

    if (!categoryName) {
      showNotification('Por favor, insira um nome para a categoria', 'error');
      return;
    }

    const submitButton = categoryForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = 'Salvando...';

    try {
      const token = localStorage.getItem('authToken');

      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: categoryName
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar categoria');
      }

      // Sucesso
      showNotification('Categoria criada com sucesso!', 'success');
      closeCategoryModal();
      loadCategories(); // Recarregar lista de categorias

    } catch (error) {
      showNotification(error.message || 'Erro ao criar categoria', 'error');
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = 'Salvar';
    }
  }

  async function loadCategories() {
    try {
      const response = await fetch('/api/categories');
      
      if (!response.ok) {
        throw new Error('Erro ao carregar categorias');
      }

      const categories = await response.json();
      displayCategories(categories);

    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      showNotification('Erro ao carregar categorias', 'error');
    }
  }

  function displayCategories(categories) {
    const categoriesList = document.getElementById('categoriesList');
    
    if (categories.length === 0) {
      categoriesList.innerHTML = '<p style="color: #6c757d; text-align: center; padding: 20px;">Nenhuma categoria criada ainda.</p>';
      return;
    }

    categoriesList.innerHTML = categories.map(category => `
      <div class="category-item" data-id="${category.id}">
        <span class="category-name">${escapeHtml(category.title)}</span>
        <div class="category-actions">
          <button class="btn-icon btn-edit" onclick="editCategory('${category.id}', '${escapeHtml(category.title)}')" title="Editar">✏️</button>
          <button class="btn-icon btn-delete" onclick="deleteCategory('${category.id}', '${escapeHtml(category.title)}')" title="Excluir">🗑️</button>
        </div>
      </div>
    `).join('');
  }

  // Tornar funções globais para serem chamadas pelos botões
  window.editCategory = async function(id, currentTitle) {
    const newTitle = prompt('Editar categoria:', currentTitle);
    
    if (newTitle === null || newTitle.trim() === '') {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');

      const response = await fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newTitle.trim()
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao editar categoria');
      }

      showNotification('Categoria atualizada com sucesso!', 'success');
      loadCategories();

    } catch (error) {
      showNotification(error.message || 'Erro ao editar categoria', 'error');
    }
  };

  window.deleteCategory = async function(id, title) {
    if (!confirm(`Tem certeza que deseja excluir a categoria "${title}"?\n\nTodos os produtos desta categoria também serão excluídos!`)) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');

      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao excluir categoria');
      }

      const data = await response.json();
      showNotification(`Categoria excluída! ${data.productsDeleted} produto(s) também foram removidos.`, 'success');
      loadCategories();

    } catch (error) {
      showNotification(error.message || 'Erro ao excluir categoria', 'error');
    }
  };

  // ==================== FUNÇÕES AUXILIARES ====================
  function showNotification(message, type = 'info') {
    // Remover notificação anterior se existir
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
      existingNotification.remove();
    }

    // Criar nova notificação
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Remover após 4 segundos
    setTimeout(() => {
      notification.classList.add('fade-out');
      setTimeout(() => notification.remove(), 300);
    }, 4000);
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
});