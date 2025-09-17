import { getTranslator } from '../i18n/i18n.js';

export function renderLoginModal() {
    const t = getTranslator();
    return `
        <div class="modal-overlay" id="login-modal-overlay">
            <div class="modal-content">
                <button class="close-modal-button" id="close-login-modal">&times;</button>
                <h2>${t('login_modal_title')}</h2>
                <p>${t('login_modal_subtitle')}</p>
                <div class="social-login-buttons">
                    <button class="social-login-button google" id="modal-google-login-button">
                        <i class="fa-brands fa-google"></i> ${t('google_login')}
                    </button>
                    <button class="social-login-button facebook" id="modal-facebook-login-button">
                        <i class="fa-brands fa-facebook"></i> ${t('facebook_login')}
                    </button>
                </div>
            </div>
        </div>
    `;
}