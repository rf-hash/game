// main.js
import { PlayerModel } from './models/PlayerModel.js?v=2';
import { CombatEngine } from './combat/CombatEngine.js?v=2';
import { SimpleRenderer } from './render/SimpleRenderer.js?v=2';
import { RankManager } from './core/RankManager.js?v=2';

// 静态商品配置表
const SHOP_ITEMS = {
  weapon: [
    // 棍棒类
    { id: 'w_wood_club', name: '木棒', type: 'weapon', quality: 'C', critRate: 0.03, price: 500, attrValue: 100, element: 'None' },
    { id: 'w_torch', name: '火把', type: 'weapon', quality: 'C', critRate: 0.00, price: 1000, attrValue: 200, element: 'None' },
    // 刀类
    { id: 'w_knife', name: '刀', type: 'weapon', quality: 'C', critRate: 0.04, price: 7000, attrValue: 400, element: 'None' },
    { id: 'w_moonlight_blade', name: '月光刀', type: 'weapon', quality: 'B', critRate: 0.05, price: 10000, attrValue: 600, element: 'Water' },
    { id: 'w_moonlight_blade_plus', name: '月光刀+', type: 'weapon', quality: 'B', critRate: 0.07, price: 15000, attrValue: 800, element: 'Water' },
    { id: 'w_moonlight_blade_pro', name: '月光刀 pro', type: 'weapon', quality: 'A', critRate: 0.10, price: 20000, attrValue: 1200, element: 'Gold' },
    // 剑类
    { id: 'w_sword', name: '剑', type: 'weapon', quality: 'C', critRate: 0.04, price: 7000, attrValue: 400, element: 'None' },
    { id: 'w_fire_sword', name: '炽火剑', type: 'weapon', quality: 'B', critRate: 0.05, price: 10000, attrValue: 600, element: 'Fire' },
    { id: 'w_fire_sword_plus', name: '炽火剑+', type: 'weapon', quality: 'B', critRate: 0.07, price: 15000, attrValue: 800, element: 'Fire' },
    { id: 'w_fire_sword_pro', name: '炽火剑 pro', type: 'weapon', quality: 'A', critRate: 0.10, price: 20000, attrValue: 1200, element: 'Fire' },
    // 匕首类
    { id: 'w_dagger', name: '匕首', type: 'weapon', quality: 'C', critRate: 0.04, price: 7000, attrValue: 400, element: 'None' },
    { id: 'w_thunder_dagger', name: '雷纹匕', type: 'weapon', quality: 'B', critRate: 0.05, price: 10000, attrValue: 600, element: 'Gold' },
    { id: 'w_thunder_dagger_plus', name: '雷纹匕+', type: 'weapon', quality: 'B', critRate: 0.07, price: 17000, attrValue: 900, element: 'Gold' },
    { id: 'w_thunder_dagger_pro', name: '雷纹匕 pro', type: 'weapon', quality: 'A', critRate: 0.10, price: 23000, attrValue: 1300, element: 'Gold' },
    // 矛类
    { id: 'w_spear', name: '长矛', type: 'weapon', quality: 'C', critRate: 0.04, price: 7000, attrValue: 400, element: 'None' },
    { id: 'w_iron_spear', name: '铁矛', type: 'weapon', quality: 'B', critRate: 0.045, price: 10000, attrValue: 650, element: 'Water' },
    { id: 'w_lightning_spear', name: '电光矛', type: 'weapon', quality: 'B', critRate: 0.05, price: 15000, attrValue: 850, element: 'Water' },
    { id: 'w_lightning_spear_plus', name: '电光矛+', type: 'weapon', quality: 'A', critRate: 0.08, price: 20000, attrValue: 1100, element: 'Gold' },
    { id: 'w_lightning_spear_pro', name: '电光矛 pro', type: 'weapon', quality: 'A', critRate: 0.11, price: 30000, attrValue: 1600, element: 'Gold' }
  ],
  armor: [
    { id: 'a_sumian_ruanjia', name: '素面软甲', type: 'armor', quality: 'C', reduceRate: 0.04, price: 100000, attrValue: 500 },
    { id: 'a_pimian_ruanjia', name: '皮面软甲', type: 'armor', quality: 'C', reduceRate: 0.08, price: 200000, attrValue: 800 },
    { id: 'a_tongding_mianjia', name: '铜钉棉甲', type: 'armor', quality: 'B', reduceRate: 0.15, price: 500000, attrValue: 1500 },
    { id: 'a_xiangtie_mianjia', name: '镶铁棉甲', type: 'armor', quality: 'B', reduceRate: 0.18, price: 600000, attrValue: 2000 },
    { id: 'a_bumian_tiejia', name: '布面铁甲', type: 'armor', quality: 'A', reduceRate: 0.20, price: 700000, attrValue: 3000 },
    { id: 'a_shutie_zhongjia', name: '熟铁重甲', type: 'armor', quality: 'S', reduceRate: 0.25, price: 800000, attrValue: 4500 },
    { id: 'a_jinggang_yingjia', name: '精钢硬甲', type: 'armor', quality: 'S', reduceRate: 0.27, price: 850000, attrValue: 5000 }
  ],
  potion: [
    { id: 'p_low_atk', name: '低级攻击药水', type: 'potion', quality: 'A', price: 450, priceType: 'diamonds', effect: '10mins 内，攻击力+300' },
    { id: 'p_mid_atk', name: '中级攻击药水', type: 'potion', quality: 'X', price: 800, priceType: 'diamonds', effect: '10mins 内，攻击力+800' },
    { id: 'p_high_atk', name: '高级攻击药水', type: 'potion', quality: 'XS', price: 1050, priceType: 'diamonds', effect: '10mins 内，攻击力+1100' },
    { id: 'p_low_def', name: '低级防御药水', type: 'potion', quality: 'A', price: 450, priceType: 'diamonds', effect: '10mins 内，防御力+300' },
    { id: 'p_mid_def', name: '中级防御药水', type: 'potion', quality: 'X', price: 800, priceType: 'diamonds', effect: '10mins 内，防御力+800' },
    { id: 'p_high_def', name: '高级防御药水', type: 'potion', quality: 'XS', price: 1050, priceType: 'diamonds', effect: '10mins 内，防御力+1300' },
    { id: 'p_atk_speed', name: '攻速爆发药水', type: 'potion', quality: 'X', price: 700, priceType: 'diamonds', effect: '10mins 内，攻击速度+13%' },
    { id: 'p_lifesteal', name: '吸血之刃药水', type: 'potion', quality: 'EX', price: 1200, priceType: 'diamonds', effect: '10mins 内，将18%的伤害转化为生命' },
    { id: 'p_low_hp', name: '低级生命药水', type: 'potion', quality: 'A', price: 450, priceType: 'diamonds', effect: '恢复 1000 点生命' },
    { id: 'p_mid_hp', name: '中级生命药水', type: 'potion', quality: 'X', price: 800, priceType: 'diamonds', effect: '恢复 2500 点生命' },
    { id: 'p_high_hp', name: '高级生命药水', type: 'potion', quality: 'EX', price: 1050, priceType: 'diamonds', effect: '恢复 5000 点生命' },
    { id: 'p_cleanse', name: '净化药水', type: 'potion', quality: 'A', price: 550, priceType: 'diamonds', effect: '解除中毒等负面效果，并免疫 1mins' },
    { id: 'p_exp_boost', name: '经验倍增药水', type: 'potion', quality: 'S', price: 650, priceType: 'diamonds', effect: '等级经验增加时额外增加 15%，持续 30mins' },
    { id: 'p_speed_boost', name: '疾风药水', type: 'potion', quality: 'S', price: 600, priceType: 'diamonds', effect: '移动速度+20%，持续 30mins' },
    { id: 'p_luck_boost', name: '幸运药水', type: 'potion', quality: 'XS', price: 1100, priceType: 'diamonds', effect: '稀有变卖物掉落概率+8%，持续 30mins' }
  ],
  sellable: [
    // 左栏变卖物
    { id: 's_lamb_kebab', name: '羊肉串', type: 'sellable', quality: 'B', price: 7000, effect: '/' },
    { id: 's_steak', name: '牛排', type: 'sellable', quality: 'B', price: 7000, effect: '/' },
    { id: 's_grilled_fish', name: '烤鱼', type: 'sellable', quality: 'B', price: 5000, effect: '/' },
    { id: 's_snail_fossil', name: '螺化石', type: 'sellable', quality: 'B', price: 8500, effect: '召唤海螺' },
    { id: 's_old_wooden_box', name: '旧木箱', type: 'sellable', quality: 'B', price: 4000, effect: '/' },
    { id: 's_grilled_chicken_leg', name: '烤鸡腿', type: 'sellable', quality: 'B', price: 5500, effect: '/' },
    { id: 's_mushroom', name: '蘑菇', type: 'sellable', quality: 'C', price: 2000, effect: '/' },
    { id: 's_porcini', name: '牛菌子', type: 'sellable', quality: 'C', price: 2000, effect: '/' },
    { id: 's_willow_fruit', name: '柳果', type: 'sellable', quality: 'C', price: 2000, effect: '/' },
    { id: 's_watermelon', name: '西瓜', type: 'sellable', quality: 'C', price: 3000, effect: '/' },
    { id: 's_apple', name: '苹果', type: 'sellable', quality: 'C', price: 2000, effect: '/' },
    { id: 's_blackberry', name: '黑莓', type: 'sellable', quality: 'C', price: 1000, effect: '/' },
    { id: 's_old_newspaper', name: '旧报纸', type: 'sellable', quality: 'C', price: 500, effect: '/' },
    { id: 's_discarded_gear', name: '废弃齿轮', type: 'sellable', quality: 'C', price: 1500, effect: '/' },
    { id: 's_pork_chop', name: '猪扒', type: 'sellable', quality: 'C', price: 6250, effect: '/' },
    { id: 's_fresh_water', name: '淡水', type: 'sellable', quality: 'C', price: 4000, effect: '/' },
    { id: 's_dry_branch', name: '枯树枝', type: 'sellable', quality: 'C', price: 2000, effect: '/' },
    { id: 's_notebook', name: '笔记本', type: 'sellable', quality: 'C', price: 2000, effect: '/' },
    { id: 's_rusty_dagger', name: '生锈的匕首', type: 'sellable', quality: 'C', price: 1000, effect: '/' },
    { id: 's_rusty_knife', name: '生锈的小刀', type: 'sellable', quality: 'C', price: 1000, effect: '/' },
    { id: 's_broken_broom', name: '破扫帚', type: 'sellable', quality: 'C', price: 500, effect: '/' },
    { id: 's_leaky_bucket', name: '漏水的水桶', type: 'sellable', quality: 'C', price: 500, effect: '/' },
    // 右栏变卖物
    { id: 's_broken_arrow', name: '断箭', type: 'sellable', quality: 'C', price: 250, effect: '/' },
    { id: 's_iron_scrap', name: '铁片', type: 'sellable', quality: 'C', price: 700, effect: '/' },
    { id: 's_rag_strip', name: '破布条', type: 'sellable', quality: 'C', price: 400, effect: '/' },
    { id: 's_gravel', name: '碎石子', type: 'sellable', quality: 'C', price: 150, effect: '/' },
    { id: 's_chicken_bone', name: '鸡骨头', type: 'sellable', quality: 'C', price: 300, effect: '/' },
    { id: 's_pig_bone', name: '猪骨头', type: 'sellable', quality: 'C', price: 300, effect: '/' },
    { id: 's_fish_bone', name: '鱼刺', type: 'sellable', quality: 'C', price: 300, effect: '/' },
    { id: 's_cow_bone', name: '牛骨头', type: 'sellable', quality: 'C', price: 300, effect: '/' },
    { id: 's_sheep_bone', name: '羊骨头', type: 'sellable', quality: 'C', price: 300, effect: '/' },
    { id: 's_toilet_paper', name: '厕纸', type: 'sellable', quality: 'C', price: 175, effect: '/' },
    { id: 's_rusty_spoon', name: '生锈的勺子', type: 'sellable', quality: 'C', price: 800, effect: '/' },
    { id: 's_shabby_bowl', name: '破旧的碗', type: 'sellable', quality: 'C', price: 800, effect: '/' },
    { id: 's_shabby_chair', name: '破旧的椅子', type: 'sellable', quality: 'C', price: 800, effect: '/' },
    { id: 's_peeling_frame', name: '掉漆的画框', type: 'sellable', quality: 'C', price: 650, effect: '/' },
    { id: 's_torn_painting', name: '残破的画', type: 'sellable', quality: 'C', price: 1000, effect: '/' },
    { id: 's_discarded_screw', name: '废弃的螺丝', type: 'sellable', quality: 'C', price: 100, effect: '/' },
    { id: 's_bad_duck_feet', name: '难吃的鸭爪', type: 'sellable', quality: 'C', price: 500, effect: '/' },
    { id: 's_holey_cloth', name: '破洞的布片', type: 'sellable', quality: 'C', price: 100, effect: '/' },
    { id: 's_discarded_feather', name: '废弃的羽毛', type: 'sellable', quality: 'C', price: 100, effect: '/' },
    { id: 's_discarded_hair', name: '废弃的毛发', type: 'sellable', quality: 'C', price: 50, effect: '/' },
    { id: 's_discarded_tooth', name: '废弃的牙齿', type: 'sellable', quality: 'C', price: 50, effect: '/' },
    { id: 's_discarded_horn', name: '废弃的角', type: 'sellable', quality: 'C', price: 800, effect: '/' }
  ]
};

