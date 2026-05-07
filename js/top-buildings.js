// top-buildings.js - полный модуль для отображения таблицы топ зданий

(function() {
    // ========== РУЧНОЙ СПИСОК ПАРАМЕТРОВ С ГРУППИРОВКОЙ ==========
    // Группы: "production" - производство, "combat" - боевые, "battleground" - поля, 
    // "guild_expedition" - экспедиция, "guild_raids" - кванты, "other" - прочее
    
    const CUSTOM_PARAMS = [
        // ========== ПРОИЗВОДСТВО (production) ==========
        { group: "production", id: "population", rawId: "population", label: "👥 Население", fetch: (b, era) => getPopulation(b, era) },
        { group: "production", id: "happiness", rawId: "happiness", label: "😊 Счастье", fetch: (b, era) => getHappiness(b, era) },
        { group: "production", id: "prod_strategy_points", rawId: "strategy_points", label: "🥯 СО", fetch: (b, era) => getResourceTotal(b, era, "strategy_points") },
        { group: "production", id: "prod_medals", rawId: "medals", label: "🎖️ Медали", fetch: (b, era) => getResourceTotal(b, era, "medals") },
        { group: "production", id: "prod_money", rawId: "money", label: "💰 Монеты", fetch: (b, era) => getResourceTotal(b, era, "money") },
        { group: "production", id: "prod_supplies", rawId: "supplies", label: "⚒️ Молотки", fetch: (b, era) => getResourceTotal(b, era, "supplies") },
        { group: "production", id: "prod_all_goods_of_age", rawId: "all_goods_of_age", label: "📦 Товары эпохи", fetch: (b, era) => getResourceTotal(b, era, "all_goods_of_age") },
        { group: "production", id: "prod_all_goods_of_previous_age", rawId: "all_goods_of_previous_age", label: "📦 Товары пр. эпохи", fetch: (b, era) => getResourceTotal(b, era, "all_goods_of_previous_age") },
        { group: "production", id: "prod_next_age_goods", rawId: "next_age_goods", label: "📦 Товар след. эпохи", fetch: (b, era) => getNextAgeGoodsTotal(b, era) },
        { group: "production", id: "prod_special_goods", rawId: "each_special_goods_up_to_age", label: "✨ Спецтовар х8", fetch: (b, era) => getSpecialGoodsTotal(b, era) },
        { group: "production", id: "prod_random_special_good_up_to_age", rawId: "random_special_good_up_to_age", label: "🎲 Случайный спецтовар", fetch: (b, era) => getResourceTotal(b, era, "random_special_good_up_to_age") },
        
        // ========== БУСТЫ ПРОИЗВОДСТВА (production) ==========
        { group: "production", id: "boost_forge_points_production_all", rawId: "forge_points_production", label: "💰 Буст СО %", targetedFeature: "all", fetch: (b, era) => getBoostValue(b, era, "forge_points_production", "all") },
        { group: "production", id: "boost_coin_production_all", rawId: "coin_production", label: "💰 Буст монет %", targetedFeature: "all", fetch: (b, era) => getBoostValue(b, era, "coin_production", "all") },
        { group: "production", id: "boost_supply_production_all", rawId: "supply_production", label: "⚒️ Буст молотков %", targetedFeature: "all", fetch: (b, era) => getBoostValue(b, era, "supply_production", "all") },
        { group: "production", id: "boost_special_goods_production_all", rawId: "special_goods_production", label: "✨ Буст спецтовара %", targetedFeature: "all", fetch: (b, era) => getBoostValue(b, era, "special_goods_production", "all") },
        
        // ========== БОЕВЫЕ ВЕЗДЕ (combat) ==========
        { group: "combat", id: "boost_att_boost_attacker_all", rawId: "att_boost_attacker", label: "🔴 Атака (везде)", targetedFeature: "all", fetch: (b, era) => getBoostValue(b, era, "att_boost_attacker", "all") },
        { group: "combat", id: "boost_att_boost_defender_all", rawId: "att_boost_defender", label: "🔵 Атака (везде)", targetedFeature: "all", fetch: (b, era) => getBoostValue(b, era, "att_boost_defender", "all") },
        { group: "combat", id: "boost_def_boost_attacker_all", rawId: "def_boost_attacker", label: "🟥 Защита (везде)", targetedFeature: "all", fetch: (b, era) => getBoostValue(b, era, "def_boost_attacker", "all") },
        { group: "combat", id: "boost_def_boost_defender_all", rawId: "def_boost_defender", label: "🟦 Защита (везде)", targetedFeature: "all", fetch: (b, era) => getBoostValue(b, era, "def_boost_defender", "all") },
        
        // ========== ПОЛЯ (battleground) ==========
        { group: "battleground", id: "boost_att_boost_attacker_battleground", rawId: "att_boost_attacker", label: "🔴 Атака (поля)", targetedFeature: "battleground", fetch: (b, era) => getBoostValue(b, era, "att_boost_attacker", "battleground") },
        { group: "battleground", id: "boost_att_boost_defender_battleground", rawId: "att_boost_defender", label: "🔵 Атака (поля)", targetedFeature: "battleground", fetch: (b, era) => getBoostValue(b, era, "att_boost_defender", "battleground") },
        { group: "battleground", id: "boost_def_boost_attacker_battleground", rawId: "def_boost_attacker", label: "🟥 Защита (поля)", targetedFeature: "battleground", fetch: (b, era) => getBoostValue(b, era, "def_boost_attacker", "battleground") },
        { group: "battleground", id: "boost_def_boost_defender_battleground", rawId: "def_boost_defender", label: "🟦 Защита (поля)", targetedFeature: "battleground", fetch: (b, era) => getBoostValue(b, era, "def_boost_defender", "battleground") },
        
        // ========== ЭКСПЕДИЦИЯ (guild_expedition) ==========
        { group: "guild_expedition", id: "boost_att_boost_attacker_guild_expedition", rawId: "att_boost_attacker", label: "🔴 Атака (экспедиция)", targetedFeature: "guild_expedition", fetch: (b, era) => getBoostValue(b, era, "att_boost_attacker", "guild_expedition") },
        { group: "guild_expedition", id: "boost_att_boost_defender_guild_expedition", rawId: "att_boost_defender", label: "🔵 Атака (экспедиция)", targetedFeature: "guild_expedition", fetch: (b, era) => getBoostValue(b, era, "att_boost_defender", "guild_expedition") },
        { group: "guild_expedition", id: "boost_def_boost_attacker_guild_expedition", rawId: "def_boost_attacker", label: "🟥 Защита (экспедиция)", targetedFeature: "guild_expedition", fetch: (b, era) => getBoostValue(b, era, "def_boost_attacker", "guild_expedition") },
        { group: "guild_expedition", id: "boost_def_boost_defender_guild_expedition", rawId: "def_boost_defender", label: "🟦 Защита (экспедиция)", targetedFeature: "guild_expedition", fetch: (b, era) => getBoostValue(b, era, "def_boost_defender", "guild_expedition") },
        
        // ========== КВАНТЫ (guild_raids) ==========
        { group: "guild_raids", id: "boost_att_boost_attacker_guild_raids", rawId: "att_boost_attacker", label: "🔴 Атака (КВА)", targetedFeature: "guild_raids", fetch: (b, era) => getBoostValue(b, era, "att_boost_attacker", "guild_raids") },
        { group: "guild_raids", id: "boost_att_boost_defender_guild_raids", rawId: "att_boost_defender", label: "🔵 Атака (КВА)", targetedFeature: "guild_raids", fetch: (b, era) => getBoostValue(b, era, "att_boost_defender", "guild_raids") },
        { group: "guild_raids", id: "boost_guild_raids_action_points_collection_all", rawId: "guild_raids_action_points_collection", label: "⚔️ Очки гильдии", targetedFeature: "all", fetch: (b, era) => getBoostValue(b, era, "guild_raids_action_points_collection", "all") },
        { group: "guild_raids", id: "boost_guild_raids_defense_boost_all", rawId: "guild_raids_defense_boost", label: "🏰 Бонус защиты гильдии", targetedFeature: "all", fetch: (b, era) => getBoostValue(b, era, "guild_raids_defense_boost", "all") }
    ];

    // ========== НАЗВАНИЯ ГРУПП ДЛЯ СЕЛЕКТА ==========
    const GROUP_NAMES = {
        "production": "🏭 Производство",
        "combat": "⚔️ Боевые (везде)",
        "battleground": "🏁 Поля",
        "guild_expedition": "🏛️ Экспедиция",
        "guild_raids": "⚔️ Кванты"
    };

    // ========== ПОРЯДОК ЭПОХ ==========
    const ERA_ORDER = [
        "BronzeAge", "IronAge", "EarlyMiddleAge", "HighMiddleAge", "LateMiddleAge",
        "ColonialAge", "IndustrialAge", "ProgressiveEra", "ModernEra", "PostModernEra",
        "ContemporaryEra", "TomorrowEra", "FutureEra", "ArcticFuture", "OceanicFuture",
        "VirtualFuture", "SpaceAgeMars", "SpaceAgeAsteroidBelt", "SpaceAgeVenus",
        "SpaceAgeJupiterMoon", "SpaceAgeTitan", "SpaceAgeSpaceHub"
    ];

    const ERA_NAMES = {
        "BronzeAge": "🏺 Бронзовый век",
        "IronAge": "⚔️ Железный век",
        "EarlyMiddleAge": "🏰 Раннее средневековье",
        "HighMiddleAge": "⚜️ Высокое средневековье",
        "LateMiddleAge": "🛡️ Позднее средневековье",
        "ColonialAge": "⛵ Колониальная эпоха",
        "IndustrialAge": "🏭 Индустриальная эпоха",
        "ProgressiveEra": "🎷 Прогрессивная эра",
        "ModernEra": "🏢 Современная эра",
        "PostModernEra": "📱 Постмодерн",
        "ContemporaryEra": "💻 Современность",
        "TomorrowEra": "🚀 Эра завтрашнего дня",
        "FutureEra": "🤖 Будущая эра",
        "ArcticFuture": "❄️ Арктическое будущее",
        "OceanicFuture": "🌊 Океаническое будущее",
        "VirtualFuture": "🕶️ Виртуальное будущее",
        "SpaceAgeMars": "🔴 Космическая эра (Марс)",
        "SpaceAgeAsteroidBelt": "🪨 Космическая эра (Пояс астероидов)",
        "SpaceAgeVenus": "🟠 Космическая эра (Венера)",
        "SpaceAgeJupiterMoon": "🪐 Космическая эра (Спутники Юпитера)",
        "SpaceAgeTitan": "🌑 Космическая эра (Титан)",
        "SpaceAgeSpaceHub": "🚀 Космическая эра (Космический хаб)"
    };

    // Функция для спецтоваров (умножает значение на 8)
    function getSpecialGoodsTotal(building, era) {
        const value = getResourceTotal(building, era, "each_special_goods_up_to_age");
        return value * 8;
    }
    
    function getHumanEraName(eraId) {
        return ERA_NAMES[eraId] || eraId;
    }

    function sortEras(erasArray) {
        return erasArray.sort((a, b) => {
            const indexA = ERA_ORDER.indexOf(a);
            const indexB = ERA_ORDER.indexOf(b);
            if (indexA === -1 && indexB === -1) return a.localeCompare(b);
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
        });
    }

    function getValueByPath(obj, path) {
        if (!obj || !path) return undefined;
        const parts = path.split('.');
        let current = obj;
        for (const part of parts) {
            if (current === null || current === undefined) return undefined;
            if (typeof current === 'object' && part in current) current = current[part];
            else return undefined;
        }
        return current;
    }

    function getPopulation(building, era) {
        return getValueByPath(building, `components.${era}.staticResources.resources.resources.population`) ?? 0;
    }

    function getHappiness(building, era) {
        return getValueByPath(building, `components.${era}.happiness.provided`) ?? 0;
    }

    function getArea(building) {
        const x = building?.components?.AllAge?.placement?.size?.x ?? 0;
        const y = building?.components?.AllAge?.placement?.size?.y ?? 0;
        return x * y;
    }

    function getSizeX(building) {
        return building?.components?.AllAge?.placement?.size?.x ?? 0;
    }

    function getSizeY(building) {
        return building?.components?.AllAge?.placement?.size?.y ?? 0;
    }

    function getRoadRequirement(building) {
        return building?.components?.AllAge?.streetConnectionRequirement?.requiredLevel ?? 0;
    }

    function getEffectiveArea(building) {
        const area = getArea(building);
        const roadRequired = getRoadRequirement(building);
        
        if (roadRequired > 0) {
            const shortSide = Math.min(getSizeX(building), getSizeY(building));
            const halfShortSide = shortSide / 2;
            return area + halfShortSide;
        }
        return area;
    }

    function getValuePerTile(building, era, paramDef) {
        let rawValue = paramDef.fetch(building, era);
        if (typeof rawValue !== 'number') rawValue = 0;
        
        const effectiveArea = getEffectiveArea(building);
        if (effectiveArea <= 0) return rawValue;
        
        return rawValue / effectiveArea;
    }

    function findBoost(boostsArr, boostType, targetedFeature) {
        if (!Array.isArray(boostsArr)) return null;
        return boostsArr.find(b => {
            const bTargeted = b.targetedFeature || "all";
            return b.type === boostType && bTargeted === targetedFeature;
        });
    }

    function getBoostValue(building, era, boostType, targetedFeature) {
        // Сначала ищем в выбранной эпохе
        let boostsArr = building?.components?.[era]?.boosts?.boosts;
        let found = findBoost(boostsArr, boostType, targetedFeature);
        
        // Если не нашли и эпоха не AllAge, ищем в AllAge
        if (!found && era !== 'AllAge') {
            boostsArr = building?.components?.AllAge?.boosts?.boosts;
            found = findBoost(boostsArr, boostType, targetedFeature);
        }
        
        return found && typeof found.value === 'number' ? found.value : 0;
    }

    function extractFromProduction(production, resourceName) {
        if (!production || !Array.isArray(production.options)) return 0;
        let sum = 0;
        for (const opt of production.options) {
            if (!Array.isArray(opt?.products)) continue;
            for (const prod of opt.products) {
                if (prod.type === 'resources' && prod.playerResources?.resources) {
                    const val = prod.playerResources.resources[resourceName];
                    if (typeof val === 'number') sum += val;
                }
                if (prod.type === 'random' && Array.isArray(prod.products)) {
                    for (const randEntry of prod.products) {
                        const sub = randEntry.product;
                        if (sub?.type === 'resources' && sub.playerResources?.resources) {
                            const subVal = sub.playerResources.resources[resourceName];
                            if (typeof subVal === 'number') sum += subVal * (randEntry.dropChance || 1);
                        }
                    }
                }
            }
        }
        return sum;
    }

    function getResourceTotal(building, era, resourceName) {
        // Сначала проверяем выбранную эпоху
        const eraProduction = building?.components?.[era]?.production;
        if (eraProduction) {
            return extractFromProduction(eraProduction, resourceName);
        }
        
        // Если в эпохе нет production, берём из AllAge
        const allAgeProduction = building?.components?.AllAge?.production;
        if (allAgeProduction) {
            return extractFromProduction(allAgeProduction, resourceName);
        }
        
        return 0;
    }

    // Функция для суммирования товаров следующей эпохи
    function getNextAgeGoodsTotal(building, era) {
        const allGoods = getResourceTotal(building, era, "all_goods_of_next_age");
        const randomGoods = getResourceTotal(building, era, "random_good_of_next_age");
        return allGoods + randomGoods;
    }

    class TopBuildingsTable {
        constructor(containerId, jsonUrl = 'https://foehelp.ru/building.json') {
            this.container = document.getElementById(containerId);
            this.jsonUrl = jsonUrl;
            this.buildings = [];
            this.currentOrder = "desc";
            this.perTileMode = false;
            this.init();
        }

        renderHTML() {
            this.container.innerHTML = `
                <style>
                    .top-buildings-container * { box-sizing: border-box; font-family: system-ui, 'Segoe UI', 'Roboto', sans-serif; }
                    .top-buildings-container { background: transparent; padding: 0; }
                    .top-card { background: var(--box-bg, #2d2d34); border: 1px solid var(--border-color, #45454b); border-radius: 0 0 16px 16px; overflow: hidden; }
                    
                    .top-controls-row {
                        display: flex;
                        flex-wrap: wrap;
                        gap: 16px;
                        padding: 16px 20px;
                        background: rgba(0,0,0,0.2);
                        border-bottom: 1px solid var(--border-color, #45454b);
                        align-items: flex-end;
                    }
                    .top-ctrl-group {
                        display: flex;
                        flex-direction: column;
                        gap: 4px;
                    }
                    .top-ctrl-group label {
                        font-size: 0.65rem;
                        font-weight: 700;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                        color: var(--accent-color, #66fcf1);
                    }
                    .top-ctrl-group select {
                        background: #333;
                        border: 1px solid var(--border-color, #45454b);
                        padding: 8px 12px;
                        border-radius: 8px;
                        font-size: 0.8rem;
                        font-weight: 500;
                        cursor: pointer;
                        color: var(--text-color, #c5c6c7);
                    }
                    .top-ctrl-group select:hover {
                        border-color: var(--accent-color, #66fcf1);
                    }
                    .top-ctrl-group.limit-group {
                        width: 100px;
                    }
                    .top-ctrl-group.checkbox-group {
                        flex-direction: row;
                        align-items: center;
                        gap: 8px;
                        margin-left: auto;
                    }
                    .top-ctrl-group.checkbox-group label {
                        cursor: pointer;
                        margin-bottom: 0;
                    }
                    .top-ctrl-group.checkbox-group input {
                        width: 18px;
                        height: 18px;
                        cursor: pointer;
                        accent-color: var(--accent-color, #66fcf1);
                    }
                    
                    .top-table-wrapper {
                        margin: 16px 20px 20px 20px;
                        overflow-x: auto;
                        overflow-y: auto;
                        max-height: 55vh;
                        border-radius: 12px;
                        border: 1px solid var(--border-color, #45454b);
                    }
                    .top-table {
                        width: 100%;
                        border-collapse: collapse;
                        font-size: 0.85rem;
                    }
                    .top-table th {
                        background: rgba(65,105,225,0.2);
                        padding: 12px 12px;
                        text-align: left;
                        font-weight: 700;
                        color: #4169e1;
                        border-bottom: 1px solid var(--border-color, #45454b);
                        position: sticky;
                        top: 0;
                        background-color: var(--box-bg, #2d2d34);
                    }
                    .top-table td {
                        padding: 10px 12px;
                        border-bottom: 1px solid rgba(255,255,255,0.05);
                        color: var(--text-color, #c5c6c7);
                    }
                    .top-table tr:hover td {
                        background: rgba(102,252,241,0.05);
                    }
                    .top-building-name {
                        font-weight: 600;
                        color: var(--text-color, #c5c6c7);
                        word-break: break-word;
                        white-space: normal;
                        max-width: 280px;
                    }
                    .top-rank-col {
                        width: 50px;
                        text-align: center;
                    }
                    .top-value-col {
                        width: 140px;
                        text-align: right;
                    }
                    .top-param-number {
                        font-family: 'SF Mono', monospace;
                        font-weight: 600;
                        color: var(--accent-color, #66fcf1);
                        text-align: right;
                        display: block;
                    }
                    .top-empty-row td {
                        text-align: center;
                        color: #666;
                        padding: 40px;
                    }
                    .top-sort-header {
                        cursor: pointer;
                        user-select: none;
                    }
                    .top-sort-header:hover {
                        background: rgba(65,105,225,0.3);
                    }
                    .top-sort-indicator {
                        margin-left: 6px;
                        font-size: 0.7rem;
                        display: inline-block;
                    }
                    
                    @media (max-width: 768px) {
                        .top-controls-row {
                            flex-wrap: wrap;
                            gap: 12px;
                        }
                        .top-ctrl-group {
                            min-width: calc(50% - 60px);
                        }
                        .top-ctrl-group.limit-group {
                            width: auto;
                            min-width: 100px;
                        }
                        .top-ctrl-group.checkbox-group {
                            margin-left: 0;
                            width: 100%;
                            justify-content: flex-start;
                        }
                        .top-building-name {
                            max-width: 160px;
                        }
                        .top-table-wrapper {
                            max-height: 50vh;
                        }
                    }
                </style>
                <div class="top-buildings-container">
                    <div class="top-card">
                        <div class="top-controls-row">
                            <div class="top-ctrl-group">
                                <label>📂 КАТЕГОРИЯ</label>
                                <select id="topGroupSelect"></select>
                            </div>
                            <div class="top-ctrl-group">
                                <label>📊 ПАРАМЕТР</label>
                                <select id="topParamSelect"></select>
                            </div>
                            <div class="top-ctrl-group limit-group">
                                <label>📋 ТОП</label>
                                <select id="topLimitSelect">
                                    <option value="10">10</option>
                                    <option value="20" selected>20</option>
                                    <option value="50">50</option>
                                    <option value="100">100</option>
                                </select>
                            </div>
                            <div class="top-ctrl-group checkbox-group">
                                <input type="checkbox" id="perTileCheckbox">
                                <label for="perTileCheckbox">📐 На клетку</label>
                            </div>
                        </div>
                        <div class="top-table-wrapper">
                            <table class="top-table" id="topRankingTable">
                                <thead>
                                    <tr>
                                        <th class="top-rank-col">#</th>
                                        <th>Название здания</th>
                                        <th class="top-value-col top-sort-header" id="topValueHeader">📊 Значение <span class="top-sort-indicator">▼</span></th>
                                    </tr>
                                </thead>
                                <tbody id="topTableBody"><tr class="top-empty-row"><td colspan="3">Загрузка данных...</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;
        }

        bindEvents() {
    this.groupSelect = document.getElementById('topGroupSelect');
    this.paramSelect = document.getElementById('topParamSelect');
    this.eraSelect = document.getElementById('topEraSelect');
    this.limitSelect = document.getElementById('topLimitSelect');
    this.perTileCheckbox = document.getElementById('perTileCheckbox');
    this.tableBody = document.getElementById('topTableBody');
    this.valueHeader = document.getElementById('topValueHeader');
    
    if (this.valueHeader) {
        this.valueHeader.addEventListener('click', () => {
            this.currentOrder = this.currentOrder === 'desc' ? 'asc' : 'desc';
            const indicator = this.valueHeader.querySelector('.top-sort-indicator');
            if (indicator) indicator.innerHTML = this.currentOrder === 'desc' ? '▼' : '▲';
            this.buildTop();
        });
    }
    
    if (this.groupSelect) this.groupSelect.addEventListener('change', () => this.updateParamSelect());
    if (this.paramSelect) this.paramSelect.addEventListener('change', () => this.buildTop());
    if (this.eraSelect) this.eraSelect.addEventListener('change', () => this.buildTop());
    if (this.limitSelect) this.limitSelect.addEventListener('change', () => this.buildTop());
    if (this.perTileCheckbox) this.perTileCheckbox.addEventListener('change', () => this.buildTop());
}

        updateParamSelect() {
            const selectedGroup = this.groupSelect.value;
            const filteredParams = CUSTOM_PARAMS.filter(p => p.group === selectedGroup);
            
            this.paramSelect.innerHTML = '';
            filteredParams.forEach(param => {
                const option = document.createElement('option');
                option.value = param.id;
                option.textContent = param.label;
                this.paramSelect.appendChild(option);
            });
            
            this.buildTop();
        }

        aasync loadData() {
    this.tableBody.innerHTML = '<tr class="top-empty-row"><td colspan="3">Загрузка данных...<\/tr>';
    try {
        const response = await fetch(this.jsonUrl);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const rawData = await response.json();
        let buildings = [];
        if (rawData && typeof rawData === 'object' && !Array.isArray(rawData)) buildings = Object.values(rawData);
        else if (Array.isArray(rawData)) buildings = rawData;
        else throw new Error('Формат JSON не распознан');
        if (buildings.length === 0) throw new Error('Нет данных о зданиях');
        
        this.buildings = buildings;
        
        const eraSet = new Set();
        for (const b of this.buildings) if (b.components) Object.keys(b.components).forEach(era => eraSet.add(era));
        let eraArray = Array.from(eraSet);
        eraArray = sortEras(eraArray);
        
        // ПОЛУЧАЕМ ЭЛЕМЕНТ ПЕРЕД ЗАПОЛНЕНИЕМ
        this.eraSelect = document.getElementById('topEraSelect');
        this.eraSelect.innerHTML = '';
        eraArray.forEach(era => {
            const option = document.createElement('option');
            option.value = era;
            option.textContent = getHumanEraName(era);
            if (era === 'SpaceAgeSpaceHub') option.selected = true;
            this.eraSelect.appendChild(option);
        });
        
        // Заполнение селекта групп
        this.groupSelect = document.getElementById('topGroupSelect');
        this.groupSelect.innerHTML = '';
        const groups = [...new Set(CUSTOM_PARAMS.map(p => p.group))];
        groups.forEach(group => {
            const option = document.createElement('option');
            option.value = group;
            option.textContent = GROUP_NAMES[group] || group;
            this.groupSelect.appendChild(option);
        });
        
        // Заполнение параметров по выбранной группе
        this.updateParamSelect();
        
        this.buildTop();
    } catch (err) {
        console.error(err);
        this.tableBody.innerHTML = `<tr class="top-empty-row"><td colspan="3">❌ Ошибка: ${err.message}<\/tr>`;
    }
}

        buildTop() {
            if (!this.buildings.length) return;
            const era = this.eraSelect.value;
            const paramId = this.paramSelect.value;
            const limit = parseInt(this.limitSelect.value, 10);
            const perTileMode = this.perTileCheckbox ? this.perTileCheckbox.checked : false;
            
            const paramDef = CUSTOM_PARAMS.find(p => p.id === paramId);
            if (!paramDef) return;
            
            const items = [];
            for (const building of this.buildings) {
                let value;
                if (perTileMode) {
                    value = getValuePerTile(building, era, paramDef);
                } else {
                    value = paramDef.fetch(building, era);
                    if (typeof value !== 'number') value = 0;
                }
                items.push({ building, value, name: building.name || 'Без названия' });
            }
            
            const sorted = [...items].sort((a,b) => this.currentOrder === 'desc' ? b.value - a.value : a.value - b.value);
            const topList = sorted.slice(0, limit);
            
            if (topList.length === 0) {
                this.tableBody.innerHTML = '<tr class="top-empty-row"><td colspan="3">Нет данных</td></tr>';
                return;
            }
            
            let html = '';
            for (let i = 0; i < topList.length; i++) {
                const item = topList[i];
                const rank = i+1;
                let valFormatted;
                if (perTileMode && typeof item.value === 'number') {
                    valFormatted = item.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                } else {
                    valFormatted = typeof item.value === 'number' ? item.value.toLocaleString() : item.value;
                }
                html += `<tr>
                    <td class="top-rank-col" style="text-align:center; font-weight:500;">${rank}</td>
                    <td class="top-building-name">${this.escapeHtml(item.name)}</td>
                    <td class="top-value-col"><span class="top-param-number">${valFormatted}</span></td>
                </tr>`;
            }
            this.tableBody.innerHTML = html;
            
            if (this.valueHeader) {
                const indicator = this.valueHeader.querySelector('.top-sort-indicator');
                const modeText = perTileMode ? ' (К)' : '';
                this.valueHeader.innerHTML = `Значение${modeText} <span class="top-sort-indicator">${this.currentOrder === 'desc' ? '▼' : '▲'}</span>`;
            }
        }

        escapeHtml(str) {
            if (!str) return '';
            return str.replace(/[&<>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m]));
        }

        refresh() {
            this.buildTop();
        }

        async init() {
            this.renderHTML();
            this.bindEvents();
            await this.loadData();
        }
    }

    if (typeof window !== 'undefined') {
        window.TopBuildingsTable = TopBuildingsTable;
    }
})();