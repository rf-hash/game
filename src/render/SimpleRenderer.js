// SimpleRenderer.js

export class SimpleRenderer {
    canvas = null;
    ctx = null;
    engine = null;

    flashWhiteRegistry = {};

    constructor(canvas, engine) {
        this.canvas = canvas;
        const context = canvas.getContext('2d');
        if (!context) throw new Error('无法初始化 Canvas 2D 上下文');
        this.ctx = context;
        this.engine = engine;
    }

    triggerFlashWhite(id, duration = 0.1) {
        this.flashWhiteRegistry[id] = duration;
    }

    updateFlashRegistry(dt) {
        for (const key in this.flashWhiteRegistry) {
            if (this.flashWhiteRegistry[key] > 0) {
                this.flashWhiteRegistry[key] -= dt;
            }
        }
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 1. 绘制网格线背景
        this.drawGridBackground();

        // 2. 绘制采集物
        this.engine.collectibles.forEach(col => {
            if (col.collected) return;
            this.ctx.fillStyle = col.type === 'chest' ? '#e67e22' : '#2ecc71';
            this.ctx.beginPath();
            this.ctx.rect(col.x - 12, col.y - 12, 24, 24);
            this.ctx.fill();
            this.ctx.strokeStyle = '#fff';
            this.ctx.stroke();
        });

        // 3. 绘制敌人
        this.engine.enemies.forEach(enemy => {
            if (enemy.hp <= 0) return;

            const isFlashing = (this.flashWhiteRegistry[enemy.id] ?? 0) > 0;
            this.drawCharacter(enemy.pos, enemy.dir, enemy.isBlocking, isFlashing ? '#ffffff' : '#e74c3c');
            
            this.drawHpBar(enemy.pos.x, enemy.pos.y - 35, enemy.hp, enemy.maxHp, enemy.stamina, enemy.maxStamina, enemy.element);

            // 绘制敌方文字标签
            this.ctx.fillStyle = '#e74c3c';
            this.ctx.font = 'bold 10px sans-serif';
            this.ctx.textAlign = 'center';
            const label = enemy.id === 'enemy_1' ? '敌1' : (enemy.id === 'enemy_2' ? '敌2' : '敌人');
            this.ctx.fillText(label, enemy.pos.x, enemy.pos.y - 50);
        });

        // 3.5 绘制队友 (2V2 模式)
        if (this.engine.teammate && this.engine.teammate.hp > 0) {
            const tm = this.engine.teammate;
            const isFlashing = (this.flashWhiteRegistry['teammate'] ?? 0) > 0;
            this.drawCharacter(tm.pos, tm.dir, tm.isBlocking, isFlashing ? '#ffffff' : '#2ecc71');
            
            this.drawHpBar(tm.pos.x, tm.pos.y - 35, tm.hp, tm.maxHp, tm.stamina, tm.maxStamina, tm.element);

            // 绘制队友文字标签
            this.ctx.fillStyle = '#2ecc71';
            this.ctx.font = 'bold 10px sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('队友', tm.pos.x, tm.pos.y - 50);
        }

        // 4. 绘制玩家自身
        if (this.engine.player.hp > 0) {
            const isFlashing = (this.flashWhiteRegistry['player'] ?? 0) > 0;
            this.drawCharacter(
                this.engine.player.pos,
                this.engine.player.dir,
                this.engine.player.isBlocking,
                isFlashing ? '#ffffff' : '#3498db'
            );
            this.drawHpBar(
                this.engine.player.pos.x,
                this.engine.player.pos.y - 35,
                this.engine.player.hp,
                this.engine.player.maxHp,
                this.engine.player.stamina,
                this.engine.player.maxStamina,
                this.engine.player.element
            );

            // 绘制玩家文字标签
            this.ctx.fillStyle = '#3498db';
            this.ctx.font = 'bold 10px sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('我', this.engine.player.pos.x, this.engine.player.pos.y - 50);
        }

        // 5. 绘制箭矢
        this.engine.arrows.forEach(arrow => {
            if (arrow.isDead) return;
            const pos = arrow.getPosition();
            const vel = arrow.getVelocity();
            const speed = Math.sqrt(vel.vx * vel.vx + vel.vy * vel.vy);

            this.ctx.strokeStyle = arrow.element === 'Water' ? '#3498db' : (arrow.element === 'Gold' ? '#f1c40f' : '#ffffff');
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.moveTo(pos.x, pos.y);
            this.ctx.lineTo(pos.x - (vel.vx / speed) * 15, pos.y - (vel.vy / speed) * 15);
            this.ctx.stroke();
        });

        // 6. 绘制擦边/格挡火星
        this.ctx.lineWidth = 2;
        this.engine.sparks.forEach(spark => {
            const radius = (3 - spark.life) * 8; 
            this.ctx.strokeStyle = '#e67e22';
            this.ctx.beginPath();
            this.ctx.arc(spark.x, spark.y, radius, 0, Math.PI * 2);
            this.ctx.stroke();
        });

        // 7. 绘制漂浮飘字
        this.ctx.textAlign = 'center';
        this.ctx.font = 'bold 14px Arial';
        this.engine.floatingTexts.forEach(ft => {
            this.ctx.fillStyle = ft.color;
            this.ctx.fillText(ft.text, ft.x, ft.y);
        });
    }

