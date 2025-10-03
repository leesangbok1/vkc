"use strict";(()=>{var a={};a.id=995,a.ids=[220,995],a.modules={8732:a=>{a.exports=require("react/jsx-runtime")},33873:a=>{a.exports=require("path")},40361:a=>{a.exports=require("next/dist/compiled/next-server/pages.runtime.prod.js")},42472:(a,b,c)=>{c.r(b),c.d(b,{config:()=>u,default:()=>q,getServerSideProps:()=>t,getStaticPaths:()=>s,getStaticProps:()=>r,handler:()=>C,reportWebVitals:()=>v,routeModule:()=>B,unstable_getServerProps:()=>z,unstable_getServerSideProps:()=>A,unstable_getStaticParams:()=>y,unstable_getStaticPaths:()=>x,unstable_getStaticProps:()=>w});var d={};c.r(d),c.d(d,{default:()=>o});var e=c(63885),f=c(80237),g=c(81413),h=c(65611),i=c.n(h),j=c(625),k=c.n(j),l=c(8732),m=c(82015);!function(){var a=Error("Cannot find module '@services/AuthContext'");throw a.code="MODULE_NOT_FOUND",a}(),function(){var a=Error("Cannot find module '@services/RealtimeContext'");throw a.code="MODULE_NOT_FOUND",a}(),function(){var a=Error("Cannot find module '@components/common/LoadingSpinner'");throw a.code="MODULE_NOT_FOUND",a}(),function(){var a=Error("Cannot find module '@components/questions/QuestionCard'");throw a.code="MODULE_NOT_FOUND",a}(),function(){var a=Error("Cannot find module '@components/filters/CategoryFilter'");throw a.code="MODULE_NOT_FOUND",a}();let n=`
/* All Posts Page Styles */
.all-posts-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #f0f0f0;
}

.header-content h1 {
  color: #333;
  font-size: 2rem;
  margin: 0 0 8px 0;
}

.header-content p {
  color: #666;
  margin: 0;
  font-size: 1.1rem;
}

.new-question-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background-color 0.2s ease;
}

.new-question-btn:hover {
  background: #0056b3;
}

/* Status Bar */
.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8f9fa;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid #e0e0e0;
}

.status-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
}

.status-indicator.connected {
  color: #28a745;
}

.status-indicator.disconnected {
  color: #dc3545;
}

.total-count {
  color: #666;
  font-size: 14px;
}

.refresh-btn {
  background: none;
  border: none;
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
  color: #666;
  transition: all 0.2s ease;
}

.refresh-btn:hover {
  background-color: #e0e0e0;
  color: #007bff;
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinning {
  animation: spin 1s linear infinite;
}

/* Filters Section */
.filters-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.search-bar {
  margin-bottom: 20px;
}

.search-input-wrapper {
  position: relative;
  max-width: 500px;
}

.search-input-wrapper i {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
}

.search-input {
  width: 100%;
  padding: 12px 45px 12px 45px;
  border: 1px solid #e0e0e0;
  border-radius: 25px;
  font-size: 14px;
  transition: border-color 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.clear-search {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.clear-search:hover {
  background: #f0f0f0;
  color: #333;
}

.filter-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.sort-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.sort-controls label {
  color: #666;
  font-weight: 500;
  font-size: 14px;
}

.sort-select {
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  font-size: 14px;
}

.sort-select:focus {
  outline: none;
  border-color: #007bff;
}

/* Posts Container */
.posts-container {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.posts-grid {
  display: grid;
  gap: 20px;
}

/* Load More */
.load-more-section {
  margin-top: 30px;
  text-align: center;
}

.load-more-btn {
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  padding: 15px 30px;
  border-radius: 8px;
  cursor: pointer;
  color: #666;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  transition: all 0.2s ease;
}

.load-more-btn:hover:not(:disabled) {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.load-more-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.empty-icon {
  font-size: 4rem;
  color: #ddd;
  margin-bottom: 20px;
}

.empty-state h3 {
  color: #333;
  margin-bottom: 10px;
}

.empty-state p {
  margin-bottom: 30px;
  line-height: 1.6;
}

.clear-filters-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.clear-filters-btn:hover {
  background: #0056b3;
}

/* Error State */
.error-state {
  text-align: center;
  padding: 60px 20px;
}

.error-icon {
  font-size: 4rem;
  color: #dc3545;
  margin-bottom: 20px;
}

.error-state h3 {
  color: #dc3545;
  margin-bottom: 10px;
}

.error-state p {
  color: #666;
  margin-bottom: 30px;
}

.retry-btn {
  background: #dc3545;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.retry-btn:hover {
  background: #c82333;
}

/* Animations */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive Design */
@media (max-width: 1024px) {
  .filter-controls {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
  }

  .sort-controls {
    justify-content: flex-end;
  }
}

@media (max-width: 768px) {
  .all-posts-page {
    padding: 10px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .header-content h1 {
    font-size: 1.6rem;
  }

  .header-content p {
    font-size: 1rem;
  }

  .status-bar {
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }

  .status-info {
    flex-direction: column;
    gap: 10px;
  }

  .filters-section {
    padding: 15px;
  }

  .search-input-wrapper {
    max-width: none;
  }

  .filter-controls {
    gap: 10px;
  }

  .posts-container {
    padding: 15px;
  }
}

/* Dark mode support */
[data-theme="dark"] .filters-section,
[data-theme="dark"] .posts-container {
  background: #2d2d2d;
}

[data-theme="dark"] .status-bar {
  background: #404040;
  border-color: #555;
}

[data-theme="dark"] .search-input {
  background: #404040;
  border-color: #555;
  color: #ffffff;
}

[data-theme="dark"] .sort-select {
  background: #404040;
  border-color: #555;
  color: #ffffff;
}

[data-theme="dark"] .load-more-btn {
  background: #404040;
  border-color: #555;
  color: #ffffff;
}

[data-theme="dark"] .clear-search:hover {
  background: #555;
}
`;if("undefined"!=typeof document){let a=document.createElement("style");a.textContent=n,document.head.appendChild(a)}let o=()=>{let{user:a}=Object(function(){var a=Error("Cannot find module '@services/AuthContext'");throw a.code="MODULE_NOT_FOUND",a}())(),{isConnected:b}=Object(function(){var a=Error("Cannot find module '@services/RealtimeContext'");throw a.code="MODULE_NOT_FOUND",a}())(),[c,d]=(0,m.useState)([]),[e,f]=(0,m.useState)(!0),[g,h]=(0,m.useState)(null),[i,j]=(0,m.useState)("all"),[k,n]=(0,m.useState)("latest"),[o,p]=(0,m.useState)(""),[q,r]=(0,m.useState)(1),[s,t]=(0,m.useState)(!0),[u,v]=(0,m.useState)(!1),w=[{id:1,title:"한국에서 비자 연장하는 방법을 알고 싶습니다.",content:"안녕하세요. 베트남에서 온 유학생입니다. 학생 비자가 곧 만료되는데...",category:"비자",tags:["비자연장","학생비자"],author:{name:"Nguyen Van A",profilePic:"/images/default-avatar.png"},createdAt:new Date().toISOString(),views:124,likes:8,answers:3,isAnswered:!0},{id:2,title:"TOPIK 시험 준비 어떻게 하나요?",content:"TOPIK 6급을 목표로 하고 있습니다. 효과적인 공부 방법이 있을까요?",category:"교육",tags:["TOPIK","한국어시험"],author:{name:"Tran Thi B",profilePic:"/images/default-avatar.png"},createdAt:new Date(Date.now()-864e5).toISOString(),views:89,likes:12,answers:7,isAnswered:!0},{id:3,title:"한국에서 일자리 구하는 팁",content:"졸업 후 한국에서 취업을 희망합니다. 어떤 준비를 해야 할까요?",category:"취업",tags:["취업","구직"],author:{name:"Le Van C",profilePic:"/images/default-avatar.png"},createdAt:new Date(Date.now()-1728e5).toISOString(),views:156,likes:15,answers:5,isAnswered:!1}],x=async(a=1,b=!1)=>{try{b||(h(null),f(!0)),await new Promise(a=>setTimeout(a,500));let c=w.map(b=>({...b,id:b.id+(a-1)*10}));b?d(a=>[...a,...c]):d(c),t(a<3)}catch(a){console.error("게시물 로드 실패:",a),h("게시물을 불러오는데 실패했습니다.")}finally{f(!1),v(!1)}};(0,m.useEffect)(()=>{x(1)},[]);let y=c.filter(a=>{let b="all"===i||a.category===i,c=""===o||a.title.toLowerCase().includes(o.toLowerCase())||a.content.toLowerCase().includes(o.toLowerCase())||a.tags.some(a=>a.toLowerCase().includes(o.toLowerCase()));return b&&c}).sort((a,b)=>{switch(k){case"latest":return new Date(b.createdAt)-new Date(a.createdAt);case"oldest":return new Date(a.createdAt)-new Date(b.createdAt);case"popular":return b.views-a.views;case"likes":return b.likes-a.likes;case"answers":return b.answers-a.answers;default:return 0}}),z=async()=>{v(!0),r(1),await x(1)};return e&&0===c.length?(0,l.jsxs)("div",{className:"all-posts-page",children:[(0,l.jsx)("div",{className:"page-header",children:(0,l.jsx)("h1",{children:"전체 질문"})}),(0,l.jsx)("div",{className:"posts-container",children:(0,l.jsx)(Object(function(){var a=Error("Cannot find module '@components/common/LoadingSpinner'");throw a.code="MODULE_NOT_FOUND",a}()),{lines:8})})]}):(0,l.jsxs)("div",{className:"all-posts-page",children:[(0,l.jsxs)("div",{className:"page-header",children:[(0,l.jsxs)("div",{className:"header-content",children:[(0,l.jsx)("h1",{children:"전체 질문"}),(0,l.jsx)("p",{children:"한국 거주 베트남인들의 모든 질문과 답변을 확인하세요"})]}),(0,l.jsx)("div",{className:"header-actions",children:(0,l.jsxs)("button",{className:"new-question-btn",children:[(0,l.jsx)("i",{className:"fa-solid fa-plus"}),"새 질문 작성"]})})]}),(0,l.jsxs)("div",{className:"status-bar",children:[(0,l.jsxs)("div",{className:"status-info",children:[(0,l.jsxs)("div",{className:`status-indicator ${b?"connected":"disconnected"}`,children:[(0,l.jsx)("i",{className:`fa-solid ${b?"fa-wifi":"fa-wifi-slash"}`}),(0,l.jsx)("span",{children:b?"실시간 연결됨":"오프라인 모드"})]}),(0,l.jsxs)("span",{className:"total-count",children:["총 ",y.length,"개 질문"]})]}),(0,l.jsx)("button",{className:"refresh-btn",onClick:z,disabled:u,title:"새로고침",children:(0,l.jsx)("i",{className:`fa-solid fa-refresh ${u?"spinning":""}`})})]}),(0,l.jsxs)("div",{className:"filters-section",children:[(0,l.jsx)("div",{className:"search-bar",children:(0,l.jsxs)("div",{className:"search-input-wrapper",children:[(0,l.jsx)("i",{className:"fa-solid fa-search"}),(0,l.jsx)("input",{type:"text",placeholder:"질문 제목, 내용, 태그로 검색...",value:o,onChange:a=>p(a.target.value),className:"search-input"}),o&&(0,l.jsx)("button",{className:"clear-search",onClick:()=>p(""),"aria-label":"검색어 지우기",children:(0,l.jsx)("i",{className:"fa-solid fa-times"})})]})}),(0,l.jsxs)("div",{className:"filter-controls",children:[(0,l.jsx)(Object(function(){var a=Error("Cannot find module '@components/filters/CategoryFilter'");throw a.code="MODULE_NOT_FOUND",a}()),{selectedCategory:i,onCategoryChange:j,showAll:!0}),(0,l.jsxs)("div",{className:"sort-controls",children:[(0,l.jsx)("label",{htmlFor:"sort-select",children:"정렬:"}),(0,l.jsxs)("select",{id:"sort-select",value:k,onChange:a=>n(a.target.value),className:"sort-select",children:[(0,l.jsx)("option",{value:"latest",children:"최신순"}),(0,l.jsx)("option",{value:"oldest",children:"오래된순"}),(0,l.jsx)("option",{value:"popular",children:"인기순"}),(0,l.jsx)("option",{value:"likes",children:"좋아요순"}),(0,l.jsx)("option",{value:"answers",children:"답변순"})]})]})]})]}),(0,l.jsx)("div",{className:"posts-container",children:g?(0,l.jsxs)("div",{className:"error-state",children:[(0,l.jsx)("div",{className:"error-icon",children:(0,l.jsx)("i",{className:"fa-solid fa-exclamation-triangle"})}),(0,l.jsx)("h3",{children:"오류가 발생했습니다"}),(0,l.jsx)("p",{children:g}),(0,l.jsxs)("button",{className:"retry-btn",onClick:()=>x(1),children:[(0,l.jsx)("i",{className:"fa-solid fa-refresh"}),"다시 시도"]})]}):0===y.length?(0,l.jsxs)("div",{className:"empty-state",children:[(0,l.jsx)("div",{className:"empty-icon",children:(0,l.jsx)("i",{className:"fa-solid fa-search"})}),(0,l.jsx)("h3",{children:"검색 결과가 없습니다"}),(0,l.jsx)("p",{children:o||"all"!==i?"검색 조건을 변경해보세요.":"아직 등록된 질문이 없습니다."}),(o||"all"!==i)&&(0,l.jsx)("button",{className:"clear-filters-btn",onClick:()=>{p(""),j("all")},children:"필터 초기화"})]}):(0,l.jsxs)(l.Fragment,{children:[(0,l.jsx)("div",{className:"posts-grid",children:y.map(a=>(0,l.jsx)(Object(function(){var a=Error("Cannot find module '@components/questions/QuestionCard'");throw a.code="MODULE_NOT_FOUND",a}()),{question:a,showAuthor:!0,showStats:!0,showCategory:!0},a.id))}),s&&(0,l.jsx)("div",{className:"load-more-section",children:(0,l.jsx)("button",{className:"load-more-btn",onClick:()=>{let a=q+1;r(a),x(a,!0)},disabled:e,children:e?(0,l.jsxs)(l.Fragment,{children:[(0,l.jsx)(Object(function(){var a=Error("Cannot find module '@components/common/LoadingSpinner'");throw a.code="MODULE_NOT_FOUND",a}()),{size:"small"}),"로딩 중..."]}):(0,l.jsxs)(l.Fragment,{children:[(0,l.jsx)("i",{className:"fa-solid fa-plus"}),"더 많은 질문 보기"]})})})]})})]})};var p=c(12289);let q=(0,g.M)(d,"default"),r=(0,g.M)(d,"getStaticProps"),s=(0,g.M)(d,"getStaticPaths"),t=(0,g.M)(d,"getServerSideProps"),u=(0,g.M)(d,"config"),v=(0,g.M)(d,"reportWebVitals"),w=(0,g.M)(d,"unstable_getStaticProps"),x=(0,g.M)(d,"unstable_getStaticPaths"),y=(0,g.M)(d,"unstable_getStaticParams"),z=(0,g.M)(d,"unstable_getServerProps"),A=(0,g.M)(d,"unstable_getServerSideProps"),B=new e.PagesRouteModule({definition:{kind:f.RouteKind.PAGES,page:"/AllPostsPage",pathname:"/AllPostsPage",bundlePath:"",filename:""},distDir:".next",relativeProjectDir:"",components:{App:k(),Document:i()},userland:d}),C=(0,p.U)({srcPage:"/AllPostsPage",config:u,userland:d,routeModule:B,getStaticPaths:s,getStaticProps:r,getServerSideProps:t})},46060:a=>{a.exports=require("next/dist/shared/lib/no-fallback-error.external.js")},82015:a=>{a.exports=require("react")}};var b=require("../webpack-runtime.js");b.C(a);var c=b.X(0,[611,157],()=>b(b.s=42472));module.exports=c})();