const fs = require('fs');
const content = fs.readFileSync('C:/Users/fumij/.gemini/antigravity/brain/f16b7ebb-ece7-496f-baf0-7003a22f4b6e/.system_generated/steps/1090/content.md', 'utf8');
const regex = /class="wrap-link" href="\/items\/[^"]+">([^<]+)<\/a>/g;
let match;
const titles = new Set();
while ((match = regex.exec(content)) !== null) {
  let title = match[1];
  title = title.replace(/（[^）]+）/g, ''); // Remove (Anime) etc
  title = title.replace(/ 第\d+期/g, '');
  title = title.replace(/ \d+th season/gi, '');
  title = title.replace(/ Season\d+/gi, '');
  title = title.replace(/ シーズン\d+/gi, '');
  title = title.replace(/ FULLMETAL ALCHEMIST/gi, '');
  title = title.replace(/ THE ANIMATION/gi, '');
  title = title.replace(/ THE COMIC/gi, '');
  title = title.trim();
  titles.add(title);
}
console.log(Array.from(titles).join('\n'));
