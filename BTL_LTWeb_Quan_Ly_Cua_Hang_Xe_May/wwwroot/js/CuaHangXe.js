// ==================== TAB SWITCHING ====================
document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => {
        // Remove active class from all tabs and panes
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
            btn.setAttribute('aria-selected', 'false');
        });
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.remove('active');
        });

        // Add active class to clicked tab and corresponding pane
        button.classList.add('active');
        button.setAttribute('aria-selected', 'true');
        const tabId = button.getAttribute('data-tab');
        document.getElementById(`tab-${tabId}`).classList.add('active');

        // Smooth scroll to top of content
        document.querySelector('.tab-content-container').scrollIntoView({
            behavior: 'smooth',
            block: 'nearest'
        });
    });
});

// ==================== FOLLOW BUTTON ====================
const followBtn = document.getElementById('followBtn');
let isFollowing = false;

followBtn.addEventListener('click', () => {
    isFollowing = !isFollowing;

    if (isFollowing) {
        followBtn.innerHTML = '<i class="fa-solid fa-check"></i> Đang theo dõi';
        followBtn.style.borderColor = 'var(--secondary-color)';
        followBtn.style.color = 'var(--secondary-color)';
    } else {
        followBtn.innerHTML = '<i class="fa-solid fa-plus"></i> Theo dõi';
        followBtn.style.borderColor = '';
        followBtn.style.color = '';
    }
});

// ==================== PHONE REVEAL ====================
const phoneBtn = document.getElementById('phoneBtn');
const revealBtn = document.getElementById('revealBtn');
const phoneNumber = document.getElementById('phoneNumber');
let phoneRevealed = false;

function revealPhone() {
    if (!phoneRevealed) {
        phoneNumber.textContent = '0914 454749';
        revealBtn.textContent = 'Gọi ngay';
        revealBtn.classList.remove('secondary');
        revealBtn.classList.add('primary');
        phoneRevealed = true;
    } else {
        window.location.href = 'tel:0914454749';
    }
}

phoneBtn.addEventListener('click', () => {
    if (phoneRevealed) {
        window.location.href = 'tel:0914454749';
    } else {
        revealPhone();
    }
});

revealBtn.addEventListener('click', revealPhone);

// ==================== DESCRIPTION TOGGLE ====================
const description = document.getElementById('storeDescription');
const toggleDescBtn = document.getElementById('toggleDescription');

toggleDescBtn.addEventListener('click', (e) => {
    e.preventDefault();
    description.classList.toggle('expanded');
    toggleDescBtn.textContent = description.classList.contains('expanded') ? 'Thu gọn' : 'Xem thêm';
});

// ==================== WISHLIST TOGGLE ====================
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('activity-wishlist') ||
        e.target.classList.contains('vehicle-wishlist')) {
        e.target.classList.toggle('active');
        e.target.classList.toggle('fa-regular');
        e.target.classList.toggle('fa-solid');
    }
});

// ==================== FILTER PILLS ====================
document.querySelectorAll('.filter-pill').forEach(pill => {
    pill.addEventListener('click', () => {
        pill.classList.toggle('active');
    });
});

// ==================== REVIEW TABS ====================
document.querySelectorAll('.review-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.review-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
    });
});

// ==================== IMAGE GALLERY LIGHTBOX ====================
document.querySelectorAll('.gallery-image').forEach(img => {
    img.addEventListener('click', () => {
        console.log('Open lightbox for image:', img.querySelector('img').src);
    });
});

// ==================== LAZY LOADING IMAGES ====================
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
                observer.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img[loading="lazy"]').forEach(img => {
        imageObserver.observe(img);
    });
}

// ==================== SMOOTH SCROLL FOR ANCHOR LINKS ====================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#' && href !== '') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

// ==================== SCROLL TO TOP BEHAVIOR ====================
let lastScrollTop = 0;
const sidebar = document.querySelector('.sidebar');

window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (scrollTop > 100) {
        document.querySelector('.tab-navigation')?.classList.add('scrolled');
    } else {
        document.querySelector('.tab-navigation')?.classList.remove('scrolled');
    }

    lastScrollTop = scrollTop;
}, { passive: true });

// ==================== KEYBOARD NAVIGATION ====================
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        console.log('Escape pressed');
    }

    if (e.target.classList.contains('tab-button')) {
        const tabs = Array.from(document.querySelectorAll('.tab-button'));
        const currentIndex = tabs.indexOf(e.target);

        if (e.key === 'ArrowLeft' && currentIndex > 0) {
            e.preventDefault();
            tabs[currentIndex - 1].focus();
            tabs[currentIndex - 1].click();
        } else if (e.key === 'ArrowRight' && currentIndex < tabs.length - 1) {
            e.preventDefault();
            tabs[currentIndex + 1].focus();
            tabs[currentIndex + 1].click();
        }
    }
});

// ==================== ANALYTICS TRACKING ====================
function trackEvent(category, action, label) {
    console.log('Track Event:', { category, action, label });
}

document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => {
        trackEvent('Navigation', 'Tab Click', button.getAttribute('data-tab'));
    });
});

phoneBtn.addEventListener('click', () => trackEvent('CTA', 'Phone Click', 'Primary'));
revealBtn.addEventListener('click', () => trackEvent('CTA', 'Reveal Phone', 'Secondary'));
followBtn.addEventListener('click', () => trackEvent('Engagement', 'Follow', isFollowing ? 'Unfollow' : 'Follow'));

// ==================== PERFORMANCE OPTIMIZATION ====================
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

const optimizedScroll = debounce(() => {
    // Scroll handling logic
}, 200);

window.addEventListener('scroll', optimizedScroll, { passive: true });

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    console.log('Store Profile Loaded - Integrated Version');

    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.3s';
        document.body.style.opacity = '1';
    }, 100);
});