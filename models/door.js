/**
 * 
 * @param {Sequelized db Object} sequelize 
 * @param {DataTypes} DataTypes 
 * @returns 
 * 
 * Door model -> doorId(pk), location
 */

module.exports = (sequelize, DataTypes) => {
    const Door = sequelize.define('Door', {
        doorId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        doorLocation: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                notEmpty: true
                
            }
        }
    });

    Door.associate = function (models) {
        Door.hasMany(models.Permission, { as: 'permission', foreignKey: 'doorId' });
    };

    return Door;
};
