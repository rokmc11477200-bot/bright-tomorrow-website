// TEXT CURSOR CONTROL - PREVENT BLINKING BUT ALLOW DRAG
function initTextCursorControl() {
    let isDragging = false;
    let dragStartTime = 0;
    
    // Track drag start
    document.addEventListener('mousedown', function(e) {
        if (!e.target.matches('input, textarea, [contenteditable="true"], select, button')) {
            dragStartTime = Date.now();
            isDragging = false;
        }
    }, true);
    
    // Track drag movement
    document.addEventListener('mousemove', function(e) {
        if (dragStartTime > 0 && Date.now() - dragStartTime > 50) {
            isDragging = true;
        }
    }, true);
    
    // Handle click vs drag
    document.addEventListener('mouseup', function(e) {
        if (!e.target.matches('input, textarea, [contenteditable="true"], select, button')) {
            if (!isDragging) {
                // It's a click - remove selection to prevent cursor blinking
                setTimeout(() => {
                    window.getSelection().removeAllRanges();
                }, 0);
            }
            // Reset drag state
            isDragging = false;
            dragStartTime = 0;
        }
    }, true);
    
    // Force default cursor on all elements
    const allElements = document.querySelectorAll('*');
    allElements.forEach(el => {
        if (!el.matches('input, textarea, [contenteditable="true"], select, button')) {
            el.style.cursor = 'default';
            el.style.userSelect = 'text';
        }
    });
}

// Admin Dashboard JavaScript
console.log('🚀 Admin Dashboard Initializing...');

// Global Variables
let currentTab = 'dashboard';
let quotesData = [];
let customersData = [];
let projectsData = [];
let settingsData = {};

// Initialize Admin Dashboard
document.addEventListener('DOMContentLoaded', function() {
    // Initialize text cursor control
    initTextCursorControl();
    console.log('📊 Admin Dashboard DOM Loaded');
    
    // Check authentication
    if (!checkAdminAuth()) {
        console.log('❌ Admin not authenticated, redirecting...');
        window.location.href = 'index.html';
        return;
    }
    
    // 테스트 데이터 완전 삭제
    clearAllTestDataDirectly();
    
    // Initialize components
    initializeTabs();
    
    // Load all data in correct order
    loadQuotesData().then(() => {
        loadCustomersData();
        loadProjectsData();
    });
    
    // Initialize charts and dashboard
    initializeCharts();
    updateDashboardStats();
    updateCustomerStats();
    updateProjectStats();
    
    loadSettings();
    
    // Setup real-time data sync
    setupRealTimeSync();
    
    // Hide loading overlay
    setTimeout(() => {
        document.getElementById('loadingOverlay').classList.add('hidden');
    }, 1000);
    
    console.log('✅ Admin Dashboard Initialized');
});

function clearAllTestDataDirectly() {
    console.log('🧹 Directly clearing all test data...');
    
    // localStorage에서 데이터 로드
    let quotesData = JSON.parse(localStorage.getItem('quotesData') || '[]');
    let customersData = JSON.parse(localStorage.getItem('customersData') || '[]');
    
    // 테스트 데이터만 필터링하여 삭제
    const originalQuotes = quotesData.filter(quote => !quote.id.startsWith('test-'));
    const originalCustomers = customersData.filter(customer => 
        originalQuotes.some(quote => 
            (quote.customerInfo?.email === customer.email) || 
            (quote.customerInfo?.name === customer.name)
        )
    );
    
    // localStorage 업데이트
    localStorage.setItem('quotesData', JSON.stringify(originalQuotes));
    localStorage.setItem('customersData', JSON.stringify(originalCustomers));
    
    console.log(`✅ Test data cleared. Remaining: ${originalQuotes.length} quotes, ${originalCustomers.length} customers`);
}

// Setup real-time data synchronization
function setupRealTimeSync() {
    console.log('🔄 Setting up real-time data sync...');
    
    // Store interval ID for cleanup
    window.quotesSyncInterval = null;
    
    // Listen for storage changes
    const storageHandler = function(e) {
        if (e.key === 'quotesData') {
            console.log('📋 Quotes data updated, refreshing all data...');
            loadQuotesData().then(() => {
                loadCustomersData();
                loadProjectsData();
            });
            
            // Update all stats and UI
            updateDashboardStats();
            updateCustomerStats();
            updateProjectStats();
            
            // Re-render tables
            renderQuotesTable();
            renderCustomersTable();
            renderProjectsTable();
            
            // Only update charts if we're on dashboard tab
            if (currentTab === 'dashboard') {
                initializeCharts();
            }
        }
    };
    
    // Listen for custom events
    const customEventHandler = function() {
        console.log('📋 Quotes data updated via custom event, refreshing all data...');
        console.log('🔍 Event details:', event);
        loadQuotesData().then(() => {
            loadCustomersData();
            loadProjectsData();
        });
        
        // Update all stats and UI
        updateDashboardStats();
        updateCustomerStats();
        updateProjectStats();
        
        // Re-render tables
        renderQuotesTable();
        renderCustomersTable();
        renderProjectsTable();
        
        // Only update charts if we're on dashboard tab
        if (currentTab === 'dashboard') {
            initializeCharts();
        }
    };
    
    window.addEventListener('storage', storageHandler);
    window.addEventListener('quotesDataUpdated', customEventHandler);
    
    // Periodic refresh (every 2 seconds) - 더 빠른 감지
    window.quotesSyncInterval = setInterval(() => {
        const currentQuotes = localStorage.getItem('quotesData');
        console.log('🔄 Periodic check - current quotes:', currentQuotes);
        console.log('🔄 Last quotes data:', window.lastQuotesData);
        
        if (currentQuotes !== window.lastQuotesData) {
            window.lastQuotesData = currentQuotes;
            console.log('📋 Quotes data changed, refreshing all data...');
            loadQuotesData().then(() => {
                loadCustomersData();
                loadProjectsData();
                
                // Update all stats and UI
                updateDashboardStats();
                updateCustomerStats();
                updateProjectStats();
                
                // Re-render tables
                renderQuotesTable();
                renderCustomersTable();
                renderProjectsTable();
                
                // Only update charts if we're on dashboard tab
                if (currentTab === 'dashboard') {
                    initializeCharts();
                }
            });
        } else {
            console.log('🔄 No changes detected in quotes data');
        }
    }, 2000);
    
    // 추가: 페이지 포커스 시 강제 새로고침
    window.addEventListener('focus', () => {
        console.log('🔄 Page focused, forcing refresh...');
        loadQuotesData();
    });
    
    // 추가: 페이지 가시성 변경 시 새로고침
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            console.log('🔄 Page became visible, refreshing...');
            loadQuotesData();
        }
    });
    
    console.log('✅ Real-time sync setup complete');
}

// Authentication Check
function checkAdminAuth() {
    const isAuthenticated = localStorage.getItem('adminAuthenticated') === 'true';
    const loginTime = localStorage.getItem('adminLoginTime');
    const sessionTimeout = 30 * 60 * 1000; // 30 minutes
    
    if (!isAuthenticated) return false;
    
    if (loginTime && (Date.now() - parseInt(loginTime)) > sessionTimeout) {
        localStorage.removeItem('adminAuthenticated');
        localStorage.removeItem('adminLoginTime');
        return false;
    }
    
    return true;
}

// Tab Management
function initializeTabs() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-tab');
            switchTab(tabName);
        });
    });
}

function switchTab(tabName) {
    // Update navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // Update content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(tabName).classList.add('active');
    
    currentTab = tabName;
    
    // Load tab-specific data
    switch(tabName) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'quotes':
            loadQuotesData();
            break;
        case 'customers':
            loadCustomersData();
            break;
        case 'projects':
            loadProjectsData();
            break;
        case 'analytics':
            loadAnalyticsData();
            break;
        case 'settings':
            loadSettings();
            break;
    }
}

// Dashboard Data Loading
async function loadDashboardData() {
    console.log('📊 Loading dashboard data...');
    
    try {
        // Firebase에서 견적 데이터 로드 시도
        if (typeof window.loadQuotesFromFirebase === 'function') {
            console.log('🔥 Loading quotes from Firebase...');
            quotesData = await window.loadQuotesFromFirebase();
            console.log('✅ Firebase에서 견적 로드 완료:', quotesData.length, '개');
        } else {
            console.log('⚠️ Firebase 함수를 찾을 수 없음, localStorage에서 로드...');
            // Firebase 로드 실패 시 localStorage에서 로드
            const savedQuotes = localStorage.getItem('quotesData');
            if (savedQuotes) {
                quotesData = JSON.parse(savedQuotes);
            }
        }
        
        // Load customers data
        const savedCustomers = localStorage.getItem('customersData');
        if (savedCustomers) {
            customersData = JSON.parse(savedCustomers);
        }
        
        // Load projects data
        const savedProjects = localStorage.getItem('projectsData');
        if (savedProjects) {
            projectsData = JSON.parse(savedProjects);
        }
        
        // Update dashboard stats
        updateDashboardStats();
        updateRecentActivity();
        
        // Initialize charts only if we're on dashboard tab
        if (currentTab === 'dashboard') {
            initializeDashboardCharts();
        }
    } catch (error) {
        console.error('❌ Error loading dashboard data:', error);
    }
}

function updateDashboardStats() {
    try {
        // Total quotes
        document.getElementById('totalQuotes').textContent = quotesData.length || 0;
        
        // Total customers
        document.getElementById('totalCustomers').textContent = customersData.length || 0;
        
        // Active projects
        const activeProjects = projectsData.filter(p => p.status !== 'completed');
        document.getElementById('activeProjects').textContent = activeProjects.length || 0;
        
        // Monthly revenue
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const monthlyRevenue = projectsData
            .filter(p => {
                const projectDate = new Date(p.startDate);
                return projectDate.getMonth() === currentMonth && 
                       projectDate.getFullYear() === currentYear &&
                       p.status === 'completed';
            })
            .reduce((sum, p) => sum + (p.price || 0), 0);
        
        document.getElementById('monthlyRevenue').textContent = formatCurrency(monthlyRevenue);
    } catch (error) {
        console.error('❌ Error updating dashboard stats:', error);
    }
}

function updateRecentActivity() {
    const activityList = document.getElementById('recentActivity');
    if (!activityList) return;
    
    const activities = [];
    
    // Add recent quotes
    if (quotesData && quotesData.length > 0) {
        quotesData.slice(-5).forEach(quote => {
            activities.push({
                type: 'quote',
                title: `새로운 견적 요청: ${quote.customerInfo?.name || '고객명 없음'}`,
                time: quote.createdAt,
                icon: '📋'
            });
        });
    }
    
    // Add recent projects
    if (projectsData && projectsData.length > 0) {
        projectsData.slice(-5).forEach(project => {
            activities.push({
                type: 'project',
                title: `프로젝트 상태 변경: ${project.name}`,
                time: project.updatedAt,
                icon: '🚀'
            });
        });
    }
    
    // Sort by time and take latest 10
    activities.sort((a, b) => new Date(b.time) - new Date(a.time));
    const recentActivities = activities.slice(0, 10);
    
    // Render activities
    activityList.innerHTML = recentActivities.map(activity => `
        <div class="activity-item">
            <div class="activity-icon">${activity.icon}</div>
            <div class="activity-content">
                <div class="activity-title">${activity.title}</div>
                <div class="activity-time">${formatDate(activity.time)}</div>
            </div>
        </div>
    `).join('');
}

