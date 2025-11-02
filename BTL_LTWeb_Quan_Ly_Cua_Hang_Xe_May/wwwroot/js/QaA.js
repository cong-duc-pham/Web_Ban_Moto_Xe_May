// ==================== READING PROGRESS BAR ====================
function updateReadingProgress() {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollPercentage = (scrollTop / (documentHeight - windowHeight)) * 100;

    document.getElementById('readingProgress').style.width = scrollPercentage + '%';
}

window.addEventListener('scroll', updateReadingProgress, { passive: true });

// ==================== SMOOTH SCROLL TO ANCHOR ====================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#' && href.length > 1) {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                const offset = 80; // Header height offset
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        }
    });
});

// ==================== COPY LINK TO CLIPBOARD ====================
function copyToClipboard() {
    const url = window.location.href;

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(() => {
            alert('Đã sao chép link bài viết!');
        }).catch(err => {
            console.error('Failed to copy: ', err);
        });
    } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = url;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            alert('Đã sao chép link bài viết!');
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
        document.body.removeChild(textArea);
    }
}

document.getElementById('copyLinkBtn')?.addEventListener('click', copyToClipboard);
document.getElementById('copyLinkBtnMobile')?.addEventListener('click', copyToClipboard);

// ==================== SOCIAL SHARE HANDLERS ====================
document.querySelectorAll('.social-icon.facebook').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        const url = encodeURIComponent(window.location.href);
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'width=600,height=400');
    });
});

document.querySelectorAll('.social-icon.messenger').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        const url = encodeURIComponent(window.location.href);
        window.open(`https://www.facebook.com/dialog/send?link=${url}&app_id=YOUR_APP_ID`, '_blank', 'width=600,height=400');
    });
});

document.querySelectorAll('.social-icon.gmail').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        const subject = encodeURIComponent(document.title);
        const body = encodeURIComponent(window.location.href);
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
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
    }, {
        rootMargin: '50px'
    });

    document.querySelectorAll('img[loading="lazy"]').forEach(img => {
        imageObserver.observe(img);
    });
}

// ==================== TOC MOBILE TOGGLE (OPTIONAL) ====================
const tocBox = document.querySelector('.toc-box');
const tocHeading = document.querySelector('.toc-heading');

if (window.innerWidth < 768 && tocBox && tocHeading) {
    tocHeading.style.cursor = 'pointer';
    tocHeading.innerHTML += ' <i class="fas fa-chevron-down ms-2"></i>';

    const tocList = document.querySelector('.toc-list');
    tocList.style.display = 'none';

    tocHeading.addEventListener('click', () => {
        const isHidden = tocList.style.display === 'none';
        tocList.style.display = isHidden ? 'block' : 'none';
        const icon = tocHeading.querySelector('i');
        icon.className = isHidden ? 'fas fa-chevron-up ms-2' : 'fas fa-chevron-down ms-2';
    });
}

// ==================== ANALYTICS TRACKING ====================
function trackEvent(category, action, label) {
    console.log('Track Event:', { category, action, label });
    // Integration with Google Analytics or other analytics service
    // gtag('event', action, { 'event_category': category, 'event_label': label });
}

// Track social shares
document.querySelectorAll('.social-icon').forEach(icon => {
    icon.addEventListener('click', function () {
        const platform = this.classList.contains('facebook') ? 'Facebook' :
            this.classList.contains('messenger') ? 'Messenger' :
                this.classList.contains('gmail') ? 'Gmail' :
                    this.classList.contains('skype') ? 'Skype' :
                        this.classList.contains('viber') ? 'Viber' :
                            'Copy Link';
        trackEvent('Social Share', 'Click', platform);
    });
});

// Track related post clicks
document.querySelectorAll('.related-card, .sidebar-post').forEach(card => {
    card.addEventListener('click', function () {
        const title = this.querySelector('.related-card-title, .sidebar-post-title')?.textContent.trim();
        trackEvent('Related Post', 'Click', title);
    });
});

// Track CTA button click
document.querySelector('.cta-button')?.addEventListener('click', () => {
    trackEvent('CTA', 'Click', 'View More at Cho Tot');
});

// ==================== PERFORMANCE MONITORING ====================
window.addEventListener('load', () => {
    // Performance timing
    if (window.performance && window.performance.timing) {
        const perfData = window.performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
        console.log('Page Load Time:', pageLoadTime + 'ms');
    }

    // Mark images as loaded
    console.log('All resources loaded');
});

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    console.log('Blog Post Detail Page Loaded');

    // Update reading progress on load
    updateReadingProgress();

    // Add fade-in animation
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.3s';
        document.body.style.opacity = '1';
    }, 100);
});