import { getTranslator } from '../i18n/i18n.js';

export function renderAdminDashboardModal(posts) {
    const t = getTranslator();
    const postsListHTML = posts.map(post => `
        <div class="admin-post-item">
            <span>${post.title} (ID: ${post.id})</span>
            <button class="delete-post-button" data-post-id="${post.id}">${t('delete')}</button>
        </div>
    `).join('');

    return `
        <div class="modal-overlay" id="admin-dashboard-modal">
            <div class="modal-content">
                <button class="close-modal-button" data-target="#admin-dashboard-modal">&times;</button>
                <h2>${t('admin_dashboard_title')}</h2>
                <div class="admin-post-list">
                    ${postsListHTML.length > 0 ? postsListHTML : `<p>${t('no_posts_to_manage')}</p>`}
                </div>
            </div>
        </div>
    `;
}
