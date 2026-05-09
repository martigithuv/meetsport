function handleCategoryClick(event, sport) {
    event.preventDefault();
    const userStr = localStorage.getItem('user');
    
    if (!userStr) {
        window.location.href = '../login/login.php';
    } else {
        const url = sport ? `../explorar/explorar.php?sport=${sport}` : '../explorar/explorar.php';
        window.location.href = url;
    }
}
