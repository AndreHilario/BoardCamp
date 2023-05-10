import Joi from "joi";

export const gameSchema = Joi.object({
    name: Joi.string().trim().required().empty(),
    image: Joi.string().uri().required(),
    stockTotal: Joi.number().greater(0).required(),
    pricePerDay: Joi.number().greater(0).required()
});