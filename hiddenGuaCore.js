// 隐藏款核心逻辑文件
// 严格遵守：只新增、不修改、不重构、不优化旧代码的任何一行

class HiddenGuaManager {
    constructor() {
        this.hiddenData = [];
        this.unlockedHidden = this.loadUnlocked();
        this.versionBindings = this.loadVersionBindings();
        this.init();
    }

    init() {
        this.loadHiddenData();
    }

    loadHiddenData() {
        try {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', '32卦隐藏款.json', false);
            xhr.send();
            if (xhr.status === 200) {
                const data = JSON.parse(xhr.responseText);
                this.hiddenData = data.h || [];
                // 为每个卦添加sort字段和cardImage字段
                this.hiddenData.forEach((gua, index) => {
                    gua.sort = index + 1;
                    // 图片命名规则：
                    // id 1-9：00.png, 01.png...08.png（两位数字）
                    // id 10：09.png
                    // id 11-32：010.png, 011.png...031.png（三位数字）
                    if (index < 10) {
                        gua.cardImage = String(index).padStart(2, '0') + '.png';
                    } else {
                        gua.cardImage = String(index).padStart(3, '0') + '.png';
                    }
                });
            }
        } catch (e) {
            console.log('Failed to load hidden gua data:', e);
            this.hiddenData = [];
        }
    }

    loadUnlocked() {
        try {
            const saved = localStorage.getItem('bubuzhai_hidden_state');
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (e) {
            console.log('Failed to load hidden unlocked state:', e);
        }
        return {};
    }

    // 加载版本绑定数据
    loadVersionBindings() {
        try {
            const saved = localStorage.getItem('bubuzhai_hidden_versions');
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (e) {
            console.log('Failed to load hidden version bindings:', e);
        }
        return {};
    }

    // 保存版本绑定数据
    saveVersionBindings() {
        try {
            localStorage.setItem('bubuzhai_hidden_versions', JSON.stringify(this.versionBindings));
        } catch (e) {
            console.log('Failed to save hidden version bindings:', e);
        }
    }

    saveUnlocked() {
        try {
            localStorage.setItem('bubuzhai_hidden_state', JSON.stringify(this.unlockedHidden));
        } catch (e) {
            console.log('Failed to save hidden unlocked state:', e);
        }
    }

    // 检测关键词触发
    detectTriggers(question) {
        if (!question || !this.hiddenData.length) {
            return [];
        }

        const lowerQuestion = question.toLowerCase();
        const triggers = [];

        // 按文本中出现的顺序检测
        const triggerPositions = [];
        
        this.hiddenData.forEach(gua => {
            if (!this.unlockedHidden[gua.id] && gua.trigger) {
                const triggerLower = gua.trigger.toLowerCase();
                const index = lowerQuestion.indexOf(triggerLower);
                if (index !== -1) {
                    triggerPositions.push({ gua, position: index });
                }
            }
        });

        // 按位置排序
        triggerPositions.sort((a, b) => a.position - b.position);
        
        // 提取排序后的gua
        triggerPositions.forEach(item => {
            triggers.push(item.gua);
        });

        return triggers;
    }

    // 解锁隐藏款
    unlockGua(guaId) {
        this.unlockedHidden[guaId] = true;
        this.saveUnlocked();
    }

    // 为隐藏款绑定版本
    bindVersion(guaId) {
        if (!this.versionBindings[guaId]) {
            // 随机选择一个版本
            const versions = [1, 2, 3, 4, 5];
            const randomIndex = Math.floor(Math.random() * versions.length);
            this.versionBindings[guaId] = versions[randomIndex];
            this.saveVersionBindings();
        }
        return this.versionBindings[guaId];
    }

    // 获取已绑定的版本
    getVersion(guaId) {
        return this.versionBindings[guaId] || 1; // 默认返回版本1
    }

    // 获取隐藏款数据
    getHiddenData() {
        return this.hiddenData;
    }

    // 获取已解锁状态
    getUnlockedState() {
        return this.unlockedHidden;
    }

    // 获取已解锁数量
    getUnlockedCount() {
        return Object.keys(this.unlockedHidden).length;
    }
}

// 全局实例
window.hiddenGuaManager = new HiddenGuaManager();