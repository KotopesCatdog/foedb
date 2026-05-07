// === ИНИЦИАЛИЗАЦИЯ ОБРАБОТЧИКОВ СОБЫТИЙ ===
function initEventListeners() {
    const searchInput = document.getElementById('searchInput');
    const clearBtn = document.getElementById('clearBtn');
    const filterName = document.getElementById('filterName');
    const filterType = document.getElementById('filterType');
    const filterSource = document.getElementById('filterSource');
    const filterProduction = document.getElementById('filterProduction');
    
    // Функция поиска с учётом продукции
    const performSearch = () => {
        const query = searchInput.value.trim().toLowerCase();
        clearBtn.style.display = query.length > 0 ? 'block' : 'none';
        
        const useName = filterName.checked;
        const useType = filterType.checked;
        const useSource = filterSource.checked;
        const useProduction = filterProduction?.checked || false;
        const noFilters = !useName && !useType && !useSource && !useProduction;
        
        if (query.length < 2) {
            document.getElementById('resultsGrid').innerHTML = '';
            window.currentProductionSearch = '';
            return;
        }
        
        // Сохраняем поисковый запрос для продукции в глобальную переменную
        if (useProduction) {
            window.currentProductionSearch = query;
        } else {
            window.currentProductionSearch = '';
        }
        
        const filtered = window.allBuildings.filter(b => {
            if (noFilters) {
                const nameMatch = b.name.toLowerCase().includes(query);
                const eraMatch = b.baseEra?.toLowerCase().includes(query);
                const typeMatch = translateType(b.type).toLowerCase().includes(query);
                let sourceMatch = false;
                if (b.rawMeta?.asset_id) {
                    const assetId = b.rawMeta.asset_id.toLowerCase();
                    const translatedSource = translateAssetId(b.rawMeta.asset_id).toLowerCase();
                    sourceMatch = assetId.includes(query) || translatedSource.includes(query);
                }
                let productionMatch = false;
                if (useProduction) {
                    const prodResult = findProductionByMask(b, query);
                    productionMatch = prodResult && (prodResult.productions.length > 0 || prodResult.randomProductions.length > 0);
                }
                return nameMatch || eraMatch || typeMatch || sourceMatch || productionMatch;
            }
            
            let matches = false;
            if (useName && b.name.toLowerCase().includes(query)) matches = true;
            if (useType && translateType(b.type).toLowerCase().includes(query)) matches = true;
            if (useSource && b.rawMeta?.asset_id) {
                const assetId = b.rawMeta.asset_id.toLowerCase();
                const translatedSource = translateAssetId(b.rawMeta.asset_id).toLowerCase();
                if (assetId.includes(query) || translatedSource.includes(query)) matches = true;
            }
            if (useProduction && !matches) {
                const prodResult = findProductionByMask(b, query);
                if (prodResult && (prodResult.productions.length > 0 || prodResult.randomProductions.length > 0)) {
                    matches = true;
                }
            }
            return matches;
        });
        
        renderResults(filtered);
    };
    
    // Поиск
    searchInput.addEventListener('input', performSearch);
    
    // Кнопка очистки
    clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        clearBtn.style.display = 'none';
        searchInput.focus();
        window.currentProductionSearch = '';
        document.getElementById('resultsGrid').innerHTML = '';
    });
    
    // Чекбоксы фильтров
    const checkboxes = [filterName, filterType, filterSource];
    if (filterProduction) checkboxes.push(filterProduction);
    
    checkboxes.forEach(cb => {
        if (cb) {
            cb.addEventListener('change', () => {
                const query = searchInput.value.trim().toLowerCase();
                if (query.length >= 2) performSearch();
                else if (filterProduction?.checked && query.length >= 2) {
                    performSearch();
                }
            });
        }
    });
    
    // Закрытие модального окна по клику вне
    document.getElementById('basketModal').addEventListener('click', (e) => {
        if (e.target.id === 'basketModal') closeBasketModal();
    });
    
    // Закрытие по ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeBasketModal();
            if (window.activeBuildingId) {
                const card = document.querySelector(`.building-card[data-id="${window.activeBuildingId}"]`);
                if (card) card.classList.remove('active');
                window.activeBuildingId = null;
                window.activeEraOverride = null;
            }
        }
    });
}

// Глобальная переменная для хранения текущего поиска по продукции
window.currentProductionSearch = '';