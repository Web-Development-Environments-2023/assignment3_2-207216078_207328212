var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const user_utils = require("./utils/user_utils");
const recipe_utils = require("./utils/recipes_utils");

/**
 * Authenticate all incoming requests by middleware
 */
router.use(async function (req, res, next) {
  if (req.session && req.session.user_id) {
    DButils.execQuery("SELECT user_id FROM users").then((users) => {
      if (users.find((x) => x.user_id === req.session.user_id)) {
        req.user_id = req.session.user_id;
        next();
      }
    }).catch(err => next(err));
  } else {
    res.sendStatus(401);
  }
});


/**
 * This path saves one recipe to the favorites list of the logged-in user
 * params: recipe_id in the body of the request
 */
router.post('/favorites', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    const recipe_id = req.body.recipeId;
    let favorites = await recipe_utils.checkIsFavorite(recipe_id, user_id);
    if(favorites){
      res.status(200).send("The Recipe is already in the user's favorite");
    }
    else{
      await user_utils.markAsFavorite(user_id,recipe_id);
      res.status(200).send("The Recipe successfully saved as favorite");
    }
    } catch(error){
    next(error);
  }
})

/**
 * This path returns the favorites recipes that were saved by the logged-in user
 */
router.get('/favorites', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    let favorite_recipes = {};
    const recipes_id = await user_utils.getFavoriteRecipes(user_id);
    let recipes_id_array = [];
    recipes_id.map((element) => recipes_id_array.push(element.recipe_id)); //extracting the recipe ids into array
    const results = await recipe_utils.getRecipesPreview(recipes_id_array, user_id);
    res.status(200).send(results);
  } catch(error){
    next(error); 
  }
});


/**
 * This path returns 3 last seen recipes by logged in user
 */
router.get("/seen", async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    const recipes = await user_utils.getLastThreeSeenRecipes(req.session.user_id);
    let recipes_id_array = [];
    recipes.map((element) => recipes_id_array.push(element.recipe_id)); //extracting the recipe ids into array
    if (recipes_id_array.length == 0){
      res.status(200).send({ message: "No recently viewed recipes found", success: true });
    }
    const results = await recipe_utils.getRecipesPreview(recipes_id_array, user_id);
    res.status(200).send(results);
  } catch (error) {
    next(error);
  }
});


/**
 * This path saves one recipe to the seen list of the logged-in user
 * params: recipe_id in the body of the request
 */
router.post('/seen', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    const recipe_id = req.body.recipe_id;
    await user_utils.markAsSeen(user_id,recipe_id);
    res.status(200).send("The Recipe successfully saved as seen");
    } catch(error){
    next(error);
  }
})

/**
 * This path add new recipe to current logged
 */
router.post('/createRecipe', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    // const recipe_id = req.body.recipeId;
    let {title, image, readyInMinutes, vegan, vegetarian, glutenFree, servings, instructions, extendedIngredients} = req.body;
    if(title == null || readyInMinutes == null || vegan == null || image == null || vegetarian == null || glutenFree == null || servings == null || instructions == null || extendedIngredients == null){
      res.status(401).send({message: "One or more details are missing", success: false });
    }
    else{
      let num_of_rows = await DButils.execQuery(
        "select count(*) as count from userrecipes"
      );
      let new_recipe_id = num_of_rows[0].count + 1;
      // instructions = JSON.stringify(instructions);
      // extendedIngredients = JSON.stringify(extendedIngredients);
      await user_utils.addUserRecipe(user_id, new_recipe_id, title, image, readyInMinutes, vegan, vegetarian, glutenFree, servings, instructions, extendedIngredients);
      res.status(200).send("The Recipe successfully saved");
    }
    } catch(error){
    next(error);
  }
})



/**
 * This path returns the user's recipes that were saved by the logged-in user
 */
router.get('/myRecipes', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    let my_recipes = {};
    const recipes_id = await user_utils.getMyRecipes(user_id);
    let recipes_id_array = [];
    recipes_id.map((element) => recipes_id_array.push(element.recipe_id)); //extracting the recipe ids into array
    const results = await recipe_utils.getMyRecipesPreview(recipes_id_array, user_id);
    res.status(200).send(results);
  } catch(error){
    next(error); 
  }
});

module.exports = router;
