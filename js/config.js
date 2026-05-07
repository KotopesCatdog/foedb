// === КОНСТАНТЫ ЭПОХ ===
window.InnoEras = {
    "NoEra": 0, "BronzeAge": 1, "IronAge": 2, "EarlyMiddleAge": 3, "HighMiddleAge": 4,
    "LateMiddleAge": 5, "ColonialAge": 6, "IndustrialAge": 7, "ProgressiveEra": 8,
    "ModernEra": 9, "PostModernEra": 10, "ContemporaryEra": 11, "TomorrowEra": 12,
    "FutureEra": 13, "ArcticFuture": 14, "OceanicFuture": 15, "VirtualFuture": 16,
    "SpaceAgeMars": 17, "SpaceAgeAsteroidBelt": 18, "SpaceAgeVenus": 19,
    "SpaceAgeJupiterMoon": 20, "SpaceAgeTitan": 21, "SpaceAgeSpaceHub": 22
};

window.EraNames = {
    "NoEra": "Без эпохи",
    "BronzeAge": "Бронзовый век",
    "IronAge": "Железный век",
    "EarlyMiddleAge": "Раннее средневековье",
    "HighMiddleAge": "Высокое средневековье",
    "LateMiddleAge": "Позднее средневековье",
    "ColonialAge": "Колониальная эпоха",
    "IndustrialAge": "Индустриальная эпоха",
    "ProgressiveEra": "Эпоха прогресса",
    "ModernEra": "Модерн",
    "PostModernEra": "Постмодерн",
    "ContemporaryEra": "Новейшее",
    "TomorrowEra": "Завтра",
    "FutureEra": "Будущее",
    "ArcticFuture": "Арктическое будущее",
    "OceanicFuture": "Океаническое будущее",
    "VirtualFuture": "Виртуальное будущее",
    "SpaceAgeMars": "Космическая эра: Марс",
    "SpaceAgeAsteroidBelt": "Пояс",
    "SpaceAgeVenus": "Венера",
    "SpaceAgeJupiterMoon": "Юпитер",
    "SpaceAgeTitan": "Титан",
    "SpaceAgeSpaceHub": "Хаб"
};

window.EraList = Object.keys(window.InnoEras)
    .filter(era => era !== "NoEra")
    .sort((a, b) => window.InnoEras[a] - window.InnoEras[b]);

// === МАППИНГИ БОНУСОВ ===
window.BoostsMapper = {
    "attack": ["attack"],
    "defense": ["defense"],
    "campaign": ["campaign"],
    "goods_production": ["goods_production"],
    "money_production": ["money_production"],
    "supplies_production": ["supplies_production"],
    "population": ["population"],
    "happiness": ["happiness"],
    "clan_power": ["clan_power"],
    "all": ["all"],
    "att_boost_attacker": ["attack"],
    "def_boost_defender": ["defense"]
};

window.BonusIcons = {
    "attack": "https://foehelp.ru/icons/attack.png",
    "att_boost_defender": "https://foehelp.ru/icons/att_boost_defender.png",
    "att_def_boost_attacker": "https://foehelp.ru/icons/att_def_boost_attacker.png",
    "att_def_boost_defender": "https://foehelp.ru/icons/att_def_boost_defender.png",
    "att_def_boost_attacker_defender": "https://foehelp.ru/icons/att_def_boost_attacker_defender.png",
    "defense": "https://foehelp.ru/icons/def_boost_defender.png",
    "def_boost_attacker": "https://foehelp.ru/icons/def_boost_attacker.png",
    "goods_production": "https://foehelp.ru/icons/all_goods_of_age.png",
    "forge_points_production": "https://foehelp.ru/icons/strategy_points.png",
    "money_production": "https://foehelp.ru/icons/money.png",
    "supplies_production": "https://foehelp.ru/icons/supplies.png",
    "happiness": "https://foehelp.ru/icons/happiness.png",
    "population": "https://foehelp.ru/icons/population.png",
    "clan_power": "https://foehelp.ru/icons/clan_power.png",
    "campaign": "https://foehelp.ru/icons/campaign.png",
    "default": "https://foehelp.ru/icons/boost_generic.png",
    "guild_raids_action_points_collection": "https://foehelp.ru/icons/guild_raids_action_points_collection.jpg",
    "guild_raids_action_points_capacity": "https://foehelp.ru/icons/guild_raids_action_points_capacity.png",
    "guild_raids_coins_production": "https://foehelp.ru/icons/guild_raids_coins_production.png",
    "guild_raids_coins_start": "https://foehelp.ru/icons/guild_raids_coins_start.png",
    "guild_raids_units_start": "https://foehelp.ru/icons/guild_raids_units_start.png",
    "guild_raids_supplies_production": "https://foehelp.ru/icons/guild_raids_supplies_production.png",
    "guild_raids_supplies_start": "https://foehelp.ru/icons/guild_raids_supplies_start.png",
    "guild_raids_goods_start": "https://foehelp.ru/icons/guild_raids_goods_start.png"
};

