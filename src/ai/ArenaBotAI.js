// ArenaBotAI.js

export const AIState = {
    PATROL: 0,
    CHASE: 1,
    ATTACK: 2,
    EVADE: 3
};

export class ArenaBotAI {
    state = AIState.PATROL;
    self = null;
    target = null;

    patrolCenter = { x: 0, y: 0 };
    patrolTimer = 0;
    
    // AI 属性参数
    aggroRange = 300;     // 警戒距离
    attackRange = 100;    // 近战攻击距离
    moveSpeed = 120;      // 移动速度
    
    attackCooldown = 0;

    constructor(self, target, attackRange = 100) {
        this.self = self;
        this.target = target;
        this.patrolCenter = { x: self.pos.x, y: self.pos.y };
        this.attackRange = attackRange;
    }

    tick(dt, onAttackTrigger) {
        if (this.attackCooldown > 0) {
            this.attackCooldown -= dt;
        }

        // 目标安全校验：如果目标为空或已阵亡，AI 自动进入巡逻态并清除格挡
        if (!this.target || this.target.hp <= 0) {
            this.state = AIState.PATROL;
            this.self.isBlocking = false;
            this.updatePatrolBehavior(dt);
            return;
        }

        // 计算目标距离
        const dx = this.target.pos.x - this.self.pos.x;
        const dy = this.target.pos.y - this.self.pos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        switch (this.state) {
            case AIState.PATROL:
                if (dist < this.aggroRange) {
                    this.state = AIState.CHASE;
                } else {
                    this.updatePatrolBehavior(dt);
                }
                break;
            case AIState.CHASE:
                if (dist > 500) {
                    this.state = AIState.PATROL;
                    this.patrolCenter = { x: this.self.pos.x, y: this.self.pos.y };
                } else if (dist <= this.attackRange) {
                    this.state = AIState.ATTACK;
                } else {
                    this.moveToTarget(dx, dy, dt);
                }
                break;
            case AIState.ATTACK:
                if (dist > this.attackRange + 20) {
                    this.state = AIState.CHASE;
                    this.self.isBlocking = false;
                } else {
                    this.executeAttackDecision(onAttackTrigger);
                }
                break;
            case AIState.EVADE:
                this.executeEvadeMovement(dx, dy, dt);
                break;
        }
    }

    updatePatrolBehavior(dt) {
        this.self.isBlocking = false;
        this.patrolTimer += dt;
        if (this.patrolTimer > 3.0) {
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * 80;
            
            const targetX = this.patrolCenter.x + Math.cos(angle) * dist;
            const targetY = this.patrolCenter.y + Math.sin(angle) * dist;
            
            const dx = targetX - this.self.pos.x;
            const dy = targetY - this.self.pos.y;
            const len = Math.sqrt(dx * dx + dy * dy);
            if (len > 0) {
                this.self.dir = { x: dx / len, y: dy / len };
                this.self.pos.x = targetX;
                this.self.pos.y = targetY;
            }
            this.patrolTimer = 0;
        }
    }

    moveToTarget(dx, dy, dt) {
        this.self.isBlocking = false;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0) {
            this.self.dir = { x: dx / dist, y: dy / dist };
            this.self.pos.x += this.self.dir.x * this.moveSpeed * dt;
            this.self.pos.y += this.self.dir.y * this.moveSpeed * dt;
        }
    }

    executeAttackDecision(onAttackTrigger) {
        if (this.attackCooldown <= 0) {
            if (Math.random() < 0.3) {
                this.self.isBlocking = true;
                this.attackCooldown = 1.0; 
            } else {
                this.self.isBlocking = false;
                onAttackTrigger();
                this.attackCooldown = 1.5; 
            }
        }
    }

    executeEvadeMovement(dx, dy, dt) {
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0) {
            const escapeDir = { x: -dx / dist, y: -dy / dist };
            this.self.pos.x += escapeDir.x * 160 * dt;
            this.self.pos.y += escapeDir.y * 160 * dt;
        }
        
        if (dist > 250) {
            this.state = AIState.CHASE;
        }
    }
}
