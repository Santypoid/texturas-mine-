const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const { off } = require('process');

predef_model_big = `{
    "format_version": "1.21.11",
    "credit": "Made with Blockbench",
    "parent": "minecraft:item/generated",
    "texture_size": [32, 103],
    "textures": {
		"0": "minecraft:guide/texts",
		"1": "@",
		"particle": "#0"
    },
    "elements": [
        {
            "from": [0, 9.5, 7],
            "to": [16, 16, 7],
            "rotation": { "angle": 0, "axis": "y", "origin": [8, 9, 8] },
            "faces": {
                "north": { "uv": [@], "texture": "#0" },
                "south": { "uv": [@], "texture": "#0" }
            }
        },
        {
            "from": [4, 0, 7],
            "to": [12, 8, 7],
            "rotation": { "angle": 0, "axis": "y", "origin": [8, 7, 7] },
            "color": 2,
            "faces": {
                "north": {"uv": [0,0,16,16],"texture": "#1" },
                "south": {"uv": [0,0,16,16],"texture": "#1" }
            }
        }
    ],
    "gui_light": "front",
    "display": {
        "gui": {
            "rotation": [0, 180, 0]
        }
    }
}`;
predef_model_small = `{
	"format_version": "1.21.11",
	"credit": "Made with Blockbench",
	"parent": "minecraft:item/generated",
	"texture_size": [32, 102],
	"textures": {
		"0": "minecraft:guide/texts",
		"1": "@",
		"particle": "#0"
	},
	"elements": [
		{
			"from": [0, 12.125, 7],
			"to": [16, 16, 7],
			"rotation": {"angle": 0, "axis": "y", "origin": [8, 9, 8]},
			"faces": {
				"north": {"uv": [@], "texture": "#0"},
				"south": {"uv": [@], "texture": "#0"}
			}
		},
		{
			"from": [4, 0, 7],
			"to": [12, 8, 7],
			"rotation": {"angle": 0, "axis": "y", "origin": [8, 7, 7]},
			"color": 2,
			"faces": {
                "north": {"uv": [0,0,16,16],"texture": "#1" },
                "south": {"uv": [0,0,16,16],"texture": "#1" }
			}
		}
	],
	"gui_light": "front",
	"display": {
		"gui": {
			"rotation": [0, 180, 0]
		}
	}
}`
predef_model_paper = `{
    "model": {
        "type": "minecraft:select",
        "property": "minecraft:component",
        "component": "custom_name",
        "cases": [
            {
                "when": "Guide",
                "model": {
                    "type": "minecraft:select",
                    "property": "minecraft:local_time",
                    "pattern": "s",
                    "cases": [
                        @
                    ],
                    "fallback": {
                        "type": "minecraft:model",
                        "model": "minecraft:item/paper"
                    }
                }
            }
        ],
        "fallback": @
    }
}`;

// author: https://www.reddit.com/r/PixelArt/comments/ppcd19/smallest_legible_pixel_fonts/
const charMap = [
    0b111101111101000,
    0b110111101111000,
    0b111100100111000,
    0b110101101110000,
    0b111110100111000,
    0b111100110100000,
    0b111100101111000,
    0b101111101101000,
    0b111010010111000,
    0b111010010110000,
    0b101110110101000,
    0b100100100111000,
    0b111111111101000,
    0b111101101101000,
    0b111101101111000,
    0b111101111100000,
    0b111101111001000,
    0b111111110101000,
    0b111100011111000,
    0b111010010010000,
    0b101101101111000,
    0b101101101010000,
    0b101111111111000,
    0b101110011101000,
    0b101111010010000,
    0b111011100111000,

    0b000011111111000,
    0b100111101111000,
    0b000111100111000,
    0b001111101111000,
    0b000110110111000,
    0b011010111010000,
    0b000111111001111,
    0b100111101101000,
    0b100000100100000,
    0b010000010010110,
    0b100101110101000,
    0b100100100110000,
    0b000111111101000,
    0b000111101101000,
    0b000111101111000,
    0b000111101111100,
    0b000111101111001,
    0b000111100100000,
    0b000011010110000,
    0b010111010011000,
    0b000101101111000,
    0b000101101010000,
    0b000101111111000,
    0b000101010101000,
    0b000101111001110,
    0b000111010001110,
];
const charWidth = [
    3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 2, 3, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3
]

letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

const SecondPerRecipe = 2;
const black = [0, 0, 0, 255];
const white = [255, 255, 255, 255];

function smartFloor(num, multFactor = 1000) {
    const bigNum = Math.round(num * multFactor) / multFactor;
    return Math.floor(Math.round(num * multFactor) / multFactor);
}

