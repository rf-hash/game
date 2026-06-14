// PlayerModel.js
import { SaveManager } from '../core/SaveManager.js?v=2';

export class PlayerModel {
    static _instance = null;
    state = null;
    listeners = {};

    static getInstance() {
        if (!this._instance) {
            this._instance = new PlayerModel();
            this._instance.load();
        }
        return this._instance;
    }

    load() {
        this.state = SaveManager.loadGame();
    }

    getPlayerState() {
        return this.state;
    }

    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    emit(event, ...args) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(cb => cb(...args));
        }
    }

    addGold(amount) {
        this.state.gold += amount;
        this.emit('goldChanged', this.state.gold);
        this.save();
    }

    deductGold(amount) {
        if (this.state.gold < amount) return false;
        this.state.gold -= amount;
        this.emit('goldChanged', this.state.gold);
        this.save();
        return true;
    }

    addDiamonds(amount) {
        this.state.diamonds += amount;
        this.emit('diamondsChanged', this.state.diamonds);
        this.save();
    }

    addYuanbao(amount) {
        this.state.yuanbao += amount;
        this.emit('yuanbaoChanged', this.state.yuanbao);
        this.save();
    }

    addExp(amount) {
        this.state.exp += amount;
        let levelUp = false;
        
        while (true) {
            const needed = this.getXpNeeded(this.state.level);
            if (this.state.exp >= needed) {
                this.state.exp -= needed;
                this.state.level++;
                levelUp = true;
                
                this.state.gold += this.state.level * 50;
                
                if (this.state.level % 10 === 0) {
                    this.state.diamonds += this.state.level * 0.5;
                }
            } else {
                break;
            }
        }

        this.emit('expChanged', this.state.exp, this.state.level);
        this.emit('goldChanged', this.state.gold);
        this.emit('diamondsChanged', this.state.diamonds);
        this.save();

        return { xpAdded: amount, levelUp };
    }

    getXpNeeded(lvl) {
        return Math.floor(100 * Math.pow(lvl, 1.35) + 50 * lvl);
    }

    addRankPoints(amount) {
        this.state.rankPoints = Math.max(0, this.state.rankPoints + amount);
        this.emit('rpChanged', this.state.rankPoints);
        this.save();
    }

    /**
     * 移动物品到仓库
     */
    moveItemToWarehouse(uuid) {
        const index = this.state.inventory.findIndex(item => item.uuid === uuid);
        if (index === -1) return false;

        const item = this.state.inventory[index];
        // 穿着中的装备不能存仓库
        if (this.state.equipped.weapon === uuid || this.state.equipped.armor === uuid) {
            return false;
        }

        this.state.inventory.splice(index, 1);
        if (!this.state.warehouse) this.state.warehouse = [];
        this.state.warehouse.push(item);

        this.emit('inventoryChanged', this.state.inventory);
        this.emit('warehouseChanged', this.state.warehouse);
        this.save();
        return true;
    }

    /**
     * 从仓库取出物品到背包
     */
    moveItemToInventory(uuid) {
        if (!this.state.warehouse) this.state.warehouse = [];
        const index = this.state.warehouse.findIndex(item => item.uuid === uuid);
        if (index === -1) return false;
        if (this.state.inventory.length >= 40) return false; // 背包容量上限

        const item = this.state.warehouse[index];
        this.state.warehouse.splice(index, 1);
        this.state.inventory.push(item);

        this.emit('inventoryChanged', this.state.inventory);
        this.emit('warehouseChanged', this.state.warehouse);
        this.save();
        return true;
    }

    buyItem(config) {
        if (config.type === 'sellable') {
            const FOOD_IDS = [
                's_lamb_kebab', 's_steak', 's_grilled_fish', 's_grilled_chicken_leg',
                's_mushroom', 's_porcini', 's_willow_fruit', 's_watermelon',
                's_apple', 's_blackberry', 's_pork_chop', 's_fresh_water', 's_bad_duck_feet'
            ];
            if (!FOOD_IDS.includes(config.id)) {
                return false;
            }
        }

        const currency = config.priceType === 'diamonds' ? 'diamonds' : 'gold';
        if (this.state[currency] < config.price) return false;
        if (this.state.inventory.length >= 40) return false;

        this.state[currency] -= config.price;
        const newItem = {
            id: config.id,
            uuid: 'item_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
            name: config.name,
            type: config.type,
            quality: config.quality,
            quantity: 1,
            sellPrice: config.priceType === 'diamonds' ? Math.floor(config.price * 10 * 0.75) : Math.floor(config.price * 0.75),
            attrValue: config.attrValue ?? 0,
            reduceRate: config.reduceRate ?? 0,
            critRate: config.critRate ?? 0,
            element: config.element ?? 'None',
            effect: config.effect ?? '/'
        };

        this.state.inventory.push(newItem);
        
        if (currency === 'diamonds') {
            this.emit('diamondsChanged', this.state.diamonds);
        } else {
            this.emit('goldChanged', this.state.gold);
        }
        this.emit('inventoryChanged', this.state.inventory);
        this.save();
        return true;
    }

    sellItem(uuid) {
        const index = this.state.inventory.findIndex(item => item.uuid === uuid);
        if (index === -1) return false;

        const item = this.state.inventory[index];
        if (this.state.equipped.weapon === uuid || this.state.equipped.armor === uuid) {
            return false;
        }

        this.state.gold += item.sellPrice;
        this.state.inventory.splice(index, 1);

        this.emit('goldChanged', this.state.gold);
        this.emit('inventoryChanged', this.state.inventory);
        this.save();
        return true;
    }

    equipItem(uuid) {
        const item = this.state.inventory.find(i => i.uuid === uuid);
        if (!item) return false;

        if (item.type === 'weapon') {
            if (this.state.equipped.weapon === uuid) {
                this.state.equipped.weapon = null;
            } else {
                this.state.equipped.weapon = uuid;
            }
        } else if (item.type === 'armor') {
            if (this.state.equipped.armor === uuid) {
                this.state.equipped.armor = null;
            } else {
                this.state.equipped.armor = uuid;
            }
        } else if (item.type === 'potion') {
            return false;
        }

        this.emit('equipChanged', this.state.equipped);
        this.save();
        return true;
    }

    consumePotion(id) {
        const idx = this.state.inventory.findIndex(item => item.id === id && item.type === 'potion');
        if (idx === -1) return false;

        this.state.inventory.splice(idx, 1);
        this.emit('inventoryChanged', this.state.inventory);
        this.save();
        return true;
    }

    resetSeason(newRp, rewardGold, rewardDiamond, rewardYuanbao) {
        this.state.rankPoints = newRp;
        this.state.gold += rewardGold;
        this.state.diamonds += rewardDiamond;
        this.state.yuanbao += rewardYuanbao;

        this.emit('rpChanged', this.state.rankPoints);
        this.emit('goldChanged', this.state.gold);
        this.emit('diamondsChanged', this.state.diamonds);
        this.emit('yuanbaoChanged', this.state.yuanbao);
        this.save();
    }

    save() {
        SaveManager.saveGame(this.state);
    }
}
