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

// 견적 시스템 JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize text cursor control
    initTextCursorControl();
    
    // 견적 시스템 초기화
    initQuoteSystem();
});

function initQuoteSystem() {
    const form = document.getElementById('checkoutForm');
    const steps = document.querySelectorAll('.form-step');
    const stepIndicators = document.querySelectorAll('.step');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');
    
    let currentStep = 1;
    const totalSteps = 3;
    
    // 패키지 정보
    const packages = {
        basic: {
            name: '스파크 1P',
            price: 99000,
            description: '기본 랜딩페이지 제작',
            features: [
                '✅ 반응형 디자인',
                '✅ 기본 SEO 최적화',
                '✅ 정적 배포 (Vercel/Netlify)',
                '⚠️ 도메인 연결 (연 25,000원 별도)',
                '✅ SSL 인증서'
            ]
        },
        standard: {
            name: '빌더 6P',
            price: 390000,
            description: '다중 페이지 웹사이트 제작',
            features: [
                '✅ 반응형 디자인',
                '✅ 고급 SEO 최적화',
                '✅ 다중 페이지 (최대 6페이지)',
                '✅ 관리자 대시보드',
                '✅ 콘텐츠 관리 시스템',
                '✅ 도메인 연결',
                '✅ SSL 인증서',
                '✅ 백업 시스템'
            ]
        },
        premium: {
            name: '맥스 10P',
            price: 590000,
            description: '프리미엄 웹사이트 제작',
            features: [
                '✅ 반응형 디자인',
                '✅ 최고급 SEO 최적화',
                '✅ 다중 페이지 (최대 10페이지)',
                '✅ 고급 관리자 대시보드',
                '✅ 실시간 콘텐츠 관리',
                '✅ 고급 분석 도구',
                '✅ 도메인 연결',
                '✅ SSL 인증서',
                '✅ 자동 백업 시스템',
                '✅ 성능 최적화'
            ]
        }
    };
    
    // 추가 옵션 정보
    const additionalOptions = {
        domain: { name: '도메인 등록 및 연결 (1년) - 스파크 1P만', price: 25000 },
        hosting: { name: '웹 호스팅 (1년)', price: 35000 },
        email: { name: '이메일 호스팅 (1년)', price: 45000 },
        social: { name: '소셜미디어 연동', price: 35000 },
        payment: { name: '결제 시스템 연동', price: 80000 },
        booking: { name: '예약 시스템', price: 65000 },
        seo: { name: '고급 SEO 최적화', price: 55000 },
        chat: { name: '실시간 채팅 시스템', price: 40000 },
        analytics: { name: '고급 분석 도구', price: 50000 },
        multilang: { name: '다국어 지원', price: 75000 }
    };
    
    // 유지보수 정보
    const maintenancePlans = {
        none: { name: '유지보수 없음', price: 0 },
        basic: { name: '🔧 기본 유지보수', price: 69000 },
        standard: { name: '⚡ 표준 유지보수', price: 149000 },
        premium: { name: '🚀 프리미엄 유지보수', price: 249000 }
    };
    
    // 선택된 옵션들
    let selectedPackage = 'basic';
    let selectedOptions = new Set();
    let selectedMaintenance = 'none';
    
    // 이벤트 리스너 설정
    setupEventListeners();
    
    // 초기 견적 계산
    updateQuote();
    
    // 초기 옵션 상태 복원 및 시각적 피드백
    updateOptionVisualFeedback();
    
    // 강제 견적 업데이트 (개발용)
    window.forceUpdateQuote = function() {
        console.log('🚨 Force updating quote...');
        updateQuote();
        updateOptionVisualFeedback();
    };
    
    // 강제 UI 업데이트 (개발용)
    window.forceUpdateUI = function() {
        console.log('🚨 Force updating UI...');
        
        const serviceAmount = packages[selectedPackage].price + 
            Array.from(selectedOptions).reduce((total, option) => total + additionalOptions[option].price, 0) +
            maintenancePlans[selectedMaintenance].price;
        
        const taxAmount = Math.round(serviceAmount * 0.1);
        const totalAmount = serviceAmount + taxAmount;
        
        // 직접 DOM 조작
        const elements = {
            serviceAmount: document.getElementById('serviceAmount'),
            taxAmount: document.getElementById('taxAmount'),
            totalAmount: document.getElementById('totalAmount')
        };
        
        if (elements.serviceAmount) {
            elements.serviceAmount.textContent = formatPrice(serviceAmount);
            console.log('✅ Service amount forced update:', formatPrice(serviceAmount));
        }
        
        if (elements.taxAmount) {
            elements.taxAmount.textContent = formatPrice(taxAmount);
            console.log('✅ Tax amount forced update:', formatPrice(taxAmount));
        }
        
        if (elements.totalAmount) {
            elements.totalAmount.textContent = formatPrice(totalAmount);
            console.log('✅ Total amount forced update:', formatPrice(totalAmount));
        }
        
        // 모든 가격 요소 강제 업데이트
        document.querySelectorAll('[data-price]').forEach(el => {
            const priceType = el.dataset.price;
            if (priceType === 'service') el.textContent = formatPrice(serviceAmount);
            if (priceType === 'tax') el.textContent = formatPrice(taxAmount);
            if (priceType === 'total') el.textContent = formatPrice(totalAmount);
        });
    };
    
    function setupEventListeners() {
        // 패키지 선택
        document.querySelectorAll('input[name="package"]').forEach(radio => {
            radio.addEventListener('change', function() {
                selectedPackage = this.value;
                updatePackageInfo();
                updateQuote();
            });
        });
        
        // 번들 옵션 선택 이벤트 리스너
        document.querySelectorAll('input[name="bundleOptions"]').forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                handleBundleSelection(this);
            });
            
            // 번들 카드 클릭 시에도 체크박스 토글
            const bundleCard = checkbox.closest('.bundle-option');
            if (bundleCard) {
                bundleCard.addEventListener('click', function(e) {
                    if (e.target === checkbox) return;
                    checkbox.checked = !checkbox.checked;
                    checkbox.dispatchEvent(new Event('change'));
                });
            }
        });
        
        // 추가 옵션 선택 - 강화된 이벤트 리스너
        document.querySelectorAll('input[name="additionalOptions"]').forEach(checkbox => {
            // 기존 이벤트 리스너 제거 (중복 방지)
            checkbox.removeEventListener('change', handleOptionChange);
            
            // 새로운 이벤트 리스너 추가
            checkbox.addEventListener('change', handleOptionChange);
            
            // 옵션 카드 클릭 시에도 체크박스 토글
            const optionCard = checkbox.closest('.option-card');
            if (optionCard) {
                optionCard.addEventListener('click', function(e) {
                    // 체크박스 자체를 클릭한 경우는 중복 방지
                    if (e.target === checkbox) return;
                    
                    console.log('🖱️ Option card clicked:', checkbox.value);
                    checkbox.checked = !checkbox.checked;
                    checkbox.dispatchEvent(new Event('change'));
                });
            }
        });
        
        // 옵션 변경 핸들러 함수
        function handleOptionChange() {
            console.log('🔧 Option changed:', this.value, this.checked);
            
            if (this.checked) {
                selectedOptions.add(this.value);
                console.log('➕ Option added:', this.value);
            } else {
                selectedOptions.delete(this.value);
                console.log('➖ Option removed:', this.value);
            }
            
            console.log('📋 Current selected options:', Array.from(selectedOptions));
            
            // 견적 업데이트
            updateQuote();
            
            // UI 시각적 피드백
            updateOptionVisualFeedback();
            
            // 강제 UI 업데이트 (백업)
            setTimeout(() => {
                window.forceUpdateUI();
            }, 100);
        }
        
        // 유지보수 선택
        document.querySelectorAll('input[name="maintenance"]').forEach(radio => {
            radio.addEventListener('change', function() {
                selectedMaintenance = this.value;
                console.log('🛠️ Maintenance changed:', this.value);
                updateQuote();
                
                // 강제 UI 업데이트 (백업)
                setTimeout(() => {
                    window.forceUpdateUI();
                }, 100);
            });
        });
        
        // 실시간 입력 검증
        setupRealTimeValidation();
        
        // 네비게이션 버튼
        prevBtn.addEventListener('click', () => navigateStep(-1));
        nextBtn.addEventListener('click', () => navigateStep(1));
        
        // 폼 제출
        form.addEventListener('submit', handleSubmit);
    }
    
    function setupRealTimeValidation() {
        // 모든 입력 필드에 대해 실시간 검증 설정
        const validationRules = {
            customerName: {
                required: true,
                minLength: 2,
                message: '이름을 2글자 이상 입력해주세요.'
            },
            customerEmail: {
                required: true,
                pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                message: '올바른 이메일 형식을 입력해주세요.'
            },
            customerPhone: {
                required: true,
                pattern: /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/,
                message: '올바른 전화번호 형식을 입력해주세요 (예: 010-1234-5678)'
            },
            projectName: {
                required: true,
                minLength: 2,
                message: '프로젝트명을 2글자 이상 입력해주세요.'
            },
            projectDescription: {
                required: true,
                minLength: 10,
                message: '프로젝트 설명을 10글자 이상 입력해주세요.'
            }
        };

        // 각 필드에 대해 실시간 검증 설정
        Object.keys(validationRules).forEach(fieldId => {
            const field = document.getElementById(fieldId);
            const rules = validationRules[fieldId];
            
            if (field) {
                // 실시간 검증 (입력 중)
                field.addEventListener('input', () => {
                    validateField(field, rules, false);
                });
                
                // 포커스 아웃 시 검증
                field.addEventListener('blur', () => {
                    validateField(field, rules, true);
                });
                
                // 포커스 시 에러 메시지 숨김
                field.addEventListener('focus', () => {
                    clearFieldError(field);
                });
            }
        });
    }
    
    function validateField(field, rules, showError = true) {
        const value = field.value.trim();
        const formGroup = field.closest('.form-group');
        let isValid = true;
        let errorMessage = '';
        
        // 필수 필드 검증
        if (rules.required && !value) {
            isValid = false;
            errorMessage = `${field.previousElementSibling.textContent.replace(' *', '')}을(를) 입력해주세요.`;
        }
        
        // 최소 길이 검증
        if (isValid && rules.minLength && value.length < rules.minLength) {
            isValid = false;
            errorMessage = rules.message;
        }
        
        // 패턴 검증
        if (isValid && rules.pattern && !rules.pattern.test(value)) {
            isValid = false;
            errorMessage = rules.message;
        }
        
        // 검증 결과 적용
        if (isValid) {
            clearFieldError(field);
            showFieldSuccess(field);
        } else {
            clearFieldSuccess(field);
            if (showError) {
                showFieldError(field, errorMessage);
            }
        }
        
        return isValid;
    }
    
    function showFieldError(field, message) {
        const formGroup = field.closest('.form-group');
        const errorElement = formGroup.querySelector('.field-error');
        const errorMessage = formGroup.querySelector('.error-message');
        
        if (errorElement && errorMessage) {
            errorMessage.textContent = message;
            errorElement.style.display = 'flex';
            formGroup.classList.add('has-error');
            formGroup.classList.remove('has-success');
            field.classList.add('error');
            field.classList.remove('success');
        }
    }
    
    function clearFieldError(field) {
        const formGroup = field.closest('.form-group');
        const errorElement = formGroup.querySelector('.field-error');
        
        if (errorElement) {
            errorElement.style.display = 'none';
            formGroup.classList.remove('has-error');
            field.classList.remove('error');
        }
    }
    
    function showFieldSuccess(field) {
        const formGroup = field.closest('.form-group');
        
        formGroup.classList.add('has-success');
        formGroup.classList.remove('has-error');
        field.classList.add('success');
        field.classList.remove('error');
    }
    
    function clearFieldSuccess(field) {
        const formGroup = field.closest('.form-group');
        
        formGroup.classList.remove('has-success');
        field.classList.remove('success');
    }
    
    function handleBundleSelection(bundleCheckbox) {
        const bundleValue = bundleCheckbox.value;
        console.log('🎁 Bundle selected:', bundleValue, bundleCheckbox.checked);
        
        if (bundleCheckbox.checked) {
            // 번들 선택 시 관련 개별 옵션들 자동 선택
            if (bundleValue === 'starter') {
                // 스타터 번들: 도메인 + 호스팅 + 이메일
                selectIndividualOptions(['domain', 'hosting', 'email']);
            } else if (bundleValue === 'business') {
                // 비즈니스 번들: 스타터 번들 + 결제 + 소셜미디어
                selectIndividualOptions(['domain', 'hosting', 'email', 'payment', 'social']);
            }
        } else {
            // 번들 해제 시 관련 개별 옵션들 자동 해제
            if (bundleValue === 'starter') {
                deselectIndividualOptions(['domain', 'hosting', 'email']);
            } else if (bundleValue === 'business') {
                deselectIndividualOptions(['domain', 'hosting', 'email', 'payment', 'social']);
            }
        }
        
        updateQuote();
    }
    
    function selectIndividualOptions(optionValues) {
        optionValues.forEach(value => {
            const checkbox = document.querySelector(`input[name="additionalOptions"][value="${value}"]`);
            if (checkbox && !checkbox.checked) {
                checkbox.checked = true;
                checkbox.dispatchEvent(new Event('change'));
            }
        });
    }
    
    function deselectIndividualOptions(optionValues) {
        optionValues.forEach(value => {
            const checkbox = document.querySelector(`input[name="additionalOptions"][value="${value}"]`);
            if (checkbox && checkbox.checked) {
                checkbox.checked = false;
                checkbox.dispatchEvent(new Event('change'));
            }
        });
    }
    
    function showFieldError(input, message) {
        // 기존 에러 메시지 제거
        hideFieldError(input);
        
        // 에러 메시지 생성
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        errorDiv.style.color = '#ef4444';
        errorDiv.style.fontSize = '0.875rem';
        errorDiv.style.marginTop = '0.25rem';
        errorDiv.style.fontWeight = '500';
        
        // 입력 필드 다음에 에러 메시지 삽입
        input.parentNode.appendChild(errorDiv);
    }
    
    function hideFieldError(input) {
        const existingError = input.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
    }
    
    function updatePackageInfo() {
        const package = packages[selectedPackage];
        document.getElementById('selectedPackage').textContent = package.name;
        document.getElementById('packagePrice').textContent = formatPrice(package.price);
        
        const featuresList = document.getElementById('packageFeatures');
        featuresList.innerHTML = package.features.map(feature => `<li>${feature}</li>`).join('');
    }
    
    function updateQuote() {
        console.log('🔄 Updating quote calculation...');
        console.log('📦 Selected package:', selectedPackage);
        console.log('🔧 Selected options:', Array.from(selectedOptions));
        console.log('🛠️ Selected maintenance:', selectedMaintenance);
        
        const packagePrice = packages[selectedPackage].price;
        const optionsPrice = Array.from(selectedOptions).reduce((total, option) => {
            const optionPrice = additionalOptions[option]?.price || 0;
            console.log(`💰 Option ${option}: ${optionPrice}원`);
            return total + optionPrice;
        }, 0);
        const maintenancePrice = maintenancePlans[selectedMaintenance].price;
        
        console.log('📊 Price breakdown:');
        console.log(`  - Package: ${packagePrice}원`);
        console.log(`  - Options: ${optionsPrice}원`);
        console.log(`  - Maintenance: ${maintenancePrice}원`);
        
        const serviceAmount = packagePrice + optionsPrice + maintenancePrice;
        const taxAmount = Math.round(serviceAmount * 0.1);
        const totalAmount = serviceAmount + taxAmount;
        
        console.log(`  - Service Total: ${serviceAmount}원`);
        console.log(`  - Tax: ${taxAmount}원`);
        console.log(`  - Final Total: ${totalAmount}원`);
        
        // UI 업데이트 - 강화된 DOM 요소 찾기
        const serviceAmountEl = document.getElementById('serviceAmount');
        const taxAmountEl = document.getElementById('taxAmount');
        const totalAmountEl = document.getElementById('totalAmount');
        const orderTotalEl = document.querySelector('.order-total');
        
        console.log('🔍 DOM Elements found:');
        console.log('  - serviceAmountEl:', serviceAmountEl);
        console.log('  - taxAmountEl:', taxAmountEl);
        console.log('  - totalAmountEl:', totalAmountEl);
        console.log('  - orderTotalEl:', orderTotalEl);
        
        if (serviceAmountEl) {
            serviceAmountEl.textContent = formatPrice(serviceAmount);
            console.log('✅ Service amount updated:', formatPrice(serviceAmount));
        } else {
            console.error('❌ Service amount element not found!');
        }
        
        if (taxAmountEl) {
            taxAmountEl.textContent = formatPrice(taxAmount);
            console.log('✅ Tax amount updated:', formatPrice(taxAmount));
        } else {
            console.error('❌ Tax amount element not found!');
        }
        
        if (totalAmountEl) {
            totalAmountEl.textContent = formatPrice(totalAmount);
            console.log('✅ Total amount updated:', formatPrice(totalAmount));
        } else {
            console.error('❌ Total amount element not found!');
        }
        
        // 가격 하이라이트 효과
        if (orderTotalEl) {
            // 기존 하이라이트 제거
            orderTotalEl.classList.remove('highlighted');
            
            // 잠시 후 하이라이트 적용
            setTimeout(() => {
                orderTotalEl.classList.add('highlighted');
                
                // 2초 후 하이라이트 제거
                setTimeout(() => {
                    orderTotalEl.classList.remove('highlighted');
                }, 2000);
            }, 100);
        }
        
        // 대체 방법으로 DOM 요소 찾기 (기존 코드 유지)
        if (!totalAmountEl) {
            const alternativeSelectors = [
                '[data-price="total"]',
                '.total-amount',
                '.quote-total',
                '.final-price',
                '#totalPrice',
                '.price-total'
            ];
            
            for (const selector of alternativeSelectors) {
                const altElement = document.querySelector(selector);
                if (altElement) {
                    altElement.textContent = formatPrice(totalAmount);
                    console.log(`✅ Total amount updated via alternative selector: ${selector}`);
                    break;
                }
            }
        }
        
        console.log('✅ Quote calculation updated successfully');
    }
    
    // 옵션 선택 시각적 피드백 업데이트
    function updateOptionVisualFeedback() {
        console.log('🎨 Updating option visual feedback...');
        
        document.querySelectorAll('input[name="additionalOptions"]').forEach(checkbox => {
            const optionCard = checkbox.closest('.option-card');
            if (optionCard) {
                if (checkbox.checked) {
                    optionCard.classList.add('selected');
                    console.log(`✅ Option card selected: ${checkbox.value}`);
                } else {
                    optionCard.classList.remove('selected');
                    console.log(`❌ Option card deselected: ${checkbox.value}`);
                }
            }
        });
    }
    
    function formatPrice(price) {
        return price.toLocaleString() + '원';
    }
    
    function navigateStep(direction) {
        const newStep = currentStep + direction;
        
        if (newStep >= 1 && newStep <= totalSteps) {
            showStep(newStep);
        }
    }
    
    function showStep(step) {
        // 현재 스텝 숨기기
        steps[currentStep - 1].classList.remove('active');
        stepIndicators[currentStep - 1].classList.remove('active');
        
        // 새 스텝 보이기
        steps[step - 1].classList.add('active');
        stepIndicators[step - 1].classList.add('active');
        
        currentStep = step;
        
        // 버튼 상태 업데이트
        updateNavigationButtons();
    }
    
    function updateNavigationButtons() {
        prevBtn.style.display = currentStep > 1 ? 'block' : 'none';
        nextBtn.style.display = currentStep < totalSteps ? 'block' : 'none';
        submitBtn.style.display = currentStep === totalSteps ? 'block' : 'none';
        
        // 진행률 업데이트
        updateProgressIndicator();
    }
    
    function updateProgressIndicator() {
        const progressPercent = Math.round((currentStep / totalSteps) * 100);
        const progressFill = document.getElementById('progressFill');
        const progressPercentEl = document.getElementById('progressPercent');
        const currentStepNumEl = document.getElementById('currentStepNum');
        const totalStepsNumEl = document.getElementById('totalStepsNum');
        const estimatedTimeEl = document.getElementById('estimatedTime');
        
        // 진행률 바 업데이트
        if (progressFill) {
            progressFill.style.width = `${progressPercent}%`;
        }
        
        // 진행률 텍스트 업데이트
        if (progressPercentEl) {
            progressPercentEl.textContent = progressPercent;
        }
        
        // 단계 번호 업데이트
        if (currentStepNumEl) {
            currentStepNumEl.textContent = currentStep;
        }
        
        if (totalStepsNumEl) {
            totalStepsNumEl.textContent = totalSteps;
        }
        
        // 예상 완료 시간 업데이트
        if (estimatedTimeEl) {
            const remainingSteps = totalSteps - currentStep + 1;
            const estimatedMinutes = remainingSteps * 2; // 단계당 2분 예상
            estimatedTimeEl.textContent = `${estimatedMinutes}분`;
        }
        
        // 스텝 상태 업데이트
        updateStepStatus();
    }
    
    function updateStepStatus() {
        const steps = document.querySelectorAll('.step');
        
        steps.forEach((step, index) => {
            const stepNumber = index + 1;
            const statusEl = step.querySelector('.step-status');
            
            // 모든 클래스 제거
            step.classList.remove('active', 'completed');
            
            if (stepNumber === currentStep) {
                // 현재 단계
                step.classList.add('active');
                if (statusEl) {
                    statusEl.textContent = '현재 단계';
                }
            } else if (stepNumber < currentStep) {
                // 완료된 단계
                step.classList.add('completed');
                if (statusEl) {
                    statusEl.textContent = '완료됨';
                }
            } else {
                // 아직 안된 단계
                if (statusEl) {
                    if (stepNumber === currentStep + 1) {
                        statusEl.textContent = '다음 단계';
                    } else if (stepNumber === totalSteps) {
                        statusEl.textContent = '최종 단계';
                    } else {
                        statusEl.textContent = '대기 중';
                    }
                }
            }
        });
    }
    
    async function handleSubmit(e) {
        e.preventDefault();
        
        console.log('🚀 Checkout form submitted!');
        
        // 폼 유효성 검사
        if (!validateForm()) {
            return;
        }
        
        // 로딩 상태 표시
        const submitBtn = document.getElementById('submitBtn');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoading = submitBtn.querySelector('.btn-loading');
        
        btnText.style.display = 'none';
        btnLoading.style.display = 'inline';
        submitBtn.disabled = true;
        
        try {
            // 견적 요청 데이터 수집
            const quoteData = collectQuoteData();
            console.log('📋 Collected quote data:', quoteData);
            
            // 방법 1: script.js의 견적 저장 로직 호출
            if (typeof window.saveQuoteToStorage === 'function') {
                console.log('💾 Method 1: Saving quote using script.js function...');
                window.saveQuoteToStorage(quoteData);
                console.log('✅ Quote saved successfully via script.js!');
            } else {
                console.log('⚠️ saveQuoteToStorage function not found, using direct method...');
                // 방법 2: 직접 저장
                saveQuoteToAdmin(quoteData);
                console.log('✅ Quote saved directly to localStorage!');
            }
            
            // 성공 모달 표시
            showSuccessModal(quoteData);
            
        } catch (error) {
            console.error('견적 요청 오류:', error);
            alert('견적 요청 중 오류가 발생했습니다. 다시 시도해주세요.');
        } finally {
            // 로딩 상태 해제
            btnText.style.display = 'inline';
            btnLoading.style.display = 'none';
            submitBtn.disabled = false;
        }
    }
    
    function validateForm() {
        const validationRules = {
            customerName: {
                required: true,
                minLength: 2,
                message: '이름을 2글자 이상 입력해주세요.'
            },
            customerEmail: {
                required: true,
                pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                message: '올바른 이메일 형식을 입력해주세요.'
            },
            customerPhone: {
                required: true,
                pattern: /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/,
                message: '올바른 전화번호 형식을 입력해주세요 (예: 010-1234-5678)'
            },
            projectName: {
                required: true,
                minLength: 2,
                message: '프로젝트명을 2글자 이상 입력해주세요.'
            },
            projectDescription: {
                required: true,
                minLength: 10,
                message: '프로젝트 설명을 10글자 이상 입력해주세요.'
            }
        };
        
        let isValid = true;
        let firstErrorField = null;
        
        Object.keys(validationRules).forEach(fieldId => {
            const field = document.getElementById(fieldId);
            const rules = validationRules[fieldId];
            
            if (field && !validateField(field, rules, true)) {
                isValid = false;
                if (!firstErrorField) {
                    firstErrorField = field;
                }
            }
        });
        
        // 첫 번째 오류 필드로 포커스
        if (!isValid && firstErrorField) {
            firstErrorField.focus();
            firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        
        // 약관 동의 검증
        const agreeTerms = document.getElementById('agreeTerms');
        if (!agreeTerms.checked) {
            showFieldError(agreeTerms, '서비스 이용약관에 동의해주세요.');
            agreeTerms.focus();
            return false;
        }
        
        return isValid;
    }
    
    function collectQuoteData() {
        const package = packages[selectedPackage];
        const selectedOptionsList = Array.from(selectedOptions).map(option => additionalOptions[option]);
        const maintenance = maintenancePlans[selectedMaintenance];
        
        // script.js의 saveQuoteToStorage 함수가 기대하는 형식으로 데이터 변환
        const quoteData = {
            id: Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9),
            createdAt: new Date().toISOString(),
            customerInfo: {
                name: document.getElementById('customerName').value,
                email: document.getElementById('customerEmail').value,
                phone: document.getElementById('customerPhone').value,
                message: document.getElementById('projectDescription').value || ''
            },
            package: {
                id: selectedPackage,
                name: package.name,
                price: package.price
            },
            options: selectedOptionsList.map(option => ({
                id: option.name,
                name: option.name,
                price: option.price
            })),
            totalAmount: package.price + selectedOptionsList.reduce((sum, option) => sum + option.price, 0) + (maintenance.price || 0),
            status: 'pending',
            // 추가 정보
            projectName: document.getElementById('projectName').value,
            maintenance: maintenance,
            quoteNumber: generateQuoteNumber(),
            completionDate: calculateCompletionDate()
        };
        
        console.log('📋 Formatted quote data for script.js:', quoteData);
        return quoteData;
    }
    
    function generateQuoteNumber() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `BT-${year}-${month}${day}-${random}`;
    }
    
    function calculateCompletionDate() {
        const now = new Date();
        const completionDate = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000)); // 7일 후
        return completionDate.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
    
    async function processQuoteRequest(quoteData) {
        // 견적 요청 처리 시뮬레이션
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('견적 요청 처리됨:', quoteData);
                
                // 관리자 페이지에 견적 요청 저장
                saveQuoteToAdmin(quoteData);
                
                resolve(quoteData);
            }, 2000);
        });
    }
    
    function saveQuoteToAdmin(quoteData) {
        try {
            // script.js와 동일한 키 사용
            const existingQuotes = JSON.parse(localStorage.getItem('quotesData') || '[]');
            
            // 새 견적 추가
            const newQuote = {
                id: Date.now(),
                ...quoteData,
                status: 'pending',
                createdAt: new Date().toISOString(),
                isNew: true
            };
            
            existingQuotes.push(newQuote); // 최신 견적을 맨 뒤에 추가
            
            // localStorage에 저장
            localStorage.setItem('quotesData', JSON.stringify(existingQuotes));
            
            // 이벤트 발생
            window.dispatchEvent(new CustomEvent('quotesDataUpdated'));
            
            console.log('✅ 견적이 관리자 페이지에 저장되었습니다:', newQuote);
            console.log('📊 총 견적 수:', existingQuotes.length);
        } catch (error) {
            console.error('❌ 견적 저장 중 오류:', error);
        }
    }
    
    function showSuccessModal(quoteData) {
        const modal = document.getElementById('successModal');
        const orderNumber = document.getElementById('orderNumber');
        const completionDate = document.getElementById('completionDate');
        
        orderNumber.textContent = quoteData.quoteNumber;
        completionDate.textContent = quoteData.completionDate;
        
        modal.style.display = 'flex';
    }
}

// 성공 모달 관련 함수들
function closeSuccessModal() {
    const modal = document.getElementById('successModal');
    modal.style.display = 'none';
}

function goToMain() {
    // 메인 화면으로 이동
    window.location.href = 'index.html';
}

// 모달 외부 클릭 시 닫기
document.addEventListener('click', function(e) {
    const modal = document.getElementById('successModal');
    if (e.target === modal) {
        closeSuccessModal();
    }
});
