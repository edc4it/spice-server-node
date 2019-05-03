const express = require('express');
const recipes = require("../model/recipe-service.js");
const router = express.Router();


// todo add reactive endpoint

router.route('/recipes')
    .get((req, res) => {
        const rs = recipes.all(req.query.sort === "datePublished", req.query.titlePattern);
        res.json(rs);
    });

router.route('/recipes/:id')
    .get((req, res) => {
        recipes.findById(req.params.id)
            .cata(() => res.status(404).send('Not found'), (r) => res.json(r))
    });


router.route('/recipes/:recipe_id/comment')
    .post((req, res) => {
        const comment = req.body;
        recipes.addComment(req.params.recipe_id, comment)
            .cata(() => res.status(404).send('Not found'), (i) => res.send({message: 'comment added'}));

    });

module.exports = router;
