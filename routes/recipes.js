var express = require("express");
var router = express.Router();
const recipes_utils = require("./utils/recipes_utils");
const user_utils = require("./utils/user_utils");
const DButils = require("./utils/DButils");
const { Result } = require("express-validator");

// router.get("/", (req, res) => res.send("im here"));


/**
 * This path returns 3 random recipes
 */
router.get("/random", async (req, res, next) => {
  try {
  // let recipes = [
  //       {
  //             id: "716429",
  //             title: "pizassssssssssssssssssssssssza",
  //             readyInMinutes: "45",
  //             // image: "https://spoonacular.com/recipeImages/641799-556x370.jpg",
  //             image: null,
  //             popularity: "50",
  //             vegan: true,
  //             vegetarian: true,
  //             glutenFree: true,
  //             seen: false,
  //             favorite: false
  //       },
  //       {
  //         id: "716429",
  //         title: "pizza124",
  //         readyInMinutes: "60",
  //         image: "https://spoonacular.com/recipeImages/641799-556x370.jpg",
  //         popularity: "50",
  //         vegan: true,
  //         vegetarian: true,
  //         glutenFree: true,
  //         seen: false,
  //         favorite: false
  //       },
  //       {
  //         id: "636768",
  //             title: "pizza12",
  //             readyInMinutes: "45",
  //             image: "https://spoonacular.com/recipeImages/641799-556x370.jpg",
  //             popularity: "50",
  //             vegan: true,
  //             vegetarian: true,
  //             glutenFree: true,
  //             seen: false,
  //             favorite: false
  //       }
  //     ]
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
    // let recipes = [
    //   {
    //         id: "716429",
    //         title: "pizassssssssssssssssssssssssza",
    //         readyInMinutes: "45",
    //         // image: "https://spoonacular.com/recipeImages/641799-556x370.jpg",
    //         image: null,
    //         popularity: "50",
    //         vegan: true,
    //         vegetarian: true,
    //         glutenFree: true,
    //         seen: false,
    //         favorite: false
    //   },
    //   {
    //     id: "716429",
    //     title: "pizza124",
    //     readyInMinutes: "60",
    //     image: "https://spoonacular.com/recipeImages/641799-556x370.jpg",
    //     popularity: "50",
    //     vegan: true,
    //     vegetarian: true,
    //     glutenFree: true,
    //     seen: false,
    //     favorite: false
    //   },
    //   {
    //     id: "636768",
    //         title: "pizza12",
    //         readyInMinutes: "45",
    //         image: "https://spoonacular.com/recipeImages/641799-556x370.jpg",
    //         popularity: "50",
    //         vegan: true,
    //         vegetarian: true,
    //         glutenFree: true,
    //         seen: false,
    //         favorite: false
    //   }
    // ]
    res.status(200).send(recipes);
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

    let recipe = '';
    let tmp_recipe = await DButils.execQuery(`select user_id, recipe_id from userrecipes where user_id='${user_id}' AND recipe_id='${req.params.recipe_id}'`);
    if (tmp_recipe.length == 0){
    // spooncoolar
      await user_utils.markAsSeen(user_id, req.params.recipe_id);
      recipe = await recipes_utils.presentRecipe(req.params.recipe_id, user_id);
    }
    else{
    // My Recipes
      recipe = await recipes_utils.getMyReviewRecipe(user_id, recipe_id);
    }
    res.send(recipe);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
