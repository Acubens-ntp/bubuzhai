// 隐藏款触发器文件
// 严格遵守：只新增、不修改、不重构、不优化旧代码的任何一行

class HiddenGuaTrigger {
    constructor() {
        this.isProcessing = false;
        this.pendingTriggers = [];
        this.currentGua = null;
        this.unlockedGuas = [];
        this.init();
    }

    init() {
        this.setupCoinListener();
    }

    // 统一的铜钱动画结束处理函数
    onCoinsAnimationEnd(question) {
        if (!question) {
            // 没有输入问题，不执行任何流程
            return;
        }
        if (window.hiddenGuaManager && window.hiddenGuaManager.detectTriggers) {
            const triggers = window.hiddenGuaManager.detectTriggers(question);
            if (triggers && triggers.length > 0) {
                // 有未解锁关键词，进入隐藏款流程
                this.startHiddenGuaFlow(question, triggers);
                return;
            }
        }
        // 没有未解锁关键词，进入64卦流程
        this.start64GuaFlow(question);
    }

    // ==================== 64卦流程 ====================
    start64GuaFlow(question) {
        state.currentQuestion = question;
        
        // 随机生成卦象
        const results = [];
        for (let i = 0; i < 3; i++) results.push(Math.random() > 0.5 ? 1 : 0);
        const guaBinary = results.join('');
        const guaId = parseInt(guaBinary, 2) + 1;

        let selectedGua = null;
        if (guaId < 1 || guaId > 64) {
            selectedGua = GUA_DATA[Math.floor(Math.random() * 64)];
        } else {
            selectedGua = GUA_DATA[guaId - 1];
        }

        // 为64卦添加cardImage字段
        selectedGua.cardImage = '64卦卡片封面/' + String(selectedGua.id - 1).padStart(3, '0') + '.jpg';

        state.currentGua = selectedGua;

        const isNewUnlock = !state.unlockedGua[state.currentGua.id];
        state.unlockedGua[state.currentGua.id] = true;
        saveState();
        
        state.entryMode = 'throw';
        state.isFlipped = false;
        state.isNewUnlock = isNewUnlock;
        state.isCardLocked = false;
        
        // 直接进入界面四显示卡片
        navigateTo('card');
    }

    // ==================== 隐藏款流程 ====================
    startHiddenGuaFlow(question, triggers) {
        this.isProcessing = true;
        this.pendingTriggers = triggers;
        this.unlockedGuas = [];
        state.currentQuestion = question;
        
        // 开始处理第一个隐藏款
        this.processNextHiddenGua();
    }

    processNextHiddenGua() {
        if (!this.pendingTriggers || this.pendingTriggers.length === 0) {
            this.isProcessing = false;
            // 所有隐藏款解锁完成，进入界面五
            this.enterAnswerPage();
            return;
        }

        const currentGua = this.pendingTriggers.shift();
        this.currentGua = currentGua;

        // 解锁该卦
        if (window.hiddenGuaManager && window.hiddenGuaManager.unlockGua) {
            window.hiddenGuaManager.unlockGua(currentGua.id);
            this.unlockedGuas.push(currentGua);
            this.showHiddenCard(currentGua);
        } else {
            console.log('hiddenGuaManager is not available, skipping unlock');
            this.processNextHiddenGua();
        }
    }

    showHiddenCard(gua) {
        // 为该卦绑定版本
        if (window.hiddenGuaManager && window.hiddenGuaManager.bindVersion) {
            window.hiddenGuaManager.bindVersion(gua.id);
        }

        // 获取已绑定的版本内容
        let versionContent = gua.version_1 || '';
        if (window.hiddenGuaManager && window.hiddenGuaManager.getVersion) {
            const version = window.hiddenGuaManager.getVersion(gua.id);
            versionContent = gua[`version_${version}`] || versionContent;
        }

        // 构建标题：体系-名称
        const fullTitle = gua.line + '-' + gua.name;

        // 设置当前卦为隐藏款，标记isHiddenGua为true，包含cardImage
        state.currentGua = {
            id: gua.id,
            name: fullTitle,
            symbol: '🔮',
            guaci: '',
            yaoci: versionContent,
            modern: versionContent,
            ancient_origin: gua.ancient_origin,
            isHiddenGua: true,
            cardImage: gua.cardImage || ''
        };
        state.isFlipped = false;
        state.entryMode = 'throw';
        state.isNewUnlock = true;
        state.isCardLocked = false;

        // 进入界面四显示卡片
        navigateTo('card');
    }

