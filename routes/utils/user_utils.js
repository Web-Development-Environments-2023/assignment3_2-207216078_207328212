const DButils = require("./DButils");

// the following functions access the DB with SQL query to retrive / insert relevant information

// mark recipe with id recipe_id as favrorite by user with user_id
async function markAsFavorite(user_id, recipe_id){
    await DButils.execQuery(`insert into FavoriteRecipes values ('${user_id}',${recipe_id})`);
}

//  get favorite recipes of a user with user_id
async function getFavoriteRecipes(user_id){
    const recipes_id = await DButils.execQuery(`select recipe_id from FavoriteRecipes where user_id='${user_id}'`);
    return recipes_id;
}

//  get last 3 recipes seen by a user with user_id
async function getLastThreeSeenRecipes(user_id){
    const lastThressRecipes = await DButils.execQuery(`select recipe_id from seenrecipes where user_id='${user_id}' order by date desc limit 3`);
    return lastThressRecipes;
}

//  mark recipe with id recipe_id as seen by user with user_id
async function markAsSeen(user_id, recipe_id){
    await DButils.execQuery(`insert into seenrecipes values ('${user_id}',${recipe_id},CURRENT_TIMESTAMP)`);
}

//  add recipe to the recipes created by user_id. all params relevant to the recipe are parameters
async function addUserRecipe(user_id, new_recipe_id, title, image, popularity, readyInMinutes, vegan, vegetarian, glutenFree, servings, instructions, extendedIngredients){
    await DButils.execQuery(`insert into userrecipes values ('${user_id}','${new_recipe_id}','${title}','${image}','${popularity}','${readyInMinutes}','${vegan}','${vegetarian}','${glutenFree}','${servings}','${instructions}','${extendedIngredients}')`);
}

//  get all recipes created by user with user_id
async function getMyRecipes(user_id){
    let popularity = -1;
    const recipes_id = await DButils.execQuery(`select recipe_id from userrecipes where user_id='${user_id}' and popularity!='${popularity}'`);
    return recipes_id;
}

//  get all family recipes created by user with user_id
async function getMyFamilyRecipes(user_id){
    let popularity = -1;
    const recipes_id = await DButils.execQuery(`select recipe_id from userrecipes where user_id='${user_id}' and popularity='${popularity}'`);
    return recipes_id;
}



exports.getMyFamilyRecipes = getMyFamilyRecipes;
exports.getMyRecipes = getMyRecipes
exports.addUserRecipe = addUserRecipe
exports.markAsSeen = markAsSeen;
exports.getLastThreeSeenRecipes = getLastThreeSeenRecipes;
exports.markAsFavorite = markAsFavorite;
exports.getFavoriteRecipes = getFavoriteRecipes;
