document.addEventListener('DOMContentLoaded', () => {

  //codigo para lidar com as categorias
  checkAuth();

  const addCategoryBtn = document.getElementById('addCategoryBtn');
  const categoryModal = document.getElementById('categoryModal');
  const categoryForm = document.getElementById('categoryForm');
  const cancelCategoryBtn = document.getElementById('cancelCategoryBtn');
  const modalCloseButtons = document.querySelectorAll('.modal-close');
  const logoutBtn = document.getElementById('logoutBtn');

  addCategoryBtn.addEventListener('click', openCategoryModal);
  cancelCategoryBtn.addEventListener('click', closeCategoryModal);
  categoryForm.addEventListener('submit', handleCategorySubmit);
  logoutBtn.addEventListener('click', handleLogout);

  modalCloseButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      closeCategoryModal();
      closeProductModal();
    });
  });

  categoryModal.addEventListener('click', (e) => {
    if (e.target === categoryModal) {
      closeCategoryModal();
    }
  });

  loadCategories();

  function checkAuth() {
    const token = localStorage.getItem('authToken');
    if (!token) {
      window.location.href = '/admin/login';
      return;
    }

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

      showNotification('Categoria criada com sucesso!', 'success');
      closeCategoryModal();
      loadCategories(); // atualiza categorias

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
          <button class="btn-icon btn-edit" onclick="editCategory('${category.id}', '${escapeHtml(category.title)}')" title="Editar">Editar</button>
          <button class="btn-icon btn-delete" onclick="deleteCategory('${category.id}', '${escapeHtml(category.title)}')" title="Excluir">Excluir</button>
        </div>
      </div>
    `).join('');
  }

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

  function showNotification(message, type = 'info') {
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
      existingNotification.remove();
    }

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    // remover notificacao após 4 segundos
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

  //codigo para lidar com produtos

  const productForm = document.getElementById('productForm')
  const addProductBtn = document.getElementById('addProductBtn')
  const addProductModal = document.getElementById('productModal')
  const cancelProductBtn = document.getElementById('cancelProductBtn')
  const productModal = document.getElementById('productModal')
  const selectProductCategory = document.getElementById('selectProductCategory')

  addProductBtn.addEventListener('click', openProductModal)
  cancelProductBtn.addEventListener('click', closeProductModal)
  productForm.addEventListener('submit', handleProductSubmit)


  function openProductModal(e) {
    addProductModal.classList.add('active')
  }

  function closeProductModal(e){
    addProductModal.classList.remove('active')
  }
  selectCategories()

  async function selectCategories() {
    try {
      const response = await fetch('/api/categories')
      
      if(!response.ok) {
        throw new Error('Erro ao carregar categorias');
      }

      const categoriesOptions = await response.json()
      
      displaySelectCategories(categoriesOptions)
    } catch (error) {
        console.error('Erro ao carregar categorias:', error);
        showNotification('Erro ao carregar categorias', 'error');
    }
  }

 function displaySelectCategories(categoriesOptions) {
  
  if (categoriesOptions.length === 0){
    selectProductCategory.innerHTML = '<option value="">Nenhuma categoria</option>'
    return
  }

  selectProductCategory.innerHTML = categoriesOptions.map(category => `
    <option value="${category.id}">${category.title}</option>
    `).join('')

 }

async function handleProductSubmit(e) {
  e.preventDefault()
  
  try {
    const productCategory = selectProductCategory.value
    const productTitle = document.getElementById('productTitle').value    
    const productDescription = document.getElementById('productDescription').value  
    const productPrice = document.getElementById('productPrice').value 
    const productImageInput = document.getElementById('productImage')
    const token = window.localStorage.getItem('authToken')

   
    if (!productTitle || !productPrice) {
      showNotification('Por favor, insira um nome e o preço', 'error');
      return;
    }

    if (!productImageInput.files || !productImageInput.files[0]) {
      showNotification('Por favor, selecione uma imagem', 'error');
      return;
    }

    const formData = new FormData()
    formData.append('title', productTitle)
    formData.append('description', productDescription)
    formData.append('price', productPrice)
    formData.append('image', productImageInput.files[0])

    const response = await fetch(`/api/categories/${productCategory}/products`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    })

    // Trate erros de forma mais amigável
    if (!response.ok) {
      // Tente parsear JSON, mas tenha fallback
      let errorMessage = 'Erro ao criar produto';
      try {
        const errorData = await response.json()
        errorMessage = errorData.error || errorMessage
      } catch {
        // Se não conseguir parsear JSON, use mensagem genérica
        errorMessage = `Erro ${response.status}: ${response.statusText}`
      }
      throw new Error(errorMessage)
    }

    const data = await response.json()
    
    loadProducts()
    showNotification('Produto criado com sucesso!', 'success')
    closeProductModal()
    productForm.reset()
    
  } catch (error) {
    console.error('Erro ao criar produto:', error)
    showNotification(error.message, 'error')
  }
}

async function LoadProducts() {
  try {
    const response = await fetch('/api/products')
    if(!response.ok) {
      throw new Error('Erro ao carregar produtos');
    }

    const products = await response.json()

    displayProducts(products)

  } catch (error) {
         console.error('Erro ao carregar produtos:', error);
      showNotification('Erro ao carregar produtos', 'error');
  }
}
});



