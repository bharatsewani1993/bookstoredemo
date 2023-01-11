const joi = require("joi");

//validation deleteOrder...
const deleteOrderValidations = joi.object().keys({
  orderId:joi.number().integer().required().max(9999999)
});

module.exports = {
    deleteOrderValidations,
};