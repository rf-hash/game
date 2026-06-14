// MeleeCalculs.js

export class MeleeCalculs {
    
    /**
     * 近战伤害与判定结算
     * @param attacker 攻击者状态
     * @param target 目标状态
     * @param baseAtk 攻击基础伤害
     * @param rAttack 攻击扇形半径
     * @param thetaAttack 攻击扇形角度 (弧度值)
     * @returns 结算结果: dmg伤害, state命中类型('miss'|'hit'|'block'|'backstab'|'break')
     */
    static resolveMelee(
        attacker,
        target,
        baseAtk,
        rAttack,
        thetaAttack
    ) {
        
        // 1. 无敌判定
        if (target.isInvulnerable) {
            return { dmg: 0, state: 'miss', staminaDeduct: 0 };
        }

        // 2. 距离计算
        const dx = target.pos.x - attacker.pos.x;
        const dy = target.pos.y - attacker.pos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > rAttack) {
            return { dmg: 0, state: 'miss', staminaDeduct: 0 };
        }

        // 3. 扇形角度判定
        const dirToTarget = { x: dx / distance, y: dy / distance };
        const cosPhi = dirToTarget.x * attacker.dir.x + dirToTarget.y * attacker.dir.y;
        const cosHalfSector = Math.cos(thetaAttack / 2);

        if (cosPhi < cosHalfSector) {
            return { dmg: 0, state: 'miss', staminaDeduct: 0 };
        }

        // 4. 背刺判定 (双方同向，点积 > 0.5)
        const cosBackstab = attacker.dir.x * target.dir.x + attacker.dir.y * target.dir.y;
        if (cosBackstab > 0.5) {
            const finalDmg = Math.floor(baseAtk * 1.5);
            return { dmg: finalDmg, state: 'backstab', staminaDeduct: 0 };
        }

        // 5. 格挡判定 (目标处于格挡态 且 双方相向，点积 < -0.5)
        if (target.isBlocking) {
            const cosBlock = attacker.dir.x * target.dir.x + attacker.dir.y * target.dir.y;
            if (cosBlock < -0.5) {
                const staminaCost = Math.floor(baseAtk * 0.7);
                const targetStaminaLeft = target.stamina - staminaCost;

                if (targetStaminaLeft <= 0) {
                    return { 
                        dmg: baseAtk, 
                        state: 'break', 
                        staminaDeduct: target.stamina 
                    };
                } else {
                    return { dmg: 0, state: 'block', staminaDeduct: staminaCost };
                }
            }
        }

        // 6. 普通命中
        return { dmg: baseAtk, state: 'hit', staminaDeduct: 0 };
    }
}