document.addEventListener('DOMContentLoaded', () => {
    const pm = PlayerModel.getInstance();
    
    // UI DOM 绑定
    const hudGold = document.getElementById('hud-gold');
    const hudDiamond = document.getElementById('hud-diamond');
    const hudYuanbao = document.getElementById('hud-yuanbao');
    const hudLevel = document.getElementById('hud-level');
    const hudRank = document.getElementById('hud-rank');
    const hudRp = document.getElementById('hud-rp');
    const seasonRankDetail = document.getElementById('season-rank-detail');
    const seasonRpDetail = document.getElementById('season-rp-detail');
    
    // 结算弹窗 DOM
    const settlementOverlay = document.getElementById('battle-settlement-overlay');
    const settlementBannerImg = document.getElementById('settlement-banner-img');
    const settlementRewardsContainer = document.getElementById('settlement-rewards-container');
    const btnSettlementConfirm = document.getElementById('btn-settlement-confirm');
    
    const logContainer = document.getElementById('log-container');
    
    // Canvas & 引擎初始化
    const canvas = document.getElementById('game-canvas');
    
    const logMsg = (msg, type) => {
        const item = document.createElement('div');
        item.className = `log-item ${type}`;
        item.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
        logContainer.appendChild(item);
        logContainer.parentElement.scrollTop = logContainer.parentElement.scrollHeight;
    };

    const engine = new CombatEngine(logMsg, (res, rewards) => {
        // 设置胜利/失败横幅大图
        if (res === 'win') {
            settlementBannerImg.src = 'src/assets/victory_banner.png';
        } else {
            settlementBannerImg.src = 'src/assets/defeat_banner.png';
        }

        // 渲染获得的收益信息
        settlementRewardsContainer.innerHTML = `
            <div class="reward-row">
                <span class="reward-label">战役资金</span>
                <span class="reward-value ${rewards.gold > 0 ? 'positive' : 'neutral'}">${rewards.gold >= 0 ? '+' : ''}${rewards.gold} 金币</span>
            </div>
            <div class="reward-row">
                <span class="reward-label">历练经验</span>
                <span class="reward-value ${rewards.exp > 0 ? 'positive' : 'neutral'}">${rewards.exp >= 0 ? '+' : ''}${rewards.exp} 经验</span>
            </div>
            <div class="reward-row">
                <span class="reward-label">天梯积分 (RP)</span>
                <span class="reward-value ${rewards.rp > 0 ? 'positive' : (rewards.rp < 0 ? 'negative' : 'neutral')}">${rewards.rp >= 0 ? '+' : ''}${rewards.rp} RP</span>
            </div>
        `;

        // 展现全局结算浮层
        settlementOverlay.style.display = 'flex';

        // 绑定点击确认返回按钮的逻辑
        btnSettlementConfirm.onclick = () => {
            settlementOverlay.style.display = 'none';
            overlayPanel.style.display = 'none';
            hintPanel.style.display = 'none';
            engine.resetEngine();
            updateProfileUI();
        };
    });
    
    const renderer = new SimpleRenderer(canvas, engine);

    // 追踪上一帧生命值用于触发闪白
    let lastPlayerHp = engine.player.hp;
    let lastTeammateHp = 0;
    const lastEnemyHpMap = {};

    // 键盘输入监听
    const keyboardInput = { left: false, right: false, up: false, down: false, block: false };
    
    window.addEventListener('keydown', (e) => {
        if (engine.mode === 'IDLE') return;
        if (e.code === 'KeyA' || e.code === 'ArrowLeft') keyboardInput.left = true;
        if (e.code === 'KeyD' || e.code === 'ArrowRight') keyboardInput.right = true;
        if (e.code === 'KeyW' || e.code === 'ArrowUp') keyboardInput.up = true;
        if (e.code === 'KeyS' || e.code === 'ArrowDown') {
            keyboardInput.down = true;
            keyboardInput.block = true; 
        }
        if (e.code === 'Space') {
            engine.playerMeleeSwing();
            e.preventDefault();
        }
    });

    window.addEventListener('keyup', (e) => {
        if (e.code === 'KeyA' || e.code === 'ArrowLeft') keyboardInput.left = false;
        if (e.code === 'KeyD' || e.code === 'ArrowRight') keyboardInput.right = false;
        if (e.code === 'KeyW' || e.code === 'ArrowUp') keyboardInput.up = false;
        if (e.code === 'KeyS' || e.code === 'ArrowDown') {
            keyboardInput.down = false;
            keyboardInput.block = false;
        }
    });

    // 鼠标点击 Canvas 发射远程弓箭
    canvas.addEventListener('mousedown', (e) => {
        if (engine.mode === 'IDLE') return;
        
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const dx = mouseX - engine.player.pos.x;
        const dy = mouseY - engine.player.pos.y;
        const angle = Math.atan2(dy, dx);

        engine.playerFireArrow(angle);
    });

    // 战役激活与浮层
    const overlayPanel = document.getElementById('battle-overlay');
    const overlayWind = document.getElementById('overlay-wind');
    const overlayTimer = document.getElementById('overlay-timer');
    const hintPanel = document.getElementById('combat-hint');

    const startBattle = (mode) => {
        engine.startLevel(mode);
        overlayPanel.style.display = 'flex';
        hintPanel.style.display = 'block';
        lastPlayerHp = engine.player.hp;
        lastTeammateHp = engine.teammate ? engine.teammate.hp : 0;
        engine.enemies.forEach(e => { lastEnemyHpMap[e.id] = e.hp; });
    };

    document.getElementById('btn-pve-easy').onclick = () => startBattle('PVE_EASY');
    document.getElementById('btn-pve-normal').onclick = () => startBattle('PVE_NORMAL');
    document.getElementById('btn-pvp-1v1').onclick = () => startBattle('PVP_1V1');
    document.getElementById('btn-pvp-2v2').onclick = () => startBattle('PVP_2V2');
    document.getElementById('btn-treasure').onclick = () => {
        const state = pm.getPlayerState();
        if (state.level < 2) {
            logMsg('[系统] 四家争宝模式需要角色等级 R2 解锁！', 'system');
            return;
        }
        startBattle('TREASURE');
    };

    // 右上角模式切换按钮交互
    let currentModeIndex = 0; // 0: PVE, 1: PVP, 2: TREASURE
    const modeTexts = ['模式：陆地生存 (PVE)', '模式：武道擂台 (PVP)', '模式：四家争宝 (Treasure)'];
    const pveGroup = document.getElementById('pve-btn-group');
    const pvpGroup = document.getElementById('pvp-btn-group');
    const treasureGroup = document.getElementById('treasure-btn-group');
    const modeLabel = document.getElementById('current-selected-mode-text');

    // 显式初始化默认显示的模式按钮组，防止因 CSS 缓存或 HTML 标签默认值导致不显示
    pveGroup.style.display = 'flex';
    pvpGroup.style.display = 'none';
    treasureGroup.style.display = 'none';
    modeLabel.textContent = modeTexts[0];

    document.getElementById('btn-toggle-mode').onclick = () => {
        currentModeIndex = (currentModeIndex + 1) % 3;
        modeLabel.textContent = modeTexts[currentModeIndex];
        
        // 切换隐藏状态
        pveGroup.style.display = currentModeIndex === 0 ? 'flex' : 'none';
        pvpGroup.style.display = currentModeIndex === 1 ? 'flex' : 'none';
        treasureGroup.style.display = currentModeIndex === 2 ? 'flex' : 'none';

        logMsg(`[系统] 切换到了 ${modeTexts[currentModeIndex].substring(3)}。`, 'info');
    };

    const showCenterNotice = (text, targetCard = null) => {
        const existing = document.querySelectorAll('.center-notice-overlay');
        existing.forEach(el => el.remove());

        const notice = document.createElement('div');
        notice.className = 'center-notice-overlay';
        notice.textContent = text;

        let positionStyle = {};
        let isRelative = false;

        if (targetCard && targetCard.parentElement) {
            const parent = targetCard.parentElement;
            const children = Array.from(parent.children);
            const index = children.indexOf(targetCard);
            let neighborCard = null;

            if (index !== -1) {
                if (index % 2 === 0) {
                    if (index + 1 < children.length) {
                        neighborCard = children[index + 1];
                    }
                } else {
                    if (index - 1 >= 0) {
                        neighborCard = children[index - 1];
                    }
                }
            }

            const rect1 = targetCard.getBoundingClientRect();
            const rect2 = neighborCard ? neighborCard.getBoundingClientRect() : rect1;

            const midX = (rect1.left + rect1.right + rect2.left + rect2.right) / 4;
            const topY = Math.min(rect1.top, rect2.top);

            positionStyle = {
                position: 'fixed',
                left: `${midX}px`,
                top: `${topY}px`
            };
            isRelative = true;
        } else {
            positionStyle = {
                position: 'absolute',
                top: '50%',
                left: '50%'
            };
        }
        
        Object.assign(notice.style, {
            transform: 'translate(-50%, -50%) scale(0.8)',
            zIndex: '99999',
            padding: '16px 36px',
            background: 'rgba(26, 26, 28, 0.9)',
            backdropFilter: 'blur(12px)',
            webkitBackdropFilter: 'blur(12px)',
            border: '2px solid #ff4d4d',
            borderRadius: '12px',
            color: '#ff4d4d',
            fontSize: '24px',
            fontWeight: '900',
            letterSpacing: '2px',
            textAlign: 'center',
            boxShadow: '0 10px 45px rgba(0, 0, 0, 0.8), inset 0 0 15px rgba(255, 77, 77, 0.3)',
            textShadow: '0 0 12px rgba(255, 77, 77, 0.6)',
            pointerEvents: 'none',
            opacity: '0',
            transition: 'opacity 0.3s ease, transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }, positionStyle);

        if (isRelative) {
            document.body.appendChild(notice);
        } else {
            const wrapper = document.querySelector('.canvas-wrapper');
            if (wrapper) wrapper.appendChild(notice);
        }

        notice.offsetHeight; // force reflow
        notice.style.opacity = '1';
        notice.style.transform = 'translate(-50%, -50%) scale(1.05)';
        
        setTimeout(() => {
            notice.style.transform = 'translate(-50%, -50%) scale(1)';
        }, 150);

        setTimeout(() => {
            notice.style.opacity = '0';
            notice.style.transform = 'translate(-50%, -50%) scale(0.95)';
            setTimeout(() => {
                notice.remove();
            }, 300);
        }, 1500);
    };

    // 顶栏和个人信息 UI 同步
    const updateProfileUI = () => {
        const state = pm.getPlayerState();
        hudGold.textContent = state.gold.toString();
        hudDiamond.textContent = state.diamonds.toString();
        hudYuanbao.textContent = state.yuanbao.toString();
        hudLevel.textContent = `R${state.level}`;
        
        const rankStr = RankManager.getRankName(state.rankPoints);
        hudRank.textContent = rankStr;
        hudRp.textContent = `(RP: ${state.rankPoints})`;
        
        if (seasonRankDetail) seasonRankDetail.textContent = rankStr;
        if (seasonRpDetail) seasonRpDetail.textContent = `(RP: ${state.rankPoints})`;
    };

    // 弹窗逻辑通用处理
    const setupModal = (btnId, modalId, closeId, onOpen) => {
        const btn = document.getElementById(btnId);
        const modal = document.getElementById(modalId);
        const close = document.getElementById(closeId);

        btn.onclick = () => {
            modal.style.display = 'flex';
            if (onOpen) onOpen();
        };
        close.onclick = () => modal.style.display = 'none';
        window.addEventListener('click', (e) => {
            if (e.target === modal) modal.style.display = 'none';
        });
    };

    // 背包渲染
    const bagGrid = document.getElementById('bag-grid');
    const bagDetail = document.getElementById('bag-detail');

    const renderBag = () => {
        const state = pm.getPlayerState();
        bagGrid.innerHTML = '';
        bagDetail.style.display = 'none';
        bagDetail.innerHTML = '';

        state.inventory.forEach(item => {
            const slot = document.createElement('div');
            slot.className = `bag-slot quality-${item.quality}`;
            
            const isEquipped = state.equipped.weapon === item.uuid || state.equipped.armor === item.uuid;
            if (isEquipped) slot.classList.add('equipped');

            slot.textContent = item.name;
            slot.onclick = () => {
                let typeText = '未知';
                if (item.type === 'weapon') typeText = '武器';
                else if (item.type === 'armor') typeText = '防具';
                else if (item.type === 'potion') typeText = '消耗品';
                else if (item.type === 'sellable') typeText = '变卖物';

                let colorStyle = '';
                const q = item.quality;
                if (q === 'C') colorStyle = 'background: #00ff00;';
                else if (q === 'B') colorStyle = 'background: #2979ff;';
                else if (q === 'A') colorStyle = 'background: #ff9100;';
                else if (q === 'S') colorStyle = 'background: #a855f7;';
                else if (q === 'X') colorStyle = 'background: #ff0000;';
                else if (q === 'XS') colorStyle = 'background: #d4af37;';
                else if (q === 'EX') colorStyle = 'background: linear-gradient(to right, #ff0000, #ff9100, #00ff00, #00ffff, #2979ff, #a855f7);';

                const qualityBarHtml = `
                    <div style="width: 100%; display: flex; flex-direction: column; align-items: center; margin-bottom: 8px;">
                        <div style="width: 100%; height: 8px; border-radius: 4px; ${colorStyle}"></div>
                        <div style="font-size: 13px; font-weight: bold; margin-top: 4px; color: #ffffff;">${q}</div>
                    </div>
                `;

                bagDetail.innerHTML = `
                    ${qualityBarHtml}
                    <h4 style="margin: 0 0 5px 0; font-size: 14px; font-weight: bold; color: #ffffff;">${item.name}</h4>
                    <p style="margin: 3px 0; font-size: 11px; color: #ffffff;">类型: ${typeText}</p>
                    <p style="margin: 3px 0; font-size: 11px; color: #ffffff;">回收价: 💰 ${item.sellPrice}</p>
                    <div class="item-detail-actions" style="margin-top: auto; display: flex; flex-direction: column; gap: 6px; width: 100%;">
                        ${(item.type !== 'potion' && item.type !== 'sellable') ? `<button class="item-action-btn primary" id="btn-equip-action">${isEquipped ? '脱下' : '穿上'}</button>` : ''}
                        <button class="item-action-btn" id="btn-sell-action" style="color: #e74c3c;">出售</button>
                    </div>
                `;

                const btnEquip = document.getElementById('btn-equip-action');
                if (btnEquip) {
                    btnEquip.onclick = () => {
                        pm.equipItem(item.uuid);
                        renderBag();
                    };
                }

                document.getElementById('btn-sell-action').onclick = () => {
                    const ok = pm.sellItem(item.uuid);
                    if (ok) {
                        logMsg(`[商店] 您出售了 [${item.name}]，获得了金币 ${item.sellPrice}`, 'reward');
                        renderBag();
                        updateProfileUI();
                    } else {
                        logMsg(`[商店] 出售失败！不可售卖身上穿着的装备。`, 'system');
                    }
                };
                bagDetail.style.display = 'flex';
            };
            bagGrid.appendChild(slot);
        });

        for (let i = state.inventory.length; i < 16; i++) {
            const slot = document.createElement('div');
            slot.className = 'bag-slot empty';
            slot.textContent = '-';
            bagGrid.appendChild(slot);
        }
    };

    // 仓库渲染
    const wareBagGrid = document.getElementById('ware-bag-grid');
    const wareHouseGrid = document.getElementById('ware-house-grid');

    const renderWarehouse = () => {
        const state = pm.getPlayerState();
        wareBagGrid.innerHTML = '';
        wareHouseGrid.innerHTML = '';

        if (!state.warehouse) state.warehouse = [];

        // 渲染背包格子（供存入仓库）
        state.inventory.forEach(item => {
            const slot = document.createElement('div');
            slot.className = `bag-slot quality-${item.quality}`;
            const isEquipped = state.equipped.weapon === item.uuid || state.equipped.armor === item.uuid;
            if (isEquipped) slot.classList.add('equipped');
            slot.textContent = item.name;
            
            slot.onclick = () => {
                const ok = pm.moveItemToWarehouse(item.uuid);
                if (ok) {
                    logMsg(`[仓库] 存入物品 [${item.name}]。`, 'info');
                    renderWarehouse();
                } else {
                    logMsg(`[仓库] 存入失败！穿着中的装备不可存放。`, 'system');
                }
            };
            wareBagGrid.appendChild(slot);
        });
        for (let i = state.inventory.length; i < 12; i++) {
            const slot = document.createElement('div');
            slot.className = 'bag-slot empty';
            slot.textContent = '-';
            wareBagGrid.appendChild(slot);
        }

        // 渲染仓库格子（供取出到背包）
        state.warehouse.forEach(item => {
            const slot = document.createElement('div');
            slot.className = `bag-slot quality-${item.quality}`;
            slot.textContent = item.name;
            
            slot.onclick = () => {
                const ok = pm.moveItemToInventory(item.uuid);
                if (ok) {
                    logMsg(`[仓库] 取出物品 [${item.name}]。`, 'info');
                    renderWarehouse();
                } else {
                    logMsg(`[仓库] 取出失败！您的背包可能已满。`, 'system');
                }
            };
            wareHouseGrid.appendChild(slot);
        });
        for (let i = state.warehouse.length; i < 12; i++) {
            const slot = document.createElement('div');
            slot.className = 'bag-slot empty';
            slot.textContent = '-';
            wareHouseGrid.appendChild(slot);
        }
    };

    // 商店选项卡与渲染
    let currentShopTab = 'weapon';
    const shopItemsGrid = document.getElementById('shop-items-grid');

    const renderShop = () => {
        shopItemsGrid.innerHTML = '';
        const items = SHOP_ITEMS[currentShopTab];

        items.forEach(item => {
            const card = document.createElement('div');
            card.className = `shop-item-card quality-${item.quality}`;

            let detailsHtml = '';
            let buyButtonHtml = '';
            
            if (item.type === 'weapon') {
                const elementText = item.element === 'None' ? '无' : (item.element === 'Water' ? '水' : (item.element === 'Gold' ? '金' : (item.element === 'Fire' ? '火' : item.element)));
                detailsHtml = `
                    <p>伤害加成: +${item.attrValue}</p>
                    <p>暴击率: ${Math.round(item.critRate * 100)}%</p>
                    <p>属性: ${elementText}</p>
                `;
                buyButtonHtml = `<button class="buy-btn">购买</button>`;
            } else if (item.type === 'armor') {
                detailsHtml = `
                    <p>物理减伤: -${Math.round(item.reduceRate * 100)}%</p>
                    <p>生命加成: +${item.attrValue}</p>
                `;
                buyButtonHtml = `<button class="buy-btn">购买</button>`;
            } else if (item.type === 'potion') {
                detailsHtml = `
                    <p>品质: ${item.quality}级</p>
                    <p>效果: ${item.effect || '/'}</p>
                `;
                buyButtonHtml = `<button class="buy-btn">购买</button>`;
            } else if (item.type === 'sellable') {
                detailsHtml = `
                    <p>品质: ${item.quality}级</p>
                    <p>效果: ${item.effect || '/'}</p>
                `;
                // 食物 ID 列表，限制仅食物可购买
                const FOOD_IDS = [
                    's_lamb_kebab', 's_steak', 's_grilled_fish', 's_grilled_chicken_leg',
                    's_mushroom', 's_porcini', 's_willow_fruit', 's_watermelon',
                    's_apple', 's_blackberry', 's_pork_chop', 's_fresh_water', 's_bad_duck_feet'
                ];
                if (FOOD_IDS.includes(item.id)) {
                    buyButtonHtml = `<button class="buy-btn">购买</button>`;
                } else {
                    buyButtonHtml = `<span style="font-size: 11px; color: #95a5a6; border: 1px solid #555; padding: 2px 6px; border-radius: 3px; background: rgba(255,255,255,0.05);">仅供出售</span>`;
                }
            } else {
                detailsHtml = `<p>属性加成: +${item.attrValue}</p>`;
                buyButtonHtml = `<button class="buy-btn">购买</button>`;
            }

            const currencyIcon = item.priceType === 'diamonds' ? '💎' : '💰';
            card.innerHTML = `
                <div>
                    <h4 style="cursor: pointer;">${item.name}</h4>
                    ${detailsHtml}
                    <p class="price-tag">${currencyIcon} ${item.price}</p>
                </div>
                ${buyButtonHtml}
            `;
            
            card.onclick = (e) => {
                if (e.target.classList.contains('buy-btn')) return;
                if (shopSellItemDetail) {
                    let typeText = '未知';
                    if (item.type === 'weapon') typeText = '武器';
                    else if (item.type === 'armor') typeText = '防具';
                    else if (item.type === 'potion') typeText = '消耗品';
                    else if (item.type === 'sellable') typeText = '变卖物';

                    let colorStyle = '';
                    const q = item.quality;
                    if (q === 'C') colorStyle = 'background: #00ff00;';
                    else if (q === 'B') colorStyle = 'background: #2979ff;';
                    else if (q === 'A') colorStyle = 'background: #ff9100;';
                    else if (q === 'S') colorStyle = 'background: #a855f7;';
                    else if (q === 'X') colorStyle = 'background: #ff0000;';
                    else if (q === 'XS') colorStyle = 'background: #d4af37;';
                    else if (q === 'EX') colorStyle = 'background: linear-gradient(to right, #ff0000, #ff9100, #00ff00, #00ffff, #2979ff, #a855f7);';

                    const qualityBarHtml = `
                        <div style="width: 100%; display: flex; flex-direction: column; align-items: center; margin-bottom: 8px;">
                            <div style="width: 100%; height: 8px; border-radius: 4px; ${colorStyle}"></div>
                            <div style="font-size: 13px; font-weight: bold; margin-top: 4px; color: #ffffff;">${q}</div>
                        </div>
                    `;

                    shopSellItemDetail.innerHTML = `
                        ${qualityBarHtml}
                        <h4 style="margin: 0 0 5px 0; font-size: 14px; font-weight: bold; color: #ffffff;">${item.name}</h4>
                        <p style="margin: 3px 0; font-size: 11px; color: #ffffff;">类型: ${typeText}</p>
                        <p style="margin: 3px 0; font-size: 11px; color: #ffffff;">售价: ${currencyIcon} ${item.price}</p>
                        <button class="buy-btn" id="btn-shop-detail-buy" style="margin-top: auto; width: 100%; height: 26px; font-size: 12px; background: var(--accent-gold); border-color: #d4af37; color: black !important; font-weight: bold;">购买</button>
                    `;

                    const btnDetailBuy = document.getElementById('btn-shop-detail-buy');
                    if (btnDetailBuy) {
                        btnDetailBuy.onclick = () => {
                            const ok = pm.buyItem(item);
                            if (ok) {
                                logMsg(`[商店] 成功购买了 [${item.name}]！`, 'reward');
                                updateProfileUI();
                            } else {
                                const state = pm.getPlayerState();
                                const currency = item.priceType === 'diamonds' ? 'diamonds' : 'gold';
                                if (state[currency] < item.price) {
                                    if (item.type === 'weapon') {
                                        showCenterNotice('余额不足', card);
                                    }
                                    logMsg(`[商店] 购买失败！代币余额不足。`, 'system');
                                } else if (state.inventory.length >= 40) {
                                    logMsg(`[商店] 购买失败！背包已满。`, 'system');
                                } else {
                                    logMsg(`[商店] 购买失败！请检查您的代币余额是否充足，或背包已满。`, 'system');
                                }
                            }
                        };
                    }
                    shopSellItemDetail.style.display = 'flex';
                }
            };

            const buyBtn = card.querySelector('.buy-btn');
            if (buyBtn) {
                buyBtn.onclick = (e) => {
                    e.stopPropagation();
                    const ok = pm.buyItem(item);
                    if (ok) {
                        logMsg(`[商店] 成功购买了 [${item.name}]！`, 'reward');
                        updateProfileUI();
                    } else {
                        const state = pm.getPlayerState();
                        const currency = item.priceType === 'diamonds' ? 'diamonds' : 'gold';
                        if (state[currency] < item.price) {
                            if (item.type === 'weapon') {
                                showCenterNotice('余额不足', card);
                            }
                            logMsg(`[商店] 购买失败！代币余额不足。`, 'system');
                        } else if (state.inventory.length >= 40) {
                            logMsg(`[商店] 购买失败！背包已满。`, 'system');
                        } else {
                            logMsg(`[商店] 购买失败！请检查您的代币余额是否充足，或背包已满。`, 'system');
                        }
                    }
                };
            }
            shopItemsGrid.appendChild(card);
        });
    };

    // 商店左侧详情页渲染 DOM 绑定
    const shopSellItemDetail = document.getElementById('shop-sell-item-detail');

    // 绑定所有的弹窗
    setupModal('btn-bag', 'modal-bag', 'close-bag', renderBag);
    setupModal('btn-warehouse', 'modal-warehouse', 'close-warehouse', renderWarehouse);
    setupModal('btn-shop', 'modal-shop', 'close-shop', () => {
        if (shopSellItemDetail) shopSellItemDetail.style.display = 'none';
        renderShop();
    });
    setupModal('btn-season', 'modal-season', 'close-season');

    // 商店 Tab 切换
    const tabs = ['weapon', 'armor', 'potion', 'sellable'];
    tabs.forEach(t => {
        const btn = document.getElementById(`tab-shop-${t}`);
        if (btn) {
            btn.onclick = (e) => {
                tabs.forEach(x => {
                    const otherBtn = document.getElementById(`tab-shop-${x}`);
                    if (otherBtn) otherBtn.classList.remove('active');
                });
                e.target.classList.add('active');
                currentShopTab = t;
                renderShop();
            };
        }
    });

    // 模拟天梯结算重置
    document.getElementById('btn-trigger-settle').onclick = () => {
        const state = pm.getPlayerState();
        const res = RankManager.settleSeason(state.rankPoints);
        
        pm.resetSeason(res.newRp, res.rewardGold, res.rewardDiamond, res.rewardYuanbao);
        
        logMsg(`[赛季结算] 天梯重置成功！RP继承为: ${res.newRp}，获得金币 ${res.rewardGold}，钻石 ${res.rewardDiamond}，元宝 ${res.rewardYuanbao}`, 'reward');
        updateProfileUI();
    };

    updateProfileUI();

    let lastTime = performance.now();

    const loop = (now) => {
        const dt = Math.min(0.1, (now - lastTime) / 1000); 
        lastTime = now;

        if (engine.mode !== 'IDLE') {
            engine.tick(dt, keyboardInput);

            if (engine.player.hp < lastPlayerHp) {
                renderer.triggerFlashWhite('player', 0.1);
                lastPlayerHp = engine.player.hp;
            }
            if (engine.teammate && engine.teammate.hp < lastTeammateHp) {
                renderer.triggerFlashWhite('teammate', 0.1);
                lastTeammateHp = engine.teammate.hp;
            }
            engine.enemies.forEach(enemy => {
                if (enemy.hp < (lastEnemyHpMap[enemy.id] ?? enemy.maxHp)) {
                    renderer.triggerFlashWhite(enemy.id, 0.1);
                    lastEnemyHpMap[enemy.id] = enemy.hp;
                }
            });

            overlayTimer.textContent = `${Math.ceil(engine.gameTime)}s`;
            overlayWind.textContent = `${engine.windX > 0 ? '右风' : '左风'} ${Math.abs(engine.windX / 30)} 级`;
        }

        renderer.updateFlashRegistry(dt);
        renderer.render();

        requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
});
