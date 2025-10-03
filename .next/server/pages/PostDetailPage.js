"use strict";(()=>{var a={};a.id=784,a.ids=[220,784],a.modules={8732:a=>{a.exports=require("react/jsx-runtime")},33873:a=>{a.exports=require("path")},40361:a=>{a.exports=require("next/dist/compiled/next-server/pages.runtime.prod.js")},46060:a=>{a.exports=require("next/dist/shared/lib/no-fallback-error.external.js")},70668:(a,b,c)=>{c.r(b),c.d(b,{config:()=>v,default:()=>r,getServerSideProps:()=>u,getStaticPaths:()=>t,getStaticProps:()=>s,handler:()=>D,reportWebVitals:()=>w,routeModule:()=>C,unstable_getServerProps:()=>A,unstable_getServerSideProps:()=>B,unstable_getStaticParams:()=>z,unstable_getStaticPaths:()=>y,unstable_getStaticProps:()=>x});var d={};c.r(d),c.d(d,{default:()=>p});var e=c(63885),f=c(80237),g=c(81413),h=c(65611),i=c.n(h),j=c(625),k=c.n(j),l=c(8732),m=c(82015);let n=require("react-router-dom");!function(){var a=Error("Cannot find module '@services/AuthContext'");throw a.code="MODULE_NOT_FOUND",a}(),function(){var a=Error("Cannot find module '@components/common/LoadingSpinner'");throw a.code="MODULE_NOT_FOUND",a}();let o=`
/* Post Detail Page Styles */
.post-detail-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.post-detail-container {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

/* Question Section */
.question-section {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.question-meta {
  display: flex;
  align-items: center;
  gap: 15px;
}

.category-badge {
  background: #007bff;
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.post-date {
  color: #666;
  font-size: 14px;
}

.question-stats {
  display: flex;
  gap: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #666;
  font-size: 14px;
}

.question-title {
  color: #333;
  font-size: 1.8rem;
  margin-bottom: 20px;
  line-height: 1.4;
}

.question-content {
  color: #444;
  line-height: 1.6;
  margin-bottom: 20px;
}

.question-content p {
  margin-bottom: 15px;
}

.question-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}

.tag {
  background: #f8f9fa;
  color: #666;
  padding: 4px 10px;
  border-radius: 15px;
  font-size: 13px;
  border: 1px solid #e0e0e0;
}

.question-author {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.author-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.author-name {
  font-weight: 500;
  color: #333;
}

.question-actions {
  display: flex;
  gap: 15px;
}

.action-btn {
  background: none;
  border: 1px solid #e0e0e0;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  color: #666;
  font-size: 14px;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: #f8f9fa;
  border-color: #007bff;
  color: #007bff;
}

/* Answers Section */
.answers-section {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.answers-title {
  color: #333;
  font-size: 1.4rem;
  margin-bottom: 25px;
  padding-bottom: 10px;
  border-bottom: 2px solid #f0f0f0;
}

.answers-list {
  display: flex;
  flex-direction: column;
  gap: 25px;
  margin-bottom: 30px;
}

.answer-item {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  position: relative;
}

.answer-item.accepted {
  border-color: #28a745;
  background: #f8fff9;
}

.accepted-badge {
  position: absolute;
  top: -10px;
  left: 20px;
  background: #28a745;
  color: white;
  padding: 4px 12px;
  border-radius: 15px;
  font-size: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
}

.answer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.answer-author {
  display: flex;
  align-items: center;
  gap: 10px;
}

.author-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.expert-badge {
  background: #ffc107;
  color: #333;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 10px;
  margin-left: 8px;
  display: inline-flex;
  align-items: center;
  gap: 2px;
}

.answer-date {
  color: #666;
  font-size: 12px;
}

.answer-actions .like-btn {
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
}

.answer-content {
  color: #444;
  line-height: 1.6;
}

/* Answer Form */
.answer-form {
  border-top: 2px solid #f0f0f0;
  padding-top: 25px;
}

.answer-form h3 {
  color: #333;
  margin-bottom: 15px;
}

.answer-textarea {
  width: 100%;
  padding: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.5;
  resize: vertical;
  margin-bottom: 15px;
  font-family: inherit;
}

.answer-textarea:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.submit-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background-color 0.2s ease;
}

.submit-btn:hover:not(:disabled) {
  background: #0056b3;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Login Prompt */
.login-prompt {
  text-align: center;
  padding: 30px;
  background: #f8f9fa;
  border-radius: 8px;
  border-top: 2px solid #f0f0f0;
  margin-top: 25px;
}

.login-prompt p {
  color: #666;
  margin-bottom: 15px;
}

.login-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}

/* Error Page */
.error-page {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-content {
  text-align: center;
  padding: 40px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.error-content h2 {
  color: #dc3545;
  margin-bottom: 15px;
}

.error-content p {
  color: #666;
  margin-bottom: 25px;
}

.btn-primary {
  background: #007bff;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  text-decoration: none;
  display: inline-block;
}

/* Responsive Design */
@media (max-width: 768px) {
  .post-detail-page {
    padding: 10px;
  }

  .question-section,
  .answers-section {
    padding: 20px;
  }

  .question-title {
    font-size: 1.5rem;
  }

  .question-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .question-stats {
    gap: 15px;
  }

  .answer-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}

/* Dark mode support */
[data-theme="dark"] .question-section,
[data-theme="dark"] .answers-section {
  background: #2d2d2d;
}

[data-theme="dark"] .answer-item {
  border-color: #555;
  background: #404040;
}

[data-theme="dark"] .answer-item.accepted {
  background: #1a3d1a;
  border-color: #28a745;
}

[data-theme="dark"] .answer-textarea {
  background: #404040;
  border-color: #555;
  color: #ffffff;
}

[data-theme="dark"] .login-prompt {
  background: #404040;
}
`;if("undefined"!=typeof document){let a=document.createElement("style");a.textContent=o,document.head.appendChild(a)}let p=()=>{let{id:a}=(0,n.useParams)(),b=(0,n.useNavigate)(),{user:c}=Object(function(){var a=Error("Cannot find module '@services/AuthContext'");throw a.code="MODULE_NOT_FOUND",a}())(),[d,e]=(0,m.useState)(null),[f,g]=(0,m.useState)([]),[h,i]=(0,m.useState)(!0),[j,k]=(0,m.useState)(null),[o,p]=(0,m.useState)(""),[q,r]=(0,m.useState)(!1);(0,m.useEffect)(()=>{s()},[a]);let s=async()=>{try{i(!0),e({id:a,title:"한국에서 비자 연장하는 방법을 알고 싶습니다.",content:"안녕하세요. 베트남에서 온 유학생입니다. 학생 비자가 곧 만료되는데 연장 방법을 자세히 알고 싶습니다.",category:"비자",tags:["비자연장","학생비자","출입국"],author:{name:"Nguyen Van A",profilePic:"/images/default-avatar.png"},createdAt:new Date().toISOString(),views:124,likes:8,answers:3}),g([{id:1,content:"학생 비자 연장은 출입국사무소에서 진행하시면 됩니다. 필요한 서류는 재학증명서, 성적증명서, 통장잔고증명서 등입니다.",author:{name:"김민준 행정사",profilePic:"/images/expert1.png",isExpert:!0},createdAt:new Date().toISOString(),likes:12,isAccepted:!0}])}catch(a){console.error("게시물 로드 실패:",a),k("게시물을 불러오는데 실패했습니다.")}finally{i(!1)}},t=async a=>{if(a.preventDefault(),!c)return void alert("로그인이 필요합니다.");if(!o.trim())return void alert("답변 내용을 입력해주세요.");try{r(!0);let a={id:Date.now(),content:o,author:{name:c.name,profilePic:c.profilePic||"/images/default-avatar.png",isExpert:!1},createdAt:new Date().toISOString(),likes:0,isAccepted:!1};g([...f,a]),p(""),alert("답변이 등록되었습니다.")}catch(a){console.error("답변 등록 실패:",a),alert("답변 등록에 실패했습니다.")}finally{r(!1)}};return h?(0,l.jsx)(Object(function(){var a=Error("Cannot find module '@components/common/LoadingSpinner'");throw a.code="MODULE_NOT_FOUND",a}()),{size:"large",text:"게시물을 불러오는 중...",fullscreen:!0}):j?(0,l.jsx)("div",{className:"error-page",children:(0,l.jsxs)("div",{className:"error-content",children:[(0,l.jsx)("h2",{children:"오류가 발생했습니다"}),(0,l.jsx)("p",{children:j}),(0,l.jsx)("button",{onClick:()=>b("/"),className:"btn-primary",children:"홈으로 돌아가기"})]})}):d?(0,l.jsx)("div",{className:"post-detail-page",children:(0,l.jsxs)("div",{className:"post-detail-container",children:[(0,l.jsxs)("article",{className:"question-section",children:[(0,l.jsxs)("div",{className:"question-header",children:[(0,l.jsxs)("div",{className:"question-meta",children:[(0,l.jsx)("span",{className:"category-badge",children:d.category}),(0,l.jsx)("span",{className:"post-date",children:new Date(d.createdAt).toLocaleDateString("ko-KR")})]}),(0,l.jsxs)("div",{className:"question-stats",children:[(0,l.jsxs)("span",{className:"stat-item",children:[(0,l.jsx)("i",{className:"fa-solid fa-eye"}),"조회 ",d.views]}),(0,l.jsxs)("span",{className:"stat-item",children:[(0,l.jsx)("i",{className:"fa-solid fa-heart"}),"좋아요 ",d.likes]}),(0,l.jsxs)("span",{className:"stat-item",children:[(0,l.jsx)("i",{className:"fa-solid fa-comment"}),"답변 ",d.answers]})]})]}),(0,l.jsx)("h1",{className:"question-title",children:d.title}),(0,l.jsx)("div",{className:"question-content",children:(0,l.jsx)("p",{children:d.content})}),(0,l.jsx)("div",{className:"question-tags",children:d.tags.map(a=>(0,l.jsxs)("span",{className:"tag",children:["#",a]},a))}),(0,l.jsxs)("div",{className:"question-author",children:[(0,l.jsx)("img",{src:d.author.profilePic,alt:d.author.name,className:"author-avatar"}),(0,l.jsx)("span",{className:"author-name",children:d.author.name})]}),(0,l.jsxs)("div",{className:"question-actions",children:[(0,l.jsxs)("button",{className:"action-btn like-btn",children:[(0,l.jsx)("i",{className:"fa-solid fa-heart"}),"좋아요"]}),(0,l.jsxs)("button",{className:"action-btn share-btn",children:[(0,l.jsx)("i",{className:"fa-solid fa-share"}),"공유"]})]})]}),(0,l.jsxs)("section",{className:"answers-section",children:[(0,l.jsxs)("h2",{className:"answers-title",children:["답변 ",f.length,"개"]}),(0,l.jsx)("div",{className:"answers-list",children:f.map(a=>(0,l.jsxs)("article",{className:`answer-item ${a.isAccepted?"accepted":""}`,children:[a.isAccepted&&(0,l.jsxs)("div",{className:"accepted-badge",children:[(0,l.jsx)("i",{className:"fa-solid fa-check-circle"}),"채택된 답변"]}),(0,l.jsxs)("div",{className:"answer-header",children:[(0,l.jsxs)("div",{className:"answer-author",children:[(0,l.jsx)("img",{src:a.author.profilePic,alt:a.author.name,className:"author-avatar"}),(0,l.jsxs)("div",{className:"author-info",children:[(0,l.jsxs)("span",{className:"author-name",children:[a.author.name,a.author.isExpert&&(0,l.jsxs)("span",{className:"expert-badge",children:[(0,l.jsx)("i",{className:"fa-solid fa-star"}),"전문가"]})]}),(0,l.jsx)("span",{className:"answer-date",children:new Date(a.createdAt).toLocaleDateString("ko-KR")})]})]}),(0,l.jsx)("div",{className:"answer-actions",children:(0,l.jsxs)("button",{className:"action-btn like-btn",children:[(0,l.jsx)("i",{className:"fa-solid fa-heart"}),a.likes]})})]}),(0,l.jsx)("div",{className:"answer-content",children:(0,l.jsx)("p",{children:a.content})})]},a.id))}),c?(0,l.jsxs)("form",{className:"answer-form",onSubmit:t,children:[(0,l.jsx)("h3",{children:"답변 작성"}),(0,l.jsx)("textarea",{value:o,onChange:a=>p(a.target.value),placeholder:"도움이 되는 답변을 작성해주세요.",rows:5,className:"answer-textarea",disabled:q}),(0,l.jsx)("button",{type:"submit",className:"submit-btn",disabled:q||!o.trim(),children:q?(0,l.jsxs)(l.Fragment,{children:[(0,l.jsx)(Object(function(){var a=Error("Cannot find module '@components/common/LoadingSpinner'");throw a.code="MODULE_NOT_FOUND",a}()),{size:"small"}),"답변 등록 중..."]}):"답변 등록"})]}):(0,l.jsxs)("div",{className:"login-prompt",children:[(0,l.jsx)("p",{children:"답변을 작성하려면 로그인이 필요합니다."}),(0,l.jsx)("button",{className:"login-btn",children:"로그인"})]})]})]})}):(0,l.jsx)("div",{className:"error-page",children:(0,l.jsxs)("div",{className:"error-content",children:[(0,l.jsx)("h2",{children:"게시물을 찾을 수 없습니다"}),(0,l.jsx)("button",{onClick:()=>b("/"),className:"btn-primary",children:"홈으로 돌아가기"})]})})};var q=c(12289);let r=(0,g.M)(d,"default"),s=(0,g.M)(d,"getStaticProps"),t=(0,g.M)(d,"getStaticPaths"),u=(0,g.M)(d,"getServerSideProps"),v=(0,g.M)(d,"config"),w=(0,g.M)(d,"reportWebVitals"),x=(0,g.M)(d,"unstable_getStaticProps"),y=(0,g.M)(d,"unstable_getStaticPaths"),z=(0,g.M)(d,"unstable_getStaticParams"),A=(0,g.M)(d,"unstable_getServerProps"),B=(0,g.M)(d,"unstable_getServerSideProps"),C=new e.PagesRouteModule({definition:{kind:f.RouteKind.PAGES,page:"/PostDetailPage",pathname:"/PostDetailPage",bundlePath:"",filename:""},distDir:".next",relativeProjectDir:"",components:{App:k(),Document:i()},userland:d}),D=(0,q.U)({srcPage:"/PostDetailPage",config:v,userland:d,routeModule:C,getStaticPaths:t,getStaticProps:s,getServerSideProps:u})},82015:a=>{a.exports=require("react")}};var b=require("../webpack-runtime.js");b.C(a);var c=b.X(0,[611,157],()=>b(b.s=70668));module.exports=c})();