const express = require('express');
const recipes = require("../model/recipe-service.js");
const router = express.Router();
const uuidv5 = require('uuid/v5');
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
        const id = uuidv5('dec5c996-b080-442a-b248-aab7cbe6f831', uuidv5.URL).replace(/-/g, "");
        const recipe = req.body;
        recipe.id = id;
        recipe.approved = false;
        recipe.datePublished = new Date().toISOString();
        recipes.add(recipe);
        res.header("Location", `/api/recipes/${id}`);
        res.header("Content-Url", `/api/recipes/${id}/image`);
        res.sendStatus(201);

    });

router.route('/recipes/:id')
    .get((req, res) => {
        recipes.findById(req.params.id)
            .cata(() => res.status(404).send('Not found'), (r) => res.json(r))
    });

const allowedExt = new Set([".png", ".gif", ".jpg", ".svg"]);
router.route('/recipes/:id/image')
    .put((req, res, next) => {
        const ct = req.headers['content-type'];
        if (!ct.startsWith('multipart/form-data')) {
            return res.res.sendStatus(415);
        }

        const id = req.params.id;
        const file = req.files.file;

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
