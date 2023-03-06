import fs from 'fs'
import { resolve } from 'path'

const svgDirPath = resolve(__dirname, '../SVG');
const inlineSVGDirPath = resolve(__dirname, '../INLINE_SVG');

const styleTagRegex = /<style[\s\S]*?<\/style>\n?/m;
const styleRegex = /^\.(st\d{1,})\{([^\}]*)\}$/;

(async () => {
  const fileNames = fs.readdirSync(svgDirPath)
  for (const fileName of fileNames) {
    const svgPath = resolve(svgDirPath, fileName)
    let svgFile = fs.readFileSync(svgPath, 'utf-8')

    const hasStyleTag = styleTagRegex.test(svgFile)
    if (hasStyleTag) {
      const styleTagMatch = svgFile.match(styleTagRegex);
      console.log(styleTagMatch)
      const styles = styleTagMatch![0].replace(/.*$/, '').replace(/^.*/, '').split('\n').map((line) => line.trim()).filter((line) => !!line);
      console.log('styles', styles)
      svgFile = svgFile.replace(styleTagRegex, '')
      for (const style of styles) {
        if (style === '</style>') continue
        if (!styleRegex.test(style)) {
          console.log(fileName)
          console.log(style)
          console.log('Style does not match regex')
          process.exit()
        }
        const match = style.match(styleRegex);
        const className = match![1];
        const styleContent = match![2].replace(/\s/g, '');
        console.log(className, styleContent)

        svgFile = svgFile.replace(new RegExp(`class="${className}"`, 'g'), `style="${styleContent}"`);
      }
    }

    console.log('Writing file:', fileName)
    fs.writeFileSync(resolve(inlineSVGDirPath, fileName), svgFile);
  }
})()