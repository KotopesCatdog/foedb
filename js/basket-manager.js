// === ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ КОРЗИНЫ ===
let basket = [];
let basketEra = 'SpaceAgeSpaceHub';
let basketSort = { column: null, direction: 'asc' };
let basketConfig = window.DEFAULT_BASKET_CONFIG || {
    settings: { maxBasketSize: 30, longPressDuration: 1000 }
};
let showPerTile = false;
let columnOrder = []; // Храним порядок колонок

// === НАСТРОЙКА НАЗВАНИЙ КОЛОНОК (редактируйте здесь) ===
const CUSTOM_COLUMN_NAMES = {
    // Статические колонки
    'action': '✕',
    'name': 'Название',
    'size': 'Размер',
    'population': 'Население',
    'population_per_tile': 'Нас./кл',
    'happiness': 'Счастье',
    'happiness_per_tile': 'Счастье/кл',
    'guild_raids': 'Кванты',
    'all': 'Все',
    'rogue': 'Разбои',

    // Ресурсы (Production)
    'prod:strategy_points': '⚡ СО',
    'prod:money': '💰 Монеты',
    'prod:supplies': '🔨 Молотки',
    'prod:goods': '📦 Товары',
    'prod:medals': '🏅 Медали',
    'prod:clan_power': '🤝 Сила Гильдии',
    'prod:previous_age': '⏪ Товары прошлой эпохи',
    'prod:next_age': '⏩ Товары след. эпохи',
    'prod:all_goods_of_age': '📦 Товары своей эпохи',
    'prod:random_good_of_age': '📦 Товары своей эпохи',
    'prod:rogue': 'Разбои',

    // Квантовые параметры (guild_raids boosts)
    'boost:guild_raids_action_points_collection|all': 'Recharge',
    'boost:guild_raids_action_points_capacity|all': 'Capacity',
    'boost:guild_raids_coins_production|all': 'Буст монет %',
    'boost:guild_raids_coins_start|all': 'Стартовые монеты',
    'boost:guild_raids_units_start|all': 'Стартовые юниты',
    'boost:guild_raids_supplies_production|all': 'Буст молотков %',
    'boost:guild_raids_supplies_start|all': 'Стартовые молотки',
    'boost:guild_raids_goods_start|all': 'Стартовые товары',
    
    
     'boost:att_boost_attacker|guild_raids': 'КВ',
     'boost:att_boost_defender|guild_raids': 'КВ',
     'boost:att_def_boost_attacker|guild_raids': 'КВ',
     'boost:att_def_boost_attacker_defender|guild_raids': 'КВ',
     'boost:att_def_boost_defender|guild_raids': 'КВ',
     'boost:def_boost_attacker|guild_raids': 'КВ',
     'boost:def_boost_defender|guild_raids': 'КВ',
     'boost:attack|guild_raids': 'КВ',
     'boost:defense|guild_raids': 'КВ',

    // Бонусы (Boosts)
    'boost:production_chance|all': '✨ (Шанс производства)',
    'boost:production_amount|all': '📈 (Объем производства)',
    'boost:building_cost|all': '💰 (Стоимость постройки)',
    'boost:attack_bonus|all': '⚔️ (Бонус атаки)',
    'boost:defense_bonus|all': '🛡️ (Бонус защиты)',
    'boost:satisfaction|all': '😊 (Счастье)',
    'boost:population|all': '👥 (Население)'
};

// === ОБЩАЯ ФУНКЦИЯ ДЛЯ ПОЛУЧЕНИЯ НАЗВАНИЯ РЕСУРСА ===
window.getResourceLabel = function(key, isGuildProduction = false) {
    let iconClass = 'bg-money';
    let label = key;
    
    if (isGuildProduction) {
        iconClass = 'bg-meet';
        if (key.includes('previous_age')) label = 'Товары прошлой эпохи в гильдию';
        else if (key.includes('next_age')) label = 'Товары следующей эпохи в гильдию';
        else if (key.includes('all_goods_of_age') || key.includes('random_good_of_age')) label = 'Товары своей эпохи в гильдию';
        else if (key.includes('random_good')) label = 'Случайные товары в гильдию';
        else label = 'Товары в гильдию';
    } else if (key === 'medals' || key.includes('medal')) { 
        iconClass = 'bg-fp'; 
        label = 'Медали'; 
    }
    else if (key.includes('previous_age')) { 
        iconClass = 'bg-goods'; 
        label = 'Товары прошлой эпохи'; 
    }
    else if (key.includes('next_age')) { 
        iconClass = 'bg-goods'; 
        label = 'Товары следующей эпохи'; 
    }
    else if (key.includes('all_goods_of_age') || key.includes('random_good_of_age')) { 
        iconClass = 'bg-goods'; 
        label = 'Товары своей эпохи'; 
    }
    else if (key.includes('good')) { 
        iconClass = 'bg-goods'; 
        label = 'Товары'; 
    }
    else if (key.includes('suppl')) { 
        iconClass = 'bg-supplies'; 
        label = 'Молотки'; 
    }
    else if (key.includes('money')) { 
        iconClass = 'bg-money'; 
        label = 'Монеты'; 
    }
    else if (key.includes('unit') || key.includes('random')) { 
        iconClass = 'bg-unit'; 
        label = 'Юниты'; 
    }
    else if (key.includes('strategy')) { 
        iconClass = 'bg-fp';  
        label = 'СО'; 
    }
    else if (key.includes('clan_power')) { 
        iconClass = 'bg-meet'; 
        label = 'Сила гильдии'; 
    }
    
    return { label, iconClass };
};

// === ЗАГРУЗКА КОНФИГУРАЦИИ ===
function loadBasketConfig() {
    basketConfig = window.DEFAULT_BASKET_CONFIG || {
        resources: {
            strategy_points: { label: "СО", iconClass: "bg-fp" },
            money: { label: "Монеты", iconClass: "bg-money" },
            supplies: { label: "Молотки", iconClass: "bg-supplies" },
            goods: { label: "Товары", iconClass: "bg-goods" },
            clan_power: { label: "Сила гильдии", iconClass: "bg-meet" },
            medals: { label: "Медали", iconClass: "bg-fp" },
            clan_goods_current_era: { label: "Товары своей эпохи", iconClass: "bg-goods" },
            random_good_of_age: { label: "Товары своей эпохи", iconClass: "bg-goods" }
        },
        boosts: {},
        features: window.FeatureNames || {},
        settings: { maxBasketSize: 30, longPressDuration: 700 }
    };
    return Promise.resolve();
}

