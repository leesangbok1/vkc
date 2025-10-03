"use strict";(()=>{var a={};a.id=860,a.ids=[220,860],a.modules={8732:a=>{a.exports=require("react/jsx-runtime")},23067:(a,b,c)=>{c.a(a,async(a,d)=>{try{c.d(b,{an:()=>k});var e=c(61986),f=c(34547),g=c(61177),h=c(64551),i=a([e,f,g,h]);[e,f,g,h]=i.then?(await i)():i;let l={user01:{id:"user01",name:"Minh",profilePic:"https://placehold.co/40x40/31343C/FFFFFF?text=M",isAdmin:!0,email:"minh@example.com"},user02:{id:"user02",name:"Hoa",profilePic:"https://placehold.co/40x40/9C27B0/FFFFFF?text=H",certification:"운전면허",email:"hoa@example.com"},user03:{id:"user03",name:"Khang",profilePic:"https://placehold.co/40x40/00BCD4/FFFFFF?text=K",email:"khang@example.com"},user04:{id:"user04",name:"Linh",profilePic:"https://placehold.co/40x40/FF5722/FFFFFF?text=L",email:"linh@example.com"},expert01:{id:"expert01",name:"김민준 행정사",profilePic:"https://placehold.co/40x40/4CAF50/FFFFFF?text=E",isExpert:!0,certification:"행정사",email:"expert01@example.com"},expert02:{id:"expert02",name:"박서준 변호사",profilePic:"https://placehold.co/40x40/FFC107/000000?text=E",isExpert:!0,certification:"변호사",email:"expert02@example.com"}},m=[{id:"post001",title:"F-2-R 비자, 지역특화형 비자에 대해 궁금합니다.",authorId:"user01",content:"안녕하세요. 최근에 F-2-R 비자에 대해 알게 되었습니다. 요건이 어떻게 되고, 어떤 지역에서 신청할 수 있는지 경험자분들의 조언을 구합니다.",category:"Visa/Legal",tags:["F-2-R","비자"],createdAt:new Date("2024-07-30T10:00:00"),viewCount:150,answerCount:2,likes:5},{id:"post002",title:"한국에서 운전면허 교환 발급 절차는 어떻게 되나요?",authorId:"user02",content:"베트남 면허증을 한국 면허증으로 바꾸고 싶습니다. 필요한 서류와 절차, 소요 기간이 궁금해요.",category:"Life",tags:["운전면허","생활정보"],createdAt:new Date("2024-07-29T14:30:00"),viewCount:250,answerCount:1,likes:10},{id:"post003",title:"TOPIK 시험 준비, 효과적인 공부법 좀 알려주세요.",authorId:"user03",content:"읽기, 듣기, 쓰기 파트별로 어떻게 공부해야 효율적일까요? 점수가 잘 안 올라서 고민입니다.",category:"Education",tags:["TOPIK","공부"],createdAt:new Date("2024-07-28T09:00:00"),viewCount:300,answerCount:0,likes:3},{id:"post004",title:"외국인 근로자 고용 관련 법률 자문 구합니다.",authorId:"expert01",content:"저희 회사에서 외국인 근로자를 고용하려고 하는데, 관련 법률 및 비자 문제에 대해 전문가의 자문이 필요합니다.",category:"Employment",tags:["외국인근로자","고용","법률"],createdAt:new Date("2024-07-27T11:00:00"),viewCount:180,answerCount:1,likes:7},{id:"post005",title:"한국에서 전세 계약 시 주의할 점은 무엇인가요?",authorId:"user04",content:"처음으로 한국에서 전세 계약을 하려고 합니다. 사기당하지 않으려면 어떤 점을 주의해야 할까요?",category:"Housing",tags:["전세","계약","부동산"],createdAt:new Date("2024-07-26T16:00:00"),viewCount:220,answerCount:0,likes:2},{id:"post006",title:"한국 건강보험 외국인 가입 절차 및 혜택 문의",authorId:"user01",content:"한국 건강보험에 외국인도 가입할 수 있다고 들었습니다. 가입 절차와 어떤 혜택을 받을 수 있는지 궁금합니다.",category:"Healthcare",tags:["건강보험","외국인","의료"],createdAt:new Date("2024-07-25T09:30:00"),viewCount:190,answerCount:0,likes:8}],n=new Map,o=!1;async function j(a,b){return b&&b[a]?b[a]:l[a]?(b&&(b[a]=l[a]),l[a]):{name:"Unknown User",profilePic:""}}async function k(a,b=!0){if(o&&b)return new Promise(b=>{let c=(0,f.sF)(c=>{let d=c.slice(0,10);Promise.all(d.map(async b=>{let c=await j(b.authorId,a);return{...b,author:c}})).then(b)},{sortBy:"createdAt",limit:10});n.set("homepage_posts",c)});{let b=[...m].sort((a,b)=>b.createdAt-a.createdAt).slice(0,10);return Promise.all(b.map(async b=>{let c=await j(b.authorId,a);return{...b,author:c}}))}}(async()=>{let a=await (0,e.u0)();return(o=a.success)?console.log("\uD83D\uDD25 실시간 모드 활성화됨"):console.warn("⚠️ 모킹 모드로 실행됨:",a.error)})(),d()}catch(a){d(a)}})},33873:a=>{a.exports=require("path")},34547:(a,b,c)=>{c.a(a,async(a,d)=>{try{c.d(b,{i8:()=>j,sF:()=>h});var e=c(84065),f=c(61986),g=a([e,f]);[e,f]=g.then?(await g)():g;class i{constructor(){this.listeners=new Map,this.activeQueries=new Set}addListener(a,b){this.listeners.has(a)&&this.removeListener(a),this.listeners.set(a,b)}removeListener(a){let b=this.listeners.get(a);b&&"function"==typeof b&&b(),this.listeners.delete(a)}removeAllListeners(){this.listeners.forEach(a=>{"function"==typeof a&&a()}),this.listeners.clear(),this.activeQueries.clear()}getActiveListenerCount(){return this.listeners.size}}let j=new i;function h(a,b={}){if(!((0,f.bi)()||(console.warn("⚠️ Firebase가 연결되지 않았습니다. 모킹 모드를 사용합니다."),0)))return null;let{category:c=null,sortBy:d="createdAt",limit:g=20,startAfter:i=null}=b;try{let b=(0,e.ref)(f.OO,"questions");"createdAt"===d?b=(0,e.query)(b,(0,e.orderByChild)("createdAt")):"viewCount"===d?b=(0,e.query)(b,(0,e.orderByChild)("viewCount")):"likes"===d&&(b=(0,e.query)(b,(0,e.orderByChild)("likes"))),g>0&&(b=(0,e.query)(b,(0,e.limitToLast)(g)));let h=(0,e.onValue)(b,b=>{let d=b.val(),e=d?Object.keys(d).map(a=>({id:a,...d[a]})):[],f=c?e.filter(a=>a.category===c):e;f.sort((a,b)=>b.createdAt-a.createdAt),a(f)},b=>{console.error("질문 목록 실시간 업데이트 오류:",b),a([])}),i=`questions_${c||"all"}_${d}`;return j.addListener(i,()=>(0,e.off)(b,h)),()=>j.removeListener(i)}catch(a){return console.error("실시간 질문 감시 설정 오류:",a),null}}d()}catch(a){d(a)}})},40361:a=>{a.exports=require("next/dist/compiled/next-server/pages.runtime.prod.js")},46060:a=>{a.exports=require("next/dist/shared/lib/no-fallback-error.external.js")},61177:(a,b,c)=>{c.a(a,async(a,d)=>{try{c.d(b,{I9:()=>i,lY:()=>l});var e=c(84065),f=c(61986),g=c(34547),h=a([e,f,g]);[e,f,g]=h.then?(await h)():h;let i={NEW_ANSWER:"new_answer",ANSWER_ACCEPTED:"answer_accepted",QUESTION_LIKED:"question_liked",ANSWER_LIKED:"answer_liked",MENTION:"mention",FOLLOW:"follow",EXPERT_RESPONSE:"expert_response",SYSTEM:"system"},j={HIGH:"high",MEDIUM:"medium",LOW:"low"};class k{constructor(){this.isSupported=!1,this.permission=this.isSupported?Notification.permission:"denied",this.subscribers=new Map,this.unreadCount=0,this.soundEnabled=!0,this.vibrationEnabled=!0,this.notificationSound=null,this.notificationSound&&(this.notificationSound.volume=.5),this.init()}async init(){this.isSupported&&"default"===this.permission&&await this.requestPermission(),await this.loadSettings(),console.log("\uD83D\uDD14 알림 서비스 초기화됨")}async requestPermission(){if(!this.isSupported)return console.warn("이 브라우저는 알림을 지원하지 않습니다."),!1;try{return this.permission=await Notification.requestPermission(),"granted"===this.permission}catch(a){return console.error("알림 권한 요청 오류:",a),!1}}isPermissionGranted(){return"granted"===this.permission}async loadSettings(){try{return}catch(a){console.error("알림 설정 로드 오류:",a)}}async saveSettings(){try{let a={soundEnabled:this.soundEnabled,vibrationEnabled:this.vibrationEnabled};localStorage.setItem("notification-settings",JSON.stringify(a))}catch(a){console.error("알림 설정 저장 오류:",a)}}updateSettings(a){this.soundEnabled=a.soundEnabled??this.soundEnabled,this.vibrationEnabled=a.vibrationEnabled??this.vibrationEnabled,this.saveSettings()}subscribeToUserNotifications(a,b){if(!(0,f.bi)())return console.warn("Firebase가 연결되지 않았습니다."),null;try{let c=(0,e.ref)(f.OO,`notifications/${a}`),d=(0,e.query)(c,(0,e.orderByChild)("createdAt"),(0,e.limitToLast)(50)),h=(0,e.onValue)(d,a=>{let c=a.val(),d=c?Object.keys(c).map(a=>({id:a,...c[a]})):[];d.sort((a,b)=>b.createdAt-a.createdAt),this.unreadCount=d.filter(a=>!a.read).length,b(d),this.handleNewNotifications(d)},a=>{console.error("사용자 알림 구독 오류:",a),b([])}),i=`notifications_${a}`;return g.i8.addListener(i,h),()=>g.i8.removeListener(i)}catch(a){return console.error("알림 구독 설정 오류:",a),null}}async createNotification(a,b){if(!(0,f.bi)())return console.warn("Firebase가 연결되지 않았습니다."),null;try{let c=(0,e.ref)(f.OO,`notifications/${a}`),d=(0,e.push)(c),g={...b,id:d.key,createdAt:(0,e.serverTimestamp)(),read:!1,priority:b.priority||j.MEDIUM};return await (0,e.set)(d,g),this.shouldShowBrowserNotification(g)&&this.showBrowserNotification(g),g}catch(a){return console.error("알림 생성 오류:",a),null}}async notifyNewAnswer(a,b,c){return this.createNotification(a,{type:i.NEW_ANSWER,title:"새 답변이 등록되었습니다",message:`${b.name}님이 "${c}"에 답변했습니다.`,data:{questionId:a,answererId:b.id,answererName:b.name},priority:j.HIGH})}async notifyAnswerAccepted(a,b){return this.createNotification(a,{type:i.ANSWER_ACCEPTED,title:"답변이 채택되었습니다",message:`"${b}"에서 회원님의 답변이 채택되었습니다.`,data:{questionTitle:b},priority:j.HIGH})}async notifyQuestionLiked(a,b,c){return this.createNotification(a,{type:i.QUESTION_LIKED,title:"질문에 좋아요를 받았습니다",message:`${b.name}님이 "${c}"을 좋아합니다.`,data:{likerId:b.id,likerName:b.name,questionTitle:c},priority:j.LOW})}async notifyExpertResponse(a,b,c){return this.createNotification(a,{type:i.EXPERT_RESPONSE,title:"전문가 답변이 등록되었습니다",message:`${b.certification} ${b.name}님이 "${c}"에 전문가 답변을 제공했습니다.`,data:{expertId:b.id,expertName:b.name,certification:b.certification,questionTitle:c},priority:j.HIGH,icon:"expert"})}shouldShowBrowserNotification(a){return"hidden"===document.visibilityState&&this.isPermissionGranted()&&a.priority!==j.LOW}showBrowserNotification(a){if(this.isPermissionGranted())try{let b={body:a.message,icon:a.icon||"/icons/notification-icon.png",badge:"/icons/badge-icon.png",tag:`notification-${a.id}`,requireInteraction:a.priority===j.HIGH,silent:!this.soundEnabled,data:a.data},c=new Notification(a.title,b);c.onclick=()=>{window.focus(),this.handleNotificationClick(a),c.close()},a.priority!==j.HIGH&&setTimeout(()=>{c.close()},5e3),this.soundEnabled&&this.playNotificationSound(),this.vibrationEnabled&&"vibrate"in navigator&&navigator.vibrate([200,100,200])}catch(a){console.error("브라우저 알림 표시 오류:",a)}}playNotificationSound(){try{this.notificationSound.currentTime=0,this.notificationSound.play().catch(a=>{console.warn("알림음 재생 실패:",a)})}catch(a){console.warn("알림음 재생 오류:",a)}}handleNotificationClick(a){switch(a.type){case i.NEW_ANSWER:case i.EXPERT_RESPONSE:a.data?.questionId&&(window.location.href=`/post.html?id=${a.data.questionId}`);break;case i.ANSWER_ACCEPTED:window.location.href="/profile.html";break;default:window.location.href="/notifications.html"}this.markAsRead(a.id)}async markAsRead(a,b){if(!(0,f.bi)())return!1;try{let c=(0,e.ref)(f.OO,`notifications/${b}/${a}/read`);return await (0,e.set)(c,!0),!0}catch(a){return console.error("알림 읽음 처리 오류:",a),!1}}async markAllAsRead(a){if(!(0,f.bi)())return!1;try{let b=(0,e.ref)(f.OO,`notifications/${a}`),c=(await (0,e.get)(b)).val();if(!c)return!0;let d={};return Object.keys(c).forEach(a=>{d[`${a}/read`]=!0}),await (0,e.update)(b,d),this.unreadCount=0,!0}catch(a){return console.error("모든 알림 읽음 처리 오류:",a),!1}}handleNewNotifications(a){let b=localStorage.getItem("last-notification-check"),c=b?parseInt(b):0,d=a.filter(a=>a.createdAt>c&&!a.read);d.length>0&&(this.showInAppNotifications(d),localStorage.setItem("last-notification-check",Date.now().toString()))}showInAppNotifications(a){a.forEach(a=>{this.displayInAppNotification(a)}),this.updateNotificationBadge()}displayInAppNotification(a){let b=document.createElement("div");b.className=`notification-toast priority-${a.priority}`,b.innerHTML=`
      <div class="notification-icon">
        ${this.getNotificationIcon(a.type)}
      </div>
      <div class="notification-content">
        <div class="notification-title">${a.title}</div>
        <div class="notification-message">${a.message}</div>
      </div>
      <button class="notification-close" onclick="this.parentElement.remove()">\xd7</button>
    `;let c=document.getElementById("notification-container");c||((c=document.createElement("div")).id="notification-container",c.className="notification-container",document.body.appendChild(c)),c.appendChild(b),b.addEventListener("click",()=>{this.handleNotificationClick(a),b.remove()}),setTimeout(()=>{b.parentElement&&b.remove()},a.priority===j.HIGH?1e4:5e3)}getNotificationIcon(a){return({[i.NEW_ANSWER]:"\uD83D\uDCAC",[i.ANSWER_ACCEPTED]:"✅",[i.QUESTION_LIKED]:"\uD83D\uDC4D",[i.ANSWER_LIKED]:"❤️",[i.MENTION]:"\uD83D\uDCE2",[i.FOLLOW]:"\uD83D\uDC65",[i.EXPERT_RESPONSE]:"\uD83C\uDF93",[i.SYSTEM]:"\uD83D\uDD14"})[a]||"\uD83D\uDCCB"}updateNotificationBadge(){document.querySelectorAll(".notification-badge").forEach(a=>{a.textContent=this.unreadCount,a.style.display=this.unreadCount>0?"block":"none"}),this.unreadCount>0?document.title=`(${this.unreadCount}) Viet K-Connect`:document.title="Viet K-Connect"}getUnreadCount(){return this.unreadCount}isEnabled(){return this.isPermissionGranted()}getSettings(){return{soundEnabled:this.soundEnabled,vibrationEnabled:this.vibrationEnabled,permission:this.permission}}}let l=new k;d()}catch(a){d(a)}})},61986:(a,b,c)=>{c.a(a,async(a,d)=>{try{let l,m,n,o;c.d(b,{OO:()=>m,bi:()=>j,u0:()=>k});var e=c(66551),f=c(84065),g=c(86958),h=c(82537),i=a([e,f,g,h]);[e,f,g,h]=i.then?(await i)():i;let p={apiKey:process.env.NEXT_PUBLIC_FIREBASE_API_KEY||null,authDomain:process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN||null,databaseURL:process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL||null,projectId:process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID||null,storageBucket:process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET||null,messagingSenderId:process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID||null,appId:process.env.NEXT_PUBLIC_FIREBASE_APP_ID||null};if(Object.values(p).every(a=>null!==a))try{if(l=(0,e.initializeApp)(p),m=(0,f.getDatabase)(l),n=(0,g.getAuth)(l),o=(0,h.getStorage)(l),"true"===process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR)try{(0,f.connectDatabaseEmulator)(m,"localhost",9e3),(0,g.connectAuthEmulator)(n,"http://localhost:9099"),(0,h.connectStorageEmulator)(o,"localhost",9199),console.log("\uD83D\uDD27 Firebase 에뮬레이터 연결됨")}catch(a){console.warn("⚠️ Firebase 에뮬레이터 연결 실패:",a.message),l=null,m=null,n=null,o=null}else console.log("\uD83D\uDD25 Firebase 프로덕션 모드 초기화 성공")}catch(a){console.error("❌ Firebase 초기화 실패:",a),l=null,m=null,n=null,o=null}else console.log("\uD83D\uDD04 Firebase 설정이 없어 모킹 모드로 실행됩니다"),l=null,m=null,n=null,o=null;function j(){return null!==l&&null!==m}async function k(){if(!j())return{success:!1,error:"Firebase 초기화되지 않음",mode:"mock"};try{let{ref:a,get:b}=await Promise.resolve().then(c.bind(c,84065)),d=a(m,".info/connected"),e=await b(d);return{success:!0,connected:e.val(),mode:"firebase",timestamp:new Date().toISOString()}}catch(a){return{success:!1,error:a.message,mode:"mock"}}}d()}catch(a){d(a)}})},64551:(a,b,c)=>{c.a(a,async(a,b)=>{try{var d=c(84065),e=c(61986),f=c(34547),g=c(61177),h=a([d,e,f,g]);[d,e,f,g]=h.then?(await h)():h;let i={TEXT:"text",SYSTEM:"system"},j={ONE_ON_ONE:"one_on_one"},k={ONLINE:"online",OFFLINE:"offline"};class l{constructor(){this.currentUser=null,this.activeRooms=new Map,this.typingTimeouts=new Map,this.connectionStatus="disconnected",this.messageQueue=[],this.retryAttempts=0,this.maxRetryAttempts=3,this.init()}async init(){if(!(0,e.bi)())return void console.warn("Firebase가 연결되지 않음. 채팅 시스템을 모킹 모드로 실행합니다.");this.setupConnectionMonitoring(),console.log("\uD83D\uDCAC 채팅 시스템 초기화됨")}setupConnectionMonitoring(){let a=(0,d.ref)(e.OO,".info/connected");(0,d.onValue)(a,a=>{let b=a.val();this.connectionStatus=b?"connected":"disconnected",b?(console.log("\uD83D\uDCAC 채팅 서버 연결됨"),this.retryAttempts=0,this.processMessageQueue()):console.warn("\uD83D\uDCAC 채팅 서버 연결 끊어짐")})}async processMessageQueue(){if(0!==this.messageQueue.length){for(let a of(console.log(`처리할 메시지 ${this.messageQueue.length}개`),this.messageQueue))try{await this.sendMessage(a.roomId,a.content,a.type)}catch(a){console.error("큐된 메시지 전송 실패:",a)}this.messageQueue=[]}}setCurrentUser(a){this.currentUser=a,a&&this.setUserPresence(a.id,k.ONLINE)}async setUserPresence(a,b,c={}){if((0,e.bi)())try{let f=(0,d.ref)(e.OO,`chat_presence/${a}`);await (0,d.set)(f,{status:b,lastSeen:(0,d.serverTimestamp)(),metadata:c,...c})}catch(a){console.error("사용자 상태 설정 오류:",a)}}async createChatRoom(a,b=j.ONE_ON_ONE,c={}){if(!(0,e.bi)())return null;try{let f=(0,d.ref)(e.OO,"chat_rooms"),g=(0,d.push)(f),h={id:g.key,type:b,participants:a.reduce((a,b)=>(a[b]={joinedAt:(0,d.serverTimestamp)(),role:b===this.currentUser?.id?"admin":"member"},a),{}),createdAt:(0,d.serverTimestamp)(),lastActivity:(0,d.serverTimestamp)(),messageCount:0,...c};return await (0,d.set)(g,h),console.log(`채팅방 생성됨: ${g.key}`),{id:g.key,...h}}catch(a){return console.error("채팅방 생성 오류:",a),null}}async joinChatRoom(a,b){if(!(0,e.bi)())return!1;try{let c=(0,d.ref)(e.OO,`chat_rooms/${a}/participants/${b}`);return await (0,d.set)(c,{joinedAt:(0,d.serverTimestamp)(),role:"member"}),await this.sendSystemMessage(a,`${b}님이 채팅방에 입장했습니다.`),!0}catch(a){return console.error("채팅방 입장 오류:",a),!1}}async leaveChatRoom(a,b){if(!(0,e.bi)())return!1;try{let c=(0,d.ref)(e.OO,`chat_rooms/${a}/participants/${b}`);return await (0,d.set)(c,null),await this.sendSystemMessage(a,`${b}님이 채팅방을 나갔습니다.`),this.activeRooms.delete(a),!0}catch(a){return console.error("채팅방 나가기 오류:",a),!1}}async sendMessage(a,b,c=i.TEXT,f={}){if(!this.currentUser)return console.error("로그인이 필요합니다."),null;if("disconnected"===this.connectionStatus)return this.messageQueue.push({roomId:a,content:b,type:c,metadata:f}),console.log("메시지가 큐에 추가됨"),null;if(!(0,e.bi)())return console.warn("Firebase 연결 없음"),null;try{let g=(0,d.ref)(e.OO,`chat_messages/${a}`),h=(0,d.push)(g),i={id:h.key,senderId:this.currentUser.id,senderName:this.currentUser.name,content:b,type:c,timestamp:(0,d.serverTimestamp)(),edited:!1,reactions:{},...f};return await (0,d.set)(h,i),await this.updateRoomActivity(a),await this.notifyParticipants(a,i),console.log(`메시지 전송됨: ${a}`),{id:h.key,...i}}catch(d){return console.error("메시지 전송 오류:",d),this.retryAttempts<this.maxRetryAttempts&&(this.retryAttempts++,console.log(`메시지 전송 재시도 중... (${this.retryAttempts}/${this.maxRetryAttempts})`),setTimeout(()=>{this.sendMessage(a,b,c,f)},1e3*this.retryAttempts)),null}}async sendSystemMessage(a,b){return this.sendMessage(a,b,i.SYSTEM,{senderId:"system",senderName:"System"})}async editMessage(a,b,c){if(!(0,e.bi)())return!1;try{let f=(0,d.ref)(e.OO,`chat_messages/${a}/${b}`);return await (0,d.update)(f,{content:c,edited:!0,editedAt:(0,d.serverTimestamp)()}),!0}catch(a){return console.error("메시지 수정 오류:",a),!1}}async deleteMessage(a,b){if(!(0,e.bi)())return!1;try{let c=(0,d.ref)(e.OO,`chat_messages/${a}/${b}`);return await (0,d.set)(c,null),!0}catch(a){return console.error("메시지 삭제 오류:",a),!1}}subscribeToRoom(a,b){if(!(0,e.bi)())return console.warn("Firebase 연결 없음"),null;try{let c=(0,d.ref)(e.OO,`chat_messages/${a}`),g=(0,d.query)(c,(0,d.orderByChild)("timestamp"),(0,d.limitToLast)(50)),h=(0,d.onValue)(g,a=>{let c=a.val(),d=c?Object.keys(c).map(a=>({id:a,...c[a]})):[];d.sort((a,b)=>a.timestamp-b.timestamp),b(d)},c=>{console.error(`채팅방 ${a} 구독 오류:`,c),b([])}),i=`chat_room_${a}`;return f.i8.addListener(i,h),this.activeRooms.set(a,{unsubscribe:h,callback:b}),()=>f.i8.removeListener(i)}catch(a){return console.error("채팅방 구독 설정 오류:",a),null}}unsubscribeFromRoom(a){let b=`chat_room_${a}`;f.i8.removeListener(b),this.activeRooms.delete(a)}async startTyping(a){if(this.currentUser&&(0,e.bi)())try{let b=(0,d.ref)(e.OO,`chat_typing/${a}/${this.currentUser.id}`);await (0,d.set)(b,{name:this.currentUser.name,timestamp:(0,d.serverTimestamp)()}),this.typingTimeouts.has(a)&&clearTimeout(this.typingTimeouts.get(a));let c=setTimeout(()=>{this.stopTyping(a)},5e3);this.typingTimeouts.set(a,c)}catch(a){console.error("타이핑 상태 설정 오류:",a)}}async stopTyping(a){if(this.currentUser&&(0,e.bi)())try{let b=(0,d.ref)(e.OO,`chat_typing/${a}/${this.currentUser.id}`);await (0,d.set)(b,null),this.typingTimeouts.has(a)&&(clearTimeout(this.typingTimeouts.get(a)),this.typingTimeouts.delete(a))}catch(a){console.error("타이핑 상태 해제 오류:",a)}}subscribeToTyping(a,b){if(!(0,e.bi)())return null;try{let c=(0,d.ref)(e.OO,`chat_typing/${a}`),g=(0,d.onValue)(c,a=>{let c=a.val(),d=c?Object.keys(c).filter(a=>a!==this.currentUser?.id).map(a=>c[a]):[];b(d)}),h=`typing_${a}`;return f.i8.addListener(h,g),()=>f.i8.removeListener(h)}catch(a){return console.error("타이핑 상태 구독 오류:",a),null}}subscribeToParticipants(a,b){if(!(0,e.bi)())return null;try{let c=(0,d.ref)(e.OO,`chat_rooms/${a}/participants`),g=(0,d.onValue)(c,a=>{let c=a.val(),d=c?Object.keys(c).map(a=>({id:a,...c[a]})):[];b(d)}),h=`participants_${a}`;return f.i8.addListener(h,g),()=>f.i8.removeListener(h)}catch(a){return console.error("참가자 목록 구독 오류:",a),null}}async notifyParticipants(a,b){if((0,e.bi)())try{let c=(0,d.ref)(e.OO,`chat_rooms/${a}/participants`),f=(await (0,d.get)(c)).val();if(!f)return;for(let c of Object.keys(f).filter(a=>a!==b.senderId))await g.lY.createNotification(c,{type:g.I9.NEW_MESSAGE,title:`${b.senderName}님의 메시지`,message:b.content.substring(0,100),data:{roomId:a,messageId:b.id,senderId:b.senderId,senderName:b.senderName},priority:"medium"})}catch(a){console.error("참가자 알림 오류:",a)}}async updateRoomActivity(a){if((0,e.bi)())try{let b=(0,d.ref)(e.OO,`chat_rooms/${a}/lastActivity`);await (0,d.set)(b,(0,d.serverTimestamp)());let c=(0,d.ref)(e.OO,`chat_rooms/${a}/messageCount`),f=(await (0,d.get)(c)).val()||0;await (0,d.set)(c,f+1)}catch(a){console.error("채팅방 활동 업데이트 오류:",a)}}async getChatHistory(a,b=50,c=null){if(!(0,e.bi)())return[];try{let f,g=(0,d.ref)(e.OO,`chat_messages/${a}`);f=c?(0,d.query)(g,(0,d.orderByChild)("timestamp"),(0,d.endAt)(c),(0,d.limitToLast)(b)):(0,d.query)(g,(0,d.orderByChild)("timestamp"),(0,d.limitToLast)(b));let h=(await (0,d.get)(f)).val();if(!h)return[];let i=Object.keys(h).map(a=>({id:a,...h[a]}));return i.sort((a,b)=>a.timestamp-b.timestamp),i}catch(a){return console.error("채팅 히스토리 로드 오류:",a),[]}}async searchMessages(a,b,c=20){return(await this.getChatHistory(a,200)).filter(a=>a.content.toLowerCase().includes(b.toLowerCase())||a.senderName.toLowerCase().includes(b.toLowerCase())).slice(0,c)}cleanup(){this.activeRooms.forEach((a,b)=>{this.unsubscribeFromRoom(b)}),this.typingTimeouts.forEach(a=>{clearTimeout(a)}),this.typingTimeouts.clear(),this.currentUser&&this.setUserPresence(this.currentUser.id,k.OFFLINE),console.log("\uD83D\uDCAC 채팅 시스템 정리됨")}getDebugInfo(){return{currentUser:this.currentUser?.name||"None",activeRooms:this.activeRooms.size,connectionStatus:this.connectionStatus,queuedMessages:this.messageQueue.length,typingTimeouts:this.typingTimeouts.size}}}new l,b()}catch(a){b(a)}})},66551:a=>{a.exports=import("firebase/app")},78682:(a,b,c)=>{c.a(a,async(a,d)=>{try{c.r(b),c.d(b,{default:()=>j});var e=c(8732),f=c(82015);!function(){var a=Error("Cannot find module '@services/AuthContext'");throw a.code="MODULE_NOT_FOUND",a}(),function(){var a=Error("Cannot find module '@services/RealtimeContext'");throw a.code="MODULE_NOT_FOUND",a}(),function(){var a=Error("Cannot find module '@components/common/LoadingSpinner'");throw a.code="MODULE_NOT_FOUND",a}(),function(){var a=Error("Cannot find module '@components/questions/QuestionCard'");throw a.code="MODULE_NOT_FOUND",a}(),function(){var a=Error("Cannot find module '@components/questions/QuestionForm'");throw a.code="MODULE_NOT_FOUND",a}(),function(){var a=Error("Cannot find module '@components/home/WelcomeBanner'");throw a.code="MODULE_NOT_FOUND",a}(),function(){var a=Error("Cannot find module '@components/filters/CategoryFilter'");throw a.code="MODULE_NOT_FOUND",a}(),function(){var a=Error("Cannot find module '@components/widgets/StatsWidget'");throw a.code="MODULE_NOT_FOUND",a}();var g=c(23067),h=a([g]);g=(h.then?(await h)():h)[0];let i=`
/* Homepage Styles */
.homepage {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.homepage-content {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 30px;
  margin-top: 20px;
}

.main-content {
  min-width: 0; /* Grid overflow fix */
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Realtime Status */
.realtime-status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f8f9fa;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid #e0e0e0;
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

/* Questions Section */
.questions-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.section-header h2 {
  color: #333;
  font-size: 1.5rem;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.question-count {
  color: #666;
  font-size: 1rem;
  font-weight: normal;
}

.view-all-link {
  color: #007bff;
  text-decoration: none;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: color 0.2s ease;
}

.view-all-link:hover {
  color: #0056b3;
}

.questions-grid {
  display: grid;
  gap: 20px;
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

.cta-btn {
  background: #007bff;
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

.cta-btn:hover {
  background: #0056b3;
}

/* Error State */
.error-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
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

/* Widget Styles */
.widget {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.widget-title {
  color: #333;
  font-size: 1.1rem;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.tags-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-btn {
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #666;
}

.tag-btn:hover {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.experts-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.expert-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border-radius: 8px;
  transition: background-color 0.2s ease;
  cursor: pointer;
}

.expert-item:hover {
  background-color: #f8f9fa;
}

.expert-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.expert-name {
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.expert-specialty {
  font-size: 12px;
  color: #666;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .homepage-content {
    grid-template-columns: 1fr;
  }

  .sidebar {
    order: -1;
  }

  .widget {
    display: inline-block;
    margin-right: 20px;
    min-width: 200px;
  }

  .sidebar {
    display: flex;
    flex-direction: row;
    overflow-x: auto;
    padding-bottom: 10px;
  }
}

@media (max-width: 768px) {
  .homepage {
    padding: 10px;
  }

  .questions-section {
    padding: 16px;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .section-header h2 {
    font-size: 1.3rem;
  }

  .realtime-status {
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }
}

/* Dark mode support */
[data-theme="dark"] .questions-section,
[data-theme="dark"] .widget {
  background: #2d2d2d;
}

[data-theme="dark"] .realtime-status {
  background: #404040;
  border-color: #555;
}

[data-theme="dark"] .tag-btn {
  background: #404040;
  border-color: #555;
  color: #ffffff;
}

[data-theme="dark"] .tag-btn:hover {
  background: #007bff;
  border-color: #007bff;
}

[data-theme="dark"] .expert-item:hover {
  background-color: #404040;
}
`;if("undefined"!=typeof document){let a=document.createElement("style");a.textContent=i,document.head.appendChild(a)}let j=()=>{let{user:a}=Object(function(){var a=Error("Cannot find module '@services/AuthContext'");throw a.code="MODULE_NOT_FOUND",a}())(),{isConnected:b}=Object(function(){var a=Error("Cannot find module '@services/RealtimeContext'");throw a.code="MODULE_NOT_FOUND",a}())(),[c,d]=(0,f.useState)([]),[h,i]=(0,f.useState)(!0),[j,k]=(0,f.useState)(null),[l,m]=(0,f.useState)("all"),[n,o]=(0,f.useState)(!1),p=async a=>{await r()},q=async(a=!0)=>{try{k(null);let b=await (0,g.an)({},a);d(b)}catch(a){console.error("홈페이지 데이터 로드 실패:",a),k("데이터를 불러오는데 실패했습니다.")}finally{i(!1),o(!1)}};(0,f.useEffect)(()=>{q(b)},[b]);let r=async()=>{o(!0),await q(b)},s="all"===l?c:c.filter(a=>a.category===l);return h?(0,e.jsxs)("div",{className:"homepage",children:[(0,e.jsx)(Object(function(){var a=Error("Cannot find module '@components/home/WelcomeBanner'");throw a.code="MODULE_NOT_FOUND",a}()),{user:a}),(0,e.jsxs)("div",{className:"homepage-content",children:[(0,e.jsx)("div",{className:"main-content",children:(0,e.jsx)(Object(function(){var a=Error("Cannot find module '@components/common/LoadingSpinner'");throw a.code="MODULE_NOT_FOUND",a}()),{lines:5})}),(0,e.jsx)("div",{className:"sidebar",children:(0,e.jsx)(Object(function(){var a=Error("Cannot find module '@components/common/LoadingSpinner'");throw a.code="MODULE_NOT_FOUND",a}()),{lines:3})})]})]}):j?(0,e.jsx)("div",{className:"homepage",children:(0,e.jsxs)("div",{className:"error-state",children:[(0,e.jsx)("div",{className:"error-icon",children:(0,e.jsx)("i",{className:"fa-solid fa-exclamation-triangle"})}),(0,e.jsx)("h3",{children:"오류가 발생했습니다"}),(0,e.jsx)("p",{children:j}),(0,e.jsxs)("button",{className:"retry-btn",onClick:()=>q(),children:[(0,e.jsx)("i",{className:"fa-solid fa-refresh"}),"다시 시도"]})]})}):(0,e.jsxs)("div",{className:"homepage",children:[(0,e.jsx)(Object(function(){var a=Error("Cannot find module '@components/home/WelcomeBanner'");throw a.code="MODULE_NOT_FOUND",a}()),{user:a}),(0,e.jsxs)("div",{className:"homepage-content",children:[(0,e.jsxs)("main",{className:"main-content",children:[(0,e.jsxs)("div",{className:"realtime-status",children:[(0,e.jsxs)("div",{className:`status-indicator ${b?"connected":"disconnected"}`,children:[(0,e.jsx)("i",{className:`fa-solid ${b?"fa-wifi":"fa-wifi-slash"}`}),(0,e.jsx)("span",{children:b?"실시간 연결됨":"오프라인 모드"})]}),(0,e.jsx)("button",{className:"refresh-btn",onClick:r,disabled:n,title:"새로고침",children:(0,e.jsx)("i",{className:`fa-solid fa-refresh ${n?"spinning":""}`})})]}),(0,e.jsx)(Object(function(){var a=Error("Cannot find module '@components/questions/QuestionForm'");throw a.code="MODULE_NOT_FOUND",a}()),{onSubmit:p}),(0,e.jsx)(Object(function(){var a=Error("Cannot find module '@components/filters/CategoryFilter'");throw a.code="MODULE_NOT_FOUND",a}()),{selectedCategory:l,onCategoryChange:m}),(0,e.jsxs)("div",{className:"questions-section",children:[(0,e.jsxs)("div",{className:"section-header",children:[(0,e.jsxs)("h2",{children:[(0,e.jsx)("i",{className:"fa-solid fa-fire"}),"최신 질문",(0,e.jsxs)("span",{className:"question-count",children:["(",s.length,")"]})]}),(0,e.jsxs)("a",{href:"/posts",className:"view-all-link",children:["전체 보기",(0,e.jsx)("i",{className:"fa-solid fa-arrow-right"})]})]}),0===s.length?(0,e.jsxs)("div",{className:"empty-state",children:[(0,e.jsx)("div",{className:"empty-icon",children:(0,e.jsx)("i",{className:"fa-solid fa-question-circle"})}),(0,e.jsx)("h3",{children:"질문이 없습니다"}),(0,e.jsx)("p",{children:"all"===l?"아직 등록된 질문이 없습니다.":`${l} 카테고리에 질문이 없습니다.`}),(0,e.jsxs)("button",{className:"cta-btn",children:[(0,e.jsx)("i",{className:"fa-solid fa-plus"}),"첫 번째 질문 작성하기"]})]}):(0,e.jsx)("div",{className:"questions-grid",children:s.map(a=>(0,e.jsx)(Object(function(){var a=Error("Cannot find module '@components/questions/QuestionCard'");throw a.code="MODULE_NOT_FOUND",a}()),{question:a,showAuthor:!0,showStats:!0},a.id))})]})]}),(0,e.jsxs)("aside",{className:"sidebar",children:[(0,e.jsx)(Object(function(){var a=Error("Cannot find module '@components/widgets/StatsWidget'");throw a.code="MODULE_NOT_FOUND",a}()),{}),(0,e.jsxs)("div",{className:"widget",children:[(0,e.jsxs)("h3",{className:"widget-title",children:[(0,e.jsx)("i",{className:"fa-solid fa-tags"}),"인기 태그"]}),(0,e.jsx)("div",{className:"tags-cloud",children:["비자","생활정보","TOPIK","취업","전세","건강보험"].map(a=>(0,e.jsxs)("button",{className:"tag-btn",children:["#",a]},a))})]}),(0,e.jsxs)("div",{className:"widget",children:[(0,e.jsxs)("h3",{className:"widget-title",children:[(0,e.jsx)("i",{className:"fa-solid fa-star"}),"추천 전문가"]}),(0,e.jsxs)("div",{className:"experts-list",children:[(0,e.jsxs)("div",{className:"expert-item",children:[(0,e.jsx)("img",{src:"/images/expert1.png",alt:"전문가",className:"expert-avatar"}),(0,e.jsxs)("div",{className:"expert-info",children:[(0,e.jsx)("div",{className:"expert-name",children:"김민준 행정사"}),(0,e.jsx)("div",{className:"expert-specialty",children:"비자 \xb7 법률"})]})]}),(0,e.jsxs)("div",{className:"expert-item",children:[(0,e.jsx)("img",{src:"/images/expert2.png",alt:"전문가",className:"expert-avatar"}),(0,e.jsxs)("div",{className:"expert-info",children:[(0,e.jsx)("div",{className:"expert-name",children:"박서준 변호사"}),(0,e.jsx)("div",{className:"expert-specialty",children:"법률 상담"})]})]})]})]})]})]})]})};d()}catch(a){d(a)}})},79635:(a,b,c)=>{c.a(a,async(a,d)=>{try{c.r(b),c.d(b,{config:()=>s,default:()=>o,getServerSideProps:()=>r,getStaticPaths:()=>q,getStaticProps:()=>p,handler:()=>A,reportWebVitals:()=>t,routeModule:()=>z,unstable_getServerProps:()=>x,unstable_getServerSideProps:()=>y,unstable_getStaticParams:()=>w,unstable_getStaticPaths:()=>v,unstable_getStaticProps:()=>u});var e=c(63885),f=c(80237),g=c(81413),h=c(65611),i=c.n(h),j=c(625),k=c.n(j),l=c(78682),m=c(12289),n=a([l]);l=(n.then?(await n)():n)[0];let o=(0,g.M)(l,"default"),p=(0,g.M)(l,"getStaticProps"),q=(0,g.M)(l,"getStaticPaths"),r=(0,g.M)(l,"getServerSideProps"),s=(0,g.M)(l,"config"),t=(0,g.M)(l,"reportWebVitals"),u=(0,g.M)(l,"unstable_getStaticProps"),v=(0,g.M)(l,"unstable_getStaticPaths"),w=(0,g.M)(l,"unstable_getStaticParams"),x=(0,g.M)(l,"unstable_getServerProps"),y=(0,g.M)(l,"unstable_getServerSideProps"),z=new e.PagesRouteModule({definition:{kind:f.RouteKind.PAGES,page:"/HomePage",pathname:"/HomePage",bundlePath:"",filename:""},distDir:".next",relativeProjectDir:"",components:{App:k(),Document:i()},userland:l}),A=(0,m.U)({srcPage:"/HomePage",config:s,userland:l,routeModule:z,getStaticPaths:q,getStaticProps:p,getServerSideProps:r});d()}catch(a){d(a)}})},82015:a=>{a.exports=require("react")},82537:a=>{a.exports=import("firebase/storage")},84065:a=>{a.exports=import("firebase/database")},86958:a=>{a.exports=import("firebase/auth")}};var b=require("../webpack-runtime.js");b.C(a);var c=b.X(0,[611,157],()=>b(b.s=79635));module.exports=c})();