function drawTextBuffer(text) {
    const charHeight = 5;
    const spacing = 1;
    const text1 = text.split(' ')[0];
    const text2 = text.split(' ')[1] || '';
    const widthText1 = text1.split('').reduce((acc, char) => {
        const charIdx = letters.indexOf(char);
        if (charIdx === -1) return acc + (charWidth[charIdx] + spacing);
        return acc + charWidth[charIdx] + spacing;
    }, 0);
    const widthText2 = text2.split('').reduce((acc, char) => {
        const charIdx = letters.indexOf(char);
        if (charIdx === -1) return acc + (charWidth[charIdx] + spacing);
        return acc + charWidth[charIdx] + spacing;
    }, 0);
    const width = Math.min(Math.max(widthText1, widthText2) + 4, 32);
    const height = text2 ? charHeight * 2 + 3 : charHeight + 3;
    if (text1.length > 7 || text2.length > 7) {
        console.warn(`⚠️ Aviso: O texto "${text}" pode ser muito longo e ficar ilegível.`);
    }

    // Criamos um buffer de pixels (RGBA)
    // Inicialmente tudo transparente [0, 0, 0, 0]
    const canvas = Buffer.alloc(width * height * 4, 0);
    canvas.fill(255)
    for (let y = 1; y < height - 1; y++) {
        canvas.set(black, (y * width + 0) * 4); // Borda esquerda
        canvas.set(black, (y * width + (width - 1)) * 4); // Borda direita
    }
    for (let x = 1; x < width - 1; x++) {
        canvas.set(black, (0 * width + x) * 4); // Borda superior
        canvas.set(black, ((height - 1) * width + x) * 4); // Borda inferior
    }
    canvas.fill(0, 0, 8)
    canvas.fill(0, (width - 2) * 4, (width + 1) * 4)
    canvas.fill(0, (2 * width - 2) * 4, (2 * width) * 4)
    canvas.set(black, (width + 1) * 4)
    canvas.set(black, (2 * width - 2) * 4)

    canvas.fill(0, ((height - 2) * width) * 4, ((height - 2) * width + 2) * 4)
    canvas.fill(0, ((height - 1) * width - 2) * 4, ((height - 1) * width + 2) * 4)
    canvas.fill(0, (height * width - 2) * 4, (height * width) * 4)
    canvas.set(black, ((height - 2) * width + 1) * 4)
    canvas.set(black, ((height - 1) * width - 2) * 4)

    let cursorX = 0;
    let cursorY = 0;

    for (const char of text) {
        const charIdx = letters.indexOf(char);
        if (char === " ") {
            cursorX = 0;
            cursorY += charHeight;
            continue;
        }
        if (charIdx === -1) { cursorX += (3 + spacing); continue; }


        const bits = charMap[charIdx];

        // Percorrer a grade 3x5
        for (let y = 0; y < charHeight; y++) {
            for (let x = 0; x < charWidth[charIdx]; x++) {
                // O bit correspondente (da esquerda para a direita, cima para baixo)
                // 14 é o bit mais significativo (primeiro pixel)
                const bitIndex = 14 - (y * 3 + x);
                const isPixelOn = (bits >> bitIndex) & 1;

                const pos = ((y + 2 + cursorY) * width + (cursorX + x + 2)) * 4;
                canvas.fill(255, pos, pos + 4); // Branco
                if (isPixelOn) canvas.fill(0, pos, pos + 3); // RGB preto
            }
        }


        cursorX += (charWidth[charIdx] + spacing);
    }

    return { buffer: canvas, width, height };
}

