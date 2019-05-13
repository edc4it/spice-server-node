const Maybe = require('monet').Maybe;
const _ = require("underscore");

const _data = require('./test-data');
const yearDiff = new Date().getFullYear()-2015;
const data = _data.map(r => {
    const dp = new Date(r.datePublished);
    dp.setFullYear(dp.getFullYear()+yearDiff);
    const add = {datePublished:dp.toISOString()};
    return {...r, ...add}
});
const recipeInfos = data.map(e => _.pick(e, 'id', 'image', 'title', 'datePublished', 'difficulty', `recipeYield`, `cookTime`, `prepTime`));

module.exports = {

    all(sortByDate, titlePattern, page = 1) {
        const r = titlePattern
            ? recipeInfos.filter(r => (r.title.toLowerCase().indexOf(titlePattern.toLowerCase()) > -1))
            : _.sample(recipeInfos, 10).sort();
        const sortedOrNot = sortByDate
            ? r.sort((r1, r2) => r2.datePublished < r1.datePublished ? -1 : 1)
            : r;
        if (titlePattern) {
            const start = (page - 1) * 10;
            const totalPages = Math.ceil(sortedOrNot.length / 10);
            return [sortedOrNot.slice(start, start + 10), totalPages, sortedOrNot.length]
        }
        return [sortedOrNot, 1, 10];
    },

    findById(id) {
        return Maybe.fromUndefined(data.find(s => s.id === id))
    },

    addComment(id, comment) {
        return this.findById(id).map(r => r.reviews.push(comment))
    }
};