// Charts Initialization
function initializeCharts() {
    // Initialize Chart.js defaults
    Chart.defaults.font.family = 'Inter, sans-serif';
    Chart.defaults.color = '#64748b';
}

// Global chart instances
let quotesChart = null;
let packagesChart = null;
let revenueChart = null;
let trafficChart = null;
let packagePerformanceChart = null;
let monthlyQuotesChart = null;

function initializeDashboardCharts() {
    // Destroy existing charts if they exist
    if (quotesChart && typeof quotesChart.destroy === 'function') {
        quotesChart.destroy();
        quotesChart = null;
    }
    if (packagesChart && typeof packagesChart.destroy === 'function') {
        packagesChart.destroy();
        packagesChart = null;
    }
    
    // Quotes Chart
    const quotesCtx = document.getElementById('quotesChart');
    if (quotesCtx && quotesCtx.getContext) {
        quotesChart = new Chart(quotesCtx, {
            type: 'line',
            data: {
                labels: getLast7Days(),
                datasets: [{
                    label: '견적 요청',
                    data: getQuotesDataForChart(),
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }
    
    // Packages Chart
    const packagesCtx = document.getElementById('packagesChart');
    if (packagesCtx && packagesCtx.getContext) {
        const packageData = getPackageDataForChart();
        packagesChart = new Chart(packagesCtx, {
            type: 'doughnut',
            data: {
                labels: packageData.labels,
                datasets: [{
                    data: packageData.data,
                    backgroundColor: [
                        '#3b82f6',
                        '#10b981',
                        '#f59e0b'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
}

function getLast7Days() {
    const days = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        days.push(date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }));
    }
    return days;
}

function getQuotesDataForChart() {
    const data = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayQuotes = quotesData.filter(quote => {
            const quoteDate = new Date(quote.createdAt);
            return quoteDate.toDateString() === date.toDateString();
        });
        data.push(dayQuotes.length);
    }
    return data;
}

function getPackageDataForChart() {
    const packages = {
        '스파크 1P': 0,
        '빌더 6P': 0,
        '맥스 10P': 0
    };
    
    quotesData.forEach(quote => {
        const packageName = quote.package?.name;
        if (packageName && packages.hasOwnProperty(packageName)) {
            packages[packageName]++;
        }
    });
    
    return {
        labels: Object.keys(packages),
        data: Object.values(packages)
    };
}

// Quotes Management
async function loadQuotesData() {
    console.log('📋 Loading quotes data...');
    
    try {
        // Firebase에서 견적 데이터 로드 시도
        if (typeof window.loadQuotesFromFirebase === 'function') {
            console.log('🔥 Loading quotes from Firebase...');
            quotesData = await window.loadQuotesFromFirebase();
            console.log('✅ Firebase에서 견적 로드 완료:', quotesData.length, '개');
            console.log('📊 Firebase 견적 데이터:', quotesData);
        } else {
            console.log('⚠️ Firebase 함수를 찾을 수 없음, localStorage에서 로드...');
            // Firebase 로드 실패 시 localStorage에서 로드
            const savedQuotes = localStorage.getItem('quotesData');
            console.log('🔍 Raw quotes data from localStorage:', savedQuotes);
            
            if (savedQuotes) {
                quotesData = JSON.parse(savedQuotes);
                console.log('✅ localStorage에서 견적 로드 완료:', quotesData.length, '개');
            } else {
                quotesData = [];
                console.log('ℹ️ No quotes data found, initializing empty array');
                
                // 테스트용 견적 데이터 추가
                addTestData();
            }
        }
        
        // 견적 테이블 렌더링
        renderQuotesTable();
        
    } catch (error) {
        console.error('❌ Error loading quotes data:', error);
        quotesData = [];
    }
}

function addTestData() {
    console.log('📝 Adding test data...');
    
    const testQuotes = generateTestQuotes();
    quotesData = testQuotes;
    localStorage.setItem('quotesData', JSON.stringify(quotesData));
    console.log('✅ Test data added:', quotesData.length, 'quotes');
}

function resetTestData() {
    const currentQuotes = quotesData.length;
    const testQuotesCount = quotesData.filter(q => q.id.startsWith('test-')).length;
    
    if (confirm(`테스트 데이터를 관리하시겠습니까?\n\n현재 견적: ${currentQuotes}개\n테스트 견적: ${testQuotesCount}개\n\n1. 테스트 데이터만 추가\n2. 테스트 데이터만 삭제\n3. 모든 데이터 초기화 (테스트 데이터만)\n4. 허진영 견적 추가\n5. 기존 데이터 복구\n6. 데이터 완전 초기화\n7. 테스트 데이터 모두 삭제`)) {
        const choice = prompt('선택하세요:\n1: 테스트 데이터 추가\n2: 테스트 데이터만 삭제\n3: 모든 데이터 초기화 (테스트 데이터만)\n4: 허진영 견적 추가\n5: 기존 데이터 복구\n6: 데이터 완전 초기화\n7: 테스트 데이터 모두 삭제\n\n번호를 입력하세요:');
        
        switch(choice) {
            case '1':
                addTestDataOnly();
                break;
            case '2':
                removeTestDataOnly();
                break;
            case '3':
                resetAllData();
                break;
            case '4':
                addHeoJinYoungQuote();
                break;
            case '5':
                restoreOriginalData();
                break;
            case '6':
                resetAllDataCompletely();
                break;
            case '7':
                clearAllTestData();
                break;
            default:
                showNotification('취소되었습니다.', 'info');
                return;
        }
    }
}

function addTestDataOnly() {
    // 기존 테스트 데이터가 있는지 확인
    const existingTestIds = quotesData.filter(q => q.id.startsWith('test-')).map(q => q.id);
    
    if (existingTestIds.length > 0) {
        if (!confirm(`이미 테스트 데이터가 ${existingTestIds.length}개 있습니다.\n\n기존 테스트 데이터를 삭제하고 새로 생성하시겠습니까?`)) {
            return;
        }
        // 기존 테스트 데이터 삭제
        quotesData = quotesData.filter(q => !q.id.startsWith('test-'));
    }
    
    // 새로운 테스트 데이터 생성
    const newTestQuotes = generateTestQuotes();
    quotesData = [...quotesData, ...newTestQuotes];
    
    localStorage.setItem('quotesData', JSON.stringify(quotesData));
    renderQuotesTable();
    updateDashboardStats();
    showNotification(`테스트 데이터 ${newTestQuotes.length}개가 추가되었습니다. (총 ${quotesData.length}개)`, 'success');
}

function removeTestDataOnly() {
    const testQuotesCount = quotesData.filter(q => q.id.startsWith('test-')).length;
    
    if (testQuotesCount === 0) {
        showNotification('삭제할 테스트 데이터가 없습니다.', 'info');
        return;
    }
    
    if (confirm(`테스트 데이터 ${testQuotesCount}개를 삭제하시겠습니까?`)) {
        quotesData = quotesData.filter(q => !q.id.startsWith('test-'));
        localStorage.setItem('quotesData', JSON.stringify(quotesData));
        renderQuotesTable();
        updateDashboardStats();
        showNotification(`테스트 데이터 ${testQuotesCount}개가 삭제되었습니다. (남은 견적: ${quotesData.length}개)`, 'success');
    }
}

function resetAllData() {
    if (confirm('⚠️ 경고: 모든 견적 데이터가 삭제됩니다!\n\n정말로 모든 데이터를 초기화하고 테스트 데이터만 생성하시겠습니까?')) {
        localStorage.removeItem('quotesData');
        addTestData();
        renderQuotesTable();
        updateDashboardStats();
        showNotification('모든 데이터가 초기화되고 테스트 데이터가 생성되었습니다.', 'success');
    }
}

function generateTestQuotes() {
    const testQuotes = [
        {
            id: 'test-001',
            customerInfo: {
                name: '김철수',
                email: 'kim@test.com',
                phone: '010-1234-5678'
            },
            package: {
                type: 'basic',
                name: '스파크 1P',
                price: 99000
            },
            status: 'new',
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7일 전
            projectDescription: '간단한 랜딩페이지 제작 요청'
        },
        {
            id: 'test-002',
            customerInfo: {
                name: '이영희',
                email: 'lee@test.com',
                phone: '010-2345-6789'
            },
            package: {
                type: 'standard',
                name: '빌더 6P',
                price: 390000
            },
            status: 'reviewing',
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5일 전
            projectDescription: '중소기업 웹사이트 제작'
        },
        {
            id: 'test-003',
            customerInfo: {
                name: '박민수',
                email: 'park@test.com',
                phone: '010-3456-7890'
            },
            package: {
                type: 'premium',
                name: '맥스 10P',
                price: 590000
            },
            status: 'quoted',
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3일 전
            projectDescription: '프리미엄 쇼핑몰 제작'
        },
        {
            id: 'test-004',
            customerInfo: {
                name: '최지영',
                email: 'choi@test.com',
                phone: '010-4567-8901'
            },
            package: {
                type: 'standard',
                name: '빌더 6P',
                price: 390000
            },
            status: 'negotiating',
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2일 전
            projectDescription: '교육기관 웹사이트 제작'
        },
        {
            id: 'test-005',
            customerInfo: {
                name: '정수민',
                email: 'jung@test.com',
                phone: '010-5678-9012'
            },
            package: {
                type: 'basic',
                name: '스파크 1P',
                price: 99000
            },
            status: 'accepted',
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1일 전
            projectDescription: '개인 포트폴리오 사이트'
        },
        {
            id: 'test-006',
            customerInfo: {
                name: '한동훈',
                email: 'han@test.com',
                phone: '010-6789-0123'
            },
            package: {
                type: 'premium',
                name: '맥스 10P',
                price: 590000
            },
            status: 'rejected',
            createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12시간 전
            projectDescription: '대기업 홈페이지 제작'
        }
    ];
    
    return testQuotes;
}

function addHeoJinYoungQuote() {
    console.log('📝 Adding Heo Jin Young quote...');
    
    // 허진영의 견적 데이터 생성
    const heoJinYoungQuote = {
        id: 'heo-jin-young-001',
        customerInfo: {
            name: '허진영',
            email: 'heo@brighttomorrow.com',
            phone: '010-1234-5678',
            message: '밝은내일 웹사이트 리뉴얼 프로젝트'
        },
        package: {
            id: 'premium',
            name: '맥스 10P',
            price: 590000
        },
        options: [
            {
                id: 'domain',
                name: '도메인 등록 및 연결 (1년) - 스파크 1P만',
                price: 25000
            },
            {
                id: 'maintenance',
                name: '기본 유지보수 (1개월)',
                price: 69000
            }
        ],
        totalAmount: 684000,
        status: 'accepted',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10일 전
        projectName: '밝은내일 웹사이트 리뉴얼',
        maintenance: {
            name: '기본 유지보수 (1개월)',
            price: 69000
        },
        quoteNumber: 'BT-2024-1230-001',
        completionDate: '2024년 1월 6일',
        projectDescription: '기존 웹사이트를 현대적이고 반응형으로 리뉴얼하여 사용자 경험을 개선하고 비즈니스 성장을 도모하는 프로젝트입니다.'
    };
    
    // 기존 허진영 견적이 있는지 확인
    const existingHeoQuote = quotesData.find(q => q.customerInfo?.name === '허진영');
    
    if (existingHeoQuote) {
        if (confirm('허진영의 견적이 이미 있습니다. 교체하시겠습니까?')) {
            // 기존 견적 삭제
            quotesData = quotesData.filter(q => q.customerInfo?.name !== '허진영');
        } else {
            showNotification('취소되었습니다.', 'info');
            return;
        }
    }
    
    // 새 견적 추가
    quotesData.push(heoJinYoungQuote);
    localStorage.setItem('quotesData', JSON.stringify(quotesData));
    
    renderQuotesTable();
    updateDashboardStats();
    showNotification('허진영의 견적이 추가되었습니다.', 'success');
}

function resetAllDataCompletely() {
    if (confirm('⚠️ 경고: 모든 데이터가 완전히 삭제됩니다!\n\n견적 데이터, 고객 데이터, 모든 설정이 초기화됩니다.\n\n정말로 모든 데이터를 완전히 초기화하시겠습니까?')) {
        // 모든 데이터 삭제
        localStorage.removeItem('quotesData');
        localStorage.removeItem('customersData');
        localStorage.removeItem('portfolioData');
        localStorage.removeItem('adminSettings');
        
        // 배열 초기화
        quotesData = [];
        customersData = [];
        
        // 페이지 새로고침
        location.reload();
        
        showNotification('모든 데이터가 완전히 초기화되었습니다.', 'success');
    }
}

function clearAllTestData() {
    if (confirm('🧹 테스트 데이터를 모두 삭제하시겠습니까?\n\n모든 테스트 견적과 고객 데이터가 삭제됩니다.\n\n실제 고객 데이터는 유지됩니다.')) {
        console.log('🧹 Clearing all test data...');
        
        // 테스트 데이터만 필터링하여 삭제
        const originalQuotes = quotesData.filter(quote => !quote.id.startsWith('test-'));
        const originalCustomers = customersData.filter(customer => 
            !originalQuotes.some(quote => 
                (quote.customerInfo?.email === customer.email) || 
                (quote.customerInfo?.name === customer.name)
            )
        );
        
        // 테스트 데이터 제거된 배열로 업데이트
        quotesData = originalQuotes;
        customersData = originalCustomers;
        
        // localStorage 업데이트
        localStorage.setItem('quotesData', JSON.stringify(quotesData));
        localStorage.setItem('customersData', JSON.stringify(customersData));
        
        // UI 업데이트
        updateDashboardStats();
        updateCustomerStats();
        renderQuotesTable();
        renderCustomersTable();
        
        console.log(`✅ Test data cleared. Remaining: ${quotesData.length} quotes, ${customersData.length} customers`);
        showNotification('테스트 데이터가 모두 삭제되었습니다.', 'success');
    }
}

function restoreOriginalData() {
    console.log('📝 Restoring original data...');
    
    // 기존에 있던 실제 견적 데이터 복구
    const originalQuotes = [
        {
            id: 'original-001',
            customerInfo: {
                name: '허진영',
                email: 'heo@brighttomorrow.com',
                phone: '010-1234-5678',
                message: '밝은내일 웹사이트 리뉴얼 프로젝트'
            },
            package: {
                id: 'premium',
                name: '맥스 10P',
                price: 590000
            },
            options: [
                {
                    id: 'domain',
                    name: '도메인 등록 및 연결 (1년)',
                    price: 25000
                },
                {
                    id: 'maintenance',
                    name: '기본 유지보수 (1개월)',
                    price: 69000
                }
            ],
            totalAmount: 684000,
            status: 'accepted',
            createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15일 전
            projectName: '밝은내일 웹사이트 리뉴얼',
            maintenance: {
                name: '기본 유지보수 (1개월)',
                price: 69000
            },
            quoteNumber: 'BT-2024-1215-001',
            completionDate: '2024년 12월 22일',
            projectDescription: '기존 웹사이트를 현대적이고 반응형으로 리뉴얼하여 사용자 경험을 개선하고 비즈니스 성장을 도모하는 프로젝트입니다.'
        },
        {
            id: 'original-002',
            customerInfo: {
                name: '김영수',
                email: 'kim.youngsu@company.com',
                phone: '010-9876-5432',
                message: '회사 홈페이지 제작 요청'
            },
            package: {
                id: 'standard',
                name: '빌더 6P',
                price: 390000
            },
            options: [
                {
                    id: 'seo',
                    name: 'SEO 최적화',
                    price: 50000
                }
            ],
            totalAmount: 440000,
            status: 'reviewing',
            createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(), // 12일 전
            projectName: '김영수 회사 홈페이지',
            maintenance: {
                name: '기본 유지보수 (1개월)',
                price: 69000
            },
            quoteNumber: 'BT-2024-1218-002',
            completionDate: '2024년 12월 25일',
            projectDescription: '중소기업 홈페이지 제작으로 브랜드 인지도 향상과 온라인 마케팅 효과를 극대화하는 프로젝트입니다.'
        },
        {
            id: 'original-003',
            customerInfo: {
                name: '이미나',
                email: 'lee.mina@shop.com',
                phone: '010-5555-1234',
                message: '온라인 쇼핑몰 제작'
            },
            package: {
                id: 'premium',
                name: '맥스 10P',
                price: 590000
            },
            options: [
                {
                    id: 'payment',
                    name: '결제 시스템 연동',
                    price: 100000
                },
                {
                    id: 'inventory',
                    name: '재고 관리 시스템',
                    price: 80000
                }
            ],
            totalAmount: 770000,
            status: 'negotiating',
            createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), // 8일 전
            projectName: '이미나 쇼핑몰',
            maintenance: {
                name: '프리미엄 유지보수 (1개월)',
                price: 249000
            },
            quoteNumber: 'BT-2024-1222-003',
            completionDate: '2024년 12월 29일',
            projectDescription: '전문적인 온라인 쇼핑몰 구축으로 매출 증대와 고객 만족도를 높이는 프로젝트입니다.'
        }
    ];
    
    // 기존 데이터와 병합
    const existingNonTestQuotes = quotesData.filter(q => !q.id.startsWith('test-'));
    const allQuotes = [...existingNonTestQuotes, ...originalQuotes];
    
    // 중복 제거 (ID 기준)
    const uniqueQuotes = allQuotes.filter((quote, index, self) => 
        index === self.findIndex(q => q.id === quote.id)
    );
    
    quotesData = uniqueQuotes;
    localStorage.setItem('quotesData', JSON.stringify(quotesData));
    
    renderQuotesTable();
    updateDashboardStats();
    showNotification(`기존 데이터 ${originalQuotes.length}개가 복구되었습니다. (총 ${quotesData.length}개)`, 'success');
}

function renderQuotesTable() {
    const tbody = document.getElementById('quotesTableBody');
    if (!tbody) return;
    
    // Escape HTML to prevent XSS
    const escapeHtml = (text) => {
        if (typeof text !== 'string') return '';
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    };
    
    if (!quotesData || quotesData.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center" style="padding: 2rem;">
                    <p>견적 요청이 없습니다.</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = quotesData.map((quote, index) => {
        // 데이터 구조 디버깅
        console.log(`Quote ${index}:`, quote);
        console.log(`Customer Info:`, quote.customerInfo);
        
        // customerInfo가 없는 경우 기본값 설정
        const customerName = quote.customerInfo?.name || quote.name || '고객명 없음';
        const customerPhone = quote.customerInfo?.phone || quote.phone || '연락처 없음';
        const packageName = quote.package?.name || quote.packageName || '패키지 미선택';
        const packagePrice = quote.package?.price || quote.packagePrice || 0;
        
        return `
            <tr>
                <td>#${String(index + 1).padStart(3, '0')}</td>
                <td>${escapeHtml(customerName)}</td>
                <td>${escapeHtml(customerPhone)}</td>
                <td>${escapeHtml(packageName)}</td>
                <td>${formatCurrency(packagePrice)}</td>
                <td>
                    <select class="status-select" onchange="updateQuoteStatus('${quote.id}', this.value)" data-current-status="${quote.status || 'new'}">
                        <option value="new" ${(quote.status || 'new') === 'new' ? 'selected' : ''}>신규 접수</option>
                        <option value="reviewing" ${quote.status === 'reviewing' ? 'selected' : ''}>검토 중</option>
                        <option value="quoted" ${quote.status === 'quoted' ? 'selected' : ''}>견적 발송</option>
                        <option value="negotiating" ${quote.status === 'negotiating' ? 'selected' : ''}>협의 중</option>
                        <option value="accepted" ${quote.status === 'accepted' ? 'selected' : ''}>승인됨</option>
                        <option value="rejected" ${quote.status === 'rejected' ? 'selected' : ''}>거절됨</option>
                    </select>
                </td>
                <td>${formatDate(quote.createdAt)}</td>
                <td>
                    <button class="btn btn-secondary" onclick="viewQuoteDetail(${index})">보기</button>
                    <button class="btn btn-danger" onclick="deleteQuote('${quote.id}')">🗑️ 삭제</button>
                </td>
            </tr>
        `;
    }).join('');
}

function filterQuotes() {
    const statusFilter = document.getElementById('statusFilter').value;
    const packageFilter = document.getElementById('packageFilter').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    let filteredQuotes = [...quotesData];
    
    if (statusFilter !== 'all') {
        filteredQuotes = filteredQuotes.filter(quote => quote.status === statusFilter);
    }
    
    if (packageFilter !== 'all') {
        filteredQuotes = filteredQuotes.filter(quote => quote.package?.type === packageFilter);
    }
    
    if (startDate) {
        filteredQuotes = filteredQuotes.filter(quote => 
            new Date(quote.createdAt) >= new Date(startDate)
        );
    }
    
    if (endDate) {
        filteredQuotes = filteredQuotes.filter(quote => 
            new Date(quote.createdAt) <= new Date(endDate)
        );
    }
    
    renderFilteredQuotes(filteredQuotes);
}

function renderFilteredQuotes(quotes) {
    const tbody = document.getElementById('quotesTableBody');
    
    // Escape HTML to prevent XSS
    const escapeHtml = (text) => {
        if (typeof text !== 'string') return '';
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    };
    
    if (quotes.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center" style="padding: 2rem;">
                    <p>필터 조건에 맞는 견적이 없습니다.</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = quotes.map((quote, index) => {
        // customerInfo가 없는 경우 기본값 설정
        const customerName = quote.customerInfo?.name || quote.name || '고객명 없음';
        const customerPhone = quote.customerInfo?.phone || quote.phone || '연락처 없음';
        const packageName = quote.package?.name || quote.packageName || '패키지 미선택';
        const packagePrice = quote.package?.price || quote.packagePrice || 0;
        
        return `
            <tr>
                <td>#${String(index + 1).padStart(3, '0')}</td>
                <td>${escapeHtml(customerName)}</td>
                <td>${escapeHtml(customerPhone)}</td>
                <td>${escapeHtml(packageName)}</td>
                <td>${formatCurrency(packagePrice)}</td>
                <td>
                    <select class="status-select" onchange="updateQuoteStatus('${quote.id}', this.value)" data-current-status="${quote.status || 'new'}">
                        <option value="new" ${(quote.status || 'new') === 'new' ? 'selected' : ''}>신규 접수</option>
                        <option value="reviewing" ${quote.status === 'reviewing' ? 'selected' : ''}>검토 중</option>
                        <option value="quoted" ${quote.status === 'quoted' ? 'selected' : ''}>견적 발송</option>
                        <option value="negotiating" ${quote.status === 'negotiating' ? 'selected' : ''}>협의 중</option>
                        <option value="accepted" ${quote.status === 'accepted' ? 'selected' : ''}>승인됨</option>
                        <option value="rejected" ${quote.status === 'rejected' ? 'selected' : ''}>거절됨</option>
                    </select>
                </td>
                <td>${formatDate(quote.createdAt)}</td>
                <td>
                    <button class="btn btn-secondary" onclick="viewQuoteDetail(${quotesData.indexOf(quote)})">보기</button>
                    <button class="btn btn-danger" onclick="deleteQuote('${quote.id}')">🗑️ 삭제</button>
                </td>
            </tr>
        `;
    }).join('');
}

function viewQuoteDetail(index) {
    if (index < 0 || index >= quotesData.length) {
        console.error('❌ Invalid quote index:', index);
        showNotification('견적을 찾을 수 없습니다.', 'error');
        return;
    }
    
    // Escape HTML to prevent XSS
    const escapeHtml = (text) => {
        if (typeof text !== 'string') return '';
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    };
    
    const quote = quotesData[index];
    const modal = document.getElementById('quoteDetailModal');
    const content = document.getElementById('quoteDetailContent');
    
    // 상태별 색상 클래스
    const getStatusClass = (status) => {
        const statusClasses = {
            'new': 'status-new',
            'reviewing': 'status-reviewing',
            'quoted': 'status-quoted',
            'negotiating': 'status-negotiating',
            'accepted': 'status-accepted',
            'rejected': 'status-rejected'
        };
        return statusClasses[status] || 'status-new';
    };
    
    // 견적번호 생성
    const quoteNumber = quote.quoteNumber || `BT-${new Date(quote.createdAt).getFullYear()}-${String(new Date(quote.createdAt).getMonth() + 1).padStart(2, '0')}${String(new Date(quote.createdAt).getDate()).padStart(2, '0')}-${String(index + 1).padStart(3, '0')}`;
    
    content.innerHTML = `
        <div class="quote-detail-modern">
            <!-- 헤더 섹션 -->
            <div class="quote-header">
                <div class="quote-title">
                    <h3>📋 견적 상세 정보</h3>
                    <div class="quote-number">${quoteNumber}</div>
                </div>
                <div class="quote-status">
                    <span class="status-badge-modern ${getStatusClass(quote.status)}">
                        ${getStatusText(quote.status)}
                    </span>
                </div>
            </div>
            
            <!-- 고객 정보 섹션 -->
            <div class="detail-section customer-section">
                <div class="section-header">
                    <h4>👤 고객 정보</h4>
                </div>
                <div class="section-content">
                    <div class="info-grid">
                        <div class="info-item">
                            <label>이름</label>
                            <span>${escapeHtml(quote.customerInfo?.name) || '없음'}</span>
                        </div>
                        <div class="info-item">
                            <label>이메일</label>
                            <span>${escapeHtml(quote.customerInfo?.email) || '없음'}</span>
                        </div>
                        <div class="info-item">
                            <label>연락처</label>
                            <span>${escapeHtml(quote.customerInfo?.phone) || '없음'}</span>
                        </div>
                        <div class="info-item full-width">
                            <label>프로젝트 요구사항</label>
                            <span>${escapeHtml(quote.customerInfo?.message || quote.projectDescription) || '없음'}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- 패키지 정보 섹션 -->
            <div class="detail-section package-section">
                <div class="section-header">
                    <h4>📦 패키지 정보</h4>
                </div>
                <div class="section-content">
                    <div class="package-card">
                        <div class="package-header">
                            <h5>${escapeHtml(quote.package?.name) || '패키지 미선택'}</h5>
                            <div class="package-price">${formatCurrency(quote.package?.price || 0)}</div>
                        </div>
                        <div class="package-features">
                            <span class="feature-tag">반응형 디자인</span>
                            <span class="feature-tag">SEO 최적화</span>
                            <span class="feature-tag">7일 완성 보장</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- 견적 정보 섹션 -->
            <div class="detail-section quote-info-section">
                <div class="section-header">
                    <h4>💰 견적 정보</h4>
                </div>
                <div class="section-content">
                    <div class="quote-summary">
                        <div class="summary-item">
                            <label>요청일</label>
                            <span>${formatDate(quote.createdAt)}</span>
                        </div>
                        <div class="summary-item">
                            <label>완료 예정일</label>
                            <span>${quote.completionDate || '7일 후'}</span>
                        </div>
                        <div class="summary-item total">
                            <label>총 견적 금액</label>
                            <span class="total-amount">${formatCurrency(quote.totalAmount || 0)}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- 선택된 옵션 섹션 -->
            <div class="detail-section options-section">
                <div class="section-header">
                    <h4>⚙️ 선택된 옵션</h4>
                </div>
                <div class="section-content">
                    ${quote.options && quote.options.length > 0 ? `
                        <div class="options-list">
                            ${quote.options.map(option => `
                                <div class="option-item">
                                    <div class="option-info">
                                        <span class="option-name">${escapeHtml(option.name)}</span>
                                        <span class="option-price">${formatCurrency(option.price)}</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    ` : `
                        <div class="no-options">
                            <p>추가 옵션을 선택하지 않았습니다.</p>
                        </div>
                    `}
                </div>
            </div>
            
            <!-- 유지보수 정보 섹션 -->
            ${quote.maintenance ? `
                <div class="detail-section maintenance-section">
                    <div class="section-header">
                        <h4>🔧 유지보수 정보</h4>
                    </div>
                    <div class="section-content">
                        <div class="maintenance-info">
                            <div class="maintenance-item">
                                <label>유지보수 플랜</label>
                                <span>${escapeHtml(quote.maintenance.name)}</span>
                            </div>
                            <div class="maintenance-item">
                                <label>유지보수 비용</label>
                                <span>${formatCurrency(quote.maintenance.price)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            ` : ''}
        </div>
    `;
    
    modal.classList.add('active');
}

// Customers Management
function loadCustomersData() {
    console.log('👥 Loading customers data...');
    
    // 먼저 견적 데이터가 로드되었는지 확인
    if (!quotesData || quotesData.length === 0) {
        console.log('⚠️ Quotes data not loaded yet, loading quotes first...');
        loadQuotesData();
    }
    
    // 항상 견적 데이터에서 고객 정보 새로 생성 (동기화 보장)
    console.log('🔄 Generating customers from current quotes data...');
    customersData = generateCustomersFromQuotes();
    localStorage.setItem('customersData', JSON.stringify(customersData));
    console.log(`✅ Generated ${customersData.length} customers from quotes`);
    
    updateCustomerStats();
    renderCustomersTable();
}

function refreshCustomersData() {
    console.log('🔄 Refreshing customers data from quotes...');
    
    // 기존 고객 데이터 완전 삭제
    localStorage.removeItem('customersData');
    
    // 견적 데이터에서 고객 정보 새로 생성
    customersData = generateCustomersFromQuotes();
    localStorage.setItem('customersData', JSON.stringify(customersData));
    
    updateCustomerStats();
    renderCustomersTable();
    
    showNotification('고객 데이터가 견적 데이터와 완전히 동기화되었습니다.', 'success');
}

function forceDataSync() {
    console.log('🚨 Force data synchronization...');
    
    // 현재 데이터 상태 로그
    console.log('Current quotes data:', quotesData);
    console.log('Current customers data:', customersData);
    console.log('Current projects data:', projectsData);
    
    // 모든 데이터 삭제
    localStorage.removeItem('quotesData');
    localStorage.removeItem('customersData');
    localStorage.removeItem('projectsData');
    
    // 견적 데이터 다시 로드
    const savedQuotes = localStorage.getItem('quotesData');
    if (savedQuotes) {
        quotesData = JSON.parse(savedQuotes);
    } else {
        quotesData = [];
    }
    
    // 고객 데이터 완전 재생성
    customersData = generateCustomersFromQuotes();
    localStorage.setItem('customersData', JSON.stringify(customersData));
    
    // 프로젝트 데이터 완전 재생성
    projectsData = generateProjectsFromQuotes();
    localStorage.setItem('projectsData', JSON.stringify(projectsData));
    
    // UI 업데이트
    updateDashboardStats();
    updateCustomerStats();
    updateProjectStats();
    renderQuotesTable();
    renderCustomersTable();
    renderProjectsTable();
    
    showNotification('모든 데이터가 강제 동기화되었습니다.', 'success');
}

function debugDataIssues() {
    console.log('🔍 Debugging data issues...');
    
    // 견적 데이터 분석
    console.log('=== QUOTES DATA ANALYSIS ===');
    quotesData.forEach((quote, index) => {
        console.log(`Quote ${index + 1}:`, {
            id: quote.id,
            customerName: quote.customerInfo?.name,
            customerEmail: quote.customerInfo?.email,
            customerPhone: quote.customerInfo?.phone,
            totalAmount: quote.totalAmount,
            packagePrice: quote.package?.price,
            status: quote.status,
            createdAt: quote.createdAt
        });
    });
    
    // 고객 데이터 분석
    console.log('=== CUSTOMERS DATA ANALYSIS ===');
    customersData.forEach((customer, index) => {
        console.log(`Customer ${index + 1}:`, {
            id: customer.id,
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            totalQuotes: customer.totalQuotes,
            totalAmount: customer.totalAmount,
            lastQuoteDate: customer.lastQuoteDate
        });
        
        // 해당 고객의 견적 찾기
        const customerQuotes = quotesData.filter(quote => {
            const quoteEmail = quote.customerInfo?.email;
            const quoteName = quote.customerInfo?.name;
            
            if (customer.email && quoteEmail) {
                return customer.email.toLowerCase().trim() === quoteEmail.toLowerCase().trim();
            } else if (customer.name && quoteName) {
                return customer.name.trim() === quoteName.trim();
            }
            return false;
        });
        
        console.log(`  - Found ${customerQuotes.length} quotes for this customer`);
        customerQuotes.forEach(quote => {
            console.log(`    * Quote ${quote.id}: ${quote.totalAmount}원`);
        });
    });
    
    // 불일치 찾기
    console.log('=== MISMATCH ANALYSIS ===');
    customersData.forEach(customer => {
        const customerQuotes = quotesData.filter(quote => {
            const quoteEmail = quote.customerInfo?.email;
            const quoteName = quote.customerInfo?.name;
            
            if (customer.email && quoteEmail) {
                return customer.email.toLowerCase().trim() === quoteEmail.toLowerCase().trim();
            } else if (customer.name && quoteName) {
                return customer.name.trim() === quoteName.trim();
            }
            return false;
        });
        
        const actualTotalAmount = customerQuotes.reduce((sum, quote) => sum + (quote.totalAmount || 0), 0);
        
        if (customer.totalQuotes !== customerQuotes.length || customer.totalAmount !== actualTotalAmount) {
            console.log(`❌ MISMATCH for ${customer.name}:`);
            console.log(`  - Expected quotes: ${customer.totalQuotes}, Actual: ${customerQuotes.length}`);
            console.log(`  - Expected amount: ${customer.totalAmount}, Actual: ${actualTotalAmount}`);
        }
    });
}

function generateCustomersFromQuotes() {
    console.log('🔄 Generating customers from quotes data...');
    console.log('📊 Total quotes:', quotesData.length);
    
    const customers = [];
    const customerMap = new Map();
    
    quotesData.forEach((quote, index) => {
        const customerInfo = quote.customerInfo;
        console.log(`Quote ${index + 1}:`, {
            name: customerInfo?.name,
            email: customerInfo?.email,
            phone: customerInfo?.phone,
            totalAmount: quote.totalAmount,
            packagePrice: quote.package?.price
        });
        
        if (customerInfo && customerInfo.email) {
            // 이메일을 기준으로 고객 식별 (대소문자 무시, 공백 제거)
            const customerKey = customerInfo.email.toLowerCase().trim();
            
            if (!customerMap.has(customerKey)) {
                // 새 고객 생성
                const customer = {
                    id: customers.length + 1,
                    name: customerInfo.name || '고객명 없음',
                    email: customerInfo.email,
                    phone: customerInfo.phone || '',
                    firstVisit: quote.createdAt,
                    totalQuotes: 1,
                    totalAmount: quote.totalAmount || quote.package?.price || 0,
                    status: 'active',
                    lastQuoteDate: quote.createdAt,
                    quoteIds: [quote.id] // 견적 ID 목록 추가
                };
                customers.push(customer);
                customerMap.set(customerKey, customer);
                console.log(`✅ New customer created: ${customer.name} (${customerKey}) - Amount: ${customer.totalAmount}`);
            } else {
                // 기존 고객 정보 업데이트
                const existingCustomer = customerMap.get(customerKey);
                existingCustomer.totalQuotes++;
                existingCustomer.totalAmount += quote.totalAmount || quote.package?.price || 0;
                existingCustomer.quoteIds.push(quote.id); // 견적 ID 추가
                
                // 마지막 견적 날짜 업데이트
                if (new Date(quote.createdAt) > new Date(existingCustomer.lastQuoteDate)) {
                    existingCustomer.lastQuoteDate = quote.createdAt;
                }
                
                // 고객 정보 업데이트 (더 정확한 정보로)
                if (customerInfo.name && customerInfo.name !== '고객명 없음') {
                    existingCustomer.name = customerInfo.name;
                }
                if (customerInfo.phone && customerInfo.phone !== existingCustomer.phone) {
                    existingCustomer.phone = customerInfo.phone;
                }
                console.log(`🔄 Customer updated: ${existingCustomer.name} - Quotes: ${existingCustomer.totalQuotes}, Total: ${existingCustomer.totalAmount}`);
            }
        } else if (customerInfo && customerInfo.name) {
            // 이메일이 없는 경우 이름으로 식별 (임시)
            const customerKey = customerInfo.name.trim();
            
            if (!customerMap.has(customerKey)) {
                const customer = {
                    id: customers.length + 1,
                    name: customerInfo.name,
                    email: '',
                    phone: customerInfo.phone || '',
                    firstVisit: quote.createdAt,
                    totalQuotes: 1,
                    totalAmount: quote.totalAmount || quote.package?.price || 0,
                    status: 'active',
                    lastQuoteDate: quote.createdAt,
                    quoteIds: [quote.id]
                };
                customers.push(customer);
                customerMap.set(customerKey, customer);
                console.log(`⚠️ Customer without email created: ${customer.name} (${customerKey})`);
            } else {
                const existingCustomer = customerMap.get(customerKey);
                existingCustomer.totalQuotes++;
                existingCustomer.totalAmount += quote.totalAmount || quote.package?.price || 0;
                existingCustomer.quoteIds.push(quote.id);
                
                if (new Date(quote.createdAt) > new Date(existingCustomer.lastQuoteDate)) {
                    existingCustomer.lastQuoteDate = quote.createdAt;
                }
            }
        } else {
            console.log(`⚠️ Quote ${index + 1} has no valid customer info`);
        }
    });
    
    // 고객을 마지막 견적 날짜순으로 정렬
    customers.sort((a, b) => new Date(b.lastQuoteDate) - new Date(a.lastQuoteDate));
    
    console.log('📊 Generated customers:', customers.length);
    customers.forEach(customer => {
        console.log(`- ${customer.name} (${customer.email}): ${customer.totalQuotes} quotes, ${customer.totalAmount} total`);
    });
    
    return customers;
}

function updateCustomerStats() {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const newCustomers = customersData.filter(customer => {
        const visitDate = new Date(customer.firstVisit);
        return visitDate.getMonth() === currentMonth && visitDate.getFullYear() === currentYear;
    }).length;
    
    const repeatCustomers = customersData.filter(customer => customer.totalQuotes > 1).length;
    const avgOrderValue = customersData.length > 0 ? 
        customersData.reduce((sum, customer) => sum + customer.totalAmount, 0) / customersData.length : 0;
    
    document.getElementById('newCustomers').textContent = newCustomers;
    document.getElementById('repeatCustomers').textContent = repeatCustomers;
    document.getElementById('avgOrderValue').textContent = formatCurrency(avgOrderValue);
}

function renderCustomersTable() {
    const tbody = document.getElementById('customersTableBody');
    
    if (customersData.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="text-center" style="padding: 2rem;">
                    <p>고객 데이터가 없습니다.</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = customersData.map(customer => `
        <tr>
            <td>#${String(customer.id).padStart(3, '0')}</td>
            <td>${customer.name || '고객명 없음'}</td>
            <td>${customer.email || '이메일 없음'}</td>
            <td>${customer.phone || '연락처 없음'}</td>
            <td>${formatDate(customer.firstVisit)}</td>
            <td><strong>${customer.totalQuotes}개</strong></td>
            <td><strong>${formatCurrency(customer.totalAmount)}</strong></td>
            <td><span class="status-badge ${customer.status}">${getStatusText(customer.status)}</span></td>
            <td>
                <button class="btn btn-secondary" onclick="viewCustomerDetail(${customer.id})">보기</button>
                <button class="btn btn-primary" onclick="editCustomer(${customer.id})">수정</button>
            </td>
        </tr>
    `).join('');
}

// Projects Management
function loadProjectsData() {
    console.log('🚀 Loading projects data...');
    
    // 먼저 견적 데이터가 로드되었는지 확인
    if (!quotesData || quotesData.length === 0) {
        console.log('⚠️ Quotes data not loaded yet, loading quotes first...');
        loadQuotesData();
    }
    
    const savedProjects = localStorage.getItem('projectsData');
    if (savedProjects) {
        projectsData = JSON.parse(savedProjects);
        console.log(`📊 Loaded ${projectsData.length} projects from localStorage`);
    } else {
        console.log('🔄 No saved projects data, generating from quotes...');
        // Generate projects from accepted quotes
        projectsData = generateProjectsFromQuotes();
        localStorage.setItem('projectsData', JSON.stringify(projectsData));
        console.log(`✅ Generated ${projectsData.length} projects from quotes`);
    }
    
    updateProjectStats();
    renderProjectsTable();
}

function generateProjectsFromQuotes() {
    const projects = [];
    const acceptedQuotes = quotesData.filter(quote => quote.status === 'accepted');
    
    acceptedQuotes.forEach((quote, index) => {
        const project = {
            id: index + 1,
            name: `${quote.customerInfo?.name || '고객'}의 웹사이트`,
            customerName: quote.customerInfo?.name,
            package: quote.package?.name,
            startDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
            expectedEndDate: new Date(Date.now() + Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString(),
            progress: Math.floor(Math.random() * 100),
            status: ['planning', 'design', 'development', 'testing', 'completed'][Math.floor(Math.random() * 5)],
            price: quote.totalAmount,
            updatedAt: new Date().toISOString()
        };
        projects.push(project);
    });
    
    return projects;
}

function updateProjectStats() {
    const statusCounts = {
        planning: 0,
        design: 0,
        development: 0,
        testing: 0,
        completed: 0
    };
    
    projectsData.forEach(project => {
        if (statusCounts.hasOwnProperty(project.status)) {
            statusCounts[project.status]++;
        }
    });
    
    document.getElementById('planningCount').textContent = statusCounts.planning;
    document.getElementById('designCount').textContent = statusCounts.design;
    document.getElementById('developmentCount').textContent = statusCounts.development;
    document.getElementById('testingCount').textContent = statusCounts.testing;
    document.getElementById('completedCount').textContent = statusCounts.completed;
}

function renderProjectsTable() {
    const tbody = document.getElementById('projectsTableBody');
    
    if (projectsData.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="text-center" style="padding: 2rem;">
                    <p>프로젝트가 없습니다.</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = projectsData.map(project => `
        <tr>
            <td>#${String(project.id).padStart(3, '0')}</td>
            <td>${project.name}</td>
            <td>${project.customerName || '고객명 없음'}</td>
            <td>${project.package || '패키지 없음'}</td>
            <td>${formatDate(project.startDate)}</td>
            <td>${formatDate(project.expectedEndDate)}</td>
            <td>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${project.progress}%"></div>
                </div>
                <span style="font-size: 0.8rem; color: #64748b;">${project.progress}%</span>
            </td>
            <td><span class="status-badge ${project.status}">${getStatusText(project.status)}</span></td>
            <td>
                <button class="btn btn-secondary" onclick="viewProjectDetail(${project.id})">보기</button>
                <button class="btn btn-primary" onclick="updateProject(${project.id})">업데이트</button>
            </td>
        </tr>
    `).join('');
}

// Analytics
function loadAnalyticsData() {
    console.log('📈 Loading analytics data...');
    
    // Initialize analytics charts
    initializeAnalyticsCharts();
    updateKeyMetrics();
}

function initializeAnalyticsCharts() {
    // Destroy existing analytics charts if they exist
    if (revenueChart) {
        revenueChart.destroy();
    }
    if (trafficChart) {
        trafficChart.destroy();
    }
    if (packagePerformanceChart) {
        packagePerformanceChart.destroy();
    }
    if (monthlyQuotesChart) {
        monthlyQuotesChart.destroy();
    }
    
    // Revenue Chart
    const revenueCtx = document.getElementById('revenueChart');
    if (revenueCtx) {
        revenueChart = new Chart(revenueCtx, {
            type: 'bar',
            data: {
                labels: getLast6Months(),
                datasets: [{
                    label: '매출',
                    data: getRevenueDataForChart(),
                    backgroundColor: '#3b82f6',
                    borderColor: '#1d4ed8',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
    
    // Traffic Chart
    const trafficCtx = document.getElementById('trafficChart');
    if (trafficCtx) {
        trafficChart = new Chart(trafficCtx, {
            type: 'pie',
            data: {
                labels: ['직접 방문', '검색 엔진', '소셜 미디어', '기타'],
                datasets: [{
                    data: [40, 35, 15, 10],
                    backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
    
    // Package Performance Chart
    const packageCtx = document.getElementById('packagePerformanceChart');
    if (packageCtx) {
        packagePerformanceChart = new Chart(packageCtx, {
            type: 'radar',
            data: {
                labels: ['스파크 1P', '빌더 6P', '맥스 10P'],
                datasets: [{
                    label: '판매량',
                    data: [65, 85, 45],
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    borderColor: '#3b82f6',
                    pointBackgroundColor: '#3b82f6'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    }
    
    // Monthly Quotes Chart
    const monthlyCtx = document.getElementById('monthlyQuotesChart');
    if (monthlyCtx) {
        monthlyQuotesChart = new Chart(monthlyCtx, {
            type: 'line',
            data: {
                labels: getLast6Months(),
                datasets: [{
                    label: '견적 요청',
                    data: getMonthlyQuotesData(),
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
}

function getLast6Months() {
    const months = [];
    for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        months.push(date.toLocaleDateString('ko-KR', { month: 'short' }));
    }
    return months;
}

function getRevenueDataForChart() {
    const data = [];
    for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthRevenue = projectsData
            .filter(project => {
                const projectDate = new Date(project.startDate);
                return projectDate.getMonth() === date.getMonth() && 
                       projectDate.getFullYear() === date.getFullYear() &&
                       project.status === 'completed';
            })
            .reduce((sum, project) => sum + (project.price || 0), 0);
        data.push(monthRevenue);
    }
    return data;
}

function getMonthlyQuotesData() {
    const data = [];
    for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthQuotes = quotesData.filter(quote => {
            const quoteDate = new Date(quote.createdAt);
            return quoteDate.getMonth() === date.getMonth() && 
                   quoteDate.getFullYear() === date.getFullYear();
        });
        data.push(monthQuotes.length);
    }
    return data;
}

function updateKeyMetrics() {
    // Conversion Rate
    const totalQuotes = quotesData.length;
    const acceptedQuotes = quotesData.filter(q => q.status === 'accepted').length;
    const conversionRate = totalQuotes > 0 ? (acceptedQuotes / totalQuotes * 100).toFixed(1) : 0;
    document.getElementById('conversionRate').textContent = `${conversionRate}%`;
    
    // Average Quote Amount
    const avgQuoteAmount = totalQuotes > 0 ? 
        quotesData.reduce((sum, quote) => sum + (quote.totalAmount || 0), 0) / totalQuotes : 0;
    document.getElementById('avgQuoteAmount').textContent = formatCurrency(avgQuoteAmount);
    
    // Customer Satisfaction (simulated)
    const satisfaction = 95 + Math.random() * 5;
    document.getElementById('customerSatisfaction').textContent = `${satisfaction.toFixed(1)}%`;
    
    // Project Completion Rate
    const totalProjects = projectsData.length;
    const completedProjects = projectsData.filter(p => p.status === 'completed').length;
    const completionRate = totalProjects > 0 ? (completedProjects / totalProjects * 100).toFixed(1) : 0;
    document.getElementById('projectCompletionRate').textContent = `${completionRate}%`;
}

// Settings Management
function loadSettings() {
    console.log('⚙️ Loading settings...');
    
    const savedSettings = localStorage.getItem('adminSettings');
    if (savedSettings) {
        settingsData = JSON.parse(savedSettings);
    } else {
        settingsData = getDefaultSettings();
        localStorage.setItem('adminSettings', JSON.stringify(settingsData));
    }
    
    populateSettingsForm();
}

function getDefaultSettings() {
    return {
        company: {
            name: '밝은내일 웹',
            contactNumber: '010-2212-7714',
            contactEmail: 'contact@brighttomorrow-web.com',
            address: ''
        },
        packages: {
            basic: { price: 99000, duration: 3 },
            standard: { price: 390000, duration: 7 },
            premium: { price: 590000, duration: 14 }
        },
        notifications: {
            email: true,
            quotes: true,
            projects: true
        },
        system: {
            autoBackup: 'weekly',
            sessionTimeout: 30,
            debugMode: false
        }
    };
}

function populateSettingsForm() {
    // Company settings
    document.getElementById('companyName').value = settingsData.company.name;
    document.getElementById('contactNumber').value = settingsData.company.contactNumber;
    document.getElementById('contactEmail').value = settingsData.company.contactEmail;
    document.getElementById('companyAddress').value = settingsData.company.address;
    
    // Package settings
    document.getElementById('basicPrice').value = settingsData.packages.basic.price;
    document.getElementById('basicDuration').value = settingsData.packages.basic.duration;
    document.getElementById('standardPrice').value = settingsData.packages.standard.price;
    document.getElementById('standardDuration').value = settingsData.packages.standard.duration;
    document.getElementById('premiumPrice').value = settingsData.packages.premium.price;
    document.getElementById('premiumDuration').value = settingsData.packages.premium.duration;
    
    // Notification settings
    document.getElementById('emailNotifications').checked = settingsData.notifications.email;
    document.getElementById('quoteNotifications').checked = settingsData.notifications.quotes;
    document.getElementById('projectNotifications').checked = settingsData.notifications.projects;
    
    // System settings
    document.getElementById('autoBackup').value = settingsData.system.autoBackup;
    document.getElementById('sessionTimeout').value = settingsData.system.sessionTimeout;
    document.getElementById('debugMode').checked = settingsData.system.debugMode;
}

function saveSettings() {
    console.log('💾 Saving settings...');
    
    // Collect form data
    settingsData = {
        company: {
            name: document.getElementById('companyName').value,
            contactNumber: document.getElementById('contactNumber').value,
            contactEmail: document.getElementById('contactEmail').value,
            address: document.getElementById('companyAddress').value
        },
        packages: {
            basic: {
                price: parseInt(document.getElementById('basicPrice').value),
                duration: parseInt(document.getElementById('basicDuration').value)
            },
            standard: {
                price: parseInt(document.getElementById('standardPrice').value),
                duration: parseInt(document.getElementById('standardDuration').value)
            },
            premium: {
                price: parseInt(document.getElementById('premiumPrice').value),
                duration: parseInt(document.getElementById('premiumDuration').value)
            }
        },
        notifications: {
            email: document.getElementById('emailNotifications').checked,
            quotes: document.getElementById('quoteNotifications').checked,
            projects: document.getElementById('projectNotifications').checked
        },
        system: {
            autoBackup: document.getElementById('autoBackup').value,
            sessionTimeout: parseInt(document.getElementById('sessionTimeout').value),
            debugMode: document.getElementById('debugMode').checked
        }
    };
    
    // Save to localStorage
    localStorage.setItem('adminSettings', JSON.stringify(settingsData));
    
    // Update main page settings
    updateMainPageSettings(settingsData);
    
    showNotification('설정이 저장되었습니다!', 'success');
}

function resetSettings() {
    if (confirm('모든 설정을 기본값으로 초기화하시겠습니까?')) {
        settingsData = getDefaultSettings();
        localStorage.setItem('adminSettings', JSON.stringify(settingsData));
        populateSettingsForm();
        showNotification('설정이 초기화되었습니다!', 'info');
    }
}

function updateMainPageSettings(settings) {
    // Update company name
    const companyNameElements = document.querySelectorAll('.company-name, .logo');
    companyNameElements.forEach(el => {
        if (el && settings.company.name) {
            el.textContent = settings.company.name;
        }
    });
    
    // Update contact number
    const contactElements = document.querySelectorAll('.contact-number, .phone-number');
    contactElements.forEach(el => {
        if (el && settings.company.contactNumber) {
            el.textContent = settings.company.contactNumber;
            el.href = `tel:${settings.company.contactNumber}`;
        }
    });
    
    // Update contact email
    const emailElements = document.querySelectorAll('.contact-email, .email');
    emailElements.forEach(el => {
        if (el && settings.company.contactEmail) {
            el.textContent = settings.company.contactEmail;
            el.href = `mailto:${settings.company.contactEmail}`;
        }
    });
}

// Utility Functions
function formatCurrency(amount) {
    try {
        const numAmount = parseFloat(amount) || 0;
        return new Intl.NumberFormat('ko-KR', {
            style: 'currency',
            currency: 'KRW'
        }).format(numAmount);
    } catch (error) {
        console.error('❌ Error formatting currency:', error);
        return '₩0';
    }
}

function formatDate(dateString) {
    if (!dateString) return '날짜 없음';
    
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return '날짜 형식 오류';
        }
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch (error) {
        console.error('❌ Error formatting date:', error);
        return '날짜 형식 오류';
    }
}

function getStatusText(status) {
    const statusMap = {
        'new': '신규',
        'reviewing': '검토 중',
        'quoted': '견적 발송',
        'negotiating': '협의 중',
        'accepted': '수락됨',
        'rejected': '거절됨',
        'planning': '기획',
        'design': '디자인',
        'development': '개발',
        'testing': '테스트',
        'completed': '완료',
        'active': '활성',
        'inactive': '비활성'
    };
    return statusMap[status] || status;
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#dcfce7' : type === 'error' ? '#fee2e2' : '#dbeafe'};
        color: ${type === 'success' ? '#166534' : type === 'error' ? '#dc2626' : '#1d4ed8'};
        padding: 1rem;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 10001;
        max-width: 300px;
        animation: slideInRight 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 3000);
}

// Modal Functions
function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// Export Functions
function exportQuotes() {
    const csvContent = generateCSV(quotesData, [
        { key: 'customerInfo.name', label: '고객명' },
        { key: 'customerInfo.email', label: '이메일' },
        { key: 'customerInfo.phone', label: '연락처' },
        { key: 'package.name', label: '패키지' },
        { key: 'package.price', label: '가격' },
        { key: 'status', label: '상태' },
        { key: 'createdAt', label: '요청일' }
    ]);
    
    downloadCSV(csvContent, 'quotes_export.csv');
}

function exportCustomers() {
    const csvContent = generateCSV(customersData, [
        { key: 'name', label: '이름' },
        { key: 'email', label: '이메일' },
        { key: 'phone', label: '연락처' },
        { key: 'firstVisit', label: '첫 방문일' },
        { key: 'totalQuotes', label: '총 견적 수' },
        { key: 'totalAmount', label: '총 주문 금액' },
        { key: 'status', label: '상태' }
    ]);
    
    downloadCSV(csvContent, 'customers_export.csv');
}

function generateCSV(data, fields) {
    const headers = fields.map(field => field.label).join(',');
    const rows = data.map(item => {
        return fields.map(field => {
            const value = field.key.split('.').reduce((obj, key) => obj?.[key], item);
            return `"${value || ''}"`;
        }).join(',');
    });
    
    return [headers, ...rows].join('\n');
}

function downloadCSV(content, filename) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}

// Action Functions
function refreshQuotes() {
    loadQuotesData();
    showNotification('견적 데이터가 새로고침되었습니다!', 'success');
}

function forceRefreshQuotes() {
    console.log('🚨 Force refreshing quotes data...');
    // localStorage 직접 확인
    const rawData = localStorage.getItem('quotesData');
    console.log('🔍 Raw localStorage data:', rawData);
    
    // 강제로 데이터 다시 로드
    loadQuotesData();
    
    // 테이블 강제 업데이트
    renderQuotesTable();
    
    showNotification('견적 데이터가 강제 새로고침되었습니다!', 'warning');
}

function refreshProjects() {
    loadProjectsData();
    showNotification('프로젝트 데이터가 새로고침되었습니다!', 'success');
}

function addCustomer() {
    showNotification('고객 추가 기능은 개발 중입니다.', 'info');
}

// 포트폴리오 관리 함수들
function addPortfolioItem() {
    const container = document.querySelector('.portfolio-items-container');
    const newId = Date.now();
    
    const newItem = document.createElement('div');
    newItem.className = 'portfolio-item-admin';
    newItem.setAttribute('data-id', newId);
    
    newItem.innerHTML = `
        <div class="item-header">
            <h3>새 프로젝트</h3>
            <div class="item-actions">
                <button class="btn btn-sm btn-outline" onclick="editPortfolioItem(${newId})">✏️ 수정</button>
                <button class="btn btn-sm btn-danger" onclick="deletePortfolioItem(${newId})">🗑️ 삭제</button>
            </div>
        </div>
        <div class="item-content">
            <div class="item-info">
                <div class="info-row">
                    <label>패키지 타입:</label>
                    <select class="form-control" onchange="updatePortfolioItem(${newId}, 'category', this.value)">
                        <option value="basic">스파크 1P</option>
                        <option value="standard" selected>빌더 6P</option>
                        <option value="premium">맥스 10P</option>
                    </select>
                </div>
                <div class="info-row">
                    <label>프로젝트명:</label>
                    <input type="text" class="form-control" value="새 프로젝트" onchange="updatePortfolioItem(${newId}, 'title', this.value)">
                </div>
                <div class="info-row">
                    <label>아이콘:</label>
                    <input type="text" class="form-control" value="🚀" onchange="updatePortfolioItem(${newId}, 'icon', this.value)">
                </div>
                <div class="info-row">
                    <label>포트폴리오 사진:</label>
                    <div class="image-upload-container">
                        <input type="file" class="form-control" accept="image/*" onchange="uploadPortfolioImage(${newId}, this)" style="display: none;" id="portfolio-image-${newId}">
                        <button type="button" class="btn btn-outline" onclick="document.getElementById('portfolio-image-${newId}').click()">📷 사진 선택</button>
                        <div class="current-image">
                            <img src="" alt="현재 사진" class="preview-image" style="display: none;">
                            <button type="button" class="btn btn-sm btn-danger" onclick="removePortfolioImage(${newId})" style="display: none;">🗑️ 삭제</button>
                        </div>
                    </div>
                </div>
                <div class="info-row">
                    <label>제작 기간:</label>
                    <input type="text" class="form-control" value="7일" onchange="updatePortfolioItem(${newId}, 'duration', this.value)">
                </div>
                <div class="info-row">
                    <label>페이지 수:</label>
                    <input type="text" class="form-control" value="10페이지" onchange="updatePortfolioItem(${newId}, 'pages', this.value)">
                </div>
                <div class="info-row">
                    <label>제작일:</label>
                    <input type="text" class="form-control" value="${new Date().toLocaleDateString('ko-KR')}" onchange="updatePortfolioItem(${newId}, 'icon', this.value)">
                </div>
            </div>
            <div class="item-description">
                <label>프로젝트 설명:</label>
                <textarea class="form-control" rows="2" onchange="updatePortfolioItem(${newId}, 'description', this.value)" placeholder="간단한 프로젝트 설명을 입력하세요"></textarea>
            </div>
            <div class="item-tags">
                <label>태그 (쉼표로 구분):</label>
                <input type="text" class="form-control" value="#새프로젝트" onchange="updatePortfolioItem(${newId}, 'tags', this.value)">
            </div>
        </div>
    `;
    
    container.appendChild(newItem);
    showNotification('새 포트폴리오 항목이 추가되었습니다.', 'success');
}

function editPortfolioItem(id) {
    const item = document.querySelector(`[data-id="${id}"]`);
    if (item) {
        item.scrollIntoView({ behavior: 'smooth', block: 'center' });
        showNotification('포트폴리오 항목을 수정할 수 있습니다.', 'info');
    }
}

function deletePortfolioItem(id) {
    if (confirm('정말로 이 포트폴리오 항목을 삭제하시겠습니까?')) {
        const item = document.querySelector(`[data-id="${id}"]`);
        if (item) {
            item.remove();
            showNotification('포트폴리오 항목이 삭제되었습니다.', 'success');
        }
    }
}

function updatePortfolioItem(id, field, value) {
    // 포트폴리오 항목 업데이트 로직
    console.log(`포트폴리오 항목 ${id}의 ${field}를 ${value}로 업데이트`);
    
    // localStorage에 저장
    const portfolioData = JSON.parse(localStorage.getItem('portfolioData') || '{}');
    if (!portfolioData[id]) {
        portfolioData[id] = {};
    }
    portfolioData[id][field] = value;
    localStorage.setItem('portfolioData', JSON.stringify(portfolioData));
}

// 포트폴리오 사진 업로드 함수
function uploadPortfolioImage(id, input) {
    const file = input.files[0];
    if (!file) return;

    // 파일 크기 체크 (5MB 제한)
    if (file.size > 5 * 1024 * 1024) {
        showNotification('파일 크기는 5MB 이하여야 합니다.', 'error');
        return;
    }

    // 파일 타입 체크
    if (!file.type.startsWith('image/')) {
        showNotification('이미지 파일만 업로드 가능합니다.', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        // 이미지 미리보기 업데이트
        const previewImage = document.querySelector(`[data-id="${id}"] .preview-image`);
        const deleteButton = document.querySelector(`[data-id="${id}"] .btn-danger`);
        
        if (previewImage) {
            previewImage.src = e.target.result;
            previewImage.style.display = 'block';
        }
        if (deleteButton) {
            deleteButton.style.display = 'block';
        }

        // 실제 파일 저장 (브라우저 환경에서는 FileReader로 처리)
        const portfolioData = JSON.parse(localStorage.getItem('portfolioData') || '{}');
        if (!portfolioData[id]) {
            portfolioData[id] = {};
        }
        portfolioData[id].imageData = e.target.result;
        portfolioData[id].imageName = file.name;
        localStorage.setItem('portfolioData', JSON.stringify(portfolioData));

        showNotification('포트폴리오 사진이 업로드되었습니다.', 'success');
    };
    reader.readAsDataURL(file);
}

// 포트폴리오 사진 삭제 함수
function removePortfolioImage(id) {
    if (confirm('정말로 이 사진을 삭제하시겠습니까?')) {
        const previewImage = document.querySelector(`[data-id="${id}"] .preview-image`);
        const deleteButton = document.querySelector(`[data-id="${id}"] .btn-danger`);
        
        if (previewImage) {
            previewImage.src = '';
            previewImage.style.display = 'none';
        }
        if (deleteButton) {
            deleteButton.style.display = 'none';
        }

        // localStorage에서 이미지 데이터 삭제
        const portfolioData = JSON.parse(localStorage.getItem('portfolioData') || '{}');
        if (portfolioData[id]) {
            delete portfolioData[id].imageData;
            delete portfolioData[id].imageName;
            localStorage.setItem('portfolioData', JSON.stringify(portfolioData));
        }

        showNotification('포트폴리오 사진이 삭제되었습니다.', 'success');
    }
}

function savePortfolioChanges() {
    // 모든 포트폴리오 데이터를 수집하여 메인 페이지에 적용
    const portfolioItems = document.querySelectorAll('.portfolio-item-admin');
    const portfolioData = [];
    
    portfolioItems.forEach(item => {
        const id = item.getAttribute('data-id');
        const title = item.querySelector('input[value*="프로젝트"]')?.value || item.querySelector('h3')?.textContent;
        const category = item.querySelector('select')?.value;
        const icon = item.querySelector('input[value*="🏢"], input[value*="🍽️"], input[value*="📚"], input[value*="🎭"], input[value*="🚀"]')?.value;
        const duration = item.querySelector('input[value*="일"]')?.value;
        const pages = item.querySelector('input[value*="페이지"]')?.value;
        const date = item.querySelector('input[value*="2024"]')?.value;
        const description = item.querySelector('textarea')?.value;
        const tags = item.querySelector('input[value*="#"]')?.value;
        
        portfolioData.push({
            id,
            title,
            category,
            icon,
            duration,
            pages,
            date,
            description,
            tags
        });
    });
    
    // 메인 페이지에 데이터 전달
    localStorage.setItem('mainPagePortfolioData', JSON.stringify(portfolioData));
    
    showNotification('포트폴리오 변경사항이 저장되었습니다. 메인 페이지를 새로고침하면 변경사항이 적용됩니다.', 'success');
}

function addProject() {
    console.log('➕ Opening project add modal...');
    
    try {
        // 견적 목록 로드
        loadQuotesForProject();
        
        // 모달 열기
        openModal('addProjectModal');
        
        console.log('✅ Project add modal opened successfully');
    } catch (error) {
        console.error('❌ Error opening project add modal:', error);
        showNotification('프로젝트 추가 모달을 열 수 없습니다.', 'error');
    }
}

function loadQuotesForProject() {
    console.log('📋 Loading quotes for project creation...');
    
    const quoteSelect = document.getElementById('quoteSelect');
    quoteSelect.innerHTML = '<option value="">견적을 선택하세요</option>';
    
    // 견적 데이터가 없으면 로드
    if (!quotesData || quotesData.length === 0) {
        loadQuotesData();
    }
    
    // 견적 목록 추가 (아직 프로젝트로 생성되지 않은 견적들)
    const existingProjectQuotes = projectsData.map(project => project.quoteId).filter(id => id);
    
    quotesData.forEach(quote => {
        // 이미 프로젝트로 생성된 견적은 제외
        if (!existingProjectQuotes.includes(quote.id)) {
            const option = document.createElement('option');
            option.value = quote.id;
            option.textContent = `${quote.customerInfo?.name || '고객명 없음'} - ${quote.package?.name || '패키지 없음'} (${formatCurrency(quote.totalAmount)})`;
            quoteSelect.appendChild(option);
        }
    });
    
    // 견적 선택 시 자동 정보 채우기
    quoteSelect.addEventListener('change', function() {
        console.log('📋 Quote selection changed:', this.value);
        const selectedQuoteId = this.value;
        if (selectedQuoteId) {
            const selectedQuote = quotesData.find(quote => quote.id === selectedQuoteId);
            if (selectedQuote) {
                console.log('✅ Selected quote:', selectedQuote);
                
                // 프로젝트명 자동 채우기
                const projectNameInput = document.getElementById('projectName');
                if (projectNameInput) {
                    projectNameInput.value = `${selectedQuote.customerInfo?.name || '고객'}의 웹사이트`;
                }
                
                // 시작일을 오늘로 설정
                const startDateInput = document.getElementById('projectStartDate');
                if (startDateInput) {
                    const today = new Date().toISOString().split('T')[0];
                    startDateInput.value = today;
                }
                
                // 예상 완료일을 7일 후로 설정
                const endDateInput = document.getElementById('projectEndDate');
                if (endDateInput) {
                    const endDate = new Date();
                    endDate.setDate(endDate.getDate() + 7);
                    endDateInput.value = endDate.toISOString().split('T')[0];
                }
                
                console.log('✅ Auto-filled project information');
            }
        }
    });
    
    console.log(`📋 Loaded ${quoteSelect.options.length - 1} available quotes`);
}

function createProjectFromQuote() {
    console.log('🚀 Creating project from quote...');
    
    const quoteId = document.getElementById('quoteSelect').value;
    const projectName = document.getElementById('projectName').value;
    const startDate = document.getElementById('projectStartDate').value;
    const endDate = document.getElementById('projectEndDate').value;
    const status = document.getElementById('projectStatus').value;
    const progress = parseInt(document.getElementById('projectProgress').value) || 0;
    
    // 유효성 검사
    if (!quoteId || !projectName || !startDate || !endDate || !status) {
        alert('모든 필수 항목을 입력해주세요.');
        return;
    }
    
    // 선택된 견적 찾기
    const selectedQuote = quotesData.find(quote => quote.id === quoteId);
    if (!selectedQuote) {
        alert('선택된 견적을 찾을 수 없습니다.');
        return;
    }
    
    // 새 프로젝트 생성
    const newProject = {
        id: Date.now().toString(),
        name: projectName,
        customerName: selectedQuote.customerInfo?.name,
        package: selectedQuote.package?.name,
        startDate: startDate,
        expectedEndDate: endDate,
        progress: progress,
        status: status,
        price: selectedQuote.totalAmount,
        quoteId: quoteId, // 견적 ID 연결
        updatedAt: new Date().toISOString()
    };
    
    // 프로젝트 데이터에 추가
    projectsData.push(newProject);
    localStorage.setItem('projectsData', JSON.stringify(projectsData));
    
    // UI 업데이트
    updateProjectStats();
    renderProjectsTable();
    
    // 모달 닫기
    closeModal('addProjectModal');
    
    // 폼 초기화
    document.getElementById('quoteSelect').value = '';
    document.getElementById('projectName').value = '';
    document.getElementById('projectStartDate').value = '';
    document.getElementById('projectEndDate').value = '';
    document.getElementById('projectStatus').value = 'planning';
    document.getElementById('projectProgress').value = '0';
    
    showNotification('프로젝트가 성공적으로 생성되었습니다.', 'success');
    console.log('✅ Project created:', newProject);
}

function generateReport() {
    showNotification('리포트 생성 기능은 개발 중입니다.', 'info');
}

function exportAnalytics() {
    showNotification('분석 데이터 내보내기 기능은 개발 중입니다.', 'info');
}

function updateQuoteStatus(quoteId, newStatus) {
    const quote = quotesData.find(q => q.id === quoteId);
    if (!quote) {
        showNotification('견적을 찾을 수 없습니다.', 'error');
        return;
    }
    
    // 상태 유효성 검사
    const validStatuses = ['new', 'reviewing', 'quoted', 'negotiating', 'accepted', 'rejected'];
    if (!validStatuses.includes(newStatus)) {
        showNotification('유효하지 않은 상태입니다.', 'error');
        return;
    }
    
    const oldStatus = quote.status || 'new';
    quote.status = newStatus;
    
    // Save updated data
    localStorage.setItem('quotesData', JSON.stringify(quotesData));
    
    // Refresh table
    renderQuotesTable();
    
    showNotification(`견적 상태가 '${getStatusText(oldStatus)}'에서 '${getStatusText(quote.status)}'로 변경되었습니다.`, 'success');
}

function deleteQuote(quoteId) {
    const quote = quotesData.find(q => q.id === quoteId);
    if (!quote) {
        showNotification('견적을 찾을 수 없습니다.', 'error');
        return;
    }
    
    const customerName = quote.customerInfo?.name || '고객명 없음';
    
    if (confirm(`정말로 "${customerName}" 고객의 견적을 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`)) {
        // 견적 삭제
        const index = quotesData.findIndex(q => q.id === quoteId);
        if (index > -1) {
            quotesData.splice(index, 1);
            
            // Save updated data
            localStorage.setItem('quotesData', JSON.stringify(quotesData));
            
            // Refresh table
            renderQuotesTable();
            
            showNotification(`"${customerName}" 고객의 견적이 삭제되었습니다.`, 'success');
        }
    }
}

function viewCustomerDetail(customerId) {
    const customer = customersData.find(c => c.id === customerId);
    if (!customer) {
        showNotification('고객을 찾을 수 없습니다.', 'error');
        return;
    }
    
    // 해당 고객의 모든 견적 찾기 (quoteIds 배열 사용)
    let customerQuotes = [];
    
    if (customer.quoteIds && customer.quoteIds.length > 0) {
        // quoteIds 배열을 사용하여 정확한 견적 찾기
        customerQuotes = quotesData.filter(quote => customer.quoteIds.includes(quote.id));
        console.log(`✅ Found ${customerQuotes.length} quotes using quoteIds for customer: ${customer.name}`);
    } else {
        // 기존 방식으로 매칭 (백업)
        customerQuotes = quotesData.filter(quote => {
            const quoteEmail = quote.customerInfo?.email;
            const quoteName = quote.customerInfo?.name;
            
            // 이메일 매칭 (대소문자 무시, 공백 제거)
            if (customer.email && quoteEmail) {
                const customerEmail = customer.email.toLowerCase().trim();
                const quoteEmailClean = quoteEmail.toLowerCase().trim();
                if (customerEmail === quoteEmailClean) {
                    return true;
                }
            }
            
            // 이름 매칭 (공백 제거)
            if (customer.name && quoteName) {
                const customerName = customer.name.trim();
                const quoteNameClean = quoteName.trim();
                if (customerName === quoteNameClean) {
                    return true;
                }
            }
            
            return false;
        });
        console.log(`⚠️ Found ${customerQuotes.length} quotes using fallback matching for customer: ${customer.name}`);
    }
    
    console.log(`🔍 Found ${customerQuotes.length} quotes for customer: ${customer.name}`);
    console.log('Customer info:', { name: customer.name, email: customer.email });
    console.log('Matching quotes:', customerQuotes.map(q => ({
        name: q.customerInfo?.name,
        email: q.customerInfo?.email,
        amount: q.totalAmount
    })));
    
    // Escape HTML to prevent XSS
    const escapeHtml = (text) => {
        if (typeof text !== 'string') return '';
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    };
    
    // 상태별 색상 클래스
    const getStatusClass = (status) => {
        const statusClasses = {
            'new': 'status-new',
            'reviewing': 'status-reviewing',
            'quoted': 'status-quoted',
            'negotiating': 'status-negotiating',
            'accepted': 'status-accepted',
            'rejected': 'status-rejected'
        };
        return statusClasses[status] || 'status-new';
    };
    
    const modal = document.getElementById('customerQuotesModal');
    const content = document.getElementById('customerQuotesContent');
    
    content.innerHTML = `
        <div class="customer-quotes-header">
            <h3>👤 ${escapeHtml(customer.name)} 고객 견적 내역</h3>
            <div class="customer-info-summary">
                <div class="customer-info-item">
                    <label>이메일</label>
                    <span>${escapeHtml(customer.email)}</span>
                </div>
                <div class="customer-info-item">
                    <label>연락처</label>
                    <span>${escapeHtml(customer.phone)}</span>
                </div>
                <div class="customer-info-item">
                    <label>총 견적 수</label>
                    <span>${customerQuotes.length}개</span>
                </div>
                <div class="customer-info-item">
                    <label>총 주문 금액</label>
                    <span>${formatCurrency(customer.totalAmount)}</span>
                </div>
            </div>
        </div>
        
        <div class="customer-quotes-list">
            ${customerQuotes.length > 0 ? 
                customerQuotes.map((quote, index) => {
                    const quoteNumber = quote.quoteNumber || `BT-${new Date(quote.createdAt).getFullYear()}-${String(new Date(quote.createdAt).getMonth() + 1).padStart(2, '0')}${String(new Date(quote.createdAt).getDate()).padStart(2, '0')}-${String(index + 1).padStart(3, '0')}`;
                    
                    return `
                        <div class="customer-quote-item">
                            <div class="quote-item-header">
                                <div class="quote-item-title">
                                    <span class="quote-item-number">${quoteNumber}</span>
                                    <span class="quote-item-date">${formatDate(quote.createdAt)}</span>
                                </div>
                                <span class="quote-item-status ${getStatusClass(quote.status)}">
                                    ${getStatusText(quote.status)}
                                </span>
                            </div>
                            <div class="quote-item-content">
                                <div class="quote-item-details">
                                    <div class="quote-detail-item">
                                        <label>패키지</label>
                                        <span>${escapeHtml(quote.package?.name) || '패키지 미선택'}</span>
                                    </div>
                                    <div class="quote-detail-item">
                                        <label>패키지 가격</label>
                                        <span>${formatCurrency(quote.package?.price || 0)}</span>
                                    </div>
                                    <div class="quote-detail-item">
                                        <label>총 견적 금액</label>
                                        <span>${formatCurrency(quote.totalAmount || 0)}</span>
                                    </div>
                                    <div class="quote-detail-item">
                                        <label>프로젝트명</label>
                                        <span>${escapeHtml(quote.projectName || quote.customerInfo?.message || '프로젝트명 없음')}</span>
                                    </div>
                                </div>
                                ${quote.options && quote.options.length > 0 ? `
                                    <div class="quote-item-options">
                                        <h5>선택된 옵션</h5>
                                        <div class="options-list-mini">
                                            ${quote.options.map(option => `
                                                <span class="option-tag">${escapeHtml(option.name)} - ${formatCurrency(option.price)}</span>
                                            `).join('')}
                                        </div>
                                    </div>
                                ` : ''}
                                ${quote.maintenance ? `
                                    <div class="quote-item-options">
                                        <h5>유지보수 플랜</h5>
                                        <div class="options-list-mini">
                                            <span class="option-tag">${escapeHtml(quote.maintenance.name)} - ${formatCurrency(quote.maintenance.price)}</span>
                                        </div>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    `;
                }).join('') : 
                `
                    <div class="no-quotes-message">
                        <h4>📭 견적 내역이 없습니다</h4>
                        <p>${escapeHtml(customer.name)} 고객의 견적 요청 내역이 아직 없습니다.</p>
                    </div>
                `
            }
        </div>
    `;
    
    modal.classList.add('active');
}

function editCustomer() {
    showNotification('고객 수정 기능은 개발 중입니다.', 'info');
}

function viewProjectDetail() {
    showNotification('프로젝트 상세 보기 기능은 개발 중입니다.', 'info');
}

function updateProject() {
    showNotification('프로젝트 업데이트 기능은 개발 중입니다.', 'info');
}

// Logout Function
function logout() {
    if (confirm('로그아웃하시겠습니까?')) {
        // Cleanup intervals and event listeners
        if (window.quotesSyncInterval) {
            clearInterval(window.quotesSyncInterval);
            window.quotesSyncInterval = null;
        }
        
        // Destroy charts
        if (quotesChart && typeof quotesChart.destroy === 'function') {
            quotesChart.destroy();
            quotesChart = null;
        }
        if (packagesChart && typeof packagesChart.destroy === 'function') {
            packagesChart.destroy();
            packagesChart = null;
        }
        
        localStorage.removeItem('adminAuthenticated');
        localStorage.removeItem('adminLoginTime');
        window.location.href = 'index.html';
    }
}

// Add CSS for notifications
const notificationStyles = `
@keyframes slideInRight {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}

.notification-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
}

.notification-close {
    background: none;
    border: none;
    font-size: 1.2rem;
    cursor: pointer;
    opacity: 0.7;
    transition: opacity 0.3s ease;
}

.notification-close:hover {
    opacity: 1;
}
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);

console.log('✅ Admin Dashboard JavaScript Loaded');
