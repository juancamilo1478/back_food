const { Router } = require('express');
const router = Router();
const axios = require("axios");
const path=require('path')
require('dotenv').config();
//Api key
const {API_KEY}= process.env;
//models 
const {Recipes,Diets}=require('../db')
//secualize search whith name database
const { Op } = require('sequelize');


// create cartds if base.length ===0 or response data whith diets 
router.get('/cards',async(req,res)=>{
try {
     const base=await Recipes.findAll()
        if(base.length===0)
        {
              const datos=await axios(`https://api.spoonacular.com/recipes/complexSearch?apiKey=${API_KEY}&addRecipeInformation=true&number=50`)
          //CREATE 50 RECIPES AND RELATION DIETS

        
        await Promise.all( datos.data.results.map(async data => {
         const recipeactual = await Recipes.create({
          name: data.title,
          level: data.healthScore,
          image: data.image,
          resumen: data.summary,
          pasos: data.analyzedInstructions
        });

         data.diets.forEach(async data=>{
         const dieta =await Diets.findOne({
            where:{
                name:data
         }
        })
     recipeactual.addDiets([dieta])
        })
        }))

       let total=datos.data.results.map(data=>{
       return{
        id:data.id,
        name:data.title,
        level:data.healthScore,
        image:data.image,
        diets:data.diets
       }
      })
      res.status(200).json(total)
             }else{
//
const newresponse=[];
await Promise.all(base.map(async (data)=>{

let dato=await Recipes.findByPk(data.id).then(recip=>{
return recip.getDiets().then(recipes=>{
    return recipes
})
})
let dietas=dato.map(data=>{
    return data.name
})

newresponse.push({ ...data.toJSON(),
        diets:dietas})
}))
res.json(newresponse)








             }
} catch (error) {
    res.status(400).json({error:error.message})
}
})
// Configurar los routers
router.get('/recipes/:id',async(req,res)=>{
    try {
    const {id}=req.params;
    if(id.includes("-"))
       {
          const findbase=await Recipes.findAll({
            where:{
                id
            }
        })
        const newresponse=[];
await Promise.all(findbase.map(async (data)=>{

let dato=await Recipes.findByPk(data.id).then(recip=>{
return recip.getDiets().then(recipes=>{
    return recipes
})
})
let dietas=dato.map(data=>{
    return data.name
})

newresponse.push({ ...data.toJSON(),
        diets:dietas})
}))
        
return res.status(200).json(newresponse[0])





       }
       else
     {
        try{
        const recipe=await axios(`https://api.spoonacular.com/recipes/${id}/information?apiKey=${API_KEY}`) 
        const datos={
            id:recipe.data.id,
            name:recipe.data.title,
            image:recipe.data.image,
            resumen:recipe.data.instructions,
            level:recipe.data.healthScore,
            pasos:recipe.data.analyzedInstructions,
            diets:recipe.data.diets
        }
            return res.json(datos)
    }
    catch(error){
        res.status(404).json({error:error.message})
    }
    }    
    } catch (error) {
        res.status(400).json({error:error.message})
    }
})
//recipes search in api and database
router.get('/recipes',async(req,res)=>{
    // addRecipeInformation=true
    try {
    let total=[]
    const {name}=req.query
    const datas=await axios(`https://api.spoonacular.com/recipes/complexSearch?query=${name}&addRecipeInformation=true&apiKey=${API_KEY}`) 
    let databs=await Recipes.findAll({
  where: {
    name: {
      [Op.like]: `%${name}%` // buscar nombres que contengan la cadena de búsqueda
    }
  }})

//// data db
let newdata=[];
if(databs.length>0)
{
  for(var i=0;i< databs.length;i++)
  {
     let data=await Recipes.findByPk(databs[i].id).then(recip=>{
             return recip.getDiets().then(recipes=>{
                 return recipes
             })
     })
     let dietas=data.map(data=>{
         return data.name
     })
     const element={
        ...databs[i].toJSON(),
        diets:dietas
     }
     newdata.push(element)
  }
}

  
let filtrado=datas.data.results.map(data=>{
    return {
        id:data.id,
        name:data.title,
        image:data.image,
        resumen:data.summary,
        level:data.healthScore,
        diets:data.diets
    }
  })
//   ...filtrado
 

         total=[...newdata,...filtrado]
        res.status(200).json(total)
    } catch (error) {
        res.status(400).json({error:error.message})
    }


})
//create recipe
router.post('/recipes',async(req,res)=>{
    try {
 
    const {name,image,resumen,level,pasos,diet}=req.body  
    // add all diets
    const data= await Recipes.create({
            name,
            image,
            resumen,
            level,
            pasos,
    })    


    for(var i=0; i<diet.length;i++)
    {
        const dieta =await Diets.findOne({
            where:{
                name:diet[i]
            }
        })
   

    data.addDiets([dieta])
    }     
    res.status(200).json(data)
        
    } catch (error) {
        res.status(400).json({error:error.message})
    }
})

module.exports = router;
