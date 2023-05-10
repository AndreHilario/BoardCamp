import { Router } from "express";
import { editCustomers, getCustomers, getCustomersById, postCustomers } from "../controllers/customers.controller.js";
import { validateSchema } from "../middlewares/validateSchema.middleware.js";
import { customerSchema } from "../schemas/customer.schema.js";


const customersRouter = Router();

customersRouter.get("/customers", getCustomers);
customersRouter.get("/customers/:id", getCustomersById);
customersRouter.post("/customers", validateSchema(customerSchema), postCustomers);
customersRouter.put("/customers/:id", validateSchema(customerSchema), editCustomers);


export default customersRouter;