/**
 * 
 * @param {Sequelize db Object} sequelize 
 * @param {DataTypes} DataTypes 
 * @returns 
 * 
 * User model -> userId(pk), email, password, role
 */
module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        userId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
                notEmpty: true
            }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        role: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        }
    });

    User.associate = function (models) {
        User.hasMany(models.Permission, { foreignKey: 'userId' });
    };

    return User;
};
