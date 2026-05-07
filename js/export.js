// === ЭКСПОРТ В XLSX ===
function exportBasketXLSX() {
    if (basket.length === 0) { showToast('Корзина пуста', true); return; }
    if (typeof XLSX === 'undefined') { showToast('Библиотека SheetJS не загружена!', true); return; }
    
    const uniqueBoosts = new Map();
    const uniqueProds = new Map();
    const technicalFields = ['id', 'name', 'type', 'subType', 'amount', 'dropChance', 'iconClass'];
    
    const boostTypeNames = {
        "attack": "Атака", "defense": "Оборона", "def_boost_attacker": "Защита (атак.)",
        "def_boost_defender": "Защита (защ.)", "att_boost_attacker": "Атака (атак.)",
        "att_boost_defender": "Атака (защ.)", "att_def_boost_attacker": "Атака+Защита (атак.)",
        "att_def_boost_defender": "Атака+Защита (защ.)", "att_def_boost_attacker_defender": "Атака+Защита",
        "goods_production": "Товары", "money_production": "Монеты", "supplies_production": "Молотки",
        "happiness": "Счастье", "population": "Население", "clan_power": "Сила гильдии",
        "campaign": "Кампания", "guild_raids_action_points_collection": "Кванты"
    };
    
    const basketData = basket.map(b => {
        const building = window.allBuildings?.find(ab => ab.id === b.id);
        if (!building) return null;
        const data = getBuildingDataForEra(building, basketEra);
        return {
            id: b.id, name: b.name, size: b.size,
            population: data.population, happiness: data.happiness,
            production: data.production, boosts: data.boosts
        };
    }).filter(b => b !== null);
    
    // Сбор уникальных типов
    basketData.forEach(b => {
        if (b.boosts?.length) {
            b.boosts.forEach(boost => {
                const types = Array.isArray(boost.type) ? boost.type : [boost.type];
                types.forEach(t => {
                    const feature = boost.feature || boost.targetedFeature || 'all';
                    const key = `${t}|${feature}`;
                    if (!uniqueBoosts.has(key)) {
                        const boostCfg = basketConfig?.boosts?.[t] || {};
                        const featureLabel = basketConfig?.features?.[feature] || window.FeatureNames?.[feature] || feature.replace(/_/g, ' ');
                        const typeName = boostTypeNames[t] || t.replace(/_/g, ' ');
                        uniqueBoosts.set(key, {
                            label: `${typeName} (${featureLabel})`,
                            icon: boostCfg.iconUrl || window.BonusIcons[t] || window.BonusIcons['default'],
                            type: t, feature
                        });
                    }
                });
            });
        }
        if (b.production?.length) {
            b.production.filter(p => p.type !== 'random').forEach(p => {
                if (p.resources && typeof p.resources === 'object' && !Array.isArray(p.resources)) {
                    Object.keys(p.resources).forEach(resKey => {
                        if (technicalFields.includes(resKey)) return;
                        if (!uniqueProds.has(resKey)) {
                            const resCfg = basketConfig?.resources?.[resKey] || {};
                            let label = resCfg.label || resKey;
                            if (!resCfg.label) {
                                if (resKey.includes('strategy')) label = 'СО';
                                else if (resKey.includes('goods')) label = 'Товары';
                                else if (resKey.includes('money')) label = 'Монеты';
                                else if (resKey.includes('suppl')) label = 'Молотки';
                                else if (resKey.includes('clan_power')) label = 'Сила гильдии';
                                else if (resKey.includes('medal')) label = 'Медали';
                            }
                            uniqueProds.set(resKey, { label, key: resKey });
                        }
                    });
                }
            });
        }
    });
    
    // Данные для Excel
    const excelData = basketData.map(b => {
        const row = {
            'Название': b.name,
            'Размер': `${b.size.width}x${b.size.length}`,
            'Население': b.population,
            'Счастье': `+${b.happiness}`
        };
        uniqueProds.forEach(prod => {
            let val = '';
            if (b.production) {
                const prodItem = b.production.find(p => p.resources?.[prod.key] !== undefined);
                if (prodItem?.resources?.[prod.key] !== undefined) val = Math.round(prodItem.resources[prod.key]);
            }
            row[prod.label] = val;
        });
        uniqueBoosts.forEach(boost => {
            let val = '';
            if (b.boosts) {
                const boostItem = b.boosts.find(bt => {
                    const btTypes = Array.isArray(bt.type) ? bt.type : [bt.type];
                    return btTypes.includes(boost.type) && (bt.feature || bt.targetedFeature || 'all') === boost.feature;
                });
                if (boostItem) val = `+${boostItem.value}%`;
            }
            row[boost.label] = val;
        });
        return row;
    });
    
    // Workbook
    const ws = XLSX.utils.json_to_sheet(excelData);
    const colWidths = [{ wch: 25 }, { wch: 10 }, { wch: 12 }, { wch: 10 }];
    uniqueProds.forEach(() => colWidths.push({ wch: 12 }));
    uniqueBoosts.forEach(() => colWidths.push({ wch: 20 }));
    ws['!cols'] = colWidths;
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Здания");
    
    const fileName = `foe_basket_${basketEra}_${new Date().toISOString().slice(0,10)}.xlsx`;
    XLSX.writeFile(wb, fileName);
    showToast(`✅ ${fileName}`);
}