    drawGridBackground() {
        this.ctx.fillStyle = '#221815'; // 土壤深红褐色
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 将土地划分为10个区块 (2行 5列)
        const cols = 5;
        const rows = 2;
        const cellW = this.canvas.width / cols;
        const cellH = this.canvas.height / rows;

        this.ctx.strokeStyle = '#2d201c'; // 分界线，稍微亮一点的褐色
        this.ctx.lineWidth = 4;
        
        // 绘制列分界线
        for (let i = 1; i < cols; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * cellW, 0);
            this.ctx.lineTo(i * cellW, this.canvas.height);
            this.ctx.stroke();
        }
        // 绘制行分界线
        for (let j = 1; j < rows; j++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, j * cellH);
            this.ctx.lineTo(this.canvas.width, j * cellH);
            this.ctx.stroke();
        }

        // 地块点缀，突出土地质感
        this.ctx.fillStyle = '#1c1311';
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                // 在每个地块中绘制几个散乱小点
                this.ctx.fillRect(i * cellW + 20, j * cellH + 20, 6, 6);
                this.ctx.fillRect(i * cellW + cellW - 30, j * cellH + cellH - 30, 4, 4);
                this.ctx.fillRect(i * cellW + cellW / 2, j * cellH + cellH / 2 - 10, 5, 3);
            }
        }
    }

    drawCharacter(pos, dir, isBlocking, color) {
        const size = 36; // 方块人大小
        
        // 1. 绘制方块身体
        this.ctx.fillStyle = color;
        this.ctx.fillRect(pos.x - size / 2, pos.y - size / 2, size, size);
        
        // 2. 绘制深色轮廓边框
        this.ctx.strokeStyle = '#1a1a1c';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(pos.x - size / 2, pos.y - size / 2, size, size);

        // 3. 绘制脸部朝向眼睛 (方块眼)
        this.ctx.save();
        this.ctx.translate(pos.x, pos.y);
        const angle = Math.atan2(dir.y, dir.x);
        this.ctx.rotate(angle);
        
        // 绘制白眼眶
        this.ctx.fillStyle = '#ffffff';
        const eyeSize = 6;
        const eyeOffset = 6;
        this.ctx.fillRect(eyeOffset, -8, eyeSize, eyeSize);
        this.ctx.fillRect(eyeOffset, 2, eyeSize, eyeSize);
        // 绘制黑眼珠
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(eyeOffset + 2, -7, 3, 3);
        this.ctx.fillRect(eyeOffset + 2, 3, 3, 3);
        
        this.ctx.restore();

        // 4. 绘制武器指向线
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(pos.x, pos.y);
        this.ctx.lineTo(pos.x + dir.x * 25, pos.y + dir.y * 25);
        this.ctx.stroke();

        // 5. 绘制格挡护盾弧
        if (isBlocking) {
            this.ctx.strokeStyle = '#f1c40f';
            this.ctx.lineWidth = 4;
            this.ctx.beginPath();
            const centerAngle = Math.atan2(dir.y, dir.x);
            this.ctx.arc(pos.x, pos.y, 25, centerAngle - Math.PI / 3, centerAngle + Math.PI / 3);
            this.ctx.stroke();
        }
    }

    drawHpBar(x, y, hp, maxHp, stamina, maxStamina, element) {
        const barW = 50;
        const barH = 5;

        this.ctx.fillStyle = '#222';
        this.ctx.fillRect(x - barW / 2, y, barW, barH);
        const hpPercent = Math.max(0, hp / maxHp);
        this.ctx.fillStyle = '#e74c3c';
        this.ctx.fillRect(x - barW / 2, y, barW * hpPercent, barH);

        this.ctx.fillStyle = '#222';
        this.ctx.fillRect(x - barW / 2, y + 6, barW, 4);
        const staminaPercent = Math.max(0, stamina / maxStamina);
        this.ctx.fillStyle = '#2ecc71';
        this.ctx.fillRect(x - barW / 2, y + 6, barW * staminaPercent, 4);

        if (element !== 'None') {
            this.ctx.font = 'bold 9px monospace';
            this.ctx.fillStyle = element === 'Water' ? '#3498db' : (element === 'Fire' ? '#e67e22' : '#f1c40f');
            this.ctx.fillText(element, x, y - 4);
        }
    }
}
