// 전역 변수 선언
let adminClickCount = 0;
let adminClickTimer = null;

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

// Google Analytics 4 Tracking
function initGA() {
    if (typeof gtag !== 'undefined') {
        gtag('config', 'G-XXXXXXXXXX', {
            page_title: '밝은내일 웹 - 랜딩페이지',
            page_location: window.location.href
        });
    }
}

// Track custom events
function trackEvent(eventName, parameters = {}) {
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, parameters);
    }
}

// Track package view
function trackPackageView(packageName) {
    trackEvent('view_item_list', {
        item_list_id: 'packages',
        item_list_name: '웹사이트 패키지',
        items: [{
            item_id: packageName,
            item_name: packageName,
            item_category: '웹사이트 제작'
        }]
    });
}

// Track package selection
function trackPackageSelect(packageName, price) {
    trackEvent('select_item', {
        item_list_id: 'packages',
        item_list_name: '웹사이트 패키지',
        items: [{
            item_id: packageName,
            item_name: packageName,
            item_category: '웹사이트 제작',
            price: price
        }]
    });
}

// Track form begin checkout
function trackBeginCheckout() {
    trackEvent('begin_checkout', {
        currency: 'KRW',
        value: 0,
        items: []
    });
}

// Track form submission
function trackGenerateLead() {
    trackEvent('generate_lead', {
        currency: 'KRW',
        value: 0
    });
}

