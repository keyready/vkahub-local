const { DataTypes } = require("sequelize");
const { sequelize } = require("./db.js");

const SystemNotification = sequelize.define(
  "system_notifications",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    message: { type: DataTypes.TEXT, allowNull: false },
    show_from: { type: DataTypes.DATE, allowNull: false },
    show_to: { type: DataTypes.DATE, allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  {
    timestamps: false,
    tableName: "system_notifications",
  }
);

module.exports = {
    SystemNotification
}
