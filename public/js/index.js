    
    $( document ).ready(()=> {
    let i = 0;
    const text = $(".upNumber").text();
    setInterval(() => {
        i++
        if (i < 400)
        {
        $(".upNumber").text(Math.floor(Math.random()* 100));
        } else{
            $(".upNumber").text(text);
            clearInterval()
        }
    }, 0);


})

document.getElementById('sign-btn').addEventListener('click', function() {
    document.querySelector('.model').style.display='block';
    
});
document.getElementById('sign-btn').addEventListener('click', function() {
    document.querySelector('.overlay').style.display='block';
    
});
document.getElementById('close-btn').addEventListener('click', function() {
    document.querySelector('.model').style.display='none';
    
});
document.getElementById('close-btn').addEventListener('click', function() {
    document.querySelector('.overlay').style.display='none';
    
});