// === ЗАГРУЗКА / СОХРАНЕНИЕ ===
function loadBasket() {
    const saved = localStorage.getItem('foeBuildingBasket');
    const savedEra = localStorage.getItem('foeBuildingBasketEra');
    const savedOrder = localStorage.getItem('foeBasketColumnOrder');
    
    if (saved) {
        try { basket = JSON.parse(saved); updateBasketCount(); }
        catch(e) { basket = []; }
    }
    if (savedEra) basketEra = savedEra;
    if (savedOrder) {
        try { columnOrder = JSON.parse(savedOrder); }
        catch(e) { columnOrder = []; }
    }
}

function saveBasket() {
    localStorage.setItem('foeBuildingBasket', JSON.stringify(basket));
    localStorage.setItem('foeBuildingBasketEra', basketEra);
    updateBasketCount();
}

function saveColumnOrder() {
    localStorage.setItem('foeBasketColumnOrder', JSON.stringify(columnOrder));
}

function updateBasketCount() {
    const countEl = document.getElementById('basketCount');
    if (countEl) countEl.textContent = basket.length;
}

// === ДОБАВЛЕНИЕ / УДАЛЕНИЕ ===
function addToBasket(building) {
    const maxSize = basketConfig?.settings?.maxBasketSize || 30;
    if (basket.length >= maxSize) { showToast(`Максимум ${maxSize} зданий!`, true); return; }
    if (basket.find(b => b.id === building.id)) { showToast('Уже в корзине', true); return; }
    basket.push({
        id: building.id, name: building.name, baseEra: building.baseEra,
        availableEras: building.availableEras, size: building.size,
        rawMeta: building.rawMeta, rawData: building.rawData, addedAt: Date.now()
    });
    saveBasket();
    updateBasketCardIndicators();
}

function removeFromBasket(buildingId) {
    basket = basket.filter(b => b.id !== buildingId);
    saveBasket();
    renderBasketTable();
}

function clearBasket() {
    if (confirm('Очистить всю корзину?')) { 
        basket = []; 
        saveBasket(); 
        renderBasketTable(); 
    }
}

// === МОДАЛЬНОЕ ОКНО ===
function openBasketModal() {
    const modal = document.getElementById('basketModal');
    if (modal) {
        modal.classList.add('active');
        initBasketEraSelect();
        initPerTileSelect();
        renderBasketTable();
        updateBasketCardIndicators();
    }
}

function closeBasketModal() {
    const modal = document.getElementById('basketModal');
    if (modal) modal.classList.remove('active');
}

function updateBasketCardIndicators() {
    document.querySelectorAll('.building-card').forEach(card => {
        const buildingId = card.dataset.id;
        const isInBasket = basket.some(item => item.id === buildingId);
        if (isInBasket) card.classList.add('in-basket');
        else card.classList.remove('in-basket');
    });
}

// === ВЫБОР ЭПОХИ ===
function initBasketEraSelect() {
    const select = document.getElementById('basketEraSelect');
    if (!select) return;
    select.innerHTML = '';
    window.EraList.forEach(era => {
        const option = document.createElement('option');
        option.value = era;
        option.textContent = window.EraNames[era] || era;
        if (era === basketEra) option.selected = true;
        select.appendChild(option);
    });
}

function onBasketEraChange() {
    const select = document.getElementById('basketEraSelect');
    if (select) { 
        basketEra = select.value; 
        saveBasket(); 
        renderBasketTable(); 
    }
}

// === ВЫБОР ОТОБРАЖЕНИЯ (НА КЛЕТКУ) ===
function initPerTileSelect() {
    const select = document.getElementById('perTileSelect');
    if (!select) return;
    select.innerHTML = '';
    const optionTotal = document.createElement('option');
    optionTotal.value = 'total';
    optionTotal.textContent = 'Общие значения';
    if (!showPerTile) optionTotal.selected = true;
    select.appendChild(optionTotal);
    const optionPerTile = document.createElement('option');
    optionPerTile.value = 'perTile';
    optionPerTile.textContent = 'На клетку';
    if (showPerTile) optionPerTile.selected = true;
    select.appendChild(optionPerTile);
}

function onPerTileChange() {
    const select = document.getElementById('perTileSelect');
    if (select) { 
        showPerTile = select.value === 'perTile'; 
        renderBasketTable(); 
    }
}

// === КОЭФФИЦИЕНТ ЗДАНИЯ ===
function getBuildingTileCoefficient(building) {
    const width = building.size.width;
    const length = building.size.length;
    const area = width * length;
    const needsStreet = window.CityBuildings.needsStreet(building.rawMeta);
    let coefficient = area;
    if (needsStreet > 0) {
        const shorterSide = Math.min(width, length);
        coefficient += shorterSide / 2;
    }
    return Math.round(coefficient);
}

// === ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ===
function getProdValue(productions, resKey) {
    if (!productions) return null;
    const prodItem = productions.find(p => p.resources && p.resources[resKey] !== undefined);
    return prodItem && prodItem.resources[resKey] !== undefined ? prodItem.resources[resKey] : null;
}

function getBoostValue(boosts, boostKey) {
    if (!boosts) return null;
    const [type, feature] = boostKey.split('|');
    const boostItem = boosts.find(bt => {
        const btTypes = Array.isArray(bt.type) ? bt.type : [bt.type];
        return btTypes.includes(type) && (bt.feature || bt.targetedFeature || 'all') === feature;
    });
    return boostItem ? boostItem.value : null;
}

function getColumnName(key, defaultName) {
    return CUSTOM_COLUMN_NAMES[key] || defaultName;
}

// === ПЕРЕТАСКИВАНИЕ КОЛОНОК ===
let draggedColumnIndex = null;

