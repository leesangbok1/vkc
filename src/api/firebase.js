// --- MOCK DATA & MOCK API ---

// --- MOCK DATA ---
const mockUsers = {
    'user01': { id: 'user01', name: 'Minh', profilePic: 'https://placehold.co/40x40/31343C/FFFFFF?text=M', isAdmin: true, email: 'minh@example.com' },
    'user02': { id: 'user02', name: 'Hoa', profilePic: 'https://placehold.co/40x40/9C27B0/FFFFFF?text=H', certification: '운전면허', email: 'hoa@example.com' },
    'user03': { id: 'user03', name: 'Khang', profilePic: 'https://placehold.co/40x40/00BCD4/FFFFFF?text=K', email: 'khang@example.com' },
    'user04': { id: 'user04', name: 'Linh', profilePic: 'https://placehold.co/40x40/FF5722/FFFFFF?text=L', email: 'linh@example.com' },
    'expert01': { id: 'expert01', name: '김민준 행정사', profilePic: 'https://placehold.co/40x40/4CAF50/FFFFFF?text=E', isExpert: true, certification: '행정사', email: 'expert01@example.com' },
    'expert02': { id: 'expert02', name: '박서준 변호사', profilePic: 'https://placehold.co/40x40/FFC107/000000?text=E', isExpert: true, certification: '변호사', email: 'expert02@example.com' },
};
let mockPosts = [
    { id: 'post001', title: 'F-2-R 비자, 지역특화형 비자에 대해 궁금합니다.', authorId: 'user01', content: '안녕하세요. 최근에 F-2-R 비자에 대해 알게 되었습니다. 요건이 어떻게 되고, 어떤 지역에서 신청할 수 있는지 경험자분들의 조언을 구합니다.', category: 'Visa/Legal', tags: ['F-2-R', '비자'], createdAt: new Date('2024-07-30T10:00:00'), viewCount: 150, answerCount: 2, likes: 5 },
    { id: 'post002', title: '한국에서 운전면허 교환 발급 절차는 어떻게 되나요?', authorId: 'user02', content: '베트남 면허증을 한국 면허증으로 바꾸고 싶습니다. 필요한 서류와 절차, 소요 기간이 궁금해요.', category: 'Life', tags: ['운전면허', '생활정보'], createdAt: new Date('2024-07-29T14:30:00'), viewCount: 250, answerCount: 1, likes: 10 },
    { id: 'post003', title: 'TOPIK 시험 준비, 효과적인 공부법 좀 알려주세요.', authorId: 'user03', content: '읽기, 듣기, 쓰기 파트별로 어떻게 공부해야 효율적일까요? 점수가 잘 안 올라서 고민입니다.', category: 'Education', tags: ['TOPIK', '공부'], createdAt: new Date('2024-07-28T09:00:00'), viewCount: 300, answerCount: 0, likes: 3 },
    { id: 'post004', title: '외국인 근로자 고용 관련 법률 자문 구합니다.', authorId: 'expert01', content: '저희 회사에서 외국인 근로자를 고용하려고 하는데, 관련 법률 및 비자 문제에 대해 전문가의 자문이 필요합니다.', category: 'Employment', tags: ['외국인근로자', '고용', '법률'], createdAt: new Date('2024-07-27T11:00:00'), viewCount: 180, answerCount: 1, likes: 7 },
    { id: 'post005', title: '한국에서 전세 계약 시 주의할 점은 무엇인가요?', authorId: 'user04', content: '처음으로 한국에서 전세 계약을 하려고 합니다. 사기당하지 않으려면 어떤 점을 주의해야 할까요?', category: 'Housing', tags: ['전세', '계약', '부동산'], createdAt: new Date('2024-07-26T16:00:00'), viewCount: 220, answerCount: 0, likes: 2 },
    { id: 'post006', title: '한국 건강보험 외국인 가입 절차 및 혜택 문의', authorId: 'user01', content: '한국 건강보험에 외국인도 가입할 수 있다고 들었습니다. 가입 절차와 어떤 혜택을 받을 수 있는지 궁금합니다.', category: 'Healthcare', tags: ['건강보험', '외국인', '의료'], createdAt: new Date('2024-07-25T09:30:00'), viewCount: 190, answerCount: 0, likes: 8 },
];
let mockAnswers = {
    'post001': [
        { id: 'ans001', authorId: 'user02', content: '저도 작년에 신청해서 받았습니다! 일단 해당 지역에 거주해야 하고, 지자체에서 발급하는 추천서가 필수입니다. 소득 요건도 있으니 공고를 잘 확인해야 해요.', createdAt: new Date('2024-07-30T11:00:00'), likes: 3, isAccepted: false },
        { id: 'ans002', authorId: 'expert01', content: '전문가 의견: F-2-R 비자는 인구감소지역 활성화를 위한 제도로, 지자체별 요건이 상이합니다. 기본적으로 법무부 고시 소득요건(전년도 GNI 70% 이상)과 해당 지자체의 추천서가 핵심입니다. 추천서 발급 기준(취업/창업 분야, 거주 기간 등)을 먼저 확인하시는 것이 중요합니다.', createdAt: new Date('2024-07-30T15:00:00'), likes: 7, isAccepted: true },
    ],
    'post002': [
        { id: 'ans003', authorId: 'user03', content: '대사관에서 베트남 면허증 번역 공증을 받고, 출입국사실증명서, 신분증 등을 챙겨서 가까운 운전면허시험장에 가면 됩니다. 간단한 신체검사 후 바로 발급해줬어요.', createdAt: new Date('2024-07-29T16:00:00'), likes: 2, isAccepted: false },
    ],
};

