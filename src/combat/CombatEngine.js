// CombatEngine.js
import { MeleeCalculs } from './MeleeCalculs.js?v=2';
import { ArrowController } from './ArcheryCalculs.js?v=2';
import { SpellReaction } from './SpellReaction.js?v=2';
import { ArenaBotAI } from '../ai/ArenaBotAI.js?v=2';
import { PlayerModel } from '../models/PlayerModel.js?v=2';

export class CombatEngine {
    mode = 'IDLE';
    gameTime = 0;
    
    player = null;
    teammate = null; // AI 队友
    enemies = [];
    collectibles = [];

    arrows = [];
    sparks = [];
    floatingTexts = [];

    windX = 0;
    windY = 0;

    playerBuffs = {
        burnTime: 0,
        regenTime: 0,
        shieldHp: 0,
        pierceTime: 0,
        speedTime: 0
    };

    onGameLog = null;
    onGameFinished = null;

    constructor(onLog, onFinished) {
        this.onGameLog = onLog;
        this.onGameFinished = onFinished;
        this.resetEngine();
    }

    resetEngine() {
        this.player = {
            pos: { x: 400, y: 240 }, // 玩家固定生成在中央土地的中心
            dir: { x: 1, y: 0 },
            isBlocking: false,
            stamina: 100,
            maxStamina: 100,
            isInvulnerable: false,
            hp: 10000,
            maxHp: 10000,
            element: 'None',
            elementTime: 0
        };
        this.teammate = null;
        this.enemies = [];
        this.arrows = [];
        this.sparks = [];
        this.floatingTexts = [];
        this.collectibles = [];
        this.gameTime = 120; 
    }

    startLevel(mode) {
        this.resetEngine();
        this.mode = mode;
        
        const windLevelX = Math.floor(Math.random() * 7) - 3;
        this.windX = windLevelX * 30; 
        this.windY = 0;

        const pm = PlayerModel.getInstance().getPlayerState();
        const equippedWeapon = pm.inventory.find(i => i.uuid === pm.equipped.weapon);
        const equippedArmor = pm.inventory.find(i => i.uuid === pm.equipped.armor);
        
        this.player.maxHp = 10000 + (equippedArmor?.attrValue ?? 0);
        this.player.hp = this.player.maxHp;

        this.onGameLog(`[系统] 关卡 [${mode}] 启动！当前风速: ${windLevelX > 0 ? '右风' : '左风'} ${Math.abs(windLevelX)} 级。`, 'system');

        if (mode === 'PVE_EASY' || mode === 'PVE_NORMAL') {
            const bot = {
                id: 'enemy_1',
                pos: { x: 650, y: 240 }, // 敌人在右侧生成
                dir: { x: -1, y: 0 },
                isBlocking: false,
                stamina: 80,
                maxStamina: 80,
                isInvulnerable: false,
                hp: 10000,
                maxHp: 10000,
                element: 'None',
                elementTime: 0,
                ai: null
            };

            bot.ai = new ArenaBotAI(bot, this.player, 80);
            this.enemies.push(bot);

            this.collectibles.push(
                { x: 250, y: 120, type: 'chest', id: 'col_1', collected: false },
                { x: 550, y: 360, type: 'herb', id: 'col_2', collected: false }
            );
        } else if (mode === 'PVP_1V1') {
            this.player.pos = { x: 400, y: 240 }; // 玩家固定在中心
            const bot = {
                id: 'pvp_bot',
                pos: { x: 680, y: 240 },
                dir: { x: -1, y: 0 },
                isBlocking: false,
                stamina: 100,
                maxStamina: 100,
                isInvulnerable: false,
                hp: 10000,
                maxHp: 10000,
                element: 'None',
                elementTime: 0,
                ai: null
            };
            bot.ai = new ArenaBotAI(bot, this.player, 100);
            this.enemies.push(bot);
        } else if (mode === 'TREASURE') {
            this.collectibles.push(
                { x: 400, y: 240, type: 'chest', id: 'treasure_main', collected: false }
            );
            const bot1 = {
                id: 'treasure_bot1',
                pos: { x: 100, y: 400 },
                dir: { x: 1, y: -1 },
                isBlocking: false,
                stamina: 100,
                maxStamina: 100,
                isInvulnerable: false,
                hp: 10000,
                maxHp: 10000,
                element: 'None',
                elementTime: 0,
                ai: null
            };
            bot1.ai = new ArenaBotAI(bot1, this.player, 80);
            this.enemies.push(bot1);
        } else if (mode === 'PVP_2V2') {
            // 2v2 对战模式下，玩家坐标偏左下方
            this.player.pos = { x: 250, y: 180 };
            
            // 初始化 AI 队友，偏左上方
            this.teammate = {
                id: 'teammate',
                pos: { x: 250, y: 300 },
                dir: { x: 1, y: 0 },
                isBlocking: false,
                stamina: 100,
                maxStamina: 100,
                isInvulnerable: false,
                hp: 10000,
                maxHp: 10000,
                element: 'None',
                elementTime: 0,
                ai: null
            };
            this.teammate.ai = new ArenaBotAI(this.teammate, null, 100);

            // 初始化两个敌方 AI，偏右侧
            const enemy1 = {
                id: 'enemy_1',
                pos: { x: 550, y: 180 },
                dir: { x: -1, y: 0 },
                isBlocking: false,
                stamina: 100,
                maxStamina: 100,
                isInvulnerable: false,
                hp: 10000,
                maxHp: 10000,
                element: 'None',
                elementTime: 0,
                ai: null
            };
            enemy1.ai = new ArenaBotAI(enemy1, null, 100);

            const enemy2 = {
                id: 'enemy_2',
                pos: { x: 550, y: 300 },
                dir: { x: -1, y: 0 },
                isBlocking: false,
                stamina: 100,
                maxStamina: 100,
                isInvulnerable: false,
                hp: 10000,
                maxHp: 10000,
                element: 'None',
                elementTime: 0,
                ai: null
            };
            enemy2.ai = new ArenaBotAI(enemy2, null, 100);

            this.enemies.push(enemy1, enemy2);
        }
    }

