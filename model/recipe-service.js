const Maybe = require('monet').Maybe;
const _ = require("underscore");

const data = require('./test-data');
const overview = data.map(e=>_.pick(e,'id', 'image', 'title', 'datePublished', 'difficulty'));

module.exports = {

    all(sortByDate, titlePattern) {
        const r = titlePattern
            ? overview.filter(r => (r.title.toLowerCase().indexOf(titlePattern.toLowerCase()) > -1))
            : _.sample(overview, 10).sort();
        if (sortByDate)
            return r.sort((r1, r2) => r2.datePublished < r1.datePublished ? -1 : 1);
        else
            return r;
    },

    findById(id) {
        return Maybe.fromUndefined(data.find(s => s.id === id))
    },

    addComment(id, comment) {
        return this.findById(id).map(r => r.reviews.push(comment))
    }
};

