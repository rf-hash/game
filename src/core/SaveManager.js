// SaveManager.js

export class SaveManager {
    static SAVE_KEY = '__death_place_state_v2__';
    static XOR_KEY = 0x5A; // 异或密钥，防普通修改

    /**
     * 默认初始化玩家数据
     */
    static createDefaultState() {
        return {
            level: 1,
            exp: 0,
            gold: 2000, 
            diamonds: 100,
            yuanbao: 100,
            rankPoints: 0,
            inventory: [
                { id: 'w_wood_bow', uuid: 'w_init_1', name: '粗制木弓', type: 'weapon', quality: 'C', quantity: 1, sellPrice: 250, attrValue: 100 },
                { id: 'a_cloth_coat', uuid: 'a_init_1', name: '麻布粗衣', type: 'armor', quality: 'C', quantity: 1, sellPrice: 150, attrValue: 1000 }
            ],
            equipped: {
                weapon: 'w_init_1',
                armor: 'a_init_1'
            },
            warehouse: []
        };
    }

    /**
     * 加载玩家存档
     */
    static loadGame() {
        try {
            const rawData = localStorage.getItem(this.SAVE_KEY);
            if (!rawData) {
                const defaultState = this.createDefaultState();
                this.saveGame(defaultState);
                return defaultState;
            }

            // 1. Base64 解码为二进制字符串
            const binary = atob(rawData);
            // 2. XOR 还原并放入 Uint8Array
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) {
                bytes[i] = binary.charCodeAt(i) ^ this.XOR_KEY;
            }
            // 3. UTF-8 解码为 JSON 字符串
            const decoder = new TextDecoder();
            const jsonStr = decoder.decode(bytes);
            
            const state = JSON.parse(jsonStr);
            if (!state.inventory) state.inventory = [];
            if (!state.warehouse) state.warehouse = [];
            if (!state.equipped) state.equipped = { weapon: null, armor: null };
            
            return state;
        } catch (e) {
            console.error('读取存档损坏，重置默认存档:', e);
            const defaultState = this.createDefaultState();
            this.saveGame(defaultState);
            return defaultState;
        }
    }

    /**
     * 保存玩家存档
     */
    static saveGame(state) {
        try {
            const jsonStr = JSON.stringify(state);
            // 1. UTF-8 编码为字节数组
            const encoder = new TextEncoder();
            const bytes = encoder.encode(jsonStr);
            // 2. XOR 混淆
            for (let i = 0; i < bytes.length; i++) {
                bytes[i] ^= this.XOR_KEY;
            }
            // 3. 转换为二进制字符串并进行 Base64 编码
            let binary = '';
            for (let i = 0; i < bytes.length; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            const base64Str = btoa(binary);
            localStorage.setItem(this.SAVE_KEY, base64Str);
        } catch (e) {
            console.error('存档保存失败:', e);
        }
    }
}
