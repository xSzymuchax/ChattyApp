const { DataTypes } = require("sequelize");

const Health = (sequelize) => {
    return sequelize.define(
        "Health",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },

            status: {
                type: DataTypes.STRING,
                allowNull: false,
            },
        },
        {
            tableName: "health",
            timestamps: true,
        }
    );
};


module.exports = Health;