// ==================== TAB NAVIGATION ====================
document.addEventListener('DOMContentLoaded', function () {
    // Tab switching functionality
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabButtons.forEach(button => {
        button.addEventListener('click', function () {
            const targetTab = this.dataset.tab;

            // Remove active class from all buttons and panes
            tabButtons.forEach(btn => {
                btn.classList.remove('active');
                btn.setAttribute('aria-selected', 'false');
            });
            tabPanes.forEach(pane => {
                pane.classList.remove('active');
            });

            // Add active class to clicked button and corresponding pane
            this.classList.add('active');
            this.setAttribute('aria-selected', 'true');
            document.getElementById(`tab-${targetTab}`).classList.add('active');

            // Scroll to top of content
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });

    // ==================== PHONE NUMBER REVEAL ====================
    const phoneBtn = document.getElementById('phoneBtn');
    const revealBtn = document.getElementById('revealBtn');
    const phoneNumber = document.getElementById('phoneNumber');

    if (revealBtn && phoneNumber) {
        revealBtn.addEventListener('click', function () {
            phoneNumber.textContent = '0914 454 749';
            this.style.display = 'none';

            // Animate the reveal
            phoneNumber.style.transition = 'all 0.3s ease';
            phoneNumber.style.transform = 'scale(1.1)';
            setTimeout(() => {
                phoneNumber.style.transform = 'scale(1)';
            }, 300);
        });
    }

    if (phoneBtn) {
        phoneBtn.addEventListener('click', function () {
            const number = phoneNumber.textContent.replace(/\s/g, '');
            if (!number.includes('*')) {
                window.location.href = `tel:${number}`;
            }
        });
    }

    // ==================== FOLLOW BUTTON ====================
    const followBtn = document.getElementById('followBtn');

    if (followBtn) {
        followBtn.addEventListener('click', function () {
            const isFollowing = this.classList.contains('following');

            if (isFollowing) {
                this.innerHTML = '<i class="fa-solid fa-plus"></i> Theo dõi';
                this.classList.remove('following');
            } else {
                this.innerHTML = '<i class="fa-solid fa-check"></i> Đã theo dõi';
                this.classList.add('following');
            }
        });
    }

    // ==================== DESCRIPTION TOGGLE ====================
    const toggleDescription = document.getElementById('toggleDescription');
    const storeDescription = document.getElementById('storeDescription');

    if (toggleDescription && storeDescription) {
        const fullText = `🚗 Chuyên Mua Bán Xe Lướt: Tại TÂN TỰ QUÝ, Với liêu chi "Sản phẩm Tốt - Dịch vụ Hoàn Hảo", chúng tôi tự hào là địa chỉ tin cậy hàng đầu cho những ai đang tìm kiếm xe lướt chất lượng cao với giá cả hợp lý. Đội ngũ chuyên viên giàu kinh nghiệm của chúng tôi luôn sẵn sàng tư vấn và hỗ trợ bạn tìm được chiếc xe hoàn hảo nhất.
        
📦 Dịch Vụ Cầm Xe: Cần tiền gấp? Hãy đến với chúng tôi! TÂN TỰ QUÝ cung cấp dịch vụ cầm xe nhanh chóng và thuận tiện với thủ tục đơn giản, lãi suất cạnh tranh. Chúng tôi cam kết bảo mật thông tin và xe của bạn luôn được chăm sóc chu đáo trong suốt thời gian cầm.

🔧 Bảo Dưỡng & Sửa Chữa Chuyên Nghiệp: Xe của bạn xứng đáng nhận được sự chăm sóc tốt nhất! Với đội ngũ kỹ thuật viên lành nghề và trang thiết bị hiện đại, TÂN TỰ QUÝ mang đến dịch vụ bảo dưỡng và sửa chữa xe chuyên nghiệp, giúp chiếc xe của bạn luôn trong tình trạng tối ưu.

💎 Cam Kết Chất Lượng: Tại TÂN TỰ QUÝ, mỗi chiếc xe đều được kiểm tra kỹ lưỡng và đảm bảo chất lượng cao nhất trước khi đến tay khách hàng. Chúng tôi tin rằng sự hài lòng của bạn chính là thành công của chúng tôi.

🌟 Liên Hệ Ngay: Đừng ngần ngại liên hệ với TÂN TỰ QUÝ qua hotline 0914 454 749 để được tư vấn chi tiết và trải nghiệm dịch vụ tuyệt vời nhất. Chúng tôi luôn sẵn sàng phục vụ bạn 24/7!`;

        const shortText = storeDescription.textContent;
        let isExpanded = false;

        toggleDescription.addEventListener('click', function (e) {
            e.preventDefault();
            isExpanded = !isExpanded;

            if (isExpanded) {
                storeDescription.innerHTML = fullText + ' <a href="#" class="view-more-link" style="display: inline; margin: 0 0 0 4px;" id="toggleDescription">Thu gọn</a>';
                // Re-attach event listener
                document.getElementById('toggleDescription').addEventListener('click', arguments.callee);
            } else {
                storeDescription.innerHTML = shortText;
                document.getElementById('toggleDescription').addEventListener('click', arguments.callee);
            }
        });
    }

    // ==================== WISHLIST FUNCTIONALITY ====================
    const wishlistIcons = document.querySelectorAll('.activity-wishlist, .vehicle-wishlist');

    wishlistIcons.forEach(icon => {
        icon.addEventListener('click', function (e) {
            e.stopPropagation();
            e.preventDefault();

            if (this.classList.contains('fa-regular')) {
                this.classList.remove('fa-regular');
                this.classList.add('fa-solid');
                this.style.color = 'var(--primary-red)';
            } else {
                this.classList.remove('fa-solid');
                this.classList.add('fa-regular');
                this.style.color = '';
            }

            // Animate
            this.style.transform = 'scale(1.3)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 200);
        });
    });

    // ==================== FILTER PILLS ====================
    const filterPills = document.querySelectorAll('.filter-pill');

    filterPills.forEach(pill => {
        pill.addEventListener('click', function () {
            // Toggle active state
            this.classList.toggle('active');
        });
    });

    // ==================== REVIEW FILTER TABS ====================
    const reviewTabs = document.querySelectorAll('.review-tab');

    reviewTabs.forEach(tab => {
        tab.addEventListener('click', function () {
            reviewTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // ==================== LOAD MORE BUTTONS ====================
    const loadMoreButtons = document.querySelectorAll('.btn-load-more');

    loadMoreButtons.forEach(button => {
        button.addEventListener('click', function () {
            // Simulate loading
            const originalText = this.textContent;
            this.textContent = 'Đang tải...';
            this.disabled = true;

            setTimeout(() => {
                this.textContent = originalText;
                this.disabled = false;
                // Here you would load more content
                alert('Chức năng tải thêm sẽ được triển khai với backend');
            }, 1000);
        });
    });

    // ==================== IMAGE GALLERY LIGHTBOX ====================
    const galleryImages = document.querySelectorAll('.gallery-image img');

    galleryImages.forEach(img => {
        img.addEventListener('click', function () {
            // Simple lightbox effect
            const lightbox = document.createElement('div');
            lightbox.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.9);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                cursor: pointer;
            `;

            const imgClone = this.cloneNode();
            imgClone.style.cssText = `
                max-width: 90%;
                max-height: 90%;
                object-fit: contain;
                border-radius: 8px;
            `;

            lightbox.appendChild(imgClone);
            document.body.appendChild(lightbox);

            lightbox.addEventListener('click', function () {
                document.body.removeChild(lightbox);
            });
        });
    });

    // ==================== VEHICLE CARD CLICK ====================
    const vehicleCards = document.querySelectorAll('.vehicle-card, .vehicle-card-compact');

    vehicleCards.forEach(card => {
        card.addEventListener('click', function (e) {
            // Don't trigger if clicking wishlist
            if (e.target.closest('.vehicle-wishlist')) {
                return;
            }

            // Navigate to vehicle detail page
            console.log('Navigate to vehicle details');
            // window.location.href = '/vehicle-detail?id=123';
        });
    });

    // ==================== ACTIVITY CARD CLICK ====================
    const activityCards = document.querySelectorAll('.activity-card');

    activityCards.forEach(card => {
        card.addEventListener('click', function (e) {
            // Don't trigger if clicking wishlist
            if (e.target.closest('.activity-wishlist')) {
                return;
            }

            console.log('Navigate to activity details');
        });
    });

    // ==================== SMOOTH SCROLL ====================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#') {
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

    // ==================== ENGAGEMENT INTERACTIONS ====================
    const engagementItems = document.querySelectorAll('.engagement-item');

    engagementItems.forEach(item => {
        item.addEventListener('click', function (e) {
            e.stopPropagation();

            const icon = this.querySelector('i');
            const countSpan = this.querySelector('span');

            if (icon.classList.contains('fa-thumbs-up')) {
                if (icon.classList.contains('fa-regular')) {
                    icon.classList.remove('fa-regular');
                    icon.classList.add('fa-solid');
                    // Increment count
                    const currentCount = parseInt(countSpan.textContent);
                    countSpan.textContent = currentCount + 1;
                } else {
                    icon.classList.remove('fa-solid');
                    icon.classList.add('fa-regular');
                    // Decrement count
                    const currentCount = parseInt(countSpan.textContent);
                    countSpan.textContent = Math.max(0, currentCount - 1);
                }
            }

            if (icon.classList.contains('fa-comment')) {
                console.log('Open comments');
            }
        });
    });

    // ==================== STICKY SIDEBAR ====================
    function updateStickyPosition() {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar && window.innerWidth > 1024) {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const offset = 20;

            if (scrollTop > offset) {
                sidebar.style.top = `${offset}px`;
            }
        }
    }

    window.addEventListener('scroll', updateStickyPosition);
    window.addEventListener('resize', updateStickyPosition);

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

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }

    // ==================== SHARE FUNCTIONALITY ====================
    const shareButtons = document.querySelectorAll('.btn-outline');

    shareButtons.forEach(button => {
        if (button.textContent.includes('Chia sẻ')) {
            button.addEventListener('click', function () {
                if (navigator.share) {
                    navigator.share({
                        title: 'TÂN TỰ QUÝ - Dealership Store',
                        text: 'Xem cửa hàng này trên Chợ Tốt Xe',
                        url: window.location.href
                    }).catch(err => console.log('Error sharing:', err));
                } else {
                    // Fallback: Copy to clipboard
                    navigator.clipboard.writeText(window.location.href).then(() => {
                        alert('Đã copy link cửa hàng!');
                    });
                }
            });
        }
    });

    console.log('XeOnline.js loaded successfully!');
});