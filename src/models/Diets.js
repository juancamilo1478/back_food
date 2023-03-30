const { DataTypes,UUIDV4 } = require('sequelize');


module.exports = (sequelize) => {
    sequelize.define('diets', {

        id:{
                type:DataTypes.INTEGER,
                primaryKey:true,
                autoIncrement:true,
     },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    },{  timestamps: false} )
}