window.AllyRoomTypes = {
    "military": "Военная",
    "goods": "Товары",
    "money": "Монеты",
    "supplies": "Молотки",
    "all": "Все типы",
    "random": "Случайная"
};

window.FeatureNames = {
    "all": "Все",
    "guild_expedition": "Экспедиция",
    "battleground": "Поля",
    "guild_raids": "Кванты",
    "campaign": "Кампания",
    "arcade": "Аркада",
    "event": "Событие",
    "pvp": "PvP",
    "neighbor": "Соседи",
    "set": "Сет",
    "age": "Эпоха"
};

window.AssetIdTranslations = {
    "ArcheologyBonus19": "Археология 19",
    "ArcheologyBonus20": "Археология 20",
    "ArcheologyBonus21": "Археология 21",
    "ArcheologyBonus22": "Археология 22",
    "ANNI22": "Юбилейный 22", "ANNI23": "Юбилейный 23", "ANNI24": "Юбилейный 24", "ANNI25": "Юбилейный 25", "ANNI26": "Юбилейный 26",
    "SUM13": "Летний 13", "SUM14": "Летний 14", "SUM15": "Летний 15", "SUM16": "Летний 16", "SUM17": "Летний 17",
    "SUM18": "Летний 18", "SUM19": "Летний 19", "SUM20": "Летний 20", "SUM21": "Летний 21", "SUM22": "Летний 22",
    "SUM23": "Летний 23", "SUM24": "Летний 24", "SUM25": "Летний 25",
    "WIN12": "Зимний 12", "WIN13": "Зимний 13", "WIN14": "Зимний 14", "WIN15": "Зимний 15", "WIN16": "Зимний 16",
    "WIN17": "Зимний 17", "WIN18": "Зимний 18", "WIN19": "Зимний 19", "WIN20": "Зимний 20", "WIN21": "Зимний 21",
    "WIN22": "Зимний 22", "WIN23": "Зимний 23", "WIN24": "Зимний 24", "WIN25": "Зимний 25",
    "FELL23": "Осенний 23", "FELL24": "Осенний 24", "FELL25": "Осенний 25",
    "SPR25": "Весенний 25", "HAL25": "Хэллоуин 25", "CHR25": "Рождество 25",
    "STPAT": "Св. Патрик", "EASTER": "Пасха", "GBG": "Битва Гильдий"
};

// === НАСТРОЙКИ ПО УМОЛЧАНИЮ ===/
window.CurrentEra = "ContemporaryEra";
window.DEFAULT_BASKET_CONFIG = {
    resources: {
        strategy_points: { label: "СО", iconClass: "bg-fp" },
        money: { label: "Монеты", iconClass: "bg-money" },
        supplies: { label: "Молотки", iconClass: "bg-supplies" },
        goods: { label: "Товары", iconClass: "bg-goods" },
        clan_power: { label: "Сила гильдии", iconClass: "bg-meet" },
        medals: { label: "Медали", iconClass: "bg-fp" }
    },
    boosts: {},
    features: window.FeatureNames,
    settings: { 
        maxBasketSize: 30, 
        longPressDuration: 500 }
};