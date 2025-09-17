import { renderAnswerCard } from '../components/AnswerCard.js';
import { getTranslator } from '../i18n/i18n.js';

export function renderPostDetailPage(container, post, currentUser) {
    const t = getTranslator();
    if (!post) {
        container.innerHTML = `<p>게시글을 찾을 수 없습니다.</p><a href="#" class="back-button">홈으로 돌아가기</a>`;
        return;
    }

    const isPostAuthor = currentUser && currentUser.id === post.authorId;
    const answersHTML = post.answers.map(answer => renderAnswerCard(answer, isPostAuthor)).join('');

    container.innerHTML = `
        <div class="post-detail-page">
            <a class="back-button">&lt; 목록으로 돌아가기</a>
            <div class="post-content-card">
                <h1>${post.title} <button class="share-button" data-post-id="${post.id}" title="공유하기"><i class="fa-solid fa-share-nodes"></i></button></h1>
                <div class="post-meta">
                    <img src="${post.author.profilePic}" alt="${post.author.name}" class="author-pic-small">
                    <span>작성자: ${post.author.name}</span>
                </div>
                <div class="post-body">${post.content}</div>
            </div>
            <div class="answers-section">
                <h2>답변 ${post.answers.length}개</h2>
                <div class="answer-list">
                    ${answersHTML.length > 0 ? answersHTML : '<p>아직 답변이 없습니다.</p>'}
                </div>
            </div>
            <div class="answer-form-section">
                 <h2>답변 등록하기</h2>
                 <form class="answer-form" data-post-id="${post.id}">
                    <div class="form-content-wrapper">
                        <textarea name="answer-content" required placeholder="답변을 입력하세요..."></textarea>
                        <div class="certification-prompt">
                            <i class="fa-solid fa-shield-halved"></i>
                            <span>${t('certification_prompt')}</span>
                        </div>
                    </div>
                    <button type="submit">답변 등록</button>
                 </form>
            </div>
        </div>
    `;
}
