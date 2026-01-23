// adminLogin.js
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Pegar valores dos inputs
    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    // Validação básica no front-end
    if (!username || !password) {
      showError('Por favor, preencha todos os campos');
      return;
    }

    // Desabilitar botão durante o envio
    const submitButton = loginForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    if(submitButton.disabled) {
      submitButton.textContent = 'Aguarde...';
    } 

    try {
      // Fazer requisição para API de login
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username,
          password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        // Se houver erro, mostrar mensagem
        throw new Error(data.error || 'Erro ao fazer login');
      }

      // Login bem-sucedido
      // Salvar token no localStorage
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('adminUser', JSON.stringify(data.admin));

      // Redirecionar para dashboard
      window.location.href = '/admin-dashboard';

    } catch (error) {
      // Mostrar erro
      showError(error.message || 'Erro ao fazer login. Tente novamente.');
      
      // Reabilitar botão
      submitButton.disabled = false;
      submitButton.textContent = 'Entrar';
    }
  });

  // Função para mostrar mensagens de erro
function showError(message) {
  const existingError = document.querySelector('.error-message');
  if (existingError) existingError.remove();

  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.textContent = message;

  const loginForm = document.getElementById('loginForm');

  // Insere o erro ANTES do botão, dentro do form
  loginForm.prepend(errorDiv);

  setTimeout(() => {
    errorDiv.remove();
  }, 5000);
}
});