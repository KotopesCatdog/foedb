// === ВОСПРОИЗВЕДЕНИЕ ЗВУКОВ ===
let soundAdd = null;
let soundRemove = null;

function initSounds() {
    try {
        // Звук добавления
        soundAdd = new Audio();
        soundAdd.src = './js/snd.mp3';  // Путь к звуку добавления
        soundAdd.volume = 0.5;
        soundAdd.preload = 'auto';
        soundAdd.load();
        
        // Звук удаления
        soundRemove = new Audio();
        soundRemove.src = './js/snd1.mp3';  // Путь к звуку удаления
        soundRemove.volume = 0.5;
        soundRemove.preload = 'auto';
        soundRemove.load();
    } catch (e) {
        console.log('Ошибка загрузки звуков:', e);
    }
}

function playAddSound() {
    if (!soundAdd) initSounds();
    try {
        if (soundAdd) {
            soundAdd.pause();
            soundAdd.currentTime = 0;
            soundAdd.play().catch(e => console.log('Звук добавления не воспроизведен:', e));
        }
    } catch (e) {
        console.log('Ошибка воспроизведения звука добавления:', e);
    }
}

function playRemoveSound() {
    if (!soundRemove) initSounds();
    try {
        if (soundRemove) {
            soundRemove.pause();
            soundRemove.currentTime = 0;
            soundRemove.play().catch(e => console.log('Звук удаления не воспроизведен:', e));
        }
    } catch (e) {
        console.log('Ошибка воспроизведения звука удаления:', e);
    }
}

