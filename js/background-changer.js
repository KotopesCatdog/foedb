// === СМЕНА ФОНА (только ваши изображения) ===
window.BackgroundChanger = {
    settings: {
        startImmediately: true,    // Менять фон сразу при загрузке
        changeInterval: 30000,     // Менять каждые 30 секунд
        enabled: true
    },
    
    // ✅ Ваш список изображений
    imageSources: [
       'https://foe-help.moy.su/imgdisk/Screenshot_6.png',
        'https://i.imgur.com/0ZNWTnu.png',
        'https://i.imgur.com/B0fqCqO.jpeg',
        'https://i.imgur.com/7g1x175.jpeg',
        'https://i.imgur.com/UinY9uu.jpeg',
        'https://i.imgur.com/X6UF0y3.jpeg',
        'https://i.imgur.com/ry8L0qy.jpeg',
        'https://i.imgur.com/p5zXSvC.jpeg',
        'https://i.imgur.com/a5HSwQs.jpeg',
        'https://i.imgur.com/tX3123R.jpeg',
        'https://i.imgur.com/X0UnHsb.jpeg',
        'https://i.imgur.com/r3tUQfj.jpeg',
        'https://i.imgur.com/ntjNHx3.jpeg',
        'https://i.imgur.com/HiYMg3m.jpeg',
        'https://i.imgur.com/x84HPVL.jpeg',
        'https://i.imgur.com/gHKPM6l.jpeg',
        'https://i.imgur.com/EabRk7O.jpeg',
        'https://i.imgur.com/VkwKURr.jpeg',
        'https://i.imgur.com/SPCfYxQ.jpeg',
        'https://i.imgur.com/rhkbf3E.jpeg',
        'https://i.imgur.com/EpkkL4w.jpeg',
        'https://i.imgur.com/8AYni06.jpeg',
        'https://i.imgur.com/uVzQIAB.jpeg',
        'https://i.imgur.com/SnraLpV.jpeg',
        'https://ru.wiki.forgeofempires.com/images/8/89/FELLOWSHIP_A_Loading_Screen_1.png'
    ],
    
    currentIndex: 0,
    changeInterval: null,
    
    // Инициализация
    init: function() {
        if (!this.settings.enabled) return;
        console.log('🎨 Background Changer: активирован');
        console.log('📸 Доступно изображений:', this.imageSources.length);
        if (this.settings.startImmediately) {
            this.startBackgroundChange();
        }
    },
    
    // Начало смены фона
    startBackgroundChange: function() {
        this.changeBackground();
        this.changeInterval = setInterval(() => {
            this.changeBackground();
        }, this.settings.changeInterval);
        console.log('🔄 Интервал:', this.settings.changeInterval, 'мс');
    },
    
    // Остановка смены фона
    stopBackgroundChange: function() {
        clearInterval(this.changeInterval);
        this.changeInterval = null;
    },
    
    // Смена фона — следующее изображение по кругу
    changeBackground: function() {
        const imageUrl = this.imageSources[this.currentIndex];
        this.currentIndex = (this.currentIndex + 1) % this.imageSources.length;
        
        console.log('🖼️ Загрузка:', imageUrl);
        
        const img = new Image();
        
        img.onload = function() {
            console.log('✅ Фон загружен');
            document.body.style.backgroundImage = 'url("' + imageUrl + '")';
            document.body.style.backgroundSize = 'cover';
            document.body.style.backgroundPosition = 'center';
            document.body.style.backgroundAttachment = 'fixed';
            document.body.style.backgroundRepeat = 'no-repeat';
        };
        
        img.onerror = function() {
            console.warn('⚠️ Не удалось загрузить, пробуем следующее');
            // Пробуем следующее изображение
            window.BackgroundChanger.changeBackground();
        };
        
        // Таймаут на случай зависания
        setTimeout(function() {
            if (!img.complete) {
                console.warn('⏱️ Таймаут загрузки');
                img.onerror();
            }
        }, 10000);
        
        img.src = imageUrl;
    },
    
    // Включить/выключить
    toggle: function(enabled) {
        this.settings.enabled = enabled;
        if (enabled) {
            this.init();
        } else {
            this.stop();
        }
    },
    
    // Полная остановка
    stop: function() {
        this.stopBackgroundChange();
        document.body.style.backgroundImage = '';
        document.body.style.backgroundColor = 'var(--bg-color)';
        console.log('☀️ Оригинальный фон восстановлен');
    }
};

// Автозапуск
document.addEventListener('DOMContentLoaded', function() {
    window.BackgroundChanger.init();
});