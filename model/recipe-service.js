const TsMonad = require('tsmonad');
const Immutable = require('immutable');

eval(require('fs').readFileSync('model/test-data.js', 'utf8'));

const includeProps = ['id','image','title','datePublished','difficulty'];
testDataList = Immutable.List(testData);

const overview = testDataList.map(function(r){
    const o = {};
    Object.keys(r).filter(function(a){
        return includeProps.indexOf(a) > -1;
    }).forEach(function(a){
        o[a] = r[a]
    });
    return o
});

const sortedOverview  = overview.sort((r1, r2) => r2.datePublished < r1.datePublished ? -1 : 1);

module.exports = {

    all: function (sortByDate, titlePattern, f) {
        const data =  sortByDate == true ?  sortedOverview : overview;
        const filteredData = data.filter(r => (titlePattern===undefined || titlePattern==="") || (r.title.toLowerCase().indexOf(titlePattern.toLowerCase()) > -1))

        f(undefined,filteredData);

    },


    findById: function (id, f) {
        // todo add Maybe monad
        let r = undefined;
        for (let i = 0; i < testData.length; i++) {
            if (testData[i].id === id) {
                r = testData[i];
                break;
            }
        }
        if (r)
            f(undefined, r);
        else
            f("not found", undefined);

    },

    addComment : function(id,comment,f){
        this.findById(id,function(error,data){
            if (!error){
                data.reviews.push(comment);
            }
            f(error);
        });
    }



};