// === ПОИСК ПО ПРОДУКЦИИ (исправленная версия) ===
function findProductionByMask(building, searchMask) {
    if (!searchMask || searchMask.length < 2) return null;
    
    const maskLower = searchMask.toLowerCase();
    const results = {
        productions: [],
        randomProductions: []
    };
    
    const matchesMask = (text) => {
        if (!text) return false;
        return text.toLowerCase().includes(maskLower);
    };
    
    // Рекурсивный поиск по всем наградам в lookup
    const searchInLookupRewards = (lookupComponent, searchMask) => {
        if (!lookupComponent || !lookupComponent.rewards) return [];
        const found = [];
        
        for (const [rewardId, rewardData] of Object.entries(lookupComponent.rewards)) {
            // Проверяем название награды
            if (matchesMask(rewardData.name)) {
                found.push({
                    rewardId: rewardId,
                    rewardName: rewardData.name,
                    rewardType: rewardData.subType || rewardData.type,
                    amount: rewardData.amount || 1,
                    requiredAmount: rewardData.requiredAmount,
                    isFragment: rewardData.subType === 'fragment'
                });
            }
            
            // Если это фрагмент, проверяем assembledReward
            if (rewardData.assembledReward) {
                const assembled = rewardData.assembledReward;
                if (matchesMask(assembled.name)) {
                    found.push({
                        rewardId: assembled.id,
                        rewardName: assembled.name,
                        rewardType: assembled.subType || assembled.type,
                        amount: rewardData.amount || 1,
                        isAssembled: true
                    });
                }
            }
        }
        return found;
    };
    
    const checkEraComponents = (components) => {
        if (!components) return;
        
        for (const [era, eraData] of Object.entries(components)) {
            // Проверяем production
            if (eraData.production && eraData.production.options) {
                for (const option of eraData.production.options) {
                    if (option.products) {
                        for (const product of option.products) {
                            // Проверка обычных ресурсов (resources / guildResources)
                            const resObj = product.type === 'resources'
                                ? product.playerResources?.resources
                                : product.type === 'guildResources'
                                    ? product.guildResources?.resources
                                    : null;
                            if (resObj) {
                                const aliases = {
                                    supplies:         ['припасы', 'supplies'],
                                    money:            ['монеты', 'деньги', 'money', 'coins'],
                                    medals:           ['медали', 'medals'],
                                    strategy_points:  ['очки форжа', 'фп', 'fp', 'strategy_points', 'forge points'],
                                    clan_power:       ['мощь гильдии', 'clan_power', 'guild power'],
                                    goods:            ['товары', 'goods'],
                                    all_goods_of_age: ['товары', 'goods', 'all_goods_of_age'],
                                };
                                for (const [resKey, resVal] of Object.entries(resObj)) {
                                    const names = aliases[resKey] || [resKey];
                                    if (names.some(n => n.toLowerCase().includes(maskLower) || maskLower.includes(n.toLowerCase()))) {
                                        results.productions.push({
                                            era,
                                            rewardId: resKey,
                                            rewardName: resKey,
                                            rewardType: product.type,
                                            amount: resVal,
                                            time: option.time || null,
                                            optionName: option.name || null
                                        });
                                    }
                                }
                            }

                            // Проверка genericReward
                            if (product.type === 'genericReward' && product.reward) {
                                const rewardId = product.reward.id;
                                let rewardName = '';
                                let rewardType = '';
                                
                                // Ищем название в lookup
                                if (eraData.lookup && eraData.lookup.rewards && eraData.lookup.rewards[rewardId]) {
                                    const rewardData = eraData.lookup.rewards[rewardId];
                                    rewardName = rewardData.name;
                                    rewardType = rewardData.subType || rewardData.type;
                                    
                                    // Если это фрагмент, проверяем assembledReward
                                    if (rewardData.assembledReward && matchesMask(rewardData.assembledReward.name)) {
                                        results.productions.push({
                                            era: era,
                                            rewardId: rewardData.assembledReward.id,
                                            rewardName: rewardData.assembledReward.name,
                                            rewardType: rewardData.assembledReward.subType,
                                            amount: rewardData.amount || 1,
                                            dropChance: product.dropChance || null,
                                            isFragment: true
                                        });
                                    }
                                } else {
                                    rewardName = rewardId;
                                }
                                
                                if (matchesMask(rewardName)) {
                                    results.productions.push({
                                        era: era,
                                        rewardId: rewardId,
                                        rewardName: rewardName,
                                        rewardType: rewardType,
                                        amount: product.reward.amount || 1,
                                        dropChance: product.dropChance || null
                                    });
                                }
                            }
                            
                            // Проверка random продукции
                            if (product.type === 'random' && product.products) {
                                for (const randomProd of product.products) {
                                    if (randomProd.product && randomProd.product.reward) {
                                        const reward = randomProd.product.reward;
                                        const rewardId = reward.id;
                                        let rewardName = '';
                                        let rewardType = '';
                                        
                                        // Ищем название в lookup
                                        if (eraData.lookup && eraData.lookup.rewards && eraData.lookup.rewards[rewardId]) {
                                            const rewardData = eraData.lookup.rewards[rewardId];
                                            rewardName = rewardData.name;
                                            rewardType = rewardData.subType || rewardData.type;
                                            
                                            // Если это фрагмент, проверяем assembledReward
                                            if (rewardData.assembledReward && matchesMask(rewardData.assembledReward.name)) {
                                                results.randomProductions.push({
                                                    era: era,
                                                    rewardId: rewardData.assembledReward.id,
                                                    rewardName: rewardData.assembledReward.name,
                                                    rewardType: rewardData.assembledReward.subType,
                                                    amount: rewardData.amount || 1,
                                                    dropChance: randomProd.dropChance || product.dropChance,
                                                    isFragment: true
                                                });
                                            }
                                        } else {
                                            rewardName = reward.name || rewardId;
                                        }
                                        
                                        if (matchesMask(rewardName)) {
                                            results.randomProductions.push({
                                                era: era,
                                                rewardId: rewardId,
                                                rewardName: rewardName,
                                                rewardType: rewardType,
                                                amount: reward.amount || 1,
                                                dropChance: randomProd.dropChance || product.dropChance
                                            });
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            
            // Дополнительно проверяем lookup напрямую
            if (eraData.lookup) {
                const lookupRewards = searchInLookupRewards(eraData.lookup, searchMask);
                for (const reward of lookupRewards) {
                    results.productions.push({
                        era: era,
                        ...reward,
                        fromLookup: true
                    });
                }
            }
        }
    };
    
    if (building.rawMeta?.components) {
        checkEraComponents(building.rawMeta.components);
    }
    
    // Дополнительно проверяем entity_levels (здания is_multi_age и обычные production-здания)
    // Эти здания хранят продукцию в entity_levels[eraId].production_values, а не в components
    if (results.productions.length === 0 && results.randomProductions.length === 0) {
        const entityLevels = building.rawMeta?.entity_levels;
        if (Array.isArray(entityLevels)) {
            // Словарь типов продукции для поиска по русским и английским названиям
            const productionTypeNames = {
                'supplies':        ['припасы', 'supplies'],
                'money':           ['монеты', 'деньги', 'money', 'coins'],
                'medals':          ['медали', 'medals'],
                'strategy_points': ['очки форжа', 'фп', 'strategy_points', 'forge points', 'fp'],
                'clan_power':      ['мощь гильдии', 'clan_power', 'guild power'],
                'goods':           ['товары', 'goods'],
            };
            
            for (const level of entityLevels) {
                if (!level.production_values || !Array.isArray(level.production_values)) continue;
                for (const pv of level.production_values) {
                    if (!pv.type || !pv.value || pv.value <= 0) continue;
                    // Проверяем, совпадает ли запрос с типом ресурса
                    const aliases = productionTypeNames[pv.type] || [pv.type];
                    const matched = aliases.some(alias => alias.toLowerCase().includes(maskLower) || maskLower.includes(alias.toLowerCase()));
                    if (matched) {
                        results.productions.push({
                            era: level.era || 'unknown',
                            rewardId: pv.type,
                            rewardName: pv.type,
                            rewardType: 'resources',
                            amount: pv.value,
                            fromEntityLevels: true
                        });
                        break; // достаточно одного совпадения на уровень
                    }
                }
            }
        }
    }
    
    return results.productions.length > 0 || results.randomProductions.length > 0 ? results : null;
}

// === ОТРИСОВКА РЕЗУЛЬТАТОВ ===
function renderResults(buildings) {
    const resultsGrid = document.getElementById('resultsGrid');
    resultsGrid.innerHTML = '';
    
    if (buildings.length === 0) {
        resultsGrid.innerHTML = '<div class="no-results">Ничего не найдено</div>';
        return;
    }
    
    // Уникальные по имени
    const uniqueBuildingsMap = new Map();
    buildings.forEach(b => {
        if (!uniqueBuildingsMap.has(b.name)) uniqueBuildingsMap.set(b.name, b);
    });
    const uniqueBuildings = Array.from(uniqueBuildingsMap.values());
    
    const limit = 2000;
    const toRender = uniqueBuildings.length > limit ? uniqueBuildings.slice(0, limit) : uniqueBuildings;
    const longPressDuration = basketConfig?.settings?.longPressDuration || 700;
    
    // Получаем текущий поисковый запрос для продукции
    const productionSearchTerm = window.currentProductionSearch || '';
    
    toRender.forEach(b => {
        const card = document.createElement('div');
        card.className = 'building-card';

        if (b.type) {
            card.classList.add('type-' + b.type.replace(/_/g, '-'));
        }

        const isInBasket = basket.some(item => item.id === b.id);
        if (isInBasket) card.classList.add('in-basket');
        card.dataset.id = b.id;
        
        const baseData = getBuildingDataForEra(b, b.baseEra);
        const popClass = baseData.population > 0 ? 'positive' : (baseData.population < 0 ? 'negative' : 'neutral');
        const popSign = baseData.population > 0 ? '+' : '';
        
        const expireHtml = b.expireDays ? `<span style="color:#ffa500; font-size:11px; margin-left:5px; white-space:nowrap;">${b.expireDays} дн.</span>` : '';
card.innerHTML = `<div class="card-header"><div class="card-title" title="${b.name}">${b.name}${expireHtml}</div></div><div class="card-size">${b.size.length}×${b.size.width}</div><div class="tooltip-box"></div>`;
        
        
        
        // Long press для добавления/удаления из корзины
        let pressTimer;
        card.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return;
            pressTimer = setTimeout(() => {
                const isInBasket = basket.some(item => item.id === b.id);
                
                if (isInBasket) {
                    removeFromBasket(b.id);
                    showToast(`"${b.name}" удалено из корзины`, false, 'remove');
                    card.classList.remove('added', 'in-basket');
                } else {
                    addToBasket(b);
                    showToast(`"${b.name}" добавлено в корзину`, false, 'add');
                    card.classList.add('added');
                    setTimeout(() => card.classList.remove('added'), 500);
                }
            }, longPressDuration);
        });
        card.addEventListener('mouseup', () => { clearTimeout(pressTimer); });
        card.addEventListener('mouseleave', () => { clearTimeout(pressTimer); });
        
        // НАВЕДЕНИЕ: всегда показываем тултип
        card.addEventListener('mouseenter', () => {
            if (!window.activeBuildingIds || !window.activeBuildingIds.has(b.id)) {
                updateTooltipContent(card, b, true);
            }
        });
        
        card.addEventListener('mouseleave', () => {
            if (!window.activeBuildingIds || !window.activeBuildingIds.has(b.id)) {
                card.classList.remove('hover-active');
                const tooltip = card.querySelector('.tooltip-box');
                if (tooltip) tooltip.style.display = 'none';
            }
        });
        
        // КЛИК: фиксируем/открепляем тултип
        card.addEventListener('click', (e) => {
            if (card.classList.contains('added')) return;
            e.stopPropagation();
            
            if (!window.activeBuildingIds) {
                window.activeBuildingIds = new Set();
            }
            
            if (window.activeBuildingIds.has(b.id)) {
                window.activeBuildingIds.delete(b.id);
                if (window.activeEraOverrides) {
                    delete window.activeEraOverrides[b.id];
                }
                card.classList.remove('active');
                const tooltip = card.querySelector('.tooltip-box');
                if (tooltip) tooltip.style.display = 'none';
                return;
            }
            
            window.activeBuildingIds.add(b.id);
            window.activeEraOverrides = window.activeEraOverrides || {};
            window.activeEraOverrides[b.id] = b.availableEras?.[0] || b.baseEra;
            card.classList.add('active');
            card.classList.remove('hover-active');
            updateTooltipContent(card, b, false);
        });
        
        const tooltip = card.querySelector('.tooltip-box');
        if (tooltip) {
            tooltip.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }
        
        resultsGrid.appendChild(card);
    });
    
    if (uniqueBuildings.length > limit) {
        const more = document.createElement('div');
        more.className = 'no-results';
        more.textContent = `... показано ${limit} из ${uniqueBuildings.length}. Уточните поиск.`;
        more.style.gridColumn = "1 / -1";
        resultsGrid.appendChild(more);
    }
}

// === ОБНОВЛЕНИЕ ТУЛТИПА ===
function updateTooltipContent(card, building, isHover = false) {
    const tooltip = card.querySelector('.tooltip-box');
    if (!tooltip) return;
    
    if (!building || !building.id) {
        console.warn('updateTooltipContent: building data is invalid');
        return;
    }
    
    if (!window.activeEraOverrides) {
        window.activeEraOverrides = {};
    }
    
    let currentEra;
    const buildingId = building.id;
    
    if (window.activeEraOverrides[buildingId] && building.availableEras?.includes(window.activeEraOverrides[buildingId])) {
        currentEra = window.activeEraOverrides[buildingId];
    } else {
        currentEra = building.availableEras?.[0] || building.baseEra;
    }
    
    if (typeof getBuildingDataForEra !== 'function') {
        console.error('getBuildingDataForEra function not found');
        tooltip.innerHTML = '<div class="tt-body">Ошибка загрузки данных</div>';
        tooltip.style.display = 'block';
        return;
    }
    
    const data = getBuildingDataForEra(building, currentEra);
    if (!data) {
        console.error('getBuildingDataForEra returned null for building:', building.name);
        tooltip.innerHTML = '<div class="tt-body">Данные не найдены</div>';
        tooltip.style.display = 'block';
        return;
    }
    
    if (building.type === 'greatbuilding') {
        data.production = null;
        data.boosts = null;
        data.population = 0;
        data.happiness = 0;
    }
    
    const popClass = data.population > 0 ? 'positive' : (data.population < 0 ? 'negative' : 'neutral');
    const popSign = data.population > 0 ? '+' : '';
    const happySign = data.happiness > 0 ? '+' : '';
    
    if (building.type === 'greatbuilding') {
        let ttContent = `
            <div class="tt-header"><span>${building.name}</span></div>
            <div class="tt-body">
                <div class="tt-row"><span class="tt-label">Эпоха:</span><span class="tt-value">${window.EraNames?.[currentEra] || currentEra}</span></div>
                <div class="tt-row"><span class="tt-label">Тип:</span><span class="tt-value">${translateType(building.type)}</span></div>
            </div>
        `;
        tooltip.innerHTML = ttContent;
        tooltip.style.display = 'block';
        if (isHover) {
            card.classList.add('hover-active');
        }
        return;
    }
    
    let eraSelectorHtml = '';
    if (!isHover) {
        eraSelectorHtml = `<div class="era-select-wrapper"><select class="era-selector" onchange="switchEra(event, '${building.id}', this.value)">`;
        const erasToShow = building.availableEras?.length > 0 ? building.availableEras : (window.EraList || []);
        erasToShow.forEach(e => {
            const isSelected = e === currentEra ? 'selected' : '';
            eraSelectorHtml += `<option value="${e}" ${isSelected}>${window.EraNames?.[e] || e}</option>`;
        });
        eraSelectorHtml += `</select></div>`;
    } else {
        eraSelectorHtml = `<div class="tt-row"><span class="tt-label">Эпоха:</span><span class="tt-value">${window.EraNames?.[currentEra] || currentEra}</span></div>`;
    }
    
    let ttContent = `
        <div class="tt-header"><span>${building.name}</span></div>
        <div class="tt-body">
            ${eraSelectorHtml}
            ${!isHover ? `<div class="tt-row" style="margin-top:5px;"><span class="tt-label">Эпоха:</span><span class="tt-value">${window.EraNames?.[currentEra] || currentEra}</span></div>` : ''}
            <div class="tt-row"><span class="tt-label">Тип:</span><span class="tt-value">${translateType(building.type)}</span></div>
            <div class="tt-row"><span class="tt-label">Население:</span><span class="tt-value ${popClass}">${popSign}${data.population}</span></div>
            <div class="tt-row"><span class="tt-label">Счастье:</span><span class="tt-value ${data.happiness >= 0 ? 'positive' : 'negative'}">${happySign}${data.happiness}</span></div>
            ${window.CityBuildings?.needsStreet ? (window.CityBuildings.needsStreet(building.rawMeta) > 0 ? `<div class="tt-row"><span class="tt-label">Дорога:</span><span class="tt-value neutral">${window.CityBuildings.needsStreet(building.rawMeta)}-пол</span></div>` : '') : ''}
            ${building.rawMeta?.asset_id ? `<div class="tt-row"><span class="tt-label">Источник:</span><span class="tt-value" style="font-size:11px; word-break:break-all;" title="${building.rawMeta.asset_id}">${translateAssetId(building.rawMeta.asset_id)}</span></div>` : ''}
    `;
    
    // Комнаты союзников
    if (building.allyRooms?.length > 0) {
        ttContent += `<div class="tt-row"><span class="tt-label">Комнаты союзников:</span><span class="tt-value">`;
        building.allyRooms.forEach((room, idx) => {
            let iconClass = 'bg-ally-all';
            if (room.type === 'military') iconClass = 'bg-ally-military';
            else if (room.type === 'goods') iconClass = 'bg-ally-goods';
            else if (room.type === 'money') iconClass = 'bg-ally-money';
            else if (room.type === 'supplies') iconClass = 'bg-ally-supplies';
            ttContent += `<span class="icon-sm ${iconClass}" title="${room.name}"></span>${room.name}${idx < building.allyRooms.length - 1 ? ', ' : ''}`;
        });
        ttContent += `</span></div>`;
    }
    
    // Цепочка
    if (typeof getChainData === 'function') {
        const chainData = getChainData(building, currentEra);
        if (chainData && (chainData.productions?.length > 0 || chainData.boosts?.length > 0)) {
            ttContent += `<div class="tt-section"><div class="tt-section-title" style="color:#ffd700;">⛓️ Цепочка: ${chainData.chainId?.replace(/_/g, ' ') || 'unknown'}</div>`;
            if (chainData.description) ttContent += `<div style="font-size:12px; color:#aaa; margin-bottom:8px; font-style:italic;">${chainData.description}</div>`;
            
            if (chainData.productions && chainData.productions.length > 0) {
                chainData.productions.forEach(prod => {
                    let itemsHtml = '';
                    if (prod.resources) {
                        for (const [key, val] of Object.entries(prod.resources)) {
                            const cleanKey = key.replace(/,/g, '');
                            let iconClass = 'bg-fp', label = cleanKey;
                            
                            if (cleanKey.includes('each_special_goods_up_to_age')) {
                                let count = 8;
                                if (typeof val === 'number') count = val;
                                else if (typeof val === 'string') {
                                    const match = val.match(/\d+/);
                                    if (match) count = parseInt(match[0]);
                                }
                                label = `Спецтовар х8`;
                                iconClass = 'bg-special-goods';
                            }
                            else if (cleanKey.includes('special_goods_production') || cleanKey.includes('special_good')) {
                                label = 'Спецтовар';
                                iconClass = 'bg-special-goods';
                            }
                            else if (cleanKey.includes('random_special_good_up_to_age')) {
                                label = 'Бонус спецтовара';
                                iconClass = 'bg-special-goods';
                            }
                            else if (cleanKey.includes('strategy')) { iconClass = 'bg-fp'; label = 'СО'; }
                            else if (cleanKey.includes('goods')) { iconClass = 'bg-goods'; label = 'Товары'; }
                            else if (cleanKey.includes('money')) { iconClass = 'bg-money'; label = 'Монеты'; }
                            else if (cleanKey.includes('suppl')) { iconClass = 'bg-supplies'; label = 'Молотки'; }
                            itemsHtml += `<div class="res-item"><span class="icon-sm ${iconClass}"></span>${label}: <b>${formatResourceValue(val)}</b></div>`;
                        }
                    }
                    ttContent += `<div class="prod-option chain">${itemsHtml}<div style="text-align:right; font-size:11px; color:#ffd700; margin-top:2px;">Уровень ${prod.level}</div></div>`;
                });
            }
            if (chainData.boosts && chainData.boosts.length > 0) {
                chainData.boosts.forEach(boost => {
                    let iconUrl = (window.BonusIcons && (window.BonusIcons[boost.type] || window.BonusIcons['default'])) || '';
                    let boostLabel = boost.type?.replace(/_/g, ' ') || 'unknown';
                    let featureLabel = boost.targetedFeature;
                    if (window.FeatureNames?.[boost.targetedFeature]) featureLabel = window.FeatureNames[boost.targetedFeature];
                    ttContent += `<div class="prod-option chain-boost"><div class="res-item" style="justify-content: flex-start; align-items: center; gap: 8px;">${iconUrl ? `<img src="${iconUrl}" class="bonus-icon-img" alt="${boost.type}">` : ''}<span style="font-weight:bold; color:#fff; min-width: 60px; text-align: center;">+${boost.value}%</span><span style="color:#ccc;">${boostLabel}</span><span style="color:#aaa; font-size:11px;">(${featureLabel})</span></div><div style="text-align:right; font-size:11px; color:#ff6b6b; margin-top:2px;">Уровень ${boost.level}</div></div>`;
                });
            }
            ttContent += `</div>`;
        }
    }
    
    // Производство и бонусы
    const hasData = (data.population !== 0 || data.happiness !== 0 || data.production || data.boosts);
    if (!hasData && !data.production && !data.boosts && !building.allyRooms) {
        ttContent += `<div class="tt-section" style="text-align:center; color:#ff6b6b; padding: 20px;">⛄</div>`;
    } else {
        if (data.production && data.production.length > 0) {
            const fixedProductions = data.production.filter(p => p.type !== 'random');
            const randomProductions = data.production.filter(p => p.type === 'random');
            
            if (fixedProductions.length > 0) {
                ttContent += `<div class="tt-section"><div class="tt-section-title">Производство</div>`;
                fixedProductions.forEach(p => {
                    let itemsHtml = '';
                    if (p.type === 'fragment' || p.type === 'blueprint' || (p.resources && p.resources.type === 'fragment')) {
                        const r = p.resources;
                        const chanceStr = p.dropChance ? `<span style="color:#aaa; font-size:11px;">(${Math.round(p.dropChance*100)}%)</span>` : '';
                        itemsHtml = `<div class="res-item"><div style="display:flex; align-items:center;"><span class="icon-sm ${r.iconClass || 'bg-fragment'}"></span><span>${r.name || 'Награда'}</span>${chanceStr}</div><span style="font-weight:bold;">${r.amount || 1}</span></div>`;
                    } else {
                        const resObj = p.resources;
                        if (resObj && typeof resObj === 'object' && !Array.isArray(resObj) && !resObj.type) {
                            for (const [key, val] of Object.entries(resObj)) {
                                const cleanKey = key.replace(/,/g, '');
                                let iconClass = 'bg-money', label = cleanKey;
                                const isGuildProduction = (p.type === 'guildResources');
                                
                                if (cleanKey.includes('each_special_goods_up_to_age')) {
                                    let count = 8;
                                    if (typeof val === 'number') count = val;
                                    else if (typeof val === 'string') {
                                        const match = val.match(/\d+/);
                                        if (match) count = parseInt(match[0]);
                                    }
                                    label = `Спецтовар х8`;
                                    iconClass = 'bg-special-goods';
                                }
                                else if (cleanKey.includes('special_goods_production') || cleanKey.includes('special_good')) {
                                    label = 'Спецтовар';
                                    iconClass = 'bg-special-goods';
                                }
                                else if (cleanKey.includes('random_special_good_up_to_age')) {
                                    label = 'Бонус спецтовара';
                                    iconClass = 'bg-special-goods';
                                }
                                else if (isGuildProduction) {
                                    iconClass = 'bg-meet';
                                    if (cleanKey.includes('previous_age')) label = 'Товары прошлой эпохи в гильдию';
                                    else if (cleanKey.includes('next_age')) label = 'Товары следующей эпохи в гильдию';
                                    else if (cleanKey.includes('all_goods_of_age') || cleanKey.includes('random_good_of_age')) label = 'Товары своей эпохи в гильдию';
                                    else if (cleanKey.includes('random_good')) label = 'Случайные товары в гильдию';
                                    else label = 'Товары в гильдию';
                                } 
                                else if (cleanKey === 'medals' || cleanKey.includes('medal')) { iconClass = 'bg-fp'; label = 'Медали'; }
                                else if (cleanKey.includes('previous_age')) { iconClass = 'bg-goods'; label = 'Товары прошлой эпохи'; }
                                else if (cleanKey.includes('next_age')) { iconClass = 'bg-goods'; label = 'Товары следующей эпохи'; }
                                else if (cleanKey.includes('all_goods_of_age') || cleanKey.includes('random_good_of_age')) { iconClass = 'bg-goods'; label = 'Товары своей эпохи'; }
                                else if (cleanKey.includes('good')) { iconClass = 'bg-goods'; label = 'Товары'; }
                                else if (cleanKey.includes('suppl')) { iconClass = 'bg-supplies'; label = 'Молотки'; }
                                else if (cleanKey.includes('money')) { iconClass = 'bg-money'; label = 'Монеты'; }
                                else if (cleanKey.includes('unit') || cleanKey.includes('random')) { iconClass = 'bg-unit'; label = 'Юниты'; }
                                else if (cleanKey.includes('strategy')) { iconClass = 'bg-fp'; label = 'СО'; }
                                else if (cleanKey.includes('clan_power')) { iconClass = 'bg-meet'; label = 'Сила гильдии'; }
                                itemsHtml += `<div class="res-item"><span class="icon-sm ${iconClass}"></span>${label}: <b>${formatResourceValue(val)}</b></div>`;
                            }
                        } else if (resObj?.name) {
                            itemsHtml = `<div class="res-item"><span class="icon-sm ${resObj.iconClass}"></span>${resObj.name}: <b>${resObj.amount}</b></div>`;
                        }
                    }
                    const timeStr = p.time ? ` (${formatTime(p.time)})` : '';
                    const motStr = p.needsMotivation ? ' ⭐' : '';
                    if (fixedProductions.length > 1 || randomProductions.length > 0) {
                        ttContent += `<div class="prod-option">${itemsHtml}<div style="text-align:right; font-size:11px; color:#777; margin-top:2px;">Время:${timeStr}${motStr}</div></div>`;
                    } else {
                        ttContent += `<div style="margin-bottom:6px;">${itemsHtml}<div style="text-align:right; font-size:11px; color:#777;">Время:${timeStr}${motStr}</div></div>`;
                    }
                });
                ttContent += `</div>`;
            }
            
            if (randomProductions.length > 0) {
                ttContent += `<div class="tt-section"><div class="tt-section-title" style="color:#ffd700;">Случайная продукция</div>`;
                randomProductions.forEach(p => {
                    if (p.type === 'random' && Array.isArray(p.resources)) {
                        p.resources.forEach(r => {
                            const chancePercent = Math.round((r.dropChance || 0) * 100);
                            let resItemsHtml = '';
                            if (r.type === 'resources' && r.resources) {
                                for (const [key, val] of Object.entries(r.resources)) {
                                    const cleanKey = key.replace(/,/g, '');
                                    let label = cleanKey, iconClass = 'bg-goods';
                                    
                                    if (cleanKey.includes('each_special_goods_up_to_age')) {
                                        let count = 8;
                                        if (typeof val === 'number') count = val;
                                        else if (typeof val === 'string') {
                                            const match = val.match(/\d+/);
                                            if (match) count = parseInt(match[0]);
                                        }
                                        label = `Спецтовар х8`;
                                        iconClass = 'bg-special-goods';
                                    }
                                    else if (cleanKey.includes('special_goods_production') || cleanKey.includes('special_good')) {
                                        label = 'Спецтовар';
                                        iconClass = 'bg-special-goods';
                                    }
                                    else if (cleanKey.includes('random_special_good_up_to_age')) {
                                        label = 'Бонус спецтовара';
                                        iconClass = 'bg-special-goods';
                                    }
                                    else if (cleanKey.includes('previous_age')) { label = 'Товары прошлой эпохи'; }
                                    else if (cleanKey.includes('next_age')) { label = 'Товары следующей эпохи'; }
                                    else if (cleanKey.includes('all_goods_of_age') || cleanKey.includes('random_good_of_age')) { label = 'Товары своей эпохи'; }
                                    else if (cleanKey.includes('good')) { label = 'Товары'; }
                                    else if (cleanKey.includes('suppl')) { label = 'Молотки'; iconClass = 'bg-supplies'; }
                                    else if (cleanKey.includes('money')) { label = 'Монеты'; iconClass = 'bg-money'; }
                                    else if (cleanKey.includes('strategy')) { label = 'СО'; iconClass = 'bg-fp'; }
                                    else if (cleanKey.includes('medals')) { label = 'Медали'; iconClass = 'bg-fp'; }
                                    resItemsHtml += `<div class="res-item"><span class="icon-sm ${iconClass}"></span>${label}: <b>${formatResourceValue(val)}</b></div>`;
                                }
                            } else if (r.type === 'fragment' || r.type === 'blueprint' || r.type === 'consumable' || (r.resources?.type)) {
                                const reward = r.resources;
                                if (reward?.name) {
                                    const chanceStr = r.dropChance ? `<span style="color:#aaa; font-size:11px;">(${Math.round(r.dropChance*100)}%)</span>` : '';
                                    const iconClass = reward.iconClass || 'bg-generic';
                                    const cleanName = reward.name.replace(/,/g, ' ');
                                    resItemsHtml += `<div class="res-item" style="justify-content: space-between;"><div style="display:flex; align-items:center; flex:1;"><span class="icon-sm ${iconClass}"></span><span style="margin-right: 8px;">${cleanName}</span></div><div style="display:flex; align-items:center; gap: 8px;"><span style="font-weight:bold; color:#fff;">x${reward.amount || 1}</span>${chanceStr}</div></div>`;
                                }
                            }
                            
                            if (resItemsHtml) {
                                ttContent += `<div class="res-item" style="flex-direction:column; align-items:flex-start; border-bottom:1px solid #333; padding-bottom:4px; margin-bottom:4px;">${resItemsHtml}<div style="display:flex; align-items:center; width:100%; justify-content:flex-end; font-size:11px; color:#aaa; margin-top:2px;">Шанс: <div class="chance-bar" style="margin:0 5px;"><div class="chance-fill" style="width:${chancePercent}%"></div></div>${chancePercent}%</div></div>`;
                            }
                        });
                    }
                });
                ttContent += `</div>`;
            }
        }
        
        if (data.boosts && data.boosts.length > 0) {
            ttContent += `<div class="tt-section"><div class="tt-section-title">Бонусы города</div>`;
            data.boosts.forEach(boost => {
                const types = Array.isArray(boost.type) ? boost.type : [boost.type];
                const feature = boost.feature || "all";
                let iconsHtml = '';
                types.forEach(type => {
                    const combinedKey = `${type}|${feature}`;
                    let iconUrl = (window.BonusIcons && (window.BonusIcons[combinedKey] || window.BonusIcons[type] || window.BonusIcons['default'])) || '';
                    iconsHtml += iconUrl ? `<img src="${iconUrl}" class="bonus-icon-img" title="${type} (${feature})" alt="${type}">` : '';
                });
                let featureLabel = window.FeatureNames?.[feature] || feature.replace(/_/g, ' ');
                const featureText = feature ? ` <span style="color:#aaa; font-size:11px;">(${featureLabel})</span>` : '';
                const isStartValue = types.some(t => /_goods_start|_coins_start|_supplies_start|_units_start/.test(t));
                const valueDisplay = isStartValue ? `+${boost.value}` : `+${boost.value}%`;
                ttContent += `<div class="res-item" style="justify-content: flex-start; align-items: center; gap: 8px;"><div style="display: flex; align-items: center;">${iconsHtml}</div><span style="font-weight:bold; color:#fff; min-width: 50px; text-align: center;">${valueDisplay}</span>${featureText}</div>`;
            });
            ttContent += `</div>`;
        }
    }
    
    ttContent += `</div>`;
    tooltip.innerHTML = ttContent;
    tooltip.style.display = 'block';
    
    if (isHover) {
        card.classList.add('hover-active');
    }
    
    const tooltipElement = card.querySelector('.tooltip-box');
    if (tooltipElement && tooltipElement.style.display !== 'none') {
        setTimeout(() => {
            const tooltipHeight = tooltipElement.offsetHeight;
            const cardRect = card.getBoundingClientRect();
            const spaceBelow = window.innerHeight - cardRect.bottom;
            if (spaceBelow < tooltipHeight + 20) {
                const neededSpace = (tooltipHeight + 20) - spaceBelow;
                const currentMinHeight = parseInt(window.getComputedStyle(document.body).minHeight) || window.innerHeight;
                document.body.style.minHeight = `${currentMinHeight + neededSpace}px`;
            }
        }, 50);
    }
}

// === ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ===

function formatResourceValue(val) {
    if (typeof val === 'string') {
        const cleanVal = val.replace(/,/g, '');
        const num = parseInt(cleanVal, 10);
        return isNaN(num) ? val : num;
    }
    if (typeof val === 'number') {
        return Math.round(val);
    }
    return val;
}

function translateType(type) {
    const map = {
        'production': 'Производство',
        'residential': 'Жилое',
        'decoration': 'Декор',
        'greatbuilding': 'Великое Строение',
        'goods': 'Товары',
        'street': 'Дорога',
        'culture': 'Общественное',
        'main_building': 'Ратуша',
        'military': 'Казарма',
        'special': 'Спец. здание',
        'castle_system': 'Замок',
        'cultural_goods_production': 'Товары поселения',
        'guild_raids': 'Рейд Гильдии'
    };
    return map[type] || type;
}

function translateAssetId(assetId) {
    if (!assetId || !window.AssetIdTranslations) return assetId;
    const upperId = assetId.toUpperCase();
    for (const [key, translation] of Object.entries(window.AssetIdTranslations)) {
        if (upperId.includes(key.toUpperCase())) return translation;
    }
    return assetId;
}

function formatTime(seconds) {
    if (!seconds) return '';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}ч ${m}м`;
    return `${m}м`;
}

function showToast(message, isError = false, actionType = 'add') {
    const toast = document.getElementById('toastNotification');
    toast.textContent = message;
    toast.className = 'toast-notification show' + (isError ? ' error' : '');
    
    if (actionType === 'add') {
        playAddSound();
    } else if (actionType === 'remove') {
        playRemoveSound();
    }
    
    setTimeout(() => toast.classList.remove('show'), 2500);
}

// === ГЛОБАЛЬНЫЕ ФУНКЦИИ ДЛЯ ТУЛТИПА ===

window.switchEra = function(event, buildingId, era) {
    event.stopPropagation();
    
    if (!window.activeBuildingIds) {
        window.activeBuildingIds = new Set();
    }
    window.activeBuildingIds.add(buildingId);
    
    if (!window.activeEraOverrides) {
        window.activeEraOverrides = {};
    }
    window.activeEraOverrides[buildingId] = era;
    
    const card = document.querySelector(`.building-card[data-id="${buildingId}"]`);
    if (card) {
        const building = window.allBuildings?.find(b => b.id === buildingId);
        if (building) {
            updateTooltipContent(card, building, false);
            if (!card.classList.contains('active')) {
                card.classList.add('active');
                card.classList.remove('hover-active');
            }
        }
    }
};

function getChainData(building, era) {
    try {
        if (!building.rawMeta?.components) return null;
        let chainData = null;
        if (building.rawMeta.components[era]?.chain) chainData = building.rawMeta.components[era].chain;
        else if (building.rawMeta.components.AllAge?.chain) chainData = building.rawMeta.components.AllAge.chain;
        if (!chainData || chainData.type !== 'chain') return null;
        
        let chainProductions = [], chainBoosts = [];
        if (chainData.config?.bonuses && Array.isArray(chainData.config.bonuses)) {
            chainData.config.bonuses.forEach(bonus => {
                if (bonus.productions?.length) {
                    bonus.productions.forEach(prod => {
                        if (prod.type === 'resources' && prod.playerResources?.resources) {
                            chainProductions.push({ resources: prod.playerResources.resources, level: bonus.level || 1 });
                        }
                    });
                }
                if (bonus.boosts?.length) {
                    bonus.boosts.forEach(boost => {
                        chainBoosts.push({
                            type: boost.type || 'unknown',
                            value: boost.value || 0,
                            targetedFeature: boost.targetedFeature || 'all',
                            level: bonus.level || 1
                        });
                    });
                }
            });
        }
        return {
            chainId: chainData.chainId || 'unknown',
            description: chainData.description || '',
            productions: chainProductions,
            boosts: chainBoosts
        };
    } catch (e) {
        console.warn("getChainData error:", e);
        return null;
    }
}