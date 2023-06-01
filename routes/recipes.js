var express = require("express");
var router = express.Router();
const recipes_utils = require("./utils/recipes_utils");
const user_utils = require("./utils/user_utils")

// router.get("/", (req, res) => res.send("im here"));


/**
 * This path returns 3 random recipes
 */
router.get("/random", async (req, res, next) => {
  try {
    const recipes = await recipes_utils.getRandomThreeRecipes(req.session.user_id);
    res.send(recipes);
  } catch (error) {
    next(error);
  }
});



/**
 * search recipe page by user
 */
router.get("/search/:query", async (req, res, next) => {
  try {
    const recipes = await recipes_utils.searchRecipes(req.session.user_id, req.params.query, req.query);
    res.send(recipes);
  } catch (error) {
    next(error);
  }
});


/**
 * This path returns a full details of a recipe by its id
 */
router.get("/:recipeId", async (req, res, next) => {
  try {
    const recipe = await recipes_utils.getRecipeDetails(req.params.recipeId);
    res.send(recipe);
  } catch (error) {
    next(error);
  }
});


/**
 * This path returns a full details of a recipe by its id
 */
router.get("/extendInfo/:recipe_id", async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    const recipe = await recipes_utils.presentRecipe(req.params.recipe_id, user_id);
    await user_utils.markAsSeen(user_id, req.params.recipe_id);
    res.send(recipe);
  } catch (error) {
    next(error);
  }
});





module.exports = router;
