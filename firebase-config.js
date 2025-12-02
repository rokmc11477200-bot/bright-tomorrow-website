// Firebase 설정 파일
// Firebase v9 모듈러 SDK 사용 (프로덕션 환경)

// Firebase 설정 (abtweb 프로젝트)
const firebaseConfig = {
    apiKey: "AIzaSyDjmP9KdPmI7_LT47Px00BaVcJRI5_-5fE",
    authDomain: "abtweb-2cea6.firebaseapp.com",
    projectId: "abtweb-2cea6",
    storageBucket: "abtweb-2cea6.firebasestorage.app",
    messagingSenderId: "522795765825",
    appId: "1:522795765825:web:1e9441575e9d80f7dc36c0",
    measurementId: "G-S3QHWGSBHG"
};

// Firebase 초기화
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// Firebase 앱 초기화
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// 전역에서 사용할 수 있게 설정
window.firebaseApp = app;
window.firestoreDB = db;
window.firebaseAuth = auth;

// ============================================
// 🔐 인증 관련 함수
// ============================================

// 현재 로그인 상태 확인
window.isAdminLoggedIn = function() {
    return auth.currentUser !== null;
};

// 현재 로그인한 사용자 정보
window.getCurrentAdmin = function() {
    return auth.currentUser;
};

// 관리자 로그인
window.adminLogin = async function(email, password) {
    try {
        console.log('🔐 관리자 로그인 시도 중...');
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log('✅ 관리자 로그인 성공!', userCredential.user.email);
        return { success: true, user: userCredential.user };
    } catch (error) {
        console.error('❌ 로그인 오류:', error);
        let errorMessage = '로그인에 실패했습니다.';
        
        switch (error.code) {
            case 'auth/user-not-found':
                errorMessage = '등록되지 않은 이메일입니다.';
                break;
            case 'auth/wrong-password':
                errorMessage = '비밀번호가 올바르지 않습니다.';
                break;
            case 'auth/invalid-email':
                errorMessage = '유효하지 않은 이메일 형식입니다.';
                break;
            case 'auth/too-many-requests':
                errorMessage = '너무 많은 시도가 있었습니다. 잠시 후 다시 시도해주세요.';
                break;
            case 'auth/invalid-credential':
                errorMessage = '이메일 또는 비밀번호가 올바르지 않습니다.';
                break;
        }
        
        return { success: false, error: errorMessage };
    }
};

// 관리자 로그아웃
window.adminLogout = async function() {
    try {
        console.log('🔐 로그아웃 중...');
        await signOut(auth);
        console.log('✅ 로그아웃 완료!');
        return { success: true };
    } catch (error) {
        console.error('❌ 로그아웃 오류:', error);
        return { success: false, error: error.message };
    }
};

// 인증 상태 변경 감지
window.onAdminAuthStateChanged = function(callback) {
    return onAuthStateChanged(auth, (user) => {
        if (user) {
            console.log('🔐 로그인 상태:', user.email);
        } else {
            console.log('🔐 로그아웃 상태');
        }
        if (callback) {
            callback(user);
        }
    });
};

// ============================================
// 📝 견적 관련 함수
// ============================================

// 견적 데이터 저장 함수 (고객용 - 인증 불필요)
window.saveQuoteToFirebase = async function(quoteData) {
    try {
        console.log('🔥 Firebase에 견적 저장 중...', quoteData);
        
        // 견적 데이터에 타임스탬프 추가
        const quoteWithTimestamp = {
            ...quoteData,
            createdAt: new Date().toISOString(),
            status: 'pending',
            isNew: true
        };
        
        // Firestore에 문서 추가
        const docRef = await addDoc(collection(db, 'quotes'), quoteWithTimestamp);
        
        console.log('✅ 견적이 Firebase에 저장되었습니다! ID:', docRef.id);
        
        // 성공 이벤트 발생
        window.dispatchEvent(new CustomEvent('quoteSavedToFirebase', {
            detail: { id: docRef.id, data: quoteWithTimestamp }
        }));
        
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error('❌ Firebase 저장 오류:', error);
        return { success: false, error: error.message };
    }
};

// 견적 데이터 로드 함수 (관리자용 - 인증 필요)
window.loadQuotesFromFirebase = async function() {
    try {
        // 인증 확인
        if (!auth.currentUser) {
            console.warn('⚠️ 로그인이 필요합니다.');
            return [];
        }
        
        console.log('🔥 Firebase에서 견적 로드 중...');
        
        const querySnapshot = await getDocs(collection(db, 'quotes'));
        const quotes = [];
        
        querySnapshot.forEach((doc) => {
            quotes.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        // 생성일 기준으로 최신순 정렬
        quotes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        console.log('✅ Firebase에서 견적 로드 완료! 총', quotes.length, '개');
        
        return quotes;
    } catch (error) {
        console.error('❌ Firebase 로드 오류:', error);
        return [];
    }
};

// 실시간 견적 데이터 감시 (관리자용 - 인증 필요)
window.watchQuotesFromFirebase = function(callback) {
    try {
        // 인증 확인
        if (!auth.currentUser) {
            console.warn('⚠️ 로그인이 필요합니다.');
            return null;
        }
        
        console.log('🔥 Firebase 실시간 견적 감시 시작...');
        
        const unsubscribe = onSnapshot(collection(db, 'quotes'), (querySnapshot) => {
            const quotes = [];
            querySnapshot.forEach((doc) => {
                quotes.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            // 생성일 기준으로 최신순 정렬
            quotes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            
            console.log('🔄 Firebase 실시간 업데이트:', quotes.length, '개 견적');
            
            if (callback) {
                callback(quotes);
            }
        }, (error) => {
            console.error('❌ Firebase 실시간 감시 오류:', error);
        });
        
        return unsubscribe;
    } catch (error) {
        console.error('❌ Firebase 실시간 감시 오류:', error);
        return null;
    }
};

// 견적 상태 업데이트 함수 (관리자용 - 인증 필요)
window.updateQuoteStatus = async function(quoteId, status) {
    try {
        // 인증 확인
        if (!auth.currentUser) {
            console.warn('⚠️ 로그인이 필요합니다.');
            return { success: false, error: '로그인이 필요합니다.' };
        }
        
        console.log('🔥 견적 상태 업데이트 중...', quoteId, status);
        
        const quoteRef = doc(db, 'quotes', quoteId);
        await updateDoc(quoteRef, {
            status: status,
            updatedAt: new Date().toISOString()
        });
        
        console.log('✅ 견적 상태 업데이트 완료!');
        return { success: true };
    } catch (error) {
        console.error('❌ 견적 상태 업데이트 오류:', error);
        return { success: false, error: error.message };
    }
};

// 견적 삭제 함수 (관리자용 - 인증 필요)
window.deleteQuoteFromFirebase = async function(quoteId) {
    try {
        // 인증 확인
        if (!auth.currentUser) {
            console.warn('⚠️ 로그인이 필요합니다.');
            return { success: false, error: '로그인이 필요합니다.' };
        }
        
        console.log('🔥 견적 삭제 중...', quoteId);
        
        const quoteRef = doc(db, 'quotes', quoteId);
        await deleteDoc(quoteRef);
        
        console.log('✅ 견적 삭제 완료!');
        return { success: true };
    } catch (error) {
        console.error('❌ 견적 삭제 오류:', error);
        return { success: false, error: error.message };
    }
};

console.log('🔥 Firebase 설정 완료! (프로덕션 모드)');