function initColumnDragDrop() {
    const table = document.getElementById('basketTable');
    if (!table) return;

    const thead = table.querySelector('thead');
    if (!thead) return;

    const headers = thead.querySelectorAll('th');

    headers.forEach((th, index) => {
        if (index === 0) {
            th.style.cursor = 'default';
            th.draggable = false;
            return;
        }

        th.draggable = true;
        th.style.cursor = 'grab';

        th.removeEventListener('dragstart', handleDragStart);
        th.removeEventListener('dragover', handleDragOver);
        th.removeEventListener('drop', handleDrop);
        th.removeEventListener('dragend', handleDragEnd);
        th.removeEventListener('dragenter', handleDragEnter);
        th.removeEventListener('dragleave', handleDragLeave);

        th.addEventListener('dragstart', handleDragStart);
        th.addEventListener('dragover', handleDragOver);
        th.addEventListener('drop', handleDrop);
        th.addEventListener('dragend', handleDragEnd);
        th.addEventListener('dragenter', handleDragEnter);
        th.addEventListener('dragleave', handleDragLeave);
    });
}

function handleDragStart(e) {
    draggedColumnIndex = Array.from(e.currentTarget.parentNode.children).indexOf(e.currentTarget);
    e.currentTarget.classList.add('dragging');
    e.currentTarget.style.cursor = 'grabbing';
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
}

function handleDragEnter(e) {
    e.preventDefault();
    const th = e.currentTarget;
    if (th.classList.contains('dragging')) return;
    th.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.currentTarget.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    const table = document.getElementById('basketTable');
    if (!table) return;

    const thead = table.querySelector('thead');
    const tbody = table.querySelector('tbody');
    if (!thead || !tbody) return;

    const toIndex = Array.from(e.currentTarget.parentNode.children).indexOf(e.currentTarget);
    const fromIndex = draggedColumnIndex;

    if (fromIndex === null || fromIndex === toIndex || fromIndex === 0 || toIndex === 0) {
        cleanupDrag();
        return;
    }

    moveColumn(thead, tbody, fromIndex, toIndex);
    cleanupDrag();
}

function handleDragEnd(e) {
    cleanupDrag();
}

function cleanupDrag() {
    draggedColumnIndex = null;
    document.querySelectorAll('.dragging, .drag-over').forEach(el => {
        el.classList.remove('dragging', 'drag-over');
        if (el.tagName === 'TH' && !el.classList.contains('col-action')) {
            el.style.cursor = 'grab';
        }
    });
}

// === ИСПРАВЛЕННАЯ ФУНКЦИЯ ПЕРЕМЕЩЕНИЯ + СОХРАНЕНИЕ ПОРЯДКА ===
function moveColumn(thead, tbody, fromIndex, toIndex) {
    if (fromIndex === toIndex) return;

    const headers = Array.from(thead.querySelectorAll('th'));
    const fromHeader = headers[fromIndex];

    if (fromIndex < toIndex) {
        headers[toIndex].parentNode.insertBefore(fromHeader, headers[toIndex].nextSibling);
    } else {
        headers[toIndex].parentNode.insertBefore(fromHeader, headers[toIndex]);
    }

    const rows = tbody.querySelectorAll('tr');
    rows.forEach(row => {
        const cells = Array.from(row.querySelectorAll('td'));
        if (cells[fromIndex] && cells[toIndex]) {
            const fromCell = cells[fromIndex];
            if (fromIndex < toIndex) {
                cells[toIndex].parentNode.insertBefore(fromCell, cells[toIndex].nextSibling);
            } else {
                cells[toIndex].parentNode.insertBefore(fromCell, cells[toIndex]);
            }
        }
    });

    // Сохраняем новый порядок колонок
    saveCurrentColumnOrder();

    setTimeout(initColumnDragDrop, 50);
}

function saveCurrentColumnOrder() {
    const table = document.getElementById('basketTable');
    if (!table) return;

    const headers = table.querySelectorAll('thead th');
    const newOrder = [];

    headers.forEach(th => {
        if (th.classList.contains('col-action')) {
            newOrder.push('action');
        } else if (th.dataset.sort) {
            newOrder.push(th.dataset.sort);
        } else if (th.textContent.trim().includes('Название')) {
            newOrder.push('name');
        } else if (th.textContent.trim().includes('Размер')) {
            newOrder.push('size');
        }
    });

    columnOrder = newOrder;
    saveColumnOrder();
}

// === ПОРЯДОК FEATURE ДЛЯ СОРТИРОВКИ КОЛОНОК БОНУСОВ ===
const FEATURE_ORDER = ['all', 'battleground', 'guild_expedition', 'guild_raids', 'campaign', 'pvp', 'neighbor'];

// Порядок guild_raids_* boost типов внутри таблицы guild_raids
const GUILD_RAIDS_BOOST_ORDER = [
    'att_def_boost_attacker_defender', 'attack', 'defense',
    'guild_raids_action_points_collection', 'guild_raids_action_points_capacity',
    'guild_raids_coins_production', 'guild_raids_coins_start',
    'guild_raids_supplies_production', 'guild_raids_supplies_start',
    'guild_raids_goods_start', 'guild_raids_units_start'
];

function featureSort(a, b) {
    const ai = FEATURE_ORDER.indexOf(a.feature);
    const bi = FEATURE_ORDER.indexOf(b.feature);
    const an = ai === -1 ? 99 : ai;
    const bn = bi === -1 ? 99 : bi;
    if (an !== bn) return an - bn;
    // Для guild_raids используем кастомный порядок boost-типов
    const gi = GUILD_RAIDS_BOOST_ORDER.indexOf(a.boostType);
    const gj = GUILD_RAIDS_BOOST_ORDER.indexOf(b.boostType);
    if (gi !== -1 || gj !== -1) {
        const gai = gi === -1 ? 99 : gi;
        const gbj = gj === -1 ? 99 : gj;
        return gai - gbj;
    }
    return (a.boostType || '').localeCompare(b.boostType || '');
}

