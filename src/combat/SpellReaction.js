// SpellReaction.js

export class SpellReaction {
    static counterMatrix = {
        'None':  { 'None': 1.0, 'Gold': 1.0, 'Wood': 1.0, 'Water': 1.0, 'Fire': 1.0, 'Earth': 1.0 },
        'Gold':  { 'None': 1.0, 'Gold': 1.0, 'Wood': 1.5, 'Water': 1.0, 'Fire': 0.5, 'Earth': 1.0 }, // 金克木
        'Wood':  { 'None': 1.0, 'Gold': 1.0, 'Wood': 1.0, 'Water': 1.0, 'Fire': 0.5, 'Earth': 1.5 }, // 木克土
        'Water': { 'None': 1.0, 'Gold': 1.0, 'Wood': 1.0, 'Water': 1.0, 'Fire': 1.5, 'Earth': 0.5 }, // 水克火
        'Fire':  { 'None': 1.0, 'Gold': 1.5, 'Wood': 1.0, 'Water': 0.5, 'Fire': 1.0, 'Earth': 1.0 }, // 火克金
        'Earth': { 'None': 1.0, 'Gold': 1.0, 'Wood': 0.5, 'Water': 1.5, 'Fire': 1.0, 'Earth': 1.0 }  // 土克水
    };

    /**
     * 获取五行相克加成系数
     */
    static getCounterRatio(atkEl, targetEl) {
        return this.counterMatrix[atkEl]?.[targetEl] ?? 1.0;
    }

    /**
     * 结算反应
     */
    static resolveReaction(
        currentEl,
        attachTimeSec,
        newEl,
        currentTimeSec
    ) {
        const result = {
            triggered: false,
            reactionName: 'None',
            immediateDamage: 0,
            buffType: 'None',
            buffDuration: 0
        };

        if (newEl === 'None') {
            return { result, nextElement: currentEl };
        }

        // 超过5秒视为附着失效
        const isExpired = (currentTimeSec - attachTimeSec) > 5.0 || currentEl === 'None';
        if (isExpired) {
            return { result, nextElement: newEl };
        }

        const pair = [currentEl, newEl].sort().join('+');
        switch (pair) {
            case 'Water+Wood': // 滋生
                result.triggered = true;
                result.reactionName = '滋生 (Rejuvenate)';
                result.buffType = 'stamina_regen';
                result.buffDuration = 3.0;
                break;
            case 'Fire+Wood':  // 助燃
                result.triggered = true;
                result.reactionName = '助燃 (Combustion)';
                result.immediateDamage = 1500; // 1500点真伤
                result.buffType = 'burn_dot';
                result.buffDuration = 3.0;
                break;
            case 'Earth+Fire': // 结晶
                result.triggered = true;
                result.reactionName = '结晶 (Crystallize)';
                result.buffType = 'shield_crystallize';
                result.buffDuration = 5.0;
                break;
            case 'Earth+Gold': // 强固
                result.triggered = true;
                result.reactionName = '强固 (Reinforce)';
                result.buffType = 'pierce_armor';
                result.buffDuration = 6.0;
                break;
            case 'Gold+Water': // 淬体
                result.triggered = true;
                result.reactionName = '淬体 (Tempering)';
                result.buffType = 'speed_and_cleanse';
                result.buffDuration = 5.0;
                break;
            default:
                return { result, nextElement: newEl };
        }

        return { result, nextElement: 'None' };
    }
}
