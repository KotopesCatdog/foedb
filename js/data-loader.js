// === ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ===
const DATA_URL = 'https://foehelp.ru//building.json';
let dataLoadDate = null;  // Дата файла на сервере (оставьте, если хотите показывать дату)
let useLocalFile = false; // Флаг использования локального файла
let localFileData = null; // Данные локального файла

// === ФУНКЦИЯ ОБНОВЛЕНИЯ ДАТЫ ===
function updateServerFileDate() {
    const dateElement = document.getElementById('serverFileDate');
    if (dateElement && dataLoadDate) {
        const formattedDate = dataLoadDate.toLocaleString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        dateElement.textContent = `📅 Дата обновления базы: ${formattedDate}`;
        dateElement.style.color = '#ffd700';
        dateElement.style.fontSize = '11px';
        dateElement.style.textAlign = 'center';
        dateElement.style.marginBottom = '10px';
    }
}

// === ФУНКЦИЯ ЗАГРУЗКИ ЛОКАЛЬНОГО ФАЙЛА ===
function initLocalFileUpload() {
    // Создаем input для файла (если его еще нет)
    if (!document.getElementById('localFileInput')) {
        const input = document.createElement('input');
        input.type = 'file';
        input.id = 'localFileInput';
        input.accept = '.json';
        input.style.display = 'none';
        
        input.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            try {
                const text = await file.text();
                localFileData = JSON.parse(text);
                useLocalFile = true;
                
                const statusMsg = document.getElementById('statusMsg');
                statusMsg.textContent = `✅ Загружен локальный файл: ${file.name}`;
                statusMsg.style.color = '#4ecdc4';
                
                // Перезагружаем данные
                loadData();
            } catch (error) {
                const statusMsg = document.getElementById('statusMsg');
                statusMsg.textContent = `❌ Ошибка загрузки файла: ${error.message}`;
                statusMsg.style.color = '#ff6b6b';
                console.error('Ошибка при чтении файла:', error);
            }
        });
        
        document.body.appendChild(input);
    }
}

// === ФУНКЦИЯ ОТКРЫТИЯ ДИАЛОГА ВЫБОРА ФАЙЛА ===
function selectLocalFile() {
    const input = document.getElementById('localFileInput');
    if (input) {
        input.click();
    }
}

// === ФУНКЦИЯ СБРОСА И ВОЗВРАТА К СЕРВЕРНЫМ ДАННЫМ ===
function resetToServerData() {
    useLocalFile = false;
    localFileData = null;
    const statusMsg = document.getElementById('statusMsg');
    statusMsg.textContent = 'Переключение на данные сервера...';
    statusMsg.style.color = '#ffd700';
    loadData();
}

// === ЗАГРУЗКА ДАННЫХ ===
async function loadData() {
    console.log(`🚀 Начало загрузки данных. Источник: ${useLocalFile ? 'Локальный файл' : 'Сервер'}`);
    const statusMsg = document.getElementById('statusMsg');
    statusMsg.textContent = "Загрузка конфигурации...";
    
    await loadBasketConfig();
    statusMsg.textContent = "Подключение к данным...";
    
    try {
        let rawData;
        
        if (useLocalFile && localFileData) {
            // Используем локальный файл
            console.log('📂 Используем локальный файл');
            rawData = localFileData;
            dataLoadDate = new Date();
            updateServerFileDate();
        } else {
            // Загружаем с сервера
            console.log(`🌐 Загружаем с сервера: ${DATA_URL}`);
            
            // Получаем дату файла
            const headResponse = await fetch(DATA_URL, { method: 'HEAD' });
            const lastModified = headResponse.headers.get('Last-Modified');
            if (lastModified) {
                dataLoadDate = new Date(lastModified);
            } else {
                dataLoadDate = new Date();
            }
            updateServerFileDate();
            
            // Загружаем данные
            const response = await fetch(DATA_URL);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            rawData = await response.json();
            useLocalFile = false;
        }
        
        console.log("✅ JSON получен. Тип:", Array.isArray(rawData) ? "Массив" : "Объект");
        
        statusMsg.textContent = "Анализ данных...";
        setTimeout(() => {
            try {
                const entities = Array.isArray(rawData) ? rawData : Object.values(rawData);
                window.allBuildings = [];
                let errorCount = 0, successCount = 0, buildingsWithAllyRooms = 0;
                
                console.log("⚙️ Обработка зданий...");
                entities.forEach((metaData, index) => {
                    if (!metaData || !metaData.id || !metaData.name) return;
                    try {
                        let mockData = { id: 0, cityentity_id: metaData.id, state: {}, bonus: metaData.bonus || null };
                        let era = null;
                        const building = window.CityBuildings.createBuilding(metaData, era, mockData);
                        if (building) {
                            window.allBuildings.push(building);
                            successCount++;
                            if (building.allyRooms) buildingsWithAllyRooms++;
                        } else { errorCount++; }
                        if (index < 3) console.log(`🏢 #${index}:`, metaData.name, "-> Эпоха:", building ? building.baseEra : "FAIL");
                    } catch (buildError) {
                        console.error("❌ Ошибка здания:", metaData.id, buildError);
                        errorCount++;
                    }
                });
                
                console.log(`✅ Готово. Успешно: ${successCount}, Ошибок: ${errorCount}, С комнатами союзников: ${buildingsWithAllyRooms}`);
                
                if (window.allBuildings.length === 0) {
                    statusMsg.textContent = `Ошибка: Найдено 0 зданий.`;
                    statusMsg.style.color = '#ff6b6b';
                    document.getElementById('resultsGrid').innerHTML = '<div class="no-results" style="color:#ff6b6b">Здания не загружены. См. консоль (F12).</div>';
                } else {
                    statusMsg.textContent = `Готово. Найдено: ${window.allBuildings.length}.`;
                    statusMsg.style.color = '#c5c6c7';
                    document.getElementById('searchInput').disabled = false;
                    document.getElementById('searchInput').focus();
                    document.getElementById('resultsGrid').innerHTML = '';
                    loadBasket();
                }
            } catch (parseError) {
                console.error("💥 Критическая ошибка:", parseError);
                statusMsg.textContent = `Ошибка обработки.`;
                statusMsg.style.color = '#ff6b6b';
            }
        }, 50);
    } catch (error) {
        console.error('🔥 Ошибка загрузки:', error);
        const statusMsg = document.getElementById('statusMsg');
        statusMsg.textContent = `Ошибка загрузки JSON.`;
        statusMsg.style.color = '#ff6b6b';
    }
}

// === ПОЛУЧЕНИЕ ДАННЫХ ЗДАНИЯ ДЛЯ ЭПОХИ ===
function getBuildingDataForEra(building, era) {
    return {
        population: window.CityBuildings.setPopulation(building.rawMeta, building.rawData, era),
        happiness: window.CityBuildings.setHappiness(building.rawMeta, building.rawData, era),
        boosts: window.CityBuildings.setBuildingBoosts(building.rawMeta, building.rawData, era),
        production: window.CityBuildings.setAllProductions(building.rawMeta, building.rawData, era)
    };
}
