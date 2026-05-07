// === ОБРАБОТКА ДАННЫХ ЗДАНИЙ ===
window.CityBuildings = {
    setAllyRooms: (metaData) => {
        try {
            let allyRooms = [];
            if (metaData.components && metaData.components.AllAge && metaData.components.AllAge.ally) {
                const allyData = metaData.components.AllAge.ally;
                if (allyData.rooms && Array.isArray(allyData.rooms)) {
                    allyData.rooms.forEach(room => {
                        if (room.allyType) allyRooms.push({
                            type: room.allyType,
                            name: window.AllyRoomTypes[room.allyType] || room.allyType
                        });
                    });
                }
            }
            for (let eraName in window.InnoEras) {
                if (metaData.components && metaData.components[eraName] && metaData.components[eraName].ally) {
                    const allyData = metaData.components[eraName].ally;
                    if (allyData.rooms && Array.isArray(allyData.rooms)) {
                        allyData.rooms.forEach(room => {
                            if (room.allyType && !allyRooms.find(r => r.type === room.allyType)) {
                                allyRooms.push({
                                    type: room.allyType,
                                    name: window.AllyRoomTypes[room.allyType] || room.allyType
                                });
                            }
                        });
                    }
                }
            }
            return allyRooms.length > 0 ? allyRooms : null;
        } catch (e) {
            console.warn("setAllyRooms error:", e, metaData?.name);
            return null;
        }
    },

    setPopulation: (metaData, data, era) => {
        try {
            let population = 0, eraId = window.InnoEras[era] || 0;
            if (metaData.__class__ !== "GenericCityEntity") {
                if (metaData.entity_levels && metaData.entity_levels.length > 0) {
                    if (metaData.entity_levels[eraId] && metaData.entity_levels[eraId].required_population)
                        return metaData.entity_levels[eraId].required_population * -1;
                    else if (metaData.entity_levels[eraId] && metaData.entity_levels[eraId].provided_population)
                        return metaData.entity_levels[eraId].provided_population;
                }
                else if (metaData.requirements && metaData.requirements.cost) {
                    if (metaData.type === "decoration") return 0;
                    else if (metaData.type === "greatbuilding" && data.bonus && data.bonus.type === "population")
                        return data.bonus.value;
                    if (metaData.requirements.cost.resources && metaData.requirements.cost.resources.population)
                        return metaData.requirements.cost.resources.population * -1;
                }
                if (metaData.components && metaData.components[era]) {
                    let staticResources = metaData.components[era].staticResources;
                    if (staticResources && staticResources.resources && staticResources.resources.resources) {
                        population = staticResources.resources.resources.population;
                        if (population) return population;
                    }
                }
                if (metaData.components && metaData.components.AllAge) {
                    let staticResources = metaData.components.AllAge.staticResources;
                    if (staticResources && staticResources.resources && staticResources.resources.resources) {
                        population = staticResources.resources.resources.population;
                        if (population) return population;
                    }
                }
            } else {
                if (metaData.components && metaData.components[era]) {
                    let staticResources = metaData.components[era].staticResources;
                    if (staticResources && staticResources.resources && staticResources.resources.resources) {
                        population = staticResources.resources.resources.population;
                        return population || 0;
                    }
                }
            }
            return population;
        } catch (e) {
            console.warn("setPopulation error:", e, metaData?.name);
            return 0;
        }
    },

    setHappiness: (metaData, data, era) => {
        try {
            let happiness = 0, eraId = window.InnoEras[era] || 0;
            if (metaData.__class__ !== "GenericCityEntity") {
                if (metaData.entity_levels && metaData.entity_levels.length > 0) {
                    if (metaData.entity_levels[eraId] && metaData.entity_levels[eraId].provided_happiness)
                        return metaData.entity_levels[eraId].provided_happiness;
                }
                else if (data.bonus && data.bonus.type === "happiness")
                    return data.bonus.value;
                else if (metaData.provided_happiness)
                    return metaData.provided_happiness;
                if (metaData.components && metaData.components[era]) {
                    let bHappiness = metaData.components[era].happiness;
                    if (bHappiness && bHappiness.provided) {
                        happiness = bHappiness.provided;
                        if (happiness) return happiness;
                    }
                }
                if (metaData.components && metaData.components.AllAge) {
                    let bHappiness = metaData.components.AllAge.happiness;
                    if (bHappiness && bHappiness.provided) {
                        happiness = bHappiness.provided;
                        if (happiness) return happiness;
                    }
                }
            } else {
                if (metaData.components && metaData.components[era]) {
                    let bHappiness = metaData.components[era].happiness;
                    if (bHappiness && bHappiness.provided) return bHappiness.provided;
                }
                if (metaData.components && metaData.components.AllAge) {
                    let bHappiness = metaData.components.AllAge.happiness;
                    if (bHappiness && bHappiness.provided) return bHappiness.provided;
                }
            }
            return happiness;
        } catch (e) {
            console.warn("setHappiness error:", e, metaData?.name);
            return 0;
        }
    },

    setSize: (metaData) => {
        try {
            let size = { width: 0, length: 0 };
            if (metaData.width && metaData.length)
                size = { width: metaData.width, length: metaData.length };
            else if (metaData.components && metaData.components.AllAge && metaData.components.AllAge.placement && metaData.components.AllAge.placement.size) {
                size.width = metaData.components.AllAge.placement.size.x;
                size.length = metaData.components.AllAge.placement.size.y;
            }
            return size;
        } catch (e) {
            console.warn("setSize error:", e);
            return { width: 0, length: 0 };
        }
    },

    needsStreet: (metaData) => {
        try {
            let needsStreet = 0;
            if (metaData.requirements && metaData.requirements.street_connection_level)
                needsStreet = metaData.requirements.street_connection_level;
            else {
                if (metaData.abilities) {
                    metaData.abilities.forEach(ability => {
                        if (ability.__class__ === "StreetConnectionRequirementComponent")
                            needsStreet = 1;
                    });
                }
                if (metaData.components && metaData.components.AllAge && metaData.components.AllAge.streetConnectionRequirement)
                    needsStreet = metaData.components.AllAge.streetConnectionRequirement.requiredLevel;
            }
            return needsStreet || 0;
        } catch (e) {
            console.warn("needsStreet error:", e);
            return 0;
        }
    },

    setBuildingBoosts: (metaData, data, era) => {
        try {
            let eraName = (era === 'AllAge' ? 'BronzeAge' : era), boosts = [];
            const mapType = (t) => (window.BoostsMapper && window.BoostsMapper[t]) ? window.BoostsMapper[t] : [t];
            
            if (metaData.components && metaData.components[eraName] && metaData.components[eraName].boosts) {
                const bList = metaData.components[eraName].boosts.boosts;
                if (Array.isArray(bList)) bList.forEach(b => {
                    boosts.push({ feature: b.targetedFeature || "all", type: mapType(b.type), value: b.value });
                });
            }
            if (metaData.components && metaData.components.AllAge && metaData.components.AllAge.boosts) {
                const bListAllAge = metaData.components.AllAge.boosts.boosts;
                if (Array.isArray(bListAllAge)) bListAllAge.forEach(b => {
                    boosts.push({ feature: b.targetedFeature || "all", type: mapType(b.type), value: b.value });
                });
            }
            if (boosts.length === 0 && metaData.__class__ !== "GenericCityEntity") {
                if (metaData.abilities) {
                    metaData.abilities.forEach(ability => {
                        if (ability.boostHints) {
                            ability.boostHints.forEach(abilityBoost => {
                                let boostData = abilityBoost.boostHintEraMap[eraName] || abilityBoost.boostHintEraMap.AllAge;
                                if (boostData) boosts.push({ feature: boostData.targetedFeature || "all", type: mapType(boostData.type), value: boostData.value });
                            });
                        }
                        if (ability.bonuses) {
                            ability.bonuses.forEach(bonus => {
                                let bData = bonus.boost[eraName] || bonus.boost.AllAge;
                                if (bData) boosts.push({ feature: bData.targetedFeature || "all", type: mapType(bData.type), value: bData.value, condition: "Set/Chain" });
                            });
                        }
                    });
                }
                if (metaData.type === "greatbuilding" && data.bonus && data.bonus.type) {
                    if (data.bonus.type !== "happiness" && data.bonus.type !== "population")
                        boosts.push({ feature: "all", type: mapType(data.bonus.type), value: data.bonus.value });
                }
            }
            return boosts.length > 0 ? boosts : null;
        } catch (e) {
            console.warn("setBuildingBoosts error:", e);
            return null;
        }
    },

    setAllProductions: (metaData, data, era) => {
    try {
        let productions = [], eraId = window.InnoEras[era] || 0, eraName = (era === 'AllAge' ? 'BronzeAge' : era);
        const isGeneric = (metaData.__class__ === "GenericCityEntity");
        let productionComp = null;
        
        // Проверяем production из components
        if (metaData.components && metaData.components[eraName] && metaData.components[eraName].production)
            productionComp = metaData.components[eraName].production;
        if (!productionComp && metaData.components && metaData.components.AllAge && metaData.components.AllAge.production)
            productionComp = metaData.components.AllAge.production;

        // Обрабатываем productionComp если есть
        if (productionComp && productionComp.options && Array.isArray(productionComp.options)) {
            productionComp.options.forEach(opt => {
                if (!opt.products || !Array.isArray(opt.products)) return;
                opt.products.forEach(prod => {
                    let resource = {
                        type: prod.type,
                        needsMotivation: (prod.onlyWhenMotivated === true),
                        doubleWhenMotivated: (prod.onlyWhenMotivated !== true),
                        resources: {},
                        time: opt.time,
                        dropChance: prod.dropChance
                    };
                    if (prod.type === "resources" && prod.playerResources && prod.playerResources.resources)
                        resource.resources = prod.playerResources.resources;
                    else if (prod.type === "guildResources" && prod.guildResources && prod.guildResources.resources)
                        resource.resources = prod.guildResources.resources;
                    else if (prod.type === "unit")
                        resource.resources = { [prod.unitTypeId || 'random']: prod.amount || 1 };
                    else if (prod.type === "random" && prod.products && Array.isArray(prod.products)) {
                        let randomRewards = [];
                        prod.products.forEach(rProd => {
                            if (rProd.product && rProd.product.playerResources && rProd.product.playerResources.resources)
                                randomRewards.push({ type: "resources", resources: rProd.product.playerResources.resources, dropChance: rProd.dropChance });
                            else if (rProd.product && (rProd.product.type === "genericReward" || rProd.product.type === "blueprint") && rProd.product.reward) {
                                const parsedReward = window.CityBuildings.setGenericReward(rProd.product, metaData, era);
                                randomRewards.push({ type: parsedReward.type, resources: parsedReward, dropChance: rProd.dropChance });
                            }
                        });
                        if (randomRewards.length > 0) {
                            resource.resources = randomRewards;
                            resource.type = "random";
                        }
                    }
                    else if ((prod.type === "genericReward" || prod.type === "blueprint") && prod.reward) {
                        const parsedReward = window.CityBuildings.setGenericReward(prod, metaData, era);
                        resource.resources = parsedReward;
                        resource.type = parsedReward.type;
                        if (prod.dropChance) resource.dropChance = prod.dropChance;
                    }
                    if (Object.keys(resource.resources).length > 0 || resource.type === "random")
                        productions.push(resource);
                });
            });
        }
        
        // Если productionComp дал результаты, возвращаем их
        if (productions.length > 0) {
            return productions;
        }
        
        // Обработка для обычных зданий (не GenericCityEntity и не greatbuilding)
        if (!isGeneric && metaData.type !== "greatbuilding") {
            let hasProductionValues = false;
            
            // Сначала проверяем entity_levels с production_values (наиболее точные данные)
            if (metaData.entity_levels && metaData.entity_levels[eraId]) {
                const levelData = metaData.entity_levels[eraId];
                
                // Проверяем наличие production_values
                if (levelData.production_values && Array.isArray(levelData.production_values) && levelData.production_values.length > 0) {
                    hasProductionValues = true;
                    
                    // Обрабатываем каждое production_value отдельно
                    levelData.production_values.forEach((pv, index) => {
                        if (pv.type && pv.value !== undefined && pv.value > 0) {
                            let resourceType = 'resources';
                            let resourceKey = pv.type;
                            
                            if (pv.type === 'strategy_points') { 
                                resourceKey = 'strategy_points'; 
                            }
                            else if (pv.type === 'clan_power') { 
                                resourceKey = 'clan_power'; 
                                resourceType = 'guildResources'; 
                            }
                            else if (pv.type === 'medals') { 
                                resourceKey = 'medals'; 
                            }
                            else if (pv.type === 'money') { 
                                resourceKey = 'money'; 
                            }
                            else if (pv.type === 'supplies') { 
                                resourceKey = 'supplies'; 
                            }
                            else if (pv.type === 'goods') { 
                                resourceKey = 'goods'; 
                            }
                            
                            // Определяем время производства на основе индекса
                            let productionTime = 0;
                            if (pv.time) {
                                productionTime = pv.time;
                            } else {
                                // Стандартные времена для разных слотов производства
                                const defaultTimes = [300, 900, 3600, 14400, 28800, 86400];
                                if (index < defaultTimes.length) {
                                    productionTime = defaultTimes[index];
                                }
                            }
                            
                            productions.push({
                                type: resourceType,
                                needsMotivation: false,
                                resources: { [resourceKey]: pv.value },
                                time: productionTime,
                                source: "entity_levels",
                                productionIndex: index
                            });
                        }
                    });
                }
            }
            
            // Если нашли production_values, возвращаем их
            if (hasProductionValues && productions.length > 0) {
                return productions;
            }
            
            // Если нет production_values, проверяем available_products
            if (metaData.available_products && Array.isArray(metaData.available_products) && metaData.available_products.length > 0) {
                metaData.available_products.forEach(product => {
                    if (product.name === "clan_goods" || product.asset_name === "clan_goods")
                        productions.push({ type: "guildResources", needsMotivation: false, resources: { clan_goods_current_era: 1 }, time: product.production_time || 86400, name: "Товары гильдии" });
                    else if (product.product && product.product.resources)
                        productions.push({ type: "resources", needsMotivation: false, resources: product.product.resources, time: product.production_time || 0 });
                });
                
                if (productions.length > 0) {
                    return productions;
                }
            }
            
            // Если нет ни production_values, ни available_products, проверяем старые поля
            if (metaData.entity_levels && metaData.entity_levels[eraId]) {
                const levelData = metaData.entity_levels[eraId];
                let money = levelData.produced_money;
                if (money && money > 0) {
                    productions.push({ 
                        type: 'resources', 
                        needsMotivation: false, 
                        resources: { money: money }, 
                        source: "entity_levels" 
                    });
                }
                
                let power = levelData.clan_power;
                if (power && power > 0) {
                    productions.push({ 
                        type: 'guildResources', 
                        needsMotivation: false, 
                        resources: { clan_power: power }, 
                        source: "entity_levels" 
                    });
                }
                
                if (productions.length > 0) {
                    return productions;
                }
            }
        }
        
        // Обработка для greatbuilding
        if (metaData.type === 'greatbuilding') {
            if (data.bonus && data.bonus.type === "strategy_points")
                productions.push({ type: "resources", resources: { strategy_points: data.bonus.value }, time: 0 });
            if (data.state && data.state.current_product) {
                let cp = data.state.current_product;
                if (cp.goods && Array.isArray(cp.goods)) {
                    let res = {};
                    cp.goods.forEach(g => { res[g.good_id] = g.value; });
                    productions.push({ type: "guildResources", resources: res, time: 0 });
                }
                if (cp.product && cp.product.resources)
                    productions.push({ type: "resources", resources: cp.product.resources, time: 0 });
            }
        }
        
        return productions.length > 0 ? productions : null;
    } catch (e) {
        console.warn("setAllProductions error:", e, metaData?.name);
        return null;
    }
},
    
    
    
    
    
    
    setGenericReward: (product, metaData, era) => {
        try {
            let rewardData = {
                id: product.reward.id,
                name: 'Награда',
                type: 'consumable',
                subType: '',
                amount: product.reward.amount || product.reward.totalAmount || 1,
                dropChance: product.dropChance || null,
                iconClass: 'bg-generic'
            };
            const lookupData = window.CityBuildings.findRewardInLookup(product.reward.id, metaData, era);
            if (lookupData) {
                if (lookupData.subType === 'fragment') {
                    rewardData.name = lookupData.assembledReward ? lookupData.assembledReward.name : 'Фрагмент';
                    rewardData.iconClass = 'bg-fragment';
                    rewardData.type = 'fragment';
                    rewardData.amount = lookupData.amount || 1;
                }
                else if (lookupData.type === 'blueprint' || lookupData.subType === 'reward_item') {
                    rewardData.name = lookupData.name;
                    rewardData.iconClass = 'bg-blueprint';
                    rewardData.type = 'blueprint';
                    rewardData.amount = lookupData.amount || 1;
                }
                
                
                else if (lookupData.name) {
    // Просто берем полное название без изменений
    rewardData.name = lookupData.name;
}
                
                
                
                if (lookupData.type === 'unit' || lookupData.icon === 'military') {
                    rewardData.type = 'unit';
                    rewardData.iconClass = 'bg-unit';
                }
                else if (lookupData.type === 'good') {
                    rewardData.type = 'goods';
                    rewardData.iconClass = 'bg-goods';
                }
                else if (lookupData.subType === 'speedup_item' || lookupData.type === 'boost_item') {
                    rewardData.type = 'boost';
                    rewardData.iconClass = 'bg-fp';
                }
                if (lookupData.subType === 'reward_item' && lookupData.name.includes('чертеж'))
                    rewardData.iconClass = 'bg-blueprint';
            } else {
                if (product.reward.id.includes('fragment')) {
                    rewardData.name = 'Фрагмент (' + product.reward.id + ')';
                    rewardData.iconClass = 'bg-fragment';
                    rewardData.type = 'fragment';
                }
                else if (product.reward.id.includes('blueprint')) {
                    const match = product.reward.id.match(/box_(\d+)_item/);
                    if (match) rewardData.name = `${match[1]} чертежа`;
                    else rewardData.name = 'Чертеж';
                    rewardData.iconClass = 'bg-blueprint';
                    rewardData.type = 'blueprint';
                }
                else if (product.reward.id.includes('unit_')) {
                    rewardData.name = 'Юнит';
                    rewardData.iconClass = 'bg-unit';
                    rewardData.type = 'unit';
                }
            }
            return rewardData;
        } catch (e) {
            console.warn("setGenericReward error:", e);
            return { name: 'Ошибка награды', type: 'unknown', amount: 0 };
        }
    },

    findRewardInLookup: (rewardId, metaData, era) => {
        try {
            if (!metaData.components) return null;
            const erasToCheck = [era, 'AllAge'];
            for (const e of erasToCheck) {
                if (metaData.components[e] && metaData.components[e].lookup && metaData.components[e].lookup.rewards) {
                    const rewards = metaData.components[e].lookup.rewards;
                    if (rewards[rewardId]) return rewards[rewardId];
                    for (const key in rewards) {
                        const item = rewards[key];
                        if (item.type === 'chest' && item.possible_rewards) {
                            for (const possible of item.possible_rewards) {
                                if (possible.reward && possible.reward.id === rewardId)
                                    return possible.reward;
                            }
                        }
                    }
                }
            }
            return null;
        } catch (e) {
            console.warn("findRewardInLookup error:", e);
            return null;
        }
    },

    createBuilding: (metaData, era, data) => {
        try {
            if (!metaData) { console.warn("createBuilding: metaData is null"); return null; }
            if (!window.InnoEras) { console.error("createBuilding: window.InnoEras is undefined!"); return null; }
            if (!era) {
                const parts = metaData.id.split('_');
                if (parts[1] && window.InnoEras[parts[1]] !== undefined) era = parts[1];
                else era = window.CurrentEra || 'BronzeAge'; // Добавлено значение по умолчанию
            }
            let availableEras = [];
            if (metaData.entity_levels && metaData.entity_levels.length > 0) {
                for (let eName in window.InnoEras) {
                    let eId = window.InnoEras[eName];
                    if (metaData.entity_levels[eId] && (metaData.entity_levels[eId].produced_money || metaData.entity_levels[eId].provided_population || metaData.entity_levels[eId].provided_happiness))
                        availableEras.push(eName);
                }
            }
            if (availableEras.length === 0) {
                for (let eName in window.InnoEras) {
                    if (metaData.components && metaData.components[eName]) {
                        if (metaData.components[eName].production || metaData.components[eName].staticResources || metaData.components[eName].boosts || metaData.components[eName].happiness) {
                            if (!availableEras.includes(eName)) availableEras.push(eName);
                        }
                    }
                }
            }
            if (availableEras.length > 1) availableEras.sort((a, b) => window.InnoEras[a] - window.InnoEras[b]);
            return {
    id: data.id || metaData.id,
    entityId: data.cityentity_id || metaData.id,
    name: metaData.name,
    type: metaData.type,
    baseEra: era,
    availableEras: availableEras,
    size: window.CityBuildings.setSize(metaData),
    allyRooms: window.CityBuildings.setAllyRooms(metaData),
    expireDays: (() => {
        const limited = metaData.components?.AllAge?.limited
                     || metaData.components?.limited;
        const t = limited?.config?.expireTime;
        return t ? Math.round(t / 86400) : null;
    })(),
    rawMeta: metaData,
    rawData: data
};
        } catch (e) {
            console.error("createBuilding error:", e, metaData?.id);
            return null;
        }
    }
};

