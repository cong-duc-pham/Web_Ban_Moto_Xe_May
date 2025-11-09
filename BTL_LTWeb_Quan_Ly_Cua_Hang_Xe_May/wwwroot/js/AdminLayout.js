function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('collapsed');
}

// Mobile menu toggle
if (window.innerWidth <= 992) {
    const sidebar = document.getElementById('sidebar');
    document.querySelector('.toggle-btn').onclick = function () {
        sidebar.classList.toggle('active');
    };
}

// Active menu item animation
document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
        this.classList.add('active');
    });
});

// Action button hover effects
document.querySelectorAll('.action-btn').forEach(btn => {
    btn.addEventListener('click', function (e) {
        e.preventDefault();
        this.style.transform = 'scale(0.9)';
        setTimeout(() => {
            this.style.transform = 'scale(1.1)';
        }, 100);
    });
});

// Smooth scroll for table rows
const tableRows = document.querySelectorAll('tbody tr');
tableRows.forEach((row, index) => {
    row.style.opacity = '0';
    row.style.transform = 'translateX(-20px)';
    setTimeout(() => {
        row.style.transition = 'all 0.4s ease';
        row.style.opacity = '1';
        row.style.transform = 'translateX(0)';
    }, 100 * index);
});

// Notification bell animation
setInterval(() => {
    const bell = document.querySelector('.fa-bell');
    if (bell) {
        bell.style.animation = 'none';
        setTimeout(() => {
            bell.style.animation = 'swing 1s ease';
        }, 10);
    }
}, 5000);

// Add swing animation for bell
const style = document.createElement('style');
style.textContent = `
    @keyframes swing {
        0%, 100% { transform: rotate(0deg); }
        10%, 30%, 50%, 70%, 90% { transform: rotate(15deg); }
        20%, 40%, 60%, 80% { transform: rotate(-15deg); }
    }
`;
document.head.appendChild(style);

// Search box animation
const searchInput = document.querySelector('.search-box input');
if (searchInput) {
    searchInput.addEventListener('focus', function () {
        this.parentElement.style.transform = 'scale(1.02)';
    });
    searchInput.addEventListener('blur', function () {
        this.parentElement.style.transform = 'scale(1)';
    });
}

// Stats counter animation
function animateValue(element, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = Math.floor(progress * (end - start) + start);
        element.textContent = value.toLocaleString();
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// Animate stat values on load
window.addEventListener('load', () => {
    const statValues = document.querySelectorAll('.stat-value');
    statValues.forEach((stat, index) => {
        const text = stat.textContent;
        const value = parseInt(text.replace(/\D/g, ''));
        if (!isNaN(value)) {
            setTimeout(() => {
                stat.textContent = '0';
                animateValue(stat, 0, value, 1000);
            }, 200 * index);
        }
    });
});

// Responsive sidebar for mobile
window.addEventListener('resize', () => {
    const sidebar = document.getElementById('sidebar');
    if (window.innerWidth > 992) {
        sidebar.classList.remove('active');
    }
});

// Click outside to close mobile menu
document.addEventListener('click', (e) => {
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.querySelector('.toggle-btn');
    if (window.innerWidth <= 992 &&
        !sidebar.contains(e.target) &&
        !toggleBtn.contains(e.target) &&
        sidebar.classList.contains('active')) {
        sidebar.classList.remove('active');
    }
});