const Maybe = require('monet').Maybe;
const _ = require("underscore");

const _data = require('./test-data');
const yearDiff = new Date().getFullYear() - 2015;
const faker = require('faker');

let data = _data.map(r => {
    const add = {
        datePublished: faker.date.past(1).toISOString(),
        author: faker.name.findName(),
        reviews: [...Array(faker.random.number({min: 2, max: 5}))].map(() => {
            const author = {
                first_name: faker.name.firstName(),
                last_name: faker.name.lastName(),
                user_name: faker.internet.userName(this.first_name, this.last_name)
            };
            return {
                "rate": faker.random.number({min: 1, max: 5}),
                "name": author.user_name,
                "avatar": faker.internet.avatar(),
                "country": faker.address.country(),
                "email": faker.internet.email(author.user_name),
                "submitted": faker.date.past(1).toISOString(),
                "text": faker.lorem.paragraphs(faker.random.number({min: 1, max: 3}))
            }

        })


    };
    return {...r, ...add}
});


module.exports = {

    all(sortByDate, titlePattern, page = 1) {
        const r = titlePattern
            ? data.filter(r => (r.title.toLowerCase().indexOf(titlePattern.toLowerCase()) > -1))
            : _.sample(data, 10).sort();

        const sortedOrNot = sortByDate
            ? r.sort((r1, r2) => r2.datePublished < r1.datePublished ? -1 : 1)
            : r;
        if (titlePattern) {
            const start = (page - 1) * 10;
            const totalPages = Math.ceil(sortedOrNot.length / 10);
            return [sortedOrNot.slice(start, start + 10), totalPages, sortedOrNot.length]
        }
        const recipeInfos = sortedOrNot.map(e => _.pick(e, 'id', 'image', 'title', 'datePublished', 'difficulty', `recipeYield`, `cookTime`, `prepTime`, 'author'));

        return [recipeInfos, 1, 10];
    },

    findById(id) {
        return Maybe.fromUndefined(data.find(s => s.id === id))
    },

    addComment(id, comment) {
        return this.findById(id).map(r => r.reviews.push(comment))
    },

    add(recipe) {
        data = [...data, recipe]
    }

};

