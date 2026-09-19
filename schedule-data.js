/* schedule-data.js
   모든 페이지(index.html, calendar.html, curriculum-*.html)가 함께 사용하는
   일정 데이터, 커리큘럼 데이터, 날짜 계산 헬퍼 함수 모음.
   일반 <script> 태그로 불러 쓰므로 window.HJ 네임스페이스에 담아 노출한다.
*/
(function(){
  "use strict";

  var DOW = ["일","월","화","수","목","금","토"];
  var DOW_NUM = {"일":0,"월":1,"화":2,"수":3,"목":4,"금":5,"토":6};
  var STORAGE_KEY = "hj_schedule_v2";

  /* ===== 휴일 목록 (수업 제외, 해당 수업은 한 주씩 뒤로 밀림) ===== */
  var HOLIDAYS = [
    "2026-09-25",   // 금요일 휴일
    "2026-10-05",   // 월요일 휴일
    "2026-10-09"    // 금요일 휴일
  ];

  /** 날짜 문자열("YYYY-MM-DD")이 휴일인지 확인 */
  function isHoliday(date){
    var key = date.getFullYear()+"-"+pad(date.getMonth()+1)+"-"+pad(date.getDate());
    for(var i=0;i<HOLIDAYS.length;i++){
      if(HOLIDAYS[i]===key) return true;
    }
    return false;
  }

  /**
   * 기관의 실제 수업 날짜 목록을 생성한다.
   * 매주 해당 요일에 수업이 있지만, 휴일에 해당하면 그 주를 건너뛰고
   * 나머지 수업은 한 주씩 뒤로 밀린다.
   * 반환: [{date:Date, session:Number}] (session은 1-based 회차)
   */
  function generateSessionDates(item){
    var dowNum = DOW_NUM[item.day];
    if(dowNum===undefined) return [];
    var start = parseDate(item.startDate);
    if(!start) return [];

    // startDate 이후 첫 수업 요일 찾기
    var first = new Date(start);
    for(var i=0;i<8;i++){
      if(first.getDay()===dowNum) break;
      first.setDate(first.getDate()+1);
    }

    var totalSessions = item.totalSessions || 99;
    var sessions = [];
    var d = new Date(first);
    var sess = 1;

    // 충분히 먼 미래까지 탐색 (최대 52주)
    for(var w=0; w<52 && sess<=totalSessions; w++){
      if(isHoliday(d)){
        // 휴일이면 수업 없이 건너뛰기 (다음 주로 밀림)
        d.setDate(d.getDate()+7);
        continue;
      }
      sessions.push({date:new Date(d), session:sess});
      sess++;
      d.setDate(d.getDate()+7);
    }
    return sessions;
  }

  var DEFAULT_DATA = [
    {
      id:"jukjeon",
      name:"죽전프리미어포레아파트경로당",
      address:"경기도 용인시 수지구 대지로 187 (죽전동), 경로당 1층",
      target:"시니어 10명",
      startDate:"2026-09-14",
      endDate:"2026-12-07",
      totalSessions:12,
      day:"월",
      startTime:"14:00",
      endTime:"16:30",
      topic:"스마트폰 기초교실",
      topicKey:"basic",
      managerName:"서윤숙",
      managerRole:"회장님",
      managerPhone:"010-2345-1692",
      mainTeacher:"이현진",
      mainPhone:"010-8722-7357",
      assistant:"배성은",
      assistantPhone:"010-9179-9536",
      env:"TV 보유, Wi-Fi 보유",
      note:"사전 주차등록 필요 / 첫날 회장님 부재, 총무님이 진행 / 회원가입 완료시키기, 수업에 등록시키기"
    },
    {
      id:"samsung",
      name:"삼성쉐르빌 경로당",
      address:"경기 용인시 기흥구 연원로42번길 33 삼성쉐르빌 경로당",
      target:"시니어",
      startDate:"2026-09-15",
      endDate:"2026-12-08",
      totalSessions:13,
      day:"화",
      startTime:"10:00",
      endTime:"12:00",
      topic:"스마트폰 기초교실",
      topicKey:"basic",
      managerName:"김도균",
      managerRole:"회장님",
      managerPhone:"010-5254-3888",
      mainTeacher:"이현진",
      mainPhone:"010-8722-7357",
      assistant:"김현주",
      assistantPhone:"010-9043-3392",
      env:"TV 보유, Wi-Fi 보유",
      note:"주차가능"
    },
    {
      id:"forena",
      name:"포레나광교상현아파트경로당",
      address:"경기도 용인시 수지구 수지로 17 (상현동), 경로당 1층",
      target:"시니어 15명",
      startDate:"2026-09-15",
      endDate:"2026-12-01",
      totalSessions:12,
      day:"화",
      startTime:"14:00",
      endTime:"16:30",
      topic:"스마트폰AI 활용교실",
      topicKey:"ai",
      managerName:"김길호 회장님",
      managerRole:"",
      managerPhone:"010-8550-2268",
      mainTeacher:"이현진",
      mainPhone:"010-8722-7357",
      assistant:"이복윤",
      assistantPhone:"010-8143-4483",
      env:"TV 보유, Wi-Fi 보유",
      note:"주차등록 완료, 105동 옆 주차장에 주차"
    },
    {
      id:"geumhwa",
      name:"금화대우현대아파트경로당",
      address:"경기 용인시 기흥구 금화로82번길 14 금화대우현대아파트경로당",
      target:"시니어",
      startDate:"2026-09-30",
      endDate:"2026-12-09",
      totalSessions:11,
      day:"수",
      startTime:"10:00",
      endTime:"12:00",
      topic:"스마트폰 기초교실",
      topicKey:"basic",
      managerName:"심재수",
      managerRole:"회장님",
      managerPhone:"010-5251-1162",
      mainTeacher:"이현진",
      mainPhone:"010-8722-7357",
      assistant:"서영훈",
      assistantPhone:"010-3007-8209",
      env:"TV 보유, Wi-Fi 보유",
      note:"첫날에 회장님 부재, 총무님이 진행"
    },
    {
      id:"whitevil",
      name:"하얀마을 화이트빌경로당",
      address:"성남시 분당구 금곡로 39(구미동), 관리사무소건물",
      target:"시니어 8명",
      startDate:"2026-09-16",
      endDate:"2026-12-03",
      totalSessions:12,
      day:"수",
      startTime:"13:30",
      endTime:"16:00",
      topic:"스마트폰AI 활용교실",
      topicKey:"ai",
      managerName:"강대홍",
      managerRole:"회장님",
      managerPhone:"010-5411-4969",
      mainTeacher:"이현진",
      mainPhone:"010-8722-7357",
      assistant:"이신애",
      assistantPhone:"010-8652-7821",
      env:"TV 보유, Wi-Fi 보유",
      note:"주차가능, 16일>17일로 변경"
    },
    {
      id:"seohae",
      name:"서해그랑블2차 경로당",
      address:"경기 용인시 기흥구 언동로217번길 31 서해그랑블2차 경로당",
      target:"시니어 10명",
      startDate:"2026-10-01",
      endDate:"2026-12-03",
      totalSessions:10,
      day:"목",
      startTime:"10:00",
      endTime:"12:00",
      topic:"스마트폰 기초교실",
      topicKey:"basic",
      managerName:"유병주",
      managerRole:"회장님",
      managerPhone:"010-9059-3932",
      mainTeacher:"이현진",
      mainPhone:"010-8722-7357",
      assistant:"신미경",
      assistantPhone:"010-4556-2049",
      env:"TV 보유, Wi-Fi 보유",
      note:"★사전에 한 번 더 통화를 원함, 사전 방문 요청"
    },
    {
      id:"epyeonhan",
      name:"e편한세상구성역플랫폼시티 경로당",
      address:"경기 용인시 기흥구 구성로 15 경로당",
      target:"시니어 10명",
      startDate:"2026-10-01",
      endDate:"2026-12-03",
      totalSessions:10,
      day:"목",
      startTime:"13:00",
      endTime:"15:00",
      topic:"스마트폰 기초교실",
      topicKey:"basic",
      managerName:"박이환",
      managerRole:"회장님",
      managerPhone:"010-5084-7365",
      mainTeacher:"이현진",
      mainPhone:"010-8722-7357",
      assistant:"홍혜란",
      assistantPhone:"010-5062-7410",
      env:"TV 보유, Wi-Fi 보유, 스마트 칠판",
      note:"사전 주차등록 필요, ★사전 방문 요청, 커리큘럼 문자로 공유 드림"
    },
    {
      id:"sangrok",
      name:"상록마을우성아파트경로당",
      address:"성남시 분당구 내정로 55(정자동), 경로당 1층",
      target:"시니어 20명",
      startDate:"2026-09-18",
      endDate:"2026-12-04",
      totalSessions:10,
      day:"금",
      startTime:"14:00",
      endTime:"16:30",
      topic:"스마트폰AI 활용교실",
      topicKey:"ai",
      managerName:"김은영",
      managerRole:"회장님",
      managerPhone:"010-3713-8962",
      mainTeacher:"이현진",
      mainPhone:"010-8722-7357",
      assistant:"김윤정",
      assistantPhone:"010-3338-7520",
      env:"TV 보유, Wi-Fi 보유",
      note:"사전 주차등록 필요, 현재 스마트폰 교육 중 AI 교육을 더 듣고 싶어서 신청"
    }
  ];

  var CURRICULA = {
    basic:{
      id:"basic",
      title:"스마트폰 기초교실",
      file:"curriculum-basic.html",
      lessons:[
        {no:1,title:"반가워요, 나의 스마트폰",desc:"스마트폰 기본 설정 익히기 - 스마트폰 화면·글자 크기·소리 등 기본 설정"},
        {no:2,title:"내게 편한 스마트폰 만들기",desc:"전화·연락처·문자 활용하기 - 전화·연락처 저장과 문자 보내기"},
        {no:3,title:"요즘 카톡 어디까지 써봤나요?",desc:"카카오톡 메시지·사진·음성 보내기"},
        {no:4,title:"스마트폰 카메라와 사진 활용하기",desc:"스마트폰 카메라와 사진 보기"},
        {no:5,title:"궁금한 건 바로 물어보자",desc:"네이버·구글 검색 등 마이크로 음성 검색하기, 오늘 날씨·뉴스 확인하기"},
        {no:6,title:"내손 안의 스마트 내비!",desc:"지도 앱으로 동네·자녀 집 찾기, 버스·지하철 이용, 식당 QR코드 스캔해보기"},
        {no:7,title:"스마트폰 안전하게 사용하기!",desc:"보이스피싱·스미싱 문자 구별법, 수상한 링크 누르지 않기, 비밀번호 관리"},
        {no:8,title:"정부24·건강정보 앱 설치 활용하기",desc:"생활에 필요한 공공 앱 하나씩 설치해보기(정부24·건강정보 앱, 공공 앱 활용)"},
        {no:9,title:"키오스크 이해와 주문 실습하기",desc:"키오스크 주문 실습(AI디지털배움터 에뮤레이터 활용)"},
        {no:10,title:"AI야, 안녕?",desc:"생성형 AI 기초지식, AI 앱 켜서 화면 익히기, 말이나 글로 첫 질문 해보기"},
        {no:11,title:"스마트폰 속 AI 제대로 활용하기",desc:"생활정보(건강·요리·날씨) 질문하기, 사진 보여주고 AI에게 물어보기"},
        {no:12,title:"AI로 축하카드 만들기!",desc:"AI로 사진 합성·이미지 만들기, 감사카드·생신카드 완성해서 가족에게 보내기"}
      ]
    },
    ai:{
      id:"ai",
      title:"스마트폰 AI 활용교실",
      file:"curriculum-ai.html",
      lessons:[
        {no:1,title:"AI의 이해 + 제미나이 설치",desc:"AI란 무엇인가, 버튼으로 비서 부르기, 앱실행·전화·사진, 알람·타이머, 간단 질문"},
        {no:2,title:"\"오케이 구글\"로 부르기",desc:"내 목소리 등록, 핸즈프리 호출, 제미나이 화면·앱 사용법"},
        {no:3,title:"목소리로 글쓰기 + 첫 그림 만들기",desc:"마이크로 문자 쓰기, 복사·붙여넣기, 말로 그림 만들기"},
        {no:4,title:"카메라는 비추는 AI",desc:"제미나이 라이브 기능, 라이브로 약봉투·설명서 읽기, 번역, 통역"},
        {no:5,title:"몸과 마음을 챙기는 AI",desc:"약·식단·운동·응급, 마음 다독이기, 시·편지 쓰기"},
        {no:6,title:"재미있는 이미지 생성",desc:"내 사진 합성, 캐릭터·그림으로 바꾸기, 생신·명절 카드"},
        {no:7,title:"생활 속 AI 비서 활용하기",desc:"고객센터 찾아 바로 전화 걸기, 지역·나라 혜택 물어보기, 생활민원·행정 활용"},
        {no:8,title:"카카오톡 AI 카나나(Kanana)",desc:"대화 요약, 약속·일정 챙겨주기, 궁금한 것 물어보기, 단톡방에서 불러 쓰기, 말투 다듬기"},
        {no:9,title:"카톡AI로 재미있는 이미지 생성",desc:"사진 보내 이미지 만들기, 단톡방에 바로 공유"},
        {no:10,title:"카톡AI로 재미있는 동영상 생성",desc:"사진으로 움직이는 영상 만들기, 카톡으로 가족에게 보내기"},
        {no:11,title:"수노AI로 노래 만들기",desc:"신나는 트로트·감성 발라드·귀여운 동요 만들기"},
        {no:12,title:"간단한 AI 윤리 + 발표회",desc:"AI로 만든 이미지·영상 구별하기, 가짜 뉴스 구별하기, 그동안 만든 이미지·노래 발표"}
      ]
    }
  };

  function load(){
    try{
      var raw = localStorage.getItem(STORAGE_KEY);
      if(raw) return JSON.parse(raw);
    }catch(e){}
    return JSON.parse(JSON.stringify(DEFAULT_DATA));
  }
  function save(data){
    try{
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }catch(e){}
  }
  function resetToDefault(){
    var d = JSON.parse(JSON.stringify(DEFAULT_DATA));
    save(d);
    return d;
  }

  function todayMidnight(){
    var d = new Date();
    d.setHours(0,0,0,0);
    return d;
  }
  function parseDate(str){
    if(!str) return null;
    var p = str.split("-");
    if(p.length!==3) return null;
    return new Date(parseInt(p[0],10), parseInt(p[1],10)-1, parseInt(p[2],10));
  }
  function pad(n){ return n<10 ? "0"+n : ""+n; }
  function fmtDate(d){
    if(!d) return "";
    return (d.getMonth()+1)+"월 "+d.getDate()+"일 ("+DOW[d.getDay()]+")";
  }
  function fmtDateFull(d){
    if(!d) return "";
    return d.getFullYear()+"."+pad(d.getMonth()+1)+"."+pad(d.getDate());
  }
  function isSameDate(a,b){
    return a && b && a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate();
  }

  /** 다음 수업일 찾기 (휴일 건너뜀) */
  function nextOccurrence(item, today){
    var sessions = generateSessionDates(item);
    for(var i=0; i<sessions.length; i++){
      if(sessions[i].date >= today) return sessions[i].date;
    }
    return null;
  }

  /** 오늘이 해당 기관의 수업일인지 (휴일 건너뜀) */
  function isToday(item, today){
    var sessions = generateSessionDates(item);
    for(var i=0; i<sessions.length; i++){
      if(isSameDate(sessions[i].date, today)) return true;
    }
    return false;
  }

  /** 특정 날짜에 해당 기관의 수업이 있는지 (휴일 건너뜀) */
  function occursOn(item, date){
    var sessions = generateSessionDates(item);
    for(var i=0; i<sessions.length; i++){
      if(isSameDate(sessions[i].date, date)) return true;
    }
    return false;
  }

  /** 특정 날짜가 해당 기관의 몇 번째 수업인지 계산 (1-based, 휴일 건너뜀) */
  function sessionNumber(item, date){
    var sessions = generateSessionDates(item);
    for(var i=0; i<sessions.length; i++){
      if(isSameDate(sessions[i].date, date)) return sessions[i].session;
    }
    return 0;
  }

  /** 주어진 기간에서 주차 목록 생성 */
  function generateWeeks(rangeStart, rangeEnd){
    var weeks = [];
    // 기간의 첫 월요일 찾기
    var d = new Date(rangeStart);
    while(d.getDay() !== 1) d.setDate(d.getDate() - 1); // 이전 월요일
    while(d <= rangeEnd){
      var weekStart = new Date(d);
      var weekEnd = new Date(d);
      weekEnd.setDate(weekEnd.getDate() + 6);
      var month = weekStart.getMonth() + 1;
      // 주차 계산: 해당 월에서 몇 번째 주인지
      var firstOfMonth = new Date(weekStart.getFullYear(), weekStart.getMonth(), 1);
      var firstMonday = new Date(firstOfMonth);
      while(firstMonday.getDay() !== 1) firstMonday.setDate(firstMonday.getDate() + 1);
      if(firstMonday > firstOfMonth) {
        // 1일이 월요일 이전이면, 1일이 속한 주를 1주차로
        firstMonday.setDate(firstMonday.getDate() - 7);
      }
      var weekNum = Math.floor((weekStart - firstMonday) / (7*24*60*60*1000)) + 1;
      if(weekNum <= 0) {
        month = weekStart.getMonth() + 1;
        weekNum = Math.ceil(weekStart.getDate() / 7);
      }
      // 주 중간에 월이 바뀌면 목요일 기준 월 사용
      var thu = new Date(weekStart);
      thu.setDate(thu.getDate() + 3);
      month = thu.getMonth() + 1;
      var firstOfThuMonth = new Date(thu.getFullYear(), thu.getMonth(), 1);
      var firstMondayOfThuMonth = new Date(firstOfThuMonth);
      while(firstMondayOfThuMonth.getDay() !== 1) firstMondayOfThuMonth.setDate(firstMondayOfThuMonth.getDate() + 1);
      if(firstMondayOfThuMonth.getDate() > 7) firstMondayOfThuMonth.setDate(1);
      weekNum = Math.floor((weekStart - firstMondayOfThuMonth) / (7*24*60*60*1000)) + 1;
      if(weekNum <= 0) weekNum = 1;

      weeks.push({
        label: month + "월 " + weekNum + "주차",
        start: new Date(weekStart),
        end: new Date(weekEnd)
      });
      d.setDate(d.getDate() + 7);
    }
    return weeks;
  }

  function esc(s){
    if(s===undefined || s===null) return "";
    return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
  }

  window.HJ = {
    DOW: DOW,
    DOW_NUM: DOW_NUM,
    STORAGE_KEY: STORAGE_KEY,
    HOLIDAYS: HOLIDAYS,
    DEFAULT_DATA: DEFAULT_DATA,
    CURRICULA: CURRICULA,
    load: load,
    save: save,
    resetToDefault: resetToDefault,
    todayMidnight: todayMidnight,
    parseDate: parseDate,
    pad: pad,
    fmtDate: fmtDate,
    fmtDateFull: fmtDateFull,
    isSameDate: isSameDate,
    isHoliday: isHoliday,
    generateSessionDates: generateSessionDates,
    nextOccurrence: nextOccurrence,
    isToday: isToday,
    occursOn: occursOn,
    sessionNumber: sessionNumber,
    generateWeeks: generateWeeks,
    esc: esc
  };
})();
