const _ = require("underscore");
const express = require('express');
const recipes = require("../model/recipe-service.js");
const router = express.Router();
const uuidv4 = require('uuid/v4');
const path = require('path')
// todo add reactive endpoint


router.route('/recipes')
    .get((req, res) => {
        const rs = recipes.all(req.query.sort === "datePublished", req.query.titlePattern, req.query.page);
        res.header("Pagination-Count", rs[1]);
        res.header("Pagination-Page", req.query.page || 1);
        res.header("Pagination-Limit", 10);
        res.header("Total-elements", rs[2]);
        res.json(rs[0]);
    })
    .post((req, res) => {
        const ct = req.headers['content-type'];
        if (!ct.startsWith('application/json')) {
            return res.res.sendStatus(415);
        }

        const recipe = req.body;
        const required = ['title', 'description', 'ingredients', 'author'].filter(f => _.isEmpty(recipe[f]));
        if (required.length > 0) {
            res.status(400).json({error: {required}});
        } else {
            const id = uuidv4().replace(/-/g, "");
            recipe.id = id;
            recipe.approved = false;
            recipe.datePublished = new Date().toISOString();
            if (!recipe.source) {
                recipe.source = "spicy-react"
            }
            recipes.add(recipe);
            res.header("Location", `/api/recipes/${id}`);
            res.header("Content-Url", `/api/recipes/${id}/image`);
            res.status(201);
            res.json(recipe);
        }
    });

router.route('/recipes/:id')
    .get((req, res) => {
        recipes.findById(req.params.id)
            .cata(() => res.status(404).send('Not found'), (r) => res.json(r))
    });

const allowedExt = new Set([".png", ".gif", ".jpg", "jpeg", ".svg"]);
router.route('/recipes/:id/image')
    .put((req, res, next) => {
        const ct = req.headers['content-type'];
        if (!ct.startsWith('multipart/form-data')) {
            return res.res.sendStatus(415);
        }

        const id = req.params.id;
        const file = req.files.image;

        if (!file) {
            return res.status(400).send('No files were uploaded.');
        }
        const ext = path.extname(file.name);
        if (!allowedExt.has(ext)) {
            return res.status(400).send(`File must have extension of ${allowedExt}`);
        }
        recipes.findById(id).cata(() => res.status(404).send('Unknown recipe id'), (r) => {
            let name = `${id}${ext}`;
            r.image = name;
            const path = `images/${name}`;

            const uploadPath = `./public/${path}`;
            file.mv(uploadPath, (err) => {
                if (err) {
                    console.error("Error while storing file", err);
                    return next(err);
                }
                res.header("Location", `/${path}`);
                res.sendStatus(201);
            });
        })
    });

router.route('/recipes/:recipe_id/comment')
    .post((req, res) => {
        const comment = req.body;
        recipes.addComment(req.params.recipe_id, comment)
            .cata(() => res.status(404).send('Not found'), (i) => res.send({message: 'comment added'}));

    });

module.exports = router;
