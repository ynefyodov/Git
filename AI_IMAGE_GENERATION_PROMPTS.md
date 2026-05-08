# Промпты для ИИ (картинки) — DND Tavern Prototype

Скопируй блок целиком в Midjourney, DALL·E, Stable Diffusion, Ideogram, Krea и т.п.  
Подстрой соотношение сторон под модель (`--ar` в MJ: для фона `16:9`, для спрайта `1:1`).

---

## 1. Общий стиль (добавляй к каждому промпту)

**EN (style suffix)**  
`dark fantasy, D&D 5e tavern vibe, painterly game art, readable silhouette, slightly desaturated, warm candlelight accents, no text, no watermark, no UI`

**RU (кратко для русскоязычных моделей)**  
`тёмное фэнтези, стиль D&D, игровой арт, читаемый силуэт, приглушённые цвета, без текста и водяных знаков`

**Negative (по желанию)**  
`blurry, low contrast, oversaturated neon, anime chibi, photorealistic human face close-up, modern objects, logo, frame`

---

## 2. Технические ориентиры под код игры

| Тип | Куда положить файл | Формат | Примечание |
|-----|-------------------|--------|------------|
| Герой | `assets/characters/hero-knight.svg` (или замени на `.png` и обнови путь в `src/assets.js`) | квадрат **512×512** или **1024×1024**, прозрачный фон | В игре масштаб ~круг **r≈15** → спрайт **~64px** в диаметре видимой модели; запас по разрешению полезен. |
| Враги | `assets/enemies/*.svg` | как у героя | Ключи в коде: `rat`, `thug`, `cultist`, `tavern_guard_boss`, `dock_warden_boss`. |
| Фоны | `assets/backgrounds/*.svg` | **1920×1080** или ровно **960×540** | Топ-даун / слегка изометрический «пол» арены; без персонажей по центру. |
| Снаряд | `assets/fx/holy-bolt.svg` | **256×256**, α | Маленький «болт»/сгусток света. |

После генерации: обрежь лишнее, выровняй персонажа **по центру** кадра, сохрани прозрачность по краям спрайта.

---

## 3. Персонажи (герой)

### 3.1 Основной герой (один спрайт на все классы)

**Файл в проекте:** `assets/characters/hero-knight.svg`  
**Ключ в коде:** `hero`

**EN**  
`single game character sprite, top-down view, fantasy adventurer in travel cloak and light armor, shield on one side, sword or hand free, facing slightly down-right, full body centered in frame, transparent background, 512x512, dark fantasy D&D tavern hero, readable at small size`

**RU**  
`один игровой спрайт персонажа, вид сверху, фэнтези авантюрист в плаще и лёгких доспехах, щит сбоку, меч, смотрит вниз-вправо, весь силуэт по центру, прозрачный фон, 512 на 512`

**Вариация «второй игрок кооп» (опционально отдельный файл)**  
Тот же силуэт, но **фиолетово-синяя** палитра плаща/наплечников вместо сине-стальной — чтобы отличать P2 (в коде сейчас один `hero`; второй игрок использует тот же арт).

---

## 4. Фоны (арена)

### 4.1 Таверна, уровень 1

**Файл:** `assets/backgrounds/tavern-topdown.svg`  
**Ключ:** `tavern_bg`

**EN**  
`top-down battle map, medieval fantasy tavern interior floor, wooden planks, scattered tables and benches seen from above, fireplace glow, barrels, dim atmospheric lighting, 960x540 composition, game background, no characters, painterly`

**RU**  
`карта боя вид сверху, интерьер таверны средневекового фэнтези, доски пола, столы и лавки сверху, очаг, бочки, сумрачный свет, игровой фон без персонажей, 960 на 540`

### 4.2 Ночные доки, уровень 2

**Файл:** `assets/backgrounds/docks-night.svg`  
**Ключ:** `docks_bg`

**EN**  
`top-down night harbor docks, wet wooden piers, mooring ropes, distant ship masts, cold blue moonlight and warm sparse lantern, fog near water, 960x540 game background, dark fantasy, no characters`

