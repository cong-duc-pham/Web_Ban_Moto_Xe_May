// Delegated favorite handling for all pages (Index, AllVehicles, Motorbikes, Electric)
// Usage: put <script src="/js/Favorites.js"></script> in _Layout or page footer.

(function () {
    'use strict';

    // Global state cho favorites
    const favoritesState = {
        isLoading: false
    };

    /**
     * POST request đến backend để toggle favorite
     */
    // Global state cho favorites
    const favoritesState = {
        isLoading: false
    };

    /**
     * POST request đến backend để toggle favorite
     */
    // Global state cho favorites
    const favoritesState = {
        isLoading: false
    };

    /**
     * POST request đến backend để toggle favorite
     */
    async function postToggleFavorite(vehicleId) {
        try {
            const res = await fetch('/Home/ToggleFavorite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `vehicleId=${encodeURIComponent(vehicleId)}`
            });
            return await res.json();
        } catch (err) {
            console.error('postToggleFavorite error:', err);
            return { success: false, message: err.message || 'Network error' };
        }
    }

    function updateFavoriteButtonUI(btn, isAdded) {
        if (!btn) return;
        const icon = btn.querySelector('i');
        if (isAdded) {
            if (icon) { icon.classList.remove('far'); icon.classList.add('fas'); }
            btn.classList.add('active');
            btn.setAttribute('aria-pressed', 'true');
        } else {
            if (icon) { icon.classList.remove('fas'); icon.classList.add('far'); }
            btn.classList.remove('active');
            btn.setAttribute('aria-pressed', 'false');
        }
    }

    // Normalize getting id from element
    function getVehicleIdFromElement(el) {
        if (!el) return null;
        // prefer data-id then data-vehicle-id then data-vehicle
        return el.dataset.id || el.getAttribute('data-id') || el.dataset.vehicleId || el.getAttribute('data-vehicle-id') || el.getAttribute('data-vehicle');
    }

    // Delegate clicks for favorite controls
    document.addEventListener('click', function (e) {
        const target = e.target;
        // find closest favorite element — support multiple selector variants
        const fav = target.closest('.favorite-btn, .product-favorite, .product-heart, .btn-favorite, [data-favorite]');

        if (!fav) return;

        // Prevent card click navigation if favorite button inside card
        e.stopPropagation();
        e.preventDefault();

        const id = getVehicleIdFromElement(fav);
        if (!id) {
            console.warn('Favorite clicked but no vehicle id found on element', fav);
            return;
        }

        // disable button briefly to avoid double-clicks
        fav.disabled = true;

        postToggleFavorite(id).then(json => {
            fav.disabled = false;
            if (!json) return;
            if (!json.success) {
                if (json.needLogin) {
                    // redirect to login preserving return url
                    const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
                    window.location.href = `/Account/Login?returnUrl=${returnUrl}`;
                    return;
                }
                // show message (simple alert — replace with site toast if available)
                alert(json.message || 'Lỗi khi xử lý yêu thích');
                return;
            }

            const added = json.action === 'added';
            updateFavoriteButtonUI(fav, added);
        }).catch(err => {
            fav.disabled = false;
            console.error('toggle favorite failed', err);
            alert('Lỗi khi thao tác yêu thích. Vui lòng thử lại.');
        });
    }, true);

    // Expose helper so pages can programmatically update UI after initial render
    window.updateFavoriteButtonUI = updateFavoriteButtonUI;

})();