// Собирает уникальные boost-колонки из массива данных зданий,
// правильно разделяя feature и targetedFeature
function buildBoostColumns(dataArray) {
    const uniqueBoosts = new Map();
    dataArray.forEach(b => {
        if (!b.boosts || !Array.isArray(b.boosts)) return;
        b.boosts.forEach(boost => {
            const types = Array.isArray(boost.type) ? boost.type : [boost.type];
            // Собираем все feature-значения этого буста отдельно
            const features = new Set();
            if (boost.feature) features.add(boost.feature);
            if (boost.targetedFeature) features.add(boost.targetedFeature);
            if (features.size === 0) features.add('all');

            types.forEach(t => {
                features.forEach(feature => {
                    const key = `${t}|${feature}`;
                    if (!uniqueBoosts.has(key)) {
                        const boostCfg = basketConfig?.boosts?.[t] || {};
                        const iconUrl = boostCfg.iconUrl || window.BonusIcons?.[t] || window.BonusIcons?.['default'];
                        const featureLabel = basketConfig?.features?.[feature] || window.FeatureNames?.[feature] || feature.replace(/_/g, ' ');
                        const boostKey = `boost:${t}|${feature}`;
                        uniqueBoosts.set(key, {
                            type: 'boost',
                            boostType: t,
                            feature: feature,
                            sortKey: `boost:${key}`,
                            icon: iconUrl,
                            label: CUSTOM_COLUMN_NAMES[boostKey] || `${featureLabel}`
                        });
                    }
                });
            });
        });
    });
    // Сортируем: сначала all, потом battleground, потом guild_expedition и т.д.
    return Array.from(uniqueBoosts.values()).sort(featureSort);
}

// Находит значение буста в данных здания для конкретной колонки (boostType + feature)
function findBoostValue(boosts, col) {
    if (!boosts) return null;
    for (const bt of boosts) {
        const btTypes = Array.isArray(bt.type) ? bt.type : [bt.type];
        if (!btTypes.includes(col.boostType)) continue;
        const features = new Set();
        if (bt.feature) features.add(bt.feature);
        if (bt.targetedFeature) features.add(bt.targetedFeature);
        if (features.size === 0) features.add('all');
        if (features.has(col.feature)) return bt.value;
    }
    return null;
}

