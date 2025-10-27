// Firebase 설정 파일
// Firebase v9 모듈러 SDK 사용

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

// Firebase 앱 초기화
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 전역에서 사용할 수 있게 설정
window.firebaseApp = app;
window.firestoreDB = db;

// 견적 데이터 저장 함수
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

// 견적 데이터 로드 함수
window.loadQuotesFromFirebase = async function() {
    try {
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

// 실시간 견적 데이터 감시
window.watchQuotesFromFirebase = function(callback) {
    try {
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
        });
        
        return unsubscribe;
    } catch (error) {
        console.error('❌ Firebase 실시간 감시 오류:', error);
        return null;
    }
};

// 견적 상태 업데이트 함수
window.updateQuoteStatus = async function(quoteId, status) {
    try {
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

// 견적 삭제 함수
window.deleteQuoteFromFirebase = async function(quoteId) {
    try {
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

console.log('🔥 Firebase 설정 완료!');
