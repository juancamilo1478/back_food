const { DataTypes, UUIDV4 } = require('sequelize');
// Exportamos una funcion que define el modelo
// Luego le injectamos la conexion a sequelize.
module.exports = (sequelize) => {
  // defino el modelo
  sequelize.define('recipes', {
     id:{
                type:DataTypes.UUID,
                defaultValue:UUIDV4,
                primaryKey:true,

     },
    name: {
      type: DataTypes.STRING,

      allowNull: false,
    },
    image:{
      type: DataTypes.STRING,
      allowNull: false,
    },
    resumen:{
      type: DataTypes.STRING,
      allowNull: false,
    },
    level:{
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    pasos:{
      type: DataTypes.JSON,
      allowNull: false,
    }



  },{  timestamps: false});

};