// === ОТРИСОВКА ТАБЛИЦЫ ===
function renderBasketTable() {
    const table = document.getElementById('basketTable');
    if (!table) return;
    let thead = table.querySelector('thead');
    let tbody = table.querySelector('tbody');
    if (!thead) { thead = document.createElement('thead'); table.appendChild(thead); }
    if (!tbody) { tbody = document.createElement('tbody'); table.appendChild(tbody); }
    
    const uniqueProds = new Map();
    const technicalFields = ['id', 'name', 'type', 'subType', 'amount', 'dropChance', 'iconClass'];

    const basketData = basket.map(b => {
        const building = window.allBuildings?.find(ab => ab.id === b.id);
        if (!building) return null;
        const data = getBuildingDataForEra(building, basketEra);
        const coefficient = getBuildingTileCoefficient(building);
        return {
            id: b.id, name: b.name, size: b.size, coefficient: coefficient,
            population: data.population, happiness: data.happiness,
            production: data.production, boosts: data.boosts
        };
    }).filter(b => b !== null);

    // Собираем все колонки
    const allColumns = [];
    allColumns.push({ type: 'action', key: 'action', label: getColumnName('action', '✕') });
    allColumns.push({ type: 'name', key: 'name', label: getColumnName('name', 'Название') });
    allColumns.push({ type: 'size', key: 'size', label: getColumnName('size', 'Размер') });

    const popKey = showPerTile ? 'population_per_tile' : 'population';
    allColumns.push({ type: 'population', key: 'population', label: getColumnName(popKey, showPerTile ? 'Население/кл' : 'Население') });

    const happyKey = showPerTile ? 'happiness_per_tile' : 'happiness';
    allColumns.push({ type: 'happiness', key: 'happiness', label: getColumnName(happyKey, showPerTile ? 'Счастье/кл' : 'Счастье') });

    // Продукты
    basketData.forEach(b => {
        if (b.production && Array.isArray(b.production)) {
            b.production.filter(p => p.type !== 'random').forEach(p => {
                const isGuild = p.type === 'guildResources';
                if (p.resources && typeof p.resources === 'object' && !Array.isArray(p.resources)) {
                    Object.keys(p.resources).forEach(resKey => {
                        if (technicalFields.includes(resKey)) return;
                        const mapKey = isGuild ? `guild:${resKey}` : resKey;
                        if (!uniqueProds.has(mapKey)) {
                            const resInfo = getResourceLabel(resKey, isGuild);
                            const prodKey = `prod:${resKey}`;
                            uniqueProds.set(mapKey, { 
                                type: 'prod',
                                key: resKey,
                                isGuild: isGuild,
                                sortKey: `prod:${mapKey}`,
                                iconClass: resInfo.iconClass, 
                                label: isGuild ? resInfo.label : (CUSTOM_COLUMN_NAMES[prodKey] || resInfo.label)
                            });
                        }
                    });
                }
            });
        }
    });
    uniqueProds.forEach(prod => allColumns.push(prod));

    // Бонусы — используем общую функцию с правильной логикой feature/targetedFeature и сортировкой
    buildBoostColumns(basketData).forEach(col => allColumns.push(col));

    // Применяем сохранённый порядок колонок
    let orderedColumns = [...allColumns];
    if (columnOrder && columnOrder.length > 0) {
        orderedColumns = [];
        columnOrder.forEach(orderKey => {
            const found = allColumns.find(col => {
                if (col.type === 'action') return orderKey === 'action';
                if (col.type === 'name') return orderKey === 'name';
                if (col.type === 'size') return orderKey === 'size';
                if (col.type === 'population') return orderKey === 'population' || orderKey === 'population_per_tile';
                if (col.type === 'happiness') return orderKey === 'happiness' || orderKey === 'happiness_per_tile';
                return col.sortKey === orderKey;
            });
            if (found) orderedColumns.push(found);
        });

        allColumns.forEach(col => {
            if (!orderedColumns.includes(col)) orderedColumns.push(col);
        });
    }

    // Отрисовка заголовка
    thead.innerHTML = '';
    const headerRow = document.createElement('tr');
    
    orderedColumns.forEach(col => {
        const th = document.createElement('th');
        
        if (col.type === 'action') {
            th.className = 'col-action';
            th.textContent = col.label;
            th.style.cursor = 'default';
        } else if (col.type === 'name') {
            th.textContent = col.label;
            th.dataset.sort = 'name';
        } else if (col.type === 'size') {
            th.textContent = col.label;
            th.dataset.sort = 'size';
        } else if (col.type === 'population') {
            th.textContent = col.label;
            th.dataset.sort = 'population';
        } else if (col.type === 'happiness') {
            th.textContent = col.label;
            th.dataset.sort = 'happiness';
        } else if (col.type === 'prod') {
            th.className = 'col-prod';
            th.dataset.sort = `prod:${col.key}`;
            const icon = document.createElement('span');
            icon.className = `icon-sm ${col.iconClass}`;
            th.appendChild(icon);
            th.appendChild(document.createTextNode(col.label));
        } else if (col.type === 'boost') {
            th.className = 'col-boost';
            th.dataset.sort = col.sortKey;
            th.style.textAlign = 'center';
            const img = document.createElement('img');
            img.src = col.icon;
            img.className = 'bonus-icon-img';
            th.appendChild(img);
            th.appendChild(document.createTextNode(' ' + col.label));
        }
        
        headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);

    // Сортировка данных
    let sortedData = [...basketData];
    if (basketSort.column) {
        sortedData.sort((a, b) => {
            let valA, valB;
            const [sortType, sortKey] = basketSort.column.split(':');
            if (sortType === 'prod') { 
                valA = getProdValue(a.production, sortKey); 
                valB = getProdValue(b.production, sortKey); 
                if (showPerTile && valA !== null) valA = valA / a.coefficient; 
                if (showPerTile && valB !== null) valB = valB / b.coefficient; 
            } else if (sortType === 'boost') { 
                valA = getBoostValue(a.boosts, sortKey); 
                valB = getBoostValue(b.boosts, sortKey); 
            } else { 
                valA = a[sortType]; 
                valB = b[sortType]; 
                if (sortType === 'size') { 
                    valA = a.size.width * a.size.length; 
                    valB = b.size.width * b.size.length; 
                } 
                if (sortType === 'population' || sortType === 'happiness') { 
                    if (showPerTile) { 
                        valA = valA / a.coefficient; 
                        valB = valB / b.coefficient; 
                    } 
                } 
            }
            if (valA === valB) return 0; 
            if (valA == null) return 1;  
            if (valB == null) return -1;
            return basketSort.direction === 'asc' ? (valA < valB ? -1 : 1) : (valA < valB ? 1 : -1);
        });
    }

    // Классы сортировки
    thead.querySelectorAll('th').forEach(th => {
        th.classList.remove('sorted-asc', 'sorted-desc');
        if (th.dataset.sort === basketSort.column) {
            th.classList.add(basketSort.direction === 'asc' ? 'sorted-asc' : 'sorted-desc');
        }
    });

    // Отрисовка строк
    tbody.innerHTML = '';
    if (sortedData.length === 0) {
        const emptyRow = document.createElement('tr');
        const emptyCell = document.createElement('td'); 
        emptyCell.colSpan = orderedColumns.length; 
        emptyCell.style.textAlign = 'center'; 
        emptyCell.style.padding = '20px'; 
        emptyCell.style.color = '#888'; 
        emptyCell.textContent = 'Корзина пуста';
        emptyRow.appendChild(emptyCell); 
        tbody.appendChild(emptyRow);
    } else {
        sortedData.forEach(b => {
            const row = document.createElement('tr');
            
            orderedColumns.forEach(col => {
                const td = document.createElement('td');
                
                if (col.type === 'action') {
                    td.className = 'col-action';
                    td.style.textAlign = 'center';
                    const btnRemove = document.createElement('button');
                    btnRemove.className = 'btn-remove';
                    btnRemove.textContent = '✕';
                    btnRemove.onclick = () => removeFromBasket(b.id);
                    td.appendChild(btnRemove);
                } else if (col.type === 'name') {
                    const strong = document.createElement('strong');
                    strong.textContent = b.name;
                    td.appendChild(strong);
                } else if (col.type === 'size') {
                    td.textContent = `${b.size.width}x${b.size.length}`;
                } else if (col.type === 'population') {
                    if (showPerTile) {
                        const popValue = (b.population / b.coefficient).toFixed(2);
                        td.className = parseFloat(popValue) > 0 ? 'tt-value positive' : 'tt-value negative';
                        td.textContent = popValue;
                    } else {
                        td.className = b.population > 0 ? 'tt-value positive' : 'tt-value negative';
                        td.textContent = `${b.population > 0 ? '+' : ''}${b.population}`;
                    }
                } else if (col.type === 'happiness') {
                    if (showPerTile) {
                        const happyValue = (b.happiness / b.coefficient).toFixed(2);
                        td.className = 'tt-value positive';
                        td.textContent = happyValue;
                    } else {
                        td.className = 'tt-value positive';
                        td.textContent = `+${b.happiness}`;
                    }
                } else if (col.type === 'prod') {
                    td.style.textAlign = 'center';
                    td.style.fontWeight = 'bold';
                    let val = '';
                    if (b.production) {
                        const prodItem = b.production.find(p => {
                            const isGuildProd = p.type === 'guildResources';
                            return isGuildProd === !!col.isGuild && p.resources && p.resources[col.key] !== undefined;
                        });
                        if (prodItem && prodItem.resources[col.key] !== undefined) {
                            let rawValue = prodItem.resources[col.key];
                            val = showPerTile ? (rawValue / b.coefficient).toFixed(2) : Math.round(rawValue);
                        }
                    }
                    td.textContent = val || '—';
                } else if (col.type === 'boost') {
                    td.style.textAlign = 'center';
                    td.style.fontWeight = 'bold';
                    td.style.color = '#4ecdc4';
                    const boostValue = findBoostValue(b.boosts, col);
                    td.textContent = boostValue !== null
                        ? (showPerTile ? (boostValue / b.coefficient).toFixed(2) : `+${boostValue}%`)
                        : '—';
                }
                
                row.appendChild(td);
            });
            tbody.appendChild(row);
        });
    }
    
    // Обработчики сортировки
    thead.querySelectorAll('th[data-sort]').forEach(th => {
        th.onclick = (e) => {
            const col = th.dataset.sort;
            if (basketSort.column === col) basketSort.direction = basketSort.direction === 'asc' ? 'desc' : 'asc';
            else { basketSort.column = col; basketSort.direction = 'asc'; }
            renderBasketTable();
        };
    });
    
    initColumnDragDrop();
}
// ============================================================
// === МОДАЛЬНОЕ ОКНО "КВАНТЫ" — здания «нео ...» ===
// ============================================================

let quantaEra = 'SpaceAgeSpaceHub';
let quantaShowPerTile = false;
let quantaSort = { column: null, direction: 'asc' };

function openQuantaModal() {
    const modal = document.getElementById('quantaModal');
    if (!modal) return;

    const allBuildings = window.allBuildings || [];
    const neoBuildings = allBuildings.filter(b => (b.name || '').toLowerCase().startsWith('нео '));

    if (neoBuildings.length === 0) {
        showToast('Здания «нео ...» не найдены', true);
        return;
    }

    // Инициализировать select эпохи
    const eraSelect = document.getElementById('quantaEraSelect');
    if (eraSelect) {
        eraSelect.innerHTML = '';
        (window.EraList || []).forEach(era => {
            const option = document.createElement('option');
            option.value = era;
            option.textContent = (window.EraNames && window.EraNames[era]) || era;
            if (era === quantaEra) option.selected = true;
            eraSelect.appendChild(option);
        });
    }

    // Инициализировать select отображения
    const perTileSelect = document.getElementById('quantaPerTileSelect');
    if (perTileSelect) perTileSelect.value = quantaShowPerTile ? 'perTile' : 'total';

    modal.classList.add('active');
    renderQuantaTable();
}

function closeQuantaModal() {
    const modal = document.getElementById('quantaModal');
    if (modal) modal.classList.remove('active');
}

function onQuantaEraChange() {
    const select = document.getElementById('quantaEraSelect');
    if (select) { quantaEra = select.value; renderQuantaTable(); }
}

function onQuantaPerTileChange() {
    const select = document.getElementById('quantaPerTileSelect');
    if (select) { quantaShowPerTile = select.value === 'perTile'; renderQuantaTable(); }
}

function renderQuantaTable() {
    const table = document.getElementById('quantaTable');
    if (!table) return;
    table.classList.add('sticky-name');
    let thead = table.querySelector('thead');
    let tbody = table.querySelector('tbody');
    if (!thead) { thead = document.createElement('thead'); table.appendChild(thead); }
    if (!tbody) { tbody = document.createElement('tbody'); table.appendChild(tbody); }

    const uniqueProds = new Map();
    const technicalFields = ['id', 'name', 'type', 'subType', 'amount', 'dropChance', 'iconClass'];

    // Получаем здания "нео ..." с полной обработкой — точно как renderBasketTable
    const allBuildings = window.allBuildings || [];
    const quantaData = allBuildings
        .filter(b => (b.name || '').toLowerCase().startsWith('нео '))
        .map(building => {
            const data = getBuildingDataForEra(building, quantaEra);
            const coefficient = getBuildingTileCoefficient(building);
            return {
                id: building.id,
                name: building.name,
                size: building.size,
                coefficient: coefficient,
                population: data.population,
                happiness: data.happiness,
                production: data.production,
                boosts: data.boosts
            };
        });

    // Собираем колонки для Квантов:
    // порядок: название | размер | бонусы (боевые) | продукты | население
    const allColumns = [];
    allColumns.push({ type: 'name', key: 'name', label: getColumnName('name', 'Название') });
    allColumns.push({ type: 'size', key: 'size', label: getColumnName('size', 'Размер') });

    // Бонусы (боевые) — сразу после размера
    buildBoostColumns(quantaData).forEach(col => allColumns.push(col));

    // Продукты — после боевых
    quantaData.forEach(b => {
        if (b.production && Array.isArray(b.production)) {
            b.production.filter(p => p.type !== 'random').forEach(p => {
                const isGuild = p.type === 'guildResources';
                if (p.resources && typeof p.resources === 'object' && !Array.isArray(p.resources)) {
                    Object.keys(p.resources).forEach(resKey => {
                        if (technicalFields.includes(resKey)) return;
                        const mapKey = isGuild ? `guild:${resKey}` : resKey;
                        if (!uniqueProds.has(mapKey)) {
                            const resInfo = getResourceLabel(resKey, isGuild);
                            const prodKey = `prod:${resKey}`;
                            uniqueProds.set(mapKey, {
                                type: 'prod',
                                key: resKey,
                                isGuild: isGuild,
                                sortKey: `prod:${mapKey}`,
                                iconClass: resInfo.iconClass,
                                label: isGuild ? resInfo.label : (CUSTOM_COLUMN_NAMES[prodKey] || resInfo.label)
                            });
                        }
                    });
                }
            });
        }
    });
    uniqueProds.forEach(prod => allColumns.push(prod));

    // Население — в конце (счастье убрано)
    const popKey = quantaShowPerTile ? 'population_per_tile' : 'population';
    allColumns.push({ type: 'population', key: 'population', label: getColumnName(popKey, quantaShowPerTile ? 'Население/кл' : 'Население') });

    // Отрисовка заголовка
    thead.innerHTML = '';
    const headerRow = document.createElement('tr');
    allColumns.forEach(col => {
        const th = document.createElement('th');
        if (col.type === 'name') {
            th.textContent = col.label;
            th.dataset.sort = 'name';
        } else if (col.type === 'size') {
            th.textContent = col.label;
            th.dataset.sort = 'size';
            th.style.width = '1%';
            th.style.whiteSpace = 'nowrap';
        } else if (col.type === 'population') {
            th.textContent = col.label;
            th.dataset.sort = 'population';
        } else if (col.type === 'prod') {
            th.className = 'col-prod';
            th.dataset.sort = `prod:${col.key}`;
            const icon = document.createElement('span');
            icon.className = `icon-sm ${col.iconClass}`;
            th.appendChild(icon);
            th.appendChild(document.createTextNode(col.label));
        } else if (col.type === 'boost') {
            th.className = 'col-boost';
            th.dataset.sort = col.sortKey;
            th.style.textAlign = 'center';
            const img = document.createElement('img');
            img.src = col.icon;
            img.className = 'bonus-icon-img';
            th.appendChild(img);
            th.appendChild(document.createTextNode(' ' + col.label));
        }
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);

    // Сортировка данных
    let sortedData = [...quantaData];
    if (quantaSort.column) {
        sortedData.sort((a, b) => {
            let valA, valB;
            const [sortType, sortKey] = quantaSort.column.split(':');
            if (sortType === 'prod') {
                valA = getProdValue(a.production, sortKey);
                valB = getProdValue(b.production, sortKey);
                if (quantaShowPerTile && valA !== null) valA = valA / a.coefficient;
                if (quantaShowPerTile && valB !== null) valB = valB / b.coefficient;
            } else if (sortType === 'boost') {
                valA = getBoostValue(a.boosts, sortKey);
                valB = getBoostValue(b.boosts, sortKey);
            } else {
                valA = a[sortType];
                valB = b[sortType];
                if (sortType === 'size') {
                    valA = a.size.width * a.size.length;
                    valB = b.size.width * b.size.length;
                }
                if (sortType === 'population' || sortType === 'happiness') {
                    if (quantaShowPerTile) {
                        valA = valA / a.coefficient;
                        valB = valB / b.coefficient;
                    }
                }
            }
            if (valA === valB) return 0;
            if (valA == null) return 1;
            if (valB == null) return -1;
            return quantaSort.direction === 'asc' ? (valA < valB ? -1 : 1) : (valA < valB ? 1 : -1);
        });
    }

    // Классы сортировки
    thead.querySelectorAll('th').forEach(th => {
        th.classList.remove('sorted-asc', 'sorted-desc');
        if (th.dataset.sort === quantaSort.column) {
            th.classList.add(quantaSort.direction === 'asc' ? 'sorted-asc' : 'sorted-desc');
        }
    });

    // Отрисовка строк
    tbody.innerHTML = '';
    if (sortedData.length === 0) {
        const emptyRow = document.createElement('tr');
        const emptyCell = document.createElement('td');
        emptyCell.colSpan = allColumns.length;
        emptyCell.style.textAlign = 'center';
        emptyCell.style.padding = '20px';
        emptyCell.style.color = '#888';
        emptyCell.textContent = 'Здания не найдены';
        emptyRow.appendChild(emptyCell);
        tbody.appendChild(emptyRow);
    } else {
        sortedData.forEach(b => {
            const row = document.createElement('tr');
            allColumns.forEach(col => {
                const td = document.createElement('td');
                if (col.type === 'name') {
                    const strong = document.createElement('strong');
                    strong.textContent = b.name;
                    td.appendChild(strong);
                } else if (col.type === 'size') {
                    td.textContent = `${b.size.width}x${b.size.length}`;
                    td.style.textAlign = 'center';
                    td.style.whiteSpace = 'nowrap';
                } else if (col.type === 'population') {
                    if (quantaShowPerTile) {
                        const popValue = (b.population / b.coefficient).toFixed(2);
                        td.className = parseFloat(popValue) > 0 ? 'tt-value positive' : 'tt-value negative';
                        td.textContent = popValue;
                    } else {
                        td.className = b.population > 0 ? 'tt-value positive' : 'tt-value negative';
                        td.textContent = `${b.population > 0 ? '+' : ''}${b.population}`;
                    }
                } else if (col.type === 'prod') {
                    td.style.textAlign = 'center';
                    td.style.fontWeight = 'bold';
                    let val = '';
                    if (b.production) {
                        // Ищем в правильном типе производства: guild или обычное
                        const prodItem = b.production.find(p => {
                            const isGuildProd = p.type === 'guildResources';
                            return isGuildProd === !!col.isGuild && p.resources && p.resources[col.key] !== undefined;
                        });
                        if (prodItem && prodItem.resources[col.key] !== undefined) {
                            let rawValue = prodItem.resources[col.key];
                            val = quantaShowPerTile ? (rawValue / b.coefficient).toFixed(2) : Math.round(rawValue);
                        }
                    }
                    td.textContent = val || '—';
                } else if (col.type === 'boost') {
                    td.style.textAlign = 'center';
                    td.style.fontWeight = 'bold';
                    td.style.color = '#4ecdc4';
                    const boostValue = findBoostValue(b.boosts, col);
                    td.textContent = boostValue !== null
                        ? (quantaShowPerTile ? (boostValue / b.coefficient).toFixed(2) : `+${boostValue}%`)
                        : '—';
                }
                row.appendChild(td);
            });
            tbody.appendChild(row);
        });
    }

    // Обработчики сортировки
    thead.querySelectorAll('th[data-sort]').forEach(th => {
        th.onclick = () => {
            const col = th.dataset.sort;
            if (quantaSort.column === col) quantaSort.direction = quantaSort.direction === 'asc' ? 'desc' : 'asc';
            else { quantaSort.column = col; quantaSort.direction = 'asc'; }
            renderQuantaTable();
        };
    });
}

// ============================================================
// === МОДАЛЬНОЕ ОКНО "КВАНТЫ (БОИ)" — здания с guild_raids ===
// ============================================================

let guildRaidsEra = 'SpaceAgeSpaceHub';
let guildRaidsShowPerTile = false;
let guildRaidsSort = { column: null, direction: 'asc' };

function openGuildRaidsModal() {
    const modal = document.getElementById('guildRaidsModal');
    if (!modal) return;

    const allBuildings = window.allBuildings || [];
    const found = allBuildings.filter(b => hasGuildRaidsBoost(b));

    if (found.length === 0) {
        showToast('Здания с guild_raids бонусами не найдены', true);
        return;
    }

    const eraSelect = document.getElementById('guildRaidsEraSelect');
    if (eraSelect) {
        eraSelect.innerHTML = '';
        (window.EraList || []).forEach(era => {
            const option = document.createElement('option');
            option.value = era;
            option.textContent = (window.EraNames && window.EraNames[era]) || era;
            if (era === guildRaidsEra) option.selected = true;
            eraSelect.appendChild(option);
        });
    }

    const perTileSelect = document.getElementById('guildRaidsPerTileSelect');
    if (perTileSelect) perTileSelect.value = guildRaidsShowPerTile ? 'perTile' : 'total';

    modal.classList.add('active');
    renderGuildRaidsTable();
}

function closeGuildRaidsModal() {
    const modal = document.getElementById('guildRaidsModal');
    if (modal) modal.classList.remove('active');
}

function onGuildRaidsEraChange() {
    const select = document.getElementById('guildRaidsEraSelect');
    if (select) { guildRaidsEra = select.value; renderGuildRaidsTable(); }
}

function onGuildRaidsPerTileChange() {
    const select = document.getElementById('guildRaidsPerTileSelect');
    if (select) { guildRaidsShowPerTile = select.value === 'perTile'; renderGuildRaidsTable(); }
}

// Проверяет есть ли у здания guild_raids параметры:
// targetedFeature === 'guild_raids' ИЛИ type начинается на 'guild_raids_'
function hasGuildRaidsBoost(building) {
    try {
        const c = building.rawMeta.components;
        if (!c) return false;
        return Object.keys(c).some(era => {
            const boosts = c[era]?.boosts?.boosts;
            return Array.isArray(boosts) && boosts.some(b =>
                b.targetedFeature === 'guild_raids' ||
                (typeof b.type === 'string' && b.type.startsWith('guild_raids_'))
            );
        });
    } catch(e) { return false; }
}

function renderGuildRaidsTable() {
    const table = document.getElementById('guildRaidsTable');
    if (!table) return;
    table.classList.add('sticky-name');
    let thead = table.querySelector('thead');
    let tbody = table.querySelector('tbody');
    if (!thead) { thead = document.createElement('thead'); table.appendChild(thead); }
    if (!tbody) { tbody = document.createElement('tbody'); table.appendChild(tbody); }

    const allBuildings = window.allBuildings || [];
    const raidsData = allBuildings
        .filter(b => hasGuildRaidsBoost(b))
        .map(building => {
            const data = getBuildingDataForEra(building, guildRaidsEra);
            const coefficient = getBuildingTileCoefficient(building);
            return {
                id: building.id,
                name: building.name,
                size: building.size,
                coefficient: coefficient,
                boosts: data.boosts
            };
        });

    // Колонки: название | размер | только guild_raids бонусы
    const allColumns = [];
    allColumns.push({ type: 'name', key: 'name', label: getColumnName('name', 'Название') });
    allColumns.push({ type: 'size', key: 'size', label: getColumnName('size', 'Размер') });

    // Только guild_raids колонки: targetedFeature==='guild_raids' ИЛИ boostType начинается на 'guild_raids_'
    buildBoostColumns(raidsData)
        .filter(col => col.feature === 'guild_raids' || col.boostType.startsWith('guild_raids_'))
        .forEach(col => allColumns.push(col));

    // Заголовок
    thead.innerHTML = '';
    const headerRow = document.createElement('tr');
    allColumns.forEach(col => {
        const th = document.createElement('th');
        if (col.type === 'name') {
            th.textContent = col.label;
            th.dataset.sort = 'name';
        } else if (col.type === 'size') {
            th.textContent = col.label;
            th.dataset.sort = 'size';
            th.style.width = '1%';
            th.style.whiteSpace = 'nowrap';
        } else if (col.type === 'boost') {
            th.className = 'col-boost';
            th.dataset.sort = col.sortKey;
            th.style.textAlign = 'center';
            if (col.icon) {
                const img = document.createElement('img');
                img.src = col.icon;
                img.className = 'bonus-icon-img';
                th.appendChild(img);
                th.appendChild(document.createElement('br'));
            }
            th.appendChild(document.createTextNode(col.label));
        }
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);

    // Сортировка
    let sortedData = [...raidsData];
    if (guildRaidsSort.column) {
        sortedData.sort((a, b) => {
            let valA, valB;
            if (guildRaidsSort.column === 'name') { valA = a.name; valB = b.name; }
            else if (guildRaidsSort.column === 'size') {
                valA = a.size.width * a.size.length;
                valB = b.size.width * b.size.length;
            } else {
                // boost sort
                const col = allColumns.find(c => c.sortKey === guildRaidsSort.column);
                if (col) {
                    valA = findBoostValue(a.boosts, col);
                    valB = findBoostValue(b.boosts, col);
                    if (guildRaidsShowPerTile) {
                        if (valA !== null) valA = valA / a.coefficient;
                        if (valB !== null) valB = valB / b.coefficient;
                    }
                }
            }
            if (valA === valB) return 0;
            if (valA == null) return 1;
            if (valB == null) return -1;
            if (typeof valA === 'string') return guildRaidsSort.direction === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
            return guildRaidsSort.direction === 'asc' ? (valA < valB ? -1 : 1) : (valA < valB ? 1 : -1);
        });
    }

    // Классы сортировки
    thead.querySelectorAll('th').forEach(th => {
        th.classList.remove('sorted-asc', 'sorted-desc');
        if (th.dataset.sort === guildRaidsSort.column)
            th.classList.add(guildRaidsSort.direction === 'asc' ? 'sorted-asc' : 'sorted-desc');
    });

    // Строки
    tbody.innerHTML = '';
    if (sortedData.length === 0) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = allColumns.length;
        td.style.cssText = 'text-align:center;padding:20px;color:#888';
        td.textContent = 'Здания не найдены';
        tr.appendChild(td); tbody.appendChild(tr);
    } else {
        sortedData.forEach(b => {
            const row = document.createElement('tr');
            allColumns.forEach(col => {
                const td = document.createElement('td');
                if (col.type === 'name') {
                    const strong = document.createElement('strong');
                    strong.textContent = b.name;
                    td.appendChild(strong);
                } else if (col.type === 'size') {
                    td.textContent = `${b.size.width}x${b.size.length}`;
                    td.style.textAlign = 'center';
                    td.style.whiteSpace = 'nowrap';
                } else if (col.type === 'boost') {
                    td.style.textAlign = 'center';
                    td.style.fontWeight = 'bold';
                    td.style.color = '#f4a261';
                    const boostValue = findBoostValue(b.boosts, col);
                    td.textContent = boostValue !== null
                        const isPercent = !col.boostType.startsWith('guild_raids_');
td.textContent = boostValue !== null
    ? (guildRaidsShowPerTile
        ? (boostValue / b.coefficient).toFixed(2)
        : (isPercent ? `+${boostValue}%` : boostValue))
    : '—';
                }
                row.appendChild(td);
            });
            tbody.appendChild(row);
        });
    }

    // Сортировка по клику
    thead.querySelectorAll('th[data-sort]').forEach(th => {
        th.onclick = () => {
            const col = th.dataset.sort;
            if (guildRaidsSort.column === col) guildRaidsSort.direction = guildRaidsSort.direction === 'asc' ? 'desc' : 'asc';
            else { guildRaidsSort.column = col; guildRaidsSort.direction = 'asc'; }
            renderGuildRaidsTable();
        };
    });
}