// Добавить в конец файла building-processor.js

/**
 * Поиск продукции здания по маске
 * @param {Object} building - объект здания
 * @param {string} searchMask - маска для поиска
 * @returns {Object|null} - найденная продукция или null
 */
function findProductionByMask(building, searchMask) {
    if (!searchMask || searchMask.length < 2) return null;
    
    const maskLower = searchMask.toLowerCase();
    const results = {
        productions: [],
        randomProductions: []
    };
    
    // Функция для проверки строки на соответствие маске
    const matchesMask = (text) => {
        if (!text) return false;
        return text.toLowerCase().includes(maskLower);
    };
    
    // Проверка всех эпох в компонентах здания
    const checkEraComponents = (components) => {
        if (!components) return;
        
        for (const [era, eraData] of Object.entries(components)) {
            if (!eraData.production) continue;
            
            // Основное производство
            if (eraData.production.options) {
                for (const option of eraData.production.options) {
                    if (option.products) {
                        for (const product of option.products) {
                            // Проверка genericReward
                            if (product.type === 'genericReward' && product.reward) {
                                const rewardName = product.reward.name || 
                                                  (product.reward.assembledReward?.name) || 
                                                  product.reward.id;
                                if (matchesMask(rewardName)) {
                                    results.productions.push({
                                        era: era,
                                        rewardId: product.reward.id,
                                        rewardName: rewardName,
                                        rewardType: product.reward.subType || product.reward.type,
                                        amount: product.reward.amount || 1,
                                        dropChance: product.dropChance || null
                                    });
                                }
                            }
                            
                            // Проверка random продукции
                            if (product.type === 'random' && product.products) {
                                for (const randomProd of product.products) {
                                    if (randomProd.product?.reward) {
                                        const reward = randomProd.product.reward;
                                        const rewardName = reward.name || 
                                                          (reward.assembledReward?.name) || 
                                                          reward.id;
                                        if (matchesMask(rewardName)) {
                                            results.randomProductions.push({
                                                era: era,
                                                rewardId: reward.id,
                                                rewardName: rewardName,
                                                rewardType: reward.subType || reward.type,
                                                amount: reward.amount || 1,
                                                dropChance: randomProd.dropChance || product.dropChance,
                                                weight: randomProd.weight
                                            });
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    };
    
    // Проверяем компоненты здания
    if (building.components) {
        checkEraComponents(building.components);
    }
    
    // Также проверяем прямые rewards
    if (building.rewards) {
        const checkRewards = (rewards) => {
            for (const reward of rewards) {
                if (reward.name && matchesMask(reward.name)) {
                    results.productions.push({
                        type: 'direct_reward',
                        rewardId: reward.id,
                        rewardName: reward.name,
                        rewardType: reward.subType || reward.type
                    });
                }
                if (reward.possible_rewards) {
                    checkRewards(reward.possible_rewards);
                }
            }
        };
        checkRewards(building.rewards);
    }
    
    return results.productions.length > 0 || results.randomProductions.length > 0 ? results : null;
}

/**
 * Проверка, содержит ли здание продукцию типа "набор выбора"
 * @param {Object} building - объект здания
 * @returns {boolean}
 */
function hasSelectionKitProduction(building) {
    const result = findProductionByMask(building, 'набор выбора');
    if (!result) return false;
    
    // Проверяем, есть ли среди найденного selection_kit
    const allProductions = [...result.productions, ...result.randomProductions];
    return allProductions.some(p => 
        p.rewardType === 'selection_kit' || 
        p.rewardId?.includes('selection_kit') ||
        p.rewardName?.toLowerCase().includes('набор выбора')
    );
}
// Добавить в конец building-processor.js
window.getBuildingDataForEra = function(building, era) {
    if (!building || !era) return building;
    if (building[era]) return building[era];
    if (building.data && building.data[era]) return building.data[era];
    if (building.stats && building.stats[era]) return building.stats[era];
    return building;
};

window.getAllErasFromData = function(buildings) {
    if (!buildings || !Array.isArray(buildings)) return [];
    const eras = new Set();
    buildings.forEach(b => {
        if (b.era) eras.add(b.era);
        if (b.age) eras.add(b.age);
        if (b.data) Object.keys(b.data).forEach(k => eras.add(k));
    });
    return Array.from(eras).sort();
};