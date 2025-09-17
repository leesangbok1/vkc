export function renderAnswerCard(answer, isPostAuthor = false) {
    if (!answer || !answer.author) return '';
    const author = answer.author;
    const expertBadge = author.isExpert ? '<span class="expert-badge">전문가</span>' : '';
    const acceptedBadge = answer.isAccepted ? '<span class="accepted-badge">✅ 채택됨</span>' : '';
    const acceptButton = isPostAuthor && !answer.isAccepted ?
        `<button class="accept-answer-button" data-answer-id="${answer.id}" data-post-id="${answer.postId}">답변 채택</button>` : '';

    return `
        <div class="answer-card">
            <div class="answer-meta">
                <img src="${author.profilePic}" alt="${author.name}">
                <span class="author-name">${author.name} ${expertBadge}</span>
                <span class="author-certification">${author.certification || ''}</span>
                ${acceptedBadge}
            </div>
            <div class="answer-body">${answer.content}</div>
            <div class="answer-actions">
                <button class="like-button" data-type="answer" data-id="${answer.id}" data-post-id="${answer.postId}">
                    <i class="fa-solid fa-heart"></i> ${answer.likes || 0}
                </button>
                ${acceptButton}
            </div>
        </div>
    `;
}