// Portfolio Filter
function initPortfolioFilter() {
    const categoryBtns = document.querySelectorAll('.category-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.getAttribute('data-category');
            
            // Update active button
            categoryBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Filter portfolio items
            portfolioItems.forEach(item => {
                if (category === 'all' || item.getAttribute('data-category') === category) {
                    item.style.display = 'block';
                    item.style.animation = 'fadeIn 0.5s ease-in-out';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });
}

// Portfolio Data Management
function loadPortfolioData() {
    const portfolioData = JSON.parse(localStorage.getItem('mainPagePortfolioData') || '[]');
    const adminPortfolioData = JSON.parse(localStorage.getItem('portfolioData') || '{}');
    
    if (portfolioData.length > 0) {
        const portfolioGrid = document.querySelector('.portfolio-grid');
        if (portfolioGrid) {
            portfolioGrid.innerHTML = '';
            
            portfolioData.forEach(item => {
                // 관리자에서 업로드된 이미지가 있는지 확인
                if (adminPortfolioData[item.id] && adminPortfolioData[item.id].imageData) {
                    item.imageData = adminPortfolioData[item.id].imageData;
                }
                const portfolioItem = createPortfolioItem(item);
                portfolioGrid.appendChild(portfolioItem);
            });
        }
    }
}

function createPortfolioItem(item) {
    const div = document.createElement('div');
    div.className = 'portfolio-item';
    div.setAttribute('data-category', item.category || 'standard');
    
    const categoryText = {
        'basic': '스파크 1P',
        'standard': '빌더 6P',
        'premium': '맥스 10P'
    };
    
    div.innerHTML = `
        <div class="portfolio-image">
            ${item.imageData ? 
                `<img src="${item.imageData}" alt="${item.title || '프로젝트'}" class="portfolio-photo">` :
                `<img src="images/portfolio/portfolio-${item.id || 'default'}.jpg" alt="${item.title || '프로젝트'}" class="portfolio-photo" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">`
            }
            <div class="portfolio-placeholder" style="display: none;">
                <span class="portfolio-icon">${item.icon || '🚀'}</span>
                <span class="portfolio-text">${item.title || '프로젝트'}</span>
            </div>
        </div>
        <div class="portfolio-content">
            <div class="portfolio-header">
                <h3>${item.title || '새 프로젝트'}</h3>
                <span class="portfolio-type">${categoryText[item.category] || '빌더 6P'}</span>
            </div>

            <div class="portfolio-info">
                <div class="info-item">
                    <span class="info-label">제작 기간</span>
                    <span class="info-value">${item.duration || '7일'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">페이지 수</span>
                    <span class="info-value">${item.pages || '10페이지'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">제작일</span>
                    <span class="info-value">${item.date || new Date().toLocaleDateString('ko-KR')}</span>
                </div>
            </div>
            <div class="portfolio-features">
                ${(item.tags || '#새프로젝트').split(',').map(tag => `<span class="feature-tag">${tag.trim()}</span>`).join('')}
            </div>
        </div>
    `;
    
    return div;
}

// Portfolio Detail Modal
function showPortfolioDetail(projectId) {
    // This function can be expanded to show detailed portfolio information
    console.log('Showing portfolio detail for:', projectId);
    // You can implement a modal or redirect to a detailed page
}

// FAQ Accordion
class FAQAccordion {
    constructor() {
        this.init();
    }

    init() {
        const questions = document.querySelectorAll('.faq-question');
        questions.forEach(question => {
            question.addEventListener('click', () => this.toggleFAQ(question));
        });
    }

    toggleFAQ(question) {
        const isExpanded = question.getAttribute('aria-expanded') === 'true';
        const answer = question.nextElementSibling;

        // Close all other FAQs
        const allQuestions = document.querySelectorAll('.faq-question');
        allQuestions.forEach(q => {
            if (q !== question) {
                q.setAttribute('aria-expanded', 'false');
                const otherAnswer = q.nextElementSibling;
                if (otherAnswer) otherAnswer.style.display = 'none';
            }
        });

        // Toggle current FAQ
        question.setAttribute('aria-expanded', !isExpanded);
        if (answer) {
            answer.style.display = isExpanded ? 'none' : 'block';
        }
    }
}

// Multi-step Form
class MultiStepForm {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 4;
        this.formData = {};
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateProgress();
    }

    bindEvents() {
        // Next step buttons
        const nextButtons = document.querySelectorAll('.next-step');
        nextButtons.forEach(btn => {
            btn.addEventListener('click', () => this.nextStep());
        });

        // Previous step buttons
        const prevButtons = document.querySelectorAll('.prev-step');
        prevButtons.forEach(btn => {
            btn.addEventListener('click', () => this.prevStep());
        });

        // Form submission
        const form = document.getElementById('contactForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleSubmit(e));
        }
    }

    nextStep() {
        if (this.validateCurrentStep()) {
            this.saveCurrentStepData();
            this.currentStep++;
            this.showStep(this.currentStep);
            this.updateProgress();
        }
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.showStep(this.currentStep);
            this.updateProgress();
        }
    }

    showStep(step) {
        // Hide all steps
        const steps = document.querySelectorAll('.form-step');
        steps.forEach(s => s.classList.remove('active'));

        // Show current step
        const currentStep = document.getElementById(`step${step}`);
        if (currentStep) currentStep.classList.add('active');
    }

    updateProgress() {
        const progress = (this.currentStep / this.totalSteps) * 100;
    }

    validateCurrentStep() {
        const currentStepElement = document.getElementById(`step${this.currentStep}`);
        if (!currentStepElement) return false;

        const requiredFields = currentStepElement.querySelectorAll('[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                this.showError(field, '이 필드는 필수입니다.');
                isValid = false;
            } else {
                this.clearError(field);
            }
        });

        return isValid;
    }

    saveCurrentStepData() {
        const currentStepElement = document.getElementById(`step${this.currentStep}`);
        if (!currentStepElement) return;

        // Get all form inputs from the current step
        const inputs = currentStepElement.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            if (input.name && input.value) {
                this.formData[input.name] = input.value;
            }
        });
    }

    showError(field, message) {
        this.clearError(field);
        field.classList.add('error');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        field.parentNode.appendChild(errorDiv);
    }

    clearError(field) {
        field.classList.remove('error');
        const errorDiv = field.parentNode.querySelector('.error-message');
        if (errorDiv) errorDiv.remove();
    }

    handleSubmit(e) {
        e.preventDefault();
        if (this.validateCurrentStep()) {
            this.saveCurrentStepData();
            this.submitForm();
        }
    }

    submitForm() {
        // Show success modal
        const successModal = document.getElementById('successModal');
        if (successModal) {
            successModal.style.display = 'flex';
            successModal.classList.add('active');
        }

        // Track form submission
        trackGenerateLead();

        // Reset form
        this.currentStep = 1;
        this.formData = {};
        this.showStep(1);
        this.updateProgress();
    }
}

// Mobile Menu
class MobileMenu {
    constructor() {
        this.init();
    }

    init() {
        const toggle = document.querySelector('.mobile-menu-toggle');
        const nav = document.querySelector('.nav-list');
        
        if (toggle && nav) {
            toggle.addEventListener('click', () => this.toggleMenu(toggle, nav));
        }

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.header-content') && nav?.classList.contains('active')) {
                this.closeMenu(toggle, nav);
            }
        });
    }

    toggleMenu(toggle, nav) {
        const isActive = nav.classList.contains('active');
        
        if (isActive) {
            this.closeMenu(toggle, nav);
        } else {
            this.openMenu(toggle, nav);
        }
    }

    openMenu(toggle, nav) {
        toggle.classList.add('active');
        nav.classList.add('active');
        toggle.setAttribute('aria-expanded', 'true');
    }

    closeMenu(toggle, nav) {
        toggle.classList.remove('active');
        nav.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
    }
}



// Reviews Slider
class ReviewsSlider {
    constructor() {
        this.currentSlide = 0;
        this.totalSlides = 9;
        this.slidesPerView = 3;
        this.autoPlayInterval = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateDots();
        this.startAutoPlay();
    }

    bindEvents() {
        // Navigation buttons
        const prevBtn = document.querySelector('.review-nav-btn.prev');
        const nextBtn = document.querySelector('.review-nav-btn.next');
        
        if (prevBtn) prevBtn.addEventListener('click', () => this.prevSlide());
        if (nextBtn) nextBtn.addEventListener('click', () => this.nextSlide());

        // Dot navigation
        const dots = document.querySelectorAll('.review-dot');
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                this.currentSlide = index;
                this.showSlide();
                this.resetAutoPlay();
            });
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.prevSlide();
            if (e.key === 'ArrowRight') this.nextSlide();
        });
        
        // Pause auto-play on hover
        const slider = document.querySelector('.reviews-slider');
        if (slider) {
            slider.addEventListener('mouseenter', () => this.stopAutoPlay());
            slider.addEventListener('mouseleave', () => this.startAutoPlay());
        }
    }

    showSlide() {
        const track = document.querySelector('.reviews-track');
        if (!track) return;

        const slideWidth = 400; // card width
        const translateX = -this.currentSlide * slideWidth;
        track.style.transform = `translateX(${translateX}px)`;

        this.updateDots();
        this.updateNavButtons();
    }

    nextSlide() {
        if (this.currentSlide < this.totalSlides - 1) {
            this.currentSlide++;
            this.showSlide();
            this.resetAutoPlay();
        }
    }

    prevSlide() {
        if (this.currentSlide > 0) {
            this.currentSlide--;
            this.showSlide();
            this.resetAutoPlay();
        }
    }
    
    startAutoPlay() {
        this.autoPlayInterval = setInterval(() => {
            if (this.currentSlide >= this.totalSlides - 1) {
                this.currentSlide = 0;
            } else {
                this.currentSlide++;
            }
            this.showSlide();
        }, 4000);
    }
    
    stopAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }
    
    resetAutoPlay() {
        this.stopAutoPlay();
        this.startAutoPlay();
    }

    updateDots() {
        const dots = document.querySelectorAll('.review-dot');
        dots.forEach((dot, index) => {
            dot.classList.remove('active');
            if (index === this.currentSlide) {
                dot.classList.add('active');
            }
        });
    }

    updateNavButtons() {
        const prevBtn = document.querySelector('.review-nav-btn.prev');
        const nextBtn = document.querySelector('.review-nav-btn.next');
        
        if (prevBtn) {
            prevBtn.disabled = this.currentSlide === 0;
        }
        if (nextBtn) {
            nextBtn.disabled = this.currentSlide >= this.totalSlides - 1;
        }
    }
}

// Admin Tab System
function initAdminTabs() {
    const tabs = document.querySelectorAll('.admin-tab');
    const contents = document.querySelectorAll('.admin-tab-content');
    
    // Ensure only the first tab is active on page load
    tabs.forEach((tab, index) => {
        if (index === 0) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
    
    contents.forEach((content, index) => {
        if (index === 0) {
            content.classList.add('active');
        } else {
            content.classList.remove('active');
        }
    });
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;
            
            // Remove active class from all tabs and contents
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            tab.classList.add('active');
            const targetContent = document.getElementById(`${targetTab}-tab`);
            if (targetContent) targetContent.classList.add('active');
        });
    });
}

// Package selector modal functions
function showPackageSelector() {
    console.log('showPackageSelector called');
    const modal = document.getElementById('packageSelectorModal');
    console.log('Modal element:', modal);
    if (modal) {
        modal.style.display = 'flex';
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        console.log('Modal should be visible now');
    } else {
        console.error('Package selector modal not found!');
    }
}

function closePackageSelector() {
    console.log('closePackageSelector called');
    const modal = document.getElementById('packageSelectorModal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

function selectPackage(packageType) {
    console.log('selectPackage called with:', packageType);
    closePackageSelector();
    window.location.href = `checkout.html?package=${packageType}`;
}








    // 14. 관리자 설정 동기화 시스템
    window.setupAdminSettingsSync = function() {
        // 초기 설정 로드
        loadAdminSettings();
        
        // Storage 이벤트 리스너
        window.addEventListener('storage', function(e) {
            if (e.key === 'adminSettings' || e.key === 'adminSettingsUpdate') {
                setTimeout(() => {
                    loadAdminSettings();
                }, 100);
            }
        });
        
        // 커스텀 이벤트 리스너
        window.addEventListener('adminSettingsUpdated', () => {
            loadAdminSettings();
        });
        
        // 주기적 확인 (5초마다로 변경)
        setInterval(() => {
            const currentSettings = localStorage.getItem('adminSettings');
            if (currentSettings !== window.lastAdminSettings) {
                window.lastAdminSettings = currentSettings;
                loadAdminSettings();
            }
        }, 5000);
    };
    
    // 15. 관리자 설정 로드 함수
    window.loadAdminSettings = function() {
        const savedSettings = localStorage.getItem('adminSettings');
        if (savedSettings) {
            try {
                const settings = JSON.parse(savedSettings);
                updateMainPageSettings(settings);
            } catch (e) {
                console.error('❌ Error parsing admin settings:', e);
            }
        }
    };
    
    // 16. 메인 페이지 설정 업데이트
    window.updateMainPageSettings = function(settings) {
        // 회사명 업데이트
        const companyNameElements = document.querySelectorAll('.company-name, .logo');
        companyNameElements.forEach(el => {
            if (el && settings.companyName) {
                el.textContent = settings.companyName;
            }
        });
        
        // 연락처 업데이트
        const contactElements = document.querySelectorAll('.contact-number, .phone-number');
        contactElements.forEach(el => {
            if (el && settings.contactNumber) {
                el.textContent = settings.contactNumber;
                el.href = `tel:${settings.contactNumber}`;
            }
        });
        
        // 이메일 업데이트
        const emailElements = document.querySelectorAll('.contact-email, .email');
        emailElements.forEach(el => {
            if (el && settings.contactEmail) {
                el.textContent = settings.contactEmail;
                el.href = `mailto:${settings.contactEmail}`;
            }
        });
    };
    
    // 17. 방문자 통계 동기화 시스템
    window.setupVisitorStatsSync = function() {
        // 초기 통계 로드
        loadVisitorStats();
        
        // Storage 이벤트 리스너
        window.addEventListener('storage', function(e) {
            if (e.key === 'visitorStats') {
                setTimeout(() => {
                    loadVisitorStats();
                }, 100);
            }
        });
        
        // 주기적 확인 (10초마다로 변경)
        setInterval(() => {
            const currentStats = localStorage.getItem('visitorStats');
            if (currentStats !== window.lastVisitorStats) {
                window.lastVisitorStats = currentStats;
                loadVisitorStats();
            }
        }, 10000);
    };
    
    // 18. 방문자 통계 로드 함수
    window.loadVisitorStats = function() {
        const savedStats = localStorage.getItem('visitorStats');
        if (savedStats) {
            try {
                const stats = JSON.parse(savedStats);
                updateMainPageStats(stats);
            } catch (e) {
                console.error('❌ Error parsing visitor stats:', e);
            }
        }
    };
    
    // 19. 메인 페이지 통계 업데이트
    window.updateMainPageStats = function(stats) {
        // 통계 요소들 업데이트
        const statElements = document.querySelectorAll('.stat-number, .visitor-count, .page-view-count');
        statElements.forEach(el => {
            if (el && stats.totalVisitors) {
                const text = el.textContent.toLowerCase();
                if (text.includes('방문자') || text.includes('visitor')) {
                    el.textContent = stats.totalVisitors.toLocaleString();
                } else if (text.includes('페이지뷰') || text.includes('page')) {
                    el.textContent = stats.pageViews.toLocaleString();
                } else if (text.includes('고유') || text.includes('unique')) {
                    el.textContent = stats.uniqueVisitors.toLocaleString();
                }
            }
        });
    };
    
    // 20. 견적 데이터 동기화 시스템
    window.setupQuotesSync = function() {
        // 초기 견적 데이터 로드
        loadQuotesData();
        
        // Storage 이벤트 리스너
        window.addEventListener('storage', function(e) {
            if (e.key === 'quotesData' || e.key === 'quotesUpdate') {
                setTimeout(() => {
                    loadQuotesData();
                }, 100);
            }
        });
        
        // 커스텀 이벤트 리스너
        window.addEventListener('quotesDataUpdated', () => {
            loadQuotesData();
        });
        
        // 주기적 확인 (5초마다로 변경)
        setInterval(() => {
            const currentQuotes = localStorage.getItem('quotesData');
            if (currentQuotes !== window.lastQuotesData) {
                window.lastQuotesData = currentQuotes;
                loadQuotesData();
            }
        }, 5000);
    };
    
    // 21. 견적 데이터 로드 함수
    window.loadQuotesData = function() {
        console.log('📋 Loading quotes data from localStorage...');
        const savedQuotes = localStorage.getItem('quotesData');
        if (savedQuotes) {
            try {
                const quotes = JSON.parse(savedQuotes);
                console.log('✅ Quotes data loaded:', quotes.length, 'quotes');
                updateMainPageQuotes(quotes);
            } catch (e) {
                console.error('❌ Error parsing quotes data:', e);
            }
        }
    };
    
    // 22. 메인 페이지 견적 데이터 업데이트
    window.updateMainPageQuotes = function(quotes) {
        console.log('📋 Updating main page quotes data...');
        
        // 견적 관련 요소들 업데이트
        const quoteElements = document.querySelectorAll('.quote-count, .total-quotes');
        quoteElements.forEach(el => {
            if (el && quotes.length > 0) {
                el.textContent = quotes.length.toString();
            }
        });
        
        // 최근 견적 정보 업데이트
        const recentQuotes = quotes.slice(-3).reverse(); // 최근 3개
        const recentQuotesContainer = document.querySelector('.recent-quotes');
        if (recentQuotesContainer && recentQuotes.length > 0) {
            let html = '<h4>최근 견적 요청</h4><ul>';
            recentQuotes.forEach(quote => {
                const customerName = quote.customerInfo ? quote.customerInfo.name : '고객명 없음';
                const packageName = quote.package ? quote.package.name : '패키지 없음';
                const date = quote.createdAt ? new Date(quote.createdAt).toLocaleDateString('ko-KR') : '날짜 없음';
                html += `<li>${customerName} - ${packageName} (${date})</li>`;
            });
            html += '</ul>';
            recentQuotesContainer.innerHTML = html;
        }
        
        console.log('✅ Main page quotes data updated');
    };
    





// Quick contact modal functions
function showQuickContact() {
    const modal = document.getElementById('quickContactModal');
    if (modal) {
        modal.style.display = 'flex';
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function hideQuickContact() {
    const modal = document.getElementById('quickContactModal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

// Quick quote modal functions
let currentQuoteStep = 1;
const totalQuoteSteps = 3;

function goToQuote() {
    // 견적 페이지로 이동
    window.location.href = 'checkout.html';
}

function closeQuickQuote() {
    const modal = document.getElementById('quickQuoteModal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

function nextQuoteStep() {
    if (currentQuoteStep < totalQuoteSteps) {
        currentQuoteStep++;
        updateQuoteStep();
        updateQuoteSummary();
    }
}

function prevQuoteStep() {
    if (currentQuoteStep > 1) {
        currentQuoteStep--;
        updateQuoteStep();
    }
}

function updateQuoteStep() {
    // Update step indicators
    document.querySelectorAll('.quote-step').forEach((step, index) => {
        const stepNum = index + 1;
        step.classList.remove('active', 'completed');
        
        if (stepNum === currentQuoteStep) {
            step.classList.add('active');
        } else if (stepNum < currentQuoteStep) {
            step.classList.add('completed');
        }
    });
    
    // Update step content
    document.querySelectorAll('.quote-step-content').forEach((content, index) => {
        const stepNum = index + 1;
        content.classList.remove('active');
        
        if (stepNum === currentQuoteStep) {
            content.classList.add('active');
        }
    });
    
    // Update buttons
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');
    
    prevBtn.style.display = currentQuoteStep > 1 ? 'block' : 'none';
    nextBtn.style.display = currentQuoteStep < totalQuoteSteps ? 'block' : 'none';
    submitBtn.style.display = currentQuoteStep === totalQuoteSteps ? 'block' : 'none';
}

function updateQuoteSummary() {
    // Update package name
    const selectedPackage = document.querySelector('input[name="package"]:checked');
    const packageNames = {
        'basic': '스파크 1P',
        'standard': '빌더 6P',
        'premium-plus': '맥스 10P'
    };
    const packagePrices = {
        'basic': 99000,
        'standard': 390000,
        'premium-plus': 590000
    };
    
    const packageName = packageNames[selectedPackage.value] || '스파크 1P';
    const packagePrice = packagePrices[selectedPackage.value] || 99000;
    
    document.getElementById('selectedPackageName').textContent = packageName;
    
    // Update options summary
    const selectedOptions = document.querySelectorAll('input[name="quickOptions"]:checked');
    let optionsText = '없음';
    let optionsTotal = 0;
    
    if (selectedOptions.length > 0) {
        const optionNames = [];
        selectedOptions.forEach(option => {
            const price = parseInt(option.dataset.price);
            optionsTotal += price;
            optionNames.push(option.nextElementSibling.textContent.split(' - ')[0]);
        });
        optionsText = optionNames.join(', ');
    }
    
    document.getElementById('selectedOptionsSummary').textContent = optionsText;
    
    // Update total
    const total = packagePrice + optionsTotal;
    document.getElementById('totalEstimate').textContent = total.toLocaleString() + '원';
}

function submitQuickQuote() {
    const name = document.getElementById('quickName').value;
    const email = document.getElementById('quickEmail').value;
    const phone = document.getElementById('quickPhone').value;
    const message = document.getElementById('quickMessage').value;
    
    if (!name || !email || !phone) {
        alert('필수 정보를 모두 입력해주세요.');
        return;
    }
    
    // Show success message
    closeQuickQuote();
    showSuccessModal('견적 요청이 완료되었습니다! 24시간 내에 상세한 견적서를 이메일로 발송해드리겠습니다.');
    
    // Reset form
    document.getElementById('quickName').value = '';
    document.getElementById('quickEmail').value = '';
    document.getElementById('quickPhone').value = '';
    document.getElementById('quickMessage').value = '';
    
    // Reset to first step
    currentQuoteStep = 1;
    updateQuoteStep();
}

// Add event listeners for quote form
document.addEventListener('DOMContentLoaded', function() {
    // Initialize text cursor control
    initTextCursorControl();
    
    // Package selection
    document.querySelectorAll('input[name="package"]').forEach(radio => {
        radio.addEventListener('change', updateQuoteSummary);
    });
    
    // Options selection
    document.querySelectorAll('input[name="quickOptions"]').forEach(checkbox => {
        checkbox.addEventListener('change', updateQuoteSummary);
    });
});

// Modal functions
function closeModal() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.style.display = 'none';
        modal.classList.remove('active');
    });
    document.body.style.overflow = 'auto';
}

// Utility functions
function initSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(link.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

function initModal() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        const closeBtn = modal.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.style.display = 'none';
                modal.classList.remove('active');
                document.body.style.overflow = 'auto';
            });
        }
    });
}

function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                observer.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
}

function enhanceFormValidation() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            const requiredFields = form.querySelectorAll('[required]');
            let isValid = true;

            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.classList.add('error');
                } else {
                    field.classList.remove('error');
                }
            });

            if (!isValid) {
                e.preventDefault();
                alert('필수 필드를 모두 입력해주세요.');
            }
        });
    });
}

function initPerformanceOptimizations() {
    // Performance optimizations without external dependencies
    console.log('✅ Performance optimizations initialized (no external dependencies)');
}

function initScrollProgress() {
    const scrollProgress = document.getElementById('scrollProgress');
    
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset;
        const docHeight = document.body.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        
        if (scrollProgress) {
            scrollProgress.style.width = scrollPercent + '%';
        }
    });
}

function initHeaderScroll() {
    const header = document.querySelector('.header');
    
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 100) {
            header?.classList.add('scrolled');
        } else {
            header?.classList.remove('scrolled');
        }
    });
}

function initIntersectionObserver() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, observerOptions);

    const elements = document.querySelectorAll('.fade-in-on-scroll');
    elements.forEach(el => observer.observe(el));
}

function initFloatingContact() {
    const floatingBtn = document.querySelector('.floating-btn');
    if (floatingBtn) {
        floatingBtn.addEventListener('click', showQuickContact);
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Hide loading overlay
    setTimeout(() => {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.classList.add('hidden');
        }
    }, 1000);
    
    // Initialize Google Analytics
    initGA();
    
    // Initialize components
    window.reviewsSlider = new ReviewsSlider();
    new FAQAccordion();
    window.multiStepForm = new MultiStepForm();
    new MobileMenu();
    initPortfolioFilter();
    loadPortfolioData();
    
    // Initialize utilities
    initSmoothScrolling();
    initModal();
    initLazyLoading();
    enhanceFormValidation();
    initPerformanceOptimizations();
    initScrollProgress();
    initHeaderScroll();
    initIntersectionObserver();
    initFloatingContact();
    initAdminTabs();
    

    
    // 관리자 설정 동기화 시스템 설정
    setupAdminSettingsSync();
    
    // 방문자 통계 동기화 시스템 설정
    setupVisitorStatsSync();
    
    // 견적 데이터 동기화 시스템 설정
    setupQuotesSync();
    

    
    // Track package views
    trackPackageView('스파크 1P');
    trackPackageView('빌더 6P');
    trackPackageView('맥스 10P');
    
    // 관리자 상태 확인
    checkAdminStatus();
});

// Handle page visibility changes for analytics
document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'visible') {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'page_view', {
                page_title: '밝은내일 웹 - 랜딩페이지',
                page_location: window.location.href
            });
        }
    }
});

// Handle form errors globally
window.addEventListener('error', function(e) {
    console.error('JavaScript Error:', e.error);
});

// Export functions for global access
window.closeModal = closeModal;
window.showPackageSelector = showPackageSelector;
window.closePackageSelector = closePackageSelector;
window.selectPackage = selectPackage;
window.showQuickContact = showQuickContact;
window.hideQuickContact = hideQuickContact;
window.goToQuote = goToQuote;
window.closeQuickQuote = closeQuickQuote;
window.nextQuoteStep = nextQuoteStep;
window.prevQuoteStep = prevQuoteStep;
window.submitQuickQuote = submitQuickQuote;

// Reviews slider functions
function prevReview() {
    if (window.reviewsSlider) {
        window.reviewsSlider.prevSlide();
    }
}

function nextReview() {
    if (window.reviewsSlider) {
        window.reviewsSlider.nextSlide();
    }
}

// Admin Access Functions
// 완전히 새로운 관리자 접근 시스템 - 단순하고 확실한 방법

function handleAdminClick() {
    adminClickCount++;
    
    // 타이머 리셋
    if (adminClickTimer) {
        clearTimeout(adminClickTimer);
    }
    
    // 3번 클릭되면 즉시 실행
    if (adminClickCount >= 3) {
        adminClickCount = 0;
        openAdminLogin();
        return;
    }
    
    // 1초 후 카운트 리셋
    adminClickTimer = setTimeout(() => {
        adminClickCount = 0;
    }, 1000);
}

function openAdminLogin() {
    // 비밀번호 입력
    const password = prompt('관리자 비밀번호를 입력하세요:');
    
    if (password === 'asdasd9123!@') {
        // 인증 상태를 여러 방법으로 설정 (더 확실하게)
        localStorage.setItem('adminAuthenticated', 'true');
        localStorage.setItem('adminLoginTime', Date.now().toString());
        sessionStorage.setItem('adminAuthenticated', 'true');
        
        // 추가 인증 데이터
        localStorage.setItem('adminStatus', 'authenticated');
        sessionStorage.setItem('adminSession', 'active');
        
        // 관리자 버튼 표시
        showAdminButton();
        
        alert('관리자 인증이 완료되었습니다!\n\n상단에 관리자 페이지 버튼이 나타났습니다.');
    } else if (password !== null) {
        alert('비밀번호가 올바르지 않습니다.');
    }
}

function showAdminButton() {
    // 기존 관리자 버튼이 있다면 제거
    const existingButton = document.getElementById('adminButton');
    if (existingButton) {
        existingButton.remove();
    }
    
    // 새로운 관리자 버튼 생성
    const adminButton = document.createElement('button');
    adminButton.id = 'adminButton';
    adminButton.innerHTML = '🔐 관리자 페이지';
    adminButton.className = 'admin-button';
    adminButton.onclick = function() {
        openAdminPage();
    };
    
    // 헤더에 버튼 추가
    const header = document.querySelector('header');
    if (header) {
        header.appendChild(adminButton);
    }
}

// 관리자 페이지로 직접 이동
function openAdminPage() {
    localStorage.setItem('adminAuthenticated', 'true');
    localStorage.setItem('adminLoginTime', Date.now().toString());
    window.location.href = 'admin.html';
}

function checkAdminStatus() {
    const auth = localStorage.getItem('adminAuthenticated');
    const session = sessionStorage.getItem('adminSession');
    
    if (auth === 'true' && session === 'active') {
        showAdminButton();
    }
}

function checkAdminAccess() {
    // 기존 함수는 그대로 유지 (다른 곳에서 호출될 수 있음)
    console.log('🔐 checkAdminAccess called directly');
    showAdminLogin();
}

function showAdminLogin() {
    // 기존 함수 호환성을 위해 새로운 함수 호출
    openAdminLogin();
}

// 전역 함수 노출 (관리자 접근용)
window.prevReview = prevReview;
window.nextReview = nextReview;
window.initAdminTabs = initAdminTabs;
window.checkAdminAccess = checkAdminAccess;
window.handleAdminClick = handleAdminClick;
window.showAdminLogin = showAdminLogin;
window.openAdminLogin = openAdminLogin;
window.showAdminButton = showAdminButton;
window.checkAdminStatus = checkAdminStatus;


// 디버깅용 전역 함수
window.debugAdminAccess = function() {
    console.log('🔍 Debug: Admin access system');
    console.log('Click count:', adminClickCount);
    console.log('Click timer:', adminClickTimer);
    console.log('handleAdminClick function:', typeof handleAdminClick);
    console.log('openAdminLogin function:', typeof openAdminLogin);
    console.log('showAdminLogin function:', typeof showAdminLogin);
};

// 테스트용 전역 함수
window.testAdminAccess = function() {
    openAdminLogin();
};

// 직접 관리자 페이지 이동 테스트
window.testAdminRedirect = function() {
    localStorage.setItem('adminAuthenticated', 'true');
    sessionStorage.setItem('adminAuthenticated', 'true');
    sessionStorage.setItem('adminSession', 'active');
    localStorage.setItem('adminLoginTime', Date.now().toString());
    window.location.href = 'admin.html';
};

// 새 탭으로 관리자 페이지 열기
window.openAdminInNewTab = function() {
    localStorage.setItem('adminAuthenticated', 'true');
    sessionStorage.setItem('adminAuthenticated', 'true');
    const newWindow = window.open('admin.html', '_blank');
};

// 관리자 페이지 링크 복사
window.copyAdminLink = function() {
    const adminUrl = window.location.origin + '/' + 'admin.html';
    navigator.clipboard.writeText(adminUrl).then(() => {
        alert('관리자 페이지 링크가 클립보드에 복사되었습니다!\n\n' + adminUrl);
    }).catch(() => {
        alert('링크 복사에 실패했습니다. 수동으로 복사해주세요:\n\n' + adminUrl);
    });
};

// 인증 상태 확인 함수
window.checkAuthStatus = function() {
    console.log('🔍 Checking authentication status...');
    console.log('localStorage adminAuthenticated:', localStorage.getItem('adminAuthenticated'));
    console.log('sessionStorage adminAuthenticated:', sessionStorage.getItem('adminAuthenticated'));
    console.log('localStorage adminStatus:', localStorage.getItem('adminStatus'));
    console.log('localStorage adminSession:', localStorage.getItem('adminSession'));
    console.log('adminLoginTime:', localStorage.getItem('adminLoginTime'));
};

// 강력한 인증 설정 함수
window.setAdminAuth = function() {
    localStorage.setItem('adminAuthenticated', 'true');
    sessionStorage.setItem('adminAuthenticated', 'true');
    localStorage.setItem('adminStatus', 'authenticated');
    localStorage.setItem('adminSession', 'active');
    localStorage.setItem('adminLoginTime', Date.now().toString());
    checkAuthStatus();
};

// 관리자 페이지 강제 접근
window.forceAdminAccess = function() {
    setAdminAuth();
    window.location.href = 'admin.html';
};

// 새 창으로 관리자 페이지 열기
window.openAdminInNewWindow = function() {
    localStorage.setItem('adminAuthenticated', 'true');
    window.open('admin.html', '_blank');
};

// Option selection functions
window.selectedOptions = new Map();

function toggleOption(optionId, price, name) {
    const button = event.target;
    const isSelected = button.classList.contains('selected');
    
    if (isSelected) {
        // Remove option
        button.classList.remove('selected');
        button.textContent = '선택';
        window.selectedOptions.delete(optionId);
    } else {
        // Add option
        button.classList.add('selected');
        button.textContent = '선택됨';
        window.selectedOptions.set(optionId, { price, name });
    }
    
    // Update selected options display
    updateSelectedOptionsDisplay();
}

function updateSelectedOptionsDisplay() {
    const display = document.getElementById('selectedOptionsDisplay');
    if (!display) return;
    
    if (window.selectedOptions.size === 0) {
        display.innerHTML = '<p>선택된 추가 옵션이 없습니다.</p>';
        return;
    }
    
    let html = '<h4>선택된 추가 옵션:</h4><ul>';
    let totalPrice = 0;
    
    window.selectedOptions.forEach((option, id) => {
        html += `<li>${option.name} - ${option.price.toLocaleString()}원</li>`;
        totalPrice += option.price;
    });
    
    html += '</ul>';
    html += `<p><strong>추가 옵션 총액: ${totalPrice.toLocaleString()}원</strong></p>`;
    
    display.innerHTML = html;
}

// Multi-step form functions
window.nextStep = function() {
    if (window.multiStepForm) {
        window.multiStepForm.nextStep();
    }
};

window.prevStep = function() {
    if (window.multiStepForm) {
        window.multiStepForm.prevStep();
    }
};
