let sign_btn = document.querySelectorAll('.sign-btn');
sign_btn.forEach(btn => { btn.addEventListener('click', function() {
        btn.nextElementSibling.style.display ='block';
        btn.nextElementSibling.nextElementSibling.style.display ='block';
   });
})

 let close_btn = document.querySelectorAll('.close-btn');
 close_btn.forEach(btn => { btn.addEventListener('click', function() {
        btn.parentElement.parentElement.style.display='none';
        btn.parentElement.parentElement.nextElementSibling.style.display='none';
    });
 })