    playerFireArrow(angle) {
        if (this.mode === 'IDLE') return;
        const pm = PlayerModel.getInstance().getPlayerState();
        const weapon = pm.inventory.find(i => i.uuid === pm.equipped.weapon);
        
        const critRate = weapon?.critRate ?? 0;
        const isCrit = Math.random() < critRate;

        const arrowConfig = {
            atk: 500 + (weapon?.attrValue ?? 0),
            speed: 400,
            angle: angle,
            element: weapon?.element ?? 'None',
            isCrit: isCrit
        };

        const arrow = new ArrowController();
        arrow.init(this.player.pos.x, this.player.pos.y, arrowConfig, this.windX, this.windY);
        this.arrows.push(arrow);
        
        this.onGameLog(`[战斗] 玩家射出一支箭矢，附着属性: ${arrowConfig.element}${isCrit ? '（触发暴击！）' : ''}`, 'combat');
    }

    playerMeleeSwing() {
        if (this.mode === 'IDLE') return;
        const pm = PlayerModel.getInstance().getPlayerState();
        const weapon = pm.inventory.find(i => i.uuid === pm.equipped.weapon);

        const baseAtk = 500 + (weapon?.attrValue ?? 0);
        const critRate = weapon?.critRate ?? 0;
        const isCrit = Math.random() < critRate;
        
        this.onGameLog(`[战斗] 玩家挥动近战武器斩击！${isCrit ? '（触发暴击！）' : ''}`, 'combat');

        this.enemies.forEach(enemy => {
            let dmg = baseAtk;
            if (isCrit) {
                dmg = Math.floor(dmg * 1.5);
            }
            const res = MeleeCalculs.resolveMelee(
                this.player,
                enemy,
                dmg,
                120, 
                Math.PI / 2 
            );

            if (res.state !== 'miss') {
                this.applyMeleeResult(res, this.player, enemy, '玩家', isCrit);
            }
        });
    }

