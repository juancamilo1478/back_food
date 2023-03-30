const { Router } = require('express');

const router = Router();
const axios = require("axios");
require('dotenv').config();
const {API_KEY}= process.env;
// Importar todos los routers;
// const {getcharacterRecipe}=require('../controller/characterRecipe'
const {Recipes,Diets}=require('../db')

const { Op } = require('sequelize');
// Ejemplo: const authRouter = require('./auth.js');
//importar los modelos ya definidos 
 //// dietas 
router.get('/cards',async(req,res)=>{
    try {
        const datos=await axios(`https://api.spoonacular.com/recipes/complexSearch?apiKey=${API_KEY}&addRecipeInformation=true&number=100`)

        
      let total=datos.data.results.map(data=>{
       return{
        id:data.id,
        name:data.title,
        level:data.healthScore,
        image:data.image,
        diets:data.diets
       }
      })
      let db=await  Recipes.findAll() 

/// get diets and diets
//// data db
let newdata=[];
if(db.length>0)
{
  for(var i=0;i< db.length;i++)
  {
     let data=await Recipes.findByPk(db[i].id).then(recip=>{
             return recip.getDiets().then(recipes=>{
                 return recipes
             })
     })
     let dietas=data.map(data=>{
         return data.name
     })
     const element={
        ...db[i].toJSON(),
        diets:dietas
     }
     newdata.push(element)
  }
}






    //    [...total,...db]
        res.status(200).json([...total,...newdata])
    } catch (error) {
        res.status(400).json({error:error.message})
    }
})



// array diets forever
router.get('/diets',async(req,res)=>{
    try {
    let table=await Diets.findAll(  )
    if(table.length>0)
    {
        table=table.map(data=>{
            return data.name
        })
    }
   

    if(table.length===0)
    {
    const namediets=await axios(`https://api.spoonacular.com/recipes/complexSearch?apiKey=${API_KEY}&addRecipeInformation=true&number=100`)
    const total=namediets.data.results.map(data=>{
        return data.diets;
    })
    let names=[];
    total.forEach(data=>{
        data.forEach(datainter=>{
            if(!names.includes(datainter))
            {
                names.push(datainter)
            }
        })
    })
    for(var i=0; i<names.length;i++)
    {
        await Diets.create({
            name:names[i]
        })
    }
    return res.status(200).json(names)
    }
    
   return res.status(200).json(table)
    } catch (error) {
        res.status(400).json({error:error.message})
    }
})

//search diets for id
router.get('/diets/:id',async(req,res)=>{
    try {
        const {id}=req.params
        // const data=await Diets.findOne({
        //     where:{
        //         name:name
        //     }
        // })
       const data=await Recipes.findByPk(id).then(recip=>{
            return recip.getDiets().then(recipes=>{
                return recipes
            })
        })
        res.json(data)
   

    } catch (error) {
        res.status(400).json({error:error.message})
    }

})

// Configurar los routers
// Ejemplo: router.use('/auth', authRouter);
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
        return res.status(200).json(findbase[0])
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
            pasos:recipe.data.analyzedInstructions[0].steps,
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

//recipes name server and api
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
