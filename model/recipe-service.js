const Immutable = require('immutable');
const Maybe = require('monet').Maybe;
const testData = require('./test-data');


const includeProps = ['id', 'image', 'title', 'datePublished', 'difficulty'];
testDataList = Immutable.List(testData);

const overview = testDataList.map(r => {
    const o = {};
    Object.keys(r).filter(a => includeProps.indexOf(a) > -1).forEach(function (a) {
        o[a] = r[a]
    });
    return o
});

const sortedOverview = overview.sort((r1, r2) => r2.datePublished < r1.datePublished ? -1 : 1);

module.exports = {

    all(sortByDate, titlePattern) {
        const data = sortByDate === true ? sortedOverview : overview;
        return data.filter(r => (titlePattern === undefined || titlePattern === "") || (r.title.toLowerCase().indexOf(titlePattern.toLowerCase()) > -1))
    },

    findById(id) {
        return Maybe.fromUndefined(testData.find(s => s.id === id))
    },

    addComment(id, comment) {
        return this.findById(id).map(r => r.reviews.push(comment))
    }
};