// --- MOCK AUTH ---
let currentUser = null;

export async function signInWithGoogle() {
    // 목업: 첫 번째 유저로 로그인
    currentUser = mockUsers['user01'];
    return currentUser;
}

export async function signInWithFacebook() {
    // 목업: 두 번째 유저로 로그인
    currentUser = mockUsers['user02'];
    return currentUser;
}

export async function signOutUser() {
    currentUser = null;
}

export function onAuthChange(callback) {
    // 목업: 즉시 현재 사용자 전달
    callback(currentUser);
}



// populateDatabase는 필요 없음 (목업 데이터는 이미 위에 있음)
export async function populateDatabase() {
    // no-op
}

export async function getUser(userId, usersCache) {
    if (usersCache && usersCache[userId]) return usersCache[userId];
    if (mockUsers[userId]) {
        if (usersCache) usersCache[userId] = mockUsers[userId];
        return mockUsers[userId];
    }
    return { name: 'Unknown User', profilePic: '' };
}

export async function fetchHomepagePosts(usersCache) {
    // 최신순 10개
    const posts = [...mockPosts].sort((a, b) => b.createdAt - a.createdAt).slice(0, 10);
    return Promise.all(posts.map(async (post) => {
        const author = await getUser(post.authorId, usersCache);
        return { ...post, author };
    }));
}

export async function fetchPostDetails(postId, usersCache) {
    const post = mockPosts.find((p) => p.id === postId);
    if (!post) return null;
    const author = await getUser(post.authorId, usersCache);
    const answers = (mockAnswers[postId] || []);
    const answersWithAuthors = await Promise.all(answers.map(async (ans) => {
        const answerAuthor = await getUser(ans.authorId, usersCache);
        return { ...ans, author: answerAuthor };
    }));
    return { ...post, author, answers: answersWithAuthors };
}

export async function fetchPaginatedPosts(filter, sortType, lastVisible, firstVisible, usersCache) {
    let posts = [...mockPosts];
    const { type, value } = filter;
    if (type === 'category' && value) {
        posts = posts.filter((p) => p.category === value);
    } else if (type === 'engagement' && value === 'Unanswered') {
        posts = posts.filter((p) => p.answerCount === 0);
    }
    // 정렬
    const orderByField = sortType === 'viewCount' ? 'viewCount' : 'createdAt';
    posts.sort((a, b) => b[orderByField] - a[orderByField]);
    // 페이징 (lastVisible, firstVisible은 무시)
    posts = posts.slice(0, 10);
    const postsWithAuthors = await Promise.all(posts.map(async (post) => {
        const author = await getUser(post.authorId, usersCache);
        return { ...post, author };
    }));
    return {
        posts: postsWithAuthors,
        firstVisible: postsWithAuthors[0],
        lastVisible: postsWithAuthors[postsWithAuthors.length - 1],
    };
}

export async function createQuestion(title, content, user) {
    const newPost = {
        id: `post${Math.random().toString(36).slice(2, 10)}`,
        title,
        content,
        authorId: user.id,
        createdAt: new Date(),
        category: 'General',
        tags: [],
        viewCount: 0,
        answerCount: 0,
        likes: 0,
    };
    mockPosts.unshift(newPost);
    return newPost;
}

export async function createAnswer(postId, content, user) {
    const newAnswer = {
        id: `ans${Math.random().toString(36).slice(2, 10)}`,
        content,
        authorId: user.id,
        createdAt: new Date(),
        likes: 0,
        isAccepted: false,
    };
    if (!mockAnswers[postId]) mockAnswers[postId] = [];
    mockAnswers[postId].push(newAnswer);
    // answerCount 증가
    const post = mockPosts.find((p) => p.id === postId);
    if (post) post.answerCount++;
    return newAnswer;
}

export async function updateLikes(type, id, postId = null) {
    if (type === 'post') {
        const post = mockPosts.find((p) => p.id === id);
        if (post) post.likes++;
    } else if (type === 'answer' && postId) {
        const answer = (mockAnswers[postId] || []).find((a) => a.id === id);
        if (answer) answer.likes++;
    }
}

export async function acceptAnswer(postId, answerId) {
    const answer = (mockAnswers[postId] || []).find((a) => a.id === answerId);
    if (answer) answer.isAccepted = true;
}

export async function deletePost(postId) {
    mockPosts = mockPosts.filter((p) => p.id !== postId);
    delete mockAnswers[postId];
}
