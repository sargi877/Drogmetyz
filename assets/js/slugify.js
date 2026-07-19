// assets/js/slugify.js

const CATEGORY_MAP = {
    'Гвинти': 'hvynty',
    'Болти': 'bolty',
    'Гайки': 'haiky',
    'Шайби кільця': 'shaiby-kiltsia',
    'Кріплення для сонячних панелей': 'kriplennia-soniachni',
    'Заклепки': 'zaklepky',
    'Шпильки різьбові': 'shpylky',
    'Саморізи': 'samorizy',
    'Шурупи': 'shurupy',
    'Штифти': 'shtyfty',
    'Такелаж': 'takelazh',
    'Хомути/кляймери': 'khomuty',
    'Шплінти': 'shplinty',
    'Анкери': 'ankery',
    'Оснастка для яхт': 'yakhty',
    'Дюбелі': 'diubeli',
    'Інструменти': 'instrumenty',
    'Піни/Клеї/Герметики': 'himiia'
};

export function slugifyCategory(ukrName) {
    const name = ukrName.trim();
    for (const [key, val] of Object.entries(CATEGORY_MAP)) {
        if (key === name) return val;
    }
    return name.toLowerCase().replace(/[^a-zа-я0-9]+/g, '-');
}

export function unslugifyCategory(slug) {
    for (const [key, val] of Object.entries(CATEGORY_MAP)) {
        if (val === slug) return key;
    }
    return slug;
}

export function slugifyStandard(standardStr) {
    const match = standardStr.match(/^(DIN|ISO|ГОСТ)\s+([\d-]+)/i);
    if (match) {
        return `${match[1].toLowerCase()}-${match[2]}`;
    }
    return standardStr.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}
