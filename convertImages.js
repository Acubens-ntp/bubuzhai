const fs = require('fs');
const path = require('path');

const folderPath = '32卦卡片封面';
const jsonPath = '32卦隐藏款.json';

// Read the existing JSON
const jsonContent = fs.readFileSync(jsonPath, 'utf8');
const hiddenGua = JSON.parse(jsonContent);

// Function to convert image file to base64
function convertImageToBase64(imagePath) {
    const imageBuffer = fs.readFileSync(imagePath);
    const base64 = imageBuffer.toString('base64');
    const ext = path.extname(imagePath).toLowerCase();
    
    if (ext === '.png') {
        return `data:image/png;base64,${base64}`;
    } else if (ext === '.jpg' || ext === '.jpeg') {
        return `data:image/jpeg;base64,${base64}`;
    }
    return '';
}

// Map the hidden gua id to image filenames
const idToFileMap = {
    "01": "01.png",
    "02": "02.png",
    "03": "03.png",
    "04": "04.png",
    "05": "05.png",
    "06": "06.png",
    "07": "07.png",
    "08": "08.png",
    "09": "09.png",
    "10": "010.png",
    "11": "011.png",
    "12": "012.png",
    "13": "013.png",
    "14": "014.png",
    "15": "015.png",
    "16": "016.png",
    "17": "017.png",
    "18": "018.png",
    "19": "019.png",
    "20": "020.png",
    "21": "021.png",
    "22": "022.png",
    "23": "023.png",
    "24": "024.png",
    "25": "025.png",
    "26": "026.png",
    "27": "027.png",
    "28": "028.png",
    "29": "029.png",
    "30": "030.png",
    "31": "031.png",
    "32": "00.png"
};

// Process each hidden gua
hiddenGua.h.forEach((gua, index) => {
    const id = gua.id;
    if (idToFileMap[id]) {
        const imageFile = path.join(folderPath, idToFileMap[id]);
        if (fs.existsSync(imageFile)) {
            console.log(`Converting ${imageFile}...`);
            const base64Image = convertImageToBase64(imageFile);
            gua.cardImage = base64Image;
        }
    }
});

// Save the updated JSON
fs.writeFileSync(jsonPath, JSON.stringify(hiddenGua, null, 2), 'utf8');

console.log(`Done! Updated JSON saved to ${jsonPath}`);