async function generateAtlas(items) {
    const atlasWidth = 32; // Largura padrão para texturas de texto

    // 2. Preparar as "camadas" (layers)
    const layers = [];
    let totalHeight = 0;
    for (let i = 0; i < items.length; i++) {
        const { buffer, width, height } = drawTextBuffer(items[i].name, 2);

        layers.push({
            input: buffer,
            raw: { width, height, channels: 4 },
            top: totalHeight,
            left: (atlasWidth - width) >> 1, // Centraliza um pouco no espaço da linha
        });
        totalHeight += height;
    }

    const newItemAtlas = [];
    const modelList = [];
    const maxCiclesPerMinute = 60 / SecondPerRecipe;
    const ciclesPerMinute = maxCiclesPerMinute / items.length;
    const cicleParams = [];
    for (let i = 0; i < ~~ciclesPerMinute; i++) {
        cicleParams.push(i * 60 / ~~ciclesPerMinute);
    }

    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        let icon = item.icon;
        if (!item.icon.startsWith("minecraft:item/")) {
            newItemAtlas.push(icon);
            icon = "minecraft:guide/" + icon.split('/').slice(1).join('/');
        }
        const x = (layers[i].left >> 5) << 5;
        const y = layers[i].top;
        const height = layers[i].raw.height;
        const width = 32;
        const isBig = height >= 10;
        const modelName = `${item.icon.split('/').slice(1).join('_')}-${item.name.replace(/ /g, '_')}`;
        const modelPath = path.join(__dirname, 'assets', 'minecraft', 'models', 'guide', modelName);
        const uv = [
            (x) / 32 * 16,
            (y) / totalHeight * 16,
            (x + width) / 32 * 16,
            (y + height) / totalHeight * 16,
        ].join(', ');
        let when = [];
        for (const offset of cicleParams) {
            const min = ~~(i / items.length * maxCiclesPerMinute);
            const max = ~~((i + 1) / items.length * maxCiclesPerMinute);
            for (let j = min; j < max; j++) {
                when.push((j + offset).toString());
            }
        }
        modelList.push(JSON.stringify({
            when,
            model: {
                type: "minecraft:model",
                model: "minecraft:guide/" + modelName
            }
        }));

        const modelTxt = (isBig ? predef_model_big : predef_model_small)
            .replace("@", icon)
            .replace("@", uv)
            .replace("@", uv);

        fs.writeFileSync(modelPath + ".json", modelTxt);
    }
    const paperPath = path.join(__dirname, 'assets', 'minecraft', 'items', 'paper.json');
    let fallback = `{
            "type": "minecraft:model",
            "model": "minecraft:item/paper"
        }`
    if (fs.existsSync(paperPath)) {
        const existingPaper = fs.readFileSync(paperPath, 'utf-8');
        if (existingPaper) { 
            console.log("✅ Arquivo paper.json existente encontrado, usando modelo como fallback.");
            const existingPaperJson = JSON.parse(existingPaper);
            fallback = JSON.stringify(existingPaperJson.model, null, 2);
        }
    }
    fs.writeFileSync(paperPath, predef_model_paper
        .replace("@", `${modelList.join(',\n\t\t\t\t\t\t')}`)
        .replace("@", fallback)
    );
    fs.writeFileSync(path.join(__dirname, 'assets', 'minecraft', 'atlases', 'items.json'), JSON.stringify({
        sources: [...new Set(newItemAtlas)].map(name => ({
            type: "minecraft:single",
            resource: name,
            sprite: "minecraft:guide/" + name.split('/').slice(1).join('/')
        })).concat([{
            type: "minecraft:single",
            resource: "minecraft:guide/texts"
        }])
    }, null, 2));

    let baseImage = sharp({
        create: {
            width: atlasWidth,
            height: totalHeight,
            channels: 4,
            background: { r: 0, g: 0, b: 0, alpha: 0 }
        }
    });

    baseImage
        .composite(layers)
        .png()
        .toFile('assets/minecraft/textures/guide/texts.png')
        .then(() => {
            console.log("✅ Atlas 'texts.png' gerado com sucesso!");
        });

}
function findItemCustomnameInModel(modelJson, fileName) {
    const models = [];
    if (("component" in modelJson) && modelJson["component"].endsWith("custom_name")) {
        const cases = modelJson["cases"];
        const fallBack = modelJson["fallback"];
        for (const caseItem of cases) {
            models.push(caseItem['when'])
        }
    }
    if (fileName) {
        if ("fallback" in modelJson && modelJson["fallback"]["type"] === "minecraft:model") {
            return models.map(f => ({ name: f, icon: modelJson["fallback"]["model"] }));
        }
        return models.map(f => ({ name: f, icon: fileName }));
    }
    return models;
}

const files = fs.readdirSync(path.join(__dirname, 'assets', 'minecraft', 'items'))
const items = [{ name: "Guide", icon: "minecraft:item/paper" }];
for (const file of files) {
    if (!file.endsWith('.json')) continue;
    const json = require(path.join(__dirname, 'assets', 'minecraft', 'items', file));
    items.push(...findItemCustomnameInModel(json.model, file));
}

if (!fs.existsSync(path.join(__dirname, 'assets', 'minecraft', 'atlases'))) { 
    fs.mkdirSync(path.join(__dirname, 'assets', 'minecraft', 'atlases'), { recursive: true });
}
if (!fs.existsSync(path.join(__dirname, 'assets', 'minecraft', 'models', 'guide'))) { 
    fs.mkdirSync(path.join(__dirname, 'assets', 'minecraft', 'models', 'guide'), { recursive: true });
}
if (!fs.existsSync(path.join(__dirname, 'assets', 'minecraft', 'textures', 'guide'))) { 
    fs.mkdirSync(path.join(__dirname, 'assets', 'minecraft', 'textures', 'guide'), { recursive: true });
}
generateAtlas(items);