    applyMeleeResult(res, attacker, target, attackerName, isCrit = false) {
        let finalDmg = res.dmg;
        if (target === this.player) {
            const pm = PlayerModel.getInstance().getPlayerState();
            const equippedArmor = pm.inventory.find(i => i.uuid === pm.equipped.armor);
            const reduceRate = (equippedArmor && equippedArmor.reduceRate !== undefined) ? equippedArmor.reduceRate : 0.02;
            finalDmg = Math.max(1, Math.floor(finalDmg * (1 - reduceRate)));
        }
        if (target.isBlocking && res.state !== 'block') {
            finalDmg = Math.max(1, Math.floor(finalDmg * 0.5));
        }

        if (res.state === 'block') {
            this.sparks.push({ x: (attacker.pos.x + target.pos.x) / 2, y: (attacker.pos.y + target.pos.y) / 2, life: 3 });
            target.stamina = Math.max(0, target.stamina - res.staminaDeduct);
            this.onGameLog(`[战斗] ${attackerName}的近战斩击被格挡，扣除目标体力 ${res.staminaDeduct}`, 'combat');
        } else if (res.state === 'break') {
            target.stamina = 0;
            target.hp = Math.max(0, target.hp - finalDmg);
            this.floatingTexts.push({ x: target.pos.x, y: target.pos.y - 20, text: `破防! -${finalDmg}`, color: '#f1c40f', life: 1.0 });
            this.onGameLog(`[战斗] ${attackerName}斩击破开目标防御！造成伤害 ${finalDmg}`, 'combat');
        } else if (res.state === 'backstab') {
            target.hp = Math.max(0, target.hp - finalDmg);
            this.floatingTexts.push({ x: target.pos.x, y: target.pos.y - 20, text: `背刺! -${finalDmg}`, color: '#ff3333', life: 1.0 });
            this.onGameLog(`[战斗] ${attackerName}完成背刺！对目标造成伤害 ${finalDmg}`, 'combat');
        } else {
            target.hp = Math.max(0, target.hp - finalDmg);
            const text = isCrit ? `暴击! -${finalDmg}` : `-${finalDmg}`;
            const color = isCrit ? '#f39c12' : '#e74c3c';
            this.floatingTexts.push({ x: target.pos.x, y: target.pos.y - 20, text: text, color: color, life: 1.0 });
            this.onGameLog(`[战斗] ${attackerName}命中目标，造成伤害 ${finalDmg}${isCrit ? '（暴击！）' : ''}`, 'combat');
        }
    }

