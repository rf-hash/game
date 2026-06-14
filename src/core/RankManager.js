// RankManager.js

export class RankManager {
    
    /**
     * 计算天梯积分变动
     * @param isWin 是否胜利
     * @param currentRp 玩家当前RP
     * @param playerLevel 玩家系统等级
     * @param botLevel AI系统等级
     * @returns 积分增量
     */
    static calculateRpChange(
        isWin,
        currentRp,
        playerLevel,
        botLevel
    ) {
        if (isWin) {
            const deltaL = botLevel - playerLevel;
            return Math.max(10, Math.min(35, 20 + deltaL * 2));
        } else {
            // 青铜段位保护 (青铜 Ⅰ-Ⅲ 范围为 0 到 900)
            if (currentRp < 900) {
                return 0;
            }
            return -50; // 战败固定扣除 50 积分
        }
    }

    /**
     * 获取积分对应的段位文本
     */
    static getRankName(rp) {
        if (rp < 0) rp = 0;
        const ROMAN = ["", "Ⅰ", "Ⅱ", "Ⅲ", "Ⅳ", "Ⅴ", "Ⅵ", "Ⅶ"];
        const RANKS = [
            { name: "青铜", tiers: 3 },
            { name: "白银", tiers: 4 },
            { name: "黄金", tiers: 4 },
            { name: "钻石", tiers: 5 },
            { name: "星耀", tiers: 5 },
            { name: "王者", tiers: 6 },
            { name: "大师", tiers: 6 },
            { name: "传奇", tiers: 7 },
            { name: "精英", tiers: 7 }
        ];

        let accumulatedRp = 0;
        for (const rank of RANKS) {
            const rankTotalRp = rank.tiers * 300;
            if (rp < accumulatedRp + rankTotalRp) {
                const tierIndex = Math.floor((rp - accumulatedRp) / 300) + 1;
                return `${rank.name} ${ROMAN[tierIndex]}`;
            }
            accumulatedRp += rankTotalRp;
        }
        return `精英 Ⅶ`;
    }

    /**
     * 获取积分对应的 47 层具体小段位索引 (1-based)
     */
    static getTierIndex(rp) {
        if (rp < 0) rp = 0;
        const RANKS = [
            { name: "青铜", tiers: 3 },
            { name: "白银", tiers: 4 },
            { name: "黄金", tiers: 4 },
            { name: "钻石", tiers: 5 },
            { name: "星耀", tiers: 5 },
            { name: "王者", tiers: 6 },
            { name: "大师", tiers: 6 },
            { name: "传奇", tiers: 7 },
            { name: "精英", tiers: 7 }
        ];

        let accumulatedRp = 0;
        let tierOffset = 0;
        for (const rank of RANKS) {
            const rankTotalRp = rank.tiers * 300;
            if (rp < accumulatedRp + rankTotalRp) {
                const tierInRank = Math.floor((rp - accumulatedRp) / 300);
                return tierOffset + tierInRank + 1;
            }
            accumulatedRp += rankTotalRp;
            tierOffset += rank.tiers;
        }
        return 47; // 最高段位 精英 Ⅶ
    }

    /**
     * 执行赛季结算重置
     * @param oldRp 老积分
     * @returns 继承后的新积分及奖励物品
     */
    static settleSeason(oldRp) {
        const t = this.getTierIndex(oldRp);
        const ratio = (t - 1) / 46;

        // 根据段位索引平滑缩放奖励
        // 青铜 Ⅰ (t=1): 500金币、2 钻石、0 元宝
        // 精英 Ⅶ (t=47): 50,000金币、2,000 钻石、50 元宝
        const rewardGold = Math.round(500 + 49500 * Math.pow(ratio, 1.5));
        const rewardDiamond = Math.round(2 + 1998 * Math.pow(ratio, 1.5));
        const rewardYuanbao = Math.round(50 * Math.pow(ratio, 2.0));

        const newRp = 0; // 重置后回到青铜 Ⅰ，0rp

        return { newRp, rewardGold, rewardDiamond, rewardYuanbao };
    }
}
