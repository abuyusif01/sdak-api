/**
 * 
 * @param {Sequelized db Object} sequelize 
 * @param {DataTypes} DataTypes 
 * @returns 
 * 
 * Door access -> doorId(pk), password
 * 
 * this table will be use to add permission to users
 * basically when a user enter a password for a door, 
 * we gonna check the doorId and the passwordk
 * if they same then we add the door to the user in the permission table
 */

module.exports = (sequelize, DataTypes) => {
    const Passcode = sequelize.define('Passcode', {
        doorId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false
        },
        doorPasscode: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: false,
            validate: {
                notEmpty: true
            }
        }
    })
    return Passcode;
}