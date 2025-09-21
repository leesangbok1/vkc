// --- API & Component Imports ---
import {
    populateDatabase,
    fetchHomepagePosts,
    fetchPostDetails,
    fetchPaginatedPosts,
    createQuestion,
    createAnswer,
    signInWithGoogle,
    signInWithFacebook,
    signOutUser,
    onAuthChange,
    getUser,
    deletePost
} from './api/firebase.js';
import { renderHeader } from './components/Header.js';
import { renderSpinner } from './components/Spinner.js';
import { renderHomePage } from './pages/HomePage.js';
import { renderPostDetailPage } from './pages/PostDetailPage.js';
import { renderAllPostsPage } from './pages/AllPostsPage.js';
import { renderLoginModal } from './components/LoginModal.js';
import { renderCertificationModal } from './components/CertificationModal.js';
// 관리자 대시보드 제거됨 - 별도 관리자 전용 페이지로 분리
import AutoTaskManager from './components/AutoTaskManager.js';
import { initI18n, setLanguage, getLanguage } from './i18n/i18n.js';

// --- GLOBAL STATE ---
const app = document.getElementById('app');
const state = {
    currentPage: 'home',
    currentPostId: null,
    abTestGroup: 'A',
    language: 'ko',
    posts: [], // For homepage
    users: {}, // Simple cache for user data
    currentUser: null, // Will be set by Firebase Auth
    isLoading: true,
    allPosts: [],
    lastVisiblePost: null,
    firstVisiblePost: null,
    currentPageNumber: 1,
    activeFilter: { type: null, value: null },
    activeSort: 'createdAt',
    isUserDropdownOpen: false,
    isLangDropdownOpen: false,
    isLoginModalOpen: false,
    isCertificationModalOpen: false,
    // 관리자 모달 제거됨
};

// --- MODAL & DROPDOWN CONTROL ---
function openLoginModal() {
    if (state.isLoginModalOpen) return;
    state.isLoginModalOpen = true;
    const modalHTML = renderLoginModal();
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    setTimeout(() => {
        document.getElementById('login-modal-overlay')?.classList.add('show');
    }, 10);
}

function closeLoginModal() {
    if (!state.isLoginModalOpen) return;
    const modalOverlay = document.getElementById('login-modal-overlay');
    if (modalOverlay) {
        modalOverlay.classList.remove('show');
        modalOverlay.addEventListener('transitionend', () => modalOverlay.remove(), { once: true });
    }
    state.isLoginModalOpen = false;
}

function openCertificationModal() {
    if (state.isCertificationModalOpen) return;
    state.isCertificationModalOpen = true;
    const modalHTML = renderCertificationModal();
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    setTimeout(() => {
        document.getElementById('certification-modal')?.classList.add('show');
    }, 10);
}

function closeCertificationModal() {
    if (!state.isCertificationModalOpen) return;
    const modalOverlay = document.getElementById('certification-modal');
    if (modalOverlay) {
        modalOverlay.classList.remove('show');
        modalOverlay.addEventListener('transitionend', () => modalOverlay.remove(), { once: true });
    }
    state.isCertificationModalOpen = false;
}

// 관리자 모달 기능 제거됨 - 별도 /admin 경로로 접근

// 관리자 모달 닫기 기능 제거됨

function toggleDropdown(type, forceClose = false) {
    const dropdownId = type === 'user' ? 'user-dropdown-menu' : 'language-dropdown-menu';
    const stateKey = type === 'user' ? 'isUserDropdownOpen' : 'isLangDropdownOpen';
    
    const dropdown = document.getElementById(dropdownId);
    if (!dropdown) return;

    if (forceClose || state[stateKey]) {
        dropdown.classList.remove('show');
        state[stateKey] = false;
    } else {
        // Close other dropdowns before opening a new one
        toggleDropdown('user', true);
        toggleDropdown('language', true);
        
        dropdown.classList.add('show');
        state[stateKey] = true;
    }
}

// --- ROUTING & RENDERING ---
async function navigate(page, payload = null) {
    state.currentPage = page;
    state.isLoading = true;
    render(); 

    if (page === 'home') {
        state.posts = await fetchHomepagePosts(state.users);
    } else if (page === 'postDetail') {
        state.currentPostId = payload;
        const postData = await fetchPostDetails(payload, state.users);
        state.isLoading = false;
        render(postData);
        return;
    } else if (page === 'allPosts') {
        state.activeFilter = payload?.filter || { type: null, value: null };
        state.activeSort = payload?.sort || 'createdAt';
        state.currentPageNumber = 1;
        state.lastVisiblePost = null;
        state.firstVisiblePost = null;
        await handleFetchPaginatedPosts('first');
    }

    state.isLoading = false;
    render();
}

