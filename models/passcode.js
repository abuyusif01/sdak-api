/**
 * 
 * @param {Sequelized db Object} sequelize 
 * @param {DataTypes} DataTypes 
 * @returns 
 * 
 * Door access -> passcodeId, doorId, doorPasscode, startDate, endDate, startTime, endTime
 * 
 * this table will be use to add permission to users
 * basically when a user enter a password for a door, 
 * we gonna check the doorId and the passwordk
 * if they same then we add the door to the user in the permission table
 * 
 * We can have as much door as we want, also duplicate is allowed
 * ideally mod will take advantage of this, so they can create different passcode for the same door
 * hence the doorId is not a primary key
 * 
 */

module.exports = (sequelize, DataTypes) => {
    const Passcode = sequelize.define('Passcode', {
        passcodeId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        doorId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: false,
            validate: {
                notEmpty: true
            }
        },
        doorPasscode: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: false,
            validate: {
                notEmpty: true
            }
        },
        startDate: {
            type: DataTypes.DATE,
            allowNull: true,
            unique: false,
            validate: {
                notEmpty: true
            }
        },
        endDate: {
            type: DataTypes.DATE,
            allowNull: true,
            unique: false,
            validate: {
                notEmpty: true
            }
        },
        startTime: {
            type: DataTypes.TIME,
            allowNull: true,
            unique: false,
            validate: {
                notEmpty: true
            }
        },
        endTime: {
            type: DataTypes.TIME,
            allowNull: true,
            unique: false,
            validate: {
                notEmpty: true
            }
        }
    });

    Passcode.associate = function (models) {
        Passcode.hasMany(models.Permission, { as: 'permission', foreignKey: 'passcodeId' });
    }
    return Passcode;
}
