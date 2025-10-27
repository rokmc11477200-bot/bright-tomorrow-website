// security.js - 관리자 비밀번호 보안 관리
class SecurityManager {
    constructor() {
        // 관리자 비밀번호의 해시값 (asdasd9123!@)
        this.ADMIN_HASH = 'ffc2e2375c2af2f22dca4e316e6957bab2efa6f14623eb776ecf4bd59356bbac';
    }
    
    // 비밀번호를 SHA-256으로 해시화하는 함수
    async hashPassword(password) {
        try {
            const encoder = new TextEncoder();
            const data = encoder.encode(password);
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        } catch (error) {
            console.error('비밀번호 해시화 오류:', error);
            return null;
        }
    }
    
    // 입력된 비밀번호와 저장된 해시를 비교하는 함수
    async verifyPassword(inputPassword) {
        try {
            const inputHash = await this.hashPassword(inputPassword);
            if (!inputHash) return false;
            
            return inputHash === this.ADMIN_HASH;
        } catch (error) {
            console.error('비밀번호 검증 오류:', error);
            return false;
        }
    }
    
    // 로그인 시도 제한 관리
    checkLoginAttempts() {
        const attempts = parseInt(localStorage.getItem('loginAttempts') || '0');
        const lastAttempt = parseInt(localStorage.getItem('lastAttemptTime') || '0');
        const now = Date.now();
        const LOCKOUT_TIME = 5 * 60 * 1000; // 5분
        const MAX_ATTEMPTS = 3;
        
        if (attempts >= MAX_ATTEMPTS && (now - lastAttempt) < LOCKOUT_TIME) {
            const remainingTime = Math.ceil((LOCKOUT_TIME - (now - lastAttempt)) / 1000);
            return {
                allowed: false,
                message: `로그인 시도가 너무 많습니다. ${remainingTime}초 후 다시 시도해주세요.`
            };
        }
        
        return { allowed: true };
    }
    
    // 로그인 시도 기록
    recordLoginAttempt(success) {
        if (success) {
            localStorage.removeItem('loginAttempts');
            localStorage.removeItem('lastAttemptTime');
        } else {
            const attempts = parseInt(localStorage.getItem('loginAttempts') || '0') + 1;
            localStorage.setItem('loginAttempts', attempts.toString());
            localStorage.setItem('lastAttemptTime', Date.now().toString());
        }
    }
    
    // 세션 타임아웃 확인
    checkSession() {
        const loginTime = parseInt(localStorage.getItem('adminLoginTime') || '0');
        const now = Date.now();
        const SESSION_TIMEOUT = 30 * 60 * 1000; // 30분
        
        if (now - loginTime > SESSION_TIMEOUT) {
            this.logout();
            return false;
        }
        
        return true;
    }
    
    // 로그아웃
    logout() {
        localStorage.removeItem('adminAuthenticated');
        localStorage.removeItem('adminLoginTime');
        sessionStorage.removeItem('adminAuthenticated');
        sessionStorage.removeItem('adminSession');
        localStorage.removeItem('adminStatus');
        localStorage.removeItem('adminSession');
    }
}

// 전역에서 사용할 수 있게 만들기
window.SecurityManager = SecurityManager;

// 보안 관리자 인스턴스 생성
window.securityManager = new SecurityManager();

// 주기적 세션 체크 (1분마다)
setInterval(() => {
    if (localStorage.getItem('adminAuthenticated') === 'true') {
        if (!window.securityManager.checkSession()) {
            alert('세션이 만료되었습니다. 다시 로그인해주세요.');
            window.location.href = 'index.html';
        }
    }
}, 60000);