function render(data = null) {
    app.innerHTML = '';
    app.insertAdjacentHTML('beforeend', renderHeader(state.currentUser));
    const pageContainer = document.createElement('div');
    pageContainer.className = 'page-container container';
    app.appendChild(pageContainer);

    if (state.isLoading) {
        pageContainer.innerHTML = renderSpinner();
        return;
    }

    switch (state.currentPage) {
        case 'home':
            renderHomePage(pageContainer, state);
            break;
        case 'postDetail':
            renderPostDetailPage(pageContainer, data, state.currentUser);
            break;
        case 'allPosts':
            renderAllPostsPage(pageContainer, state);
            break;
    }

    // Render admin button if current user is admin
    if (state.currentUser && state.currentUser.isAdmin) {
        // 관리자 버튼 제거됨 - 일반 사용자 인터페이스에서 비건됨
        // 관리자 버튼 렌더링 제거됨
    }
}

// --- DATA HANDLING ---
async function handleFetchPaginatedPosts(direction) {
    let startDoc = null;
    let endDoc = null;

    if (direction === 'next') {
        startDoc = state.lastVisiblePost;
    } else if (direction === 'prev') {
        endDoc = state.firstVisiblePost;
    } else if (direction === 'current') { // For re-fetching current page after like
        startDoc = state.firstVisiblePost; // Start from the first visible post of the current page
        endDoc = null; // Don't use endBefore for current, just re-fetch from start
    }

    const { posts, firstVisible, lastVisible } = await fetchPaginatedPosts(
        state.activeFilter,
        state.activeSort,
        startDoc,
        endDoc,
        state.users
    );
    if (posts.length > 0) {
        state.allPosts = posts;
        state.firstVisiblePost = firstVisible;
        state.lastVisiblePost = lastVisible;
        if (direction === 'next') state.currentPageNumber++;
        else if (direction === 'prev') state.currentPageNumber = Math.max(1, state.currentPageNumber - 1);
        // No page number change for 'current' direction
    } else if (direction === 'next') {
        alert("마지막 페이지입니다.");
    } else if (direction === 'prev') {
        alert("첫 페이지입니다.");
    }
}