    playUnlockAnimation(gua) {
        // 跳转到界面三
        navigateTo('gallery');
        switchGalleryTab('hidden');

        // 等待DOM更新
        setTimeout(() => {
            const guaItem = document.querySelector(`.gua-item[data-id="${gua.id}"]`);
            if (guaItem) {
                // 添加解锁动画
                guaItem.classList.add('unlock-animation');

                // 动画结束后返回界面四，等待用户点击卡片
                setTimeout(() => {
                    guaItem.classList.remove('unlock-animation');
                    navigateTo('card');
                    state.isFlipped = false;
                    document.getElementById('card').classList.remove('flipped');
                    // 根据卡片类型调用相应的更新函数
                    if (state.currentGua && state.currentGua.isHiddenGua) {
                        if (typeof updateHiddenCardDisplay === 'function') {
                            updateHiddenCardDisplay();
                        }
                    } else {
                        if (typeof updateCardDisplay === 'function') {
                            updateCardDisplay();
                        }
                    }
                    // 不自动处理下一个，让用户点击卡片
                }, 2500);
            } else {
                // 如果没找到元素，继续处理下一个
                this.processNextHiddenGua();
            }
        }, 100);
    }

    enterAnswerPage() {
        // 跳转到界面五
        navigateTo('answer');
        this.updateAnswerPage();
    }

    updateAnswerPage() {
        // 等待DOM更新
        setTimeout(() => {
            // 显示用户的问题
            const answerQuestion = document.getElementById('answer-question');
            if (answerQuestion && state.currentQuestion) {
                answerQuestion.textContent = state.currentQuestion;
            }

            const answerCardMini = document.getElementById('answer-card-mini');
            if (answerCardMini) {
                answerCardMini.innerHTML = '';
                this.unlockedGuas.forEach(gua => {
                    const cardWrapper = document.createElement('div');
                    cardWrapper.className = 'answer-card-mini-item';
                    cardWrapper.style.position = 'relative';
                    cardWrapper.style.width = '80px';
                    cardWrapper.style.height = '110px';
                    cardWrapper.style.borderRadius = '12px';
                    cardWrapper.style.overflow = 'hidden';
                    cardWrapper.style.marginRight = '8px';

                    // 添加图片
                    const img = document.createElement('img');
                    img.className = 'mini-image';
                    img.src = gua.cardImage || '';
                    img.style.position = 'absolute';
                    img.style.top = '0';
                    img.style.left = '0';
                    img.style.width = '100%';
                    img.style.height = '100%';
                    img.style.objectFit = 'cover';
                    img.onload = function() { this.classList.add('loaded'); };
                    img.onerror = function() { this.style.display = 'none'; };

                    cardWrapper.appendChild(img);
                    answerCardMini.appendChild(cardWrapper);
                });
            }

            // 显示随机回答
            if (window.MODERN_RESPONSES) {
                const responseIdx = Math.floor(Math.random() * window.MODERN_RESPONSES.length);
                const answerText = document.getElementById('answer-text');
                if (answerText) {
                    answerText.textContent = window.MODERN_RESPONSES[responseIdx];
                }
            }
        }, 100);
    }

    // ==================== 铜钱点击监听 ====================
    setupCoinListener() {
        const coinsContainer = document.getElementById('coins-container');
        if (coinsContainer) {
            const originalClick = coinsContainer.onclick;
            coinsContainer.onclick = function(e) {
                // 先检测是否有未解锁的隐藏款关键词
                const question = document.getElementById('question-input').value.trim();
                let hasUnlockedTrigger = false;
                
                if (question && window.hiddenGuaManager && window.hiddenGuaManager.detectTriggers) {
                    const triggers = window.hiddenGuaManager.detectTriggers(question);
                    if (triggers && triggers.length > 0) {
                        hasUnlockedTrigger = true;
                    }
                }
                
                // 执行原有铜钱动画（播放旋转）
                if (typeof originalClick === 'function') {
                    originalClick.call(this, e);
                }
                
                // 动画结束后根据检测结果决定进入哪个流程
                setTimeout(() => {
                    if (window.hiddenGuaTrigger) {
                        window.hiddenGuaTrigger.onCoinsAnimationEnd(question);
                    }
                }, 800);
            };
        }
    }
}

// 全局实例
window.hiddenGuaTrigger = new HiddenGuaTrigger();
