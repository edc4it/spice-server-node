const express = require('express');
var recipes = require("../model/recipe-service.js");
const router = express.Router();


// todo add reactive endpoint

router.route('/recipes')
    .get(function (req, res) {

        recipes.all(req.query.sort==="datePublished", req.query.titlePattern, function (error, recipes) {
            res.json(recipes)
        });

    });

router.route('/recipes/:recipe_id')
    .get(function (req, res) {

        recipes.findById(req.params.recipe_id, function (error, recipe) {
            if (error) {
                res.status(404).send(error)
            } else
                res.json(recipe);
        });


    });
router.route('/recipes/:recipe_id/comment')
    .post(function (req, res) {
        var comment = req.body;
        recipes.addComment(req.params.recipe_id, comment, function (err) {
            if (err)
                res.send(err);
            else
                res.send({message: 'comment added'});
        })
    });

module.exports = router;
