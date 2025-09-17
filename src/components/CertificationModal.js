import { getTranslator } from '../i18n/i18n.js';

export function renderCertificationModal() {
    const t = getTranslator();
    return `
        <div class="modal-overlay" id="certification-modal">
            <div class="modal-content">
                <button class="close-modal-button" data-target="#certification-modal">&times;</button>
                <h2>${t('certification_modal_title')}</h2>
                <p>${t('certification_modal_subtitle')}</p>
                <form id="certification-form">
                    <div class="form-group">
                        <label for="certification-type">${t('certification_type')}</label>
                        <select id="certification-type" name="certification-type" required>
                            <option value="">${t('select_certification_type')}</option>
                            <option value="alien-registration-card">${t('alien_registration_card')}</option>
                            <option value="proof-of-employment">${t('proof_of_employment')}</option>
                            <option value="proof-of-enrollment">${t('proof_of_enrollment')}</option>
                            <option value="graduation-certificate">${t('graduation_certificate')}</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="certification-file">${t('certification_file')}</label>
                        <input type="file" id="certification-file" name="certification-file" accept="image/*,application/pdf" required>
                    </div>
                    <button type="submit" class="submit-button">${t('submit_certification')}</button>
                </form>
            </div>
        </div>
    `;
}
