import Joi from "joi";

export const customerSchema = Joi.object({
    name: Joi.string().trim().required().empty(),
    phone: Joi.string().pattern(/^\d{10,11}$/).required(),
    cpf: Joi.string().pattern(/^\d{11}$/).required(),
    birthday: Joi.date().iso().required()
});