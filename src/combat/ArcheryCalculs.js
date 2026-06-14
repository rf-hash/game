// ArcheryCalculs.js

export class ArrowController {
    x = 0;
    y = 0;
    vx = 0;
    vy = 0;
    g = 300;     // 重力加速度 px/s^2
    wx = 0;      // 风力 x
    wy = 0;      // 风力 y
    
    startPos = { x: 0, y: 0 };
    atk = 10;
    element = 'None';
    isCrit = false;
    isDead = false;

    // 初始化箭矢
    init(x0, y0, config, windX, windY) {
        this.x = x0;
        this.y = y0;
        this.startPos = { x: x0, y: y0 };
        this.vx = config.speed * Math.cos(config.angle);
        this.vy = config.speed * Math.sin(config.angle);
        this.atk = config.atk;
        this.element = config.element;
        this.isCrit = config.isCrit ?? false;
        this.wx = windX;
        this.wy = windY;
        this.isDead = false;
        this.grazedTargets = [];
        this.closestDistances = {};
        this.lastDistances = {};
        this.initialDistances = {};
    }

    // 每帧物理更新
    updatePhysics(dt) {
        if (this.isDead) return;
        
        // 速度更新 (考虑重力与风力)
        this.vx += this.wx * dt;
        this.vy += (this.wy - this.g) * dt;

        // 位移更新
        this.x += this.vx * dt;
        this.y += this.vy * dt;
    }

    // 碰撞检测逻辑
    checkCollision(rolePos, roleState, roleId) {
        if (this.isDead) return 'none';

        const dx = this.x - rolePos.x;
        const dy = this.y - rolePos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const R_hit = 25;
        const R_graze = 45;

        if (roleState.isInvulnerable) {
            if (dist <= R_graze) {
                return 'dodge';
            }
            return 'none';
        }

        if (!this.closestDistances) this.closestDistances = {};
        if (!this.lastDistances) this.lastDistances = {};
        if (!this.initialDistances) this.initialDistances = {};
        if (!this.grazedTargets) this.grazedTargets = [];

        if (roleId !== undefined) {
            if (this.initialDistances[roleId] === undefined) {
                this.initialDistances[roleId] = dist;
            }

            const prevDist = this.lastDistances[roleId] ?? Infinity;
            this.lastDistances[roleId] = dist;

            if (dist < (this.closestDistances[roleId] ?? Infinity)) {
                this.closestDistances[roleId] = dist;
            }

            if (dist <= R_hit) {
                this.isDead = true; 
                return 'hit';
            }

            // 只有在远离目标、且曾经靠近过该目标、且最近距离在擦边范围内时，才触发擦边
            if (dist > prevDist) {
                const minD = this.closestDistances[roleId];
                const initD = this.initialDistances[roleId];
                if (minD > R_hit && minD <= R_graze && minD < initD && !this.grazedTargets.includes(roleId)) {
                    this.grazedTargets.push(roleId);
                    return 'graze';
                }
            }
        } else {
            // 回退逻辑 (若未传入 roleId)
            if (dist <= R_hit) {
                this.isDead = true;
                return 'hit';
            } else if (dist <= R_graze) {
                return 'graze';
            }
        }

        return 'none';
    }

    // 计算直线位移距离衰减后的最终面板伤害 (防御结算前)
    getDamage() {
        const dx = this.x - this.startPos.x;
        const dy = this.y - this.startPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        const alpha = 0.000875;
        const kDist = Math.max(0.3, 1.0 - alpha * distance);
        return Math.floor(this.atk * kDist);
    }

    getPosition() {
        return { x: this.x, y: this.y };
    }

    getVelocity() {
        return { vx: this.vx, vy: this.vy };
    }
}
