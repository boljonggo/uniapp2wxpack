// 内部自定义插件，混写css
const {currentNamespace, mpTypeNamespace} = require('../preset')
const cssArr = Object.keys(mpTypeNamespace).map((key) => {
    return mpTypeNamespace[key].css
})
const cssRegExp = new RegExp(`\\.(${cssArr.join('|')})$`, 'i')
function cssMixinPlugin (content, {relative}) {
    if (relative.match(cssRegExp)) {
        content = content.replace(/@import\s*['"](\S+)['"]/g, function (match, cssUrl) {
            return `@import '${cssUrl.replace(cssRegExp, '.' + currentNamespace.css)}'`;
        });
    }
    return content
}
module.exports = cssMixinPlugin
