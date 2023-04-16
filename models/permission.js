/**
 * 
 * @param {Sequealize db object} sequelize 
 * @param {DataTypes} DataTypes 
 * @returns Permission model
 * 
 * Permission model -> permissionId(pk), userId(fk -> User(pk)), doorId (fk -> Door(pk)
 */
module.exports = (sequelize, DataTypes) => {
    const Permission = sequelize.define('Permission', {
        permissionId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Users', // wtf is the idea behind having this naming convention?
                key: 'userId'
            }
        },
        doorId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Doors',
                key: 'doorId'
            }
        },
        passcodeId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Passcodes',
                key: 'passcodeId'
            }
        }
    });

    Permission.associate = function (models) {
        Permission.belongsTo(models.User, { as: 'user', foreignKey: 'userId' });
        Permission.belongsTo(models.Door, { as: 'door', foreignKey: 'doorId' });
        Permission.belongsTo(models.Passcode, { as: 'passcode', foreignKey: 'passcodeId' })
    };

    return Permission;
};
