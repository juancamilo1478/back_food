const { Router } = require('express');
const router = Router();
const axios = require("axios");
const {Recipes,Diets}=require('../db')


const {API_KEY}= process.env;
// array diets list
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
router.post('/newdiet',async(req,res)=>{
    try {
        const {name}=req.body
        const data = await Diets.create({
            name
        })
    } catch (error) {
        
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





module.exports=router;