**RU**  
`вид сверху ночные доки, мокрые деревянные причалы, канаты, мачты кораблей вдали, лунный холодный свет и редкие фонари, туман у воды, игровой фон без людей, 960 на 540`

---

## 5. Враги

### 5.1 Крыса-разбойник

**Файл:** `assets/enemies/rat-rogue.svg`  
**Ключ:** `rat`

**EN**  
`small enemy sprite top-down, giant aggressive rat with ragged cloak scrap and tiny dagger, orange-brown fur accent, mischievous pose, transparent background, 512x512, stylized not cute`

**RU**  
`малый враг вид сверху, огромная агрессивная крыса с лохмотьями плаща и кинжалом, рыжевато-коричневая шерсть, прозрачный фон`

### 5.2 Головорез

**Файл:** `assets/enemies/thug-bruiser.svg`  
**Ключ:** `thug`

**EN**  
`medium enemy top-down, burly tavern brawler, leather vest, broken nose, club or fist, brick-red and brown tones, threatening silhouette, transparent background, 512x512`

**RU**  
`враг вид сверху, здоровяк головорез из таверны, кожаный жилет, дубина или кулаки, кирпично-коричневые тона, угрожающий силуэт, прозрачный фон`

### 5.3 Культист

**Файл:** `assets/enemies/cultist-acolyte.svg`  
**Ключ:** `cultist`

**EN**  
`medium enemy top-down, hooded cult acolyte, violet and deep purple robes, faint ritual sigil feel, faster sneaky silhouette, transparent background, 512x512`

**RU**  
`культист в капюшоне вид сверху, фиолетовые одеяния, намёк на ритуальные символы, быстрый стройный силуэт, прозрачный фон`

### 5.4 Босс — страж таверны

**Файл:** `assets/enemies/tavern-guard-boss.svg`  
**Ключ:** `tavern_guard_boss`

**EN**  
`large boss sprite top-down, heavily armored tavern guard captain, halberd or polearm, golden-trimmed armor, broad shoulders, imposing, gold and steel palette, transparent background, 1024x1024, reads clearly when scaled down`

**RU**  
`крупный босс вид сверху, тяжело бронированный капитан стражи таверны, алебарда, золотые акценты на доспехах, внушительный силуэт, прозрачный фон`

### 5.5 Босс — смотритель доков

**Файл:** `assets/enemies/dock-warden-boss.svg`  
**Ключ:** `dock_warden_boss`

**EN**  
`large boss sprite top-down, dock warden in long coat and tricorn or wide hat, hook or chain motif, weathered brass and sea-salt green accents, night harbor authority, transparent background, 1024x1024`

**RU**  
`босс вид сверху, смотритель доков в длинном плаще и широкополой шляпе, мотив крюка или цепи, латунь и морские зеленоватые акценты, прозрачный фон`

---

## 6. Эффекты

### 6.1 Снаряд (святой/магический болт)

**Файл:** `assets/fx/holy-bolt.svg`  
**Ключ:** `projectile`

**EN**  
`small magical projectile icon, concentrated holy light bolt, soft white-blue core, subtle halo, transparent background, 256x256, centered`

**RU**  
`маленькая иконка магического снаряда, сгусток святого света, бело-голубое ядро, ореол, прозрачный фон, по центру`

---

## 7. Опционально: портреты классов (не в коде — для меню/обложки)

Используй имена из игры: **Воин**, **Варвар**, **Следопыт**, **Колдун** (`fighter`, `barbarian`, `ranger`, `warlock`).

**EN (шаблон)**  
`bust portrait fantasy RPG class [CLASS_NAME], painterly D&D character art, dark tavern background blur, no text`

Пример для следопыта:  
`bust portrait fantasy ranger with bow, leather armor, focused eyes, painterly D&D art, warm rim light, no text`

---

## 8. Чеклист после генерации

1. Прозрачный фон у всех персонажей/врагов/снаряда.  
2. Силуэт по центру квадрата.  
3. Фон арены без персонажей; горизонт не «киношный» — ориентация на **пол** сверху.  
4. Положи файлы по путям из таблицы или обнови `ASSET_PATHS` в `src/assets.js` на `.png`.  
5. Пересобери игру: `npm run dist` (Windows portable в папке `dist`).
