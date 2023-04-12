/**
 * 
 * @param {Sequelized db Object} sequelize 
 * @param {DataTypes} DataTypes 
 * @returns 
 * 
 * Door model -> doorId(pk), doorLocation, doorName
 */

module.exports = (sequelize, DataTypes) => {
    const Door = sequelize.define('Door', {
        doorId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        doorName: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                notEmpty: true

            }
        },
        doorLocation: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: false,
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