    findClosestOpponent(self, candidateList) {
        let closest = null;
        let minDist = Infinity;
        candidateList.forEach(cand => {
            if (cand && cand.hp > 0) {
                const dx = cand.pos.x - self.pos.x;
                const dy = cand.pos.y - self.pos.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < minDist) {
                    minDist = dist;
                    closest = cand;
                }
            }
        });
        return closest;
    }

    tick(dt, keyboardInput) {
        if (this.mode === 'IDLE') return;

        this.gameTime -= dt;
        if (this.gameTime <= 0) {
            this.onGameLog(`[系统] 关卡倒计时结束。`, 'system');
            this.endLevel('win'); 
            return;
        }

        this.updatePlayerMovement(dt, keyboardInput);
        this.updatePlayerBuffs(dt);

        // 1. 队友 AI 逻辑驱动 (仅在 2V2 模式且存活时)
        if (this.teammate && this.teammate.hp > 0) {
            // 锁敌最近的敌方 AI
            this.teammate.ai.target = this.findClosestOpponent(this.teammate, this.enemies);
            
            this.teammate.ai.tick(dt, () => {
                const target = this.teammate.ai.target;
                if (target && target.hp > 0) {
                    const res = MeleeCalculs.resolveMelee(
                        this.teammate,
                        target,
                        500,
                        100,
                        Math.PI / 2
                    );
                    if (res.state !== 'miss') {
                        this.applyMeleeResult(res, this.teammate, target, '队友');
                        this.checkWinLossConditions();
                    }
                }
            });
        }

        // 2. 敌方 AI 逻辑驱动
        this.enemies.forEach(enemy => {
            if (enemy.hp <= 0) return;
            
            if (enemy.ai) {
                // 敌方目标：玩家或队友，挑选较近的一方
                const targets = [];
                if (this.player.hp > 0) targets.push(this.player);
                if (this.teammate && this.teammate.hp > 0) targets.push(this.teammate);

                enemy.ai.target = this.findClosestOpponent(enemy, targets);

                enemy.ai.tick(dt, () => {
                    const target = enemy.ai.target;
                    if (target && target.hp > 0) {
                        const res = MeleeCalculs.resolveMelee(
                            enemy,
                            target,
                            500, 
                            100,
                            Math.PI / 2
                        );
                        if (res.state !== 'miss') {
                            const attackerLabel = enemy.id === 'enemy_1' ? '敌人(1)' : (enemy.id === 'enemy_2' ? '敌人(2)' : '敌方');
                            this.applyMeleeResult(res, enemy, target, attackerLabel);
                            this.checkWinLossConditions();
                        }
                    }
                });
            }
        });

        this.updateArrows(dt);
        this.updateSparksAndTexts(dt);
        this.checkWinLossConditions();
    }

    updatePlayerMovement(dt, input) {
        this.player.isBlocking = input.block;

        let dx = 0;
        let dy = 0;
        if (input.left) dx = -1;
        if (input.right) dx = 1;
        if (input.up) dy = -1;
        if (input.down) dy = 1;

        if (dx !== 0 || dy !== 0) {
            const len = Math.sqrt(dx * dx + dy * dy);
            this.player.dir = { x: dx / len, y: dy / len };
            
            const speed = (this.player.isBlocking ? 80 : 160) * (this.playerBuffs.speedTime > 0 ? 1.2 : 1.0);
            this.player.pos.x = Math.max(20, Math.min(780, this.player.pos.x + this.player.dir.x * speed * dt));
            this.player.pos.y = Math.max(20, Math.min(460, this.player.pos.y + this.player.dir.y * speed * dt));
        }

        if (!this.player.isBlocking && this.player.stamina < this.player.maxStamina) {
            this.player.stamina = Math.min(this.player.maxStamina, this.player.stamina + 15 * dt);
        }
    }

    updatePlayerBuffs(dt) {
        if (this.playerBuffs.burnTime > 0) {
            this.playerBuffs.burnTime -= dt;
            const burnDmg = Math.floor(this.player.maxHp * 0.03 * dt);
            this.player.hp = Math.max(0, this.player.hp - burnDmg);
        }
        if (this.playerBuffs.regenTime > 0) {
            this.playerBuffs.regenTime -= dt;
            const heal = Math.floor(this.player.maxStamina * 0.03 * dt);
            this.player.stamina = Math.min(this.player.maxStamina, this.player.stamina + heal);
        }
        if (this.playerBuffs.pierceTime > 0) this.playerBuffs.pierceTime -= dt;
        if (this.playerBuffs.speedTime > 0) this.playerBuffs.speedTime -= dt;
    }

    updateArrows(dt) {
        for (let i = this.arrows.length - 1; i >= 0; i--) {
            const arrow = this.arrows[i];
            arrow.updatePhysics(dt);

            const pos = arrow.getPosition();
            if (pos.x < 0 || pos.x > 800 || pos.y < 0 || pos.y > 480) {
                this.arrows.splice(i, 1);
                continue;
            }

            let hitTarget = false;
            for (let e = 0; e < this.enemies.length; e++) {
                const enemy = this.enemies[e];
                if (enemy.hp <= 0) continue;

                const col = arrow.checkCollision(enemy.pos, { isInvulnerable: enemy.isInvulnerable }, enemy.id);
                if (col === 'hit') {
                    const ratio = SpellReaction.getCounterRatio(arrow.element, enemy.element);
                    let baseDmg = arrow.getDamage();
                    if (arrow.isCrit) {
                        baseDmg = Math.floor(baseDmg * 1.5);
                    }
                    const finalDmg = Math.max(1, Math.floor(baseDmg * ratio));

                    enemy.hp = Math.max(0, enemy.hp - finalDmg);
                    const textColor = arrow.isCrit ? '#f39c12' : '#e74c3c';
                    const textContent = arrow.isCrit ? `暴击! -${finalDmg}` : `-${finalDmg}`;
                    this.floatingTexts.push({ x: enemy.pos.x, y: enemy.pos.y - 15, text: textContent, color: textColor, life: 1.0 });

                    const attachRes = SpellReaction.resolveReaction(enemy.element, enemy.elementTime, arrow.element, Date.now() / 1000);
                    enemy.element = attachRes.nextElement;
                    enemy.elementTime = Date.now() / 1000;

                    if (attachRes.result.triggered) {
                        this.floatingTexts.push({ x: enemy.pos.x, y: enemy.pos.y - 35, text: attachRes.result.reactionName, color: '#e67e22', life: 1.2 });
                        if (attachRes.result.immediateDamage > 0) {
                            enemy.hp = Math.max(0, enemy.hp - attachRes.result.immediateDamage);
                        }
                    }

                    hitTarget = true;
                    this.onGameLog(`[战斗] 箭矢命中敌方！造成伤害 ${finalDmg}${arrow.isCrit ? '（暴击！）' : ''}。元素状态: ${enemy.element}`, 'combat');
                    break;
                } else if (col === 'graze') {
                    this.sparks.push({ x: pos.x, y: pos.y, life: 2 });
                    this.floatingTexts.push({ x: enemy.pos.x, y: enemy.pos.y - 15, text: '擦边!', color: '#2ecc71', life: 0.8 });
                    enemy.stamina = Math.max(0, enemy.stamina - 20); 
                    this.onGameLog(`[战斗] 箭矢极限掠过敌方，扣除其体力 20点。`, 'combat');
                }
            }

            if (hitTarget) {
                this.arrows.splice(i, 1);
            }
        }
    }

    updateSparksAndTexts(dt) {
        for (let i = this.sparks.length - 1; i >= 0; i--) {
            this.sparks[i].life -= dt * 10;
            if (this.sparks[i].life <= 0) {
                this.sparks.splice(i, 1);
            }
        }

        for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
            const ft = this.floatingTexts[i];
            ft.life -= dt;
            ft.y -= 25 * dt; 
            if (ft.life <= 0) {
                this.floatingTexts.splice(i, 1);
            }
        }
    }

    checkWinLossConditions() {
        if (this.player.hp <= 0) {
            this.endLevel('lose');
            return;
        }

        const allDead = this.enemies.every(e => e.hp <= 0);
        if (this.enemies.length > 0 && allDead) {
            this.endLevel('win');
        }
    }

    endLevel(result) {
        const pm = PlayerModel.getInstance();
        this.mode = 'IDLE';

        let rewards = {
            gold: 0,
            exp: 0,
            rp: 0
        };

        if (result === 'win') {
            this.onGameLog(`[关卡结算] 恭喜您获胜！`, 'reward');
            pm.addGold(300);
            pm.addExp(50);
            pm.addRankPoints(25);
            rewards = { gold: 300, exp: 50, rp: 25 };
        } else {
            this.onGameLog(`[关卡结算] 您战败了。`, 'system');
            pm.addRankPoints(-15);
            rewards = { gold: 0, exp: 0, rp: -15 };
        }

        this.onGameFinished(result, rewards);
    }
}
