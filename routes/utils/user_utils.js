const DButils = require("./DButils");

async function markAsFavorite(user_id, recipe_id){
    await DButils.execQuery(`insert into FavoriteRecipes values ('${user_id}',${recipe_id})`);
}

async function getFavoriteRecipes(user_id){
    const recipes_id = await DButils.execQuery(`select recipe_id from FavoriteRecipes where user_id='${user_id}'`);
    return recipes_id;
}

async function getLastThreeSeenRecipes(user_id){
    const lastThressRecipes = await DButils.execQuery(`select recipe_id from seenrecipes where user_id='${user_id}' order by date desc limit 3`);
    return lastThressRecipes;
}

async function markAsSeen(user_id, recipe_id){
    await DButils.execQuery(`insert into seenrecipes values ('${user_id}',${recipe_id},CURRENT_TIMESTAMP)`);
}


async function addUserRecipe(user_id, new_recipe_id, title, image, readyInMinutes, vegan, vegetarian, glutenFree, servings, instructions, extendedIngredients){
    await DButils.execQuery(`insert into userrecipes values ('${user_id}','${new_recipe_id}','${title}','${image}','${readyInMinutes}','${vegan}','${vegetarian}','${glutenFree}','${servings}','${instructions}','${extendedIngredients}')`);
}


async function getMyRecipes(user_id){
    const recipes_id = await DButils.execQuery(`select recipe_id from userrecipes where user_id='${user_id}'`);
    return recipes_id;
}


exports.getMyRecipes = getMyRecipes
exports.addUserRecipe = addUserRecipe
exports.markAsSeen = markAsSeen;
exports.getLastThreeSeenRecipes = getLastThreeSeenRecipes;
exports.markAsFavorite = markAsFavorite;
exports.getFavoriteRecipes = getFavoriteRecipes;
