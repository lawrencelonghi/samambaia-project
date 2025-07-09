

// mantem botao ativo depois de clicado
const btns = document.querySelectorAll('.nav-btn')

  
 function handleBtn() {
    btns.forEach((btn) =>{
      this.classList.toggle('active-btn')
       if(btn !== this) btn.classList.remove('active-btn');
    })
  }
  
  btns.forEach((btn) =>{
  btn.addEventListener('click', handleBtn)
 })





//smooth scroll library
document.addEventListener('DOMContentLoaded', function() {
  const scroll = new SmoothScroll('a[href*="#"]', {
    
    speed: 350,     
    offset: 212,      
    easing: 'easeInOutQuad', 
    durationMin: 500,
    updateURL: false,
    popstate: false,  
  });
});