// --- EVENT HANDLERS ---
function setupEventListeners() {
    document.body.addEventListener('submit', async (e) => {
        if (e.target.matches('.question-form') || e.target.matches('.search-form')) {
            e.preventDefault();
            if (!state.currentUser) {
                openLoginModal();
                return;
            }
            if (e.target.matches('.question-form')) {
                const content = e.target.elements['question-content'].value.trim();
                const title = content.split('\n')[0].substring(0, 50);
                if (content) {
                    e.target.elements['question-content'].value = '';
                    await createQuestion(title, content, state.currentUser);
                    await navigate('home');
                }
            } else {
                 await navigate('allPosts');
            }
        } else if (e.target.matches('.answer-form')) {
            e.preventDefault();
            if (!state.currentUser) {
                openLoginModal();
                return;
            }
            const content = e.target.elements['answer-content'].value.trim();
            const postId = e.target.dataset.postId;
            if (content && postId) {
                e.target.elements['answer-content'].value = '';
                await createAnswer(postId, content, state.currentUser);
                await navigate('postDetail', postId);
            }
        } else if (e.target.matches('#certification-form')) {
            e.preventDefault();
            const type = e.target.elements['certification-type'].value;
            const file = e.target.elements['certification-file'].files[0];
            if (type && file) {
                console.log('Certification submitted:', { type, fileName: file.name, fileSize: file.size });
                // Here you would typically upload the file to a server
                // and upon successful verification, update the user's state.
                // For now, we'll just close the modal.
                closeCertificationModal();
                alert('인증 서류가 제출되었습니다. 관리자 확인 후 반영됩니다.');
            }
        }
    });

    document.body.addEventListener('click', async (e) => {
        const target = e.target;

        // Close dropdowns if clicked outside
        if (!target.closest('.user-profile-menu')) toggleDropdown('user', true);
        if (!target.closest('.language-switcher')) toggleDropdown('language', true);

        // Modal interactions
        if (target.closest('#login-signup-button')) {
            e.preventDefault();
            openLoginModal();
        } else if (target.matches('#close-login-modal') || target.id === 'login-modal-overlay') {
            e.preventDefault();
            closeLoginModal();
        } else if (target.closest('#modal-google-login-button')) {
            e.preventDefault();
            try {
                await signInWithGoogle();
                closeLoginModal();
            } catch (error) {
                console.error("Google login failed:", error);
            }
        } else if (target.closest('#modal-facebook-login-button')) {
            e.preventDefault();
            try {
                await signInWithFacebook();
                closeLoginModal();
            } catch (error) {
                console.error("Facebook login failed:", error);
            }
        } 
        // Certification Modal
        else if (target.closest('.certification-prompt')) {
            e.preventDefault();
            openCertificationModal();
        } else if (target.closest('#certification-button')) {
            e.preventDefault();
            openCertificationModal();
        } else if (target.closest('.close-modal-button[data-target="#certification-modal"]') || target.id === 'certification-modal') {
            e.preventDefault();
            closeCertificationModal();
        }
        // Dropdown & Language
        else if (target.closest('#user-profile-pic')) {
            e.preventDefault();
            toggleDropdown('user');
        } else if (target.closest('#language-button')) {
            e.preventDefault();
            toggleDropdown('language');
        } else if (target.closest('.language-option')) {
            e.preventDefault();
            const lang = target.closest('.language-option').dataset.lang;
            setLanguage(lang);
            render();
            toggleDropdown('language', true);
        }
        // A/B Test view switch
        else if (target.closest('#switch-to-search-view') || target.closest('#switch-to-question-view')) {
            e.preventDefault();
            state.abTestGroup = state.abTestGroup === 'A' ? 'B' : 'A';
            localStorage.setItem('abTestGroup', state.abTestGroup);
            render();
        }
        // Page navigation and actions
        else if (target.closest('.like-button')) {
            e.preventDefault();
            if (!state.currentUser) {
                openLoginModal();
                return;
            }
            const button = target.closest('.like-button');
            const type = button.dataset.type; // 'post' or 'answer'
            const id = button.dataset.id;
            const postId = button.dataset.postId; // Only for answers

            try {
                await updateLikes(type, id, postId);
                // Re-render the current page to reflect updated likes
                if (state.currentPage === 'postDetail') {
                    navigate('postDetail', state.currentPostId);
                } else if (state.currentPage === 'allPosts') {
                    await handleFetchPaginatedPosts('current'); // Re-fetch current page posts
                } else if (state.currentPage === 'home') {
                    navigate('home');
                }
            } catch (error) {
                console.error("Error updating likes:", error);
                alert("좋아요 업데이트에 실패했습니다.");
            }
        } else if (target.closest('.share-button')) {
            e.preventDefault();
            const postId = target.closest('.share-button').dataset.postId;
            const postUrl = `${window.location.origin}/#postDetail/${postId}`;
            try {
                await navigator.clipboard.writeText(postUrl);
                alert('게시글 링크가 클립보드에 복사되었습니다!');
            } catch (err) {
                console.error('클립보드 복사 실패:', err);
                alert('게시글 링크 복사에 실패했습니다.');
            }
        } else if (target.closest('.post-card')) {
            e.preventDefault();
            const postId = target.closest('.post-card').dataset.postId;
            if (postId) {
                navigate('postDetail', postId);
            } else {
                console.error('Could not find post-id on clicked card.');
            }
        } else if (target.closest('.back-button') || target.closest('.logo')) {
            e.preventDefault();
            navigate('home');
        } else if (target.closest('.load-more-button')) {
            e.preventDefault();
            navigate('allPosts');
        } else if (target.matches('.filter-button')) {
            e.preventDefault();
            const type = target.dataset.type;
            const value = target.dataset.value;
            navigate('allPosts', { filter: { type, value } });
        } else if (target.matches('.sort-button')) {
            e.preventDefault();
            const sortType = target.dataset.sortType;
            navigate('allPosts', { sort: sortType });
        } else if (target.matches('.next-page-button')) {
            e.preventDefault();
            state.isLoading = true; render();
            await handleFetchPaginatedPosts('next');
            state.isLoading = false; render();
        } else if (target.matches('.prev-page-button')) {
            e.preventDefault();
            state.isLoading = true; render();
            await handleFetchPaginatedPosts('prev');
            state.isLoading = false; render();
        } else if (target.closest('.accept-answer-button')) {
            e.preventDefault();
            const button = target.closest('.accept-answer-button');
            const answerId = button.dataset.answerId;
            const postId = button.dataset.postId;

            try {
                await acceptAnswer(postId, answerId);
                alert('답변이 채택되었습니다!');
                navigate('postDetail', postId); // Re-render post detail page
            } catch (error) {
                console.error("답변 채택 실패:", error);
                alert("답변 채택에 실패했습니다.");
            }
        // 관리자 대시보드 버튼 이벤트 제거됨
        } else if (target.matches('.delete-post-button')) {
            e.preventDefault();
            const postIdToDelete = target.dataset.postId;
            if (confirm(`정말로 이 게시글 (ID: ${postIdToDelete})을 삭제하시겠습니까?`)) {
                try {
                    await deletePost(postIdToDelete);
                    alert('게시글이 삭제되었습니다.');
                    // 관리자 모달 닫기 제거됨
                    navigate('home'); // Refresh page after deletion
                } catch (error) {
                    console.error("게시글 삭제 실패:", error);
                    alert("게시글 삭제에 실패했습니다.");
                }
            }
        } else if (target.closest('#logout-button')) {
            e.preventDefault();
            try {
                await signOutUser();
            } catch (error) {
                console.error("Logout failed:", error);
            }
        }
    });
}

// --- INITIALIZATION ---
async function init() {
    initI18n();
    state.language = getLanguage();

    let group = localStorage.getItem('abTestGroup');
    if (!group) {
        group = Math.random() < 0.5 ? 'A' : 'B';
        localStorage.setItem('abTestGroup', group);
    }
    state.abTestGroup = group;
    
    setupEventListeners();

    onAuthChange(async (user) => {
        if (user) {
            // Firebase에서 사용자 데이터를 가져와 state.currentUser에 저장
            state.currentUser = await getUser(user.id, state.users);
            state.users[user.id] = state.currentUser; // 캐시 업데이트
        } else {
            state.currentUser = null;
        }
        render();
    });

    await populateDatabase();
    await navigate('home');
}

// --- APP START ---
init();